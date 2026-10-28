// Admin-only approval notifications. Stored per browser after dismissal.
(function(){
  const oldBoot=boot;
  boot=async function(){await oldBoot();await showApprovalNotifications()};
  async function showApprovalNotifications(){
    if(!user?.is_admin)return;
    try{
      const result=await api('admin_activity',{entity_type:'volunteer_registration'});
      const approvals=(result.activity||[]).filter(x=>x.action==='approved');
      const seen=new Set(JSON.parse(localStorage.getItem('crycSeenApprovals')||'[]'));
      const unread=approvals.filter(x=>!seen.has(x.id));
      document.getElementById('approvalAlert')?.remove();
      if(!unread.length)return;
      const box=document.createElement('div');box.id='approvalAlert';
      box.style.cssText='background:#fff6d9;border:2px solid #e5b54a;border-radius:12px;padding:14px;margin:12px auto;max-width:1100px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap';
      const message=document.createElement('div');
      const heading=document.createElement('strong');heading.textContent='🔔 '+unread.length+' new volunteer approval'+(unread.length===1?'':'s');message.append(heading);
      unread.slice(0,10).forEach(x=>{const line=document.createElement('div');line.style.marginTop='5px';line.textContent=x.summary+' · '+new Date(x.created_at).toLocaleString();message.append(line)});
      const dismiss=document.createElement('button');dismiss.type='button';dismiss.textContent='Mark as read';
      dismiss.onclick=()=>{localStorage.setItem('crycSeenApprovals',JSON.stringify([...new Set([...seen,...unread.map(x=>x.id)])]));box.remove()};
      box.append(message,dismiss);
      document.querySelector('#app main')?.prepend(box);
    }catch(e){console.warn('Approval notifications unavailable',e)}
  }
})();
