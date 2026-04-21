/* ==========================================================================
   gravity.js — Hero greeting enlargement + (Part B: physics)
   --------------------------------------------------------------------------
   Part A (live): listen for 'greetingRevealed' → wait a beat → enlarge text
                  via .greeting-enlarged class (CSS handles the transition).
   Part B (TODO): Matter.js-backed physics. User drags a word to trigger
                  gravity; words fall, collide with project cards, can be
                  picked up. Hover project card or focus input = tween back.
   ========================================================================== */

(function () {
  'use strict';

  const ENLARGE_DELAY_MS = 1200; // pause after cards finish so page feels settled
  const MOBILE_BREAKPOINT = 768; // below this, skip the enlargement moment

  // ---- guards -------------------------------------------------------------

  function isReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isTooSmall() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  // ---- enlargement (Part A) -----------------------------------------------

  let hasEnlarged = false;

  function enlargeGreeting() {
    if (hasEnlarged) return;
    hasEnlarged = true;

    const greeting = document.getElementById('chatAiGreeting');
    if (!greeting) return;
    greeting.classList.add('greeting-enlarged');
  }

  function scheduleEnlargement() {
    if (isReducedMotion() || isTooSmall()) return;
    window.setTimeout(enlargeGreeting, ENLARGE_DELAY_MS);
  }

  // ---- hook -------------------------------------------------------------

  // Primary signal: custom event dispatched by imessage-intro.js after the
  // project-card stagger animation completes.
  window.addEventListener('greetingRevealed', scheduleEnlargement, { once: true });

  // Fallback: if the event never fires (refactor, etc.), poll for card visibility.
  // Kicks in 12s after page load as a safety net.
  window.setTimeout(() => {
    if (hasEnlarged) return;
    const cards = document.querySelectorAll('.project-preview-card');
    if (!cards.length) return;
    const anyVisible = Array.from(cards).some(c => {
      const style = window.getComputedStyle(c);
      return parseFloat(style.opacity) > 0.5;
    });
    if (anyVisible) scheduleEnlargement();
  }, 12000);

  // Expose a manual trigger for testing from devtools.
  window.__enlargeGreeting = enlargeGreeting;
})();
