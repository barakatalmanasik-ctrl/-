/* ═══════════════════════════════════════════════
   Programs Module - Static Programs
   ═══════════════════════════════════════════════ */
(function(){
'use strict';

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

var PROGRAMS=[
  {
    name:'برنامج إيران جواً',
    duration:'9 ليالي / 11 يوم',
    departure:'كل سبت وخميس',
    shortDesc:'رحلة دينية سياحية إلى شمال إيران (رشت، فومن، قلعة رودخان، ماسولة، بندر انزلي) ومدينة مشهد المقدسة وقم. المسار: رشت - فومن - قلعة رودخان - ماسولة - بندر انزلي - مشهد - قم.',
    priceText:'للاستفسار عن السعر مراسلتنا',
    status:'available',
    img:'images/صورة الشركة.png'
  },
  {
    name:'برنامج إيران براً',
    duration:'11 يوم',
    departure:'كل سبت وخميس',
    shortDesc:'رحلة برية دينية سياحية إلى قم، مشهد ونيشابور بباصات VIP حديثة ومكيفة. تشمل 3 وجبات طعام في كل المناطق.',
    priceText:'للاستفسار عن السعر مراسلتنا',
    status:'available',
    img:'images/صورة الشركة.png'
  },
  {
    name:'برنامج العمرة',
    duration:'10 ليالي',
    departure:'كل أسبوع',
    shortDesc:'رحلة عمرة مع شركة بركات المناسك. 7 ليالي في مكة المكرمة (منطقة محبس الجن) و3 ليالي في المدينة المنورة (مركزية). تشمل تذكرة طيران وإقامة في فنادق 4 نجوم وجميع التنقلات.',
    priceText:'للاستفسار عن السعر مراسلتنا',
    status:'available',
    img:'images/صورة الشركة.png'
  }
];

function loadPrograms(){
  var grid=document.getElementById('programsGrid');
  if(!grid)return;
  grid.innerHTML='';

  PROGRAMS.forEach(function(d,i){
    var waText='أرغب بالاستفسار عن '+esc(d.name);
    var waLink='https://wa.me/9647744641155?text='+encodeURIComponent(waText);

    var card=document.createElement('div');
    card.className='prg-card';
    card.setAttribute('data-anim','fade-up');
    card.innerHTML='<div class="prg-img-wrap">'
      +'<img src="'+esc(d.img)+'" alt="'+esc(d.name)+'" loading="lazy">'
      +'<span class="prg-badge prg-badge-avail">متاح للحجز</span>'
      +'</div>'
      +'<div class="prg-body">'
      +'<h3 class="prg-name">'+esc(d.name)+'</h3>'
      +'<div class="prg-meta">'
      +'<span class="prg-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'+esc(d.duration)+'</span>'
      +'<span class="prg-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'+esc(d.departure)+'</span>'
      +'</div>'
      +'<p class="prg-desc">'+esc(d.shortDesc)+'</p>'
      +'<div class="prg-footer">'
      +'<span class="prg-price" style="font-size:14px;color:var(--g500);font-weight:500">'+esc(d.priceText)+'</span>'
      +'</div>'
      +'<a href="'+esc(waLink)+'" class="btn btn-accent btn-sm" style="width:100%;justify-content:center;margin-top:12px" target="_blank" rel="noopener">'
      +'استفسار عن البرنامج'
      +'</a>'
      +'</div>';
    grid.appendChild(card);
  });
  if(typeof window.reinitAnimations==='function')window.reinitAnimations();
}

loadPrograms();
window.loadPrograms=loadPrograms;

})();
