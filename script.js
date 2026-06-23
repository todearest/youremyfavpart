// B. Scratch Card Logic
        const canvas = document.getElementById('scratch-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const container = canvas.parentElement;
            
            const initCanvas = () => {
                canvas.width = container.offsetWidth;
                canvas.height = container.offsetHeight;
                
                ctx.fillStyle = '#fbeff2';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.font = 'italic 24px "Cormorant Garamond"';
                ctx.fillStyle = '#8b5a65';
                ctx.textAlign = 'center';
                
                // Adjust text for smaller mobile screens
                if(window.innerWidth < 768) {
                    ctx.fillText('Scratch to unveil...', canvas.width / 2, canvas.height / 2);
                } else {
                    ctx.fillText('Scratch gently to unveil my heart...', canvas.width / 2, canvas.height / 2);
                }
            };
            
            setTimeout(initCanvas, 300);
            
            // THE MOBILE SCROLL FIX
            let cachedWidth = window.innerWidth;
            window.addEventListener('resize', () => {
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
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 40, 0, Math.PI * 2);
                ctx.fill();
            };

            // Desktop events
            canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
            canvas.addEventListener('mousemove', scratch);
            window.addEventListener('mouseup', () => isDrawing = false);

            // Mobile events
            canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, { passive: false });
            canvas.addEventListener('touchmove', scratch, { passive: false });
            window.addEventListener('touchend', () => isDrawing = false);
        }
