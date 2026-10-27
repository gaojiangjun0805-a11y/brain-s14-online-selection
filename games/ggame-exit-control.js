(function(){
  'use strict';
  const name=decodeURIComponent(location.pathname.split('/').filter(Boolean).slice(-2,-1)[0] || '');
  const rules={
    '缤纷叠影':'从当前盘面的格子拖动，沿折痕把起点一侧翻折到另一侧，上层颜色覆盖下层。连续折叠，使当前盘面与目标图形完全一致。',
    '黑白迭代':'点击一个格子，该格及上下左右相邻格子会同时翻转黑白。通过推理，使当前盘面与目标图形完全一致。',
    '旋转数阵':'点击菱形区域，周围四个数字球顺时针旋转。每个区域上方是当前和值，下方是目标值；让所有区域的和值同时达到目标。',
    '镜像裂隙':'对照左右两面魔方墙，点击右侧所有与左侧不同的格子。找出全部差异后完成挑战；建议手机横屏操作。',
    '一秒快门':'观察快门扫过时出现的黑格。画面消失后，在棋盘中点出刚才所有黑格，全部正确后完成挑战。'
  };
  function reset(){
    const settle=document.querySelector('#settle.show,#settle-mask.show');
    const ids=name==='缤纷叠影'||name==='黑白迭代' ? (settle?['sb-again']:['btn-reset']) : name==='旋转数阵'?['resetBtn']:['btn-new'];
    document.getElementById(ids[0])?.click();
  }
  function install(){
    document.getElementById('hubReturnStyle')?.remove();document.getElementById('hubReturnBtn')?.remove();
    const style=document.createElement('style');style.textContent=`
      #buttons button,.toolbox button,#settle-btns button,#playAgainBtn,#diff-bar,.ggame-level-picker,.ggame-level-dialog{display:none!important}
      body.s14-active{padding-bottom:76px!important}
      .s14-back{position:fixed;left:max(10px,env(safe-area-inset-left));top:max(10px,env(safe-area-inset-top));z-index:2147483645;width:44px;height:44px;display:grid;place-items:center;border:1px solid #ffffff59;border-radius:50%;background:#070f1fe8;color:white;font:500 25px/1 system-ui;text-decoration:none}
      .s14-tools{position:fixed;z-index:2147483645;bottom:0;left:0;right:0;display:none;justify-content:center;gap:8px;padding:9px 12px max(9px,env(safe-area-inset-bottom));background:linear-gradient(0deg,rgba(2,7,16,.98),rgba(4,10,21,.93));border-top:1px solid #8cc5e448}
      body.s14-active .s14-tools{display:flex}body.s14-active .s14-back{display:none}
      .s14-tools button,.s14-tools a{box-sizing:border-box;min-height:42px;min-width:92px;padding:9px 15px;display:grid;place-items:center;text-decoration:none;border:1px solid #9bc6d75c;border-radius:9px;background:#111c2d;color:#eef8ff;font:700 14px/1.2 system-ui,-apple-system,sans-serif;cursor:pointer}
      .s14-tools button:last-child{border-color:#70d5ef91;color:#b9f0ff}
      #s14-rules{width:min(480px,calc(100% - 36px));box-sizing:border-box;padding:25px;border:1px solid #78b8d481;border-radius:14px;background:#101b2c;color:#f2f7fc;font:16px/1.75 system-ui,-apple-system,sans-serif;box-shadow:0 20px 70px #000b}
      #s14-rules::backdrop{background:#02050bc9}#s14-rules h2{margin:0 0 12px;font-size:21px}#s14-rules p{margin:0 0 18px;color:#d0dbe6}#s14-rules button{padding:9px 22px;border:0;border-radius:8px;background:#b6ebfb;color:#10202a;font-weight:700;cursor:pointer}
      @media(max-width:360px){.s14-tools button,.s14-tools a{min-width:0;flex:1}}
    `;document.head.appendChild(style);
    const back=document.createElement('a');back.className='s14-back';back.href='../../index.html?v=20261027c';back.textContent='←';back.setAttribute('aria-label','返回海选项目列表');document.body.appendChild(back);
    const bar=document.createElement('nav');bar.className='s14-tools';bar.setAttribute('aria-label','挑战操作');
    const home=document.createElement('a');home.href=back.href;home.textContent='返回';home.setAttribute('aria-label','返回海选项目列表');
    const clear=document.createElement('button');clear.type='button';clear.textContent='重置';clear.addEventListener('click',reset);
    const info=document.createElement('button');info.type='button';info.textContent='规则说明';
    bar.append(home,clear,info);document.body.appendChild(bar);
    const dialog=document.createElement('dialog');dialog.id='s14-rules';dialog.setAttribute('aria-label','规则说明');
    const title=document.createElement('h2');title.textContent='规则说明';const text=document.createElement('p');text.textContent=rules[name]||'按照屏幕提示完成挑战。';
    const note=document.createElement('p');note.textContent='查看规则时，挑战计时继续。';note.style.fontSize='13px';
    const close=document.createElement('button');close.type='button';close.textContent='关闭';close.setAttribute('aria-label','关闭规则');close.addEventListener('click',()=>dialog.close());
    dialog.append(title,text,note,close);document.body.appendChild(dialog);info.addEventListener('click',()=>dialog.showModal());
    const start=document.querySelector('#welcome-start,#boot-start');if(start){const activate=()=>document.body.classList.add('s14-active');start.addEventListener('click',activate);start.addEventListener('touchend',activate);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0),{once:true});else setTimeout(install,0);
})();
