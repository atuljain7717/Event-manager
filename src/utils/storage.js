// Simple storage helpers exposed as globals.
(function(){
  function saveToLocalStorage(key, value){
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch(e){ console.error('saveToLocalStorage', e); return false; }
  }
  function getFromLocalStorage(key){
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch(e){ console.error('getFromLocalStorage', e); return null; }
  }
  function removeFromLocalStorage(key){
    try { localStorage.removeItem(key); return true; } catch(e){ console.error('removeFromLocalStorage', e); return false; }
  }
  function clearLocalStorage(){ try { localStorage.clear(); return true; } catch(e){ console.error('clearLocalStorage', e); return false; } }

  window.saveToLocalStorage = saveToLocalStorage;
  window.getFromLocalStorage = getFromLocalStorage;
  window.removeFromLocalStorage = removeFromLocalStorage;
  window.clearLocalStorage = clearLocalStorage;
})();