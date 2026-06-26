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


// v15: update project progress as visitors complete sections
const productChoices=document.querySelectorAll('.product-choice input');
const progressSteps=document.querySelectorAll('.progress-step');
function activateStep(i){progressSteps.forEach((s,idx)=>s.classList.toggle('active',idx<=i));}
productChoices.forEach(input=>input.addEventListener('change',()=>activateStep(1)));
document.querySelector('.logo-upload input')?.addEventListener('change',()=>activateStep(2));
document.querySelectorAll('[name="quantity"],[name="location"],[name="deadline"],[name="garment_color"]').forEach(el=>el.addEventListener('change',()=>activateStep(3)));
document.querySelectorAll('[name="name"],[name="email"]').forEach(el=>el.addEventListener('input',()=>{if(document.querySelector('[name="name"]')?.value && document.querySelector('[name="email"]')?.value) activateStep(3)}));
document.querySelector('.fb-btn')?.addEventListener('click',()=>localStorage.setItem('ellaRaeFbPopClosed','true'));
