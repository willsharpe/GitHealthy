// app/api/recipes/route.ts
import { NextRequest, NextResponse } from "next/server";

// (Optional but helpful)
// export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Accept either { ingredients: string[] } or { recipeIngredients: string[] }
    const body = await req.json();
    const incoming: string[] =
      body?.ingredients ??
      body?.recipeIngredients ??
      [];

    if (!Array.isArray(incoming) || incoming.length === 0) {
      return NextResponse.json({ error: "No ingredients provided" }, { status: 400 });
    }

    const apiKey = process.env.SPOON_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing SPOON_API_KEY" }, { status: 500 });
    }

    // normalize + de-dupe
    const names = [...new Set(incoming.map((s: string) => s.trim().toLowerCase()).filter(Boolean))];
    if (names.length === 0) {
      return NextResponse.json({ error: "Ingredients empty after normalization" }, { status: 400 });
    }

    // Build GET query correctly
    const params = new URLSearchParams({
      ingredients: names.join(","), // <-- correct param name for this endpoint
      number: "3",
      ranking: "1",
      ignorePantry: "true",
      apiKey,
    });

    const url = `https://api.spoonacular.com/recipes/findByIngredients?${params.toString()}`;

    // Helpful logging during debug (remove later)
    

    const res = await fetch(url, { method: "GET", cache: "no-store" });
    const text = await res.text(); // read once (then parse)


    console.log("[recipes] body:", text);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Spoonacular ${res.status}`, detail: text },
        { status: res.status }
      );
    }

    const data = text ? JSON.parse(text) : [];
    return NextResponse.json({ ok: true, recipes: data });
  } catch (e: any) {
    console.error("[recipes] server error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
