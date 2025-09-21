"use client";
import { useLanguageSwitcher } from "@/hooks/use-language-switcher";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LanguageSettings() {
  const { currentLanguage, changeLanguage, languages } = useLanguageSwitcher();

  return (
    <Select
      value={currentLanguage}
      onValueChange={(langCode: string) => changeLanguage(langCode)}
    >
      <SelectTrigger className="w-32 h-8">
        <SelectValue placeholder="选择语言" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
