import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  ExecutionContext,
  CanActivate,
} from '@nestjs/common';
import { MultipartFile } from '@fastify/multipart';
import { FastifyRequest } from 'fastify';
import { createReadStream, createWriteStream, promises as fs } from 'fs';
import stream = require('stream');
import * as util from 'util';
import { join } from 'path';
import { createHash } from 'crypto';
import { PassThrough } from 'stream';

interface FileSignature {
  mime: string;
  signatures: Array<number[]>;
}

interface UploadedFile {
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
}

@Injectable()
export class FileTypeGuard implements CanActivate {
  private readonly uploadDir = 'uploads';
  private readonly fileSignatures: FileSignature[] = [
    {
      mime: 'application/json',
      signatures: [[0x7b], [0x5b]],
    },
    {
      mime: 'application/zip',
      signatures: [[0x50, 0x4b, 0x03, 0x04]],
    },
  ];

  constructor(private readonly allowedMimeTypes: string[] = []) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    if (!request.isMultipart()) {
      throw new ForbiddenException('La requête doit être multipart');
    }
    await this.ensureUploadDirExists();

    try {
      const parts = request.parts();
      const uploadedFiles: UploadedFile[] = [];

      for await (const part of parts) {
        if (part.type === 'file') {
          const file = part as MultipartFile;
          const uploadedFile = await this.saveFile(file);
          const buffer = await fs.readFile(uploadedFile.path);

          const isFile = await this.validateFile(buffer);
          if (!isFile) {
            const isJson = await this.validateJson(buffer);
            if (!isJson) {
              fs.unlink(uploadedFile.path);
              throw new ForbiddenException('Unauthorized file type');
            }
          }

          uploadedFiles.push(uploadedFile);
        }
      }

      (request as any).uploadedFiles = uploadedFiles;

      return true;
    } catch (error) {
      await this.cleanupFiles();

      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Erreur lors du traitement du fichier');
    }
  }

  private async saveFile(file: MultipartFile): Promise<UploadedFile> {
    // const hash = this.generateFileHash(buffer);
    // const ext = this.getFileExtension(file.filename);
    const buffer = await file.toBuffer();
    const filename = file.filename;
    const filepath = join(this.uploadDir, filename);
    const pipeline = util.promisify(stream.pipeline);

    await fs.writeFile(filepath, buffer);

    // const writeStream = createWriteStream(`./uploads/${file.filename}`);
    // await pipeline(file.file, writeStream);

    // Vérification optionnelle de l'intégrité
    const originalSize = buffer.length;
    const writtenSize = (await fs.stat(filepath)).size;

    if (originalSize !== writtenSize) {
      throw new Error(
        `File integrity check failed: original size ${originalSize} != written size ${writtenSize}`
      );
    }

    return {
      originalName: file.filename,
      filename: filename,
      mimetype: file.mimetype,
      size: buffer.length,
      path: filepath,
    };
  }

  private generateFileHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex').substring(0, 16);
  }

  private getFileExtension(filename: string): string {
    const ext = filename.split('.').pop();
    return ext ? `.${ext}` : '';
  }

  private async ensureUploadDirExists(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  private async cleanupFiles(): Promise<void> {
    try {
      const files = await fs.readdir(this.uploadDir);
      for (const file of files) {
        await fs.unlink(join(this.uploadDir, file));
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage des fichiers:', error);
    }
  }

  private async validateFile(buffer: Buffer): Promise<boolean> {
    const fileType = this.detectFileType(buffer);

    if (!fileType) {
      return false;
    }

    return (
      this.allowedMimeTypes.length === 0 ||
      this.allowedMimeTypes.includes(fileType)
    );
  }

  private async validateJson(buffer: Buffer): Promise<boolean> {
    try {
      const content = buffer.toString('utf8').trim();

      if (!content.startsWith('{') && !content.startsWith('[')) {
        return false;
      }

      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }

  private async readFileHeader(
    file: MultipartFile,
    byteLength: number
  ): Promise<Buffer> {
    const passThrough = new PassThrough();
    file.file.pipe(passThrough);

    return new Promise((resolve, reject) => {
      const headerChunks: Buffer[] = [];
      let bytesRead = 0;

      passThrough.on('data', (chunk: Buffer) => {
        if (bytesRead < byteLength) {
          const remainingBytes = byteLength - bytesRead;
          const slicedChunk = chunk.subarray(
            0,
            Math.min(chunk.length, remainingBytes)
          );
          headerChunks.push(slicedChunk);
          bytesRead += slicedChunk.length;
        }
      });

      passThrough.on('error', reject);
      passThrough.on('end', () =>
        resolve(Buffer.concat(headerChunks, byteLength))
      );
    });
  }

  private detectFileType(buffer: Buffer): string | null {
    for (const fileSignature of this.fileSignatures) {
      if (this.checkSignature(buffer, fileSignature.signatures)) {
        return fileSignature.mime;
      }
    }
    return null;
  }

  private checkSignature(buffer: Buffer, signatures: number[][]): boolean {
    return signatures.some((signature) => {
      return signature.every((byte, index) => buffer[index] === byte);
    });
  }
}
