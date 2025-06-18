"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Post } from "@/types";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PostContentProps {
  post: Post;
  className?: string;
}

export function PostContent({ post, className }: PostContentProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  // 添加图片预览相关状态
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState("");
  const [previewAlt, setPreviewAlt] = React.useState("");
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  // 添加图片列表和当前索引状态
  const [imageList, setImageList] = React.useState<
    Array<{ src: string; alt: string }>
  >([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // 缩略图滚动容器引用
  const thumbnailsRef = React.useRef<HTMLDivElement>(null);

  const handleImageClick = (src: string, alt: string, index: number) => {
    setPreviewImage(src);
    setPreviewAlt(alt || "图片预览");
    setCurrentIndex(index);
    setScale(1); // 重置缩放
    setRotation(0);

    setPreviewOpen(true);

    setTimeout(() => {
      scrollToThumbnail(index);
    }, 100);
  };

  // 滚动缩略图到指定索引
  const scrollToThumbnail = (index: number) => {
    if (thumbnailsRef.current && imageList.length > 0) {
      const thumbnailWidth = 84;

      const containerWidth = thumbnailsRef.current.clientWidth;
      const scrollPosition =
        index * thumbnailWidth - containerWidth / 2 + thumbnailWidth / 2;

      thumbnailsRef.current.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: "smooth",
      });
    }
  };

  const zoomIn = () => setScale((prev) => prev + 0.1);

  const zoomOut = () => setScale((prev) => Math.max(0.1, prev - 0.1));

  const rotate = () => setRotation((prev) => prev + 90);

  // 查看上一张图片
  const prevImage = () => {
    const newIndex = (currentIndex - 1 + imageList.length) % imageList.length;
    setCurrentIndex(newIndex);
    setPreviewImage(imageList[newIndex].src);
    setPreviewAlt(imageList[newIndex].alt || "图片预览");
    setScale(1);
    setRotation(0);

    setTimeout(() => {
      scrollToThumbnail(newIndex);
    }, 100);
  };

  // 查看下一张图片
  const nextImage = () => {
    const newIndex = (currentIndex + 1) % imageList.length;
    setCurrentIndex(newIndex);
    setPreviewImage(imageList[newIndex].src);
    setPreviewAlt(imageList[newIndex].alt || "图片预览");
    setScale(1);
    setRotation(0);

    setTimeout(() => {
      scrollToThumbnail(newIndex);
    }, 100);
  };

  // 键盘快捷键处理
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewOpen) return;

      switch (e.key) {
        case "ArrowLeft":
          prevImage();
          break;
        case "ArrowRight":
          nextImage();
          break;
        case "Escape":
          setPreviewOpen(false);
          break;
        case "+":
        case "=":
          zoomIn();
          break;
        case "-":
          zoomOut();
          break;
        case "r":
          rotate();
          break;
        case " ":
          // 空格键切换下一张
          nextImage();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewOpen, currentIndex, imageList]);

  React.useEffect(() => {
    if (!contentRef.current) return;

    const scripts = contentRef.current.getElementsByTagName("script");
    Array.from(scripts).forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    // 收集文章中的所有图片
    const images = contentRef.current.getElementsByTagName("img");
    const newImageList = Array.from(images).map((img) => ({
      src: img.src,
      alt: img.alt || "图片",
    }));
    setImageList(newImageList);

    // 为所有图片添加点击事件
    Array.from(images).forEach((img, index) => {
      img.style.cursor = "zoom-in"; // 设置鼠标样式

      // 移除旧的事件监听器（如果有）
      const oldClone = img.cloneNode(true) as HTMLImageElement;
      if (img.parentNode) {
        img.parentNode.replaceChild(oldClone, img);
      }

      // 添加新的事件监听器
      oldClone.addEventListener("click", (e) => {
        console.log("图片被点击", index);
        e.preventDefault();
        e.stopPropagation();
        handleImageClick(oldClone.src || "", oldClone.alt || "", index);
      });
    });

    // 清理
    return () => {
      if (contentRef.current) {
        const images = contentRef.current.getElementsByTagName("img");
        Array.from(images).forEach((img) => {
          const clone = img.cloneNode(true);
          if (img.parentNode) {
            img.parentNode.replaceChild(clone, img);
          }
        });
      }
    };
  }, [post.content]);

  // 加载状态
  if (!post.content) {
    return (
      <div
        className={cn(
          "min-h-[100px] p-3 rounded-md border bg-muted animate-pulse",
          className
        )}
      />
    );
  }

  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      e.preventDefault();
      e.stopPropagation();

      const img = target as HTMLImageElement;
      const src = img.src;
      const alt = img.alt || "图片预览";
      const index = imageList.findIndex((item) => item.src === src);

      if (index !== -1) {
        handleImageClick(src, alt, index);
      } else {
        handleImageClick(src, alt, imageList.length);
      }
    }
  };

  return (
    <>
      <article
        ref={contentRef}
        onClick={handleContentClick}
        className={cn(
          "w-full leading-7 text-foreground overflow-hidden",
          "break-words [word-break:break-word] [overflow-wrap:anywhere]",

          // 基础文本样式
          "[&_p]:mb-4 [&_p]:last:mb-0",
          "[&_p]:[word-break:break-word] [&_p]:[overflow-wrap:anywhere]",
          "[&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:[word-break:break-word]",
          "[&_ol]:mb-4 [&_ol]:pl-6 [&_ol]:list-decimal [&_ol]:[word-break:break-word]",

          // 标题样式
          "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4 [&_h1]:[word-break:break-word]",
          "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:[word-break:break-word]",
          "[&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:[word-break:break-word]",

          // 代码相关样式
          "[&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[90%]",
          "[&_:not(pre)>code]:bg-muted/30 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5",
          "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:border [&_:not(pre)>code]:border-muted/20",
          "[&_:not(pre)>code]:[word-break:break-all]",

          // 代码块样式
          "[&_pre]:bg-muted/30 [&_pre]:px-3 [&_pre]:py-2 [&_pre]:rounded-md",
          "[&_pre]:border [&_pre]:border-muted/20",
          "[&_pre]:overflow-x-auto [&_pre]:text-[90%]",
          "[&_pre]:whitespace-pre [&_pre]:scrollbar-thin [&_pre]:scrollbar-thumb-border [&_pre]:scrollbar-track-muted/30",

          "[&_pre>code]:p-0 [&_pre>code]:bg-transparent",
          "[&_pre>code]:border-0 [&_pre>code]:block",
          "[&_pre>code]:max-h-[50vh]",

          // 引用样式
          "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/50",
          "[&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4",
          "[&_blockquote]:text-muted-foreground [&_blockquote]:[word-break:break-word]",

          // 链接样式
          "[&_a:not(.mention)]:text-primary [&_a:not(.mention)]:underline-offset-4",
          "[&_a:not(.mention)]:[word-break:break-all]",

          // 分割线样式
          "[&_hr]:my-8 [&_hr]:border-t [&_hr]:border-border",

          // 表格样式
          "[&_table]:w-full [&_table]:my-4 [&_table]:border-collapse",
          "[&_th]:border [&_th]:p-2 [&_th]:bg-muted/50 [&_th]:[word-break:break-word]",
          "[&_td]:border [&_td]:p-2 [&_td]:[word-break:break-word]",

          // 图片样式
          "[&_img]:max-w-full [&_img]:rounded-md [&_img]:my-2",
          "[&_img]:transition-all [&_img]:hover:opacity-95",

          className
        )}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* 图片预览弹窗 */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black flex flex-col transition-opacity duration-300",
          previewOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setPreviewOpen(false)}
      >
        {/* 顶部工具栏 */}
        <div className="flex justify-between items-center p-2 px-4 bg-black/80 text-white h-12">
          <div className="text-sm">
            {currentIndex + 1} / {imageList.length}
          </div>
          <div className="flex items-center gap-3">
            <button
              className="p-1 hover:bg-white/10 rounded-sm transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewOpen(false);
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 图片容器 */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* 左侧导航按钮 */}
          {imageList.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* 图片 */}
          <img
            src={previewImage}
            alt={previewAlt}
            className="max-w-full max-h-[calc(100vh-160px)] object-contain transition-all duration-300"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: "transform 0.3s ease",
              opacity: previewOpen ? 1 : 0,
            }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* 右侧导航按钮 */}
          {imageList.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* 缩略图列表 */}
        {imageList.length > 1 && (
          <div
            ref={thumbnailsRef}
            className="w-full h-[100px] overflow-x-auto flex items-center justify-center gap-1 p-2 bg-black/80 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent scroll-smooth"
            onClick={(e) => e.stopPropagation()}
          >
            {imageList.map((img, index) => (
              <div
                key={index}
                className={cn(
                  "h-[80px] min-w-[80px] overflow-hidden cursor-pointer transition-all",
                  currentIndex === index
                    ? "border-2 border-white scale-105"
                    : "border-2 border-transparent hover:border-white/50"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                  setPreviewImage(img.src);
                  setPreviewAlt(img.alt || "图片预览");
                  setScale(1);
                  setRotation(0);
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
