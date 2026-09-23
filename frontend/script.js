// ===== 1. API KEY =====
let API_KEY = localStorage.getItem('jarvis_key');
if(!API_KEY){ API_KEY = prompt('Enter your Gemini API Key:'); if(API_KEY) localStorage.setItem('jarvis_key', API_KEY); }
const MODELS = ["gemini-3.6-flash", "gemini-flash-latest"];

// ===== 2. MEMORY =====
let MEMORY = JSON.parse(localStorage.getItem('jarvis_memory') || '[]');
function saveMemory(){ localStorage.setItem('jarvis_memory', JSON.stringify(MEMORY)); }
const chat=document.getElementById('chat');
const input=document.getElementById('msg');
const micBtn=document.getElementById('mic-btn');
const clearBtn=document.getElementById('clear-btn');
const camBtn=document.getElementById('cam-btn');
const imgInput=document.getElementById('img-input');
MEMORY.forEach(m=> add((m.role==='user'?'YOU: ':'J.A.R.V.I.S: ')+m.text, m.role==='user'?'user':'ai'));

// ===== 3. TOOLS (THE HANDS) — 15 TOOLS =====
async function handleTools(text){
  const t = text.toLowerCase();

  if(t.includes('time')||t.includes('టైమ్')||t.includes('సమయం'))
    return 'The time is '+new Date().toLocaleTimeString()+', Boss.';

  if(t.includes('weather')||t.includes('వాతావరణం')){
    return await new Promise(res=>{
      navigator.geolocation.getCurrentPosition(async p=>{
        try{
          const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.coords.latitude}&longitude=${p.coords.longitude}&current_weather=true`);
          const d=await r.json();
          res(`It is ${d.current_weather.temperature} degrees Celsius now, Boss.`);
        }catch(e){ res('Weather service error, Boss.'); }
      }, ()=> res('I need location permission for weather, Boss.'));
    });
  }

  const m=t.match(/(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?|నిమిషాలు?|సెకండ్లు?|గంటలు?)/i);
  if((t.includes('timer')||t.includes('టైమర్'))&&m){
    const mins=parseInt(m[1]);
    setTimeout(()=>speak(`Timer done! ${mins} minutes completed, Boss.`), mins*60000);
    return `Timer set for ${mins} minutes, Boss.`;
  }

  if(t.includes('dice')) return 'You rolled '+(Math.floor(Math.random()*6)+1)+', Boss.';
  if(t.includes('coin')) return Math.random()<0.5?'Heads, Boss.':'Tails, Boss.';

  if(t.includes('joke')){
    try{ const r=await fetch('https://official-joke-api.appspot.com/random_joke');
      const d=await r.json(); return d.setup+' ... '+d.punchline; }catch(e){ return 'Joke service error, Boss.'; }
  }

  if(t.includes('quote')||t.includes('motivate')){
    try{ const r=await fetch('https://zenquotes.io/api/random');
      const d=await r.json(); return d[0].q+' — by '+d[0].a; }catch(e){ return 'Quote service error, Boss.'; }
  }

  if(t.includes('news')){
    try{
      const r=await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const ids=await r.json(); let out='Top tech news: ';
      for(let i=0;i<3;i++){
        const it=await fetch('https://hacker-news.firebaseio.com/v0/item/'+ids[i]+'.json');
        const d=await it.json(); out+=(i+1)+'. '+d.title+'. ';
      }
      return out;
    }catch(e){ return 'News service error, Boss.'; }
  }

  if(t.includes('translate')){
    const q=text.replace(/translate (this )?/i,'').trim()||'hello';
    try{ const r=await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(q)+'&langpair=en|te');
      const d=await r.json(); return 'In Telugu: '+d.responseData.translatedText; }catch(e){ return 'Translate error, Boss.'; }
  }

  if(t.includes('dollar')||t.includes('usd')||t.includes('exchange')){
    const amt=parseFloat((t.match(/(\d+)/)||[])[1]||1);
    try{ const r=await fetch('https://open.er-api.com/v6/latest/USD');
      const d=await r.json(); return amt+' US dollars is about '+Math.round(amt*d.rates.INR)+' Indian rupees, Boss.'; }catch(e){ return 'Currency service error, Boss.'; }
  }

  if(t.includes('meaning')){
    const w=text.replace(/.*meaning (of )?/i,'').replace(/[?.]/g,'').trim();
    try{ const r=await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(w));
      const d=await r.json(); return w+' means: '+d[0].meanings[0].definitions[0].definition; }catch(e){ return 'Word not found, Boss.'; }
  }

  if(t.includes('password')){
    const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    const groups=['ABCDEFGHJKLMNPQRSTUVWXYZ','abcdefghijkmnpqrstuvwxyz','23456789','!@#$%'];     const all=groups.join('');     const secureIndex=max=>{const limit=0x100000000-(0x100000000%max);const a=new Uint32Array(1);do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%max;};     let p=groups.map(g=>g[secureIndex(g.length)]).join('');     while(p.length<16)p+=all[secureIndex(all.length)];     p=p.split('');for(let i=p.length-1;i>0;i--){const j=secureIndex(i+1);[p[i],p[j]]=[p[j],p[i]];}p=p.join('');
    return 'Your strong password: '+p;
  }

  if(t.includes('search')){
    const q=text.replace(/search (for )?/i,'').trim();
    try{
      const r=await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(q));
      const d=await r.json();
      return d.extract ? d.extract : 'I could not find that, Boss.';
    }catch(e){ return 'Search error, Boss.'; }
  }

  if(t.includes('open youtube')){ window.open('https://youtube.com'); return 'Opening YouTube, Boss.'; }
  if(t.includes('open google')){ window.open('https://google.com'); return 'Opening Google, Boss.'; }

  if(t.includes('play ')||t.includes('youtube ')){
    const q=text.replace(/play |youtube (search )?/i,'').trim();
    if(q){ window.open('https://www.youtube.com/results?search_query='+encodeURIComponent(q)); return 'Searching YouTube for '+q+', Boss.'; }
  }

  if(t.includes('bitcoin')||t.includes('crypto')){
    try{
      const r=await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,inr');
      const d=await r.json();
      return `Bitcoin is ${d.bitcoin.usd} dollars, ${d.bitcoin.inr} rupees, Boss.`;
    }catch(e){ return 'Crypto service error, Boss.'; }
  }

  return null;
}

// ===== 4. GEMINI BRAIN =====
async function callGemini(p){
  const contents = MEMORY.slice(-12).map(m=>({role:m.role, parts:[{text:m.text}]}));
  contents.push({role:'user', parts:[{text:p}]});
  let lastErr;
  for(const m of MODELS){
    try{
      const res=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+m+":generateContent?key="+API_KEY,
        {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:contents})});
      const data=await res.json();
      if(data.error){ lastErr=new Error(data.error.message);
        if(/high demand|temporar|quota|rate|unavailable|no longer available|deprecated/i.test(data.error.message)) continue;
        throw lastErr; }
      return data.candidates[0].content.parts[0].text;
    }catch(e){ lastErr=e; }
  }
  throw lastErr;
}

async function askGemini(p){
  add('J.A.R.V.I.S: Thinking...','ai');
  try{
    const toolReply=await handleTools(p);
    if(toolReply){
      MEMORY.push({role:'user',text:p}); MEMORY.push({role:'model',text:toolReply}); saveMemory();
      chat.lastChild.innerText='J.A.R.V.I.S: '+toolReply; speak(toolReply); return;
    }
  }catch(e){}
  try{
    const reply=await callGemini(p);
    MEMORY.push({role:'user',text:p}); MEMORY.push({role:'model',text:reply}); saveMemory();
    chat.lastChild.innerText='J.A.R.V.I.S: '+reply; speak(reply);
  }catch(e){ chat.lastChild.innerText='J.A.R.V.I.S: ERROR - '+e.message; }
}

// ===== 5. VISION =====
camBtn.onclick=()=>imgInput.click();
imgInput.onchange=()=>{
  const file=imgInput.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    const base64=reader.result.split(',')[1];
    const q=input.value.trim()||'What do you see? Describe briefly.';
    add('YOU: [IMAGE] '+q,'user'); input.value='';
    askVision(base64,file.type,q);
  };
  reader.readAsDataURL(file);
};
async function askVision(base64,mime,q){
  add('J.A.R.V.I.S: Analyzing image...','ai');
  let lastErr;
  for(const m of MODELS){
    try{
      const res=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+m+":generateContent?key="+API_KEY,
        {method:"POST",headers:{"Content-Type":"application/json"},
         body:JSON.stringify({contents:[{parts:[{text:q},{inline_data:{mime_type:mime,data:base64}}]}]})});
      const data=await res.json();
      if(data.error){ lastErr=new Error(data.error.message);
        if(/high demand|temporar|quota|rate|unavailable|no longer available|deprecated/i.test(data.error.message)) continue;
        throw lastErr; }
      const reply=data.candidates[0].content.parts[0].text;
      chat.lastChild.innerText='J.A.R.V.I.S: '+reply; speak(reply); return;
    }catch(e){ lastErr=e; }
  }
  chat.lastChild.innerText='J.A.R.V.I.S: ERROR - '+lastErr.message;
}

// ===== 6. SPEECH + TTS =====
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const rec=new SR(); rec.lang='en-US';
rec.onresult=(e)=>{const t=e.results[0][0].transcript;add('YOU: '+t,'user');askGemini(t);};
micBtn.onclick=()=>{rec.start();micBtn.innerText='LISTENING...';};
rec.onend=()=>{micBtn.innerText='🎙️';};
let voices=[]; function loadVoices(){ voices=speechSynthesis.getVoices(); }
loadVoices(); speechSynthesis.onvoiceschanged=loadVoices;
function speak(t){ const u=new SpeechSynthesisUtterance(t); u.rate=1.05; u.pitch=0.85;
  const v=voices.find(v=>v.lang.startsWith('en')); if(v) u.voice=v; speechSynthesis.speak(u); }

// ===== 7. SEND + CLEAR =====
document.getElementById('send').onclick=()=>{ const t=input.value.trim(); if(!t)return;
  add('YOU: '+t,'user'); input.value=''; askGemini(t); };
clearBtn.onclick=()=>{ MEMORY=[]; saveMemory(); chat.innerHTML=''; add('SYSTEM: Memory cleared.','ai'); };
function add(t,w){const d=document.createElement('div');d.className='msg '+w;d.innerText=t;chat.appendChild(d);chat.scrollTop=chat.scrollHeight;}
