(function(){
'use strict';

try{firebase.initializeApp(firebaseConfig)}catch(e){}
var db=firebase.firestore();

var DEFAULT_HERO={
  bannerImage:'',
  logoImage:'Logo.png',
  companyName:'شركة بركات المناسك للسفر والسياحة',
  tagline1:'أكثر من 22 سنة من الثقة والخبرة في السفر والسياحة',
  tagline2:'شركة بركات المناسك للسفر والسياحة تقدم خدمات العمرة، حجوزات الطيران، التأشيرات، الفنادق، والنقل البري داخل وخارج العراق.',
  btn1Text:'برامجنا',btn1Link:'#programs',
  btn2Text:'تواصل معنا',btn2Link:'#contact',
  btn3Text:'واتساب',btn3Link:'https://wa.me/9647744641155',
  stats:[
    {number:22,suffix:'+',label:'سنة خبرة'},
    {number:10000,suffix:'+',label:'مسافر'},
    {number:95,suffix:'%',label:'رضا العملاء'},
    {number:200,suffix:'+',label:'برنامج سياحي'}
  ]
};

function initHero(){
  db.collection('settings').doc('hero').get().then(function(doc){
    if(doc.exists){
      applyHero(doc.data());
    }else{
      applyHero(DEFAULT_HERO);
    }
  }).catch(function(){
    applyHero(DEFAULT_HERO);
  });
}

function applyHero(data){
  var hero=data||DEFAULT_HERO;

  var bg=document.getElementById('heroBg');
  if(bg&&hero.bannerImage){
    bg.style.backgroundImage='url("'+hero.bannerImage.replace(/"/g,'')+'")';
  }

  var logo=document.getElementById('heroLogo');
  if(logo&&hero.logoImage){
    logo.src=hero.logoImage;
  }

  setText('heroCompanyName',hero.companyName);
  setText('heroTagline1',hero.tagline1);
  setText('heroTagline2',hero.tagline2);

  setText('heroBtnPrograms',hero.btn1Text);
  var bp=document.getElementById('heroBtnPrograms');
  if(bp&&hero.btn1Link)bp.href=hero.btn1Link;

  setText('heroBtnContact',hero.btn2Text);
  var bc=document.getElementById('heroBtnContact');
  if(bc&&hero.btn2Link)bc.href=hero.btn2Link;

  setText('heroBtnWhatsapp',hero.btn3Text);
  var bw=document.getElementById('heroBtnWhatsapp');
  if(bw&&hero.btn3Link)bw.href=hero.btn3Link;

  renderStats(hero.stats);
  observeStats();
}

function setText(id,val){
  var el=document.getElementById(id);
  if(el&&val)el.textContent=val;
}

function renderStats(stats){
  var grid=document.getElementById('statsGrid');
  if(!grid)return;
  var arr=stats&&stats.length?stats:DEFAULT_HERO.stats;
  var html='';
  arr.forEach(function(s,i){
    var num=s.number||0;
    var suf=s.suffix||'';
    var lbl=s.label||'';
    html+='<div class="stat-item" data-anim="fade-up" data-delay="'+(i*100)+'">'
      +'<div class="stat-number"><span class="stat-count" data-target="'+num+'">0</span><span class="stat-suffix">'+esc(suf)+'</span></div>'
      +'<div class="stat-label">'+esc(lbl)+'</div>'
      +'</div>';
  });
  grid.innerHTML=html;
}

function esc(s){
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

/* ── Init ── */
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initHero);
}else{
  initHero();
}

})();
