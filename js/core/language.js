// UI translations (English / Thai) and language toggle.

const LANG={
  en:{
    chart:'あ Chart',quiz:'練 Quiz',progress:'記 Progress',vocab:'語 Kanji',
    brandEyebrow:'Japanese practice workspace',workspace:'Workspace',localDataNote:'Your learning data stays on this device.',
    chartEyebrow:'01 / Reference',chartTitle:'Kana chart',chartDesc:'Choose a character to see its reading, hear its sound, and study the stroke order.',
    vocabEyebrow:'03 / Vocabulary',vocabTitle:'Learn in context',vocabDesc:'Study useful Japanese words through reading, meaning, recall, and listening.',
    progressEyebrow:'04 / Progress',progressTitle:'Learning record',progressDesc:'See what you have practised, where you are improving, and what to revisit next.',
    overviewKana:'Overview — Kana',overviewVocab:'Overview — Vocabulary',wordsPracticed:'Words practiced',
    footerNote:'Progress & quiz sessions saved in your browser (localStorage).',
    newQuiz:'New Quiz',savedSessions:'Saved Sessions',start:'🚀 Start Quiz',selectAll:'Select all',clear:'Clear',
    resume:'▶ Resume',redo:'🔄 Redo',correct:'Correct! 🎉',wrong:'Wrong!',complete:'Complete!',
    overview:'Overview',accuracy:'Overall accuracy',charsPracticed:'Characters practiced',characters:'characters',words:'words',
    totalQ:'Total questions answered',accuracyByRow:'Accuracy by Row',confused:'Characters you confuse',
    resetAll:'🗑 Reset all progress',tryAgain:'Try again',lookingGood:'Looking good! 👍',
    wellDone:'Well done!',noData:'No data yet. Take a quiz first.',
    charsSelected:'characters selected',selectAtLeast:'Select at least one row to begin.',
    loading:'Loading...',stroke:'Stroke',allComplete:'All Stages Complete!',stageComplete:'complete!',
    completed:'Completed',inProgress:'In progress',locked:'Locked',replaying:'Replaying',
    returnTo:'↩ Return to current stage',exit:'✕ Exit',score:'Score',streak:'Streak',
    question:'Question',stage:'Stage',traceChar:'trace the character',writeQ:'Write the character shown',
    failedWrite:'See the correct strokes',basic:'Basic',dakuten:'Dakuten / Handakuten',combo:'Combinations (Yōon)',
    reviewMistakes:'🔁 Review Mistakes',charsToReview:"character(s) you've gotten wrong before.",
    savedVocab:'Saved vocabulary sessions',newVocab:'New vocabulary quiz',jlptLevel:'JLPT level',categories:'Categories (leave all unchecked for every category)',
    onlineExtra:'Also load extra words online for the selected level(s)',onlineNote:'Loads more words from a public JLPT dictionary. Missing Thai meanings are translated and cached automatically.',
    startVocab:'🚀 Start vocabulary quiz',wordsSelected:'words selected',moreAfterLoad:' + more after loading',noWords:'No words match this filter.',
    loadingExtra:'Loading extra words…',reviewNow:'Review now',gotIt:'Got it! ➔',learnPrompt:'Learn this word, then choose the highlighted answer to continue.',
    dragMatch:'Drag each word to its matching meaning.',allMatched:'All matched! 🎉',typeMeaning:'type meaning or reading…',
    traceCharacters:'Trace the characters',translationBy:'Automatic Thai translation by MyMemory',hiraName:'Hiragana',kataName:'Katakana',replay:'🔄 Replay',listen:'🔊 Listen',loadingStroke:'Loading stroke order…',strokeUnavailable:'Stroke order data unavailable',showDetails:'Show details',
    drawFromMemory:'Write from memory. The answer is checked automatically when all strokes are drawn.',blankWritingArea:'Blank writing area',clearCanvas:'Clear canvas',revealAnswer:'Show answer',answerIs:'Answer',practiceAgain:'Practice again',available:'Available',
    freeWriteCorrect:'Correct — every stroke matches!',freeWriteWrong:'Not quite — watch the correct stroke order.',revealingStrokes:'Showing the correct strokes one by one…',
    freeWriteTryAgain:'Not quite. One incorrect stroke is shown — try again.',freeWriteAnswerCorrect:'Correct. Here is the true stroke order.',freeWriteAnswerWrong:'Here is the true stroke order.',attempt:'Attempt',nextQuestion:'Next question ➔',retryStrokeLoad:'Retry loading stroke data'
  },
  th:{
    chart:'あ ตาราง',quiz:'練 แบบทดสอบ',progress:'記 ความก้าวหน้า',vocab:'語 คันจิ',
    brandEyebrow:'พื้นที่ฝึกภาษาญี่ปุ่น',workspace:'พื้นที่เรียน',localDataNote:'ข้อมูลการเรียนจะถูกเก็บไว้ในอุปกรณ์นี้',
    chartEyebrow:'01 / ตารางอ้างอิง',chartTitle:'ตารางคานะ',chartDesc:'เลือกตัวอักษรเพื่อดูคำอ่าน ฟังเสียง และศึกษาลำดับขีด',
    vocabEyebrow:'03 / คำศัพท์',vocabTitle:'เรียนคันจิในบริบท',vocabDesc:'ฝึกคำศัพท์ญี่ปุ่นด้วยการอ่าน ความหมาย การทบทวน และการฟัง',
    progressEyebrow:'04 / ความก้าวหน้า',progressTitle:'บันทึกการเรียน',progressDesc:'ตรวจดูสิ่งที่ฝึกแล้ว พัฒนาการ และหัวข้อที่ควรกลับมาทบทวน',
    overviewKana:'ภาพรวม — คานะ',overviewVocab:'ภาพรวม — คำศัพท์',wordsPracticed:'คำศัพท์ที่ฝึก',
    footerNote:'ความก้าวหน้าและแบบทดสอบถูกบันทึกไว้ในเบราว์เซอร์',
    newQuiz:'แบบทดสอบใหม่',savedSessions:'เซสชันที่บันทึก',start:'🚀 เริ่มทำ',selectAll:'เลือกทั้งหมด',clear:'ล้าง',
    resume:'▶ ทำต่อ',redo:'🔄 ทำใหม่',correct:'ถูกต้อง! 🎉',wrong:'ผิด!',complete:'สำเร็จ!',
    overview:'ภาพรวม',accuracy:'ความแม่นยำโดยรวม',charsPracticed:'ตัวอักษรที่ฝึก',characters:'ตัวอักษร',words:'คำ',
    totalQ:'คำถามทั้งหมดที่ตอบ',accuracyByRow:'ความแม่นยำแต่ละแถว',confused:'ตัวอักษรที่มักสับสน',
    resetAll:'🗑 รีเซ็ตความก้าวหน้าทั้งหมด',tryAgain:'ลองอีกครั้ง',lookingGood:'ทำได้ดีมาก! 👍',
    wellDone:'เก่งมาก!',noData:'ยังไม่มีข้อมูล ลองทำแบบทดสอบก่อน',
    charsSelected:'ตัวอักษรที่เลือก',selectAtLeast:'เลือกอย่างน้อย 1 แถวเพื่อเริ่ม',
    loading:'กำลังโหลด...',stroke:'ขีดที่',allComplete:'ทำครบทุกด่านแล้ว!',stageComplete:'เสร็จแล้ว!',
    completed:'เสร็จแล้ว',inProgress:'กำลังทำ',locked:'ล็อก',replaying:'กำลังทบทวน',
    returnTo:'↩ กลับไปด่านปัจจุบัน',exit:'✕ ออก',score:'คะแนน',streak:'ตอบถูกต่อเนื่อง',
    question:'คำถาม',stage:'ด่าน',traceChar:'ลากตามตัวอักษร',writeQ:'เขียนตัวอักษรที่แสดง',
    failedWrite:'ดูลำดับขีดที่ถูกต้อง',basic:'พื้นฐาน',dakuten:'ดากุเต็น / ฮันดากุเต็น',combo:'ตัวผสม (โยอง)',
    reviewMistakes:'🔁 ทบทวนข้อผิด',charsToReview:'ตัวอักษรที่เคยตอบผิด',
    savedVocab:'เซสชันคำศัพท์ที่บันทึก',newVocab:'แบบทดสอบคำศัพท์ใหม่',jlptLevel:'ระดับ JLPT',categories:'หมวดหมู่ (ไม่เลือกเพื่อใช้ทุกหมวด)',
    onlineExtra:'โหลดคำศัพท์เสริมออนไลน์สำหรับระดับที่เลือก',onlineNote:'โหลดคำเพิ่มจากพจนานุกรม JLPT สาธารณะ คำที่ยังไม่มีความหมายไทยจะถูกแปลและบันทึกอัตโนมัติ',
    startVocab:'🚀 เริ่มแบบทดสอบคำศัพท์',wordsSelected:'คำที่เลือก',moreAfterLoad:' + เพิ่มหลังโหลด',noWords:'ไม่พบคำศัพท์ตรงกับตัวกรองนี้',
    loadingExtra:'กำลังโหลดคำศัพท์เสริม…',reviewNow:'ทบทวนตอนนี้',gotIt:'เข้าใจแล้ว! ➔',learnPrompt:'เรียนคำนี้ แล้วเลือกคำตอบที่ไฮไลต์เพื่อทำต่อ',
    dragMatch:'ลากคำศัพท์ไปจับคู่กับความหมาย',allMatched:'จับคู่ครบแล้ว! 🎉',typeMeaning:'พิมพ์ความหมายหรือคำอ่าน…',
    traceCharacters:'ลากตามตัวอักษร',translationBy:'คำแปลไทยอัตโนมัติโดย MyMemory',hiraName:'ฮิรางานะ',kataName:'คาตาคานะ',replay:'🔄 เล่นซ้ำ',listen:'🔊 ฟังเสียง',loadingStroke:'กำลังโหลดลำดับขีด…',strokeUnavailable:'ไม่พบข้อมูลลำดับขีด',showDetails:'ดูรายละเอียด',
    drawFromMemory:'เขียนคานะจากความจำ ระบบจะตรวจอัตโนมัติเมื่อวาดครบทุกขีด',blankWritingArea:'พื้นที่เขียนเปล่า',clearCanvas:'ล้างกระดาน',revealAnswer:'ดูคำตอบ',answerIs:'คำตอบ',practiceAgain:'ฝึกอีกครั้ง',available:'เลือกได้',
    freeWriteCorrect:'วาดถูกต้องครบทุกขีด!',freeWriteWrong:'ยังไม่ถูกต้อง — ดูลำดับขีดที่ถูกต้อง',revealingStrokes:'กำลังเฉลยลำดับขีดทีละขีด…',
    freeWriteTryAgain:'ยังไม่ถูกต้อง — เฉลยขีดที่ผิด 1 ขีดแล้ว ลองอีกครั้ง',freeWriteAnswerCorrect:'วาดถูกต้อง นี่คือลำดับขีดจริง',freeWriteAnswerWrong:'นี่คือลำดับขีดจริง',attempt:'ครั้งที่',nextQuestion:'ข้อต่อไป ➔',retryStrokeLoad:'ลองโหลดข้อมูลลำดับขีดอีกครั้ง'
  }
};

