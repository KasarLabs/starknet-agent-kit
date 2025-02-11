import React, { useCallback } from 'react';
import { Button } from './button';
import { Upload } from 'lucide-react';
import { FileInfo } from '../StarknetAgent';

interface UplaodProps {
  fileInfo: FileInfo | null;
  setFileInfo: React.Dispatch<React.SetStateAction<FileInfo | null>>;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
}

export const removeFile = (
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>,
  setFileInfo: React.Dispatch<React.SetStateAction<FileInfo | null>>
) => {
  setSelectedFile(null);
  setFileInfo(null);
};

const UploadFile = ({
  fileInfo,
  setFileInfo,
  setSelectedFile,
}: UplaodProps) => {
  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFileSelection(file);
  }, []);

  const handleFileSelection = (file: File) => {
    setSelectedFile(file);
    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleRemoveFile = () => {
    removeFile(setSelectedFile, setFileInfo);
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`border-2 border-dashed border-neutral-700 rounded-lg p-4 text-center ${
        fileInfo ? 'bg-neutral-800' : 'bg-neutral-900'
      }`}
    >
      {fileInfo ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-neutral-300">{fileInfo.name}</p>
          <p className="text-xs text-neutral-400">
            {(fileInfo.size / 1024).toFixed(2)} KB
          </p>
          <Button
            onClick={handleRemoveFile}
            variant="destructive"
            size="sm"
            className="mt-2"
          >
            Remove File
          </Button>
        </div>
      ) : (
        <>
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-row justify-center items-center gap-2">
              <Upload className="w-6 h-6 text-neutral-400" />
              <p className="text-sm text-neutral-300">
                Drop a file here or click to upload
              </p>
            </div>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </>
      )}
    </div>
  );
};

export default UploadFile;
