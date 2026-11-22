# Episode 1 — Season 1 Preservation Checklist

Run these checks against the current deployed Season 1 app before and after Season 2 integration.

- [ ] App loads from the existing public URL.
- [ ] Gemini API key setup and a text prompt produce a response.
- [ ] Telugu-English prompt receives a usable response.
- [ ] Microphone permission and speech recognition work on a supported browser.
- [ ] Text-to-speech playback works on a supported browser.
- [ ] Image attachment reaches the existing image-analysis flow.
- [ ] Current conversation survives a reload.
- [ ] Conversation history can be opened and switched.
- [ ] Weather tool returns data or a clear provider error.
- [ ] News tool returns data or a clear provider error.
- [ ] Crypto tool returns data or a clear provider error.
- [ ] Agent mode can complete its currently supported task flow.
- [ ] PWA installability and launch behavior are checked on Android Chrome.
- [ ] Telegram/Cloudflare scheduled briefing is verified in its own Cloudflare environment.

## Known source-level items to investigate in a later episode

- The current PWA manifest points `start_url` to `./jarvis-build-log.html`; confirm intended launch target before changing it.
- The service worker currently precaches the build-log page and logo only; expand offline caching only after the new app shell is ready.
- The current frontend reads the Gemini API key from browser LocalStorage. Plan a safer key-handling approach before adding shared or remote device execution.
- The README refers to `functions/worker.js`, but that path was not present in the repository revision inspected for this episode. Locate the actual deployed Worker source before modifying automation.

Do not mark a checkbox complete without running the corresponding test.
