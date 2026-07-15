import { useState, useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Phone, User, ArrowRight, Scan, X } from 'lucide-react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
}

export function LoginPage() {
  const [stars, setStars] = useState<Star[]>([]);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showWechatModal, setShowWechatModal] = useState(false);
  const [wechatStatus, setWechatStatus] = useState<'qrcode' | 'scanning' | 'success'>('qrcode');
  
  const login = useAppStore((state) => state.login);

  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      for (let i = 0; i < 100; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          delay: Math.random() * 5,
          duration: Math.random() * 3 + 2
        });
      }
      setStars(newStars);
    };
    generateStars();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleGetCode = () => {
    if (!phone || phone.length !== 11) {
      alert('请输入正确的手机号');
      return;
    }
    setCountdown(60);
    setShowCode(true);
  };

  const handleLogin = () => {
    if (!phone || phone.length !== 11) {
      alert('请输入正确的手机号');
      return;
    }
    if (showCode && !code) {
      alert('请输入验证码');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      login(phone);
      setIsLoading(false);
    }, 1000);
  };

  const handleGuestLogin = () => {
    login('guest');
  };

  const handleWechatLogin = () => {
    setShowWechatModal(true);
    setWechatStatus('qrcode');
  };

  const handleScanWechat = () => {
    setWechatStatus('scanning');
    
    setTimeout(() => {
      setWechatStatus('success');
      setTimeout(() => {
        const wechatPhone = '13800138000';
        login(wechatPhone);
        setShowWechatModal(false);
      }, 1500);
    }, 2500);
  };

  const closeWechatModal = () => {
    setShowWechatModal(false);
    setWechatStatus('qrcode');
  };

  return (
    <div className="relative min-h-screen bg-[#0A1628] overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D1F3C] to-[#0A1628]"></div>
      
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-[#D4A853] animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            boxShadow: `0 0 ${star.size * 2}px rgba(212, 168, 83, 0.2)`
          }}
        />
      ))}

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-[#D4A853] rounded-full opacity-20 blur-xl animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-[#D4A853] to-[#C73E3A] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl">传</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            小传
          </h1>
          <p className="text-lg text-[#D4A853]" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            让平凡的人生，在时光里闪耀
          </p>
        </div>

        <div className="w-full max-w-sm bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
          <div className="space-y-6">
            <div>
              <label className="block text-white/70 text-sm mb-2">手机号</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="请输入手机号"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A853] transition-colors"
                />
              </div>
            </div>

            {showCode && (
              <div>
                <label className="block text-white/70 text-sm mb-2">验证码</label>
                <div className="relative">
                  <input
                    type={countdown > 0 ? 'tel' : 'text'}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="请输入验证码"
                    className="w-full pl-4 pr-32 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A853] transition-colors"
                  />
                  <button
                    onClick={handleGetCode}
                    disabled={countdown > 0}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-white/10 rounded-lg text-white/70 text-sm hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#D4A853] to-[#C73E3A] rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-[0_0_20px_rgba(212,168,83,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>登录</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              onClick={() => setShowCode(!showCode)}
              className="w-full text-center text-white/50 text-sm hover:text-white/70 transition-colors"
            >
              {showCode ? '返回使用游客登录' : '没有账号？使用手机号登录'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={handleWechatLogin}
              className="w-full py-3 bg-[#07C160] rounded-xl text-white font-medium hover:bg-[#06AD56] transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Scan className="w-5 h-5" />
              <span>微信扫码登录</span>
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGuestLogin}
              className="w-full py-3 bg-white/5 border border-white/20 rounded-xl text-white/70 font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>游客模式体验</span>
            </button>
          </div>
        </div>

        <p className="mt-8 text-xs text-white/30 text-center">
          登录即表示同意《用户协议》和《隐私政策》
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0A1628] to-transparent"></div>

      {showWechatModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-[#07C160] px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">微信扫码登录</h3>
              <button onClick={closeWechatModal} className="text-white/80 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-gray-600">使用微信扫描二维码登录</p>
              </div>
              
              <div className="relative">
                {wechatStatus === 'qrcode' && (
                  <div className="w-64 h-64 mx-auto bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-lg shadow-md overflow-hidden">
                        <img 
                          src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://frankfang99.github.io/xiaozhuan-biography-app/login" 
                          alt="微信登录二维码" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm text-gray-500">扫码即可登录</p>
                    </div>
                  </div>
                )}
                
                {wechatStatus === 'scanning' && (
                  <div className="w-64 h-64 mx-auto bg-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-[#07C160] rounded-full flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                      <p className="text-[#07C160] font-medium">正在验证...</p>
                      <p className="text-sm text-gray-500 mt-2">请在手机上确认登录</p>
                    </div>
                  </div>
                )}
                
                {wechatStatus === 'success' && (
                  <div className="w-64 h-64 mx-auto bg-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-[#07C160] rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-[#07C160] font-bold">登录成功</p>
                      <p className="text-sm text-gray-500 mt-2">正在跳转...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {wechatStatus === 'qrcode' && (
                <button
                  onClick={handleScanWechat}
                  className="w-full mt-6 py-3 bg-[#07C160] rounded-xl text-white font-medium hover:bg-[#06AD56] transition-colors"
                >
                  模拟扫码登录
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}