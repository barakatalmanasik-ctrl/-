/* ═══════════════════════════════════════
   Dashboard - Comments, Images, Company Data
   ═══════════════════════════════════════ */
(function(){
'use strict';

firebase.initializeApp(firebaseConfig);
var auth    = firebase.auth();
var db      = firebase.firestore();
var storage = firebase.storage();

/* ── Auth Guard ── */
auth.onAuthStateChanged(function(user){
  if(!user||user.email!==ADMIN_EMAIL){
    window.location.href='login.html';
    return;
  }
  initDashboard();
});

/* ── Logout ── */
var logoutBtn=document.getElementById('logoutBtn');
if(logoutBtn)logoutBtn.addEventListener('click',function(){
  auth.signOut().then(function(){window.location.href='login.html'});
});

/* ── Toast ── */
function toast(msg,type){
  var t=document.getElementById('toast');
  if(!t)return;
  t.textContent=msg;
  t.className='toast '+(type||'')+' show';
  setTimeout(function(){t.classList.remove('show')},3000);
}

/* ═══════════════════════════════════════
   INIT DASHBOARD
   ═══════════════════════════════════════ */
function initDashboard(){
  loadComments();
  loadImages();
  loadData();
}

/* ═══════════════════════════════════════
   1. COMMENTS
   ═══════════════════════════════════════ */
var commentList=document.getElementById('commentList');
var commentCount=document.getElementById('commentCount');

function loadComments(){
  if(!commentList)return;
  db.collection('comments').where('approved','==',false).orderBy('createdAt','desc').get()
    .then(function(snap){
      var docs=snap.docs;
      if(commentCount)commentCount.textContent=docs.length;
      if(!docs.length){
        commentList.innerHTML='<div class="comment-empty">لا توجد تعليقات معلّقة</div>';
        return;
      }
      var html='';
      docs.forEach(function(doc){
        var d=doc.data();
        var date=d.createdAt?new Date(d.createdAt.toDate()).toLocaleDateString('ar-IQ'):'';
        html+='<div class="comment-item" data-id="'+doc.id+'">'
          +'<div class="comment-meta">'
            +'<span class="comment-author">'+esc(d.name||'مجهول')+'</span>'
            +'<span class="comment-date">'+date+'</span>'
          +'</div>'
          +'<p class="comment-text">'+esc(d.text||'')+'</p>'
          +'<div class="comment-actions">'
            +'<button class="btn-approve" onclick="approveComment(\''+doc.id+'\')">'
              +'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>'
              +'موافقة'
            +'</button>'
            +'<button class="btn-delete" onclick="deleteComment(\''+doc.id+'\')">'
              +'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>'
              +'حذف'
            +'</button>'
          +'</div>'
        +'</div>';
      });
      commentList.innerHTML=html;
    })
    .catch(function(){commentList.innerHTML='<div class="comment-empty">خطأ في تحميل التعليقات</div>'});
}

window.approveComment=function(id){
  db.collection('comments').doc(id).update({approved:true})
    .then(function(){toast('تمت الموافقة على التعليق','success');loadComments()})
    .catch(function(){toast('خطأ في الموافقة','error')});
};

window.deleteComment=function(id){
  if(!confirm('هل أنت متأكد من حذف هذا التعليق؟'))return;
  db.collection('comments').doc(id).delete()
    .then(function(){toast('تم حذف التعليق','success');loadComments()})
    .catch(function(){toast('خطأ في الحذف','error')});
};

/* ═══════════════════════════════════════
   2. IMAGES
   ═══════════════════════════════════════ */
var uploadZone=document.getElementById('uploadZone');
var uploadInput=document.getElementById('uploadInput');
var imageGrid=document.getElementById('imageGrid');

function loadImages(){
  if(!imageGrid)return;
  db.collection('images').orderBy('createdAt','desc').get()
    .then(function(snap){
      if(!snap.docs.length){
        imageGrid.innerHTML='<div class="comment-empty">لا توجد صور مرفوعة</div>';
        return;
      }
      var html='';
      snap.docs.forEach(function(doc){
        var d=doc.data();
        var size=d.size?(d.size/1024<1024?(d.size/1024).toFixed(1)+' KB':(d.size/1024/1024).toFixed(1)+' MB'):'';
        html+='<div class="img-card" data-id="'+doc.id+'">'
          +'<img src="'+esc(d.url)+'" alt="'+esc(d.name)+'" class="img-preview" loading="lazy">'
          +'<div class="img-info">'
            +'<div class="img-name">'+esc(d.name)+'</div>'
            +'<div class="img-size">'+size+'</div>'
            +'<div class="img-actions">'
              +'<label class="img-btn img-btn-replace">'
                +'<input type="file" accept="image/*" style="display:none" onchange="replaceImage(\''+doc.id+'\',this.files[0])">'
                +'استبدال'
              +'</label>'
              +'<button class="img-btn img-btn-delete" onclick="deleteImage(\''+doc.id+'\',\''+esc(d.storagePath)+'\')">'
                +'حذف'
              +'</button>'
            +'</div>'
          +'</div>'
        +'</div>';
      });
      imageGrid.innerHTML=html;
    })
    .catch(function(){imageGrid.innerHTML='<div class="comment-empty">خطأ في تحميل الصور</div>'});
}

/* Upload */
if(uploadZone){
  uploadZone.addEventListener('click',function(){uploadInput.click()});
  uploadZone.addEventListener('dragover',function(e){e.preventDefault();this.classList.add('dragover')});
  uploadZone.addEventListener('dragleave',function(){this.classList.remove('dragover')});
  uploadZone.addEventListener('drop',function(e){
    e.preventDefault();this.classList.remove('dragover');
    if(e.dataTransfer.files.length)uploadFile(e.dataTransfer.files[0]);
  });
}
if(uploadInput)uploadInput.addEventListener('change',function(){if(this.files[0])uploadFile(this.files[0])});

function uploadFile(file){
  if(!file.type.startsWith('image/')){toast('الملف ليس صورة','error');return}
  if(file.size>5*1024*1024){toast('حجم الصورة أكبر من 5MB','error');return}

  var path='images/'+Date.now()+'_'+file.name;
  var ref=storage.ref(path);

  toast('جاري الرفع...');

  ref.put(file).then(function(){return ref.getDownloadURL()}).then(function(url){
    return db.collection('images').add({
      name:file.name,
      url:url,
      storagePath:path,
      size:file.size,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
  }).then(function(){
    toast('تم رفع الصورة بنجاح','success');
    loadImages();
    if(uploadInput)uploadInput.value='';
  }).catch(function(){toast('خطأ في رفع الصورة','error')});
}

window.deleteImage=function(id,storagePath){
  if(!confirm('هل أنت متأكد من حذف هذه الصورة؟'))return;

  var batch=db.batch();
  batch.delete(db.collection('images').doc(id));

  batch.commit().then(function(){
    if(storagePath){storage.ref(storagePath).delete().catch(function(){})}
    toast('تم حذف الصورة','success');
    loadImages();
  }).catch(function(){toast('خطأ في الحذف','error')});
};

window.replaceImage=function(id,file){
  if(!file)return;
  if(!file.type.startsWith('image/')){toast('الملف ليس صورة','error');return}

  toast('جاري الاستبدال...');

  db.collection('images').doc(id).get().then(function(doc){
    if(!doc.exists)return Promise.reject('not found');
    var old=doc.data();

    /* Delete old storage file */
    if(old.storagePath){storage.ref(old.storagePath).delete().catch(function(){})}

    /* Upload new */
    var path='images/'+Date.now()+'_'+file.name;
    return storage.ref(path).put(file).then(function(){return storage.ref(path).getDownloadURL()});
  }).then(function(url){
    return db.collection('images').doc(id).update({
      name:file.name,
      url:url,
      storagePath:'images/'+Date.now()+'_'+file.name,
      size:file.size
    });
  }).then(function(){
    toast('تم استبدال الصورة','success');
    loadImages();
  }).catch(function(){toast('خطأ في الاستبدال','error')});
};

/* ═══════════════════════════════════════
   3. COMPANY DATA
   ═══════════════════════════════════════ */
var dataForm=document.getElementById('dataForm');

function loadData(){
  db.collection('settings').doc('company').get().then(function(doc){
    if(!doc.exists)return;
    var d=doc.data();
    setVal('phone1',d.phone1);
    setVal('phone2',d.phone2);
    setVal('phone3',d.phone3);
    setVal('hours',d.hours);
    setVal('address',d.address);
    setVal('instagram',d.instagram);
    setVal('about',d.about);
  }).catch(function(){});
}

function setVal(id,v){var el=document.getElementById(id);if(el&&v)el.value=v}

if(dataForm)dataForm.addEventListener('submit',function(e){
  e.preventDefault();
  var btn=document.getElementById('saveBtn');
  if(btn)btn.disabled=true;

  db.collection('settings').doc('company').set({
    phone1:    gv('phone1'),
    phone2:    gv('phone2'),
    phone3:    gv('phone3'),
    hours:     gv('hours'),
    address:   gv('address'),
    instagram: gv('instagram'),
    about:     gv('about'),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  },{merge:true}).then(function(){
    toast('تم حفظ البيانات بنجاح','success');
    if(btn)btn.disabled=false;
  }).catch(function(){
    toast('خطأ في الحفظ','error');
    if(btn)btn.disabled=false;
  });
});

function gv(id){var el=document.getElementById(id);return el?el.value.trim():''}

/* ── Helpers ── */
function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

})();
