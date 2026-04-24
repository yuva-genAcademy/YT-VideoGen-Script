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

// Diagram constants (1280x720 canvas)
// Title occupies ~y=28–80; description panel occupies ~y=620–720.
// All SVG elements must stay within y=108 to y=615.
const AGENT = { x: 640, y: 370, r: 82 };

const TOOLS = [
  { x: 310, y: 225, r: 55, label: 'Memory', sub: 'State & Context', emoji: '🧠', color: C.purple },
  { x: 970, y: 225, r: 55, label: 'Tools', sub: 'APIs & Actions', emoji: '🔧', color: C.gold },
  { x: 310, y: 525, r: 55, label: 'Planning', sub: 'Reasoning', emoji: '🗺️', color: C.green },
  { x: 970, y: 525, r: 55, label: 'Output', sub: 'Response', emoji: '📤', color: C.blue },
];

const TASK_INPUT = { x: 640, y: 128 };

function lineLen(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

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
};

const Node: React.FC<NodeProps> = ({
  x, y, r, label, sub, emoji, scale, color = C.blue, bgColor = C.blueDeep, opacity = 1,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
    <circle r={r + 10} fill={color} opacity={0.07} />
    <circle r={r} fill={bgColor} stroke={color} strokeWidth={2.5} />
    {emoji && (
      <text x={0} y={sub ? -16 : -8} textAnchor="middle" dominantBaseline="middle" fontSize={r * 0.44}>
        {emoji}
      </text>
    )}
    <text
      x={0}
      y={emoji ? r * 0.22 : (sub ? -6 : 4)}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={C.text}
      fontSize={r * 0.3}
      fontWeight="bold"
      fontFamily="system-ui, sans-serif"
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
        fontFamily="system-ui, sans-serif"
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

const AnimLine: React.FC<AnimLineProps> = ({ x1, y1, x2, y2, progress, color = C.blue, dash }) => {
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

const DataDot: React.FC<DataDotProps> = ({ x1, y1, x2, y2, t, color = C.blue, visible }) => {
  if (!visible) return null;
  const cx = x1 + (x2 - x1) * t;
  const cy = y1 + (y2 - y1) * t;
  return <circle cx={cx} cy={cy} r={6} fill={color} opacity={0.9} />;
};

export const SingleAgentScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 15-frame fade in/out to align with crossfade overlap in AgentArchitecture
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [2685, 2700], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  // Title
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 18], [16, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  // Agent node
  const agentSpring = spring({ frame: frame - 15, fps, config: { damping: 14 }, durationInFrames: 35 });

  // Tool nodes (staggered)
  const toolSprings = TOOLS.map((_, i) =>
    spring({ frame: frame - 40 - i * 10, fps, config: { damping: 16 }, durationInFrames: 30 }),
  );

  // Connection lines
  const lineProgress = TOOLS.map((_, i) =>
    interpolate(frame, [75 + i * 8, 105 + i * 8], [0, 1], {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
      easing: Easing.inOut(Easing.quad),
    }),
  );

  // Input task arrow
  const inputProgress = interpolate(frame, [65, 85], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  // Data flow dots — cycling after lines appear
  const showDots = frame > 110;
  const cycle = 40;
  const dotT = (frame % cycle) / cycle;

  // Bottleneck warning
  const bottleneckOpacity = interpolate(frame, [145, 165], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });
  const bottleneckPulse = interpolate(Math.sin((frame / 6) * Math.PI), [-1, 1], [0.5, 1]);

  // Description text
  const descOpacity = interpolate(frame, [90, 115], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  // Queue dots showing bottleneck (stacked input)
  const showQueue = frame > 150;
  const queueDots = [0, 1, 2].map((i) => ({
    y: TASK_INPUT.y + 10 + i * 18,
    opacity: interpolate(frame, [150 + i * 8, 165 + i * 8], [0, 1], {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
    }),
  }));

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>
      {/* Background subtle dot grid */}
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', top: 0, left: 0 }}>
        {Array.from({ length: 25 }, (_, xi) =>
          Array.from({ length: 15 }, (_, yi) => (
            <circle
              key={`d${xi}-${yi}`}
              cx={xi * 55 + 15}
              cy={yi * 55 + 15}
              r={1.2}
              fill={C.blue}
              opacity={0.08}
            />
          )),
        )}
      </svg>

      {/* Main diagram SVG */}
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <marker id="sa-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={C.blue} />
          </marker>
          <marker id="sa-arrow-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={C.red} />
          </marker>
        </defs>

        {/* Input arrow */}
        <AnimLine
          x1={TASK_INPUT.x} y1={TASK_INPUT.y + 20}
          x2={AGENT.x} y2={AGENT.y - AGENT.r - 2}
          progress={inputProgress}
          color={C.blue}
        />

        {/* Connection lines: tools to agent */}
        {TOOLS.map((tool, i) => (
          <AnimLine
            key={`line${i}`}
            x1={tool.x} y1={tool.y}
            x2={AGENT.x} y2={AGENT.y}
            progress={lineProgress[i]}
            color={tool.color}
          />
        ))}

        {/* Data flow dots */}
        <DataDot
          x1={TASK_INPUT.x} y1={TASK_INPUT.y + 20}
          x2={AGENT.x} y2={AGENT.y - AGENT.r - 2}
          t={dotT} color={C.blue} visible={showDots}
        />
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

        {/* Queue dots (bottleneck) */}
        {showQueue &&
          queueDots.map((dot, i) => (
            <circle
              key={`q${i}`}
              cx={TASK_INPUT.x - 20}
              cy={dot.y}
              r={7}
              fill={C.red}
              opacity={dot.opacity * bottleneckPulse}
            />
          ))}

        {/* Tool nodes */}
        {TOOLS.map((tool, i) => (
          <Node
            key={`tool${i}`}
            {...tool}
            scale={toolSprings[i]}
            bgColor={C.blueDeep}
          />
        ))}

        {/* Central Agent node */}
        <Node
          x={AGENT.x} y={AGENT.y} r={AGENT.r}
          label="Agent" sub="Single Brain"
          emoji="🤖"
          scale={agentSpring}
          color={C.blue}
          bgColor={C.blueMid}
        />

        {/* Input task node */}
        <g opacity={inputProgress}>
          <rect
            x={TASK_INPUT.x - 80} y={TASK_INPUT.y - 20}
            width={160} height={38}
            rx={8}
            fill={C.blueDeep}
            stroke={C.blue}
            strokeWidth={1.5}
          />
          <text
            x={TASK_INPUT.x} y={TASK_INPUT.y + 1}
            textAnchor="middle" dominantBaseline="middle"
            fill={C.blue} fontSize={14} fontWeight="bold"
            fontFamily="system-ui, sans-serif"
          >
            📥 User Task
          </text>
        </g>

        {/* Bottleneck label */}
        {showQueue && (
          <g opacity={bottleneckOpacity}>
            <rect
              x={TASK_INPUT.x - 110} y={TASK_INPUT.y + 35}
              width={220} height={65}
              rx={8}
              fill={C.redDeep}
              stroke={C.red}
              strokeWidth={1.5}
              opacity={bottleneckPulse}
            />
            <text
              x={TASK_INPUT.x} y={TASK_INPUT.y + 56}
              textAnchor="middle" dominantBaseline="middle"
              fill={C.red} fontSize={14} fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              ⚠️ Bottleneck
            </text>
            <text
              x={TASK_INPUT.x} y={TASK_INPUT.y + 76}
              textAnchor="middle" dominantBaseline="middle"
              fill={C.red} fontSize={12}
              fontFamily="system-ui, sans-serif"
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
          fontFamily: 'Georgia, serif',
          fontSize: 38,
          fontWeight: 700,
          color: C.text,
          letterSpacing: '-0.5px',
        }}
      >
        Single-Agent Architecture
        <div
          style={{
            height: 3,
            width: 260,
            background: C.blue,
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
          { icon: '⚡', label: 'Simple', desc: 'One agent handles everything' },
          { icon: '🔁', label: 'Sequential', desc: 'Tasks processed one at a time' },
          { icon: '🎯', label: 'Predictable', desc: 'Easy to debug and trace' },
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
