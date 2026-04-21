/* ==========================================================================
   gravity.js — Hero greeting enlargement + physics moment
   --------------------------------------------------------------------------
   Part A: listens for 'greetingRevealed' → applies .greeting-enlarged class
           (used only to fade in the status pill now; size is set from the
            start in gravity.css).
   Part B: Matter.js-backed physics. After the greeting reveals, words are
           wrapped in spans and given invisible static physics bodies.
           Clicking/dragging any word activates gravity — all words and the
           wave image fall, collide with project cards (static colliders),
           and can be flung around. Hovering a project card OR focusing the
           input tweens the words back to their original positions and
           re-freezes them (no re-fall).
   ========================================================================== */

(function () {
  'use strict';

  // ========================================================================
  // PART A: ENLARGEMENT CLASS (status-pill trigger)
  // ========================================================================

  const ENLARGE_DELAY_MS = 1200;
  const MOBILE_BREAKPOINT = 768;

  function isReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isTooSmall() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

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

  window.addEventListener('greetingRevealed', scheduleEnlargement, { once: true });

  // Fallback so the enlargement always fires even if the event chain breaks.
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

  window.__enlargeGreeting = enlargeGreeting;

  // ========================================================================
  // PART B: PHYSICS MOMENT
  // ========================================================================

  const PHYSICS_INIT_DELAY_MS = 2600;        // wait this long after reveal before wiring physics
  const PHYSICS_BREAKPOINT = 768;            // disable physics under this viewport width
  const RESET_DURATION_MS = 600;             // tween length when returning to original positions

  let physicsReady = false;
  let physicsActive = false;
  let engine = null;
  let wordRecords = [];                      // [{ el, body, originalCx, originalCy }]
  let rafId = null;
  let runner = null;
  let didResizeRig = false;

  function isPhysicsDisabled() {
    return isReducedMotion() || window.innerWidth < PHYSICS_BREAKPOINT;
  }

  // -----------------------------------------------------------------
  // Word splitting. Walks text nodes inside the greet-bold/greet-light
  // spans, wrapping each whitespace-delimited token in <span class="greeting-word">.
  // Keeps whitespace text-nodes alone (so reading order is preserved if physics
  // never activates). Treats .hero-wave-wrap as its own word-unit.
  // -----------------------------------------------------------------

  function wrapWordsIn(container) {
    const collected = [];

    function walk(el) {
      const kids = Array.from(el.childNodes);
      kids.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          if (!text.length) return;
          const frag = document.createDocumentFragment();
          text.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
            } else {
              const span = document.createElement('span');
              span.className = 'greeting-word';
              span.textContent = part;
              frag.appendChild(span);
              collected.push(span);
            }
          });
          el.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.classList && node.classList.contains('hero-wave-wrap')) {
            node.classList.add('greeting-word');
            collected.push(node);
          } else {
            walk(node);
          }
        }
      });
    }

    walk(container);
    return collected;
  }

  // -----------------------------------------------------------------
  // Init — lazy-loads on first intent. Builds Matter.js engine, word bodies,
  // card colliders, floor/walls, and mouse constraint.
  // -----------------------------------------------------------------

  function initPhysics() {
    if (physicsReady || isPhysicsDisabled()) return;
    if (!window.Matter) {
      console.warn('[gravity] Matter.js not loaded; physics disabled.');
      return;
    }
    physicsReady = true;

    const M = window.Matter;
    const helloEl = document.querySelector('.greet-hello');
    const boldEl = document.querySelector('.greet-bold');
    const lightEl = document.querySelector('.greet-light');
    if (!boldEl || !lightEl) return;

    const wordEls = [
      ...(helloEl ? wrapWordsIn(helloEl) : []),
      ...wrapWordsIn(boldEl),
      ...wrapWordsIn(lightEl),
    ];

    // Also make the "Hello!" user-side bubble a physics body so it falls too.
    const helloBubble = document.querySelector('#chatUserHello .gpt-msg-bubble');
    if (helloBubble) {
      helloBubble.classList.add('greeting-word');
      wordEls.push(helloBubble);
    }

    if (!wordEls.length) return;

    // Snapshot original center positions & sizes BEFORE doing anything else.
    wordRecords = wordEls.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        el,
        originalCx: r.left + r.width / 2,
        originalCy: r.top + r.height / 2,
        w: r.width,
        h: r.height,
        body: null,
      };
    });

    engine = M.Engine.create({ enableSleeping: true });
    engine.gravity.y = 1.2;
    const world = engine.world;

    // Word bodies (start static — they're anchored where they rendered).
    wordRecords.forEach((wr) => {
      if (wr.w < 2 || wr.h < 2) return;
      wr.body = M.Bodies.rectangle(wr.originalCx, wr.originalCy, wr.w, wr.h, {
        isStatic: true,
        restitution: 0.35,
        friction: 0.25,
        frictionAir: 0.012,
      });
      M.World.add(world, wr.body);
    });

    // Project-card colliders.
    document.querySelectorAll('.project-preview-card').forEach((card) => {
      const r = card.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const body = M.Bodies.rectangle(r.left + r.width / 2, r.top + r.height / 2, r.width, r.height, {
        isStatic: true,
        restitution: 0.2,
        friction: 0.6,
      });
      M.World.add(world, body);
    });

    addRigWalls(M, world);

    // Mouse constraint for picking up & flinging words.
    const mouse = M.Mouse.create(document.body);
    // Prevent Matter from swallowing wheel events (we want native scroll).
    mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
    mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);

    const mouseConstraint = M.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.18, render: { visible: false } },
    });
    M.World.add(world, mouseConstraint);

    // Word (and Hello-bubble) mousedown → activate physics (once).
    wordEls.forEach((el) => {
      el.style.cursor = 'grab';
      el.addEventListener('mousedown', onWordDown);
      el.addEventListener('touchstart', onWordDown, { passive: true });
    });

    // Project card hover → reset.
    document.querySelectorAll('.project-preview-card').forEach((card) => {
      card.addEventListener('mouseenter', resetPhysics);
    });

    // Input focus → reset.
    const inputField = document.querySelector('.desktop-app.chatgpt-style .gpt-input-field')
      || document.querySelector('.gpt-input-field');
    if (inputField) {
      inputField.addEventListener('focus', resetPhysics);
    }
    // Also catch clicks on the input bar container.
    const inputBar = document.querySelector('.desktop-app.chatgpt-style .gpt-input-bar');
    if (inputBar) {
      inputBar.addEventListener('click', resetPhysics);
    }

    // Keep rig sync'd across resizes.
    window.addEventListener('resize', onWindowResize);

    runner = M.Runner.create();
    M.Runner.run(runner, engine);

    // Start render loop.
    tick();
  }

  function addRigWalls(M, world) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Floor — pushed well below the viewport so words can fall out of sight before stopping.
    const floor = M.Bodies.rectangle(w / 2, h + 600, w * 6, 120, { isStatic: true });
    // Ceiling — generous so flung words don't fly to infinity, but still off-screen.
    const ceiling = M.Bodies.rectangle(w / 2, -h * 1.5, w * 6, 200, { isStatic: true });
    // NO side walls — words can drift/fall off the left and right edges of the viewport.
    M.World.add(world, [floor, ceiling]);
  }

  function onWindowResize() {
    didResizeRig = true;
  }

  // -----------------------------------------------------------------
  // Activation — unfreezes all word bodies.
  // -----------------------------------------------------------------

  function onWordDown() {
    if (!physicsActive) activatePhysics();
  }

  function activatePhysics() {
    if (!engine || physicsActive) return;
    physicsActive = true;

    // Suspend the continuous wave animation so it doesn't fight physics transforms.
    // (The wave img still has its own internal rotation animation via CSS — fine
    // since we transform the wrapper, not the img.)

    wordRecords.forEach((wr) => {
      if (!wr.body) return;
      window.Matter.Body.setStatic(wr.body, false);
      // Small nudge down + slight randomized spin to get a natural fall.
      window.Matter.Body.setVelocity(wr.body, { x: (Math.random() - 0.5) * 1.2, y: 0.5 });
      window.Matter.Body.setAngularVelocity(wr.body, (Math.random() - 0.5) * 0.08);
    });
  }

  // -----------------------------------------------------------------
  // Tick — sync DOM transforms to body positions.
  // -----------------------------------------------------------------

  function tick() {
    if (!engine) return;

    wordRecords.forEach((wr) => {
      if (!wr.body) return;
      const p = wr.body.position;
      const dx = p.x - wr.originalCx;
      const dy = p.y - wr.originalCy;
      const a = wr.body.angle;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(a) < 0.002) {
        wr.el.style.transform = '';
      } else {
        wr.el.style.transform =
          'translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px) rotate(' + a.toFixed(4) + 'rad)';
      }
    });

    rafId = requestAnimationFrame(tick);
  }

  // -----------------------------------------------------------------
  // Reset — tween words back to their original positions, then re-static them.
  // -----------------------------------------------------------------

  let resetting = false;

  function resetPhysics() {
    if (!physicsActive || resetting || !engine) return;
    resetting = true;

    const M = window.Matter;
    const start = performance.now();

    // Snapshot current offsets so we can interpolate to zero.
    const snapshots = wordRecords.map((wr) => {
      if (!wr.body) return null;
      const p = wr.body.position;
      return {
        wr,
        sx: p.x - wr.originalCx,
        sy: p.y - wr.originalCy,
        sa: wr.body.angle,
      };
    }).filter(Boolean);

    // Freeze physics immediately so the tween isn't fighting gravity.
    snapshots.forEach(({ wr }) => {
      M.Body.setStatic(wr.body, true);
      M.Body.setVelocity(wr.body, { x: 0, y: 0 });
      M.Body.setAngularVelocity(wr.body, 0);
    });

    // Pause the RAF sync so our manual tween transforms are the source of truth.
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function step(now) {
      const t = Math.min(1, (now - start) / RESET_DURATION_MS);
      const e = easeOutCubic(t);
      snapshots.forEach(({ wr, sx, sy, sa }) => {
        const x = sx * (1 - e);
        const y = sy * (1 - e);
        const a = sa * (1 - e);
        wr.el.style.transform =
          'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px) rotate(' + a.toFixed(4) + 'rad)';
      });
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        // Snap bodies back to exact original positions.
        snapshots.forEach(({ wr }) => {
          M.Body.setPosition(wr.body, { x: wr.originalCx, y: wr.originalCy });
          M.Body.setAngle(wr.body, 0);
          wr.el.style.transform = '';
        });
        resetting = false;
        physicsActive = false;
        // Resume the idle tick (cheap — bodies are static, no movement).
        tick();
      }
    }

    requestAnimationFrame(step);
  }

  // -----------------------------------------------------------------
  // Hook physics init to greetingRevealed (+ fallback).
  // -----------------------------------------------------------------

  function scheduleInit() {
    if (isPhysicsDisabled()) return;
    window.setTimeout(initPhysics, PHYSICS_INIT_DELAY_MS);
  }

  window.addEventListener('greetingRevealed', scheduleInit, { once: true });
  window.setTimeout(() => {
    if (!physicsReady && !isPhysicsDisabled()) initPhysics();
  }, 14000);

  // Dev helper.
  window.__gravity = {
    activate: activatePhysics,
    reset: resetPhysics,
    get state() { return { physicsReady, physicsActive, words: wordRecords.length }; },
  };
})();
