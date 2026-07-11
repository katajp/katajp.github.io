// Kana chart tab (read-only grid of Hiragana & Katakana).

function renderChart(){
  const area=document.getElementById("chartArea");
  area.innerHTML="";
  const sections=[["Basic","basic"],["Dakuten / Handakuten","dakuten"],["Combinations (Yōon)","combo"]];
  sections.forEach(([title,key])=>{
    const lbl=document.createElement("div");lbl.className="sec-label";lbl.textContent=title;area.appendChild(lbl);
    const dual=document.createElement("div");dual.className="chart-dual";
    // Hiragana column
    const colH=document.createElement("div");colH.className="chart-col hira-col";
    const thH=document.createElement("div");thH.className="chart-col-title";thH.textContent="ひ Hiragana";colH.appendChild(thH);
    const cellsH=document.createElement("div");cellsH.className="chart-cells";
    HIRA[key].forEach(row=>{
      row.chars.forEach(([ch,rm])=>{
        const c=document.createElement("div");c.className="kcell";
        c.innerHTML=`<div class="ch">${ch}</div><div class="rm">${rm}</div>`;
        c.onclick=()=>showCharDetail(ch,rm,"hiragana");
        cellsH.appendChild(c);
      });
    });
    colH.appendChild(cellsH);
    // Katakana column
    const colK=document.createElement("div");colK.className="chart-col kata-col";
    const thK=document.createElement("div");thK.className="chart-col-title";thK.textContent="カ Katakana";colK.appendChild(thK);
    const cellsK=document.createElement("div");cellsK.className="chart-cells";
    KATA[key].forEach(row=>{
      row.chars.forEach(([ch,rm])=>{
        const c=document.createElement("div");c.className="kcell";
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

