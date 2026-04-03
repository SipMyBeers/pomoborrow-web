(function(){
'use strict';

/* ===== TYPEWRITER ===== */
function typeWriter(el,text,speed,cb){
  var i=0;el.textContent='';
  function t(){
    if(i<text.length){el.textContent+=text[i];i++;setTimeout(t,speed)}
    else if(cb) setTimeout(cb,1500);
  }
  t();
}

/* ===== SECTION 1: THE QUESTION ===== */
function initQuestion(){
  var lines=document.querySelectorAll('#question .line');
  if(!lines.length) return;
  lines[0].classList.add('visible');
  typeWriter(lines[0],'What were you doing at 2pm last Tuesday?',65,function(){
    lines[1].classList.add('visible');
    typeWriter(lines[1],'Think about it.',70,function(){
      lines[2].classList.add('visible');
      lines[2].textContent="You don\u2019t know. Nobody does. And that\u2019s 86,400 seconds \u2014 gone.";
    });
  });
}

/* ===== SECTION 2: HOURGLASS PARTICLES + CRACKS ===== */
var sandCanvas,sandCtx,particles=[],hourglassProgress=0;

function initSand(){
  sandCanvas=document.getElementById('sand-canvas');
  if(!sandCanvas) return;
  sandCtx=sandCanvas.getContext('2d');
  resizeSandCanvas();
  window.addEventListener('resize',resizeSandCanvas);
  rafLoop();
}

function resizeSandCanvas(){
  if(!sandCanvas) return;
  var r=sandCanvas.parentElement.getBoundingClientRect();
  sandCanvas.width=r.width*devicePixelRatio;
  sandCanvas.height=r.height*devicePixelRatio;
  sandCtx.scale(devicePixelRatio,devicePixelRatio);
}

function spawnParticle(){
  var w=sandCanvas.width/devicePixelRatio;
  var h=sandCanvas.height/devicePixelRatio;
  // Spawn from center area of hourglass (the neck)
  particles.push({
    x:w*(.42+Math.random()*.16),
    y:h*.48+Math.random()*h*.04,
    vx:(Math.random()-.5)*1.2,
    vy:Math.random()*1.5+.5,
    r:Math.random()*2+1,
    life:1,
    decay:.003+Math.random()*.004
  });
}

function updateParticles(){
  if(!sandCanvas) return;
  var w=sandCanvas.width/devicePixelRatio;
  var h=sandCanvas.height/devicePixelRatio;
  sandCtx.clearRect(0,0,w,h);

  // Spawn rate tied to scroll progress
  var spawnRate=Math.floor(hourglassProgress*5);
  for(var s=0;s<spawnRate;s++) if(particles.length<200) spawnParticle();

  for(var i=particles.length-1;i>=0;i--){
    var p=particles[i];
    p.vy+=.12; // gravity
    p.x+=p.vx;
    p.y+=p.vy;
    p.life-=p.decay;
    if(p.life<=0||p.y>h){particles.splice(i,1);continue}
    sandCtx.beginPath();
    sandCtx.arc(p.x,p.y,p.r,0,Math.PI*2);
    sandCtx.fillStyle='rgba(234,179,8,'+p.life*hourglassProgress+')';
    sandCtx.fill();
  }
}

function rafLoop(){updateParticles();requestAnimationFrame(rafLoop)}

/* ===== HOURGLASS SCROLL ===== */
function updateHourglass(){
  var sec=document.getElementById('hourglass-section');
  if(!sec) return;
  var rect=sec.getBoundingClientRect();
  var total=sec.offsetHeight-window.innerHeight;
  var raw=-rect.top/total;
  hourglassProgress=Math.max(0,Math.min(1,raw));

  // Image filter
  var img=sec.querySelector('img');
  if(img){
    var bright=1-hourglassProgress*.4;
    var sepia=hourglassProgress*.3;
    var hue=hourglassProgress*(-15);
    img.style.filter='brightness('+bright+') sepia('+sepia+') hue-rotate('+hue+'deg)';
  }

  // Crack SVG paths
  var cracks=sec.querySelectorAll('.crack-path');
  cracks.forEach(function(c){
    var len=c.getTotalLength();
    c.style.strokeDasharray=len;
    c.style.strokeDashoffset=len*(1-hourglassProgress);
  });

  // Text phases
  var texts=sec.querySelectorAll('.hourglass-text');
  texts.forEach(function(t,idx){
    var lo=idx*.3,hi=lo+.35;
    t.classList.toggle('visible',hourglassProgress>=lo&&hourglassProgress<hi||idx===texts.length-1&&hourglassProgress>=lo);
  });
}

/* ===== SECTION 4: PRODUCT RING ===== */
var ringSegments=[
  {id:'sleep1',color:'#1e3a5f',start:0,end:97.5,label:'Sleep \u00b7 7h 23m',lx:-55,ly:-45},
  {id:'commute1',color:'#7c3aed',start:97.5,end:105,label:'Commute \u00b7 30m',lx:55,ly:-35},
  {id:'work1',color:'#3b82f6',start:105,end:176.25,label:'Deep Work \u00b7 4h 47m',lx:60,ly:15},
  {id:'lunch',color:'#eab308',start:176.25,end:187.5,label:'Lunch \u00b7 43m',lx:50,ly:50},
  {id:'meeting',color:'#60a5fa',start:187.5,end:210,label:'Meetings \u00b7 1h 30m',lx:30,ly:60},
  {id:'work2',color:'#3b82f6',start:210,end:258.75,label:'Deep Work \u00b7 3h 15m',lx:-50,ly:55},
  {id:'commute2',color:'#7c3aed',start:258.75,end:266.25,label:'Commute \u00b7 30m',lx:-60,ly:30},
  {id:'gym',color:'#f97316',start:266.25,end:285,label:'Gym \u00b7 1h 15m',lx:-60,ly:0},
  {id:'dinner',color:'#eab308',start:285,end:292.5,label:'Dinner \u00b7 30m',lx:-55,ly:-15},
  {id:'leisure',color:'#22c55e',start:292.5,end:345,label:'Leisure \u00b7 3h 30m',lx:-40,ly:-40},
  {id:'sleep2',color:'#1e3a5f',start:345,end:360,label:'Sleep',lx:0,ly:-55}
];

function initRing(){
  var svg=document.getElementById('ring-svg');
  if(!svg) return;
  var cx=200,cy=200,r=170,sw=28;

  // Background track
  var bg=document.createElementNS('http://www.w3.org/2000/svg','circle');
  bg.setAttribute('cx',cx);bg.setAttribute('cy',cy);bg.setAttribute('r',r);
  bg.setAttribute('fill','none');bg.setAttribute('stroke','#1a1a1a');bg.setAttribute('stroke-width',sw);
  svg.appendChild(bg);

  ringSegments.forEach(function(seg){
    var path=describeArc(cx,cy,r,seg.start-90,seg.end-90);
    var el=document.createElementNS('http://www.w3.org/2000/svg','path');
    el.setAttribute('d',path);
    el.setAttribute('fill','none');
    el.setAttribute('stroke',seg.color);
    el.setAttribute('stroke-width',sw);
    el.setAttribute('stroke-linecap','round');
    el.id='seg-'+seg.id;
    var len=el.getTotalLength?el.getTotalLength():arcLength(r,seg.start,seg.end);
    el.setAttribute('stroke-dasharray',len);
    el.setAttribute('stroke-dashoffset',len);
    svg.appendChild(el);
  });
}

function arcLength(r,s,e){return Math.PI*2*r*((e-s)/360)}

function describeArc(cx,cy,r,startAngle,endAngle){
  var s=polarToCartesian(cx,cy,r,endAngle);
  var e=polarToCartesian(cx,cy,r,startAngle);
  var large=(endAngle-startAngle>180)?1:0;
  return['M',s.x,s.y,'A',r,r,0,large,0,e.x,e.y].join(' ');
}

function polarToCartesian(cx,cy,r,deg){
  var rad=deg*Math.PI/180;
  return{x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)};
}

function updateRing(){
  var sec=document.getElementById('product-section');
  if(!sec) return;
  var rect=sec.getBoundingClientRect();
  var total=sec.offsetHeight-window.innerHeight;
  var raw=-rect.top/total;
  var progress=Math.max(0,Math.min(1,raw));

  // Show intro text
  var intro=sec.querySelector('.product-intro');
  if(intro) intro.classList.toggle('visible',progress>.02);

  // Draw segments sequentially
  var segProgress=progress*1.3; // speed up segment drawing to leave room for sub-text
  ringSegments.forEach(function(seg,i){
    var el=document.getElementById('seg-'+seg.id);
    if(!el) return;
    var segStart=i/ringSegments.length;
    var segEnd=(i+1)/ringSegments.length;
    var localP=Math.max(0,Math.min(1,(segProgress-segStart)/(segEnd-segStart)));
    var len=el.getTotalLength();
    el.setAttribute('stroke-dashoffset',len*(1-localP));

    // Labels
    var lbl=document.getElementById('lbl-'+seg.id);
    if(lbl) lbl.classList.toggle('visible',localP>.95);
  });

  // Sub text and sensors
  var sub=sec.querySelector('.product-sub');
  if(sub) sub.classList.toggle('visible',progress>.75);
  var sensors=sec.querySelectorAll('.sensor-item');
  sensors.forEach(function(s,i){
    s.classList.toggle('visible',progress>.78+i*.03);
  });
}

/* ===== COUNTDOWN ===== */
function initCountdown(){
  var el=document.getElementById('ring-countdown');
  if(!el) return;
  function tick(){
    var now=new Date();
    var mid=new Date(now);mid.setHours(24,0,0,0);
    var rem=mid-now;
    var h=Math.floor(rem/3600000);
    var m=Math.floor((rem%3600000)/60000);
    var s=Math.floor((rem%60000)/1000);
    el.textContent=pad(h)+':'+pad(m)+':'+pad(s);
  }
  function pad(n){return n<10?'0'+n:n}
  tick();setInterval(tick,1000);
}

/* ===== SECTION 5: TIMELINE ===== */
var timelineData=[
  {name:'Sleep',start:0,end:6.5,color:'var(--sleep)',det:'Location: Home \u00b7 Motion: Stationary \u00b7 Sound: Silent \u00b7 Devices: iPhone (charging)'},
  {name:'Commute',start:6.5,end:7,color:'var(--commute)',det:'Location: Transit \u00b7 Motion: Vehicle \u00b7 Sound: Road noise \u00b7 Devices: iPhone + AirPods'},
  {name:'Deep Work',start:7,end:11.783,color:'var(--work)',det:'Location: Office \u00b7 Motion: Stationary \u00b7 Sound: Keyboard typing \u00b7 Devices: MacBook + Monitor'},
  {name:'Lunch',start:11.783,end:12.5,color:'var(--lunch)',det:'Location: Cafe nearby \u00b7 Motion: Walking then stationary \u00b7 Sound: Ambient chatter \u00b7 Devices: iPhone only'},
  {name:'Meetings',start:12.5,end:14,color:'var(--meeting)',det:'Location: Office (conf room) \u00b7 Motion: Stationary \u00b7 Sound: Voices \u00b7 Devices: MacBook + iPhone'},
  {name:'Deep Work',start:14,end:17.25,color:'var(--work)',special:true,det:'Location: Office \u00b7 Motion: Stationary \u00b7 Sound: Keyboard typing \u00b7 Devices: MacBook + Monitor'},
  {name:'Commute',start:17.25,end:17.75,color:'var(--commute)',det:'Location: Transit \u00b7 Motion: Vehicle \u00b7 Sound: Road noise \u00b7 Devices: iPhone + AirPods'},
  {name:'Gym',start:17.75,end:19,color:'var(--gym)',det:'Location: Gym \u00b7 Motion: High activity \u00b7 Sound: Music \u00b7 Devices: Apple Watch + AirPods'},
  {name:'Dinner',start:19,end:19.5,color:'var(--dinner)',det:'Location: Home \u00b7 Motion: Stationary \u00b7 Sound: Ambient \u00b7 Devices: iPhone'},
  {name:'Leisure',start:19.5,end:23,color:'var(--leisure)',det:'Location: Home \u00b7 Motion: Stationary \u00b7 Sound: TV audio \u00b7 Devices: iPhone + Apple TV'},
  {name:'Sleep',start:23,end:24,color:'var(--sleep)',det:'Location: Home \u00b7 Motion: Stationary \u00b7 Sound: Silent \u00b7 Devices: iPhone (charging)'}
];

function formatHour(h){
  var hr=Math.floor(h);var min=Math.round((h-hr)*60);
  var ampm=hr>=12?'pm':'am';var h12=hr%12||12;
  return h12+':'+(min<10?'0':'')+min+ampm;
}

function durStr(s,e){
  var total=e-s;var hrs=Math.floor(total);var mins=Math.round((total-hrs)*60);
  if(hrs&&mins) return hrs+'h '+mins+'m';
  if(hrs) return hrs+'h';
  return mins+'m';
}

function initTimeline(){
  var track=document.querySelector('.timeline-track');
  if(!track) return;

  timelineData.forEach(function(b){
    var div=document.createElement('div');
    div.className='timeline-block';
    div.style.width=((b.end-b.start)/24*100)+'%';
    div.style.background=b.color;
    div.textContent=b.name;

    // Tooltip
    var tip=document.createElement('div');
    tip.className='timeline-tooltip';
    tip.innerHTML='<div class="tt-title">'+b.name+'</div>'+
      '<div class="tt-time">'+formatHour(b.start)+' \u2013 '+formatHour(b.end)+'</div>'+
      '<div class="tt-dur">'+durStr(b.start,b.end)+'</div>'+
      (b.special?'<div class="tt-special">This is what you were doing at 2pm last Tuesday.</div>':'')+
      '<div class="tt-details">'+b.det+'</div>';
    div.appendChild(tip);

    div.addEventListener('click',function(e){
      e.stopPropagation();
      var wasExpanded=div.classList.contains('expanded');
      track.querySelectorAll('.expanded').forEach(function(x){x.classList.remove('expanded')});
      if(!wasExpanded) div.classList.add('expanded');
    });

    track.appendChild(div);
  });

  // Close expanded on outside click
  document.addEventListener('click',function(){
    track.querySelectorAll('.expanded').forEach(function(x){x.classList.remove('expanded')});
  });

  // Drag to scroll
  var outer=document.querySelector('.timeline-outer');
  var isDown=false,startX,scrollLeft;
  outer.addEventListener('mousedown',function(e){isDown=true;startX=e.pageX-outer.offsetLeft;scrollLeft=outer.scrollLeft});
  outer.addEventListener('mouseleave',function(){isDown=false});
  outer.addEventListener('mouseup',function(){isDown=false});
  outer.addEventListener('mousemove',function(e){
    if(!isDown) return;e.preventDefault();
    var x=e.pageX-outer.offsetLeft;
    outer.scrollLeft=scrollLeft-(x-startX)*1.5;
  });

  // Hour labels
  var hours=document.querySelector('.timeline-hours');
  if(hours){
    for(var i=0;i<24;i+=3){
      var sp=document.createElement('span');
      sp.textContent=formatHour(i);
      hours.appendChild(sp);
    }
  }
}

/* ===== SECTION 6: ANSWER REVEAL ===== */
function initAnswerObserver(){
  var lines=document.querySelectorAll('#answer .ans-line');
  if(!lines.length) return;
  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var delay=parseInt(entry.target.dataset.delay||0);
        setTimeout(function(){entry.target.classList.add('visible')},delay);
      }
    });
  },{threshold:.3});
  lines.forEach(function(l){observer.observe(l)});
}

