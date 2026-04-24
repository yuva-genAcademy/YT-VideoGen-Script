import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import { C } from '../colors';

// ─── Vertical layout audit (1280×720 canvas) ──────────────────────────────
// Title div:         y = 28  → 85   (Georgia 38px bold + 11px underline)
// Minimum SVG start: y = 102          (≥17px gap from title bottom)
//
// Input pill:        y = 102 → 128   (height 26)
// Arrow:             y = 128 → 196   (68px, starts at pill bottom, ends at ORC top)
// ORC glow:          y = 184 → 352   (r=72 + glow 12 = 84)
// ORC circle:        y = 196 → 340   (y=268, r=72)
// [gap 12px]
// Badge:             y = 352 → 396   (height 44)
// [gap 26px]
// Worker glow:       y = 410 → 550   (y=480, r=58+glow 12=70)
// Worker circle:     y = 422 → 538   (y=480, r=58)
// Lines→pills:       y = 538 → 566
// Tool pills:        y = 563 → 600   (rect y-12 to y+12)
// [gap ≥13px]
// Description panel: y = 613 → 720   (bottom:28, height≈79)
// ─────────────────────────────────────────────────────────────────────────

const ORC = { x: 640, y: 268, r: 72 };
const INPUT_RECT = { x: 560, y: 102, w: 160, h: 26 }; // bottom = 128
const INPUT_ARROW_Y1 = INPUT_RECT.y + INPUT_RECT.h;    // 128 — pill bottom edge
const ORC_TOP = ORC.y - ORC.r;                         // 196

const WORKERS = [
  { x: 215,  y: 480, r: 58, label: 'Planner',  sub: 'Decompose task', emoji: '📋', color: C.purple },
  { x: 640,  y: 480, r: 58, label: 'Executor', sub: 'Run actions',    emoji: '⚙️',  color: C.blue   },
  { x: 1065, y: 480, r: 58, label: 'Reviewer', sub: 'Verify quality', emoji: '🔍', color: C.green  },
];

// Worker bottom = 480+58 = 538; tool pills start at y≈566 (pill y-12)
const WORKER_TOOLS = [
  [
    { x:  90, y: 578, label: 'Plan',   color: C.purple },
    { x: 215, y: 590, label: 'Reason', color: C.purple },
    { x: 340, y: 578, label: 'Break',  color: C.purple },
  ],
  [
    { x: 510, y: 578, label: 'APIs', color: C.blue },
    { x: 640, y: 590, label: 'Code', color: C.blue },
    { x: 770, y: 578, label: 'DB',   color: C.blue },
  ],
  [
    { x:  940, y: 578, label: 'QA',   color: C.green },
    { x: 1065, y: 590, label: 'Test', color: C.green },
    { x: 1190, y: 578, label: 'Lint', color: C.green },
  ],
];

function lineLen(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

type NodeProps = {
  x: number; y: number; r: number;
  label: string; sub?: string; emoji?: string;
  scale: number; color?: string; bgColor?: string;
};

const Node: React.FC<NodeProps> = ({ x, y, r, label, sub, emoji, scale, color = C.blue, bgColor = C.blueDeep }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <circle r={r + 12} fill={color} opacity={0.08} />
    <circle r={r} fill={bgColor} stroke={color} strokeWidth={2.5} />
    {emoji && (
      <text x={0} y={sub ? -15 : -5} textAnchor="middle" dominantBaseline="middle" fontSize={r * 0.45}>
        {emoji}
      </text>
    )}
    <text
      x={0} y={emoji ? r * 0.2 : (sub ? -6 : 4)}
      textAnchor="middle" dominantBaseline="middle"
      fill={C.text} fontSize={r * 0.28} fontWeight="bold"
      fontFamily="system-ui, sans-serif"
    >
      {label}
    </text>
    {sub && (
      <text
        x={0} y={emoji ? r * 0.5 : 12}
        textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={r * 0.2}
        fontFamily="system-ui, sans-serif"
      >
        {sub}
      </text>
    )}
  </g>
);

type AnimLineProps = {
  x1: number; y1: number; x2: number; y2: number;
  progress: number; color?: string; strokeWidth?: number;
};

const AnimLine: React.FC<AnimLineProps> = ({ x1, y1, x2, y2, progress, color = C.blue, strokeWidth = 2 }) => {
  const len = lineLen(x1, y1, x2, y2);
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth={strokeWidth} opacity={0.6}
      strokeDasharray={len} strokeDashoffset={len * (1 - progress)}
      strokeLinecap="round"
    />
  );
};

