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
  loadTrips();
  initFilters();
  initModal();
  initPreviewModal();
  initServiceForm();
  initGalleryForm();
  initTripForm();
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

  db.collection('trips').get().then(function(snap){
    setStat('statTrips',snap.size);
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
   7. TRIPS CRUD
   ═══════════════════════════════════════ */
var tripList=document.getElementById('tripList');
var allTripsData=[];
var tripUploadFile=null;

function initTripForm(){
  var addBtn=document.getElementById('addTripBtn');
  var form=document.getElementById('tripForm');
  var uploadZone=document.getElementById('tripUploadZone');
  var uploadInput=document.getElementById('tripUploadInput');
  var previewBtn=document.getElementById('tripPreviewBtn');
  if(addBtn)addBtn.addEventListener('click',function(){
    form.style.display=form.style.display==='none'?'block':'none';
    document.getElementById('tripEditId').value='';
    form.reset();
    document.getElementById('tripPreview').style.display='none';
    tripUploadFile=null;
  });
  if(form)form.addEventListener('submit',function(e){e.preventDefault();saveTrip()});
  if(previewBtn)previewBtn.addEventListener('click',function(){previewTrip()});
  if(uploadZone&&uploadInput){
    uploadZone.addEventListener('click',function(){uploadInput.click()});
    uploadZone.addEventListener('dragover',function(e){e.preventDefault();this.classList.add('dragover')});
    uploadZone.addEventListener('dragleave',function(){this.classList.remove('dragover')});
    uploadZone.addEventListener('drop',function(e){
      e.preventDefault();this.classList.remove('dragover');
      if(e.dataTransfer.files[0])handleTripFile(e.dataTransfer.files[0]);
    });
    uploadInput.addEventListener('change',function(){if(this.files[0])handleTripFile(this.files[0])});
  }
}

function handleTripFile(file){
  if(!file.type.startsWith('image/')){toast('الملف ليس صورة','error');return}
  tripUploadFile=file;
  var reader=new FileReader();
  reader.onload=function(e){
    var img=document.getElementById('tripPreview');
    img.src=e.target.result;
    img.style.display='block';
  };
  reader.readAsDataURL(file);
}

function loadTrips(){
  if(!tripList)return;
  db.collection('trips').orderBy('order','asc').get()
    .then(function(snap){
      allTripsData=[];
      snap.docs.forEach(function(doc){allTripsData.push({id:doc.id,data:doc.data()})});
      renderTrips();
    }).catch(function(){tripList.innerHTML='<div class="comment-empty">خطأ</div>'});
}

function renderTrips(){
  if(!tripList)return;
  if(!allTripsData.length){tripList.innerHTML='<div class="comment-empty">لا توجد رحلات بعد</div>';return}
  var html='';
  allTripsData.forEach(function(item){
    var d=item.data;
    var st=d.status==='active'?'<span class="status-approved">نشط</span>':'<span class="status-rejected">غير نشط</span>';
    var tripSt=d.tripStatus==='available'?'متاح':d.tripStatus==='full'?'مكتمل':'غير متاح';
    html+='<div class="comment-item" data-id="'+item.id+'">'
      +'<div class="comment-meta"><span class="comment-author">'+esc(d.name||'')+'</span>'+st
      +'<span class="comment-service">'+esc(tripSt)+'</span>'
      +(d.price?'<span class="comment-date">'+esc(d.price)+'</span>':'')
      +'</div>'
      +(d.program?'<p class="comment-text">'+esc(d.program).substring(0,150)+(d.program.length>150?'...':'')+'</p>':'')
      +'<div class="comment-actions">'
      +'<button class="btn-edit" onclick="editTrip(\''+item.id+'\')">تعديل</button>'
      +'<button class="btn-delete" onclick="deleteTrip(\''+item.id+'\')">حذف</button>'
      +'</div></div>';
  });
  tripList.innerHTML=html;
}

function saveTrip(){
  var editId=document.getElementById('tripEditId').value;
  var imageUrl=gv('tripImageUrl');
  if(!imageUrl&&!tripUploadFile&&!editId){toast('ارفع صورة أو أدخل رابط','error');return}

  function doSave(url){
    var data={
      name:gv('tripName'),
      duration:gv('tripDuration'),
      departureDate:gv('tripDate'),
      price:gv('tripPrice'),
      hotel:gv('tripHotel'),
      program:gv('tripProgram'),
      seatsLeft:parseInt(gv('tripSeats'))||0,
      tripStatus:gv('tripTripStatus'),
      imageUrl:url||imageUrl,
      order:parseInt(gv('tripOrder'))||0,
      status:gv('tripStatus'),
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    };
    if(!data.name){toast('أدخل اسم الرحلة','error');return}
    var p;
    if(editId){p=db.collection('trips').doc(editId).update(data)}
    else{p=db.collection('trips').add(data)}
    p.then(function(){
      toast(editId?'تم التحديث':'تمت الإضافة','success');
      AdminSession.logAction('trip_save',editId||'new');
      document.getElementById('tripForm').style.display='none';
      loadTrips();loadAllStats();
    }).catch(function(){toast('خطأ في الحفظ','error')});
  }

  if(tripUploadFile){
    var path='trips/'+Date.now()+'_'+tripUploadFile.name;
    storage.ref(path).put(tripUploadFile).then(function(){
      return storage.ref(path).getDownloadURL();
    }).then(function(url){doSave(url)}).catch(function(){toast('خطأ في رفع الصورة','error')});
  }else{
    doSave(null);
  }
}

window.editTrip=function(id){
  var item=allTripsData.find(function(t){return t.id===id});
  if(!item)return;
  var d=item.data;
  document.getElementById('tripEditId').value=id;
  document.getElementById('tripName').value=d.name||'';
  document.getElementById('tripDuration').value=d.duration||'';
  document.getElementById('tripDate').value=d.departureDate||'';
  document.getElementById('tripPrice').value=d.price||'';
  document.getElementById('tripHotel').value=d.hotel||'';
  document.getElementById('tripProgram').value=d.program||'';
  document.getElementById('tripSeats').value=d.seatsLeft||0;
  document.getElementById('tripTripStatus').value=d.tripStatus||'available';
  document.getElementById('tripImageUrl').value=d.imageUrl||'';
  document.getElementById('tripOrder').value=d.order||0;
  document.getElementById('tripStatus').value=d.status||'active';
  if(d.imageUrl){
    var img=document.getElementById('tripPreview');
    img.src=d.imageUrl;img.style.display='block';
  }
  document.getElementById('tripForm').style.display='block';
  tripUploadFile=null;
};

window.deleteTrip=function(id){
  if(!confirm('هل أنت متأكد من حذف هذه الرحلة؟'))return;
  db.collection('trips').doc(id).delete().then(function(){
    toast('تم الحذف','success');
    AdminSession.logAction('trip_delete',id);
    loadTrips();loadAllStats();
  }).catch(function(){toast('خطأ في الحذف','error')});
};

function previewTrip(){
  var html='<div class="preview-trip-card">'
    +'<h3>'+esc(gv('tripName'))+'</h3>'
    +'<p>المدة: '+esc(gv('tripDuration'))+'</p>'
    +'<p>التاريخ: '+esc(gv('tripDate'))+'</p>'
    +'<p>السعر: '+esc(gv('tripPrice'))+'</p>'
    +'<p>الفندق: '+esc(gv('tripHotel'))+'</p>'
    +'<p>المقاعد: '+esc(gv('tripSeats'))+'</p>'
    +'<p>الحالة: '+esc(gv('tripTripStatus'))+'</p>'
    +(gv('tripProgram')?'<p>'+esc(gv('tripProgram'))+'</p>':'')
    +'</div>';
  openPreviewModal(html);
}

/* ═══════════════════════════════════════
   8. PREVIEW MODAL
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
   9. COMPANY DATA
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
