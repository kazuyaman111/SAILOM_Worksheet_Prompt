const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let platform="canva";
const verbsMap=[
  {keys:["อ่าน","ตอบคำถาม"],acts:["เลือกตอบ","ตอบคำถามสั้น"],why:"ตัวชี้วัดเน้นการอ่านและตอบคำถาม จึงควรมีข้อความสั้นแล้วถามความเข้าใจ"},
  {keys:["จำแนก","แยก"],acts:["จัดหมวดหมู่","จับคู่"],why:"ตัวชี้วัดเน้นการจำแนก จึงควรให้เด็กเห็นตัวอย่างแล้วจัดกลุ่ม"},
  {keys:["อธิบาย","บรรยาย"],acts:["ตอบคำถามสั้น","วิเคราะห์ภาพ"],why:"ตัวชี้วัดเน้นการอธิบาย จึงควรมีพื้นที่ให้เด็กเขียนคำตอบสั้น ๆ"},
  {keys:["วิเคราะห์","เปรียบเทียบ"],acts:["สถานการณ์","วิเคราะห์ภาพ","ตอบคำถามสั้น"],why:"ตัวชี้วัดเน้นการคิดขั้นสูง จึงควรมีข้อมูลหรือสถานการณ์ให้วิเคราะห์"},
  {keys:["คำนวณ","หาผล","บวก","ลบ","คูณ","หาร"],acts:["เติมคำ","เลือกตอบ"],why:"ตัวชี้วัดเน้นทักษะคำนวณ ควรมีโจทย์เรียงจากง่ายไปยาก"},
  {keys:["เรียง","ลำดับ"],acts:["เรียงลำดับ","จับคู่"],why:"ตัวชี้วัดเน้นลำดับขั้นหรือเหตุการณ์"},
  {keys:["สร้าง","วาด","ออกแบบ"],acts:["วิเคราะห์ภาพ","สถานการณ์"],why:"ตัวชี้วัดเน้นการสร้างผลงาน ควรมีภารกิจสร้างชิ้นงานหรือวางแผน"}
];
function val(id){return $("#"+id).value}
function styleVal(){return $('input[name=style]:checked')?.value||"Cute Kids"}
function selectedActs(){return $$("#activities input:checked").map(x=>x.value)}
function analyze(){
  const t=val("indicator");
  let acts=[],reasons=[];
  verbsMap.forEach(m=>{
    if(m.keys.some(k=>t.includes(k))){
      m.acts.forEach(a=>{if(!acts.includes(a))acts.push(a)});
      reasons.push(m.why);
    }
  });
  if(!acts.length){acts=["จับคู่","เติมคำ","ตอบคำถามสั้น"];reasons=["ยังไม่พบคำกริยาชัดเจน ระบบใช้รูปแบบกิจกรรมกลาง"];}
  acts=acts.slice(0,3);
  if($("#smart").checked){
    $$("#activities input").forEach(x=>x.checked=acts.includes(x.value));
  }
  $("#analysisBox").innerHTML=`<b>🤖 Smart Engine แนะนำ:</b> ${acts.map(a=>`<span class="tag">${a}</span>`).join("")}<div>${reasons[0]}</div>`;
  renderPaper();
}
function demo(){
  $("#grade").value="ป.4";
  $("#subject").value="ภาษาไทย";
  $("#topic").value="การอ่านจับใจความจากเรื่องสั้น";
  $("#indicator").value="ท 1.1 ป.4/3 อ่านเรื่องสั้น ๆ ตามเวลาที่กำหนดและตอบคำถามจากเรื่องที่อ่าน";
  $("#duration").value="20 นาที";
  $("#difficulty").value="ปานกลาง";
  $("#questionCount").value="8";
  $("#activityCount").value="2";
  $("#smart").checked=true;
  analyze(); generate();
}
function clearForm(){
  $("#topic").value="";
  $("#indicator").value="";
  $$("#activities input").forEach(x=>x.checked=false);
  $("#output").value="";
  $("#qualityScore").textContent="0";
  $("#qualityText").textContent="ยังไม่ได้สร้าง";
  $("#qualityList").innerHTML="";
  renderPaper();
}

