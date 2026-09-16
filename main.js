const CHARS=[
 {id:"glitch",name:"格莉奇",color:"#9e8ce0",line:"今天的故障訊號指向你。"},{id:"catgrass",name:"貓草",color:"#75b78b",line:"慢慢轉，也會走到答案。"},{id:"bambi",name:"斑比",color:"#df91ad",line:"這一格是我的。"},{id:"noah",name:"諾亞",color:"#ce9860",line:"運氣也是可以觀察的。"},{id:"tower",name:"鐵塔",color:"#6c9bc3",line:"轉盤結果已經登記。"},{id:"zerox",name:"0x",color:"#7c8292",line:"……不要再轉一次。"},{id:"blackhole",name:"黑洞先生",color:"#554b62",line:"指針停在星星墜落的地方。"}
];
const $=s=>document.querySelector(s),canvas=$("#game"),ctx=canvas.getContext("2d"),spinBtn=$("#spin"),statusEl=$("#status"),soundBtn=$("#sound"),exitBtn=$("#exit"),reveal=$("#reveal"),collection=$("#collection"),count=$("#count");
const KEY="glitch-park-wheel:v1",embedded=self!==top,THEME="./assets/audio/glitch-park-theme.mp3";let data={spins:0,owned:[]},localStore=false;try{localStorage.setItem(KEY+":probe","1");localStorage.removeItem(KEY+":probe");localStore=true;data={...data,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{}let sound=true,audioContext,themeAudio,angle=0,spinning=false,start=0,duration=0,from=0,to=0,w=0,h=0,dpr=1;
if(embedded){const brand=exitBtn.closest(".brand"),topLeft=document.createElement("div"),style=document.createElement("style");document.documentElement.classList.add("embedded");topLeft.className="topLeft";brand.before(topLeft);topLeft.append(exitBtn,brand);style.textContent=".topLeft{display:flex;align-items:flex-start;gap:8px}.embedded .tools{margin-right:64px}@media(max-width:600px){.embedded .tools{margin-top:54px;margin-right:0}}";document.head.append(style)}
const atlas=new Image();atlas.src="./assets/avatar-atlas.webp";atlas.onload=draw;
function avatarStyle(i){return `--x:${i%4/3*100}%;--y:${Math.floor(i/4)*100}%`}
function requestTheme(action,muted=false){if(embedded){parent.postMessage({type:"glitch-park:music",action,track:"theme",url:new URL(THEME,location.href).href,muted},"*");return}themeAudio||=Object.assign(new Audio(THEME),{loop:true,volume:.27});themeAudio.muted=muted;if(action==="play"&&!muted)themeAudio.play().catch(()=>{});if(action==="pause")themeAudio.pause()}
if(embedded){
  exitBtn.hidden=false;exitBtn.onclick=()=>parent.postMessage({type:"wheel:exit",complete:data.owned.length===CHARS.length},"*");
  addEventListener("message",event=>{if(event.data?.type!=="wheel:state")return;if(event.data.state)data={...data,...event.data.state};paintCount();draw()});
  parent.postMessage({type:"wheel:ready"},"*");
}else requestTheme("play");
function saveState(){if(localStore){try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}}else if(embedded)parent.postMessage({type:"wheel:save",state:data},"*")}
function beep(freq,dur=.08,vol=.035,type="sine"){if(!sound)return;audioContext||=new(window.AudioContext||window.webkitAudioContext)();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(vol,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+dur);o.connect(g).connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+dur)}
soundBtn.onclick=()=>{sound=!sound;soundBtn.textContent=`聲音：${sound?"開":"關"}`;soundBtn.setAttribute("aria-pressed",String(!sound));requestTheme("mute",!sound);if(sound){requestTheme("play");beep(660)}};
function resize(){dpr=Math.min(devicePixelRatio,1.7);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw()}addEventListener("resize",resize);resize();
function layout(){const tall=h/w>1.18,r=Math.min(w*(tall?.44:.29),h*(tall?.31:.37),310);return{x:w/2,y:h*(tall?.47:.5),r}}
function draw(){
  ctx.clearRect(0,0,w,h);
  const {x,y,r}=layout(),horizon=Math.min(h*.7,y+r*.68),time=performance.now()*.001;

  // 深色遊樂園展廳：牆面有分區、霓虹拱門與真正向遠方收束的地板。
  const bg=ctx.createRadialGradient(w/2,h*.4,20,w/2,h*.45,Math.max(w,h)*.8);
  bg.addColorStop(0,"#76568c");bg.addColorStop(.44,"#49345e");bg.addColorStop(1,"#21152f");
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  ctx.fillStyle="rgba(8,4,16,.18)";
  for(let i=0;i<9;i++){const px=i*w/8;ctx.fillRect(px-2,0,4,horizon)}
  ctx.strokeStyle="rgba(105,238,224,.24)";ctx.lineWidth=3;
  ctx.beginPath();ctx.ellipse(w/2,horizon+40,w*.46,h*.58,0,Math.PI,Math.PI*2);ctx.stroke();
  ctx.strokeStyle="rgba(255,114,197,.16)";ctx.lineWidth=1.5;
  for(let py=90;py<horizon;py+=72){ctx.beginPath();ctx.moveTo(0,py);ctx.lineTo(w,py);ctx.stroke()}
  const floor=ctx.createLinearGradient(0,horizon,0,h);floor.addColorStop(0,"#49335e");floor.addColorStop(1,"#181024");ctx.fillStyle=floor;ctx.fillRect(0,horizon,w,h-horizon);
  ctx.strokeStyle="rgba(105,238,224,.2)";ctx.lineWidth=1;
  for(let i=-10;i<=10;i++){ctx.beginPath();ctx.moveTo(w/2+i*24,horizon);ctx.lineTo(w/2+i*w*.14,h);ctx.stroke()}
  for(let q=0;q<8;q++){const p=q/8,py=horizon+(h-horizon)*p*p;ctx.beginPath();ctx.moveTo(0,py);ctx.lineTo(w,py);ctx.stroke()}

  // 兩側縮小機台建立尺度與店內密度，細節全由向量繪製，不增加資源請求。
  const sideMachine=(mx,my,scale,accent)=>{ctx.save();ctx.translate(mx,my);ctx.scale(scale,scale);ctx.fillStyle="#130a20";ctx.strokeStyle=accent;ctx.lineWidth=5;ctx.shadowBlur=18;ctx.shadowColor=accent;ctx.beginPath();ctx.roundRect(-76,-170,152,270,18);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle="#2d1947";ctx.fillRect(-62,-150,124,42);ctx.strokeStyle="#ffd36e";ctx.strokeRect(-52,-142,104,26);ctx.fillStyle="#f7f2ff";ctx.font="800 19px system-ui";ctx.textAlign="center";ctx.fillText("LUCKY",0,-121);ctx.fillStyle="#08040e";ctx.fillRect(-54,-94,108,94);for(let i=-1;i<=1;i++){ctx.fillStyle=i===0?accent:"#725986";ctx.beginPath();ctx.arc(i*34,-47,22,0,Math.PI*2);ctx.fill()}ctx.fillStyle="#392154";ctx.fillRect(-58,16,116,55);ctx.fillStyle=accent;ctx.fillRect(-44,31,42,10);ctx.fillStyle="#ffd36e";ctx.beginPath();ctx.arc(31,38,9,0,Math.PI*2);ctx.fill();ctx.restore()};
  const sideScale=Math.max(.56,Math.min(.82,w/1500));
  if(w>700){sideMachine(w*.11,horizon-16,sideScale,"#69eee0");sideMachine(w*.89,horizon-16,sideScale,"#ff72c5")}

  // 後牆燈箱招牌。
  const signW=Math.min(w*(w<600?.88:.44),620),signY=Math.max(54,y-r-112);
  ctx.save();ctx.translate(w/2,signY);ctx.shadowBlur=24;ctx.shadowColor="#69eee0";ctx.fillStyle="rgba(15,8,27,.92)";ctx.strokeStyle="#69eee0";ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(-signW/2,-35,signW,70,12);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.strokeStyle="#ff72c5";ctx.lineWidth=2;ctx.strokeRect(-signW/2+9,-26,signW-18,52);ctx.fillStyle="#fff";ctx.textAlign="center";ctx.textBaseline="middle";ctx.font=`900 ${Math.max(22,Math.min(36,signW*.065))}px system-ui`;ctx.fillText("GLITCH LUCKY WHEEL",0,-4);ctx.fillStyle="#ffd36e";ctx.font="600 11px system-ui";ctx.fillText("格 莉 奇 遊 樂 園",0,19);ctx.restore();

  // 地面陰影、支架與舞台底座先畫，轉盤才會有重量。
  ctx.save();ctx.translate(x,y);ctx.fillStyle="rgba(0,0,0,.5)";ctx.beginPath();ctx.ellipse(0,r*.92,r*1.18,r*.25,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#171022";ctx.strokeStyle="#69eee0";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-r*.52,r*.78);ctx.lineTo(-r*.82,r*1.12);ctx.lineTo(r*.82,r*1.12);ctx.lineTo(r*.52,r*.78);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle="#392052";ctx.fillRect(-r*.9,r*1.03,r*1.8,r*.2);ctx.fillStyle="#ff72c5";ctx.shadowBlur=16;ctx.shadowColor="#ff72c5";ctx.fillRect(-r*.65,r*1.1,r*1.3,5);ctx.shadowBlur=0;ctx.restore();

  // 多層外框、金屬斜面與燈泡把平面圓餅變成實體大型轉盤。
  const step=Math.PI*2/7;ctx.save();ctx.translate(x,y);
  const rim=ctx.createRadialGradient(-r*.25,-r*.28,r*.12,0,0,r+24);rim.addColorStop(0,"#866ca8");rim.addColorStop(.7,"#29163e");rim.addColorStop(1,"#0a0511");ctx.fillStyle=rim;ctx.shadowBlur=42;ctx.shadowColor="#69eee0";ctx.beginPath();ctx.arc(0,0,r+26,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle="#69eee0";ctx.lineWidth=8;ctx.stroke();ctx.strokeStyle="#ffd36e";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r+15,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<28;i++){const a=i*Math.PI*2/28,active=spinning&&((i+Math.floor(time*18))%7<2);ctx.fillStyle=i%2?"#ff72c5":"#8ffff4";ctx.shadowBlur=active?20:8;ctx.shadowColor=ctx.fillStyle;ctx.beginPath();ctx.arc(Math.cos(a)*(r+20),Math.sin(a)*(r+20),active?5.5:4,0,Math.PI*2);ctx.fill()}ctx.shadowBlur=0;
  for(let i=0;i<7;i++){const a0=angle+i*step-Math.PI/2-step/2,a1=a0+step,base=CHARS[i].color;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r,a0,a1);ctx.closePath();const sg=ctx.createRadialGradient(-r*.18,-r*.22,0,0,0,r);sg.addColorStop(0,"#d9d0f1");sg.addColorStop(.22,base);sg.addColorStop(1,"#261733");ctx.fillStyle=sg;ctx.fill();ctx.strokeStyle="#160b22";ctx.lineWidth=5;ctx.stroke();const a=(a0+a1)/2,ix=Math.cos(a)*r*.62,iy=Math.sin(a)*r*.62,sz=r*.29;ctx.save();ctx.translate(ix,iy);ctx.rotate(a+Math.PI/2);ctx.shadowBlur=16;ctx.shadowColor=i%2?"#ff72c5":"#69eee0";ctx.fillStyle="#10091b";ctx.beginPath();ctx.arc(0,0,sz*.64,0,Math.PI*2);ctx.fill();ctx.strokeStyle=i%2?"#ffb2dd":"#aafff7";ctx.lineWidth=4;ctx.stroke();ctx.shadowBlur=0;ctx.beginPath();ctx.arc(0,0,sz*.56,0,Math.PI*2);ctx.clip();if(atlas.complete&&atlas.naturalWidth){const sw=atlas.naturalWidth/4,sh=atlas.naturalHeight/2;ctx.drawImage(atlas,(i%4)*sw,Math.floor(i/4)*sh,sw,sh,-sz*.56,-sz*.56,sz*1.12,sz*1.12)}ctx.restore()}
  const hub=ctx.createRadialGradient(-r*.05,-r*.06,2,0,0,r*.2);hub.addColorStop(0,"#8a71aa");hub.addColorStop(.5,"#28163d");hub.addColorStop(1,"#08040e");ctx.beginPath();ctx.arc(0,0,r*.18,0,Math.PI*2);ctx.fillStyle=hub;ctx.fill();ctx.strokeStyle="#ffd36e";ctx.lineWidth=6;ctx.stroke();ctx.fillStyle="#fff";ctx.textAlign="center";ctx.textBaseline="middle";ctx.font=`900 ${Math.max(15,r*.075)}px system-ui`;ctx.fillText("GLITCH",0,-4);ctx.fillStyle="#69eee0";ctx.font=`700 ${Math.max(8,r*.033)}px system-ui`;ctx.fillText("LUCKY",0,r*.075);ctx.restore();

  // 厚實的指針座與金色指針固定在正上方；旋轉的是盤，不是指針。
  ctx.save();ctx.translate(x,y-r-29);ctx.shadowBlur=24;ctx.shadowColor="#ffd36e";ctx.fillStyle="#21122f";ctx.strokeStyle="#ffdf8c";ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(-34,-24,68,28,10);ctx.fill();ctx.stroke();ctx.fillStyle="#ffd36e";ctx.beginPath();ctx.moveTo(0,31);ctx.lineTo(-23,-5);ctx.lineTo(23,-5);ctx.closePath();ctx.fill();ctx.fillStyle="#fff4ca";ctx.beginPath();ctx.arc(0,-11,8,0,Math.PI*2);ctx.fill();ctx.restore();
}
let lastTick=-1;function spin(){if(spinning)return;requestTheme("play",!sound);spinning=true;spinBtn.disabled=true;statusEl.textContent="轉盤正在旋轉……";const target=Math.floor(Math.random()*7),step=Math.PI*2/7;from=angle;const desired=-(target*step)+Math.PI*2*6;to=from+desired-(from%(Math.PI*2));duration=4200+Math.random()*700;start=performance.now();lastTick=-1;requestAnimationFrame(frame)}
function frame(now){const p=Math.min((now-start)/duration,1),e=1-Math.pow(1-p,4);angle=from+(to-from)*e;const tick=Math.floor(angle/(Math.PI*2/28));if(tick!==lastTick){lastTick=tick;beep(190+(tick%7)*18,.025,.012,"square")}draw();if(p<1)requestAnimationFrame(frame);else finish()}
function finish(){spinning=false;angle=((angle%(Math.PI*2))+Math.PI*2)%(Math.PI*2);const step=Math.PI*2/7,index=(Math.round((-angle)/step)%7+7)%7,c=CHARS[index];data.spins++;if(!data.owned.includes(c.id))data.owned.push(c.id);saveState();paintCount();statusEl.innerHTML=`指針選中了 <b>${c.name}</b>。`;reveal.innerHTML=`<div class="card"><div class="eyebrow">今日幸運角色</div><div class="big"><span class="avatar" style="${avatarStyle(index)}"></span></div><h2>${c.name}</h2><p>「${c.line}」</p><button>再轉一次</button></div>`;reveal.hidden=false;reveal.querySelector("button").onclick=()=>{reveal.hidden=true;spinBtn.disabled=false;statusEl.textContent="按下轉盤，看看下一次會遇見誰。"};[523,659,784].forEach((f,i)=>setTimeout(()=>beep(f,.18,.045),i*110))}
function paintCount(){count.textContent=data.owned.length}function openCollection(){collection.innerHTML=`<div class="card"><div class="head"><span>轉盤收藏（${data.owned.length}/7）</span><button>關閉</button></div>${CHARS.map((c,i)=>`<div class="row"><span class="mini"><span class="avatar" style="${avatarStyle(i)}"></span></span><div><b>${c.name}</b><br><small>${data.owned.includes(c.id)?"已經轉到":"還沒遇見"}</small></div></div>`).join("")}</div>`;collection.hidden=false;collection.querySelector("button").onclick=()=>collection.hidden=true}$("#collectionButton").onclick=openCollection;spinBtn.onclick=spin;canvas.onclick=spin;addEventListener("keydown",e=>{if(e.code==="Space"){e.preventDefault();spin()}});paintCount();draw();
