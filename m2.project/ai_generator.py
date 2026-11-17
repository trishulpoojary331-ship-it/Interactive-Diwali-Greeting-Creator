"""
Interactive Diwali Greeting Creator - AI Generative Engine
Module 3: AI-Generated Art and Creativity

Provides genuine Generative AI algorithms:
1. DeepDream: Feature layer gradient ascent with octave pyramid decomposition.
2. Neural Style Transfer: Gram matrix feature correlation matching.
"""

import os
import time
from PIL import Image

import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
import torchvision.models as models

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

IMAGENET_MEAN = torch.tensor([0.485, 0.456, 0.406]).to(DEVICE).view(1, 3, 1, 1)
IMAGENET_STD = torch.tensor([0.229, 0.224, 0.225]).to(DEVICE).view(1, 3, 1, 1)


def gram_matrix(input_tensor):
    """
    Computes the Gram Matrix G = F * F^T.
    Measures feature correlations across channels, capturing artistic style,
    brushstrokes, and color distributions independently of spatial position.
    """
    b, c, h, w = input_tensor.size()
    features = input_tensor.view(b, c, h * w)
    gram = torch.bmm(features, features.transpose(1, 2))
    return gram / (c * h * w)


def normalize_batch(batch):
    return (batch - IMAGENET_MEAN) / IMAGENET_STD


class SqueezeNetFeatureExtractor(nn.Module):
    """Ultra-fast CNN feature extractor suitable for CPU laptop inference."""
    def __init__(self):
        super(SqueezeNetFeatureExtractor, self).__init__()
        try:
            base = models.squeezenet1_0(weights=models.SqueezeNet1_0_Weights.DEFAULT).features
        except Exception:
            base = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT).features

        for m in base.modules():
            if isinstance(m, nn.ReLU):
                m.inplace = False

        self.features = base.to(DEVICE).eval()
        for param in self.features.parameters():
            param.requires_grad = False

    def forward(self, x):
        results = {}
        out = x
        for i, layer in enumerate(self.features):
            out = layer(out)
            if i in [1, 4, 7, 9, 12]:
                results[f'layer_{i}'] = out
        return results


_EXTRACTOR = None

def get_extractor():
    global _EXTRACTOR
    if _EXTRACTOR is None:
        _EXTRACTOR = SqueezeNetFeatureExtractor()
    return _EXTRACTOR


