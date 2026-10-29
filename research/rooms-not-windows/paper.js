(function(){
document.documentElement.classList.add('js');
const NS="http://www.w3.org/2000/svg";
function el(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}

/* 12 tab windows */
const wins=document.getElementById('wins');
for(let r=0;r<3;r++)for(let c=0;c<4;c++){
  const x=110+c*150, y=100+r*130, g=el('g',{class:'win'+((r===1&&c===2)?' target':'')},wins);
  g.style.animationDelay=((r*4+c)*0.05)+'s';
  el('rect',{x,y,width:130,height:110,rx:8,fill:'#fbf8f3',stroke:'#1a1008','stroke-width':1.5},g);
  el('rect',{x,y,width:130,height:16,rx:8,fill:'#1a1008'},g);
  el('rect',{x,y:y+8,width:130,height:8,fill:'#1a1008'},g);
  for(let l=0;l<4;l++) el('rect',{x:x+10,y:y+28+l*18,width:[90,70,100,60][(l+r+c)%4],height:8,rx:4,fill:'#ddd4c6'},g);
}

/* five rooms */
const names=['Ideas','References','Requirements','Editing','Publishing'];
const rooms=document.getElementById('rooms');
names.forEach((n,i)=>{
  const x=40+i*146, y=92, w=136, h=206;
  const g=el('g',{class:'room r'+(i+1)},rooms);
  el('rect',{x,y,width:w,height:h,fill:'#fbf8f3',stroke:'#1a1008','stroke-width':2},g);
  el('rect',{class:'hl',x:x+4,y:y+4,width:w-8,height:h-8,fill:'none',stroke:'#b4561f','stroke-width':3,rx:2},g);
  el('rect',{x:x+w/2-16,y:y+h-2,width:32,height:4,fill:'#efe7da'},g);
  el('circle',{class:'glow',cx:x+w/2,cy:y+46,r:50,fill:'url(#glowg)'},g);
  el('rect',{x:x+22,y:y+22,width:w-44,height:46,rx:3,fill:'#1a1008'},g);
  el('rect',{x:x+30,y:y+32,width:w-60,height:5,rx:2,fill:'#6b5d4f'},g);
  el('rect',{class:'prog',x:x+30,y:y+44,width:w-60,height:6,rx:2,fill:'#d19a2a'},g);
  el('rect',{x:x+30,y:y+56,width:(w-60)*.6,height:5,rx:2,fill:'#6b5d4f'},g);
  el('rect',{x:x+28,y:y+120,width:w-56,height:14,fill:'#c9b79f',stroke:'#1a1008','stroke-width':1.2},g);
  el('rect',{x:x+w/2-9,y:y+94,width:18,height:24,rx:3,fill:'#4a3b2f'},g);
  el('rect',{x:x+w/2-8,y:y+78,width:16,height:16,rx:2,fill:'#e8c9a8',stroke:'#1a1008','stroke-width':1.1},g);
  el('rect',{class:'lamp',x:x+w-26,y:y+150,width:14,height:14,rx:2,fill:i===2?'#3f7d4e':'#d19a2a',stroke:'#1a1008','stroke-width':1},g);
  el('text',{x:x+w/2,y:y+184,'text-anchor':'middle','font-size':13,'font-weight':600,fill:'#1a1008'},g).textContent=n;
  el('text',{x:x+w/2,y:y+h-10,'text-anchor':'middle','font-size':10,fill:'#6b5d4f'},g).textContent='room '+(i+1);
});

/* new room built from blocks */
const nr=document.getElementById('newroom'); let k=0;
for(let r=0;r<5;r++)for(let c=0;c<9;c++){
  const edge=(r===0||r===4||c===0||c===8); if(!edge && !(r===2&&c>2&&c<6)) continue;
  const b=el('rect',{class:'blk',x:480+c*26,y:420+r*26,width:24,height:24,rx:2,fill:edge?'#c9b79f':'#1a1008',stroke:'#1a1008','stroke-width':1},nr);
  b.style.animationDelay=(k++*0.045)+'s';
}
el('text',{x:597,y:410,'text-anchor':'middle','font-size':13,'font-weight':600,fill:'#b4561f'},nr).textContent='new room, built by an agent';

/* scrollytelling */
const stage=document.getElementById('stage');
const steps=[...document.querySelectorAll('.step')];
let cur=-1;
function setStep(n){
  if(n===cur) return; cur=n;
  let cls='stage s'+n; for(let i=0;i<=n;i++) cls+=' ge'+i;
  stage.setAttribute('class',cls);
  steps.forEach(s=>s.classList.toggle('on',+s.dataset.s===n));
}
function pickStep(){
  const mid=innerHeight*0.5; let best=0, bd=1e9;
  steps.forEach(s=>{const r=s.querySelector('.card').getBoundingClientRect(); const d=Math.abs((r.top+r.bottom)/2-mid); if(d<bd){bd=d;best=+s.dataset.s;}});
  const sc=document.querySelector('.scrolly').getBoundingClientRect();
  if(sc.top>mid) best=0;
  setStep(best);
}
let ticking=false;
addEventListener('scroll',pickStep,{passive:true});
addEventListener('resize',pickStep);
pickStep();

/* reveal + counters */
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function count(e){
  const to=+e.dataset.count, pre=e.dataset.prefix||'', suf=e.dataset.suffix||'';
  if(reduce){e.textContent=pre+to+suf;return;}
  const t0=performance.now(), d=1300;
  (function tick(t){const p=Math.min(1,(t-t0)/d), v=Math.round(to*(1-Math.pow(1-p,3))); e.textContent=pre+v+suf; if(p<1)requestAnimationFrame(tick);})(t0);
}
const ro=new IntersectionObserver(es=>{es.forEach(e=>{ if(!e.isIntersecting) return; e.target.classList.add('in');
  e.target.querySelectorAll('[data-count]').forEach(count); ro.unobserve(e.target); });},{threshold:.12});
document.querySelectorAll('.reveal,.stagger,.timeline').forEach(x=>ro.observe(x));

/* top bar, progress, chapter highlight */
const bar=document.getElementById('topbar'), prog=document.getElementById('progress');
const links=[...document.querySelectorAll('#chapters a')], secs=links.map(a=>document.querySelector(a.getAttribute('href')));
function onScroll(){
  const h=document.documentElement; prog.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  bar.classList.toggle('show', h.scrollTop>innerHeight*.6);
  let c=-1; secs.forEach((s,i)=>{ if(s && s.getBoundingClientRect().top<innerHeight*.4) c=i; });
  links.forEach((a,i)=>a.classList.toggle('active',i===c));
}
addEventListener('scroll',onScroll,{passive:true}); onScroll();
})();
