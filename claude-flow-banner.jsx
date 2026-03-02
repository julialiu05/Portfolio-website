import { useState, useEffect } from 'react';
import { Claude } from '@lobehub/icons';

export default function ClaudeFlowBanner() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  return (
    <div className="banner-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,500&display=swap');
        
        .banner-wrapper {
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          font-family: 'DM Sans', -apple-system, sans-serif;
        }
        
        .banner {
          position: relative;
          width: 800px;
          height: 260px;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 4px 40px rgba(0, 0, 0, 0.06);
        }
        
        /* Animated Gradient Blobs */
        .gradient-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          filter: blur(60px);
          opacity: 0.6;
        }
        
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(20px);
        }
        
        .blob-1 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #d97757 0%, transparent 70%);
          top: -100px;
          left: -50px;
          animation: float-1 8s ease-in-out infinite;
        }
        
        .blob-2 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, #e8a090 0%, transparent 70%);
          bottom: -80px;
          left: 20%;
          animation: float-2 10s ease-in-out infinite;
        }
        
        .blob-3 {
          width: 280px;
          height: 280px;
          background: radial-gradient(circle, #4a9eff 0%, transparent 70%);
          top: -60px;
          right: -50px;
          animation: float-3 9s ease-in-out infinite;
        }
        
        .blob-4 {
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, #7bb8ff 0%, transparent 70%);
          bottom: -100px;
          right: 15%;
          animation: float-4 11s ease-in-out infinite;
        }
        
        .blob-5 {
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(217, 119, 87, 0.4) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: float-center 7s ease-in-out infinite;
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, 20px) scale(1.1); }
          66% { transform: translate(-20px, 30px) scale(0.95); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, -20px) scale(1.05); }
          66% { transform: translate(35px, -10px) scale(1.1); }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 25px) scale(1.1); }
          66% { transform: translate(20px, 15px) scale(0.95); }
        }
        
        @keyframes float-4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(25px, -30px) scale(1.05); }
          66% { transform: translate(-15px, -20px) scale(1.1); }
        }
        
        @keyframes float-center {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.8; }
        }
        
        /* Content */
        .content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 28px;
        }
        
        .claude-logo {
          opacity: ${isLoaded ? 1 : 0};
          transform: ${isLoaded ? 'translateY(0)' : 'translateY(10px)'};
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .x-mark {
          font-size: 28px;
          font-weight: 300;
          color: rgba(0, 0, 0, 0.25);
          opacity: ${isLoaded ? 1 : 0};
          transition: opacity 0.6s ease 0.15s;
        }
        
        .flow-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 48px;
          font-weight: 500;
          letter-spacing: -1px;
          color: #1a1a1a;
          opacity: ${isLoaded ? 1 : 0};
          transform: ${isLoaded ? 'translateY(0)' : 'translateY(10px)'};
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
          font-style: italic;
        }
        
        /* Subtle noise overlay */
        .noise {
          position: absolute;
          inset: 0;
          opacity: 0.02;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          pointer-events: none;
        }
      `}</style>
      
      <div className="banner">
        <div className="gradient-bg">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          <div className="blob blob-4" />
          <div className="blob blob-5" />
        </div>
        
        <div className="noise" />
        
        <div className="content">
          <div className="claude-logo">
            <Claude.Combine size={56} type="color" />
          </div>
          <span className="x-mark">×</span>
          <span className="flow-text">Flow</span>
        </div>
      </div>
    </div>
  );
}
