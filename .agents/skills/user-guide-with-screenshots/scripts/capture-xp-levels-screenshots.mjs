import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');
const distDir = path.join(rootDir, 'apps/web/dist');
const outDir = path.join(rootDir, 'docs/user-guides/images/gamification-xp-levels');

fs.mkdirSync(outDir, { recursive: true });

function startServer(port = 5195) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distDir, 'index.html');
      }

      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.json': 'application/json',
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading file');
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }
      });
    });

    server.listen(port, () => {
      console.log(`SPA Server running at http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function main() {
  const port = 5195;
  const server = await startServer(port);
  const baseUrl = `http://localhost:${port}`;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();
  page.on('console', msg => console.log('[PAGE CONSOLE]', msg.text()));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err));

  let currentXpSummaryMock = {
    userId: 'user-1',
    totalXp: 3450,
    level: 12,
    currentLevelXp: 240,
    nextLevelRequiredXp: 350,
    progressPercent: 68.57,
    tier: 'SILVER',
    tierMetadata: {
      tier: 'SILVER',
      nameVi: 'Bạc',
      nameEn: 'Silver',
      minLevel: 6,
      maxLevel: 15,
      colorHex: '#94A3B8',
    },
    todayXp: 120,
    nextTier: 'Vàng',
    nextTierLevel: 16,
  };

  let currentStreakMock = {
    userId: 'user-1',
    currentStreak: 14,
    bestStreak: 21,
    lastActiveDate: new Date().toISOString(),
    isActiveToday: true,
    isPendingToday: false,
    streakFreezes: 2,
    maxStreakFreezes: 2,
    wasProtectedByFreeze: false,
    freezesUsed: 0,
    timezone: 'Asia/Ho_Chi_Minh',
    flameTier: 3,
  };

  const mockXpLogs = [
    {
      id: 'log-1',
      userId: 'user-1',
      xpEarned: 10,
      activityType: 'CARD_REVIEW',
      description: 'Ôn tập thẻ từ vựng',
      metadata: { cardId: 'card-1' },
      createdAt: '2026-08-21T15:20:00.000Z',
    },
    {
      id: 'log-2',
      userId: 'user-1',
      xpEarned: 50,
      activityType: 'DAILY_GOAL_COMPLETED',
      description: 'Hoàn thành mục tiêu ngày',
      metadata: { goal: 10 },
      createdAt: '2026-08-21T15:15:00.000Z',
    },
    {
      id: 'log-3',
      userId: 'user-1',
      xpEarned: 100,
      activityType: 'STREAK_7_DAYS',
      description: 'Đạt mốc 7 ngày Streak',
      metadata: { streakDays: 14 },
      createdAt: '2026-08-21T14:30:00.000Z',
    },
    {
      id: 'log-4',
      userId: 'user-1',
      xpEarned: 30,
      activityType: 'PRACTICE_QUIZ',
      description: 'Bài tập thực hành / Quiz',
      metadata: { score: 100 },
      createdAt: '2026-08-21T13:00:00.000Z',
    },
    {
      id: 'log-5',
      userId: 'user-1',
      xpEarned: 10,
      activityType: 'CARD_REVIEW',
      description: 'Ôn tập thẻ từ vựng',
      metadata: { cardId: 'card-2' },
      createdAt: '2026-08-21T11:10:00.000Z',
    },
  ];

  const mockDueCards = [
    {
      id: 'prog-1',
      cardId: 'card-1',
      deckId: 'deck-1',
      deckTitle: 'IELTS Band 8.0 Core Vocabulary',
      deckColor: '#9333ea',
      word: 'resilient',
      meaning: 'kiên cường, có khả năng phục hồi nhanh chóng',
      phonetic: '/rɪˈzɪl.jənt/',
      audioUrl: null,
      exampleSentence: 'The community was resilient in facing unprecedented challenges.',
      collocations: 'resilient economy, highly resilient',
      mnemonic: 'Re (lại) + silent (im lặng vượt qua) -> kiên cường phục hồi',
      imageUrl: null,
      status: 'LEARNING',
      interval: 6,
      repetitions: 2,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
    },
    {
      id: 'prog-2',
      cardId: 'card-2',
      deckId: 'deck-1',
      deckTitle: 'IELTS Band 8.0 Core Vocabulary',
      deckColor: '#9333ea',
      word: 'ephemeral',
      meaning: 'phù du, chóng tàn, ngắn ngủi',
      phonetic: '/ɪˈfem.ər.əl/',
      audioUrl: null,
      exampleSentence: 'Fame in the digital age is often ephemeral.',
      collocations: 'ephemeral pleasure, ephemeral nature',
      mnemonic: 'Ephe (ép phê) + meral -> cảm giác ngắn ngủi, phù du',
      imageUrl: null,
      status: 'LEARNING',
      interval: 4,
      repetitions: 1,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
    },
    {
      id: 'prog-3',
      cardId: 'card-3',
      deckId: 'deck-1',
      deckTitle: 'IELTS Band 8.0 Core Vocabulary',
      deckColor: '#9333ea',
      word: 'serendipity',
      meaning: 'sự may mắn tình cờ, duyên may',
      phonetic: '/ˌser.ənˈdɪp.ə.ti/',
      audioUrl: null,
      exampleSentence: 'Finding this book was a stroke of serendipity.',
      collocations: 'pure serendipity, happy serendipity',
      mnemonic: 'Serendip + ity -> luôn gặp may mắn bất ngờ',
      imageUrl: null,
      status: 'LEARNING',
      interval: 5,
      repetitions: 1,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
    },
  ];

  let reviewSubmitResult = {
    cardId: 'card-1',
    status: 'MASTERED',
    interval: 15,
    repetitions: 3,
    easeFactor: 2.6,
    lastReviewedAt: new Date().toISOString(),
    nextReviewDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    streak: currentStreakMock,
    xp: {
      xpEarned: 10,
      breakdown: [
        { type: 'CARD_REVIEW', xp: 10, description: 'Ôn tập thẻ' },
        { type: 'DAILY_GOAL_COMPLETED', xp: 50, description: 'Mục tiêu ngày!' },
      ],
      levelUp: {
        isLevelUp: false,
      },
    },
  };

  // Intercept all network routes
  await page.route('**/*', async (route) => {
    const resourceType = route.request().resourceType();
    if (['document', 'script', 'stylesheet', 'image', 'font'].includes(resourceType)) {
      return route.continue();
    }

    const url = route.request().url();

    if (url.includes('/auth/refresh')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-jwt-token' }),
      });
    }

    if (url.includes('/auth/me')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'user-1',
            email: 'alex@wordstreak.com',
            username: 'Alex',
            dailyGoal: 10,
            avatarUrl: null,
            createdAt: '2026-08-01',
            updatedAt: '2026-08-01',
          },
        }),
      });
    }

    if (url.includes('/gamification/xp/summary')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: currentXpSummaryMock,
        }),
      });
    }

    if (url.includes('/gamification/xp/history')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            data: mockXpLogs,
            meta: {
              total: mockXpLogs.length,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          },
        }),
      });
    }

    if (url.includes('/gamification/streak') || url.includes('/streaks/me')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: currentStreakMock,
        }),
      });
    }

    if (url.includes('/streaks/record-activity')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            currentStreak: 14,
            bestStreak: 21,
            streakIncreased: false,
            isActiveToday: true,
            flameTier: 3,
            streakFreezes: 2,
            maxStreakFreezes: 2,
            earnedMilestoneFreeze: false,
          },
        }),
      });
    }

    if (url.includes('/gamification/daily-goals')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { target: 10, current: 10, isCompleted: true },
        }),
      });
    }

    if (url.includes('/reviews/due')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: mockDueCards,
          meta: { totalDue: mockDueCards.length, overdueCount: 0, dueTodayCount: mockDueCards.length, newCount: 0 },
        }),
      });
    }

    if (url.includes('/reviews/submit')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: reviewSubmitResult,
        }),
      });
    }

    if (url.includes('/reviews/stats')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            totalCards: 120,
            dueCount: 15,
            newCount: 8,
            learningCount: 45,
            masteredCount: 67,
          },
        }),
      });
    }

    if (url.includes('/decks')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'deck-1',
              title: 'IELTS Band 8.0 Core Vocabulary',
              description: 'Essential high-yield vocabulary for IELTS reading and speaking.',
              color: 'PURPLE',
              icon: 'Flame',
              stats: { totalCards: 50, dueCards: 12, masteredCards: 20 },
            },
          ],
        }),
      });
    }

    if (url.includes('/analytics/overview')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            totalCards: 120,
            cardsMastered: 67,
            currentStreak: 14,
            retentionRate: 88,
            reviewForecast7d: [5, 8, 12, 10, 6, 7, 9],
          },
        }),
      });
    }

    if (url.includes('/analytics/mastery-summary')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { new: 8, learning: 45, mastered: 67, total: 120 },
        }),
      });
    }

    if (url.includes('/analytics/activity-heatmap') || url.includes('/analytics/decks-progress')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    }

    return route.continue();
  });

  const addAnnotation = async (locator, badgeNumber) => {
    await locator.first().evaluate((el, num) => {
      el.style.position = 'relative';
      el.style.outline = '3.5px solid #EF4444';
      el.style.boxShadow = '0 0 0 7px rgba(239, 68, 68, 0.3)';
      el.style.borderRadius = el.style.borderRadius || '16px';

      const badge = document.createElement('div');
      badge.className = '__guide_badge';
      badge.textContent = num;
      badge.style.position = 'absolute';
      badge.style.top = '-14px';
      badge.style.left = '-14px';
      badge.style.width = '28px';
      badge.style.height = '28px';
      badge.style.backgroundColor = '#EF4444';
      badge.style.color = '#ffffff';
      badge.style.borderRadius = '50%';
      badge.style.display = 'flex';
      badge.style.alignItems = 'center';
      badge.style.justifyContent = 'center';
      badge.style.fontWeight = 'bold';
      badge.style.fontSize = '14px';
      badge.style.zIndex = '99999';
      badge.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
      el.appendChild(badge);
    }, badgeNumber);
  };

  const clearAnnotations = async () => {
    await page.evaluate(() => {
      document.querySelectorAll('.__guide_badge').forEach(b => b.remove());
      document.querySelectorAll('*').forEach(el => {
        if (el.style.outline && el.style.outline.includes('rgb(239, 68, 68)')) {
          el.style.outline = '';
          el.style.boxShadow = '';
        }
      });
    });
  };

  // Seed authentication token
  await page.addInitScript(() => {
    localStorage.setItem('auth_token', 'mock-jwt-token');
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'user-1',
        email: 'alex@wordstreak.com',
        username: 'Alex',
        dailyGoal: 10,
      })
    );
  });

  // =========================================================================
  // STEP 1: Topbar Level Widget on Dashboard
  // =========================================================================
  console.log('1. Capturing Step 1: Topbar Level Crest & Streak pill on Dashboard...');
  await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const levelWidgetPill = page.locator('[data-testid="topbar-level-pill"]');
  const streakPill = page.locator('header button:has-text("Ngày Streak"), nav button:has-text("Ngày Streak")');

  if (await levelWidgetPill.count() > 0) {
    await addAnnotation(levelWidgetPill, '①');
  }
  if (await streakPill.count() > 0) {
    await addAnnotation(streakPill, '②');
  }

  await page.screenshot({ path: path.join(outDir, 'step-01-topbar-level-widget.png') });
  await clearAnnotations();

  // =========================================================================
  // STEP 2: Level Popover Details
  // =========================================================================
  console.log('2. Capturing Step 2: Topbar Level Popover displaying progress & details...');
  if (await levelWidgetPill.count() > 0) {
    await levelWidgetPill.hover();
    await page.waitForTimeout(300);

    const popover = page.locator('[data-testid="topbar-level-popover"]');
    await popover.waitFor({ state: 'visible', timeout: 5000 });

    const popoverHeader = popover.locator('div.flex.items-center.justify-between.border-b').first();
    const progressSection = popover.locator('div.py-3.space-y-2').first();
    const nextTierBanner = popover.locator('div.p-2\\.5.rounded-xl.bg-\\[\\#fafafa\\]').first();
    const historyBtn = popover.locator('button:has-text("Xem lịch sử")').first();

    if (await popoverHeader.count() > 0) await addAnnotation(popoverHeader, '①');
    if (await progressSection.count() > 0) await addAnnotation(progressSection, '②');
    if (await nextTierBanner.count() > 0) await addAnnotation(nextTierBanner, '③');
    if (await historyBtn.count() > 0) await addAnnotation(historyBtn, '④');

    await page.screenshot({ path: path.join(outDir, 'step-02-level-popover-details.png') });
    await clearAnnotations();
  }

  // Move mouse away to close popover
  await page.mouse.move(0, 0);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // =========================================================================
  // STEP 3: Study Card Floating XP Toast (+10 XP & +50 XP Goal)
  // =========================================================================
  console.log('3. Capturing Step 3: Flashcard Review with Floating XP Badge & Bonus Toast...');
  await page.goto(`${baseUrl}/review`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Flip card 1
  const flipButton = page.locator('button:has-text("Lật thẻ"), button:has-text("Space"), button:has-text("Flip")');
  if (await flipButton.count() > 0) {
    await flipButton.click();
    await page.waitForTimeout(300);

    // Rate card Good
    const goodRatingBtn = page.locator('button:has-text("Good"), button:has-text("Nhớ Tốt"), button:has-text("3")');
    if (await goodRatingBtn.count() > 0) {
      await goodRatingBtn.click();
    }
  }

  // Wait for floating toast
  const floatingToast = page.locator('[data-testid="floating-xp-toast"]');
  await floatingToast.waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForTimeout(300);

  // Freeze toast state so it stays clearly rendered
  await page.evaluate(() => {
    const el = document.querySelector('[data-testid="floating-xp-toast"]');
    if (el) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(-16px) scale(1)';
      el.style.pointerEvents = 'auto';
    }
    const bonus = document.querySelector('[data-testid="floating-xp-bonus-item"]');
    if (bonus) {
      bonus.style.opacity = '1';
      bonus.style.transform = 'scale(1)';
    }
  });

  if (await floatingToast.count() > 0) {
    await addAnnotation(floatingToast, '①');
  }

  const cardElement = page.locator('.perspective-1000, .transform-style-3d').first();
  if (await cardElement.count() > 0) {
    await addAnnotation(cardElement, '②');
  }

  const showAnswerBtn = page.locator('button:has-text("Show Answer"), button:has-text("Xem câu trả lời")').first();
  if (await showAnswerBtn.count() > 0) {
    await addAnnotation(showAnswerBtn, '③');
  }

  await page.screenshot({ path: path.join(outDir, 'step-03-study-floating-xp-toast.png') });
  await clearAnnotations();

  // =========================================================================
  // STEP 4: Level Up Celebration Modal (Gold Tier Promotion Lv. 16)
  // =========================================================================
  console.log('4. Capturing Step 4: Level Up Celebration Modal (Level 16 Gold Tier Promotion)...');
  reviewSubmitResult = {
    cardId: 'card-2',
    status: 'MASTERED',
    interval: 15,
    repetitions: 3,
    easeFactor: 2.6,
    lastReviewedAt: new Date().toISOString(),
    nextReviewDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    streak: currentStreakMock,
    xp: {
      xpEarned: 60,
      breakdown: [
        { type: 'CARD_REVIEW', xp: 10, description: 'Ôn tập thẻ' },
        { type: 'DAILY_GOAL_COMPLETED', xp: 50, description: 'Mục tiêu ngày (+50 XP)!' },
      ],
      levelUp: {
        isLevelUp: true,
        previousLevel: 15,
        currentLevel: 16,
        previousTier: 'SILVER',
        currentTier: 'GOLD',
        isTierPromotion: true,
        totalXp: 5200,
      },
    },
  };

  await page.goto(`${baseUrl}/review`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const flipBtn2 = page.locator('button:has-text("Lật thẻ"), button:has-text("Space"), button:has-text("Flip")');
  if (await flipBtn2.count() > 0) {
    await flipBtn2.click();
    await page.waitForTimeout(300);
    const goodBtn2 = page.locator('button:has-text("Good"), button:has-text("Nhớ Tốt"), button:has-text("3")');
    if (await goodBtn2.count() > 0) {
      await goodBtn2.click();
      await page.waitForTimeout(600);
    }
  }

  const levelUpModal = page.locator('[data-testid="level-up-modal"]');
  await levelUpModal.waitFor({ state: 'visible', timeout: 5000 });

  const promoBadge = levelUpModal.locator('[data-testid="tier-promotion-badge"]');
  const titleArea = levelUpModal.locator('#level-up-title');
  const detailsCard = levelUpModal.locator('.p-3\\.5.rounded-2xl.bg-white\\/5');
  const continueBtn = levelUpModal.locator('button:has-text("Tiếp tục học")');

  if (await promoBadge.count() > 0) await addAnnotation(promoBadge, '①');
  if (await titleArea.count() > 0) await addAnnotation(titleArea, '②');
  if (await detailsCard.count() > 0) await addAnnotation(detailsCard, '③');
  if (await continueBtn.count() > 0) await addAnnotation(continueBtn, '④');

  await page.screenshot({ path: path.join(outDir, 'step-04-level-up-celebration-modal.png') });
  await clearAnnotations();

  // =========================================================================
  // STEP 5: Settings Modal - Tab Cấp độ & XP (XP Activity History Ledger)
  // =========================================================================
  console.log('5. Capturing Step 5: XP Activity History Ledger in Settings Modal...');
  await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Click user profile button in header
  const profileButton = page.locator('header button:has-text("Alex"), header button:has(div:has-text("A")), header button[aria-label*="cài đặt"], header button[aria-label*="hồ sơ"]').first();
  if (await profileButton.count() > 0) {
    await profileButton.click();
    await page.waitForTimeout(400);
  }

  // Click tab "Cấp độ & XP"
  const gamificationTabBtn = page.locator('button:has-text("Cấp độ & XP")');
  if (await gamificationTabBtn.count() > 0) {
    await gamificationTabBtn.click();
    await page.waitForTimeout(400);
  }

  const historyDrawer = page.locator('[data-testid="xp-history-drawer"]');
  await historyDrawer.waitFor({ state: 'visible', timeout: 5000 });

  const summaryBanner = historyDrawer.locator('.rounded-3xl.bg-gradient-to-r').first();
  const filterPills = historyDrawer.locator('.flex.items-center.gap-1\\.5.overflow-x-auto').first();
  const activityList = historyDrawer.locator('[data-testid="xp-activity-list"]').first();

  if (await summaryBanner.count() > 0) await addAnnotation(summaryBanner, '①');
  if (await filterPills.count() > 0) await addAnnotation(filterPills, '②');
  if (await activityList.count() > 0) await addAnnotation(activityList, '③');

  await page.screenshot({ path: path.join(outDir, 'step-05-xp-activity-history-drawer.png') });
  await clearAnnotations();

  console.log('All 5 real annotated screenshots for gamification-xp-levels captured successfully!');
  await browser.close();
  server.close();
}

main().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
