import { UploadResponse } from "@/types";
import { api } from "@/lib/api";

export type AttachmentType =
  | "topics_images"
  | "profile_avatars"
  | "profile_covers"
  | "board_avatars";

export async function uploadFile(
  file: File,
  attachmentType: AttachmentType
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("attachment_type", attachmentType);

    const data = await api.upload.image(formData);
    return `${data.host}${data.file_path}`;
  } catch (error) {
    throw error;
  }
}
