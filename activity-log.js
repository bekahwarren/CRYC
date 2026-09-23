// Admin-only activity log. Backend enforces admin access as well.
async function loadActivity(){
  const root=document.getElementById('activityLog');
  if(!root||!user?.is_admin)return;
  root.innerHTML='<div class="settingsCard"><div class="settingsHead"><b>Activity Log</b></div><div class="body muted">Loading activity…</div></div>';
  try{
    const r=await api('admin_activity');
    const rows=r.activity||[];
    root.innerHTML=`<div class="settingsCard"><div class="settingsHead titleRow"><span><b>Activity Log</b><div class="muted">Admin only · tracks scheduler changes. PIN values are never shown.</div></span><button type="button" id="refreshActivity">Refresh</button></div><div class="body"><div class="toolbar" style="margin-bottom:12px"><select id="activityUser"><option value="">All users</option>${[...new Set(rows.map(x=>x.actor_name))].sort().map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('')}</select><select id="activityType"><option value="">All changes</option>${[...new Set(rows.map(x=>x.entity_type))].sort().map(n=>`<option value="${esc(n)}">${esc(n.replaceAll('_',' '))}</option>`).join('')}</select></div><div id="activityRows"></div></div></div>`;
    const render=()=>{const who=document.getElementById('activityUser').value,type=document.getElementById('activityType').value,filtered=rows.filter(x=>(!who||x.actor_name===who)&&(!type||x.entity_type===type));document.getElementById('activityRows').innerHTML=filtered.length?filtered.map(x=>`<div class="row" style="align-items:flex-start"><span><b>${esc(x.actor_name)}</b> · ${esc(x.summary)}<div class="muted">${new Date(x.created_at).toLocaleString()} · ${esc(x.entity_type.replaceAll('_',' '))}</div></span></div>`).join(''):'<div class="muted">No matching activity yet.</div>'};
    document.getElementById('activityUser').onchange=render;document.getElementById('activityType').onchange=render;document.getElementById('refreshActivity').onclick=loadActivity;render();
  }catch(e){root.innerHTML=`<div class="settingsCard"><div class="settingsHead"><b>Activity Log</b></div><div class="body error">${esc(e.message)}</div></div>`}
}
const originalRenderSettings=renderSettings;
renderSettings=function(){originalRenderSettings();let root=document.getElementById('activityLog');if(user?.is_admin){if(!root){root=document.createElement('div');root.id='activityLog';document.getElementById('settings').appendChild(root)}loadActivity()}else if(root)root.remove()};