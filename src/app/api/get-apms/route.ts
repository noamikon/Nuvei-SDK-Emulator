import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "Deprecated API. Use the Nuvei Web SDK getApms() method directly from the frontend.",
    },
    { status: 410 }
  );
}

