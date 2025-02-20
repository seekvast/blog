import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "./types";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/types";

interface FormFieldsProps {
  form: UseFormReturn<FormData>;
  categories: Category[];
  variant?: "mobile" | "desktop";
}

export function FormFields({
  form,
  categories,
  variant = "desktop",
}: FormFieldsProps) {
  const isMobile = variant === "mobile";

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>看板名称</FormLabel>
            <FormControl>
              <Input placeholder="输入看板名称" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>看板网址</FormLabel>
            <FormControl>
              <Input placeholder="输入看板标识" {...field} />
            </FormControl>
            <FormDescription>
              只能使用英文和数字，长度7-25个字符
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="desc"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>看板描述</FormLabel>
            <FormControl>
              <Textarea
                placeholder="输入看板描述"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category_id"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>看板分类</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(Number(value))}
              defaultValue={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="选择看板分类" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_nsfw"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>讨论类型</FormLabel>
            <FormControl>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                defaultValue={field.value.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择讨论类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">非成人</SelectItem>
                  <SelectItem value="1">成人</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="visibility"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>可见性</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(Number(value))}
                defaultValue={field.value.toString()}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="0" />
                  </FormControl>
                  <FormLabel className="font-normal">公开</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="1" />
                  </FormControl>
                  <FormLabel className="font-normal">仅成员可见</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
