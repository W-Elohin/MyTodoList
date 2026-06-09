import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * 全域錯誤邊界。
 * 任何子樹渲染期間拋出的例外都會被攔截，顯示 Ocean 風格的回復畫面，
 * 而非讓整個 App 白屏。提供「重新載入」讓使用者快速回復。
 *
 * 注意：Error Boundary 只攔截「渲染、生命週期、建構子」中的錯誤，
 * 不攔截事件處理器與非同步程式碼 — 那些仍需各自 try/catch。
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // 集中記錄，未來可接上遠端錯誤回報服務（Sentry 等）
    console.error('[ErrorBoundary] 攔截到未處理的渲染錯誤', error, info.componentStack);
  }

  private handleReload = (): void => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--ocean-gradient)',
          color: '#f0f9ff',
        }}
      >
        <div style={{ fontSize: '3rem' }} aria-hidden>
          🌊
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
          海面起了點波瀾
        </h1>
        <p style={{ color: '#94a3b8', maxWidth: '24rem', margin: 0, lineHeight: 1.6 }}>
          畫面遇到了意外的錯誤，但你的資料安全地保存在本機。
          重新載入即可回到平靜的海面。
        </p>
        <button
          onClick={this.handleReload}
          style={{
            marginTop: '0.5rem',
            padding: '0.625rem 1.5rem',
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,0.25)',
            background: '#0ea5e9',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          重新載入
        </button>
      </div>
    );
  }
}
