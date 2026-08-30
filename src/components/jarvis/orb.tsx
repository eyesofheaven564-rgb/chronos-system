import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import type { AssistantState } from "@/types/jarvis";

type NeuralPoint = {
  latitude: number;
  longitude: number;
  phase: number;
  size: number;
};

const STATE_SPEED: Record<AssistantState, number> = {
  idle: 0.00008,
  listening: 0.00016,
  thinking: 0.0003,
  executing: 0.00038,
  responding: 0.0002,
};

const STATE_ENERGY: Record<AssistantState, number> = {
  idle: 0.48,
  listening: 0.72,
  thinking: 1,
  executing: 1,
  responding: 0.82,
};

function NeuralCanvas({ state }: { state: AssistantState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointCount = 154;
    const points: NeuralPoint[] = Array.from({ length: pointCount }, (_, index) => {
      const y = 1 - (index / (pointCount - 1)) * 2;
      return {
        latitude: Math.acos(y),
        longitude: Math.PI * (1 + Math.sqrt(5)) * index,
        phase: Math.random() * Math.PI * 2,
        size: 0.55 + Math.random() * 1.25,
      };
    });

    let frame = 0;
    let width = 0;
    let height = 0;
    let color = "#e8a23a";
    let secondaryColor = "#ffd58a";

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const styles = getComputedStyle(canvas);
      color = styles.getPropertyValue("--neural-energy").trim() || color;
      secondaryColor = styles.getPropertyValue("--neural-core").trim() || secondaryColor;
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.33;
      const speed = motionQuery.matches ? 0 : STATE_SPEED[state];
      const energy = STATE_ENERGY[state];
      const rotation = time * speed;

      const projected = points.map((point) => {
        const wave = Math.sin(time * 0.0018 + point.phase) * radius * 0.055 * energy;
        const sphereRadius = radius + wave;
        const x3 = Math.sin(point.latitude) * Math.cos(point.longitude + rotation);
        const y3 = Math.cos(point.latitude);
        const z3 = Math.sin(point.latitude) * Math.sin(point.longitude + rotation);
        const perspective = 0.72 + (z3 + 1) * 0.15;
        return {
          x: centerX + x3 * sphereRadius * perspective,
          y: centerY + y3 * sphereRadius * perspective,
          z: z3,
          size: point.size,
        };
      });

      context.globalCompositeOperation = "lighter";
      context.lineWidth = 0.55;

      for (let i = 0; i < projected.length; i += 1) {
        const first = projected[i];
        for (let j = i + 1; j < projected.length; j += 1) {
          const second = projected[j];
          const distance = Math.hypot(first.x - second.x, first.y - second.y);
          if (distance > radius * 0.29) continue;
          const depth = Math.max(0.12, (first.z + second.z + 2) / 4);
          context.globalAlpha = (1 - distance / (radius * 0.29)) * depth * 0.48 * energy;
          context.strokeStyle = color;
          context.beginPath();
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);
          context.stroke();
        }
      }

      projected
        .sort((a, b) => a.z - b.z)
        .forEach((point, index) => {
          const pulse = 0.65 + Math.sin(time * 0.0025 + index) * 0.35;
          const depth = 0.38 + (point.z + 1) * 0.32;
          context.globalAlpha = depth * energy;
          context.fillStyle = index % 8 === 0 ? secondaryColor : color;
          context.beginPath();
          context.arc(point.x, point.y, point.size * (0.75 + pulse), 0, Math.PI * 2);
          context.fill();
        });

      const core = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.72);
      core.addColorStop(0, secondaryColor);
      core.addColorStop(0.12, color);
      core.addColorStop(0.38, "transparent");
      context.globalAlpha = 0.2 + energy * 0.12;
      context.fillStyle = core;
      context.beginPath();
      context.arc(centerX, centerY, radius * 0.72, 0, Math.PI * 2);
      context.fill();

      context.globalCompositeOperation = "source-over";
      context.globalAlpha = 1;
      frame = window.requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    frame = window.requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [state]);

  return <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden="true" />;
}

export function Orb({ state }: { state: AssistantState }) {
  const active = state !== "idle";

  return (
    <div
      className={cn(
        "neural-orb relative grid size-56 place-items-center sm:size-72",
        active && "neural-orb-active",
        (state === "thinking" || state === "executing") && "neural-orb-intense",
      )}
      role="img"
      aria-label={`JARVIS neural core: ${state}`}
    >
      <div className="neural-orb-aura absolute inset-[14%] rounded-full" />
      <div className="neural-orb-halo absolute inset-[9%] rounded-full" />
      <NeuralCanvas state={state} />
      <div className="neural-orb-ring neural-orb-ring-one absolute inset-[21%] rounded-full" />
      <div className="neural-orb-ring neural-orb-ring-two absolute inset-[25%] rounded-full" />
      <div className="neural-orb-core absolute size-[15%] rounded-full" />
    </div>
  );
}