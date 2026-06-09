import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

type ASRPipeline = Awaited<ReturnType<typeof pipeline>>;
let transcriber: ASRPipeline | null = null;

async function init() {
  try {
    transcriber = await pipeline(
      'automatic-speech-recognition',
      'onnx-community/whisper-tiny',
      { device: 'webgpu' as const }
    );
  } catch {
    transcriber = await pipeline(
      'automatic-speech-recognition',
      'onnx-community/whisper-tiny',
      { device: 'wasm' as const }
    );
  }
  self.postMessage({ type: 'ready' });
}

self.onmessage = async (e: MessageEvent<{ audio: Float32Array }>) => {
  if (!transcriber) {
    self.postMessage({ type: 'error', error: 'Model not loaded yet' });
    return;
  }

  self.postMessage({ type: 'processing' });

  try {
    const result = await (transcriber as (input: Float32Array, opts: object) => Promise<{ text: string }>)(
      e.data.audio,
      {
        chunk_length_s: 30,
        stride_length_s: 5,
        task: 'transcribe',
      }
    );
    self.postMessage({ type: 'success', text: result.text });
  } catch (err) {
    self.postMessage({ type: 'error', error: String(err) });
  }
};

init();

export {};
