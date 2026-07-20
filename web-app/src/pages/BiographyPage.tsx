import { useState, useEffect, useRef } from 'react';

interface TimelineItem {
  year: string;
  event: string;
}

interface Photo {
  title: string;
  desc: string;
}

interface Chapter {
  title: string;
  year: string;
  content: string;
  quote?: string;
  emotion?: string;
}

interface FamilyView {
  title: string;
  content: string;
}

interface Biography {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  tag: string;
  starPosition: { x: number; y: number };
  starColor: string;
  starSize: number;
  intro: string;
  ending: string;
  timeline: TimelineItem[];
  photos: Photo[];
  chapters: Chapter[];
  familyView: FamilyView;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

const BIOGRAPHIES: Biography[] = [
  {
    id: 'zhangxiulan',
    name: '张秀兰',
    avatar: '张',
    bio: '72岁 · 乡村教师 · 40年教龄',
    tag: '教育人生',
    starPosition: { x: 800, y: 600 },
    starColor: '#d4a853',
    starSize: 100,
    intro: '1954年，我出生在豫西伏牛山下一个叫槐树湾的小村庄。那时候家里穷，全村只有一个识字的老先生。我七岁那年，老先生蹲在村口抽烟，看着我蹲在地上用树枝写字，忽然说："这娃子眼神亮，是个读书的料。"没想到这句话，像一颗种子，在我心里生根发芽，改变了我的一生。',
    ending: '四十年了，我教过的学生加起来有上千人。他们有的成了医生，有的成了工程师，有的像我一样回到了山里当老师。每次看到他们回来看我，我心里就热乎乎的。\n\n有人问我后悔吗？我说不后悔。这辈子最幸福的事，就是站在讲台上，看到孩子们眼里的光。那光是希望，是未来，是大山里最美的风景。\n\n现在我老了，但我还是想多活几年，再多看看这些孩子们。他们是我的骄傲，也是我这辈子最大的财富。',
    timeline: [
      { year: '1954', event: '出生于豫西槐树湾村' },
      { year: '1961', event: '7岁入学，遇到启蒙老师王老先生' },
      { year: '1968', event: '初中毕业，考入县师范学校' },
      { year: '1972', event: '18岁师范毕业，回到家乡成为代课老师' },
      { year: '1975', event: '与丈夫结婚，开始边教书边照顾家庭' },
      { year: '1985', event: '转正为正式教师' },
      { year: '1988', event: '洪水冲毁学校，在帐篷里坚持上课' },
      { year: '1992', event: '第一个考上大学的学生毕业回乡' },
      { year: '2000', event: '获得"全国优秀教师"称号' },
      { year: '2010', event: '孙女出生，开始隔代教育' },
      { year: '2012', event: '退休，但仍坚持辅导学生' },
      { year: '2026', event: '72岁，依然心系教育' }
    ],
    photos: [
      { title: '1961年，入学第一天', desc: '王老师带着我们在土坯房前合影' },
      { title: '1972年，师范毕业照', desc: '青涩的年华，怀揣着教育的梦想' },
      { title: '1972年，第一堂课', desc: '土坯房教室，孩子们穿着补丁衣服' },
      { title: '1988年，洪水过后', desc: '帐篷里的课堂，孩子们依然认真听讲' }
    ],
    chapters: [
      {
        title: '第一章 山村里的启蒙',
        year: '1954-1968',
        content: '我出生在1954年，豫西伏牛山下的槐树湾村。那时候家里特别穷，爷爷是个老木匠，父亲跟着爷爷学手艺，母亲操持家务。我们兄妹四个，我排行老二。\n\n七岁那年，村里的土坯房学堂终于开课了。学堂其实就是一间废弃的牛棚，屋顶铺着茅草，窗户上糊着旧报纸。先生是个五十多岁的老头，姓王，是全村唯一识字的人。\n\n第一天上学，我穿着打补丁的粗布衣服，手里攥着母亲用旧布缝的书包，里面装着一个石板和一支石笔。王老师站在门口，手里拿着一把戒尺，脸上却带着慈祥的笑容。他摸摸我的头说："这就是秀兰吧？进来吧。"\n\n王老师对我特别好。有一次我家里交不起学费，他就自己掏钱帮我垫上。他说："秀兰啊，你这娃子眼神亮，是个读书的料，可不能耽误了。"',
        quote: '老师说我眼神亮，是个读书的料。这句话我记了一辈子。',
        emotion: '感恩'
      },
      {
        title: '第二章 师范岁月',
        year: '1968-1972',
        content: '1968年秋天，我背着简单的行李，第一次走出了大山，来到了县城。师范学校坐落在县城的东北角，是一栋青砖瓦房，在我眼里，那就是世界上最气派的建筑。\n\n师范学校的生活和村里完全不同。我们有宽敞的教室，有整齐的课桌，还有图书馆。我第一次看到那么多书，简直像进了天堂。每天放学后，我都泡在图书馆里，贪婪地阅读着各种书籍。\n\n那时候师范学校的课程很丰富，除了语文、数学，还有音乐、美术、体育。我最喜欢上音乐课，因为我从小就喜欢唱歌。音乐老师说我嗓子好，让我参加学校的合唱队。',
        quote: '师范学校的图书馆，是我见过的最美的地方。那里有我渴望的一切。',
        emotion: '憧憬'
      },
      {
        title: '第三章 土坯房里的第一堂课',
        year: '1972',
        content: '1972年夏天，我师范毕业了，回到了家乡槐树湾村。那时候村里的小学还是那间土坯房，条件比我上学的时候好不了多少。\n\n第一天上课，我穿着母亲做的粗布棉袄，手里握着用毛笔写的教案，站在讲台上，望着台下二十多个孩子。他们穿着补丁摞补丁的衣服，有的光着脚，但眼睛里都闪烁着渴望的光芒。\n\n"同学们好，我是张秀兰，从今天起由我来教你们读书写字。"我的声音有点抖，但孩子们齐声回答"老师好"的时候，一股暖流涌上心头。',
        quote: '孩子们踩着齐膝深的雪来上学，那双脚冻得像红萝卜。',
        emotion: '温暖'
      },
      {
        title: '第四章 难忘的学生们',
        year: '1973-1985',
        content: '教了十几年书，我遇到过很多难忘的学生。\n\n有个叫狗蛋的孩子，家里特别穷，爹死得早，娘身体不好。他每天放学回家要割草、喂猪，还要照顾弟弟妹妹。但他学习特别刻苦，每天晚上在月光下背书。\n\n还有个叫小芳的姑娘，家里重男轻女，不让她上学。我跑到她家去做工作，她爹说："一个丫头片子，读什么书？"我说："叔，小芳聪明着呢，不读书可惜了。"',
        quote: '小芳说："老师，我也要像您一样，教山里的孩子读书。"',
        emotion: '骄傲'
      },
      {
        title: '第五章 深夜的油灯',
        year: '1975-1985',
        content: '1975年，我结婚了。丈夫是邻村的民办教师，后来转到了乡政府工作。我们有两个孩子，一儿一女。\n\n那时候我既要教书，又要照顾家庭，日子过得很辛苦。每天早上五点多就起床，给孩子们做饭，然后步行几里山路去学校。晚上回到家，还要给孩子们洗衣服、做饭，等孩子们睡了，我还要在油灯下批改作业、备课。',
        quote: '油灯下的时光，是我最充实的时光。',
        emotion: '坚持'
      },
      {
        title: '第六章 洪水冲不垮的课堂',
        year: '1988',
        content: '1988年夏天，山里发了特大洪水。那天晚上，大雨下个不停，山洪暴发，河水猛涨。我躺在床上，心里想着学校的孩子们，怎么也睡不着。\n\n第二天一早，我跑到学校一看，天哪，学校被淹了！土坯房的墙壁塌了一半，课桌都漂了起来，课本和教具泡在水里。我心疼得眼泪直流。\n\n我和几个年轻老师赶紧把孩子们转移到高处，然后又回来抢救课本和教具。水越来越大，我们在齐腰深的水里趟来趟去，把能抢救的东西都搬到了山坡上的临时帐篷里。',
        quote: '没有黑板，我把字写在硬纸板上；没有粉笔，我用木炭代替。',
        emotion: '坚强'
      },
      {
        title: '第七章 家访路上',
        year: '1989-1995',
        content: '教书这么多年，我养成了一个习惯：每个学期都要去每个学生家里家访一次。山里的路不好走，有时候要翻山越岭，走几个小时才能到一个学生家。\n\n记得有一次去狗蛋家，那时候他已经上初中了。他家住在深山里，路特别难走。我走了三个多小时，才到达他家。狗蛋的妈妈看到我，感动得哭了。',
        quote: '家访的路虽然难走，但每一步都走得值得。',
        emotion: '关爱'
      },
      {
        title: '第八章 全国优秀教师',
        year: '2000',
        content: '2000年春天，我接到县里的通知，说我被评为"全国优秀教师"，要去北京领奖。我当时激动得说不出话来，手里拿着通知，眼泪止不住地流。\n\n省里来人接我去北京。那是我第一次坐火车，第一次去北京。火车在铁轨上飞驰，我的心也跟着飞驰。我望着窗外的风景，心里想着这么多年的辛苦，终于得到了认可。',
        quote: '奖状总有一天会褪色，但孩子们的未来永远不会褪色。',
        emotion: '自豪'
      },
      {
        title: '第九章 岁月如歌',
        year: '1975-2010',
        content: '我和丈夫结婚四十多年了，他一直很支持我的工作。那时候他在乡政府上班，工资不高，但他总是把家里的事都扛起来，让我专心教书。\n\n2010年，我的孙女出生了。抱着这个小生命，我忽然觉得，生命是如此神奇。我想起了自己小时候，想起了王老师，想起了那些孩子们。生命就是这样，一代一代地传承下去。',
        quote: '生命就是这样，一代一代地传承下去。',
        emotion: '温馨'
      },
      {
        title: '第十章 退休后的牵挂',
        year: '2012-2026',
        content: '2012年，我退休了。但我没有离开学校，依然住在学校旁边的老房子里。\n\n每天早上，我都会去学校看看。现在的学校条件好多了，有了崭新的教学楼，有了电脑和投影仪。但我还是喜欢坐在教室里，听孩子们朗朗的读书声。\n\n我今年72岁了，身体不如以前了，但只要还能走动，我就会去学校。因为那里有我的孩子们，有我一辈子的牵挂。',
        quote: '只要还能走动，我就会去学校，那里有我一辈子的牵挂。',
        emotion: '牵挂'
      }
    ],
    familyView: {
      title: '女儿眼中的母亲',
      content: '小时候总觉得妈妈不关心我，她把所有的时间都给了学生。有一次我生病了，发着高烧，她却在学校给学生补课，直到晚上才回来。我当时特别恨她。\n\n现在我自己也当了妈妈，才理解她的选择。妈妈常说，每个孩子都是一颗种子，只要用心浇灌，总会开花结果。她用四十年的时光，浇灌了几百颗种子，看着它们长成参天大树。'
    }
  },
  {
    id: 'lijianguo',
    name: '李建国',
    avatar: '李',
    bio: '80岁 · 退伍军人 · 参加过边境保卫战',
    tag: '峥嵘岁月',
    starPosition: { x: 400, y: 1000 },
    starColor: '#4fc3f7',
    starSize: 100,
    intro: '1946年，我出生在东北吉林省一个叫李家屯的小村庄。那时候还没解放，日本人刚走，国民党又来了。村里天天打仗，老百姓的日子苦得没法说。但我从小就有个梦想：当兵，保家卫国。',
    ending: '八十年了，我经历了太多太多。战争的残酷，和平的珍贵，我都体会过。\n\n现在的日子好了，不愁吃不愁穿。但我总想起那些牺牲的战友，他们没有看到今天的好日子。小王、老张、陈班长……他们一个个鲜活的面容，时常出现在我的梦里。',
    timeline: [
      { year: '1946', event: '出生于吉林李家屯' },
      { year: '1949', event: '3岁，家乡解放' },
      { year: '1962', event: '16岁，瞒着家人参军' },
      { year: '1962', event: '奔赴中印边境，参加自卫反击战' },
      { year: '1963', event: '执行爆破任务，右腿中弹，立三等功' },
      { year: '1965', event: '退伍，回到家乡' },
      { year: '1966', event: '与小李结婚，进入机械厂工作' },
      { year: '2026', event: '80岁，安享晚年' }
    ],
    photos: [
      { title: '1949年，解放照', desc: '全村人迎接解放军' },
      { title: '1962年，入伍照', desc: '穿上军装的第一天' },
      { title: '1962年，新兵训练', desc: '在训练场上打靶' },
      { title: '1964年，养伤照', desc: '在医院与护士小李合影' }
    ],
    chapters: [
      {
        title: '第一章 东北小村庄的童年',
        year: '1946-1962',
        content: '1946年，我出生在东北吉林省一个叫李家屯的小村庄。那时候还没解放，日本人刚走，国民党又来了。村里天天打仗，老百姓的日子苦得没法说。\n\n1949年，家乡解放了。我记得那天，全村的人都跑到村口去迎接解放军。他们穿着整齐的军装，唱着歌，特别威风。从那时候起，我就下定决心：长大了一定要当兵。',
        quote: '从看到解放军的那天起，我就下定决心：长大了一定要当兵。',
        emotion: '向往'
      },
      {
        title: '第二章 穿上军装的那一刻',
        year: '1962',
        content: '1962年冬天，我穿上了军装。那是我这辈子最激动的时刻。\n\n穿上军装的第一天，我对着镜子看了半天。绿色的军装，红色的领章，帽子上的五角星闪闪发光。我觉得自己一下子长大了。\n\n新兵训练特别苦。每天早上五点起床，跑步、打靶、练战术，一天下来累得骨头都散架了。但我咬着牙坚持下来了。',
        quote: '穿上军装的那一刻，我觉得自己一下子长大了。',
        emotion: '激动'
      },
      {
        title: '第三章 奔赴边疆',
        year: '1962',
        content: '1962年秋天，我们坐着火车，一路向西，奔赴中印边境。\n\n火车开了三天三夜，越往西走，风景越荒凉。刚开始还有村庄和农田，后来就只剩下戈壁滩和雪山了。\n\n到了部队驻地，我才知道什么叫艰苦。这里海拔四千多米，空气稀薄，走几步路就喘得不行。冬天零下三四十度，我们穿着单薄的棉衣，冻得瑟瑟发抖。',
        quote: '这里是祖国的西大门，我们一定要守好。',
        emotion: '坚定'
      },
      {
        title: '第四章 边境线上的烽火',
        year: '1962',
        content: '1962年，中印边境冲突爆发了。我们接到命令，开赴前线。\n\n那时候边境的条件特别艰苦，海拔四千多米，空气稀薄，冬天零下三四十度。我们穿着单薄的棉衣，在雪地里巡逻。\n\n最难忘的是一次伏击战。我们在雪地里埋伏了三天三夜，等着敌人的巡逻队。饿了就啃冻硬的压缩饼干，渴了就抓一把雪吃。',
        quote: '小王扑在我身上，替我挡了一枪。他牺牲的时候，才18岁。',
        emotion: '悲痛'
      },
      {
        title: '第五章 最危险的一次任务',
        year: '1963',
        content: '1963年夏天，我们接到一个重要任务：炸毁敌人的一个碉堡。\n\n碉堡建在半山腰，易守难攻。敌人在碉堡周围布了地雷，还有机枪防守。\n\n排长挑选了五个战士组成爆破小组，我是其中之一。我们趁着夜色，悄悄摸到碉堡附近。就在我们准备安放炸药的时候，敌人发现了我们。',
        quote: '碉堡被炸上了天的那一刻，我知道，我们赢了。',
        emotion: '惊险'
      },
      {
        title: '第六章 战友情深',
        year: '1963-1965',
        content: '在部队的日子里，我和战友们结下了深厚的情谊。我们一起训练，一起战斗，一起吃苦，一起欢笑。\n\n陈班长是我们班的老班长，他对我们特别好。每次发津贴，他都把自己的那份分给家里困难的战友。有一次，我生病了，他背着我走了十几里山路去医院。',
        quote: '部队就是我的家，战友就是我的兄弟。',
        emotion: '温暖'
      },
      {
        title: '第七章 医院里的爱情',
        year: '1964',
        content: '1964年，我因为腿伤住进了部队医院。在医院里，我认识了护士小李。\n\n小李是四川人，长得清秀，说话温柔。她每天都来给我换药，陪我聊天。刚开始，我不好意思跟她说话，每次她来，我都脸红。\n\n后来熟了，我们就聊得越来越多。她跟我说她的家乡，我说我的部队生活。她觉得我很勇敢，我说她很善良。',
        quote: '她给我织了一条围巾，那是我收到的最珍贵的礼物。',
        emotion: '甜蜜'
      },
      {
        title: '第八章 和平年代的坚守',
        year: '1965-2006',
        content: '1965年，我退伍了。回到家乡后，我在一家机械厂找了份工作。\n\n那时候国家建设需要钢铁，我每天在车间里干十几个小时，从不喊累。因为我知道，和平来之不易，我们要用双手建设好祖国。\n\n我把军功章锁在柜子里，从不主动提起过去的经历。邻居们只知道我当过兵，但不知道我立过功。',
        quote: '我们活着的人，要替牺牲的战友好好活着。',
        emotion: '怀念'
      },
      {
        title: '第九章 家庭的温暖',
        year: '1966-2006',
        content: '1966年，我和小李结婚了。我们的婚礼很简单，没有酒席，没有婚纱，只有家人和几个朋友。但我觉得，那是最幸福的一天。\n\n1970年，我们的儿子出生了。我给他取名叫李卫国，希望他将来能像我一样，保卫国家。1975年，女儿也出生了，取名叫李爱民。',
        quote: '看着一家人其乐融融的样子，我觉得这辈子值了。',
        emotion: '温馨'
      },
      {
        title: '第十章 老战友的重逢',
        year: '2019-2026',
        content: '2019年，我们连组织了一次战友聚会。几十年没见的老战友们，从全国各地赶来。\n\n见面的那一刻，大家都哭了。当年的小伙子，现在都成了老头。头发白了，背也驼了，但眼神还是那么坚定。\n\n我们坐在一起，回忆当年的岁月。有人说起小王，有人说起牺牲的战友，大家都沉默了。',
        quote: '当年的小伙子，现在都成了老头，但眼神还是那么坚定。',
        emotion: '感慨'
      }
    ],
    familyView: {
      title: '孙子眼中的爷爷',
      content: '小时候觉得爷爷很严肃，不太爱说话。他每天早上起来就去公园锻炼，回来就看报纸，很少跟我们聊天。\n\n直到有一天，我在爷爷的柜子里发现了那些军功章。我拿着勋章问他："爷爷，这些是什么？"爷爷沉默了很久，然后给我讲起了他当兵的故事。'
    }
  },
  {
    id: 'wangguiying',
    name: '王桂英',
    avatar: '王',
    bio: '68岁 · 企业家 · 从摆地摊到创办企业',
    tag: '奋斗人生',
    starPosition: { x: 1200, y: 1400 },
    starColor: '#f48fb1',
    starSize: 100,
    intro: '1958年，我出生在南方浙江省一个叫乌镇的小镇。小时候家里条件还不错，父亲是个木匠，母亲操持家务。但后来赶上了特殊时期，家道中落。18岁那年，我进了镇上的纺织厂当工人。',
    ending: '从摆地摊到创办企业，我用了三十年的时间。这三十年里，我吃过苦，受过累，也流过泪。但我从来没有放弃过。\n\n现在企业规模大了，员工多了，我肩上的责任也重了。但我始终记得自己曾经的困难，所以特别愿意帮助那些需要帮助的人。',
    timeline: [
      { year: '1958', event: '出生于浙江乌镇' },
      { year: '1976', event: '18岁，进入镇纺织厂' },
      { year: '1985', event: '27岁，下岗，开始摆地摊谋生' },
      { year: '1990', event: '32岁，租下第一个门面' },
      { year: '1995', event: '37岁，注册自己的服装品牌"桂英服饰"' },
      { year: '1998', event: '40岁，遭遇金融危机，濒临破产' },
      { year: '2005', event: '47岁，企业年产值突破千万' },
      { year: '2015', event: '57岁，成立公益基金会' },
      { year: '2026', event: '68岁，继续奋斗' }
    ],
    photos: [
      { title: '1976年，进厂照', desc: '刚进纺织厂的样子' },
      { title: '1985年，摆地摊', desc: '推着自行车卖货' },
      { title: '1990年，第一个门面', desc: '菜市场旁的小门脸' },
      { title: '2015年，基金会成立', desc: '和受资助的孩子们' }
    ],
    chapters: [
      {
        title: '第一章 乌镇的女儿',
        year: '1958-1976',
        content: '1958年，我出生在浙江省一个叫乌镇的小镇。那时候乌镇还不是旅游景点，就是一个普通的江南水乡小镇。\n\n父亲是个木匠，手艺很好，方圆几十里都有名。母亲是家庭主妇，操持家务，照顾我们兄妹三个。小时候家里条件还不错，我读了高中，是我们家第一个高中生。',
        quote: '做事情要踏实，不能偷工减料。这句话我记了一辈子。',
        emotion: '憧憬'
      },
      {
        title: '第二章 纺织厂的女工',
        year: '1976-1985',
        content: '1976年，我18岁，第一次走进纺织厂。车间里机器轰鸣，几十台织布机排成一排。我被分配到织布车间，跟着师傅学织布。\n\n那时候年轻，不怕苦。每天早上七点上班，晚上七点下班，一天工作十二个小时。但我觉得很充实，每个月能拿到三十多块钱的工资，足够养活自己了。',
        quote: '拿到下岗通知书的那天，我哭了很久。我不知道以后的日子该怎么过。',
        emotion: '迷茫'
      },
      {
        title: '第三章 菜市场里的地摊',
        year: '1985',
        content: '下岗以后，我在家里呆了几天，整天以泪洗面。后来我想，这样下去不行，三个孩子还要养，丈夫身体又不好，我必须想办法赚钱。\n\n我推着家里的旧自行车，在菜市场摆起了地摊。卖些针头线脑、袜子毛巾什么的。\n\n第一天生意不好，只赚了八块钱。我看着手里的八块钱，心里特别难受。但我没有灰心，第二天继续出摊。',
        quote: '一位老太太说："姑娘，不容易啊。"就是这句话，给了我很大的鼓励。',
        emotion: '坚持'
      },
      {
        title: '第四章 第一个门面',
        year: '1990',
        content: '摆了五年地摊，我攒了一些钱。1990年，我租下了菜市场旁边的一个小门脸，做起了服装生意。\n\n那时候进货要去广州，我背着大包小包挤火车，经常要站十几个小时。到了广州，我就在批发市场里一家一家地看，货比三家，挑最便宜最好的货。',
        quote: '做生意最重要的是诚信，这是我一辈子的信条。',
        emotion: '诚信'
      },
      {
        title: '第五章 创立品牌',
        year: '1995',
        content: '1995年，我注册了自己的服装品牌，叫"桂英服饰"。虽然规模不大，但每一件衣服都是我亲自把关。\n\n那时候我开始设计自己的款式。我每天都在店里画设计图，有时候画到半夜。有一次，我设计了一款连衣裙，卖得特别好，一下子就卖出去了几百件。',
        quote: '"桂英服饰"，这是我用心血创立的品牌。',
        emotion: '自豪'
      },
      {
        title: '第六章 最难的时候',
        year: '1998',
        content: '1998年，亚洲金融危机爆发了。我的生意受到了很大影响，很多客户都不拿货了。\n\n那时候我欠了供应商很多钱，工厂里的工人也发不出工资。我整天愁得睡不着觉，头发都白了不少。\n\n有一天，我坐在店里，看着空荡荡的货架，真想放弃算了。但我想起了三个孩子，想起了跟着我干的工人，我不能就这么放弃。',
        quote: '我把房子都抵押了，但我不能就这么放弃。',
        emotion: '坚强'
      },
      {
        title: '第七章 家庭的支持',
        year: '1985-2000',
        content: '创业这么多年，家人一直是我最坚强的后盾。\n\n丈夫虽然身体不好，但他一直在背后支持我。他帮我看店，帮我算账，帮我照顾孩子。有一次我去广州进货，他一个人带着三个孩子，还要看店，累得生病了。但他从来没有抱怨过。',
        quote: '家人是我最坚强的后盾，没有他们，我走不到今天。',
        emotion: '感恩'
      },
      {
        title: '第八章 企业做大了',
        year: '2000-2015',
        content: '2000年以后，我的企业规模越来越大。员工从最初的几个人发展到几百人，年产值从几十万增长到几千万。\n\n2010年，我开办了自己的服装加工厂。这样一来，我就能控制从设计到生产的整个流程，保证产品质量。',
        quote: '一个人富了不算什么，帮助更多人过上好日子才是真正的幸福。',
        emotion: '温暖'
      },
      {
        title: '第九章 公益之路',
        year: '2015-2026',
        content: '2015年，我成立了公益基金会，专门帮助困难家庭和弱势群体。\n\n基金会成立以来，我们帮助了上千个困难家庭，资助了几百个贫困学生。我们还在山区建了几所希望小学。',
        quote: '帮助别人，是我人生最大的快乐。',
        emotion: '喜悦'
      },
      {
        title: '第十章 传承与希望',
        year: '2015-2026',
        content: '现在儿子已经接管了企业的大部分工作。他年轻，有想法，把企业管理得井井有条。看到他这么能干，我心里特别欣慰。\n\n我今年68岁了，但我还不想退休。我要继续奋斗，帮助更多的人，回馈社会。因为我知道，一个人富了不算什么，帮助更多人过上好日子，才是真正的幸福。',
        quote: '人生就像一场马拉松，不在于你跑得多快，而在于你是否能坚持到终点。',
        emotion: '希望'
      }
    ],
    familyView: {
      title: '儿子眼中的母亲',
      content: '小时候觉得妈妈很严厉，总是很忙。她每天早出晚归，很少有时间陪我们。那时候我不太理解她，甚至有点怨她。\n\n长大后，我才明白，妈妈是为了这个家，为了我们能过上好日子。她用自己的努力，给了我们最好的教育，让我们能够追逐自己的梦想。'
    }
  }
];

const generateBgStars = (): Star[] => {
  const stars: Star[] = [];
  for (let i = 0; i < 100; i++) {
    stars.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.3,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    });
  }
  return stars;
};

