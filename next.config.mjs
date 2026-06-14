import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function getLatestModifiedTime(paths) {
  let latestTime = 0;

  function visit(path) {
    const stats = statSync(path);

    if (stats.isDirectory()) {
      for (const entry of readdirSync(path)) {
        visit(join(path, entry));
      }
      return;
    }

    latestTime = Math.max(latestTime, stats.mtimeMs);
  }

  for (const path of paths) {
    visit(path);
  }

  return new Date(latestTime).toISOString();
}

const codeUpdatedAt = getLatestModifiedTime([
  "app",
  "public",
  "package.json",
  "next.config.mjs",
]);

const nextConfig = {
  env: {
    NEXT_PUBLIC_CODE_UPDATED_AT: codeUpdatedAt,
  },
};

export default nextConfig;
