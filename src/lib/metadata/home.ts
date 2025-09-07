import { createMetadata } from "./factory";

export const getHomeMetadata = (locale?: string) => {
  return createMetadata({
    title: "首页",
    description: "Kater 是一个开放、多元的综合性论坛社区，用户可以在这里自由地讨论各种话题，分享知识和经验。",
    locale,
  });
};