export function BiographyPage() {
  const [viewMode, setViewMode] = useState<'universe' | 'cover' | 'content'>('universe');
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [bgStars] = useState<Star[]>(generateBgStars);
  const [currentBiography, setCurrentBiography] = useState<Biography>(BIOGRAPHIES[0]);
  const [selectedStar, setSelectedStar] = useState<Biography | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const clickStar = (biography: Biography) => {
    setSelectedStar(biography);
  };

  const closeStarPopup = () => {
    setSelectedStar(null);
  };

  const startReading = () => {
    setCurrentBiography(selectedStar || BIOGRAPHIES[0]);
    setSelectedStar(null);
    setViewMode('cover');
  };

  const openBook = () => {
    setViewMode('content');
    setCurrentChapter(0);
  };

  const closeBook = () => {
    setViewMode('universe');
  };

  const toggleTableOfContents = () => {
    setShowTableOfContents(!showTableOfContents);
  };

  const jumpToChapter = (index: number) => {
    setCurrentChapter(index);
    setShowTableOfContents(false);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectBiography = (biography: Biography) => {
    setCurrentBiography(biography);
    setShowSelector(false);
    setViewMode('cover');
  };

  const closeSelector = () => {
    setShowSelector(false);
  };

  useEffect(() => {
    if (showTableOfContents) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showTableOfContents]);

  return (
    <div className="min-h-screen bg-[#030512]">
      {viewMode === 'universe' && (
        <div className="relative h-screen overflow-hidden">
          <div className="fixed top-0 left-0 right-0 z-50 text-center py-12 px-6 bg-gradient-to-b from-[rgba(3,5,18,0.95)] via-[rgba(3,5,18,0.8)] to-transparent">
            <h1 className="text-3xl font-bold text-white font-serif text-shadow-[0_0_20px_rgba(212,168,83,0.4)] mb-2">传记宇宙</h1>
            <p className="text-sm text-white/60">滑动探索，点击星星聆听故事</p>
          </div>

          <div className="absolute inset-0 overflow-auto">
            <div className="relative w-[200%] h-[200%]">
              <div className="absolute inset-0 bg-radial-gradient from-[#0a1635] via-[#030512] to-black"></div>
              
              <div className="absolute inset-0 pointer-events-none">
                {bgStars.map((star) => (
                  <div
                    key={star.id}
                    className="absolute animate-twinkle"
                    style={{
                      left: `${star.x}%`,
                      top: `${star.y}%`,
                      opacity: star.opacity,
                      width: `${star.size}px`,
                      height: `${star.size}px`,
                      animationDuration: `${star.duration}s`,
                      animationDelay: `${star.delay}s`
                    }}
                  >
                    <div className="w-full h-full bg-white rounded-full"></div>
                  </div>
                ))}
              </div>

              {BIOGRAPHIES.map((biography) => (
                <button
                  key={biography.id}
                  onClick={() => clickStar(biography)}
                  className="absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{
                    left: `${(biography.starPosition.x / 1600) * 100}%`,
                    top: `${(biography.starPosition.y / 1600) * 100}%`,
                    width: `${biography.starSize}px`,
                    height: `${biography.starSize}px`
                  }}
                >
                  <div
                    className="absolute rounded-full animate-star-pulse"
                    style={{
                      width: '40%',
                      height: '40%',
                      backgroundColor: biography.starColor,
                      boxShadow: `0 0 20px ${biography.starColor}`
                    }}
                  />
                  <div
                    className="absolute rounded-full border-2 animate-star-rotate"
                    style={{
                      width: '80%',
                      height: '80%',
                      borderColor: biography.starColor,
                      opacity: 0.6
                    }}
                  />
                  <div
                    className="absolute rounded-full animate-star-glow"
                    style={{
                      width: '150%',
                      height: '150%',
                      backgroundColor: biography.starColor,
                      opacity: 0.15,
                      filter: 'blur(10px)'
                    }}
                  />
                  <span className="relative z-1 text-white font-bold text-sm font-serif">
                    {biography.avatar}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedStar && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6" onClick={closeStarPopup}>
              <div className="w-full max-w-md bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-2xl p-8 relative border border-[rgba(212,168,83,0.3)]" onClick={(e) => e.stopPropagation()}>
                <div className="w-20 h-20 rounded-full border-2 border-[rgba(212,168,83,0.6)] overflow-hidden mx-auto mb-4">
                  <div className="w-full h-full bg-gradient-to-br from-[#d4a853] to-[#c73e3a] flex items-center justify-center">
                    <span className="text-3xl font-serif text-white">{selectedStar.avatar}</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white text-center mb-2">{selectedStar.name}</h2>
                <p className="text-sm text-white/60 text-center mb-4">{selectedStar.bio}</p>
                <p className="text-sm text-white/80 text-center mb-6 font-serif leading-relaxed">{selectedStar.intro}</p>
                <button
                  onClick={startReading}
                  className="w-full py-3 bg-gradient-to-r from-[#d4a853] to-[#e5c06f] rounded-xl text-lg font-semibold text-[#030512]"
                >
                  开始阅读
                </button>
                <button
                  onClick={closeStarPopup}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
                >
                  <div className="relative w-6 h-6">
                    <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-white/60 transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                    <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-white/60 transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'cover' && (
        <div className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#030512] via-[#0c122e] to-[#1a1a2e]"></div>
          <div className="absolute inset-0 pointer-events-none">
            {bgStars.map((star) => (
              <div
                key={star.id}
                className="absolute animate-twinkle"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  opacity: star.opacity,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  animationDuration: `${star.duration}s`,
                  animationDelay: `${star.delay}s`
                }}
              >
                <div className="w-full h-full bg-white rounded-full"></div>
              </div>
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center pt-24 px-6">
            <div className="w-24 h-24 rounded-full border-2 border-[rgba(212,168,83,0.6)] overflow-hidden mb-8">
              <div className="w-full h-full bg-gradient-to-br from-[#d4a853] to-[#c73e3a] flex items-center justify-center">
                <span className="text-4xl font-serif text-white">{currentBiography.avatar}</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white font-serif mb-4">{currentBiography.name}</h1>
            <p className="text-lg text-white/70 mb-2">{currentBiography.bio}</p>
            <p className="text-sm text-white/50 mb-8">2026年7月</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-px bg-gradient-to-r from-transparent to-[#d4a853]"></div>
              <div className="w-3 h-3 bg-[#d4a853] transform rotate-45 shadow-[0_0_10px_rgba(212,168,83,0.6)]"></div>
              <div className="w-20 h-px bg-gradient-to-l from-transparent to-[#d4a853]"></div>
            </div>
            <span className="px-6 py-2 bg-[rgba(212,168,83,0.15)] text-[#d4a853] rounded-full text-sm mb-12">
              {currentBiography.tag}
            </span>

            <button
              onClick={openBook}
              className="px-10 py-4 bg-gradient-to-r from-[#d4a853] to-[#e5c06f] rounded-full flex items-center gap-3 shadow-[0_4px_20px_rgba(212,168,83,0.4)]"
            >
              <span className="text-lg font-semibold text-[#030512]">翻开人生之书</span>
              <span className="text-xl animate-arrow-move">→</span>
            </button>
          </div>
        </div>
      )}

      {viewMode === 'content' && (
        <>
          <div ref={contentRef} className="h-screen overflow-auto p-6 pb-24">
            <div className="text-center mb-8 pt-4">
              <h1 className="text-2xl font-bold text-white font-serif mb-2">{currentBiography.name}的人生故事</h1>
              <p className="text-sm text-white/60">{currentBiography.bio}</p>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-5 h-5">
                  <div className="absolute inset-0 bg-[#d4a853] rounded-sm"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-[rgba(212,168,83,0.5)] rounded-b-sm"></div>
                </div>
                <h2 className="text-lg font-semibold text-[#d4a853]">人生时间线</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {currentBiography.timeline.map((item, index) => (
                  <div key={index} className="flex flex-col items-center min-w-[100px] p-3 bg-white/6 rounded-lg">
                    <div className="w-3 h-3 bg-[#d4a853] rounded-full mb-2 shadow-[0_0_8px_rgba(212,168,83,0.6)]"></div>
                    <span className="text-sm font-bold text-white">{item.year}</span>
                    <span className="text-xs text-white/60 truncate max-w-[90px]">{item.event}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-[#d4a853] mb-4">引言</h3>
              <p className="text-base text-white/80 leading-relaxed font-serif whitespace-pre-line">
                {currentBiography.intro}
              </p>
            </div>

            {currentBiography.chapters.map((chapter, index) => (
              <div key={index} className="mb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-[rgba(212,168,83,0.2)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-[#d4a853]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white">{chapter.title}</h3>
                    <span className="text-sm text-white/50">{chapter.year}</span>
                  </div>
                  {chapter.emotion && (
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80">
                      {chapter.emotion}
                    </span>
                  )}
                </div>

                {index < 4 && (
                  <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-xl p-4 mb-4 flex flex-col items-center">
                    <div className="relative w-32 h-24 mb-3">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#d4a853]"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#d4a853]"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#d4a853]"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#d4a853]"></div>
                      <div className="absolute top-2 left-2 right-2 bottom-2 bg-[rgba(212,168,83,0.1)] rounded"></div>
                    </div>
                    <span className="text-sm font-semibold text-white mb-1">{currentBiography.photos[index]?.title}</span>
                    <span className="text-xs text-white/50">{currentBiography.photos[index]?.desc}</span>
                  </div>
                )}

                <div className="bg-white/4 rounded-xl p-5">
                  <p className="text-base text-white/85 leading-relaxed font-serif whitespace-pre-line">
                    {chapter.content}
                  </p>
                </div>

                {chapter.quote && (
                  <div className="mt-4 p-4 bg-[rgba(212,168,83,0.12)] border-l-4 border-[#d4a853] rounded-r-xl">
                    <span className="text-2xl text-[#d4a853] leading-none block mb-2">"</span>
                    <p className="text-base text-white/85 italic leading-relaxed">{chapter.quote}</p>
                    <span className="text-sm text-[#d4a853] mt-2 block">—— {currentBiography.name}</span>
                  </div>
                )}
              </div>
            ))}

            <div className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-[#d4a853] mb-4">写在最后</h3>
              <p className="text-base text-white/80 leading-relaxed font-serif whitespace-pre-line mb-6">
                {currentBiography.ending}
              </p>
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative w-4 h-3">
                    <div className="absolute inset-0 bg-[#e74c3c] rounded"></div>
                    <div className="absolute bottom-0 left-0 right-0 border-l-[9px] border-r-[9px] border-t-[9px] border-transparent border-t-[#e74c3c]"></div>
                  </div>
                  <span className="text-sm font-semibold text-[#e74c3c]">家人寄语</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  {currentBiography.familyView.content}
                </p>
              </div>
            </div>

            <div className="text-center py-10">
              <div className="w-4 h-4 bg-[#d4a853] transform rotate-45 mx-auto mb-4"></div>
              <p className="text-sm text-white/30 tracking-widest mb-2">THE END</p>
              <p className="text-xs text-white/20">小传 · 记录每一个不平凡的人生</p>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-[rgba(7,11,31,0.95)] backdrop-blur-md border-t border-white/10 px-6 py-3 flex items-center justify-between">
            <button onClick={closeBook} className="flex flex-col items-center gap-1">
              <div className="relative w-5 h-5">
                <div className="absolute top-1/2 left-1/2 w-3 h-0.5 bg-white/80 transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                <div className="absolute top-1/2 left-1/2 w-3 h-0.5 bg-white/80 transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
              </div>
              <span className="text-xs text-white/50">关闭</span>
            </button>
            <div className="px-4 py-2 bg-[rgba(212,168,83,0.2)] rounded-full">
              <span className="text-sm text-[#d4a853]">
                {currentChapter + 1} / {currentBiography.chapters.length}
              </span>
            </div>
            <button onClick={toggleTableOfContents} className="flex flex-col items-center gap-1">
              <div className="flex flex-col gap-1">
                <div className="w-3 h-0.5 bg-white/80"></div>
                <div className="w-3 h-0.5 bg-white/80"></div>
                <div className="w-3 h-0.5 bg-white/80"></div>
              </div>
              <span className="text-xs text-white/50">目录</span>
            </button>
          </div>

          {showTableOfContents && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={toggleTableOfContents}>
              <div className="w-[85%] max-h-[70%] bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-2xl border border-[rgba(212,168,83,0.3)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                  <h3 className="text-xl font-bold text-white">目录</h3>
                  <button onClick={toggleTableOfContents} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <div className="relative w-5 h-5">
                      <div className="absolute top-1/2 left-1/2 w-3 h-0.5 bg-white/60 transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                      <div className="absolute top-1/2 left-1/2 w-3 h-0.5 bg-white/60 transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
                    </div>
                  </button>
                </div>
                <div className="h-[60vh] overflow-y-auto p-2">
                  {currentBiography.chapters.map((chapter, index) => (
                    <button
                      key={index}
                      onClick={() => jumpToChapter(index)}
                      className={`flex items-center p-3 rounded-lg mb-1 transition-all ${
                        currentChapter === index ? 'bg-[rgba(212,168,83,0.2)]' : ''
                      }`}
                    >
                      <span className="text-sm font-semibold text-[#d4a853] mr-3">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className={`text-sm flex-1 truncate ${currentChapter === index ? 'text-white' : 'text-white/80'}`}>
                        {chapter.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes star-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes star-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes star-glow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.1); }
        }
        @keyframes arrow-move {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }
        .animate-twinkle { animation: twinkle infinite ease-in-out; }
        .animate-star-pulse { animation: star-pulse 3s ease-in-out infinite; }
        .animate-star-rotate { animation: star-rotate 8s linear infinite; }
        .animate-star-glow { animation: star-glow 4s ease-in-out infinite; }
        .animate-arrow-move { animation: arrow-move 1.5s ease-in-out infinite; }
        .bg-radial-gradient { background: radial-gradient(ellipse at center, #0a1635 0%, #030512 50%, #000000 100%); }
      `}</style>
    </div>
  );
}