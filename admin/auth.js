/* ═══════════════════════════════════════
   Auth Module - Login + Admin Verification
   Firebase Auth → UID → admins/{uid} → role check
   ═══════════════════════════════════════ */
(function(){
'use strict';

try{firebase.initializeApp(firebaseConfig)}catch(e){}
var auth = firebase.auth();
var db = firebase.firestore();

var form     = document.getElementById('loginForm');
var emailIn  = document.getElementById('email');
var passIn   = document.getElementById('password');
var loginBtn = document.getElementById('loginBtn');
var loginTxt = document.getElementById('loginText');
var loginLdr = document.getElementById('loginLoader');
var loginErr = document.getElementById('loginError');

function showError(msg){
  if(!loginErr)return;
  loginErr.textContent=msg;
  loginErr.classList.add('show');
}
function hideError(){if(loginErr)loginErr.classList.remove('show')}
function setLoading(on){
  if(loginBtn)loginBtn.disabled=on;
  if(loginTxt)loginTxt.style.display=on?'none':'inline';
  if(loginLdr)loginLdr.style.display=on?'inline-block':'none';
}

function checkAdminDoc(user){
  return db.collection('admins').doc(user.uid).get()
    .then(function(doc){
      if(doc.exists && doc.data().role === 'admin') return true;
      return false;
    });
}

if(form)form.addEventListener('submit',function(e){
  e.preventDefault();
  hideError();
  var email=emailIn.value.trim();
  var pass=passIn.value;
  if(!email||!pass){showError('يرجى ملء جميع الحقول');return}
  setLoading(true);

  auth.signInWithEmailAndPassword(email,pass)
    .then(function(cred){
      return checkAdminDoc(cred.user).then(function(isAdmin){
        if(!isAdmin){
          showError('هذا الحساب غير مخول بالدخول');
          return auth.signOut();
        }
        window.location.href='dashboard.html';
      });
    })
    .catch(function(err){
      setLoading(false);
      if(err.code==='auth/user-not-found')showError('البريد الإلكتروني غير مسجل');
      else if(err.code==='auth/wrong-password')showError('كلمة المرور غير صحيحة');
      else if(err.code==='auth/invalid-email')showError('البريد الإلكتروني غير صالح');
      else if(err.code==='auth/too-many-requests')showError('تم حظر المحاولات مؤقتاً. حاول لاحقاً');
      else showError('حدث خطأ. حاول مرة أخرى');
    });
});

/* If already logged in + admin, redirect to dashboard */
auth.onAuthStateChanged(function(user){
  if(user && window.location.pathname.indexOf('login')>-1){
    checkAdminDoc(user).then(function(isAdmin){
      if(isAdmin) window.location.href='dashboard.html';
    });
  }
});

})();