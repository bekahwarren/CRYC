// Volunteer directory grouping + availability scheduling enhancements.
// Loaded after app.js so these targeted enhancements do not disturb the working core app.
const AVAILABILITY_OPTIONS=[
  ['weekly','Weekly'],
  ['biweekly','Bi-weekly'],
  ['monthly','Monthly'],
  ['as_needed','As needed'],
  ['specific_mondays','Specific Mondays']
];

function availabilityLabel(v){
  const raw=v?.availability_type||'';
  const map={
    weekly:'Weekly',every_monday:'Weekly',
    biweekly:'Bi-weekly',first_third:'Bi-weekly — 1st & 3rd Mondays',second_fourth:'Bi-weekly — 2nd & 4th Mondays',
    monthly:'Monthly',first:'Monthly — 1st Monday',second:'Monthly — 2nd Monday',third:'Monthly — 3rd Monday',fourth:'Monthly — 4th Monday',
    as_needed:'As needed',specific_mondays:'Specific Mondays'
  };
  return map[raw]||raw.replaceAll('_',' ');
}
function mondayOccurrence(d){return Math.ceil(d.getDate()/7)}
function dateListed(v,date){
  return data.specific_dates.some(x=>x.volunteer_id===v.id&&x.available_date===date);
}
function isVolunteerAvailable(v,date){
  if(!v)return false;
  const d=new Date(date+'T12:00:00'),occ=mondayOccurrence(d),raw=v.availability_type||'';
  if(raw==='weekly'||raw==='every_monday')return true;
  if(raw==='first_third')return occ===1||occ===3;
  if(raw==='second_fourth')return occ===2||occ===4;
  if(raw==='first')return occ===1;
  if(raw==='second')return occ===2;
  if(raw==='third')return occ===3;
  if(raw==='fourth')return occ===4;
  if(raw==='specific_mondays')return dateListed(v,date);
  // Generic bi-weekly/monthly patterns need an anchor/specific date before they can be proven available.
  // Until one exists, warn rather than incorrectly claiming availability.
  if(raw==='biweekly'||raw==='monthly')return dateListed(v,date);
  // As-needed volunteers can still be selected, but are intentionally shown as needing confirmation.
  if(raw==='as_needed')return false;
  return false;
}
function volunteerOption(v,date){
  const available=isVolunteerAvailable(v,date),label=availabilityLabel(v);
  return `<option value="${v.id}">${available?'':'⚠ '}${esc(v.name)} — ${esc(label)}${available?'':' · Check availability'}</option>`;
}

// Restore the availability-aware assignment dialog. Unavailable people are warned, not blocked.
window.addAssignment=date=>{
  const tOpts=data.teams.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');
  modal(`<h2>Add to ${fmt(new Date(date+'T12:00:00'))}</h2>
    <label>Team<select id="aTeam">${tOpts}</select></label>
    <label>Position<select id="aPos"></select></label>
    <label>Volunteer<select id="aVol">${data.volunteers.map(v=>volunteerOption(v,date)).join('')}</select></label>
    <div id="availabilityNotice" class="muted" style="margin-top:8px"></div>`,async()=>{
      const p=pos($('aPos').value),v=vol($('aVol').value);
      if(!p)throw Error('Please choose a valid position.');
      if(!v)throw Error('Please choose a volunteer.');
      if(!isVolunteerAvailable(v,date)){
        const ok=confirm(`${v.name} is marked ${availabilityLabel(v)} and is not confirmed available for ${fmt(new Date(date+'T12:00:00'))}.\n\nSchedule them anyway?`);
        if(!ok)throw Error('Scheduling cancelled.');
      }
      await api('save',{entity:'assignment',data:{service_date:date,team_id:$('aTeam').value,position_id:p.id,position_label:p.name,volunteer_id:v.id}});
    });
  const fillPositions=()=>{$('aPos').innerHTML=data.positions.filter(p=>p.team_id===$('aTeam').value).map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')};
  const showAvailability=()=>{const v=vol($('aVol').value);$('availabilityNotice').innerHTML=v?(isVolunteerAvailable(v,date)?`✓ ${esc(v.name)} is marked available for this Monday.`:`⚠ ${esc(v.name)} is <strong>not confirmed available</strong> for this Monday. You can still schedule them if they agreed to serve.`):''};
  $('aTeam').onchange=fillPositions;$('aVol').onchange=showAvailability;fillPositions();showAvailability();
};

// Override volunteer editor with the simplified recurring availability choices requested for new/edited profiles.
window.editVolunteer=id=>{
  const v=id?vol(id):null,current=v?.availability_type||'weekly';
  const normalized=current==='every_monday'?'weekly':['first_third','second_fourth'].includes(current)?'biweekly':['first','second','third','fourth'].includes(current)?'monthly':current;
  modal(`<h2>${v?'Edit':'Add'} Volunteer</h2>
    <label>Name<input id="vName" required value="${esc(v?.name||'')}"></label>
    <label>Phone<input id="vPhone" value="${esc(v?.phone||'')}"></label>
    <label>Email<input id="vEmail" type="email" value="${esc(v?.email||'')}"></label>
    <label>Primary Team<select id="vTeam">${data.teams.map(t=>`<option value="${t.id}" ${v?.primary_team_id===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select></label>
    <label>Availability<select id="vAvail">${AVAILABILITY_OPTIONS.map(([value,label])=>`<option value="${value}" ${normalized===value?'selected':''}>${label}</option>`).join('')}</select></label>
    <p class="muted">Bi-weekly, monthly, as-needed, and specific-Monday volunteers will show a warning when a Monday is not confirmed. You can still schedule them when they agree to serve.</p>
    <label>Volunteer Color<input id="vColor" type="color" value="${v?.personal_color||'#d9c7ef'}"></label>
    <label>Notes<textarea id="vNotes">${esc(v?.notes||'')}</textarea></label>`,async()=>api('save',{entity:'volunteer',id,data:{name:$('vName').value.trim(),phone:$('vPhone').value.trim(),email:$('vEmail').value.trim(),primary_team_id:$('vTeam').value,availability_type:$('vAvail').value,personal_color:$('vColor').value,notes:$('vNotes').value}}));
};

function renderVolunteers(){
  const root=$('volunteerList');
  root.className='volunteerTeams';
  root.innerHTML=data.teams.map(t=>{
    const people=data.volunteers.filter(v=>v.primary_team_id===t.id);
    return `<section class="volTeamGroup"><div class="volTeamHead" style="background:${t.color}"><strong>${esc(t.name)}</strong></div><div class="volGrid">
      ${people.length?people.map(v=>`<div class="volCard"><div class="titleRow"><h3><i class="dot" style="background:${v.personal_color||'#eee'}"></i>${esc(v.name)}</h3><span><button type="button" onclick="editVolunteer('${v.id}')">Edit</button> <button type="button" onclick="deleteVolunteer('${v.id}')">Delete</button></span></div><div>${v.phone?`<a class="phone" href="tel:${v.phone.replace(/[^0-9+]/g,'')}">📞 ${esc(v.phone)}</a>`:'No phone'}</div><div>${esc(v.email||'')}</div><div class="muted">Availability: ${esc(availabilityLabel(v))}</div></div>`).join(''):'<div class="muted volEmpty">No volunteers on this team yet.</div>'}
    </div></section>`;
  }).join('');
}
window.deleteVolunteer=async id=>{const v=vol(id);if(!v)return;if(!confirm(`Delete ${v.name}'s volunteer profile?\n\nThis cannot be undone.`))return;try{await api('delete',{entity:'volunteer',id});await refresh()}catch(e){alert('Could not delete this volunteer: '+e.message)}};