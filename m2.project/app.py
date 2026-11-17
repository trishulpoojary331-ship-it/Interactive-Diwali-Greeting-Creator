"""
Interactive Diwali Greeting Creator - Flask Web Application
MCA Coursework - Module 3: AI-Generated Art and Creativity
"""

import os
import uuid
from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from PIL import Image

import ai_generator

app = Flask(__name__)
app.config['SECRET_KEY'] = 'diwali-ai-greeting-creator-module3'
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'uploads')
app.config['STATIC_FOLDER'] = os.path.join(app.root_path, 'static')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['STATIC_FOLDER'], 'images'), exist_ok=True)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/backgrounds')
def get_backgrounds():
    """Return available AI-generated and festive backgrounds."""
    bg_list = [
        {
            "id": "base",
            "name": "Royal Palace & Lanterns (Festive Masterpiece)",
            "url": "/static/images/diwali_base.jpg",
            "type": "base",
            "description": "Grand illuminated palace across serene waters with floating sky lanterns and diyas."
        },
        {
            "id": "deepdream",
            "name": "AI DeepDream Hallucination (Mordvintsev et al.)",
            "url": "/static/images/diwali_ai_deepdream.jpg",
            "type": "deepdream",
            "description": "Convolutional feature layer activation maximization creating surreal psychedelic textures."
        },
        {
            "id": "gold_transfer",
            "name": "24K Gold Leaf Mandala Style Transfer (Gatys et al.)",
            "url": "/static/images/diwali_ai_goldtransfer.jpg",
            "type": "nst",
            "description": "Neural Style Transfer matching Gram matrix statistics of Tanjore gold leaf mandala artwork."
        }
    ]
    return jsonify({"backgrounds": bg_list})


@app.route('/api/generate-ai-background', methods=['POST'])
def generate_ai_background():
    """
    Generate unique AI-Art background using DeepDream or Neural Style Transfer.
    """
    data = request.json or {}
    technique = data.get('technique', 'deepdream')
    iterations = min(max(int(data.get('iterations', 10)), 5), 35)

    base_path = os.path.join(app.config['STATIC_FOLDER'], 'images', 'diwali_base.jpg')
    out_filename = f"gen_diwali_{technique}_{uuid.uuid4().hex[:6]}.jpg"
    out_path = os.path.join(app.config['STATIC_FOLDER'], 'images', out_filename)

    try:
        if technique == 'deepdream':
            _, elapsed = ai_generator.run_deepdream(
                image_path=base_path,
                output_path=out_path,
                num_iterations=iterations,
                octaves=3,
                max_dim=384
            )
        else:
            style_path = os.path.join(app.config['STATIC_FOLDER'], 'images', 'style_golden_mandala.jpg')
            _, elapsed = ai_generator.run_style_transfer(
                content_path=base_path,
                style_path=style_path,
                output_path=out_path,
                num_steps=iterations,
                max_dim=320
            )

        return jsonify({
            "success": True,
            "url": f"/static/images/{out_filename}",
            "elapsed": round(elapsed, 2),
            "technique": technique
        })
    except Exception as e:
        return jsonify({"error": f"Generative AI error: {str(e)}"}), 500


@app.route('/api/upload-custom', methods=['POST'])
def upload_custom():
    if 'image' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in {'jpg', 'jpeg', 'png', 'webp'}:
        return jsonify({"error": "Allowed formats: JPG, PNG, WEBP"}), 400

    name = f"upload_{uuid.uuid4().hex[:8]}.{ext}"
    target = os.path.join(app.config['UPLOAD_FOLDER'], name)
    file.save(target)

    return jsonify({"success": True, "url": f"/uploads/{name}", "filename": name})


@app.route('/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


if __name__ == '__main__':
    print("=" * 65)
    print("*** INTERACTIVE DIWALI GREETING CREATOR - FLASK SERVER ***")
    print("Module 3: AI-Generated Art and Creativity (MCA)")
    print("Running on http://localhost:5000")
    print("=" * 65)
    app.run(host='0.0.0.0', port=5000, debug=False)
