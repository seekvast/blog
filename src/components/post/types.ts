import { Poll } from "@/validations/discussion";
import {
  booleanConverter,
  fieldNameConverter,
  mapFields,
} from "@/lib/data-utils";

/**
 * 前端投票数据结构
 * 与后端的数据类型和命名保持一致
 */
export interface PollData {
  options: string[];
  is_multiple: 0 | 1; // 使用0|1替代boolean
  show_voter: 0 | 1; // 使用0|1替代boolean
  is_timed: 0 | 1; // 使用0|1替代boolean
  start_time?: string; // 与后端命名保持一致
  end_time?: string; // 与后端命名保持一致
}

/**
 * UI组件使用的投票数据结构
 * 使用布尔值类型以便直接与UI组件(如Switch)集成
 */
export interface PollDataUI {
  options: string[];
  is_multiple: boolean;
  show_voter: boolean;
  is_timed: boolean;
  start_time?: string;
  end_time?: string;
}

// 前端和API的字段映射关系
const pollDataToApiMapping = {
  is_multiple: "is_multiple",
  show_voter: "show_voter",
  is_timed: "is_timed",
  start_time: "start_time",
  end_time: "end_time",
};

// API到前端的字段映射关系
const apiToPollDataMapping = {
  is_multiple: "is_multiple",
  show_voter: "show_voter",
  is_timed: "is_timed",
  start_time: "start_time",
  end_time: "end_time",
};

/**
 * 将前端数据模型转换为UI友好的格式
 */
export function convertPollDataToUIFormat(pollData: PollData): PollDataUI {
  return {
    options: [...pollData.options],
    is_multiple: pollData.is_multiple === 1,
    show_voter: pollData.show_voter === 1,
    is_timed: pollData.is_timed === 1,
    start_time: pollData.start_time,
    end_time: pollData.end_time,
  };
}

/**
 * 将UI友好的格式转换回前端数据模型
 */
export function convertUIFormatToPollData(pollDataUI: PollDataUI): PollData {
  return {
    options: [...pollDataUI.options],
    is_multiple: pollDataUI.is_multiple ? 1 : 0,
    show_voter: pollDataUI.show_voter ? 1 : 0,
    is_timed: pollDataUI.is_timed ? 1 : 0,
    start_time: pollDataUI.start_time,
    end_time: pollDataUI.end_time,
  };
}

/**
 * 将前端PollData转换为后端Poll格式
 */
export function convertPollDataToApiFormat(
  pollData: PollData,
  title: string
): Poll {
  return {
    title,
    options: [...pollData.options],
    is_multiple: pollData.is_multiple,
    show_voter: pollData.show_voter,
    is_timed: pollData.is_timed,
    start_time: pollData.start_time,
    end_time: pollData.end_time,
  };
}

/**
 * 将后端Poll格式转换为前端PollData
 */
export function convertApiFormatToPollData(poll: Poll): PollData {
  return {
    options: [...poll.options],
    is_multiple: poll.is_multiple as 0 | 1,
    show_voter: poll.show_voter as 0 | 1,
    is_timed: poll.is_timed as 0 | 1,
    start_time: poll.start_time,
    end_time: poll.end_time,
  };
}

// 导出后端格式类型，用于API调用
export type PollApiData = Poll;
