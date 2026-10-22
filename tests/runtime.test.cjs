const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function runtime(initial={},mobile=true,route='index.html') {
  const store = new Map(Object.entries(initial));
  const attrs={};
  const document={readyState:'loading',body:{classList:{contains:()=>false},getAttribute:k=>attrs[k],setAttribute:(k,v)=>attrs[k]=v},addEventListener(){},querySelector(){return null;},querySelectorAll(){return [];}};
  const window={document,location:{search:'',pathname:'/v3/'+route,href:'https://example.test/v3/'+route},dispatchEvent(){},addEventListener(){},matchMedia:()=>({matches:mobile})};
  const ctx={window,document,location:window.location,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},URL,URLSearchParams,CustomEvent:class{},setInterval(){},clearInterval(){},setTimeout(){},console};
  vm.createContext(ctx);
  for(const file of ['data.js','theme.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'../v3/assets/js',file),'utf8'),ctx);
  return window;
}
test('category counts reflect the catalogue a client can actually browse',()=>{
 const w=runtime(); for(const cat of w.KV_DATA.categories) assert.equal(cat.count,w.KV.products.filter(p=>p.category===cat.id).length,cat.name);
});
test('instalment amounts reconcile exactly with total payable',()=>{
 const kv=runtime().KV; for(const p of kv.products) for(const months of [6,12,18,24,36]) {
  const c=kv.calc(p.price,25,months); assert.equal(c.down+c.monthly*(c.months-1)+c.finalMonthly,c.total);
 }
});
test('unsupported tenure uses a real plan instead of dividing by an invalid month count',()=>{
 const c=runtime().KV.calc(150000,20,0); assert.equal(c.months,12); assert.ok(Number.isFinite(c.monthly));
});
test('a manipulated down payment cannot create negative financed balances',()=>{
 const c=runtime().KV.calc(150000,200,12); assert.ok(c.financed>=0);assert.ok(c.monthly>=0);
});
test('cart quantities are clamped consistently on add and edit',()=>{
 const kv=runtime().KV,p=kv.products.find(p=>p.stock==='In stock');kv.cart.add(p.id,500,{silent:true});assert.equal(kv.cart.count(),99);kv.cart.add(p.id,3,{silent:true});assert.equal(kv.cart.count(),99);
});
test('saved carts ignore missing products and invalid quantities',()=>{
 const first=runtime().KV.products[0].id;
 const kv=runtime({'kv-cart':JSON.stringify([{id:'removed',qty:2},{id:first,qty:-10}])}).KV;assert.equal(kv.cart.count(),0);
});
test('preview links contain the entire selection and preserve page filters',()=>{
 const kv=runtime().KV;kv.options.set('skin','2');kv.options.set('header','3');
 const u=new URL(kv.options.url('https://example.test/v3/shop.html?cat=furniture'));
 assert.equal(u.searchParams.get('cat'),'furniture');assert.match(u.searchParams.get('opt'),/skin-2/);assert.match(u.searchParams.get('opt'),/header-1/);assert.match(u.searchParams.get('opt'),/footer-1/);
});
test('ready-made combinations retain individual controls',()=>{
 const kv=runtime().KV;assert.equal(kv.options.presets.length,3);kv.options.preset('modern');assert.equal(kv.options.get().skin,'2');kv.options.set('hero','3');assert.equal(kv.options.get().hero,'3');
});
test('navigation variants can be shared, restored, and reset independently',()=>{
 const kv=runtime().KV;kv.options.set('menu','2');kv.options.set('header','3');
 assert.equal(kv.options.get().menu,'2');assert.match(kv.options.url(),/menu-2/);
 const restored=runtime({'kv-options':JSON.stringify(kv.options.get())}).KV;
 assert.equal(restored.options.get().menu,'2');restored.options.reset();assert.equal(restored.options.get().menu,'1');
 for(const preset of kv.options.presets) {kv.options.preset(preset.id);assert.ok(['1','2'].includes(kv.options.get().menu));}
});
test('mobile presentation choices persist independently and are included in preview links',()=>{
 const kv=runtime().KV;kv.options.set('header','1');kv.options.set('card','3');
 for(const key of ['mheader','bottom','mcard']) kv.options.set(key,'2');
 assert.equal(kv.options.get().header,'1');assert.equal(kv.options.get().card,'3');
 const saved=runtime({'kv-options':JSON.stringify(kv.options.get())}).KV;
 for(const key of ['mheader','bottom','mcard']) {assert.equal(saved.options.get()[key],'2');assert.ok(saved.options.url().includes(key+'-2'));}
 for(const p of kv.options.presets) {kv.options.preset(p.id);for(const key of ['mheader','bottom','mcard']) assert.ok(['1','2','3'].includes(kv.options.get()[key]));}
 kv.options.reset();for(const key of ['mheader','bottom','mcard']) assert.equal(kv.options.get()[key],'1');
});

test('mobile card choices do not replace desktop card selections',()=>{
 const desktop=runtime({},false).KV;desktop.options.set('card','3');desktop.options.set('mcard','2');
 assert.match(desktop.card(desktop.products[0]),/card-3/);
 const mobile=runtime({},true).KV;mobile.options.set('card','3');mobile.options.set('mcard','2');
 assert.match(mobile.card(mobile.products[0]),/card-2/);
});
test('showroom data contains the single Avissawella location',()=>{
 const w=runtime();assert.equal(w.KV_DATA.stores.length,1);assert.equal(w.KV_DATA.stores[0].name,'Avissawella');assert.equal(w.KV_DATA.stores[0].address,w.KV_DATA.brand.address);
});

test('every product card exposes a native stretched product link and separate cart action',()=>{
 const kv=runtime().KV;for(const opt of ['1','2','3']) {const html=kv.card(kv.products[0],{opt});assert.match(html,/class="[^"]*kv-stretch/);assert.match(html,/data-kv-add=/);assert.match(html,/href="product.html\?id=/);}
});

test('mobile column count is independent, validated and included in shared selections',()=>{
 const kv=runtime().KV;kv.options.set('mcard','2');kv.options.set('mcols','1');assert.equal(kv.options.get().mcols,'1');assert.equal(kv.options.get().mcard,'2');assert.match(kv.options.url(),/mcols-1/);kv.options.set('mcols','3');assert.equal(kv.options.get().mcols,'1');
 const restored=runtime({'kv-options':JSON.stringify(kv.options.get())}).KV;assert.equal(restored.options.get().mcols,'1');kv.options.preset('modern');assert.equal(kv.options.get().mcols,'1');kv.options.reset();assert.equal(kv.options.get().mcols,'2');
});

test('bottom Shop and Deals state follows the current catalogue ordering',()=>{
 const w=runtime({},true,'shop.html');
 function link(href) {const attrs={href};return {attrs,active:false,getAttribute:k=>attrs[k],setAttribute:(k,v)=>attrs[k]=v,removeAttribute:k=>delete attrs[k],classList:{toggle(k,v){attrs.active=v;}}};}
 const shop=link('shop.html'),deals=link('shop.html?sort=deals');
 w.document.querySelectorAll=s=>s.startsWith('.kv-bottombar a')?[shop,deals]:[];
 w.location.search='?sort=deals';w.KV.sync();assert.equal(deals.attrs['aria-current'],'page');assert.equal(shop.attrs['aria-current'],undefined);
 w.location.search='?sort=price';w.KV.sync();assert.equal(shop.attrs['aria-current'],'page');assert.equal(deals.attrs['aria-current'],undefined);
});
test('modern preset keeps the complete retail header and icon submenus',()=>{
 const kv=runtime().KV;kv.options.preset('modern');assert.equal(kv.options.get().header,'1');assert.equal(kv.options.get().menu,'2');
});
test('all header/menu choices retain catalogue destinations and useful submenus',()=>{
 const w=runtime(),host={innerHTML:'',setAttribute(){}};w.document.querySelector=s=>s==='#site-header'?host:null;
 for(const header of ['1'])for(const menu of ['1','2']){
  w.KV.options.set('header',header);w.KV.options.set('menu',menu);
  for(const category of w.KV_DATA.categories)assert.ok(host.innerHTML.includes('shop.html?cat='+category.id),header+'/'+menu+'/'+category.id);
  assert.match(host.innerHTML,/data-kv-menu-parent/);assert.match(host.innerHTML,/>Sofas</);assert.doesNotMatch(host.innerHTML,/department-panel|mega-promo|catalog-quick|Shop by brand/);
 }
});

test('desktop header is limited to Retail, including saved selections and presets',()=>{
 const kv=runtime({'kv-options':JSON.stringify({header:'3',mheader:'2'})}).KV;
 assert.equal(kv.options.get().header,'1');assert.equal(kv.options.get().mheader,'2');
 kv.options.set('header','2');assert.equal(kv.options.get().header,'1');
 for(const preset of kv.options.presets){kv.options.preset(preset.id);assert.equal(kv.options.get().header,'1');}
});

test('removed compact icon menu restores as the remaining category icon menu',()=>{
 const kv=runtime({'kv-options':JSON.stringify({menu:'3'})}).KV;
 assert.equal(kv.options.get().menu,'2');kv.options.set('menu','3');assert.equal(kv.options.get().menu,'2');assert.doesNotMatch(kv.options.url(),/menu-3/);
});
