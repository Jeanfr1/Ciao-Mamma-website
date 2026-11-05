"""Production images for site/assets (kit masters stay untouched; the kit inventory hashes them).

- Real photos: drop the 90 px viewer strip (reviewer name/date), Real-ESRGAN x4 blended 60/40 with
  Lanczos (pure ESRGAN paints surfaces), saved at 2x for retina.
- Venue ambient: a heavily blurred, darkened copy of the interior that fills the space beside the
  sharp photo, so the real photo is shown whole instead of cover-cropped ("super zoom").
- Stone stages: 1.6x so cover on 1920 px windows never upscales.

Run with the Anaconda python (torch + spandrel): ~/anaconda3/bin/python3 scripts/prepare-images.py
"""
from pathlib import Path
import numpy as np
import torch
from PIL import Image, ImageFilter, ImageEnhance
from spandrel import ModelLoader

ROOT = Path(__file__).resolve().parents[1]
UP = ROOT / 'images/upscaled'
ASSETS = ROOT / 'site/assets'
UP.mkdir(parents=True, exist_ok=True)
torch.set_num_threads(8)
model = None


def esrgan(img: Image.Image, tile=256, pad=16) -> Image.Image:
    global model
    if model is None:
        model = ModelLoader().load_from_file(str(Path.home() / '.cache/realesrgan/RealESRGAN_x4plus.pth')).eval()
    a = np.asarray(img.convert('RGB'), dtype=np.float32) / 255.0
    h, w, _ = a.shape
    out = np.zeros((h * 4, w * 4, 3), dtype=np.float32)
    t = torch.from_numpy(a).permute(2, 0, 1)[None]
    with torch.no_grad():
        for y in range(0, h, tile):
            for x in range(0, w, tile):
                y0, x0 = max(y - pad, 0), max(x - pad, 0)
                y1, x1 = min(y + tile + pad, h), min(x + tile + pad, w)
                r = model(t[:, :, y0:y1, x0:x1]).clamp(0, 1)[0].permute(1, 2, 0).numpy()
                oy, ox = (y - y0) * 4, (x - x0) * 4
                th, tw = (min(y + tile, h) - y) * 4, (min(x + tile, w) - x) * 4
                out[y * 4:y * 4 + th, x * 4:x * 4 + tw] = r[oy:oy + th, ox:ox + tw]
    return Image.fromarray((out * 255).round().astype(np.uint8))


def upscale(src: Image.Image, name: str) -> Image.Image:
    cache = UP / f'{name}-x4.png'
    if cache.exists():
        big = Image.open(cache)
    else:
        big = esrgan(src)
        big.save(cache)
    lanczos = src.convert('RGB').resize(big.size, Image.LANCZOS)
    return Image.blend(lanczos, big.convert('RGB'), 0.6)


def save(img: Image.Image, name: str, width: int, q=82):
    h = round(img.height * width / img.width)
    out = img.resize((width, h), Image.LANCZOS)
    out.save(ASSETS / name, 'WEBP', quality=q, method=6)
    print(name, out.size)


# Real photos: crop the viewer strip, then upscale
interior = Image.open(ROOT / 'images/originals/Restaurante-Original.png').convert('RGB').crop((0, 90, 752, 1004))  # viewer strip on top, black border on the right
table = Image.open(ROOT / 'images/originals/Mesa-Pizza-Pasta-Original.png').convert('RGB').crop((0, 90, 668, 1012))  # viewer strip on top, black border right/bottom
interior_big = upscale(interior, 'restaurant')
save(interior_big, 'venue-interior.webp', 1512)
save(interior_big, 'venue-interior-900.webp', 900)
table_big = upscale(table, 'table')
save(table_big, 'table-real.webp', 1100)

# Ambient fill beside the sharp interior photo: the photo sits at the right of a 2.1:1 canvas,
# its left edge columns are stretched leftwards and everything is blurred hard. The colour
# continues out of the photo without a seam, and no shapes survive (no mirrored ghosts).
def ambient(photo: Image.Image) -> Image.Image:
    h = 457
    ph = photo.resize((round(photo.width * h / photo.height), h), Image.LANCZOS)
    w = round(h * 2.1)
    canvas = Image.new('RGB', (w, h))
    canvas.paste(ph, (w - ph.width, 0))
    edge = ph.crop((0, 0, 6, h)).resize((w - ph.width, h), Image.BILINEAR)
    canvas.paste(edge, (0, 0))
    canvas = canvas.filter(ImageFilter.GaussianBlur(22)).filter(ImageFilter.GaussianBlur(10))
    canvas = ImageEnhance.Brightness(canvas).enhance(0.72)
    return canvas.resize((480, round(480 * h / w)), Image.LANCZOS)


amb = ambient(interior)
amb.save(ASSETS / 'venue-ambient.webp', 'WEBP', quality=72)
print('venue-ambient.webp', amb.size)

# Stone stages for the menu and ingredient scenes
for name in ('menu-stage', 'taste-stage'):
    src = Image.open(ROOT / f'images/master/{name}.png').convert('RGB')
    big = upscale(src, name)
    save(big, f'{name}-2560.webp', 2560, q=80)

# Small ingredients are shown at most ~200 CSS px wide: 640 px copies keep retina sharpness at a third of the weight
for name in ('basil', 'tomato', 'mozzarella'):
    src = Image.open(ROOT / f'images/master/{name}.png')
    out = src.resize((640, 640), Image.LANCZOS)
    out.save(ASSETS / f'{name}-640.webp', 'WEBP', quality=86, method=6)
    print(f'{name}-640.webp', out.size)
