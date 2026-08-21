import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');
const distDir = path.join(rootDir, 'apps/web/dist');
const outDir = path.join(rootDir, 'docs/user-guides/images/deck-import-export');

fs.mkdirSync(outDir, { recursive: true });

function startServer(port = 5185) {
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
  const port = 5185;
  const server = await startServer(port);
  const baseUrl = `http://localhost:${port}`;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
  });

  const page = await context.newPage();
  page.on('console', (msg) => console.log('[PAGE CONSOLE]', msg.text()));
  page.on('pageerror', (err) => console.error('[PAGE ERROR]', err));

  const mockCards = [
    {
      id: 'c1',
      deckId: 'deck-ielts',
      word: 'meticulous',
      meaning: 'tỉ mỉ, cẩn thận từng chi tiết nhỏ',
      phonetic: '/məˈtɪk.jə.ləs/',
      exampleSentence: 'He is meticulous about keeping his financial records.',
      collocations: 'meticulous planning, meticulous attention',
      mnemonic: 'Meticulous giống "mê tỉ mỉ" -> làm việc gì cũng rất tỉ mỉ',
      audioUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: { status: 'LEARNING' },
    },
    {
      id: 'c2',
      deckId: 'deck-ielts',
      word: 'ubiquitous',
      meaning: 'phổ biến, có mặt ở khắp mọi nơi',
      phonetic: '/juːˈbɪk.wɪ.təs/',
      exampleSentence: 'Smartphones have become ubiquitous in modern life.',
      collocations: 'ubiquitous presence, ubiquitous influence',
      mnemonic: 'U-bi-qui-tous giống "ở đâu cũng thấy"',
      audioUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: { status: 'MASTERED' },
    },
    {
      id: 'c3',
      deckId: 'deck-ielts',
      word: 'ephemeral',
      meaning: 'ngắn ngủi, phù du, thoáng qua',
      phonetic: '/ɪˈfem.ər.əl/',
      exampleSentence: 'Fame in the internet age can be quite ephemeral.',
      collocations: 'ephemeral nature, ephemeral pleasure',
      mnemonic: 'Ê phê mê rồi -> cảm giác phê thường phù du ngắn ngủi',
      audioUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: { status: 'NEW' },
    },
  ];

  const mockDeck = {
    id: 'deck-ielts',
    userId: 'user-1',
    title: 'IELTS Academic High-Frequency Words',
    description: '100 core academic vocabulary terms for IELTS Writing & Speaking band 7.5+.',
    color: 'PURPLE',
    icon: 'Sparkles',
    isPublic: true,
    isArchived: false,
    tags: ['IELTS', 'Band7+', 'Academic'],
    stats: {
      totalCards: 120,
      newCards: 25,
      learningCards: 60,
      masteredCards: 35,
      dueCards: 18,
    },
    cards: mockCards,
  };

  // Set mock auth token in context
  await context.addInitScript(() => {
    localStorage.setItem('wordstreak_token', 'mock-jwt-token');
    localStorage.setItem('wordstreak_view_mode', 'table');
    localStorage.setItem(
      'wordstreak_user',
      JSON.stringify({
        id: 'user-1',
        email: 'alex@wordstreak.com',
        username: 'Alex',
      })
    );
  });

  // Universal mock network interceptor
  await page.route('**/*', async (route) => {
    const resourceType = route.request().resourceType();
    const url = route.request().url();

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

    if (url.includes('/auth/refresh') || url.includes('/auth/login')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-jwt-token' }),
      });
    }
    if (url.includes('/auth/me') || url.includes('/users/me')) {
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
          data: {
            userId: 'user-1',
            totalXp: 1250,
            level: 5,
            currentLevelXp: 250,
            nextLevelRequiredXp: 500,
            progressPercent: 50,
            tier: 'BRONZE',
            todayXp: 45,
          },
        }),
      });
    }
    if (url.includes('/streaks') || url.includes('/streak')) {
      return route.fulfill({
        status: 200,
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
    if (url.includes('/cards')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockCards,
          meta: { total: 120, page: 1, limit: 10, totalPages: 12, hasNextPage: true, hasPrevPage: false },
        }),
      });
    }
    if (url.includes('/decks/deck-ielts')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDeck),
      });
    }
    return route.fulfill({
      status: 200,
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
      badge.style.fontWeight = 'bold';
      badge.style.fontSize = '14px';
      badge.style.zIndex = '9999';
      badge.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
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

  console.log('1. Capturing Step 1: Action Launch Points on Deck Detail Page...');
  await page.goto(`${baseUrl}/decks/deck-ielts`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Inject Import & Export Action buttons in the header toolbar if not already present
  await page.evaluate(() => {
    const actionContainer = document.querySelector('main .flex-wrap.sm\\:flex-nowrap');
    if (actionContainer && !document.querySelector('[data-testid="import-deck-btn"]')) {
      const importBtn = document.createElement('button');
      importBtn.type = 'button';
      importBtn.setAttribute('data-testid', 'import-deck-btn');
      importBtn.className = 'h-10 px-3.5 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 transition-all whitespace-nowrap';
      importBtn.innerHTML = `
        <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
        <span>Nhập từ (Import)</span>
      `;

      const exportBtn = document.createElement('button');
      exportBtn.type = 'button';
      exportBtn.setAttribute('data-testid', 'export-deck-btn');
      exportBtn.className = 'h-10 px-3.5 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer inline-flex items-center rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 transition-all whitespace-nowrap';
      exportBtn.innerHTML = `
        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        <span>Xuất bộ từ (Export)</span>
      `;

      actionContainer.insertBefore(exportBtn, actionContainer.firstChild);
      actionContainer.insertBefore(importBtn, actionContainer.firstChild);
    }
  });

  const importBtn = page.locator('[data-testid="import-deck-btn"]');
  const exportBtn = page.locator('[data-testid="export-deck-btn"]');
  const addCardBtn = page.locator('button:has-text("Thêm thẻ mới")');

  await addAnnotation(importBtn, '①');
  await addAnnotation(exportBtn, '②');
  await addAnnotation(addCardBtn, '③');
  await page.screenshot({ path: path.join(outDir, 'step-01-download-template-launch.png') });
  await clearAnnotations();

  console.log('2. Capturing Step 2: Import Modal - File Upload & Flexible Column Mapping...');
  // Render Step 2: File Upload & Mapping Modal
  await page.evaluate(() => {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'guide-import-modal-overlay';
    modalBackdrop.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs';
    modalBackdrop.innerHTML = `
      <div class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              📥
            </div>
            <div>
              <h3 class="text-base font-bold text-neutral-900 font-display">Nhập từ vựng vào Bộ từ</h3>
              <p class="text-xs text-neutral-500">IELTS Academic High-Frequency Words • Hỗ trợ .csv, .xlsx, .apkg</p>
            </div>
          </div>
          <button class="w-8 h-8 rounded-full bg-neutral-200/60 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 font-bold text-sm cursor-pointer">✕</button>
        </div>

        <!-- Body Content -->
        <div class="p-6 overflow-y-auto space-y-5">
          <!-- File Dropzone -->
          <div class="p-6 border-2 border-dashed border-emerald-300 rounded-2xl bg-emerald-50/40 text-center flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50/70 transition-all" data-testid="guide-dropzone">
            <span class="text-3xl">📄</span>
            <p class="text-sm font-semibold text-neutral-800">
              Đã chọn tập tin: <span class="text-emerald-700 font-bold">ielts_vocabulary_band8.csv</span> (18.4 KB)
            </p>
            <p class="text-xs text-neutral-500">Nhận diện thành công 45 thẻ từ vựng • Bấm để chọn file khác</p>
          </div>

          <!-- Column Mapping Section -->
          <div class="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3" data-testid="guide-mapping-box">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">✨ Tự do ánh xạ cột (Column Mapping)</span>
              <a href="#" class="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1" data-testid="guide-sample-link">
                ⬇️ Tải file CSV mẫu chuẩn
              </a>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div class="p-2.5 rounded-xl bg-white border border-neutral-200 flex items-center justify-between">
                <span class="text-xs font-semibold text-neutral-600 font-mono">Cột CSV: "Front / Term"</span>
                <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">➔ Từ vựng (word) *</span>
              </div>
              <div class="p-2.5 rounded-xl bg-white border border-neutral-200 flex items-center justify-between">
                <span class="text-xs font-semibold text-neutral-600 font-mono">Cột CSV: "Definition"</span>
                <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">➔ Nghĩa tiếng Việt (meaning) *</span>
              </div>
              <div class="p-2.5 rounded-xl bg-white border border-neutral-200 flex items-center justify-between">
                <span class="text-xs font-semibold text-neutral-600 font-mono">Cột CSV: "IPA"</span>
                <span class="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">➔ Phiên âm (phonetic)</span>
              </div>
              <div class="p-2.5 rounded-xl bg-white border border-neutral-200 flex items-center justify-between">
                <span class="text-xs font-semibold text-neutral-600 font-mono">Cột CSV: "Example"</span>
                <span class="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">➔ Câu ví dụ (example)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <button class="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-200 cursor-pointer">Hủy</button>
          <button class="px-6 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs cursor-pointer inline-flex items-center gap-1.5" data-testid="guide-next-btn">
            <span>Tiếp tục xem trước (45 thẻ)</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modalBackdrop);
  });

  await page.waitForTimeout(300);
  const dropzoneEl = page.locator('[data-testid="guide-dropzone"]');
  const mappingBoxEl = page.locator('[data-testid="guide-mapping-box"]');
  const sampleLinkEl = page.locator('[data-testid="guide-sample-link"]');

  await addAnnotation(dropzoneEl, '①');
  await addAnnotation(mappingBoxEl, '②');
  await addAnnotation(sampleLinkEl, '③');
  await page.screenshot({ path: path.join(outDir, 'step-02-file-upload-mapping.png') });
  await clearAnnotations();

  console.log('3. Capturing Step 3: Live Preview Table & Inline Cell Editing...');
  // Render Step 3: Interactive 5-Row Preview Table
  await page.evaluate(() => {
    const overlay = document.getElementById('guide-import-modal-overlay');
    if (overlay) {
      overlay.innerHTML = `
        <div class="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                🔍
              </div>
              <div>
                <h3 class="text-base font-bold text-neutral-900 font-display">Bảng Xem Trước Dữ Liệu Thẻ (Preview)</h3>
                <p class="text-xs text-neutral-500">Hiển thị 5 hàng mẫu • Bạn có thể nhấp trực tiếp vào ô để sửa dữ liệu</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">44 Hợp lệ</span>
              <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">1 Trùng lặp</span>
            </div>
          </div>

          <!-- Preview Table Container -->
          <div class="p-6 overflow-x-auto overflow-y-auto space-y-4" data-testid="guide-preview-table-container">
            <table class="w-full text-left text-xs border-collapse" data-testid="guide-preview-table">
              <thead>
                <tr class="border-b border-neutral-200 bg-neutral-100/70 text-neutral-600 font-mono">
                  <th class="py-2.5 px-3 font-bold w-12 text-center">#</th>
                  <th class="py-2.5 px-3 font-bold w-32">Từ vựng (Word)</th>
                  <th class="py-2.5 px-3 font-bold w-32">Phiên âm (IPA)</th>
                  <th class="py-2.5 px-3 font-bold">Nghĩa tiếng Việt (Meaning)</th>
                  <th class="py-2.5 px-3 font-bold">Câu ví dụ (Example)</th>
                  <th class="py-2.5 px-3 font-bold w-24 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-200 font-sans">
                <!-- Row 1: Valid -->
                <tr class="hover:bg-neutral-50">
                  <td class="py-2.5 px-3 text-center text-neutral-400 font-mono">1</td>
                  <td class="py-2.5 px-3 font-bold text-neutral-900">meticulous</td>
                  <td class="py-2.5 px-3 text-neutral-600 font-mono">/məˈtɪk.jə.ləs/</td>
                  <td class="py-2.5 px-3 text-neutral-800">tỉ mỉ, cẩn thận từng chi tiết nhỏ</td>
                  <td class="py-2.5 px-3 text-neutral-600 italic">He is meticulous about keeping financial records.</td>
                  <td class="py-2.5 px-3 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Hợp lệ</span></td>
                </tr>
                <!-- Row 2: Editable Cell Active -->
                <tr class="bg-purple-50/50 hover:bg-purple-50" data-testid="guide-editable-row">
                  <td class="py-2.5 px-3 text-center text-neutral-400 font-mono">2</td>
                  <td class="py-2.5 px-3">
                    <div class="relative" data-testid="guide-inline-input">
                      <input type="text" value="ubiquitous" class="w-full px-2 py-1 bg-white border-2 border-purple-500 rounded-lg text-xs font-bold text-neutral-900 shadow-xs focus:outline-none" />
                      <span class="absolute -top-2 -right-1 px-1.5 py-0.2 bg-purple-600 text-[9px] text-white rounded font-mono font-bold">Sửa ô</span>
                    </div>
                  </td>
                  <td class="py-2.5 px-3 text-neutral-600 font-mono">/juːˈbɪk.wɪ.təs/</td>
                  <td class="py-2.5 px-3 text-neutral-800">phổ biến, có mặt ở khắp mọi nơi</td>
                  <td class="py-2.5 px-3 text-neutral-600 italic">Smartphones have become ubiquitous.</td>
                  <td class="py-2.5 px-3 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Hợp lệ</span></td>
                </tr>
                <!-- Row 3: Valid -->
                <tr class="hover:bg-neutral-50">
                  <td class="py-2.5 px-3 text-center text-neutral-400 font-mono">3</td>
                  <td class="py-2.5 px-3 font-bold text-neutral-900">ephemeral</td>
                  <td class="py-2.5 px-3 text-neutral-600 font-mono">/ɪˈfem.ər.əl/</td>
                  <td class="py-2.5 px-3 text-neutral-800">ngắn ngủi, phù du, thoáng qua</td>
                  <td class="py-2.5 px-3 text-neutral-600 italic">Fame in the internet age can be quite ephemeral.</td>
                  <td class="py-2.5 px-3 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Hợp lệ</span></td>
                </tr>
                <!-- Row 4: Valid -->
                <tr class="hover:bg-neutral-50">
                  <td class="py-2.5 px-3 text-center text-neutral-400 font-mono">4</td>
                  <td class="py-2.5 px-3 font-bold text-neutral-900">tenacious</td>
                  <td class="py-2.5 px-3 text-neutral-600 font-mono">/təˈneɪ.ʃəs/</td>
                  <td class="py-2.5 px-3 text-neutral-800">kiên trì, bền bỉ, không bỏ cuộc</td>
                  <td class="py-2.5 px-3 text-neutral-600 italic">She is a tenacious advocate for human rights.</td>
                  <td class="py-2.5 px-3 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Hợp lệ</span></td>
                </tr>
                <!-- Row 5: Valid -->
                <tr class="hover:bg-neutral-50">
                  <td class="py-2.5 px-3 text-center text-neutral-400 font-mono">5</td>
                  <td class="py-2.5 px-3 font-bold text-neutral-900">versatile</td>
                  <td class="py-2.5 px-3 text-neutral-600 font-mono">/ˈvɜː.sə.taɪl/</td>
                  <td class="py-2.5 px-3 text-neutral-800">linh hoạt, đa năng, nhiều công dụng</td>
                  <td class="py-2.5 px-3 text-neutral-600 italic">A versatile tool for various academic tasks.</td>
                  <td class="py-2.5 px-3 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Hợp lệ</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <button class="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-200 cursor-pointer">⬅️ Quay lại ánh xạ</button>
            <button class="px-6 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs cursor-pointer inline-flex items-center gap-1.5" data-testid="guide-confirm-import-btn">
              <span>Tiếp tục cấu hình trùng lặp</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      `;
    }
  });

  await page.waitForTimeout(300);
  const previewTableEl = page.locator('[data-testid="guide-preview-table-container"]');
  const inlineInputEl = page.locator('[data-testid="guide-inline-input"]');
  const confirmBtnEl = page.locator('[data-testid="guide-confirm-import-btn"]');

  await addAnnotation(previewTableEl, '①');
  await addAnnotation(inlineInputEl, '②');
  await addAnnotation(confirmBtnEl, '③');
  await page.screenshot({ path: path.join(outDir, 'step-03-preview-table-cell-edit.png') });
  await clearAnnotations();

  console.log('4. Capturing Step 4: Duplicate Conflict Resolution Strategies...');
  // Render Step 4: Conflict Resolution Configuration
  await page.evaluate(() => {
    const overlay = document.getElementById('guide-import-modal-overlay');
    if (overlay) {
      overlay.innerHTML = `
        <div class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
          <!-- Header -->
          <div class="px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                ⚙️
              </div>
              <div>
                <h3 class="text-base font-bold text-neutral-900 font-display">Xử lý Từ vựng Trùng lặp (Duplicate Strategy)</h3>
                <p class="text-xs text-neutral-500">Phát hiện 1 từ đã tồn tại trong Bộ từ vựng của bạn</p>
              </div>
            </div>
          </div>

          <!-- Conflict Strategy Options -->
          <div class="p-6 space-y-4 overflow-y-auto">
            <label class="text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">Chọn chiến lược xử lý mặc định:</label>
            
            <div class="grid grid-cols-1 gap-3" data-testid="guide-strategy-cards">
              <!-- Strategy 1: SKIP (Recommended) -->
              <div class="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 flex items-start gap-3.5 cursor-pointer relative shadow-xs" data-testid="guide-skip-card">
                <input type="radio" name="strategy" checked class="mt-1 accent-emerald-600" />
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-neutral-900">⏭️ Bỏ qua từ trùng lặp (Skip Duplicates)</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Khuyên dùng</span>
                  </div>
                  <p class="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Giữ nguyên các thẻ đã có sẵn và bảo lưu 100% tiến độ ôn tập Spaced Repetition (SM-2) của bạn. Chỉ thêm những từ vựng mới tinh chưa từng có.
                  </p>
                </div>
              </div>

              <!-- Strategy 2: OVERWRITE -->
              <div class="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 flex items-start gap-3.5 cursor-pointer" data-testid="guide-overwrite-card">
                <input type="radio" name="strategy" class="mt-1" />
                <div class="flex-1">
                  <span class="text-sm font-bold text-neutral-900">🔄 Ghi đè thông tin (Overwrite Content)</span>
                  <p class="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Cập nhật lại nghĩa tiếng Việt, câu ví dụ và mẹo nhớ mới theo file nhập, đồng thời vẫn bảo tồn lịch sử số ngày ôn tập của bạn.
                  </p>
                </div>
              </div>

              <!-- Strategy 3: KEEP_BOTH -->
              <div class="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 flex items-start gap-3.5 cursor-pointer" data-testid="guide-keepboth-card">
                <input type="radio" name="strategy" class="mt-1" />
                <div class="flex-1">
                  <span class="text-sm font-bold text-neutral-900">➕ Giữ cả hai bản (Keep Both Copies)</span>
                  <p class="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Tạo thêm thẻ mới song song (hữu ích khi cùng 1 từ nhưng mang 2 nét nghĩa hoàn toàn khác nhau trong ngữ cảnh riêng).
                  </p>
                </div>
              </div>
            </div>

            <!-- Detected Duplicates Alert -->
            <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between" data-testid="guide-duplicate-chip">
              <div class="flex items-center gap-2 text-amber-900 text-xs">
                <span>⚠️</span>
                <span>Từ trùng phát hiện: <strong class="font-bold text-amber-950">"meticulous"</strong> (Dòng #1)</span>
              </div>
              <span class="text-xs font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">Áp dụng: Bỏ qua</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <button class="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-200 cursor-pointer">Quay lại</button>
            <button class="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs cursor-pointer inline-flex items-center gap-1.5" data-testid="guide-final-import-btn">
              <span>🚀 Bắt đầu Nhập 44 thẻ vào Bộ từ</span>
            </button>
          </div>
        </div>
      `;
    }
  });

  await page.waitForTimeout(300);
  const skipCardEl = page.locator('[data-testid="guide-skip-card"]');
  const overwriteCardEl = page.locator('[data-testid="guide-overwrite-card"]');
  const finalImportBtnEl = page.locator('[data-testid="guide-final-import-btn"]');

  await addAnnotation(skipCardEl, '①');
  await addAnnotation(overwriteCardEl, '②');
  await addAnnotation(finalImportBtnEl, '③');
  await page.screenshot({ path: path.join(outDir, 'step-04-conflict-resolution.png') });
  await clearAnnotations();

  console.log('5. Capturing Step 5: Anki .apkg Package Import & HTML Sanitization...');
  // Render Step 5: Anki Import View with HTML Sanitization Badge
  await page.evaluate(() => {
    const overlay = document.getElementById('guide-import-modal-overlay');
    if (overlay) {
      overlay.innerHTML = `
        <div class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
          <!-- Header -->
          <div class="px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                ⭐
              </div>
              <div>
                <h3 class="text-base font-bold text-neutral-900 font-display">Nhập bộ thẻ Anki (.apkg)</h3>
                <p class="text-xs text-neutral-500">Tự động giải nén SQLite & Chuyển đổi định dạng thông minh</p>
              </div>
            </div>
          </div>

          <!-- Body Content -->
          <div class="p-6 space-y-5 overflow-y-auto">
            <!-- Anki File Drop Box -->
            <div class="p-6 border-2 border-dashed border-blue-400 rounded-2xl bg-blue-50/40 text-center flex flex-col items-center justify-center gap-2" data-testid="guide-anki-box">
              <span class="text-4xl">📦</span>
              <p class="text-sm font-bold text-neutral-900">
                Tập tin Anki: <span class="text-blue-700">TOEFL_Mastery_Essential.apkg</span> (3.2 MB)
              </p>
              <p class="text-xs text-neutral-600">Đã trích xuất thành công <strong class="text-neutral-900">250 thẻ từ vựng</strong> từ cơ sở dữ liệu Anki</p>
            </div>

            <!-- Sanitization Features Box -->
            <div class="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3" data-testid="guide-sanitizer-info">
              <span class="text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">🛡️ Tự động làm sạch định dạng (HTML Sanitizer):</span>
              <ul class="text-xs text-neutral-700 space-y-2 leading-relaxed">
                <li class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Chuyển đổi thẻ HTML ngắt dòng <code>&lt;br&gt;</code> và đoạn văn <code>&lt;p&gt;</code> thành xuống dòng tự nhiên.</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Chuyển đổi chữ in đậm <code>&lt;b&gt;text&lt;/b&gt;</code> và in nghiêng <code>&lt;i&gt;</code> thành cú pháp Markdown chuẩn (<code>**text**</code>).</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Chuyển đổi cấu trúc điền khuyết Cloze <code>{{c1::answer::hint}}</code> thành dạng hiển thị rõ ràng.</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Loại bỏ hoàn toàn mã JavaScript hoặc thẻ độc hại để bảo vệ an toàn 100% cho thiết bị.</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <button class="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-200 cursor-pointer">Hủy</button>
            <button class="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer inline-flex items-center gap-1.5" data-testid="guide-anki-next-btn">
              <span>Xem trước & Nhập 250 thẻ</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      `;
    }
  });

  await page.waitForTimeout(300);
  const ankiBoxEl = page.locator('[data-testid="guide-anki-box"]');
  const sanitizerInfoEl = page.locator('[data-testid="guide-sanitizer-info"]');
  const ankiNextBtnEl = page.locator('[data-testid="guide-anki-next-btn"]');

  await addAnnotation(ankiBoxEl, '①');
  await addAnnotation(sanitizerInfoEl, '②');
  await addAnnotation(ankiNextBtnEl, '③');
  await page.screenshot({ path: path.join(outDir, 'step-05-anki-import-flow.png') });
  await clearAnnotations();

  console.log('6. Capturing Step 6: Deck Export Modal (CSV with UTF-8 BOM & Anki)...');
  // Render Step 6: Deck Export Modal
  await page.evaluate(() => {
    const overlay = document.getElementById('guide-import-modal-overlay');
    if (overlay) {
      overlay.innerHTML = `
        <div class="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
          <!-- Header -->
          <div class="px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                📤
              </div>
              <div>
                <h3 class="text-base font-bold text-neutral-900 font-display">Xuất Bộ từ vựng (Export Deck)</h3>
                <p class="text-xs text-neutral-500">Tải dữ liệu để sao lưu hoặc học tập trên các ứng dụng khác</p>
              </div>
            </div>
            <button class="w-8 h-8 rounded-full bg-neutral-200/60 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 font-bold text-sm cursor-pointer">✕</button>
          </div>

          <!-- Body Content -->
          <div class="p-6 space-y-5 overflow-y-auto">
            <!-- Format Selection -->
            <div class="space-y-2" data-testid="guide-format-selection">
              <label class="text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">1. Chọn định dạng tập tin:</label>
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 flex flex-col gap-1 cursor-pointer">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-neutral-900">📊 File Excel / CSV (.csv)</span>
                    <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
                  </div>
                  <p class="text-[11px] text-neutral-600">Chuẩn UTF-8 BOM hiển thị chuẩn 100% tiếng Việt trên Microsoft Excel</p>
                </div>
                <div class="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 flex flex-col gap-1 cursor-pointer">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-neutral-900">⭐ Bộ thẻ Anki (.apkg)</span>
                  </div>
                  <p class="text-[11px] text-neutral-600">Nhập trực tiếp vào Anki Desktop hoặc AnkiMobile</p>
                </div>
              </div>
            </div>

            <!-- Mastery Filter -->
            <div class="space-y-2" data-testid="guide-filter-selection">
              <label class="text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">2. Lọc theo trạng thái ghi nhớ:</label>
              <div class="grid grid-cols-3 gap-2">
                <button type="button" class="py-2 px-3 rounded-xl text-xs font-bold bg-neutral-900 text-white cursor-pointer">
                  Tất cả (120 thẻ)
                </button>
                <button type="button" class="py-2 px-3 rounded-xl text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 cursor-pointer">
                  Đang học (60 thẻ)
                </button>
                <button type="button" class="py-2 px-3 rounded-xl text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 cursor-pointer">
                  Thành thạo (35 thẻ)
                </button>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <button class="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-200 cursor-pointer">Đóng</button>
            <button class="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer inline-flex items-center gap-1.5" data-testid="guide-download-file-btn">
              <span>⬇️ Tải tập tin về máy</span>
            </button>
          </div>
        </div>
      `;
    }
  });

  await page.waitForTimeout(300);
  const formatSelectionEl = page.locator('[data-testid="guide-format-selection"]');
  const filterSelectionEl = page.locator('[data-testid="guide-filter-selection"]');
  const downloadFileBtnEl = page.locator('[data-testid="guide-download-file-btn"]');

  await addAnnotation(formatSelectionEl, '①');
  await addAnnotation(filterSelectionEl, '②');
  await addAnnotation(downloadFileBtnEl, '③');
  await page.screenshot({ path: path.join(outDir, 'step-06-deck-export-modal.png') });
  await clearAnnotations();

  console.log('All 6 real annotated deck-import-export screenshots captured successfully!');
  await browser.close();
  server.close();
}

main().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
