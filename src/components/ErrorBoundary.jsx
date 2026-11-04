import React from 'react';

// Never show a blank page: on a crash, explain and offer to reset the saved app data.
export default class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('VisionEx crashed:', error, info); }
  reset = () => { Object.keys(localStorage).filter(k => k.startsWith('visionex-')).forEach(k => localStorage.removeItem(k)); window.location.reload(); };
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen grid place-items-center p-6 bg-ground">
        <div className="card max-w-[560px] w-full p-7 text-center">
          <div className="text-5xl">⚠️</div>
          <div className="text-xl font-bold mt-3">Something went wrong / เกิดข้อผิดพลาด</div>
          <div className="text-sm text-muted mt-2">The page crashed. Reloading usually fixes it. If it keeps happening, reset the saved app data (animals, cameras, tasks, settings).</div>
          <pre className="mt-4 text-left text-[11px] bg-[#FDEAEA] text-[#C0392B] rounded-lg p-3 overflow-auto max-h-32">{String(this.state.error?.message || this.state.error)}</pre>
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            <button onClick={() => window.location.reload()} className="px-4 py-2.5 rounded-[10px] bg-ocean text-white text-sm font-semibold">Reload / โหลดใหม่</button>
            <button onClick={this.reset} className="px-4 py-2.5 rounded-[10px] bg-[#FDEAEA] text-[#C0392B] text-sm font-semibold">Reset app data / ล้างข้อมูลแอป</button>
          </div>
        </div>
      </div>
    );
  }
}
