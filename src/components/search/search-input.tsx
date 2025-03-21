import React, { useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  onCollapse?: () => void;
  placeholder?: string;
  className?: string;
  debounceTime?: number;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  onCollapse,
  placeholder = "搜索...",
  className,
  debounceTime = 300,
}: SearchInputProps) {
  const [isSearching, setIsSearching] = React.useState(false);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearch(value);
    }, debounceTime),
    [debounceTime, onSearch]
  );

  const handleSearch = async (value: string) => {
    setIsSearching(true);
    try {
      await onSearch(value);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative rounded-full">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          //   debouncedSearch(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch(value);
          }
          if (e.key === "Escape" && onCollapse) {
            onCollapse();
          }
        }}
        className={cn("h-8 bg-muted/50 rounded-full", className)}
      />
      <button
        onClick={() => handleSearch(value)}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}
