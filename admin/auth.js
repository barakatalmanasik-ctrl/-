/* ═══════════════════════════════════════
   Auth Module - Login / Logout
   ═══════════════════════════════════════ */
(function(){
'use strict';

firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();

/* ── Login ── */
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

if(form)form.addEventListener('submit',function(e){
  e.preventDefault();
  hideError();
  var email=emailIn.value.trim();
  var pass=passIn.value;
  if(!email||!pass){showError('يرجى ملء جميع الحقول');return}
  setLoading(true);
  auth.signInWithEmailAndPassword(email,pass)
    .then(function(cred){
      if(cred.user.email!==ADMIN_EMAIL){
        showError('هذا الحساب غير مخول بالدخول');
        return auth.signOut();
      }
      window.location.href='dashboard.html';
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

/* ── If already logged in, redirect to dashboard ── */
auth.onAuthStateChanged(function(user){
  if(user && user.email===ADMIN_EMAIL && window.location.pathname.indexOf('login')>-1){
    window.location.href='dashboard.html';
  }
});

})();
