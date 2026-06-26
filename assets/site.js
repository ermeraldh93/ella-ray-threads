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

// v16.4 Store collection filters
document.querySelectorAll('.store-filter').forEach(filterBtn=>{
  filterBtn.addEventListener('click',()=>{
    const filter=filterBtn.dataset.filter || 'all';
    document.querySelectorAll('.store-filter').forEach(b=>b.classList.toggle('active', b===filterBtn));
    document.querySelectorAll('.florida-product').forEach(item=>{
      item.classList.toggle('is-hidden', filter !== 'all' && item.dataset.category !== filter);
    });
  });
});

// v16.7 Portfolio professional filters
const portfolioFilters = Array.from(document.querySelectorAll('.portfolio-filter'));
const portfolioProjects = Array.from(document.querySelectorAll('.portfolio-project'));
portfolioFilters.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter || 'all';
    portfolioFilters.forEach(b => b.classList.toggle('active', b === btn));
    portfolioProjects.forEach(project => {
      const cats = (project.dataset.category || '').split(/\s+/);
      project.classList.toggle('is-hidden', filter !== 'all' && !cats.includes(filter));
    });
  });
});

// Ella Rae quote form with secure file upload through Cloudflare Pages Functions
const artworkUpload = document.getElementById('artworkUpload');
const artworkFileLabel = document.getElementById('artworkFileLabel');
artworkUpload?.addEventListener('change', () => {
  const files = Array.from(artworkUpload.files || []);
  if (artworkFileLabel) artworkFileLabel.textContent = files.length ? files.map(f => f.name).join(', ') : 'Drag your logo here or tap to browse.';
});

const projectForm = document.getElementById('projectForm');
const projectFormStatus = document.getElementById('projectFormStatus');
projectForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitBtn = projectForm.querySelector('button[type="submit"]');
  if (projectFormStatus) {
    projectFormStatus.className = 'form-status is-loading';
    projectFormStatus.textContent = 'Submitting your project request...';
  }
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
  }
  try {
    const response = await fetch(projectForm.action, {
      method: 'POST',
      body: new FormData(projectForm)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success === false) throw new Error(result.message || 'Submission failed.');
    const customerName = (new FormData(projectForm).get('name') || '').toString().trim();
    const thankYou = document.createElement('section');
    thankYou.className = 'quote-thank-you section';
    thankYou.innerHTML = `
      <div class="thank-you-card">
        <div class="thank-you-mark">✓</div>
        <span class="eyebrow">Request Received</span>
        <h1>Thank you${customerName ? ', ' + customerName : ''}.</h1>
        <p>Your project request has been received. We'll review your details and artwork, then contact you within one business day.</p>
        <div class="thank-you-next">
          <article><span>01</span><strong>We review your request</strong></article>
          <article><span>02</span><strong>We prepare your quote</strong></article>
          <article><span>03</span><strong>We contact you</strong></article>
        </div>
        <div class="thank-you-actions">
          <a class="btn primary" href="index.html">Return Home</a>
          <a class="btn outline" href="store.html">Browse Store</a>
        </div>
      </div>`;
    const wrap = document.querySelector('.project-wrap');
    const whatNext = document.querySelector('.what-next');
    wrap?.replaceWith(thankYou);
    whatNext?.remove();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    projectForm.reset();
    if (artworkFileLabel) artworkFileLabel.textContent = 'Drag your logo here or tap to browse.';
  } catch (error) {
    if (projectFormStatus) {
      projectFormStatus.className = 'form-status is-error';
      projectFormStatus.textContent = error.message || 'Something went wrong. Please try again.';
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Start My Project';
    }
  }
});
