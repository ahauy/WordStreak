import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');
const distDir = path.join(rootDir, 'apps/web/dist');
const outDir = path.join(rootDir, 'docs/user-guides/images/learning-analytics');

fs.mkdirSync(outDir, { recursive: true });

function startServer(port = 5189) {
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
      console.log(`Analytics SPA Server running at http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function main() {
  const port = 5189;
  const server = await startServer(port);
  const baseUrl = `http://localhost:${port}`;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 860 },
  });

  const page = await context.newPage();

  // Mock Overview Analytics
  const mockOverview = {
    masterySummary: {
      totalCards: 48,
      masteredCount: 26,
      masteredPercentage: 54.2,
      learningCount: 14,
      learningPercentage: 29.2,
      newCount: 8,
      newPercentage: 16.6,
    },
    retentionRate30Days: 91.5,
    totalReviewsLogged: 342,
    currentStreak: 12,
    bestStreak: 25,
  };

  // Mock 365-day Activity Heatmap
  const mockHeatmapDays = [];
  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const dayDate = new Date(now.getTime() - i * 86400000);
    const dateStr = dayDate.toISOString().slice(0, 10);
    let count = 0;
    if (i < 90) {
      count = Math.floor(Math.sin(i * 0.4) * 15 + 10);
      if (count < 0) count = 0;
    } else if (i % 3 === 0) {
      count = Math.floor(Math.random() * 8);
    }
    const level = count === 0 ? 0 : count <= 5 ? 1 : count <= 15 ? 2 : count <= 30 ? 3 : 4;
    mockHeatmapDays.push({ date: dateStr, count, level });
  }

  const mockHeatmap = {
    startDate: mockHeatmapDays[0].date,
    endDate: mockHeatmapDays[mockHeatmapDays.length - 1].date,
    totalReviews: 342,
    activeDaysCount: 118,
    longestDailyReviews: 28,
    days: mockHeatmapDays,
  };

  const mockDecksProgress = [
    {
      deckId: 'deck-1',
      deckTitle: 'IELTS Band 8.0 Core Vocabulary',
      deckColor: '#8B5CF6',
      totalCards: 30,
      masteredCards: 20,
      remainingCards: 10,
      dailyVelocity: 6,
      estimatedDaysToComplete: 2,
      projectedCompletionDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      isCompleted: false,
    },
    {
      deckId: 'deck-2',
      deckTitle: 'Oxford 3000 Essential Words',
      deckColor: '#06B6D4',
      totalCards: 18,
      masteredCards: 6,
      remainingCards: 12,
      dailyVelocity: 4,
      estimatedDaysToComplete: 3,
      projectedCompletionDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      isCompleted: false,
    },
    {
      deckId: 'deck-3',
      deckTitle: 'Daily Phrasal Verbs & Idioms',
      deckColor: '#10B981',
      totalCards: 15,
      masteredCards: 15,
      remainingCards: 0,
      dailyVelocity: 5,
      estimatedDaysToComplete: 0,
      projectedCompletionDate: null,
      isCompleted: true,
    },
  ];

  // Mock API Routes
  await page.route('**/api/**', async (route) => {
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
          data: {
            id: 'user-1',
            username: 'AlexNguyen',
            email: 'alex.nguyen@example.com',
            dailyGoal: 10,
            avatarUrl: null,
            createdAt: '2026-08-01',
            updatedAt: '2026-08-01',
          },
        }),
      });
    }

    if (url.includes('/analytics/overview')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockOverview }),
      });
    }

    if (url.includes('/analytics/activity-heatmap')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockHeatmap }),
      });
    }

    if (url.includes('/analytics/mastery-summary')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockOverview.masterySummary }),
      });
    }

    if (url.includes('/analytics/decks-progress')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockDecksProgress }),
      });
    }

    if (url.includes('/streaks/me') || url.includes('/gamification/streak')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            currentStreak: 12,
            bestStreak: 25,
            isActiveToday: true,
            flameTier: 3,
            streakFreezes: 2,
            maxStreakFreezes: 2,
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
              description: 'Advanced academic vocabulary',
              color: '#8B5CF6',
              totalCards: 30,
              dueCards: 4,
            },
          ],
        }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
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
      badge.style.width = '30px';
      badge.style.height = '30px';
      badge.style.borderRadius = '50%';
      badge.style.backgroundColor = '#EF4444';
      badge.style.color = '#ffffff';
      badge.style.fontSize = '15px';
      badge.style.fontWeight = 'bold';
      badge.style.display = 'flex';
      badge.style.alignItems = 'center';
      badge.style.justifyContent = 'center';
      badge.style.boxShadow = '0 3px 6px rgba(0,0,0,0.35)';
      badge.style.zIndex = '99999';
      badge.style.border = '2.5px solid #ffffff';
      el.appendChild(badge);
    }, badgeNumber);
  };

  const clearAnnotations = async () => {
    await page.evaluate(() => {
      document.querySelectorAll('.__guide_badge').forEach((el) => el.remove());
      document.querySelectorAll('*').forEach((el) => {
        if (el.style.outline && el.style.outline.includes('#EF4444')) {
          el.style.outline = '';
          el.style.boxShadow = '';
        }
      });
    });
  };

  // ==========================================
  // SCREENSHOT 1: Dashboard Overview Widget
  // ==========================================
  console.log('Capturing Step 01: Dashboard Analytics Overview Widget...');
  await page.goto(`${baseUrl}/dashboard`);
  await page.waitForSelector('text=Thống kê học tập & Trí nhớ', { timeout: 10000 });
  await page.waitForTimeout(600);

  const analyticsWidget = page.locator('div:has-text("Thống kê học tập & Trí nhớ")').first();
  const navbarAnalyticsLink = page.locator('header a:has-text("Thống kê")').first();

  await addAnnotation(analyticsWidget, '①');
  await addAnnotation(navbarAnalyticsLink, '②');
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(outDir, 'step-01-dashboard-analytics-widget.png'),
    fullPage: false,
  });
  await clearAnnotations();

  // ==========================================
  // SCREENSHOT 2: Analytics Page - Hero Stats & 365-day Heatmap
  // ==========================================
  console.log('Capturing Step 02: Analytics Hub Hero KPIs and 365-Day Activity Heatmap...');
  await page.goto(`${baseUrl}/analytics`);
  await page.waitForSelector('text=Báo cáo & Thống kê học tập', { timeout: 10000 });
  await page.waitForTimeout(600);

  const heroStats = page.locator('div:has-text("Tỷ lệ nhớ 30 ngày")').first();
  const heatmapSection = page.locator('div:has-text("Bản đồ nhiệt độ hoạt động (365 ngày)")').first();

  await addAnnotation(heroStats, '①');
  await addAnnotation(heatmapSection, '②');
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(outDir, 'step-02-analytics-hero-and-heatmap.png'),
    fullPage: false,
  });
  await clearAnnotations();

  // ==========================================
  // SCREENSHOT 3: Mastery Distribution Breakdown (SM-2 Curve)
  // ==========================================
  console.log('Capturing Step 03: Mastery Distribution Card (Mastered / Learning / New)...');
  const masteryCard = page.locator('div:has-text("Phân bổ mức độ thành thạo từ vựng")').first();
  const masteredBadge = page.locator('div:has-text("Thành thạo")').first();
  const learningBadge = page.locator('div:has-text("Đang học")').first();

  await addAnnotation(masteryCard, '①');
  await addAnnotation(masteredBadge, '②');
  await addAnnotation(learningBadge, '③');
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(outDir, 'step-03-mastery-breakdown-card.png'),
    fullPage: false,
  });
  await clearAnnotations();

  // ==========================================
  // SCREENSHOT 4: Deck Forecast & Progress Table
  // ==========================================
  console.log('Capturing Step 04: Deck Completion Forecast Table...');
  const forecastTable = page.locator('div:has-text("Tiến độ & Dự báo hoàn thành Bộ từ")').first();
  const forecastBadge = page.locator('span:has-text("Dự kiến:")').first();

  await addAnnotation(forecastTable, '①');
  await addAnnotation(forecastBadge, '②');
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(outDir, 'step-04-deck-forecast-table.png'),
    fullPage: false,
  });
  await clearAnnotations();

  console.log('All 4 real screenshots successfully captured with Red Highlights!');

  await browser.close();
  server.close();
}

main().catch((err) => {
  console.error('Error capturing analytics screenshots:', err);
  process.exit(1);
});