const VOCAB_STAGE_TH={
  vintro:['แนะนำ','เรียนรู้คำศัพท์'],vread:['อ่าน','คำศัพท์ → ความหมาย'],vrecall:['ทบทวน','ความหมาย → คำศัพท์'],
  vtype:['พิมพ์','พิมพ์ความหมายหรือคำอ่าน'],vlisten:['ฟัง','เสียง → คำศัพท์'],vmatch:['จับคู่','ลากและวาง'],
  vwrite:['เขียน','ลากตามตัวอักษร'],vtest:['ทดสอบ','รวมหลายรูปแบบ']
};
const KANA_STAGE_TH={
  intro:['แนะนำ','เรียนรู้ตัวอักษร'],mc:['อ่าน','คานะ → โรมาจิ'],rev:['ทบทวน','โรมาจิ → คานะ'],type:['พิมพ์','พิมพ์โรมาจิ'],
  listen:['ฟัง','เสียง → คานะ'],match:['จับคู่','ลากและวาง'],write:['เขียนตามเส้น','ลากตามลำดับขีด'],freewrite:['เขียนจากความจำ','เขียนโดยไม่มีเส้นช่วย'],test:['ทดสอบ','รวมหลายรูปแบบ']
};
const CATEGORY_TH={greetings:'คำทักทาย',numbers:'ตัวเลข',family:'ครอบครัว',food:'อาหารและเครื่องดื่ม',animals:'สัตว์',time:'เวลาและวัน',verbs:'คำกริยาที่ใช้บ่อย',adjectives:'คำคุณศัพท์',work:'งานและธุรกิจ',society:'สังคมและการเมือง',nature:'ธรรมชาติและสิ่งแวดล้อม',emotions:'อารมณ์และความรู้สึก',health:'สุขภาพและร่างกาย',abstract:'แนวคิดนามธรรม',extra:'คำศัพท์เสริมออนไลน์'};

