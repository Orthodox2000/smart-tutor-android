export default function Loading() {
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
        .loader {
          width: 13em;
          height: 3em;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .loader p {
          font-size: 1.25em;
          font-weight: 600;
          letter-spacing: 0.1em;
          margin: 0;
          position: relative;
          color: #cbd5e1;
        }
        .arrows {
          width: 1.75em;
          height: 2em;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.5em;
          margin-left: 0.5em;
        }
        .arrow1, .arrow2, .arrow3, .arrow4 {
          width: 0.75em;
          height: 0.75em;
          background-color: #f1f5f9;
        }
        .arrowsup, .arrowsbottom {
          width: 100%;
          height: 25%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .arrow1 {
          clip-path: polygon(100% 0%, 100% 0%, 100% 100%, 0% 100%);
          animation: professionalGlow 2s ease-in-out infinite;
          --arrow-color: #2563eb;
          --arrow-shadow: rgba(37, 99, 235, 0.3);
        }
        .arrow2 {
          clip-path: polygon(0% 0%, 0% 0%, 100% 100%, 0% 100%);
          animation: professionalGlow 2s ease-in-out infinite 0.5s;
          --arrow-color: #0ea5e9;
          --arrow-shadow: rgba(14, 165, 233, 0.3);
        }
        .arrow3 {
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 0%);
          animation: professionalGlow 2s ease-in-out infinite 1.5s;
          --arrow-color: #8b5cf6;
          --arrow-shadow: rgba(139, 92, 246, 0.3);
        }
        .arrow4 {
          clip-path: polygon(0% 0%, 100% 0%, 0% 100%, 0% 100%);
          animation: professionalGlow 2s ease-in-out infinite 1s;
          --arrow-color: #14b8a6;
          --arrow-shadow: rgba(20, 184, 166, 0.3);
        }
        .loader p:nth-child(1) { --active-color: #2563eb; animation: subtleWave 2s ease-in-out infinite 0s; }
        .loader p:nth-child(2) { --active-color: #0ea5e9; animation: subtleWave 2s ease-in-out infinite 0.1s; }
        .loader p:nth-child(3) { --active-color: #06b6d4; animation: subtleWave 2s ease-in-out infinite 0.2s; }
        .loader p:nth-child(4) { --active-color: #14b8a6; animation: subtleWave 2s ease-in-out infinite 0.3s; }
        .loader p:nth-child(5) { --active-color: #6366f1; animation: subtleWave 2s ease-in-out infinite 0.4s; }
        .loader p:nth-child(6) { --active-color: #8b5cf6; animation: subtleWave 2s ease-in-out infinite 0.5s; }
        .loader p:nth-child(7) { --active-color: #a855f7; animation: subtleWave 2s ease-in-out infinite 0.6s; }
        @keyframes professionalGlow {
          0% { background-color: #f1f5f9; box-shadow: 0 0 0 rgba(0,0,0,0); }
          50% { background-color: var(--arrow-color); box-shadow: 0 0 8px var(--arrow-shadow); }
          100% { background-color: #f1f5f9; box-shadow: 0 0 0 rgba(0,0,0,0); }
        }
        @keyframes subtleWave {
          0%, 100% { color: #cbd5e1; transform: translateY(0); }
          50% { color: var(--active-color); transform: translateY(-3px); }
        }
      `}</style>
      <div className="loader">
        <p>L</p>
        <p>O</p>
        <p>A</p>
        <p>D</p>
        <p>I</p>
        <p>N</p>
        <p>G</p>
        <div className="arrows">
          <div className="arrowsup">
            <div className="arrow1"></div>
            <div className="arrow2"></div>
          </div>
          <div className="arrowsbottom">
            <div className="arrow3"></div>
            <div className="arrow4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
