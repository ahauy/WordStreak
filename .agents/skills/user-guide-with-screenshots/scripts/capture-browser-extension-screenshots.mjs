import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');
const extensionDistDir = path.join(rootDir, 'apps/extension/dist');
const outDir = path.join(rootDir, 'docs/user-guides/images/browser-extension');

fs.mkdirSync(outDir, { recursive: true });

function startStaticServer(port = 5199) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/') reqPath = '/src/popup/index.html';
      const filePath = path.join(extensionDistDir, reqPath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
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
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(port, () => {
      console.log(`Extension static server running on http://localhost:${port}`);
      resolve(server);
    });
  });
}

function attachRedBadge(page, selector, badgeNumber, badgeText = '') {
  return page.evaluate(({ sel, num, text }) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.outline = '3.5px solid #EF4444';
    el.style.outlineOffset = '3px';
    el.style.boxShadow = '0 0 0 7px rgba(239, 68, 68, 0.3)';
    el.style.position = 'relative';

    const badge = document.createElement('div');
    badge.innerText = num + (text ? ' ' + text : '');
    badge.style.position = 'absolute';
    badge.style.top = '-14px';
    badge.style.left = '-14px';
    badge.style.backgroundColor = '#EF4444';
    badge.style.color = '#FFFFFF';
    badge.style.fontSize = '12px';
    badge.style.fontWeight = 'bold';
    badge.style.width = '24px';
    badge.style.height = '24px';
    badge.style.borderRadius = '9999px';
    badge.style.display = 'flex';
    badge.style.alignItems = 'center';
    badge.style.justifyContent = 'center';
    badge.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)';
    badge.style.zIndex = '999999';
    badge.className = 'ws-screenshot-badge';
    el.appendChild(badge);
  }, { sel: selector, num: badgeNumber, text: badgeText });
}

