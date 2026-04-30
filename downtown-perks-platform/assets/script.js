const qs=(s,p=document)=>p.querySelector(s); const qsa=(s,p=document)=>[...p.querySelectorAll(s)];
qsa('[data-tabs]').forEach(group=>{
  const buttons=qsa('[data-step]',group); const panels=qsa('[data-panel]',group); let idx=0;
  const set=i=>{idx=i; buttons.forEach((b,n)=>b.classList.toggle('active',n===i)); panels.forEach((p,n)=>p.hidden=n!==i)};
  buttons.forEach((b,n)=>b.addEventListener('click',()=>set(n)));
  set(0);
});
qsa('[data-filter-group]').forEach(group=>{
  const buttons=qsa('.chip',group); const cards=qsa('[data-filter-item]');
  buttons.forEach(btn=>btn.addEventListener('click',()=>{
    const value=btn.dataset.value;
    buttons.forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    cards.forEach(card=>{card.style.display=(value==='all'||card.dataset.filterItem.includes(value))?'block':'none'});
  }));
});
qsa('[data-mailto-form]').forEach(form=>{
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const recipient=form.dataset.mailtoRecipient;
    if(!recipient)return;
    const subject=form.dataset.mailtoSubject||'Downtown Perks inquiry';
    const entries=[...new FormData(form).entries()].filter(([,value])=>String(value).trim());
    const body=entries.map(([key,value])=>`${key.replace(/_/g,' ')}: ${String(value).trim()}`).join('\n');
    const query=`subject=${encodeURIComponent(subject)}${body?`&body=${encodeURIComponent(body)}`:''}`;
    window.location.href=`mailto:${recipient}?${query}`;
  });
});
qsa('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
