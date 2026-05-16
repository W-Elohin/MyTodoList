import { useState, useRef } from 'react';

type WorkerMessage =
  | { type: 'ready' }
  | { type: 'processing' }
  | { type: 'success'; text: string }
  | { type: 'error'; error: string };

export function useWhisper() {
  const [isReady, setIsReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const ensureWorker = () => {
    if (workerRef.current) return;

    setIsLoading(true);
    const worker = new Worker(
      new URL('../workers/whisper.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const msg = e.data;
      if (msg.type === 'ready') {
        setIsReady(true);
        setIsLoading(false);
      } else if (msg.type === 'processing') {
        setIsProcessing(true);
      } else if (msg.type === 'success') {
        setTranscript(msg.text.trim());
        setIsProcessing(false);
      } else if (msg.type === 'error') {
        setError(msg.error);
        setIsProcessing(false);
        setIsLoading(false);
      }
    };

    workerRef.current = worker;
  };

  const startRecording = async () => {
    ensureWorker();
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();

        const audioCtx = new AudioContext({ sampleRate: 16000 });
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const float32 = audioBuffer.getChannelData(0);
        await audioCtx.close();

        if (workerRef.current) {
          workerRef.current.postMessage({ audio: float32 });
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setError(String(err));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return {
    isReady,
    isLoading,
    isRecording,
    isProcessing,
    transcript,
    error,
    startRecording,
    stopRecording,
    setTranscript,
  };
}
