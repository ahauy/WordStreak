import { useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

interface PrologueSectionProps {
  progress: number;
  activeStage: number;
  onScrollToProgress: (fraction: number) => void;
  onOpenAuth: (mode: "login" | "signup") => void;
}

export function PrologueSection({
  progress,
  activeStage,
  onScrollToProgress,
  onOpenAuth,
}: PrologueSectionProps) {
  const { t } = useTranslation("landing");
  const [flipped, setFlipped] = useState(false);

  // Compute camera and lighting transformations
  const angle = Math.sin(progress * Math.PI * 2) * 30;
  const swingTransform = `rotate(${angle.toFixed(2)} 1150 380)`;

  const scale = 1.04 + progress * 0.05;
  const tx = 800 - progress * 16;
  const ty = 450 - progress * 10;
  const cameraTransform = `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)}) translate(-800 -450)`;

  const nightOpacity = Math.min(1, Math.max(0, progress * 0.55));
  const sunOpacity = Math.min(1, Math.max(0, 1 - progress * 0.7));
  const starsOpacity = Math.min(1, Math.max(0, (progress - 0.5) / 0.5));
  const firefliesOpacity = Math.min(1, Math.max(0, 0.3 + progress * 0.7));

  return (
    <section className="prologue" id="khoi-dau" aria-label="Câu chuyện WordStreak">
      <div className="scene-shell">
        <div className="scene-art-wrap" aria-hidden="true">
          <svg
            className="scene-art"
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMaxYMid slice"
            role="presentation"
          >
            <defs>
              <linearGradient id="skyDusk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#150f0b" />
                <stop offset="0.34" stopColor="#2a1a11" />
                <stop offset="0.56" stopColor="#58351b" />
                <stop offset="0.74" stopColor="#a9692f" />
                <stop offset="0.87" stopColor="#d99a52" />
                <stop offset="1" stopColor="#e9ba76" />
              </linearGradient>
              <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#ffdc9c" stopOpacity="0.9" />
                <stop offset="0.42" stopColor="#f2b163" stopOpacity="0.34" />
                <stop offset="1" stopColor="#f2b163" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#6b4e2c" />
                <stop offset="1" stopColor="#3a2b1a" />
              </linearGradient>
              <linearGradient id="hillMid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#3f3320" />
                <stop offset="1" stopColor="#241b11" />
              </linearGradient>
              <linearGradient id="meadow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2e2a19" />
                <stop offset="0.55" stopColor="#1d1b11" />
                <stop offset="1" stopColor="#100d08" />
              </linearGradient>
              <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#120c07" />
                <stop offset="0.46" stopColor="#332316" />
                <stop offset="0.72" stopColor="#4a3320" />
                <stop offset="1" stopColor="#1b120b" />
              </linearGradient>
              <linearGradient id="leafA" x1="0" y1="0" x2="0.7" y2="1">
                <stop offset="0" stopColor="#6d6a3d" />
                <stop offset="0.55" stopColor="#41492b" />
                <stop offset="1" stopColor="#202618" />
              </linearGradient>
              <linearGradient id="leafB" x1="0" y1="0" x2="0.6" y2="1">
                <stop offset="0" stopColor="#8a6a33" />
                <stop offset="0.5" stopColor="#544326" />
                <stop offset="1" stopColor="#241f13" />
              </linearGradient>
              <linearGradient id="leafC" x1="0" y1="0" x2="0.4" y2="1">
                <stop offset="0" stopColor="#4c5634" />
                <stop offset="1" stopColor="#171d12" />
              </linearGradient>
              <linearGradient id="dressGrad" x1="0" y1="0" x2="1" y2="0.6">
                <stop offset="0" stopColor="#2c3320" />
                <stop offset="0.62" stopColor="#4c5735" />
                <stop offset="1" stopColor="#707a49" />
              </linearGradient>
              <linearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#8f6240" />
                <stop offset="0.7" stopColor="#c48f61" />
                <stop offset="1" stopColor="#e6b982" />
              </linearGradient>
              <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="0.4">
                <stop offset="0" stopColor="#241509" />
                <stop offset="0.7" stopColor="#482a14" />
                <stop offset="1" stopColor="#6e4623" />
              </linearGradient>
              <radialGradient id="mistGrad" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#e8cda2" stopOpacity="0.32" />
                <stop offset="1" stopColor="#e8cda2" stopOpacity="0" />
              </radialGradient>
              <filter id="soften" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="14" />
              </filter>
              <filter id="glow" x="-120%" y="-120%" width="340%" height="340%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g id="sceneCamera" transform={cameraTransform}>
              <rect x="-80" y="-80" width="1760" height="1060" fill="url(#skyDusk)" />
              <ellipse
                cx="1160"
                cy="690"
                rx="430"
                ry="330"
                fill="url(#sunGlow)"
                opacity={sunOpacity}
              />

              <g id="layerFar" opacity="0.92">
                <path
                  d="M-80 652 C 140 596 300 636 470 620 C 660 602 760 648 940 626 C 1130 604 1280 644 1460 614 C 1550 600 1620 620 1680 610 L1680 800 L-80 800 Z"
                  fill="url(#hillFar)"
                  opacity="0.5"
                />
                <path
                  d="M-80 712 C 180 662 360 706 560 686 C 780 664 930 706 1110 682 C 1300 658 1480 700 1680 674 L1680 860 L-80 860 Z"
                  fill="url(#hillMid)"
                  opacity="0.72"
                />
              </g>

              <g id="layerCanopyBack" opacity="0.95">
                <path
                  d="M700 240 C 760 128 900 84 1030 104 C 1150 44 1340 44 1460 118 C 1570 96 1660 168 1650 268 C 1700 350 1630 430 1512 440 C 1460 500 1330 506 1244 464 C 1140 512 1010 494 940 436 C 812 452 716 372 722 300 Z"
                  fill="url(#leafC)"
                  opacity="0.75"
                />
                <path
                  d="M760 356 C 700 276 736 176 828 144 C 872 78 980 62 1052 108 C 1120 58 1240 66 1288 136 C 1380 126 1452 190 1436 272 C 1490 336 1432 414 1336 414 C 1276 466 1160 462 1104 414 C 1004 462 884 438 846 380 C 806 404 764 394 760 356 Z"
                  fill="url(#leafB)"
                  opacity="0.72"
                />
              </g>

              <g id="layerTree">
                <path
                  d="M1112 884 C 1150 782 1166 696 1182 606 C 1194 542 1200 506 1212 478 L1246 482 C 1250 542 1244 612 1250 682 C 1258 764 1284 824 1334 884 Z"
                  fill="url(#trunkGrad)"
                />
                <path
                  d="M1136 880 C 1114 852 1090 842 1062 836 C 1096 832 1126 842 1142 858 Z"
                  fill="#1a110a"
                />
                <path
                  d="M1308 882 C 1334 854 1362 846 1392 842 C 1354 856 1330 866 1318 886 Z"
                  fill="#1a110a"
                />
                <path
                  d="M1200 486 C 1122 464 1018 428 904 390 C 886 384 872 372 884 364 C 900 356 928 366 958 376 C 1050 402 1146 440 1218 464 Z"
                  fill="url(#trunkGrad)"
                />
                <path
                  d="M1232 470 C 1246 414 1282 366 1330 330 C 1350 314 1370 320 1362 338 C 1326 380 1296 420 1272 474 Z"
                  fill="url(#trunkGrad)"
                  opacity="0.9"
                />
                <path
                  d="M1248 604 C 1300 566 1360 548 1420 546 C 1452 546 1460 564 1432 570 C 1374 580 1322 600 1282 634 Z"
                  fill="url(#trunkGrad)"
                  opacity="0.75"
                />
                <path
                  d="M1188 608 C 1140 578 1092 566 1040 566 C 1016 566 1012 582 1038 586 C 1090 592 1136 610 1172 636 Z"
                  fill="url(#trunkGrad)"
                  opacity="0.55"
                />
                <path
                  d="M1216 520 C 1222 480 1224 460 1228 440"
                  stroke="#7a5730"
                  strokeWidth="2"
                  opacity="0.5"
                  fill="none"
                />
                <path
                  d="M1230 700 C 1238 660 1240 630 1242 600"
                  stroke="#6d4b29"
                  strokeWidth="2"
                  opacity="0.4"
                  fill="none"
                />
              </g>

              <g id="layerCanopyFront">
                <path
                  d="M742 300 C 748 214 826 154 914 150 C 960 108 1058 110 1106 158 C 1188 140 1262 184 1272 250 C 1342 272 1376 348 1330 402 C 1290 462 1180 468 1112 430 C 1040 470 930 456 886 404 C 812 416 748 372 742 300 Z"
                  fill="url(#leafA)"
                  opacity="0.92"
                />
                <path
                  d="M1310 330 C 1322 262 1386 222 1458 236 C 1518 208 1590 246 1594 306 C 1650 352 1626 430 1556 442 C 1504 486 1414 470 1380 420 C 1334 410 1302 376 1310 330 Z"
                  fill="url(#leafB)"
                  opacity="0.8"
                />
                <path
                  d="M842 406 C 850 362 894 334 940 342 C 968 318 1018 326 1032 358 C 1072 382 1064 430 1026 444 C 992 468 936 458 914 430 C 878 432 846 426 842 406 Z"
                  fill="url(#leafC)"
                  opacity="0.85"
                />
                <path
                  d="M1104 116 C 1156 66 1244 66 1296 106 C 1354 88 1418 122 1424 178 C 1462 218 1444 282 1392 296 C 1344 330 1268 318 1240 280 C 1182 286 1132 252 1136 210 C 1096 190 1084 146 1104 116 Z"
                  fill="url(#leafA)"
                  opacity="0.6"
                />
                <path
                  d="M930 148 C 978 100 1058 104 1098 144 C 1152 140 1198 180 1192 226 C 1224 266 1196 316 1148 320 C 1108 350 1044 338 1018 306 C 968 306 932 272 936 238 C 906 214 904 172 930 148 Z"
                  fill="url(#leafB)"
                  opacity="0.5"
                />
                <path
                  d="M772 208 C 800 160 858 144 900 168"
                  stroke="#b08a4a"
                  strokeWidth="2"
                  opacity="0.28"
                  fill="none"
                />
                <path
                  d="M1330 300 C 1378 274 1432 282 1464 312"
                  stroke="#c39a52"
                  strokeWidth="2"
                  opacity="0.24"
                  fill="none"
                />
                <path
                  d="M1010 176 C 1050 148 1108 148 1140 170"
                  stroke="#b08a4a"
                  strokeWidth="2"
                  opacity="0.2"
                  fill="none"
                />
              </g>

              <g id="layerMeadow">
                <path
                  d="M-80 744 C 180 714 380 750 600 734 C 840 716 1020 752 1240 736 C 1440 722 1580 748 1680 730 L1680 960 L-80 960 Z"
                  fill="url(#meadow)"
                />
                <path
                  d="M-80 786 C 160 766 360 792 580 780 C 830 766 1030 796 1260 782 C 1450 770 1600 792 1680 780 L1680 960 L-80 960 Z"
                  fill="#15120b"
                />
                <g stroke="#2c2c19" strokeWidth="3" opacity="0.8" fill="none">
                  <path d="M100 900 C 106 862 96 838 84 816" />
                  <path d="M132 904 C 140 872 150 846 168 826" />
                  <path d="M300 906 C 304 878 296 854 282 836" />
                  <path d="M470 908 C 478 878 488 858 506 840" />
                  <path d="M690 910 C 694 882 686 860 674 844" />
                  <path d="M880 910 C 888 884 900 864 918 850" />
                  <path d="M1070 908 C 1072 880 1066 858 1054 842" />
                  <path d="M1310 906 C 1318 878 1330 858 1350 844" />
                  <path d="M1490 910 C 1492 884 1486 862 1474 846" />
                </g>
                <g fill="#c9a35d" opacity="0.55">
                  <circle cx="196" cy="866" r="3" />
                  <circle cx="216" cy="880" r="2" />
                  <circle cx="348" cy="884" r="2.5" />
                  <circle cx="620" cy="874" r="2" />
                  <circle cx="1020" cy="880" r="2.6" />
                  <circle cx="1392" cy="874" r="2" />
                  <circle cx="760" cy="892" r="2.2" />
                </g>
              </g>

              <g id="layerMist" opacity="0.8">
                <ellipse cx="420" cy="742" rx="420" ry="42" fill="url(#mistGrad)" filter="url(#soften)" />
                <ellipse cx="1130" cy="762" rx="460" ry="46" fill="url(#mistGrad)" filter="url(#soften)" />
              </g>

              <g id="swingRig" transform={swingTransform}>
                <g transform="translate(250 0)">
                  <line x1="884" y1="380" x2="864" y2="668" stroke="#c8a266" strokeWidth="2.4" opacity="0.85" />
                  <line x1="916" y1="380" x2="940" y2="668" stroke="#c8a266" strokeWidth="2.4" opacity="0.85" />
                  <line x1="890" y1="380" x2="872" y2="662" stroke="#7d5f38" strokeWidth="1.2" opacity="0.6" />
                  <line x1="910" y1="380" x2="932" y2="662" stroke="#7d5f38" strokeWidth="1.2" opacity="0.6" />
                  <circle cx="884" cy="380" r="3.2" fill="#d8b477" />
                  <circle cx="916" cy="380" r="3.2" fill="#d8b477" />
                  <g>
                    <rect x="850" y="666" width="108" height="10" rx="2" fill="#5f4426" />
                    <rect x="850" y="666" width="108" height="3" rx="1.5" fill="#a17b45" opacity="0.7" />
                    <path d="M850 676 C 872 682 938 682 958 676" stroke="#24170d" strokeWidth="3" fill="none" opacity="0.8" />
                  </g>
                  <g id="girl">
                    <path
                      d="M932 552 C 950 546 960 556 962 570 C 966 586 960 600 952 606"
                      stroke="url(#hairGrad)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M868 700 C 858 668 870 638 886 620 L 942 620 C 958 642 964 670 956 700 C 930 710 892 710 868 700 Z"
                      fill="url(#dressGrad)"
                    />
                    <path
                      d="M884 620 C 886 598 900 586 916 584 C 934 586 944 598 944 618 Z"
                      fill="url(#dressGrad)"
                    />
                    <path
                      d="M894 602 C 884 616 878 634 880 650"
                      stroke="url(#skinGrad)"
                      strokeWidth="7"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M934 602 C 944 614 946 630 940 646"
                      stroke="url(#skinGrad)"
                      strokeWidth="7"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <circle cx="879" cy="652" r="5" fill="#d9a874" />
                    <circle cx="939" cy="648" r="5" fill="#d9a874" />
                    <path
                      d="M902 700 C 900 718 904 730 914 740"
                      stroke="#8d6240"
                      strokeWidth="7"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M934 700 C 936 716 940 728 948 736"
                      stroke="#8d6240"
                      strokeWidth="7"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <ellipse cx="912" cy="740" rx="9" ry="4" fill="#2a1b10" />
                    <ellipse cx="948" cy="736" rx="9" ry="4" fill="#2a1b10" />
                    <circle cx="916" cy="562" r="22" fill="url(#skinGrad)" />
                    <path
                      d="M898 552 C 900 536 912 528 926 532 C 940 536 946 548 944 562 C 936 570 926 574 914 572 C 904 570 898 562 898 552 Z"
                      fill="url(#hairGrad)"
                    />
                    <circle cx="940" cy="540" r="10" fill="url(#hairGrad)" />
                    <path
                      d="M940 546 C 946 558 948 572 944 586"
                      stroke="url(#hairGrad)"
                      strokeWidth="7"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M946 572 C 954 580 956 594 950 606"
                      stroke="#c79a5d"
                      strokeWidth="1.4"
                      fill="none"
                      opacity="0.45"
                    />
                    <path
                      d="M950 640 C 958 660 958 682 950 700"
                      stroke="#c79a5d"
                      strokeWidth="1.6"
                      fill="none"
                      opacity="0.4"
                    />
                  </g>
                </g>
              </g>

              <g id="layerFrontGrass">
                <path
                  d="M-80 846 C 120 838 260 858 420 848 C 620 836 760 856 960 846 C 1180 834 1360 856 1680 842 L1680 960 L-80 960 Z"
                  fill="#0d0b07"
                />
                <path
                  d="M-80 876 C 200 862 380 884 620 872 C 860 860 1060 886 1280 872 C 1460 862 1600 878 1680 868 L1680 960 L-80 960 Z"
                  fill="#080705"
                />
                <g stroke="#191a10" strokeWidth="2" opacity="0.9" fill="none">
                  <path d="M60 960 C 68 920 60 892 46 874" />
                  <path d="M74 960 C 84 926 92 902 110 884" />
                  <path d="M420 960 C 426 930 420 906 408 890" />
                  <path d="M1180 960 C 1188 928 1198 906 1216 890" />
                  <path d="M1520 960 C 1524 932 1518 910 1506 894" />
                </g>
              </g>

              <g id="fireflies" opacity={firefliesOpacity} fill="#ffd98b" filter="url(#glow)">
                <circle className="firefly" cx="300" cy="640" r="2.2" style={{ "--dx": "18px", "--dy": "-26px", "--dur": "7s", "--delay": "0s" } as CSSProperties} />
                <circle className="firefly" cx="380" cy="700" r="1.6" style={{ "--dx": "-14px", "--dy": "-32px", "--dur": "9s", "--delay": "1.4s" } as CSSProperties} />
                <circle className="firefly" cx="520" cy="620" r="2.6" style={{ "--dx": "22px", "--dy": "-18px", "--dur": "8s", "--delay": ".6s" } as CSSProperties} />
                <circle className="firefly" cx="660" cy="676" r="1.8" style={{ "--dx": "-18px", "--dy": "-24px", "--dur": "10s", "--delay": "2.2s" } as CSSProperties} />
                <circle className="firefly" cx="800" cy="592" r="2.2" style={{ "--dx": "16px", "--dy": "-30px", "--dur": "7.5s", "--delay": "1.1s" } as CSSProperties} />
                <circle className="firefly" cx="960" cy="650" r="1.5" style={{ "--dx": "-12px", "--dy": "-22px", "--dur": "9.5s", "--delay": "3s" } as CSSProperties} />
                <circle className="firefly" cx="1080" cy="610" r="2.4" style={{ "--dx": "20px", "--dy": "-28px", "--dur": "8.4s", "--delay": ".3s" } as CSSProperties} />
                <circle className="firefly" cx="1240" cy="690" r="1.7" style={{ "--dx": "-16px", "--dy": "-20px", "--dur": "11s", "--delay": "2.6s" } as CSSProperties} />
                <circle className="firefly" cx="1380" cy="626" r="2.1" style={{ "--dx": "14px", "--dy": "-26px", "--dur": "9.2s", "--delay": "1.8s" } as CSSProperties} />
                <circle className="firefly" cx="1500" cy="700" r="1.6" style={{ "--dx": "-20px", "--dy": "-18px", "--dur": "10.5s", "--delay": ".9s" } as CSSProperties} />
              </g>

              <g id="stars" fill="#f4e6c6" opacity={starsOpacity}>
                <circle cx="180" cy="120" r="2" />
                <circle cx="320" cy="70" r="1.4" />
                <circle cx="460" cy="150" r="1.8" />
                <circle cx="600" cy="90" r="1.2" />
                <circle cx="760" cy="60" r="1.6" />
                <circle cx="980" cy="80" r="1.3" />
                <circle cx="1180" cy="60" r="1.8" />
                <circle cx="1340" cy="120" r="1.2" />
                <circle cx="1480" cy="80" r="1.6" />
                <circle cx="420" cy="240" r="1.1" />
                <circle cx="880" cy="220" r="1.1" />
                <circle cx="1280" cy="220" r="1.2" />
              </g>
            </g>
          </svg>
        </div>

        <div className="scene-night" aria-hidden="true" style={{ opacity: nightOpacity }} />
        <div className="scene-vignette" aria-hidden="true" />
        <div className="scene-grain" aria-hidden="true" />
        <div className="scene-frame" aria-hidden="true" />

        <nav className="chapter-rail" aria-label="Các chương">
          <button
            type="button"
            className={activeStage === 1 ? "is-active" : ""}
            onClick={() => onScrollToProgress(0.21)}
            aria-label="Chương I — Khởi đầu"
          >
            <span>I</span>
          </button>
          <button
            type="button"
            className={activeStage === 2 ? "is-active" : ""}
            onClick={() => onScrollToProgress(0.46)}
            aria-label="Chương II — Nghi lễ mỗi ngày"
          >
            <span>II</span>
          </button>
          <button
            type="button"
            className={activeStage === 3 ? "is-active" : ""}
            onClick={() => onScrollToProgress(0.68)}
            aria-label="Chương III — Kho tàng"
          >
            <span>III</span>
          </button>
          <button
            type="button"
            className={activeStage === 4 ? "is-active" : ""}
            onClick={() => onScrollToProgress(0.89)}
            aria-label="Chương IV — Lời thề"
          >
            <span>IV</span>
          </button>
        </nav>

        <p className={`scroll-cue ${progress > 0.012 ? "is-hidden" : ""}`} aria-hidden="true">
          <span>{t("cue.scroll", "Cuộn để bước vào chuyện")}</span>
          <span className="scroll-cue-line"></span>
        </p>
      </div>

      <div className="chapter-track">
        {/* Chapter 0: Hero */}
        <article className={`chapter chapter-hero ${activeStage === 0 ? "is-active" : ""}`} data-stage="0">
          <div className="chapter-inner">
            <p className="eyebrow">{t("hero.eyebrow", "Từ vựng tiếng Anh · Lặp lại ngắt quãng · Miễn phí trọn đời")}</p>
            <h1
              className="display"
              dangerouslySetInnerHTML={{
                __html: t("hero.title", "Khắc từng từ<br><em>vào ký ức.</em>"),
              }}
            />
            <p className="lede">
              {t(
                "hero.lede",
                "WordStreak dùng lặp lại ngắt quãng SM-2, phát âm IPA và chuỗi ngày học để biến vài phút mỗi ngày thành vốn từ ở lại lâu dài.",
              )}
            </p>
            <div className="hero-actions">
              <button
                className="btn btn-solid btn-lg"
                type="button"
                onClick={() => onOpenAuth("signup")}
              >
                {t("hero.cta", "Bắt đầu miễn phí")}
              </button>
              <button
                className="btn btn-quiet btn-lg"
                type="button"
                onClick={() => onScrollToProgress(0.46)}
              >
                {t("hero.cta2", "Xem cách học")}
              </button>
            </div>
            <ul className="trust-row">
              <li>{t("trust.free", "Miễn phí trọn đời")}</li>
              <li>{t("trust.ads", "Không quảng cáo")}</li>
              <li>{t("trust.export", "Xuất Anki & CSV")}</li>
              <li>{t("trust.offline", "Học offline")}</li>
            </ul>
          </div>
        </article>

        {/* Chapter 1: The Beginning */}
        <article className={`chapter ${activeStage === 1 ? "is-active" : ""}`} data-stage="1">
          <div className="chapter-inner">
            <p className="chapter-label">
              <span className="chapter-numeral">I</span>
              <span>{t("ch1.label", "Chương I · Khởi đầu")}</span>
            </p>
            <h2
              className="display"
              dangerouslySetInnerHTML={{
                __html: t("ch1.title", "Trí nhớ không phải<br><em>một cái kho.</em>"),
              }}
            />
            <p className="lede">
              {t(
                "ch1.body",
                "Bạn quên phần lớn điều mới học trong vài ngày đầu — không phải vì lười, mà vì não chủ động dọn chỗ. WordStreak chèn một lần ôn ngay trước khi ký ức phai, rồi giãn dần khoảng cách.",
              )}
            </p>

            <figure className="chart-card" aria-labelledby="chartTitle">
              <figcaption id="chartTitle">
                <span>{t("chart.title", "Đường cong lãng quên")}</span>
                <span className="chart-caption">{t("chart.caption", "minh hoạ")}</span>
              </figcaption>
              <svg
                className="chart"
                viewBox="0 0 320 132"
                role="img"
                aria-labelledby="chartSvgTitle chartSvgDesc"
              >
                <title id="chartSvgTitle">So sánh ghi nhớ khi không ôn và khi ôn theo lịch</title>
                <desc id="chartSvgDesc">
                  Không ôn, mức ghi nhớ giảm nhanh trong vài ngày. Ôn đúng lúc, đường ghi nhớ được kéo dài qua các mốc ngày 1, 7 và 30.
                </desc>
                <g stroke="rgba(216,172,90,.18)" strokeWidth="1">
                  <line x1="24" y1="20" x2="304" y2="20" />
                  <line x1="24" y1="62" x2="304" y2="62" />
                  <line x1="24" y1="104" x2="304" y2="104" />
                </g>
                <path
                  d="M24 20 C 70 34 96 66 128 84 C 172 106 232 112 304 116"
                  fill="none"
                  stroke="#b0754a"
                  strokeWidth="2"
                  strokeDasharray="5 4"
                />
                <path
                  d="M24 20 C 54 38 66 60 78 70 L 78 34 C 104 50 116 64 128 70 L 128 40 C 168 58 190 68 208 72 L 208 46 C 250 62 278 68 304 70"
                  fill="none"
                  stroke="#d8ac5a"
                  strokeWidth="2.2"
                />
                <g fill="#8d7a58" fontSize="9" fontFamily="EB Garamond, serif">
                  <text x="22" y="126">1</text>
                  <text x="122" y="126">7</text>
                  <text x="296" y="126">30</text>
                </g>
                <g fontSize="9.5" fontFamily="EB Garamond, serif">
                  <circle cx="32" cy="40" r="2.4" fill="#b0754a" />
                  <text x="40" y="43" fill="#b7a382">
                    {t("chart.none", "Không ôn")}
                  </text>
                  <circle cx="140" cy="40" r="2.4" fill="#d8ac5a" />
                  <text x="148" y="43" fill="#d7bd8d">
                    {t("chart.with", "Có ôn")}
                  </text>
                </g>
              </svg>
            </figure>
          </div>
        </article>

        {/* Chapter 2: The Daily Ritual */}
        <article className={`chapter ${activeStage === 2 ? "is-active" : ""}`} data-stage="2">
          <div className="chapter-inner">
            <p className="chapter-label">
              <span className="chapter-numeral">II</span>
              <span>{t("ch2.label", "Chương II · Nghi lễ mỗi ngày")}</span>
            </p>
            <h2
              className="display"
              dangerouslySetInnerHTML={{
                __html: t("ch2.title", "Năm phút,<br><em>mỗi ngày.</em>"),
              }}
            />
            <p className="lede">
              {t(
                "ch2.body",
                "Không cần học dồn. Thêm từ khi gặp, để SM-2 hẹn ngày ôn, và giữ ngọn lửa chuỗi ngày. Ba bước nhỏ, lặp lại đủ lâu, thành phản xạ.",
              )}
            </p>

            <ol className="steps">
              <li>
                <span className="step-num">01</span>
                <span className="step-body">
                  <strong>{t("step1.title", "Ghi từ")}</strong>
                  <span>{t("step1.body", "Lưu từ mới kèm câu bạn gặp nó.")}</span>
                </span>
              </li>
              <li>
                <span className="step-num">02</span>
                <span className="step-body">
                  <strong>{t("step2.title", "Ôn đúng lúc")}</strong>
                  <span>{t("step2.body", "SM-2 hẹn ngày trước khi bạn quên.")}</span>
                </span>
              </li>
              <li>
                <span className="step-num">03</span>
                <span className="step-body">
                  <strong>{t("step3.title", "Giữ nhịp")}</strong>
                  <span>{t("step3.body", "Chuỗi ngày và khiên đóng băng giữ thói quen.")}</span>
                </span>
              </li>
            </ol>

            <div className={`flashcard ${flipped ? "flipped" : ""}`} id="flashcard">
              <div className="flashcard-inner">
                <div className="flashcard-face flashcard-front" aria-hidden={flipped ? "true" : "false"}>
                  <span className="flashcard-kicker">{t("fc.kicker", "Thẻ học thử")}</span>
                  <strong className="flashcard-word">ubiquitous</strong>
                  <span className="flashcard-ipa">/juːˈbɪk.wɪ.təs/</span>
                </div>
                <div className="flashcard-face flashcard-back" aria-hidden={flipped ? "false" : "true"}>
                  <span className="flashcard-kicker">{t("fc.kickerBack", "Nghĩa & ngữ cảnh")}</span>
                  <strong className="flashcard-meaning">{t("fc.meaning", "có mặt ở khắp nơi")}</strong>
                  <span className="flashcard-example">
                    {t("fc.example", "“Smartphones have become ubiquitous in modern life.”")}
                  </span>
                </div>
              </div>
              <button
                className="flashcard-toggle"
                type="button"
                id="flashcardToggle"
                aria-expanded={flipped}
                aria-controls="flashcard"
                onClick={() => setFlipped(!flipped)}
              >
                {flipped ? t("fc.back", "Quay lại mặt trước") : t("fc.prompt", "Lật thẻ xem nghĩa")}
              </button>
            </div>
          </div>
        </article>

        {/* Chapter 3: The Trove */}
        <article className={`chapter ${activeStage === 3 ? "is-active" : ""}`} data-stage="3">
          <div className="chapter-inner chapter-wide">
            <p className="chapter-label">
              <span className="chapter-numeral">III</span>
              <span>{t("ch3.label", "Chương III · Kho tàng")}</span>
            </p>
            <h2
              className="display"
              dangerouslySetInnerHTML={{
                __html: t("ch3.title", "Một thư viện<br><em>trong túi áo.</em>"),
              }}
            />
            <p className="lede">
              {t(
                "ch3.body",
                "Sáu công cụ nhỏ, cùng một mục đích: kéo từ vựng từ trang giấy vào trí nhớ dài hạn.",
              )}
            </p>

            <ul className="feature-list">
              <li>
                <span className="feature-mark">I</span>
                <strong>{t("feat1.title", "SM-2")}</strong>
                <span>{t("feat1.body", "Lịch ôn tính theo độ dễ nhớ của từng từ.")}</span>
              </li>
              <li>
                <span className="feature-mark">II</span>
                <strong>{t("feat2.title", "Thẻ ngữ cảnh")}</strong>
                <span>{t("feat2.body", "Câu ví dụ, cụm từ và phát âm IPA chuẩn.")}</span>
              </li>
              <li>
                <span className="feature-mark">III</span>
                <strong>{t("feat3.title", "Ôn đa dạng")}</strong>
                <span>{t("feat3.body", "Trắc nghiệm, nghe chính tả, điền chỗ trống.")}</span>
              </li>
              <li>
                <span className="feature-mark">IV</span>
                <strong>{t("feat4.title", "Tra cứu AI")}</strong>
                <span>{t("feat4.body", "Một từ mới thành thẻ đầy đủ trong vài giây.")}</span>
              </li>
              <li>
                <span className="feature-mark">V</span>
                <strong>{t("feat5.title", "Bản đồ nhiệt")}</strong>
                <span>{t("feat5.body", "Nhìn thấy sự kiên trì qua từng tuần.")}</span>
              </li>
              <li>
                <span className="feature-mark">VI</span>
                <strong>{t("feat6.title", "Học offline")}</strong>
                <span>{t("feat6.body", "Ôn trên xe bus, đồng bộ khi có mạng.")}</span>
              </li>
            </ul>

            <p className="pathways">
              <span>{t("ch3.pathways", "Bốn lộ trình:")} </span>
              IELTS &amp; TOEFL · <span>{t("ch3.convo", "Giao tiếp")}</span> ·{" "}
              <span>{t("ch3.biz", "Thương mại")}</span> · <span>{t("ch3.free", "Tự do đọc sách")}</span>
            </p>
          </div>
        </article>

        {/* Chapter 4: The Vow */}
        <article className={`chapter ${activeStage === 4 ? "is-active" : ""}`} data-stage="4">
          <div className="chapter-inner">
            <p className="chapter-label">
              <span className="chapter-numeral">IV</span>
              <span>{t("ch4.label", "Chương IV · Lời thề")}</span>
            </p>
            <h2
              className="display"
              dangerouslySetInnerHTML={{
                __html: t("ch4.title", "Dữ liệu<br><em>thuộc về bạn.</em>"),
              }}
            />
            <p className="lede">
              {t(
                "ch4.body",
                "Không khóa dữ liệu, không thu phí trên vốn từ bạn đã tạo. Xuất toàn bộ thẻ sang Anki, CSV hoặc JSON bất cứ lúc nào; học offline khi không có mạng.",
              )}
            </p>
            <div className="vow-row">
              <svg className="seal" viewBox="0 0 96 96" role="presentation" aria-hidden="true">
                <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="48" cy="48" r="38" fill="none" stroke="currentColor" strokeWidth="0.6" opacity=".6" />
                <path
                  d="M48 22c5 8 11 12 11 21a11 11 0 0 1-22 0c0-7 4-12 11-21z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M38 68c4-3 16-3 20 0M40 62c3-2 13-2 16 0"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                  opacity=".8"
                />
              </svg>
              <div>
                <p className="vow-title">{t("ch4.vowTitle", "Xuất được, mang đi được, giữ được.")}</p>
                <p className="vow-body">{t("ch4.vowBody", "Anki (.apkg) · CSV · JSON · Đồng bộ ngoại tuyến")}</p>
              </div>
            </div>
          </div>
        </article>
        <div className="chapter-tail" aria-hidden="true"></div>
      </div>
    </section>
  );
}
