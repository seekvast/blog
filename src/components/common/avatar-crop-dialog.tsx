"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { Cropper, ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarCropDialogProps {
  open: boolean;
  src: string;
  onClose: () => void;
  onCropConfirm: (croppedBlob: Blob) => void;
  onReselect?: () => void;
  outputImageMaxDim?: number;
  outputImageQuality?: number;
}

export default function AvatarCropDialog({
  open,
  src,
  onClose,
  onCropConfirm,
  onReselect,
  outputImageMaxDim = 400,
  outputImageQuality = 0.92,
}: AvatarCropDialogProps) {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const getCroppedImg = useCallback((): Promise<Blob | null> => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      cropper.getCroppedCanvas({
        maxWidth: outputImageMaxDim,
        maxHeight: outputImageMaxDim,
        imageSmoothingQuality: 'high',
      }).toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', outputImageQuality);
    });
  }, [outputImageMaxDim, outputImageQuality]);

  const updatePreview = useCallback(() => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas({
      maxWidth: 128, // Preview size
      maxHeight: 128,
    });
    if (canvas) {
      setPreviewUrl(canvas.toDataURL());
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    try {
      const blob = await getCroppedImg();
      if (blob) {
        onCropConfirm(blob);
      } else {
        console.error("Cropping failed, blob is null.");
      }
    } catch (error) {
      console.error("Cropping failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getCroppedImg, onCropConfirm]);

  useEffect(() => {
    if (!open) {
      setPreviewUrl("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[520px] sm:w-[600px] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4">
          <DialogTitle className="text-xl">编辑头像</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-full sm:w-3/4 rounded-md">
              {src && (
                <Cropper
                  ref={cropperRef}
                  src={src}
                  style={{ height: 350, width: "100%" }}
                  aspectRatio={1}
                  guides={true}
                  viewMode={1}
                  dragMode="move"
                  responsive={true}
                  checkOrientation={false}
                  cropend={updatePreview}
                  ready={updatePreview}
                  className="bg-gray-100"
                />
              )}
              {!src && <div className="text-center p-10">请提供图片来源</div>}
              <div className="flex items-center py-3 bg-background">
                {onReselect && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReselect}
                    className="text-xs"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    重新选择
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 sm:w-1/4">
              <div className="w-32 h-32 overflow-hidden rounded-full flex items-center justify-center shadow-sm bg-gray-100">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-xs text-gray-400 p-2 text-center">
                    预览
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-500">预览</span>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 flex justify-end gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            size="sm"
            className={cn(
              "bg-primary hover:bg-primary/80",
              isLoading && "opacity-80 cursor-wait"
            )}
          >
            {isLoading ? "处理中..." : "确定"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

