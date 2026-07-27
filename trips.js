/* ═══════════════════════════════════════════════
   Trips Module - Load Active Trips from Firestore
   ═══════════════════════════════════════════════ */
(function(){
'use strict';

try{firebase.initializeApp(firebaseConfig)}catch(e){}
var db=firebase.firestore();

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

function loadTrips(){
  var grid=document.getElementById('tripsGrid');
  if(!grid)return;

  db.collection('trips')
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
        var statusLabel=d.tripStatus==='full'?'مكتمل':d.tripStatus==='unavailable'?'غير متاح':'متاح';
        var statusClass=d.tripStatus==='full'?'trip-full':d.tripStatus==='unavailable'?'trip-unavail':'trip-avail';
        var waText='أرغب بالاستفسار عن رحلة '+esc(d.name);
        var waLink='https://wa.me/9647744641155?text='+encodeURIComponent(waText);

        var card=document.createElement('div');
        card.className='trip-card';
        card.setAttribute('data-anim','fade-up');
        card.innerHTML='<div class="trip-img-wrap">'
          +'<img src="'+esc(d.imageUrl)+'" alt="'+esc(d.name)+'" loading="lazy">'
          +'<span class="trip-status '+statusClass+'">'+statusLabel+'</span>'
          +'</div>'
          +'<div class="trip-body">'
          +'<h3 class="trip-name">'+esc(d.name)+'</h3>'
          +'<div class="trip-meta">'
          +(d.duration?'<span class="trip-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'+esc(d.duration)+'</span>':'')
          +(d.departureDate?'<span class="trip-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'+esc(d.departureDate)+'</span>':'')
          +(d.hotel?'<span class="trip-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18M5 21V7l7-4 7 4v14"/></svg>'+esc(d.hotel)+'</span>':'')
          +'</div>'
          +(d.program?'<p class="trip-program">'+esc(d.program)+'</p>':'')
          +'<div class="trip-footer">'
          +(d.price?'<span class="trip-price">'+esc(d.price)+'</span>':'')
          +(d.seatsLeft?'<span class="trip-seats">متبقي '+esc(String(d.seatsLeft))+' مقعد</span>':'')
          +'</div>'
          +'<a href="'+esc(waLink)+'" class="btn btn-accent btn-sm" style="width:100%;justify-content:center;margin-top:12px" target="_blank" rel="noopener">احجز الآن</a>'
          +'</div>';
        grid.appendChild(card);
      });
      if(typeof window.reinitAnimations==='function')window.reinitAnimations();
    })
    .catch(function(){});
}

loadTrips();
window.loadTrips=loadTrips;

})();
