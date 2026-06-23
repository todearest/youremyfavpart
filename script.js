document.addEventListener("DOMContentLoaded", () => {
  // 1. MUSIC PLAYER LOGIC
  const audio = document.getElementById("bg-music");
  const musicBtn = document.getElementById("music-btn");

  if (audio && musicBtn) {
    audio.volume = 0.4; // Soft volume for a romantic poem vibe

    musicBtn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().catch((e) => console.warn("Audio play failed:", e));
        musicBtn.innerHTML = "♡ Pause Music";
      } else {
        audio.pause();
        musicBtn.innerHTML = "♡ Play Music";
      }
    });
  }

  // 2. SCROLL REVEAL (FADE-UP ANIMATION)
  const fadeElements = document.querySelectorAll(".fade-up");

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Unobserve after revealing to keep it visible
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach((element) => {
    observer.observe(element);
  });

  // Make sure elements currently in viewport on load become visible immediately
  setTimeout(() => {
    fadeElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        element.classList.add("visible");
      }
    });
  }, 100);

  // 3. GENTLE PARALLAX FOR BACKGROUND DECORATIONS (Desktop Only)
  const decorations = document.querySelectorAll(".decor");

  window.addEventListener("scroll", () => {
    // Only run parallax on desktop to prevent mobile scrolling jitter
    if (window.innerWidth > 768) {
      const scrolled = window.scrollY;
      decorations.forEach((decor) => {
        const speed = decor.getAttribute("data-speed");
        // Calculate new Y position
        const yPos = -(scrolled * speed);
        decor.style.transform = `translateY(${yPos}px) ${decor.style.transform.replace(/translateY\(.*?\)/, "")}`;
      });
    }
  });

  // 4. SCRATCH TO REVEAL LOGIC
  const canvas = document.getElementById("scratch-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const container = canvas.parentElement;

    // Function to set up the pink cover
    const initCanvas = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;

      // Fill with solid soft pink
      ctx.fillStyle = "#fbeff2";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add instructions in the middle
      ctx.font = 'italic 28px "Cormorant Garamond"';
      ctx.fillStyle = "#8b5a65";
      ctx.textAlign = "center";
      ctx.fillText(
        "Scratch gently to unveil my heart...",
        canvas.width / 2,
        canvas.height / 2,
      );
    };

    // Wait a tiny bit for the image/fonts to load so container height is accurate
    setTimeout(initCanvas, 300);
    window.addEventListener("resize", initCanvas);

    let isDrawing = false;

    const getTouchPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches ? e.touches[0] : e;
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    };

    const scratch = (e) => {
      if (!isDrawing) return;
      e.preventDefault(); // Prevents the screen from scrolling while scratching on mobile

      const pos = getTouchPos(e);

      // "Destination-out" makes the drawing act like an eraser
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 45, 0, Math.PI * 2); // 45px brush size
      ctx.fill();
    };

    // Mouse Events for Desktop
    canvas.addEventListener("mousedown", (e) => {
      isDrawing = true;
      scratch(e);
    });
    canvas.addEventListener("mousemove", scratch);
    window.addEventListener("mouseup", () => (isDrawing = false));

    // Touch Events for Mobile
    canvas.addEventListener(
      "touchstart",
      (e) => {
        isDrawing = true;
        scratch(e);
      },
      { passive: false },
    );
    canvas.addEventListener("touchmove", scratch, { passive: false });
    window.addEventListener("touchend", () => (isDrawing = false));
  }
});
