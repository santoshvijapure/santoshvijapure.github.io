/**
 * Santosh Vijapure - Portfolio Scripts
 * Handles mobile drawer, smooth scroll spy, animated counters, 
 * interactive project filters, and copy-to-clipboard toast.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMetricCounters();
  initEmailCopy();
  initProjectFilters();
  initScrollSpy();
});

/**
 * Mobile navigation toggle and scroll effects
 */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-links a');

  // Sticky header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile drawer toggle
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      const isExpanded = navLinks.classList.toggle('active');
      toggleBtn.setAttribute('aria-expanded', isExpanded);
      toggleBtn.innerHTML = isExpanded 
        ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
        : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    });

    // Close drawer on link click
    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
      });
    });
  }
}

/**
 * Animated number counters for key impact metrics
 */
function initMetricCounters() {
  const counterElements = document.querySelectorAll('.metric-number[data-target]');
  if (!counterElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetValue = parseFloat(el.getAttribute('data-target'));
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const isDecimal = targetValue % 1 !== 0;
        const duration = 1800; // ms
        const startTime = performance.now();

        function updateNumber(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const currentVal = easeProgress * targetValue;

          el.textContent = `${prefix}${isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal)}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateNumber);
          } else {
            el.textContent = `${prefix}${targetValue}${suffix}`;
          }
        }

        requestAnimationFrame(updateNumber);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  counterElements.forEach(el => observer.observe(el));
}

/**
 * Copy email to clipboard with animated toast notification
 */
function initEmailCopy() {
  const copyBoxes = document.querySelectorAll('.copy-email-box');
  const toast = document.getElementById('toastNotice');

  copyBoxes.forEach(box => {
    box.addEventListener('click', async () => {
      const email = box.getAttribute('data-email') || 'vijapuresantosh@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        showToast('Email address copied to clipboard!');
      } catch (err) {
        // Fallback
        const tempInput = document.createElement('input');
        tempInput.value = email;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast('Email address copied to clipboard!');
      }
    });
  });

  function showToast(message) {
    if (!toast) return;
    const msgEl = toast.querySelector('.toast-msg');
    if (msgEl) msgEl.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => {
      toast.classList.remove('visible');
    }, 3200);
  }
}

/**
 * Filter project case studies
 */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/**
 * Active navigation link on scroll
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPosition = window.scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}
