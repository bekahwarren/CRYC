// Keep the leadership scheduler focused on today/future dates.
// Historical assignments remain stored and still power last-scheduled/availability logic.
(function(){
  const originalRenderSchedule=window.renderSchedule||renderSchedule;
  const localToday=()=>{const n=new Date();n.setHours(0,0,0,0);return n};
  function removePastScheduleCards(){
    const root=document.getElementById('weeks');
    if(!root)return;
    const today=localToday();
    [...root.children].forEach(card=>{
      const head=card.querySelector('.mondayHead b');
      if(!head)return;
      const text=head.textContent.replace(/^Monday\s*·\s*/,'').trim();
      const d=new Date(text);
      if(!Number.isNaN(d.getTime())){d.setHours(0,0,0,0);if(d<today)card.remove()}
    });
  }
  function fixBaseMonday(){
    if(typeof baseMonday!=='undefined' && baseMonday<localToday()) baseMonday=monday(new Date());
  }
  const wrapped=function(){fixBaseMonday();originalRenderSchedule();removePastScheduleCards()};
  window.renderSchedule=wrapped;
  if(typeof renderSchedule!=='undefined')renderSchedule=wrapped;
  document.addEventListener('DOMContentLoaded',removePastScheduleCards);
  setTimeout(removePastScheduleCards,0);
})();