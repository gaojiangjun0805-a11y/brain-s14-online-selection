(function(){
  'use strict';
  const KEY='s14_overall_deadline_v1';
  const DURATION=45*60*1000;
  let fallback=null, expired=false;
  function readDeadline(){try{const value=Number(localStorage.getItem(KEY));return Number.isFinite(value)&&value>0?value:null}catch(e){return fallback}}
  function begin(){let deadline=readDeadline();if(!deadline){deadline=Date.now()+DURATION;fallback=deadline;try{localStorage.setItem(KEY,String(deadline))}catch(e){}}return deadline}
  function render(){
    const deadline=readDeadline(),seconds=deadline?Math.max(0,Math.ceil((deadline-Date.now())/1000)):2700;
    const timer=document.getElementById('s14-overall-timer');
    if(timer){timer.textContent=(deadline?'总剩余 ':'总限时 ')+String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');timer.classList.toggle('s14-timer-low',!!deadline&&seconds<=300)}
    const overlay=document.getElementById('s14-time-expired');
    if(deadline&&seconds<=0){
      expired=true;
      const rules=document.getElementById('s14-rules');if(rules&&rules.open)rules.close();
      if(overlay)overlay.hidden=false;
    }else{expired=false;if(overlay)overlay.hidden=true}
  }
  const style=document.createElement('style');style.textContent=`
    [hidden]{display:none!important}
    #s14-overall-timer{position:fixed;z-index:2147483644;top:max(9px,env(safe-area-inset-top));right:max(10px,env(safe-area-inset-right));padding:8px 10px;border:1px solid #8dcee766;border-radius:8px;background:#06111feF;color:#e9f8ff;font:700 13px/1.2 system-ui,-apple-system,sans-serif;font-variant-numeric:tabular-nums;box-shadow:0 4px 16px #0006}
    #s14-overall-timer.s14-timer-low{color:#ffcfcb;border-color:#ff7882}
    #s14-time-expired{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:20px;background:rgba(2,6,14,.94);color:#f5f9fc;font-family:system-ui,-apple-system,sans-serif;text-align:center}
    #s14-time-expired .s14-expired-card{max-width:420px;padding:30px;border:1px solid #88b5ca66;border-radius:14px;background:#0d1929;box-shadow:0 20px 65px #0008}
    #s14-time-expired h2{font-size:25px;margin:0 0 12px}#s14-time-expired p{font-size:15px;line-height:1.7;color:#b7c8d7;margin:0 0 18px}
    #s14-time-expired a{display:inline-block;padding:10px 18px;border-radius:8px;background:#a4e5f8;color:#071521;font-weight:700;text-decoration:none}
  `;document.head.appendChild(style);
  function install(){
    const badge=document.createElement('div');badge.id='s14-overall-timer';badge.setAttribute('role','timer');badge.setAttribute('aria-label','总剩余时间');document.body.appendChild(badge);
    const overlay=document.createElement('section');overlay.id='s14-time-expired';overlay.hidden=true;overlay.setAttribute('role','alert');
    const card=document.createElement('div');card.className='s14-expired-card';const title=document.createElement('h2');title.textContent='总时间已到';const desc=document.createElement('p');desc.textContent='45分钟挑战时间已结束。';card.append(title,desc);
    if(location.pathname.includes('/games/')){const back=document.createElement('a');back.href='../../index.html?v=20261028d';back.textContent='返回首页';card.appendChild(back)}
    overlay.appendChild(card);document.body.appendChild(overlay);render();
  }
  document.addEventListener('click',startCapture,true);document.addEventListener('touchend',startCapture,true);
  document.addEventListener('keydown',event=>{if(expired && event.key!=='Tab' && !(event.target instanceof Element && event.target.closest('#s14-time-expired a'))){event.preventDefault();event.stopImmediatePropagation()}},true);
  function startCapture(event){const target=event.target;if(!(target instanceof Element)||!target.closest('#welcome-start,#boot-start'))return;render();if(expired){event.preventDefault();event.stopImmediatePropagation();return}begin();render()}
  window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null)render()});document.addEventListener('visibilitychange',render);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setInterval(render,250);
})();
