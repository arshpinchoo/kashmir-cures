const defaultProducts = [
  {id:1,name:'Daily Defense SPF 50',category:'Skincare',type:'Mineral sunscreen',price:24,oldPrice:null,badge:'Bestseller',image:'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=700&q=80'},
  {id:2,name:'Calm + Restore Cream',category:'Skincare',type:'Barrier repair',price:28,oldPrice:null,badge:'New',image:'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=700&q=80'},
  {id:3,name:'Essential Pain Relief',category:'Medicine',type:'Paracetamol 500mg',price:8,oldPrice:null,badge:null,image:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=80'},
  {id:4,name:'Glow From Within',category:'Wellness',type:'Daily vitamin complex',price:19,oldPrice:24,badge:'Save 20%',image:'https://images.unsplash.com/photo-1550572017-edd951aa8ca0?auto=format&fit=crop&w=700&q=80'},
  {id:5,name:'Hydra Lip Treatment',category:'Skincare',type:'Overnight balm',price:14,oldPrice:null,badge:null,image:'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=700&q=80'},
  {id:6,name:'Magnesium Night',category:'Wellness',type:'Gentle sleep support',price:16,oldPrice:null,badge:null,image:'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=700&q=80'},
  {id:7,name:'First Aid Essentials',category:'Medicine',type:'12 piece care kit',price:21,oldPrice:null,badge:'Everyday',image:'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=700&q=80'},
  {id:8,name:'Silk Body Wash',category:'Skincare',type:'Fragrance-free',price:18,oldPrice:null,badge:null,image:'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=80'},
  {id:9,name:'Rosehip Glow Oil',category:'Skincare',type:'Nourishing facial oil',description:'A lightweight botanical oil that leaves skin soft, calm, and naturally luminous.',price:22,oldPrice:null,badge:'New',image:'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=700&q=80'}
];

const supabaseSettings=window.KASHMIR_CURES_SUPABASE||{};
const supabaseClient=window.supabase&&supabaseSettings.url&&supabaseSettings.anonKey&&supabaseSettings.url !== 'https://YOUR_PROJECT_REF.supabase.co' && supabaseSettings.anonKey !== 'YOUR_PUBLIC_ANON_KEY'?window.supabase.createClient(supabaseSettings.url,supabaseSettings.anonKey):null;
const fallbackProductImage='https://images.unsplash.com/photo-1528740561762-bdc94aebc4f4?auto=format&fit=crop&w=1200&q=80';
let products=[];
let productsReady=false;
let isAdmin=false;

function isProductCatalogOnline(){
  return Boolean(supabaseClient);
}

function warnSharedCatalogRequired(message='Configure Supabase to turn product edits into a shared catalog for all visitors.'){
  console.warn(message);
  showToast(message);
}

let activeCategory='All';
let featuredOnly=false;
let cart=JSON.parse(localStorage.getItem('kashmir-cures-cart')||'[]');
const grid=document.getElementById('productGrid');
const cartDrawer=document.getElementById('cartDrawer');
const overlay=document.getElementById('drawerOverlay');
const toast=document.getElementById('toast');
const checkoutPage=document.getElementById('checkoutPage');
const productManager=document.getElementById('productManager');
const productManagerOverlay=document.getElementById('productManagerOverlay');
const productEditorList=document.getElementById('productEditorList');
const addProductForm=document.getElementById('addProductForm');
const adminAuth=document.getElementById('adminAuth');
const adminAuthOverlay=document.getElementById('adminAuthOverlay');
const adminAuthForm=document.getElementById('adminAuthForm');
const adminAuthButton=document.getElementById('adminAuthButton');
const adminSignOut=document.getElementById('adminSignOut');
function money(value){return `₹${value.toFixed(2)}`}
function escapeHtml(value){return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function isAuthorizedAdmin(user){return Boolean(user?.email&&supabaseSettings.adminEmail&&user.email.toLowerCase()===supabaseSettings.adminEmail.toLowerCase())}
function requireAdmin(){if(isAdmin)return true;showToast('Admin sign-in required');openAdminAuth();return false}
function updateAdminUi(){document.getElementById('manageProductsButton').hidden=!isAdmin;adminAuthButton.hidden=isAdmin;adminSignOut.hidden=!isAdmin;if(!isAdmin)closeProductManager()}
function openAdminAuth(){adminAuth.hidden=false;adminAuth.classList.add('open');adminAuthOverlay.classList.add('open');adminAuth.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeAdminAuth(){adminAuth.classList.remove('open');adminAuthOverlay.classList.remove('open');adminAuth.setAttribute('aria-hidden','true');adminAuth.hidden=true;if(!isAdmin)document.body.style.overflow=''}
async function handleAuthState(session){
  const user=session?.user;
  if(user&&!isAuthorizedAdmin(user)){
    isAdmin=false;
    updateAdminUi();
    showToast('This account is not authorized for admin access');
    setTimeout(()=>supabaseClient?.auth.signOut(),0);
    return;
  }
  isAdmin=Boolean(user);
  updateAdminUi();
  if(isAdmin)closeAdminAuth();
}
function renderProductEditor(){productEditorList.innerHTML=products.map(product=>`<div class="product-editor"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}"/><div class="product-editor-fields"><div class="product-editor-title"><strong>${escapeHtml(product.name)}</strong><button class="remove-product-button" type="button" data-remove-product="${escapeHtml(product.id)}" aria-label="Remove ${escapeHtml(product.name)}"><i data-lucide="trash-2"></i></button></div><label>Name<input data-product-field="name" data-product-id="${escapeHtml(product.id)}" value="${escapeHtml(product.name)}" /></label><label>Description<textarea rows="2" data-product-field="description" data-product-id="${escapeHtml(product.id)}">${escapeHtml(product.description||product.type)}</textarea></label><div class="editor-field-row"><label>Price<input type="number" min="0" step="0.01" data-product-field="price" data-product-id="${escapeHtml(product.id)}" value="${product.price}" /></label><label>Stock<input type="number" min="0" step="1" data-product-field="stock" data-product-id="${escapeHtml(product.id)}" value="${product.stock??0}" /></label></div><div class="editor-field-row"><label>Category<select data-product-field="category" data-product-id="${escapeHtml(product.id)}"><option ${product.category==='Skincare'?'selected':''}>Skincare</option><option ${product.category==='Medicine'?'selected':''}>Medicine</option><option ${product.category==='Wellness'?'selected':''}>Wellness</option></select></label><label>Product type<input data-product-field="type" data-product-id="${escapeHtml(product.id)}" value="${escapeHtml(product.type)}" /></label></div><label>Prescription required<select data-product-field="prescription_required" data-product-id="${escapeHtml(product.id)}"><option value="false" ${!product.prescription_required?'selected':''}>No</option><option value="true" ${product.prescription_required?'selected':''}>Yes</option></select></label><label>Image URL<input type="url" data-product-field="image" data-product-id="${escapeHtml(product.id)}" value="${escapeHtml(product.image)}" /></label><label>Change image<input type="file" accept="image/jpeg,image/png,image/webp" data-product-image="${escapeHtml(product.id)}" /></label></div></div>`).join('');productEditorList.querySelectorAll('[data-remove-product]').forEach(button=>button.addEventListener('click',()=>removeProduct(button.dataset.removeProduct)));lucide.createIcons()}
function openProductManager(){if(!requireAdmin())return;productManager.hidden=false;renderProductEditor();productManager.classList.add('open');productManagerOverlay.classList.add('open');productManager.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeProductManager(){productManager.classList.remove('open');productManagerOverlay.classList.remove('open');productManager.setAttribute('aria-hidden','true');productManager.hidden=true;document.body.style.overflow=''}
function productPayload(product){return {name:product.name,description:product.description||product.type,category:product.category,type:product.type,price:Number(product.price),stock:Number(product.stock??0),image:product.image,prescription_required:Boolean(product.prescription_required),old_price:product.oldPrice??null,badge:product.badge??null}}
async function uploadProductImage(file){if(!supabaseClient||!file)return null;const path=`${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'-')}`;const {error}=await supabaseClient.storage.from('product-images').upload(path,file,{upsert:false});if(error)throw error;return supabaseClient.storage.from('product-images').getPublicUrl(path).data.publicUrl}
async function saveProducts(){
  try {
    if (!requireAdmin()||!isProductCatalogOnline()) {
      warnSharedCatalogRequired('Supabase is not configured. Connect the shared database before saving product changes.');
      return;
    }

    productEditorList.querySelectorAll('[data-product-field]').forEach(input => {
      const product = products.find(item => String(item.id) === input.dataset.productId);
      if (product) {
        const field = input.dataset.productField;
        product[field] = field === 'price' || field === 'stock' ? Number(input.value) : field === 'prescription_required' ? input.value === 'true' : input.value.trim();
      }
    });

    for (const product of products) {
      const imageFile = productEditorList.querySelector(`[data-product-image="${CSS.escape(String(product.id))}"]`)?.files[0];
      if (imageFile) product.image = await uploadProductImage(imageFile);
    }

    for (const product of products) {
      const payload = productPayload(product);
      if (String(product.id).startsWith('draft-')) {
        const { data, error } = await supabaseClient.from('products').insert(payload).select().single();
        if (error) throw error;
        product.id = data.id;
      } else {
        const { error } = await supabaseClient.from('products').update(payload).eq('id', product.id);
        if (error) throw error;
      }
    }

    const ids = products.filter(product => !String(product.id).startsWith('draft-')).map(product => product.id);
    const { data: remote, error: remoteError } = await supabaseClient.from('products').select('id');
    if (remoteError) throw remoteError;

    const removed = (remote || []).map(row => row.id).filter(id => !ids.includes(id));
    if (removed.length) {
      const { error: deleteError } = await supabaseClient.from('products').delete().in('id', removed);
      if (deleteError) throw deleteError;
    }

    await loadProducts();
    renderProductEditor();
    cart = cart.filter(item => products.some(product => product.id === item.id));
    persist();
    renderCart();
    closeProductManager();
    showToast('Product changes saved');
  } catch (error) {
    console.error(error);
    showToast(`Could not save products: ${error.message || 'check Supabase setup'}`);
  }
}
function removeProduct(id){if(!requireAdmin())return;if(products.length===1){showToast('Keep at least one product');return}const product=products.find(item=>String(item.id)===String(id));if(!product||!window.confirm(`Remove ${product.name} from the catalog?`))return;products.splice(products.findIndex(item=>String(item.id)===String(id)),1);cart=cart.filter(item=>item.id!==id);renderProductEditor();renderProducts();renderCart()}
addProductForm.addEventListener('submit',async event=>{event.preventDefault();if(!requireAdmin()||!isProductCatalogOnline()){warnSharedCatalogRequired('Supabase must be connected before creating shared products.');return}const formData=new FormData(addProductForm);const imageFile=formData.get('image');let image=String(formData.get('image_url')||'').trim();try{if(imageFile?.size)image=await uploadProductImage(imageFile);const product={id:`draft-${Date.now()}`,name:String(formData.get('name')).trim(),category:String(formData.get('category')),type:String(formData.get('type')).trim(),description:String(formData.get('description')).trim(),price:Number(formData.get('price')),stock:Number(formData.get('stock')),prescription_required:formData.get('prescription_required')==='true',oldPrice:null,badge:null,image: image || fallbackProductImage};if(!product.name||!product.description||!product.type||Number.isNaN(product.price)||Number.isNaN(product.stock)){addProductForm.reportValidity();return}products.push(product);addProductForm.reset();renderProductEditor();renderProducts();showToast('Product added. Save changes to publish it.');productEditorList.lastElementChild?.scrollIntoView({behavior:'smooth',block:'nearest'})}catch(error){showToast(`Image upload failed: ${error.message||'check Supabase setup'}`)}});
async function resetProducts(){if(!requireAdmin()||!isProductCatalogOnline())return;try{const {error:deleteError}=await supabaseClient.from('products').delete().neq('id','00000000-0000-0000-0000-000000000000');if(deleteError)throw deleteError;const seed=defaultProducts.map(product=>productPayload({...product,stock:10,prescription_required:product.category==='Medicine'}));const {error}=await supabaseClient.from('products').insert(seed);if(error)throw error;await loadProducts();renderProductEditor();renderProducts();renderCart();showToast('Default products restored')}catch(error){showToast(`Could not reset products: ${error.message}`)}}
async function loadProducts(){if(!isProductCatalogOnline()){const fallbackProducts=defaultProducts.map(product=>({...product,stock:10,prescription_required:product.category==='Medicine'}));products=fallbackProducts;productsReady=true;renderProducts();renderCart();warnSharedCatalogRequired('Supabase is not configured, so the catalog is using the default demo products only. Add your project URL and anon key to make product changes shared across users.');return}const {data,error}=await supabaseClient.from('products').select('*').order('created_at');if(error){console.error(error);products=defaultProducts.map(product=>({...product,stock:10,prescription_required:product.category==='Medicine'}));showToast('Could not load Supabase products');renderProducts();renderCart();return}if(!data.length&&isAdmin){const seed=defaultProducts.map(product=>productPayload({...product,stock:10,prescription_required:product.category==='Medicine'}));const seeded=await supabaseClient.from('products').insert(seed).select();if(seeded.error)throw seeded.error;products=seeded.data}else products=data.map(product=>({...product,oldPrice:product.old_price,prescription_required:product.prescription_required}));productsReady=true;renderProducts();renderCart()}
function renderProducts(){
  const filtered=products.filter(product=>(activeCategory==='All'||product.category===activeCategory)&&(!featuredOnly||product.badge));
  grid.innerHTML=filtered.map(product=>`<article class="product-card"><div class="product-image"><img src="${product.image}" alt="${product.name}" loading="lazy"/>${product.badge?`<span class="badge">${product.badge}</span>`:''}<button class="quick-add" data-add="${product.id}" aria-label="Add ${product.name} to bag"><i data-lucide="plus"></i></button></div><div class="product-info"><h3>${product.name}</h3><p class="product-description">${product.description||product.type}</p><div class="product-meta"><span>${product.type}</span><span class="price">${money(product.price)}${product.oldPrice?` <s>${money(product.oldPrice)}</s>`:''}</span></div><button class="add-to-cart" data-add="${product.id}">Add to cart <i data-lucide="arrow-up-right"></i></button></div></article>`).join('');
  grid.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>addToCart(Number(button.dataset.add))));
  lucide.createIcons();
}
function addToCart(id){const existing=cart.find(item=>item.id===id); if(existing) existing.qty+=1; else cart.push({id,qty:1}); persist(); renderCart(); showToast();}
function changeQty(id,delta){const item=cart.find(row=>row.id===id);if(!item)return;item.qty+=delta;if(item.qty<=0)cart=cart.filter(row=>row.id!==id);persist();renderCart();}
function persist(){localStorage.setItem('kashmir-cures-cart',JSON.stringify(cart));document.getElementById('cartCount').textContent=cart.reduce((sum,item)=>sum+item.qty,0)}
function renderCart(){const items=document.getElementById('cartItems');const empty=document.getElementById('cartEmpty');const footer=document.getElementById('cartFooter');if(!cart.length){items.innerHTML='';empty.classList.add('show');footer.style.display='none';return}empty.classList.remove('show');footer.style.display='block';items.innerHTML=cart.map(item=>{const product=products.find(row=>row.id===item.id);return `<div class="cart-row"><img src="${product.image}" alt="${product.name}"/><div class="cart-row-info"><strong>${product.name}</strong><small>${product.type}</small><div class="row-bottom"><div class="qty-control"><button data-qty="${product.id}" data-delta="-1">-</button><span>${item.qty}</span><button data-qty="${product.id}" data-delta="1">+</button></div><strong>${money(product.price*item.qty)}</strong></div></div></div>`}).join('');items.querySelectorAll('[data-qty]').forEach(button=>button.addEventListener('click',()=>changeQty(Number(button.dataset.qty),Number(button.dataset.delta))));document.getElementById('cartTotal').textContent=money(cart.reduce((sum,item)=>{const product=products.find(row=>row.id===item.id);return sum+product.price*item.qty},0));}
function cartTotal(){return cart.reduce((sum,item)=>{const product=products.find(row=>row.id===item.id);return sum+product.price*item.qty},0)}
function renderCheckout(){const total=cartTotal();document.getElementById('placeOrderTotal').textContent=money(total);document.getElementById('summarySubtotal').textContent=money(total);document.getElementById('summaryTotal').textContent=money(total);document.getElementById('summaryItems').innerHTML=cart.map(item=>{const product=products.find(row=>row.id===item.id);return `<div class="summary-item"><img src="${product.image}" alt="${product.name}"/><div><strong>${product.name}</strong><span>Qty ${item.qty} · ${product.type}</span></div><b>${money(product.price*item.qty)}</b></div>`}).join('');lucide.createIcons()}
function openCart(){cartDrawer.classList.add('open');overlay.classList.add('open');document.body.style.overflow='hidden'}
function closeCart(){cartDrawer.classList.remove('open');overlay.classList.remove('open');document.body.style.overflow=''}
function openCheckout(){if(!cart.length)return;closeCart();renderCheckout();checkoutPage.hidden=false;document.body.classList.add('checkout-open');window.scrollTo({top:0,behavior:'smooth'})}
function closeCheckout(){checkoutPage.hidden=true;document.body.classList.remove('checkout-open');window.scrollTo({top:0,behavior:'smooth'})}
let toastTimer;function showToast(message='Added to your bag'){toast.querySelector('span').textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2200)}
adminAuthButton.addEventListener('click',openAdminAuth);document.getElementById('closeAdminAuth').addEventListener('click',closeAdminAuth);adminAuthOverlay.addEventListener('click',closeAdminAuth);adminAuthForm.addEventListener('submit',async event=>{event.preventDefault();if(!supabaseClient)return;const formData=new FormData(adminAuthForm);const {error}=await supabaseClient.auth.signInWithPassword({email:String(formData.get('email')).trim(),password:String(formData.get('password'))});if(error)showToast(`Sign-in failed: ${error.message}`)});adminSignOut.addEventListener('click',()=>supabaseClient?.auth.signOut());if(supabaseClient){supabaseClient.auth.onAuthStateChange((_event,session)=>handleAuthState(session));supabaseClient.auth.getSession().then(({data})=>handleAuthState(data.session))}updateAdminUi();
document.getElementById('manageProductsButton').addEventListener('click',openProductManager);document.getElementById('closeProductManager').addEventListener('click',closeProductManager);productManagerOverlay.addEventListener('click',closeProductManager);document.getElementById('saveProducts').addEventListener('click',saveProducts);document.getElementById('resetProducts').addEventListener('click',()=>{if(window.confirm('Reset all product details to the original defaults?'))resetProducts()});
document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelector('.tab.active').classList.remove('active');tab.classList.add('active');activeCategory=tab.dataset.category;renderProducts()}));
document.getElementById('filterButton').addEventListener('click',()=>{featuredOnly=!featuredOnly;document.getElementById('filterButton').innerHTML=featuredOnly?'<i data-lucide="x"></i> Clear filter':'<i data-lucide="sliders-horizontal"></i> Filter';renderProducts()});
document.getElementById('cartButton').addEventListener('click',openCart);document.getElementById('closeCart').addEventListener('click',closeCart);overlay.addEventListener('click',closeCart);document.getElementById('checkoutButton').addEventListener('click',openCheckout);document.getElementById('backToShop').addEventListener('click',closeCheckout);document.getElementById('editBag').addEventListener('click',()=>{closeCheckout();openCart()});
document.querySelectorAll('.payment-tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelector('.payment-tab.active').classList.remove('active');tab.classList.add('active');document.querySelectorAll('.payment-panel').forEach(panel=>panel.hidden=true);document.getElementById(`${tab.dataset.payment}Panel`).hidden=false;document.querySelectorAll('.payment-panel [required]').forEach(input=>input.required=tab.dataset.payment==='card')}));
const prescriptionInput=document.getElementById('prescriptionInput');
const prescriptionPreviews=document.getElementById('prescriptionPreviews');
let prescriptionFiles=[];
function renderPrescriptionPreviews(){prescriptionPreviews.innerHTML=prescriptionFiles.map((file,index)=>`<div class="prescription-preview"><img src="${URL.createObjectURL(file)}" alt="Prescription image ${index+1}"/><button type="button" data-remove-prescription="${index}" aria-label="Remove prescription image ${index+1}"><i data-lucide="x"></i></button></div>`).join('');prescriptionPreviews.querySelectorAll('[data-remove-prescription]').forEach(button=>button.addEventListener('click',()=>{prescriptionFiles.splice(Number(button.dataset.removePrescription),1);renderPrescriptionPreviews()}));lucide.createIcons()}
prescriptionInput.addEventListener('change',event=>{const selected=[...event.target.files].filter(file=>file.type.startsWith('image/'));prescriptionFiles=[...prescriptionFiles,...selected].slice(0,5);event.target.value='';renderPrescriptionPreviews()});
function renderOrderConfirmation(form){const orderId=`KC-${Date.now().toString().slice(-6)}`;const customerName=`${form.elements.firstName.value} ${form.elements.lastName.value}`.trim();const address=`${form.elements.address.value}, ${form.elements.city.value}, ${form.elements.state.value} ${form.elements.pin.value}`;const orderedItems=cart.map(item=>{const product=products.find(row=>row.id===item.id);return `<div class="confirmation-item"><img src="${product.image}" alt="${product.name}"/><div><strong>${product.name}</strong><span>Qty ${item.qty} · ${product.type}</span></div><b>${money(product.price*item.qty)}</b></div>`}).join('');const total=cartTotal();checkoutPage.innerHTML=`<div class="confirmation-shell"><div class="confirmation-header"><div><span class="success-icon"><i data-lucide="check"></i></span><p class="eyebrow">Order confirmed</p><h1>Care is on<br /><em>its way.</em></h1><p>Thank you, ${customerName || 'there'}. We have received your order and will send updates to ${form.elements.email.value}.</p><strong class="order-number">Order ${orderId}</strong></div><div class="delivery-card"><div class="delivery-card-top"><span class="status-dot"></span><div><strong>Preparing your order</strong><span>Estimated delivery · 2-3 business days</span></div></div><div class="status-track"><div class="status-step active"><span><i data-lucide="check"></i></span><div><strong>Order confirmed</strong><small>Just now</small></div></div><div class="status-step"><span><i data-lucide="package"></i></span><div><strong>Being prepared</strong><small>Next up</small></div></div><div class="status-step"><span><i data-lucide="truck"></i></span><div><strong>On its way</strong><small>We'll notify you</small></div></div></div></div></div><div class="confirmation-grid"><section class="confirmation-panel"><div class="confirmation-panel-heading"><div><p class="eyebrow">Your purchase</p><h2>Order summary</h2></div><span class="confirmed-label">Paid securely</span></div>${orderedItems}<div class="confirmation-total"><span>Total paid</span><strong>${money(total)}</strong></div></section><aside class="confirmation-panel delivery-details"><p class="eyebrow">Delivery details</p><h2>Arriving at</h2><strong>${customerName}</strong><p>${address}</p><p>${form.elements.phone.value}</p><div class="detail-note"><i data-lucide="shield-check"></i><span>Discreet packaging is included with every Kashmir Cures order.</span></div></aside></div><button class="primary-button confirmation-button" id="successBack">Continue shopping <i data-lucide="arrow-right"></i></button></div>`;cart=[];persist();lucide.createIcons();document.getElementById('successBack').addEventListener('click',closeCheckout)}
document.getElementById('checkoutForm').addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget;if(!form.checkValidity()){form.reportValidity();return}renderOrderConfirmation(form)});
document.getElementById('searchButton').addEventListener('click',()=>{const query=window.prompt('Search Kashmir Cures products');if(!query)return;const match=products.filter(product=>`${product.name} ${product.type} ${product.category}`.toLowerCase().includes(query.toLowerCase()));grid.innerHTML=match.length?match.map(product=>`<article class="product-card"><div class="product-image"><img src="${product.image}" alt="${product.name}"/><button class="quick-add" data-add="${product.id}" aria-label="Add ${product.name} to bag"><i data-lucide="plus"></i></button></div><div class="product-info"><h3>${product.name}</h3><p class="product-description">${product.description||product.type}</p><div class="product-meta"><span>${product.type}</span><span class="price">${money(product.price)}</span></div><button class="add-to-cart" data-add="${product.id}">Add to cart <i data-lucide="arrow-up-right"></i></button></div></article>`).join(''):`<p style="grid-column:1/-1;color:#6d7f79;padding:30px 0">No products found for “${query}”. Try another search.</p>`;grid.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>addToCart(Number(button.dataset.add))));lucide.createIcons()});
loadProducts().catch(error=>{console.error(error);showToast(`Could not load products: ${error.message||'check Supabase setup'}`)});persist();renderCart();lucide.createIcons();
