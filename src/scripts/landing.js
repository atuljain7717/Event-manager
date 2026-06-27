// This file contains JavaScript specific to the landing page.
// It may handle animations, form submissions, or other interactive elements on the landing page.

document.addEventListener('DOMContentLoaded', () => {
  const targets = [
    document.getElementById('getStarted'),
    document.getElementById('getStartedHero'),
    document.getElementById('getStartedDemo')
  ].filter(Boolean);

  // navigate to index.html in the same folder (src/index.html)
  const APP_TARGET = 'index.html';

  targets.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // small tactile animation
      try { btn.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-4px)' }, { transform: 'translateY(0)' }], { duration: 200 }); } catch (err) {}
      // navigate to app
      window.location.href = APP_TARGET;
    });
  });

  // Smooth in-page links (demo/features)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});