const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let currentMode="quick", platform="canva";

const activities=[
 ["จับคู่","🔗","คำ–ภาพ / เหตุ–ผล"],["เติมคำ","✍️","คำสำคัญ"],["เลือกตอบ","✅","ตรวจความเข้าใจ"],
 ["จัดหมวดหมู่","🧩","จำแนก / แยกกลุ่ม"],["วิเคราะห์ภาพ","🖼️","สังเกต / เชื่อมโยง"],
 ["ตอบคำถามสั้น","💬","อธิบายเหตุผล"],["เรียงลำดับ","🔢","ขั้นตอน / เหตุการณ์"],
 ["สถานการณ์","💡","ประยุกต์ใช้"],["วาด/ระบายสี","🎨","เหมาะเด็กเล็ก"],["ตาราง/แผนภาพ","📊","สรุปความคิด"]
];

const behaviorRules=[
 {keys:["อ่าน","ใจความ","ตอบคำถาม"],acts:["เลือกตอบ","ตอบคำถามสั้น"],reason:"เน้นอ่านเพื่อทำความเข้าใจและตอบจากข้อมูล"},
 {keys:["จำแนก","แยก","จัดกลุ่ม","ระบุ"],acts:["จัดหมวดหมู่","จับคู่","เลือกตอบ"],reason:"เน้นการจำแนกหรือระบุ"},
 {keys:["อธิบาย","บรรยาย","เหตุผล"],acts:["ตอบคำถามสั้น","วิเคราะห์ภาพ"],reason:"เน้นการอธิบายความเข้าใจ"},
 {keys:["วิเคราะห์","เปรียบเทียบ","คาดคะเน","ความคิดเห็น"],acts:["สถานการณ์","วิเคราะห์ภาพ","ตอบคำถามสั้น"],reason:"เน้นคิดขั้นสูงและใช้เหตุผล"},
 {keys:["คำนวณ","บวก","ลบ","คูณ","หาร","เศษส่วน"],acts:["เติมคำ","เลือกตอบ"],reason:"เน้นทักษะคำนวณที่ตรวจคำตอบได้"},
 {keys:["ลำดับ","เรียง","ขั้นตอน"],acts:["เรียงลำดับ","จับคู่"],reason:"เน้นลำดับหรือขั้นตอน"},
 {keys:["สร้าง","วาด","ออกแบบ"],acts:["วาด/ระบายสี","ตาราง/แผนภาพ"],reason:"เน้นการสร้างผลงาน"},
 {keys:["สรุป","แผนภาพ","ตาราง"],acts:["ตาราง/แผนภาพ","ตอบคำถามสั้น"],reason:"เน้นการจัดระบบความคิด"}
];

const gradeProfile={
 "ป.1":{maxQ:6,acts:1,img:"มาก",text:"สั้นมาก",note:"ภาพใหญ่ คำสั่งสั้นมาก พื้นที่เขียนมาก"},
 "ป.2":{maxQ:7,acts:1,img:"มาก",text:"สั้น",note:"ใช้ภาพช่วยมาก คำถามไม่ซับซ้อน"},
 "ป.3":{maxQ:8,acts:2,img:"กลางถึงมาก",text:"สั้น",note:"ผสมภาพกับข้อความสั้น"},
 "ป.4":{maxQ:9,acts:2,img:"กลาง",text:"ปานกลาง",note:"เริ่มเพิ่มการอธิบายและเชื่อมโยง"},
 "ป.5":{maxQ:10,acts:2,img:"กลาง",text:"ปานกลาง",note:"เพิ่มข้อคิด วิเคราะห์ และประยุกต์"},
 "ป.6":{maxQ:10,acts:2,img:"พอเหมาะ",text:"ปานกลาง",note:"รองรับการคิดวิเคราะห์สั้น ๆ"}
};

function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function v(id){return $("#"+id)?.value||""}
function styleVal(){return $('input[name=style]:checked')?.value||"Cute Kids"}
function historyVal(){return $('input[name=historyType]:checked')?.value||"Timeline"}
function selectedActs(){return $$("#activityGrid input:checked").map(x=>x.value)}
function toast(t){$("#toast").textContent=t;$("#toast").classList.add("show");setTimeout(()=>$("#toast").classList.remove("show"),1500)}

