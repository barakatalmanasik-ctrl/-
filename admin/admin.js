/* ═══════════════════════════════════════
   Admin Session Manager
   Verifies UID → admins collection → role
   No Custom Claims. No Cloud Functions.
   ═══════════════════════════════════════ */
var AdminSession = (function(){
'use strict';

var _user = null;
var _adminData = null;
var _verified = false;
var _listeners = [];

function onReady(fn){ _listeners.push(fn); if(_verified) fn(_adminData); }

function getUser(){ return _user; }
function getAdmin(){ return _adminData; }
function isVerified(){ return _verified; }

function verify(user){
  return new Promise(function(resolve, reject){
    if(!user){ reject('no-user'); return; }

    var db = firebase.firestore();
    db.collection('admins').doc(user.uid).get().then(function(doc){
      if(doc.exists && doc.data().role === 'admin'){
        _user = user;
        _adminData = doc.data();
        _verified = true;
        _listeners.forEach(function(fn){ fn(_adminData); });
        resolve(_adminData);
      }else{
        _verified = false;
        reject('not-admin');
      }
    }).catch(function(err){
      reject(err);
    });
  });
}

function guard(onFail){
  firebase.auth().onAuthStateChanged(function(user){
    if(!user){
      window.location.href = 'login.html';
      return;
    }
    verify(user).catch(function(reason){
      firebase.auth().signOut();
      if(onFail) onFail(reason);
      else window.location.href = 'login.html';
    });
  });
}

function logAction(action, detail){
  if(!_user || !_verified) return;
  var db = firebase.firestore();
  db.collection('admin_logs').add({
    uid: _user.uid,
    email: _user.email,
    action: action,
    detail: detail || '',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(function(){});
}

return {
  onReady: onReady,
  getUser: getUser,
  getAdmin: getAdmin,
  isVerified: isVerified,
  verify: verify,
  guard: guard,
  logAction: logAction
};

})();