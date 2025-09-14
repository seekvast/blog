import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { UserCover } from "./components/user-cover";
import { Skeleton } from "@/components/ui/skeleton";
import { getSiteConfig } from "@/config/site";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const siteConfig = getSiteConfig();
  try {
    const userData = await api.users.get({ username: params.username });
    if (!userData) {
      return {
        title: `${siteConfig.name}`,
      };
    }
    return {
      title: `${userData.username}'s Profile - ${siteConfig.name}`,
      description: `View the profile and activity of ${userData.username} on ${siteConfig.name}.`,
    };
  } catch (error) {
    return {
      title: `${siteConfig.name}`,
    };
  }
}

export default async function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { username: string };
}) {
  const { username } = params;

  const userData = await api.users.get({ username });

  if (!userData) {
    notFound();
  }

  return (
    <div>
      <Suspense
        fallback={<Skeleton className="h-[200px] sm:h-[260px] w-full" />}
      >
        <UserCover initialUser={userData} />
      </Suspense>

      <div className="mx-auto max-w-7xl overflow-hidden">{children}</div>
    </div>
  );
}
