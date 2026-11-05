"""Refresh docs/asset-manifest.json (site/assets entries only; masters, originals and brand files keep
the hashes they were delivered with) and MANIFEST.sha256 (every kit file, not node_modules/studio).
Run after changing anything in site/assets or the kit folders: python3 scripts/sync-manifests.py"""
import hashlib, json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

manifest = json.loads((ROOT / 'docs/asset-manifest.json').read_text())
kept = [e for e in manifest if not e['path'].startswith('site/assets/')]
fresh = []
for f in sorted((ROOT / 'site/assets').iterdir()):
    if f.name.startswith('.'):
        continue
    e = {'path': f'site/assets/{f.name}', 'classification': 'production_export', 'bytes': f.stat().st_size, 'sha256': sha(f)}
    if f.suffix in ('.webp', '.png'):
        with Image.open(f) as im:
            e.update(width=im.width, height=im.height, mode=im.mode, alpha='A' in im.getbands())
    if f.name.startswith(('venue-interior', 'table-real')):
        e['classification'] = 'documentary_user_original_cropped'
    fresh.append(e)
(ROOT / 'docs/asset-manifest.json').write_text(json.dumps(kept + fresh, ensure_ascii=False, indent=2) + '\n')

skip = {'.git', 'node_modules', 'studio', '.vercel', '.github'}
lines = []
for f in sorted(ROOT.rglob('*')):
    rel = f.relative_to(ROOT)
    if f.is_file() and not skip.intersection(rel.parts) and rel.as_posix() not in ('MANIFEST.sha256', '.DS_Store') and 'upscaled' not in rel.parts and f.name != '.DS_Store':
        lines.append(f'{sha(f)}  {rel.as_posix()}')
(ROOT / 'MANIFEST.sha256').write_text('\n'.join(lines) + '\n')
print(len(fresh), 'site assets;', len(lines), 'files in MANIFEST.sha256')
