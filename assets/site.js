document.querySelector('.menu-toggle')?.addEventListener('click',()=>document.querySelector('.nav').classList.toggle('open'));

const lb=document.createElement('div');
lb.className='lightbox';
lb.innerHTML='<button class="close-lightbox">×</button><img alt="Ella Rae Threads work">';
document.body.appendChild(lb);
document.querySelectorAll('.work img').forEach(img=>{img.style.cursor='zoom-in';img.addEventListener('click',()=>{lb.querySelector('img').src=img.src;lb.classList.add('open')})});
lb.addEventListener('click',e=>{if(e.target===lb||e.target.className==='close-lightbox')lb.classList.remove('open')});

const fbPop=document.getElementById('fbPop');
const fbClose=document.querySelector('.fb-close');
if(fbPop && localStorage.getItem('ellaRaeFbPopClosed')!=='true'){
  setTimeout(()=>fbPop.classList.add('show'),4000);
}
fbClose?.addEventListener('click',()=>{
  fbPop?.classList.remove('show');
  localStorage.setItem('ellaRaeFbPopClosed','true');
});


// v15.1 Start Your Project sticky progress
const projectSteps = Array.from(document.querySelectorAll('.project-step'));
const progressLinks = Array.from(document.querySelectorAll('.progress-step'));
const mobileStepCount = document.getElementById('mobileStepCount');
const mobileStepTitle = document.getElementById('mobileStepTitle');
function setProjectStep(stepEl){
  if(!stepEl) return;
  const step = stepEl.dataset.step || '1';
  const title = stepEl.dataset.title || 'Choose Product';
  progressLinks.forEach(link=>link.classList.toggle('active', link.dataset.step === step));
  if(mobileStepCount) mobileStepCount.textContent = `Step ${step} of 4`;
  if(mobileStepTitle) mobileStepTitle.textContent = title;
}
if(projectSteps.length){
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{ if(entry.isIntersecting) setProjectStep(entry.target); });
  }, {rootMargin:'-35% 0px -50% 0px', threshold:0.01});
  projectSteps.forEach(step=>observer.observe(step));
}

document.querySelector('.fb-later')?.addEventListener('click',()=>{
  fbPop?.classList.remove('show');
  localStorage.setItem('ellaRaeFbPopClosed','true');
});
