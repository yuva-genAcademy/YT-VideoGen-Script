import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import { GA } from '../gaColors';

export const MULTI_AGENT_SCENE_DURATION = 2700;

// ─── Vertical layout audit (1280×720 canvas) ──────────────────────────────
// Title div:         y = 28  → 85   (Helvetica Neue 38px bold + 11px underline)
// Input pill:        y = 102 → 128  (height 26)
// Arrow:             y = 128 → 196  (68px)
// ORC glow:          y = 184 → 352  (r=72 + glow=12)
// ORC circle:        y = 196 → 340  (y=268, r=72)
// Parallel badge:    y = 352 → 396  (between ORC and workers)
// Worker glow:       y = 410 → 550  (y=480, r=58+12)
// Worker circle:     y = 422 → 538  (y=480, r=58)
// Tool pills:        y = 563 → 600
// Description panel: y = 613 → 720  (bottom:28)
// ──────────────────────────────────────────────────────────────────────────

const ORC = { x: 640, y: 268, r: 72 };
const INPUT_RECT = { x: 560, y: 102, w: 160, h: 26 };
const INPUT_ARROW_Y1 = INPUT_RECT.y + INPUT_RECT.h;  // 128
const ORC_TOP = ORC.y - ORC.r;                       // 196

const WORKERS = [
  { x: 215,  y: 480, r: 58, label: 'Planner',  sub: 'Decompose task', emoji: '📋', color: GA.yellow     },
  { x: 640,  y: 480, r: 58, label: 'Executor', sub: 'Run actions',    emoji: '⚙️',  color: GA.softYellow },
  { x: 1065, y: 480, r: 58, label: 'Reviewer', sub: 'Verify quality', emoji: '🔍', color: GA.accent3    },
];

const WORKER_TOOLS = [
  [
    { x:  90, y: 578, label: 'Plan',   color: GA.yellow     },
    { x: 215, y: 590, label: 'Reason', color: GA.yellow     },
    { x: 340, y: 578, label: 'Break',  color: GA.yellow     },
  ],
  [
    { x: 510, y: 578, label: 'APIs', color: GA.softYellow },
    { x: 640, y: 590, label: 'Code', color: GA.softYellow },
    { x: 770, y: 578, label: 'DB',   color: GA.softYellow },
  ],
  [
    { x:  940, y: 578, label: 'QA',   color: GA.accent3 },
    { x: 1065, y: 590, label: 'Test', color: GA.accent3 },
    { x: 1190, y: 578, label: 'Lint', color: GA.accent3 },
  ],
];

// ─── EXACT FRAME TRIGGERS (script-synced at 160 wpm, 11.25 frames/word) ─────

// Input pill visible from start
const INPUT_IN = 70;

// Orchestrator scales in – just before narrator says "Orchestrator"
const ORCH_IN = 140;

// Task arrow from input to orchestrator
const TASK_ARROW_IN = 320;

// Worker nodes appear when narrator names them
const PLANNER_IN  = 645;
const EXECUTOR_IN = 667;
const REVIEWER_IN = 700;

// Connections from orchestrator to workers draw in
const CONNECTIONS_IN = 740;

// Data flow dots start
const DATA_FLOW_IN = 880;

// Worker spotlight frames
const PLANNER_SPOT_START  = 890;
const PLANNER_SPOT_END    = 1126;
const EXECUTOR_SPOT_START = 1126;
const EXECUTOR_SPOT_END   = 1420;
const REVIEWER_SPOT_START = 1420;
const REVIEWER_SPOT_END   = 1700;

// Parallel badge appears
const PARALLEL_BADGE_IN = 1805;

// Tool pills fade in
const TOOLS_IN = 2040;

