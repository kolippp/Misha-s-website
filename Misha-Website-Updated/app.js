'use strict';
document.documentElement.classList.add('js');
const photos = [
  { file:'hero', title:'In full flight', category:'stage', alt:'Misha juggling five clubs on a high stack of rola bola cylinders under blue spotlights' },
  { file:'outdoor-handstand', title:'A different perspective', category:'outdoor', alt:'Misha holding a split handstand on stacked cylinders at an outdoor performance' },
  { file:'theatre', title:'The spotlight moment', category:'stage', alt:'Misha balancing on a stack of cylinders in a colourful theatre with a live band' },
  { file:'portrait', title:'Meet Misha', category:'portrait', alt:'A smiling portrait of Misha wearing a flat cap in blue stage light' },
  { file:'handstand', title:'Perfectly upside down', category:'stage', alt:'Misha holding a straight handstand on rola bola cylinders under dramatic blue lights' },
  { file:'open-air', title:'Under an open sky', category:'outdoor', alt:'Misha in a white costume balancing above the water at an outdoor event' },
  { file:'club-juggling', title:'Finding the rhythm', category:'stage', alt:'Misha juggling clubs on a rola bola board in a white shirt under green stage lighting' },
  { file:'character', title:'A little character', category:'stage', alt:'Misha in a theatrical costume performing a handstand above a circus stage' },
  { file:'outdoor-balance', title:'Between earth and sky', category:'outdoor', alt:'Misha balancing on a single cylinder on a high table at an outdoor event' },
  { file:'encore', title:'One more moment', category:'stage', alt:'Misha smiling and acknowledging the audience from his balance board' },
  { file:'portrait-cap', title:'Signature style', category:'portrait', alt:'Misha tipping his flat cap towards the camera' },
  { file:'cabaret', title:'On the edge', category:'stage', alt:'Misha balancing on a high table in a cabaret show, photograph by Fotomanufaktur Bochum', credit:'Photograph: Fotomanufaktur Bochum' }
];
const grid = document.getElementById('photo-grid');
let activeFilter = 'all';
let currentPhotoIndex = 0;
let viewerPhotos = [];
let currentMediaType = null;
let returnFocus = null;
const dialog = document.getElementById('media-dialog');
const mediaContent = document.getElementById('media-content');
const mediaTitle = document.getElementById('media-title');
const mediaCaption = document.getElementById('media-caption');
const previous = document.getElementById('previous-photo');
const next = document.getElementById('next-photo');
const dialogFooter = dialog.querySelector('.dialog-footer');
const filteredPhotos = () => photos.map((photo,index)=>({...photo,index})).filter(photo => activeFilter === 'all' || photo.category === activeFilter);

photos.forEach((photo,index) => {
  const button = document.createElement('button');
  button.className = 'photo-card';
  button.dataset.category = photo.category;
  button.setAttribute('aria-label',`View photograph: ${photo.title}`);
  button.innerHTML = `<img src="assets/${photo.file}-small.webp" width="700" height="1050" alt="${photo.alt}" loading="lazy" decoding="async"><span class="photo-label">${photo.title}<svg class="icon" aria-hidden="true"><use href="#icon-plus"/></svg></span>`;
  button.addEventListener('click',()=>openPhoto(index,button));
  grid.append(button);
});

document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{
  activeFilter=button.dataset.filter;
  document.querySelectorAll('.filter').forEach(item=>{
    const selected=item===button;
    item.classList.toggle('active',selected);
    item.setAttribute('aria-pressed',String(selected));
  });
  grid.querySelectorAll('.photo-card').forEach(card=>{card.hidden=activeFilter!=='all' && card.dataset.category!==activeFilter;});
  const count=filteredPhotos().length;
  document.getElementById('gallery-count').textContent=activeFilter==='all' ? '12 selected photographs' : `${count} ${count===1?'photograph':'photographs'} · ${button.textContent.trim()}`;
}));

function openMedia(trigger){
  returnFocus=trigger;
  if(!dialog.open)dialog.showModal();
  document.body.classList.add('modal-open');
  dialog.querySelector('.dialog-close').focus();
}
function showPhoto(index){
  const photo=photos[index];
  currentPhotoIndex=index;
  currentMediaType='photo';
  mediaTitle.textContent=photo.title;
  const image=new Image();
  image.src=`assets/${photo.file}.webp`;
  image.alt=photo.alt;
  image.decoding='async';
  mediaContent.replaceChildren(image);
  const visible=viewerPhotos;
  mediaCaption.textContent=`${String(visible.findIndex(p=>p.index===index)+1).padStart(2,'0')} / ${String(visible.length).padStart(2,'0')}${photo.credit?' · '+photo.credit:''}`;
  previous.hidden=false;next.hidden=false;
  dialogFooter.classList.remove('video-footer');
}
function openPhoto(index,trigger){
  const available=filteredPhotos();
  viewerPhotos=available.some(photo=>photo.index===index) ? available : photos.map((photo,i)=>({...photo,index:i}));
  showPhoto(index);openMedia(trigger);
}
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>openPhoto(Number(button.dataset.photo),button)));
function movePhoto(direction){
  const visible=viewerPhotos;
  const position=visible.findIndex(photo=>photo.index===currentPhotoIndex);
  showPhoto(visible[(position+direction+visible.length)%visible.length].index);
}
previous.addEventListener('click',()=>movePhoto(-1));
next.addEventListener('click',()=>movePhoto(1));
document.querySelectorAll('[data-video]').forEach(button=>button.addEventListener('click',()=>{
  const id=button.dataset.video;
  currentMediaType='video';
  mediaTitle.textContent=button.dataset.title;
  const frame=document.createElement('iframe');
  frame.src=`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  frame.title=button.dataset.title;
  frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  frame.allowFullscreen=true;
  frame.referrerPolicy='strict-origin-when-cross-origin';
  mediaContent.replaceChildren(frame);
  previous.hidden=true;next.hidden=true;
  mediaCaption.replaceChildren();
  const link=document.createElement('a');link.href=`https://www.youtube.com/watch?v=${id}`;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Watch on YouTube ↗';
  mediaCaption.append(link);dialogFooter.classList.add('video-footer');
  openMedia(button);
}));
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{mediaContent.replaceChildren();currentMediaType=null;document.body.classList.remove('modal-open');returnFocus?.focus({preventScroll:true});});
dialog.addEventListener('keydown',event=>{
  if(currentMediaType==='photo' && ['ArrowRight','ArrowLeft'].includes(event.key)){event.preventDefault();movePhoto(event.key==='ArrowRight'?1:-1);}
});
let touchStart=null;
mediaContent.addEventListener('touchstart',event=>{if(currentMediaType==='photo')touchStart=event.touches[0].clientX;},{passive:true});
mediaContent.addEventListener('touchend',event=>{if(currentMediaType==='photo'&&touchStart!==null){const distance=event.changedTouches[0].clientX-touchStart;if(Math.abs(distance)>60)movePhoto(distance<0?1:-1);touchStart=null;}},{passive:true});