def load_image_tensor(image_path, max_dim=384):
    img = Image.open(image_path).convert("RGB")
    orig_w, orig_h = img.size
    scale = max_dim / max(orig_w, orig_h)
    new_w = max(64, int((orig_w * scale) // 16) * 16)
    new_h = max(64, int((orig_h * scale) // 16) * 16)
    img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    tensor = transforms.ToTensor()(img_resized).unsqueeze(0).to(DEVICE)
    return tensor, (orig_w, orig_h)


def tensor_to_image(tensor, target_size=None):
    t = tensor.detach().cpu().squeeze(0).clamp(0.0, 1.0)
    pil_img = transforms.ToPILImage()(t)
    if target_size:
        pil_img = pil_img.resize(target_size, Image.Resampling.LANCZOS)
    return pil_img


def run_deepdream(
    image_path,
    output_path,
    num_iterations=12,
    lr=0.045,
    octaves=3,
    octave_scale=1.4,
    max_dim=384,
    progress_callback=None
):
    """
    Executes DeepDream (Mordvintsev et al., Google Research).
    Ascends gradients directly on image pixels to maximize activation
    of high-level Diwali festive features.
    """
    start_time = time.time()
    extractor = get_extractor()

    orig_image = Image.open(image_path).convert("RGB")
    orig_w, orig_h = orig_image.size
    scale = max_dim / max(orig_w, orig_h)
    target_w, target_h = int(orig_w * scale), int(orig_h * scale)
    base_img = orig_image.resize((target_w, target_h), Image.Resampling.LANCZOS)

    # Multi-scale octave pyramid
    octave_images = [base_img]
    for _ in range(octaves - 1):
        prev_w, prev_h = octave_images[-1].size
        new_w, new_h = max(32, int(prev_w / octave_scale)), max(32, int(prev_h / octave_scale))
        octave_images.append(octave_images[-1].resize((new_w, new_h), Image.Resampling.BICUBIC))
    octave_images.reverse()

    detail = torch.zeros(1, 3, octave_images[0].size[1], octave_images[0].size[0]).to(DEVICE)
    total_steps = len(octave_images) * num_iterations
    current_step = 0

    for oct_idx, oct_img in enumerate(octave_images):
        oct_tensor = transforms.ToTensor()(oct_img).unsqueeze(0).to(DEVICE)

        if oct_idx > 0:
            detail = F.interpolate(
                detail,
                size=(oct_img.size[1], oct_img.size[0]),
                mode="bilinear",
                align_corners=False
            )
            img_tensor = torch.clamp(oct_tensor + detail, 0.0, 1.0).detach().clone()
        else:
            img_tensor = oct_tensor.clone().detach()

        img_tensor.requires_grad_(True)

        for _ in range(num_iterations):
            norm_tensor = normalize_batch(img_tensor)
            features = extractor(norm_tensor)
            target_feat = features['layer_7']
            loss = target_feat.norm()
            loss.backward()

            with torch.no_grad():
                grad = img_tensor.grad
                grad_norm = grad.abs().mean()
                if grad_norm > 1e-8:
                    grad = grad / grad_norm
                img_tensor.data += lr * grad
                img_tensor.data.clamp_(0.0, 1.0)
                img_tensor.grad.zero_()

            current_step += 1
            if progress_callback:
                progress_callback(current_step, total_steps, loss.item())

        detail = img_tensor - oct_tensor

    final_pil = tensor_to_image(img_tensor, (orig_w, orig_h))
    final_pil.save(output_path, quality=92)
    elapsed = time.time() - start_time
    return output_path, elapsed


def run_style_transfer(
    content_path,
    style_path,
    output_path,
    num_steps=25,
    style_weight=1e4,
    content_weight=1.0,
    max_dim=320,
    progress_callback=None
):
    """
    Executes Neural Style Transfer (Gatys et al.).
    Transforms Diwali background with traditional gold leaf mandala styling.
    """
    start_time = time.time()
    content_tensor, orig_size = load_image_tensor(content_path, max_dim=max_dim)
    style_tensor, _ = load_image_tensor(style_path, max_dim=max_dim)

    if style_tensor.shape[2:] != content_tensor.shape[2:]:
        style_tensor = F.interpolate(
            style_tensor,
            size=content_tensor.shape[2:],
            mode="bilinear",
            align_corners=False
        )

    extractor = get_extractor()

    with torch.no_grad():
        content_features = extractor(normalize_batch(content_tensor))
        style_features = extractor(normalize_batch(style_tensor))

    style_grams = {k: gram_matrix(feat) for k, feat in style_features.items()}

    generated_img = content_tensor.clone().detach()
    noise = torch.randn_like(generated_img) * 0.04
    generated_img = torch.clamp(generated_img + noise, 0.0, 1.0)
    generated_img.requires_grad_(True)

    optimizer = torch.optim.Adam([generated_img], lr=0.04)

    style_layer_weights = {
        'layer_1': 0.2,
        'layer_4': 0.35,
        'layer_7': 0.25,
        'layer_9': 0.2
    }
    content_layer = 'layer_7'

    for step in range(1, num_steps + 1):
        optimizer.zero_grad()
        norm_gen = normalize_batch(generated_img)
        gen_features = extractor(norm_gen)

        c_loss = F.mse_loss(gen_features[content_layer], content_features[content_layer]) * content_weight

        s_loss = 0.0
        for layer_name, weight in style_layer_weights.items():
            if layer_name in gen_features and layer_name in style_grams:
                gen_gram = gram_matrix(gen_features[layer_name])
                s_loss += weight * F.mse_loss(gen_gram, style_grams[layer_name])
        s_loss = s_loss * style_weight

        # TV Loss
        h_diff = torch.mean(torch.abs(generated_img[:, :, 1:, :] - generated_img[:, :, :-1, :]))
        w_diff = torch.mean(torch.abs(generated_img[:, :, :, 1:] - generated_img[:, :, :, :-1]))
        tv_loss = (h_diff + w_diff) * 1e-3

        total_loss = c_loss + s_loss + tv_loss
        total_loss.backward()
        optimizer.step()

        with torch.no_grad():
            generated_img.clamp_(0.0, 1.0)

        if progress_callback:
            progress_callback(step, num_steps, total_loss.item())

    output_img = tensor_to_image(generated_img, orig_size)
    output_img.save(output_path, quality=92)
    elapsed = time.time() - start_time
    return output_path, elapsed
