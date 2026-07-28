(function(){
'use strict';

var DEFAULT_STATS=[
  {number:22,suffix:'+',label:'سنة خبرة'},
  {number:10000,suffix:'+',label:'مسافر معنا'},
  {number:95,suffix:'%',label:'نسبة رضا العملاء'},
  {number:200,suffix:'+',label:'برنامج تم تنفيذه'}
];

function renderStats(stats){
  var grid=document.getElementById('statsGrid');
  if(!grid)return;
  var arr=stats&&stats.length?stats:DEFAULT_STATS;
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

document.addEventListener('DOMContentLoaded',function(){
  document.addEventListener('contextmenu',function(e){
    var t=e.target;
    if(t.closest('.hero')||t.closest('.prg-main-img')||t.closest('.prg-day-img')||t.closest('.gal-preview')){
      e.preventDefault();
    }
  });
});

function init(){
  renderStats(DEFAULT_STATS);
  observeStats();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
}else{
  init();
}

})();
