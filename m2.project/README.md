# Interactive Diwali Greeting Creator

A personalized, animated Diwali greeting card web application featuring glowing earthen diyas, realistic sky fireworks, falling flower petals, and festive Carnatic sitar music.
![Python](https://img.shields.io/badge/Python-AI_Processing-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-Deep_Learning-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-Deep_Learning-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![OpenCV](https://img.shields.io/badge/OpenCV-Image_Processing-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-Numerical_Computing-013243?style=for-the-badge&logo=numpy&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-Frontend-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Styling-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Interactive_Animations-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Canvas](https://img.shields.io/badge/HTML5_Canvas-Particle_Effects-E34F26?style=for-the-badge)

---
---

## ✨ Features
1. **Personalized Greeting Card:**
   - Customize recipient/sender names, festive messages, and heading typography (Royal Serif, Calligraphy Cursive, Classic Editorial).
   - Instant quick-picker templates for heartfelt Diwali blessings.
2. **Illuminated Diyas:**
   - 12 traditional earthen and brass *diyas* arranged symmetrically around the greeting card frame.
   - Animated flickering flames, radiant golden halos, and interactive click toggles.
3. **Fireworks Behind Greeting:**
   - Multi-burst celebratory fireworks (*peony, willow, chrysanthemum*) bursting in the night sky behind the floating card.
   - Click anywhere in the sky to launch direct rockets!
4. **Flower Shower & Golden Sparkles:**
   - 3D tumbling marigold, saffron, and rose petals with aerodynamic sway physics.
   - Floating luminescent golden embers and fireflies.
5. **Card Image Export:**
   - Download the customized personalized greeting card directly to your computer as a high-resolution PNG image.
6. **Festive Audio:**
   - Real-time synthesized Carnatic sitar melody, temple bells, and cracker sound effects.

---

## 📁 Project Structure
```text
e:\m2.project\
├── app.py                      # Flask web server
├── requirements.txt            # Python dependencies
├── README.md                   # Project documentation
├── static/
│   ├── css/
│   │   └── diwali.css          # Festive Indian royal theme, illuminated diyas, glassmorphism
│   ├── js/
│   │   ├── diwali_canvas.js    # 60 FPS Canvas: Fireworks behind card, flower petals, sparkles
│   │   └── diwali_ui.js        # Card customizer, Web Audio sitar synth, card image downloader
│   └── images/
│       └── diwali_base.jpg     # Festive Diwali palace & lanterns background
└── templates/
    └── index.html              # Main Interactive Diwali Greeting Creator interface
```

---

## 💻 Installation & Setup (Windows)

### Prerequisites
- Python 3.10, 3.11, or 3.12 installed on Windows.

### 1. Open Terminal / PowerShell
```powershell
cd E:\m2.project
```

### 2. (Optional) Create & Activate Virtual Environment
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Install Dependencies
```powershell
pip install -r requirements.txt

### 4. Run the Application
```powershell
python app.py
```

### 5. Open in Web Browser
Open your browser and navigate to:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 🎮 How to Use
- **Personalize Greeting:** Click **"✏️ Personalize Greeting"** in the bottom dock to change names, message, and fonts.
- **Light / Extinguish Diyas:** Click **"🪔 Diyas Lit"** or click on any individual diya to light/unlight it.
- **Toggle Fireworks:** Click **"🎆 Fireworks"** or click anywhere in the night sky to launch crackers.
- **Toggle Flowers:** Click **"🌸 Flower Shower"** to start or pause the falling petals.
- **Save Greeting Card:** Click **"📥 Save Greeting"** to download your customized card as a PNG image!
- **Music:** Click **"🔇 Music Off"** in the top-right header to enjoy festive sitar music.
