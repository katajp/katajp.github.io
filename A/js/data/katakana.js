// Katakana character data, grouped by basic / dakuten / combo (yōon)
const KATA = {
  basic: [
    {label:"a",chars:[["ア","a"],["イ","i"],["ウ","u"],["エ","e"],["オ","o"]]},
    {label:"ka",chars:[["カ","ka"],["キ","ki"],["ク","ku"],["ケ","ke"],["コ","ko"]]},
    {label:"sa",chars:[["サ","sa"],["シ","shi"],["ス","su"],["セ","se"],["ソ","so"]]},
    {label:"ta",chars:[["タ","ta"],["チ","chi"],["ツ","tsu"],["テ","te"],["ト","to"]]},
    {label:"na",chars:[["ナ","na"],["ニ","ni"],["ヌ","nu"],["ネ","ne"],["ノ","no"]]},
    {label:"ha",chars:[["ハ","ha"],["ヒ","hi"],["フ","fu"],["ヘ","he"],["ホ","ho"]]},
    {label:"ma",chars:[["マ","ma"],["ミ","mi"],["ム","mu"],["メ","me"],["モ","mo"]]},
    {label:"ya",chars:[["ヤ","ya"],["ユ","yu"],["ヨ","yo"]]},
    {label:"ra",chars:[["ラ","ra"],["リ","ri"],["ル","ru"],["レ","re"],["ロ","ro"]]},
    {label:"wa",chars:[["ワ","wa"],["ヲ","wo"],["ン","n"]]},
  ],
  dakuten: [
    {label:"ga",chars:[["ガ","ga"],["ギ","gi"],["グ","gu"],["ゲ","ge"],["ゴ","go"]]},
    {label:"za",chars:[["ザ","za"],["ジ","ji"],["ズ","zu"],["ゼ","ze"],["ゾ","zo"]]},
    {label:"da",chars:[["ダ","da"],["ヂ","ji"],["ヅ","zu"],["デ","de"],["ド","do"]]},
    {label:"ba",chars:[["バ","ba"],["ビ","bi"],["ブ","bu"],["ベ","be"],["ボ","bo"]]},
    {label:"pa",chars:[["パ","pa"],["ピ","pi"],["プ","pu"],["ペ","pe"],["ポ","po"]]},
  ],
  combo: [
    {label:"kya",chars:[["キャ","kya"],["キュ","kyu"],["キョ","kyo"]]},
    {label:"sha",chars:[["シャ","sha"],["シュ","shu"],["ショ","sho"]]},
    {label:"cha",chars:[["チャ","cha"],["チュ","chu"],["チョ","cho"]]},
    {label:"nya",chars:[["ニャ","nya"],["ニュ","nyu"],["ニョ","nyo"]]},
    {label:"hya",chars:[["ヒャ","hya"],["ヒュ","hyu"],["ヒョ","hyo"]]},
    {label:"mya",chars:[["ミャ","mya"],["ミュ","myu"],["ミョ","myo"]]},
    {label:"rya",chars:[["リャ","rya"],["リュ","ryu"],["リョ","ryo"]]},
    {label:"gya",chars:[["ギャ","gya"],["ギュ","gyu"],["ギョ","gyo"]]},
    {label:"ja",chars:[["ジャ","ja"],["ジュ","ju"],["ジョ","jo"]]},
    {label:"bya",chars:[["ビャ","bya"],["ビュ","byu"],["ビョ","byo"]]},
    {label:"pya",chars:[["ピャ","pya"],["ピュ","pyu"],["ピョ","pyo"]]},
  ]
};

