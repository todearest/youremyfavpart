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
      
      // Fix untuk masalah canvas kerestart ketika scroll di HP
      let cachedWidth = window.innerWidth;
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
        e.preventDefault(); 
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
      document.addEventListener("mouseup", () => { isDrawing = false; });

      // Mobile events - Fix agar tidak stuck/macet saat di touch
      canvas.addEventListener(
        "touchstart",
        (e) => {
          isDrawing = true;
          scratch(e);
        },
        { passive: false }
      );
      canvas.addEventListener("touchmove", scratch, { passive: false });
      
      // Bind event 'end' ke document agar HP tidak bingung
      document.addEventListener("touchend", () => { isDrawing = false; });
      document.addEventListener("touchcancel", () => { isDrawing = false; });
    }
  };

  // Run the logic on the first load
  initPageLogic();

  // ==========================================
  // 4. SEAMLESS SPA ROUTER (No-Reload Navigation)
  // ==========================================
  document.body.addEventListener("click", async (e) => {
    const link = e.target.closest("a");

    if (
      link &&
      link.getAttribute("href") &&
      link.getAttribute("href").endsWith(".html")
    ) {
      e.preventDefault();
      const url = link.getAttribute("href");
      const mainElement = document.querySelector("main");

      mainElement.style.opacity = "0";

      try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const newMain = doc.querySelector("main");

        setTimeout(() => {
          if (newMain) {
            mainElement.innerHTML = newMain.innerHTML;
            mainElement.className = newMain.className;

            history.pushState(null, "", url);
            window.scrollTo({ top: 0, behavior: "smooth" });

            initPageLogic();
            mainElement.style.opacity = "1";
          }
        }, 400); 
      } catch (err) {
        console.error(
          "Seamless navigation failed, falling back to standard reload.",
          err,
        );
        window.location.href = url;
      }
    }
  });

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
