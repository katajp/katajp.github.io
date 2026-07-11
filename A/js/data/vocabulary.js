// Curated seed vocabulary (JLPT N5/N4). Each word: word (kanji/kana as written),
// reading (kana, for furigana/TTS), meaning (English), meaningTh (Thai),
// jlpt level, and category (matches js/data/categories.js ids).
// This local list is the source of truth for which words appear in the app;
// js/api/vocabulary.js optionally enriches individual words with a live
// reading-check and example sentence from the Jotoba dictionary API.
const VOCABULARY=[
  // Greetings
  {word:"こんにちは",reading:"こんにちは",meaning:"hello / good afternoon",meaningTh:"สวัสดี (ตอนกลางวัน)",jlpt:"N5",category:"greetings"},
  {word:"おはよう",reading:"おはよう",meaning:"good morning",meaningTh:"อรุณสวัสดิ์",jlpt:"N5",category:"greetings"},
  {word:"こんばんは",reading:"こんばんは",meaning:"good evening",meaningTh:"สวัสดี (ตอนเย็น)",jlpt:"N5",category:"greetings"},
  {word:"さようなら",reading:"さようなら",meaning:"goodbye",meaningTh:"ลาก่อน",jlpt:"N5",category:"greetings"},
  {word:"ありがとう",reading:"ありがとう",meaning:"thank you",meaningTh:"ขอบคุณ",jlpt:"N5",category:"greetings"},
  {word:"すみません",reading:"すみません",meaning:"excuse me / sorry",meaningTh:"ขอโทษ",jlpt:"N5",category:"greetings"},
  {word:"お願いします",reading:"おねがいします",meaning:"please",meaningTh:"ได้โปรด / กรุณา",jlpt:"N5",category:"greetings"},
  {word:"はい",reading:"はい",meaning:"yes",meaningTh:"ใช่",jlpt:"N5",category:"greetings"},
  {word:"いいえ",reading:"いいえ",meaning:"no",meaningTh:"ไม่ใช่",jlpt:"N5",category:"greetings"},

  // Numbers
  {word:"一",reading:"いち",meaning:"one",meaningTh:"หนึ่ง",jlpt:"N5",category:"numbers"},
  {word:"二",reading:"に",meaning:"two",meaningTh:"สอง",jlpt:"N5",category:"numbers"},
  {word:"三",reading:"さん",meaning:"three",meaningTh:"สาม",jlpt:"N5",category:"numbers"},
  {word:"四",reading:"よん",meaning:"four",meaningTh:"สี่",jlpt:"N5",category:"numbers"},
  {word:"五",reading:"ご",meaning:"five",meaningTh:"ห้า",jlpt:"N5",category:"numbers"},
  {word:"六",reading:"ろく",meaning:"six",meaningTh:"หก",jlpt:"N5",category:"numbers"},
  {word:"七",reading:"なな",meaning:"seven",meaningTh:"เจ็ด",jlpt:"N5",category:"numbers"},
  {word:"八",reading:"はち",meaning:"eight",meaningTh:"แปด",jlpt:"N5",category:"numbers"},
  {word:"九",reading:"きゅう",meaning:"nine",meaningTh:"เก้า",jlpt:"N5",category:"numbers"},
  {word:"十",reading:"じゅう",meaning:"ten",meaningTh:"สิบ",jlpt:"N5",category:"numbers"},

  // Family
  {word:"家族",reading:"かぞく",meaning:"family",meaningTh:"ครอบครัว",jlpt:"N5",category:"family"},
  {word:"父",reading:"ちち",meaning:"(my) father",meaningTh:"พ่อ (ของตัวเอง)",jlpt:"N5",category:"family"},
  {word:"母",reading:"はは",meaning:"(my) mother",meaningTh:"แม่ (ของตัวเอง)",jlpt:"N5",category:"family"},
  {word:"兄",reading:"あに",meaning:"(my) older brother",meaningTh:"พี่ชาย (ของตัวเอง)",jlpt:"N5",category:"family"},
  {word:"姉",reading:"あね",meaning:"(my) older sister",meaningTh:"พี่สาว (ของตัวเอง)",jlpt:"N5",category:"family"},
  {word:"弟",reading:"おとうと",meaning:"younger brother",meaningTh:"น้องชาย",jlpt:"N5",category:"family"},
  {word:"妹",reading:"いもうと",meaning:"younger sister",meaningTh:"น้องสาว",jlpt:"N5",category:"family"},
  {word:"友達",reading:"ともだち",meaning:"friend",meaningTh:"เพื่อน",jlpt:"N5",category:"family"},

  // Food & drink
  {word:"水",reading:"みず",meaning:"water",meaningTh:"น้ำ",jlpt:"N5",category:"food"},
  {word:"ご飯",reading:"ごはん",meaning:"rice / meal",meaningTh:"ข้าว / มื้ออาหาร",jlpt:"N5",category:"food"},
  {word:"パン",reading:"パン",meaning:"bread",meaningTh:"ขนมปัง",jlpt:"N5",category:"food"},
  {word:"魚",reading:"さかな",meaning:"fish",meaningTh:"ปลา",jlpt:"N5",category:"food"},
  {word:"肉",reading:"にく",meaning:"meat",meaningTh:"เนื้อสัตว์",jlpt:"N5",category:"food"},
  {word:"野菜",reading:"やさい",meaning:"vegetable",meaningTh:"ผัก",jlpt:"N5",category:"food"},
  {word:"果物",reading:"くだもの",meaning:"fruit",meaningTh:"ผลไม้",jlpt:"N5",category:"food"},
  {word:"お茶",reading:"おちゃ",meaning:"tea",meaningTh:"ชา",jlpt:"N5",category:"food"},
  {word:"卵",reading:"たまご",meaning:"egg",meaningTh:"ไข่",jlpt:"N5",category:"food"},

  // Animals
  {word:"犬",reading:"いぬ",meaning:"dog",meaningTh:"สุนัข",jlpt:"N5",category:"animals"},
  {word:"猫",reading:"ねこ",meaning:"cat",meaningTh:"แมว",jlpt:"N5",category:"animals"},
  {word:"鳥",reading:"とり",meaning:"bird",meaningTh:"นก",jlpt:"N5",category:"animals"},
  {word:"馬",reading:"うま",meaning:"horse",meaningTh:"ม้า",jlpt:"N5",category:"animals"},
  {word:"牛",reading:"うし",meaning:"cow",meaningTh:"วัว",jlpt:"N4",category:"animals"},

  // Time & days
  {word:"今日",reading:"きょう",meaning:"today",meaningTh:"วันนี้",jlpt:"N5",category:"time"},
  {word:"明日",reading:"あした",meaning:"tomorrow",meaningTh:"พรุ่งนี้",jlpt:"N5",category:"time"},
  {word:"昨日",reading:"きのう",meaning:"yesterday",meaningTh:"เมื่อวาน",jlpt:"N5",category:"time"},
  {word:"今",reading:"いま",meaning:"now",meaningTh:"ตอนนี้",jlpt:"N5",category:"time"},
  {word:"時間",reading:"じかん",meaning:"time / hour",meaningTh:"เวลา / ชั่วโมง",jlpt:"N5",category:"time"},
  {word:"月曜日",reading:"げつようび",meaning:"Monday",meaningTh:"วันจันทร์",jlpt:"N5",category:"time"},
  {word:"火曜日",reading:"かようび",meaning:"Tuesday",meaningTh:"วันอังคาร",jlpt:"N5",category:"time"},

  // Common verbs
  {word:"食べる",reading:"たべる",meaning:"to eat",meaningTh:"กิน",jlpt:"N5",category:"verbs"},
  {word:"飲む",reading:"のむ",meaning:"to drink",meaningTh:"ดื่ม",jlpt:"N5",category:"verbs"},
  {word:"行く",reading:"いく",meaning:"to go",meaningTh:"ไป",jlpt:"N5",category:"verbs"},
  {word:"来る",reading:"くる",meaning:"to come",meaningTh:"มา",jlpt:"N5",category:"verbs"},
  {word:"見る",reading:"みる",meaning:"to see / watch",meaningTh:"ดู",jlpt:"N5",category:"verbs"},
  {word:"聞く",reading:"きく",meaning:"to listen / ask",meaningTh:"ฟัง / ถาม",jlpt:"N5",category:"verbs"},
  {word:"話す",reading:"はなす",meaning:"to speak",meaningTh:"พูด",jlpt:"N5",category:"verbs"},
  {word:"読む",reading:"よむ",meaning:"to read",meaningTh:"อ่าน",jlpt:"N5",category:"verbs"},
  {word:"書く",reading:"かく",meaning:"to write",meaningTh:"เขียน",jlpt:"N5",category:"verbs"},
  {word:"買う",reading:"かう",meaning:"to buy",meaningTh:"ซื้อ",jlpt:"N5",category:"verbs"},

  // Adjectives
  {word:"大きい",reading:"おおきい",meaning:"big",meaningTh:"ใหญ่",jlpt:"N5",category:"adjectives"},
  {word:"小さい",reading:"ちいさい",meaning:"small",meaningTh:"เล็ก",jlpt:"N5",category:"adjectives"},
  {word:"高い",reading:"たかい",meaning:"expensive / tall",meaningTh:"แพง / สูง",jlpt:"N5",category:"adjectives"},
  {word:"安い",reading:"やすい",meaning:"cheap",meaningTh:"ถูก",jlpt:"N5",category:"adjectives"},
  {word:"新しい",reading:"あたらしい",meaning:"new",meaningTh:"ใหม่",jlpt:"N5",category:"adjectives"},
  {word:"古い",reading:"ふるい",meaning:"old",meaningTh:"เก่า",jlpt:"N5",category:"adjectives"},
  {word:"おいしい",reading:"おいしい",meaning:"delicious",meaningTh:"อร่อย",jlpt:"N5",category:"adjectives"},
  {word:"楽しい",reading:"たのしい",meaning:"fun",meaningTh:"สนุก",jlpt:"N5",category:"adjectives"}
];
