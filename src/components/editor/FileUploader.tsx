import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { usePostEditorStore } from '@/store/post-editor';
import { Button } from '@/components/ui/button';
import { Image, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  className?: string;
}

export function FileUploader({ className }: FileUploaderProps) {
  const { addUploadingFile, removeUploadingFile, insertText, uploadingFiles } = usePostEditorStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (!file.type.startsWith('image/')) continue;

      try {
        addUploadingFile(file);
        
        // 这里需要实现文件上传逻辑
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const { url } = await response.json();
        insertText(`![${file.name}](${url})`);
      } catch (error) {
        console.error('Upload error:', error);
        // 这里可以添加错误提示
      } finally {
        removeUploadingFile(file);
      }
    }
  }, [addUploadingFile, removeUploadingFile, insertText]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: true
  });

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4",
          "flex flex-col items-center justify-center gap-2",
          "cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/10" : "border-border",
          "hover:border-primary hover:bg-primary/5"
        )}
      >
        <input {...getInputProps()} />
        
        <Image className="h-6 w-6 text-muted-foreground" />
        
        {isDragActive ? (
          <p className="text-sm text-muted-foreground">
            放开以上传图片...
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            拖放图片到此处，或点击上传
          </p>
        )}
        
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-2"
        >
          选择图片
        </Button>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="mt-2 space-y-2">
          {uploadingFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{file.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
