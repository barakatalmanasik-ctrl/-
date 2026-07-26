/* ═══════════════════════════════════════
   Comments - Submit & Load Approved
   ═══════════════════════════════════════ */
(function(){
'use strict';

try{firebase.initializeApp(firebaseConfig)}catch(e){}
var db=firebase.firestore();

/* ── Submit Comment ── */
var form=document.getElementById('commentForm');
var msg=document.getElementById('cMsg');

if(form)form.addEventListener('submit',function(e){
  e.preventDefault();
  var name=document.getElementById('cName').value.trim();
  var service=document.getElementById('cService').value.trim();
  var text=document.getElementById('cText').value.trim();
  var btn=document.getElementById('cSubmit');

  if(!name||!text)return;

  btn.disabled=true;
  btn.textContent='جاري الإرسال...';

  db.collection('comments').add({
    name:name,
    service:service,
    text:text,
    approved:false,
    createdAt:firebase.firestore.FieldValue.serverTimestamp()
  }).then(function(){
    if(msg){msg.textContent='تم إرسال تقييمك بنجاح! سيظهر بعد المراجعة.';msg.style.color='var(--emerald)';msg.style.display='block'}
    form.reset();
    btn.disabled=false;
    btn.textContent='إرسال التقييم';
    setTimeout(function(){if(msg)msg.style.display='none'},5000);
  }).catch(function(){
    if(msg){msg.textContent='حدث خطأ. حاول مرة أخرى.';msg.style.color='var(--red)';msg.style.display='block'}
    btn.disabled=false;
    btn.textContent='إرسال التقييم';
  });
});

/* ── Load Approved Comments into Slider ── */
var track=document.getElementById('testiTrack');
if(track){
  db.collection('comments').where('approved','==',true).orderBy('createdAt','desc').limit(20).get()
    .then(function(snap){
      if(!snap.docs.length)return;
      var stars='<div class="testi-stars">'
        +'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
        +'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
        +'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
        +'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
        +'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
        +'</div>';

      snap.docs.forEach(function(doc){
        var d=doc.data();
        var initial=d.name?d.name.charAt(0):'ع';
        var label=d.service?'عميل - '+d.service:'عميل';
        var card=document.createElement('div');
        card.className='testi-card';
        card.innerHTML=stars
          +'<p class="testi-txt">"'+d.text.replace(/"/g,'')+'"</p>'
          +'<div class="testi-author">'
            +'<div class="testi-av">'+initial+'</div>'
            +'<div class="testi-info"><h4>'+d.name+'</h4><span>'+label+'</span></div>'
          +'</div>';
        track.appendChild(card);
      });

      /* Re-init slider if function exists */
      if(typeof window.reinitTesti==='function')window.reinitTesti();
    })
    .catch(function(){});
}

})();
