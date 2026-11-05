"""Compose README assets from studio/readme captures into .github/assets/ (run after readme-assets.mjs)."""
import shutil, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC, OUT = ROOT / 'studio/readme', ROOT / '.github/assets'
OUT.mkdir(parents=True, exist_ok=True)
shutil.copy(SRC / 'banner.png', OUT / 'banner.png')

# Scroll GIF: every other frame, first/last held, 8 fps, 760 px, 96 colours (keeps it under 4 MB)
frames = sorted((SRC / 'frames').glob('f_*.png'))[::2]
seq = SRC / 'seq'; shutil.rmtree(seq, ignore_errors=True); seq.mkdir()
order = [frames[0]] * 7 + frames + [frames[-1]] * 10
for i, f in enumerate(order):
    shutil.copy(f, seq / f'g_{i:04d}.png')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '8', '-i', str(seq / 'g_%04d.png'), '-vf',
                'fps=8,scale=760:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4',
                '-loop', '0', str(OUT / 'hero-scroll.gif')], check=True)


def browser(img: Image.Image, w=700) -> Image.Image:
    img = img.convert('RGB'); img = img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
    bar = 30; frame = Image.new('RGB', (w, img.height + bar), '#2b2926'); d = ImageDraw.Draw(frame)
    for k, c in enumerate(('#ff5f57', '#febc2e', '#28c840')):
        d.ellipse((12 + k * 18, 10, 22 + k * 18, 20), fill=c)
    d.rounded_rectangle((90, 7, w - 90, 23), 6, fill='#3a3733')
    frame.paste(img, (0, bar))
    return frame


def phone(img: Image.Image, w=300) -> Image.Image:
    img = img.convert('RGB'); img = img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
    pad = 12; body = Image.new('RGBA', (w + 2 * pad, img.height + 2 * pad), (0, 0, 0, 0)); d = ImageDraw.Draw(body)
    d.rounded_rectangle((0, 0, body.width - 1, body.height - 1), 38, fill='#141210')
    mask = Image.new('L', img.size, 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, img.height - 1), 28, fill=255)
    body.paste(img, (pad, pad), mask)
    return body


def sheet(tiles, cols, gap, bg, margin):
    rows = (len(tiles) + cols - 1) // cols
    tw, th = max(t.width for t in tiles), max(t.height for t in tiles)
    out = Image.new('RGB', (margin * 2 + cols * tw + (cols - 1) * gap, margin * 2 + rows * th + (rows - 1) * gap), bg)
    for i, t in enumerate(tiles):
        x, y = margin + (i % cols) * (tw + gap), margin + (i // cols) * (th + gap)
        shadow = Image.new('RGBA', (t.width + 40, t.height + 40), (0, 0, 0, 0))
        ImageDraw.Draw(shadow).rounded_rectangle((20, 26, t.width + 20, t.height + 20), 18, fill=(0, 0, 0, 90))
        shadow = shadow.filter(ImageFilter.GaussianBlur(12))
        out.paste(shadow, (x - 20, y - 20), shadow)
        out.paste(t, (x, y), t if t.mode == 'RGBA' else None)
    return out


desk = [browser(Image.open(SRC / f'desktop-{n}.png')) for n in ('speisekarte', 'zutaten', 'restaurant', 'dialog')]
sheet(desk, 2, 28, '#AC2E27', 40).save(OUT / 'desktop-sections.jpg', quality=84)
mob = [phone(Image.open(SRC / f'mobile-{n}.png')) for n in ('amore', 'speisekarte', 'zutaten', 'restaurant')]
sheet(mob, 4, 26, '#181613', 40).save(OUT / 'mobile-screens.jpg', quality=84)
for f in sorted(OUT.iterdir()):
    print(f.name, Image.open(f).size, f'{f.stat().st_size / 1e6:.2f} MB')
