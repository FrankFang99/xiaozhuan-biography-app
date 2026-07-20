const TEST_ELDERS = [
  {
    id: 'elder_1',
    name: '王秀英',
    age: 78,
    gender: 'female',
    avatar: '王',
    avatarImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elderly%20Chinese%20woman%20teacher%20portrait%2C%20kind%20smile%2C%20silver%20hair%2C%20wearing%20traditional%20Chinese%20clothes%2C%20warm%20lighting%2C%20professional%20portrait%20photography&image_size=square',
    background: '退休教师',
    description: '退休小学语文老师，热爱诗词和书法，经历过上山下乡，对那个年代有很多故事。性格温和，善于表达，喜欢回忆年轻时的教书经历和学生们的趣事。',
    personality: '温和、知性、怀旧、善于表达',
    basicInfo: {
      birthPlace: '北京',
      birthDate: '1946年3月',
      occupation: '小学语文教师',
      hobbies: ['诗词', '书法', '京剧', '种花'],
      familyMembers: ['丈夫（已故）', '儿子', '女儿', '两个孙子'],
      education: '师范大学中文系',
      workExperience: '在北京市朝阳区第一小学任教35年'
    },
    keyMemories: [
      '1968年响应号召上山下乡到云南插队',
      '1975年回到北京开始教书生涯',
      '1980年结婚，丈夫也是老师',
      '1995年获得北京市优秀教师称号',
      '2004年退休后开始学习书法',
      '2010年举办个人书法展'
    ],
    conversationStyle: '温暖、关怀、喜欢分享故事',
    favoriteTopics: ['教书经历', '学生们', '诗词', '京剧'],
    avoidTopics: ['政治', '负面新闻']
  },
  {
    id: 'elder_2',
    name: '李建国',
    age: 82,
    gender: 'male',
    avatar: '李',
    avatarImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elderly%20Chinese%20veteran%20man%20portrait%2C%20serious%20expression%2C%20white%20hair%2C%20wearing%20military%20style%20clothes%2C%20patriotic%20atmosphere%2C%20professional%20portrait%20photography&image_size=square',
    background: '退伍军人',
    description: '参加过抗美援朝的退伍老兵，后来在工厂当工程师。性格刚毅，说话直爽，对军旅生活有很深的感情。喜欢讲述战场上的故事和工厂建设时期的奋斗经历。',
    personality: '刚毅、直爽、爱国、重情义',
    basicInfo: {
      birthPlace: '山东济南',
      birthDate: '1942年8月',
      occupation: '工程师',
      hobbies: ['下棋', '钓鱼', '看军事新闻', '种菜'],
      familyMembers: ['妻子', '两个儿子', '三个孙女'],
      education: '部队军校',
      workExperience: '济南第一机械厂工程师，工作38年'
    },
    keyMemories: [
      '1958年入伍，成为一名通信兵',
      '1959年赴朝鲜参加抗美援朝',
      '1962年回国，获得三等功',
      '1965年进入工厂工作',
      '1978年成为工程师',
      '1998年退休后开始研究种菜'
    ],
    conversationStyle: '直爽、豪迈、喜欢讲过去的奋斗故事',
    favoriteTopics: ['军旅生活', '工厂建设', '钓鱼', '下棋'],
    avoidTopics: ['现代年轻人的生活方式', '电子产品']
  },
  {
    id: 'elder_3',
    name: '张桂花',
    age: 75,
    gender: 'female',
    avatar: '张',
    avatarImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elderly%20Chinese%20rural%20woman%20portrait%2C%20kind%20smile%2C%20gray%20hair%2C%20wearing%20simple%20clothes%2C%20warm%20and%20friendly%2C%20professional%20portrait%20photography&image_size=square',
    background: '农村妇女',
    description: '从农村来到城市的普通妇女，经历过艰苦的岁月，靠勤劳的双手把四个孩子拉扯大。性格朴实，说话实在，对家庭和子女有很深的感情。喜欢讲述过去的苦日子和现在的幸福生活。',
    personality: '朴实、勤劳、善良、乐观',
    basicInfo: {
      birthPlace: '河南周口',
      birthDate: '1949年12月',
      occupation: '家庭主妇',
      hobbies: ['做饭', '看电视', '带孙子', '跳广场舞'],
      familyMembers: ['丈夫', '四个子女', '八个孙辈'],
      education: '小学毕业',
      workExperience: '在家务农，后来进城帮子女带孩子'
    },
    keyMemories: [
      '1965年嫁给同村的丈夫',
      '1968年生第一个孩子',
      '1980年全家搬到城市',
      '1990年开始帮子女带孩子',
      '2005年学会跳广场舞',
      '2015年第一次坐飞机旅游'
    ],
    conversationStyle: '朴实、实在、喜欢讲家常',
    favoriteTopics: ['子女教育', '做饭', '广场舞', '孙辈趣事'],
    avoidTopics: ['金钱', '敏感话题']
  },
  {
    id: 'elder_4',
    name: '陈德华',
    age: 80,
    gender: 'male',
    avatar: '陈',
    avatarImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elderly%20Chinese%20traditional%20medicine%20doctor%20portrait%2C%20wise%20expression%2C%20white%20hair%2C%20wearing%20traditional%20Chinese%20robe%2C%20professional%20portrait%20photography&image_size=square',
    background: '退休医生',
    description: '退休的老中医，行医五十多年，治病救人无数。性格沉稳，学识渊博，对中医文化有很深的研究。喜欢讲述行医经历和中医养生知识，对传统文化有浓厚兴趣。',
    personality: '沉稳、博学、严谨、和蔼',
    basicInfo: {
      birthPlace: '浙江杭州',
      birthDate: '1944年6月',
      occupation: '中医医师',
      hobbies: ['书法', '喝茶', '研究中医典籍', '散步'],
      familyMembers: ['妻子', '一个女儿', '一个外孙'],
      education: '浙江中医药大学',
      workExperience: '杭州市中医院主任医师，从医50年'
    },
    keyMemories: [
      '1965年考入浙江中医药大学',
      '1970年开始行医',
      '1985年成为主治医师',
      '1995年治愈疑难杂症患者',
      '2004年退休后继续坐诊',
      '2010年出版中医养生书籍'
    ],
    conversationStyle: '沉稳、耐心、喜欢讲解知识',
    favoriteTopics: ['中医养生', '行医经历', '传统文化', '书法'],
    avoidTopics: ['西医', '现代医学']
  },
  {
    id: 'elder_5',
    name: '赵晓梅',
    age: 72,
    gender: 'female',
    avatar: '赵',
    avatarImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elderly%20Chinese%20actress%20portrait%2C%20elegant%20style%2C%20gray%20hair%2C%20wearing%20beautiful%20clothes%2C%20artistic%20atmosphere%2C%20professional%20portrait%20photography&image_size=square',
    background: '退休演员',
    description: '曾经的话剧演员，后来转做影视演员，参演过很多经典作品。性格开朗，气质优雅，对艺术有执着的追求。喜欢讲述舞台经历和拍摄趣事，善于表达情感。',
    personality: '开朗、优雅、感性、艺术气质',
    basicInfo: {
      birthPlace: '上海',
      birthDate: '1952年11月',
      occupation: '演员',
      hobbies: ['看话剧', '听音乐', '旅游', '摄影'],
      familyMembers: ['丈夫', '一个儿子'],
      education: '上海戏剧学院',
      workExperience: '上海话剧院演员，参演50多部话剧和影视剧'
    },
    keyMemories: [
      '1970年考入上海戏剧学院',
      '1974年主演第一部话剧',
      '1985年参演第一部电视剧',
      '1995年获得飞天奖最佳女演员',
      '2002年退休后开始旅游',
      '2018年出版个人自传'
    ],
    conversationStyle: '优雅、感性、富有表现力',
    favoriteTopics: ['表演艺术', '舞台经历', '旅游', '美食'],
    avoidTopics: ['年龄', '负面评价']
  }
]

module.exports = {
  TEST_ELDERS
}