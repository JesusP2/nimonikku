import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, File, ImageIcon, Loader2, X } from "lucide-react"
import { useUploadRoute } from 'pushduck/client';
import { cn } from "@/lib/utils"
import type { AppUploadRouter } from "@/server/file-storage";

interface FileWithPreview extends File {
  preview?: string
}

export function FileDropzone({ onFileUpload }: { onFileUpload: (file: FileWithPreview) => Promise<void> }) {
  const [file, setFile] = useState<FileWithPreview | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const fileWithPreview = droppedFile as FileWithPreview
      if (droppedFile.type.startsWith("image/")) {
        fileWithPreview.preview = URL.createObjectURL(droppedFile)
      }
      setFile(fileWithPreview)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const fileWithPreview = selectedFile as FileWithPreview
      if (selectedFile.type.startsWith("image/")) {
        fileWithPreview.preview = URL.createObjectURL(selectedFile)
      }
      setFile(fileWithPreview)
    }
  }, [])

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    await onFileUpload(file)
    setIsUploading(false)
    setFile(null)
  }

  const handleRemoveFile = () => {
    if (file?.preview) {
      URL.revokeObjectURL(file.preview)
    }
    setFile(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="w-full space-y-4">
      <Card
        className={cn(
          "relative border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50",
          file && "border-solid border-border",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileSelect}
          disabled={isUploading}
        />

        {!file ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Upload
              className={cn("w-12 h-12 mb-4 transition-colors", isDragOver ? "text-primary" : "text-muted-foreground")}
            />
            <h3 className="text-lg font-semibold mb-2">
              {isDragOver ? "Drop your file here" : "Drop files to upload"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">or click to browse from your computer</p>
            <p className="text-xs text-muted-foreground">Supports all file types</p>
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
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    ) : (
                      <File className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{file.name}</h4>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                <p className="text-xs text-muted-foreground mt-1">{file.type || "Unknown type"}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isUploading}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
      {file && (
        <div className="flex justify-center">
          <Button onClick={handleUpload} disabled={isUploading} className="min-w-32">
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
