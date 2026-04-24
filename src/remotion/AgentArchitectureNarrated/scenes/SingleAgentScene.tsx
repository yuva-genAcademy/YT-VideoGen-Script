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

export const SINGLE_AGENT_SCENE_DURATION = 2700;

// ─── Diagram constants (1280×720 canvas) ─────────────────────────────────────
// Title occupies y=28–85; description panel occupies y=620–720.
// All SVG elements stay within y=100 to y=615.
const AGENT = { x: 640, y: 370, r: 82 };

const TOOLS = [
  { x: 310, y: 225, r: 55, label: 'Memory',   sub: 'State & Context', emoji: '🧠', color: GA.yellow     },
  { x: 970, y: 225, r: 55, label: 'Tools',    sub: 'APIs & Actions',  emoji: '🔧', color: GA.softYellow },
  { x: 310, y: 525, r: 55, label: 'Planning', sub: 'Reasoning',       emoji: '🗺️', color: GA.accent3    },
  { x: 970, y: 525, r: 55, label: 'Output',   sub: 'Response',        emoji: '📤', color: GA.white      },
];

const TASK_INPUT = { x: 640, y: 128 };

// ─── EXACT FRAME TRIGGERS (script-synced at 160 wpm, 11.25 frames/word) ─────
// All frames are local (scene-relative).

// Agent circle pops in – just before narrator says "Single-Agent Architecture"
const AGENT_IN = 80;

// Input task rect fades in – just before "receives every user task"
const INPUT_IN = 230;

// Tool nodes scale in one by one as narrator mentions them
const MEMORY_IN      = 330;
const TOOLS_NODE_IN  = 410;
const PLANNING_IN    = 465;
const OUTPUT_IN      = 520;

// Connection lines draw in – narrator says "Watch the connections form"
const CONNECTIONS_IN = 665;

// Data flow dots start cycling – narrator says "runs through this one central node"
const DATA_FLOW_IN = 1230;

// Description panel (Simple/Sequential/Predictable cards)
const DESC_PANEL_IN = 1600;

// Queue dots – narrator says "watch the queue"
const QUEUE_IN = 1655;

// Bottleneck warning – narrator says "queue only grows"
const BOTTLENECK_IN = 2060;

// ─── Highlight ring frames (when narrator mentions each tool) ─────────────────
const MEM_HL_START   = 750;
const MEM_HL_END     = 810;
const TOOLS_HL_START = 900;
const TOOLS_HL_END   = 960;
const PLAN_HL_START  = 1020;
const PLAN_HL_END    = 1080;
const OUT_HL_START   = 1100;
const OUT_HL_END     = 1160;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function lineLen(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

type NodeProps = {
  x: number;
  y: number;
  r: number;
  label: string;
  sub?: string;
  emoji?: string;
  scale: number;
  color?: string;
  bgColor?: string;
  opacity?: number;
  highlightOpacity?: number;
};

const Node: React.FC<NodeProps> = ({
  x, y, r, label, sub, emoji,
  scale, color = GA.yellow, bgColor = GA.accent1Deep,
  opacity = 1, highlightOpacity = 0,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
    {/* Highlight glow ring */}
    <circle r={r + 20} fill={color} opacity={highlightOpacity * 0.4} />
    {/* Soft glow */}
    <circle r={r + 10} fill={color} opacity={0.07} />
    <circle r={r} fill={bgColor} stroke={color} strokeWidth={2.5} />
    {emoji && (
      <text
        x={0}
        y={sub ? -16 : -8}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={r * 0.44}
      >
        {emoji}
      </text>
    )}
    <text
      x={0}
      y={emoji ? r * 0.22 : (sub ? -6 : 4)}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={GA.text}
      fontSize={r * 0.3}
      fontWeight="bold"
      fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
    >
      {label}
    </text>
    {sub && (
      <text
        x={0}
        y={emoji ? r * 0.52 : 14}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={r * 0.22}
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
      >
        {sub}
      </text>
    )}
  </g>
);

type AnimLineProps = {
  x1: number; y1: number; x2: number; y2: number;
  progress: number; color?: string; dash?: string;
};

const AnimLine: React.FC<AnimLineProps> = ({ x1, y1, x2, y2, progress, color = GA.yellow, dash }) => {
  const len = lineLen(x1, y1, x2, y2);
  const offset = len * (1 - progress);
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color}
      strokeWidth={2}
      opacity={0.6}
      strokeDasharray={dash ?? len}
      strokeDashoffset={offset}
      strokeLinecap="round"
    />
  );
};

