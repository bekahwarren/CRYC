// Pending volunteer registrations appear as a separate intake team above active teams.
const renderActiveVolunteerTeams = renderVolunteers;

function pendingAvailabilityLabel(r){
  const map={weekly:'Weekly',bi_weekly:'Bi-weekly',biweekly:'Bi-weekly',monthly:'Monthly',as_needed:'As Needed',other:'Other'};
  const base=map[r?.availability_type]||String(r?.availability_type||'').replaceAll('_',' ');
  return r?.availability_type==='other'&&r?.availability_other?`${base} · ${r.availability_other}`:base;
}

function pendingTeamNames(ids=[]){
  return ids.map(id=>team(id)?.name).filter(Boolean).join(' · ')||'None selected';
}

function renderPendingVolunteers(){
  const root=$('pendingVolunteerSection');
  if(!root)return;
  const pending=data.pending_registrations||[];
  root.innerHTML=`<section class="volTeamGroup pendingApprovalGroup">
    <div class="volTeamHead pendingApprovalHead"><strong>New Volunteers - Awaiting Approval</strong><span class="pendingBadge">${pending.length}</span></div>
    <div class="volGrid pendingApprovalGrid">
      ${pending.length?pending.map(r=>`<div class="volCard pendingVolunteer">
        <div class="titleRow"><h3>${esc(r.name)} <span class="newBadge">NEW</span></h3></div>
        <div>${r.phone?`<a class="phone" href="tel:${String(r.phone).replace(/[^0-9+]/g,'')}">📞 ${esc(r.phone)}</a>`:'No phone'}</div>
        ${r.email?`<div>${esc(r.email)}</div>`:''}
        <div class="muted" style="margin-top:8px"><strong>Selected teams:</strong> ${esc(pendingTeamNames(r.team_ids))}</div>
        <div class="muted"><strong>Availability:</strong> ${esc(pendingAvailabilityLabel(r))}</div>
        ${r.notes?.trim()?`<div style="margin-top:8px;padding-top:8px;border-top:1px solid #eee"><strong>📝 Notes:</strong> <span class="muted">${esc(r.notes.trim())}</span></div>`:''}
        <div class="pendingActions"><button type="button" onclick="editRegistration('${r.id}')">Edit</button><button type="button" class="dangerText" onclick="deleteRegistration('${r.id}')">Delete</button><button type="button" class="primary" onclick="approveRegistration('${r.id}')">Approve</button></div>
      </div>`).join(''):'<div class="muted volEmpty">No new volunteer registrations are awaiting approval.</div>'}
    </div>
  </section>`;
}

renderVolunteers=function(){
  renderPendingVolunteers();
  renderActiveVolunteerTeams();
};
