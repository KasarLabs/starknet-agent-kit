import { Injectable, BadRequestException, ForbiddenException, ExecutionContext, CanActivate } from '@nestjs/common';
import { MultipartFile } from '@fastify/multipart';
import { FastifyRequest } from 'fastify';
import { promises as fs } from 'fs';
import stream = require('stream');
import * as util from 'util';
import { join } from 'path';
import { createHash } from 'crypto';

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
      signatures: [[0x7B], [0x5B]]
    },
    {
      mime: 'application/zip',
      signatures: [[0x50, 0x4B, 0x03, 0x04]]
    }
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
          
          if (this.allowedMimeTypes.includes('application/json')) {
            const isValid = await this.validateJson(file);
            if (!isValid) {
              throw new ForbiddenException('Fichier JSON invalide');
            }
          } else {
            const isValid = await this.validateFile(file);
            if (!isValid) {
              throw new ForbiddenException('Type de fichier non autorisé');
            }
          }

          const uploadedFile = await this.saveFile(file);
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
    const buffer = await file.toBuffer();
    // const hash = this.generateFileHash(buffer);
    // const ext = this.getFileExtension(file.filename);
    const filename = file.filename;
    const filepath = join(this.uploadDir, filename);

    await fs.writeFile(filepath, buffer);

    return {
      originalName: file.filename,
      filename: filename,
      mimetype: file.mimetype,
      size: buffer.length,
      path: filepath
    };
  }

  private generateFileHash(buffer: Buffer): string {
    return createHash('sha256')
      .update(buffer)
      .digest('hex')
      .substring(0, 16);
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

  private async validateFile(file: MultipartFile): Promise<boolean> {
    const buffer = await this.readFileHeader(file, 8);
    const fileType = this.detectFileType(buffer);
    
    if (!fileType) {
      return false;
    }

    return this.allowedMimeTypes.length === 0 || this.allowedMimeTypes.includes(fileType);
  }

  private async validateJson(file: MultipartFile): Promise<boolean> {
    try {
      const buffer = await file.toBuffer();
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

  private async readFileHeader(file: MultipartFile, byteLength: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      let bytesRead = 0;
      
      const stream = file.file;
      
      stream.on('data', (chunk: Buffer) => {
        if (bytesRead < byteLength) {
          const remainingBytes = byteLength - bytesRead;
          const slicedChunk = chunk.subarray(0, remainingBytes);
          chunks.push(slicedChunk);
          bytesRead += slicedChunk.length;
          
          if (bytesRead >= byteLength) {
            stream.pause();
            resolve(Buffer.concat(chunks));
          }
        }
      });

      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
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
    return signatures.some(signature => {
      return signature.every((byte, index) => buffer[index] === byte);
    });
  }
}