// Description panel
const DESC_PANEL_IN = 2340;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function lineLen(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

type NodeProps = {
  x: number; y: number; r: number;
  label: string; sub?: string; emoji?: string;
  scale: number; color?: string; bgColor?: string; opacity?: number;
};

const Node: React.FC<NodeProps> = ({
  x, y, r, label, sub, emoji,
  scale, color = GA.yellow, bgColor = GA.accent1Deep, opacity = 1,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
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
      fill={GA.text} fontSize={r * 0.28} fontWeight="bold"
      fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
    >
      {label}
    </text>
    {sub && (
      <text
        x={0} y={emoji ? r * 0.5 : 12}
        textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={r * 0.2}
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
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

const AnimLine: React.FC<AnimLineProps> = ({ x1, y1, x2, y2, progress, color = GA.yellow, strokeWidth = 2 }) => {
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
    <rect x={x - 28} y={y - 12} width={56} height={24} rx={12} fill={GA.navy} stroke={color} strokeWidth={1.2} />
    <text
      x={x} y={y + 1}
      textAnchor="middle" dominantBaseline="middle"
      fill={color} fontSize={11} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
    >
      {label}
    </text>
  </g>
);

// ─── Main Scene ───────────────────────────────────────────────────────────────

export const MultiAgentScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade in/out (15-frame crossfade overlap)
  const fadeIn  = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [2685, 2700], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  // Title
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 18], [16, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // Input pill
  const inputOpacity = interpolate(frame, [INPUT_IN, INPUT_IN + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Task arrow from input pill to orchestrator
  const inputArrow = interpolate(frame, [TASK_ARROW_IN, TASK_ARROW_IN + 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Orchestrator spring
  const orcSpring = spring({ frame: frame - ORCH_IN, fps, config: { damping: 14 }, durationInFrames: 35 });

  // Worker springs
  const workerTriggers = [PLANNER_IN, EXECUTOR_IN, REVIEWER_IN];
  const workerSprings = workerTriggers.map((trigger) =>
    spring({ frame: frame - trigger, fps, config: { damping: 15 }, durationInFrames: 30 }),
  );

  // ORC → worker connection lines (staggered)
  const orcLineProgress = WORKERS.map((_, i) =>
    interpolate(
      frame,
      [CONNECTIONS_IN + i * 10, CONNECTIONS_IN + i * 10 + 30],
      [0, 1],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.inOut(Easing.quad),
      },
    ),
  );

  // Data flow dots
  const showDots = frame > DATA_FLOW_IN;
  const cycle = 38;
  const dotTs = WORKERS.map((_, i) => ((frame + i * 13) % cycle) / cycle);

  // ── Worker spotlight ──
  const plannerSpot = interpolate(
    frame,
    [PLANNER_SPOT_START, PLANNER_SPOT_START + 15, PLANNER_SPOT_END - 15, PLANNER_SPOT_END],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const executorSpot = interpolate(
    frame,
    [EXECUTOR_SPOT_START, EXECUTOR_SPOT_START + 15, EXECUTOR_SPOT_END - 15, EXECUTOR_SPOT_END],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const reviewerSpot = interpolate(
    frame,
    [REVIEWER_SPOT_START, REVIEWER_SPOT_START + 15, REVIEWER_SPOT_END - 15, REVIEWER_SPOT_END],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const anySpot = Math.max(plannerSpot, executorSpot, reviewerSpot);
  const plannerOpacity  = 1 - anySpot * (1 - plannerSpot)  * 0.6;
  const executorOpacity = 1 - anySpot * (1 - executorSpot) * 0.6;
  const reviewerOpacity = 1 - anySpot * (1 - reviewerSpot) * 0.6;
  const workerOpacities = [plannerOpacity, executorOpacity, reviewerOpacity];

  // Parallel badge
  const parallelOpacity = interpolate(frame, [PARALLEL_BADGE_IN, PARALLEL_BADGE_IN + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const parallelPulse = 0.85 + 0.15 * Math.sin((frame / 8) * Math.PI);

  // Tool pills
  const toolsBaseOpacity = interpolate(frame, [TOOLS_IN, TOOLS_IN + 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const toolOpacities = WORKER_TOOLS.flat().map((_, i) =>
    interpolate(frame, [TOOLS_IN + i * 4, TOOLS_IN + i * 4 + 18], [0, toolsBaseOpacity], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

  // Worker → tool micro-line opacity
  const toolLineOpacity = toolsBaseOpacity;

  // Description panel
  const descOpacity = interpolate(frame, [DESC_PANEL_IN, DESC_PANEL_IN + 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: GA.bg, opacity: sceneOpacity }}>
      {/* Dot grid background */}
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', top: 0, left: 0 }}>
        {Array.from({ length: 25 }, (_, xi) =>
          Array.from({ length: 15 }, (_, yi) => (
            <circle key={`d${xi}-${yi}`} cx={xi * 55 + 15} cy={yi * 55 + 15} r={1.2} fill={GA.yellow} opacity={0.04} />
          )),
        )}
      </svg>

      {/* Diagram SVG */}
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <marker id="ma2-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={GA.yellow} />
          </marker>
          <marker id="ma2-arrow-soft" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={GA.softYellow} />
          </marker>
        </defs>

        {/* Input pill → Orchestrator arrow */}
        <AnimLine
          x1={640} y1={INPUT_ARROW_Y1}
          x2={ORC.x} y2={ORC_TOP}
          progress={inputArrow} color={GA.yellow} strokeWidth={2.5}
        />

        {/* Orchestrator → worker lines */}
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
            const len = lineLen(worker.x, worker.y + worker.r, tool.x, tool.y - 12);
            return (
              <line
                key={`tl${wi}-${ti}`}
                x1={worker.x} y1={worker.y + worker.r}
                x2={tool.x} y2={tool.y - 12}
                stroke={tool.color} strokeWidth={1.2}
                opacity={0.4 * toolLineOpacity}
                strokeDasharray={len}
                strokeDashoffset={len * (1 - toolLineOpacity)}
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

        {/* Worker nodes (with spotlight opacity) */}
        {WORKERS.map((worker, i) => (
          <Node
            key={`w${i}`}
            {...worker}
            scale={workerSprings[i]}
            bgColor={GA.accent1Deep}
            opacity={workerOpacities[i]}
          />
        ))}

        {/* Orchestrator */}
        <Node
          x={ORC.x} y={ORC.y} r={ORC.r}
          label="Orchestrator" sub="Coordinates all"
          emoji="🧩"
          scale={orcSpring}
          color={GA.yellow}
          bgColor={GA.accent1Deep}
        />

        {/* Input pill – 17px gap below title (y=85), rect top at y=102 */}
        <g opacity={inputOpacity}>
          <rect
            x={INPUT_RECT.x} y={INPUT_RECT.y}
            width={INPUT_RECT.w} height={INPUT_RECT.h}
            rx={8}
            fill={GA.accent1Deep} stroke={GA.yellow} strokeWidth={1.5}
          />
          <text
            x={INPUT_RECT.x + INPUT_RECT.w / 2}
            y={INPUT_RECT.y + INPUT_RECT.h / 2 + 1}
            textAnchor="middle" dominantBaseline="middle"
            fill={GA.yellow} fontSize={12} fontWeight="bold" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          >
            📥 User Task
          </text>
        </g>

        {/* Parallel badge – between ORC bottom (340) and worker tops (422) */}
        <g opacity={parallelOpacity * parallelPulse}>
          <rect x={490} y={352} width={300} height={44} rx={22} fill={GA.accent1Deep} stroke={GA.yellow} strokeWidth={1.8} />
          <text
            x={640} y={368}
            textAnchor="middle" dominantBaseline="middle"
            fill={GA.yellow} fontSize={13} fontWeight="bold" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          >
            ⚡ Parallel Execution
          </text>
          <text
            x={640} y={384}
            textAnchor="middle" dominantBaseline="middle"
            fill={GA.yellow} fontSize={12} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          >
            3 agents work simultaneously
          </text>
        </g>
      </svg>

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 28,
          left: 0, right: 0,
          textAlign: 'center',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: 38,
          fontWeight: 700,
          color: GA.text,
          letterSpacing: '-0.5px',
        }}
      >
        Multi-Agent Architecture
        <div style={{ height: 3, width: 260, background: GA.softYellow, margin: '8px auto 0', borderRadius: 2 }} />
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
          { icon: '🧩', label: 'Specialized', desc: 'Each agent has a clear role'  },
          { icon: '📈', label: 'Scalable',    desc: 'Add agents as tasks grow'     },
        ].map(({ icon, label, desc }) => (
          <div
            key={label}
            style={{
              background: GA.navy,
              border: `1px solid ${GA.border}`,
              borderRadius: 10,
              padding: '10px 22px',
              textAlign: 'center',
              minWidth: 180,
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: GA.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
              {label}
            </div>
            <div style={{ fontSize: 12, color: GA.muted, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", marginTop: 2 }}>
              {desc}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
