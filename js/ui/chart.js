// Kana chart tab (read-only grid of Hiragana & Katakana).

function renderChart(){
  const area=document.getElementById("chartArea");
  area.innerHTML="";
  const sections=[[t("basic"),"basic"],[t("dakuten"),"dakuten"],[t("combo"),"combo"]];
  sections.forEach(([title,key])=>{
    const lbl=document.createElement("div");lbl.className="sec-label";lbl.textContent=title;area.appendChild(lbl);
    const dual=document.createElement("div");dual.className="chart-dual";
    // Hiragana column
    const colH=document.createElement("div");colH.className="chart-col hira-col";
    const thH=document.createElement("div");thH.className="chart-col-title";thH.textContent="ひ "+t('hiraName');colH.appendChild(thH);
    const cellsH=document.createElement("div");cellsH.className="chart-cells";
    HIRA[key].forEach(row=>{
      row.chars.forEach(([ch,rm])=>{
        const c=document.createElement("button");c.className="kcell";c.type="button";
        c.setAttribute("aria-label",`${ch}, ${rm}, ${t('hiraName')}. ${t('showDetails')}`);
        c.innerHTML=`<div class="ch">${ch}</div><div class="rm">${rm}</div>`;
        c.onclick=()=>showCharDetail(ch,rm,"hiragana");
        cellsH.appendChild(c);
      });
    });
    colH.appendChild(cellsH);
    // Katakana column
    const colK=document.createElement("div");colK.className="chart-col kata-col";
    const thK=document.createElement("div");thK.className="chart-col-title";thK.textContent="カ "+t('kataName');colK.appendChild(thK);
    const cellsK=document.createElement("div");cellsK.className="chart-cells";
    KATA[key].forEach(row=>{
      row.chars.forEach(([ch,rm])=>{
        const c=document.createElement("button");c.className="kcell";c.type="button";
        c.setAttribute("aria-label",`${ch}, ${rm}, ${t('kataName')}. ${t('showDetails')}`);
        c.innerHTML=`<div class="ch">${ch}</div><div class="rm">${rm}</div>`;
        c.onclick=()=>showCharDetail(ch,rm,"katakana");
        cellsK.appendChild(c);
      });
    });
    colK.appendChild(cellsK);
    dual.appendChild(colH);dual.appendChild(colK);
    area.appendChild(dual);
  });
}
