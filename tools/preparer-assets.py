#!/usr/bin/env python3
"""Exporta contornos nativos, fontes locais e WebP a partir dos mestres incluídos."""
from pathlib import Path
import json,hashlib,shutil
from io import BytesIO
import numpy as np
from PIL import Image
from scipy.ndimage import label,find_objects
from matplotlib.figure import Figure
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
import fitz

ROOT=Path(__file__).resolve().parents[1]
RED='#AC2E27';CREAM='#F3EAD6';GREEN='#2F4A34'
source=ROOT/'brand/source/Logo-Producao-Original.png'
a=np.asarray(Image.open(source));alpha=a[:,:,3]
green=(a[:,:,1]>a[:,:,0])&(a[:,:,1]>a[:,:,2])&(alpha>100)
red_alpha=np.where(~green,alpha,0);green_alpha=np.where(green,alpha,0)
labels,_=label(red_alpha>127)
icon_labels=[]
for i,sl in enumerate(find_objects(labels)):
    if sl and sl[1].start>1500 and sl[0].stop<570 and (labels[sl]==i+1).sum()>100:icon_labels.append(i+1)
icon_red=np.where(np.isin(labels,icon_labels),red_alpha,0)
def trace(values):
    fig=Figure();ax=fig.subplots();contours=ax.contour(values,levels=[127.5]);paths=[]
    for points in contours.allsegs[0]:
        if len(points)<4:continue
        area=abs(np.dot(points[:,0],np.roll(points[:,1],1))-np.dot(points[:,1],np.roll(points[:,0],1)))/2
        if area<2:continue
        paths.append('M'+' L'.join(f'{x:.1f},{y:.1f}' for x,y in points)+'Z')
    return ''.join(paths),len(paths)
red_path,red_count=trace(red_alpha);green_path,green_count=trace(green_alpha);icon_path,icon_count=trace(icon_red)
ys,xs=np.where(alpha>127);x0,y0,x1,y1=int(xs.min()-18),int(ys.min()-18),int(xs.max()+19),int(ys.max()+19)
crop=f'{x0} {y0} {x1-x0} {y1-y0}'
def svg(red=RED,leaf=GREEN,viewbox='0 0 1774 887',icon=False):
    main=icon_path if icon else red_path
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}"><path fill="{red}" fill-rule="evenodd" d="{main}"/><path fill="{leaf}" fill-rule="evenodd" d="{green_path}"/></svg>'
def raster(text,path,width):
    doc=fitz.open(stream=text.encode(),filetype='svg');pdf=fitz.open('pdf',doc.convert_to_pdf());page=pdf[0]
    page.get_pixmap(matrix=fitz.Matrix(width/page.rect.width,width/page.rect.width),alpha=True).save(path)
for name,color,leaf in [('Pomodoro',RED,GREEN),('Creme',CREAM,CREAM)]:
    full=svg(color,leaf);(ROOT/'brand'/f'Logo-Ciao-Mamma-{name}.svg').write_text(full)
    raster(full,ROOT/'brand'/f'Logo-Ciao-Mamma-{name}-Transparente.png',1774)
    (ROOT/'site/assets'/f'logo-{name.lower()}.svg').write_text(svg(color,leaf,crop))
ys,xs=np.where((icon_red>127)|(green_alpha>127));left,top,right,bottom=xs.min(),ys.min(),xs.max(),ys.max()
icon_box=f'{int(left-20)} {int(top-20)} {int(right-left+40)} {int(bottom-top+40)}'
(ROOT/'brand/Sinal-Folha.svg').write_text(svg(RED,GREEN,icon_box,True))
(ROOT/'site/assets/favicon.svg').write_text(svg(RED,GREEN,icon_box,True))
scale=2.2;tx=512-(left+right)/2*scale;ty=512-(top+bottom)/2*scale
avatar=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" rx="180" fill="{CREAM}"/><g transform="translate({tx:.1f} {ty:.1f}) scale({scale})"><path fill="{RED}" fill-rule="evenodd" d="{icon_path}"/><path fill="{GREEN}" fill-rule="evenodd" d="{green_path}"/></g></svg>'
(ROOT/'brand/Avatar-Ciao-Mamma.svg').write_text(avatar);raster(avatar,ROOT/'brand/Avatar-Ciao-Mamma.png',1024)
for name in ['BarlowCondensed-BoldItalic','BarlowCondensed-ExtraBoldItalic']:
    source_font=ROOT/'fonts/originals'/(name+'.ttf');shutil.copyfile(source_font,ROOT/'fonts'/(name+'.ttf'))
    font=TTFont(source_font);font.flavor='woff';font.save(ROOT/'site/fonts'/(name+'.woff'))
for weight,name in [(400,'Regular'),(500,'Medium'),(600,'SemiBold'),(700,'Bold')]:
    font=instantiateVariableFont(TTFont(ROOT/'fonts/originals/Manrope-Variable.ttf'),{'wght':weight},inplace=False)
    font.save(ROOT/'fonts'/f'Manrope-{name}.ttf');font.flavor='woff';font.save(ROOT/'site/fonts'/f'Manrope-{name}.woff')
for path in (ROOT/'fonts/originals').glob('*-OFL.txt'):shutil.copyfile(path,ROOT/'site/fonts'/path.name)
def webp_atomic(source,destination,quality):
    with Image.open(source) as im:
        buffer=BytesIO();im.save(buffer,format='WEBP',quality=quality,method=6)
    temporary=destination.with_suffix('.webp.tmp');temporary.write_bytes(buffer.getvalue());temporary.replace(destination)
for path in (ROOT/'images/master').glob('*.png'):
    webp_atomic(path,ROOT/'site/assets'/(path.stem+'.webp'),86)
# Interior and table photos: exported cropped (no viewer strip) by scripts/prepare-images.py
for path,name in [(ROOT/'images/originals/Fachada-Original.png','facade-original.webp')]:
    webp_atomic(path,ROOT/'site/assets'/name,95)
report={'source_logo_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'native_svg':True,'red_contours':red_count,'leaf_contours':green_count,'icon_contours':icon_count,'header_viewbox':crop,'png_size':[1774,887],'webp_quality':94,'documentary_webp_quality':95,'documentary_crop':'SVG viewBox 0 90 756 914 for interior; 0 90 678 924 for table; originals untouched.'}
(ROOT/'docs/asset-exports.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
