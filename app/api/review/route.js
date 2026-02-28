import { NextResponse } from "next/server";
import { rateLimit } from "../../lib/rate-limit";

/**
 * Default reviews (hardcoded so they work on Vercel serverless).
 * Edit these to change the reviews shown on your site.
 */
const defaultReviews = [
  {
    stars: 5,
    text: "Professional, discreet, and incredibly talented. Our corporate event looked premium in every shot.",
    name: "James R.",
    service: "Corporate",
    createdAt: "2025-09-20T00:00:00.000Z",
  },
  {
    stars: 5,
    text: "Editing service is exceptional — consistent, clean, and beautiful. Highly recommended.",
    name: "Priya N.",
    service: "Photo Editing",
    createdAt: "2025-08-10T00:00:00.000Z",
  },
  {
    stars: 4,
    text: "Relaxed portrait session and stunning results. We printed them large in our living room.",
    name: "The Kowalski Family",
    service: "Portrait Session",
    createdAt: "2025-07-05T00:00:00.000Z",
  },
];

// In-memory store for new reviews (persists while the serverless function is warm)
let newReviews = [];

function getAllReviews() {
  return [...newReviews, ...defaultReviews];
}

/**
 * GET /api/review
 * Returns all reviews as JSON.
 */
export async function GET() {
  return NextResponse.json({ ok: true, reviews: getAllReviews() });
}

/**
 * POST /api/review
 * Saves a new review to reviews.json.
 */
export async function POST(request) {
  try {
    // ── Rate limit by IP ──
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";

    if (!rateLimit(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }

    // ── Parse body ──
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { name, stars, service, text } = body;

    // ── Validate ──
    const errors = [];

    if (!name || typeof name !== "string" || !name.trim()) {
      errors.push("Name is required.");
    }
    if (!text || typeof text !== "string" || !text.trim()) {
      errors.push("Review text is required.");
    }
    if (stars == null || isNaN(stars) || stars < 1 || stars > 5) {
      errors.push("Rating must be between 1 and 5.");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { ok: false, error: errors.join(" ") },
        { status: 400 }
      );
    }

    // ── Sanitize & save ──
    const review = {
      name: name.trim().slice(0, 100),
      stars: Math.round(Number(stars)),
      service: (service || "Other").trim().slice(0, 100),
      text: text.trim().slice(0, 2000),
      createdAt: new Date().toISOString(),
    };

    newReviews.unshift(review); // newest first
    if (newReviews.length > 50) newReviews = newReviews.slice(0, 50);

    return NextResponse.json({ ok: true, review });
  } catch (err) {
    console.error("[/api/review] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
