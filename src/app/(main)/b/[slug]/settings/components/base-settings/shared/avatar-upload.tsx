import React from "react";
import Image from "next/image";

interface AvatarUploadProps {
  boardImage: string | null;
  isUploading: boolean;
  handleImageClick: () => void;
}

export function AvatarUpload({
  boardImage,
  isUploading,
  handleImageClick,
}: AvatarUploadProps) {
  return (
    <div
      onClick={handleImageClick}
      className={`w-16 h-16 rounded-full bg-gray-100 overflow-hidden relative cursor-pointer group ${
        isUploading && "pointer-events-none"
      }`}
    >
      {boardImage ? (
        <>
          <Image
            src={boardImage}
            alt="Board image"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="text-white text-2xl mb-1">+</div>
            <div className="text-white text-xs">点击更换</div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="text-gray-400 text-2xl mb-1">+</div>
          <div className="text-gray-400 text-xs">点击更换</div>
        </div>
      )}
      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-white"></div>
          <div className="text-white text-xs mt-2">上传中...</div>
        </div>
      )}
    </div>
  );
}
