(function(){
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const money = n => window.CM.fmt(n);
  const showTab = name => { $$('.cm-account-nav button').forEach(b => b.classList.toggle('active', b.dataset.accountTab === name)); $$('.account-panel').forEach(p => p.classList.toggle('active', p.dataset.accountPanel === name)); window.scrollTo({top: $('.cm-account-layout').offsetTop - 80, behavior:'smooth'}); };
  $$('[data-account-tab]').forEach(button => button.addEventListener('click', () => showTab(button.dataset.accountTab)));
  $$('[data-account-jump]').forEach(link => link.addEventListener('click', e => { e.preventDefault(); showTab(link.dataset.accountJump); }));
  $('#demo-login')?.addEventListener('click', e => { e.currentTarget.textContent = 'Demo account active'; e.currentTarget.disabled = true; $('.cm-account-login')?.classList.add('is-confirmed'); });
  const rows = [
    ['01','15 Jul 2026',24950,'Paid','status-success'],['02','15 Aug 2026',24950,'Paid','status-success'],['03','15 Sep 2026',24950,'Paid','status-success'],['04','15 Oct 2026',24950,'Paid','status-success'],['05','15 Nov 2026',24950,'Due','status-warning'],['06','15 Dec 2026',24950,'Upcoming',''],['07','15 Jan 2027',24950,'Upcoming',''],['08','15 Feb 2027',24950,'Upcoming',''],['09','15 Mar 2027',24950,'Upcoming',''],['10','15 Apr 2027',24950,'Upcoming',''],['11','15 May 2027',24950,'Upcoming',''],['12','15 Jun 2027',24950,'Upcoming','']
  ];
  const tbody = $('#schedule-body'); if(tbody) tbody.innerHTML = rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${money(r[2])}</td><td><span class="cm-status-badge ${r[4]}">${r[3]}</span></td></tr>`).join('');
  if(tbody){const legend=document.createElement('div');legend.className='cm-schedule-legend';legend.innerHTML='<span class="cm-status-badge status-success">Paid</span><span class="cm-status-badge status-warning">Due</span><span class="cm-status-badge">Upcoming</span><span class="cm-status-badge status-danger">Overdue</span>';tbody.closest('.cm-card').append(legend);}
  const wishlist = JSON.parse(localStorage.getItem('cm-wishlist') || '[]'); const products = (window.CM.products || []).filter(p => wishlist.includes(p.id)); const grid = $('#account-wishlist');
  if(grid && products.length) grid.innerHTML = products.map(CM.productCard).join(''); else if($('#wishlist-empty')) $('#wishlist-empty').hidden = false;
  const modal = $('#track-modal'); $$('[data-track-order]').forEach(button => button.addEventListener('click',()=>{ $('#track-title').textContent = `Order #${button.dataset.trackOrder}`; modal.hidden = false; document.body.classList.add('modal-open'); }));
  $$('[data-close-modal]').forEach(button => button.addEventListener('click',()=>{ modal.hidden=true; document.body.classList.remove('modal-open'); })); modal?.addEventListener('click', e=>{if(e.target===modal){modal.hidden=true;document.body.classList.remove('modal-open');}});
  $$('[data-pay-now],[data-demo-toast]').forEach(button => button.addEventListener('click',()=>{ if(window.bootstrap){let toast=document.querySelector('.cm-toast'); if(!toast){toast=document.createElement('div');toast.className='cm-toast toast align-items-center text-bg-dark border-0';toast.innerHTML='<div class="toast-body"></div>';document.body.append(toast);}toast.querySelector('.toast-body').textContent=button.dataset.demoToast || 'PayHere demo checkout would open here.';bootstrap.Toast.getOrCreateInstance(toast,{delay:2600}).show();} }));
  $('#download-statement')?.addEventListener('click',()=>{const blob=new Blob(['Kavindu Online Store demo statement\nPlan: EP-2026-0184\nCustomer: Nimal Perera\nPaid: 5 of 12'],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='kavindu-demo-statement.txt';a.click();URL.revokeObjectURL(url);});
})();
