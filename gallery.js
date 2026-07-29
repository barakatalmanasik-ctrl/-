/* ═══════════════════════════════════════════════
   Gallery Module - Albums + Lightbox
   ═══════════════════════════════════════════════ */
(function(){
'use strict';

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

/* ═══════════════════════════════════════════════════
   ALBUMS DATA — extend this array to add more albums
   ═══════════════════════════════════════════════════ */
var ALBUMS=[
  {
    id:'umrah-iran',
    name:'رحلات العمرة وإيران',
    desc:'صور من رحلات العمرة وإيران',
    cover:'images/albums/umrah-iran/img-01.jpeg',
    count:30,
    images:[]
  }
];

/* build images list for album */
(function(){
  for(var a=0;a<ALBUMS.length;a++){
    var alb=ALBUMS[a];
    if(alb.images&&alb.images.length===0&&alb.count){
      alb.images=[];
      for(var i=1;i<=alb.count;i++){
        var n=i<10?'0'+i:''+i;
        alb.images.push({
          url:'images/albums/'+alb.id+'/img-'+n+'.jpeg',
          title:alb.name
        });
      }
    }
  }
})();

/* ── Lightbox ── */
var lb={};
var lbImages=[];

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

  lb.closeBtn.addEventListener('click',lbClose);
  lb.backdrop.addEventListener('click',lbClose);

  lb.prevBtn.addEventListener('click',function(){lbNavigate(-1)});
  lb.nextBtn.addEventListener('click',function(){lbNavigate(1)});

  lb.zoomInBtn.addEventListener('click',lbZoomIn);
  lb.zoomOutBtn.addEventListener('click',lbZoomOut);
  lb.imgWrap.addEventListener('wheel',function(e){
    e.preventDefault();
    if(e.deltaY<0)lbZoomIn();else lbZoomOut();
  },{passive:false});

  lb.overlay.addEventListener('contextmenu',function(e){e.preventDefault()});
  lb.overlay.addEventListener('dragstart',function(e){e.preventDefault()});
  lb.overlay.addEventListener('selectstart',function(e){e.preventDefault()});

  var pinchDist=0;
  lb.overlay.addEventListener('touchstart',function(e){
    if(e.touches.length===1){
      lb.touchStartX=e.touches[0].clientX;
      lb.touchStartY=e.touches[0].clientY;
      lb.touchDiffX=0;
    }else if(e.touches.length===2){
      pinchDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    }
  },{passive:true});

  lb.overlay.addEventListener('touchmove',function(e){
    if(e.touches.length===1&&lb.overlay.classList.contains('lb-open')){
      lb.touchDiffX=e.touches[0].clientX-lb.touchStartX;
      lb.touchDiffY=e.touches[0].clientY-lb.touchStartY;
    }else if(e.touches.length===2){
      var d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      if(pinchDist>0){
        if(d>pinchDist*1.1)lbZoomIn();
        else if(d<pinchDist*0.9)lbZoomOut();
      }
      pinchDist=d;
    }
  },{passive:true});

  lb.overlay.addEventListener('touchend',function(e){
    if(e.changedTouches.length===1){
      var dx=lb.touchDiffX;
      var dy=lb.touchDiffY;
      if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*2){
        lbNavigate(dx>0?-1:1);
      }
    }
    lb.touchDiffX=0;
    lb.touchDiffY=0;
    pinchDist=0;
  },{passive:true});

  document.addEventListener('keydown',function(e){
    if(!lb.overlay.classList.contains('lb-open'))return;
    if(e.key==='Escape'){e.preventDefault();lbClose()}
    else if(e.key==='ArrowLeft'){e.preventDefault();lbNavigate(-1)}
    else if(e.key==='ArrowRight'){e.preventDefault();lbNavigate(1)}
  });

  var observer=new MutationObserver(function(){
    if(lb.overlay.classList.contains('lb-open')){
      lb.scrollTop=document.documentElement.scrollTop||document.body.scrollTop;
    }
  });
  observer.observe(lb.overlay,{attributes:true,attributeFilter:['class']});
}