async function main() {
  const port = 5199;
  const server = await startStaticServer(port);
  const browser = await chromium.launch({ headless: true });

  try {
    // ----------------------------------------------------
    // SCREENSHOT 1: Load Unpacked in Chrome / Brave
    // ----------------------------------------------------
    console.log('Capturing Step 1: Load Unpacked & Developer Mode...');
    const page1 = await browser.newPage({ viewport: { width: 1200, height: 700 } });
    await page1.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Extensions - Brave / Chrome</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
          .header { background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; }
          .title { font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
          .dev-mode-toggle { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 14px; }
          .toggle-switch { width: 44px; height: 24px; background: #863bff; border-radius: 9999px; position: relative; cursor: pointer; }
          .toggle-knob { width: 18px; height: 18px; background: #ffffff; border-radius: 9999px; position: absolute; right: 3px; top: 3px; }
          .toolbar { padding: 20px 32px; display: flex; gap: 12px; background: #ffffff; border-bottom: 1px solid #e2e8f0; }
          .btn-unpacked { background: #ffffff; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13.5px; cursor: pointer; display: flex; align-items: center; gap: 8px; color: #0f172a; }
          .content { padding: 32px; max-width: 900px; }
          .extension-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; display: flex; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          .ext-icon { width: 48px; height: 48px; background: #ede6ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
          .ext-info h3 { margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #0f172a; }
          .ext-info p { margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.4; }
          .ext-badge { display: inline-block; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; color: #475569; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Extensions
          </div>
          <div class="dev-mode-toggle" id="dev-mode-box">
            <span>Developer mode</span>
            <div class="toggle-switch"><div class="toggle-knob"></div></div>
          </div>
        </div>
        <div class="toolbar">
          <button class="btn-unpacked" id="load-unpacked-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Load unpacked
          </button>
          <button class="btn-unpacked" style="opacity: 0.6;">Pack extension</button>
          <button class="btn-unpacked" style="opacity: 0.6;">Update</button>
        </div>
        <div class="content">
          <div class="extension-card" id="installed-card">
            <div class="ext-icon">
              <svg width="28" height="28" viewBox="0 0 48 46" fill="none"><path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="#863bff"/></svg>
            </div>
            <div class="ext-info" style="flex: 1;">
              <h3>WordStreak - Quick Vocabulary Capture 1.0.0</h3>
              <p>Tra cứu nhanh nghĩa tiếng Anh, phiên âm IPA và 1-Click lưu từ vựng kèm ngữ cảnh câu vào WordStreak.</p>
              <span class="ext-badge">ID: apps/extension/dist (Manifest V3)</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);

    await attachRedBadge(page1, '#dev-mode-box', '①');
    await attachRedBadge(page1, '#load-unpacked-btn', '②');
    await attachRedBadge(page1, '#installed-card', '③');
    await page1.screenshot({ path: path.join(outDir, 'step-01-load-unpacked.png') });
    await page1.close();

    // ----------------------------------------------------
    // SCREENSHOT 2: In-Page Word Selection & Floating Flame Icon
    // ----------------------------------------------------
    console.log('Capturing Step 2: In-Page Selection & Floating Flame Icon...');
    const page2 = await browser.newPage({ viewport: { width: 1200, height: 700 } });
    await page2.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Economic Insights - Financial Times</title>
        <style>
          body { font-family: 'Georgia', serif; background: #fdfbf7; margin: 0; padding: 40px 0; color: #111827; }
          .article-container { max-width: 720px; margin: 0 auto; background: #ffffff; padding: 48px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); font-size: 18px; line-height: 1.8; }
          .headline { font-size: 32px; font-weight: 700; margin-bottom: 16px; font-family: -apple-system, sans-serif; }
          .meta { font-size: 13px; color: #6b7280; margin-bottom: 24px; font-family: -apple-system, sans-serif; }
          .selected-text { background: #ede6ff; color: #581c87; font-weight: 600; padding: 2px 4px; border-radius: 4px; position: relative; }
          .floating-flame-btn {
            position: absolute;
            top: -46px;
            left: 50%;
            transform: translateX(-50%);
            width: 38px;
            height: 38px;
            background: #ffffff;
            border: 1.5px solid #863bff;
            border-radius: 9999px;
            box-shadow: 0 6px 20px rgba(134, 59, 255, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 1000;
          }
        </style>
      </head>
      <body>
        <div class="article-container">
          <div class="headline">Global Supply Chains and Future Economic Growth</div>
          <div class="meta">By Sarah Jenkins • Published Aug 23, 2026</div>
          <p>In today's interconnected global landscape, businesses face unprecedented challenges ranging from supply chain bottlenecks to fluctuating market demands.</p>
          <p>
            Building long-term 
            <span class="selected-text" id="target-selection">
              resilience
              <div class="floating-flame-btn" id="flame-btn">
                <svg width="22" height="22" viewBox="0 0 48 46" fill="none"><path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="#863bff"/></svg>
              </div>
            </span> 
            is essential for companies aiming to thrive through volatile economic cycles.
          </p>
          <p>Leaders must continuously adapt to modern paradigms and empower their teams with robust technologies.</p>
        </div>
      </body>
      </html>
    `);

    await attachRedBadge(page2, '#target-selection', '①');
    await attachRedBadge(page2, '#flame-btn', '②');
    await page2.screenshot({ path: path.join(outDir, 'step-02-in-page-selection-flame.png') });
    await page2.close();

    // ----------------------------------------------------
    // SCREENSHOT 3: In-Page Rich Toast Card (DESIGN.md specification)
    // ----------------------------------------------------
    console.log('Capturing Step 3: In-Page Rich Toast Notification...');
    const page3 = await browser.newPage({ viewport: { width: 1200, height: 700 } });
    await page3.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Article Reading - WordStreak Rich Toast</title>
        <style>
          body { font-family: 'Georgia', serif; background: #fdfbf7; margin: 0; padding: 40px 0; color: #111827; }
          .article-container { max-width: 720px; margin: 0 auto; background: #ffffff; padding: 48px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); font-size: 18px; line-height: 1.8; }
          .headline { font-size: 32px; font-weight: 700; margin-bottom: 16px; font-family: -apple-system, sans-serif; }
          .meta { font-size: 13px; color: #6b7280; margin-bottom: 24px; font-family: -apple-system, sans-serif; }
          
          /* Rich Toast Card */
          .ws-toast {
            position: fixed;
            bottom: 32px;
            right: 32px;
            display: flex;
            align-items: flex-start;
            gap: 14px;
            padding: 16px 20px;
            background: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 20px;
            box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.14), 0 6px 16px -4px rgba(0, 0, 0, 0.08);
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
            color: #111827;
            z-index: 9999;
            min-width: 360px;
            max-width: 460px;
          }
          .ws-toast-icon-wrap {
            width: 36px;
            height: 36px;
            border-radius: 9999px;
            background: #ede6ff;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .ws-toast-content { flex: 1; min-width: 0; }
          .ws-toast-header { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 4px; }
          .ws-toast-word { font-size: 16px; font-weight: 800; color: #111827; }
          .ws-toast-phonetic { font-family: monospace; font-size: 12.5px; font-weight: 600; color: #863bff; background: #f5f3ff; padding: 1px 6px; border-radius: 6px; }
          .ws-toast-deck-badge { font-size: 11px; font-weight: 600; color: #4b5563; background: #f3f4f6; padding: 2px 8px; border-radius: 9999px; }
          .ws-toast-meaning { font-size: 13.5px; font-weight: 500; color: #374151; line-height: 1.4; }
          .ws-toast-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: 8px; }
          .ws-toast-btn {
            background: #000000;
            color: #ffffff;
            border: none;
            border-radius: 9999px;
            padding: 7px 16px;
            font-size: 12.5px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            white-space: nowrap;
          }
        </style>
      </head>
      <body>
        <div class="article-container">
          <div class="headline">Global Supply Chains and Future Economic Growth</div>
          <div class="meta">By Sarah Jenkins • Published Aug 23, 2026</div>
          <p>Building long-term resilience is essential for companies aiming to thrive through volatile economic cycles.</p>
          <p>Leaders must continuously adapt to modern paradigms and empower their teams with robust technologies.</p>
        </div>
        <div class="ws-toast" id="toast-box">
          <div class="ws-toast-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 48 46" fill="none"><path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="#863bff"/></svg>
          </div>
          <div class="ws-toast-content">
            <div class="ws-toast-header">
              <span class="ws-toast-word">resilience</span>
              <span class="ws-toast-phonetic">/rɪˈzɪl.jəns/</span>
              <span class="ws-toast-deck-badge">📁 50 Từ Vựng TOEIC Hay Gặp Nhất</span>
            </div>
            <div class="ws-toast-meaning">sự kiên cường, khả năng phục hồi</div>
          </div>
          <div class="ws-toast-actions">
            <button class="ws-toast-btn" id="toast-action-btn">Xem thẻ →</button>
          </div>
        </div>
      </body>
      </html>
    `);

    await attachRedBadge(page3, '#toast-box', '①');
    await attachRedBadge(page3, '#toast-action-btn', '②');
    await page3.screenshot({ path: path.join(outDir, 'step-03-in-page-toast-success.png') });
    await page3.close();

    // ----------------------------------------------------
    // SCREENSHOT 4: Extension Popup Window (Authenticated State)
    // ----------------------------------------------------
    console.log('Capturing Step 4: Extension Popup Window (Authenticated)...');
    const page4 = await browser.newPage({ viewport: { width: 400, height: 580 } });
    await page4.goto(`http://localhost:${port}/src/popup/index.html`);
    await page4.waitForLoadState('networkidle');

    // Populate user and captures in localStorage
    await page4.evaluate(() => {
      localStorage.setItem('ws_user', JSON.stringify({
        id: 'u-1',
        username: 'Alex Nguyen',
        email: 'alex.nguyen@wordstreak.app',
      }));
      localStorage.setItem('ws_token', 'mock-token');
      localStorage.setItem('ws_recent_captures', JSON.stringify([
        { id: '1', word: 'swimming', meaning: 'môn bơi lội, sự bơi lội', phonetic: '/ˈswɪmɪŋ/', deckTitle: '50 Từ Vựng TOEIC Hay Gặp Nhất', capturedAt: new Date().toISOString() },
        { id: '2', word: 'vertically', meaning: 'theo chiều dọc, thẳng đứng', phonetic: '/ˈvɜːtɪkli/', deckTitle: '50 Từ Vựng TOEIC Hay Gặp Nhất', capturedAt: new Date().toISOString() },
        { id: '3', word: 'head pointing down', meaning: 'cúi đầu, đầu chúc xuống', phonetic: '/ˈhɛd ˈpɔɪntɪŋ daʊn/', deckTitle: '50 Từ Vựng TOEIC Hay Gặp Nhất', capturedAt: new Date().toISOString() },
      ]));
    });
    await page4.reload();
    await page4.waitForTimeout(400);

    await attachRedBadge(page4, 'select', '①');
    await attachRedBadge(page4, 'form', '②');
    await page4.screenshot({ path: path.join(outDir, 'step-04-popup-deck-selector.png') });
    await page4.close();

    // ----------------------------------------------------
    // SCREENSHOT 5: Extension Options Page
    // ----------------------------------------------------
    console.log('Capturing Step 5: Extension Options Page...');
    const page5 = await browser.newPage({ viewport: { width: 900, height: 750 } });
    await page5.goto(`http://localhost:${port}/src/options/index.html`);
    await page5.waitForLoadState('networkidle');
    await page5.waitForTimeout(300);

    await attachRedBadge(page5, 'label', '①');
    await attachRedBadge(page5, 'form', '②');
    await attachRedBadge(page5, 'button[type="submit"]', '③');
    await page5.screenshot({ path: path.join(outDir, 'step-05-options-settings.png') });
    await page5.close();

    console.log('All screenshots captured successfully!');
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(console.error);
