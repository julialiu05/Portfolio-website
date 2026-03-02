const modals = document.querySelectorAll(".modal");
const cards = document.querySelectorAll(".card");
const resumeButton = document.querySelector("#open-resume");
const resumeDrawer = document.querySelector("#resume");
const contactForm = document.querySelector(".contact__form");

const toggleOverlay = (overlay, show) => {
  if (!overlay) return;
  overlay.classList.toggle("active", show);
  overlay.setAttribute("aria-hidden", show ? "false" : "true");
};

cards.forEach((card) => {
  card.addEventListener("click", () => {
    const target = document.getElementById(card.dataset.modal);
    toggleOverlay(target, true);
  });
});

modals.forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) {
      toggleOverlay(modal, false);
    }
  });

  const closeButton = modal.querySelector(".modal__close");
  if (closeButton) {
    closeButton.addEventListener("click", () => toggleOverlay(modal, false));
  }
});

if (resumeButton && resumeDrawer) {
  resumeButton.addEventListener("click", () => toggleOverlay(resumeDrawer, true));

  const closeButton = resumeDrawer.querySelector(".drawer__close");
  if (closeButton) {
    closeButton.addEventListener("click", () => toggleOverlay(resumeDrawer, false));
  }

  resumeDrawer.addEventListener("click", (event) => {
    if (event.target.classList.contains("drawer")) {
      toggleOverlay(resumeDrawer, false);
    }
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = contactForm.querySelector("button");
    if (!button) return;
    const original = button.textContent;
    button.textContent = "Message sent!";
    button.disabled = true;
    setTimeout(() => {
      button.textContent = original;
      button.disabled = false;
      contactForm.reset();
    }, 2200);
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  modals.forEach((modal) => toggleOverlay(modal, false));
  toggleOverlay(resumeDrawer, false);
});
