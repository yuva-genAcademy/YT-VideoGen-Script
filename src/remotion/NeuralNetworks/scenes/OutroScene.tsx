import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { GA } from '../gaColors';

const CARD_TRIGGERS = [35, 85, 135];
const SUMMARY_IN = 190;
const CTA_IN = 215;

const CARDS = [
  { icon:'🖼️', title:'Image Recognition', desc:'Facial detection,\nobject classification' },
  { icon:'💬', title:'Language Models',    desc:'ChatGPT, translation,\nsummarization'       },
  { icon:'🎯', title:'Recommendations',   desc:'Netflix, Spotify,\nshopping feeds'          },
];

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn  = interpolate(frame,[0,15],[0,1],{extrapolateRight:'clamp'});
  const fadeOut = interpolate(frame,[255,270],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const opacity = Math.min(fadeIn,fadeOut);

  const titleOpacity = interpolate(frame,[0,20],[0,1],{extrapolateRight:'clamp'});
  const titleY = interpolate(frame,[0,20],[14,0],{extrapolateRight:'clamp',easing:Easing.out(Easing.quad)});

  const cardSprings = CARD_TRIGGERS.map(t=>
    spring({frame:frame-t,fps,config:{damping:14},durationInFrames:30})
  );

  const summaryOpacity = interpolate(frame,[SUMMARY_IN,SUMMARY_IN+22],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const ctaOpacity     = interpolate(frame,[CTA_IN,CTA_IN+20],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});

  return (
    <AbsoluteFill style={{background:GA.bg,opacity}}>
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{position:'absolute',top:0,left:0}}>
        {Array.from({length:20},(_,xi)=>Array.from({length:12},(_,yi)=>(
          <circle key={`${xi}-${yi}`} cx={xi*68+34} cy={yi*65+32} r={1.5} fill={GA.yellow} opacity={0.035}/>
        )))}
      </svg>

      {/* Glow */}
      <div style={{
        position:'absolute',top:'35%',left:'50%',
        transform:'translate(-50%,-50%)',
        width:800,height:400,
        background:`radial-gradient(ellipse,${GA.yellow}10 0%,transparent 70%)`,
        pointerEvents:'none',
      }}/>

      {/* Title */}
      <div style={{
        position:'absolute',top:26,left:0,right:0,textAlign:'center',
        opacity:titleOpacity,transform:`translateY(${titleY}px)`,
        fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
        fontSize:36,fontWeight:700,color:GA.text,letterSpacing:'-0.5px',
      }}>
        Neural Networks in the Wild
        <div style={{height:3,width:280,background:GA.yellow,margin:'8px auto 0',borderRadius:2}}/>
      </div>

      {/* Cards row */}
      <div style={{
        position:'absolute',top:'50%',left:'50%',
        transform:'translate(-50%,-50%) translateY(-20px)',
        display:'flex',gap:32,
      }}>
        {CARDS.map(({icon,title,desc},i)=>(
          <div key={title} style={{
            background:GA.navy,
            border:`1px solid ${GA.border}`,
            borderRadius:14,
            padding:'28px 28px 24px',
            textAlign:'center',
            width:220,
            transform:`scale(${cardSprings[i]})`,
            opacity:cardSprings[i],
          }}>
            <div style={{fontSize:40,marginBottom:12}}>{icon}</div>
            <div style={{
              fontSize:16,fontWeight:700,color:GA.text,
              fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
              marginBottom:8,
            }}>{title}</div>
            <div style={{
              fontSize:12,color:GA.muted,
              fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
              whiteSpace:'pre-line',lineHeight:1.5,
            }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{
        position:'absolute',bottom:100,left:0,right:0,textAlign:'center',
        opacity:summaryOpacity,
        fontSize:26,fontWeight:700,color:GA.text,
        fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
        letterSpacing:'-0.3px',
      }}>
        They're just math — <span style={{color:GA.yellow}}>applied at scale.</span>
      </div>

      {/* CTA */}
      <div style={{
        position:'absolute',bottom:58,left:0,right:0,textAlign:'center',
        opacity:ctaOpacity,
        fontSize:15,color:GA.muted,
        fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
        letterSpacing:'0.05em',
      }}>
        Subscribe for more AI fundamentals
      </div>
    </AbsoluteFill>
  );
};