function lbOpen(idx){
  if(!lbImages.length)return;
  if(idx<0)idx=lbImages.length-1;
  else if(idx>=lbImages.length)idx=0;
  lb.idx=idx;
  lb.zoom=1;
  lb.img.src=lbImages[idx].url;
  lb.img.alt=lbImages[idx].title||'';
  lb.counter.textContent=(idx+1)+' / '+lbImages.length;
  lb.imgWrap.style.transform='scale(1)';
  lb.overlay.classList.add('lb-open');
  document.body.style.overflow='hidden';
  document.documentElement.style.overflow='hidden';
  void lb.overlay.offsetWidth;
  lb.overlay.classList.add('lb-anim');
}

function lbClose(){
  lb.overlay.classList.remove('lb-anim');
  lb.overlay.classList.remove('lb-open');
  document.body.style.overflow='';
  document.documentElement.style.overflow='';
  lb.img.src='';
}

function lbNavigate(dir){
  lbOpen(lb.idx+dir);
}

function lbZoomIn(){
  if(lb.zoom<5){lb.zoom=Math.min(lb.zoom+0.5,5);lbApplyZoom()}
}

function lbZoomOut(){
  if(lb.zoom>0.5){lb.zoom=Math.max(lb.zoom-0.5,0.5);lbApplyZoom()}
}

function lbApplyZoom(){
  lb.imgWrap.style.transform='scale('+lb.zoom+')';
}

/* ── Gallery: Albums → Detail → Lightbox ── */

function showAlbums(){
  var grid=document.getElementById('galleryGrid');
  if(!grid)return;
  grid.innerHTML='';
  grid.className='albums-grid';

  for(var a=0;a<ALBUMS.length;a++){
    var d=ALBUMS[a];
    var card=document.createElement('div');
    card.className='album-card';
    card.setAttribute('data-anim','fade-up');
    card.innerHTML='<div class="album-img-wrap">'
      +'<img src="'+esc(d.cover)+'" alt="'+esc(d.name)+'" loading="lazy">'
      +'<div class="album-count"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'+d.count+' صورة</div>'
      +'</div>'
      +'<div class="album-body">'
      +'<h3 class="album-name">'+esc(d.name)+'</h3>'
      +(d.desc?'<p class="album-desc">'+esc(d.desc)+'</p>':'')
      +'</div>';
    card.addEventListener('click',function(aIdx){return function(){showAlbum(aIdx)}}(a));
    grid.appendChild(card);
  }
  if(typeof window.reinitAnimations==='function')window.reinitAnimations();
}

function showAlbum(idx){
  var alb=ALBUMS[idx];
  if(!alb||!alb.images)return;
  var grid=document.getElementById('galleryGrid');
  if(!grid)return;
  grid.className='album-detail-grid';
  lbImages=alb.images;

  var html='<div class="album-detail-header">'
    +'<button class="album-back-btn" onclick="window.albumBack()" aria-label="العودة للألبومات">'
    +'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>'
    +'العودة للألبومات'
    +'</button>'
    +'<h3 class="album-detail-title">'+esc(alb.name)+'</h3>'
    +'</div>';

  for(var i=0;i<alb.images.length;i++){
    var im=alb.images[i];
    html+='<div class="album-img-card">'
      +'<img src="'+esc(im.url)+'" alt="'+esc(alb.name)+'" loading="lazy">'
      +'</div>';
  }
  grid.innerHTML=html;

  var cards=grid.querySelectorAll('.album-img-card');
  for(var j=0;j<cards.length;j++){
    cards[j].addEventListener('click',(function(jIdx){return function(){lbOpen(jIdx)}})(j));
  }

  if(!lb.overlay)buildLightbox();
}

window.albumBack=function(){
  showAlbums();
};

function loadGallery(){
  if(!document.getElementById('galleryGrid'))return;
  showAlbums();
}

loadGallery();
window.loadGallery=loadGallery;
window.showAlbums=showAlbums;

})();
