/**
 * Render Floating Flame Button inside Shadow DOM
 */
export function createFloatingFlameIcon(
  x: number,
  y: number,
  bottom: number,
  onClick: () => void,
): HTMLElement {
  const button = document.createElement("button");
  button.className = "ws-floating-btn ws-pointer-events-auto";
  button.title = "Lưu từ vựng vào WordStreak (1-Click Save)";

  // Calculate left and top
  const left = Math.min(window.innerWidth - 46, Math.max(8, x + 6));
  let top = y - 38;
  if (top < 10) {
    top = bottom + 6; // Position below selection if near top of window
  }

  button.style.left = `${left}px`;
  button.style.top = `${top}px`;
  button.style.position = "fixed";
  button.style.zIndex = "2147483647";
  button.style.display = "flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.width = "34px";
  button.style.height = "34px";
  button.style.backgroundColor = "#ffffff";
  button.style.border = "1.5px solid #863bff";
  button.style.borderRadius = "9999px";
  button.style.boxShadow = "0 4px 16px rgba(134, 59, 255, 0.35)";
  button.style.cursor = "pointer";

  // Purple Mascot Flame SVG
  button.innerHTML = `
    <svg class="ws-flame-icon" viewBox="0 0 48 46" fill="none" style="width: 20px; height: 20px;" xmlns="http://www.w3.org/2000/svg">
      <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="#863bff"/>
    </svg>
  `;

  button.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  });

  return button;
}
