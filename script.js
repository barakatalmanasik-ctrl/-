/**
 * بركات المناسك - Premium Script
 * Vanilla JS | No Dependencies
 */
(function(){
'use strict';

/* === Preloader === */
var preloader=document.getElementById('preloader');
function hidePreloader(){
  if(preloader){preloader.classList.add('done');document.body.classList.remove('no-scroll')}
}
window.addEventListener('load',function(){setTimeout(hidePreloader,1200)});
setTimeout(hidePreloader,4000);

/* === Navbar === */
var navbar=document.getElementById('navbar');
var navToggle=document.getElementById('navToggle');
var navLinks=document.getElementById('navMenu');
var navOverlay=document.getElementById('navOverlay');
var allLinks=document.querySelectorAll('.nav-link');

function onScroll(){
  if(!navbar)return;
  navbar.classList.toggle('scrolled',window.scrollY>50);
}
window.addEventListener('scroll',onScroll,{passive:true});
onScroll();

function toggleNav(){
  var open=navLinks.classList.contains('on');
  navLinks.classList.toggle('on');
  navToggle.classList.toggle('on');
  navOverlay.classList.toggle('on');
  navToggle.setAttribute('aria-expanded',!open);
  document.body.classList.toggle('no-scroll',!open);
}
if(navToggle)navToggle.addEventListener('click',toggleNav);
if(navOverlay)navOverlay.addEventListener('click',toggleNav);

allLinks.forEach(function(l){l.addEventListener('click',function(){
  if(navLinks.classList.contains('on'))toggleNav();
})});

/* Active link */
var sections=document.querySelectorAll('section[id]');
function updateActive(){
  var y=window.scrollY+200;
  sections.forEach(function(s){
    var top=s.offsetTop,h=s.offsetHeight,id=s.getAttribute('id');
    if(y>=top&&y<top+h){
      allLinks.forEach(function(l){
        l.classList.remove('active');
        if(l.getAttribute('href')==='#'+id)l.classList.add('active');
      });
    }
  });
}
window.addEventListener('scroll',updateActive,{passive:true});

/* === Smooth Scroll === */
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click',function(e){
    var t=this.getAttribute('href');
    if(t==='#')return;
    var el=document.querySelector(t);
    if(el){
      e.preventDefault();
      var offset=navbar?navbar.offsetHeight:0;
      window.scrollTo({top:el.offsetTop-offset-10,behavior:'smooth'});
    }
  });
});

/* === Scroll Animations === */
var animEls=document.querySelectorAll('[data-anim]');
function animateOnScroll(){
  var wh=window.innerHeight;
  animEls.forEach(function(el){
    var r=el.getBoundingClientRect();
    var d=el.getAttribute('data-delay')||0;
    if(r.top<wh*.88){
      setTimeout(function(){el.classList.add('on')},parseInt(d));
    }
  });
}
window.addEventListener('scroll',animateOnScroll,{passive:true});
window.addEventListener('load',function(){setTimeout(animateOnScroll,200)});

/* === Counters === */
var counters=document.querySelectorAll('[data-count]');
var counted=false;
function animateCounters(){
  if(counted)return;
  var first=counters[0];
  if(!first)return;
  var r=first.getBoundingClientRect();
  if(r.top>window.innerHeight*.85)return;
  counted=true;
  counters.forEach(function(c){
    var target=parseInt(c.getAttribute('data-count'));
    var dur=2000,start=null;
    function tick(ts){
      if(!start)start=ts;
      var p=Math.min((ts-start)/dur,1);
      var ease=1-Math.pow(1-p,3);
      c.textContent=Math.floor(ease*target).toLocaleString('ar-IQ');
      if(p<1)requestAnimationFrame(tick);
      else c.textContent=target.toLocaleString('ar-IQ');
    }
    requestAnimationFrame(tick);
  });
}
window.addEventListener('scroll',animateCounters,{passive:true});
window.addEventListener('load',function(){setTimeout(animateCounters,400)});

/* === Testimonials Slider === */
var track=document.getElementById('testiTrack');
var prevBtn=document.getElementById('testiPrev');
var nextBtn=document.getElementById('testiNext');
var dotsWrap=document.getElementById('testiDots');
var curSlide=0,perView=3,autoInt=null;

