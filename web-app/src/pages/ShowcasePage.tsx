import { useState } from 'react';

interface StoryChapter {
  title: string;
  excerpt: string;
  wordCount: number;
  content: string;
}

interface Story {
  id: string;
  name: string;
  bio: string;
  tag: string;
  preview: string;
  chapters: StoryChapter[];
  familyView: {
    title: string;
    content: string;
  };
}

const STORIES: Story[] = [
  {
    id: 'zhangxiulan',
    name: '张秀兰',
    bio: '72岁 · 乡村教师 · 40年教龄',
    tag: '教育人生',
    preview: '1954年，我出生在豫西伏牛山下一个叫槐树湾的小村庄。那时候家里穷，全村只有一个识字的老先生...',
    chapters: [
      {
        title: '第一章 山村里的启蒙',
        excerpt: '七岁那年，村里的土坯房学堂终于开课了。学堂其实就是一间废弃的牛棚，屋顶铺着茅草，窗户上糊着旧报纸...',
        wordCount: 850,
        content: '我出生在1954年，豫西伏牛山下的槐树湾村。那时候家里特别穷，爷爷是个老木匠，父亲跟着爷爷学手艺，母亲操持家务。我们兄妹四个，我排行老二。\n\n七岁那年，村里的土坯房学堂终于开课了。学堂其实就是一间废弃的牛棚，屋顶铺着茅草，窗户上糊着旧报纸。先生是个五十多岁的老头，姓王，是全村唯一识字的人。\n\n第一天上学，我穿着打补丁的粗布衣服，手里攥着母亲用旧布缝的书包，里面装着一个石板和一支石笔。王老师站在门口，手里拿着一把戒尺，脸上却带着慈祥的笑容。'
      },
      {
        title: '第二章 师范岁月',
        excerpt: '1968年秋天，我背着简单的行李，第一次走出了大山，来到了县城。师范学校坐落在县城的东北角...',
        wordCount: 720,
        content: '1968年秋天，我背着简单的行李，第一次走出了大山，来到了县城。师范学校坐落在县城的东北角，是一栋青砖瓦房，在我眼里，那就是世界上最气派的建筑。\n\n师范学校的生活和村里完全不同。我们有宽敞的教室，有整齐的课桌，还有图书馆。我第一次看到那么多书，简直像进了天堂。'
      },
      {
        title: '第三章 土坯房里的第一堂课',
        excerpt: '1972年夏天，我师范毕业了，回到了家乡槐树湾村。那时候村里的小学还是那间土坯房...',
        wordCount: 680,
        content: '1972年夏天，我师范毕业了，回到了家乡槐树湾村。那时候村里的小学还是那间土坯房，条件比我上学的时候好不了多少。\n\n第一天上课，我穿着母亲做的粗布棉袄，手里握着用毛笔写的教案，站在讲台上，望着台下二十多个孩子。'
      }
    ],
    familyView: {
      title: '女儿眼中的母亲',
      content: '小时候总觉得妈妈不关心我，她把所有的时间都给了学生。有一次我生病了，发着高烧，她却在学校给学生补课，直到晚上才回来。我当时特别恨她。\n\n现在我自己也当了妈妈，才理解她的选择。妈妈常说，每个孩子都是一颗种子，只要用心浇灌，总会开花结果。'
    }
  },
  {
    id: 'lijianguo',
    name: '李建国',
    bio: '80岁 · 退伍军人 · 参加过边境保卫战',
    tag: '峥嵘岁月',
    preview: '1946年，我出生在东北吉林省一个叫李家屯的小村庄。那时候还没解放，日本人刚走，国民党又来了...',
    chapters: [
      {
        title: '第一章 东北小村庄的童年',
        excerpt: '1946年，我出生在东北吉林省一个叫李家屯的小村庄。那时候还没解放，日本人刚走，国民党又来了...',
        wordCount: 650,
        content: '1946年，我出生在东北吉林省一个叫李家屯的小村庄。那时候还没解放，日本人刚走，国民党又来了。村里天天打仗，老百姓的日子苦得没法说。\n\n1949年，家乡解放了。我记得那天，全村的人都跑到村口去迎接解放军。他们穿着整齐的军装，唱着歌，特别威风。'
      },
      {
        title: '第二章 穿上军装的那一刻',
        excerpt: '1962年冬天，我穿上了军装。那是我这辈子最激动的时刻...',
        wordCount: 580,
        content: '1962年冬天，我穿上了军装。那是我这辈子最激动的时刻。\n\n穿上军装的第一天，我对着镜子看了半天。绿色的军装，红色的领章，帽子上的五角星闪闪发光。我觉得自己一下子长大了。'
      }
    ],
    familyView: {
      title: '孙子眼中的爷爷',
      content: '小时候觉得爷爷很严肃，不太爱说话。他每天早上起来就去公园锻炼，回来就看报纸，很少跟我们聊天。\n\n直到有一天，我在爷爷的柜子里发现了那些军功章。我拿着勋章问他："爷爷，这些是什么？"'
    }
  }
];

interface Tab {
  id: string;
  name: string;
}

