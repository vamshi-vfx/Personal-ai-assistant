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

  if(/\btime\b/.test(t)||t.includes('టైమ్')||t.includes('సమయం')||t.includes('samayam'))
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
    const amount=parseInt(m[1]); const unit=m[2].toLowerCase(); const factor=/^(hours?|hrs?|h|గంట)/.test(unit)?3600000:/^(seconds?|secs?|s|సెకండ్)/.test(unit)?1000:60000; const duration=amount*factor; if(duration>86400000)return 'Timer limit is 24 hours.';
    setTimeout(()=>speak(`టైమర్ పూర్తైంది! ${amount} ${unit} అయ్యాయి.`),duration);
    return `Timer set for ${amount} ${unit}.`;
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
    try{ const r=await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(w),{signal:AbortSignal.timeout(7000)});
      const d=await r.json(); return w+' means: '+d[0].meanings[0].definitions[0].definition; }catch(e){ try{const r=await fetch('https://api.datamuse.com/words?sp='+encodeURIComponent(w)+'&md=d&max=1',{signal:AbortSignal.timeout(7000)});const d=await r.json();const def=d?.[0]?.defs?.[0];if(def)return w+' means: '+def.replace(/^[a-z]	/,'');}catch(x){} return 'Could not retrieve the word meaning right now. Try again later.'; }
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
      return d.extract ? 'Wikipedia summary: '+d.extract : 'I could not find that, Boss.';
    }catch(e){ return 'Search error, Boss.'; }
  }

  if(t.includes('open youtube')||t.includes('youtube open')){ window.open('https://youtube.com'); return 'Opening YouTube, Boss.'; }
  if(t.includes('open google')||t.includes('google open')){ window.open('https://google.com'); return 'Opening Google, Boss.'; }

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
        {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemInstruction:{parts:[{text:"You are J.A.R.V.I.S, a friendly personal assistant for Vamshi. Reply naturally in a warm Telugu-English mix (Telugish), mostly using Telugu script for Telugu and English for technical terms. Keep replies concise, conversational, empathetic, and easy to say aloud. Avoid robotic or overly formal wording, repetitive greetings, and calling the user Boss. Match the user's language and context."}]},contents:contents})});
      const data=await res.json();
      if(data.error){ lastErr=new Error(data.error.message);
        if(/high demand|temporar|quota|rate|unavailable|no longer available|deprecated/i.test(data.error.message)) continue;
        throw lastErr; }
      return data.candidates[0].content.parts[0].text;
    }catch(e){ lastErr=e; }
  }
  throw lastErr;
}

