import React, { useMemo } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  isAmber?: boolean;
}

export const StarrySky: React.FC = () => {
  // Generate deterministic stars across the canvas
  const stars = useMemo<Star[]>(() => {
    const list: Star[] = [];
    const count = 120;
    for (let i = 0; i < count; i++) {
      // pseudo-random with stable seeds
      const x = Math.round(((i * 37 + 13) % 100) * 10) / 10;
      const y = Math.round(((i * 73 + 29) % 100) * 10) / 10;
      const size = i % 7 === 0 ? 2.5 : i % 3 === 0 ? 1.8 : 1.2;
      const opacity = 0.35 + (i % 5) * 0.12;
      const duration = 2.5 + (i % 4) * 1.2;
      const delay = (i * 0.25) % 5;
      const isAmber = i % 11 === 0;

      list.push({ id: i, x, y, size, opacity, duration, delay, isAmber });
    }
    return list;
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Deep Cosmos Radial Nebulae */}
      <div className="absolute inset-0 bg-[#060e1a]" />

      {/* Cosmic Nebula Glow Layer 1 - Deep Midnight Blue */}
      <div
        className="absolute -top-[20%] left-[10%] w-[800px] h-[800px] rounded-full opacity-35 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(14, 80, 160, 0.45) 0%, rgba(6, 30, 70, 0.1) 65%, transparent 80%)",
        }}
      />

      {/* Cosmic Nebula Glow Layer 2 - Warm Amber Starlight Hue */}
      <div
        className="absolute top-[40%] right-[5%] w-[700px] h-[700px] rounded-full opacity-25 blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(245, 166, 35, 0.35) 0%, rgba(200, 120, 20, 0.08) 55%, transparent 75%)",
        }}
      />

      {/* Cosmic Nebula Glow Layer 3 - Subtle Violet Horizon */}
      <div
        className="absolute bottom-[5%] left-[15%] w-[900px] h-[600px] rounded-full opacity-20 blur-[150px]"
        style={{
          background:
            "radial-gradient(circle, rgba(56, 110, 220, 0.35) 0%, rgba(10, 40, 90, 0.1) 60%, transparent 80%)",
        }}
      />

      {/* Twinkling Star Field */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.isAmber ? "#ffd166" : "#ffffff",
              boxShadow:
                star.size > 2
                  ? star.isAmber
                    ? "0 0 6px 1px rgba(245, 166, 35, 0.7)"
                    : "0 0 5px 1px rgba(255, 255, 255, 0.8)"
                  : "none",
              opacity: star.opacity,
              animation: `star-twinkle ${star.duration}s ease-in-out ${star.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Shooting Stars (Meteors) */}
      <div className="shooting-star shooting-star-1" />
      <div className="shooting-star shooting-star-2" />
      <div className="shooting-star shooting-star-3" />
    </div>
  );
};
