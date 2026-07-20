import { useEffect, useRef } from 'react';
import { User, Code } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  avatar: React.ReactNode;
}

export function Team() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-reveal');
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const members: TeamMember[] = [
    { name: 'Frank Fang', role: '产品负责人', avatar: <User className="w-10 h-10 text-white" /> },
    { name: 'Developer', role: '全栈开发', avatar: <Code className="w-10 h-10 text-white" /> },
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-bg-page" id="team">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <span className="inline-block text-accent-green text-sm tracking-[0.3em] font-semibold uppercase mb-4">团队</span>
        <h2 className="text-3xl md:text-4xl font-bold text-black mb-3">
          用爱与匠心，守护每一份记忆
        </h2>
        <p className="text-black/70 mb-12">
          我们相信，每一个平凡的人生都值得被铭记，每一段珍贵的回忆都值得被传承
        </p>
        
        <div className="flex justify-center gap-12 flex-wrap">
          {members.map((member, index) => (
            <div key={index} className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-gold to-brand-gold-light rounded-full flex items-center justify-center text-4xl mb-5 shadow-[0_6px_24px_rgba(212,168,83,0.2)]">
                {member.avatar}
              </div>
              <h4 className="text-lg font-semibold text-black mb-2">{member.name}</h4>
              <p className="text-sm text-black/50">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
