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
    let beamColor = "#6dd9ff";

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
      beamColor = styles.getPropertyValue("--neural-beam").trim() || beamColor;
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.33;
      const speed = motionQuery.matches ? 0 : STATE_SPEED[state];
      const energy = STATE_ENERGY[state];
      const rotation = time * speed;

      context.globalCompositeOperation = "lighter";

      // Electrical signal passing through the neural field.
      for (let strand = 0; strand < 7; strand += 1) {
        context.beginPath();
        for (let x = 0; x <= width; x += 3) {
          const proximity = 1 - Math.min(1, Math.abs(x - centerX) / (radius * 2.7));
          const turbulence = Math.sin(x * 0.055 + time * 0.003 + strand * 1.7) * (3 + proximity * 5);
          const micro = Math.sin(x * 0.21 - time * 0.006 + strand) * 1.8;
          const y = centerY + turbulence + micro + (strand - 3) * 1.35;
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.globalAlpha = (0.08 + strand * 0.018) * energy;
        context.lineWidth = strand === 3 ? 1.2 : 0.48;
        context.strokeStyle = beamColor;
        context.stroke();
      }

      // Fine meridians and latitude filaments create the engineered spherical cage.
      context.lineWidth = 0.52;
      for (let meridian = 0; meridian < 19; meridian += 1) {
        context.beginPath();
        const angle = (meridian / 19) * Math.PI + rotation * 3;
        for (let step = 0; step <= 72; step += 1) {
          const latitude = (step / 72) * Math.PI;
          const x3 = Math.sin(latitude) * Math.cos(angle);
          const y3 = Math.cos(latitude);
          const z3 = Math.sin(latitude) * Math.sin(angle);
          const distortion = Math.sin(latitude * 9 + time * 0.0015 + meridian) * radius * 0.018;
          const perspective = 0.72 + (z3 + 1) * 0.15;
          const x = centerX + x3 * (radius + distortion) * perspective;
          const y = centerY + y3 * (radius + distortion) * perspective;
          if (step === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.globalAlpha = (0.075 + (meridian % 4) * 0.025) * energy;
        context.strokeStyle = color;
        context.stroke();
      }

      for (let latitudeIndex = 1; latitudeIndex < 14; latitudeIndex += 1) {
        const latitude = (latitudeIndex / 14) * Math.PI;
        context.beginPath();
        for (let step = 0; step <= 96; step += 1) {
          const longitude = (step / 96) * Math.PI * 2 + rotation * 2;
          const wobble = Math.sin(longitude * 6 + time * 0.001 + latitudeIndex) * radius * 0.014;
          const x3 = Math.sin(latitude) * Math.cos(longitude);
          const y3 = Math.cos(latitude);
          const z3 = Math.sin(latitude) * Math.sin(longitude);
          const perspective = 0.72 + (z3 + 1) * 0.15;
          const x = centerX + x3 * (radius + wobble) * perspective;
          const y = centerY + y3 * (radius + wobble) * perspective;
          if (step === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.globalAlpha = 0.1 * energy;
        context.strokeStyle = color;
        context.stroke();
      }

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

      context.lineWidth = 0.55;

      for (let i = 0; i < projected.length; i += 1) {
        const first = projected[i];
        if (!first) continue;
        for (let j = i + 1; j < projected.length; j += 1) {
          const second = projected[j];
          if (!second) continue;
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

      // Bright irregular bands near the center suggest layered cognition rather than a solid planet.
      for (let band = 0; band < 11; band += 1) {
        const bandRadius = radius * (0.18 + band * 0.035);
        context.beginPath();
        for (let step = 0; step <= 56; step += 1) {
          const angle = (step / 56) * Math.PI * 2;
          const noise = Math.sin(angle * (3 + (band % 4)) + time * 0.002 + band) * radius * 0.025;
          const x = centerX + Math.cos(angle) * (bandRadius + noise);
          const y = centerY + Math.sin(angle) * (bandRadius * 0.58 + noise);
          if (step === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.globalAlpha = (0.09 + band * 0.012) * energy;
        context.lineWidth = band % 3 === 0 ? 1.15 : 0.55;
        context.strokeStyle = band % 4 === 0 ? secondaryColor : color;
        context.stroke();
      }

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

  return (
    <canvas
      ref={canvasRef}
      className="absolute left-1/2 top-0 h-full w-[170%] max-w-none -translate-x-1/2"
      aria-hidden="true"
    />
  );
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
      <div className="neural-orb-core absolute size-[8%] rounded-full" />
    </div>
  );
}