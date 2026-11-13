window.addEventListener('error',e=>{const box=document.getElementById('status');if(box)box.textContent='Script error: '+(e.message||'unknown')+' (line '+e.lineno+')';});
window.addEventListener('unhandledrejection',e=>{const box=document.getElementById('status');if(box)box.textContent='Error: '+String(e.reason?.message||e.reason);});

'use strict';
// Glyph families extracted verbatim from the artist's js/index.js.
const GLYPHS=["⸜", "⸝", "⸠", "⸡", "⸢", "⸣", "⸤", "⸥", "⸦", "⸧", "⸨", "⸩", "⸪", "⸫", "⸬", "⸭", "⸮", "ⸯ", "⸰", "⸱", "⸲", "⸳", "⸴", "⸵", "⸶", "⸷", "⸸", "⸹", "⸺", "⸻", "※", "⁂", "⁑", "⁕", "⁜", "⁘", "⁙", "⁚", "⁛", "⁝", "⟆", "⟇", "⟈", "⟉", "⟊", "⟋", "⟌", "⟍", "⟎", "⟏", "⧖", "⧗", "⧘", "⧙", "⧚", "⧛", "⧜", "⧝", "⧞", "⧟", "⧠", "⧡", "⧢", "⧣", "⧤", "⧥", "⧦", "⧧", "⧨", "⧩", "Ⳁ", "ⳁ", "Ⳃ", "ⳃ", "Ⳅ", "ⳅ", "Ⳇ", "ⳇ", "Ⳉ", "ⳉ", "Ⳋ", "ⳋ", "Ⳍ", "ⳍ", "Ⳏ", "ⳏ", "Ⳑ", "ⳑ", "Ⳓ", "ⳓ", "Ⳕ", "ⳕ", "Ⳗ", "ⳗ", "Ⳙ", "ⳙ", "Ⳛ", "ⳛ", "Ⳝ", "ⳝ", "꙳", "꙰", "꙱", "꙲", "ꙴ", "ꙵ", "ꙶ", "ꙷ", "ꙸ", "ꙹ", "ꙺ", "ꙻ", "꙼", "꙽", "꙾", "ꙿ", "⟐", "⟑", "⟒", "⟓", "⟔", "⟕", "⟖", "⟗", "⟘", "⟙", "∴", "∵", "∷", "∺", "∻", "∽", "≋", "≈", "⟜", "⟝", "⟞", "⟟", "⟠", "⟡", "⟢", "⟣", "⍜", "⍝", "⍞", "⍟", "⍠", "⍡", "⍢", "⍣", "⍤", "⍥", "⍦", "⍧", "⍨", "⍩", "⍪", "⍫", "⍬", "⍭", "⍮", "⍯"];
const STAR=["✳", "✶", "✷", "✸", "✹", "✺", "✻", "✼", "✽", "✾", "✴", "❇", "❈", "❉", "❊", "❋", "✦", "✧", "✩", "✪"],SACRED=["𑈀", "𑈁", "𑈂", "𑈃", "𑈄", "𑈅", "𑈆", "𑈇", "𑈈", "𑈉", "𑈊", "𑈋", "𑈌", "𑈍", "𑈎", "𑈏", "𑈐", "𑈑", "𑈒", "𑈓"],CLOUD=["𐹷", "𐹰", "𑂔", "𑃘", "𑅀", "𑇛", "𑈁", "𑈼", "𑈿", "𐘊", "𐘋", "𑍈", "𑖰", "𑜸"];
const canvas=document.getElementById('scene'),ctx=canvas.getContext('2d',{alpha:true}),video=document.getElementById('camera');
const status=document.getElementById('status'),hint=document.getElementById('hint'),mode=document.getElementById('mode');
let width=0,height=0,dpr=1,started=false,withCamera=false,stream=null,facing='environment',motion=false, yaw=0,pitch=0,lastBeta=null,lastGamma=null;
let points=[],ripples=[],screenPositions=[],tick=0,lastFrame=0,prevTouch=0;
const random=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const choose=a=>a[Math.floor(Math.random()*a.length)];
function resize(){width=innerWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.textAlign='center';ctx.textBaseline='middle';}
addEventListener('resize',resize);resize();
function populate(){points=[];ripples=[];for(let i=0;i<185;i++){
let family=Math.random();const pool=family<.78?GLYPHS:family<.89?STAR:family<.95?SACRED:CLOUD;
points.push({x:random(-3.8,3.8),y:random(-4.8,4.8),z:random(2,11),char:choose(pool),phase:random(0,6.28),speed:random(.17,.48),size:random(.75,1.28),opacity:random(.34,.9),color:Math.random()<.16?(Math.random()<.5?'#9bffba':'#ff9be4'):(Math.random()<.24?'#898989':'#e6e6e6'),kick:0});}}
// Standalone preview of the original 20-pixel glyph matrix, with softly drifting holes.
let grid=[];function makeGrid(){grid=[];const cell=20;for(let y=0;y<Math.ceil(height/cell);y++)for(let x=0;x<Math.ceil(width/cell);x++)grid.push({x:x*cell+cell/2,y:y*cell+cell/2,char:choose(GLYPHS),color:Math.random()<.16?(Math.random()<.5?'#a5ffc2':'#ffa2de'):'#ddd',seed:Math.random()*10});}
makeGrid();addEventListener('resize',makeGrid);
function preview(t){ctx.fillStyle='#000';ctx.fillRect(0,0,width,height);ctx.font='19px ui-monospace,Menlo,monospace';for(const g of grid){const cloud=Math.sin(g.x*.012+t*.00026)*Math.cos(g.y*.016-t*.00018)+.35*Math.sin(g.x*.03+g.y*.012+t*.00014);if(cloud>.58||Math.random()<.35)continue;if(Math.random()<.002)g.char=choose(GLYPHS);ctx.globalAlpha=.3+.5*Math.abs(Math.sin(g.seed+t*.00025));ctx.fillStyle=g.color;ctx.fillText(g.char,g.x,g.y);}ctx.globalAlpha=1;}
function colorAlpha(hex,alpha){const v=parseInt(hex.slice(1),16);return 'rgba('+((v>>16)&255)+','+((v>>8)&255)+','+(v&255)+','+alpha+')';}
function project(p,t){const x=p.x+Math.sin(t*.00038+p.phase)*.12;const y=p.y+Math.cos(t*.00031+p.phase)*.12;const z=p.z+.3*Math.sin(t*.00018+p.phase);
// Perspective motion is intentionally limited. It is NOT world tracking or anchoring.
const dx=x-yaw*1.15,dy=y+pitch*.92;const focal=Math.min(width,height)*1.22;
return {x:width/2+dx/z*focal,y:height/2+dy/z*focal,r:clamp((focal/z)*.18,10,56),z};}
function render(t){requestAnimationFrame(render);const dt=Math.min(.05,(t-lastFrame)/1000||.016);lastFrame=t;ctx.clearRect(0,0,width,height);if(!started){preview(t);return;}
if(!withCamera){ctx.fillStyle='#050608';ctx.fillRect(0,0,width,height);}
screenPositions=[];
// Subtle connective traces preserve the underlying idea of a matrix.
const ordered=points.map((p,i)=>({p,i,s:project(p,t)})).sort((a,b)=>b.s.z-a.s.z);
for(const {p,i,s} of ordered){if(s.x< -50||s.x>width+50||s.y< -50||s.y>height+50)continue;
const alpha=clamp(p.opacity*(1.1-s.z/16),.08,.86);
ctx.font=`${Math.round(s.r*p.size)}px ui-monospace,'Segoe UI Symbol','Noto Sans Symbols 2',sans-serif`;
ctx.fillStyle=colorAlpha(p.color,Math.min(1,alpha+p.kick*.5));
ctx.shadowColor=p.kick>.05?p.color:'transparent';ctx.shadowBlur=p.kick*19;
ctx.fillText(p.char,s.x,s.y);ctx.shadowBlur=0;p.kick=Math.max(0,p.kick-dt*.68);
screenPositions.push({i,x:s.x,y:s.y,r:s.r});}
for(let n=ripples.length-1;n>=0;n--){const r=ripples[n];r.life-=dt;const fraction=1-r.life/1.3;ctx.strokeStyle=`rgba(${r.color==='pink'?'255,142,220':'150,255,193'},${Math.max(0,r.life/1.3)*.7})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(r.x,r.y,14+fraction*180,0,Math.PI*2);ctx.stroke();if(r.life<=0)ripples.splice(n,1);}
}
requestAnimationFrame(render);
function burst(x,y){let winner=null,best=Infinity;for(const s of screenPositions){const d=Math.hypot(s.x-x,s.y-y);if(d<best){best=d;winner=s;}}const source=winner&&best<65?winner:{x,y};const type=(ripples.length%2)?'pink':'green';ripples.push({x:source.x,y:source.y,life:1.3,color:type});let affected=0;for(const p of points){const s=project(p,performance.now());const d=Math.hypot(s.x-source.x,s.y-source.y);if(d<220){p.kick=Math.max(p.kick,Math.pow(1-d/230,1.4));if(d<105&&Math.random()<.12)p.char=choose(type==='pink'?SACRED:STAR);affected++;}}if(affected===0)for(let i=0;i<18;i++)choose(points).kick=1;}
canvas.addEventListener('pointerdown',e=>{if(!started)return;e.preventDefault();burst(e.clientX,e.clientY);});
const cameraButton=document.getElementById('start');
function setStatus(message){status.textContent=message;status.style.color=message.startsWith('Opening')?'#9fffc6':'#ffc7cf';}
function withTimeout(promise,ms){let timeout;return Promise.race([promise,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('Camera request timed out. Try opening this page directly in Safari or Chrome.')),ms);})]).finally(()=>clearTimeout(timeout));}
async function startCamera(){
 if(!window.isSecureContext)throw Error('Camera requires HTTPS. This preview cannot use the camera. Upload this file to https://empireofclouds.com/ar/ and open it directly in Safari or Chrome.');
 if(!navigator.mediaDevices?.getUserMedia)throw Error('Camera API is unavailable in this browser or embedded preview. Open the hosted HTTPS page directly in Safari (iPhone) or Chrome (Android).');
 const requested={audio:false,video:{facingMode:{ideal:facing},width:{ideal:1280},height:{ideal:720}}};
 const newStream=await withTimeout(navigator.mediaDevices.getUserMedia(requested),12000);
 if(stream)stream.getTracks().forEach(t=>t.stop());
 stream=newStream;video.srcObject=stream;
 try{await withTimeout(video.play(),6000);}catch(e){newStream.getTracks().forEach(t=>t.stop());video.srcObject=null;stream=null;throw e;}
}
async function enter(camera){
 if(camera){
  cameraButton.disabled=true;cameraButton.textContent='OPENING CAMERA…';setStatus('Opening camera… Please allow camera access if prompted.');
  try{await startCamera();withCamera=true;}
  catch(error){const message=error.name==='NotAllowedError'?'Camera permission denied. Allow access in your browser settings and reload.':error.name==='NotFoundError'?'No camera was found on this device.':(error.message||error.name);setStatus(message+'\nYou can still choose Explore Without Camera below.');return;}
  finally{cameraButton.disabled=false;cameraButton.textContent='ENTER THROUGH CAMERA';}
 }else{withCamera=false;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}video.srcObject=null;setStatus('');}
 populate();started=true;document.body.classList.add('active');mode.textContent=withCamera?'CAMERA / LIVE':'DEMO / NO CAMERA';hint.textContent='TAP THE GLYPHS · MOVE YOUR PHONE';document.getElementById('cameraSwap').style.display=withCamera?'inline-block':'none';
 if(typeof DeviceOrientationEvent!=='undefined')document.getElementById('orientation').style.display='inline-block';
}
cameraButton.addEventListener('click',()=>enter(true));document.getElementById('demo').addEventListener('click',()=>enter(false));
if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){
 setStatus('Camera API unavailable in this browser. Tap TEST CAMERA COMPATIBILITY to identify the cause, or try Safari / Chrome directly.');
}
document.getElementById('reset').addEventListener('click',()=>{populate();yaw=0;pitch=0;});
document.getElementById('cameraSwap').addEventListener('click',async()=>{facing=facing==='environment'?'user':'environment';try{await startCamera();}catch(e){facing=facing==='environment'?'user':'environment';hint.textContent='CAMERA SWITCH UNAVAILABLE';}});
function motionHandler(e){if(e.beta==null||e.gamma==null)return;if(lastBeta===null){lastBeta=e.beta;lastGamma=e.gamma;}const dx=clamp((e.gamma-lastGamma)*Math.PI/180,-1.3,1.3);const dy=clamp((e.beta-lastBeta)*Math.PI/180,-1.3,1.3);yaw+=((dx*.95)-yaw)*.075;pitch+=((dy*.85)-pitch)*.075;}
document.getElementById('orientation').addEventListener('click',async()=>{try{if(typeof DeviceOrientationEvent.requestPermission==='function'){const result=await DeviceOrientationEvent.requestPermission();if(result!=='granted')throw Error('Motion permission denied');}addEventListener('deviceorientation',motionHandler);motion=true;document.getElementById('orientation').style.display='none';hint.textContent='TAP GLYPHS · TILT PHONE · EXPLORE';}catch(e){hint.textContent='MOTION UNAVAILABLE · TOUCH STILL WORKS';}});
// Pause camera when user leaves, releasing mobile camera resources.
addEventListener('pagehide',()=>{if(stream)stream.getTracks().forEach(t=>t.stop());});