type DataDotProps = {
  x1: number; y1: number; x2: number; y2: number;
  t: number; color?: string; visible: boolean;
};

const DataDot: React.FC<DataDotProps> = ({ x1, y1, x2, y2, t, color = GA.yellow, visible }) => {
  if (!visible) return null;
  const cx = x1 + (x2 - x1) * t;
  const cy = y1 + (y2 - y1) * t;
  return <circle cx={cx} cy={cy} r={6} fill={color} opacity={0.9} />;
};

// ─── Main Scene ───────────────────────────────────────────────────────────────

export const SingleAgentScene: React.FC = () => {
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

  // ── Agent node spring ──
  const agentSpring = spring({
    frame: frame - AGENT_IN,
    fps,
    config: { damping: 14 },
    durationInFrames: 30,
  });

  // ── Tool node springs (one per tool, triggered at their individual times) ──
  const toolTriggers = [MEMORY_IN, TOOLS_NODE_IN, PLANNING_IN, OUTPUT_IN];
  const toolSprings = toolTriggers.map((trigger) =>
    spring({ frame: frame - trigger, fps, config: { damping: 16 }, durationInFrames: 25 }),
  );

  // ── Input rect opacity ──
  const inputOpacity = interpolate(frame, [INPUT_IN, INPUT_IN + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Connection lines (staggered, strokeDasharray trick) ──
  const lineOffsets = [0, 8, 16, 24];
  const lineProgress = lineOffsets.map((offset) =>
    interpolate(
      frame,
      [CONNECTIONS_IN + offset, CONNECTIONS_IN + offset + 25],
      [0, 1],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.inOut(Easing.quad),
      },
    ),
  );

  // ── Input arrow line progress ──
  const inputLineProgress = interpolate(frame, [INPUT_IN, INPUT_IN + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Data flow dots (cycle of 40 frames) ──
  const showDots = frame > DATA_FLOW_IN;
  const cycle = 40;
  const dotT = (frame % cycle) / cycle;

  // ── Queue dots (3, staggered, pulse with sin wave) ──
  const showQueue = frame > QUEUE_IN;
  const queueDots = [0, 1, 2].map((i) => ({
    y: TASK_INPUT.y + 10 + i * 18,
    opacity: interpolate(frame, [QUEUE_IN + i * 10, QUEUE_IN + i * 10 + 15], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  }));
  const queuePulse = 0.6 + 0.4 * Math.abs(Math.sin((frame / 7) * Math.PI));

  // ── Bottleneck warning ──
  const bottleneckOpacity = interpolate(frame, [BOTTLENECK_IN, BOTTLENECK_IN + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bottleneckPulse = interpolate(Math.sin((frame / 6) * Math.PI), [-1, 1], [0.5, 1]);

  // ── Description panel ──
  const descOpacity = interpolate(frame, [DESC_PANEL_IN, DESC_PANEL_IN + 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Highlight rings for each tool ──
  const memHighlight = interpolate(
    frame, [MEM_HL_START, (MEM_HL_START + MEM_HL_END) / 2, MEM_HL_END], [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const toolsHighlight = interpolate(
    frame, [TOOLS_HL_START, (TOOLS_HL_START + TOOLS_HL_END) / 2, TOOLS_HL_END], [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const planHighlight = interpolate(
    frame, [PLAN_HL_START, (PLAN_HL_START + PLAN_HL_END) / 2, PLAN_HL_END], [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const outHighlight = interpolate(
    frame, [OUT_HL_START, (OUT_HL_START + OUT_HL_END) / 2, OUT_HL_END], [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const toolHighlights = [memHighlight, toolsHighlight, planHighlight, outHighlight];

  return (
    <AbsoluteFill style={{ background: GA.bg, opacity: sceneOpacity }}>
      {/* Background dot grid */}
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', top: 0, left: 0 }}>
        {Array.from({ length: 25 }, (_, xi) =>
          Array.from({ length: 15 }, (_, yi) => (
            <circle
              key={`d${xi}-${yi}`}
              cx={xi * 55 + 15}
              cy={yi * 55 + 15}
              r={1.2}
              fill={GA.yellow}
              opacity={0.05}
            />
          )),
        )}
      </svg>

      {/* Main diagram SVG */}
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <marker id="sa2-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={GA.yellow} />
          </marker>
          <marker id="sa2-arrow-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={GA.warning} />
          </marker>
        </defs>

        {/* Input → Agent arrow */}
        <AnimLine
          x1={TASK_INPUT.x} y1={TASK_INPUT.y + 20}
          x2={AGENT.x} y2={AGENT.y - AGENT.r - 2}
          progress={inputLineProgress}
          color={GA.yellow}
        />

        {/* Connection lines: tools ↔ agent (staggered draw-in) */}
        {TOOLS.map((tool, i) => (
          <AnimLine
            key={`line${i}`}
            x1={tool.x} y1={tool.y}
            x2={AGENT.x} y2={AGENT.y}
            progress={lineProgress[i]}
            color={tool.color}
          />
        ))}

        {/* Data flow dots – input to agent */}
        <DataDot
          x1={TASK_INPUT.x} y1={TASK_INPUT.y + 20}
          x2={AGENT.x} y2={AGENT.y - AGENT.r - 2}
          t={dotT} color={GA.yellow} visible={showDots}
        />

        {/* Data flow dots – agent to each tool */}
        {TOOLS.map((tool, i) => (
          <DataDot
            key={`dot${i}`}
            x1={AGENT.x} y1={AGENT.y}
            x2={tool.x} y2={tool.y}
            t={dotT}
            color={tool.color}
            visible={showDots}
          />
        ))}

        {/* Queue dots (bottleneck visualization) */}
        {showQueue &&
          queueDots.map((dot, i) => (
            <circle
              key={`q${i}`}
              cx={TASK_INPUT.x - 20}
              cy={dot.y}
              r={7}
              fill={GA.warning}
              opacity={dot.opacity * queuePulse}
            />
          ))}

        {/* Tool nodes (with highlight rings) */}
        {TOOLS.map((tool, i) => (
          <Node
            key={`tool${i}`}
            {...tool}
            scale={toolSprings[i]}
            bgColor={GA.accent1Deep}
            highlightOpacity={toolHighlights[i]}
          />
        ))}

        {/* Central Agent node */}
        <Node
          x={AGENT.x} y={AGENT.y} r={AGENT.r}
          label="Agent" sub="Single Brain"
          emoji="🤖"
          scale={agentSpring}
          color={GA.yellow}
          bgColor={GA.accent1Deep}
        />

        {/* Input task rect */}
        <g opacity={inputOpacity}>
          <rect
            x={TASK_INPUT.x - 80} y={TASK_INPUT.y - 20}
            width={160} height={38}
            rx={8}
            fill={GA.accent1Deep}
            stroke={GA.yellow}
            strokeWidth={1.5}
          />
          <text
            x={TASK_INPUT.x} y={TASK_INPUT.y + 1}
            textAnchor="middle" dominantBaseline="middle"
            fill={GA.yellow} fontSize={14} fontWeight="bold"
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          >
            📥 User Task
          </text>
        </g>

        {/* Bottleneck warning box */}
        {frame >= BOTTLENECK_IN && (
          <g opacity={bottleneckOpacity}>
            <rect
              x={TASK_INPUT.x - 110} y={TASK_INPUT.y + 35}
              width={220} height={65}
              rx={8}
              fill={GA.warningDeep}
              stroke={GA.warning}
              strokeWidth={1.5}
              opacity={bottleneckPulse}
            />
            <text
              x={TASK_INPUT.x} y={TASK_INPUT.y + 56}
              textAnchor="middle" dominantBaseline="middle"
              fill={GA.warning} fontSize={14} fontWeight="bold"
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            >
              ⚠️ Bottleneck
            </text>
            <text
              x={TASK_INPUT.x} y={TASK_INPUT.y + 76}
              textAnchor="middle" dominantBaseline="middle"
              fill={GA.warning} fontSize={12}
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            >
              Tasks queue sequentially
            </text>
          </g>
        )}
      </svg>

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 28,
          left: 0,
          right: 0,
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
        Single-Agent Architecture
        <div
          style={{
            height: 3,
            width: 260,
            background: GA.yellow,
            margin: '8px auto 0',
            borderRadius: 2,
          }}
        />
      </div>

      {/* Description panel */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          left: 60,
          right: 60,
          opacity: descOpacity,
          display: 'flex',
          gap: 24,
          justifyContent: 'center',
        }}
      >
        {[
          { icon: '⚡', label: 'Simple',      desc: 'One agent handles everything'   },
          { icon: '🔁', label: 'Sequential',  desc: 'Tasks processed one at a time'  },
          { icon: '🎯', label: 'Predictable', desc: 'Easy to debug and trace'         },
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
