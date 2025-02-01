"use client";

import dynamic from "next/dynamic";

const CreatePostModal = dynamic(
  () => import("@/components/post/create-post-modal"),
  { ssr: false }
);

export function PostEditorProvider() {
  return <CreatePostModal />;
}
