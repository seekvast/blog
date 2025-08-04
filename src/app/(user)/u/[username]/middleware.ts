import { getUserMetadata } from "@/lib/metadata";
import { api } from "@/lib/api";
import { Metadata } from "next";

// 为用户页面生成元数据
export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata | null> {
  try {
    const user = await api.users.get({ username: params.username });

    // TODO: 获取帖子API, 获取用户的最新帖子和回复信息，用于生成描述
    const userPosts = await api.users.getPosts({
      username: params.username,
      page: 1,
      per_page: 1,
    });
    // 用户的回复也是通过getPosts API获取，只是可能需要添加一个类型参数
    const userComments = await api.users.getPosts({
      username: params.username,
      page: 1,
      per_page: 1,
    });

    const userWithContent = {
      ...user,
      latest_post: userPosts.items[0]
        ? {
            title: userPosts.items[0].discussion?.title,
            content: userPosts.items[0].content,
          }
        : undefined,
      latest_comment: userComments.items[0]
        ? {
            content: userComments.items[0].content,
          }
        : undefined,
    };

    return getUserMetadata(userWithContent);
  } catch (error) {
    return null;
  }
}
