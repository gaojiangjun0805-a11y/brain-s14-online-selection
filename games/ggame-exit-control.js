(function(){
  function install(){
    document.getElementById('hubReturnStyle')?.remove();
    document.getElementById('hubReturnBtn')?.remove();
    const btn=document.createElement('a');
    btn.href='../../index.html';btn.textContent='←';btn.setAttribute('aria-label','返回海选项目列表');btn.title='返回海选项目列表';
    Object.assign(btn.style,{position:'fixed',left:'max(10px,env(safe-area-inset-left))',top:'max(10px,env(safe-area-inset-top))',zIndex:'2147483645',width:'44px',height:'44px',display:'grid',placeItems:'center',border:'1px solid rgba(255,255,255,.35)',borderRadius:'50%',background:'rgba(7,15,31,.88)',color:'#fff',font:'500 25px/1 system-ui',textDecoration:'none',boxShadow:'0 8px 24px rgba(0,0,0,.32)'});
    document.body.appendChild(btn);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0),{once:true});else setTimeout(install,0);
})();
