(function(){
'use strict';

/* ═══════════════════════════════════════
   DEFAULT VALUES — always shown first,
   then overridden by Firestore if available.
   No empty containers ever.
   ═══════════════════════════════════════ */
var DEFAULTS={
  bannerImage:'',
  logoImage:'Logo.png',
  companyName:'شركة بركات المناسك<br>للسفر والسياحة والحج والعمرة',
  tagline1:'أكثر من 22 عاماً من الثقة والخبرة',
  tagline2:'في خدمة المسافرين وضيوف الرحمن.',
  btn1Text:'برامجنا الحالية',btn1Link:'#programs',
  btn2Text:'تواصل معنا',btn2Link:'#contact',
  btn3Text:'واتساب',btn3Link:'https://wa.me/9647744641155',
  stats:[
    {number:22,suffix:'+',label:'سنة خبرة'},
    {number:10000,suffix:'+',label:'مسافر معنا'},
    {number:95,suffix:'%',label:'نسبة رضا العملاء'},
    {number:200,suffix:'+',label:'برنامج تم تنفيذه'}
  ]
};

/* ── Apply data to the DOM ── */
function applyHero(data){
  var h=data||DEFAULTS;

  var bg=document.getElementById('heroBg');
  if(bg){
    if(h.bannerImage){
      bg.style.backgroundImage='url("'+h.bannerImage.replace(/"/g,'')+'")';
    }
  }

  var logo=document.getElementById('heroLogo');
  if(logo&&h.logoImage)logo.src=h.logoImage;

  var cn=document.getElementById('heroCompanyName');
  if(cn&&h.companyName)cn.innerHTML=h.companyName;

  setText('heroTagline1',h.tagline1);
  setText('heroTagline2',h.tagline2);

  setText('heroBtnPrograms',h.btn1Text);
  var bp=document.getElementById('heroBtnPrograms');
  if(bp&&h.btn1Link)bp.href=h.btn1Link;

  setText('heroBtnContact',h.btn2Text);
  var bc=document.getElementById('heroBtnContact');
  if(bc&&h.btn2Link)bc.href=h.btn2Link;

  setText('heroBtnWhatsapp',h.btn3Text);
  var bw=document.getElementById('heroBtnWhatsapp');
  if(bw&&h.btn3Link)bw.href=h.btn3Link;

  renderStats(h.stats);
  observeStats();
}

function setText(id,val){
  var el=document.getElementById(id);
  if(el&&val)el.textContent=val;
}

/* ── Stats ── */
function renderStats(stats){
  var grid=document.getElementById('statsGrid');
  if(!grid)return;
  var arr=stats&&stats.length?stats:DEFAULTS.stats;
  var html='';
  arr.forEach(function(s,i){
    var num=s.number||0;
    var suf=s.suffix||'';
    var lbl=s.label||'';
    html+='<div class="stat-item" data-anim="fade-up" data-delay="'+(i*100)+'">'
      +'<div class="stat-number"><span class="stat-count" data-target="'+num+'">0</span><span class="stat-suffix">'+h(suf)+'</span></div>'
      +'<div class="stat-label">'+h(lbl)+'</div>'
      +'</div>';
  });
  grid.innerHTML=html;
}

function h(s){
  if(typeof s!=='string')return'';
  var d=document.createElement('div');
  d.textContent=s;
  return d.innerHTML;
}

/* ── Counter Animation ── */
var countersAnimated=false;

function observeStats(){
  var section=document.getElementById('statsSection');
  if(!section||countersAnimated)return;
  if('IntersectionObserver'in window){
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          animateCounters();
          countersAnimated=true;
          obs.disconnect();
        }
      });
    },{threshold:.3});
    obs.observe(section);
  }else{
    animateCounters();
    countersAnimated=true;
  }
}

function animateCounters(){
  var els=document.querySelectorAll('.stat-count');
  els.forEach(function(el){
    var target=parseFloat(el.getAttribute('data-target'))||0;
    if(target===0){el.textContent='0';return}
    var duration=Math.min(2000,Math.max(800,target*20));
    var start=performance.now();
    function step(now){
      var p=Math.min(1,(now-start)/duration);
      var eased=1-Math.pow(1-p,3);
      var current=Math.round(eased*target);
      el.textContent=current;
      if(p<1)requestAnimationFrame(step);
      else el.textContent=target;
    }
    requestAnimationFrame(step);
  });
}

/* ── Prevent drag/context on hero images ── */
document.addEventListener('DOMContentLoaded',function(){
  document.addEventListener('contextmenu',function(e){
    var t=e.target;
    if(t.closest('.hero')||t.closest('.prg-main-img')||t.closest('.prg-day-img')||t.closest('.gal-preview')){
      e.preventDefault();
    }
  });
});

/* ═══════════════════════════════════════
   INIT — immediate render with defaults,
   then upgrade with Firestore data.
   ═══════════════════════════════════════ */
function init(){
  applyHero(DEFAULTS);
  try{
    var db=firebase.firestore();
    db.collection('settings').doc('hero').get().then(function(doc){
      if(doc.exists)applyHero(doc.data());
    }).catch(function(){});
  }catch(e){}
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
}else{
  init();
}

})();
