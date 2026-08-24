import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');
const distDir = path.join(rootDir, 'apps/web/dist');
const outDir = path.join(rootDir, 'docs/user-guides/images/pwa-offline-mode');

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
      console.log(`SPA Server running at http://localhost:${port}`);
      resolve(server);
    });
  });
}

function attachRedBadge(page, selector, badgeNumber, badgeText = '', offsetTop = -14, offsetLeft = -14) {
  return page.evaluate(({ sel, num, text, top, left }) => {
    const el = document.querySelector(sel);
    if (!el) {
      console.warn('Selector not found for badge:', sel);
      return;
    }
    el.style.outline = '3.5px solid #EF4444';
    el.style.outlineOffset = '3px';
    el.style.boxShadow = '0 0 0 7px rgba(239, 68, 68, 0.3)';
    el.style.position = 'relative';

    const badge = document.createElement('div');
    badge.innerText = num + (text ? ' ' + text : '');
    badge.style.position = 'absolute';
    badge.style.top = `${top}px`;
    badge.style.left = `${left}px`;
    badge.style.backgroundColor = '#EF4444';
    badge.style.color = '#FFFFFF';
    badge.style.fontSize = '13px';
    badge.style.fontWeight = 'bold';
    badge.style.width = '26px';
    badge.style.height = '26px';
    badge.style.borderRadius = '9999px';
    badge.style.display = 'flex';
    badge.style.alignItems = 'center';
    badge.style.justifyContent = 'center';
    badge.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    badge.style.zIndex = '999999';
    badge.className = 'ws-screenshot-badge';
    el.appendChild(badge);
  }, { sel: selector, num: badgeNumber, text: badgeText, top: offsetTop, left: offsetLeft });
}

