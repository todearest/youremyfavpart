document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. GLOBAL MUSIC PLAYER
  // ==========================================
  const audio = document.getElementById("bg-music");
  const musicBtn = document.getElementById("music-btn");

  if (audio && musicBtn) {
    audio.volume = 0.4; // Soft volume for poetry

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

  // ==========================================
  // 2. GLOBAL BACKGROUND PARALLAX (Desktop)
  // ==========================================
  const decorations = document.querySelectorAll(".decor");
  window.addEventListener("scroll", () => {
    if (window.innerWidth > 768) {
      const scrolled = window.scrollY;
      decorations.forEach((decor) => {
        const speed = decor.getAttribute("data-speed");
        const yPos = -(scrolled * speed);
        decor.style.transform = `translateY(${yPos}px) ${decor.style.transform.replace(/translateY\(.*?\)/, "")}`;
      });
    }
  });

  // ==========================================
  // 3. CORE PAGE LOGIC (Wrapped for Reusability)
  // ==========================================
  // We wrap this in a function so we can re-trigger it every time a new page is loaded via AJAX.
  const initPageLogic = () => {
    // A. Fade-Up Animations
    const fadeElements = document.querySelectorAll(".fade-up");
    const observerOptions = { root: null, rootMargin: "0px", threshold: 0.15 };
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    fadeElements.forEach((element) => observer.observe(element));

    // Fallback for elements already in view
    setTimeout(() => {
      fadeElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight) element.classList.add("visible");
      });
    }, 100);

    // B. Scratch Card Logic
    const canvas = document.getElementById("scratch-canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const container = canvas.parentElement;

      const initCanvas = () => {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;

        ctx.fillStyle = "#fbeff2";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'italic 24px "Cormorant Garamond"';
        ctx.fillStyle = "#8b5a65";
        ctx.textAlign = "center";

        // Adjust text for smaller mobile screens
        if (window.innerWidth < 768) {
          ctx.fillText(
            "Scratch to unveil...",
            canvas.width / 2,
            canvas.height / 2,
          );
        } else {
          ctx.fillText(
            "Scratch gently to unveil my heart...",
            canvas.width / 2,
            canvas.height / 2,
          );
        }
      };

      setTimeout(initCanvas, 300);
      // Store the initial screen width
      let cachedWidth = window.innerWidth;

      // Only redraw the canvas if the WIDTH changes, ignoring height changes from scrolling
      window.addEventListener("resize", () => {
        if (window.innerWidth !== cachedWidth) {
          cachedWidth = window.innerWidth;
          initCanvas();
        }
      });

      let isDrawing = false;

      const getTouchPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      };

      const scratch = (e) => {
        if (!isDrawing) return;
        e.preventDefault(); // Traps scrolling ONLY inside the canvas bounds
        const pos = getTouchPos(e);
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 40, 0, Math.PI * 2);
        ctx.fill();
      };

      // Desktop events
      canvas.addEventListener("mousedown", (e) => {
        isDrawing = true;
        scratch(e);
      });
      canvas.addEventListener("mousemove", scratch);
      window.addEventListener("mouseup", () => (isDrawing = false));

      // Mobile events
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
  };

  // Run the logic on the first load
  initPageLogic();

  // ==========================================
  // 4. SEAMLESS SPA ROUTER (No-Reload Navigation)
  // ==========================================
  document.body.addEventListener("click", async (e) => {
    const link = e.target.closest("a");

    // Only intercept clicks on local HTML links
    if (
      link &&
      link.getAttribute("href") &&
      link.getAttribute("href").endsWith(".html")
    ) {
      e.preventDefault();
      const url = link.getAttribute("href");
      const mainElement = document.querySelector("main");

      // 1. Fade out current content
      mainElement.style.opacity = "0";

      try {
        // 2. Fetch the next page in the background
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const newMain = doc.querySelector("main");

        setTimeout(() => {
          if (newMain) {
            // 3. Swap the content
            mainElement.innerHTML = newMain.innerHTML;
            mainElement.className = newMain.className;

            // 4. Update the browser URL without reloading
            history.pushState(null, "", url);
            window.scrollTo({ top: 0, behavior: "smooth" });

            // 5. Re-initialize the animations and scratch card
            initPageLogic();

            // 6. Fade the new content back in
            mainElement.style.opacity = "1";
          }
        }, 400); // Wait for the fade-out CSS transition
      } catch (err) {
        console.error(
          "Seamless navigation failed, falling back to standard reload.",
          err,
        );
        window.location.href = url;
      }
    }
  });

  // Handle browser back/forward buttons smoothly
  window.addEventListener("popstate", async () => {
    const mainElement = document.querySelector("main");
    mainElement.style.opacity = "0";
    try {
      const response = await fetch(window.location.href);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      setTimeout(() => {
        mainElement.innerHTML = doc.querySelector("main").innerHTML;
        mainElement.className = doc.querySelector("main").className;
        initPageLogic();
        mainElement.style.opacity = "1";
      }, 400);
    } catch (err) {
      window.location.reload();
    }
  });
});