let lang=localStorage.getItem('kp-lang')||'en';
function t(key){return LANG[lang]?.[key]||LANG.en[key]||key;}
function kanaStageName(stage){return lang==='th'?(KANA_STAGE_TH[stage.id]?.[0]||stage.name):stage.name;}
function kanaStageDesc(stage){return lang==='th'?(KANA_STAGE_TH[stage.id]?.[1]||stage.desc):stage.desc;}
function vocabStageName(stage){return lang==='th'?(VOCAB_STAGE_TH[stage.id]?.[0]||stage.name):stage.name;}
function vocabStageDesc(stage){return lang==='th'?(VOCAB_STAGE_TH[stage.id]?.[1]||stage.desc):stage.desc;}
function vocabCategoryLabel(cat){return lang==='th'?(CATEGORY_TH[cat.id]||cat.label):cat.label;}
function jlptLevelLabel(level){return lang==='th'?level.label.replace('Upper-Intermediate','กลางขั้นสูง').replace('Beginner','เริ่มต้น').replace('Elementary','พื้นฐาน').replace('Intermediate','กลาง').replace('Advanced','ขั้นสูง'):level.label;}

const langBtn=document.getElementById('langToggle');
function updLang(){langBtn.textContent=lang==='en'?'🇺🇸 EN':'🇹🇭 TH';}
function applyUiTranslations(){
  document.documentElement.lang=lang;
  document.title=lang==='th'?'ฝึกคานะ — พื้นที่เรียนภาษาญี่ปุ่น':'Kana Practice — Japanese learning workspace';
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n);});
  langBtn.setAttribute('aria-label',lang==='th'?'เปลี่ยนภาษา':'Change language');
}
function initNavLabels(){
  document.querySelectorAll('.nav-btn').forEach(b=>{
    const val=LANG[lang][b.dataset.tab];if(!val)return;
    const spaceIdx=val.indexOf(' '),icon=spaceIdx===-1?val:val.slice(0,spaceIdx),label=spaceIdx===-1?'':val.slice(spaceIdx+1);
    const iconEl=b.querySelector('.nav-icon'),labelEl=b.querySelector('.nav-label');
    if(iconEl)iconEl.textContent=icon;if(labelEl)labelEl.textContent=label;
  });
}

updLang();applyUiTranslations();initNavLabels();
langBtn.onclick=()=>{
  lang=lang==='en'?'th':'en';localStorage.setItem('kp-lang',lang);updLang();applyUiTranslations();initNavLabels();renderChart();
  if(document.getElementById('panel-quiz').classList.contains('active')){
    if(document.getElementById('quizSetup').style.display!=='none')renderQuizSetup();
    else if(typeof activeSession!=='undefined'&&activeSession)updateQuizProgress();
  }
  if(document.getElementById('panel-vocab').classList.contains('active')){
    if(document.getElementById('vocabSetup').style.display!=='none')renderVocabSetup();
    else if(typeof activeVocabSession!=='undefined'&&activeVocabSession)updateVocabQuizProgress();
  }
  if(document.getElementById('panel-progress').classList.contains('active'))refreshProgress();
};
