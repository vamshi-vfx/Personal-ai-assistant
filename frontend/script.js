// ===== ADD THIS TO EPISODE 6 CODE =====

// AVAILABLE TOOLS LIST FOR AGENT
const AGENT_TOOLS = {
  "time": async () => 'The time is '+new Date().toLocaleTimeString()+'.',
  "weather": async () => { /* Ep6 weather logic here */ return await getWeather(); },
  "news": async () => { /* Ep6 news logic here */ return await getNews(); },
  "crypto": async () => { /* Ep6 crypto logic here */ return await getCrypto(); }
};

// THE AGENT LOOP
async function runAgent(goal) {
  add('🤖 J.A.R.V.I.S: AGENT MODE ACTIVATED.', 'ai');
  add('🧠 Analyzing goal: ' + goal, 'ai');
  
  try {
    // STEP 1: Ask Gemini to pick tools
    const planPrompt = `You are an Agent. Goal: "${goal}". Available tools: time, weather, news, crypto. 
    Reply ONLY with a JSON array of tools needed. Example: ["time", "weather"].`;
    
    const planRes = await callGeminiRaw(planPrompt); // Raw call without memory
    let toolsToRun = [];
    try {
      // Extract JSON from response
      const match = planRes.match(/\[.*\]/);
      if(match) toolsToRun = JSON.parse(match[0]);
    } catch(e) { toolsToRun = ["time"]; } // Fallback

    // STEP 2: Execute Tools
    let results = {};
    for(let i=0; i<toolsToRun.length; i++) {
      const tool = toolsToRun[i].toLowerCase().trim();
      if(AGENT_TOOLS[tool]) {
        add(`⚙️ [${i+1}/${toolsToRun.length}] Executing Tool: ${tool.toUpperCase()}...`, 'ai');
        results[tool] = await AGENT_TOOLS[tool]();
        chat.lastChild.innerText += ' ✅';
      }
    }

    // STEP 3: Synthesize Final Report
    add('🧠 Synthesizing final report...', 'ai');
    const summaryPrompt = `Goal: "${goal}". Here is live data: ${JSON.stringify(results)}. 
    Give a short, natural spoken response to the Boss combining this data.`;
    
    const finalReport = await callGemini(summaryPrompt); // Uses memory
    
    MEMORY.push({role:'user',text:goal}); 
    MEMORY.push({role:'model',text:finalReport}); 
    saveMemory();
    
    add('🎙️ J.A.R.V.I.S: ' + finalReport, 'ai');
    speak(finalReport);

  } catch(e) {
    add('🤖 AGENT ERROR: ' + e.message, 'ai');
  }
}

// Helper for raw Gemini call (no memory context for planning)
async function callGeminiRaw(prompt) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELS[0]}:generateContent?key=${API_KEY}`, {
    method: "POST", headers: {"Content-Type": "application/json"},
    body: JSON.stringify({contents:[{parts:[{text: prompt}]}]})
  });
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

// Override askGemini to check for Agent triggers FIRST
const originalAskGemini = askGemini;
askGemini = async function(p) {
  const t = p.toLowerCase();
  if(t.includes('briefing') || t.includes('plan') || t.includes('research') || t.includes('analyze')) {
    return runAgent(p);
  }
  return originalAskGemini(p);
};