const TABS: Tab[] = [
  { id: 'preview', name: '章节预览' },
  { id: 'full', name: '完整内容' },
  { id: 'family', name: '家人视角' }
];

export function ShowcasePage() {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentTab, setCurrentTab] = useState('preview');

  const selectStory = (story: Story) => {
    setSelectedStory(story);
    setCurrentTab('preview');
  };

  const closeModal = () => {
    setSelectedStory(null);
  };

  const switchTab = (tabId: string) => {
    setCurrentTab(tabId);
  };

  return (
    <div className="min-h-screen bg-[#F5E6C8] pb-24">
      <div className="text-center py-10 px-6">
        <h1 className="text-3xl font-bold text-[#5A3A28] font-serif mb-3">聆听岁月的声音</h1>
        <p className="text-base text-[#8A7360]">每一个平凡的人生，都值得被铭记</p>
      </div>

      <div className="px-4">
        {STORIES.map((story) => (
          <button
            key={story.id}
            onClick={() => selectStory(story)}
            className="w-full bg-white rounded-xl p-5 mb-4 shadow-sm border border-[#E8DCC8] text-left"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#d4a853] to-[#c73e3a] flex items-center justify-center">
                <span className="text-xl font-serif text-white">{story.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#5A3A28]">{story.name}</h3>
                <p className="text-sm text-[#8A7360]">{story.bio}</p>
              </div>
              <span className="px-3 py-1 bg-[rgba(212,168,83,0.15)] text-[#d4a853] rounded-full text-xs">
                {story.tag}
              </span>
            </div>
            <p className="text-sm text-[#8A7360] line-clamp-2 mb-4">{story.preview}</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="relative w-5 h-5">
                  <div className="absolute inset-y-0 left-0 w-1 bg-[#d4a853]"></div>
                  <div className="absolute top-0 right-0 h-full bg-[rgba(212,168,83,0.5)]"></div>
                </div>
                <span className="text-xs text-[#8A7360]">{story.chapters.length}章</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-5 h-5">
                  <div className="absolute inset-0 border-2 border-[#d4a853] rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 w-1 h-2 bg-[#d4a853] transform -translate-x-1/2 -translate-y-1/2 origin-bottom rotate-[-30deg]"></div>
                </div>
                <span className="text-xs text-[#8A7360]">约{story.chapters.reduce((acc, ch) => acc + ch.wordCount, 0)}字</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="px-4 mt-8">
        <button className="w-full py-3 border-2 border-[#d4a853] text-[#d4a853] rounded-xl font-semibold mb-3">
          查看完整传记效果
        </button>
        <button className="w-full py-3 bg-gradient-to-r from-[#d4a853] to-[#e5c06f] text-[#5A3A28] rounded-xl font-semibold shadow-md">
          开始记录我的人生故事
        </button>
      </div>

      {selectedStory && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={closeModal}>
          <div className="w-full bg-white rounded-t-3xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 p-5 border-b border-[#E8DCC8]">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4a853] to-[#c73e3a] flex items-center justify-center">
                <span className="text-lg font-serif text-white">{selectedStory.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#5A3A28]">{selectedStory.name}</h3>
                <p className="text-sm text-[#8A7360]">{selectedStory.bio}</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 bg-[#F5F5F5] rounded-full flex items-center justify-center">
                <div className="relative w-4 h-4">
                  <div className="absolute top-1/2 left-1/2 w-3 h-0.5 bg-[#8A8A8A] transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                  <div className="absolute top-1/2 left-1/2 w-3 h-0.5 bg-[#8A8A8A] transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
                </div>
              </button>
            </div>

            <div className="flex border-b border-[#E8DCC8]">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    currentTab === tab.id ? 'text-[#d4a853] border-b-2 border-[#d4a853]' : 'text-[#8A7360]'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            <div className="h-[60vh] overflow-y-auto p-5">
              {currentTab === 'preview' && (
                <div className="space-y-4">
                  {selectedStory.chapters.map((chapter, index) => (
                    <div key={index} className="bg-[#FDFCF8] rounded-xl p-4 border border-[#E8DCC8]">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-[#d4a853]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h4 className="text-base font-semibold text-[#5A3A28]">{chapter.title}</h4>
                      </div>
                      <p className="text-sm text-[#8A7360] line-clamp-3 mb-2">{chapter.excerpt}</p>
                      <span className="text-xs text-[#C73E3A]">{chapter.wordCount}字</span>
                    </div>
                  ))}
                </div>
              )}

              {currentTab === 'full' && (
                <div className="space-y-6">
                  {selectedStory.chapters.map((chapter, index) => (
                    <div key={index}>
                      <h4 className="text-lg font-semibold text-[#5A3A28] mb-3">{chapter.title}</h4>
                      <p className="text-base text-[#5A5A5A] leading-relaxed whitespace-pre-line">
                        {chapter.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {currentTab === 'family' && (
                <div className="bg-[#FFF5F5] rounded-xl p-5 border border-[#FCE4EC]">
                  <h4 className="text-lg font-semibold text-[#E74C3C] mb-3">{selectedStory.familyView.title}</h4>
                  <p className="text-base text-[#5A5A5A] leading-relaxed whitespace-pre-line">
                    {selectedStory.familyView.content}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}