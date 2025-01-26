import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { PollData } from "./types";

interface PollPreviewProps {
  pollData: PollData | null;
  onDelete: () => void;
  onEdit: () => void;
}

export const PollPreview: React.FC<PollPreviewProps> = ({
  pollData,
  onDelete,
  onEdit,
}) => {
  if (!pollData) return null;

  return (
    <div className="mb-4 border rounded-lg p-4 bg-gray-50 relative">
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <button
        onClick={onEdit}
        className="absolute top-2 right-10 text-gray-500 hover:text-gray-700"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>
      <div className="space-y-4">
        <div className="space-y-2">
          {pollData.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-gray-500">选项 {index + 1} </span>
              <span>{option}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
          {pollData.isMultipleChoice && (
            <Badge variant="secondary" className="text-primary">
              多选
            </Badge>
          )}
          {pollData.showVoters && (
            <Badge variant="secondary" className="text-primary">
              允许用户查看投票人
            </Badge>
          )}
          {pollData.hasDeadline && pollData.startTime && pollData.endTime && (
            <Badge variant="secondary" className="text-primary">
              <span>限时投票：</span>
              {new Date(pollData.startTime).toLocaleString()} -{" "}
              {new Date(pollData.endTime).toLocaleString()}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
