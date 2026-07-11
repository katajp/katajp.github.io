// Dark / light theme toggle.

const themeBtn=document.getElementById("themeToggle");
let dark=localStorage.getItem("kana-dark")==="1";
if(dark)document.body.classList.add("dark");
updTheme();
themeBtn.onclick=()=>{dark=!dark;document.body.classList.toggle("dark",dark);localStorage.setItem("kana-dark",dark?"1":"0");updTheme();};
function updTheme(){themeBtn.textContent=dark?"☀️ Light":"🌙 Dark";}

