/* ═══════════════════════════════════════════════
   Services Module - Load Active Services from Firestore
   ═══════════════════════════════════════════════ */
(function(){
'use strict';

try{firebase.initializeApp(firebaseConfig)}catch(e){}
var db=firebase.firestore();

var SVC_ICONS={
  'flight':'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
  'umrah':'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>',
  'visa':'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
  'hotel':'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2z"/><path d="M9 22V12h6v10"/></svg>',
  'transport':'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 00-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>',
  'default':'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>'
};

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

function loadServices(){
  var grid=document.getElementById('servicesGrid');
  if(!grid)return;

  db.collection('services')
    .where('status','==','active')
    .orderBy('order','asc')
    .limit(12)
    .get()
    .then(function(snap){
      if(!snap.docs.length)return;
      grid.innerHTML='';
      snap.docs.forEach(function(doc){
        var d=doc.data();
        var iconKey=d.icon||'default';
        var iconHtml=SVC_ICONS[iconKey]||SVC_ICONS['default'];
        var waText=d.bookingText||'أرغب بالاستفسار عن '+esc(d.title);
        var waLink=d.whatsappLink||('https://wa.me/9647744641155?text='+encodeURIComponent(waText));

        var card=document.createElement('div');
        card.className='svc-card';
        card.setAttribute('data-anim','fade-up');
        card.innerHTML='<div class="svc-ic-wrap">'+iconHtml+'</div>'
          +'<h3 class="svc-t">'+esc(d.title)+'</h3>'
          +'<p class="svc-d">'+esc(d.description)+'</p>'
          +'<a href="'+esc(waLink)+'" class="svc-link" target="_blank" rel="noopener">'
          +'تواصل معنا'
          +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>'
          +'</a>';
        grid.appendChild(card);
      });
      if(typeof window.reinitAnimations==='function')window.reinitAnimations();
    })
    .catch(function(){});
}

loadServices();
window.loadServices=loadServices;

})();
