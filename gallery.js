/* ═══════════════════════════════════════════════
   Gallery Module - Load Active Gallery from Firestore + Lightbox
   ═══════════════════════════════════════════════ */
(function(){
'use strict';

try{firebase.initializeApp(firebaseConfig)}catch(e){}
var db=firebase.firestore();

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

/* ── Lightbox ── */
var lb={};
var images=[];

function buildLightbox(){
  var o=document.createElement('div');
  o.className='lb-overlay';
  o.innerHTML='<div class="lb-backdrop"></div>'
    +'<div class="lb-modal">'
    +'<button class="lb-close" aria-label="إغلاق">&times;</button>'
    +'<button class="lb-nav lb-prev" aria-label="السابق"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<button class="lb-nav lb-next" aria-label="التالي"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'<div class="lb-img-wrap"><img class="lb-img" src="" alt=""></div>'
    +'<div class="lb-toolbar">'
    +'<button class="lb-zoom-btn lb-zoom-in" aria-label="تكبير"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>'
    +'<button class="lb-zoom-btn lb-zoom-out" aria-label="تصغير"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>'
    +'<span class="lb-counter">1 / 1</span>'
    +'</div>'
    +'</div>';
  document.body.appendChild(o);
  lb.overlay=o;
  lb.modal=o.querySelector('.lb-modal');
  lb.imgWrap=o.querySelector('.lb-img-wrap');
  lb.img=o.querySelector('.lb-img');
  lb.counter=o.querySelector('.lb-counter');
  lb.closeBtn=o.querySelector('.lb-close');
  lb.prevBtn=o.querySelector('.lb-prev');
  lb.nextBtn=o.querySelector('.lb-next');
  lb.zoomInBtn=o.querySelector('.lb-zoom-in');
  lb.zoomOutBtn=o.querySelector('.lb-zoom-out');
  lb.backdrop=o.querySelector('.lb-backdrop');
  lb.idx=0;
  lb.zoom=1;
  lb.dragging=false;
  lb.startX=0;
  lb.startY=0;
  lb.scrollTop=0;
  lb.touchStartX=0;
  lb.touchStartY=0;
  lb.touchDiffX=0;
  lb.touchDiffY=0;

  /* close */
  lb.closeBtn.addEventListener('click',close);
  lb.backdrop.addEventListener('click',close);
  lb.overlay.addEventListener('keydown',function(e){
    if(e.key==='Escape')close();
  });

  /* nav */
  lb.prevBtn.addEventListener('click',function(){navigate(-1)});
  lb.nextBtn.addEventListener('click',function(){navigate(1)});

  /* zoom */
  lb.zoomInBtn.addEventListener('click',zoomIn);
  lb.zoomOutBtn.addEventListener('click',zoomOut);
  lb.imgWrap.addEventListener('wheel',function(e){
    e.preventDefault();
    if(e.deltaY<0)zoomIn();else zoomOut();
  },{passive:false});

  /* protect */
  lb.overlay.addEventListener('contextmenu',function(e){e.preventDefault()});
  lb.overlay.addEventListener('dragstart',function(e){e.preventDefault()});
  lb.overlay.addEventListener('selectstart',function(e){e.preventDefault()});

  /* touch swipe + pinch */
  var pinchDist=0;
  lb.overlay.addEventListener('touchstart',function(e){
    if(e.touches.length===1){
      lb.touchStartX=e.touches[0].clientX;
      lb.touchStartY=e.touches[0].clientY;
      lb.touchDiffX=0;
    }else if(e.touches.length===2){
      pinchDist=Math.hypot(
        e.touches[0].clientX-e.touches[1].clientX,
        e.touches[0].clientY-e.touches[1].clientY
      );
    }
  },{passive:true});

  lb.overlay.addEventListener('touchmove',function(e){
    if(e.touches.length===1 && lb.overlay.classList.contains('lb-open')){
      lb.touchDiffX=e.touches[0].clientX-lb.touchStartX;
      lb.touchDiffY=e.touches[0].clientY-lb.touchStartY;
    }else if(e.touches.length===2){
      var d=Math.hypot(
        e.touches[0].clientX-e.touches[1].clientX,
        e.touches[0].clientY-e.touches[1].clientY
      );
      if(pinchDist>0){
        if(d>pinchDist*1.1)zoomIn();
        else if(d<pinchDist*0.9)zoomOut();
      }
      pinchDist=d;
    }
  },{passive:true});

  lb.overlay.addEventListener('touchend',function(e){
    if(e.changedTouches.length===1){
      var dx=lb.touchDiffX;
      var dy=lb.touchDiffY;
      if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)*2){
        navigate(dx>0?-1:1);
      }
    }
    lb.touchDiffX=0;
    lb.touchDiffY=0;
    pinchDist=0;
  },{passive:true});

  /* keyboard */
  document.addEventListener('keydown',function(e){
    if(!lb.overlay.classList.contains('lb-open'))return;
    if(e.key==='Escape'){e.preventDefault();close()}
    else if(e.key==='ArrowLeft'){e.preventDefault();navigate(-1)}
    else if(e.key==='ArrowRight'){e.preventDefault();navigate(1)}
  });

  /* prevent body scroll when open */
  var observer=new MutationObserver(function(){
    if(lb.overlay.classList.contains('lb-open')){
      lb.scrollTop=document.documentElement.scrollTop||document.body.scrollTop;
    }
  });
  observer.observe(lb.overlay,{attributes:true,attributeFilter:['class']});
}

function open(idx){
  if(!images.length)return;
  if(idx<0)idx=images.length-1;
  else if(idx>=images.length)idx=0;
  lb.idx=idx;
  lb.zoom=1;
  lb.img.src=images[idx].url;
  lb.img.alt=images[idx].title||'';
  lb.counter.textContent=(idx+1)+' / '+images.length;
  lb.imgWrap.style.transform='scale(1)';
  lb.overlay.classList.add('lb-open');
  document.body.style.overflow='hidden';
  document.documentElement.style.overflow='hidden';
  /* force layout then add anim class */
  void lb.overlay.offsetWidth;
  lb.overlay.classList.add('lb-anim');
}

function close(){
  lb.overlay.classList.remove('lb-anim');
  lb.overlay.classList.remove('lb-open');
  document.body.style.overflow='';
  document.documentElement.style.overflow='';
  lb.img.src='';
}

function navigate(dir){
  open(lb.idx+dir);
}

function zoomIn(){
  if(lb.zoom<5){lb.zoom=Math.min(lb.zoom+0.5,5);applyZoom()}
}

function zoomOut(){
  if(lb.zoom>0.5){lb.zoom=Math.max(lb.zoom-0.5,0.5);applyZoom()}
}

function applyZoom(){
  lb.imgWrap.style.transform='scale('+lb.zoom+')';
}

function resetZoom(){
  lb.zoom=1;
  lb.imgWrap.style.transform='scale(1)';
}

/* ── Load Gallery ── */
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
      images=[];
      snap.docs.forEach(function(doc){
        var d=doc.data();
        images.push({url:d.imageUrl,title:d.title||'',desc:d.description||''});
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
        /* open lightbox on click */
        card.addEventListener('click',function(idx){
          return function(){open(idx)};
        }(images.length-1));
        grid.appendChild(card);
      });
      /* build lightbox once */
      if(!lb.overlay)buildLightbox();
      if(typeof window.reinitAnimations==='function')window.reinitAnimations();
    })
    .catch(function(){});
}

loadGallery();
window.loadGallery=loadGallery;

})();
