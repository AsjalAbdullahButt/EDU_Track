document.addEventListener('DOMContentLoaded', function(){
  try{
    const favHref = '/static/Images/EDU-Logo.png';
    const existing = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (existing) {
      existing.href = favHref;
      return;
    }
    const l = document.createElement('link');
    l.rel = 'icon';
    l.href = favHref;
    l.type = 'image/png';
    document.head.appendChild(l);
  } catch(e){ console.warn('favicon inject failed', e); }
});