function initActivities(){
 $("#activityGrid").innerHTML=activities.map(([a,i,s])=>`<label><input type="checkbox" value="${a}"><span>${i}</span><b>${a}</b><small>${s}</small></label>`).join("");
 $$("#activityGrid input").forEach(x=>x.addEventListener("change",()=>{diagnose();renderPaper()}));
}
function recommend(){
 const text=(v("indicator")+" "+v("topic")).toLowerCase();
 let acts=[],reasons=[];
 behaviorRules.forEach(r=>{
   if(r.keys.some(k=>text.includes(k))){
     r.acts.forEach(a=>{if(!acts.includes(a))acts.push(a)});
     if(!reasons.includes(r.reason))reasons.push(r.reason);
   }
 });
 if(v("subject")==="ประวัติศาสตร์"){
   if(text.includes("เหตุการณ์")||text.includes("พัฒนา")){if(!acts.includes("เรียงลำดับ"))acts.unshift("เรียงลำดับ")}
   if(text.includes("ปัจจัย")||text.includes("สาเหตุ")||text.includes("ผล")){if(!acts.includes("สถานการณ์"))acts.push("สถานการณ์")}
   if(!reasons.length)reasons.push("วิชาประวัติศาสตร์ควรมีลำดับเวลา หลักฐาน หรือความสัมพันธ์เหตุ–ผล");
 }
 if(!acts.length){acts=["จับคู่","เลือกตอบ","ตอบคำถามสั้น"];reasons=["ใช้กิจกรรมกลางที่เหมาะกับใบงานประถม"];}
 if(["ป.1","ป.2"].includes(v("grade")) && !acts.includes("วาด/ระบายสี"))acts.push("วาด/ระบายสี");
 return {acts:[...new Set(acts)].slice(0,3),reason:reasons[0]};
}
function autoPlan(){
 const p=gradeProfile[v("grade")],r=recommend();
 $("#activityCount").value=String(Math.min(p.acts,r.acts.length||p.acts));
 $("#questionCount").value=String(Math.min(p.maxQ, v("duration").startsWith("15")?5:8));
 $$("#activityGrid input").forEach(cb=>cb.checked=r.acts.includes(cb.value));
 if(v("subject")==="ประวัติศาสตร์"){
   $('input[name=style][value="Thai Heritage"]').checked=true;
   $("#color").value="น้ำตาล–ทอง–ครีม";
 }
 $("#quickPlan").innerHTML=`แนะนำ <b>${r.acts.join(" + ")}</b> • ประมาณ <b>${$("#questionCount").value} ข้อ</b> • ${p.note}<br><small>เหตุผล: ${r.reason}</small>`;
 diagnose();renderPaper();
}
function setMode(mode){
 currentMode=mode;
 $$(".mode-card").forEach(x=>x.classList.toggle("active",x.dataset.mode===mode));
 $$(".mode-panel").forEach(x=>x.classList.toggle("hidden",x.dataset.panel!==mode));
 if(mode==="history")$("#subject").value="ประวัติศาสตร์";
 if(mode==="quick")autoPlan();
 diagnose();renderPaper();
 document.querySelector(`[data-panel="${mode}"]`)?.scrollIntoView({behavior:"smooth",block:"center"});
}
function effectiveActs(){
 if(currentMode==="history") return [historyVal(), "ตอบคำถามสั้น"];
 const sel=selectedActs();
 return sel.length?sel:recommend().acts;
}
function qCount(){
 if(currentMode==="quick")return Number($("#questionCount").value||8);
 return Number($("#questionCount").value||8);
}
function diagnose(){
 const p=gradeProfile[v("grade")],acts=effectiveActs(),q=qCount(),mins=parseInt(v("duration"))||20;
 const checks=[
  ["ตัวชี้วัด",v("indicator").trim().length>=8,"มีสิ่งที่ต้องการวัดชัดเจน"],
  ["เหมาะกับวัย",q<=p.maxQ+1,`${v("grade")} แนะนำไม่เกินประมาณ ${p.maxQ} ข้อ`],
  ["กิจกรรม",acts.length>0,"มีกิจกรรมที่เชื่อมกับพฤติกรรม"],
  ["เวลา",!(mins<=15&&q>6),`${q} ข้อ ภายใน ${mins} นาที`],
  ["A4",!(q>10||acts.length>3),"จำนวนข้อและกิจกรรมไม่แน่นเกินไป"]
 ];
 const score=Math.round(checks.filter(x=>x[1]).length/checks.length*100);
 $("#doctorScore").textContent=score;$("#doctorMeter").style.width=score+"%";
 $("#doctorHeadline").textContent=score>=90?"พร้อมสร้างใบงาน":score>=70?"เกือบพร้อม":"ควรปรับก่อน";
 $("#doctorSummary").textContent=score>=90?"โครงเหมาะกับการนำไปสร้าง Prompt":score>=70?"มีบางจุดที่ระบบแนะนำให้ปรับ":"ข้อมูลหรือความหนาแน่นยังไม่เหมาะ";
 $("#doctorChecks").innerHTML=checks.map(c=>`<div class="doctor-item ${c[1]?"ok":"warn"}"><b>${c[1]?"✅":"⚠️"} ${c[0]}</b><small>${c[2]}</small></div>`).join("");
 let advice=[];
 if(q>p.maxQ)advice.push(`ลดจำนวนข้อเหลือประมาณ ${p.maxQ} ข้อเพื่อให้เหมาะกับ ${v("grade")}`);
 if(mins<=15&&q>6)advice.push("เวลา 15 นาทีควรลดจำนวนข้อ");
 if(!v("indicator").trim())advice.push("ควรใส่ตัวชี้วัด/ผลลัพธ์ก่อนสร้าง");
 if(!advice.length)advice.push("โครงนี้เหมาะสำหรับทดลองสร้างใบงาน A4 หน้าเดียว");
 $("#doctorAdvice").innerHTML="<b>คำแนะนำ:</b> "+advice.join(" • ");
 return score;
}
function common(){
 return {
  mode:currentMode,grade:v("grade"),subject:v("subject"),purpose:v("purpose"),topic:v("topic"),
  indicator:v("indicator"),duration:v("duration"),difficulty:v("difficulty"),classSize:v("classSize"),
  acts:effectiveActs(),questions:qCount(),style:styleVal(),color:v("color"),orientation:v("orientation"),density:v("density"),
  history:historyVal(),profile:gradeProfile[v("grade")]
 };
}
function advancedLines(){
 const lines=[];
 if($("#variantABC").checked)lines.push("- สร้างใบงาน 3 ชุด A/B/C เนื้อหาคนละชุด แต่ตัวชี้วัดและระดับความยากใกล้เคียงกัน");
 if($("#useRubric").checked)lines.push("- เพิ่ม Rubric แบบสั้นสำหรับข้อเขียน/ชิ้นงาน");
 if($("#useQR").checked)lines.push(`- เว้นกรอบ QR Code มุมล่างขวา${v("qrUrl")?` สำหรับลิงก์ ${v("qrUrl")}`:""}`);
 if($("#localContext").checked)lines.push(`- เชื่อมโจทย์กับบริบทท้องถิ่น: ${v("localText")||"บริบทใกล้ตัวนักเรียน"}`);
 return lines.join("\n");
}
function mainPrompt(){
 const d=common();
 const targetLead={
  canva:"สร้างงานออกแบบใบงานนักเรียนประถมใน Canva AI / Magic Design ให้พร้อมพิมพ์และใช้งานจริง",
  chatgpt:"คุณเป็นผู้เชี่ยวชาญด้านหลักสูตรและการออกแบบใบงานประถม สร้างใบงานพร้อมใช้ตามข้อกำหนดต่อไปนี้",
  gemini:"ทำหน้าที่เป็น Instructional Designer ระดับประถม สร้างใบงานที่วัดผลลัพธ์การเรียนรู้และพร้อมจัดหน้า A4"
 }[platform];
 const modeNote={
  quick:"ระบบได้เลือกกิจกรรมให้อัตโนมัติจากตัวชี้วัดและวัยของผู้เรียน",
  custom:"ครูเป็นผู้เลือกกิจกรรมและจำนวนข้อด้วยตนเอง",
  history:`ใช้โหมดประวัติศาสตร์เฉพาะทาง: ${d.history} โดยเน้นการคิดเชิงเวลา หลักฐาน ความต่อเนื่อง การเปลี่ยนแปลง หรือเหตุ–ผลตามความเหมาะสม`,
  advanced:"ใช้ข้อกำหนดขั้นสูงตามตัวเลือกด้านล่าง"
 }[currentMode];
 return `${targetLead}

=== ข้อมูลการเรียนรู้ ===
ระดับชั้น: ${d.grade}
วิชา: ${d.subject}
เรื่อง: ${d.topic}
ตัวชี้วัด/ผลลัพธ์: ${d.indicator}
ใช้เพื่อ: ${d.purpose}
เวลา: ${d.duration}
ความยาก: ${d.difficulty}
ขนาดชั้นเรียน: ${d.classSize}
โหมด: ${modeNote}

=== Smart Worksheet Design ===
กิจกรรมหลัก: ${d.acts.join(" + ")}
จำนวนข้อรวมโดยประมาณ: ${d.questions} ข้อ
หลักการสำคัญ: ใบงานต้องวัด “พฤติกรรมตามตัวชี้วัด” ไม่ใช่เพียงมีเนื้อหาเกี่ยวข้อง
ก่อนเขียนโจทย์ ให้ถอดตัวชี้วัดเป็น “นักเรียนต้องทำอะไรได้” แล้วออกแบบภารกิจให้เห็นพฤติกรรมนั้นจริง
${d.profile.note}

=== การเขียนโจทย์ ===
1. ใช้ภาษาเหมาะกับ ${d.grade} ประโยคสั้น ชัด ไม่กำกวม
2. ทุกข้อสัมพันธ์กับเรื่อง “${d.topic}” และตัวชี้วัด
3. เรียงจากง่าย → เข้าใจ → ประยุกต์ ตามความเหมาะสม
4. ถ้าเป็นข้อเลือกตอบ ตัวลวงต้องสมเหตุสมผลและไม่เดาได้จากความยาว
5. ถ้าเป็นข้อเขียน ให้เว้นพื้นที่พอต่อคำตอบที่คาดหวัง
6. ถ้าใช้ภาพ ให้ภาพช่วยเรียนรู้หรือช่วยตอบโจทย์ ไม่ใช่ตกแต่งอย่างเดียว
7. ตรวจคำสะกด ความถูกต้องของเนื้อหา และความสมเหตุสมผลของเฉลย

=== การออกแบบ ===
กระดาษ: ${d.orientation}
สไตล์: ${d.style}
โทนสี: ${d.color}
ความหนาแน่น: ${d.density}
ภาพประกอบสำหรับวัยนี้: ${d.profile.img}
ข้อความ: ${d.profile.text}
ใช้ตัวอักษรไทยขนาดใหญ่ อ่านง่าย contrast ชัด
ใช้กรอบโค้งมน ไอคอนเป็นมิตร และ white space พอเหมาะ
${$("#nameField").checked?"- มีช่องชื่อ–นามสกุล ชั้น เลขที่":""}
${$("#scoreField").checked?"- มีช่องคะแนนรวม":""}
${$("#instructions").checked?"- มีคำชี้แจงสั้นก่อนแต่ละกิจกรรม":""}
${$("#inkSave").checked?"- ประหยัดหมึก ลดพื้นสีทึบ":""}
${advancedLines()}

=== ข้อกำหนด A4 ===
- ส่วนหัวประมาณ 12–15%
- พื้นที่กิจกรรมประมาณ 75–80%
- ส่วนท้ายประมาณ 5–8%
${$("#onePage").checked?"- ต้องจบใน A4 หน้าเดียว ห้ามขึ้นหน้าที่ 2 หากพื้นที่ไม่พอให้ลดคำ/การตกแต่งก่อน ห้ามลดฟอนต์จนอ่านยาก":""}
- อย่าวางภาพพื้นหลังใต้ข้อความ
- ต้องมีพื้นที่เขียนคำตอบจริง

=== ผลลัพธ์ที่ต้องสร้าง ===
1. ชื่อใบงาน
2. จุดประสงค์การเรียนรู้ 1–2 ข้อ
3. คำชี้แจง
4. โจทย์ครบตามจำนวน
5. รายละเอียดภาพ/ไอคอนที่ควรใช้
6. Blueprint การจัดวางบน A4
${$("#useRubric").checked?"7. Rubric แบบย่อ":""}

ตรวจอีกครั้งว่าเด็กทำเสร็จได้ใน ${d.duration} และหน้าไม่แน่นเกินไป
ต้องการผลลัพธ์เป็น “ใบงานพร้อมใช้จริง” ไม่ใช่โปสเตอร์หรืออินโฟกราฟิก`;
}
function keyPromptText(){
 const d=common();
 return `สร้าง “เฉลยสำหรับครู” ของใบงานนี้ โดยแยกจากหน้าใบงานนักเรียน

ชั้น: ${d.grade}
วิชา: ${d.subject}
เรื่อง: ${d.topic}
ตัวชี้วัด/ผลลัพธ์: ${d.indicator}
กิจกรรม: ${d.acts.join(" + ")}
จำนวนข้อ: ประมาณ ${d.questions}

ให้:
1. เฉลยทีละข้อ
2. ข้อเขียนให้แนวคำตอบที่ยอมรับได้
3. ถ้าตอบได้หลายแบบ ให้เกณฑ์ตรวจ/ให้คะแนน
4. ตรวจความสอดคล้องกับตัวชี้วัด
5. แจ้งข้อที่อาจกำกวมและเสนอวิธีแก้
ห้ามนำเฉลยไปใส่ในหน้าใบงานนักเรียน`;
}
function imagePromptText(){
 const d=common();
 return `สร้างภาพประกอบสำหรับใบงานนักเรียน ${d.grade} วิชา ${d.subject} เรื่อง “${d.topic}”
สไตล์ภาพ: ${d.style}
โทนสี: ${d.color}
ภาพต้องเป็นมิตรกับเด็ก ดูสะอาด ชัด และใช้พื้นที่ไม่มาก
หากเป็นภาพที่ใช้ตอบโจทย์ ให้รายละเอียดชัดพอสำหรับการสังเกต
หลีกเลี่ยงข้อความในภาพ เว้นแต่จำเป็น
พื้นหลังเรียบหรือโปร่ง เหมาะสำหรับนำไปวางในใบงาน A4
${d.subject==="ประวัติศาสตร์"?"หากเป็นบุคคล/สถานที่ทางประวัติศาสตร์ ให้เคารพบริบทไทยและหลีกเลี่ยงรายละเอียดที่อาจทำให้เข้าใจผิด":""}`;
}
function generate(){
 if(currentMode==="quick")autoPlan();
 diagnose();
 $("#mainPrompt").value=mainPrompt();
 $("#keyBlock").classList.toggle("hidden",!$("#teacherKey").checked);
 $("#imageBlock").classList.toggle("hidden",!$("#imagePrompt").checked);
 $("#keyPrompt").value=$("#teacherKey").checked?keyPromptText():"";
 $("#imagePromptOut").value=$("#imagePrompt").checked?imagePromptText():"";
 renderPaper();toast("สร้าง Prompt แล้ว");
}
function renderPaper(){
 const d=common(),acts=d.acts.slice(0,currentMode==="quick"?2:Math.min(3,Number($("#activityCount").value||2)));
 $("#paper").innerHTML=`<div class="paperhead"><h3>${esc(d.topic||"ชื่อใบงาน")}</h3><div>${esc(d.subject)} • ${esc(d.grade)} • ${esc(d.purpose)}</div><div class="meta"><div>ชื่อ<div class="line"></div></div><div>ชั้น<div class="line"></div></div><div>เลขที่<div class="line"></div></div></div></div>
 <div class="box"><h4>🎯 จุดประสงค์</h4><div>${esc(d.indicator||"ตัวชี้วัด/ผลลัพธ์การเรียนรู้")}</div></div>
 ${acts.map((a,i)=>`<div class="box"><h4>กิจกรรมที่ ${i+1}: ${esc(a)}</h4><small>คำชี้แจงสั้น กระชับ เหมาะกับ ${esc(d.grade)}</small>${Array.from({length:Math.min(4,Math.max(2,Math.ceil(d.questions/acts.length)))},(_,k)=>`<div class="q"><b>${k+1}.</b><span>โจทย์ที่วัดพฤติกรรมตามตัวชี้วัด เรื่อง ${esc(d.topic)}</span></div>`).join("")}<div class="answer"></div></div>`).join("")}`;
}
function snapshot(){
 return {id:Date.now(),savedAt:new Date().toLocaleString("th-TH"),mode:currentMode,platform,
  fields:["grade","subject","purpose","topic","indicator","duration","difficulty","classSize","activityCount","questionCount","progression","color","orientation","density","localText","qrUrl"].reduce((o,id)=>(o[id]=v(id),o),{}),
  acts:selectedActs(),style:styleVal(),history:historyVal(),
  flags:["variantABC","useRubric","useQR","localContext","imagePrompt","teacherKey","nameField","scoreField","instructions","onePage","inkSave"].reduce((o,id)=>(o[id]=$("#"+id)?.checked||false,o),{}),
  prompts:{main:$("#mainPrompt").value,key:$("#keyPrompt").value,image:$("#imagePromptOut").value}
 };
}
function save(){
 const list=JSON.parse(localStorage.getItem("sailomV3Projects")||"[]");list.unshift(snapshot());localStorage.setItem("sailomV3Projects",JSON.stringify(list.slice(0,25)));updateSaved();toast("บันทึกงานแล้ว");
}
function updateSaved(){$("#savedCount").textContent=JSON.parse(localStorage.getItem("sailomV3Projects")||"[]").length}
function openDrawer(){
 const list=JSON.parse(localStorage.getItem("sailomV3Projects")||"[]");
 $("#savedList").innerHTML=list.length?list.map((x,i)=>`<div class="saved-item"><b>${esc((x.fields?.grade||"")+" "+(x.fields?.subject||"")+" — "+(x.fields?.topic||"ไม่มีชื่อ"))}</b><small>${esc(x.savedAt)}</small><div class="saved-actions"><button data-open="${i}">เปิด</button><button data-copy="${i}">คัดลอก</button><button data-del="${i}">ลบ</button></div></div>`).join(""):`<p style="color:#708396">ยังไม่มีงานที่บันทึก</p>`;
 $("#drawer").classList.add("show");$("#drawerBack").classList.add("show");
 $$("#savedList [data-open]").forEach(b=>b.onclick=()=>load(list[+b.dataset.open]));
 $$("#savedList [data-copy]").forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(list[+b.dataset.copy].prompts?.main||"");toast("คัดลอก Prompt แล้ว")});
 $$("#savedList [data-del]").forEach(b=>b.onclick=()=>{list.splice(+b.dataset.del,1);localStorage.setItem("sailomV3Projects",JSON.stringify(list));updateSaved();openDrawer()});
}
function load(x){
 Object.entries(x.fields||{}).forEach(([id,val])=>{if($("#"+id))$("#"+id).value=val});
 Object.entries(x.flags||{}).forEach(([id,val])=>{if($("#"+id))$("#"+id).checked=val});
 $$("#activityGrid input").forEach(cb=>cb.checked=(x.acts||[]).includes(cb.value));
 if(x.style){const r=$(`input[name=style][value="${x.style}"]`);if(r)r.checked=true}
 if(x.history){const r=$(`input[name=historyType][value="${x.history}"]`);if(r)r.checked=true}
 if(x.prompts){$("#mainPrompt").value=x.prompts.main||"";$("#keyPrompt").value=x.prompts.key||"";$("#imagePromptOut").value=x.prompts.image||""}
 setMode(x.mode||"quick");closeDrawer();diagnose();renderPaper();toast("เปิดงานแล้ว");
}
function closeDrawer(){$("#drawer").classList.remove("show");$("#drawerBack").classList.remove("show")}
async function copy(id){const t=$("#"+id).value;if(!t)generate();try{await navigator.clipboard.writeText($("#"+id).value)}catch{}toast("คัดลอกแล้ว")}

