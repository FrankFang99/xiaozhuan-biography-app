import { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import biographerImage from '../assets/biographer_avatar.jpg';

export function LoginPage() {
  const [nickName, setNickName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const setGoal = useAppStore((state) => state.setGoal);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = () => {
    if (!agreed) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const userInfo = {
        nickName: nickName.trim() || '小传用户',
        avatarUrl: avatarUrl,
        phone: '',
        loginType: 'wechat' as const,
      };

      setCurrentUser(userInfo);
      
      const savedGoal = localStorage.getItem('goal');
      if (savedGoal) {
        try {
          setGoal(JSON.parse(savedGoal));
          setCurrentPage('chat');
        } catch {
          setCurrentPage('onboarding');
        }
      } else {
        setCurrentPage('onboarding');
      }
      
      setIsLoading(false);
    }, 1500);
  };

  const handleGuestLogin = () => {
    setCurrentUser({
      nickName: '游客朋友',
      avatarUrl: '',
      phone: 'guest',
      loginType: 'anonymous'
    });
    setCurrentPage('letterbox');
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, rgba(2, 4, 16, 0.7) 0%, rgba(7, 11, 31, 0.85) 40%, rgba(3, 5, 18, 0.95) 100%)'
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/5 animate-pulse"
              style={{
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 5 + 's',
                animationDuration: Math.random() * 3 + 2 + 's'
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full px-6 z-10 py-16">
        <div className="flex flex-col items-center mb-12">
          <div className="w-25 h-25 rounded-[32rpx] overflow-hidden mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border-2 border-[rgba(212,168,83,0.3)]">
            <img src={biographerImage} alt="小传" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Noto Serif SC, serif', letterSpacing: '8px' }}>小传</h1>
          <p className="text-sm text-white/50" style={{ letterSpacing: '4px' }}>您的专属传记作者</p>
        </div>

        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[rgba(212,168,83,0.6)] to-transparent mb-10" />

        <p className="text-lg text-white/70 text-center max-w-md leading-relaxed" style={{ letterSpacing: '4px' }}>
          把人生故事讲给孩子听
        </p>
      </div>

      <div className="w-full max-w-sm px-6 pb-12 z-10">
        <div className="flex flex-col items-center gap-6 mb-4">
          <label 
            className="w-20 h-20 rounded-full bg-white/5 border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/10 hover:border-[rgba(212,168,83,0.5)] transition-all"
            htmlFor="avatar-upload"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="头像" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[rgba(212,168,83,0.2)] to-[rgba(212,168,83,0.05)] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/60 rounded-full relative">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white/60 rounded-full" />
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-2.5 border-2 border-white/60 rounded-b-lg border-t-0" />
                </div>
              </div>
            )}
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          <input
            type="text"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            placeholder="请输入昵称"
            className="w-full h-12 bg-white/5 border border-white/10 rounded-full px-6 text-white placeholder-white/30 text-center focus:outline-none focus:border-[rgba(212,168,83,0.5)] transition-colors"
            maxLength={10}
          />
        </div>

        <div className="flex items-center gap-2 px-2 mb-6">
          <button
            onClick={() => setAgreed(!agreed)}
            className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
              agreed 
                ? 'bg-gradient-to-br from-[#D4A853] to-[#C73E3A]' 
                : 'border-2 border-white/30'
            }`}
          >
            {agreed && <span className="text-white text-sm font-bold">✓</span>}
          </button>
          <span className="text-xs text-white/40 flex-1 leading-relaxed">
            我已阅读并同意
            <span className="text-[rgba(212,168,83,0.6)]">《用户协议》</span>
            和
            <span className="text-[rgba(212,168,83,0.6)]">《隐私政策》</span>
          </span>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading || !agreed}
          className={`w-full h-14 rounded-full flex items-center justify-center gap-3 font-bold text-base transition-all ${
            isLoading || !agreed
              ? 'bg-[rgba(7,193,96,0.4)] cursor-not-allowed'
              : 'bg-gradient-to-r from-[#07c160] to-[#06ad56] shadow-[0_4px_14px_rgba(7,193,96,0.35)] hover:shadow-[0_6px_20px_rgba(7,193,96,0.4)] active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-white">登录中...</span>
            </>
          ) : (
            <>
              <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                <span className="absolute w-2 h-2 bg-white rounded-full" style={{ top: '6px', left: '6px' }} />
                <span className="absolute w-2 h-2 bg-white rounded-full" style={{ top: '6px', right: '6px' }} />
                <span className="absolute w-2 h-2 bg-white rounded-full" style={{ bottom: '8px', left: '50%', transform: 'translateX(-50%)' }} />
              </div>
              <span className="text-white">微信授权登录</span>
            </>
          )}
        </button>

        <button
          onClick={handleGuestLogin}
          className="w-full h-10 text-white/40 text-sm hover:text-white/60 transition-colors mt-4"
        >
          游客模式进入
        </button>
      </div>
    </div>
  );
}