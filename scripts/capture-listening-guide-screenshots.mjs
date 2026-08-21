import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("docs/user-guides/images/listening-practice");
fs.mkdirSync(outDir, { recursive: true });

async function run() {
  const username = `learner_${Date.now()}`;
  const email = `${username}@wordstreak.app`;
  const password = "Password123!";

  console.log("1. Creating user via API...");
  const regRes = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  const regData = await regRes.json();
  const token = regData.accessToken;
  console.log("Created user:", regData.user.username);

  console.log("2. Creating demo deck and vocabulary cards...");
  const deckRes = await fetch("http://localhost:3000/api/decks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: "IELTS Core Vocabulary",
      description: "Bộ từ vựng trọng tâm cho kỳ thi IELTS kèm phát âm bản xứ.",
      color: "#9333ea",
      icon: "BookOpen",
      isPublic: true,
    }),
  });
  const deck = await deckRes.json();
  console.log("Created Deck ID:", deck.id, "Title:", deck.title);

  const sampleCards = [
    {
      word: "accommodation",
      meaning: "Chỗ ở, phòng ở tiện nghi",
      phonetic: "/əˌkɒm.əˈdeɪ.ʃən/",
      audioUrl: "https://dict.youdao.com/dictvoice?audio=accommodation&type=2",
      exampleSentence: "The university helps international students find suitable accommodation.",
      collocations: "temporary accommodation, book accommodation, luxury accommodation",
      mnemonic: "Ac-commodation: Có 2 chữ c và 2 chữ m (căn phòng có 2 cửa sổ và 2 chiếc gương).",
    },
    {
      word: "perseverance",
      meaning: "Sự kiên trì, bền chí theo đuổi mục tiêu",
      phonetic: "/ˌpɜː.sɪˈvɪə.rəns/",
      audioUrl: "https://dict.youdao.com/dictvoice?audio=perseverance&type=2",
      exampleSentence: "Through hard work and perseverance, she achieved her IELTS 8.0 target.",
      collocations: "great perseverance, perseverance pays off, show perseverance",
      mnemonic: "Per-severance: Luôn vượt qua mọi thử thách khắc nghiệt (severe) bằng sự bền bỉ.",
    },
    {
      word: "efficient",
      meaning: "Hiệu quả, năng suất cao mà không lãng phí",
      phonetic: "/ɪˈfɪʃ.ənt/",
      audioUrl: "https://dict.youdao.com/dictvoice?audio=efficient&type=2",
      exampleSentence: "Spaced repetition is an efficient technique for memorizing new words.",
      collocations: "highly efficient, energy efficient, efficient method",
      mnemonic: "E-fficient: Tạo ra hiệu ứng tích cực (effect) mà không tốn công.",
    },
    {
      word: "ubiquitous",
      meaning: "Có mặt ở khắp mọi nơi, phổ biến rộng rãi",
      phonetic: "/juːˈbɪk.wɪ.təs/",
      audioUrl: "https://dict.youdao.com/dictvoice?audio=ubiquitous&type=2",
      exampleSentence: "Smartphones have become ubiquitous in modern daily life.",
      collocations: "ubiquitous presence, increasingly ubiquitous, ubiquitous technology",
      mnemonic: "U-bi-qui-tous: Bạn đi đâu (u-bi) cũng thấy nó xuất hiện khắp nơi.",
    },
  ];

  for (const card of sampleCards) {
    await fetch(`http://localhost:3000/api/decks/${deck.id}/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(card),
    });
  }
  console.log("Seeded 4 cards successfully.");

  console.log("3. Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Helper using Playwright locator evaluate
  async function addAnnotation(selector, badgeNumber, options = {}) {
    try {
      const loc = page.locator(selector).first();
      await loc.waitFor({ state: "visible", timeout: 3000 });
      await loc.evaluate((el, { badge, opt }) => {
        el.style.outline = "3.5px solid #EF4444";
        el.style.boxShadow = "0 0 0 7px rgba(239, 68, 68, 0.3)";
        if (opt.relative !== false) el.style.position = "relative";
        el.style.zIndex = "50";

        const b = document.createElement("div");
        b.className = "__guide_badge__";
        b.textContent = badge;
        b.style.position = "absolute";
        b.style.top = opt.top || "-14px";
        b.style.left = opt.left || "-14px";
        b.style.background = "#EF4444";
        b.style.color = "#ffffff";
        b.style.fontWeight = "800";
        b.style.fontFamily = "system-ui, sans-serif";
        b.style.fontSize = "13px";
        b.style.width = "26px";
        b.style.height = "26px";
        b.style.borderRadius = "9999px";
        b.style.display = "flex";
        b.style.alignItems = "center";
        b.style.justifyContent = "center";
        b.style.zIndex = "999999";
        b.style.boxShadow = "0 2px 8px rgba(0,0,0,0.35)";
        b.style.pointerEvents = "none";
        el.appendChild(b);
      }, { badge: badgeNumber, opt: options });
    } catch (err) {
      console.warn(`Could not annotate ${selector}: ${err.message}`);
    }
  }

  async function clearAnnotations() {
    await page.evaluate(() => {
      document.querySelectorAll(".__guide_badge__").forEach((b) => b.remove());
      document.querySelectorAll("*").forEach((el) => {
        if (el.style.outline && el.style.outline.includes("rgb(239, 68, 68)")) {
          el.style.outline = "";
          el.style.boxShadow = "";
        }
      });
    });
  }

  // Log in
  console.log("Logging into web app...");
  await page.goto("http://localhost:5173/login", { waitUntil: "networkidle" });
  await page.fill("#login-identifier", username);
  await page.fill("#login-password", password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // Navigate directly to the created deck
  const deckUrl = `http://localhost:5173/decks/${deck.id}`;
  console.log("Navigating to Deck:", deckUrl);
  await page.goto(deckUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // STEP 1: Practice button on deck detail
  console.log("Capturing Step 1: Practice button...");
  await clearAnnotations();
  await addAnnotation('button:has-text("Trắc nghiệm Quiz")', "①");
  await page.screenshot({
    path: path.join(outDir, "step-01-practice-button.png"),
    fullPage: false,
  });
  console.log("✔ Saved step-01-practice-button.png");

  // STEP 2: Open QuizSetupModal
  console.log("Capturing Step 2: Setup modal with Listening tab...");
  await clearAnnotations();
  await page.click('button:has-text("Trắc nghiệm Quiz")');
  await page.waitForTimeout(600);

  await addAnnotation('button:has-text("Luyện nghe")', "①");
  await addAnnotation('div:has-text("Question Count") + div', "②");
  await addAnnotation('button:has-text("Start Practice Quiz")', "③");

  await page.screenshot({
    path: path.join(outDir, "step-02-setup-modal.png"),
    fullPage: false,
  });
  console.log("✔ Saved step-02-setup-modal.png");

  // STEP 3: Click Listening mode and Start Practice Quiz
  console.log("Capturing Step 3: Active Listening Quiz Card...");
  await clearAnnotations();
  await page.click('button:has-text("Luyện nghe")');
  await page.waitForTimeout(300);

  // Toggle Zen mode for clean visual
  const zenToggle = await page.$('button[role="switch"]');
  if (zenToggle) {
    await zenToggle.click();
    await page.waitForTimeout(200);
  }

  await page.click('button:has-text("Start Practice Quiz")');
  await page.waitForTimeout(1500);

  await addAnnotation('button:has-text("Click to Listen"), button:has(svg.lucide-sparkles), button:has(svg.lucide-volume-2)', "①");
  await addAnnotation('input[type="text"]', "②");
  await addAnnotation('button:has-text("1.0x"), button:has-text("0.75x")', "③");
  await addAnnotation('button:has-text("Gợi ý"), button:has-text("Hint")', "④");

  await page.screenshot({
    path: path.join(outDir, "step-03-listening-quiz-active.png"),
    fullPage: false,
  });
  console.log("✔ Saved step-03-listening-quiz-active.png");

  // STEP 4: Progressive Hint Ladder
  console.log("Capturing Step 4: Progressive hints...");
  await clearAnnotations();
  const hintBtn = await page.$('button:has-text("Gợi ý"), button:has-text("Hint")');
  if (hintBtn) {
    await hintBtn.click();
    await page.waitForTimeout(300);
    await hintBtn.click();
    await page.waitForTimeout(300);
  }
  await addAnnotation('div:has-text("Gợi ý (Tier"), div:has-text("Tier 2/3"), div:has-text("Tier 1/3")', "①");
  await page.screenshot({
    path: path.join(outDir, "step-04-progressive-hints.png"),
    fullPage: false,
  });
  console.log("✔ Saved step-04-progressive-hints.png");

  // STEP 5: Character Diff Error Feedback
  console.log("Capturing Step 5: Character Diff feedback...");
  await clearAnnotations();
  const input = await page.$('input[type="text"]');
  if (input) {
    await input.fill("acomodation");
    await input.press("Enter");
    await page.waitForTimeout(600);
  }
  await addAnnotation('div:has-text("Ký tự đúng:"), div[class*="rounded-xl"]:has(span.font-mono)', "①");
  await page.screenshot({
    path: path.join(outDir, "step-05-feedback-error-diff.png"),
    fullPage: false,
  });
  console.log("✔ Saved step-05-feedback-error-diff.png");

  // STEP 6: Complete quiz & Results view
  console.log("Capturing Step 6: Results Summary...");
  await clearAnnotations();
  for (let i = 0; i < 10; i++) {
    const isDone = await page.$('button:has-text("Luyện lại"), button:has-text("Quay lại bộ từ")');
    if (isDone) break;
    const curInput = await page.$('input[type="text"]');
    if (curInput) {
      await curInput.fill("accommodation");
      await curInput.press("Enter");
      await page.waitForTimeout(1400);
    } else {
      await page.waitForTimeout(500);
    }
  }
  await page.waitForTimeout(1000);
  await addAnnotation('div:has-text("Chính xác"), div:has-text("Accuracy"), div:has-text("%")', "①");
  await addAnnotation('div:has-text("XP"), div:has-text("Điểm kinh nghiệm")', "②");
  await addAnnotation('button:has-text("Luyện lại"), button:has-text("Quay lại bộ từ")', "③");

  await page.screenshot({
    path: path.join(outDir, "step-06-results-summary.png"),
    fullPage: false,
  });
  console.log("✔ Saved step-06-results-summary.png");

  await browser.close();
  console.log("All 6 screenshots captured and saved successfully to:", outDir);
}

run().catch((err) => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});
