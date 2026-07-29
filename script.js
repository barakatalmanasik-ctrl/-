/**
 * بركات المناسك - Premium Script
 * Vanilla JS | No Dependencies
 * Auto-carousel 7s · Touch · Read-More Modal
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

window.reinitAnimations=function(){
  animEls=document.querySelectorAll('[data-anim]');
  animateOnScroll();
};

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

/* ═══════════════════════════════════════
   Testimonials Carousel - One card at a time
   Auto-rotate 7s · Touch · Dots · Nav
   ═══════════════════════════════════════ */
var track=document.getElementById('testiTrack');
var prevBtn=document.getElementById('testiPrev');
var nextBtn=document.getElementById('testiNext');
var dotsWrap=document.getElementById('testiDots');
var curSlide=0,autoInt=null;
var AUTO_INTERVAL=7000;

function initTesti(){
  if(!track)return;
  buildDots();
  updateSlide();
  startAuto();
}

function buildDots(){
  if(!dotsWrap)return;
  dotsWrap.innerHTML='';
  var total=track.children.length;
  if(total<=1)return;
  for(var i=0;i<total;i++){
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
  var cw=cards[0].offsetWidth;
  var gap=20;
  var total=cards.length;
  curSlide=Math.min(curSlide,Math.max(0,total-1));
  track.style.transform='translateX('+(curSlide*(cw+gap))+'px)';
  var dots=dotsWrap?dotsWrap.children:[];
  for(var i=0;i<dots.length;i++)dots[i].classList.toggle('on',i===curSlide);
}

function goTo(i){curSlide=i;updateSlide()}
function next(){
  var total=track.children.length;
  curSlide=curSlide>=total-1?0:curSlide+1;
  updateSlide();
}
function prev(){
  var total=track.children.length;
  curSlide=curSlide<=0?total-1:curSlide-1;
  updateSlide();
}
function startAuto(){stopAuto();autoInt=setInterval(next,AUTO_INTERVAL)}
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

window.addEventListener('resize',function(){buildDots();updateSlide()});
window.addEventListener('load',function(){setTimeout(initTesti,200)});
window.reinitTesti=function(){buildDots();curSlide=0;updateSlide();startAuto()};

/* === Scroll To Top === */
var topBtn=document.getElementById('scrollTopBtn');
function showTopBtn(){if(topBtn)topBtn.style.display=window.scrollY>500?'flex':'none'}
window.addEventListener('scroll',showTopBtn,{passive:true});
if(topBtn)topBtn.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});

/* === Booking Form Modal === */
var bmOverlay=document.getElementById('bookingModal');
var bmClose=document.getElementById('bmClose');
var bmForm=document.getElementById('bookingForm');
function openBookingModal(){if(bmOverlay)bmOverlay.classList.add('show');document.body.classList.add('no-scroll')}
function closeBookingModal(){if(bmOverlay)bmOverlay.classList.remove('show');document.body.classList.remove('no-scroll')}
document.getElementById('openBookingBtn')&&document.getElementById('openBookingBtn').addEventListener('click',openBookingModal);
document.getElementById('openBookingBtnSide')&&document.getElementById('openBookingBtnSide').addEventListener('click',openBookingModal);
if(bmClose)bmClose.addEventListener('click',closeBookingModal);
if(bmOverlay)bmOverlay.addEventListener('click',function(e){if(e.target===bmOverlay)closeBookingModal()});
if(bmForm)bmForm.addEventListener('submit',function(e){
  e.preventDefault();
  var d={departure:document.getElementById('bmDeparture').value.trim(),destination:document.getElementById('bmDestination').value.trim(),date:document.getElementById('bmDate').value,passengers:document.getElementById('bmPassengers').value,tripType:document.getElementById('bmTripType').value,fullName:document.getElementById('bmName').value.trim(),phone:document.getElementById('bmPhone').value.trim()};
  var msg=BOOKING_TEMPLATE.replace('{departure}',d.departure).replace('{destination}',d.destination).replace('{date}',d.date).replace('{passengers}',d.passengers).replace('{tripType}',d.tripType).replace('{fullName}',d.fullName).replace('{phone}',d.phone);
  window.open('https://wa.me/'+COMPANY_WHATSAPP+'?text='+encodeURIComponent(msg),'_blank');
  closeBookingModal();
});

/* === Social Contact Pill Toggle === */
var scPill=document.getElementById('scPill');
var scToggle=document.getElementById('scPillToggle');
if(scToggle){
  scToggle.addEventListener('click',function(e){e.stopPropagation();scPill.classList.toggle('on')});
  document.addEventListener('click',function(e){if(!scPill.contains(e.target))scPill.classList.remove('on')});
}

/* === Button Ripple Coordinates === */
document.querySelectorAll('.btn').forEach(function(b){
  b.addEventListener('mousemove',function(e){
    var r=this.getBoundingClientRect();
    this.style.setProperty('--x',((e.clientX-r.left)/r.width*100)+'%');
    this.style.setProperty('--y',((e.clientY-r.top)/r.height*100)+'%');
  });
});

/* === Keyboard Navigation === */
document.addEventListener('keydown',function(e){
  if(e.key==='Tab')document.body.classList.add('kb-nav');
});
document.addEventListener('mousedown',function(){document.body.classList.remove('kb-nav')});

})();
