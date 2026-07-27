/* ═══════════════════════════════════════════════
   Comments Module - Submit & Load Approved
   Full validation · Spam prevention · Star rating
   ═══════════════════════════════════════════════ */
(function(){
'use strict';

try{firebase.initializeApp(firebaseConfig)}catch(e){}
var db=firebase.firestore();

/* ── Config ── */
var MIN_NAME=3;
var MAX_NAME=100;
var MIN_TEXT=10;
var MAX_TEXT=500;
var SPAM_INTERVAL=60000;
var LINK_REGEX=/https?:\/\/|www\.|\.com|\.net|\.org|\.ir|\.io|\.co|bit\.ly|tinyurl|t\.me/i;
var HTML_REGEX=/<[^>]*>/;

/* ── State ── */
var selectedStars=0;

/* ═══════════════════════════════════════════════
   STAR RATING
   ═══════════════════════════════════════════════ */
var starRating=document.getElementById('starRating');
var starValue=document.getElementById('starValue');
var starBtns=starRating?starRating.querySelectorAll('.star-btn'):[];

function setStars(n){
  selectedStars=n;
  if(starValue)starValue.value=n;
  starBtns.forEach(function(b){
    var v=parseInt(b.getAttribute('data-value'));
    b.classList.toggle('active',v<=n);
  });
}

starBtns.forEach(function(btn){
  btn.addEventListener('click',function(){
    setStars(parseInt(this.getAttribute('data-value')));
  });
  btn.addEventListener('mouseenter',function(){
    var v=parseInt(this.getAttribute('data-value'));
    starBtns.forEach(function(b){
      b.classList.toggle('active',parseInt(b.getAttribute('data-value'))<=v);
    });
  });
  btn.addEventListener('mouseleave',function(){
    starBtns.forEach(function(b){
      b.classList.toggle('active',parseInt(b.getAttribute('data-value'))<=selectedStars);
    });
  });
});

/* ═══════════════════════════════════════════════
   VALIDATION
   ═══════════════════════════════════════════════ */
function sanitize(s){
  var d=document.createElement('div');
  d.textContent=s;
  return d.innerHTML;
}

function hasLinks(s){return LINK_REGEX.test(s)}
function hasHTML(s){return HTML_REGEX.test(s)}

function validate(name,service,text,stars){
  name=name.trim();
  text=text.trim();

  if(name.length<MIN_NAME)return 'الاسم يجب أن يكون '+MIN_NAME+' أحرف على الأقل';
  if(name.length>MAX_NAME)return 'الاسم طويل جداً';
  if(hasHTML(name))return 'الاسم يحتوي على رموز غير مسموحة';
  if(hasLinks(name))return 'الاسم لا يمكن أن يحتوي على روابط';

  if(service){
    if(hasHTML(service))return 'الخدمة تحتوي على رموز غير مسموحة';
    if(hasLinks(service))return 'الخدمة لا يمكن أن تحتوي على روابط';
  }

  if(text.length<MIN_TEXT)return 'التعليق يجب أن يكون '+MIN_TEXT+' أحرف على الأقل';
  if(text.length>MAX_TEXT)return 'التعليق طويل جداً (الحد الأقصى '+MAX_TEXT+' حرف)';
  if(hasHTML(text))return 'التعليق يحتوي على رموز غير مسموحة';
  if(hasLinks(text))return 'التعليق لا يمكن أن يحتوي على روابط';

  if(stars<1||stars>5)return 'يرجى اختيار عدد النجوم';

  return null;
}

/* ═══════════════════════════════════════════════
   SPAM PREVENTION
   ═══════════════════════════════════════════════ */
function canSubmit(){
  try{
    var last=parseInt(localStorage.getItem('bk_last_comment')||'0');
    return(Date.now()-last)>=SPAM_INTERVAL;
  }catch(e){return true}
}

function markSubmitted(){
  try{localStorage.setItem('bk_last_comment',String(Date.now()))}catch(e){}
}

function getWaitSeconds(){
  try{
    var last=parseInt(localStorage.getItem('bk_last_comment')||'0');
    var diff=SPAM_INTERVAL-(Date.now()-last);
    return diff>0?Math.ceil(diff/1000):0;
  }catch(e){return 0}
}

/* ═══════════════════════════════════════════════
   SUBMIT COMMENT
   ═══════════════════════════════════════════════ */
var form=document.getElementById('commentForm');
var msg=document.getElementById('cMsg');
var submitBtn=document.getElementById('cSubmit');

function showMsg(text,type){
  if(!msg)return;
  msg.textContent=text;
  msg.style.display='block';
  msg.style.color=type==='error'?'#EF4444':type==='warn'?'#D97706':'var(--emerald)';
  if(type!=='error')setTimeout(function(){msg.style.display='none'},5000);
}

function setLoading(on){
  if(submitBtn){
    submitBtn.disabled=on;
    submitBtn.textContent=on?'جاري الإرسال...':'إرسال التقييم';
  }
}

if(form)form.addEventListener('submit',function(e){
  e.preventDefault();

  var name=(document.getElementById('cName')||{}).value||'';
  var service=(document.getElementById('cService')||{}).value||'';
  var text=(document.getElementById('cText')||{}).value||'';
  var stars=selectedStars;

  var err=validate(name,service,text,stars);
  if(err){showMsg(err,'error');return}

  if(!canSubmit()){
    var wait=getWaitSeconds();
    showMsg('يرجى الانتظار '+wait+' ثانية قبل إرسال تعليق آخر','warn');
    return;
  }

  setLoading(true);

  db.collection('comments').add({
    name:name.trim(),
    service:service.trim(),
    text:text.trim(),
    stars:stars,
    status:'pending',
    approved:false,
    createdAt:firebase.firestore.FieldValue.serverTimestamp(),
    approvedAt:null
  }).then(function(){
    showMsg('تم إرسال تقييمك بنجاح! سيظهر بعد مراجعة الإدارة.','success');
    form.reset();
    setStars(0);
    markSubmitted();
    setLoading(false);
  }).catch(function(err){
    console.error('Comment submit error:',err);
    showMsg('حدث خطأ أثناء الإرسال. حاول مرة أخرى.','error');
    setLoading(false);
  });
});

/* ═══════════════════════════════════════════════
   LOAD APPROVED COMMENTS INTO SLIDER
   ═══════════════════════════════════════════════ */
var track=document.getElementById('testiTrack');
var STAR_SVG='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
var STAR_EMPTY='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

function buildStars(rating){
  var html='<div class="testi-stars">';
  for(var i=1;i<=5;i++){
    html+=(i<=rating)?STAR_SVG:STAR_EMPTY;
  }
  return html+'</div>';
}

function formatDate(ts){
  if(!ts)return '';
  try{
    var d=new Date(ts.toDate());
    return d.toLocaleDateString('ar-IQ',{year:'numeric',month:'2-digit',day:'2-digit'});
  }catch(e){return ''}
}

if(track){
  db.collection('comments')
    .where('status','==','approved')
    .orderBy('createdAt','desc')
    .limit(20)
    .get()
    .then(function(snap){
      if(!snap.docs.length)return;
      snap.docs.forEach(function(doc){
        var d=doc.data();
        var initial=d.name?d.name.charAt(0):'ع';
        var label=d.service?'عميل - '+d.service:'عميل';
        var starsCount=d.stars||5;
        var dateStr=formatDate(d.createdAt);
        var card=document.createElement('div');
        card.className='testi-card';
        card.innerHTML=buildStars(starsCount)
          +'<p class="testi-txt">"'+sanitize(d.text)+'"</p>'
          +'<div class="testi-author">'
            +'<div class="testi-av">'+sanitize(initial)+'</div>'
            +'<div class="testi-info"><h4>'+sanitize(d.name)+'</h4><span>'+sanitize(label)+(dateStr?' — '+dateStr:'')+'</span></div>'
          +'</div>';
        track.appendChild(card);
      });
      if(typeof window.reinitTesti==='function')window.reinitTesti();
    })
    .catch(function(err){
      console.error('Load comments error:',err);
    });
}

})();
