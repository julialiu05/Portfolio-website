    // ============================================
    // WCAG: Keyboard support for role="button" elements
    // ============================================
    document.addEventListener('keydown', function(e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute('role') === 'button') {
        e.preventDefault();
        e.target.click();
      }
    });

    // ============================================
    // CHATGPT-STYLE: Hide overlays immediately
    // ============================================

    (function() {
      const chatgptStyle = document.querySelector('.desktop-app.chatgpt-style');

      // Immediately hide boot screen and other overlays
      const bootScreen = document.getElementById('bootScreen');
      const nameCard = document.querySelector('.name-card-window');
      const phone = document.querySelector('.phone');

      if (bootScreen) {
        bootScreen.style.display = 'none';
        bootScreen.classList.add('hidden');
      }
      if (nameCard) nameCard.style.display = 'none';
      if (phone) phone.style.display = 'none';

      // Always start in AI Mode
      localStorage.setItem('portfolio-mode', 'ai');
      if (chatgptStyle) {
        chatgptStyle.style.display = 'flex';
        chatgptStyle.style.opacity = '1';
        chatgptStyle.style.visibility = 'visible';
      }
    })();

    // ============================================
    // CURSOR-FOLLOWING WARM GRADIENT
    // ============================================

    const cursorGlow = document.getElementById('cursorGlow');

    if (cursorGlow) {
      document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
      });

      // Hide glow when mouse leaves window
      document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
      });

      document.addEventListener('mouseenter', () => {
        cursorGlow.style.opacity = '1';
      });
    }

    // ============================================
    // FLOATING ASSETS TOGGLE
    // ============================================

    const assetsToggle = document.getElementById('assetsToggle');
    const floatingAssets = document.getElementById('floatingAssets');

    if (assetsToggle && floatingAssets) {
      assetsToggle.addEventListener('click', () => {
        const isVisible = floatingAssets.classList.contains('visible');

        if (isVisible) {
          // Hide assets
          floatingAssets.classList.remove('visible');
          assetsToggle.classList.remove('active');
          assetsToggle.title = 'Show decorations';
        } else {
          // Show assets
          floatingAssets.classList.add('visible');
          assetsToggle.classList.add('active');
          assetsToggle.title = 'Hide decorations';
        }
      });
    }

    // ============================================
    // FULLPAGE SCROLL - Strict page-by-page navigation
    // ============================================

    let currentSnapIndex = 0;
    let isScrolling = false;
    let scrollTimeout = null;
    let snapSections = [];
    let scrollAccumulator = 0; // Accumulate scroll to require more effort
    const SCROLL_COOLDOWN = 1000; // ms lockout - 1 second between transitions
    const SCROLL_DURATION = 850; // ms - smooth, controlled transition
    const SCROLL_THRESHOLD = 5; // Almost instant trigger

    function initFullpageScroll() {
      // Build array of snap targets
      snapSections = [];

      // Hero spacer is section 0
      const heroSpacer = document.querySelector('.hero-spacer');
      if (heroSpacer) {
        snapSections.push({ element: heroSpacer, index: 0, type: 'hero' });
      }

      // Project sections
      const projectSections = document.querySelectorAll('.project-scroll-section');
      projectSections.forEach((section, i) => {
        snapSections.push({ element: section, index: i + 1, type: 'project' });
      });

      // Wheel event - capture and prevent default, then navigate
      window.addEventListener('wheel', handleWheel, { passive: false });

      // Touch support for mobile
      let touchStartY = 0;
      window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      window.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const delta = touchStartY - touchEndY;

        if (Math.abs(delta) > 50) { // Minimum swipe distance
          if (delta > 0) {
            navigateToSection(currentSnapIndex + 1);
          } else {
            navigateToSection(currentSnapIndex - 1);
          }
        }
      }, { passive: true });

      // Keyboard navigation
      window.addEventListener('keydown', (e) => {
        // Let input fields handle keys naturally (typing in input)
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
          e.preventDefault();
          navigateToSection(currentSnapIndex + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
          e.preventDefault();
          navigateToSection(currentSnapIndex - 1);
        } else if (e.key === 'Home') {
          e.preventDefault();
          navigateToSection(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          navigateToSection(snapSections.length - 1);
        }
      });

      // Initial position
      navigateToSection(0, false);

      // Update animations
      updateScrollAnimations(0, 0);
    }

    function handleWheel(e) {
      e.preventDefault();
      e.stopPropagation();

      // Blocked during transition
      if (isScrolling) return;

      // Accumulate scroll delta - requires deliberate scrolling
      scrollAccumulator += e.deltaY;

      // Only trigger when accumulated scroll exceeds threshold
      const ACCUMULATOR_THRESHOLD = 80; // Requires more scroll effort

      if (scrollAccumulator > ACCUMULATOR_THRESHOLD) {
        scrollAccumulator = 0; // Reset
        navigateToSection(currentSnapIndex + 1); // Next page
      } else if (scrollAccumulator < -ACCUMULATOR_THRESHOLD) {
        scrollAccumulator = 0; // Reset
        navigateToSection(currentSnapIndex - 1); // Previous page
      }
    }

    function navigateToSection(index, animate = true) {
      // Reset scroll accumulator to prevent double-triggers
      scrollAccumulator = 0;

      // Wrap around for continuous scrolling
      if (index < 0) index = snapSections.length - 1; // Go to last section
      if (index >= snapSections.length) index = 0; // Go to first section

      // Don't navigate if already there
      if (index === currentSnapIndex && animate) return;

      isScrolling = true;
      const previousIndex = currentSnapIndex;
      currentSnapIndex = index;

      const section = snapSections[index];
      if (!section) return;
      const targetY = section.element.offsetTop;

      // Animate scroll position
      if (animate) {
        smoothScrollTo(targetY, SCROLL_DURATION);
      } else {
        window.scrollTo({ top: targetY, behavior: 'instant' });
      }

      // Update card visibility
      updateCardVisibility(index);

      // Update nav
      updateProjectNav(index);

      // Update body class for nav visibility
      if (index > 0) {
        document.body.classList.add('viewing-projects');
      } else {
        document.body.classList.remove('viewing-projects');
      }

      // Reset scrolling flag after cooldown
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, SCROLL_COOLDOWN);
    }

    // Close project slide and return to hero
    function closeProjectSlide() {
      navigateToSection(0);
    }

    // Make it globally accessible
    window.closeProjectSlide = closeProjectSlide;

    function smoothScrollTo(targetY, duration) {
      const startY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const diff = targetY - startY;
      const startTime = performance.now();

      if (diff === 0) return;

      function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Back easing with overshoot - creates a satisfying snap
        // Overshoots the target slightly then settles back
        const overshoot = 1.7; // Noticeable but controlled snap-back
        const c3 = overshoot + 1;
        const eased = 1 + c3 * Math.pow(progress - 1, 3) + overshoot * Math.pow(progress - 1, 2);

        const newY = startY + diff * eased;

        window.scrollTo({ top: newY, behavior: 'instant' });

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }

    function updateCardVisibility(currentIndex) {
      const projectSections = document.querySelectorAll('.project-scroll-section');

      projectSections.forEach((section, i) => {
        const card = section.querySelector('.stacking-window-card');
        if (!card) return;

        const projectIndex = i + 1; // Projects are 1-indexed (hero is 0)

        if (projectIndex <= currentIndex) {
          // Show cards for current section and all previous sections
          card.classList.add('visible');
          // Only the topmost card gets the shadow (prevents stacking shadows)
          if (projectIndex === currentIndex) {
            card.classList.add('top-card');
          } else {
            card.classList.remove('top-card');
          }
        } else {
          // Hide cards for sections we haven't reached yet
          card.classList.remove('visible');
          card.classList.remove('top-card');
        }
      });
    }

    // Navigate to specific project (for programmatic navigation)
    function snapToProject(index) {
      navigateToSection(index);
    }

    // Expose for external use
    window.navigateToSection = navigateToSection;

    // ============================================
    // SCROLL-TRIGGERED ANIMATIONS
    // ============================================

    function updateScrollAnimations(scroll, velocity) {
      const vh = window.innerHeight;

      // Update project cards visibility
      // Cards become visible when their section is snapped to or scrolled past
      // Once visible, they STAY visible forever (never removed)
      const sections = document.querySelectorAll('.project-scroll-section');
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top;
        const card = section.querySelector('.stacking-window-card');

        // Trigger when section top is within viewport (generous for scroll-snap)
        // Triggers as soon as the section enters the viewport from below
        if (sectionTop < vh && card) {
          // Add visible class - card slides up and STAYS forever
          card.classList.add('visible');
        }
        // NOTE: We never remove 'visible' - cards stay in place permanently
      });

      // Hero stays completely fixed - no parallax movement

      // Floating decorations parallax
      const decorations = document.querySelectorAll('.floating-decor');
      decorations.forEach((decor, i) => {
        const speed = 0.02 + (i * 0.01);
        const yOffset = scroll * speed;
        decor.style.setProperty('--scroll-y', `${yOffset}px`);
      });
    }

    // ============================================
    // SCROLL-TO HELPER
    // ============================================

    function scrollToElement(target, options = {}) {
      if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el) {
          const index = snapSections.findIndex(s => s.element === el);
          if (index !== -1) navigateToSection(index);
        }
      } else if (target instanceof Element) {
        const index = snapSections.findIndex(s => s.element === target);
        if (index !== -1) navigateToSection(index);
      } else if (typeof target === 'number') {
        // Find closest section
        const vh = window.innerHeight;
        const index = Math.round(target / vh);
        navigateToSection(index);
      }
    }

    // ============================================
    // HERO SCALING FUNCTIONALITY
    // ============================================

    // Scale the hero section's scaled-wrapper to fit viewport
    function scaleHero() {
      const scaledWrapper = document.getElementById('scaledWrapper');
      if (!scaledWrapper) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const baseWidth = 1440;
      const baseHeight = 900;

      const scaleX = viewportWidth / baseWidth;
      const scaleY = viewportHeight / baseHeight;
      const scale = Math.min(scaleX, scaleY, 1) * 0.95;

      scaledWrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }

    // ============================================
    // SCROLL-BASED PROJECT NAV
    // ============================================
    let currentProject = 0;
    let projectNavItems = null;
    let projectSections = null;

    function initProjectNav() {
      // Query elements after DOM is ready
      projectNavItems = document.querySelectorAll('.project-nav-item');
      projectSections = document.querySelectorAll('.project-scroll-section');

      // Set up click handlers for nav items
      projectNavItems.forEach(item => {
        item.addEventListener('click', () => {
          const projectIndex = parseInt(item.dataset.project);
          navigateToSection(projectIndex); // Use fullpage navigation
        });
      });

      // Set initial active state (home)
      updateProjectNav(0);
    }

    function updateActiveProject(projectIndex) {
      if (currentProject === projectIndex) return;
      currentProject = projectIndex;

      // Update nav items
      projectNavItems.forEach(item => {
        const itemProject = parseInt(item.dataset.project);
        item.classList.toggle('active', itemProject === projectIndex);
      });
    }

    // Scroll to projects section (for "View Projects" button)
    window.scrollToProjects = function() {
      navigateToSection(1); // Navigate to first project
    }

    // ============================================
    // SIDE NAVIGATION (Left side with labels)
    // ============================================

    function createSideNav() {
      // Create side nav container
      const sideNav = document.createElement('nav');
      sideNav.className = 'side-nav';
      sideNav.id = 'sideNav';

      // Navigation items
      const navItems = [
        { index: 0, label: 'Home', icon: '🏠' },
        { index: 1, label: 'Tech Tree', icon: '01' },
        { index: 2, label: 'Claude Flow', icon: '02' },
        { index: 3, label: 'Project 3', icon: '03' },
        { index: 4, label: 'Project 4', icon: '04' }
      ];

      navItems.forEach(item => {
        const navItem = document.createElement('div');
        navItem.className = 'side-nav-item';
        navItem.dataset.index = item.index;
        navItem.innerHTML = `
          <span class="side-nav-icon">${item.icon}</span>
          <span class="side-nav-label">${item.label}</span>
          <span class="side-nav-line"></span>
        `;
        navItem.addEventListener('click', () => {
          navigateToSection(item.index);
        });
        sideNav.appendChild(navItem);
      });

      // Add progress indicator
      const progress = document.createElement('div');
      progress.className = 'side-nav-progress';
      progress.innerHTML = '<div class="side-nav-progress-fill"></div>';
      sideNav.appendChild(progress);

      document.body.appendChild(sideNav);
    }

    function updateSideNav(index) {
      const items = document.querySelectorAll('.side-nav-item');
      items.forEach((item, i) => {
        item.classList.toggle('active', i === index);
        item.classList.toggle('passed', i < index);
      });

      // Update progress bar
      const progressFill = document.querySelector('.side-nav-progress-fill');
      if (progressFill && snapSections.length > 1) {
        const percent = (index / (snapSections.length - 1)) * 100;
        progressFill.style.height = `${percent}%`;
      }
    }

    function updateProjectNav(index) {
      const items = document.querySelectorAll('.project-nav-item');
      items.forEach(item => {
        const projectIndex = parseInt(item.dataset.project);
        item.classList.toggle('active', projectIndex === index);
      });
    }

    // ============================================
    // CHAT THREAD ENTRANCE ANIMATION
    // ============================================
    function runChatThreadAnimation() {
      var savedMode = localStorage.getItem('portfolio-mode') || 'ai';
      if (savedMode !== 'ai') return; // Only animate in AI mode

      // Elements to animate (typing indicators start display:none in HTML)
      var ids = ['chatUserHello', 'chatAiGreeting', 'chatAiProjects'];

      // Step 1: Hide all message elements immediately via JS
      ids.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
          el.style.opacity = '0';
          el.style.transform = 'translateY(12px)';
        }
      });

      // Step 2: Reveal in sequence
      // 400ms — User "Hello!" slides in
      setTimeout(function() {
        var el = document.getElementById('chatUserHello');
        if (el) {
          el.style.transition = 'opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      }, 400);

      // 900ms — Typing dots appear
      setTimeout(function() {
        var el = document.getElementById('chatTyping1');
        if (el) {
          el.style.display = '';
          el.style.opacity = '0';
          // Force reflow so transition works
          void el.offsetWidth;
          el.style.transition = 'opacity 0.3s ease';
          el.style.opacity = '1';
        }
      }, 900);

      // 1800ms — Typing dots hide, AI greeting container fades in, typewriter starts
      setTimeout(function() {
        var typing = document.getElementById('chatTyping1');
        if (typing) typing.style.display = 'none';

        var greeting = document.getElementById('chatAiGreeting');
        if (greeting) {
          greeting.style.transition = 'opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)';
          greeting.style.opacity = '1';
          greeting.style.transform = 'translateY(0)';
        }

        // Typewriter streams the greeting text
        var textEl = document.getElementById('greetingText');
        if (textEl && window._greetingFullText) {
          var fullText = window._greetingFullText;
          var i = 0;
          var interval = setInterval(function() {
            if (i < fullText.length) {
              textEl.textContent += fullText.charAt(i);
              i++;
            } else {
              clearInterval(interval);
              // Restore original HTML with formatting
              if (window._greetingFullHTML) {
                textEl.innerHTML = window._greetingFullHTML;
              }
              showTypingThenProjects();
            }
          }, 20);
        }
      }, 1800);

      // Called after typewriter finishes
      function showTypingThenProjects() {
        // Show second typing dots
        var typing2 = document.getElementById('chatTyping2');
        if (typing2) {
          typing2.style.display = '';
          typing2.style.opacity = '0';
          void typing2.offsetWidth;
          typing2.style.transition = 'opacity 0.3s ease';
          typing2.style.opacity = '1';
        }

        // After a beat, hide dots and stagger cards in one by one
        setTimeout(function() {
          if (typing2) typing2.style.display = 'none';

          var projects = document.getElementById('chatAiProjects');
          if (projects) {
            projects.style.opacity = '1';
            projects.style.transform = 'translateY(0)';
          }

          // Stagger each card
          var cards = document.querySelectorAll('.project-preview-card');
          cards.forEach(function(card, i) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'none';
            setTimeout(function() {
              card.style.transition = 'opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, i * 100);
          });

          // Signal to gravity.js that the greeting + cards have finished their entrance.
          // Delay matches the last card's stagger + its 450ms transition.
          var lastCardFinish = cards.length * 100 + 450;
          setTimeout(function() {
            window.dispatchEvent(new CustomEvent('greetingRevealed'));
          }, lastCardFinish);
        }, 800);
      }
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
      scaleHero();
      initFullpageScroll(); // Initialize fullpage scroll (strict page-by-page)
      initProjectNav();

      // Loading screen — dismiss after 2.5s then start animations
      var loadingScreen = document.getElementById('loadingScreen');
      var loaderDuration = 2500;

      function startMainContent() {
        // Initial scroll animation check
        setTimeout(function() {
          updateScrollAnimations(window.scrollY, 0);
        }, 100);

        // Activate scroll hints after messages finish animating
        setTimeout(function() {
          var mobileScrollHint = document.getElementById('mobileScrollHint');
          var desktopScrollHint = document.getElementById('desktopScrollHint');
          if (mobileScrollHint) mobileScrollHint.classList.add('active');
          if (desktopScrollHint) desktopScrollHint.classList.add('active');
        }, 2500);

        // Run the chat thread entrance animation
        runChatThreadAnimation();
      }

      if (loadingScreen) {
        setTimeout(function() {
          loadingScreen.classList.add('fade-out');
          // Start main content as loader fades
          startMainContent();
          // Remove loader from DOM after fade, then enable hover previews
          setTimeout(function() {
            loadingScreen.remove();
            setTimeout(function() {
              document.body.classList.add('page-loaded');
            }, 500);
          }, 700);
        }, loaderDuration);
      } else {
        startMainContent();
        document.body.classList.add('page-loaded');
      }

      // Favicon emoji animation: creative spark sequence
      (function faviconAnimation() {
        var link = document.querySelector('link[rel="icon"]');
        if (!link) return;

        var emojis = ['🫧', '✨', '🎨', '✨', '🫧'];
        var titles = [
          'welcome',
          'to',
          "Julia's",
          'world',
          '✨'
        ];
        var i = 0;

        function setEmojiFavicon(emoji) {
          link.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>" + emoji + "</text></svg>";
        }

        var interval = setInterval(function() {
          if (i < emojis.length) {
            setEmojiFavicon(emojis[i]);
            document.title = titles[i] + '...';
            i++;
          } else {
            clearInterval(interval);
            // Settle on final state
            setTimeout(function() {
              setEmojiFavicon('🫧');
              document.title = 'Julia Liu - Portfolio';
            }, 1000);
          }
        }, 600);
      })();
    });

    // Handle window resize
    window.addEventListener('resize', scaleHero);

    // Format current time
    function formatTime(date) {
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    }

    function formatTimeShort(date) {
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    // Update times on page load
    function updateTimes() {
      const now = new Date();
      const timeStr = formatTime(now);
      const shortTimeStr = formatTimeShort(now);

      // Mobile status bar time
      const mobileTimeEl = document.getElementById('mobileTime');
      if (mobileTimeEl) mobileTimeEl.textContent = shortTimeStr;

      // Timestamps
      const mobileTimestamp = document.getElementById('mobileTimestamp');
      const desktopTimestamp = document.getElementById('desktopTimestamp');
      if (mobileTimestamp) mobileTimestamp.textContent = `Today ${timeStr}`;
      if (desktopTimestamp) desktopTimestamp.textContent = `Today ${timeStr}`;
    }

    // Contact conversation data
    const conversationData = {
      julia: {
        name: 'Julia Liu',
        avatar: 'JL',
        avatarClass: 'blue',
        messagesHtml: [
          `Hi, I'm <span class="hover-emoji" data-emoji="✨">Julia</span> <span class="emoji-float">🌱</span> <span class="wave">👋</span>`,
          `I'm an <span class="hover-emoji" data-emoji="💡">Interdisciplinary Designer</span> <span class="emoji-pulse">✨</span>`,
          `Studying <span class="hover-emoji" data-emoji="🖼️">Art</span> <span class="emoji-wiggle">🎨</span>, <span class="hover-emoji" data-emoji="📊">Data Science</span> <span class="emoji-float">📈</span>, and the <span class="hover-emoji" data-emoji="✏️">Design Certificate</span> at <span class="hover-emoji" data-emoji="🐻">UC Berkeley</span> <span class="emoji-bounce">💙</span><span class="emoji-bounce" style="animation-delay: 0.1s">💛</span>`,
          `In my free time you can find me in my <span class="hover-emoji" data-emoji="🧁">baking era</span> <span class="emoji-wiggle">🍰</span> and <span class="hover-emoji" data-emoji="✈️">solo traveling</span> <span class="emoji-spin">🌍</span>`,
          `Check out my <span class="hover-emoji" data-emoji="📁">case studies</span> below <span class="emoji-float">👇</span>`
        ],
        showChoices: true
      },
      about: {
        name: 'About Me',
        avatar: '🎈',
        avatarClass: 'orange',
        messages: [
          "Thanks for your interest in learning more about me!",
          "I'm passionate about user-centered design and creating meaningful experiences",
          "Let me share my background with you"
        ],
        action: 'about.html',
        actionText: "View My Story"
      },
      contact: {
        name: 'Contact',
        avatar: '⛵',
        avatarClass: 'green',
        messages: [
          "I'd love to connect!",
          "Whether you have a project in mind or just want to say hello",
          "Feel free to reach out anytime"
        ],
        action: 'index.html#scene5',
        actionText: "Get In Touch"
      },
      resume: {
        name: 'Resume',
        avatar: '✈️',
        avatarClass: 'purple',
        messages: [
          "Here's an overview of my professional experience",
          "I've worked across various industries helping teams create impactful products",
          "Take a look at my background"
        ],
        action: 'index.html#scene6',
        actionText: "View Resume"
      }
    };

    let currentContact = 'julia';

    function switchConversation(contact) {
      if (currentContact === contact) return;
      currentContact = contact;

      const data = conversationData[contact];

      // Update sidebar active state
      document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.toggle('active', item.dataset.contact === contact);
      });

      // Remove notification badge when clicked
      const badge = document.querySelector(`.conversation-item[data-contact="${contact}"] .notification-badge`);
      if (badge) badge.remove();

      // Update header
      const desktopAvatar = document.getElementById('desktopAvatar');
      const desktopName = document.getElementById('desktopName');

      if (data.avatarClass === 'blue') {
        desktopAvatar.textContent = data.avatar;
        desktopAvatar.style.background = 'linear-gradient(135deg, #5AC8FA, #007AFF)';
      } else {
        desktopAvatar.textContent = data.avatar;
        desktopAvatar.style.background = 'transparent';
        desktopAvatar.style.fontSize = '24px';
      }
      desktopName.textContent = data.name;

      // Clear and rebuild messages
      const messagesContainer = document.getElementById('desktopMessages');
      const choicesContainer = document.getElementById('desktopChoices');

      messagesContainer.innerHTML = '';

      // Add timestamp
      const timestamp = document.createElement('div');
      timestamp.className = 'timestamp';
      timestamp.textContent = `Today ${formatTime(new Date())}`;
      timestamp.style.animation = 'bubbleIn 0.3s ease forwards';
      messagesContainer.appendChild(timestamp);

      // Add messages with staggered animation
      const messages = data.messagesHtml || data.messages;
      messages.forEach((msg, i) => {
        const bubble = document.createElement('div');
        bubble.className = 'bubble received';
        if (data.messagesHtml) {
          bubble.innerHTML = msg;
        } else {
          bubble.textContent = msg;
        }
        bubble.style.animationDelay = `${0.5 + (i * 0.8)}s`;
        messagesContainer.appendChild(bubble);
      });

      // Show/hide choices or action button
      if (data.showChoices) {
        choicesContainer.classList.remove('hidden');
        choicesContainer.innerHTML = `
          <button class="choice-btn" onclick="goTo('projects')">
            <span class="choice-icon">📂</span> View Projects
          </button>
        `;
      } else {
        choicesContainer.classList.remove('hidden');
        choicesContainer.innerHTML = `
          <button class="choice-btn" onclick="window.location.href='${data.action}'">
            <span class="choice-icon">${data.avatar}</span> ${data.actionText}
          </button>
          <button class="choice-btn" onclick="switchConversation('julia')">
            <span class="choice-icon">←</span> Back
          </button>
        `;
      }
    }

    window.goTo = function(route) {
      // Direct navigation map for fallback
      const directNav = {
        'about': 'about.html',
        'playground': 'playground.html',
        'projects': null, // handled specially
        'contact': 'mailto:hello@julialiu.design',
        'resume': 'resume.html'
      };

      const isMobile = window.innerWidth < 768;
      const messages = document.getElementById(isMobile ? 'messages' : 'desktopMessages');
      const choices = document.getElementById(isMobile ? 'choices' : 'desktopChoices');

      // If messages container doesn't exist, navigate directly
      if (!messages) {
        if (route === 'projects') {
          scrollToProjects();
        } else if (directNav[route]) {
          window.location.href = directNav[route];
        }
        return;
      }

      if (choices) choices.classList.add('hidden');

      // Hide mobile badge when user interacts
      const mobileBadge = document.querySelector('.mobile-badge');
      if (mobileBadge) mobileBadge.style.display = 'none';

      // Hide desktop Julia badge when user interacts
      const juliaBadge = document.querySelector('.conversation-item[data-contact="julia"] .notification-badge');
      if (juliaBadge) juliaBadge.style.display = 'none';

      const responseMap = {
        'interactive': "I'd like to see the interactive experience",
        'projects': "Show me your projects",
        'about': "Tell me about yourself",
        'contact': "I'd like to get in touch",
        'playground': "Take me to the playground",
        'resume': "I'd like to see your resume"
      };

      // User bubble
      const userBubble = document.createElement('div');
      userBubble.className = 'bubble sent';
      userBubble.textContent = responseMap[route];
      userBubble.style.animation = 'bubbleIn 0.3s ease forwards';
      messages.appendChild(userBubble);
      messages.scrollTop = messages.scrollHeight;

      // Read receipt
      setTimeout(() => {
        const readReceipt = document.createElement('div');
        readReceipt.className = 'read-receipt';
        readReceipt.textContent = `Read ${formatTime(new Date())}`;
        readReceipt.style.animationDelay = '0.2s';
        messages.appendChild(readReceipt);
        messages.scrollTop = messages.scrollHeight;
      }, 300);

      // Typing indicator
      setTimeout(() => {
        const typing = document.createElement('div');
        typing.className = 'typing';
        typing.id = 'typingIndicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        messages.appendChild(typing);
        messages.scrollTop = messages.scrollHeight;
      }, 600);

      // Response based on route
      setTimeout(() => {
        const typingEl = document.getElementById('typingIndicator');
        if (typingEl) typingEl.remove();

        if (route === 'interactive') {
          // Send Maps bubble for interactive tour
          const reply = document.createElement('div');
          reply.className = 'bubble received';
          reply.textContent = "Great choice! Here's the interactive experience I've designed:";
          reply.style.animation = 'bubbleIn 0.3s ease forwards';
          messages.appendChild(reply);
          messages.scrollTop = messages.scrollHeight;

          // Add maps bubble after a moment
          setTimeout(() => {
            const mapsBubble = document.createElement('div');
            mapsBubble.className = 'maps-bubble highlight';
            mapsBubble.innerHTML = `
              <div class="maps-preview"></div>
              <div class="maps-info">
                <div class="maps-title">Julia's Portfolio</div>
                <div class="maps-subtitle">Interactive 3D Experience</div>
                <div class="maps-action">
                  <span>🧭</span> Tap to explore
                </div>
              </div>
            `;
            mapsBubble.onclick = () => window.location.href = 'index.html';
            messages.appendChild(mapsBubble);

            // Scroll to show the maps bubble properly
            setTimeout(() => {
              messages.scrollTop = messages.scrollHeight;
            }, 100);
          }, 800);

        } else if (route === 'projects') {
          const reply = document.createElement('div');
          reply.className = 'bubble received';
          reply.textContent = "Here are my projects!";
          reply.style.animation = 'bubbleIn 0.3s ease forwards';
          messages.appendChild(reply);
          messages.scrollTop = messages.scrollHeight;

          setTimeout(() => {
            // Scroll to first project
            scrollToProjects();
          }, 1200);

        } else if (route === 'about') {
          const reply = document.createElement('div');
          reply.className = 'bubble received';
          reply.textContent = "I'd love to share more about my background with you.";
          reply.style.animation = 'bubbleIn 0.3s ease forwards';
          messages.appendChild(reply);
          messages.scrollTop = messages.scrollHeight;

          setTimeout(() => {
            window.location.href = 'about.html';
          }, 1200);

        } else if (route === 'contact') {
          const reply = document.createElement('div');
          reply.className = 'bubble received';
          reply.textContent = "I'd be happy to connect! Here are my contact details.";
          reply.style.animation = 'bubbleIn 0.3s ease forwards';
          messages.appendChild(reply);
          messages.scrollTop = messages.scrollHeight;

          setTimeout(() => {
            window.location.href = 'index.html#scene5';
          }, 1200);

        } else if (route === 'playground') {
          const reply = document.createElement('div');
          reply.className = 'bubble received';
          reply.textContent = "Let's explore some creative experiments together!";
          reply.style.animation = 'bubbleIn 0.3s ease forwards';
          messages.appendChild(reply);
          messages.scrollTop = messages.scrollHeight;

          setTimeout(() => {
            window.location.href = 'playground.html';
          }, 1200);

        } else if (route === 'resume') {
          const reply = document.createElement('div');
          reply.className = 'bubble received';
          reply.textContent = "Here's an overview of my experience and qualifications.";
          reply.style.animation = 'bubbleIn 0.3s ease forwards';
          messages.appendChild(reply);
          messages.scrollTop = messages.scrollHeight;

          setTimeout(() => {
            window.location.href = 'index.html#scene6';
          }, 1200);
        }
      }, 1800);
    }

    // Apply animation delays on load
    document.addEventListener('DOMContentLoaded', () => {
      // Boot screen - simple typing indicator
      const bootScreen = document.getElementById('bootScreen');

      // Fade out boot screen after loading
      setTimeout(() => {
        bootScreen.classList.add('fade-out');
        setTimeout(() => {
          bootScreen.classList.add('hidden');
        }, 500);
      }, 2000);

      updateTimes();

      // Update time every minute
      setInterval(updateTimes, 60000);

      const bubbles = document.querySelectorAll('.bubble');
      bubbles.forEach((bubble, i) => {
        bubble.style.animationDelay = `${0.4 + (i * 0.6)}s`;
      });

      // Animate timestamps
      const timestamps = document.querySelectorAll('.timestamp');
      timestamps.forEach(ts => {
        ts.style.animationDelay = '0.2s';
      });

    });

    // ========== DRAGGABLE WINDOW (Desktop only) ==========
    // Drag functionality disabled - window stays in fixed position
    /*
    if (window.innerWidth >= 768) {
      const desktopApp = document.getElementById('desktopApp');
      const sidebarHeader = document.getElementById('dragHandle');
      const desktopHeader = document.querySelector('.desktop-header');

      let isDragging = false;
      let startX, startY, initialX, initialY;

      // Position is set via CSS - no need to override with JS

      // Drag start handler for both headers
      function handleDragStart(e) {
        // Don't drag if clicking on traffic lights or inside traffic-lights container
        if (e.target.closest('.traffic-lights')) return;

        isDragging = true;
        desktopApp.classList.add('dragging');

        startX = e.clientX;
        startY = e.clientY;
        initialX = desktopApp.offsetLeft;
        initialY = desktopApp.offsetTop;

        e.preventDefault();
        e.stopPropagation();
      }

      // Mouse events - attach to both sidebar header and desktop header
      if (sidebarHeader) sidebarHeader.addEventListener('mousedown', handleDragStart);
      if (desktopHeader) desktopHeader.addEventListener('mousedown', handleDragStart);

      // Rainbow colors for drag trail
      const rainbowColors = [
        '#A78BFA', '#8B5CF6', '#7C3AED', '#4BC0C0', '#36A2EB', '#9966FF', '#C084FC'
      ];
      let colorIndex = 0;

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newX = initialX + dx;
        let newY = initialY + dy;

        // Keep window within viewport bounds
        const maxX = window.innerWidth - desktopApp.offsetWidth;
        const maxY = window.innerHeight - desktopApp.offsetHeight;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        desktopApp.style.left = `${newX}px`;
        desktopApp.style.top = `${newY}px`;

        // Create rainbow trail
        const trail = document.createElement('div');
        trail.className = 'drag-trail';
        trail.style.left = `${e.clientX - 6}px`;
        trail.style.top = `${e.clientY - 6}px`;
        trail.style.background = rainbowColors[colorIndex % rainbowColors.length];
        document.body.appendChild(trail);
        colorIndex++;

        // Remove trail after animation
        setTimeout(() => trail.remove(), 500);

        // Mark as moved to hide hint
        if (!desktopApp.classList.contains('has-moved')) {
          desktopApp.classList.add('has-moved');
        }
      });

      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          desktopApp.classList.remove('dragging');
        }
      });
    }
    */

    // Mini windows are hidden, drag code removed

    // ========== UPDATE CALENDAR WITH REAL DATE ==========
    function updateCalendar() {
      const now = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      document.getElementById('calendarDay').textContent = now.getDate();
      document.getElementById('calendarMonth').textContent = months[now.getMonth()];
      document.getElementById('calendarWeekday').textContent = days[now.getDay()];
    }

    updateCalendar();

    // ========== DOCK BOUNCE FUNCTION ==========
    function bounceDockItem(item) {
      item.classList.add('bouncing');
      setTimeout(() => {
        item.classList.remove('bouncing');
      }, 500);
    }

    // ========== DOCK ANTICIPATION BOUNCE ON HOVER ==========
    document.querySelectorAll('.dock-item').forEach(item => {
      let hoverTimeout;
      item.addEventListener('mouseenter', () => {
        hoverTimeout = setTimeout(() => {
          if (!item.classList.contains('bouncing')) {
            item.classList.add('anticipate');
            setTimeout(() => item.classList.remove('anticipate'), 400);
          }
        }, 600);
      });
      item.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
      });
    });

    // ========== TRAFFIC LIGHT BUTTONS ==========
    function restoreWindow() {
      const win = document.getElementById('desktopApp');
      if (!isWindowMinimized) return;
      isWindowMinimized = false;
      win.classList.remove('minimized');
      win.classList.add('restoring');
      setTimeout(() => {
        win.classList.remove('restoring');
      }, 400);
    }

    // ========== TIC TAC TOE GAME ==========
    const gameBoard = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    const winningCombos = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    function initGame() {
      const cells = document.querySelectorAll('.game-cell');
      cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
      });
    }

    function handleCellClick(e) {
      const cell = e.target;
      const index = parseInt(cell.dataset.cell);

      if (gameBoard[index] !== '' || !gameActive) return;

      gameBoard[index] = currentPlayer;
      cell.textContent = currentPlayer;
      cell.classList.add(currentPlayer.toLowerCase());

      if (checkWin()) {
        document.getElementById('gameStatus').textContent = `${currentPlayer} wins! 🎉`;
        gameActive = false;
        return;
      }

      if (gameBoard.every(cell => cell !== '')) {
        document.getElementById('gameStatus').textContent = "It's a draw! 🤝";
        gameActive = false;
        return;
      }

      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      document.getElementById('gameStatus').textContent = `Your turn! (${currentPlayer})`;

      // Simple AI for O - plays after a short delay
      if (currentPlayer === 'O' && gameActive) {
        setTimeout(makeAIMove, 500);
      }
    }

    function makeAIMove() {
      const emptyCells = gameBoard.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
      if (emptyCells.length === 0) return;

      // Try to win or block
      let move = findBestMove('O') || findBestMove('X');

      // If no winning/blocking move, take center or random
      if (move === null) {
        if (gameBoard[4] === '') move = 4;
        else move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }

      const cell = document.querySelector(`.game-cell[data-cell="${move}"]`);
      gameBoard[move] = 'O';
      cell.textContent = 'O';
      cell.classList.add('o');

      if (checkWin()) {
        document.getElementById('gameStatus').textContent = 'O wins! 🤖';
        gameActive = false;
        return;
      }

      if (gameBoard.every(cell => cell !== '')) {
        document.getElementById('gameStatus').textContent = "It's a draw! 🤝";
        gameActive = false;
        return;
      }

      currentPlayer = 'X';
      document.getElementById('gameStatus').textContent = 'Your turn! (X)';
    }

    function findBestMove(player) {
      for (const combo of winningCombos) {
        const [a, b, c] = combo;
        const cells = [gameBoard[a], gameBoard[b], gameBoard[c]];
        const playerCount = cells.filter(c => c === player).length;
        const emptyCount = cells.filter(c => c === '').length;

        if (playerCount === 2 && emptyCount === 1) {
          return combo.find(i => gameBoard[i] === '');
        }
      }
      return null;
    }

    function checkWin() {
      return winningCombos.some(combo => {
        const [a, b, c] = combo;
        return gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[b] === gameBoard[c];
      });
    }

    function resetGame() {
      gameBoard.fill('');
      currentPlayer = 'X';
      gameActive = true;
      document.getElementById('gameStatus').textContent = 'Your turn! (X)';
      document.querySelectorAll('.game-cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
      });
    }

    // Initialize game when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initGame);
    } else {
      initGame();
    }

    // ========== MENU BAR TIME ==========
    function updateMenubarTime() {
      const timeEl = document.getElementById('menubarTime');
      if (timeEl) {
        const now = new Date();
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
        timeEl.textContent = now.toLocaleDateString('en-US', options);
      }
    }
    updateMenubarTime();
    setInterval(updateMenubarTime, 60000);

    // ========== BOOT ANIMATION ==========
    window.addEventListener('load', () => {
      const bootScreen = document.getElementById('bootScreen');
      setTimeout(() => {
        bootScreen.classList.add('fade-out');
        setTimeout(() => {
          bootScreen.classList.add('hidden');
          triggerEntranceAnimations();
        }, 500);
      }, 2000);
    });

    // ========== ENTRANCE ANIMATIONS ==========
    function triggerEntranceAnimations() {
      // Phone or desktop app
      const phone = document.querySelector('.phone');
      const desktopApp = document.getElementById('desktopApp');
      const dock = document.getElementById('macosDock');

      if (window.innerWidth < 768) {
        phone.classList.add('animate-in');
      } else {
        desktopApp.classList.add('animate-in');

        // After entrance animation completes (0.3s delay + 0.8s animation = 1.1s),
        // remove the animate-in class so scroll animation can control the transform
        setTimeout(() => {
          desktopApp.classList.remove('animate-in');
          // Set the final state inline so it doesn't jump
          desktopApp.style.opacity = '1';
          desktopApp.style.transform = 'translate(-50%, -50%) scale(1)';
          console.log('Entrance animation complete, scroll animation can now control transform');
        }, 1200);

        // Animate dock
        if (dock) {
          dock.classList.add('animate-in');
        }
      }
    }

    // ========== PARALLAX MOUSE EFFECT ==========
    if (window.innerWidth >= 768) {
      document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;

        // Parallax on floating accents (subtle movement based on position)
        document.querySelectorAll('.floating-accent').forEach((accent, i) => {
          const factor = 8 + (i % 3) * 4;
          const offsetX = mouseX * factor;
          const offsetY = mouseY * factor;
          accent.style.setProperty('--parallax-x', `${offsetX}px`);
          accent.style.setProperty('--parallax-y', `${offsetY}px`);
        });

        // Parallax on decorative items
        document.querySelectorAll('.floating-decor').forEach((decor, i) => {
          const factor = 5 + (i % 4) * 3;
          const offsetX = mouseX * factor;
          const offsetY = mouseY * factor;
          decor.style.setProperty('--parallax-x', `${offsetX}px`);
          decor.style.setProperty('--parallax-y', `${offsetY}px`);
        });

        // Subtle parallax on blobs
        document.querySelectorAll('.blob').forEach((blob, i) => {
          const factor = 15 + (i * 5);
          const offsetX = mouseX * factor;
          const offsetY = mouseY * factor;
          blob.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });
      });
    }

    // ============================================
    // VIEWPORT SCALING
    // ============================================
    const BASE_WIDTH = 1440;
    const BASE_HEIGHT = 900;
    const wrapper = document.getElementById('scaledWrapper');

    function scaleViewport() {
      if (!wrapper) return;
      const scaleX = window.innerWidth / BASE_WIDTH;
      const scaleY = window.innerHeight / BASE_HEIGHT;
      const scale = Math.min(scaleX, scaleY);

      // Scale and center the wrapper
      wrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }

    scaleViewport();
    window.addEventListener('resize', scaleViewport);





    // ============================================
    // JULIALLM SIDEBAR CHAT
    // ============================================

    let llmConversationHistory = [];
    let llmIsLoading = false;

    // Julia's context for local responses (fallback when API unavailable)
    const juliaInfo = {
      name: "Julia Liu",
      title: "Designer working between creative technology, prototyping, and accessibility",
      education: "UC Berkeley — Art, Data Science, and the Design Certificate",
      location: "San Francisco Bay Area",
      skills: ["Product Design", "UX Research", "Figma", "Prototyping", "Design Systems", "Creative Coding", "Data Science"],
      projects: [
        { name: "Humanity's Tech Tree", desc: "A collaborative timeline mapping humanity's technological progress" },
        { name: "Claude × Flow", desc: "A better developer experience for Claude Code" },
        { name: "FinQuantum AI", desc: "AI-powered financial analytics dashboard" },
        { name: "WorryJar", desc: "A journaling app that turns worries into something lighter" },
        { name: "Reels AI", desc: "Summarizing Instagram Reels with AI" }
      ],
      interests: ["baking", "solo traveling", "creative coding"],
      email: "hello@julialiu.design"
    };

    // Generate local response (fallback)
    function generateLocalResponse(query) {
      const q = query.toLowerCase();

      if (q.includes('skill') || q.includes('good at') || q.includes('know') || q.includes('tools') || q.includes('tech')) {
        return `Julia works across ${juliaInfo.skills.join(', ')} — she's all about bridging design and engineering to make things that actually work and feel good to use.`;
      }

      if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('proud') || q.includes('built') || q.includes('made')) {
        let response = "Here's what Julia's been building:\n\n";
        juliaInfo.projects.forEach(p => {
          response += `• ${p.name} — ${p.desc}\n`;
        });
        response += "\nYou can scroll through the project cards above to explore each one!";
        return response;
      }

      if (q.includes('contact') || q.includes('reach') || q.includes('email') || q.includes('hire') || q.includes('open to work')) {
        return `Absolutely — Julia is open to opportunities! You can reach her at ${juliaInfo.email}. She'd love to hear about what you're working on.`;
      }

      if (q.includes('education') || q.includes('school') || q.includes('study') || q.includes('berkeley')) {
        return `Julia is at ${juliaInfo.education}. It's a pretty unique combo — she gets to think like an artist, analyze like a data scientist, and build like a designer.`;
      }

      if (q.includes('hobby') || q.includes('interest') || q.includes('free time') || q.includes('fun')) {
        return `When she's not designing, Julia's usually ${juliaInfo.interests.join(', ')}. The solo trips especially fuel a lot of her creative thinking.`;
      }

      if (q.includes('who') || q.includes('about') || q.includes('tell me') || q.includes('design process')) {
        return `Julia is a ${juliaInfo.title}, based in the ${juliaInfo.location}. She's studying ${juliaInfo.education} — and she's all about making design feel more human and accessible.`;
      }

      return `I can share more about Julia's projects, skills, background, or how to get in touch — what are you curious about?`;
    }


    // ============================================
    // UNIFIED CHAT THREAD
    // ============================================

    function getChatThread() {
      return document.querySelector('.chat-thread');
    }

    function scrollToBottom() {
      const center = document.querySelector('.gpt-center');
      if (center) {
        center.scrollTo({ top: center.scrollHeight, behavior: 'smooth' });
      }
    }

    function clearChatMessages() {
      const thread = getChatThread();
      if (!thread) return;

      // Remove only user-added messages (not the original intro messages)
      const userMessages = thread.querySelectorAll('.gpt-chat-msg.user-added, .gpt-chat-typing');
      userMessages.forEach(msg => msg.remove());

      llmConversationHistory = [];

      const input = document.getElementById('gptMainInput');
      if (input) {
        input.value = '';
        input.placeholder = 'Ask JuliaLLM anything...';
      }

      // Scroll back to top
      const center = document.querySelector('.gpt-center');
      if (center) {
        center.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    window.clearChatMessages = clearChatMessages;

    function addMainChatMessage(content, isUser) {
      const thread = getChatThread();
      if (!thread) return;

      const msgWrapper = document.createElement('div');
      msgWrapper.className = 'gpt-chat-msg ' + (isUser ? 'user' : 'assistant') + ' user-added';

      if (isUser) {
        const bubble = document.createElement('div');
        bubble.className = 'gpt-msg-bubble';
        bubble.textContent = content;
        msgWrapper.appendChild(bubble);
        thread.appendChild(msgWrapper);
        scrollToBottom();
      } else {
        const text = document.createElement('div');
        text.className = 'gpt-msg-text';
        text.textContent = '';
        msgWrapper.appendChild(text);
        thread.appendChild(msgWrapper);
        scrollToBottom();

        // Typewriter effect
        let i = 0;
        var speed = 18;
        function typeChar() {
          if (i < content.length) {
            text.textContent += content.charAt(i);
            i++;
            scrollToBottom();
            setTimeout(typeChar, speed);
          }
        }
        typeChar();
      }
    }

    function showMainChatTyping() {
      const thread = getChatThread();
      if (!thread) return;

      const typingWrapper = document.createElement('div');
      typingWrapper.className = 'gpt-chat-typing user-added';
      typingWrapper.id = 'gptMainTyping';

      const dots = document.createElement('div');
      dots.className = 'gpt-typing-dots';
      dots.innerHTML = '<span></span><span></span><span></span>';

      typingWrapper.appendChild(dots);
      thread.appendChild(typingWrapper);
      scrollToBottom();
    }

    function hideMainChatTyping() {
      const typing = document.getElementById('gptMainTyping');
      if (typing) typing.remove();
    }

    async function sendMainMessage() {
      const input = document.getElementById('gptMainInput');
      const message = input.value.trim();

      if (!message || llmIsLoading) return;

      // Switch to top-aligned scroll once conversation starts
      var center = document.querySelector('.gpt-center');
      if (center) center.classList.add('has-conversation');

      input.value = '';
      addMainChatMessage(message, true);

      llmIsLoading = true;
      showMainChatTyping();

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message,
            conversationHistory: llmConversationHistory
          })
        });

        if (response.ok) {
          const data = await response.json();
          hideMainChatTyping();
          addMainChatMessage(data.response, false);
          llmConversationHistory = data.conversationHistory || [];
        } else {
          throw new Error('API unavailable');
        }
      } catch (error) {
        hideMainChatTyping();
        const localResponse = generateLocalResponse(message);
        addMainChatMessage(localResponse, false);
      }

      llmIsLoading = false;
      input.focus();
    }
    window.sendMainMessage = sendMainMessage;

    // Keep exitChatMode as alias for backwards compat with any other references
    function exitChatMode() { clearChatMessages(); }
    window.exitChatMode = exitChatMode;

    // ============================================
    // INPUT SUGGESTIONS
    // ============================================
    (function initSuggestions() {
      const input = document.getElementById('gptMainInput');
      const suggestions = document.getElementById('gptSuggestions');
      if (!input || !suggestions) return;

      const container = document.querySelector('.gpt-input-container');

      function showSuggestions() {
        suggestions.classList.add('visible');
      }

      function hideSuggestions() {
        suggestions.classList.remove('visible');
      }

      // Show on focus
      input.addEventListener('focus', showSuggestions);

      // Hide on blur with delay so click on suggestion registers
      input.addEventListener('blur', () => {
        setTimeout(hideSuggestions, 200);
      });

      // Show on hover over the container, hide on leave
      if (container) {
        container.addEventListener('mouseenter', showSuggestions);
        container.addEventListener('mouseleave', () => {
          if (document.activeElement !== input) {
            hideSuggestions();
          }
        });
      }
    })();

    function useSuggestion(btn) {
      const input = document.getElementById('gptMainInput');
      const suggestions = document.getElementById('gptSuggestions');
      if (!input) return;

      input.value = btn.textContent;
      if (suggestions) suggestions.classList.remove('visible');
      sendMainMessage();
    }
    window.useSuggestion = useSuggestion;

    // ============================================
    // RESET TO ENTRANCE STATE ON OUTSIDE INTERACTION
    // ============================================
    (function initResetOnOutsideInteraction() {
      const inputContainer = document.querySelector('.gpt-input-container');
      const suggestions = document.getElementById('gptSuggestions');

      // Reset when hovering over project cards
      document.querySelectorAll('.project-preview-card').forEach(function(card) {
        card.addEventListener('mouseenter', function() {
          clearChatMessages();
        });
      });

      // Reset when clicking outside the input area
      document.addEventListener('click', function(e) {
        // Don't reset if clicking inside the input container or suggestions
        if (inputContainer && inputContainer.contains(e.target)) return;
        if (suggestions && suggestions.contains(e.target)) return;

        // Only reset if there are user-added messages
        const thread = getChatThread();
        if (thread && thread.querySelector('.user-added')) {
          clearChatMessages();
        }
      });
    })();

    // ============================================
    // TYPEWRITER EFFECT ON GREETING TEXT
    // Standalone — waits for greeting to become visible, then types it out
    // ============================================
    // Grab greeting text and blank it immediately (before anything renders)
    // The animation function reads window._greetingFullText to type it out
    (function() {
      var textEl = document.getElementById('greetingText');
      if (!textEl) return;
      window._greetingFullHTML = textEl.innerHTML.trim();
      window._greetingFullText = textEl.textContent.trim();
      textEl.textContent = '';
    })();

    // ============================================
    // VIDEO KEN BURNS - Trigger in first 2 seconds
    // ============================================
    (function initVideoKenBurns() {
      const videos = document.querySelectorAll('.iphone-screen video');

      if (videos.length === 0) return;

      videos.forEach(video => {
        // Trigger animation when video starts/loops
        video.addEventListener('play', () => {
          video.classList.remove('animate-ken-burns');
          void video.offsetWidth; // Force reflow
          video.classList.add('animate-ken-burns');
        });

        // Also trigger on loop (seeking back to start)
        video.addEventListener('seeked', () => {
          if (video.currentTime < 0.1) {
            video.classList.remove('animate-ken-burns');
            void video.offsetWidth;
            video.classList.add('animate-ken-burns');
          }
        });
      });
    })();

    /* ========================================
       GPT PROJECTS - FULLSCREEN SCROLL MODE
       Clean white ChatGPT-style gallery
       ======================================== */
    (function initGptProjectsHScroll() {
      const section = document.getElementById('gptProjectsSection');
      if (!section) return;

      // Find the cards row inside the section
      const cardsRow = section.querySelector('.gpt-cards-row.project-preview-cards');
      if (!cardsRow) return;

      let isActive = false;
      let hoverTimeout = null;
      let closeBtn = null;
      let galleryLabel = null;

      // Create close button
      function createCloseButton() {
        if (closeBtn) return;
        closeBtn = document.createElement('button');
        closeBtn.className = 'gpt-gallery-close';
        closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        closeBtn.className = 'gpt-gallery-close pearl-close-btn';
        closeBtn.style.cssText = `
          position: absolute;
          top: 14px;
          right: 16px;
          width: 38px;
          height: 38px;
          border: none;
          background-color: #080808;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          border-radius: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          overflow: hidden;
          box-shadow:
            inset 0 0.3rem 0.9rem rgba(255, 255, 255, 0.3),
            inset 0 -0.1rem 0.3rem rgba(0, 0, 0, 0.7),
            inset 0 -0.4rem 0.9rem rgba(255, 255, 255, 0.5),
            0 1.5rem 1.5rem rgba(0, 0, 0, 0.3),
            0 0.5rem 0.5rem -0.3rem rgba(0, 0, 0, 0.8);
          transition: box-shadow 0.2s ease, transform 0.15s ease;
        `;

        // Add pearl shine overlays
        var shine1 = document.createElement('div');
        shine1.style.cssText = 'position:absolute;left:-15%;right:-15%;bottom:25%;top:-100%;border-radius:50%;background-color:rgba(255,255,255,0.12);pointer-events:none;transition:all 0.3s ease;';
        var shine2 = document.createElement('div');
        shine2.style.cssText = 'position:absolute;left:6%;right:6%;top:12%;bottom:40%;border-radius:22px 22px 0 0;box-shadow:inset 0 10px 8px -10px rgba(255,255,255,0.8);background:linear-gradient(180deg,rgba(255,255,255,0.3) 0%,rgba(0,0,0,0) 50%,rgba(0,0,0,0) 100%);pointer-events:none;transition:all 0.3s ease;';
        closeBtn.appendChild(shine1);
        closeBtn.appendChild(shine2);

        closeBtn.addEventListener('mouseenter', () => {
          closeBtn.style.transform = 'translateY(-2px)';
          closeBtn.style.boxShadow = 'inset 0 0.3rem 0.5rem rgba(255,255,255,0.4), inset 0 -0.1rem 0.3rem rgba(0,0,0,0.7), inset 0 -0.4rem 0.9rem rgba(255,255,255,0.7), 0 2rem 2rem rgba(0,0,0,0.3), 0 0.8rem 0.8rem -0.4rem rgba(0,0,0,0.8)';
          shine1.style.transform = 'translateY(-5%)';
          shine2.style.opacity = '0.4';
          shine2.style.transform = 'translateY(5%)';
        });
        closeBtn.addEventListener('mouseleave', () => {
          closeBtn.style.transform = '';
          closeBtn.style.boxShadow = 'inset 0 0.3rem 0.9rem rgba(255,255,255,0.3), inset 0 -0.1rem 0.3rem rgba(0,0,0,0.7), inset 0 -0.4rem 0.9rem rgba(255,255,255,0.5), 0 1.5rem 1.5rem rgba(0,0,0,0.3), 0 0.5rem 0.5rem -0.3rem rgba(0,0,0,0.8)';
          shine1.style.transform = '';
          shine2.style.opacity = '';
          shine2.style.transform = '';
        });
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deactivateFullscreen();
        });
        section.appendChild(closeBtn);

        // Create gallery label
        if (!galleryLabel) {
          galleryLabel = document.createElement('div');
          galleryLabel.className = 'gpt-gallery-label';
          galleryLabel.textContent = 'Projects';
          section.appendChild(galleryLabel);
        }
      }

      // Remove close button and gallery label
      function removeCloseButton() {
        if (closeBtn && closeBtn.parentNode) {
          closeBtn.parentNode.removeChild(closeBtn);
          closeBtn = null;
        }
        if (galleryLabel && galleryLabel.parentNode) {
          galleryLabel.parentNode.removeChild(galleryLabel);
          galleryLabel = null;
        }
      }

      // Activate fullscreen mode
      window.activateProjectsFullscreen = activateFullscreen;
      function activateFullscreen() {
        if (isActive) return;
        isActive = true;
        section.classList.add('hscroll-active');
        document.body.style.overflow = 'hidden';
        var toggle = document.getElementById('modeToggle');
        if (toggle) toggle.style.opacity = '0';
        if (toggle) toggle.style.pointerEvents = 'none';
        var topRight = document.querySelector('.gpt-top-right');
        if (topRight) topRight.style.opacity = '0';
        if (topRight) topRight.style.pointerEvents = 'none';
        var leftIcons = document.querySelector('.gpt-left-icons');
        if (leftIcons) leftIcons.style.opacity = '0';
        if (leftIcons) leftIcons.style.pointerEvents = 'none';
        var modelSel = document.querySelector('.gpt-model-selector-wrap');
        if (modelSel) modelSel.style.opacity = '0';
        if (modelSel) modelSel.style.pointerEvents = 'none';
        var projHeader = document.querySelector('.gpt-projects-header');
        if (projHeader) projHeader.style.opacity = '0';
        if (projHeader) projHeader.style.pointerEvents = 'none';
        createCloseButton();
        updateFadeVisibility();
      }

      // Deactivate fullscreen mode
      function deactivateFullscreen() {
        if (!isActive) return;
        isActive = false;
        section.classList.remove('hscroll-active');
        document.body.style.overflow = '';
        var toggle = document.getElementById('modeToggle');
        if (toggle) toggle.style.opacity = '';
        if (toggle) toggle.style.pointerEvents = '';
        var topRight = document.querySelector('.gpt-top-right');
        if (topRight) topRight.style.opacity = '';
        if (topRight) topRight.style.pointerEvents = '';
        var leftIcons = document.querySelector('.gpt-left-icons');
        if (leftIcons) leftIcons.style.opacity = '';
        if (leftIcons) leftIcons.style.pointerEvents = '';
        var modelSel = document.querySelector('.gpt-model-selector-wrap');
        if (modelSel) modelSel.style.opacity = '';
        if (modelSel) modelSel.style.pointerEvents = '';
        var projHeader = document.querySelector('.gpt-projects-header');
        if (projHeader) projHeader.style.opacity = '';
        if (projHeader) projHeader.style.pointerEvents = '';
        removeCloseButton();
        cardsRow.scrollLeft = 0;

        // Clear inline opacity on fade indicators so CSS opacity:0 takes effect
        const fadeLeft = section.querySelector('.gpt-projects-fade-left');
        const fadeRight = section.querySelector('.gpt-projects-fade-right');
        if (fadeLeft) fadeLeft.style.opacity = '';
        if (fadeRight) fadeRight.style.opacity = '';
      }

      // Gallery dot indicators — scroll tracking & click navigation
      const galleryDots = section.querySelectorAll('.gallery-dot');
      function updateGalleryIndicators() {
        if (!isActive) return;
        const scrollLeft = cardsRow.scrollLeft;
        const cardWidth = cardsRow.querySelector('.project-preview-card')?.offsetWidth || window.innerWidth;
        const activeIndex = Math.round(scrollLeft / cardWidth);
        galleryDots.forEach((dot, i) => {
          dot.classList.toggle('active', i === activeIndex);
        });
      }

      cardsRow.addEventListener('scroll', updateGalleryIndicators);

      galleryDots.forEach((dot) => {
        dot.addEventListener('click', (e) => {
          e.preventDefault();
          const index = parseInt(dot.dataset.index, 10);
          const cards = cardsRow.querySelectorAll('.project-preview-card');
          if (cards[index]) {
            cards[index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
          }
        });
      });

      // Track hover on individual cards - scroll to hovered project
      const previewCards = cardsRow.querySelectorAll('.project-preview-card');
      // Only enable hover-to-fullscreen after cards have loaded
      var hoverEnabled = false;
      setTimeout(function() { hoverEnabled = true; }, 3000);

      // Only enable hover-to-fullscreen on non-touch devices
      var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

      previewCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          if (!hoverEnabled || isTouchDevice) return;
          clearTimeout(hoverTimeout);
          const projectId = card.dataset.project;
          hoverTimeout = setTimeout(() => {
            activateFullscreen();
            // After activation, scroll to the hovered card
            requestAnimationFrame(() => {
              const targetCard = cardsRow.querySelector(`.project-preview-card[data-project="${projectId}"]`);
              if (targetCard) {
                targetCard.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
              }
              updateFadeVisibility();
            });
          }, 800);
        });
        card.addEventListener('mouseleave', () => {
          clearTimeout(hoverTimeout);
        });
      });

      // Fullscreen stays open — only close via close button or ESC

      // ESC key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isActive) {
          deactivateFullscreen();
        }
      });

      // Card-by-card scroll navigation with cooldown
      let scrollCooldown = false;
      let scrollAccum = 0;
      const SCROLL_THRESHOLD = 50; // Delta needed to trigger a card change
      const SCROLL_COOLDOWN_MS = 1000; // Cooldown between card jumps

      function getCurrentCardIndex() {
        const cards = cardsRow.querySelectorAll('.project-preview-card');
        const containerCenter = cardsRow.scrollLeft + cardsRow.clientWidth / 2;
        let closestIdx = 0;
        let closestDist = Infinity;
        cards.forEach((card, i) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const dist = Math.abs(containerCenter - cardCenter);
          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
          }
        });
        return closestIdx;
      }

      function scrollToCard(index) {
        const cards = cardsRow.querySelectorAll('.project-preview-card');
        if (index < 0) index = cards.length - 1; // Loop to end
        if (index >= cards.length) index = 0; // Loop to start
        cards[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        setTimeout(updateFadeVisibility, 350);
      }

      section.addEventListener('wheel', (e) => {
        if (!isActive) return;
        e.preventDefault();

        if (scrollCooldown) return;

        const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
        scrollAccum += delta;

        if (Math.abs(scrollAccum) >= SCROLL_THRESHOLD) {
          scrollCooldown = true;
          const direction = scrollAccum > 0 ? 1 : -1;
          scrollAccum = 0;

          const currentIdx = getCurrentCardIndex();
          scrollToCard(currentIdx + direction);

          setTimeout(() => {
            scrollCooldown = false;
            scrollAccum = 0;
          }, SCROLL_COOLDOWN_MS);
        }
      }, { passive: false });

      // Update gradient fade visibility based on scroll position
      function updateFadeVisibility() {
        const fadeLeft = section.querySelector('.gpt-projects-fade-left');
        const fadeRight = section.querySelector('.gpt-projects-fade-right');

        if (!fadeLeft || !fadeRight) return;

        const scrollLeft = cardsRow.scrollLeft;
        const maxScroll = cardsRow.scrollWidth - cardsRow.clientWidth;

        // Show left fade when scrolled away from start
        fadeLeft.style.opacity = scrollLeft > 20 ? '1' : '0';

        // Show right fade when not at the end (and there's content to scroll)
        fadeRight.style.opacity = (maxScroll > 0 && scrollLeft < maxScroll - 20) ? '1' : '0';
      }

      // Listen for scroll events
      cardsRow.addEventListener('scroll', updateFadeVisibility, { passive: true });

      // Touch support for mobile
      let touchStartX = 0;
      let touchStartScrollLeft = 0;

      cardsRow.addEventListener('touchstart', (e) => {
        activateFullscreen();
        touchStartX = e.touches[0].pageX;
        touchStartScrollLeft = cardsRow.scrollLeft;
      }, { passive: true });

      cardsRow.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 1) return;
        const touchX = e.touches[0].pageX;
        const diff = touchStartX - touchX;
        cardsRow.scrollLeft = touchStartScrollLeft + diff;
      }, { passive: true });

      cardsRow.addEventListener('touchend', () => {
        // Keep active for a moment after touch ends
        hoverTimeout = setTimeout(deactivateFullscreen, 800);
      }, { passive: true });

      console.log('[GPT HScroll] Project cards horizontal scroll initialized');
    })();

    // ============================================
    // CUSTOM CURSOR — "View Project" on card hover
    // ============================================
    (function initCustomCursor() {
      const cursor = document.getElementById('customCursor');
      if (!cursor) return;

      const projectsSection = document.querySelector('.gpt-projects');
      const cards = document.querySelectorAll('.project-preview-card');
      if (!cards.length || !projectsSection) return;

      let mouseX = 0, mouseY = 0;
      let cursorX = 0, cursorY = 0;
      const LERP = 0.15; // Smooth follow speed (0 = frozen, 1 = instant)

      function isFullscreen() {
        return projectsSection.classList.contains('hscroll-active');
      }

      // Track actual mouse position
      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      // Smooth lerp animation loop
      function animate() {
        cursorX += (mouseX - cursorX) * LERP;
        cursorY += (mouseY - cursorY) * LERP;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);

      // Show on card hover in fullscreen
      cards.forEach((card) => {
        card.addEventListener('mouseenter', (e) => {
          if (!isFullscreen()) return;
          // Snap position on enter so it doesn't animate from far away
          cursorX = e.clientX;
          cursorY = e.clientY;
          cursor.classList.add('visible');
        });

        card.addEventListener('mouseleave', () => {
          cursor.classList.remove('visible');
        });
      });

      // Hide when fullscreen deactivates
      const observer = new MutationObserver(() => {
        if (!isFullscreen()) {
          cursor.classList.remove('visible');
        }
      });
      observer.observe(projectsSection, { attributes: true, attributeFilter: ['class'] });

      console.log('[Custom Cursor] Rotating ring initialized on', cards.length, 'project cards');
    })();

    // ============================================
    // PAGE TRANSITIONS — Smooth fade between pages
    // ============================================
    (function initPageTransitions() {
      const overlay = document.getElementById('pageTransition');
      if (!overlay) return;

      // Intercept all internal links
      document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');

        // Skip external links, anchors, and javascript:
        if (!href || href.startsWith('#') || href.startsWith('javascript') || href.startsWith('http') || href.startsWith('mailto')) return;

        e.preventDefault();

        // Activate fade-out
        overlay.classList.add('active');

        // Navigate after transition
        setTimeout(function() {
          window.location.href = href;
        }, 400);
      });

      console.log('[Page Transitions] Initialized');
    })();

    // ============================================
    // MODEL SELECTOR DROPDOWN
    // ============================================
    (function() {
      window.switchMode = function() {}; // no-op stub

      var selectorBtn = document.getElementById('modelSelectorBtn');
      var selectorWrap = document.getElementById('modelSelectorWrap');

      if (selectorBtn && selectorWrap) {
        selectorBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          var isOpen = selectorWrap.classList.toggle('open');
          selectorBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        document.addEventListener('click', function(e) {
          if (!selectorWrap.contains(e.target)) {
            selectorWrap.classList.remove('open');
            selectorBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }

      window.closeModelDropdown = function() {
        if (selectorWrap) {
          selectorWrap.classList.remove('open');
          if (selectorBtn) selectorBtn.setAttribute('aria-expanded', 'false');
        }
      };
    })();
