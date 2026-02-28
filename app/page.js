import { readFileSync } from "fs";
import { join } from "path";

// Disable caching so index.html changes are always picked up
export const dynamic = "force-dynamic";

/**
 * Serve the existing index.html as the root page.
 * This lets you keep your hand-crafted HTML while
 * running Next.js for the /api/* routes.
 */
export default function Home() {
  const html = readFileSync(join(process.cwd(), "index.html"), "utf-8");

  return (
    <div
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
