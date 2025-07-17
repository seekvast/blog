"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNsfwWarning } from "@/hooks/use-nsfw-warning";
import { NsfwWarningModal } from "@/components/nsfw/nsfw-warning-modal";
import { isTaipeiTimezone } from "@/utils/timezone";

// 模拟 NSFW 看板数据
const mockNsfwBoard = {
  id: 1,
  name: "测试 NSFW 看板",
  avatar: "",
  creator_id: 1,
  creator_hashid: "test",
  slug: "test-nsfw",
  desc: "测试 NSFW 内容",
  visibility: 0,
  badge_visible: [],
  category_id: 1,
  child_id: 1,
  is_nsfw: 1, // NSFW 内容
  approval_mode: 0,
  question: "",
  answer: "",
  poll_role: [],
  status: 1,
  users_count: 100,
  is_joined: 0,
  history: {} as any,
  scheduled_deleted_at: null,
  board_user: {} as any,
  manager: {} as any,
  category: {
    id: 1,
    name: "测试分类",
  },
};

// 模拟 NSFW 讨论数据
const mockNsfwDiscussion = {
  id: 1,
  title: "测试 NSFW 讨论",
  comment_count: 10,
  participant_count: 5,
  post_number_index: 1,
  user_hashid: "test",
  first_post_id: 1,
  last_posted_at: "2024-01-01T00:00:00Z",
  last_posted_user_hashid: "test",
  last_post_id: 1,
  last_post_number: 1,
  board_id: 1,
  board_child_id: 1,
  board_creator_hashid: "test",
  hidden_at: null,
  hidden_user_hashid: "",
  slug: "test-nsfw-discussion",
  diff_humans: "1天前",
  is_private: 0,
  is_approved: 1,
  is_locked: 0,
  is_sticky: 0,
  view_count: 100,
  up_votes: 10,
  down_votes: 2,
  hotness: 100,
  is_voted: false,
  votes_count: 12,
  main_post: {} as any,
  board: mockNsfwBoard,
  board_child: {} as any,
  raw_content: "测试内容",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  deleted_at: null,
  user: {} as any,
  discussion_user: {} as any,
  user_voted: {} as any,
  board_user: {} as any,
};

export default function TestNsfwPage() {
  const [testType, setTestType] = useState<"board" | "discussion">("board");

  // 测试看板 NSFW 提醒
  const boardNsfw = useNsfwWarning(
    testType === "board" ? mockNsfwBoard : undefined,
    undefined
  );

  // 测试讨论 NSFW 提醒
  const discussionNsfw = useNsfwWarning(
    undefined,
    testType === "discussion" ? mockNsfwDiscussion : undefined
  );

  const currentNsfw = testType === "board" ? boardNsfw : discussionNsfw;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">NSFW 提醒功能测试</h1>

      <div className="space-y-4 mb-6">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">当前状态</h2>
          <p>时区检测: {isTaipeiTimezone() ? "台北时区" : "非台北时区"}</p>
          <p>测试类型: {testType === "board" ? "看板页面" : "讨论页面"}</p>
          <p>是否显示警告: {currentNsfw.shouldShow ? "是" : "否"}</p>
        </div>

        <div className="flex space-x-4">
          <Button
            onClick={() => setTestType("board")}
            variant={testType === "board" ? "default" : "outline"}
          >
            测试看板页面
          </Button>
          <Button
            onClick={() => setTestType("discussion")}
            variant={testType === "discussion" ? "default" : "outline"}
          >
            测试讨论页面
          </Button>
        </div>

        <div className="flex space-x-4">
          <Button
            onClick={() => {
              localStorage.removeItem("nsfw-warning-cooldown");
              window.location.reload();
            }}
            variant="outline"
          >
            重置冷却时间
          </Button>
          <Button
            onClick={() => {
              currentNsfw.setShowWarning(true);
            }}
            variant="outline"
          >
            手动显示警告
          </Button>
        </div>
      </div>

      {/* NSFW 提醒弹窗 */}
      <NsfwWarningModal
        open={currentNsfw.showWarning}
        onOpenChange={currentNsfw.setShowWarning}
        onConfirm={currentNsfw.handleConfirm}
        onCancel={currentNsfw.handleCancel}
      />
    </div>
  );
}
