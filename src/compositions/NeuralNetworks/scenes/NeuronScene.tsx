import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { GA } from '../gaColors';

const INPUT_X = 185;
const INPUT_R = 44;
const INPUTS = [
  { y: 200, label: 'x₁', weight: 'w₁', color: GA.yellow },
  { y: 360, label: 'x₂', weight: 'w₂', color: GA.softYellow },
  { y: 520, label: 'x₃', weight: 'w₃', color: GA.accent3 },
];
const SUM_X = 580; const SUM_Y = 360; const SUM_R = 78;
const ACT_X = 870; const ACT_Y = 320; const ACT_W = 130; const ACT_H = 90;
const OUT_X1 = 1000; const OUT_X2 = 1115; const OUT_Y = 360;

const NODE1_IN=30; const NODE2_IN=50; const NODE3_IN=70;
const LINES_IN=100; const WEIGHTS_IN=175; const SUM_IN=235;
const SUM_LINE_IN=290; const ACT_IN=315; const OUTPUT_IN=365;
const FIRE_IN=395; const DESC_IN=400;

function lineLen(x1:number,y1:number,x2:number,y2:number){return Math.sqrt((x2-x1)**2+(y2-y1)**2);}

export const NeuronScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn  = interpolate(frame,[0,15],[0,1],{extrapolateRight:'clamp'});
  const fadeOut = interpolate(frame,[435,450],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const opacity = Math.min(fadeIn,fadeOut);

  const titleOpacity = interpolate(frame,[0,20],[0,1],{extrapolateRight:'clamp'});
  const titleY = interpolate(frame,[0,20],[14,0],{extrapolateRight:'clamp',easing:Easing.out(Easing.quad)});

  const nodeSprings = [NODE1_IN,NODE2_IN,NODE3_IN].map(t=>
    spring({frame:frame-t,fps,config:{damping:14},durationInFrames:28})
  );
  const sumSpring = spring({frame:frame-SUM_IN,fps,config:{damping:14},durationInFrames:30});

  const lineProgress = INPUTS.map((_,i)=>
    interpolate(frame,[LINES_IN+i*8,LINES_IN+i*8+28],[0,1],{
      extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.quad)})
  );
  const weightsOpacity = interpolate(frame,[WEIGHTS_IN,WEIGHTS_IN+18],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const sumLineProgress = interpolate(frame,[SUM_LINE_IN,SUM_LINE_IN+22],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const actOpacity = interpolate(frame,[ACT_IN,ACT_IN+22],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const outputProgress = interpolate(frame,[OUTPUT_IN,OUTPUT_IN+22],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const descOpacity = interpolate(frame,[DESC_IN,DESC_IN+25],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});

  const fireGlow = frame>=FIRE_IN
    ? interpolate(Math.sin(((frame-FIRE_IN)/7)*Math.PI),[-1,1],[0.3,1.0])
    : 0;

  const showDots = frame>FIRE_IN;
  const dotT = (frame%36)/36;

  return (
    <AbsoluteFill style={{background:GA.bg,opacity}}>
      {/* Background dot grid */}
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{position:'absolute',top:0,left:0}}>
        {Array.from({length:24},(_,xi)=>Array.from({length:14},(_,yi)=>(
          <circle key={`${xi}-${yi}`} cx={xi*56+20} cy={yi*56+20} r={1.2} fill={GA.yellow} opacity={0.04}/>
        )))}
      </svg>

      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{position:'absolute',top:0,left:0}}>
        <defs>
          <marker id="nn-arr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill={GA.yellow}/>
          </marker>
          <filter id="glow-f">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Input→Sum lines */}
        {INPUTS.map((inp,i)=>{
          const x1=INPUT_X+INPUT_R; const y1=inp.y;
          const x2=SUM_X-SUM_R; const y2=SUM_Y;
          const len=lineLen(x1,y1,x2,y2);
          return <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={inp.color} strokeWidth={2} opacity={0.55}
            strokeDasharray={len} strokeDashoffset={len*(1-lineProgress[i])} strokeLinecap="round"/>;
        })}

        {/* Weight labels */}
        {weightsOpacity>0 && INPUTS.map((inp,i)=>{
          const mx=(INPUT_X+INPUT_R+SUM_X-SUM_R)/2;
          const my=(inp.y+SUM_Y)/2;
          return (
            <g key={`w${i}`} opacity={weightsOpacity}>
              <rect x={mx-22} y={my-14} width={44} height={28} rx={6} fill={GA.accent1Deep} stroke={inp.color} strokeWidth={1}/>
              <text x={mx} y={my+1} textAnchor="middle" dominantBaseline="middle" fill={inp.color} fontSize={15} fontWeight="bold" fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif">{inp.weight}</text>
            </g>
          );
        })}

        {/* Sum→Activation line */}
        {(()=>{
          const x1=SUM_X+SUM_R; const x2=ACT_X; const len=x2-x1;
          return <line x1={x1} y1={OUT_Y} x2={x2} y2={OUT_Y} stroke={GA.yellow} strokeWidth={2} opacity={0.6}
            strokeDasharray={len} strokeDashoffset={len*(1-sumLineProgress)}/>;
        })()}

        {/* Activation block */}
        <g opacity={actOpacity}>
          <rect x={ACT_X} y={ACT_Y} width={ACT_W} height={ACT_H} rx={10} fill={GA.accent1Deep} stroke={GA.softYellow} strokeWidth={2}/>
          <text x={ACT_X+ACT_W/2} y={ACT_Y+30} textAnchor="middle" dominantBaseline="middle" fill={GA.softYellow} fontSize={24} fontWeight="bold" fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif">σ(x)</text>
          <text x={ACT_X+ACT_W/2} y={ACT_Y+60} textAnchor="middle" dominantBaseline="middle" fill={GA.muted} fontSize={12} fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif">Activation</text>
        </g>

        {/* Output arrow */}
        {(()=>{
          const len=OUT_X2-ACT_X-ACT_W;
          return <line x1={ACT_X+ACT_W} y1={OUT_Y} x2={OUT_X2-10} y2={OUT_Y}
            stroke={GA.yellow} strokeWidth={3} opacity={0.6+fireGlow*0.4}
            strokeDasharray={len} strokeDashoffset={len*(1-outputProgress)}
            markerEnd="url(#nn-arr)"
            filter={fireGlow>0.5?'url(#glow-f)':undefined}/>;
        })()}
        {outputProgress>0.8 && (
          <text x={OUT_X2+12} y={OUT_Y+5} textAnchor="start" dominantBaseline="middle"
            fill={GA.yellow} fontSize={16} fontWeight="bold" fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif">Output</text>
        )}

        {/* Data flow dots */}
        {showDots && INPUTS.map((inp,i)=>{
          const phase=(dotT+i*0.33)%1;
          const cx=(INPUT_X+INPUT_R)+((SUM_X-SUM_R)-(INPUT_X+INPUT_R))*phase;
          const cy=inp.y+(SUM_Y-inp.y)*phase;
          return <circle key={`dd${i}`} cx={cx} cy={cy} r={6} fill={inp.color} opacity={0.9}/>;
        })}
        {showDots && (()=>{
          const x1=SUM_X+SUM_R; const x2=ACT_X;
          return <circle cx={x1+(x2-x1)*dotT} cy={SUM_Y} r={6} fill={GA.yellow} opacity={0.9}/>;
        })()}
        {showDots && (()=>{
          const x1=ACT_X+ACT_W; const x2=OUT_X2;
          return <circle cx={x1+(x2-x1)*dotT} cy={OUT_Y} r={6} fill={GA.yellow} opacity={0.9} filter="url(#glow-f)"/>;
        })()}

        {/* Input nodes */}
        {INPUTS.map((inp,i)=>(
          <g key={`n${i}`} transform={`translate(${INPUT_X},${inp.y}) scale(${nodeSprings[i]})`}>
            <circle r={INPUT_R+8} fill={inp.color} opacity={0.06}/>
            <circle r={INPUT_R} fill={GA.accent1Deep} stroke={inp.color} strokeWidth={2.5}/>
            <text textAnchor="middle" dominantBaseline="middle" fill={inp.color} fontSize={22} fontWeight="bold" fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif">{inp.label}</text>
          </g>
        ))}

        {/* Sum node */}
        <g transform={`translate(${SUM_X},${SUM_Y}) scale(${sumSpring})`}>
          <circle r={SUM_R+12} fill={GA.yellow} opacity={0.06}/>
          <circle r={SUM_R} fill={GA.accent1Deep} stroke={GA.yellow} strokeWidth={2.5}/>
          <text y={-10} textAnchor="middle" dominantBaseline="middle" fill={GA.yellow} fontSize={36} fontWeight="bold" fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif">∑</text>
          <text y={20} textAnchor="middle" dominantBaseline="middle" fill={GA.muted} fontSize={13} fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif">Weighted Sum</text>
        </g>
      </svg>

      {/* Title */}
      <div style={{
        position:'absolute',top:26,left:0,right:0,textAlign:'center',
        opacity:titleOpacity,transform:`translateY(${titleY}px)`,
        fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
        fontSize:36,fontWeight:700,color:GA.text,letterSpacing:'-0.5px',
      }}>
        The Building Block: A Neuron
        <div style={{height:3,width:260,background:GA.yellow,margin:'8px auto 0',borderRadius:2}}/>
      </div>

      {/* Description panel */}
      <div style={{
        position:'absolute',bottom:24,left:60,right:60,
        opacity:descOpacity,display:'flex',gap:20,justifyContent:'center',
      }}>
        {[
          {icon:'📥',label:'Inputs',    desc:'Receive signals x₁, x₂, x₃'},
          {icon:'⚖️',label:'Weights',   desc:'Scale importance of each input'},
          {icon:'∑', label:'Summation', desc:'Weighted sum of all inputs'},
          {icon:'σ', label:'Activation',desc:'Decide whether to fire'},
        ].map(({icon,label,desc})=>(
          <div key={label} style={{
            background:GA.navy,border:`1px solid ${GA.border}`,borderRadius:10,
            padding:'8px 18px',textAlign:'center',minWidth:160,
          }}>
            <div style={{fontSize:20,marginBottom:4}}>{icon}</div>
            <div style={{fontSize:14,fontWeight:700,color:GA.text,fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif"}}>{label}</div>
            <div style={{fontSize:11,color:GA.muted,fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",marginTop:2}}>{desc}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
