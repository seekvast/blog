"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, Globe } from "lucide-react";
import { useLanguageSwitcher } from "@/hooks/use-language-switcher";
import { useState, useEffect } from "react";

export function LanguageSwitcher() {
  const {
    getCurrentLanguageCode,
    getCurrentLanguageName,
    changeLanguage,
    languages,
  } = useLanguageSwitcher();

  const [isClient, setIsClient] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('');

  // 避免水合问题
  useEffect(() => {
    setIsClient(true);
    setCurrentLanguage(getCurrentLanguageCode());
  }, []);

  const handleLanguageChange = (langCode: string) => {
    console.log('Changing language to:', langCode);
    setCurrentLanguage(langCode);
    changeLanguage(langCode);
  };

  if (!isClient) {
    // 服务器端渲染时的占位符
    return (
      <Button
        variant="ghost"
        className="flex items-center justify-start py-2 text-sm text-muted-foreground hover:text-foreground h-auto px-0"
        disabled
      >
        <Globe className="mr-2 h-4 w-4" />
        <span className="truncate">语言</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-start py-2 text-sm text-muted-foreground hover:text-foreground h-auto px-0 bg-transparent border-none cursor-pointer"
          style={{
            background: 'transparent',
            border: 'none',
            padding: '0.5rem 0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            fontSize: '0.875rem',
            color: 'hsl(var(--muted-foreground))',
            width: '100%',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'hsl(var(--foreground))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
          }}
        >
          <Globe className="mr-2 h-4 w-4" />
          <span className="truncate">{getCurrentLanguageName()}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex justify-between"
          >
            {lang.name}
            {currentLanguage === lang.code && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}