type FlowDotProps = {
  x1: number; y1: number; x2: number; y2: number;
  t: number; color: string; visible: boolean;
};

const FlowDot: React.FC<FlowDotProps> = ({ x1, y1, x2, y2, t, color, visible }) => {
  if (!visible) return null;
  return (
    <circle
      cx={x1 + (x2 - x1) * t}
      cy={y1 + (y2 - y1) * t}
      r={7}
      fill={color}
      opacity={0.95}
    />
  );
};

type ToolPillProps = { x: number; y: number; label: string; color: string; opacity: number };
const ToolPill: React.FC<ToolPillProps> = ({ x, y, label, color, opacity }) => (
  <g opacity={opacity}>
    <rect x={x - 28} y={y - 12} width={56} height={24} rx={12} fill={C.surface} stroke={color} strokeWidth={1.2} />
    <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={11} fontFamily="system-ui, sans-serif">
      {label}
    </text>
  </g>
);

export const MultiAgentScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 15-frame fade in/out aligned with crossfade overlap in AgentArchitecture
  const fadeIn  = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [2685, 2700], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 18], [16, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  const inputOpacity = interpolate(frame, [10, 28], [0, 1], { extrapolateRight: 'clamp' });
  const inputArrow   = interpolate(frame, [22, 42], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  const orcSpring = spring({ frame: frame - 18, fps, config: { damping: 14 }, durationInFrames: 35 });

  const workerSprings = WORKERS.map((_, i) =>
    spring({ frame: frame - 55 - i * 12, fps, config: { damping: 15 }, durationInFrames: 30 }),
  );

  const orcLineProgress = WORKERS.map((_, i) =>
    interpolate(frame, [78 + i * 10, 108 + i * 10], [0, 1], {
      extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
      easing: Easing.inOut(Easing.quad),
    }),
  );

  const toolsOpacity = interpolate(frame, [120, 145], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const toolOpacities = WORKER_TOOLS.flat().map((_, i) =>
    interpolate(frame, [120 + i * 4, 138 + i * 4], [0, 1], {
      extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
    }),
  );

  const showDots = frame > 112;
  const cycle = 38;
  const dotTs = WORKERS.map((_, i) => ((frame + i * 13) % cycle) / cycle);

  const parallelOpacity = interpolate(frame, [148, 168], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const parallelPulse = 0.85 + 0.15 * Math.sin((frame / 8) * Math.PI);

  const descOpacity = interpolate(frame, [95, 118], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>
      {/* Dot grid background */}
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', top: 0, left: 0 }}>
        {Array.from({ length: 25 }, (_, xi) =>
          Array.from({ length: 15 }, (_, yi) => (
            <circle key={`d${xi}-${yi}`} cx={xi * 55 + 15} cy={yi * 55 + 15} r={1.2} fill={C.purple} opacity={0.07} />
          )),
        )}
      </svg>

      {/* Diagram SVG */}
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', top: 0, left: 0 }}>

        {/* Input pill → ORC arrow: starts exactly at pill bottom edge (y=128) */}
        <AnimLine
          x1={640} y1={INPUT_ARROW_Y1}
          x2={ORC.x} y2={ORC_TOP}
          progress={inputArrow} color={C.blue} strokeWidth={2.5}
        />

        {/* ORC → worker lines */}
        {WORKERS.map((worker, i) => (
          <AnimLine
            key={`wline${i}`}
            x1={ORC.x} y1={ORC.y + ORC.r}
            x2={worker.x} y2={worker.y - worker.r}
            progress={orcLineProgress[i]}
            color={worker.color}
            strokeWidth={2}
          />
        ))}

        {/* Worker → tool micro-lines */}
        {WORKER_TOOLS.map((tools, wi) =>
          tools.map((tool, ti) => {
            const worker = WORKERS[wi];
            const prog = toolsOpacity;
            const len = lineLen(worker.x, worker.y + worker.r, tool.x, tool.y - 12);
            return (
              <line
                key={`tl${wi}-${ti}`}
                x1={worker.x} y1={worker.y + worker.r}
                x2={tool.x} y2={tool.y - 12}
                stroke={tool.color} strokeWidth={1.2} opacity={0.4 * prog}
                strokeDasharray={len} strokeDashoffset={len * (1 - prog)}
              />
            );
          }),
        )}

        {/* Parallel flow dots (phase-offset per worker) */}
        {WORKERS.map((worker, i) => (
          <FlowDot
            key={`fdot${i}`}
            x1={ORC.x} y1={ORC.y + ORC.r}
            x2={worker.x} y2={worker.y - worker.r}
            t={dotTs[i]} color={worker.color} visible={showDots}
          />
        ))}

        {/* Tool pills */}
        {WORKER_TOOLS.map((tools, wi) =>
          tools.map((tool, ti) => (
            <ToolPill
              key={`tp${wi}-${ti}`}
              x={tool.x} y={tool.y}
              label={tool.label} color={tool.color}
              opacity={toolOpacities[wi * 3 + ti]}
            />
          )),
        )}

        {/* Worker nodes */}
        {WORKERS.map((worker, i) => (
          <Node key={`w${i}`} {...worker} scale={workerSprings[i]} bgColor={C.blueDeep} />
        ))}

        {/* Orchestrator */}
        <Node
          x={ORC.x} y={ORC.y} r={ORC.r}
          label="Orchestrator" sub="Coordinates all"
          emoji="🧩"
          scale={orcSpring}
          color={C.purple}
          bgColor={C.purpleDeep}
        />

        {/* Input pill — 17px gap below title bottom (y=85), rect top at y=102 */}
        <g opacity={inputOpacity}>
          <rect
            x={INPUT_RECT.x} y={INPUT_RECT.y}
            width={INPUT_RECT.w} height={INPUT_RECT.h}
            rx={8}
            fill={C.blueDeep} stroke={C.blue} strokeWidth={1.5}
          />
          <text
            x={INPUT_RECT.x + INPUT_RECT.w / 2}
            y={INPUT_RECT.y + INPUT_RECT.h / 2 + 1}
            textAnchor="middle" dominantBaseline="middle"
            fill={C.blue} fontSize={12} fontWeight="bold" fontFamily="system-ui, sans-serif"
          >
            📥 User Task
          </text>
        </g>

        {/* Parallel badge — y=352–396, between ORC bottom (340) and worker tops (422) */}
        <g opacity={parallelOpacity * parallelPulse}>
          <rect x={490} y={352} width={300} height={44} rx={22} fill={C.greenDeep} stroke={C.green} strokeWidth={1.8} />
          <text x={640} y={368} textAnchor="middle" dominantBaseline="middle"
            fill={C.green} fontSize={13} fontWeight="bold" fontFamily="system-ui, sans-serif">
            ⚡ Parallel Execution
          </text>
          <text x={640} y={384} textAnchor="middle" dominantBaseline="middle"
            fill={C.green} fontSize={12} fontFamily="system-ui, sans-serif">
            3 agents work simultaneously
          </text>
        </g>
      </svg>

      {/* Title — rendered on top of SVG via DOM order */}
      <div
        style={{
          position: 'absolute',
          top: 28,
          left: 0, right: 0,
          textAlign: 'center',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: 'Georgia, serif',
          fontSize: 38,
          fontWeight: 700,
          color: C.text,
          letterSpacing: '-0.5px',
        }}
      >
        Multi-Agent Architecture
        <div style={{ height: 3, width: 260, background: C.purple, margin: '8px auto 0', borderRadius: 2 }} />
      </div>

      {/* Description panel */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          left: 60, right: 60,
          opacity: descOpacity,
          display: 'flex',
          gap: 24,
          justifyContent: 'center',
        }}
      >
        {[
          { icon: '🔀', label: 'Parallel',    desc: 'Agents work simultaneously' },
          { icon: '🧩', label: 'Specialized', desc: 'Each agent has a clear role' },
          { icon: '📈', label: 'Scalable',    desc: 'Add agents as tasks grow'   },
        ].map(({ icon, label, desc }) => (
          <div
            key={label}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '10px 22px',
              textAlign: 'center',
              minWidth: 180,
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: 'system-ui, sans-serif' }}>
              {label}
            </div>
            <div style={{ fontSize: 12, color: C.muted, fontFamily: 'system-ui, sans-serif', marginTop: 2 }}>
              {desc}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