initActivities();
$$(".mode-card").forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
$$("[data-go]").forEach(b=>b.onclick=()=>setMode(b.dataset.go));
$$(".platform").forEach(b=>b.onclick=()=>{$$(".platform").forEach(x=>x.classList.remove("active"));b.classList.add("active");platform=b.dataset.platform;generate()});
$("#autoPlanBtn").onclick=autoPlan;$("#generateBtn").onclick=generate;$("#saveBtn").onclick=save;$("#savedBtn").onclick=openDrawer;$("#closeDrawer").onclick=closeDrawer;$("#drawerBack").onclick=closeDrawer;
$("#copyMain").onclick=()=>copy("mainPrompt");$("#copyKey").onclick=()=>copy("keyPrompt");$("#copyImage").onclick=()=>copy("imagePromptOut");
["grade","subject","purpose","topic","indicator","duration","difficulty"].forEach(id=>$("#"+id).addEventListener("input",()=>{if(currentMode==="quick")autoPlan();else diagnose();renderPaper()}));
["questionCount","activityCount","orientation","density"].forEach(id=>$("#"+id)?.addEventListener("change",()=>{diagnose();renderPaper()}));
$$('input[name="historyType"],input[name="style"],.checks input,.advanced-grid input').forEach(x=>x.addEventListener("change",()=>{diagnose();renderPaper()}));
updateSaved();autoPlan();generate();
