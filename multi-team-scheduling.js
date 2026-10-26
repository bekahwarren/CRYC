// Optional permission for a volunteer to serve on more than one team on the same Monday.
// This is separate from Floater status: team eligibility still comes from the volunteer's assigned teams.
(function(){
  function sameDayAssignments(volunteerId,date){return (data.assignments||[]).filter(a=>a.volunteer_id===volunteerId&&a.service_date===date)}

  eligibleVolunteers=function(teamId,date){
    return data.volunteers.filter(v=>{
      const teamEligible=v.primary_team_id===teamId;
      if(!teamEligible||!isVolunteerAvailable(v,date))return false;
      return sameDayAssignments(v.id,date).length===0;
    });
  };

  editVolunteer=function(id){
    const v=id?vol(id):null,current=v?.availability_type||'weekly',normalized=current==='every_monday'?'weekly':['first_third','second_fourth'].includes(current)?'biweekly':['first','second','third','fourth'].includes(current)?'monthly':current,selected=new Set(v?volunteerTeamIds(v):[]),autoColor=v?.personal_color||nextVolunteerColor();
    modal(`<h2>${v?'Edit':'Add'} Volunteer</h2><label>Name<input id="vName" required value="${esc(v?.name||'')}"></label><label>Phone<input id="vPhone" value="${esc(v?.phone||'')}"></label><label>Email<input id="vEmail" type="email" value="${esc(v?.email||'')}"></label><label>Primary Team<select id="vTeam">${data.teams.map(t=>`<option value="${t.id}" ${v?.primary_team_id===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select></label><label>Teams this volunteer can serve on<div style="margin-top:6px">${data.teams.map(t=>`<label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input class="vTeamCheck" type="checkbox" value="${t.id}" ${selected.has(t.id)?'checked':''} style="width:auto;margin:0"> ${esc(t.name)}</label>`).join('')}</div></label><p class="muted">Only the primary team is eligible for scheduling.</p><label>Availability<select id="vAvail">${AVAILABILITY_OPTIONS.map(([value,label])=>`<option value="${value}" ${normalized===value?'selected':''}>${label}</option>`).join('')}</select></label><p class="muted">Weekly and as-needed volunteers can be scheduled any Monday. Bi-weekly and monthly availability follows the person's most recent scheduled date unless specific Mondays have been entered.</p>${v?`<label>Volunteer Color <span class="muted">(optional)</span><input id="vColor" type="color" value="${autoColor}"></label><p class="muted">This color was assigned automatically. Change it only if you want this volunteer to have a specific color.</p>`:''}<label>Notes<textarea id="vNotes">${esc(v?.notes||'')}</textarea></label>`,async()=>{
      const primary=$('vTeam').value,ids=[...document.querySelectorAll('.vTeamCheck:checked')].map(x=>x.value);
      if(!ids.includes(primary))ids.push(primary);
      await api('save',{entity:'volunteer',id,data:{name:$('vName').value.trim(),phone:$('vPhone').value.trim(),email:$('vEmail').value.trim(),primary_team_id:primary,team_ids:ids,availability_type:$('vAvail').value,allow_multi_team_scheduling:false,personal_color:v?$('vColor').value:autoColor,notes:$('vNotes').value}})
    });
  };
})();