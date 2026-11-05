#!/usr/bin/env python3
"""Verificações estáticas do kit; não substituem revisão de navegador."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import datetime,hashlib,json,re,subprocess,sys
import xml.etree.ElementTree as ET
from PIL import Image
from fontTools.ttLib import TTFont

ROOT=Path(__file__).resolve().parents[1]
checks=[]
def check(name,condition,detail=''):
    checks.append({'name':name,'pass':bool(condition),'detail':detail})
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else 'ausente'
class Markup(HTMLParser):
    def __init__(self,text):
        super().__init__();self.nodes=[];self.feed(text)
    def handle_starttag(self,tag,attrs):self.nodes.append((tag,dict(attrs)))

html=(ROOT/'site/index.html').read_text();css=(ROOT/'site/styles.css').read_text();js=(ROOT/'site/app.js').read_text();content=(ROOT/'site/content.js').read_text()
doc=Markup(html);ids=[a['id'] for _,a in doc.nodes if 'id'in a];known=set(ids)
lock=json.loads((ROOT/'docs/architecture-lock.json').read_text());selection=json.loads((ROOT/'docs/selection.json').read_text())
check('Idioma público alemão',('html',{'lang':'de'}) in doc.nodes)
check('Um H1',sum(t=='h1' for t,_ in doc.nodes)==1)
check('IDs únicos',len(ids)==len(known))
scenes=[{'id':a.get('id'),'scene':a.get('data-scene'),'background':a.get('data-background')} for t,a in doc.nodes if t=='section']
check('Quatro cenas na ordem aprovada',scenes==lock['scene_order'] and len(scenes)==4)
check('Um fundo principal liso',sum(s['background']=='solid' for s in scenes)==1 and scenes[0]['id']=='amore')
check('Hero 2 + corpo 2',selection['hero_model']==selection['body_model']==lock['hero_model']==lock['body_model']==2)
check('Escolha encerrada e vídeo ausente',selection['stage']=='kit_complete' and not selection['video_created'])
check('Hospedagem local sem identidade de outro cliente',json.loads((ROOT/'site/.openai/hosting.json').read_text())=={'static':{'directory':'.'}})
check('Rodapé integrado à cena de restaurante',html.index('<footer')>html.index('id="restaurant"') and html.index('</footer>')<html.index('</main>'))
check('Texto da carta não inventa completude','vollständige aktuelle Speisekarte und Preise' in html and 'category_overview_only_current_full_menu_not_supplied'in content)
check('Telefone correto e sem dados de outros projetos','+494032513764'in content and '+337' not in html+content and not re.search(r'Karim|Aymen|Pontchâteau|Pontchateau',html+content,re.I))
check('Endereço correto','Am Sandtorkai 38–40' in html and '20457 Hamburg'in html)
structured=re.search(r'<script type="application/ld\+json">(.*?)</script>',html,re.S)
data=json.loads(structured.group(1));check('JSON-LD consistente',data['name']=='Ciao Mamma!' and data['telephone']=='+494032513764' and data['address']['addressCountry']=='DE' and not any(k in data for k in ('aggregateRating','openingHours','priceRange')))
bad_refs=[];bad_aria=[];bad_external=[];bad_phone=[];bad_dims=[]
for t,a in doc.nodes:
    for attr in ('href','src'):
        ref=a.get(attr)
        if not ref:continue
        u=urlsplit(ref)
        if not u.scheme and not u.netloc:
            if u.path:
                f=ROOT/'site'/unquote(u.path)
                if not f.is_file():bad_refs.append(ref)
            elif u.fragment and u.fragment not in known:bad_refs.append(ref)
        if u.scheme=='tel' and ref!='tel:+494032513764':bad_phone.append(ref)
        if a.get('target')=='_blank' and not {'noopener','noreferrer'}.issubset(set(a.get('rel','').split())):bad_external.append(ref)
    for attr in ('aria-labelledby','aria-controls'):
        for id_ in a.get(attr,'').split():
            if id_ not in known:bad_aria.append(id_)
    if t=='img':
        if 'alt'not in a:bad_aria.append('img sem alt')
        f=ROOT/'site'/a['src']
        if f.suffix=='.webp' and f.is_file():
            with Image.open(f) as im:
                if (int(a.get('width',0)),int(a.get('height',0)))!=im.size:bad_dims.append(a['src'])
check('Referências HTML locais resolvem',not bad_refs,str(bad_refs))
check('Referências ARIA e alt resolvem',not bad_aria,str(bad_aria))
check('Links externos protegidos',not bad_external,str(bad_external))
check('Todos os links de chamada consistentes',not bad_phone,str(bad_phone))
check('Dimensões intrínsecas declaradas corretas',not bad_dims,str(bad_dims))
cssrefs=re.findall(r'url\([\'\"]?([^\)\'\"]+)',css)
check('Recursos CSS locais resolvem',all((ROOT/'site'/x).is_file() for x in cssrefs))
check('Sem runtime remoto ou dependência de CDN',not re.search(r'\bfetch\s*\(|XMLHttpRequest|https?://',js+css+content.replace("map:'https://www.google.com/maps/search/?api=1&query=Ciao+Mamma+Am+Sandtorkai+38-40+20457+Hamburg'",'')))
check('CSS com delimitadores equilibrados',css.count('{')==css.count('}') and css.count('(')==css.count(')'))
check('Três cortes diagonais alternados',css.count('clip-path:polygon(')==3)
check('Movimento reduzido e pausa declarados','@media(prefers-reduced-motion:reduce)'in css and 'motion-off'in css and 'ciao-mamma.motion.paused'in js)
check('Sem scroll capturado ou vídeo',not re.search(r'wheel|touchmove|<video|<canvas',js+html))
check('Plano compartilhado tem fallback mobile','w>=900'in js and 'setShared(false)'in js and 'showShared'in js)
check('Pausa preserva âncora de leitura','oldTop=anchor.getBoundingClientRect().top'in js and 'scrollBy(0,delta)'in js)
check('Aba inativa interrompe movimento',"document.hidden"in js and "cancelAnimationFrame(frame)"in js)
check('Abas do diálogo declaradas',{'tab-pizza','tab-pasta','menu-panel','menu-dialog'}.issubset(known) and all('data-menu="'+n+'"'in html for n in ('pizza','pasta')))
check('Teclado e retorno de foco no diálogo',all(x in js for x in ('ArrowRight','ArrowLeft',"e.key==='Home'","e.key==='End'",'returnFocus?.focus()')))
literal_ids=re.findall(r"getElementById\('([^']+)'\)",js)
check('IDs literais do JavaScript existem',set(literal_ids).issubset(known),str(set(literal_ids)-known))
for name in ('app.js','content.js'):
    try:r=subprocess.run(['node','--check',str(ROOT/'site'/name)],capture_output=True,text=True);check('Sintaxe '+name,r.returncode==0,r.stderr.strip())
    except OSError as e:check('Sintaxe '+name,False,str(e))

masters=list((ROOT/'images/master').glob('*.png'));check('Oito mestres de campanha',len(masters)==8)
cutouts={'pizza-main','pizza-secondary','pizza-slice','basil','tomato','mozzarella'}
for f in masters:
    with Image.open(f) as im:
        im.load();alpha=im.getchannel('A').getextrema() if 'A'in im.getbands() else None
        check('Mestre válido: '+f.name,im.width>900 and im.height>900)
        check('Fundo previsto: '+f.name,(alpha==(0,255)) if f.stem in cutouts else alpha is None)
    with Image.open(ROOT/'site/assets'/(f.stem+'.webp')) as im:
        im.load();check('WebP válido: '+f.stem,im.size==Image.open(f).size and ('A'in im.getbands())==(f.stem in cutouts))
expected={'Restaurante-Original.png':'a4e5e63105dde061b3779548297a59ce16c449b923b22dea9609121df79d110c','Mesa-Pizza-Pasta-Original.png':'988b876d0dd8dbfc70dcf5f68fe37b8976e306f88d89617b78b404b5a03adb78','Fachada-Original.png':'5d11f3704685e423a365376d9594df5d764cdbdec65be0004cde43227d9bd4fa'}
for name,sha in expected.items():check('Foto real preservada: '+name,digest(ROOT/'images/originals'/name)==sha)
# 2026-11-05: interior/table are exported pre-cropped (viewer strip with the reviewer's name removed) instead of an SVG viewBox crop
check('Recortes documentais sem a barra do visualizador',all(x in html for x in ('assets/venue-interior.webp','assets/table-real.webp')) and not re.search(r'restaurant\.webp|table-original\.webp',html) and all((ROOT/'site/assets'/n).is_file() for n in ('venue-interior.webp','venue-interior-900.webp','table-real.webp')))
for name in ('Pomodoro','Creme'):
    f=ROOT/'brand'/f'Logo-Ciao-Mamma-{name}-Transparente.png'
    with Image.open(f) as im:
        im.load();check('Logo PNG transparente: '+name,im.mode=='RGBA' and im.size==(1774,887) and im.getchannel('A').getextrema()==(0,255))
for f in list((ROOT/'brand').glob('*.svg'))+list((ROOT/'site/assets').glob('*.svg')):
    tree=ET.fromstring(f.read_text());check('SVG nativo: '+str(f.relative_to(ROOT)),any(x.tag.endswith('path')for x in tree.iter()) and not any(x.tag.endswith('image')or x.tag.endswith('text')for x in tree.iter()))
for entry in json.loads((ROOT/'docs/font-sources.json').read_text()):check('Fonte oficial preservada: '+Path(entry['path']).name,digest(ROOT/entry['path'])==entry['sha256'])
woff=list((ROOT/'site/fonts').glob('*.woff'));check('Seis fontes WOFF locais',len(woff)==6)
for f in woff:
    font=TTFont(f);cmap=font.getBestCmap();check('Glifos alemães: '+f.name,all(ord(c)in cmap for c in 'äöüßÄÖÜ–’'))
for family in ('BarlowCondensed','Manrope'):
    check('Licença OFL: '+family,'SIL OPEN FONT LICENSE'in (ROOT/'site/fonts'/f'{family}-OFL.txt').read_text())
font=TTFont(ROOT/'fonts/BarlowCondensed-ExtraBoldItalic.ttf');cmap=font.getBestCmap();text='ERSTEN BISS.';em=sum(font['hmtx'][cmap[ord(c)]][0]for c in text)/font['head'].unitsPerEm
for width in (320,360,375,390,600,768,899,900,1024,1200,1440):
    fs=61 if width<=370 else max(66,min(width*.16,96)) if width<=600 else max(98,min(width*.14,145)) if width<=899 else max(115,min(width*.136,165)) if width<=1200 else max(100,min(width*.136,220))
    gutter=18 if width<=370 else 22 if width<=600 else max(24,min(width*.05,96));estimate=em*fs-.03*fs*(len(text)-1)
    check('Métrica de largura do título em '+str(width),estimate<=width-2*gutter,f'estimativa {estimate:.1f}px; não é renderização')
for n,name in enumerate(('DIRECAO-DE-ARTE','HERO-E-ANIMACAO','CENAS-E-TRANSICOES','CONTEUDO-E-INTEGRACAO','IMAGENS-E-MARCA','VALIDACAO-E-ENTREGA'),1):check('Roteiro '+str(n),(ROOT/'roteiros'/f'{n:02}-{name}.md').is_file())
check('LEIA-ME do kit completo',(ROOT/'LEIA-ME-KIT.md').stat().st_size>3000)
skip={'node_modules','.git','.github','studio','.vercel'}
check('Nenhum vídeo ou frame sequence no kit',not any(f.suffix.lower()in ('.mov','.mp4','.webm','.gif')for f in ROOT.rglob('*') if not skip.intersection(f.relative_to(ROOT).parts)))
guide=Markup((ROOT/'GUIA-VISUAL.html').read_text());guide_missing=[]
for _,a in guide.nodes:
    for attr in ('src','href'):
        v=a.get(attr,'');u=urlsplit(v)
        if v and not u.scheme and u.path and not (ROOT/unquote(u.path)).is_file():guide_missing.append(v)
check('Links do guia resolvem',not guide_missing,str(guide_missing))
assets=json.loads((ROOT/'docs/asset-manifest.json').read_text());bad_assets=[e['path']for e in assets if digest(ROOT/e['path'])!=e['sha256']]
check('Hashes dos assets correspondem',not bad_assets,str(bad_assets))
failed=[x for x in checks if not x['pass']]
today=datetime.date.today()
result={'date':today.isoformat(),'scope':'static checks only','status':'PASS'if not failed else'FAIL','checks':len(checks),'passed':len(checks)-len(failed),'failed':len(failed),'browser_qa':'separate: npm run qa (scripts/qa.mjs, Playwright)','publication':'Vercel preview, noindex, after the owner authorises it','current_menu':'category overview only; current full menu and prices require restaurant confirmation','results':checks}
(ROOT/'docs/QA.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
lines=['# Validação — Ciao Mamma! / modelo 2','',f"**{result['status']} — {result['passed']}/{len(checks)} verificações estáticas aprovadas.** Data: {today:%d/%m/%Y}.",'','Cobertura: ordem das quatro cenas, único fundo liso, idioma, dados de contato, links e ARIA, JavaScript, caminhos locais, dimensões, PNG alfa, WebP decodificável, SVG nativo, fontes e licenças, hashes dos assets e originais, métricas de largura e documentação. O detalhamento está em `QA.json`.','','**Navegador:** verificado à parte por `npm run qa` (`scripts/qa.mjs`, Playwright): densidade das cenas em janelas reais, sobreposição do título, imagens sem ampliação, diálogo e teclado, menu móvel, pausa, movimento reduzido e versão sem JavaScript. As métricas de fonte abaixo são estimativas estáticas.','','A revisão de navegador necessária está em `../roteiros/06-VALIDACAO-E-ENTREGA.md`. O PNG de referência não é uma captura do site.','','A carta atual completa e os preços não foram confirmados. A implementação apresenta Pizza/Pasta e encaminha a consulta por telefone. Nenhuma reserva é confirmada pelo site.']
if failed:lines+=['','## Falhas']+['- '+x['name']+': '+x['detail']for x in failed]
(ROOT/'docs/QA.md').write_text('\n'.join(lines)+'\n')
print(json.dumps({k:result[k]for k in ('status','checks','passed','failed','browser_qa')},ensure_ascii=False))
for e in failed:print(e['name'],e['detail'])
sys.exit(bool(failed))
