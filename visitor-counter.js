(function(){
  const c=window.SAILOM_COUNTER_CONFIG||{},main=document.getElementById("visitorCount"),foot=document.getElementById("visitorCountFooter");
  const set=v=>{if(main)main.textContent=v;if(foot)foot.textContent=v};
  if(!c.COUNTER_ENDPOINT||c.COUNTER_ENDPOINT.includes("PASTE_YOUR_")){set("—");return}
  (async()=>{try{
    const u=new URL(c.COUNTER_ENDPOINT);u.searchParams.set("action","count");u.searchParams.set("projectId",c.PROJECT_ID);u.searchParams.set("projectName",c.PROJECT_NAME);u.searchParams.set("_",Date.now());
    const r=await fetch(u,{cache:"no-store"}),d=await r.json();set(d.ok?Number(d.views).toLocaleString("th-TH"):"—");
  }catch(e){set("—")}})();
})();