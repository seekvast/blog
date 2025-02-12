import { api } from "@/lib/api";
import { Attachment } from "@/types";

export type AttachmentType =
  | "topics_images"
  | "profile_avatars"
  | "profile_covers"
  | "board_avatars";

export async function uploadFile(
  file: File,
  attachmentType: AttachmentType
): Promise<Attachment> {
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("attachment_type", attachmentType);

    const data = await api.upload.image(formData);
    data.url = `${data.host}${data.file_path}`;
    return data;
  } catch (error) {
    throw error;
  }
}
