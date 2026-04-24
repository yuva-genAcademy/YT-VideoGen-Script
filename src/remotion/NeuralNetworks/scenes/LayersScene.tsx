import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { GA } from '../gaColors';

const NODE_R = 27;
const LAYERS = [
  { x: 210,  ys: [240,360,480],          label:'Input Layer',    sub:'Raw Data',    color:GA.yellow },
  { x: 490,  ys: [185,285,385,490],      label:'Hidden Layer 1', sub:'Features',    color:GA.softYellow },
  { x: 770,  ys: [185,285,385,490],      label:'Hidden Layer 2', sub:'Patterns',    color:GA.softYellow },
  { x: 1050, ys: [305,415],              label:'Output Layer',   sub:'Prediction',  color:GA.white },
];
const L_IN    = [35,155,275,385];
const CONN_IN = [100,220,340];
const LABELS_IN = 430;
const FLOW_IN   = 465;
const WAVE_PERIOD = 80;

function lineLen(x1:number,y1:number,x2:number,y2:number){return Math.sqrt((x2-x1)**2+(y2-y1)**2);}

export const LayersScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn  = interpolate(frame,[0,15],[0,1],{extrapolateRight:'clamp'});
  const fadeOut = interpolate(frame,[585,600],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const opacity = Math.min(fadeIn,fadeOut);

  const titleOpacity = interpolate(frame,[0,20],[0,1],{extrapolateRight:'clamp'});
  const titleY = interpolate(frame,[0,20],[14,0],{extrapolateRight:'clamp',easing:Easing.out(Easing.quad)});

  const layerSprings = LAYERS.map((_,li)=>
    spring({frame:frame-L_IN[li],fps,config:{damping:15},durationInFrames:30})
  );
  const connProgress = CONN_IN.map(trigger=>
    interpolate(frame,[trigger,trigger+35],[0,1],{
      extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.quad)})
  );
  const labelsOpacity = interpolate(frame,[LABELS_IN,LABELS_IN+25],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const deepNoteOpacity = interpolate(frame,[540,568],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});

  const showFlow = frame>FLOW_IN;
  const waveRaw = showFlow ? ((frame-FLOW_IN)%WAVE_PERIOD)/WAVE_PERIOD : -1;
  const waveX   = waveRaw>=0 ? interpolate(waveRaw,[0,1],[LAYERS[0].x-60,LAYERS[3].x+80]) : -9999;

  return (
    <AbsoluteFill style={{background:GA.bg,opacity}}>
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{position:'absolute',top:0,left:0}}>
        {Array.from({length:24},(_,xi)=>Array.from({length:14},(_,yi)=>(
          <circle key={`${xi}-${yi}`} cx={xi*56+20} cy={yi*56+20} r={1.2} fill={GA.yellow} opacity={0.04}/>
        )))}
      </svg>

      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{position:'absolute',top:0,left:0}}>
        <defs>
          <filter id="lyr-glow">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        {LAYERS.slice(0,-1).map((layer,li)=>{
          const next=LAYERS[li+1];
          const prog=connProgress[li];
          return layer.ys.flatMap((y1,ni)=>
            next.ys.map((y2,nj)=>{
              const x1=layer.x+NODE_R; const x2=next.x-NODE_R;
              const len=lineLen(x1,y1,x2,y2);
              return <line key={`c${li}-${ni}-${nj}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={layer.color} strokeWidth={0.8} opacity={0.2}
                strokeDasharray={len} strokeDashoffset={len*(1-prog)}/>;
            })
          );
        })}

        {/* Wave indicator */}
        {showFlow && waveRaw>=0 && waveRaw<0.96 && (
          <line x1={waveX} y1={100} x2={waveX} y2={620}
            stroke={GA.yellow} strokeWidth={1.5} opacity={0.12} strokeDasharray="4 6"/>
        )}

        {/* Nodes */}
        {LAYERS.map((layer,li)=>
          layer.ys.map((y,ni)=>{
            const sc=layerSprings[li];
            const wg=showFlow ? Math.max(0,1-Math.abs(layer.x-waveX)/90) : 0;
            return (
              <g key={`nd-${li}-${ni}`} transform={`translate(${layer.x},${y}) scale(${sc})`}>
                {wg>0.05 && <circle r={NODE_R+14} fill={layer.color} opacity={wg*0.35} filter="url(#lyr-glow)"/>}
                <circle r={NODE_R+6} fill={layer.color} opacity={0.06}/>
                <circle r={NODE_R} fill={GA.accent1Deep} stroke={layer.color}
                  strokeWidth={wg>0.4?3:2} opacity={0.8+wg*0.2}/>
              </g>
            );
          })
        )}
      </svg>

      {/* Title */}
      <div style={{
        position:'absolute',top:26,left:0,right:0,textAlign:'center',
        opacity:titleOpacity,transform:`translateY(${titleY}px)`,
        fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
        fontSize:36,fontWeight:700,color:GA.text,letterSpacing:'-0.5px',
      }}>
        Layers of a Neural Network
        <div style={{height:3,width:290,background:GA.yellow,margin:'8px auto 0',borderRadius:2}}/>
      </div>

      {/* Layer labels */}
      {LAYERS.map((layer,li)=>(
        <div key={`lbl${li}`} style={{
          position:'absolute',top:545,left:layer.x-70,width:140,
          textAlign:'center',opacity:labelsOpacity*layerSprings[li],
        }}>
          <div style={{fontSize:13,fontWeight:700,color:layer.color,fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif"}}>{layer.label}</div>
          <div style={{fontSize:11,color:GA.muted,fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",marginTop:2}}>{layer.sub}</div>
        </div>
      ))}

      {/* Deep Learning note */}
      <div style={{
        position:'absolute',bottom:26,left:0,right:0,textAlign:'center',
        opacity:deepNoteOpacity,fontSize:16,color:GA.muted,
        fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",letterSpacing:'0.04em',
      }}>
        More hidden layers = <span style={{color:GA.yellow}}>Deep Learning</span>
      </div>
    </AbsoluteFill>
  );
};