function updateCapacity(){
  const q=Number($("#questionCount").value), a=Number($("#activityCount").value), g=$("#grade").value, mins=parseInt($("#duration").value);
  const maxQ={"ป.1":6,"ป.2":7,"ป.3":8,"ป.4":9,"ป.5":10,"ป.6":10}[g]||8;
  let risk=0;if(q>maxQ)risk+=2;if(a>=3)risk++;if(mins<=15&&q>=8)risk+=2;
  const box=$("#capacityWarning");
  if(risk===0)box.innerHTML=`✅ <b>A4 น่าจะพอดี</b> — ${q} ข้อ / ${a} กิจกรรม สำหรับ ${g}`;
  else if(risk<=2)box.innerHTML=`⚠️ <b>ค่อนข้างแน่น</b> — หาก Canva จัดหน้าแน่น แนะนำลดข้อหรือกิจกรรม`;
  else box.innerHTML=`⛔ <b>เสี่ยงล้น A4</b> — ควรลดจำนวนข้อ/กิจกรรมก่อนเจน`;
  return risk;
}
function teacherKeyPrompt(){
  return `สร้างเฉลยสำหรับครูของใบงานต่อไปนี้ โดยไม่ใส่เฉลยลงในหน้าใบงานนักเรียน\n\nระดับชั้น: ${$("#grade").value}\nวิชา: ${$("#subject").value}\nเรื่อง: ${$("#topic").value}\nตัวชี้วัด/ผลลัพธ์การเรียนรู้: ${$("#indicator").value}\nรูปแบบกิจกรรม: ${selectedActs().join(" + ")}\nจำนวนข้อประมาณ: ${$("#questionCount").value}\n\nให้ตอบ:\n1. เฉลยทีละข้อแบบกระชับ\n2. ข้อเขียนให้ระบุแนวคำตอบที่ยอมรับได้\n3. ถ้าตอบได้หลายแบบ ให้ระบุเกณฑ์ตรวจ\n4. ตรวจว่าเฉลยสอดคล้องตัวชี้วัดและระดับชั้น\n5. หากโจทย์ใดกำกวม ให้แจ้งครูว่าควรแก้อย่างไร`;
}

