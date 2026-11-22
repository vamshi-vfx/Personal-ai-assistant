# J.A.R.V.I.S 2.0 — Season 2 Architecture

## Product direction

- Visual style: Hybrid JARVIS — cinematic central AI core with a professional control dashboard.
- Layout: Adaptive — Android portrait and PC widescreen.
- Development constraint: source editing and Git operations from an Android phone.
- Cost constraint: free/open-source first; provider free tiers are optional and may change.
- Compatibility rule: preserve the Season 1 web/PWA experience until the native Android agent is proven.

## Existing Season 1 capabilities to preserve

The repository README and frontend source document/implement:
- Gemini-powered assistant responses.
- Browser speech recognition and speech synthesis.
- Image input and image analysis.
- LocalStorage conversation memory and conversation history.
- Weather, news, and crypto tools.
- Agent-mode/task-planning behavior.
- Telegram briefing automation documented through Cloudflare Workers.
- Installable PWA experience.

Do not remove or silently replace these features during the Season 2 migration. Each capability must have a regression test or a manual verification checklist before its implementation is moved.

## Target architecture

```text
JARVIS 2.0
├── Android Native Agent (Kotlin + Jetpack Compose)
│   ├── Voice / Permissions / Device Tools / Camera / Local Memory
│   └── Secure device identity and WebSocket client
├── Shared Contracts
│   ├── Tool request/response schemas
│   ├── Device events
│   └── Task lifecycle states
├── Core Services
│   ├── Orchestrator / Planner / Executor / Verifier
│   ├── Model provider gateway
│   ├── Memory service
│   └── Authentication / audit log
├── PC Companion (Python)
│   ├── FastAPI + WebSocket
│   ├── Allowlisted tools
│   └── Restricted file and application operations
└── Adaptive HUD / Dashboard
    ├── Android portrait interface
    └── PC widescreen command center
```

## Migration strategy

1. Keep the current `frontend/` Season 1 application intact while the new foundation is developed.
2. Build Season 2 in separate directories and on a dedicated branch.
3. Define shared contracts before implementing device-control tools.
4. Connect one real tool at a time; never show a device/tool as online unless a health check confirms it.
5. Require explicit confirmation for destructive, privacy-sensitive, financial, or externally visible actions.
6. Keep API secrets out of Git. Use platform-appropriate secure storage and server-side secrets where applicable.
7. Only switch the public entry point after the Season 2 app passes the regression checklist.

## Episode 1 scope

- Establish the Season 2 branch and project boundaries.
- Add shared tool contract and task lifecycle definitions.
- Document the migration and Season 1 preservation checklist.
- No existing Season 1 source files are modified in this episode.

## Validation status

This is a source-level foundation. Native Android, PC agent, backend, and dashboard runtime behavior are not implemented or verified by Episode 1.
