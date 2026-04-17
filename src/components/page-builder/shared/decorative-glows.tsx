import type { DecorativeGlow } from "@/lib/page-builder/types";

interface DecorativeGlowsProps {
  glows?: DecorativeGlow[];
  borderRadius?: string | number;
}

/**
 * Renders absolutely-positioned radial gradient glows inside a section.
 * Used to recreate hero accent lighting (e.g., orange top-right + peach bottom-left)
 * as separate decorative pseudo-element-like layers.
 */
export function DecorativeGlows({ glows, borderRadius }: DecorativeGlowsProps) {
  if (!glows || glows.length === 0) return null;

  return (
    <>
      {glows.map((glow, idx) => {
        const fade = glow.fade ?? 70;
        const offsetX = glow.offsetX ?? -10;
        const offsetY = glow.offsetY ?? -20;

        const positionStyle: React.CSSProperties = {};
        switch (glow.position) {
          case "top-left":
            positionStyle.top = `${offsetY}%`;
            positionStyle.left = `${offsetX}%`;
            break;
          case "top-right":
            positionStyle.top = `${offsetY}%`;
            positionStyle.right = `${offsetX}%`;
            break;
          case "bottom-left":
            positionStyle.bottom = `${offsetY}%`;
            positionStyle.left = `${offsetX}%`;
            break;
          case "bottom-right":
            positionStyle.bottom = `${offsetY}%`;
            positionStyle.right = `${offsetX}%`;
            break;
          case "center":
            positionStyle.top = "50%";
            positionStyle.left = "50%";
            positionStyle.transform = "translate(-50%, -50%)";
            break;
        }

        return (
          <div
            key={idx}
            className="absolute pointer-events-none"
            style={{
              ...positionStyle,
              width: `${glow.size}px`,
              height: `${glow.size}px`,
              background: `radial-gradient(circle, ${glow.color} 0%, transparent ${fade}%)`,
              opacity: glow.opacity ?? 1,
              borderRadius,
            }}
          />
        );
      })}
    </>
  );
}
