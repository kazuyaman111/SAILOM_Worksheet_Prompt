const SHEET_NAME='Views';
function setupCounter(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  PropertiesService.getScriptProperties().setProperty('COUNTER_SPREADSHEET_ID',ss.getId());
  let sh=ss.getSheetByName(SHEET_NAME)||ss.insertSheet(SHEET_NAME);
  if(sh.getLastRow()===0){sh.appendRow(['ProjectID','ProjectName','Views','LastViewedAt']);sh.setFrozenRows(1);}
}
function doGet(e){
  try{
    const p=e.parameter||{},id=String(p.projectId||'default').trim(),name=String(p.projectName||id).trim();
    const ss=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('COUNTER_SPREADSHEET_ID'));
    const sh=ss.getSheetByName(SHEET_NAME);const lock=LockService.getScriptLock();lock.waitLock(10000);
    try{
      let row=0,last=sh.getLastRow();
      if(last>=2){const ids=sh.getRange(2,1,last-1,1).getDisplayValues();for(let i=0;i<ids.length;i++)if(ids[i][0]===id){row=i+2;break}}
      let views=1;
      if(!row){sh.appendRow([id,name,1,new Date()]);}
      else{views=(Number(sh.getRange(row,3).getValue())||0)+1;sh.getRange(row,2,1,3).setValues([[name,views,new Date()]])}
      return ContentService.createTextOutput(JSON.stringify({ok:true,views})).setMimeType(ContentService.MimeType.JSON);
    }finally{lock.releaseLock()}
  }catch(err){return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)})).setMimeType(ContentService.MimeType.JSON)}
}