function makePrompt(){
  if($("#smart").checked) analyze();
  const acts=selectedActs();
  const extras=[];
  if($("#nameField").checked)extras.push("มีช่องชื่อ–นามสกุล / ชั้น / เลขที่");
  if($("#scoreField").checked)extras.push("มีช่องคะแนนรวม");
  if($("#instructionField").checked)extras.push("แต่ละกิจกรรมมีคำชี้แจงสั้นและชัดเจน");
  if($("#onePage").checked)extras.push("เนื้อหาทั้งหมดต้องจบในกระดาษ A4 เพียง 1 หน้า ห้ามล้นไปหน้าที่ 2");
  if($("#answerKey").checked)extras.push("เพิ่มแนวเฉลยแบบย่อ");
  const lead={
    canva:"สร้างใบงานนักเรียนประถมแบบพร้อมออกแบบใน Canva AI / Magic Design ตามรายละเอียดต่อไปนี้",
    chatgpt:"คุณเป็นผู้เชี่ยวชาญด้านการออกแบบใบงานระดับประถม จงสร้างใบงานฉบับพร้อมใช้ตามรายละเอียดต่อไปนี้",
    gemini:"ทำหน้าที่เป็น Instructional Designer ระดับประถม สร้างใบงานพร้อมโครงจัดหน้าและเนื้อหาตามรายละเอียดต่อไปนี้"
  }[platform];
  return `${lead}

[ข้อมูลการเรียนรู้]
ระดับชั้น: ${val("grade")}
วิชา: ${val("subject")}
เรื่อง: ${val("topic")||"ให้ตั้งชื่อเรื่องจากตัวชี้วัด"}
ตัวชี้วัด/ผลลัพธ์การเรียนรู้: ${val("indicator")}
เวลาในการทำ: ${val("duration")}
ระดับความยาก: ${val("difficulty")}

[เป้าหมาย]
สร้างใบงานที่ “วัดตัวชี้วัดจริง” ไม่ใช่เพียงมีเนื้อหาเกี่ยวข้อง
ถอดตัวชี้วัดเป็นพฤติกรรมที่นักเรียนต้องแสดง แล้วให้ทุกกิจกรรมวัดพฤติกรรมนั้นโดยตรง

[โครงกิจกรรม]
จำนวนกิจกรรม: ${val("activityCount")}
จำนวนข้อรวม: ประมาณ ${val("questionCount")} ข้อ
รูปแบบกิจกรรม: ${acts.length?acts.join(" + "):"เลือกกิจกรรมที่เหมาะสมที่สุดจากตัวชี้วัด"}
เรียงโจทย์จากง่าย → เข้าใจ → ประยุกต์
แต่ละกิจกรรมต้องมีคำสั่งสั้น ไม่กำกวม และทำได้จริงภายใน ${val("duration")}

[ข้อกำหนดด้านเนื้อหา]
- ใช้ภาษาเหมาะกับนักเรียน ${val("grade")}
- โจทย์ทุกข้อสัมพันธ์กับเรื่อง “${val("topic")}”
- ทุกข้อมีคำตอบหรือเกณฑ์ตรวจที่ชัดเจน
- ถ้าเป็นข้อเลือกตอบ ให้ตัวลวงสมเหตุสมผล
- ถ้าเป็นข้อเขียน ให้เว้นพื้นที่ตามความยาวคำตอบที่คาดหวัง
- ถ้าใช้ภาพ ให้ภาพช่วยการเรียนรู้หรือช่วยตอบโจทย์ ไม่ใช่ตกแต่งอย่างเดียว
- หลีกเลี่ยงข้อความยาวเกินวัย
- ตรวจคำสะกดและความถูกต้องของโจทย์ก่อนส่งผลลัพธ์

[ดีไซน์]
ขนาด: ${val("orientation")}
สไตล์: ${styleVal()}
โทนสี: ${val("color")}
ความหนาแน่น: ${val("density")}
ออกแบบให้เหมาะกับเด็กประถม ตัวอักษรใหญ่ อ่านง่าย สีสดใสแต่ไม่รก
ใช้กรอบโค้งมน ไอคอน/ภาพการ์ตูนที่เป็นมิตร และมี white space เพียงพอ
${extras.map(x=>"- "+x).join("\n")}

[การจัดหน้า A4]
ส่วนหัวประมาณ 15%: ชื่อใบงาน + วิชา + ชั้น + ข้อมูลนักเรียน
ส่วนกิจกรรมประมาณ 75%: แบ่งเป็นบล็อกกิจกรรมชัดเจน
ส่วนท้ายประมาณ 10%: คะแนน / ข้อความให้กำลังใจ
${$("#onePage").checked?"สำคัญมาก: หากพื้นที่ไม่พอ ให้ลดคำ ลดองค์ประกอบตกแต่ง หรือปรับจำนวนบรรทัด แต่ห้ามลดตัวอักษรจนเล็กและห้ามขึ้นหน้าที่ 2":""}

[ผลลัพธ์ที่ต้องการ]
1. ชื่อใบงาน
2. จุดประสงค์การเรียนรู้ 1–2 ข้อจากตัวชี้วัด
3. คำชี้แจง
4. โจทย์ครบตามจำนวน
5. ระบุภาพ/ไอคอนที่ควรใช้
6. คำแนะนำการจัดวางแต่ละส่วนบน A4
${$("#answerKey").checked?"7. แนวเฉลยแบบย่อ":""}

สร้างผลลัพธ์ให้ดูเป็นใบงานเด็กประถมคุณภาพสูง พร้อมนำไปใช้ในชั้นเรียนจริง`;
}
function qualityCheck(prompt){
  const checks=[
    ["มีระดับชั้น",prompt.includes("ระดับชั้น:")],
    ["มีตัวชี้วัด/ผลลัพธ์",prompt.includes("ตัวชี้วัด/ผลลัพธ์การเรียนรู้:") && val("indicator").trim().length>5],
    ["กำหนด A4",prompt.includes("A4")],
    ["กำหนดกิจกรรม",selectedActs().length>0],
    ["มีข้อกำหนดหน้าเดียว",!$("#onePage").checked || prompt.includes("ห้ามล้น")],
    ["มีข้อกำหนดภาษาเหมาะกับวัย",prompt.includes("ภาษาเหมาะกับนักเรียน")],
    ["มีคำสั่งให้ตรวจความถูกต้อง",prompt.includes("ตรวจคำสะกด")],
    ["ความหนาแน่น A4 อยู่ในเกณฑ์",updateCapacity()<3]
  ];
  const score=Math.round(checks.filter(x=>x[1]).length/checks.length*100);
  $("#qualityScore").textContent=score;
  $("#qualityText").textContent=score>=90?"พร้อมนำไปทดลองเจน":score>=75?"ใช้ได้ แต่ควรตรวจเพิ่ม":"ควรเติมข้อมูล";
  $("#qualityList").innerHTML=checks.map(x=>`<li>${x[1]?"✅":"⚠️"} ${x[0]}</li>`).join("");
}
function generate(){
  const p=makePrompt();
  $("#output").value=p;
  $("#teacherKeyWrap").style.display=$("#teacherKey").checked?"block":"none";
  $("#keyOutput").value=$("#teacherKey").checked?teacherKeyPrompt():"";
  updateCapacity();
  qualityCheck(p);
  renderPaper();
  toast("สร้าง Prompt แล้ว");
}
function renderPaper(){
  const acts=selectedActs().length?selectedActs():["กิจกรรมฝึกทักษะ"];
  const n=Math.max(1,+val("activityCount"));
  const shown=acts.slice(0,n);
  const per=Math.max(2,Math.floor(+val("questionCount")/shown.length));
  $("#paper").innerHTML=`<div class="paperhead"><h3>${esc(val("topic")||"ชื่อใบงาน")}</h3><div>${esc(val("subject"))} • ${esc(val("grade"))}</div><div class="meta"><div>ชื่อ<div class="line"></div></div><div>ชั้น<div class="line"></div></div><div>เลขที่<div class="line"></div></div></div></div>
  <div class="box"><h4>🎯 จุดประสงค์</h4><div>${esc(val("indicator")||"ตัวชี้วัด/ผลลัพธ์การเรียนรู้")}</div></div>
  ${shown.map((a,i)=>`<div class="box"><h4>กิจกรรมที่ ${i+1}: ${esc(a)}</h4><small>คำชี้แจงสั้น กระชับ เหมาะกับ ${esc(val("grade"))}</small>${Array.from({length:Math.min(per,4)},(_,k)=>`<div class="q"><b>${k+1}.</b><span>โจทย์ตามเรื่อง ${esc(val("topic")||"เนื้อหา")}</span></div>`).join("")}<div class="answer"></div></div>`).join("")}`;
}
async function copyOut(){if(!$("#output").value)generate();try{await navigator.clipboard.writeText($("#output").value);toast("คัดลอก Prompt แล้ว")}catch{$("#output").select();document.execCommand("copy");toast("คัดลอกแล้ว")}}
function download(){if(!$("#output").value)generate();const b=new Blob([$("#output").value],{type:"text/plain;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="SAILOM-Worksheet-Prompt-Demo.txt";a.click();URL.revokeObjectURL(a.href)}
function alternate(){
  $("#smart").checked=false;
  const all=$$("#activities input");all.forEach(x=>x.checked=false);
  [...all].sort(()=>Math.random()-.5).slice(0,2).forEach(x=>x.checked=true);
  generate();
}
function toast(t){$("#toast").textContent=t;$("#toast").classList.add("show");setTimeout(()=>$("#toast").classList.remove("show"),1500)}
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

$("#demoBtn").onclick=demo;$("#clearBtn").onclick=clearForm;$("#generateBtn").onclick=generate;$("#altBtn").onclick=alternate;$("#copyBtn").onclick=copyOut;$("#downloadBtn").onclick=download;
$("#indicator").addEventListener("input",analyze);$("#smart").onchange=analyze;$("#topic").addEventListener("input",renderPaper);$("#questionCount").onchange=renderPaper;$("#activityCount").onchange=renderPaper;
$$("#activities input,input[name=style]").forEach(x=>x.onchange=renderPaper);
$$(".platform").forEach(b=>b.onclick=()=>{$$(".platform").forEach(x=>x.classList.remove("active"));b.classList.add("active");platform=b.dataset.platform;generate();});
demo();

function projectSnapshot(){return {id:Date.now(),name:`${$("#grade").value} ${$("#subject").value} — ${$("#topic").value||"ไม่มีชื่อ"}`,savedAt:new Date().toLocaleString("th-TH"),fields:{grade:$("#grade").value,subject:$("#subject").value,topic:$("#topic").value,indicator:$("#indicator").value,duration:$("#duration").value,difficulty:$("#difficulty").value,activityCount:$("#activityCount").value,questionCount:$("#questionCount").value,orientation:$("#orientation").value,color:$("#color").value,density:$("#density").value},smart:$("#smart").checked,activities:selectedActs(),style:$('input[name="style"]:checked')?.value||"Cute Kids",teacherKey:$("#teacherKey").checked,output:$("#output").value,keyOutput:$("#keyOutput").value}}
function saveProject(){const list=JSON.parse(localStorage.getItem("sailomSavedProjects")||"[]");list.unshift(projectSnapshot());localStorage.setItem("sailomSavedProjects",JSON.stringify(list.slice(0,20)));updateSavedCount();showToast("บันทึกงานแล้ว")}
function updateSavedCount(){const e=$("#savedCount");if(e)e.textContent=JSON.parse(localStorage.getItem("sailomSavedProjects")||"[]").length}
function openSaved(){const list=JSON.parse(localStorage.getItem("sailomSavedProjects")||"[]");$("#savedList").innerHTML=list.length?list.map((x,i)=>`<div class="saved-item"><b>${escapeHtml(x.name)}</b><small>${escapeHtml(x.savedAt)}</small><div class="saved-actions"><button data-load="${i}">เปิด</button><button data-copy="${i}">คัดลอก</button><button data-del="${i}">ลบ</button></div></div>`).join(""):`<p style="color:#718396">ยังไม่มีงานที่บันทึก</p>`;$("#savedPanel").classList.add("show");$("#savedBack").classList.add("show");$$("#savedList [data-load]").forEach(b=>b.onclick=()=>loadSaved(list[+b.dataset.load]));$$("#savedList [data-copy]").forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(list[+b.dataset.copy].output||"");showToast("คัดลอก Prompt แล้ว")});$$("#savedList [data-del]").forEach(b=>b.onclick=()=>{list.splice(+b.dataset.del,1);localStorage.setItem("sailomSavedProjects",JSON.stringify(list));updateSavedCount();openSaved()})}
function closeSaved(){$("#savedPanel").classList.remove("show");$("#savedBack").classList.remove("show")}
function loadSaved(x){Object.entries(x.fields||{}).forEach(([id,val])=>{const e=$("#"+id);if(e)e.value=val});$("#smart").checked=x.smart;$$("#activities input").forEach(cb=>cb.checked=(x.activities||[]).includes(cb.value));const r=$(`input[name="style"][value="${x.style}"]`);if(r)r.checked=true;$("#teacherKey").checked=x.teacherKey!==false;$("#output").value=x.output||"";$("#keyOutput").value=x.keyOutput||"";analyze();renderPaper();if(x.output)qualityCheck(x.output);closeSaved();showToast("เปิดงานแล้ว")}
function exportProject(){const blob=new Blob([JSON.stringify(projectSnapshot(),null,2)],{type:"application/json;charset=utf-8"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="SAILOM-Worksheet-Project.json";a.click();URL.revokeObjectURL(url)}
$("#saveBtn").onclick=saveProject;$("#savedBtn").onclick=openSaved;$("#closeSaved").onclick=closeSaved;$("#savedBack").onclick=closeSaved;$("#copyKeyBtn").onclick=async()=>{if(!$("#keyOutput").value)generate();await navigator.clipboard.writeText($("#keyOutput").value);showToast("คัดลอก Prompt เฉลยแล้ว")};$("#exportBtn").onclick=exportProject;$("#teacherKey").onchange=generate;["questionCount","activityCount","duration","grade"].forEach(id=>$("#"+id).addEventListener("change",updateCapacity));updateSavedCount();updateCapacity();
