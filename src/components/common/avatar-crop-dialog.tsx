"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
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

const DEFAULT_CROP_CONFIG: Crop = {
  unit: "%",
  width: 80,
  height: 80,
  x: 10,
  y: 10,
};

export default function AvatarCropDialog({
  open,
  src,
  onClose,
  onCropConfirm,
  onReselect,
  outputImageMaxDim = 400,
  outputImageQuality = 0.92,
}: AvatarCropDialogProps) {
  const [crop, setCrop] = useState<Crop>(DEFAULT_CROP_CONFIG);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [initialCropSet, setInitialCropSet] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const defaultCrop = React.useMemo(() => DEFAULT_CROP_CONFIG, []);

  const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
    const image = imgRef.current;
    if (
      !image ||
      !completedCrop ||
      !image.naturalWidth ||
      !image.naturalHeight ||
      !completedCrop.width ||
      !completedCrop.height
    ) {
      console.error("Image or crop data not ready for getCroppedImg");
      return null;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Could not get 2D context from canvas");
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const naturalCropWidth = completedCrop.width * scaleX;
    const naturalCropHeight = completedCrop.height * scaleY;

    let targetWidth = naturalCropWidth;
    let targetHeight = naturalCropHeight;

    if (targetWidth > outputImageMaxDim || targetHeight > outputImageMaxDim) {
      if (targetWidth > targetHeight) {
        targetHeight = (outputImageMaxDim / targetWidth) * targetHeight;
        targetWidth = outputImageMaxDim;
      } else {
        targetWidth = (outputImageMaxDim / targetHeight) * targetWidth;
        targetHeight = outputImageMaxDim;
      }
    }

    canvas.width = Math.round(targetWidth);
    canvas.height = Math.round(targetHeight);

    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      naturalCropWidth,
      naturalCropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        outputImageQuality
      );
    });
  }, [completedCrop, outputImageMaxDim, outputImageQuality]);

  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      if (!imageLoaded) {
        setImageLoaded(true);

        const displayWidth = img.width;
        const displayHeight = img.height;

        // 计算最大正方形边长，80%为选中区域
        const side = Math.min(displayWidth, displayHeight) * 0.8;
        const x = (displayWidth - side) / 2;
        const y = (displayHeight - side) / 2;

        const pixelCrop: PixelCrop = {
          unit: "px",
          width: side,
          height: side,
          x,
          y,
        };

        setCrop(pixelCrop);
        setCompletedCrop(pixelCrop);
        setInitialCropSet(true);
      }
    },
    [imageLoaded]
  );

  useEffect(() => {
    if (open) {
      setImageLoaded(false);
      setPreviewUrl("");
      setInitialCropSet(false);
      setCrop(DEFAULT_CROP_CONFIG);
      setCompletedCrop(null);
    }
  }, [open]);

  useEffect(() => {
    if (
      !imageLoaded ||
      !completedCrop ||
      !completedCrop.width ||
      !completedCrop.height
    ) {
      if (previewUrl) setPreviewUrl("");
      return;
    }

    let didCancel = false;

    (async () => {
      const blob = await getCroppedImg();
      if (blob && !didCancel) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (!didCancel && reader.result) {
            setPreviewUrl(reader.result as string);
          }
        };
        reader.readAsDataURL(blob);
      } else if (!blob && !didCancel) {
        setPreviewUrl("");
      }
    })();

    return () => {
      didCancel = true;
    };
  }, [completedCrop, imageLoaded, getCroppedImg]);

  const handleConfirm = useCallback(async () => {
    if (!completedCrop?.width || !completedCrop?.height || !imageLoaded) {
      console.warn("Crop not ready or image not loaded for confirm.");
      return;
    }

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
  }, [completedCrop, getCroppedImg, onCropConfirm, imageLoaded]);

  const handleDialogClose = () => {
    onClose();
  };

  const onCropChange = useCallback(
    (c: Crop, percentCrop: Crop) => {
      if (initialCropSet) {
        setCrop(c);
      }
    },
    [initialCropSet]
  );

  const onCropComplete = useCallback((c: PixelCrop) => {
    if (c.width && c.height) {
      setCompletedCrop(c);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-[95vw] w-[520px] sm:w-[600px] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">编辑头像</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-full sm:w-3/4 rounded-md">
              {src && (
                <ReactCrop
                  crop={crop}
                  onChange={onCropChange}
                  onComplete={onCropComplete}
                  aspect={1}
                  minWidth={50}
                  minHeight={50}
                  className="w-full"
                  ruleOfThirds
                  circularCrop
                  keepSelection={true}
                >
                  <img
                    ref={imgRef}
                    src={src}
                    alt="裁剪头像"
                    className="max-h-[350px] object-contain w-full"
                    onLoad={handleImageLoad}
                    onError={() => {
                      console.error("Image failed to load:", src);
                      setImageLoaded(false);
                      setInitialCropSet(false);
                    }}
                    crossOrigin="anonymous"
                  />
                </ReactCrop>
              )}
              {!src && <div className="text-center p-10">请提供图片来源</div>}
              <div className="flex items-center py-3 bg-background">
                {onReselect && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (onReselect) onReselect();
                    }}
                    className="text-xs"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    重新选择
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 sm:w-1/4">
              <div className="w-32 h-32 overflow-hidden rounded-full flex items-center justify-center shadow-sm">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-xs text-gray-400 p-2 text-center">
                    {imageLoaded && completedCrop ? "生成预览中..." : "预览"}
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-500">预览</span>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4  flex justify-end gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDialogClose}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              !completedCrop?.width ||
              !completedCrop?.height ||
              isLoading ||
              !imageLoaded
            }
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
