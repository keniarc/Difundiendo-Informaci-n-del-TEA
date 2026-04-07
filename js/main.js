document.addEventListener('DOMContentLoaded', () => {

  // ——————————————————————————————————
  //  NAVBAR
  // ——————————————————————————————————
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navMobileMenu = document.querySelector('.nav-mobile-menu');
  const mobileLinks = document.querySelectorAll('.nav-mobile-menu a');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Boton de regreso a arriba
    const btt = document.querySelector('.back-to-top');
    if (btt) {
      btt.classList.toggle('visible', window.scrollY > 400);
    }
  });

  // menu hamburguesa
  if (navToggle && navMobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('open');
      navMobileMenu.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // efecto bonito de x del menu hamburguesa
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle?.classList.remove('open');
      navMobileMenu?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });


  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ——————————————————————————————————
  //  carrusel
  // ——————————————————————————————————
  initCarousel();

  // ——————————————————————————————————
  //  Aparecer efecto
  // ——————————————————————————————————
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    reveals.forEach(el => revealObserver.observe(el));
  }

  // ——————————————————————————————————
  //  acordeones
  // ——————————————————————————————————
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const accordion = header.closest('.accordion');
      const isOpen = accordion.classList.contains('open');

      // si abre uno cierra otro
      const group = accordion.closest('[data-accordion-group]');
      if (group) {
        group.querySelectorAll('.accordion.open').forEach(a => a.classList.remove('open'));
      }

      if (!isOpen) accordion.classList.add('open');
    });
  });

  // ——————————————————————————————————
  //  linea de tiempo
  // ——————————————————————————————————
  document.querySelectorAll('.timeline-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.timeline-item');
      const card = item.querySelector('.timeline-card');
      const isOpen = card?.classList.contains('open');

      // Close all timeline cards
      document.querySelectorAll('.timeline-card.open').forEach(c => c.classList.remove('open'));
      document.querySelectorAll('.timeline-btn.active').forEach(b => b.classList.remove('active'));

      if (!isOpen && card) {
        card.classList.add('open');
        btn.classList.add('active');
      }
    });
  });

  // ——————————————————————————————————
  //  MODALS
  // ——————————————————————————————————
  document.querySelectorAll('[data-modal-open]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.getAttribute('data-modal-open');
      const modal = document.getElementById(targetId);
      if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  document.querySelectorAll('.modal-close, [data-modal-close]').forEach(closer => {
    closer.addEventListener('click', () => {
      const overlay = closer.closest('.modal-overlay');
      if (overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // ——————————————————————————————————
  //  BACK TO TOP
  // ——————————————————————————————————
  const btt = document.querySelector('.back-to-top');
  if (btt) {
    btt.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  //  quitar no sirve
  //  EXPERIENCE FORM
  // ——————————————————————————————————
  //const experienceForm = document.getElementById('experienceForm');
  

});

// ============================================================
//  carrusel
// ============================================================
function initCarousel() {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const progressBar = document.querySelector('.carousel-progress-bar');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');

  let current = 0;
  let totalSlides = slides.length;
  let autoplayInterval = null;
  let progressInterval = null;
  let progressWidth = 0;
  const SLIDE_DURATION = 5000; // 5 seconds
  const PROGRESS_TICK = 50;

  function goTo(index) {
    current = (index + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${current * 100}%)`;

    // Update dots
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));

    // Reset progress
    resetProgress();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function resetProgress() {
    clearInterval(progressInterval);
    progressWidth = 0;
    if (progressBar) progressBar.style.width = '0%';
    startProgress();
  }

  function startProgress() {
    progressInterval = setInterval(() => {
      progressWidth += (PROGRESS_TICK / SLIDE_DURATION) * 100;
      if (progressBar) progressBar.style.width = progressWidth + '%';
      if (progressWidth >= 100) {
        progressWidth = 0;
      }
    }, PROGRESS_TICK);
  }

  function startAutoplay() {
    autoplayInterval = setInterval(next, SLIDE_DURATION);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  // Event listeners
  if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoplay(); prev(); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoplay(); next(); startAutoplay(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { stopAutoplay(); goTo(i); startAutoplay(); });
  });

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      stopAutoplay();
      diff > 0 ? next() : prev();
      startAutoplay();
    }
  });

  // Init
  goTo(0);
  startAutoplay();
}

// ============================================================
// E
// ============================================================
  

// ============================================================
//  TOAST NOTIFICATION
// ============================================================
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 5rem;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: ${type === 'success' ? 'var(--c3)' : 'var(--c10)'};
    color: white;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    z-index: 9999;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1);
    white-space: nowrap;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}