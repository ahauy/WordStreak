import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');
const distDir = path.join(rootDir, 'apps/web/dist');
const outDir = path.join(rootDir, 'docs/user-guides/images/community-decks');

fs.mkdirSync(outDir, { recursive: true });

function startServer(port = 5188) {
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
  const port = 5188;
  const server = await startServer(port);
  const baseUrl = `http://localhost:${port}`;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
  });

  const page = await context.newPage();
  page.on('console', (msg) => console.log('[PAGE CONSOLE]', msg.text()));
  page.on('pageerror', (err) => console.error('[PAGE ERROR]', err));

  const mockPublicDecks = [
    {
      id: 'deck-ielts-1',
      title: 'IELTS Academic Master 1000',
      description: '1000 từ vựng học thuật trọng tâm cho mục tiêu IELTS 7.5+ kèm collocations và phát âm chuẩn.',
      color: '#6366F1',
      icon: 'Book',
      coverImageUrl: null,
      category: 'IELTS',
      tags: ['ielts', 'academic', 'band7+'],
      totalCards: 48,
      cloneCount: 342,
      averageRating: 4.9,
      totalRatings: 86,
      author: {
        id: 'u-1',
        name: 'Thầy Đặng IELTS 8.5',
        username: 'dang_ielts',
        avatarUrl: null,
      },
      createdAt: '2026-08-10T00:00:00Z',
      updatedAt: '2026-08-20T00:00:00Z',
      isOwner: false,
      hasCloned: false,
      userRating: null,
    },
    {
      id: 'deck-toeic-1',
      title: 'TOEIC 900+ Essential Business Vocab',
      description: 'Tuyển tập từ vựng kinh doanh, hợp đồng thương mại và đàm phán thường gặp trong đề thi TOEIC ETS mới nhất.',
      color: '#10B981',
      icon: 'Briefcase',
      coverImageUrl: null,
      category: 'TOEIC',
      tags: ['toeic', 'business', 'ets'],
      totalCards: 60,
      cloneCount: 215,
      averageRating: 4.8,
      totalRatings: 52,
      author: {
        id: 'u-2',
        name: 'Ms. Lan TOEIC',
        username: 'lan_toeic',
        avatarUrl: null,
      },
      createdAt: '2026-08-12T00:00:00Z',
      updatedAt: '2026-08-18T00:00:00Z',
      isOwner: false,
      hasCloned: false,
      userRating: null,
    },
    {
      id: 'deck-daily-1',
      title: 'Daily Conversation Idioms & Slang',
      description: '50 thành ngữ và từ lóng thông dụng giúp bạn nói tiếng Anh tự nhiên như người bản xứ.',
      color: '#F59E0B',
      icon: 'MessageSquare',
      coverImageUrl: null,
      category: 'Daily Conversation',
      tags: ['idioms', 'speaking', 'slang'],
      totalCards: 50,
      cloneCount: 180,
      averageRating: 4.7,
      totalRatings: 41,
      author: {
        id: 'u-3',
        name: 'Alex Native Speaker',
        username: 'alex_talks',
        avatarUrl: null,
      },
      createdAt: '2026-08-15T00:00:00Z',
      updatedAt: '2026-08-21T00:00:00Z',
      isOwner: false,
      hasCloned: false,
      userRating: null,
    },
    {
      id: 'deck-oxford-1',
      title: 'Oxford 3000 Core Vocabulary',
      description: '3000 từ vựng cốt lõi quan trọng nhất của Đại học Oxford, nền tảng bắt buộc cho mọi người học tiếng Anh.',
      color: '#8B5CF6',
      icon: 'GraduationCap',
      coverImageUrl: null,
      category: 'General English',
      tags: ['oxford', 'foundation', 'b1-b2'],
      totalCards: 120,
      cloneCount: 520,
      averageRating: 5.0,
      totalRatings: 130,
      author: {
        id: 'u-4',
        name: 'WordStreak Editorial',
        username: 'wordstreak_official',
        avatarUrl: null,
      },
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-22T00:00:00Z',
      isOwner: false,
      hasCloned: false,
      userRating: null,
    },
  ];

  const mockDeckDetail = {
    ...mockPublicDecks[0],
    cards: [
      {
        id: 'card-1',
        word: 'ubiquitous',
        meaning: 'phổ biến, có mặt ở khắp mọi nơi',
        phonetic: '/juːˈbɪk.wɪ.təs/',
        exampleSentence: 'Smartphones have become ubiquitous in modern society.',
        collocations: 'ubiquitous presence, ubiquitous technology',
        mnemonic: 'U-bi-qui-tous -> Ở đâu cũng thấy',
      },
      {
        id: 'card-2',
        word: 'meticulous',
        meaning: 'tỉ mỉ, cẩn thận từng chi tiết nhỏ',
        phonetic: '/məˈtɪk.jə.ləs/',
        exampleSentence: 'He was meticulous about keeping his financial records.',
        collocations: 'meticulous planning, meticulous attention',
        mnemonic: 'Meticulous giống mê tỉ mỉ',
      },
      {
        id: 'card-3',
        word: 'ephemeral',
        meaning: 'ngắn ngủi, phù du, thoáng qua',
        phonetic: '/ɪˈfem.ər.əl/',
        exampleSentence: 'Fame in the age of viral videos can be ephemeral.',
        collocations: 'ephemeral nature, ephemeral pleasure',
        mnemonic: 'Ê phê mê rồi -> phê chỉ là cảm giác thoáng qua',
      },
      {
        id: 'card-4',
        word: 'resilient',
        meaning: 'kiên cường, nhanh chóng phục hồi sau nghịch cảnh',
        phonetic: '/rɪˈzɪl.jənt/',
        exampleSentence: 'The community was remarkably resilient after the storm.',
        collocations: 'resilient economy, highly resilient',
        mnemonic: 'Re-silent -> bình tĩnh vượt qua bão giông',
      },
      {
        id: 'card-5',
        word: 'pragmatic',
        meaning: 'thực tế, trọng tính thực dụng thay vì lý thuyết',
        phonetic: '/præɡˈmæt.ɪk/',
        exampleSentence: 'We need to adopt a pragmatic approach to solving this issue.',
        collocations: 'pragmatic solution, pragmatic decision',
        mnemonic: 'Pragmatic -> làm việc có ích, thực dụng',
      },
    ],
  };

  // Set mock auth token in context
  await context.addInitScript(() => {
    localStorage.setItem('wordstreak_token', 'mock-jwt-token');
    localStorage.setItem(
      'wordstreak_user',
      JSON.stringify({
        id: 'user-me',
        email: 'learner@wordstreak.com',
        username: 'Alex Learner',
        name: 'Alex Learner',
      })
    );
  });

  // Intercept all network routes
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const resourceType = route.request().resourceType();

    if (
      resourceType === 'document' ||
      resourceType === 'script' ||
      resourceType === 'stylesheet' ||
      resourceType === 'image' ||
      resourceType === 'font' ||
      url.includes('fonts.gstatic.com') ||
      url.includes('fonts.googleapis.com')
    ) {
      return route.continue();
    }

    const headers = {
      'Access-Control-Allow-Origin': 'http://localhost:5188',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    };

    if (method === 'OPTIONS') {
      return route.fulfill({
        status: 204,
        headers,
      });
    }

    if (url.includes('/community/decks/deck-ielts-1/clone') && method === 'POST') {
      return route.fulfill({
        status: 200,
        headers,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          clonedDeckId: 'deck-cloned-new',
          clonedDeckTitle: 'IELTS Academic Master 1000 (Bản sao)',
          totalCardsCloned: 48,
          message: 'Đã sao chép thành công bộ từ vào thư viện cá nhân!',
        }),
      });
    }

    if (url.includes('/community/decks/deck-ielts-1/rate') && method === 'POST') {
      return route.fulfill({
        status: 200,
        headers,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          averageRating: 5.0,
          totalRatings: 87,
          userRating: { rating: 5, comment: 'Bộ từ vựng cực kỳ chất lượng, ví dụ rất sát đề thi thật!' },
          message: 'Đánh giá bộ từ thành công!',
        }),
      });
    }

    if (url.includes('/community/decks/deck-ielts-1')) {
      return route.fulfill({
        status: 200,
        headers,
        contentType: 'application/json',
        body: JSON.stringify(mockDeckDetail),
      });
    }

    if (url.includes('/community/decks')) {
      const searchParams = new URL(url).searchParams;
      const category = searchParams.get('category');
      const search = searchParams.get('search');

      let filtered = [...mockPublicDecks];
      if (category && category !== 'ALL') {
        filtered = filtered.filter((d) => d.category === category);
      }
      if (search) {
        filtered = filtered.filter(
          (d) =>
            d.title.toLowerCase().includes(search.toLowerCase()) ||
            d.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      return route.fulfill({
        status: 200,
        headers,
        contentType: 'application/json',
        body: JSON.stringify({
          items: filtered,
          meta: {
            totalItems: filtered.length,
            itemCount: filtered.length,
            itemsPerPage: 12,
            totalPages: 1,
            currentPage: 1,
          },
        }),
      });
    }

    if (url.includes('/auth/refresh') || url.includes('/auth/login')) {
      return route.fulfill({
        status: 200,
        headers,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-jwt-token' }),
      });
    }

    if (url.includes('/auth/me') || url.includes('/users/me')) {
      return route.fulfill({
        status: 200,
        headers,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-me',
          email: 'learner@wordstreak.com',
          username: 'Alex Learner',
          name: 'Alex Learner',
        }),
      });
    }

    if (url.includes('/gamification/xp/stats') || url.includes('/gamification/xp/summary')) {
      return route.fulfill({
        status: 200,
        headers,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            currentLevel: 5,
            totalXp: 1250,
            levelProgress: 65,
            currentLevelMinXp: 1000,
            nextLevelMinXp: 1500,
            tier: 'SILVER',
            todayXp: 50,
          },
        }),
      });
    }

    if (url.includes('/streaks') || url.includes('/streak')) {
      return route.fulfill({
        status: 200,
        headers,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            currentStreak: 12,
            bestStreak: 15,
            flameTier: 3,
            isActiveToday: true,
            streakIncreased: false,
            message: 'Keep going!',
          },
        }),
      });
    }

    return route.fulfill({
      status: 200,
      headers,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: {} }),
    });
  });

  const addAnnotation = async (locator, badgeNumber) => {
    await locator.first().evaluate((el, num) => {
      el.style.position = 'relative';
      el.style.outline = '3.5px solid #EF4444';
      el.style.boxShadow = '0 0 0 7px rgba(239, 68, 68, 0.3)';
      el.style.borderRadius = el.style.borderRadius || '12px';

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
      badge.style.fontSize = '14px';
      badge.style.fontWeight = 'bold';
      badge.style.fontFamily = 'sans-serif';
      badge.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
      badge.style.zIndex = '99999';
      el.appendChild(badge);
    }, badgeNumber);
  };

  const clearAnnotations = async () => {
    await page.evaluate(() => {
      document.querySelectorAll('.__guide_badge').forEach((b) => b.remove());
      document.querySelectorAll('*').forEach((el) => {
        if (el.style.outline && el.style.outline.includes('rgb(239, 68, 68)')) {
          el.style.outline = '';
          el.style.boxShadow = '';
        }
      });
    });
  };

  console.log('Navigating to Community Marketplace...');
  await page.goto(`${baseUrl}/community`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // -------------------------------------------------------------
  // STEP 1: Marketplace Catalog Overview
  // -------------------------------------------------------------
  console.log('Capturing Step 1: Marketplace Overview...');
  await clearAnnotations();
  const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
  const categoryBar = page.locator('button:has-text("IELTS")');
  const sortSelect = page.locator('select');
  const firstCard = page.locator('div:has-text("IELTS Academic Master 1000")').locator('..').locator('..');

  await addAnnotation(searchInput, '①');
  await addAnnotation(categoryBar, '②');
  await addAnnotation(sortSelect, '③');
  await addAnnotation(firstCard, '④');

  await page.screenshot({
    path: path.join(outDir, 'step-01-marketplace-overview.png'),
    fullPage: false,
  });

  // -------------------------------------------------------------
  // STEP 2: Category Filter & Search
  // -------------------------------------------------------------
  console.log('Capturing Step 2: Category Filter & Search...');
  await clearAnnotations();
  await categoryBar.click();
  await page.waitForTimeout(500);

  const activeIeltsChip = page.locator('button:has-text("IELTS")');
  const ieltsCard = page.locator('h3:has-text("IELTS Academic Master 1000")').locator('..').locator('..').locator('..');

  await addAnnotation(activeIeltsChip, '①');
  await addAnnotation(ieltsCard, '②');

  await page.screenshot({
    path: path.join(outDir, 'step-02-category-search-filter.png'),
    fullPage: false,
  });

  // -------------------------------------------------------------
  // STEP 3: Deck Preview Modal
  // -------------------------------------------------------------
  console.log('Capturing Step 3: Deck Preview Modal...');
  await clearAnnotations();
  const previewBtn = page.locator('button:has-text("Xem trước")').first();
  await previewBtn.click();
  await page.waitForTimeout(600);

  const cardList = page.locator('h4:has-text("Danh sách từ vựng xem trước")').locator('..').locator('..').locator('div.divide-y');
  const speakerBtn = page.locator('button[title="Phát âm thanh"]').first();
  const cloneModalBtn = page.locator('button:has-text("Sao chép vào Bộ từ của tôi")');

  if (await cardList.count() > 0) {
    await addAnnotation(cardList, '①');
  }
  if (await speakerBtn.count() > 0) {
    await addAnnotation(speakerBtn, '②');
  }
  if (await cloneModalBtn.count() > 0) {
    await addAnnotation(cloneModalBtn, '③');
  }

  await page.screenshot({
    path: path.join(outDir, 'step-03-deck-preview-modal.png'),
    fullPage: false,
  });

  // -------------------------------------------------------------
  // STEP 4: 1-Click Clone Action & Success
  // -------------------------------------------------------------
  console.log('Capturing Step 4: Clone Action...');
  await clearAnnotations();
  if (await cloneModalBtn.count() > 0) {
    await cloneModalBtn.click();
    await page.waitForTimeout(600);
  }

  // Close preview modal
  const closePreviewBtn = page.locator('button[title="Đóng"], svg.lucide-x').first();
  if (await closePreviewBtn.count() > 0) {
    await closePreviewBtn.click();
    await page.waitForTimeout(400);
  }

  // Click clone from main page card
  const mainCloneBtn = page.locator('button:has-text("Sao chép")').first();
  if (await mainCloneBtn.count() > 0) {
    await mainCloneBtn.click();
    await page.waitForTimeout(500);
  }

  const alertBox = page.locator('div:has-text("Đã sao chép thành công")').first();
  if (await alertBox.count() > 0) {
    await addAnnotation(alertBox, '①');
  }

  await page.screenshot({
    path: path.join(outDir, 'step-04-clone-success-toast.png'),
    fullPage: false,
  });

  // -------------------------------------------------------------
  // STEP 5: 5-Star Rating Modal
  // -------------------------------------------------------------
  console.log('Capturing Step 5: Rate Deck Modal...');
  await clearAnnotations();

  // Click on star rating button
  const rateStarBtn = page.locator('button[title*="Đánh giá"], button:has(svg.lucide-star)').first();
  if (await rateStarBtn.count() > 0) {
    await rateStarBtn.click();
    await page.waitForTimeout(600);
  }

  const starGroup = page.locator('button:has(svg.lucide-star)').locator('..');
  const commentBox = page.locator('textarea[placeholder*="Chia sẻ cảm nhận"]');
  const submitRateBtn = page.locator('button:has-text("Gửi đánh giá")');

  if (await commentBox.count() > 0) {
    await commentBox.fill('Bộ từ vựng cực kỳ chất lượng, ví dụ rất sát đề thi thật và giọng đọc rất rõ ràng!');
  }

  if (await starGroup.count() > 0) {
    await addAnnotation(starGroup.first(), '①');
  }
  if (await commentBox.count() > 0) {
    await addAnnotation(commentBox, '②');
  }
  if (await submitRateBtn.count() > 0) {
    await addAnnotation(submitRateBtn, '③');
  }

  await page.screenshot({
    path: path.join(outDir, 'step-05-rate-deck-modal.png'),
    fullPage: false,
  });

  console.log('All screenshots captured successfully in docs/user-guides/images/community-decks/');

  await browser.close();
  server.close();
}

main().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
