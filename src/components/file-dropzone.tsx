import { File, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FileWithPreview extends File {
  preview?: string;
}

export function FileDropzone({
  onFileUpload,
}: {
  onFileUpload: (file: FileWithPreview) => Promise<void>;
}) {
  const [file, setFile] = useState<FileWithPreview | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fileWithPreview = droppedFile as FileWithPreview;
      if (droppedFile.type.startsWith("image/")) {
        fileWithPreview.preview = URL.createObjectURL(droppedFile);
      }
      setFile(fileWithPreview);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        const fileWithPreview = selectedFile as FileWithPreview;
        if (selectedFile.type.startsWith("image/")) {
          fileWithPreview.preview = URL.createObjectURL(selectedFile);
        }
        setFile(fileWithPreview);
      }
    },
    [],
  );

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    await onFileUpload(file);
    setIsUploading(false);
    setFile(null);
  };

  const handleRemoveFile = () => {
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      <Card
        className={cn(
          "relative cursor-pointer border-2 border-dashed transition-all duration-200",
          isDragOver
            ? "scale-[1.02] border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50",
          file && "border-border border-solid",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={handleFileSelect}
          disabled={isUploading}
        />

        {!file ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Upload
              className={cn(
                "mb-4 h-12 w-12 transition-colors",
                isDragOver ? "text-primary" : "text-muted-foreground",
              )}
            />
            <h3 className="mb-2 font-semibold text-lg">
              {isDragOver ? "Drop your file here" : "Drop files to upload"}
            </h3>
            <p className="mb-4 text-muted-foreground text-sm">
              or click to browse from your computer
            </p>
            <p className="text-muted-foreground text-xs">
              Supports all file types
            </p>
          </div>
        ) : (
          <div className="p-2">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {file.preview ? (
                  <div className="relative">
                    <img
                      src={file.preview || "/placeholder.svg"}
                      alt={file.name}
                      className="h-16 w-16 rounded-lg border object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <File className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-medium">{file.name}</h4>
                <p className="text-muted-foreground text-sm">
                  {formatFileSize(file.size)}
                </p>
                <p className="mt-1 text-muted-foreground text-xs">
                  {file.type || "Unknown type"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isUploading}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
      {file && (
        <div className="flex justify-center">
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="min-w-32"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
