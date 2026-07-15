interface ChatMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

const BIOGRAPHER_SYSTEM_PROMPT = `
你是小传，一位温暖、睿智的人生传记记录者。你的任务是引导用户回顾和分享他们的人生故事，用温暖的语言与用户交流。

性格特点：
- 温和、耐心、善解人意
- 像一位慈祥的老朋友
- 善于倾听，引导用户回忆美好时光
- 用故事性的语言回应

对话规则：
1. 始终保持温暖友好的语气
2. 根据用户分享的内容进行回应，不要生硬提问
3. 可以主动询问用户的童年、求学、工作、家庭等经历
4. 适当表达共情和理解
5. 每次回复控制在100-200字左右
6. 使用中文回复

可讨论的话题：
- 童年回忆：小时候的趣事、家庭、玩伴
- 求学时光：学校生活、老师、同学、梦想
- 工作经历：职业选择、职场故事、成就与挑战
- 家庭生活：婚姻、子女、家庭温暖
- 人生感悟：对生活的理解、重要的人生时刻
- 未来展望：对未来的期待、未完成的梦想
`;

export class AIService {
  private messages: ChatMessage[] = [];

  constructor() {
    this.messages = [{ role: 'system', content: BIOGRAPHER_SYSTEM_PROMPT }];
  }

  private generateResponse(userMessage: string): string {
    const responses: Record<string, string[]> = {
      childhood: [
        '童年时光总是那么美好！您小时候最喜欢玩什么游戏？有没有特别难忘的趣事想分享？',
        '回忆起童年，总是充满温暖。您小时候的家是什么样的？有没有兄弟姐妹？',
        '童年的夏天总是特别长。您小时候最喜欢夏天做什么？',
        '小时候的梦想是什么？后来实现了吗？',
        '童年的记忆像一颗颗珍珠，您最珍贵的那颗是什么？'
      ],
      school: [
        '求学时光是人生中最纯粹的阶段。您最喜欢的科目是什么？',
        '校园生活总是充满故事。有没有特别难忘的老师或同学？',
        '学生时代的梦想是什么？后来的人生是否沿着那个方向走了？',
        '考试、运动会、文艺汇演...您学生时代最难忘的瞬间是什么？',
        '那时候有没有暗恋的对象？现在回想起来是什么感觉？'
      ],
      work: [
        '工作是人生的重要篇章。您是怎么选择现在的职业的？',
        '职场中一定有很多故事。有没有特别有成就感的时刻？',
        '工作中遇到过什么挑战？您是怎么克服的？',
        '有没有特别敬佩的同事或领导？他们给了您什么启发？',
        '如果重新选择，您会选择不同的职业吗？'
      ],
      family: [
        '家庭是人生的港湾。您的家庭生活是什么样的？',
        '说说您的另一半吧，你们是怎么相遇的？',
        '有孩子吗？他们现在怎么样？',
        '家庭中最温暖的瞬间是什么？',
        '父母对您的影响是什么？'
      ],
      memories: [
        '人生中总有一些特别的时刻。您最难忘的一天是什么时候？',
        '有没有什么遗憾的事情？如果重来一次会怎么做？',
        '最开心的时刻是什么？和谁一起度过的？',
        '有没有特别想感谢的人？',
        '人生中最重要的决定是什么？'
      ],
      reflection: [
        '经历了这么多，您对人生有什么特别的感悟？',
        '什么是您认为最珍贵的东西？',
        '如果给年轻时的自己一句话，您会说什么？',
        '您觉得幸福是什么？',
        '人生中最宝贵的财富是什么？'
      ]
    };

    const keywords: Record<string, string[]> = {
      childhood: ['童年', '小时候', '儿时', '童年时光', '小时候的', '小时候我'],
      school: ['上学', '学校', '老师', '同学', '考试', '学习', '大学', '中学'],
      work: ['工作', '职业', '职场', '上班', '公司', '老板', '同事'],
      family: ['家庭', '父母', '孩子', '老婆', '老公', '结婚', '儿子', '女儿'],
      memories: ['回忆', '想起', '记得', '以前', '过去', '那时候'],
      reflection: ['觉得', '感悟', '体会', '认识', '人生', '意义', '幸福']
    };

    let topic = 'reflection';
    for (const [key, words] of Object.entries(keywords)) {
      if (words.some(word => userMessage.includes(word))) {
        topic = key;
        break;
      }
    }

    const responseList = responses[topic] || responses.reflection;
    const randomResponse = responseList[Math.floor(Math.random() * responseList.length)];

    if (userMessage.length > 20) {
      return `听您这么说，我仿佛也感受到了那段时光的温暖。${randomResponse}`;
    }

    return randomResponse;
  }

  async sendMessageStream(userMessage: string, onChunk: (chunk: string) => void): Promise<void> {
    this.messages.push({ role: 'user', content: userMessage });

    try {
      const response = this.generateResponse(userMessage);
      const chunks = response.split('');
      
      for (const chunk of chunks) {
        await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
        onChunk(chunk);
      }

      this.messages.push({ role: 'assistant', content: response });
    } catch (error) {
      console.error('AI API stream call failed:', error);
      const fallbackResponse = '抱歉，我刚才走神了，您能再说一遍吗？';
      onChunk(fallbackResponse);
    }
  }

  async sendMessage(userMessage: string): Promise<string> {
    this.messages.push({ role: 'user', content: userMessage });

    try {
      const response = this.generateResponse(userMessage);
      this.messages.push({ role: 'assistant', content: response });
      return response;
    } catch (error) {
      console.error('AI API call failed:', error);
      return '抱歉，我刚才走神了，您能再说一遍吗？';
    }
  }
}

export const aiService = new AIService();