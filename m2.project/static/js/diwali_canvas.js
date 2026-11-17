/**
 * Interactive Diwali Greeting Creator - Canvas Animation Engine
 * Module 3: AI-Generated Art and Creativity (MCA)
 *
 * Implements:
 * 1. Multi-Stage Fireworks bursting BEHIND the central greeting card
 * 2. 3D Tumbling Flower Petals Shower (Marigolds, Gulal Pink, Saffron)
 * 3. Floating Golden Luminescent Sparkles & Embers
 * 4. Interactive Diyas lighting up around the greeting card frame
 * 5. Web Audio Festive Sitar & Saffron Melodies
 */

(function () {
    'use strict';

    const canvas = document.getElementById('diwali-canvas');
    const ctx = canvas.getContext('2d');

    // Controls & State
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let areFireworksActive = true;
    let areFlowersActive = true;
    let areDiyasLit = true;

    // Background Image
    let bgImage = new Image();
    bgImage.src = '/static/images/diwali_base.jpg';
    let isBgLoaded = false;
    bgImage.onload = () => { isBgLoaded = true; };

    window.setDiwaliBackground = function (url) {
        isBgLoaded = false;
        bgImage.src = url;
    };

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initSparkles();
        positionDiyasAroundCard();
    });

    /* ==========================================================================
       1. FIREWORKS SYSTEM (EXPLODING BEHIND THE GREETING CARD)
       ========================================================================== */
    const fireworks = [];
    const fireworkParticles = [];
    let fireworkTimer = 0;

    const fwColors = [
        ['#f59e0b', '#fbbf24', '#fffbeb', '#fde047'], // Royal Gold
        ['#ec4899', '#f43f5e', '#ffe4e6', '#fb7185'], // Radiant Gulal Pink
        ['#38bdf8', '#0284c7', '#e0f2fe', '#67e8f9'], // Sapphire Cyan
        ['#10b981', '#34d399', '#ecfdf5', '#4ade80'], // Emerald Green
        ['#ef4444', '#f97316', '#ffedd5', '#fca5a5'], // Crimson Sparkler
        ['#a855f7', '#c084fc', '#faf5ff', '#e879f9']  // Royal Violet
    ];

    class Rocket {
        constructor(startX, startY, targetX, targetY) {
            this.x = startX;
            this.y = startY;
            this.targetX = targetX;
            this.targetY = targetY;
            const dist = Math.hypot(targetX - startX, targetY - startY);
            this.speed = Math.random() * 4 + 8;
            this.vx = ((targetX - startX) / dist) * this.speed;
            this.vy = ((targetY - startY) / dist) * this.speed;
            this.trail = [];
            this.palette = fwColors[Math.floor(Math.random() * fwColors.length)];
        }

        update(delta) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 8) this.trail.shift();

            this.x += this.vx * delta;
            this.y += this.vy * delta;

            if (this.y <= this.targetY || (this.vy > 0 && this.y >= this.targetY)) {
                this.explode();
                return false;
            }
            return true;
        }

        explode() {
            createExplosion(this.x, this.y, this.palette);
            if (window.playCrackerSound) window.playCrackerSound();
        }

        draw(ctx) {
            ctx.save();
            for (let i = 0; i < this.trail.length; i++) {
                const t = this.trail[i];
                ctx.beginPath();
                ctx.arc(t.x, t.y, 2.5 * (i / this.trail.length), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(251, 191, 36, ${i / this.trail.length})`;
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.restore();
        }
    }

    class Spark {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 7 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.gravity = 0.095;
            this.friction = 0.965;
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.015;
            this.size = Math.random() * 3 + 1.5;
        }

        update(delta) {
            this.vx *= this.friction;
            this.vy = (this.vy * this.friction) + this.gravity;
            this.x += this.vx * delta;
            this.y += this.vy * delta;
            this.alpha -= this.decay * delta;
            return this.alpha > 0;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.restore();
        }
    }

    function createExplosion(x, y, palette) {
        const count = 85;
        for (let i = 0; i < count; i++) {
            const color = palette[Math.floor(Math.random() * palette.length)];
            fireworkParticles.push(new Spark(x, y, color));
        }
    }

    function launchSkyFirework(targetX, targetY) {
        const startX = width * 0.15 + Math.random() * (width * 0.7);
        const startY = height;
        const tx = targetX !== undefined ? targetX : (width * 0.1 + Math.random() * (width * 0.8));
        const ty = targetY !== undefined ? targetY : (height * 0.06 + Math.random() * (height * 0.42));
        fireworks.push(new Rocket(startX, startY, tx, ty));
    }

    /* ==========================================================================
       2. FLOWER SHOWER SYSTEM (THOUSANDS OF 3D TUMBLING PETALS)
       ========================================================================== */
    const petals = [];
    const petalColors = [
        { r: 245, g: 158, b: 11 },  // Marigold Gold
        { r: 217, g: 119, b: 6 },   // Saffron Orange
        { r: 236, g: 72, b: 153 },  // Rose Gulal
        { r: 220, g: 38, b: 38 },   // Royal Crimson
        { r: 254, g: 243, b: 199 }  // Jasmine White
    ];

    class FlowerPetal {
        constructor(x, y) {
            this.reset(x, y);
        }

        reset(x, y) {
            this.x = x !== undefined ? x : Math.random() * (width + 100) - 50;
            this.y = y !== undefined ? y : Math.random() * -height * 0.5;
            this.size = Math.random() * 10 + 6;
            this.speedY = Math.random() * 2.2 + 1.4;
            this.speedX = (Math.random() - 0.5) * 1.2;
            this.swaySpeed = Math.random() * 0.03 + 0.015;
            this.swayPhase = Math.random() * Math.PI * 2;
            this.swayAmp = Math.random() * 2.5 + 1.0;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.06;
            this.tumble3D = Math.random() * Math.PI;
            this.tumbleSpeed = Math.random() * 0.05 + 0.02;
            this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
            this.opacity = Math.random() * 0.35 + 0.65;
        }

        update(delta) {
            this.swayPhase += this.swaySpeed * delta;
            this.rotation += this.rotSpeed * delta;
            this.tumble3D += this.tumbleSpeed * delta;

            this.x += (Math.sin(this.swayPhase) * this.swayAmp + this.speedX) * delta;
            this.y += this.speedY * delta;

            if (this.y > height + 20) {
                if (areFlowersActive && petals.length <= 600) {
                    this.reset(undefined, -20);
                } else {
                    return false;
                }
            }
            return true;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            // 3D tumble simulated by scaling width with cosine of angle
            const scaleX = Math.cos(this.tumble3D);
            ctx.scale(scaleX, 1);

            ctx.beginPath();
            ctx.ellipse(0, 0, this.size * 0.65, this.size, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
            ctx.fill();

            // Inner petal vein
            ctx.beginPath();
            ctx.moveTo(0, -this.size * 0.7);
            ctx.lineTo(0, this.size * 0.7);
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.35})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        }
    }

    function initPetals() {
        petals.length = 0;
        for (let i = 0; i < 450; i++) {
            petals.push(new FlowerPetal());
        }
    }
    initPetals();

    /* ==========================================================================
       3. FLOATING GOLDEN SPARKLES & EMBER SYSTEM
       ========================================================================== */
    const sparkles = [];
    function initSparkles() {
        sparkles.length = 0;
        for (let i = 0; i < 90; i++) {
            sparkles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2.5 + 1.2,
                speedY: -(Math.random() * 0.6 + 0.3),
                speedX: (Math.random() - 0.5) * 0.4,
                alpha: Math.random(),
                pulse: Math.random() * Math.PI * 2
            });
        }
    }
    initSparkles();

    function updateSparkles(delta) {
        for (const s of sparkles) {
            s.y += s.speedY * delta;
            s.x += s.speedX * delta;
            s.pulse += 0.04 * delta;
            s.alpha = 0.4 + 0.4 * Math.sin(s.pulse);

            if (s.y < -10) s.y = height + 10;
            if (s.x < 0) s.x = width;
            if (s.x > width) s.x = 0;
        }
    }

    function drawSparkles(ctx) {
        ctx.save();
        for (const s of sparkles) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(251, 191, 36, ${s.alpha})`;
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 8;
            ctx.fill();
        }
        ctx.restore();
    }

    /* ==========================================================================
       4. INTERACTIVE DIYAS SURROUNDING THE GREETING CARD
       ========================================================================== */
    const diyasContainer = document.getElementById('surrounding-diyas');
    const greetingCard = document.getElementById('greeting-card');
    const diyaElements = [];

    function positionDiyasAroundCard() {
        if (!diyasContainer || !greetingCard) return;
        diyasContainer.innerHTML = '';
        diyaElements.length = 0;

        // Symmetrically position 12 diyas around the greeting card frame:
        // 4 on top, 4 on bottom, 2 on left, 2 on right
        const positions = [
            // Top border
            { x: '15%', y: '0%' },
            { x: '38%', y: '0%' },
            { x: '62%', y: '0%' },
            { x: '85%', y: '0%' },
            // Bottom border
            { x: '15%', y: '100%' },
            { x: '38%', y: '100%' },
            { x: '62%', y: '100%' },
            { x: '85%', y: '100%' },
            // Left border
            { x: '0%', y: '35%' },
            { x: '0%', y: '65%' },
            // Right border
            { x: '100%', y: '35%' },
            { x: '100%', y: '65%' }
        ];

        positions.forEach((pos, idx) => {
            const diyaNode = document.createElement('div');
            diyaNode.className = `diya-node ${areDiyasLit ? 'lit' : ''}`;
            diyaNode.style.left = pos.x;
            diyaNode.style.top = pos.y;
            diyaNode.title = "Click to toggle diya flame!";

            diyaNode.innerHTML = `
                <div class="diya-halo"></div>
                <div class="diya-flame"></div>
                <div class="diya-bowl"></div>
            `;

            // Individual diya click toggle
            diyaNode.addEventListener('click', (e) => {
                e.stopPropagation();
                diyaNode.classList.toggle('lit');
                if (window.playBellChime) window.playBellChime();
            });

            diyasContainer.appendChild(diyaNode);
            diyaElements.push(diyaNode);
        });
    }

    window.toggleAllDiyas = function (forceState) {
        if (forceState !== undefined) {
            areDiyasLit = forceState;
        } else {
            areDiyasLit = !areDiyasLit;
        }

        // Sequential lighting animation
        diyaElements.forEach((diya, i) => {
            setTimeout(() => {
                if (areDiyasLit) {
                    diya.classList.add('lit');
                    if (window.playBellChime && i % 3 === 0) window.playBellChime();
                } else {
                    diya.classList.remove('lit');
                }
            }, i * 60);
        });

        return areDiyasLit;
    };

    window.toggleFireworks = function () {
        areFireworksActive = !areFireworksActive;
        if (areFireworksActive) {
            for (let i = 0; i < 4; i++) {
                setTimeout(() => launchSkyFirework(), i * 250);
            }
        }
        return areFireworksActive;
    };

    window.toggleFlowers = function () {
        areFlowersActive = !areFlowersActive;
        if (areFlowersActive && petals.length < 300) {
            initPetals();
        }
        return areFlowersActive;
    };

    // Screen click to launch targeted fireworks
    window.addEventListener('pointerdown', (e) => {
        // Only if clicking outside modal and card
        if (e.clientY < height * 0.45 || e.clientX < width * 0.2 || e.clientX > width * 0.8) {
            launchSkyFirework(e.clientX, e.clientY);
        }
    });

    /* ==========================================================================
       5. MASTER 60 FPS RENDER LOOP
       ========================================================================== */
    let lastTime = performance.now();

    function renderLoop(currentTime) {
        const delta = Math.min((currentTime - lastTime) / 16.666, 2.0);
        lastTime = currentTime;

        ctx.clearRect(0, 0, width, height);

        // 1. Draw Background
        if (isBgLoaded) {
            ctx.drawImage(bgImage, 0, 0, width, height);
        } else {
            const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
            bgGrad.addColorStop(0, '#040714');
            bgGrad.addColorStop(0.6, '#1e1b4b');
            bgGrad.addColorStop(1, '#020617');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, width, height);
        }

        // 2. Fireworks BEHIND Greeting Card
        if (areFireworksActive) {
            fireworkTimer += delta;
            if (fireworkTimer > 50) { // New rocket every ~1 second
                launchSkyFirework();
                fireworkTimer = 0;
            }
        }

        for (let i = fireworks.length - 1; i >= 0; i--) {
            if (!fireworks[i].update(delta)) {
                fireworks.splice(i, 1);
            } else {
                fireworks[i].draw(ctx);
            }
        }

        for (let i = fireworkParticles.length - 1; i >= 0; i--) {
            if (!fireworkParticles[i].update(delta)) {
                fireworkParticles.splice(i, 1);
            } else {
                fireworkParticles[i].draw(ctx);
            }
        }

        // 3. Floating Sparkles & Embers
        updateSparkles(delta);
        drawSparkles(ctx);

        // 4. Flower Petals Shower
        if (areFlowersActive && petals.length < 500) {
            for (let i = 0; i < 3; i++) {
                petals.push(new FlowerPetal());
            }
        }

        for (let i = petals.length - 1; i >= 0; i--) {
            if (!petals[i].update(delta)) {
                petals.splice(i, 1);
            } else {
                petals[i].draw(ctx);
            }
        }

        requestAnimationFrame(renderLoop);
    }

    // Initialize layout and animation loop
    setTimeout(() => {
        positionDiyasAroundCard();
    }, 150);

    requestAnimationFrame(renderLoop);

})();
