import { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';

export function LoginPage() {
  const [nickName, setNickName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const setGoal = useAppStore((state) => state.setGoal);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setIsLoading(true);
    
    setTimeout(() => {
      const userInfo = {
        nickName: nickName.trim() || '小传用户',
        avatarUrl: avatarUrl || '',
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

  return (
    <div className="min-h-screen relative flex flex-col items-center overflow-hidden">
      <img 
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        alt="background"
      />
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-[rgba(2,4,16,0.7)] via-[rgba(7,11,31,0.85)] to-[rgba(3,5,18,0.95)]" />
      
      <div className="flex-1 flex flex-col items-center justify-center w-full z-2 px-6 py-12">
        <div className="flex flex-col items-center mb-12">
          <div className="w-32 h-32 rounded-[32rpx] overflow-hidden mb-6 shadow-lg border-2 border-[rgba(212,168,83,0.3)]">
            <img src="./biographer.jpg" alt="小传" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-wider" style={{ fontFamily: 'Noto Serif SC, serif' }}>小传</h1>
          <p className="text-sm text-white/50 tracking-wider">您的专属传记作者</p>
        </div>
        
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[rgba(212,168,83,0.6)] to-transparent mb-8" />
        
        <p className="text-lg text-white/70 text-center max-w-xs tracking-wider leading-relaxed">
          把人生故事讲给孩子听
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-4 px-6 pb-12 z-2">
        <div className="flex flex-col items-center gap-4 w-full mb-2">
          <label 
            className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
          >
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarUpload}
              className="hidden"
            />
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[rgba(212,168,83,0.2)] to-[rgba(212,168,83,0.05)] flex items-center justify-center">
                <span className="text-4xl opacity-60">👤</span>
              </div>
            )}
          </label>
          
          <input
            type="text"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            placeholder="请输入昵称"
            className="w-full h-16 bg-white/5 border border-white/10 rounded-full px-6 text-center text-white placeholder-white/30 focus:outline-none focus:border-[#D4A853] transition-colors"
            maxLength={10}
          />
        </div>
        
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className={`w-full h-16 flex items-center justify-center gap-3 rounded-full font-semibold text-white transition-all ${
            isLoading 
              ? 'bg-[rgba(7,193,96,0.4)] cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#07c160] to-[#06ad56] shadow-[0_12rpx_36rpx_rgba(7,193,96,0.35)] hover:shadow-[0_16rpx_40rpx_rgba(7,193,96,0.4)] active:scale-98'
          }`}
        >
          <div className="w-8 h-8">
            <div className="w-full h-full bg-white/20 rounded-full relative flex items-center justify-center">
              <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full" />
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
          <span className="text-lg font-semibold">微信授权登录</span>
        </button>
        
        <p className="text-xs text-white/35">
          登录即表示同意
          <span className="text-[rgba(212,168,83,0.6)]">《用户协议》</span>
          和
          <span className="text-[rgba(212,168,83,0.6)]">《隐私政策》</span>
        </p>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-white/20 border-t-[#D4A853] rounded-full animate-spin mb-4" />
            <p className="text-white">登录中...</p>
          </div>
        </div>
      )}
    </div>
  );
}