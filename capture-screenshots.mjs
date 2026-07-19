import { chromium } from "playwright";

const OUT = "docs/screenshots";
const shots = [
  { file: "dashboard-overview.png", sels: ["overview", "pieGrid"] },
  { file: "loan-income.png", sels: ["twoColum"], nth: 0 },
  { file: "affordability.png", sels: ["twoColum"], nth: 1 },
  { file: "payoff-analysis.png", sels: ["payoffPa"] },
];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 3400 },
  deviceScaleFactor: 2,
});
await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
await page.waitForSelector("main", { timeout: 30000 });
await page.waitForFunction(() => document.querySelectorAll("main > *").length >= 6, { timeout: 30000 });
await page.waitForTimeout(1500);

// Helper: find element whose class contains a module fragment
const findBox = async (frag, nth = 0) => {
  return await page.evaluate(
    ([frag, nth]) => {
      const els = [...document.querySelectorAll("main > *")].filter((e) =>
        [...e.classList].some((c) => c.includes(frag))
      );
      const el = els[nth];
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height };
    },
    [frag, nth]
  );
};

for (const s of shots) {
  const boxes = [];
  for (const sel of s.sels) {
    const b = await findBox(sel, s.nth || 0);
    if (b) boxes.push(b);
  }
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  const right = Math.max(...boxes.map((b) => b.x + b.w));
  const bottom = Math.max(...boxes.map((b) => b.y + b.h));
  const pad = 24;
  const clip = {
    x: Math.max(0, x - pad),
    y: Math.max(0, y - pad),
    width: Math.min(1440, right - x + pad * 2),
    height: bottom - y + pad * 2,
  };
  await page.screenshot({ path: `${OUT}/${s.file}`, clip });
  console.log(`saved ${s.file}`, JSON.stringify(clip));
}

await browser.close();
console.log("done");
