const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const revealElements = document.querySelectorAll(".reveal");

if (prefersReducedMotion.matches) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });
  });
});

const faqItems = Array.from(document.querySelectorAll("[data-faq-item]"));
const faqSearchInput = document.querySelector("#faq-search");

if (faqItems.length > 0) {
  const faqStatus = document.querySelector("[data-faq-status]");
  const faqEmpty = document.querySelector("[data-faq-empty]");
  const faqSections = Array.from(document.querySelectorAll("[data-faq-section]"));

  const setStatus = (visibleCount, query) => {
    if (!faqStatus) {
      return;
    }

    if (!query) {
      faqStatus.textContent = "Showing all questions";
      return;
    }

    faqStatus.textContent =
      visibleCount === 1
        ? "Showing 1 matching question"
        : `Showing ${visibleCount} matching questions`;
  };

  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    if (!button) {
      return;
    }

    button.addEventListener("click", () => {
      const isOpen = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });

  const applyFaqFilter = () => {
    const query = faqSearchInput?.value.trim().toLowerCase() ?? "";
    let visibleCount = 0;

    faqItems.forEach((item) => {
      const text = item.textContent.toLowerCase();
      const isVisible = !query || text.includes(query);
      item.hidden = !isVisible;
      item.classList.toggle("is-filter-open", Boolean(query && isVisible));
      visibleCount += isVisible ? 1 : 0;
    });

    faqSections.forEach((section) => {
      const hasVisibleItems = Array.from(section.querySelectorAll("[data-faq-item]")).some((item) => !item.hidden);
      section.hidden = !hasVisibleItems;
    });

    if (faqEmpty) {
      faqEmpty.hidden = visibleCount !== 0;
    }

    setStatus(visibleCount, query);
  };

  faqSearchInput?.addEventListener("input", applyFaqFilter);
  applyFaqFilter();
}

const zoomableImages = document.querySelectorAll(
  ".feature-card img, .insight-card img, .reviews-hero img, .review-tile img, .release-card img, .timeline-card img, .foundation-card img, .mosaic-panel img, .release-entry img, .release-entry-media img, .release-entry-media-duo img, .release-entry-media-triple img, .watch-collage img, .feature-media-stack img, .faq-media img"
);

if (zoomableImages.length > 0) {
  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = `
    <div class="image-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Expanded image view">
      <button class="image-lightbox__close" type="button" aria-label="Close image viewer">Close</button>
      <div class="image-lightbox__frame">
        <img class="image-lightbox__image" alt="">
      </div>
      <p class="image-lightbox__caption" hidden></p>
    </div>
  `;

  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector(".image-lightbox__image");
  const lightboxCaption = lightbox.querySelector(".image-lightbox__caption");
  const lightboxClose = lightbox.querySelector(".image-lightbox__close");
  let lastActiveElement = null;

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
    lightboxCaption.textContent = "";
    lightboxCaption.hidden = true;

    if (lastActiveElement instanceof HTMLElement) {
      lastActiveElement.focus();
    }
  };

  const openLightbox = (image) => {
    lastActiveElement = document.activeElement;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "Expanded screenshot";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");

    const caption = image.alt?.trim() ?? "";
    if (caption) {
      lightboxCaption.textContent = caption;
      lightboxCaption.hidden = false;
    } else {
      lightboxCaption.textContent = "";
      lightboxCaption.hidden = true;
    }

    lightboxClose.focus();
  };

  zoomableImages.forEach((image) => {
    image.dataset.zoomable = "true";
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `${image.alt || "Image"}. Tap to view full screen.`);

    image.addEventListener("click", () => openLightbox(image));
    image.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      openLightbox(image);
    });
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target === lightboxClose) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
}
