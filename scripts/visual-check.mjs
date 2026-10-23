import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:3000";

const pages = [
  "/",
  "/chapter/intro",
  "/chapter/loop",
  "/chapter/tools",
  "/chapter/context",
  "/chapter/sandbox",
  "/chapter/multiagent",
  "/chapter/eval",
  "/chapter/frontier",
  "/progress",
  "/mistakes",
];

const results = [];
let failed = false;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});

for (const path of pages) {
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 800));

  const desktop = await page.evaluate(() => ({
    overflow:
      document.documentElement.scrollWidth > window.innerWidth + 2,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));

  // 移动端
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 800));
  const mobile = await page.evaluate(() => ({
    overflow:
      document.documentElement.scrollWidth > window.innerWidth + 2,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));

  const ok =
    !desktop.overflow && !mobile.overflow && consoleErrors.length === 0;

  if (!ok) failed = true;
  results.push({
    path,
    desktopOverflow: desktop.overflow,
    mobileOverflow: mobile.overflow,
    consoleErrors: consoleErrors.length,
    ok,
  });

  await page.close();
}

await browser.close();

console.table(results);
console.log(failed ? "\n❌ 存在问题，见上表" : "\n✅ 全部通过：无水平溢出、无控制台错误");
process.exit(failed ? 1 : 0);
