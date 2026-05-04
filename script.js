/* ============================================
   GODREJ FOREST ESTATE — Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- AOS scroll animations ---------- */
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.AOS) {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
      disable: () => isTouch || reduceMotion || window.innerWidth < 992
    });
  }

  /* ---------- Navbar tracks top-bar edge while scrolling (rAF-throttled) ---------- */
  const navbar = document.querySelector('.custom-navbar');
  const topBar = document.querySelector('.top-bar');
  const root = document.documentElement;
  let scrollTicking = false;
  const updateNavbar = () => {
    if (navbar) {
      const sy = window.scrollY;
      const topBarH = (topBar && window.innerWidth >= 992) ? topBar.offsetHeight : 0;
      // Navbar's top tracks the top-bar's receding bottom edge — no gap can form.
      root.style.setProperty('--nav-top', Math.max(0, topBarH - sy) + 'px');
      if (sy > 60) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    }
    scrollTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(updateNavbar);
      scrollTicking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateNavbar, { passive: true });
  updateNavbar();

  /* ---------- Smooth scroll & close mobile nav on click ---------- */
  const navCollapse = document.getElementById('mainNav');
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navCollapse && navCollapse.classList.contains('show')) {
        const collapse = bootstrap.Collapse.getInstance(navCollapse) || new bootstrap.Collapse(navCollapse, { toggle: false });
        collapse.hide();
      }
    });
  });

  /* ---------- Phone input — digits only ---------- */
  document.querySelectorAll('input[type="tel"]').forEach(inp => {
    inp.addEventListener('input', e => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });
  });

  /* ---------- Form submission ---------- */
  const successToastEl = document.getElementById('successToast');
  const successToast = successToastEl ? new bootstrap.Toast(successToastEl, { delay: 4500 }) : null;
  const enquiryModalEl = document.getElementById('enquiryModal');

  document.querySelectorAll('.enquiry-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';

      // Simulated submission — replace with real endpoint when integrated
      setTimeout(() => {
        console.log('[Enquiry submitted]', data);
        submitBtn.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Submitted';

        // Close modal if this form is inside it
        if (form.dataset.formId === 'modal' && enquiryModalEl) {
          const modalInstance = bootstrap.Modal.getInstance(enquiryModalEl);
          if (modalInstance) modalInstance.hide();
        }

        if (successToast) successToast.show();

        setTimeout(() => {
          form.reset();
          form.classList.remove('was-validated');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHtml;
        }, 1500);
      }, 900);
    });
  });

  /* ---------- Auto-open enquiry modal every 15 seconds ---------- */
  if (enquiryModalEl) {
    const modalInstance = bootstrap.Modal.getOrCreateInstance(enquiryModalEl);
    setInterval(() => {
      // Skip if modal already open or another modal is active
      if (document.body.classList.contains('modal-open')) return;
      modalInstance.show();
    }, 15000);
  }

  /* ---------- Exit-intent modal (desktop only) ---------- */
  if (!isTouch) {
    let exitFired = false;
    document.addEventListener('mouseleave', e => {
      if (exitFired || !enquiryModalEl) return;
      if (e.clientY < 0 && !sessionStorage.getItem('gfe_exit_shown')) {
        exitFired = true;
        sessionStorage.setItem('gfe_exit_shown', '1');
        bootstrap.Modal.getOrCreateInstance(enquiryModalEl).show();
      }
    });
  }
});
