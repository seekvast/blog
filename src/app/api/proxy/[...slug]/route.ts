import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

async function handler(req: NextRequest) {
  const slug = req.nextUrl.pathname.replace("/api/proxy/", "");
  const searchParams = req.nextUrl.search;
  const apiUrl = `${process.env.SERVER_API_URL}/${slug}${searchParams}`;

  const token = await getToken({ req });
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  if (token?.token) {
    headers.set("Authorization", `Bearer ${token.token}`);
  }
  console.log(apiUrl, "apiUrl.................");

  try {
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: headers,
      body: req.body,
      // @ts-ignore
      duplex: "half",
      redirect: "manual",
    });

    return response;
  } catch (error) {
    console.error(`[API Proxy Error]`, error);
    return new Response("API proxy failed", { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
