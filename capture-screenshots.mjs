import { chromium } from "playwright";

const OUT = "docs/images";
const shots = [
  { file: "dashboard-overview.png", sels: ["overview", "pieGrid"] },
  { file: "loan-income.png", sels: ["twoColum"], nth: 0 },
  { file: "affordability.png", sels: ["twoColum"], nth: 1 },
  { file: "payoff-analysis.png", sels: ["payoffPa"] },
];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 4400 },
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

// Sweet-spot comparison lives inside the payoff panel behind a toggle. Open it,
// then clip from its section title through the bottom of its comparison table.
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) =>
    /Compare extra-payment tiers/i.test(b.textContent)
  );
  if (btn) btn.click();
});
await page.waitForSelector('svg[aria-label*="Remaining balance across"]', { timeout: 10000 });
await page.waitForTimeout(800);

const ssClip = await page.evaluate(() => {
  const heading = [...document.querySelectorAll("h2")].find((e) =>
    /^Sweet-spot comparison/i.test(e.textContent.trim())
  );
  const titleBlock = heading.closest("div");
  const tables = [...document.querySelectorAll("table")];
  const ssTable = tables.find((t) =>
    /Total \/ mo/i.test(t.querySelector("thead")?.textContent || "")
  );
  const t = titleBlock.getBoundingClientRect();
  const b = ssTable.getBoundingClientRect();
  const padX = 24;
  const padTop = 8;
  const padBottom = 24;
  return {
    x: Math.max(0, Math.min(t.left, b.left) + scrollX - padX),
    y: Math.max(0, t.top + scrollY - padTop),
    width: Math.min(1440, Math.max(t.right, b.right) - Math.min(t.left, b.left) + padX * 2),
    height: b.bottom - t.top + padTop + padBottom,
  };
});
await page.screenshot({ path: `${OUT}/sweet-spot-comparison.png`, clip: ssClip });
console.log("saved sweet-spot-comparison.png", JSON.stringify(ssClip));

await browser.close();
console.log("done");