/* ===== SECTION 7: PRIVACY COUNTERS ===== */
function animateCounter(el,target,suffix,duration){
  var start=0;var startTime=null;
  suffix=suffix||'';
  function step(ts){
    if(!startTime) startTime=ts;
    var p=Math.min((ts-startTime)/duration,1);
    var ease=1-Math.pow(1-p,3);
    var val=Math.round(start+(target-start)*ease);
    el.textContent=val+suffix;
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initPrivacyCounters(){
  var nums=document.querySelectorAll('.privacy-num .big');
  if(!nums.length) return;
  var fired=false;
  var observer=new IntersectionObserver(function(entries){
    if(fired) return;
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        fired=true;
        animateCounter(nums[0],0,'',800);
        animateCounter(nums[1],0,'',800);
        animateCounter(nums[2],100,'%',1200);
      }
    });
  },{threshold:.5});
  observer.observe(nums[0]);
}

/* ===== SECTION 8: LEARNS REVEAL ===== */
function initLearnsReveal(){
  var cards=document.querySelectorAll('.learns-card');
  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting) entry.target.classList.add('reveal-in');
    });
  },{threshold:.2});
  cards.forEach(function(c){observer.observe(c)});
}

/* ===== SECTION 3: CONFRONTATION REVEAL ===== */
function initConfrontReveal(){
  var items=document.querySelectorAll('.confront-left .quote, .confront-right .stat, .confront-bottom');
  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var delay=parseInt(entry.target.dataset.delay||0);
        setTimeout(function(){entry.target.classList.add('reveal-in')},delay);
      }
    });
  },{threshold:.2});
  items.forEach(function(item){observer.observe(item)});
}

/* ===== MASTER SCROLL HANDLER ===== */
function onScroll(){
  updateHourglass();
  updateRing();
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded',function(){
  initQuestion();
  initSand();
  initRing();
  initCountdown();
  initTimeline();
  initAnswerObserver();
  initPrivacyCounters();
  initLearnsReveal();
  initConfrontReveal();
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();
});

})();