function initTesti(){
  if(!track)return;
  updatePerView();
  buildDots();
  updateSlide();
  startAuto();
}

function updatePerView(){
  var w=window.innerWidth;
  perView=w>=1024?3:w>=768?2:1;
}

function buildDots(){
  if(!dotsWrap)return;
  dotsWrap.innerHTML='';
  var n=Math.max(1,track.children.length-perView+1);
  for(var i=0;i<n;i++){
    var d=document.createElement('div');
    d.className='testi-dot'+(i===0?' on':'');
    d.setAttribute('role','button');
    d.setAttribute('tabindex','0');
    d.setAttribute('aria-label','الشريحة '+(i+1));
    (function(idx){d.addEventListener('click',function(){goTo(idx);resetAuto()})})(i);
    dotsWrap.appendChild(d);
  }
}

function updateSlide(){
  if(!track)return;
  var cards=track.children;
  if(!cards.length)return;
  var cw=cards[0].offsetWidth+20;
  var max=Math.max(0,cards.length-perView);
  curSlide=Math.min(curSlide,max);
  track.style.transform='translateX('+(curSlide*cw)+'px)';
  var dots=dotsWrap?dotsWrap.children:[];
  for(var i=0;i<dots.length;i++)dots[i].classList.toggle('on',i===curSlide);
}

function goTo(i){curSlide=i;updateSlide()}
function next(){var mx=Math.max(0,track.children.length-perView);curSlide=curSlide>=mx?0:curSlide+1;updateSlide()}
function prev(){var mx=Math.max(0,track.children.length-perView);curSlide=curSlide<=0?mx:curSlide-1;updateSlide()}
function startAuto(){stopAuto();autoInt=setInterval(next,5000)}
function stopAuto(){if(autoInt){clearInterval(autoInt);autoInt=null}}
function resetAuto(){stopAuto();startAuto()}

if(prevBtn)prevBtn.addEventListener('click',function(){prev();resetAuto()});
if(nextBtn)nextBtn.addEventListener('click',function(){next();resetAuto()});

/* Touch */
var txS=0,txE=0;
if(track){
  track.addEventListener('touchstart',function(e){txS=e.changedTouches[0].screenX;stopAuto()},{passive:true});
  track.addEventListener('touchend',function(e){
    txE=e.changedTouches[0].screenX;
    var d=txS-txE;
    if(Math.abs(d)>50){d>0?next():prev()}
    startAuto();
  },{passive:true});
}

window.addEventListener('resize',function(){updatePerView();buildDots();updateSlide()});
window.addEventListener('load',function(){setTimeout(initTesti,200)});
window.reinitTesti=function(){updatePerView();buildDots();curSlide=0;updateSlide();startAuto()};

/* === Scroll To Top === */
var topBtn=document.getElementById('scrollTopBtn');
function showTopBtn(){if(topBtn)topBtn.style.display=window.scrollY>500?'flex':'none'}
window.addEventListener('scroll',showTopBtn,{passive:true});
if(topBtn)topBtn.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});

/* === Button Ripple Coordinates === */
document.querySelectorAll('.btn').forEach(function(b){
  b.addEventListener('mousemove',function(e){
    var r=this.getBoundingClientRect();
    this.style.setProperty('--x',((e.clientX-r.left)/r.width*100)+'%');
    this.style.setProperty('--y',((e.clientY-r.top)/r.height*100)+'%');
  });
});

/* === Subtle Parallax on Hero Lines === */
var hero=document.querySelector('.hero');
function parallax(){
  if(!hero)return;
  var s=window.scrollY;
  var h=hero.offsetHeight;
  if(s<h){
    var shapes=hero.querySelectorAll('.hero-line');
    shapes.forEach(function(sh,i){
      sh.style.transform='translateY('+(s*(.05+i*.02))+'px)';
    });
  }
}
window.addEventListener('scroll',parallax,{passive:true});

/* === Keyboard Navigation === */
document.addEventListener('keydown',function(e){
  if(e.key==='Tab')document.body.classList.add('kb-nav');
});
document.addEventListener('mousedown',function(){document.body.classList.remove('kb-nav')});

})();