import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { GA } from '../gaColors';

const MINI = [
  { x:120, ys:[265,360,455], r:22, color:GA.yellow },
  { x:285, ys:[290,360,430], r:22, color:GA.softYellow },
  { x:440, ys:[325,395],     r:22, color:GA.softYellow },
  { x:570, ys:[360],         r:26, color:GA.white },
];
const NET_IN=25; const FWD_IN=70; const BKPROP_IN=185;
const LOSS_IN=265; const EPOCH_END=345;

const CURVE = [[720,243],[740,260],[760,285],[790,318],[820,348],[860,378],[900,405],[950,425],[1000,436],[1060,443],[1130,447],[1200,449]];
const CURVE_POINTS = CURVE.map(([x,y])=>`${x},${y}`).join(' ');

function lineLen(x1:number,y1:number,x2:number,y2:number){return Math.sqrt((x2-x1)**2+(y2-y1)**2);}

export const TrainingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn  = interpolate(frame,[0,15],[0,1],{extrapolateRight:'clamp'});
  const fadeOut = interpolate(frame,[345,360],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const opacity = Math.min(fadeIn,fadeOut);

  const titleOpacity = interpolate(frame,[0,20],[0,1],{extrapolateRight:'clamp'});
  const titleY = interpolate(frame,[0,20],[14,0],{extrapolateRight:'clamp',easing:Easing.out(Easing.quad)});

  // Mini network springs
  const netOpacity = interpolate(frame,[NET_IN,NET_IN+20],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const layerSprings = MINI.map((_,i)=>
    spring({frame:frame-(NET_IN+i*12),fps,config:{damping:15},durationInFrames:28})
  );

  // Forward pass wave
  const fwdActive = frame>FWD_IN;
  const fwdT = fwdActive ? ((frame-FWD_IN)%55)/55 : -1;
  const fwdX = fwdT>=0 ? interpolate(fwdT,[0,1],[MINI[0].x-40,MINI[3].x+50]) : -9999;
  const fwdGlow = (nx:number)=>fwdT>=0 ? Math.max(0,1-Math.abs(nx-fwdX)/70) : 0;

  // Backprop wave (right to left)
  const bkActive = frame>BKPROP_IN;
  const bkX = bkActive
    ? interpolate(frame,[BKPROP_IN,BKPROP_IN+110],[MINI[3].x+60,MINI[0].x-60],{extrapolateRight:'clamp',extrapolateLeft:'clamp'})
    : 99999;
  const bkGlow = (nx:number)=>bkActive ? Math.max(0,1-Math.abs(nx-bkX)/70) : 0;
  const bkLineOpacity = interpolate(frame,[BKPROP_IN,BKPROP_IN+20],[0,0.45],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});

  // Right panel
  const lossOpacity = interpolate(frame,[LOSS_IN,LOSS_IN+20],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const lossValue = interpolate(frame,[LOSS_IN,EPOCH_END],[0.852,0.031],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const epochValue = Math.floor(interpolate(frame,[LOSS_IN,EPOCH_END],[1,1248],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}));
  const curveRevealX = interpolate(frame,[LOSS_IN,EPOCH_END],[720,1210],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});

  return (
    <AbsoluteFill style={{background:GA.bg,opacity}}>
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{position:'absolute',top:0,left:0}}>
        <defs>
          <marker id="tr-arr-bk" markerWidth="7" markerHeight="5" refX="0" refY="2.5" orient="auto">
            <polygon points="7 0,0 2.5,7 5" fill={GA.muted}/>
          </marker>
          <clipPath id="curve-clip">
            <rect x={720} y={0} width={Math.max(0,curveRevealX-720)} height={720}/>
          </clipPath>
        </defs>

        {/* Divider */}
        <line x1={635} y1={80} x2={635} y2={640} stroke={GA.border} strokeWidth={1}/>

        {/* Mini network connections */}
        {netOpacity>0 && MINI.slice(0,-1).map((layer,li)=>{
          const next=MINI[li+1];
          return layer.ys.flatMap((y1,ni)=>
            next.ys.map((y2,nj)=>{
              const x1=layer.x+layer.r; const x2=next.x-next.r;
              const len=lineLen(x1,y1,x2,y2);
              return (
                <g key={`c${li}-${ni}-${nj}`}>
                  {/* Forward connection */}
                  <line x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={layer.color} strokeWidth={0.8} opacity={0.18*netOpacity}/>
                  {/* Backprop overlay */}
                  {bkActive && <line x1={x2} y1={y2} x2={x1} y2={y1}
                    stroke={GA.muted} strokeWidth={1.2} opacity={bkLineOpacity}
                    strokeDasharray="5 5"
                    strokeDashoffset={-((frame-BKPROP_IN)*2)%20}/>}
                </g>
              );
            })
          );
        })}

        {/* Mini network nodes */}
        {MINI.map((layer,li)=>
          layer.ys.map((y,ni)=>{
            const sc=layerSprings[li];
            const fg=fwdGlow(layer.x);
            const bg=bkGlow(layer.x);
            const glow=Math.max(fg,bg);
            return (
              <g key={`mn-${li}-${ni}`} transform={`translate(${layer.x},${y}) scale(${sc})`}>
                {glow>0.1 && <circle r={layer.r+10} fill={layer.color} opacity={glow*0.4}/>}
                <circle r={layer.r} fill={GA.accent1Deep} stroke={layer.color}
                  strokeWidth={glow>0.3?2.5:1.5}/>
              </g>
            );
          })
        )}

        {/* Right panel: Loss curve area */}
        {/* Grid lines */}
        {lossOpacity>0 && [243,298,353,408,449].map((y,i)=>(
          <line key={`g${i}`} x1={720} y1={y} x2={1200} y2={y}
            stroke={GA.border} strokeWidth={0.8} opacity={lossOpacity*0.5}/>
        ))}
        {/* Axis */}
        {lossOpacity>0 && <>
          <line x1={720} y1={243} x2={720} y2={455} stroke={GA.borderLight} strokeWidth={1} opacity={lossOpacity}/>
          <line x1={720} y1={455} x2={1200} y2={455} stroke={GA.borderLight} strokeWidth={1} opacity={lossOpacity}/>
          <text x={715} y={249} textAnchor="end" dominantBaseline="middle" fill={GA.muted} fontSize={11} fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif" opacity={lossOpacity}>High</text>
          <text x={715} y={449} textAnchor="end" dominantBaseline="middle" fill={GA.muted} fontSize={11} fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif" opacity={lossOpacity}>Low</text>
          <text x={960} y={472} textAnchor="middle" fill={GA.muted} fontSize={11} fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif" opacity={lossOpacity}>Epochs →</text>
        </>}
        {/* Loss curve (revealed left to right) */}
        <polyline points={CURVE_POINTS} fill="none" stroke={GA.yellow} strokeWidth={2.5}
          clipPath="url(#curve-clip)" opacity={lossOpacity}/>
        {/* Current dot at end of curve */}
        {lossOpacity>0 && (()=>{
          const idx=Math.min(CURVE.length-1,Math.floor((curveRevealX-720)/(480/11)));
          const safeIdx=Math.max(0,Math.min(CURVE.length-1,idx));
          const [cx,cy]=CURVE[safeIdx];
          return <circle cx={cx} cy={cy} r={5} fill={GA.yellow} opacity={lossOpacity}/>;
        })()}
      </svg>

      {/* Title */}
      <div style={{
        position:'absolute',top:26,left:0,right:0,textAlign:'center',
        opacity:titleOpacity,transform:`translateY(${titleY}px)`,
        fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
        fontSize:36,fontWeight:700,color:GA.text,letterSpacing:'-0.5px',
      }}>
        How Networks Learn
        <div style={{height:3,width:240,background:GA.yellow,margin:'8px auto 0',borderRadius:2}}/>
      </div>

      {/* Left label: "Forward Pass" / "Backprop" */}
      <div style={{
        position:'absolute',top:90,left:40,
        opacity:netOpacity,
        fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",fontSize:14,color:GA.muted,
      }}>
        <div style={{color:GA.yellow,fontWeight:700,marginBottom:4}}>① Forward Pass</div>
        {bkActive && <div style={{color:GA.muted,fontWeight:700,marginTop:8}}>② Backpropagation</div>}
      </div>

      {/* Right panel: stats */}
      <div style={{
        position:'absolute',top:90,left:660,right:30,
        opacity:lossOpacity,
        fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
      }}>
        <div style={{fontSize:18,fontWeight:700,color:GA.text,marginBottom:8}}>Training Loss</div>
        <div style={{display:'flex',gap:32,marginBottom:16}}>
          <div>
            <div style={{fontSize:12,color:GA.muted}}>Epoch</div>
            <div style={{fontSize:26,fontWeight:800,color:GA.yellow}}>{epochValue.toLocaleString()}</div>
          </div>
          <div>
            <div style={{fontSize:12,color:GA.muted}}>Loss</div>
            <div style={{fontSize:26,fontWeight:800,color:GA.softYellow}}>{lossValue.toFixed(3)}</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
