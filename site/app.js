(()=>{
  'use strict';
  const root=document.documentElement,hero=document.getElementById('amore'),stage=hero.querySelector('.hero-stage'),menu=document.getElementById('speisekarte'),taste=document.getElementById('zutaten'),venue=document.getElementById('restaurant');
  const heroPizza=hero.querySelector('.hero-main-pizza'),menuPizza=menu.querySelector('.menu-pizza'),mainImage=document.getElementById('hero-main-image'),traveller=document.getElementById('travelling-pizza'),travellerImage=document.getElementById('travelling-image');
  const toggle=document.getElementById('motion-toggle'),storageKey='ciao-mamma.motion.paused',reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)'),connection=navigator.connection;
  const skipIntro=new URLSearchParams(location.search).has('nointro');
  let manual=false;try{manual=localStorage.getItem(storageKey)==='1';}catch{}
  let enabled=false,frame=0,intro=[],observer=null,opened=false,pointerX=0,pointerY=0,shared=false;
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),lerp=(a,b,p)=>a+(b-a)*p,smooth=t=>t*t*(3-2*t);
  const progress=rect=>clamp((innerHeight-rect.top)/(innerHeight+rect.height));
  const heroVars=['--secondary-x','--secondary-y','--secondary-r','--slice-x','--slice-y','--slice-r','--leaf-x','--leaf-y','--leaf-r','--crumb-y'];
  const tasteVars=['--e','--f'];
  const venueVars=['--venue-reveal','--venue-scale'];
  function cancelIntro(){intro.forEach(a=>a.cancel());intro=[];}
  function setShared(on){shared=on;root.classList.toggle('shared-pizza-active',on);}
  function clear(){cancelAnimationFrame(frame);frame=0;cancelIntro();setShared(false);heroVars.forEach(v=>hero.style.removeProperty(v));tasteVars.forEach(v=>taste.style.removeProperty(v));venueVars.forEach(v=>venue.style.removeProperty(v));menu.style.removeProperty('--menu-bg-y');traveller.style.removeProperty('transform');traveller.style.removeProperty('width');}
  function update(){
    frame=0;if(!enabled||document.hidden)return;
    const h=innerHeight,w=innerWidth,hr=hero.getBoundingClientRect(),sr=stage.getBoundingClientRect(),mr=menu.getBoundingClientRect(),tr=taste.getBoundingClientRect(),vr=venue.getBoundingClientRect();
    const desktop=w>=900,ready=mainImage.complete&&mainImage.naturalWidth>0;

    // Scene 1 -> 2: one pizza leaves the poster and lands on the table (desktop only)
    const showShared=desktop&&ready&&hr.top<h&&(hr.bottom>0||mr.bottom>0);
    let from=null,to=null;if(showShared){from=heroPizza.getBoundingClientRect();to=menuPizza.getBoundingClientRect();}
    setShared(showShared);
    if(showShared){const q=clamp((h-mr.top)/h),x=lerp(from.left,to.left,q),y=lerp(from.top,to.top,q),scale=lerp(1,to.width/from.width,q),rotation=Math.sin(q*Math.PI)*5;traveller.style.width=from.width+'px';traveller.style.transform=`translate3d(${x}px,${y}px,0) rotate(${rotation}deg) scale(${scale})`;}

    // Scene 1: depth planes drift at different speeds while the poster is pinned
    if(hr.bottom>0&&hr.top<h){
      const p=clamp(-hr.top/Math.max(1,hr.height-sr.height));
      const mobileFactor=desktop?1:.35;
      hero.style.setProperty('--secondary-x',(lerp(0,35,p)*mobileFactor-pointerX*.4)+'px');hero.style.setProperty('--secondary-y',(-p*35*mobileFactor)+'px');hero.style.setProperty('--secondary-r',(-p*7*mobileFactor)+'deg');
      hero.style.setProperty('--slice-x',(-p*45*mobileFactor+pointerX)+'px');hero.style.setProperty('--slice-y',(p*90*mobileFactor+pointerY)+'px');hero.style.setProperty('--slice-r',(p*16*mobileFactor)+'deg');
      hero.style.setProperty('--leaf-x',(p*30*mobileFactor-pointerX*.8)+'px');hero.style.setProperty('--leaf-y',(-p*65*mobileFactor-pointerY*.8)+'px');hero.style.setProperty('--leaf-r',(-p*40*mobileFactor)+'deg');hero.style.setProperty('--crumb-y',(p*35*mobileFactor)+'px');
      if((p>.04||sr.top<-30)&&intro.length)cancelIntro();
    }

    // Scene 2: the stone table slides slower than the page
    if(mr.bottom>0&&mr.top<h){const p=progress(mr);menu.style.setProperty('--menu-bg-y',((p-.5)*(desktop?-40:-14)).toFixed(1)+'px');}

    // Scene 3: the ingredients leave the slice and settle around it, then float
    if(tr.bottom>0&&tr.top<h){
      const p=progress(tr),k=desktop?1:.32;
      taste.style.setProperty('--e',smooth(clamp((p-.06)/.36)).toFixed(3));
      taste.style.setProperty('--f',(Math.sin(p*Math.PI)*k).toFixed(3));
    }

    // Scene 4: the real room is uncovered from the right, settling from 1.02 to 1
    if(vr.bottom>0&&vr.top<h){
      const p=progress(vr),r=smooth(clamp((p-.04)/.3));
      venue.style.setProperty('--venue-reveal',desktop?r.toFixed(3):'1');
      venue.style.setProperty('--venue-scale',(desktop?1.02-.02*r:1.006).toFixed(4));
    }
  }
  function request(){if(enabled&&!frame&&!document.hidden)frame=requestAnimationFrame(update);}
  function reveal(){
    if(observer)observer.disconnect();
    if(!enabled||!('IntersectionObserver'in window)){document.querySelectorAll('[data-reveal]').forEach(e=>e.classList.add('is-visible'));return;}
    observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.12});
    document.querySelectorAll('[data-reveal]').forEach(e=>observer.observe(e));
  }
  async function opening(){
    if(opened||!enabled||scrollY>25||skipIntro)return;opened=true;
    await Promise.allSettled([document.fonts?.ready??Promise.resolve(),mainImage.decode?.()??Promise.resolve()]);
    if(!enabled||scrollY>25||!mainImage.animate)return;update();
    const ease='cubic-bezier(.16,.75,.2,1)';
    const pizza=shared?travellerImage:mainImage;
    intro.push(pizza.animate([{transform:'translateY(100px) rotate(-8deg) scale(.86)',opacity:.2},{transform:'translateY(0) rotate(0) scale(1)',opacity:1}],{duration:1500,easing:ease}));
    const slice=hero.querySelector('.hero-slice img');intro.push(slice.animate([{transform:'translate(40px,-70px) rotate(14deg) scale(.88)',opacity:.2},{transform:'translate(0,0) rotate(0) scale(1)',opacity:1}],{duration:1650,delay:100,easing:ease}));
    const second=hero.querySelector('.hero-secondary img');intro.push(second.animate([{transform:'translateX(60px) rotate(10deg)',opacity:0},{transform:'none',opacity:1}],{duration:1400,delay:160,easing:ease}));
    const leaf=hero.querySelector('.hero-basil');intro.push(leaf.animate([{opacity:0,filter:'blur(3px)'},{opacity:1,filter:'blur(0)'}],{duration:1000,delay:220,easing:'ease-out'}));
    hero.querySelectorAll('.poster-title .line>span').forEach((line,i)=>intro.push(line.animate([{transform:'translateY(25px)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:800,delay:100+i*100,easing:'ease-out',fill:'backwards'})));
    Promise.allSettled(intro.map(a=>a.finished)).then(()=>{intro=[];});
  }
  function setMotion(preserve=false){
    let anchor=null,oldTop=0;
    if(preserve){anchor=[stage,menu,taste,venue].find(el=>{const r=el.getBoundingClientRect();return r.top<innerHeight*.5&&r.bottom>innerHeight*.5;});if(anchor)oldTop=anchor.getBoundingClientRect().top;}
    const constrained=reduced.matches||Boolean(connection?.saveData),next=!manual&&!constrained;
    clear();enabled=next;root.classList.toggle('js-motion',enabled);root.classList.toggle('motion-off',!enabled);
    toggle.disabled=constrained;toggle.setAttribute('aria-pressed',String(!enabled));toggle.setAttribute('aria-label',constrained?'Animationen nach deinen Einstellungen reduziert':enabled?'Animationen pausieren':'Animationen fortsetzen');toggle.querySelector('[aria-hidden]').textContent=enabled?'Ⅱ':'▷';
    if(anchor){const delta=anchor.getBoundingClientRect().top-oldTop;if(Math.abs(delta)>1){const previous=root.style.scrollBehavior;root.style.scrollBehavior='auto';scrollBy(0,delta);root.style.scrollBehavior=previous;}}
    reveal();if(enabled){request();opening();}
  }
  root.classList.add('js');setMotion();
  toggle.addEventListener('click',()=>{manual=enabled;try{localStorage.setItem(storageKey,manual?'1':'0');}catch{}setMotion(true);});
  reduced.addEventListener?.('change',()=>setMotion(true));connection?.addEventListener?.('change',()=>setMotion(true));
  addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});
  addEventListener('load',request);
  stage.addEventListener('pointermove',e=>{if(!enabled||!fine.matches||innerWidth<900)return;const r=stage.getBoundingClientRect();pointerX=((e.clientX-r.left)/r.width-.5)*8;pointerY=((e.clientY-r.top)/r.height-.5)*8;request();},{passive:true});
  stage.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;request();},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;cancelIntro();}else request();});
  document.querySelectorAll('.mobile-menu nav a').forEach(a=>a.addEventListener('click',()=>a.closest('details').removeAttribute('open')));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.mobile-menu[open]').forEach(d=>{d.removeAttribute('open');d.querySelector('summary').focus();});});

  const dialog=document.getElementById('menu-dialog'),tabs=[...document.querySelectorAll('[data-tab]')];let returnFocus=null;
  function choose(name,focus=false){const item=window.CIAO.menu[name];if(!item)return;document.getElementById('dialog-title').textContent=item.title;document.getElementById('menu-description').textContent=item.description;document.getElementById('menu-panel').setAttribute('aria-labelledby','tab-'+name);tabs.forEach(tab=>{const on=tab.dataset.tab===name;tab.setAttribute('aria-selected',String(on));tab.tabIndex=on?0:-1;if(on&&focus)tab.focus();});}
  document.querySelectorAll('[data-menu]').forEach(a=>a.addEventListener('click',e=>{if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||!dialog.showModal)return;e.preventDefault();returnFocus=a;choose(a.dataset.menu);dialog.showModal();tabs.find(t=>t.dataset.tab===a.dataset.menu)?.focus();}));
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>choose(tab.dataset.tab));tab.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();choose(tabs[n].dataset.tab,true);});});
  document.getElementById('menu-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});dialog.addEventListener('close',()=>returnFocus?.focus());
})();
