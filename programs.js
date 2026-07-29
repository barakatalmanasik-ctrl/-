/* ═══════════════════════════════════════════════
   Programs Module - Firestore + Detail Modal
   ═══════════════════════════════════════════════ */
(function(){
'use strict';

try{firebase.initializeApp(firebaseConfig)}catch(e){}
var db=firebase.firestore();

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

var pstLabels={
  available:'متاح للحجز',almost_full:'المقاعد أوشكت على النفاد',
  full:'اكتمل العدد',coming_soon:'قريباً',ended:'انتهى البرنامج'
};
var pstClasses={
  available:'prg-badge-avail',almost_full:'prg-badge-almost',
  full:'prg-badge-full',coming_soon:'prg-badge-soon',ended:'prg-badge-ended'
};
var transLabels={flight:'طيران',bus:'باصات VIP',mixed:'النقل المختلط'};

/* ── Modal Logic ── */
function openProgramModal(docId){
  var overlay=document.getElementById('programModal');
  if(!overlay)return;
  showLoading(overlay);

  db.collection('programs').doc(docId).get().then(function(snap){
    if(!snap.exists){closeProgramModal();return}
    var d=snap.data();

    db.collection('programs').doc(docId).collection('timeline').orderBy('order','asc').get().then(function(tlSnap){
      var timeline=[];
      tlSnap.docs.forEach(function(tl){timeline.push(tl.data())});
      var overlay=document.getElementById('programModal');
      if(!overlay)return;

      document.getElementById('pmHeroImg').src=d.mainImage||'images/صورة الشركة.png';
      document.getElementById('pmHeroImg').alt=d.name||'';
      document.getElementById('pmName').textContent=d.name||'';
      var badge=document.getElementById('pmStatusBadge');
      var pst=d.programStatus||'available';
      badge.textContent=pstLabels[pst]||pst;
      badge.className='pm-badge '+pstClasses[pst]||'';

      document.getElementById('pmDuration').textContent=d.duration||'';
      document.getElementById('pmDeparture').textContent=d.departureDate||'';

      var transportEl=document.getElementById('pmTransport');
      var transportRow=document.getElementById('pmTransportRow');
      if(d.transport){
        transportEl.textContent=transLabels[d.transport]||d.transport;
        transportRow.style.display='';
      }else{transportRow.style.display='none'}

      var hotelsEl=document.getElementById('pmHotels');
      var hotelsRow=document.getElementById('pmHotelsRow');
      var hotelParts=[];
      if(d.hotelMakkah)hotelParts.push('مكة: '+d.hotelMakkah);
      if(d.hotelMadinah)hotelParts.push('المدينة: '+d.hotelMadinah);
      if(hotelParts.length){
        hotelsEl.innerHTML=hotelParts.join('<br>');
        hotelsRow.style.display='';
      }else{hotelsRow.style.display='none'}

      var mealsEl=document.getElementById('pmMeals');
      var mealsRow=document.getElementById('pmMealsRow');
      if(d.meals){mealsEl.textContent=d.meals;mealsRow.style.display=''}
      else{mealsRow.style.display='none'}

      document.getElementById('pmDesc').innerHTML=(d.fullDesc||d.shortDesc||'').replace(/\n/g,'<br>');

      var servicesEl=document.getElementById('pmServices');
      var servicesSec=document.getElementById('pmServicesSection');
      if(d.servicesIncluded){
        servicesEl.innerHTML=d.servicesIncluded.replace(/\n/g,'<br>');
        servicesSec.style.display='';
      }else{servicesSec.style.display='none'}

      var timelineEl=document.getElementById('pmTimeline');
      var timelineSec=document.getElementById('pmTimelineSection');
      if(timeline.length){
        var tlHtml='';
        timeline.forEach(function(t,i){
          tlHtml+='<div class="pm-tl-item">'
            +'<div class="pm-tl-num">'+(i+1)+'</div>'
            +'<div class="pm-tl-content">'
            +(t.title?'<h4 class="pm-tl-title">'+esc(t.title)+'</h4>':'')
            +'<p class="pm-tl-desc">'+(t.description||'').replace(/\n/g,'<br>')+'</p>'
            +'</div></div>';
        });
        timelineEl.innerHTML=tlHtml;
        timelineSec.style.display='';
      }else{timelineSec.style.display='none'}

      var galleryEl=document.getElementById('pmGalleryGrid');
      var gallerySec=document.getElementById('pmGallerySection');
      if(d.gallery&&d.gallery.length){
        var gHtml='';
        d.gallery.forEach(function(url){
          gHtml+='<div class="pm-gallery-item"><img src="'+esc(url)+'" alt="" loading="lazy"></div>';
        });
        galleryEl.innerHTML=gHtml;
        gallerySec.style.display='';
      }else{gallerySec.style.display='none'}

      var notesEl=document.getElementById('pmNotes');
      var notesSec=document.getElementById('pmNotesSection');
      if(d.notes){
        notesEl.innerHTML=d.notes.replace(/\n/g,'<br>');
        notesSec.style.display='';
      }else{notesSec.style.display='none'}

      document.getElementById('pmPrice').textContent=d.price||'للاستفسار عن السعر';
      var waText='أرغب بالاستفسار عن '+esc(d.name||'');
      document.getElementById('pmWALink').href='https://wa.me/9647744641155?text='+encodeURIComponent(waText);

      overlay.classList.add('show');
      document.body.classList.add('no-scroll');
      document.documentElement.style.overflow='hidden';
    });
  }).catch(function(){closeProgramModal()});
}

function showLoading(overlay){
  document.getElementById('pmHeroImg').src='';
  document.getElementById('pmName').textContent='';
  document.getElementById('pmStatusBadge').textContent='';
  document.getElementById('pmDuration').textContent='';
  document.getElementById('pmDeparture').textContent='';
  document.getElementById('pmTransport').textContent='';
  document.getElementById('pmHotels').textContent='';
  document.getElementById('pmMeals').textContent='';
  document.getElementById('pmDesc').innerHTML='';
  document.getElementById('pmServices').innerHTML='';
  document.getElementById('pmTimeline').innerHTML='';
  document.getElementById('pmGalleryGrid').innerHTML='';
  document.getElementById('pmNotes').innerHTML='';
  document.getElementById('pmPrice').textContent='';
  document.getElementById('pmServicesSection').style.display='none';
  document.getElementById('pmTimelineSection').style.display='none';
  document.getElementById('pmGallerySection').style.display='none';
  document.getElementById('pmNotesSection').style.display='none';
  document.getElementById('pmTransportRow').style.display='none';
  document.getElementById('pmHotelsRow').style.display='none';
  document.getElementById('pmMealsRow').style.display='none';
  overlay.classList.add('show');
  document.body.classList.add('no-scroll');
  document.documentElement.style.overflow='hidden';
}

function closeProgramModal(){
  var overlay=document.getElementById('programModal');
  if(!overlay)return;
  overlay.classList.remove('show');
  document.body.classList.remove('no-scroll');
  document.documentElement.style.overflow='';
}

/* ── Load Program Cards ── */
function loadPrograms(){
  var grid=document.getElementById('programsGrid');
  if(!grid)return;
  grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--g400)">جاري التحميل...</div>';

  db.collection('programs').where('status','==','active').orderBy('order','asc').get().then(function(snap){
    if(!snap.docs.length){
      grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--g400)">لا توجد برامج متاحة حالياً</div>';
      return;
    }
    grid.innerHTML='';
    snap.docs.forEach(function(doc){
      var d=doc.data();
      var pst=d.programStatus||'available';
      var badgeLabel=pstLabels[pst]||'متاح للحجز';
      var imgUrl=d.mainImage||'images/صورة الشركة.png';

      var card=document.createElement('div');
      card.className='prg-card';
      card.setAttribute('data-anim','fade-up');
      card.style.cursor='pointer';
      card.innerHTML='<div class="prg-img-wrap">'
        +'<img src="'+esc(imgUrl)+'" alt="'+esc(d.name||'')+'" loading="lazy">'
        +'<span class="prg-badge '+esc(pstClasses[pst]||'prg-badge-avail')+'">'+esc(badgeLabel)+'</span>'
        +'</div>'
        +'<div class="prg-body">'
        +'<h3 class="prg-name">'+esc(d.name||'')+'</h3>'
        +'<div class="prg-meta">'
        +'<span class="prg-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'+esc(d.duration||'')+'</span>'
        +'<span class="prg-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'+esc(d.departureDate||'')+'</span>'
        +'</div>'
        +'<p class="prg-desc">'+esc(d.shortDesc||'')+'</p>'
        +'<div class="prg-footer">'
        +'<span class="prg-price" style="font-size:14px;color:var(--g500);font-weight:500">'+esc(d.price||'للاستفسار عن السعر')+'</span>'
        +'</div>'
        +'</div>';
      card.addEventListener('click',function(id){return function(){openProgramModal(id)}}(doc.id));
      grid.appendChild(card);
    });
    if(typeof window.reinitAnimations==='function')window.reinitAnimations();
  }).catch(function(){
    grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--g400)">تعذر التحميل</div>';
  });
}

document.addEventListener('DOMContentLoaded',function(){
  var overlay=document.getElementById('programModal');
  if(overlay){
    overlay.addEventListener('click',function(e){
      if(e.target===overlay||e.target.classList.contains('pm-close'))closeProgramModal();
    });
  }
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape')closeProgramModal();
  });
});

loadPrograms();
window.loadPrograms=loadPrograms;
window.openProgramModal=openProgramModal;
window.closeProgramModal=closeProgramModal;

})();
