# Claude Pro 任務指示：本地端 AI 語音引擎 + 子任務系統

## 角色
你是本專案的「AI 基礎建設工程師」，擁有 Terminal 操作權限。

## 專案背景
這是一個 React + Vite + TailwindCSS 的 PWA Todo App。套件管理器是 **pnpm**。
目標：超越 Todoist，引入本地端 AI 語音轉文字 + 子任務 (Sub-task) 系統。

## 目前技術現況
- 資料儲存：`localStorage`，透過 `src/app/utils/storage.ts` 封裝（`storage.getTodos()`, `storage.saveTodos()`, `storage.getCategories()`, `storage.saveCategories()`）
- 資料模型 (`src/app/types.ts`)：
```ts
export interface TodoCategory { id: string; name: string; color: string; }
export interface Todo {
  id: string; content: string; date: string; time: string;
  duration?: number; category?: TodoCategory;
  priority?: 'low' | 'medium' | 'high'; tags?: TodoCategory[];
  completed: boolean; createdAt: number; completedAt?: number;
}
```
- 動畫庫：`motion` (Framer Motion)，import 方式為 `from 'motion/react'`
- 圖標庫：`lucide-react`
- 路由：`react-router` v7 (`createBrowserRouter`)
- 目前路由：`/` (TodoList), `/my-day` (MyDayPage), `/calendar`, `/timeline`, `/archive`
- 目前 BottomNav：今日 / リスト / カレンダー / タイムライン

## 第一步：Git 分支
```bash
cd /Users/ne/Desktop/Projects/MyTodoList
git checkout main
git checkout -b claude-pro/feature-ai-voice-subtask
```

## 任務 A：本地端 AI 語音轉文字引擎

### A1. 安裝套件
```bash
pnpm add @huggingface/transformers
```

### A2. 建立 Web Worker (`src/app/workers/whisper.worker.ts`)
- 使用 `pipeline('automatic-speech-recognition', 'onnx-community/whisper-tiny')` 初始化
- 優先使用 `device: 'webgpu'`，若失敗 fallback 到 `device: 'wasm'`
- 設定 `env.allowLocalModels = false; env.useBrowserCache = true;`
- Worker 透過 `self.postMessage` 回報狀態：`ready` / `processing` / `success` / `error`
- 收到主執行緒傳來的 Float32Array 音訊後，呼叫 pipeline 進行轉錄
- 設定 `chunk_length_s: 30`, `stride_length_s: 5`, `task: 'transcribe'`
- **重要**：language 參數不要寫死，讓 Whisper 自動偵測語言（多語言支援）

### A3. 建立 Custom Hook (`src/app/hooks/useWhisper.ts`)
- 使用 `new Worker(new URL('../workers/whisper.worker.ts', import.meta.url), { type: 'module' })` 建立 Worker（Vite 原生支援）
- 整合 `navigator.mediaDevices.getUserMedia({ audio: true })` 取得麥克風
- 使用 `MediaRecorder` 錄音，`onstop` 時將 Blob 轉為 AudioBuffer
- 使用 `AudioContext({ sampleRate: 16000 })` + `decodeAudioData` 轉為 16kHz Float32Array（Whisper 要求）
- 導出狀態：`isReady`, `isRecording`, `isProcessing`, `transcript`, `error`
- 導出方法：`startRecording()`, `stopRecording()`, `setTranscript()`
- 停止錄音後自動釋放麥克風 stream (`stream.getTracks().forEach(t => t.stop())`)

### A4. NLP 智慧解析 (`src/app/utils/nlpParser.ts`)
Todoist 的「自然語言輸入」是其核心賣點，我們要做得更好。建立一個函數：
```ts
interface ParsedIntent {
  cleanedContent: string;    // 移除關鍵字後的任務名稱
  date?: string;             // YYYY-MM-DD
  priority?: 'low' | 'medium' | 'high';
}
export function parseIntent(rawText: string): ParsedIntent;
```
解析規則：
- 「明天」→ 計算明天日期
- 「今天」→ 今天日期
- 「後天」→ 後天日期
- 「下週一」~「下週日」→ 計算下週對應星期
- 「重要」「高優先」「緊急」→ priority: 'high'
- 「普通」→ priority: 'medium'
- 最終回傳 cleanedContent 應該去除這些關鍵字，只留下真正的任務描述

### A5. Vite 設定更新 (`vite.config.ts`)
在 `defineConfig` 中確保 worker 可被正確打包。若 build 報錯 `Cannot resolve "@huggingface/transformers" from worker`，需要在 `build.rollupOptions.external` 中排除，或在 `worker` 選項中設定 `format: 'es'`。請自行測試並修復。

## 任務 B：子任務系統 (Sub-tasks)

Todoist 的子任務是其核心功能，我們必須實現。

### B1. 更新資料模型 (`src/app/types.ts`)
在 `Todo` interface 中加入：
```ts
subtasks?: SubTask[];
```
新增：
```ts
export interface SubTask {
  id: string;
  content: string;
  completed: boolean;
}
```

### B2. 更新 Storage (`src/app/utils/storage.ts`)
不需要改結構，因為 `subtasks` 會自動隨 Todo 物件一起序列化到 localStorage。但請確認 `saveTodos` 和 `getTodos` 仍正確運作。

### B3. 建立子任務元件 (`src/app/components/SubTaskList.tsx`)
- Props：`subtasks: SubTask[]`, `onToggle(id: string)`, `onAdd(content: string)`, `onDelete(id: string)`
- 顯示每個子任務為一行：勾選框 + 文字 + 刪除按鈕
- 底部有一個小型輸入框 + 「+」按鈕來新增子任務
- 使用 Framer Motion 做進出動畫
- 已完成的子任務文字加上刪除線

### B4. 整合到 AddTodoDialog (`src/app/components/AddTodoDialog.tsx`)
- 在表單底部（提交按鈕上方）加入 SubTaskList
- 新增/編輯時都要能管理子任務
- `onAdd` 的 callback 參數需要新增 `subtasks?: SubTask[]`

### B5. 整合到 TodoList (`src/app/pages/TodoList.tsx`)
- 在每個任務卡片中，若有子任務則顯示進度（例如「2/5 完成」）
- 點擊任務卡片可展開顯示子任務清單，可直接勾選

## 任務 C：PM 文件與版本控制

### C1. 撰寫 PM 文件
建立 `PM_Guide/claude_pro_ai_voice_subtask.md`，記錄：
- 你實作了哪些檔案
- useWhisper hook 的 API（參數與回傳值）
- nlpParser 的解析規則
- SubTask 的資料結構
- 遇到的技術問題與解決方案

### C2. Git 版本控制
```bash
git add .
git commit -m "feat: add local AI whisper engine, NLP parser, and subtask system"
```
如果修改量大，可以分多次 commit（例如 AI 語音一次、子任務一次）。

## 注意事項
- 不要碰 `BottomNav.tsx` 和 `routes.ts`，那是其他 AI 的工作範圍
- 確保 `pnpm run build` 能通過（若有 TypeScript 報錯，請修復）
- 所有新增的檔案都要有正確的 TypeScript 型別
