import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PollData } from "./types";

interface PollEditorProps {
  pollOptions: string[];
  setPollOptions: (options: string[]) => void;
  isMultipleChoice: boolean;
  setIsMultipleChoice: (value: boolean) => void;
  showVoters: boolean;
  setShowVoters: (value: boolean) => void;
  hasDeadline: boolean;
  setHasDeadline: (value: boolean) => void;
  pollStartTime: string;
  setPollStartTime: (value: string) => void;
  pollEndTime: string;
  setPollEndTime: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export const PollEditor: React.FC<PollEditorProps> = ({
  pollOptions,
  setPollOptions,
  isMultipleChoice,
  setIsMultipleChoice,
  showVoters,
  setShowVoters,
  hasDeadline,
  setHasDeadline,
  pollStartTime,
  setPollStartTime,
  pollEndTime,
  setPollEndTime,
  onCancel,
  onConfirm,
}) => (
  <div className="mb-4 border rounded-lg p-4">
    <div className="space-y-4">
      {pollOptions.map((option, index) => (
        <div key={index} className="relative">
          <Input
            value={option}
            onChange={(e) => {
              const newOptions = [...pollOptions];
              newOptions[index] = e.target.value;
              setPollOptions(newOptions);
            }}
            placeholder={`选项 ${index + 1}`}
            className="pr-8"
          />
          {pollOptions.length > 2 && (
            <button
              onClick={() => {
                setPollOptions(pollOptions.filter((_, i) => i !== index));
              }}
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
      <button
        type="button"
        onClick={() => setPollOptions([...pollOptions, ""])}
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
      <div className="flex items-center justify-between py-2">
        <span>允许多选</span>
        <Switch checked={isMultipleChoice} onCheckedChange={setIsMultipleChoice} />
      </div>
      <div className="flex items-center justify-between border-t border-b py-4">
        <span>公开投票人</span>
        <Switch checked={showVoters} onCheckedChange={setShowVoters} />
      </div>
      <div className="flex items-center justify-between py-2">
        <span>设置截止时间</span>
        <Switch checked={hasDeadline} onCheckedChange={setHasDeadline} />
      </div>
      {hasDeadline && (
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="datetime-local"
                value={pollStartTime}
                onChange={(e) => setPollStartTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                onClick={(e) =>
                  (e.currentTarget as HTMLInputElement).showPicker()
                }
                className="cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <Input
                type="datetime-local"
                value={pollEndTime}
                onChange={(e) => setPollEndTime(e.target.value)}
                min={pollStartTime || new Date().toISOString().slice(0, 16)}
                onClick={(e) =>
                  (e.currentTarget as HTMLInputElement).showPicker()
                }
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={onConfirm}>确认</Button>
      </div>
    </div>
  </div>
);
