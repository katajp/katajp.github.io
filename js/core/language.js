// UI translations (English / Thai) and language toggle.

const LANG={
  en:{chart:'📖 Chart',quiz:'🎯 Quiz',progress:'📊 Progress',vocab:'📚 Vocab',
    newQuiz:'New Quiz',savedSessions:'Saved Sessions',start:'🚀 Start Quiz',selectAll:'Select all',clear:'Clear',
    resume:'▶ Resume',redo:'🔄 Redo',correct:'Correct! 🎉',wrong:'Wrong!',complete:'Complete!',
    overview:'Overview',accuracy:'Overall accuracy',charsPracticed:'Characters practiced',
    totalQ:'Total questions answered',accuracyByRow:'Accuracy by Row',confused:'Characters you confuse',
    resetAll:'🗑 Reset all progress',tryAgain:'Try again',
    wellDone:'Well done!',noData:'No data yet. Take a quiz first.',
    charsSelected:'characters selected',selectAtLeast:'Select at least one row to begin.',
    loading:'Loading...',stroke:'Stroke',allComplete:'All Stages Complete!',stageComplete:'complete!',
    completed:'Completed',inProgress:'In progress',locked:'Locked',replaying:'Replaying',
    returnTo:'↩ Return to current stage',exit:'✕ Exit',score:'Score',streak:'Streak',
    question:'Question',stage:'Stage',traceChar:'trace the character',writeQ:'Write the character shown',
    failedWrite:'See the correct strokes',basic:'Basic',dakuten:'Dakuten / Handakuten',combo:'Combinations (Yōon)',
    reviewMistakes:'🔁 Review Mistakes',charsToReview:"character(s) you've gotten wrong before."},
  th:{chart:'📖 ตาราง',quiz:'🎯 แบบทดสอบ',progress:'📊 ความก้าวหน้า',vocab:'📚 คำศัพท์',
    newQuiz:'แบบทดสอบใหม่',savedSessions:'เซสชันที่บันทึก',start:'🚀 เริ่มทำ',selectAll:'เลือกทั้งหมด',clear:'ล้าง',
    resume:'▶ ทำต่อ',redo:'🔄 ทำใหม่',correct:'ถูกต้อง! 🎉',wrong:'ผิด!',complete:'สำเร็จ!',
    overview:'ภาพรวม',accuracy:'ความแม่นยำโดยรวม',charsPracticed:'ตัวอักษรที่ฝึก',
    totalQ:'คำถามทั้งหมดที่ตอบ',accuracyByRow:'ความแม่นยำแต่ละแถว',confused:'ตัวอักษรที่สับสน',
    resetAll:'🗑 รีเซ็ตทั้งหมด',tryAgain:'ลองอีกครั้ง',
    wellDone:'เก่งมาก!',noData:'ยังไม่มีข้อมูล ทำแบบทดสอบก่อน',
    charsSelected:'ตัวอักษรที่เลือก',selectAtLeast:'เลือกอย่างน้อย 1 แถวเพื่อเริ่ม',
    loading:'กำลังโหลด...',stroke:'ขีดที่',allComplete:'ทำครบทุกด่านแล้ว!',stageComplete:'เสร็จแล้ว!',
    completed:'เสร็จแล้ว',inProgress:'กำลังทำ',locked:'ล็อค',replaying:'กำลังเล่นซ้ำ',
    returnTo:'↩ กลับไปด่านปัจจุบัน',exit:'✕ ออก',score:'คะแนน',streak:'ต่อเนื่อง',
    question:'คำถาม',stage:'ด่าน',traceChar:'ลากตามตัวอักษร',writeQ:'เขียนตัวอักษรที่แสดง',
    failedWrite:'ดูขีดที่ถูกต้อง',basic:'พื้นฐาน',dakuten:'ทากุเท็น / ฮันดากุเท็น',combo:'ตัวผสม (โยอง)',
    reviewMistakes:'🔁 ทบทวนข้อผิด',charsToReview:'ตัวอักษรที่เคยตอบผิด'}
};
let lang=localStorage.getItem('kp-lang')||'en';
function t(key){return LANG[lang]?.[key]||LANG.en[key]||key;}
const langBtn=document.getElementById('langToggle');
function updLang(){langBtn.textContent=lang==='en'?'🇺🇸 EN':'🇹🇭 TH';}
updLang();
langBtn.onclick=()=>{lang=lang==='en'?'th':'en';localStorage.setItem('kp-lang',lang);updLang();
  // Update nav tabs
  document.querySelectorAll('.nav-btn').forEach(b=>{
    const tab=b.dataset.tab;
    if(LANG[lang][tab])b.textContent=LANG[lang][tab];
  });
  renderChart();
  // Only re-render setup if setup is active (not active quiz panel)
  if(document.getElementById('panel-quiz').classList.contains('active') && document.getElementById('quizSetup').style.display !== 'none')renderQuizSetup();
  if(document.getElementById('panel-vocab').classList.contains('active') && document.getElementById('vocabSetup').style.display !== 'none')renderVocabSetup();
};
// Init nav labels
function initNavLabels(){document.querySelectorAll('.nav-btn').forEach(b=>{const tab=b.dataset.tab;if(LANG[lang][tab])b.textContent=LANG[lang][tab];});}


