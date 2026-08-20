/* ==========================================================================
   KNOWTOHIRE MASTER UI MOODBOARD V2 INTERACTIVE APP
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMoodboardNav();
  initCommandPalette();
  initInteractiveDemos();
});

// Moodboard Section Navigation Across All 11 Sections
function initMoodboardNav() {
  const navButtons = document.querySelectorAll('.moodboard-nav-btn');
  const sectionContainers = document.querySelectorAll('.moodboard-section-content');

  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetSection = button.getAttribute('data-section');

      // Update button active state
      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // If 'all' is selected, show all sections
      if (targetSection === 'all') {
        sectionContainers.forEach(sec => sec.style.display = 'block');
        return;
      }

      // Show targeted section, hide others
      sectionContainers.forEach(sec => {
        if (sec.id === `section-${targetSection}`) {
          sec.style.display = 'block';
        } else {
          sec.style.display = 'none';
        }
      });

      // Scroll smoothly to top of section content
      const targetElement = document.getElementById(`section-${targetSection}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Command Palette (Cmd + K) Trigger & Modal Logic
function initCommandPalette() {
  const backdrop = document.getElementById('cmd-palette-backdrop');
  const triggerBtn = document.getElementById('cmd-palette-trigger');
  const closeBtn = document.getElementById('cmd-palette-close');
  const searchInput = document.getElementById('cmd-search-input');

  function openPalette() {
    if (backdrop) {
      backdrop.classList.add('open');
      if (searchInput) searchInput.focus();
    }
  }

  function closePalette() {
    if (backdrop) backdrop.classList.remove('open');
  }

  if (triggerBtn) triggerBtn.addEventListener('click', openPalette);
  if (closeBtn) closeBtn.addEventListener('click', closePalette);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K & Escape)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openPalette();
    }
    if (e.key === 'Escape') {
      closePalette();
    }
  });

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closePalette();
    });
  }
}

// Interactive Component Demonstrations
function initInteractiveDemos() {
  // Button Loading State Toggle Demo
  const loadBtnDemo = document.getElementById('btn-loading-demo');
  if (loadBtnDemo) {
    loadBtnDemo.addEventListener('click', () => {
      loadBtnDemo.disabled = true;
      const originalText = loadBtnDemo.innerHTML;
      loadBtnDemo.innerHTML = `
        <svg class="pulse-dot" style="animation: spin 1s linear infinite;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="10"></circle>
        </svg>
        <span>Processing Action...</span>
      `;
      setTimeout(() => {
        loadBtnDemo.disabled = false;
        loadBtnDemo.innerHTML = originalText;
      }, 2000);
    });
  }

  // Candidate Application Step Switcher Demo
  const trackerSteps = document.querySelectorAll('.tracker-step-item');
  trackerSteps.forEach(step => {
    step.addEventListener('click', () => {
      trackerSteps.forEach(s => s.classList.remove('active', 'completed'));
      let current = step;
      let prev = current.previousElementSibling;
      current.classList.add('active');
      while (prev) {
        prev.classList.add('completed');
        prev = prev.previousElementSibling;
      }
    });
  });

  // Employer Applicant Quick-View Drawer Demo
  const openDrawerBtns = document.querySelectorAll('.btn-open-applicant-drawer');
  const drawerOverlay = document.getElementById('applicant-drawer-overlay');
  const closeDrawerBtn = document.getElementById('close-applicant-drawer');

  if (openDrawerBtns && drawerOverlay) {
    openDrawerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        drawerOverlay.style.display = 'flex';
      });
    });
  }

  if (closeDrawerBtn && drawerOverlay) {
    closeDrawerBtn.addEventListener('click', () => {
      drawerOverlay.style.display = 'none';
    });
  }
}