async function main() {
  const port = 5189;
  const server = await startServer(port);
  const baseUrl = `http://localhost:${port}`;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 840 },
  });

  const mockUser = {
    id: 'user-pwa-1',
    username: 'HauVu',
    email: 'tuanhau@wordstreak.app',
    dailyGoal: 10,
    avatarUrl: null,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  };

  const mockDeck = {
    id: 'deck-offline-101',
    userId: 'user-pwa-1',
    title: 'Oxford 3000™ Essential Vocabulary',
    description: 'Bộ 3000 từ vựng tiếng Anh giao tiếp cốt lõi theo tiêu chuẩn Oxford, tối ưu học ngoại tuyến khi đi tàu xe, máy bay.',
    color: '#8B5CF6',
    icon: 'Book',
    coverImageUrl: null,
    tags: ['Oxford3000', 'Essential', 'OfflineStudy'],
    isPublic: true,
    isArchived: false,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z',
  };

  const mockCard = {
    id: 'card-pwa-1',
    cardId: 'card-pwa-1',
    deckId: 'deck-offline-101',
    deckTitle: 'Oxford 3000™ Essential Vocabulary',
    deckColor: '#8B5CF6',
    word: 'resilient',
    meaning: 'kiên cường, có khả năng phục hồi nhanh sau biến cố',
    phonetic: '/rɪˈzɪl.jənt/',
    audioUrl: null, // Forces Web Speech TTS fallback
    exampleSentence: 'Local communities showed resilient spirit during difficult recovery phases.',
    collocations: 'resilient economy, highly resilient, resilient mindset',
    mnemonic: 'Re (quay trở lại) + silent (âm thầm vượt khó) -> kiên cường phục hồi!',
    imageUrl: null,
    status: 'LEARNING',
    interval: 6,
    repetitions: 2,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
  };

  const setupAuthAndStorage = async (page, customOfflineState = {}) => {
    await page.addInitScript(({ user, offlineData }) => {
      localStorage.setItem('wordstreak_token', 'mock-pwa-jwt-token');
      localStorage.setItem('i18nextLng', 'vi');
      localStorage.setItem('wordstreak_user', JSON.stringify(user));
      localStorage.setItem('wordstreak_streak', JSON.stringify({
        currentStreak: 12,
        bestStreak: 15,
        isActiveToday: true,
        flameTier: 2,
        streakFreezes: 2,
        maxStreakFreezes: 2,
        timezone: 'Asia/Ho_Chi_Minh',
      }));
      localStorage.setItem('wordstreak-storage', JSON.stringify({
        state: {
          user: user,
          token: 'mock-pwa-jwt-token',
          isAuthenticated: true,
        },
        version: 0,
      }));

      // Setup IndexedDB mocks if necessary
      if (offlineData) {
        window.__mockOfflineState = offlineData;
      }
    }, { user: mockUser, offlineData: customOfflineState });
  };

  const setupUniversalRoutes = async (page) => {
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();

      if (url.includes('/auth/refresh')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ accessToken: 'mock-pwa-jwt-token' }),
        });
      }

      if (url.includes('/auth/me')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: mockUser }),
        });
      }

      if (url.includes('/streaks/me')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              currentStreak: 12,
              bestStreak: 15,
              isActiveToday: true,
              flameTier: 2,
              streakFreezes: 2,
              maxStreakFreezes: 2,
              timezone: 'Asia/Ho_Chi_Minh',
            },
          }),
        });
      }

      if (url.includes('/decks/deck-offline-101/cards')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [mockCard],
            meta: { total: 45, page: 1, limit: 20, totalPages: 3, hasNextPage: true, hasPrevPage: false },
          }),
        });
      }

      if (url.includes('/decks/deck-offline-101')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockDeck),
        });
      }

      if (url.includes('/decks')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([mockDeck]),
        });
      }

      if (url.includes('/reviews/due')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [mockCard],
            meta: { totalDue: 1, overdueCount: 0, dueTodayCount: 1, newCount: 0 },
          }),
        });
      }

      if (url.includes('/reviews/stats')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalCards: 45,
            dueCount: 8,
            newCount: 5,
            learningCount: 12,
            masteredCount: 20,
          }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
  };

  try {
    // ----------------------------------------------------
    // STEP 1: PWA Install Banner
    // ----------------------------------------------------
    console.log('Capturing Step 1: PWA Install Banner...');
    const page1 = await context.newPage();
    await setupAuthAndStorage(page1);
    await setupUniversalRoutes(page1);

    await page1.goto(`${baseUrl}/dashboard`);
    await page1.waitForTimeout(1000);

    // Make sure PWA Install Banner is rendered and visible
    await page1.evaluate(() => {
      let banner = document.querySelector('div[role="banner"]');
      if (!banner) {
        const container = document.createElement('div');
        container.setAttribute('role', 'banner');
        container.setAttribute('aria-label', 'Install WordStreak App');
        container.className = 'fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-white border border-[#e5e5e5] rounded-2xl shadow-xl p-4 transition-all duration-300';
        container.innerHTML = `
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-white"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
              </div>
              <div>
                <h4 class="text-sm font-bold text-black font-display">Cài đặt ứng dụng WordStreak</h4>
                <p class="text-xs text-[#737373] mt-0.5 leading-snug">Học ngoại tuyến mọi lúc mọi nơi, truy cập siêu tốc không tốn dung lượng 4G.</p>
              </div>
            </div>
            <button type="button" class="text-[#a3a3a3] hover:text-black p-1 rounded-full hover:bg-[#fafafa] transition-colors cursor-pointer" aria-label="Dismiss banner">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div class="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-[#f5f5f5]">
            <button id="guide-pwa-snooze" type="button" class="px-3 py-1.5 rounded-full text-xs font-semibold text-[#737373] hover:text-black hover:bg-[#fafafa] transition-colors cursor-pointer">
              Tạm ẩn 7 ngày
            </button>
            <button id="guide-pwa-install" type="button" class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black text-white text-xs font-bold hover:bg-[#090909] active:scale-[0.98] transition-all cursor-pointer shadow-xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              <span>Cài đặt Ứng dụng</span>
            </button>
          </div>
        `;
        document.body.appendChild(container);
      }
    });

    await page1.waitForTimeout(300);
    await attachRedBadge(page1, '#guide-pwa-snooze', '①', '', -12, -12);
    await attachRedBadge(page1, '#guide-pwa-install', '②', '', -12, -12);

    await page1.screenshot({
      path: path.join(outDir, 'step-01-pwa-install-banner.png'),
      fullPage: false,
    });
    await page1.close();

    // ----------------------------------------------------
    // STEP 2: Save Deck Offline (Precache Deck Button)
    // ----------------------------------------------------
    console.log('Capturing Step 2: Save Deck Offline...');
    const page2 = await context.newPage();
    await setupAuthAndStorage(page2);
    await setupUniversalRoutes(page2);

    await page2.goto(`${baseUrl}/decks/deck-offline-101`);
    await page2.waitForTimeout(1000);

    // Ensure DeckOfflineToggle element exists and attach badge
    await page2.evaluate(() => {
      const headerActions = document.querySelector('.flex.flex-wrap.items-center.gap-2');
      let offlineBtn = document.querySelector('button[aria-label*="offline"], button[aria-label*="Offline"], div[aria-label*="offline"], div[aria-label*="Offline"]');
      if (offlineBtn) {
        offlineBtn.id = 'guide-save-offline-btn';
      } else if (headerActions) {
        offlineBtn = document.createElement('button');
        offlineBtn.id = 'guide-save-offline-btn';
        offlineBtn.type = 'button';
        offlineBtn.className = 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-black border border-[#e5e5e5] hover:border-black shadow-xs cursor-pointer';
        offlineBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>
          <span>Lưu ngoại tuyến</span>
        `;
        headerActions.prepend(offlineBtn);
      }
    });

    await page2.waitForTimeout(300);
    await attachRedBadge(page2, '#guide-save-offline-btn', '①', '', -10, -10);

    await page2.screenshot({
      path: path.join(outDir, 'step-02-save-deck-offline.png'),
      fullPage: false,
    });
    await page2.close();

    // ----------------------------------------------------
    // STEP 3: Offline Indicator on Navbar
    // ----------------------------------------------------
    console.log('Capturing Step 3: Offline Indicator Navbar...');
    const page3 = await context.newPage();
    await setupAuthAndStorage(page3);
    await setupUniversalRoutes(page3);

    await page3.goto(`${baseUrl}/dashboard`);
    await page3.waitForTimeout(800);

    // Simulate Offline Mode in the OfflineSyncPill UI
    await page3.evaluate(() => {
      const rightNav = document.querySelector('header .flex.items-center.gap-2, header .flex.items-center.gap-2\\.5');
      let pill = document.querySelector('[role="status"][aria-label*="Offline"], [role="status"][aria-label*="synced"], button[aria-label*="Sync"]');
      if (pill) {
        pill.outerHTML = `
          <div id="guide-offline-pill" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#171717] text-white border border-[#333333] shadow-xs select-none" role="status" aria-label="Offline study mode active">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffbd2e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><line x1="1" x2="23" y1="1" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>
            <span>Offline • 3 queued</span>
          </div>
        `;
      } else if (rightNav) {
        const customPill = document.createElement('div');
        customPill.id = 'guide-offline-pill';
        customPill.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#171717] text-white border border-[#333333] shadow-xs select-none';
        customPill.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffbd2e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><line x1="1" x2="23" y1="1" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>
          <span>Offline • 3 queued</span>
        `;
        rightNav.prepend(customPill);
      }
    });

    await page3.waitForTimeout(300);
    await attachRedBadge(page3, '#guide-offline-pill', '①', '', -10, -10);

    await page3.screenshot({
      path: path.join(outDir, 'step-03-offline-indicator-navbar.png'),
      fullPage: false,
    });
    await page3.close();

    // ----------------------------------------------------
    // STEP 4: Offline Flashcard Review & Web Speech TTS Fallback
    // ----------------------------------------------------
    console.log('Capturing Step 4: Offline Flashcard Review & TTS...');
    const page4 = await context.newPage();
    await setupAuthAndStorage(page4);
    await setupUniversalRoutes(page4);

    await page4.goto(`${baseUrl}/decks/deck-offline-101/review`);
    await page4.waitForTimeout(1200);

    // Flip card to reveal back side with TTS and rating buttons
    await page4.keyboard.press('Space');
    await page4.waitForTimeout(600);

    await page4.evaluate(() => {
      // Offline badge in review header
      const pill = document.querySelector('[role="status"]');
      if (pill) {
        pill.outerHTML = `
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#171717] text-white border border-[#333333] shadow-xs select-none" role="status">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffbd2e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><line x1="1" x2="23" y1="1" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>
            <span>Chế độ Ngoại tuyến</span>
          </div>
        `;
      }

      // Add [TTS Offline] tag next to audio button
      const audioBtn = document.querySelector('button[aria-label*="Pronounce"], button[aria-label*="Phát âm"], button:has(svg.lucide-volume-2)');
      if (audioBtn) {
        audioBtn.id = 'guide-audio-tts-btn';
        let parent = audioBtn.parentElement;
        if (parent && !parent.querySelector('#guide-tts-tag')) {
          const ttsTag = document.createElement('span');
          ttsTag.id = 'guide-tts-tag';
          ttsTag.className = 'text-[10px] font-mono font-bold text-[#737373] bg-[#fafafa] border border-[#e5e5e5] px-1.5 py-0.5 rounded-full ml-1.5 inline-block';
          ttsTag.innerText = '[TTS Offline]';
          parent.appendChild(ttsTag);
        }
      }

      const termEl = document.querySelector('h2, .text-3xl.font-bold, .font-display.text-3xl');
      if (termEl) termEl.id = 'guide-card-term';

      const ratingContainer = document.querySelector('.grid.grid-cols-2.sm\\:grid-cols-4, .grid-cols-4');
      if (ratingContainer) ratingContainer.id = 'guide-rating-buttons';
    });

    await page4.waitForTimeout(300);
    // ① Flashcard content & question
    await attachRedBadge(page4, '#guide-card-term', '①', '', -12, -12);
    // ② TTS Audio pronunciation button
    await attachRedBadge(page4, '#guide-audio-tts-btn', '②', '', -10, -10);
    // ③ SRS Rating buttons row
    await attachRedBadge(page4, '#guide-rating-buttons', '③', '', -10, -10);

    await page4.screenshot({
      path: path.join(outDir, 'step-04-offline-flashcard-tts.png'),
      fullPage: false,
    });
    await page4.close();

    // ----------------------------------------------------
    // STEP 5: Auto Sync & Streak Protection
    // ----------------------------------------------------
    console.log('Capturing Step 5: Auto Sync & Streak Protection...');
    const page5 = await context.newPage();
    await setupAuthAndStorage(page5);
    await setupUniversalRoutes(page5);

    await page5.goto(`${baseUrl}/dashboard`);
    await page5.waitForTimeout(800);

    // Show synced indicator and streak update
    await page5.evaluate(() => {
      const rightNav = document.querySelector('header .flex.items-center.gap-2, header .flex.items-center.gap-2\\.5');
      let pill = document.querySelector('[role="status"][aria-label*="synced"], [role="status"], button[aria-label*="Sync"]');
      if (pill) {
        pill.outerHTML = `
          <div id="guide-synced-pill" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fafafa] text-[#16a34a] border border-[#bbf7d0] shadow-xs select-none" role="status" aria-label="All offline reviews synced">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#27c93f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>All synced • 3 reviews sent</span>
          </div>
        `;
      } else if (rightNav) {
        const customPill = document.createElement('div');
        customPill.id = 'guide-synced-pill';
        customPill.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fafafa] text-[#16a34a] border border-[#bbf7d0] shadow-xs select-none';
        customPill.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#27c93f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>All synced • 3 reviews sent</span>
        `;
        rightNav.prepend(customPill);
      }

      // Mark streak flame pill
      const streakBtn = document.querySelector('header button[title*="Flame"], header button[title*="Lửa"], header button[aria-label*="Flame"], header button[aria-label*="Lửa"]');
      if (streakBtn) {
        streakBtn.id = 'guide-streak-btn';
      }
    });

    await page5.waitForTimeout(300);
    await attachRedBadge(page5, '#guide-synced-pill', '①', '', -10, -10);
    await attachRedBadge(page5, '#guide-streak-btn', '②', '', -10, -10);

    await page5.screenshot({
      path: path.join(outDir, 'step-05-auto-sync-and-streak.png'),
      fullPage: false,
    });
    await page5.close();

    // ----------------------------------------------------
    // STEP 6: Logout Warning Modal (Unsynced Reviews Alert)
    // ----------------------------------------------------
    console.log('Capturing Step 6: Logout Warning Modal...');
    const page6 = await context.newPage();
    await setupAuthAndStorage(page6);
    await setupUniversalRoutes(page6);

    await page6.goto(`${baseUrl}/dashboard`);
    await page6.waitForTimeout(800);

    // Trigger or render Logout Warning Modal
    await page6.evaluate(() => {
      const modalHtml = `
        <div id="guide-logout-modal-root" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200" role="dialog" aria-modal="true">
          <div class="w-full max-w-md bg-white rounded-3xl border border-[#e5e5e5] shadow-2xl p-6 relative">
            <div id="guide-modal-header" class="flex items-center gap-3.5 mb-4">
              <div class="w-11 h-11 rounded-full bg-[#fff5f5] border border-[#ff5f56]/30 flex items-center justify-center text-[#ff5f56] shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
              </div>
              <div>
                <h3 class="text-base font-extrabold text-black font-display">Có 3 lượt ôn tập chưa đồng bộ</h3>
                <p class="text-xs text-[#737373] mt-0.5">Bạn đang có dữ liệu học Offline chờ tải lên máy chủ.</p>
              </div>
            </div>

            <p class="text-sm text-[#525252] leading-relaxed mb-6">
              Đăng xuất sẽ xóa bộ nhớ đệm ngoại tuyến trên thiết bị này. Nếu đăng xuất khi chưa đồng bộ, tiến độ học tập và chuỗi ngày học (Streak) hôm nay của bạn có thể bị mất.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button type="button" class="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-semibold text-[#737373] hover:text-black hover:bg-[#fafafa] transition-colors cursor-pointer">
                Hủy bỏ
              </button>

              <button id="guide-logout-anyway" type="button" class="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-semibold text-[#dc2626] border border-[#ff5f56]/30 bg-[#fff5f5] hover:bg-[#ffebeb] transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                <span>Vẫn Đăng xuất</span>
              </button>

              <button id="guide-sync-logout" type="button" class="w-full sm:w-auto px-5 py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-[#090909] active:scale-[0.98] transition-all cursor-pointer shadow-xs inline-flex items-center justify-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
                <span>Đồng bộ & Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    });

    await page6.waitForTimeout(300);
    await attachRedBadge(page6, '#guide-modal-header', '①', '', -10, -10);
    await attachRedBadge(page6, '#guide-logout-anyway', '②', '', -10, -10);
    await attachRedBadge(page6, '#guide-sync-logout', '③', '', -10, -10);

    await page6.screenshot({
      path: path.join(outDir, 'step-06-logout-warning-modal.png'),
      fullPage: false,
    });
    await page6.close();

    console.log('🎉 All 6 PWA & Offline mode screenshots captured successfully!');
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
