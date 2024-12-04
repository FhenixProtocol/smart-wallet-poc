import { NextRequest, NextResponse } from "next/server";
import { getAlchemySepoliaUrl } from "~~/utils/scaffold-eth";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((value: string, key: string) => {
    // don't pass the cookie because it doesn't get used downstream
    if (key === "cookie") return;

    headers[key] = value;
  });

  const res = await fetch(getAlchemySepoliaUrl(), {
    method: "POST",
    headers: {
      ...headers,
    },
    body,
  });

  if (!res.ok) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return NextResponse.json(await res.json().catch(e => ({})), {
      status: res.status,
    });
  }

  return NextResponse.json(await res.json());
}
