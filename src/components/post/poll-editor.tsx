import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PollForm } from "@/validations/discussion";

interface PollEditorProps {
  values: PollForm;
  onChange: (field: string, value: any) => void;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export const PollEditor: React.FC<PollEditorProps> = ({
  values,
  onChange,
  error,
  onCancel,
  onConfirm,
}) => {
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...values.options];
    newOptions[index] = value;
    onChange("options", newOptions);
  };

  const handleOptionDelete = (index: number) => {
    onChange(
      "options",
      values.options.filter((_, i) => i !== index)
    );
  };

  const handleAddOption = () => {
    if (values.options.length < 10) {
      onChange("options", [...values.options, ""]);
    }
  };

  return (
    <div className="mb-4 border rounded-lg p-4">
      <div className="space-y-4">
        {values.options.map((option, index) => (
          <div key={index} className="relative">
            <Input
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`选项 ${index + 1}`}
              className="pr-8"
            />
            {values.options.length > 2 && (
              <button
                onClick={() => handleOptionDelete(index)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 rounded-full w-5 h-5 flex items-center justify-center"
                type="button"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
        {values.options.length < 10 && (
          <button
            type="button"
            onClick={handleAddOption}
            className="w-full flex items-center justify-center gap-1 text-blue-500 hover:text-blue-700"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 3V13M3 8H13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            增加选项
          </button>
        )}
        <div className="flex items-center justify-between py-2">
          <span>允许多选</span>
          <Switch
            checked={values.is_multiple === 1}
            onCheckedChange={(checked) => onChange("is_multiple", checked ? 1 : 0)}
          />
        </div>
        <div className="flex items-center justify-between border-t border-b py-4">
          <span>公开投票人</span>
          <Switch
            checked={values.show_voter === 1}
            onCheckedChange={(checked) => onChange("show_voter", checked ? 1 : 0)}
          />
        </div>
        <div className="flex items-center justify-between py-2">
          <span>设置截止时间</span>
          <Switch
            checked={values.is_timed === 1}
            onCheckedChange={(checked) => onChange("is_timed", checked ? 1 : 0)}
          />
        </div>
        {values.is_timed === 1 && (
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="datetime-local"
                  value={values.end_time}
                  onChange={(e) => onChange("end_time", e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  onClick={(e) =>
                    (e.currentTarget as HTMLInputElement).showPicker()
                  }
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
        {error && <div className="text-sm text-destructive">{error}</div>}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            取消
          </Button>
          <Button size="sm" onClick={onConfirm}>
            确认
          </Button>
        </div>
      </div>
    </div>
  );
};
