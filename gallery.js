/* ═══════════════════════════════════════════════
   Gallery Module - Load Active Gallery from Firestore
   ═══════════════════════════════════════════════ */
(function(){
'use strict';

try{firebase.initializeApp(firebaseConfig)}catch(e){}
var db=firebase.firestore();

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

function loadGallery(){
  var grid=document.getElementById('galleryGrid');
  if(!grid)return;

  db.collection('gallery')
    .where('status','==','active')
    .orderBy('order','asc')
    .limit(20)
    .get()
    .then(function(snap){
      if(!snap.docs.length){
        grid.parentElement.style.display='none';
        return;
      }
      grid.innerHTML='';
      snap.docs.forEach(function(doc){
        var d=doc.data();
        var card=document.createElement('div');
        card.className='gallery-card';
        card.setAttribute('data-anim','fade-up');
        var imgHtml='<img src="'+esc(d.imageUrl)+'" alt="'+esc(d.title||'صور الموقع')+'" loading="lazy">';
        var captionHtml='';
        if(d.title){
          captionHtml='<div class="gallery-caption"><h4>'+esc(d.title)+'</h4>';
          if(d.description)captionHtml+='<p>'+esc(d.description)+'</p>';
          captionHtml+='</div>';
        }
        card.innerHTML=imgHtml+captionHtml;
        grid.appendChild(card);
      });
      if(typeof window.reinitAnimations==='function')window.reinitAnimations();
    })
    .catch(function(){});
}

loadGallery();
window.loadGallery=loadGallery;

})();
