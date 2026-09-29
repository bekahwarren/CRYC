// Keep leadership schedule and Capture focused on today/future dates.
// Historical assignments remain stored for last-scheduled and cadence calculations.
(function(){
  const originalRenderSchedule=window.renderSchedule||renderSchedule;
  const localToday=()=>{const n=new Date();n.setHours(0,0,0,0);return n};
  function parsedDate(text){const d=new Date(String(text||'').replace(/^Monday\s*·\s*/,'').trim());if(Number.isNaN(d.getTime()))return null;d.setHours(0,0,0,0);return d}
  function removePastScheduleCards(){
    const root=document.getElementById('weeks');if(!root)return;
    const today=localToday();
    [...root.children].forEach(card=>{const head=card.querySelector('.mondayHead b');const d=parsedDate(head?.textContent);if(d&&d<today)card.remove()});
  }
  function removePastCaptureCards(){
    const root=document.getElementById('captureGrid');if(!root)return;
    const today=localToday();
    [...root.children].forEach(card=>{const head=card.querySelector('h3');const d=parsedDate(head?.textContent);if(d&&d<today)card.remove()});
  }
  function fixBaseMonday(){if(typeof baseMonday!=='undefined'&&baseMonday<localToday())baseMonday=monday(new Date())}
  const wrapped=function(){fixBaseMonday();originalRenderSchedule();removePastScheduleCards()};
  window.renderSchedule=wrapped;if(typeof renderSchedule!=='undefined')renderSchedule=wrapped;
  // Capture is rendered separately from the main schedule, so watch that grid too.
  const captureGrid=document.getElementById('captureGrid');
  if(captureGrid)new MutationObserver(removePastCaptureCards).observe(captureGrid,{childList:true,subtree:true});
  const captureButton=document.getElementById('capture');if(captureButton)captureButton.addEventListener('click',()=>setTimeout(removePastCaptureCards,0));
  const capturePrev=document.getElementById('capturePrev');if(capturePrev)capturePrev.addEventListener('click',()=>setTimeout(removePastCaptureCards,0));
  const captureNext=document.getElementById('captureNext');if(captureNext)captureNext.addEventListener('click',()=>setTimeout(removePastCaptureCards,0));
  const captureTeam=document.getElementById('captureTeam');if(captureTeam)captureTeam.addEventListener('change',()=>setTimeout(removePastCaptureCards,0));
  document.addEventListener('DOMContentLoaded',()=>{removePastScheduleCards();removePastCaptureCards()});
  setTimeout(()=>{removePastScheduleCards();removePastCaptureCards()},0);
})();