/**
 * Interactive Diwali Greeting Creator - UI & Generative Controller
 * Module 3: AI-Generated Art and Creativity (MCA)
 */

(function () {
    'use strict';

    // DOM Elements - Greeting Card Display
    const displayHeading = document.getElementById('display-greeting-heading');
    const displayMsg = document.getElementById('display-message-text');
    const displaySender = document.getElementById('display-sender-name');
    const greetingCard = document.getElementById('greeting-card');

    // DOM Elements - Controls
    const toggleDiyasBtn = document.getElementById('toggle-diyas-btn');
    const diyasBtnText = document.getElementById('diyas-btn-text');
    const toggleFireworksBtn = document.getElementById('toggle-fireworks-btn');
    const fireworksBtnText = document.getElementById('fireworks-btn-text');
    const toggleFlowersBtn = document.getElementById('toggle-flowers-btn');
    const flowersBtnText = document.getElementById('flowers-btn-text');
    const downloadCardBtn = document.getElementById('download-card-btn');
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    const musicIcon = document.getElementById('music-icon');

    // Modals
    const customizerModal = document.getElementById('customizer-modal');
    const openCustomizerBtn = document.getElementById('open-customizer-btn');
    const closeCustomizerBtn = document.getElementById('close-customizer-btn');
    const applyGreetingBtn = document.getElementById('apply-greeting-btn');

    const inputHeading = document.getElementById('input-greeting-heading');
    const inputMsg = document.getElementById('input-greeting-msg');
    const inputSender = document.getElementById('input-sender-name');
    const fontStyleSelect = document.getElementById('font-style-select');
    const templateChips = document.querySelectorAll('.chip');



    /* ==========================================================================
       1. WEB AUDIO SYNTHESIZER (FESTIVE SITAR, BELLS & CRACKERS)
       ========================================================================== */
    let audioCtx = null;
    let isMusicPlaying = false;
    let sitarInterval = null;

    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // Diwali festive raga notes (Raga Bhairav / Yaman Kalyan scale in Hz)
    const sitarScale = [261.63, 277.18, 329.63, 349.23, 392.00, 415.30, 493.88, 523.25];

    function startFestiveMusic() {
        initAudio();
        if (isMusicPlaying) return;
        isMusicPlaying = true;
        musicToggleBtn.classList.add('active');
        musicIcon.textContent = '🔊';
        musicToggleBtn.innerHTML = '<span class="icon">🔊</span> Music On';

        let step = 0;
        sitarInterval = setInterval(() => {
            if (!isMusicPlaying) return;
            const freq = sitarScale[Math.floor(Math.random() * sitarScale.length)];
            playSitarPluck(freq, 0.4);
            step++;
        }, 360);
    }

    function stopFestiveMusic() {
        isMusicPlaying = false;
        musicToggleBtn.classList.remove('active');
        musicIcon.textContent = '🔇';
        musicToggleBtn.innerHTML = '<span class="icon">🔇</span> Music Off';
        if (sitarInterval) {
            clearInterval(sitarInterval);
            sitarInterval = null;
        }
    }

    function playSitarPluck(freq, dur) {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.99, now + dur);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + dur);
    }

    window.playBellChime = function () {
        initAudio();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    };

    window.playCrackerSound = function () {
        initAudio();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const bufferSize = audioCtx.sampleRate * 0.2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, now);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        noise.start(now);
    };

    musicToggleBtn.addEventListener('click', () => {
        if (isMusicPlaying) stopFestiveMusic();
        else startFestiveMusic();
    });

    /* ==========================================================================
       2. GREETING CARD PERSONALIZATION
       ========================================================================== */
    openCustomizerBtn.addEventListener('click', () => customizerModal.classList.add('open'));
    closeCustomizerBtn.addEventListener('click', () => customizerModal.classList.remove('open'));

    // Quick templates
    templateChips.forEach(chip => {
        chip.addEventListener('click', () => {
            inputMsg.value = chip.dataset.msg;
            applyGreetingContent();
            if (window.toggleAllDiyas) window.toggleAllDiyas(true);
        });
    });

    function applyGreetingContent() {
        displayHeading.textContent = inputHeading.value.trim() || 'Happy Diwali';
        displayMsg.textContent = inputMsg.value.trim() || 'May the light of diyas bring you eternal joy!';
        displaySender.textContent = inputSender.value.trim() || 'Your Well-Wisher';

        displayHeading.className = 'card-greeting-heading';
        const fontStyle = fontStyleSelect.value;
        if (fontStyle === 'cursive') displayHeading.classList.add('font-cursive');
        else if (fontStyle === 'classic') displayHeading.classList.add('font-classic');
    }

    applyGreetingBtn.addEventListener('click', () => {
        applyGreetingContent();
        customizerModal.classList.remove('open');
        // Spark a joyful chime and re-ignite diyas around message
        if (window.playBellChime) window.playBellChime();
        if (window.toggleAllDiyas) window.toggleAllDiyas(true);
    });

    // Real-time live sync while typing
    [inputHeading, inputMsg, inputSender].forEach(input => {
        input.addEventListener('input', applyGreetingContent);
    });

    /* ==========================================================================
       3. INTERACTIVE DOCK ACTIONS
       ========================================================================== */
    toggleDiyasBtn.addEventListener('click', () => {
        initAudio();
        const isLit = window.toggleAllDiyas();
        toggleDiyasBtn.classList.toggle('active', isLit);
        diyasBtnText.textContent = isLit ? 'Diyas Lit (Click to Blow Out)' : 'Diyas Out (Click to Light)';
    });

    toggleFireworksBtn.addEventListener('click', () => {
        initAudio();
        const isFwActive = window.toggleFireworks();
        toggleFireworksBtn.classList.toggle('active', isFwActive);
        fireworksBtnText.textContent = `Fireworks: ${isFwActive ? 'ON' : 'OFF'}`;
    });

    toggleFlowersBtn.addEventListener('click', () => {
        const isFlActive = window.toggleFlowers();
        toggleFlowersBtn.classList.toggle('active', isFlActive);
        flowersBtnText.textContent = `Flower Shower: ${isFlActive ? 'ON' : 'OFF'}`;
    });

    /* ==========================================================================
       4. DOWNLOAD GREETING CARD (EXPORT CANVAS IMAGE)
       ========================================================================== */
    downloadCardBtn.addEventListener('click', () => {
        // Draw card snapshot overlay onto a temporary export canvas
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = 1200;
        exportCanvas.height = 800;
        const eCtx = exportCanvas.getContext('2d');

        // Draw background canvas
        const srcCanvas = document.getElementById('diwali-canvas');
        eCtx.drawImage(srcCanvas, 0, 0, 1200, 800);

        // Draw festive dark frame & card border
        eCtx.fillStyle = 'rgba(12, 16, 33, 0.88)';
        eCtx.strokeStyle = '#f59e0b';
        eCtx.lineWidth = 4;

        const cardX = 220, cardY = 160, cardW = 760, cardH = 480;
        eCtx.beginPath();
        eCtx.roundRect(cardX, cardY, cardW, cardH, 20);
        eCtx.fill();
        eCtx.stroke();

        // Card typography
        eCtx.textAlign = 'center';
        eCtx.fillStyle = '#fbbf24';
        eCtx.font = '22px "Cinzel Decorative", Georgia, serif';
        eCtx.fillText('ॐ • शुभ दीपावली • श्री', 600, 220);

        eCtx.fillStyle = '#ffffff';
        eCtx.font = 'bold 50px "Cinzel Decorative", Georgia, serif';
        eCtx.fillText(displayHeading.textContent, 600, 300);

        eCtx.fillStyle = '#fef08a';
        eCtx.font = 'italic 24px "Playfair Display", Georgia, serif';
        eCtx.fillText(displayMsg.textContent.slice(0, 55), 600, 390);
        if (displayMsg.textContent.length > 55) {
            eCtx.fillText(displayMsg.textContent.slice(55, 115), 600, 425);
        }

        eCtx.fillStyle = '#94a3b8';
        eCtx.font = '16px "Outfit", sans-serif';
        eCtx.fillText('WITH WARM WISHES FROM,', 600, 520);

        eCtx.fillStyle = '#f59e0b';
        eCtx.font = 'italic bold 36px "Playfair Display", Georgia, serif';
        eCtx.fillText(displaySender.textContent, 600, 570);

        // Surrounding Diyas on card borders
        const diyaPositions = [
            [cardX + cardW * 0.2, cardY], [cardX + cardW * 0.5, cardY], [cardX + cardW * 0.8, cardY],
            [cardX + cardW * 0.2, cardY + cardH], [cardX + cardW * 0.5, cardY + cardH], [cardX + cardW * 0.8, cardY + cardH],
            [cardX, cardY + cardH * 0.5], [cardX + cardW, cardY + cardH * 0.5]
        ];

        diyaPositions.forEach(([dx, dy]) => {
            // Diya bowl
            eCtx.beginPath();
            eCtx.arc(dx, dy + 6, 16, 0, Math.PI);
            eCtx.fillStyle = '#d97706';
            eCtx.fill();
            // Diya flame
            eCtx.beginPath();
            eCtx.ellipse(dx, dy - 8, 8, 16, 0, 0, Math.PI * 2);
            eCtx.fillStyle = '#fef08a';
            eCtx.shadowColor = '#f59e0b';
            eCtx.shadowBlur = 18;
            eCtx.fill();
            eCtx.shadowBlur = 0;
        });

        // Trigger download
        const link = document.createElement('a');
        link.download = `Diwali_Greeting_${Date.now()}.png`;
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
    });

    customizerModal.addEventListener('click', (e) => {
        if (e.target === customizerModal) customizerModal.classList.remove('open');
    });

})();
