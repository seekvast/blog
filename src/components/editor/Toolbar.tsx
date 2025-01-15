import React from 'react';
import { useMarkdownEditor } from '@/store/md-editor';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Link,
  Image,
  List,
  ListOrdered,
  Quote,
  Code,
  Eye,
  EyeOff,
  Undo,
  Redo,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className }: ToolbarProps) {
  const {
    wrapSelection,
    insertText,
    previewMode,
    setPreviewMode,
    undo,
    redo,
  } = useMarkdownEditor();

  const tools = [
    {
      icon: Bold,
      tooltip: '粗体 (Ctrl+B)',
      onClick: () => wrapSelection('**', '**'),
    },
    {
      icon: Italic,
      tooltip: '斜体 (Ctrl+I)',
      onClick: () => wrapSelection('*', '*'),
    },
    {
      icon: Link,
      tooltip: '链接 (Ctrl+K)',
      onClick: () => wrapSelection('[', '](url)'),
    },
    {
      icon: Image,
      tooltip: '图片',
      onClick: () => insertText('![alt](image-url)'),
    },
    {
      icon: List,
      tooltip: '无序列表',
      onClick: () => insertText('- '),
    },
    {
      icon: ListOrdered,
      tooltip: '有序列表',
      onClick: () => insertText('1. '),
    },
    {
      icon: Quote,
      tooltip: '引用',
      onClick: () => insertText('> '),
    },
    {
      icon: Code,
      tooltip: '代码块',
      onClick: () => wrapSelection('```\n', '\n```'),
    },
  ];

  return (
    <TooltipProvider>
      <div className={cn("flex items-center space-x-1 border-b p-1", className)}>
        {tools.map((tool, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={tool.onClick}
                className="h-8 w-8 p-0"
              >
                <tool.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tool.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        <div className="h-4 w-px bg-border mx-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              className="h-8 w-8 p-0"
            >
              <Undo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>撤销 (Ctrl+Z)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              className="h-8 w-8 p-0"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>重做 (Ctrl+Y)</p>
          </TooltipContent>
        </Tooltip>

        <div className="h-4 w-px bg-border mx-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="h-8 w-8 p-0"
            >
              {previewMode ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{previewMode ? '编辑' : '预览'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
