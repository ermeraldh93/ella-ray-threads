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

// v16.3 Store cart (request checkout, no payment processing yet)
const cartPanel = document.getElementById('cartPanel');
const cartBackdrop = document.getElementById('cartBackdrop');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');
const cartEmptyEl = document.getElementById('cartEmpty');
const checkoutBtn = document.getElementById('checkoutBtn');
const cartNotes = document.getElementById('cartNotes');
let storeCart = JSON.parse(localStorage.getItem('ellaRaeStoreCart') || '[]');
function saveCart(){localStorage.setItem('ellaRaeStoreCart', JSON.stringify(storeCart));}
function openCart(){cartPanel?.classList.add('open');cartBackdrop?.classList.add('open');}
function closeCart(){cartPanel?.classList.remove('open');cartBackdrop?.classList.remove('open');}
function renderCart(){
  if(!cartItemsEl) return;
  cartItemsEl.innerHTML='';
  let total=0, count=0;
  storeCart.forEach((item,idx)=>{
    total += item.price * item.qty; count += item.qty;
    const row=document.createElement('div'); row.className='cart-row';
    row.innerHTML=`<div><strong>${item.name}</strong><small>$${item.price} starting • Qty ${item.qty}</small></div><div class="cart-qty"><button type="button" data-dec="${idx}">−</button><button type="button" data-inc="${idx}">+</button></div>`;
    cartItemsEl.appendChild(row);
  });
  if(cartCountEl) cartCountEl.textContent=count;
  if(cartTotalEl) cartTotalEl.textContent=`$${total}`;
  if(cartEmptyEl) cartEmptyEl.style.display=storeCart.length?'none':'block';
  if(checkoutBtn){
    const body = storeCart.length ? storeCart.map(i=>`${i.qty} x ${i.name} — starting at $${i.price} each`).join('\n') : 'Cart is empty.';
    const notes = cartNotes?.value ? `\n\nProject Notes:\n${cartNotes.value}` : '';
    checkoutBtn.href=`mailto:ellaraethreads@gmail.com?subject=${encodeURIComponent('Ella Rae Threads Store Checkout Request')}&body=${encodeURIComponent('Hello Ella Rae Threads,\n\nI would like to request checkout/final pricing for:\n\n'+body+notes+'\n\nThank you.')}`;
  }
  saveCart();
}
document.querySelectorAll('.add-cart').forEach(btn=>btn.addEventListener('click',()=>{
  const item=btn.closest('.store-item'); if(!item) return;
  const name=item.dataset.name; const price=Number(item.dataset.price||0);
  const existing=storeCart.find(i=>i.name===name);
  if(existing) existing.qty += 1; else storeCart.push({name,price,qty:1});
  renderCart(); openCart();
}));
document.querySelector('.cart-toggle')?.addEventListener('click',openCart);
document.querySelector('.cart-close')?.addEventListener('click',closeCart);
cartBackdrop?.addEventListener('click',closeCart);
cartItemsEl?.addEventListener('click',e=>{
  const inc=e.target.dataset.inc, dec=e.target.dataset.dec;
  if(inc!==undefined){storeCart[inc].qty += 1; renderCart();}
  if(dec!==undefined){storeCart[dec].qty -= 1; if(storeCart[dec].qty<=0) storeCart.splice(dec,1); renderCart();}
});
cartNotes?.addEventListener('input',renderCart);
renderCart();
