'use client';

export default function LoadingScreen() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#ffffff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <style>{`
        .st-loader {
          width: 13em;
          height: 3em;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .st-loader p {
          font-size: 1.25em;
          font-weight: 600;
          letter-spacing: 0.1em;
          margin: 0;
          position: relative;
          color: #cbd5e1;
        }
        .st-arrows {
          width: 1.75em;
          height: 2em;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.5em;
          margin-left: 0.5em;
        }
        .st-arrow1, .st-arrow2, .st-arrow3, .st-arrow4 {
          width: 0.75em;
          height: 0.75em;
          background-color: #f1f5f9;
        }
        .st-arrowsup, .st-arrowsbottom {
          width: 100%;
          height: 25%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .st-arrow1 {
          clip-path: polygon(100% 0%, 100% 0%, 100% 100%, 0% 100%);
          animation: st-glow 2s ease-in-out infinite;
          --arrow-color: #2563eb;
          --arrow-shadow: rgba(37, 99, 235, 0.3);
        }
        .st-arrow2 {
          clip-path: polygon(0% 0%, 0% 0%, 100% 100%, 0% 100%);
          animation: st-glow 2s ease-in-out infinite 0.5s;
          --arrow-color: #0ea5e9;
          --arrow-shadow: rgba(14, 165, 233, 0.3);
        }
        .st-arrow3 {
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 0%);
          animation: st-glow 2s ease-in-out infinite 1.5s;
          --arrow-color: #8b5cf6;
          --arrow-shadow: rgba(139, 92, 246, 0.3);
        }
        .st-arrow4 {
          clip-path: polygon(0% 0%, 100% 0%, 0% 100%, 0% 100%);
          animation: st-glow 2s ease-in-out infinite 1s;
          --arrow-color: #14b8a6;
          --arrow-shadow: rgba(20, 184, 166, 0.3);
        }
        .st-loader p:nth-child(1) { --active-color: #2563eb; animation: st-wave 2s ease-in-out infinite 0s; }
        .st-loader p:nth-child(2) { --active-color: #0ea5e9; animation: st-wave 2s ease-in-out infinite 0.1s; }
        .st-loader p:nth-child(3) { --active-color: #06b6d4; animation: st-wave 2s ease-in-out infinite 0.2s; }
        .st-loader p:nth-child(4) { --active-color: #14b8a6; animation: st-wave 2s ease-in-out infinite 0.3s; }
        .st-loader p:nth-child(5) { --active-color: #6366f1; animation: st-wave 2s ease-in-out infinite 0.4s; }
        .st-loader p:nth-child(6) { --active-color: #8b5cf6; animation: st-wave 2s ease-in-out infinite 0.5s; }
        .st-loader p:nth-child(7) { --active-color: #a855f7; animation: st-wave 2s ease-in-out infinite 0.6s; }
        @keyframes st-glow {
          0% { background-color: #f1f5f9; box-shadow: 0 0 0 rgba(0,0,0,0); }
          50% { background-color: var(--arrow-color); box-shadow: 0 0 8px var(--arrow-shadow); }
          100% { background-color: #f1f5f9; box-shadow: 0 0 0 rgba(0,0,0,0); }
        }
        @keyframes st-wave {
          0%, 100% { color: #cbd5e1; transform: translateY(0); }
          50% { color: var(--active-color); transform: translateY(-3px); }
        }
      `}</style>
      <div className="st-loader">
        <p>L</p><p>O</p><p>A</p><p>D</p><p>I</p><p>N</p><p>G</p>
        <div className="st-arrows">
          <div className="st-arrowsup">
            <div className="st-arrow1" /><div className="st-arrow2" />
          </div>
          <div className="st-arrowsbottom">
            <div className="st-arrow3" /><div className="st-arrow4" />
          </div>
        </div>
      </div>
    </div>
  );
}