const header=document.getElementById('header');
const toggle=document.querySelector('.menu-toggle');
const menu=document.getElementById('site-menu');
function closeMenu(){if(menu.open)menu.close();}
toggle.addEventListener('click',()=>{
  if(menu.open){closeMenu();return;}
  menu.showModal();
  document.body.classList.add('menu-open');
  toggle.setAttribute('aria-expanded','true');
  toggle.setAttribute('aria-label','Close navigation');
});
menu.querySelector('.menu-close').addEventListener('click',closeMenu);
menu.querySelectorAll('.menu-link').forEach(link=>link.addEventListener('click',closeMenu));
menu.addEventListener('close',()=>{
  document.body.classList.remove('menu-open');
  toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-label','Open navigation');
  toggle.focus({preventScroll:true});
});
menu.addEventListener('click',event=>{
  if(event.target!==menu)return;
  const bounds=menu.getBoundingClientRect();
  if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)closeMenu();
});

if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));
}else{document.querySelectorAll('.reveal').forEach(element=>element.classList.add('is-visible'));}
const progress=document.querySelector('.scroll-progress');
let ticking=false;
function updateProgress(){header.classList.toggle('scrolled',window.scrollY>30);const max=document.documentElement.scrollHeight-window.innerHeight;progress.style.transform=`scaleX(${max>0?Math.min(1,window.scrollY/max):0})`;ticking=false;}
window.addEventListener('scroll',()=>{if(!ticking){window.requestAnimationFrame(updateProgress);ticking=true;}},{passive:true});
updateProgress();
document.getElementById('year').textContent=new Date().getFullYear();

let toastTimer;
function showToast(message){const toast=document.getElementById('toast');toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),3500);}
document.getElementById('copy-email').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText('mysyshyn19@gmail.com');showToast('Email address copied.');}
  catch{showToast('Email: mysyshyn19@gmail.com');}
});
document.getElementById('booking-form').addEventListener('submit',async event=>{
  event.preventDefault();
  const form=event.currentTarget;
  const submitButton=form.querySelector('[type="submit"]');
  const submitLabel=submitButton.querySelector('span');
  const status=document.getElementById('form-status');
  if(submitButton.disabled)return;
  if(!form.reportValidity())return;
  const data=new FormData(form);
  const name=String(data.get('name')).trim();
  const message=String(data.get('message')).trim();
  if(!name||!message){status.textContent='Please add your name and a few details about the event.';return;}
  data.set('name',name);
  data.set('message',message);
  data.set('email',String(data.get('email')).trim());
  submitButton.disabled=true;
  submitLabel.textContent='Sending…';
  form.setAttribute('aria-busy','true');
  status.textContent='Sending your booking enquiry…';
  try{
    const response=await fetch(form.action,{
      method:form.method,
      body:data,
      headers:{Accept:'application/json'}
    });
    if(!response.ok){
      const result=await response.json().catch(()=>null);
      const errors=Array.isArray(result?.errors) ? result.errors.map(error=>error.message).filter(Boolean).join(' ') : '';
      status.textContent=errors || 'Your enquiry could not be sent. Please try again or email mysyshyn19@gmail.com directly.';
      return;
    }
    form.reset();
    status.textContent='Thank you! Your booking enquiry has been sent. Misha will be in touch.';
  }catch{
    status.textContent='Your enquiry could not be sent. Please check your connection and try again, or email mysyshyn19@gmail.com directly.';
  }finally{
    submitButton.disabled=false;
    submitLabel.textContent='Send booking enquiry';
    form.removeAttribute('aria-busy');
  }
});

// Carry the selected act into the booking enquiry.
document.querySelectorAll("[data-act]").forEach(link => link.addEventListener("click", () => { document.querySelector("select[name=act]").value = link.dataset.act; }));

// Keep the drawer’s current-section indicator in sync with the page.
if('IntersectionObserver' in window){
  const sectionObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      menu.querySelectorAll('.menu-link').forEach(link=>{
        if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    });
  },{rootMargin:'-15% 0px -50% 0px',threshold:0});
  document.querySelectorAll('main section[id]').forEach(section=>sectionObserver.observe(section));
}
