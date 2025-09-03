/* =========================
   Pratham Codes — script.js
   All interactive behavior:
   - Menu toggles
   - Header shrink on scroll
   - Typing effect
   - Profile parallax & ring
   - Card tilt (requestAnimationFrame)
   - IntersectionObserver reveal
   - Project filters & search
   - Lightbox for chess gallery
   - Contact form validation + toast
   - Scroll-to-top button
   ========================= */

(() => {
  'use strict';

  /* -------------------------
     Utilities
     ------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* -------------------------
     Header & Nav
     ------------------------- */
  const header = document.getElementById('site-header') || document.querySelector('.site-header');
  const navToggleButtons = $$('.nav-toggle');
  navToggleButtons.forEach(btn => {
    const targetId = btn.getAttribute('aria-controls') || 'nav-list';
    const menu = document.getElementById(targetId);
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      menu?.classList.toggle('open');
    });
  });

  // header shrink on scroll
  const onScrollHeader = () => {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('shrink');
    else header.classList.remove('shrink');
  };
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* -------------------------
     Typing effect for hero
     ------------------------- */
  class Typer {
    constructor(el) {
      this.el = el;
      this.lines = JSON.parse(el.dataset.lines || '[]');
      this.delay = 36;
      this.pause = 900;
      this.loop = 2; // loop count, then freeze
      this.init();
    }
    async init() {
      if (!this.lines.length) { this.el.textContent = ''; return; }
      let loops = 0;
      for (;;) {
        for (const line of this.lines) {
          await this.typeLine(line);
          await this.sleep(this.pause);
        }
        loops++;
        if (loops >= this.loop) {
          // show final line and stop (freeze)
          this.el.textContent = this.lines[this.lines.length - 1];
          return;
        }
        // small pause then restart
        await this.sleep(400);
        this.el.textContent = '';
      }
    }
    typeLine(txt) {
      return new Promise(resolve => {
        this.el.textContent = '';
        let i = 0;
        const tick = () => {
          if (i <= txt.length) {
            this.el.textContent = txt.slice(0, i);
            i++;
            this.timer = setTimeout(tick, this.delay + (Math.random() * 40 - 20));
          } else resolve();
        };
        tick();
      });
    }
    sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
  }
  document.querySelectorAll('.typing').forEach(node => new Typer(node));

  /* -------------------------
     Profile parallax & ring subtle movement
     ------------------------- */
  (function profileParallax() {
    const wrap = document.getElementById('profile-wrap');
    if (!wrap) return;
    const img = wrap.querySelector('.profile-img');
    const ring = wrap.querySelector('.ring');
    const max = 18;
    function move(e) {
      const r = wrap.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;
      const tx = dx * max;
      const ty = dy * max;
      img.style.transform = `translate3d(${tx}px, ${ty}px, 6px) rotate(${tx * 0.02}deg)`;
      ring.style.transform = `translate3d(${tx * -0.3}px, ${ty * -0.3}px, 0) rotate(${tx * 0.6}deg)`;
    }
    function reset() {
      img.style.transform = '';
      ring.style.transform = '';
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseleave', reset);
    wrap.addEventListener('touchstart', reset);
  })();

  /* -------------------------
     IntersectionObserver reveal
     ------------------------- */
  (function revealOnScroll() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      document.querySelectorAll('.reveal').forEach(n => n.classList.add('is-visible'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting) {
          ent.target.classList.add('is-visible');
          obs.unobserve(ent.target);
        }
      });
    }, { root: null, threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  })();

  /* -------------------------
     Pointer-based 3D tilt (project cards)
     uses requestAnimationFrame for smoothness
     ------------------------- */
  (function cardTilt() {
    const cards = $$('.project-card');
    cards.forEach(card => {
      let raf = null;
      let rect = null;
      let mouse = { x: 0, y: 0 };
      const damp = 0.08;
      let rot = { x: 0, y: 0, tx: 0, ty: 0 };

      const update = () => {
        rot.x += (rot.tx - rot.x) * damp;
        rot.y += (rot.ty - rot.y) * damp;
        card.style.transform = `perspective(900px) rotateX(${rot.x}deg) rotateY(${rot.y}deg) translateZ(0)`;
        raf = requestAnimationFrame(update);
      };

      const enter = () => {
        rect = card.getBoundingClientRect();
        card.style.willChange = 'transform';
        raf = requestAnimationFrame(update);
      };
      const leave = () => {
        cancelAnimationFrame(raf);
        raf = null;
        card.style.transform = '';
        card.style.willChange = '';
      };
      const move = (e) => {
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const cx = (x - 0.5) * 2;
        const cy = (y - 0.5) * 2;
        rot.tx = (-cy) * 6; // rotateX
        rot.ty = (cx) * 8;  // rotateY
      };

      card.addEventListener('mouseenter', enter);
      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', leave);

      // keyboard accessibility: subtle scale on focus
      card.addEventListener('focus', () => { card.style.transform = 'scale(1.02)'; });
      card.addEventListener('blur', () => { card.style.transform = ''; });
    });
  })();

  /* -------------------------
     Project filters & search
     ------------------------- */
  (function projectFilters() {
    const grid = document.getElementById('projects-grid') || document.getElementById('featured-projects') || null;
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.project-card'));
    const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
    const searchInput = document.getElementById('project-search');

    const applyFilter = (filter) => {
      cards.forEach(card => {
        const tags = (card.dataset.tags || '').toLowerCase();
        const title = (card.dataset.title || card.querySelector('.card-title')?.textContent || '').toLowerCase();
        const showByFilter = (filter === 'all') || tags.includes(filter);
        const query = searchInput?.value?.trim().toLowerCase() || '';
        const showBySearch = !query || title.includes(query) || tags.includes(query);
        if (showByFilter && showBySearch) { card.style.display = ''; }
        else { card.style.display = 'none'; }
      });
    };

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        applyFilter(f);
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const active = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        applyFilter(active);
      });
    }
  })();

  /* -------------------------
     Lightbox for gallery (chess page)
     ------------------------- */
  (function lightbox() {
    const gallery = document.getElementById('chess-gallery');
    const lightbox = document.getElementById('lightbox');
    const stage = lightbox?.querySelector('.lightbox-stage');
    const closeBtn = lightbox?.querySelector('.lightbox-close');
    const prevBtn = lightbox?.querySelector('.lightbox-prev');
    const nextBtn = lightbox?.querySelector('.lightbox-next');
    if (!gallery || !lightbox || !stage) return;
    const items = Array.from(gallery.querySelectorAll('.gallery-item img'));
    let idx = 0;

    const show = (i) => {
      idx = i;
      const img = document.createElement('img');
      img.src = items[idx].src;
      img.alt = items[idx].alt || '';
      stage.innerHTML = '';
      stage.appendChild(img);
      lightbox.classList.add('show');
      lightbox.setAttribute('aria-hidden', 'false');
      stage.focus();
    };

    const hide = () => {
      lightbox.classList.remove('show');
      lightbox.setAttribute('aria-hidden', 'true');
      stage.innerHTML = '';
    };

    gallery.addEventListener('click', (e) => {
      const target = e.target.closest('img');
      if (!target) return;
      const i = items.indexOf(target);
      if (i >= 0) show(i);
    });

    // support keyboard controls
    document.addEventListener('keydown', (e) => {
      if (lightbox.classList.contains('show')) {
        if (e.key === 'Escape') hide();
        if (e.key === 'ArrowLeft') { idx = (idx - 1 + items.length) % items.length; show(idx); }
        if (e.key === 'ArrowRight') { idx = (idx + 1) % items.length; show(idx); }
      }
    });

    closeBtn?.addEventListener('click', hide);
    prevBtn?.addEventListener('click', () => { idx = (idx - 1 + items.length) % items.length; show(idx); });
    nextBtn?.addEventListener('click', () => { idx = (idx + 1) % items.length; show(idx); });

    // make gallery items keyboard accessible
    items.forEach((img, i) => {
      img.setAttribute('tabindex', '0');
      img.addEventListener('keydown', (e) => { if (e.key === 'Enter') show(i); });
    });

    // click outside to close
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) hide();
    });
  })();

  /* -------------------------
     Contact form validation + toast
     ------------------------- */
  (function contactForm() {
    const form = document.getElementById('contact-form');
    const toastRoot = document.getElementById('toast-root');

    function createToast(message, duration = 4200) {
      const t = document.createElement('div');
      t.className = 'toast';
      t.textContent = message;
      toastRoot.appendChild(t);
      let timer = setTimeout(() => t.remove(), duration);
      t.addEventListener('mouseenter', () => clearTimeout(timer));
      t.addEventListener('mouseleave', () => timer = setTimeout(() => t.remove(), 2400));
    }

    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // simple validation
      const name = form.querySelector('#name');
      const email = form.querySelector('#email');
      const message = form.querySelector('#message');
      let ok = true;
      [name, email, message].forEach(inp => inp.parentElement.querySelector('.field-error').textContent = '');
      if (!name.value.trim()) { name.parentElement.querySelector('.field-error').textContent = 'Please enter your name.'; ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { email.parentElement.querySelector('.field-error').textContent = 'Please enter a valid email.'; ok = false; }
      if (!message.value.trim() || message.value.trim().length < 12) { message.parentElement.querySelector('.field-error').textContent = 'Please write a short message (12+ chars).'; ok = false; }
      if (!ok) return;
      // fake send
      createToast('Message queued — thank you! (This is a front-end demo)');
      form.reset();
    });
  })();

  /* -------------------------
     Scroll to top button
     ------------------------- */
  (function scrollTop() {
    const btn = document.getElementById('to-top');
    if (!btn) return;
    const showAt = 400;
    window.addEventListener('scroll', () => {
      if (window.scrollY > showAt) btn.classList.add('show');
      else btn.classList.remove('show');
    }, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      btn.blur();
    });
  })();

  /* -------------------------
     Set dynamic year(s)
     ------------------------- */
  document.getElementById('year')?.textContent = new Date().getFullYear();
  document.getElementById('year-2')?.textContent = new Date().getFullYear();
  document.getElementById('year-3')?.textContent = new Date().getFullYear();
  document.getElementById('year-4')?.textContent = new Date().getFullYear();

  /* -------------------------
     Small enhancement: keyboard trap for open nav on mobile
     ------------------------- */
  (function mobileNavTrap() {
    const navLists = Array.from(document.querySelectorAll('.nav-list'));
    navLists.forEach(list => {
      list.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          list.classList.remove('open');
          const toggle = document.querySelector(`.nav-toggle[aria-controls="${list.id}"]`);
          toggle?.setAttribute('aria-expanded', 'false');
          toggle?.focus();
        }
      });
    });
  })();

  /* -------------------------
     End script
     ------------------------- */
})();
