// Volunteer directory grouping override.
// Loaded after app.js so the rest of the scheduler remains unchanged.
function renderVolunteers(){
  const root=$('volunteerList');
  root.className='volunteerTeams';
  root.innerHTML=data.teams.map(t=>{
    const people=data.volunteers.filter(v=>v.primary_team_id===t.id);
    return `<section class="volTeamGroup">
      <div class="volTeamHead" style="background:${t.color}">
        <strong>${esc(t.name)}</strong><span>${people.length} volunteer${people.length===1?'':'s'}</span>
      </div>
      <div class="volGrid">
        ${people.length?people.map(v=>`<div class="volCard">
          <div class="titleRow"><h3><i class="dot" style="background:${v.personal_color||'#eee'}"></i>${esc(v.name)}</h3><button type="button" onclick="editVolunteer('${v.id}')">Edit</button></div>
          <div>${v.phone?`<a class="phone" href="tel:${v.phone.replace(/[^0-9+]/g,'')}">📞 ${esc(v.phone)}</a>`:'No phone'}</div>
          <div>${esc(v.email||'')}</div>
          <div class="muted">Availability: ${esc((v.availability_type||'').replaceAll('_',' '))}</div>
        </div>`).join(''):'<div class="muted volEmpty">No volunteers on this team yet.</div>'}
      </div>
    </section>`;
  }).join('');
}