/* ═══════════════════════════════════════
   Dashboard - Full CMS
   Comments + Images + Services + Gallery + Trips
   Enhanced Stats · Preview Mode · CRUD
   ═══════════════════════════════════════ */
(function(){
'use strict';

try{firebase.initializeApp(firebaseConfig)}catch(e){}
var auth    = firebase.auth();
var db      = firebase.firestore();
var storage = firebase.storage();

/* ── Auth Guard ── */
auth.onAuthStateChanged(function(user){
  if(!user){window.location.href='login.html';return}
  AdminSession.verify(user).then(function(){
    initDashboard();
  }).catch(function(){
    auth.signOut().then(function(){window.location.href='login.html'});
  });
});

var logoutBtn=document.getElementById('logoutBtn');
if(logoutBtn)logoutBtn.addEventListener('click',function(){
  auth.signOut().then(function(){window.location.href='login.html'});
});

function toast(msg,type){
  var t=document.getElementById('toast');
  if(!t)return;
  t.textContent=msg;
  t.className='toast '+(type||'')+' show';
  setTimeout(function(){t.classList.remove('show')},3000);
}

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

function formatDate(ts){
  if(!ts)return'';
  try{
    var dt=ts.toDate?ts.toDate():new Date(ts);
    return dt.toLocaleDateString('ar-IQ',{year:'numeric',month:'2-digit',day:'2-digit'});
  }catch(e){return''}
}

function buildStarsHtml(count){
  var h='';
  for(var i=1;i<=5;i++){
    if(i<=count){
      h+='<svg width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    }else{
      h+='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--g300)" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    }
  }
  return h;
}

function gv(id){var el=document.getElementById(id);return el?el.value.trim():''}

/* ═══════════════════════════════════════
   INIT
   ═══════════════════════════════════════ */
function initDashboard(){
  loadAllStats();
  loadComments();
  loadImages();
  loadData();
  loadServices();
  loadGallery();
  loadPrograms();
  loadHeroSettings();
  initFilters();
  initModal();
  initPreviewModal();
  initServiceForm();
  initGalleryForm();
  initProgramForm();
  initHeroForm();
  AdminSession.logAction('dashboard_open');
}

/* ═══════════════════════════════════════
   1. ENHANCED STATISTICS (7 cards)
   ═══════════════════════════════════════ */
function loadAllStats(){
  db.collection('comments').get().then(function(snap){
    var total=0,pending=0,approved=0,rejected=0,ratingSum=0,ratingCount=0;
    snap.docs.forEach(function(doc){
      var d=doc.data();
      total++;
      var st=d.status||'pending';
      if(st==='pending')pending++;
      else if(st==='approved')approved++;
      else if(st==='rejected')rejected++;
      if(d.stars&&d.stars>=1&&d.stars<=5){ratingSum+=d.stars;ratingCount++}
    });
    var avg=ratingCount>0?(ratingSum/ratingCount):0;
    setStat('statTotal',total);
    setStat('statPending',pending);
    setStat('statApproved',approved);
    var avgEl=document.getElementById('statAvg');
    if(avgEl)avgEl.textContent=avg.toFixed(1);
    var avgStarsEl=document.getElementById('statAvgStars');
    if(avgStarsEl)avgStarsEl.innerHTML=buildStarsHtml(Math.round(avg));
    var badgeAll=document.getElementById('badgeAll');
    var badgePending=document.getElementById('badgePending');
    var badgeApproved=document.getElementById('badgeApproved');
    var badgeRejected=document.getElementById('badgeRejected');
    if(badgeAll)badgeAll.textContent=total;
    if(badgePending)badgePending.textContent=pending;
    if(badgeApproved)badgeApproved.textContent=approved;
    if(badgeRejected)badgeRejected.textContent=rejected;
  }).catch(function(){});

  db.collection('services').get().then(function(snap){
    setStat('statServices',snap.size);
  }).catch(function(){});

  db.collection('gallery').get().then(function(snap){
    setStat('statGallery',snap.size);
  }).catch(function(){});

  db.collection('programs').get().then(function(snap){
    setStat('statPrograms',snap.size);
  }).catch(function(){});
}

function setStat(id,val){
  var el=document.getElementById(id);
  if(el)el.textContent=val;
}

/* ═══════════════════════════════════════
   2. COMMENTS
   ═══════════════════════════════════════ */
var commentList=document.getElementById('commentList');
var currentFilter='pending';
var allCommentsData=[];

function initFilters(){
  var filterBtns=document.querySelectorAll('.tab-btn');
  filterBtns.forEach(function(btn){
    btn.addEventListener('click',function(){
      filterBtns.forEach(function(b){b.classList.remove('active')});
      btn.classList.add('active');
      currentFilter=btn.getAttribute('data-filter');
      renderComments();
    });
  });
}

function loadComments(){
  if(!commentList)return;
  db.collection('comments').orderBy('createdAt','desc').get()
    .then(function(snap){
      allCommentsData=[];
      snap.docs.forEach(function(doc){
        allCommentsData.push({id:doc.id,data:doc.data()});
      });
      renderComments();
    })
    .catch(function(){commentList.innerHTML='<div class="comment-empty">خطأ في تحميل التعليقات</div>'});
}

function renderComments(){
  if(!commentList)return;
  var filtered=[];
  allCommentsData.forEach(function(item){
    var st=item.data.status||'pending';
    if(currentFilter==='all')filtered.push(item);
    else if(st===currentFilter)filtered.push(item);
  });
  if(!filtered.length){
    var emptyMsg='لا توجد تعليقات';
    if(currentFilter==='pending')emptyMsg='لا توجد تعليقات معلّقة';
    else if(currentFilter==='approved')emptyMsg='لا توجد تعليقات معتمدة';
    else if(currentFilter==='rejected')emptyMsg='لا توجد تعليقات مرفوضة';
    commentList.innerHTML='<div class="comment-empty">'+emptyMsg+'</div>';
    return;
  }
  var html='';
  filtered.forEach(function(item){
    var id=item.id;
    var d=item.data;
    var date=formatDate(d.createdAt);
    var starsHtml=buildStarsHtml(d.stars||5);
    var statusClass='status-'+(d.status||'pending');
    var statusLabel=d.status==='approved'?'معتمد':d.status==='rejected'?'مرفوض':'معلّق';
    html+='<div class="comment-item" data-id="'+id+'">'
      +'<div class="comment-meta">'
        +'<span class="comment-author">'+esc(d.name||'مجهول')+'</span>'
        +'<span class="comment-stars">'+starsHtml+'</span>'
        +'<span class="comment-status '+statusClass+'">'+statusLabel+'</span>'
      +'</div>'
      +'<p class="comment-text">'+esc(d.text||'')+'</p>'
      +'<div class="comment-info">'
        +(d.service?'<span class="comment-service">'+esc(d.service)+'</span>':'')
        +(date?'<span class="comment-date">'+date+'</span>':'')
      +'</div>'
      +'<div class="comment-actions">';
    if(d.status!=='approved'){
      html+='<button class="btn-approve" data-action="approve" data-id="'+id+'">'
        +'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>موافقة</button>';
    }
    if(d.status!=='rejected'){
      html+='<button class="btn-reject" data-action="reject" data-id="'+id+'">'
        +'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>رفض</button>';
    }
    html+='<button class="btn-edit" data-action="edit" data-id="'+id+'">'
      +'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>تعديل</button>'
    +'<button class="btn-delete" data-action="delete" data-id="'+id+'">'
      +'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>حذف</button>'
    +'</div></div>';
  });
  commentList.innerHTML=html;
  bindCommentActions();
}

function bindCommentActions(){
  var btns=commentList.querySelectorAll('[data-action]');
  btns.forEach(function(btn){
    btn.addEventListener('click',function(){
      var action=this.getAttribute('data-action');
      var id=this.getAttribute('data-id');
      if(action==='approve')approveComment(id);
      else if(action==='reject')rejectComment(id);
      else if(action==='edit')openEditModal(id);
      else if(action==='delete')deleteComment(id);
    });
  });
}

function approveComment(id){
  db.collection('comments').doc(id).update({
    status:'approved',approved:true,approvedAt:firebase.firestore.FieldValue.serverTimestamp()
  }).then(function(){
    toast('تمت الموافقة على التعليق','success');
    AdminSession.logAction('comment_approve',id);
    loadComments();loadAllStats();
  }).catch(function(){toast('خطأ في الموافقة','error')});
}

function rejectComment(id){
  db.collection('comments').doc(id).update({
    status:'rejected',approved:false,rejectedAt:firebase.firestore.FieldValue.serverTimestamp()
  }).then(function(){
    toast('تم رفض التعليق','success');
    AdminSession.logAction('comment_reject',id);
    loadComments();loadAllStats();
  }).catch(function(){toast('خطأ في الرفض','error')});
}

function deleteComment(id){
  if(!confirm('هل أنت متأكد من حذف هذا التعليق؟'))return;
  db.collection('comments').doc(id).delete()
    .then(function(){
      toast('تم حذف التعليق','success');
      AdminSession.logAction('comment_delete',id);
      allCommentsData=allCommentsData.filter(function(c){return c.id!==id});
      renderComments();loadAllStats();
    }).catch(function(){toast('خطأ في الحذف','error')});
}

/* ═══════════════════════════════════════
   3. EDIT MODAL
   ═══════════════════════════════════════ */
var editModal=document.getElementById('editModal');
var editForm=document.getElementById('editForm');
var editCloseBtn=document.getElementById('editCloseBtn');
var editCancelBtn=document.getElementById('editCancelBtn');
var editStarsWrap=document.getElementById('editStarsWrap');
var editStarsValue=document.getElementById('editStarsValue');
var editingCommentId=null;

function initModal(){
  if(editCloseBtn)editCloseBtn.addEventListener('click',closeModal);
  if(editCancelBtn)editCancelBtn.addEventListener('click',closeModal);
  if(editModal)editModal.addEventListener('click',function(e){if(e.target===editModal)closeModal()});
  if(editForm)editForm.addEventListener('submit',function(e){e.preventDefault();saveEdit()});
  if(editStarsWrap)initModalStars();
}

function initModalStars(){
  var val=parseInt(editStarsValue.value)||5;
  renderModalStars(val);
  editStarsWrap.addEventListener('click',function(e){
    var btn=e.target.closest('.star-btn');
    if(!btn)return;
    var v=parseInt(btn.getAttribute('data-value'));
    if(v>=1&&v<=5){editStarsValue.value=v;renderModalStars(v)}
  });
}

function renderModalStars(val){
  if(!editStarsWrap)return;
  var h='';
  for(var i=1;i<=5;i++){
    h+='<button type="button" class="star-btn'+(i<=val?' active':'')+'" data-value="'+i+'">'+(i<=val?'&#9733;':'&#9734;')+'</button>';
  }
  editStarsWrap.innerHTML=h;
}

function openEditModal(id){
  var item=allCommentsData.find(function(c){return c.id===id});
  if(!item)return;
  var d=item.data;
  editingCommentId=id;
  document.getElementById('editName').value=d.name||'';
  document.getElementById('editService').value=d.service||'';
  document.getElementById('editText').value=d.text||'';
  var stars=d.stars||5;
  editStarsValue.value=stars;
  renderModalStars(stars);
  document.getElementById('editStatus').value=d.status||'pending';
  editModal.classList.add('show');
  document.body.style.overflow='hidden';
}

function closeModal(){
  if(editModal)editModal.classList.remove('show');
  document.body.style.overflow='';
  editingCommentId=null;
}

function saveEdit(){
  if(!editingCommentId)return;
  var name=(document.getElementById('editName').value||'').trim();
  var service=(document.getElementById('editService').value||'').trim();
  var text=(document.getElementById('editText').value||'').trim();
  var stars=parseInt(editStarsValue.value)||5;
  var status=document.getElementById('editStatus').value||'pending';
  if(!name||name.length<3){toast('الاسم يجب أن لا يقل عن 3 أحرف','error');return}
  if(!text||text.length<10){toast('التعليق يجب أن لا يقل عن 10 أحرف','error');return}
  var approved=status==='approved';
  var updateData={name:name,service:service,text:text,stars:stars,status:status,approved:approved};
  if(approved)updateData.approvedAt=firebase.firestore.FieldValue.serverTimestamp();
  if(status==='rejected')updateData.rejectedAt=firebase.firestore.FieldValue.serverTimestamp();
  db.collection('comments').doc(editingCommentId).update(updateData)
    .then(function(){
      toast('تم حفظ التعديلات بنجاح','success');
      AdminSession.logAction('comment_edit',editingCommentId);
      closeModal();loadComments();loadAllStats();
    }).catch(function(){toast('خطأ في الحفظ','error')});
}

/* ═══════════════════════════════════════
   4. IMAGES
   ═══════════════════════════════════════ */
var uploadZone=document.getElementById('uploadZone');
var uploadInput=document.getElementById('uploadInput');
var imageGrid=document.getElementById('imageGrid');

function loadImages(){
  if(!imageGrid)return;
  db.collection('images').orderBy('createdAt','desc').get()
    .then(function(snap){
      if(!snap.docs.length){imageGrid.innerHTML='<div class="comment-empty">لا توجد صور مرفوعة</div>';return}
      var html='';
      snap.docs.forEach(function(doc){
        var d=doc.data();
        var size=d.size?(d.size/1024<1024?(d.size/1024).toFixed(1)+' KB':(d.size/1024/1024).toFixed(1)+' MB'):'';
        html+='<div class="img-card" data-id="'+doc.id+'">'
          +'<img src="'+esc(d.url)+'" alt="'+esc(d.name)+'" class="img-preview" loading="lazy">'
          +'<div class="img-info"><div class="img-name">'+esc(d.name)+'</div><div class="img-size">'+size+'</div>'
          +'<div class="img-actions">'
          +'<label class="img-btn img-btn-replace"><input type="file" accept="image/*" style="display:none" data-action="replace" data-id="'+doc.id+'">استبدال</label>'
          +'<button class="img-btn img-btn-delete" data-action="delete-image" data-id="'+doc.id+'" data-path="'+esc(d.storagePath||'')+'">حذف</button>'
          +'</div></div></div>';
      });
      imageGrid.innerHTML=html;
      bindImageActions();
    })
    .catch(function(){imageGrid.innerHTML='<div class="comment-empty">خطأ في تحميل الصور</div>'});
}

function bindImageActions(){
  imageGrid.querySelectorAll('[data-action="delete-image"]').forEach(function(btn){
    btn.addEventListener('click',function(){deleteImage(this.getAttribute('data-id'),this.getAttribute('data-path'))});
  });
  imageGrid.querySelectorAll('[data-action="replace"]').forEach(function(input){
    input.addEventListener('change',function(){if(this.files[0])replaceImage(this.getAttribute('data-id'),this.files[0])});
  });
}

if(uploadZone&&uploadInput){
  uploadZone.addEventListener('click',function(){uploadInput.click()});
  uploadZone.addEventListener('dragover',function(e){e.preventDefault();this.classList.add('dragover')});
  uploadZone.addEventListener('dragleave',function(){this.classList.remove('dragover')});
  uploadZone.addEventListener('drop',function(e){e.preventDefault();this.classList.remove('dragover');if(e.dataTransfer.files.length)uploadFile(e.dataTransfer.files[0])});
}
if(uploadInput)uploadInput.addEventListener('change',function(){if(this.files[0])uploadFile(this.files[0])});

function uploadFile(file){
  if(!file.type.startsWith('image/')){toast('الملف ليس صورة','error');return}
  if(file.size>5*1024*1024){toast('حجم الصورة أكبر من 5MB','error');return}
  var path='images/'+Date.now()+'_'+file.name;
  var ref=storage.ref(path);
  toast('جاري الرفع...');
  ref.put(file).then(function(){return ref.getDownloadURL()}).then(function(url){
    return db.collection('images').add({name:file.name,url:url,storagePath:path,size:file.size,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
  }).then(function(){
    toast('تم رفع الصورة بنجاح','success');
    AdminSession.logAction('image_upload',file.name);
    loadImages();if(uploadInput)uploadInput.value='';
  }).catch(function(){toast('خطأ في رفع الصورة','error')});
}

function deleteImage(id,storagePath){
  if(!confirm('هل أنت متأكد من حذف هذه الصورة؟'))return;
  db.collection('images').doc(id).delete().then(function(){
    if(storagePath){storage.ref(storagePath).delete().catch(function(){})}
    toast('تم حذف الصورة','success');
    AdminSession.logAction('image_delete',id);
    loadImages();
  }).catch(function(){toast('خطأ في الحذف','error')});
}

function replaceImage(id,file){
  if(!file||!file.type.startsWith('image/')){toast('الملف ليس صورة','error');return}
  toast('جاري الاستبدال...');
  var newPath='images/'+Date.now()+'_'+file.name;
  db.collection('images').doc(id).get().then(function(doc){
    if(!doc.exists)return Promise.reject('not found');
    var old=doc.data();
    if(old.storagePath){storage.ref(old.storagePath).delete().catch(function(){})}
    return storage.ref(newPath).put(file).then(function(){return storage.ref(newPath).getDownloadURL()});
  }).then(function(url){
    return db.collection('images').doc(id).update({name:file.name,url:url,storagePath:newPath,size:file.size});
  }).then(function(){
    toast('تم استبدال الصورة','success');
    AdminSession.logAction('image_replace',id);
    loadImages();
  }).catch(function(){toast('خطأ في الاستبدال','error')});
}

/* ═══════════════════════════════════════
   5. SERVICES CRUD
   ═══════════════════════════════════════ */
var serviceList=document.getElementById('serviceList');
var allServicesData=[];

function initServiceForm(){
  var addBtn=document.getElementById('addServiceBtn');
  var form=document.getElementById('serviceForm');
  var previewBtn=document.getElementById('svcPreviewBtn');
  if(addBtn)addBtn.addEventListener('click',function(){
    form.style.display=form.style.display==='none'?'block':'none';
    document.getElementById('svcEditId').value='';
    form.reset();
  });
  if(form)form.addEventListener('submit',function(e){e.preventDefault();saveService()});
  if(previewBtn)previewBtn.addEventListener('click',function(){previewService()});
}

function loadServices(){
  if(!serviceList)return;
  db.collection('services').orderBy('order','asc').get()
    .then(function(snap){
      allServicesData=[];
      snap.docs.forEach(function(doc){allServicesData.push({id:doc.id,data:doc.data()})});
      renderServices();
    }).catch(function(){serviceList.innerHTML='<div class="comment-empty">خطأ</div>'});
}

function renderServices(){
  if(!serviceList)return;
  if(!allServicesData.length){serviceList.innerHTML='<div class="comment-empty">لا توجد خدمات بعد</div>';return}
  var html='';
  allServicesData.forEach(function(item){
    var d=item.data;
    var st=d.status==='active'?'<span class="status-approved">نشط</span>':'<span class="status-rejected">غير نشط</span>';
    html+='<div class="comment-item" data-id="'+item.id+'">'
      +'<div class="comment-meta"><span class="comment-author">'+esc(d.title||'')+'</span>'+st
      +'<span class="comment-date">ترتيب: '+(d.order||0)+'</span></div>'
      +'<p class="comment-text">'+esc(d.description||'')+'</p>'
      +'<div class="comment-actions">'
      +'<button class="btn-edit" onclick="editService(\''+item.id+'\')">تعديل</button>'
      +'<button class="btn-delete" onclick="deleteService(\''+item.id+'\')">حذف</button>'
      +'</div></div>';
  });
  serviceList.innerHTML=html;
}

function saveService(){
  var editId=document.getElementById('svcEditId').value;
  var data={
    title:gv('svcTitle'),
    icon:gv('svcIcon'),
    description:gv('svcDesc'),
    whatsappLink:gv('svcWhatsapp'),
    bookingText:gv('svcBookingText'),
    order:parseInt(gv('svcOrder'))||0,
    status:gv('svcStatus'),
    createdAt:firebase.firestore.FieldValue.serverTimestamp()
  };
  if(!data.title){toast('أدخل عنوان الخدمة','error');return}
  var p;
  if(editId){
    p=db.collection('services').doc(editId).update(data);
  }else{
    p=db.collection('services').add(data);
  }
  p.then(function(){
    toast(editId?'تم التحديث':'تمت الإضافة','success');
    AdminSession.logAction('service_save',editId||'new');
    document.getElementById('serviceForm').style.display='none';
    loadServices();loadAllStats();
  }).catch(function(){toast('خطأ في الحفظ','error')});
}

window.editService=function(id){
  var item=allServicesData.find(function(s){return s.id===id});
  if(!item)return;
  var d=item.data;
  document.getElementById('svcEditId').value=id;
  document.getElementById('svcTitle').value=d.title||'';
  document.getElementById('svcIcon').value=d.icon||'default';
  document.getElementById('svcDesc').value=d.description||'';
  document.getElementById('svcWhatsapp').value=d.whatsappLink||'';
  document.getElementById('svcBookingText').value=d.bookingText||'';
  document.getElementById('svcOrder').value=d.order||0;
  document.getElementById('svcStatus').value=d.status||'active';
  document.getElementById('serviceForm').style.display='block';
};

window.deleteService=function(id){
  if(!confirm('هل أنت متأكد من حذف هذه الخدمة؟'))return;
  db.collection('services').doc(id).delete().then(function(){
    toast('تم الحذف','success');
    AdminSession.logAction('service_delete',id);
    loadServices();loadAllStats();
  }).catch(function(){toast('خطأ في الحذف','error')});
};

function previewService(){
  var html='<div class="preview-svc-card">'
    +'<h3>'+esc(gv('svcTitle'))+'</h3>'
    +'<p>'+esc(gv('svcDesc'))+'</p>'
    +(gv('svcWhatsapp')?'<a href="'+esc(gv('svcWhatsapp'))+'" target="_blank">تواصل معنا</a>':'')
    +'</div>';
  openPreviewModal(html);
}

/* ═══════════════════════════════════════
   6. GALLERY CRUD
   ═══════════════════════════════════════ */
var galleryList=document.getElementById('galleryList');
var allGalleryData=[];
var galUploadFile=null;

function initGalleryForm(){
  var addBtn=document.getElementById('addGalleryBtn');
  var form=document.getElementById('galleryForm');
  var uploadZone=document.getElementById('galUploadZone');
  var uploadInput=document.getElementById('galUploadInput');
  if(addBtn)addBtn.addEventListener('click',function(){
    form.style.display=form.style.display==='none'?'block':'none';
    document.getElementById('galEditId').value='';
    form.reset();
    document.getElementById('galPreview').style.display='none';
    galUploadFile=null;
  });
  if(form)form.addEventListener('submit',function(e){e.preventDefault();saveGallery()});
  if(uploadZone&&uploadInput){
    uploadZone.addEventListener('click',function(){uploadInput.click()});
    uploadZone.addEventListener('dragover',function(e){e.preventDefault();this.classList.add('dragover')});
    uploadZone.addEventListener('dragleave',function(){this.classList.remove('dragover')});
    uploadZone.addEventListener('drop',function(e){
      e.preventDefault();this.classList.remove('dragover');
      if(e.dataTransfer.files[0])handleGalFile(e.dataTransfer.files[0]);
    });
    uploadInput.addEventListener('change',function(){if(this.files[0])handleGalFile(this.files[0])});
  }
}

function handleGalFile(file){
  if(!file.type.startsWith('image/')){toast('الملف ليس صورة','error');return}
  galUploadFile=file;
  var reader=new FileReader();
  reader.onload=function(e){
    var img=document.getElementById('galPreview');
    img.src=e.target.result;
    img.style.display='block';
  };
  reader.readAsDataURL(file);
}

function loadGallery(){
  if(!galleryList)return;
  db.collection('gallery').orderBy('order','asc').get()
    .then(function(snap){
      allGalleryData=[];
      snap.docs.forEach(function(doc){allGalleryData.push({id:doc.id,data:doc.data()})});
      renderGallery();
    }).catch(function(){galleryList.innerHTML='<div class="comment-empty">خطأ</div>'});
}

function renderGallery(){
  if(!galleryList)return;
  if(!allGalleryData.length){galleryList.innerHTML='<div class="comment-empty">لا توجد صور في المعرض</div>';return}
  var html='';
  allGalleryData.forEach(function(item){
    var d=item.data;
    var st=d.status==='active'?'نشط':'غير نشط';
    html+='<div class="img-card" data-id="'+item.id+'">'
      +'<img src="'+esc(d.imageUrl||'')+'" alt="'+esc(d.title||'')+'" class="img-preview" loading="lazy">'
      +'<div class="img-info"><div class="img-name">'+esc(d.title||'بدون عنوان')+'</div>'
      +'<div class="img-size">'+st+' | ترتيب: '+(d.order||0)+'</div>'
      +'<div class="img-actions">'
      +'<button class="img-btn img-btn-replace" onclick="editGallery(\''+item.id+'\')">تعديل</button>'
      +'<button class="img-btn img-btn-delete" onclick="deleteGallery(\''+item.id+'\')">حذف</button>'
      +'</div></div></div>';
  });
  galleryList.innerHTML=html;
}

function saveGallery(){
  var editId=document.getElementById('galEditId').value;
  var imageUrl=gv('galImageUrl');
  if(!imageUrl&&!galUploadFile&&!editId){toast('ارفع صورة أو أدخل رابط','error');return}

  function doSave(url){
    var data={
      title:gv('galTitle'),
      description:gv('galDesc'),
      imageUrl:url||imageUrl,
      order:parseInt(gv('galOrder'))||0,
      status:gv('galStatus'),
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    };
    var p;
    if(editId){p=db.collection('gallery').doc(editId).update(data)}
    else{p=db.collection('gallery').add(data)}
    p.then(function(){
      toast(editId?'تم التحديث':'تمت الإضافة','success');
      AdminSession.logAction('gallery_save',editId||'new');
      document.getElementById('galleryForm').style.display='none';
      loadGallery();loadAllStats();
    }).catch(function(){toast('خطأ في الحفظ','error')});
  }

  if(galUploadFile){
    var path='gallery/'+Date.now()+'_'+galUploadFile.name;
    storage.ref(path).put(galUploadFile).then(function(){
      return storage.ref(path).getDownloadURL();
    }).then(function(url){doSave(url)}).catch(function(){toast('خطأ في رفع الصورة','error')});
  }else{
    doSave(null);
  }
}

window.editGallery=function(id){
  var item=allGalleryData.find(function(g){return g.id===id});
  if(!item)return;
  var d=item.data;
  document.getElementById('galEditId').value=id;
  document.getElementById('galTitle').value=d.title||'';
  document.getElementById('galDesc').value=d.description||'';
  document.getElementById('galImageUrl').value=d.imageUrl||'';
  document.getElementById('galOrder').value=d.order||0;
  document.getElementById('galStatus').value=d.status||'active';
  if(d.imageUrl){
    var img=document.getElementById('galPreview');
    img.src=d.imageUrl;img.style.display='block';
  }
  document.getElementById('galleryForm').style.display='block';
  galUploadFile=null;
};

window.deleteGallery=function(id){
  if(!confirm('هل أنت متأكد من حذف هذه الصورة؟'))return;
  db.collection('gallery').doc(id).delete().then(function(){
    toast('تم الحذف','success');
    AdminSession.logAction('gallery_delete',id);
    loadGallery();loadAllStats();
  }).catch(function(){toast('خطأ في الحذف','error')});
};

/* ═══════════════════════════════════════
   7. PROGRAMS CRUD (with Timeline & Gallery)
   ═══════════════════════════════════════ */
var programList=document.getElementById('programList');
var allProgramsData=[];
var prgTimelineData=[];
var prgGalleryData=[];
var prgTimelineIdCounter=0;

function initProgramForm(){
  var addBtn=document.getElementById('addProgramBtn');
  var form=document.getElementById('programForm');
  var modal=document.getElementById('programModal');
  var closeBtn=document.getElementById('programModalClose');
  var cancelBtn=document.getElementById('programCancelBtn');
  var previewBtn=document.getElementById('prgPreviewBtn');
  var addDayBtn=document.getElementById('prgAddDayBtn');
  var addGalleryBtn=document.getElementById('prgAddGalleryBtn');
  var galleryInput=document.getElementById('prgGalleryInput');

  if(addBtn)addBtn.addEventListener('click',function(){openProgramModal()});
  if(closeBtn)closeBtn.addEventListener('click',closeProgramModal);
  if(cancelBtn)cancelBtn.addEventListener('click',closeProgramModal);
  if(modal)modal.addEventListener('click',function(e){if(e.target===modal)closeProgramModal()});
  if(form)form.addEventListener('submit',function(e){e.preventDefault();saveProgram()});
  if(previewBtn)previewBtn.addEventListener('click',previewProgram);
  if(addDayBtn)addDayBtn.addEventListener('click',addTimelineDay);
  if(addGalleryBtn)addGalleryBtn.addEventListener('click',function(){
    var url=galleryInput.value.trim();
    if(!url){toast('أدخل رابط الصورة','error');return}
    prgGalleryData.push(url);
    renderPrgGallery();
    galleryInput.value='';
  });
  galleryInput.addEventListener('keydown',function(e){
    if(e.key==='Enter'){e.preventDefault();addGalleryBtn.click()}
  });
}

function openProgramModal(id){
  var modal=document.getElementById('programModal');
  var title=document.getElementById('programModalTitle');
  prgTimelineData=[];
  prgGalleryData=[];
  prgTimelineIdCounter=0;
  document.getElementById('programForm').reset();
  document.getElementById('prgEditId').value='';

  if(id){
    title.textContent='تعديل البرنامج';
    var item=allProgramsData.find(function(p){return p.id===id});
    if(!item)return;
    var d=item.data;
    document.getElementById('prgEditId').value=id;
    document.getElementById('prgName').value=d.name||'';
    document.getElementById('prgPrice').value=d.price||'';
    document.getElementById('prgShortDesc').value=d.shortDesc||'';
    document.getElementById('prgFullDesc').value=d.fullDesc||'';
    document.getElementById('prgDuration').value=d.duration||'';
    document.getElementById('prgDepartureDate').value=d.departureDate||'';
    document.getElementById('prgReturnDate').value=d.returnDate||'';
    document.getElementById('prgDays').value=d.days||'';
    document.getElementById('prgNights').value=d.nights||'';
    document.getElementById('prgSeats').value=d.seats||'';
    document.getElementById('prgSeatsLeft').value=d.seatsLeft||'';
    document.getElementById('prgOrder').value=d.order||0;
    document.getElementById('prgProgramStatus').value=d.programStatus||'available';
    document.getElementById('prgStatus').value=d.status||'active';
    document.getElementById('prgTransport').value=d.transport||'';
    document.getElementById('prgAirlines').value=d.airlines||'';
    document.getElementById('prgHotelMakkah').value=d.hotelMakkah||'';
    document.getElementById('prgHotelMadinah').value=d.hotelMadinah||'';
    document.getElementById('prgHotelStars').value=d.hotelStars||'';
    document.getElementById('prgMeals').value=d.meals||'';
    document.getElementById('prgServicesIncluded').value=d.servicesIncluded||'';
    document.getElementById('prgNotes').value=d.notes||'';
    document.getElementById('prgMainImage').value=d.mainImage||'';
    if(d.gallery&&d.gallery.length){prgGalleryData=d.gallery.slice()}
    renderPrgGallery();

    db.collection('programs').doc(id).collection('timeline').orderBy('order','asc').get().then(function(snap){
      prgTimelineData=[];
      prgTimelineIdCounter=0;
      snap.docs.forEach(function(tlDoc){
        var t=tlDoc.data();
        prgTimelineData.push({
          _id:'tl_'+(prgTimelineIdCounter++),
          _docId:tlDoc.id,
          day:t.day||1,
          title:t.title||'',
          description:t.description||'',
          images:t.images||[]
        });
      });
      renderPrgTimeline();
    }).catch(function(){renderPrgTimeline()});
  }else{
    title.textContent='إضافة برنامج جديد';
    renderPrgGallery();
    renderPrgTimeline();
  }
  modal.classList.add('show');
  document.body.style.overflow='hidden';
}

function closeProgramModal(){
  document.getElementById('programModal').classList.remove('show');
  document.body.style.overflow='';
}

function renderPrgGallery(){
  var list=document.getElementById('prgGalleryList');
  if(!list)return;
  if(!prgGalleryData.length){
    list.innerHTML='<div style="color:var(--g400);font-size:13px;margin-bottom:8px">لا توجد صور مضافة.</div>';
    return;
  }
  var h='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px">';
  prgGalleryData.forEach(function(url,i){
    h+='<div style="position:relative;width:80px;height:80px;border-radius:var(--r-sm);overflow:hidden;border:1px solid var(--border)">'
      +'<img src="'+esc(url)+'" alt="" style="width:100%;height:100%;object-fit:cover">'
      +'<button type="button" onclick="removePrgGallery('+i+')" style="position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:rgba(239,68,68,.9);color:var(--white);border:none;font-size:12px;line-height:20px;text-align:center;cursor:pointer">&times;</button>'
      +'</div>';
  });
  h+='</div>';
  list.innerHTML=h;
}
window.removePrgGallery=function(i){prgGalleryData.splice(i,1);renderPrgGallery()};

function addTimelineDay(){
  prgTimelineData.push({
    _id:'tl_'+(prgTimelineIdCounter++),
    _docId:null,
    day:prgTimelineData.length+1,
    title:'',
    description:'',
    images:[]
  });
  renderPrgTimeline();
}

function renderPrgTimeline(){
  var container=document.getElementById('prgTimelineDays');
  if(!container)return;
  if(!prgTimelineData.length){
    container.innerHTML='<div style="color:var(--g400);font-size:13px;margin-bottom:8px">لا توجد أيام مضافة.</div>';
    return;
  }
  var h='';
  prgTimelineData.forEach(function(item,i){
    h+='<div class="prg-tl-day" data-idx="'+i+'" style="background:var(--off);border:1px solid var(--border);border-radius:var(--r-md);padding:16px;margin-bottom:10px">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'
      +'<div style="display:flex;align-items:center;gap:8px">'
      +'<span style="background:var(--gold);color:var(--white);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700">'+(i+1)+'</span>'
      +'<strong style="font-size:14px;color:var(--g800)">اليوم '+(i+1)+'</strong>'
      +'</div>'
      +'<div style="display:flex;gap:4px">'
      +'<button type="button" onclick="movePrgDay('+i+',-1)" '+(i===0?'disabled style="opacity:.3"':'')+' style="width:28px;height:28px;border-radius:50%;border:1px solid var(--g200);background:var(--white);cursor:pointer;font-size:14px">&uarr;</button>'
      +'<button type="button" onclick="movePrgDay('+i+',1)" '+(i===prgTimelineData.length-1?'disabled style="opacity:.3"':'')+' style="width:28px;height:28px;border-radius:50%;border:1px solid var(--g200);background:var(--white);cursor:pointer;font-size:14px">&darr;</button>'
      +'<button type="button" onclick="removePrgDay('+i+')" style="width:28px;height:28px;border-radius:50%;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:var(--red);cursor:pointer;font-size:14px">&times;</button>'
      +'</div>'
      +'</div>'
      +'<div class="modal-row">'
      +'<div class="modal-field"><label>عنوان اليوم</label><input type="text" class="prg-tl-title-input" value="'+esc(item.title)+'" placeholder="الانطلاق من العراق"></div>'
      +'<div class="modal-field"><label>رقم اليوم</label><input type="number" class="prg-tl-day-input" value="'+(item.day||(i+1))+'" min="1"></div>'
      +'</div>'
      +'<div class="modal-field"><label>وصف النشاط</label><textarea class="prg-tl-desc-input" rows="2" placeholder="وصف نشاط اليوم...">'+esc(item.description)+'</textarea></div>'
      +'<div class="modal-field"><label>صور اليوم (روابط)</label>'
      +'<div class="prg-tl-imgs" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px">'
      +(item.images.length?item.images.map(function(im,j){
        return '<div style="position:relative;width:60px;height:60px;border-radius:4px;overflow:hidden;border:1px solid var(--border)">'
          +'<img src="'+esc(im)+'" alt="" style="width:100%;height:100%;object-fit:cover">'
          +'<button type="button" onclick="removePrgDayImg('+i+','+j+')" style="position:absolute;top:1px;left:1px;width:16px;height:16px;border-radius:50%;background:rgba(239,68,68,.9);color:var(--white);border:none;font-size:10px;line-height:16px;text-align:center;cursor:pointer">&times;</button>'
          +'</div>';
      }).join(''):'<span style="color:var(--g400);font-size:12px">لا توجد صور</span>')
      +'</div>'
      +'<div style="display:flex;gap:6px">'
      +'<input type="url" class="prg-tl-img-input" placeholder="رابط صورة..." style="flex:1;padding:6px 10px;border:1.5px solid var(--g200);border-radius:var(--r-sm);font-size:12px">'
      +'<button type="button" onclick="addPrgDayImg('+i+')" style="padding:6px 12px;background:var(--navy);color:var(--white);border:none;border-radius:var(--r-sm);font-size:11px;cursor:pointer">إضافة</button>'
      +'</div>'
      +'</div>'
      +'</div>';
  });
  container.innerHTML=h;
}

window.addPrgDayImg=function(idx){
  var container=document.getElementById('prgTimelineDays');
  var inputs=container.querySelectorAll('.prg-tl-img-input');
  var url=inputs[idx].value.trim();
  if(!url){toast('أدخل رابط الصورة','error');return}
  if(!prgTimelineData[idx].images)prgTimelineData[idx].images=[];
  prgTimelineData[idx].images.push(url);
  inputs[idx].value='';
  renderPrgTimeline();
};

window.removePrgDayImg=function(idx,j){
  if(prgTimelineData[idx]&&prgTimelineData[idx].images){
    prgTimelineData[idx].images.splice(j,1);
    renderPrgTimeline();
  }
};

window.movePrgDay=function(idx,dir){
  var newIdx=idx+dir;
  if(newIdx<0||newIdx>=prgTimelineData.length)return;
  var temp=prgTimelineData[idx];
  prgTimelineData[idx]=prgTimelineData[newIdx];
  prgTimelineData[newIdx]=temp;
  renderPrgTimeline();
};

window.removePrgDay=function(idx){
  if(!confirm('حذف هذا اليوم؟'))return;
  prgTimelineData.splice(idx,1);
  renderPrgTimeline();
};

function collectTimelineData(){
  var container=document.getElementById('prgTimelineDays');
  if(!container)return prgTimelineData;
  var titleInputs=container.querySelectorAll('.prg-tl-title-input');
  var dayInputs=container.querySelectorAll('.prg-tl-day-input');
  var descInputs=container.querySelectorAll('.prg-tl-desc-input');
  prgTimelineData.forEach(function(item,i){
    if(titleInputs[i])item.title=titleInputs[i].value.trim();
    if(dayInputs[i])item.day=parseInt(dayInputs[i].value)||(i+1);
    if(descInputs[i])item.description=descInputs[i].value.trim();
  });
  return prgTimelineData;
}

function loadPrograms(){
  if(!programList)return;
  db.collection('programs').orderBy('order','asc').get()
    .then(function(snap){
      allProgramsData=[];
      snap.docs.forEach(function(doc){allProgramsData.push({id:doc.id,data:doc.data()})});
      renderPrograms();
    }).catch(function(){programList.innerHTML='<div class="comment-empty">خطأ</div>'});
}

function renderPrograms(){
  if(!programList)return;
  if(!allProgramsData.length){
    programList.innerHTML='<div class="comment-empty">لا توجد برامج بعد</div>'
      +'<button onclick="seedDefaultPrograms()" style="margin-top:10px;padding:10px 20px;background:var(--gold);color:var(--white);border:none;border-radius:var(--r-sm);font-size:13px;font-weight:700;cursor:pointer;width:100%">استعادة البرامج الافتراضية</button>';
    return
  }
  var html='';
  allProgramsData.forEach(function(item){
    var d=item.data;
    var st=d.status==='active'?'<span class="status-approved">نشط</span>':'<span class="status-rejected">غير نشط</span>';
    var pstLabels={'available':'متاح','almost_full':'أوشك','full':'مكتمل','coming_soon':'قريباً','ended':'منتهي'};
    var pst=d.programStatus||'';
    html+='<div class="comment-item" data-id="'+item.id+'">'
      +'<div class="comment-meta"><span class="comment-author">'+esc(d.name||'')+'</span>'+st
      +'<span class="comment-service">'+(pstLabels[pst]||pst)+'</span>'
      +(d.price?'<span class="comment-date">'+esc(d.price)+'</span>':'')
      +'</div>'
      +(d.shortDesc?'<p class="comment-text">'+esc(d.shortDesc).substring(0,150)+(d.shortDesc.length>150?'...':'')+'</p>':'')
      +'<div class="comment-actions">'
      +'<button class="btn-edit" onclick="editProgram(\''+item.id+'\')">تعديل</button>'
      +'<button class="btn-delete" onclick="deleteProgram(\''+item.id+'\')">حذف</button>'
      +'</div></div>';
  });
  programList.innerHTML=html;
}

function saveProgram(){
  var editId=document.getElementById('prgEditId').value;
  collectTimelineData();
  var data={
    name:gv('prgName'),
    price:gv('prgPrice'),
    shortDesc:gv('prgShortDesc'),
    fullDesc:gv('prgFullDesc'),
    duration:gv('prgDuration'),
    departureDate:gv('prgDepartureDate'),
    returnDate:gv('prgReturnDate'),
    days:parseInt(gv('prgDays'))||0,
    nights:parseInt(gv('prgNights'))||0,
    seats:parseInt(gv('prgSeats'))||0,
    seatsLeft:parseInt(gv('prgSeatsLeft'))||0,
    order:parseInt(gv('prgOrder'))||0,
    programStatus:gv('prgProgramStatus'),
    status:gv('prgStatus'),
    transport:gv('prgTransport'),
    airlines:gv('prgAirlines'),
    hotelMakkah:gv('prgHotelMakkah'),
    hotelMadinah:gv('prgHotelMadinah'),
    hotelStars:parseInt(gv('prgHotelStars'))||0,
    meals:gv('prgMeals'),
    servicesIncluded:gv('prgServicesIncluded'),
    notes:gv('prgNotes'),
    mainImage:gv('prgMainImage'),
    gallery:prgGalleryData,
    createdAt:firebase.firestore.FieldValue.serverTimestamp()
  };
  if(!data.name){toast('أدخل اسم البرنامج','error');return}

  function saveTimeline(progRef){
    var batch=db.batch();
    prgTimelineData.forEach(function(item,i){
      var tlData={
        day:item.day||(i+1),
        title:item.title||'',
        description:item.description||'',
        images:item.images||[],
        order:i
      };
      if(item._docId){
        batch.update(progRef.collection('timeline').doc(item._docId),tlData);
      }else{
        batch.set(progRef.collection('timeline').doc(),tlData);
      }
    });
    return batch.commit();
  }

  var p;
  if(editId){
    p=db.collection('programs').doc(editId).update(data).then(function(){
      return saveTimeline(db.collection('programs').doc(editId));
    });
  }else{
    p=db.collection('programs').add(data).then(function(ref){
      return saveTimeline(ref);
    });
  }
  p.then(function(){
    toast(editId?'تم التحديث':'تمت الإضافة','success');
    AdminSession.logAction('program_save',editId||'new');
    closeProgramModal();
    loadPrograms();loadAllStats();
  }).catch(function(){toast('خطأ في الحفظ','error')});
}

window.editProgram=function(id){
  openProgramModal(id);
};

window.deleteProgram=function(id){
  if(!confirm('هل أنت متأكد من حذف هذا البرنامج؟'))return;
  var ref=db.collection('programs').doc(id);
  ref.collection('timeline').get().then(function(snap){
    var batch=db.batch();
    snap.docs.forEach(function(doc){batch.delete(doc.ref)});
    return batch.commit();
  }).then(function(){
    return ref.delete();
  }).then(function(){
    toast('تم الحذف','success');
    AdminSession.logAction('program_delete',id);
    loadPrograms();loadAllStats();
  }).catch(function(){toast('خطأ في الحذف','error')});
};

function previewProgram(){
  var pstLabels={'available':'متاح للحجز','almost_full':'المقاعد أوشكت على النفاد','full':'اكتمل العدد','coming_soon':'قريباً','ended':'انتهى البرنامج'};
  var transLabels={'flight':'طيران','bus':'باصات VIP','mixed':'النقل المختلط'};
  var pst=gv('prgProgramStatus')||'';
  var html='<div class="preview-trip-card">'
    +'<h3>'+esc(gv('prgName'))+'</h3>'
    +'<p><strong>السعر:</strong> '+esc(gv('prgPrice'))+'</p>'
    +'<p><strong>المدة:</strong> '+esc(gv('prgDuration'))+'</p>'
    +'<p><strong>الانطلاق:</strong> '+esc(gv('prgDepartureDate'))+'</p>'
    +'<p><strong>العودة:</strong> '+esc(gv('prgReturnDate'))+'</p>'
    +'<p><strong>الأيام:</strong> '+esc(gv('prgDays'))+' | <strong>الليالي:</strong> '+esc(gv('prgNights'))+'</p>'
    +'<p><strong>المقاعد:</strong> '+esc(gv('prgSeats'))+' | <strong>المتبقي:</strong> '+esc(gv('prgSeatsLeft'))+'</p>'
    +'<p><strong>الحالة:</strong> '+(pstLabels[pst]||pst)+'</p>'
    +(gv('prgTransport')?'<p><strong>النقل:</strong> '+(transLabels[gv('prgTransport')]||gv('prgTransport'))+'</p>':'')
    +(gv('prgHotelMakkah')?'<p><strong>فندق مكة:</strong> '+esc(gv('prgHotelMakkah'))+'</p>':'')
    +(gv('prgHotelMadinah')?'<p><strong>فندق المدينة:</strong> '+esc(gv('prgHotelMadinah'))+'</p>':'')
    +(gv('prgServicesIncluded')?'<p><strong>الخدمات:</strong> '+esc(gv('prgServicesIncluded'))+'</p>':'')
    +'<p style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);color:var(--g400);font-size:12px">عدد أيام الجدول: '+prgTimelineData.length+' | صور المعرض: '+prgGalleryData.length+'</p>'
    +'</div>';
  openPreviewModal(html);
}

/* ── Seed Default Programs ── */
window.seedDefaultPrograms=function(){
  if(!confirm('هل تريد استعادة البرامج الافتراضية الثلاثة؟'))return;
  var seedData=[
    {name:'برنامج إيران جواً',price:'للاستفسار عن السعر مراسلتنا',shortDesc:'رحلة دينية سياحية إلى شمال إيران (رشت، فومن، قلعة رودخان، ماسولة، بندر انزلي) ومدينة مشهد المقدسة وقم. المسار: رشت - فومن - قلعة رودخان - ماسولة - بندر انزلي - مشهد - قم.',fullDesc:'برنامج شمال إيران (مدينة رشت وما حولها)\nالفنادق المتاحة للإقامة:\n• فندق آرام (ثلاث نجوم) في مدينة فومن\n• أو فندق خَزَر (أربع نجوم) في مدينة رودسر\n\nبرنامج مدينة مشهد المقدسة\nمكان الإقامة: فندق انتخاب (أربع نجوم)\n\nمدينة قم\n',duration:'9 ليالي / 11 يوم',departureDate:'كل سبت وخميس',programStatus:'available',status:'active',transport:'flight',hotelStars:4,meals:'اختياري (3 وجبات بوفيه +100 دولار)',servicesIncluded:'• تذكرة طيران ذهاب وإياب\n• الإقامة في فنادق 3-4 نجوم\n• جولات سياحية حسب البرنامج\n• مرشد سياحي',notes:'• في حالة رغبة المسافر في الحصول على الطعام (ثلاث وجبات بنظام بوفيه) داخل الفندق، يضاف مبلغ 100 دولار.\n• في حال ترك المسافر للجروب لأي سبب كان، لا يتم إرجاع المبلغ له.',mainImage:'images/صورة الشركة.png',days:11,nights:9,order:0,seats:50,seatsLeft:45,gallery:[],
      timeline:[{day:1,title:'الوصول إلى رشت',description:'الوصول إلى مدينة رشت وتسليم الغرف بعد الساعة 2 ظهراً، وبعدها الذهاب في جولة سياحية في الأسواق المحلية.'},{day:2,title:'قلعة رودخان',description:'الانطلاق صباحاً في جولات سياحية إلى قلعة رودخان، الصعود إلى أعلى القلعة والتمتع بالمناظر الخلابة والمياه الجارية من أعلى.'},{day:3,title:'ماسولة وبندر انزلي',description:'صباحاً: الانطلاق إلى قرية ماسولة الجبلية والاستمتاع بالسير في أزقتها الحجرية الفريدة.\nعصراً: الذهاب إلى مدينة بندر انزلي السياحية وركوب القارب السريع داخل مستنقع انزلي (التالاب) لرؤية زهور اللوتس المائية والطيور المهاجرة.'},{day:4,title:'مشهد - الوصول',description:'الوصول إلى مدينة مشهد المقدسة. استلام الغرف وبعدها التوجه لزيارة الإمام علي بن موسى الرضا (عليه السلام).'},{day:5,title:'جولة في طرقبة',description:'الذهاب صباحاً في جولة سياحية في مدينة طرقبة (جايدراه) والتمتع بالألعاب، ومن ثم الذهاب إلى مطعم عنبران (بلبل) لتناول وجبة الغداء، ثم التوجه إلى حديقة وكيل آباد وحديقة الحيوانات.'},{day:6,title:'حديقة بارك ملت',description:'الذهاب صباحاً إلى حديقة بارك ملت، وعصراً رحلة اختيارية (حسب رغبة المسافر) إلى المدينة المائية.'},{day:7,title:'باغ مشهد',description:'الذهاب إلى حديقة باغ مشهد لمشاهدة أجمل المناظر والاستمتاع بالألعاب، وبعدها وقت حر للمسافرين.'},{day:8,title:'قم - الوصول',description:'الوصول إلى مدينة قم. استراحة وبعدها زيارة السيدة معصومة (عليها السلام).'},{day:9,title:'بيت النور وجمكران',description:'زيارة بيت النور وجمكران.'},{day:10,title:'مغادرة قم',description:'مغادرة قم والعودة إلى أرض الوطن.'}]},
    {name:'برنامج إيران براً',price:'للاستفسار عن السعر مراسلتنا',shortDesc:'رحلة برية دينية سياحية إلى قم، مشهد ونيشابور بباصات VIP حديثة ومكيفة. تشمل 3 وجبات طعام في كل المناطق.',fullDesc:'رحلة إلى قم .. مشهد .. نيشابور\nمدة الرحلة: 11 يوماً\nقم: 3 ليالي (4 أيام) مع طعام 3 وجبات\nمشهد: 3 ليالي (4 أيام) مع طعام 3 وجبات\nالمواصلات: باصات VIP حديثة ومكيفة',duration:'11 يوم',departureDate:'كل سبت وخميس',programStatus:'available',status:'active',transport:'bus',hotelStars:3,meals:'3 وجبات يومياً',servicesIncluded:'• النقل بباصات VIP حديثة ومكيفة\n• الإقامة مع 3 وجبات طعام\n• مشرف طوال الرحلة\n• مترجم للمراجعة في الأمور الطبية مجاناً',notes:'• النقل باصات حديثة ومكيفة VIP رجال أعمال.\n• السكن ثلاثي ورباعي، ومن يرغب بغرفة مزدوجة إضافة 50 ألف للنفر، غرفة سنكل 100 ألف.\n• استلام الغرف الساعة 1 ظهراً لغرض التنظيف.\n• عند تسليم الجواز للشركة لا يجوز سحبه، وعند سحبه يستقطع نصف المبلغ بسبب الحجز المسبق.\n• الشركة توفر مترجم للمراجعة في الأمور الطبية مجاناً.',mainImage:'images/صورة الشركة.png',days:11,nights:10,order:1,seats:50,seatsLeft:50,gallery:[],
      timeline:[{day:1,title:'التجمع والانطلاق',description:'التجمع عند باب الشركة والانطلاق نحو الحدود العراقية الإيرانية ومنها إلى مدينة قم المقدسة.'},{day:2,title:'الوصول إلى قم',description:'الوصول إلى قم واستلام الغرف.'},{day:3,title:'مزارات قم',description:'التجمع داخل صالة الفندق والخروج لأداء المزارات: مسجد جمكران، مقام الإمام المهدي (عجل الله فرجه الشريف) وبئر الأمنيات.'},{day:4,title:'التوجه إلى مشهد',description:'تسليم الغرف والاتجاه إلى مدينة مشهد المقدسة.'},{day:5,title:'مشهد - الوصول',description:'الوصول، استلام الغرف والاستراحة، وعصراً الخروج لزيارة الإمام الرضا (عليه السلام).'},{day:6,title:'زيارة ياسر وناصر',description:'التوجه لزيارة ياسر وناصر، وشراء العسل الطبيعي، باغ وحش، باغ مشهد، حديقة الدينصورات، كوسنگي.'},{day:7,title:'يوم حر',description:'يوم حر لكم.'},{day:8,title:'العودة إلى قم عبر نيشابور',description:'تسليم الغرف والتوجه إلى مدينة قم المقدسة مروراً بمدينة نيشابور لزيارة قدم الإمام الرضا (عليه السلام) وأخذ الماء المبارك من العين التي انبثقت تحت قدمه الشريفة.'},{day:9,title:'قم - استراحة',description:'الوصول إلى مدينة قم المقدسة، استلام الغرف والاستراحة، وعصراً جولة حرة للتسوق.'},{day:10,title:'زيارة الوداع',description:'صباحاً زيارة الوداع لحرم السيدة معصومة (عليها السلام)، وبعد الظهر تسليم الغرف والتوجه إلى أرض الوطن.'},{day:11,title:'العودة إلى الوطن',description:'الوصول إلى أرض الوطن.'}]},
    {name:'برنامج العمرة',price:'للاستفسار عن السعر مراسلتنا',shortDesc:'رحلة عمرة مع شركة بركات المناسك. 7 ليالي في مكة المكرمة (منطقة محبس الجن) و3 ليالي في المدينة المنورة (مركزية). تشمل تذكرة طيران وإقامة في فنادق 4 نجوم وجميع التنقلات.',fullDesc:'🕋 رحلة العمرة المباركة\nمع شركة بركات المناسك للسفر والسياحة\nرحلات طيران - كل أسبوع\nالإقامة في فنادق راقية ومميزة\nالمدينة المنورة: 3 ليالي - سكن في المدينة مركزية\nمكة المكرمة: 7 ليالي - منطقة محبس الجن',duration:'10 ليالي',departureDate:'كل أسبوع',programStatus:'available',status:'active',transport:'flight',airlines:'خطوط الطيران',hotelMakkah:'ميسان الملتزم / تاج بارك / الجزيرة (منطقة محبس الجن)',hotelMadinah:'فندق في المنطقة المركزية',hotelStars:4,meals:'بوفيه مفتوح',servicesIncluded:'• تذكرة الطائرة ذهاب وإياب\n• الإقامة في مستوى فنادق 4 نجوم مميزة\n• جميع التنقلات السياحية والدينية بين مكة والمدينة\n• إشراف كامل على مدار الرحلة\n• كادر إداري\n• زيارة جميع المزارات الدينية في مكة والمدينة\n• إرشاد ديني متخصص معكم طوال الرحلة\n\n🎁 هدايا مجانية لكل معتمر:\n• حقيبة سفر كبيرة + حقيبة يد كتف\n• إحرام رجالي + وشاح نسائي\n• شفقات رجالية ونسائية',notes:'• رحلات البر متوفرة أيضاً بأسعار تنافسية',mainImage:'images/صورة الشركة.png',days:10,nights:10,order:2,seats:100,seatsLeft:80,gallery:[],
      timeline:[{day:1,title:'المغادرة إلى المدينة',description:'المغادرة من أرض الوطن إلى المدينة المنورة.'},{day:2,title:'المدينة المنورة',description:'الوصول إلى المدينة المنورة واستلام الغرف وزيارة المسجد النبوي الشريف.'},{day:3,title:'المدينة - مزارات',description:'زيارة المزارات الدينية في المدينة المنورة.'},{day:4,title:'التوجه إلى مكة',description:'التوجه إلى مكة المكرمة والاستعداد للعمرة.'},{day:5,title:'مكة المكرمة',description:'أداء مناسك العمرة والطواف والسعي.'},{day:6,title:'مكة - مزارات',description:'زيارة المزارات الدينية في مكة المكرمة.'},{day:7,title:'مكة - عبادة',description:'وقت حر للعبادة والتسوق.'},{day:8,title:'مكة - عبادة',description:'وقت حر للعبادة.'},{day:9,title:'الاستعداد للعودة',description:'الاستعداد للعودة إلى أرض الوطن.'},{day:10,title:'العودة',description:'العودة إلى أرض الوطن.'}]}
  ];
  var done=0;
  seedData.forEach(function(p,i){
    var data={};
    var t=p.timeline||[];
    for(var k in p){if(k!=='timeline')data[k]=p[k]}
    data.createdAt=firebase.firestore.FieldValue.serverTimestamp();
    db.collection('programs').add(data).then(function(ref){
      var batch=db.batch();
      (t||[]).forEach(function(tl,j){
        batch.set(ref.collection('timeline').doc(),{day:tl.day,title:tl.title,description:tl.description,images:tl.images||[],order:j});
      });
      return batch.commit().then(function(){
        done++;
        if(done===seedData.length){
          toast('تم استعادة البرامج الافتراضية بنجاح','success');
          AdminSession.logAction('seed_default_programs','');
          loadPrograms();
        }
      });
    }).catch(function(e){toast('خطأ: '+e.message,'error')});
  });
};

/* ═══════════════════════════════════════
    8. HERO SETTINGS
    ═══════════════════════════════════════ */
var heroStatsData=[];

function initHeroForm(){
  var addStatBtn=document.getElementById('heroAddStatBtn');
  var previewBtn=document.getElementById('heroPreviewBtn');
  var form=document.getElementById('heroForm');
  if(addStatBtn)addStatBtn.addEventListener('click',addHeroStat);
  if(previewBtn)previewBtn.addEventListener('click',previewHero);
  if(form)form.addEventListener('submit',function(e){e.preventDefault();saveHeroSettings()});
}

function addHeroStat(){
  var num=parseInt(gv('heroStatNumber'))||0;
  var suffix=document.getElementById('heroStatSuffix')?document.getElementById('heroStatSuffix').value.trim():'';
  var label=document.getElementById('heroStatLabel')?document.getElementById('heroStatLabel').value.trim():'';
  if(!label||num<=0){toast('أدخل رقم صحيح وتسمية للإحصائية','error');return}
  heroStatsData.push({number:num,suffix:suffix,label:label});
  renderHeroStats();
  document.getElementById('heroStatNumber').value='';
  document.getElementById('heroStatSuffix').value='';
  document.getElementById('heroStatLabel').value='';
}

function renderHeroStats(){
  var container=document.getElementById('heroStatsAdmin');
  if(!container)return;
  if(!heroStatsData.length){
    container.innerHTML='<div class="hero-stats-empty" style="color:var(--g400);font-size:13px">لا توجد إحصائيات. أضف إحصائية جديدة.</div>';
    return;
  }
  var h='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px">';
  heroStatsData.forEach(function(s,i){
    h+='<div style="background:var(--off);border:1px solid var(--border);border-radius:var(--r-md);padding:12px 16px;display:flex;align-items:center;gap:12px">'
      +'<div style="text-align:center;min-width:60px"><div style="font-family:var(--h);font-size:22px;font-weight:800;color:var(--navy);line-height:1">'+s.number+'<span style="color:var(--gold)">'+esc(s.suffix)+'</span></div></div>'
      +'<div style="font-size:14px;color:var(--g600)">'+esc(s.label)+'</div>'
      +'<button type="button" onclick="removeAdminHeroStat('+i+')" style="width:24px;height:24px;border-radius:50%;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:var(--red);cursor:pointer;font-size:12px;line-height:24px;text-align:center;padding:0">&times;</button>'
      +'</div>';
  });
  h+='</div>';
  container.innerHTML=h;
}

window.removeAdminHeroStat=function(i){heroStatsData.splice(i,1);renderHeroStats()};

function loadHeroSettings(){
  db.collection('settings').doc('hero').get().then(function(doc){
    if(!doc.exists)return;
    var d=doc.data();
    setVal('heroBannerImage',d.bannerImage||'');
    setVal('heroLogoImage',d.logoImage||'');
    setVal('heroCompanyName',d.companyName||'');
    setVal('heroTagline1',d.tagline1||'');
    setVal('heroTagline2',d.tagline2||'');
    setVal('heroBtn1Text',d.btn1Text||'');
    setVal('heroBtn1Link',d.btn1Link||'');
    setVal('heroBtn2Text',d.btn2Text||'');
    setVal('heroBtn2Link',d.btn2Link||'');
    setVal('heroBtn3Text',d.btn3Text||'');
    setVal('heroBtn3Link',d.btn3Link||'');
    if(d.stats&&d.stats.length){
      heroStatsData=d.stats.slice();
    }else{
      heroStatsData=[];
    }
    renderHeroStats();
  }).catch(function(){});
}

function saveHeroSettings(){
  var btn=document.getElementById('heroSaveBtn');
  if(btn)btn.disabled=true;
  var bannerImage=document.getElementById('heroBannerImage')?document.getElementById('heroBannerImage').value.trim():'';
  var logoImage=document.getElementById('heroLogoImage')?document.getElementById('heroLogoImage').value.trim():'';
  if(bannerImage&&!isValidImageUrl(bannerImage)){toast('رابط الصورة الرئيسية غير صالح. استخدم JPG/PNG/WEBP','error');if(btn)btn.disabled=false;return}
  if(logoImage&&!isValidImageUrl(logoImage)){toast('رابط شعار غير صالح. استخدم JPG/PNG/WEBP/SVG','error');if(btn)btn.disabled=false;return}
  var data={
    bannerImage:bannerImage,
    logoImage:logoImage,
    companyName:gv('heroCompanyName'),
    tagline1:gv('heroTagline1'),
    tagline2:gv('heroTagline2'),
    btn1Text:gv('heroBtn1Text'),
    btn1Link:gv('heroBtn1Link'),
    btn2Text:gv('heroBtn2Text'),
    btn2Link:gv('heroBtn2Link'),
    btn3Text:gv('heroBtn3Text'),
    btn3Link:gv('heroBtn3Link'),
    stats:heroStatsData,
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  };
  db.collection('settings').doc('hero').set(data,{merge:true}).then(function(){
    toast('تم حفظ إعدادات الواجهة الرئيسية','success');
    AdminSession.logAction('hero_settings_save');
    if(btn)btn.disabled=false;
  }).catch(function(){
    toast('خطأ في الحفظ','error');
    if(btn)btn.disabled=false;
  });
}

function isValidImageUrl(url){
  var ext=url.split('?')[0].toLowerCase();
  return /\.(jpg|jpeg|png|webp|svg)(\?.*)?$/.test(ext)||/^https?:\/\/.*\.(jpg|jpeg|png|webp|svg)/i.test(ext);
}

function previewHero(){
  var bannerImage=document.getElementById('heroBannerImage')?document.getElementById('heroBannerImage').value.trim():'';
  var logoImage=document.getElementById('heroLogoImage')?document.getElementById('heroLogoImage').value.trim():'';
  var companyName=document.getElementById('heroCompanyName')?document.getElementById('heroCompanyName').value.trim():'';
  var tagline1=document.getElementById('heroTagline1')?document.getElementById('heroTagline1').value.trim():'';
  var tagline2=document.getElementById('heroTagline2')?document.getElementById('heroTagline2').value.trim():'';
  var btn1Text=document.getElementById('heroBtn1Text')?document.getElementById('heroBtn1Text').value.trim():'';
  var btn2Text=document.getElementById('heroBtn2Text')?document.getElementById('heroBtn2Text').value.trim():'';
  var btn3Text=document.getElementById('heroBtn3Text')?document.getElementById('heroBtn3Text').value.trim():'';

  var statsHtml='';
  heroStatsData.forEach(function(s){
    statsHtml+='<div style="text-align:center;padding:12px 16px;background:var(--off);border-radius:var(--r-sm)"><div style="font-size:28px;font-weight:800;color:var(--navy)">'+s.number+'<span style="color:var(--gold)">'+esc(s.suffix)+'</span></div><div style="font-size:13px;color:var(--g500)">'+esc(s.label)+'</div></div>';
  });

  var bgStyle=bannerImage?'style="background:linear-gradient(135deg,rgba(27,42,74,.88),rgba(17,29,53,.78)),url('+bannerImage+') center/cover"':'style="background:var(--navy-deep)"';
  var logoHtml=logoImage?'<div style="width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;border:2px solid rgba(255,255,255,.15)"><img src="'+logoImage+'" alt="" style="width:50px;height:50px;object-fit:contain"></div>':'';
  var html='<div '+bgStyle+' style="padding:60px 24px;border-radius:var(--r-lg);text-align:center">'
    +logoHtml
    +(companyName?'<h3 style="color:var(--white);font-size:24px;margin-bottom:8px">'+companyName+'</h3>':'')
    +(tagline1?'<p style="color:var(--gold-l);font-size:16px;margin-bottom:4px">'+esc(tagline1)+'</p>':'')
    +(tagline2?'<p style="color:rgba(255,255,255,.55);font-size:13px;margin-bottom:24px">'+esc(tagline2)+'</p>':'')
    +'<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">'
    +(btn1Text?'<span style="padding:10px 24px;background:var(--navy);color:var(--white);border-radius:var(--r-full);font-size:13px;font-weight:600">'+esc(btn1Text)+'</span>':'')
    +(btn2Text?'<span style="padding:10px 24px;border:1.5px solid rgba(255,255,255,.2);color:var(--white);border-radius:var(--r-full);font-size:13px;font-weight:600">'+esc(btn2Text)+'</span>':'')
    +(btn3Text?'<span style="padding:10px 24px;background:var(--emerald);color:var(--white);border-radius:var(--r-full);font-size:13px;font-weight:600">'+esc(btn3Text)+'</span>':'')
    +'</div></div>'
    +(statsHtml?'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:20px">'+statsHtml+'</div>':'');
  openPreviewModal(html);
}

/* ═══════════════════════════════════════
   9. PREVIEW MODAL
   ═══════════════════════════════════════ */
var previewModal=document.getElementById('previewModal');

function initPreviewModal(){
  var closeBtn=document.getElementById('previewCloseBtn');
  if(closeBtn)closeBtn.addEventListener('click',closePreviewModal);
  if(previewModal)previewModal.addEventListener('click',function(e){
    if(e.target===previewModal)closePreviewModal();
  });
}

function openPreviewModal(html){
  var body=document.getElementById('previewBody');
  if(!body||!previewModal)return;
  body.innerHTML=html;
  previewModal.classList.add('show');
  document.body.style.overflow='hidden';
}

function closePreviewModal(){
  if(previewModal)previewModal.classList.remove('show');
  document.body.style.overflow='';
}

/* ═══════════════════════════════════════
   10. COMPANY DATA
   ═══════════════════════════════════════ */
var dataForm=document.getElementById('dataForm');

function loadData(){
  db.collection('settings').doc('company').get().then(function(doc){
    if(!doc.exists)return;
    var d=doc.data();
    setVal('phone1',d.phone1);setVal('phone2',d.phone2);setVal('phone3',d.phone3);
    setVal('hours',d.hours);setVal('address',d.address);setVal('instagram',d.instagram);setVal('about',d.about);
  }).catch(function(){});
}

function setVal(id,v){var el=document.getElementById(id);if(el&&v)el.value=v}

if(dataForm)dataForm.addEventListener('submit',function(e){
  e.preventDefault();
  var btn=document.getElementById('saveBtn');
  if(btn)btn.disabled=true;
  db.collection('settings').doc('company').set({
    phone1:gv('phone1'),phone2:gv('phone2'),phone3:gv('phone3'),
    hours:gv('hours'),address:gv('address'),instagram:gv('instagram'),about:gv('about'),
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  },{merge:true}).then(function(){
    toast('تم حفظ البيانات بنجاح','success');
    AdminSession.logAction('settings_update');
    if(btn)btn.disabled=false;
  }).catch(function(){
    toast('خطأ في الحفظ','error');
    if(btn)btn.disabled=false;
  });
});

})();
