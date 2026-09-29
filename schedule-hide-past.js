// Keep leadership schedule and Capture on a rolling four upcoming Mondays.
// Historical assignments remain stored for last-scheduled and cadence calculations.
(function(){
  const originalRenderSchedule=window.renderSchedule||renderSchedule;
  const localToday=()=>{const n=new Date();n.setHours(0,0,0,0);return n};
  const firstVisibleMonday=()=>{const today=localToday(),m=monday(new Date());m.setHours(0,0,0,0);return m<today?plus(m,7):m};
  function parsedDate(text){const d=new Date(String(text||'').replace(/^Monday\s*·\s*/,'').trim());if(Number.isNaN(d.getTime()))return null;d.setHours(0,0,0,0);return d}
  function ensureFour(root,capture){
    if(!root)return;
    const today=localToday();
    [...root.children].forEach(card=>{const head=card.querySelector(capture?'h3':'.mondayHead b');const d=parsedDate(head?.textContent);if(d&&d<today)card.remove()});
    // If filtering removed a passed Monday from the original four-card block, append
    // the next Monday(s) so the view always contains four visible weeks.
    while(root.children.length<4){
      const cards=[...root.children],last=cards.length?parsedDate(cards[cards.length-1].querySelector(capture?'h3':'.mondayHead b')?.textContent):null;
      const d=last?plus(last,7):firstVisibleMonday();
      const filter=(capture?document.getElementById('captureTeam'):document.getElementById('teamFilter'))?.value||'all';
      root.insertAdjacentHTML('beforeend',weekHTML(d,filter,capture));
    }
  }
  function fixBaseMonday(){const first=firstVisibleMonday();if(typeof baseMonday!=='undefined'&&baseMonday<first)baseMonday=first}
  const wrapped=function(){fixBaseMonday();originalRenderSchedule();ensureFour(document.getElementById('weeks'),false)};
  window.renderSchedule=wrapped;if(typeof renderSchedule!=='undefined')renderSchedule=wrapped;
  const captureGrid=document.getElementById('captureGrid');
  if(captureGrid)new MutationObserver(()=>ensureFour(captureGrid,true)).observe(captureGrid,{childList:true,subtree:true});
  const fixCapture=()=>setTimeout(()=>ensureFour(document.getElementById('captureGrid'),true),0);
  ['capture','capturePrev','captureNext'].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener('click',fixCapture)});
  const captureTeam=document.getElementById('captureTeam');if(captureTeam)captureTeam.addEventListener('change',fixCapture);
  document.addEventListener('DOMContentLoaded',()=>{ensureFour(document.getElementById('weeks'),false);fixCapture()});
  setTimeout(()=>{ensureFour(document.getElementById('weeks'),false);fixCapture()},0);
})();