function telugishToolReply(r){let p;if(r.startsWith('The time is '))return 'ఇప్పుడు టైమ్ '+r.slice(12).replace(', Boss.','')+'.';if(r.startsWith('It is '))return 'ఇప్పుడు '+r.split(' ')[2]+'°C ఉంది.';if(r.startsWith('Timer set for '))return 'సరే, '+r.slice(14).replace('.','')+'కి timer పెట్టాను.';if(r.startsWith('Timer limit'))return '24 గంటల కంటే ఎక్కువ timer set చేయలేను.';if(r.startsWith('You rolled '))return 'డైస్‌లో '+r.split(' ')[2]+' వచ్చింది!';if(r==='Heads, Boss.')return 'కాయిన్‌లో Heads వచ్చింది!';if(r==='Tails, Boss.')return 'కాయిన్‌లో Tails వచ్చింది!';if(r.startsWith('I need location permission'))return 'Weather కోసం location permission ఇవ్వాలి.';if(r.startsWith('Weather service error'))return 'Weather సమాచారం ఇప్పుడే దొరకలేదు.';if(r.includes(' — by ')){p=r.split(' — by ');return 'ఇదిగో ఒక thought: “'+p[0]+'” — '+p[1];}if(r.startsWith('Wikipedia summary: '))return 'Wikipediaలో సారాంశం: '+r.slice(19);if(r.startsWith('Top tech news: '))return 'ఇవాళ్టి top tech headlines: '+r.slice(15);if(r.startsWith('In Telugu: '))return 'తెలుగులో: '+r.slice(11);if(r.includes(' US dollars is about ')){p=r.split(' US dollars is about ');return '$'+p[0]+' అంటే సుమారుగా ₹'+p[1].split(' Indian rupees')[0]+' అవుతుంది.';}if(r.includes(' means: ')){p=r.split(' means: ');return p[0]+' అంటే: '+p.slice(1).join(' means: ');}if(r.startsWith('Could not retrieve'))return 'ఈ పదానికి meaning ఇప్పుడే దొరకలేదు. కొద్దిసేపటికి మళ్లీ try చేద్దాం.';if(r.startsWith('Your strong password: '))return 'ఇదిగో strong password: '+r.slice('Your strong password: '.length);if(r.startsWith('Opening YouTube'))return 'YouTube ఓపెన్ చేస్తున్నాను.';if(r.startsWith('Opening Google'))return 'Google ఓపెన్ చేస్తున్నాను.';if(r.startsWith('Searching YouTube for '))return 'YouTubeలో '+r.slice(22).replace(', Boss.','')+' కోసం వెతుకుతున్నాను.';if(r.startsWith('Bitcoin is ')){p=r.slice(11).split(' dollars, ');return 'Bitcoin ధర ఇప్పుడు $'+p[0]+' (సుమారు ₹'+p[1].split(' rupees')[0]+').';}if(r.includes(' ... '))return 'ఇదిగో ఒక joke: '+r;if(r.endsWith(', Boss.'))return r.slice(0,-7)+'.';return r;}async function askGemini(p){
  add('J.A.R.V.I.S: Thinking...','ai');
  try{
    let toolReply=await handleTools(p); if(toolReply)toolReply=telugishToolReply(toolReply);
    if(toolReply){
      MEMORY.push({role:'user',text:p}); MEMORY.push({role:'model',text:toolReply}); saveMemory();
      chat.lastChild.innerText='J.A.R.V.I.S: '+toolReply; speak(toolReply); return;
    }
  }catch(e){console.error('Tool command failed:',e);chat.lastChild.innerText='J.A.R.V.I.S: Command execute cheyyalekapoyanu. Inko sari try cheddam.';return;}
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
         body:JSON.stringify({systemInstruction:{parts:[{text:"You are J.A.R.V.I.S, a friendly personal assistant for Vamshi. Reply naturally in a warm Telugu-English mix (Telugish), mostly using Telugu script for Telugu and English for technical terms. Keep replies concise, conversational, empathetic, and easy to say aloud. Avoid robotic or overly formal wording, repetitive greetings, and calling the user Boss."}]},contents:[{parts:[{text:q},{inline_data:{mime_type:mime,data:base64}}]}]})});
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
const rec=SR?new SR():null; if(rec)rec.lang='en-US';
if(rec)rec.onresult=(e)=>{const t=e.results[0][0].transcript;add('YOU: '+t,'user');askGemini(t);};
micBtn.onclick=()=>{if(!rec){add('SYSTEM: Voice input is not supported in this browser.','ai');return;}try{rec.start();micBtn.innerText='LISTENING...';}catch(e){micBtn.innerText='🎙️';}};
if(rec)rec.onend=()=>{micBtn.innerText='🎙️';};
let voices=[]; function loadVoices(){ if(!('speechSynthesis' in window))return; try{voices=window.speechSynthesis.getVoices();}catch(e){voices=[];} }
loadVoices(); if('speechSynthesis' in window)window.speechSynthesis.onvoiceschanged=loadVoices;
function speak(t){ if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined')return; const u=new SpeechSynthesisUtterance(t); u.rate=0.96; u.pitch=1.0;
  const isTelugu=/[\u0C00-\u0C7F]/.test(t); const v=isTelugu?voices.find(v=>/^te[-_]/i.test(v.lang)):voices.find(v=>/^en[-_]/i.test(v.lang)); if(v){u.voice=v;u.lang=v.lang;}else if(isTelugu)u.lang='te-IN'; try{window.speechSynthesis.speak(u);}catch(e){console.warn('Speech output unavailable:',e);} }

// ===== 7. SEND + CLEAR =====
document.getElementById('send').onclick=()=>{ const t=input.value.trim(); if(!t)return;
  add('YOU: '+t,'user'); input.value=''; askGemini(t); };
clearBtn.onclick=()=>{ MEMORY=[]; saveMemory(); chat.innerHTML=''; add('SYSTEM: Memory cleared.','ai'); };
function add(t,w){const d=document.createElement('div');d.className='msg '+w;d.innerText=t;chat.appendChild(d);chat.scrollTop=chat.scrollHeight;}
