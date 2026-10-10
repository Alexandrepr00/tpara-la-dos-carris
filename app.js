const ids=['capa','projeto','percurso'];
const world=document.querySelector('.world'),slides=[...document.querySelectorAll('.slide')];
const previous=document.getElementById('previous'),next=document.getElementById('next');
const receipt=document.querySelector('.receipt'),stage=document.querySelector('.payment-stage');
let current=0,busy=false;
function show(id,focus=false){
 current=Math.max(0,ids.indexOf(id));document.body.dataset.page=ids[current];
 world.style.transform=`translateX(-${current*100/3}%)`;
 slides.forEach((slide,index)=>{slide.inert=index!==current;slide.setAttribute('aria-hidden',String(index!==current))});
 stage.inert=current===2;stage.setAttribute('aria-hidden',String(current===2));
 receipt.inert=current!==0;document.querySelector('.terminal-screen').inert=current!==1;document.querySelector('.terminal-screen').setAttribute('aria-hidden',String(current!==1));
 previous.hidden=current===0;next.hidden=current===ids.length-1;
 if(current===0)receipt.classList.remove('tearing');
 if(focus)document.getElementById(['title','tablet-view','route-title'][current]).focus({preventScroll:true});
}
async function move(direction){
 if(busy)return;const target=current+direction;if(target<0||target>=ids.length)return;
 busy=true;previous.disabled=next.disabled=true;
 const machine=document.querySelector('.payment-machine');
 try{
  if(direction===1&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   const card=next.getBoundingClientRect(),screen=document.querySelector('.terminal-screen').getBoundingClientRect();
   const dy=current===0?screen.top+screen.height/2-(card.top+card.height/2):-22;
   const dx=current===0?screen.left+screen.width/2-(card.left+card.width/2):14;
   const animation=next.animate([{transform:'translate(0,0) rotate(0)'},{transform:`translate(${dx}px,${dy}px) rotate(-9deg) scale(.94)`,offset:.55},{transform:`translate(${dx}px,${dy}px) rotate(-9deg) scale(.94)`,offset:.78},{transform:'translate(0,0) rotate(0)'}],{duration:680,easing:'ease-in-out'});
   await animation.finished;
   machine.classList.add('card-read');
  }
  if(current===0&&target===1&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   receipt.classList.add('tearing');
   await new Promise(resolve=>{receipt.addEventListener('animationend',resolve,{once:true});setTimeout(resolve,750)});
  }
  history.pushState(null,'','#'+ids[target]);show(ids[target],true);
 }finally{machine.classList.remove('card-read');busy=false;previous.disabled=next.disabled=false}
}
previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
window.addEventListener('popstate',()=>show(location.hash.slice(1),true));window.addEventListener('hashchange',()=>show(location.hash.slice(1),true));
document.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||event.target.closest('.terminal-screen'))return;if(event.key==='ArrowRight'){event.preventDefault();move(1)}else if(event.key==='ArrowLeft'){event.preventDefault();move(-1)}});
world.style.transition='none';show(location.hash.slice(1));requestAnimationFrame(()=>requestAnimationFrame(()=>world.style.transition=''));


let tabletIndex=0;
const tabletPages=[...document.querySelectorAll('[data-tablet-page]')];
const tabletPrevious=document.getElementById('tablet-previous'),tabletNext=document.getElementById('tablet-next');
function changeTablet(direction){
 const target=tabletIndex+direction;if(target<0||target>=tabletPages.length)return;
 tabletIndex=target;tabletPages.forEach((page,index)=>page.hidden=index!==tabletIndex);
 tabletPrevious.disabled=tabletIndex===0;tabletNext.disabled=tabletIndex===tabletPages.length-1;
 document.getElementById('tablet-count').textContent=`${tabletIndex+1} / ${tabletPages.length}`;
 if(document.activeElement===tabletPrevious&&tabletPrevious.disabled)tabletNext.focus({preventScroll:true});
 else if(document.activeElement===tabletNext&&tabletNext.disabled)tabletPrevious.focus({preventScroll:true});
}
tabletPrevious.addEventListener('click',()=>changeTablet(-1));tabletNext.addEventListener('click',()=>changeTablet(1));
document.getElementById('tablet-view').addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();event.stopPropagation();changeTablet(event.key==='ArrowRight'?1:-1)}});
