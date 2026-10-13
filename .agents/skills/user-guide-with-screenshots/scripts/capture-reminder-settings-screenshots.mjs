import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');
const outDir = path.join(rootDir, 'docs/user-guides/images/extension-reminder-settings');

fs.mkdirSync(outDir, { recursive: true });

function attachRedBadge(page, selector, badgeNumber, badgeText = '') {
  return page.evaluate(({ sel, num, text }) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.outline = '3.5px solid #EF4444';
    el.style.outlineOffset = '4px';
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

const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #fafafa;
    color: #111827;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding: 32px 16px;
  }
  .options-wrapper {
    width: 100%;
    max-width: 680px;
    background: #ffffff;
    border-radius: 24px;
    border: 1px solid #e5e5e5;
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 20px;
    border-bottom: 1px solid #f3f4f6;
    margin-bottom: 28px;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .title {
    font-size: 20px;
    font-weight: 800;
    font-family: 'Nunito', sans-serif;
    color: #111827;
  }
  .subtitle {
    font-size: 13px;
    color: #6b7280;
    margin-top: 2px;
  }
  .section-title {
    font-size: 15px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background-color: #fbfbfb;
    border-radius: 16px;
    border: 1px solid #e5e5e5;
    cursor: pointer;
    margin-bottom: 10px;
  }
  .toggle-row-title {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
  }
  .toggle-row-sub {
    font-size: 12.5px;
    color: #6b7280;
    margin-top: 4px;
  }
  .ws-checkbox {
    width: 18px;
    height: 18px;
    accent-color: #863bff;
    cursor: pointer;
  }
  .child-box {
    margin-top: 12px;
    padding: 16px;
    background-color: #fbfbfb;
    border-radius: 16px;
    border: 1px solid #e5e5e5;
    transition: opacity 0.2s ease;
  }
  .field-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .time-input {
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid #e5e5e5;
    font-size: 13px;
    background: #ffffff;
    font-family: inherit;
    color: #111827;
  }
  .footer-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid #f3f4f6;
  }
  .btn-save {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #000000;
    color: #ffffff;
    border: none;
    border-radius: 9999px;
    padding: 10px 24px;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  .save-status {
    font-size: 13px;
    color: #047857;
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
  }
  .visual-preview-strip {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    margin-bottom: 24px;
  }
  .preview-label {
    font-size: 12.5px;
    font-weight: 600;
    color: #475569;
  }
  .preview-badge-pair {
    display: flex;
    gap: 20px;
    align-items: center;
  }
  .preview-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #64748b;
  }
  .mini-icon-frame {
    width: 28px;
    height: 28px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .mini-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #863bff;
    color: #ffffff;
    font-size: 9px;
    font-weight: 700;
    padding: 1px 4px;
    border-radius: 9999px;
  }
  .mini-badge.red {
    background: #ef4444;
  }
`;

const flameSvg = `
  <svg width="32" height="32" viewBox="0 0 48 46" fill="none">
    <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="#863bff"/>
  </svg>
`;

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--single-process', '--no-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1040, height: 600 } });

    // ----------------------------------------------------
    // SCREENSHOT 1: How to open Options Page (Popup & Context Menu)
    // ----------------------------------------------------
    console.log('Generating Step 1: Open Options Page...');
    await page.setViewportSize({ width: 1040, height: 600 });
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WordStreak - Mở trang Cài đặt</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f1f5f9;
            color: #0f172a;
            padding: 30px;
          }
          .browser-window {
            background: #ffffff;
            border-radius: 14px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.12);
            overflow: hidden;
            border: 1px solid #cbd5e1;
          }
          .browser-nav {
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            padding: 10px 16px;
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .window-dots { display: flex; gap: 6px; }
          .dot { width: 11px; height: 11px; border-radius: 50%; }
          .dot.red { background: #ef4444; }
          .dot.yellow { background: #f59e0b; }
          .dot.green { background: #10b981; }
          .url-bar {
            flex: 1;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 6px 14px;
            font-size: 13px;
            color: #475569;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .toolbar-actions { display: flex; align-items: center; gap: 10px; }
          .ext-icon-btn {
            position: relative;
            background: #ede6ff;
            border: 1px solid #c4b5fd;
            border-radius: 8px;
            padding: 6px 8px;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .badge-num {
            background: #863bff;
            color: #ffffff;
            font-size: 10px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 9999px;
          }
          .canvas-area {
            position: relative;
            height: 460px;
            background: #f8fafc;
            display: flex;
            gap: 40px;
            padding: 24px 40px;
            align-items: flex-start;
          }
          .popup-demo {
            width: 360px;
            background: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 18px;
            box-shadow: 0 12px 28px rgba(0,0,0,0.08);
            padding: 20px;
          }
          .popup-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 12px;
            border-bottom: 1px solid #f1f5f9;
            margin-bottom: 16px;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 800;
            font-size: 16px;
            color: #111827;
          }
          .gear-btn {
            background: #f3f4f6;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            width: 34px;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #4b5563;
          }
          .auth-box {
            background: #faf5ff;
            border: 1px solid #e9d5ff;
            border-radius: 12px;
            padding: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .auth-user { font-size: 13px; font-weight: 600; color: #581c87; }
          .auth-status { font-size: 11px; color: #7e22ce; }
          .context-menu-demo {
            width: 250px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            box-shadow: 0 12px 30px rgba(0,0,0,0.12);
            padding: 6px;
          }
          .menu-title {
            font-size: 11px;
            font-weight: 700;
            color: #94a3b8;
            padding: 6px 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .menu-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 10px;
            border-radius: 8px;
            font-size: 13px;
            color: #1e293b;
          }
          .menu-item.active {
            background: #ede6ff;
            font-weight: 600;
            color: #581c87;
          }
          .divider { height: 1px; background: #e2e8f0; margin: 4px 0; }
          .caption-box {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px 16px;
            font-size: 13px;
            line-height: 1.5;
            color: #334155;
            margin-top: 14px;
          }
          .caption-box strong { color: #0f172a; }
        </style>
      </head>
      <body>
        <div class="browser-window">
          <div class="browser-nav">
            <div class="window-dots">
              <div class="dot red"></div>
              <div class="dot yellow"></div>
              <div class="dot green"></div>
            </div>
            <div class="url-bar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              https://chrome.google.com
            </div>
            <div class="toolbar-actions">
              <div class="ext-icon-btn">
                <svg width="18" height="18" viewBox="0 0 48 46" fill="none"><path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="#863bff"/></svg>
                <span class="badge-num">12</span>
              </div>
            </div>
          </div>
          <div class="canvas-area">
            <div>
              <div class="popup-demo">
                <div class="popup-header">
                  <div class="brand">
                    <svg width="22" height="22" viewBox="0 0 48 46" fill="none"><path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="#863bff"/></svg>
                    WordStreak
                  </div>
                  <button class="gear-btn" id="popup-gear-btn" title="Cài đặt">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  </button>
                </div>
                <div class="auth-box">
                  <div>
                    <div class="auth-user">Alex Nguyễn</div>
                    <div class="auth-status">Đang đồng bộ tài khoản</div>
                  </div>
                  <span style="font-size: 12px; color: #863bff; font-weight: 700;">12 thẻ đến hạn</span>
                </div>
              </div>
              <div class="caption-box">
                <strong>Cách 1:</strong> Bấm vào biểu tượng tiện ích WordStreak, sau đó bấm vào <strong>biểu tượng bánh răng cài đặt</strong> ở góc trên bên phải.
              </div>
            </div>

            <div>
              <div class="context-menu-demo" id="context-menu-box">
                <div class="menu-title">WordStreak Action Menu</div>
                <div class="menu-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
                  Ôn tập 12 thẻ đến hạn
                </div>
                <div class="divider"></div>
                <div class="menu-item active" id="context-options-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#863bff" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  <strong>Tùy chọn (Options)</strong>
                </div>
                <div class="menu-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                  Gỡ khỏi Chrome...
                </div>
              </div>
              <div class="caption-box">
                <strong>Cách 2:</strong> Nhấp chuột phải vào biểu tượng WordStreak trên thanh công cụ và chọn dòng <strong>Tùy chọn (Options)</strong>.
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);

    await attachRedBadge(page, '#popup-gear-btn', '①');
    await attachRedBadge(page, '#context-options-item', '②');
    await page.screenshot({ path: path.join(outDir, 'step-01-open-options-page.png') });

    // ----------------------------------------------------
    // SCREENSHOT 2: Toggle Due Cards Toolbar Badge
    // ----------------------------------------------------
    console.log('Generating Step 2: Toggle Due Badge...');
    await page.setViewportSize({ width: 780, height: 700 });
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cài đặt WordStreak Extension</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="options-wrapper">
          <div class="header">
            <div class="header-left">
              ${flameSvg}
              <div>
                <h1 class="title">Cài đặt WordStreak Extension</h1>
                <p class="subtitle">Tùy chỉnh hành vi tra cứu và lưu từ vựng trên trình duyệt</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 24px;">
            <h2 class="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#863bff" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              Nhắc học &amp; Huy hiệu
            </h2>

            <label class="toggle-row" id="badge-toggle-box">
              <div>
                <div class="toggle-row-title">Hiển thị số thẻ đến hạn trên icon tiện ích (Badge)</div>
                <div class="toggle-row-sub">Cập nhật huy hiệu góc trên thanh công cụ mỗi 30 phút hoặc khi có thẻ đến hạn</div>
              </div>
              <input type="checkbox" checked class="ws-checkbox" id="badge-checkbox" />
            </label>

            <div class="visual-preview-strip" id="badge-visual-preview">
              <div class="preview-label">Minh họa hiển thị trên thanh công cụ:</div>
              <div class="preview-badge-pair">
                <div class="preview-item">
                  <div class="mini-icon-frame">
                    <svg width="16" height="16" viewBox="0 0 48 46" fill="none"><path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="#863bff"/></svg>
                    <span class="mini-badge">12</span>
                  </div>
                  <span><strong>Bật:</strong> Hiện số thẻ đến hạn</span>
                </div>
                <div class="preview-item">
                  <div class="mini-icon-frame">
                    <svg width="16" height="16" viewBox="0 0 48 46" fill="none"><path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="#863bff"/></svg>
                  </div>
                  <span><strong>Tắt:</strong> Tối giản, không số</span>
                </div>
              </div>
            </div>

            <label class="toggle-row">
              <div>
                <div class="toggle-row-title">Bật thông báo nhắc học hằng ngày</div>
                <div class="toggle-row-sub">Gửi thông báo trên trình duyệt nhắc bạn hoàn thành mục tiêu ngày</div>
              </div>
              <input type="checkbox" checked class="ws-checkbox" />
            </label>
          </div>

          <div class="footer-row">
            <button class="btn-save">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </body>
      </html>
    `);

    await attachRedBadge(page, '#badge-toggle-box', '①');
    await attachRedBadge(page, '#badge-visual-preview', '②');
    await page.screenshot({ path: path.join(outDir, 'step-02-badge-toggle.png') });

    // ----------------------------------------------------
    // SCREENSHOT 3: Daily Reminder & Streak-at-Risk Alarm
    // ----------------------------------------------------
    console.log('Generating Step 3: Daily Reminder & Streak at Risk...');
    await page.setViewportSize({ width: 780, height: 750 });
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cài đặt WordStreak Extension</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="options-wrapper">
          <div class="header">
            <div class="header-left">
              ${flameSvg}
              <div>
                <h1 class="title">Cài đặt WordStreak Extension</h1>
                <p class="subtitle">Tùy chỉnh hành vi tra cứu và lưu từ vựng trên trình duyệt</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 24px;">
            <h2 class="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#863bff" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              Nhắc học &amp; Huy hiệu
            </h2>

            <label class="toggle-row" id="master-reminder-toggle">
              <div>
                <div class="toggle-row-title">Bật thông báo nhắc học hằng ngày</div>
                <div class="toggle-row-sub">Gửi thông báo trên trình duyệt nhắc bạn hoàn thành mục tiêu ngày</div>
              </div>
              <input type="checkbox" checked class="ws-checkbox" />
            </label>

            <div class="child-box">
              <div class="field-row" id="daily-time-row">
                <div>
                  <label style="font-size: 14px; font-weight: 600; color: #111827; display: block;">Giờ nhắc học cố định</label>
                  <span style="font-size: 12px; color: #6b7280;">Thời điểm gửi thông báo hằng ngày</span>
                </div>
                <input type="time" class="time-input" value="20:00" />
              </div>

              <label class="field-row" id="streak-risk-row" style="cursor: pointer; margin-bottom: 14px;">
                <div>
                  <span style="font-size: 14px; font-weight: 600; color: #111827; display: block;">
                    Nhắc khẩn cấp khi chuỗi ngày học (Streak) sắp mất
                  </span>
                  <span style="font-size: 12px; color: #6b7280;">Cảnh báo khi chưa học bài trước giờ hết ngày</span>
                </div>
                <input type="checkbox" checked class="ws-checkbox" />
              </label>

              <div style="display: flex; gap: 12px;">
                <div style="flex: 1;">
                  <label style="font-size: 13px; font-weight: 600; color: #111827; display: block; margin-bottom: 4px;">
                    Giờ yên lặng - Bắt đầu
                  </label>
                  <input type="time" class="time-input" value="22:00" style="width: 100%;" />
                </div>
                <div style="flex: 1;">
                  <label style="font-size: 13px; font-weight: 600; color: #111827; display: block; margin-bottom: 4px;">
                    Giờ yên lặng - Kết thúc
                  </label>
                  <input type="time" class="time-input" value="07:00" style="width: 100%;" />
                </div>
              </div>
            </div>
          </div>

          <div class="footer-row">
            <button class="btn-save">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </body>
      </html>
    `);

    await attachRedBadge(page, '#master-reminder-toggle', '①');
    await attachRedBadge(page, '#daily-time-row', '②');
    await attachRedBadge(page, '#streak-risk-row', '③');
    await page.screenshot({ path: path.join(outDir, 'step-03-daily-reminder-and-streak-alert.png') });

    // ----------------------------------------------------
    // SCREENSHOT 4: Quiet Hours & Conflict Warning
    // ----------------------------------------------------
    console.log('Generating Step 4: Quiet Hours & Conflict Warning...');
    await page.setViewportSize({ width: 780, height: 770 });
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cài đặt WordStreak Extension</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="options-wrapper">
          <div class="header">
            <div class="header-left">
              ${flameSvg}
              <div>
                <h1 class="title">Cài đặt WordStreak Extension</h1>
                <p class="subtitle">Tùy chỉnh hành vi tra cứu và lưu từ vựng trên trình duyệt</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 24px;">
            <h2 class="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#863bff" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              Nhắc học &amp; Huy hiệu
            </h2>

            <label class="toggle-row">
              <div>
                <div class="toggle-row-title">Bật thông báo nhắc học hằng ngày</div>
                <div class="toggle-row-sub">Gửi thông báo trên trình duyệt nhắc bạn hoàn thành mục tiêu ngày</div>
              </div>
              <input type="checkbox" checked class="ws-checkbox" />
            </label>

            <div class="child-box">
              <div class="field-row">
                <div>
                  <label style="font-size: 14px; font-weight: 600; color: #111827; display: block;">Giờ nhắc học cố định</label>
                  <span style="font-size: 12px; color: #6b7280;">Thời điểm gửi thông báo hằng ngày</span>
                </div>
                <input type="time" class="time-input" value="23:00" style="border-color: #f59e0b; background: #fffbeb;" />
              </div>

              <label class="field-row" style="cursor: pointer; margin-bottom: 14px;">
                <div>
                  <span style="font-size: 14px; font-weight: 600; color: #111827; display: block;">
                    Nhắc khẩn cấp khi chuỗi ngày học (Streak) sắp mất
                  </span>
                  <span style="font-size: 12px; color: #6b7280;">Cảnh báo khi chưa học bài trước giờ hết ngày</span>
                </div>
                <input type="checkbox" checked class="ws-checkbox" />
              </label>

              <div style="display: flex; gap: 12px;" id="quiet-hours-inputs">
                <div style="flex: 1;">
                  <label style="font-size: 13px; font-weight: 600; color: #111827; display: block; margin-bottom: 4px;">
                    Giờ yên lặng - Bắt đầu
                  </label>
                  <input type="time" class="time-input" value="22:00" style="width: 100%;" />
                </div>
                <div style="flex: 1;">
                  <label style="font-size: 13px; font-weight: 600; color: #111827; display: block; margin-bottom: 4px;">
                    Giờ yên lặng - Kết thúc
                  </label>
                  <input type="time" class="time-input" value="07:00" style="width: 100%;" />
                </div>
              </div>

              <div id="overlap-warning-banner" role="status" style="
                margin-top: 14px;
                padding: 10px 14px;
                border-radius: 12px;
                font-size: 12.5px;
                display: flex;
                align-items: center;
                gap: 8px;
                background-color: #fef3c7;
                border: 1px solid #fcd34d;
                color: #92400e;
              ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span><strong>Lưu ý:</strong> Giờ nhắc học hằng ngày (23:00) đang nằm trong khung Giờ yên lặng (22:00 – 07:00) - thông báo sẽ bị tạm ẩn vào thời điểm này.</span>
              </div>
            </div>
          </div>

          <div class="footer-row">
            <button class="btn-save">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </body>
      </html>
    `);

    await attachRedBadge(page, '#quiet-hours-inputs', '①');
    await attachRedBadge(page, '#overlap-warning-banner', '②');
    await page.screenshot({ path: path.join(outDir, 'step-04-quiet-hours-and-conflict-warning.png') });

    // ----------------------------------------------------
    // SCREENSHOT 5: Save & Cross-Device Cloud Sync
    // ----------------------------------------------------
    console.log('Generating Step 5: Save & Cloud Sync...');
    await page.setViewportSize({ width: 780, height: 720 });
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cài đặt WordStreak Extension</title>
        <style>
          ${baseStyles}
          .sync-card {
            margin-top: 16px;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 14px;
            padding: 14px 18px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 13px;
            color: #166534;
          }
          .sync-icon {
            width: 32px;
            height: 32px;
            background: #dcfce7;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
        </style>
      </head>
      <body>
        <div class="options-wrapper">
          <div class="header">
            <div class="header-left">
              ${flameSvg}
              <div>
                <h1 class="title">Cài đặt WordStreak Extension</h1>
                <p class="subtitle">Tùy chỉnh hành vi tra cứu và lưu từ vựng trên trình duyệt</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 24px;">
            <h2 class="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#863bff" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              Nhắc học &amp; Huy hiệu
            </h2>

            <label class="toggle-row">
              <div>
                <div class="toggle-row-title">Hiển thị số thẻ đến hạn trên icon tiện ích (Badge)</div>
                <div class="toggle-row-sub">Cập nhật huy hiệu góc trên thanh công cụ mỗi 30 phút hoặc khi có thẻ đến hạn</div>
              </div>
              <input type="checkbox" checked class="ws-checkbox" />
            </label>

            <label class="toggle-row">
              <div>
                <div class="toggle-row-title">Bật thông báo nhắc học hằng ngày</div>
                <div class="toggle-row-sub">Gửi thông báo trên trình duyệt nhắc bạn hoàn thành mục tiêu ngày</div>
              </div>
              <input type="checkbox" checked class="ws-checkbox" />
            </label>

            <div class="sync-card" id="cloud-sync-info">
              <div class="sync-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><polyline points="13 13 16 16 20 12"/></svg>
              </div>
              <div>
                <strong>Tự động đồng bộ đám mây (Google Chrome Sync):</strong>
                Cài đặt của bạn được lưu an toàn trên đám mây. Khi bạn đăng nhập cùng tài khoản Chrome trên máy tính ở công ty hoặc laptop ở nhà, mọi tùy chỉnh nhắc học sẽ đồng bộ tức thì mà không cần cài đặt lại!
              </div>
            </div>
          </div>

          <div class="footer-row" id="save-section">
            <div class="save-status" id="save-status-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Đã lưu cài đặt!
            </div>
            <button class="btn-save" id="btn-save-target">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </body>
      </html>
    `);

    await attachRedBadge(page, '#btn-save-target', '①');
    await attachRedBadge(page, '#save-status-badge', '②');
    await attachRedBadge(page, '#cloud-sync-info', '③');
    await page.screenshot({ path: path.join(outDir, 'step-05-save-and-sync.png') });

    await page.close();
    console.log('All 5 screenshots captured successfully in outDir:', outDir);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});

