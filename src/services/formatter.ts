import { api } from '@/lib/api';

export interface FormatResponse {
  code: number;
  data: {
    html: string;
  };
  message: string;
}

export const formatterApi = {
  // 预览时使用
  preview: async (content: string): Promise<string> => {
    const response = await api.post<FormatResponse>('/preview', { content });
    return response.data.html;
  },

  // 保存时使用
  parse: async (content: string): Promise<string> => {
    const response = await api.post<FormatResponse>('/parse', { content });
    return response.data.html;
  },
};
