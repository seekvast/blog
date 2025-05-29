import React from "react";
import { UseFormReturn } from "react-hook-form";
import { BoardSettingsFormValues } from "./types";
import { Category } from "@/types";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
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

interface FormFieldsProps {
  form: UseFormReturn<BoardSettingsFormValues>;
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
      {/* 看板网址 */}
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>看板网址</FormLabel>
            <FormControl>
              <Input
                placeholder="可輸入英文大小寫+數字，长度7~25个字符"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 看板说明 */}
      <FormField
        control={form.control}
        name="desc"
        render={({ field }) => (
          <FormItem>
            <FormLabel>看板说明</FormLabel>
            <FormControl>
              <Textarea placeholder="只能输入文字，最长500字" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 管理人员徽章 */}
      <div className="space-y-4">
        <FormLabel>管理人员徽章展示</FormLabel>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="badge_visible"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value.includes(1)}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...field.value, 1]
                          : field.value.filter((v) => v !== 1);
                        field.onChange(newValue);
                      }}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">管理</FormLabel>
                </FormItem>
              )}
            />
          </div>
          <div className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="badge_visible"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value.includes(2)}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...field.value, 2]
                          : field.value.filter((v) => v !== 2);
                        field.onChange(newValue);
                      }}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">管理员</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* 看板类型 */}
      <FormField
        control={form.control}
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>看板类型</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(Number(value))}
              defaultValue={String(field.value)}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="选择看板类型" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 讨论类型 */}
      <FormField
        control={form.control}
        name="is_nsfw"
        render={({ field }) => (
          <FormItem>
            <FormLabel>讨论类型</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(Number(value))}
              defaultValue={String(field.value)}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="选择讨论类型" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="0">非成人</SelectItem>
                <SelectItem value="1">成人</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 看板加入方式 */}
      <FormField
        control={form.control}
        name="approval_mode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>看板加入方式</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(Number(value))}
                defaultValue={String(field.value)}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="free" />
                  <Label htmlFor="free">无需审核可直接加入</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="manual" />
                  <Label htmlFor="manual">输入问题由管理员审核</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="auto" />
                  <Label htmlFor="auto">输入问题系统自动审核</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 条件性显示问题和答案输入框 */}
      {form.watch("approval_mode") > 0 && (
        <>
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel>问题</FormLabel>
                <FormControl>
                  <Input
                    placeholder="请输入问题"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {(form.watch("approval_mode") === 1 ||
            form.watch("approval_mode") === 2) && (
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>答案</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="请输入答案"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </>
      )}

      {/* 看板访问权限 */}
      <FormField
        control={form.control}
        name="visibility"
        render={({ field }) => (
          <FormItem>
            <FormLabel>看板被搜寻</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(Number(value))}
              defaultValue={String(field.value)}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="选择访问权限" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="0">公开</SelectItem>
                <SelectItem value="1">私密</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 投票权限 */}
      <div>
        <FormLabel>投票权限</FormLabel>
        <FormDescription>(选择允许哪些角色进行投票)</FormDescription>
        <FormField
          control={form.control}
          name="poll_role"
          render={({ field }) => (
            <FormItem>
              <div className="mt-2">
                <FormControl>
                  <div className="flex items-center gap-8">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value.includes(3)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...field.value, 3]
                            : field.value.filter((v: number) => v !== 3);
                          field.onChange(newValue);
                        }}
                      />
                      <Label>普通用户</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value.includes(1)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...field.value, 1]
                            : field.value.filter((v: number) => v !== 1);
                          field.onChange(newValue);
                        }}
                      />
                      <Label>创建者</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value.includes(2)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...field.value, 2]
                            : field.value.filter((v: number) => v !== 2);
                          field.onChange(newValue);
                        }}
                      />
                      <Label>管理员</Label>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
