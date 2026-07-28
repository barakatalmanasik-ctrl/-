/* ═══════════════════════════════════════════════
   Programs Module - Load Active Programs from Firestore
   ═══════════════════════════════════════════════ */
(function(){
'use strict';

try{firebase.initializeApp(firebaseConfig)}catch(e){}
var db=firebase.firestore();

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

function statusBadge(status){
  var labels={
    'available':'متاح للحجز',
    'almost_full':'المقاعد أوشكت على النفاد',
    'full':'اكتمل العدد',
    'coming_soon':'قريباً',
    'ended':'انتهى البرنامج'
  };
  var cls={
    'available':'prg-badge-avail',
    'almost_full':'prg-badge-almost',
    'full':'prg-badge-full',
    'coming_soon':'prg-badge-soon',
    'ended':'prg-badge-ended'
  };
  return '<span class="prg-badge '+((cls[status]||'')+'">'+(labels[status]||status)+'</span>');
}

function loadPrograms(){
  var grid=document.getElementById('programsGrid');
  if(!grid)return;

  db.collection('programs')
    .where('status','==','active')
    .orderBy('order','asc')
    .limit(12)
    .get()
    .then(function(snap){
      if(!snap.docs.length){
        grid.parentElement.style.display='none';
        return;
      }
      grid.innerHTML='';
      snap.docs.forEach(function(doc){
        var d=doc.data();
        var badgeHtml=statusBadge(d.programStatus);
        var waText='أرغب بالاستفسار عن '+esc(d.name);
        var waLink='https://wa.me/9647744641155?text='+encodeURIComponent(waText);

        var card=document.createElement('div');
        card.className='prg-card';
        card.setAttribute('data-anim','fade-up');
        card.innerHTML='<div class="prg-img-wrap">'
          +'<img src="'+esc(d.mainImage||'')+'" alt="'+esc(d.name)+'" loading="lazy">'
          +badgeHtml
          +'</div>'
          +'<div class="prg-body">'
          +'<h3 class="prg-name">'+esc(d.name)+'</h3>'
          +'<div class="prg-meta">'
          +(d.duration?'<span class="prg-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'+esc(d.duration)+'</span>':'')
          +(d.departureDate?'<span class="prg-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'+esc(d.departureDate)+'</span>':'')
          +'</div>'
          +(d.shortDesc?'<p class="prg-desc">'+esc(d.shortDesc)+'</p>':'')
          +'<div class="prg-footer">'
          +(d.price?'<span class="prg-price">'+esc(d.price)+'</span>':'')
          +(d.seatsLeft?'<span class="prg-seats">متبقي <strong>'+esc(String(d.seatsLeft))+'</strong> مقعد</span>':'')
          +'</div>'
          +'<a href="program.html?id='+encodeURIComponent(doc.id)+'" class="btn btn-accent btn-sm" style="width:100%;justify-content:center;margin-top:12px">معرفة التفاصيل</a>'
          +'</div>';
        grid.appendChild(card);
      });
      if(typeof window.reinitAnimations==='function')window.reinitAnimations();
    })
    .catch(function(){});
}

loadPrograms();
window.loadPrograms=loadPrograms;

})();
