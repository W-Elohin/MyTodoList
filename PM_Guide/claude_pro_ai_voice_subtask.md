# Claude Pro Feature: Local AI Voice Engine + Subtask System

## Implemented Files

| File | Role |
|------|------|
| `src/app/workers/whisper.worker.ts` | Web Worker — loads Whisper Tiny ONNX model, transcribes Float32 audio |
| `src/app/hooks/useWhisper.ts` | React hook — manages Worker lifecycle, MediaRecorder, audio pipeline |
| `src/app/utils/nlpParser.ts` | NLP intent parser — extracts date/priority from natural language |
| `src/app/types.ts` | Added `SubTask` interface and `subtasks` field on `Todo` |
| `src/app/components/SubTaskList.tsx` | Subtask list UI — toggle, add, delete with Framer Motion animations |
| `src/app/components/AddTodoDialog.tsx` | Integrated SubTaskList + voice already wired via `useWhisper` |
| `src/app/pages/TodoList.tsx` | Added subtask progress badge + expandable SubTaskList per card |
| `vite.config.ts` | Added `worker: { format: 'es' }` for HuggingFace Transformers compatibility |

---

## useWhisper Hook API

```ts
const {
  isReady,       // boolean — Whisper model loaded and ready
  isLoading,     // boolean — model downloading / initializing
  isRecording,   // boolean — microphone is active
  isProcessing,  // boolean — audio is being transcribed
  transcript,    // string  — latest transcription result
  error,         // string | null — last error message
  startRecording, // () => Promise<void> — request mic + start recording
  stopRecording,  // () => void — stop recording, auto-sends audio to Worker
  setTranscript,  // Dispatch<SetStateAction<string>> — manually set/clear
} = useWhisper();
```

**Lifecycle**: Worker is initialized lazily on the first `startRecording()` call to avoid loading a 500 KB+ bundle for users who never use voice input. The Whisper model is cached in the browser via `env.useBrowserCache = true`, so subsequent loads are instant.

**Device fallback**: Tries WebGPU first (hardware-accelerated), falls back to WASM automatically.

**Audio pipeline**: `getUserMedia → MediaRecorder → Blob → AudioContext(16kHz) → Float32Array → Worker`.

---

## nlpParser Rules

```ts
parseIntent(rawText: string): { cleanedContent, date?, priority? }
```

| Input pattern | Effect |
|---------------|--------|
| `今天` / `今日` / `きょう` | `date` = today |
| `明天` / `明日` / `あした` | `date` = tomorrow |
| `後天` / `明後日` / `あさって` | `date` = day after tomorrow |
| `下週一`~`下週日` / `来週月曜日`~`来週日曜日` | `date` = next week's target day |
| `重要` / `高優先` / `高优先` / `緊急` / `urgent` / `important` | `priority = 'high'` |
| `中優先` / `普通` / `normal` / `中等` | `priority = 'medium'` |
| `低優先` / `優先度低` | `priority = 'low'` |

All matched keywords are stripped from `cleanedContent`. If nothing remains, the original text is returned unchanged as a safety fallback.

---

## SubTask Data Structure

```ts
// src/app/types.ts
export interface SubTask {
  id: string;        // `${Date.now()}-${random}` to avoid collisions
  content: string;
  completed: boolean;
}

// Added to Todo:
subtasks?: SubTask[];
```

SubTasks are serialized inline inside each `Todo` object in `localStorage` — no schema migration needed.

---

## Technical Decisions & Issues

### Worker bundling with @huggingface/transformers
`@huggingface/transformers` requires ES module workers. Added `worker: { format: 'es' }` to `vite.config.ts`. Without this, the WASM imports inside the library fail at runtime with `Cannot use import statement in worker`.

### WASM bundle size
The ONNX WASM runtime (`ort-wasm-simd-threaded.asyncify.wasm`) is ~23 MB uncompressed, ~5.7 MB gzipped. This is a one-time download, cached by the browser. It only loads when the user initiates voice input (lazy Worker init).

### Subtask progress in card
Progress is shown as a clickable badge (`X/Y 完成`) only when subtasks exist. Clicking toggles an `expandedId` state — only one card expands at a time to keep the list readable.

### Whisper language detection
No `language` parameter is passed to the pipeline — Whisper auto-detects the language from the first ~30 seconds of audio. This supports Chinese, Japanese, English, and other languages without configuration.
