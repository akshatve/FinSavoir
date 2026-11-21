// Guards against fabricated content returning to the site. These checks scan
// source files, so they run without a browser or the API.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return sourceFiles(p);
    return /\.(js|jsx|mjs)$/i.test(name) ? [p] : [];
  });
}

const files = [...sourceFiles(join(ROOT, "app")), ...sourceFiles(join(ROOT, "lib"))].map((p) => ({
  path: relative(ROOT, p),
  text: readFileSync(p, "utf8"),
}));

const banned = [
  [/Trusted by [\d,]+\+? Investors/i, "unverified user count"],
  [/[\d.]+\/5 from [\d,]+\+? reviews/i, "unverified review rating"],
  [/Join thousands of investors/i, "unverified user count"],
  [/generate(Fake)?Candles/, "randomly generated price chart"],
  [/market_cap\s*\*\s*0\.05/, "made-up 52-week high"],
  [/\b2 min read\b/, "invented reading time"],
  [/Sequoia|Citadel|NYU Stern|Meridian Research|Apex Capital/, "invented testimonial attribution"],
];

for (const [pattern, why] of banned) {
  test(`no ${why} (${pattern})`, () => {
    const hits = files.filter((f) => pattern.test(f.text)).map((f) => f.path);
    assert.deepEqual(hits, []);
  });
}

test("financial widgets never draw random data", () => {
  const dataWidgets = files.filter(
    (f) => /components\/(Market|Trending|Sector|StockMarquee)|markets\/|stocks\/|company\//.test(f.path),
  );
  const hits = dataWidgets.filter((f) => /Math\.random\(/.test(f.text)).map((f) => f.path);
  assert.deepEqual(hits, []);
});
