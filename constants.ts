import type { SentenceData, PoliticsTopic, SubstrateInfo, MetabolicPathway } from './types';

export const SENTENCES_DATA: SentenceData[] = [
  {
    id: 1,
    sentence: "After six months of arguing and final 16 hours of hot parliamentary debates, Australia's Northern (Territory) became the first legal authority in the world to allow doctors to take the lives of incurably ill patients who wish to die.",
    annotations: [
      { text: "parliamentary debates", explanation: "议会辩论\nparliamentary (adj.): 议会的, 国会的", type: 'phrase' },
      { text: "Territory", explanation: "领土, 地区 (n.)", type: 'vocabulary' },
      { text: "allow doctors to", explanation: "句型: allow somebody to do something\n允许医生去...", type: 'grammar' },
      { text: "take the lives of", explanation: "夺走...的生命, 结束...的生命", type: 'phrase' },
      { text: "incurably", explanation: "无法治愈地 (adv.)\ncurable (adj.): 可治愈的", type: 'vocabulary' },
    ],
    fullTranslation: "经过六个月的争论和最后16小时激烈的议会讨论，澳大利亚北领地成为世界上第一个允许医生帮助那些绝症患者提前解脱的合法当局。"
  },
  {
    id: 2,
    sentence: "The casual friendliness of many Americans should be interpreted neither as superficial nor as artificial, but as the result of a historically developed cultural tradition.",
    annotations: [
      { text: "casual friendliness", explanation: "随意的友善", type: 'phrase' },
      { text: "should be interpreted", explanation: "被动语态: 应该被解释为", type: 'grammar' },
      { text: "neither as ... nor as ...", explanation: "句型: 既不...也不...", type: 'grammar' },
      { text: "superficial", explanation: "肤浅的, 表面的 (adj.)", type: 'vocabulary' },
      { text: "artificial", explanation: "虚假的, 人造的 (adj.)", type: 'vocabulary' },
      { text: "cultural tradition", explanation: "文化传统", type: 'phrase' },
    ],
    fullTranslation: "许多美国人那种随意的友善，既不应被看作是肤浅的，也不应被看作是虚伪的，而应被看作是一种历史上发展起来的文化传统的结果。"
  }
];

export const POLITICS_DATA: PoliticsTopic[] = [
  {
    id: 'marxism',
    title: '马克思主义哲学',
    cards: [
      { id: 'm1', term: '物质和意识的关系', explanation: '物质决定意识，意识是物质的反映。意识具有能动作用，能够反作用于物质。', details: ['这是马克思主义哲学的基本问题。', '承认物质第一性，意识第二性，是唯物主义的基本观点。'] },
      { id: 'm2', term: '唯物辩证法', explanation: '是关于自然、社会和思维发展普遍规律的科学。核心是“对立统一规律”。', details: ['三大规律：对立统一、质量互变、否定之否定。', '五大范畴：原因与结果、必然与偶然、可能与现实、现象与本质、内容与形式。'] },
      { id: 'm3', term: '实践的观点', explanation: '实践是马克思主义哲学首要和基本的观点。实践是检验真理的唯一标准。', details: ['实践的特征：客观实在性、主观能动性、社会历史性。'] },
      { id: 'm4', term: '社会基本矛盾', explanation: '生产力和生产关系的矛盾、经济基础和上层建筑的矛盾。', details: ['这两对矛盾贯穿于人类社会的始终，并决定着社会形态的更替。'] },
    ],
    quiz: {
      questions: [
        { question: '马克思主义哲学的基本问题是？', options: ['A. 物质和意识的关系问题', 'B. 实践和真理的关系问题', 'C. 社会存在和社会意识的关系问题'], answerIndex: 0, explanation: '物质和意识的关系问题是哲学的基本问题，也是马克思主义哲学的基本问题。' },
        { question: '唯物辩证法的核心是？', options: ['A. 质量互变规律', 'B. 对立统一规律', 'C. 否定之否定规律'], answerIndex: 1, explanation: '对立统一规律（即矛盾规律）揭示了事物发展的源泉和动力，是唯物辩证法的核心。' },
        { question: '检验真理的唯一标准是？', options: ['A. 实践', 'B. 逻辑证明', 'C. 多数人的意见', 'D. 科学理论'], answerIndex: 0, explanation: '实践是检验认识是否具有真理性的唯一标准，这是由真理的本性和实践的特点决定的。' },
        { question: '“沉舟侧畔千帆过，病树前头万木春”包含了什么哲学道理？', options: ['A. 矛盾是普遍存在的', 'B. 新事物必然战胜旧事物', 'C. 质变是量变的必然结果'], answerIndex: 1, explanation: '这句诗形象地说明了新陈代谢是宇宙间普遍的、不可抗拒的规律，即新事物必然会取代旧事物。' },
        { question: '世界的统一性在于它的？', options: ['A. 多样性', 'B. 运动性', 'C. 物质性', 'D. 矛盾性'], answerIndex: 2, explanation: '马克思主义哲学认为，世界的本原是物质，世界的统一性在于它的物质性。' },
        { question: '意识的能动作用突出表现在？', options: ['A. 意识能够反映事物的本质和规律', 'B. 意识能够指导实践改造客观世界', 'C. 意识具有目的性和计划性', 'D. 意识可以创造物质'], answerIndex: 1, explanation: '意识的能动作用不仅在于能动地认识世界，更重要的在于能动地改造世界。意识指导实践，通过实践把观念的东西变成现实的东西。' },
        { question: '量变和质变的辩证关系是？', options: ['A. 量变是质变的必要准备', 'B. 质变是量变的必然结果', 'C. 量变和质变相互渗透', 'D. 以上都对'], answerIndex: 3, explanation: '量变是质变的前提和必要准备，质变是量变的必然结果，同时在量变过程中有部分质变，质变过程中也有量的扩张，二者是相互渗透的。' },
        { question: '社会历史发展的根本动力是？', options: ['A. 阶级斗争', 'B. 科学技术革命', 'C. 社会基本矛盾运动', 'D. 英雄人物的活动'], answerIndex: 2, explanation: '生产力和生产关系、经济基础和上层建筑的矛盾是社会基本矛盾，其运动是社会发展的根本动力。' }
      ]
    }
  },
  {
    id: 'mao-thought',
    title: '毛泽东思想',
    cards: [
        { id: 'mt1', term: '实事求是', explanation: '毛泽东思想的精髓，指从客观实际出发，找出其固有的规律性，作为我们行动的向导。', details: ['是党的思想路线的核心。', '包含三层含义：一切从实际出发、理论联系实际、在实践中检验和发展真理。'] },
        { id: 'mt2', term: '群众路线', explanation: '一切为了群众，一切依靠群众，从群众中来，到群众中去。', details: ['是党的生命线和根本工作路线。'] },
        { id: 'mt3', term: '新民主主义革命理论', explanation: '指在半殖民地半封建的中国，由无产阶级领导的，人民大众的，反对帝国主义、封建主义和官僚资本主义的革命。', details: ['核心问题是无产阶级领导权。', '革命三大法宝：统一战线、武装斗争、党的建设。'] },
    ],
    quiz: {
      questions: [
        { question: '毛泽东思想的精髓是？', options: ['A. 群众路线', 'B. 独立自主', 'C. 实事求是'], answerIndex: 2, explanation: '实事求是、群众路线、独立自主是毛泽东思想活的灵魂的三个基本方面，其中实事求是是精髓。' },
        { question: '新民主主义革命的三大法宝不包括？', options: ['A. 统一战线', 'B. 武装斗争', 'C. 土地革命', 'D. 党的建设'], answerIndex: 2, explanation: '土地革命是新民主主义革命的基本内容，但三大法宝是指导革命取得胜利的三个关键，即统一战线、武装斗争和党的建设。' },
        { question: '中国革命最基本的动力是？', options: ['A. 资产阶级', 'B. 无产阶级', 'C. 农民阶级', 'D. 民族资产阶级'], answerIndex: 1, explanation: '无产阶级是中国革命最基本的动力，是新的生产力的代表者，是最进步的阶级。' },
        { question: '“工农武装割据”思想的基本内容是？', options: ['A. 土地革命、武装斗争、农村革命根据地建设', 'B. 统一战线、武装斗争、党的建设', 'C. 政治、经济、文化斗争'], answerIndex: 0, explanation: '“工农武装割据”思想是指在中国共产党领导下，以武装斗争为主要形式，以土地革命为中心内容，以农村革命根据地为战略阵地，三者密切结合。' },
        { question: '党的三大优良作风是？', options: ['A. 实事求是、群众路线、独立自主', 'B. 理论和实际相结合的作风、和人民群众紧密地联系在一起的作风、自我批评的作风', 'C. 谦虚、谨慎、不骄、不躁的作风'], answerIndex: 1, explanation: '1945年毛泽东在党的七大政治报告《论联合政府》中，对党的三大优良作风作了概括。' },
        { question: '新民主主义社会的五种经济成分中，处于领导地位的是？', options: ['A. 国营经济', 'B. 合作社经济', 'C. 个体经济', 'D. 国家资本主义经济'], answerIndex: 0, explanation: '国营经济（即社会主义性质的经济）是新民主主义社会经济的领导力量和决定因素。' },
        { question: '我国对资本主义工商业进行社会主义改造采取的政策是？', options: ['A. 没收', 'B. 和平赎买', 'C. 限制', 'D. 合并'], answerIndex: 1, explanation: '党对资本主义工商业采取利用、限制、改造的政策，通过国家资本主义的形式，实行和平赎买，逐步将其改造成为社会主义全民所有制企业。' }
      ]
    }
  },
  {
    id: 'xi-thought',
    title: '习思想',
    cards: [
      { id: 'xi1', term: '中国梦', explanation: '实现中华民族伟大复兴，是近代以来中华民族最伟大的梦想。', details: ['基本内涵：国家富强、民族振兴、人民幸福。', '实现中国梦必须走中国道路、弘扬中国精神、凝聚中国力量。'] },
      { id: 'xi2', term: '“五位一体”总体布局', explanation: '指经济建设、政治建设、文化建设、社会建设、生态文明建设五位一体。', details: ['是中国特色社会主义事业的总体布局。'] },
      { id: 'xi3', term: '“四个全面”战略布局', explanation: '全面建成小康社会、全面深化改革、全面依法治国、全面从严治党。', details: ['是党在新形势下治国理政的总方略。'] },
      { id: 'xi4', term: '人类命运共同体', explanation: '指在追求本国利益时兼顾他国合理关切，在谋求本国发展中促进各国共同发展。', details: ['核心是“建设持久和平、普遍安全、共同繁荣、开放包容、清洁美丽的世界”。'] },
    ],
    quiz: {
      questions: [
        { question: '“五位一体”总体布局不包括以下哪个方面？', options: ['A. 经济建设', 'B. 国防建设', 'C. 生态文明建设', 'D. 政治建设'], answerIndex: 1, explanation: '“五位一体”指的是经济、政治、文化、社会、生态文明建设，不直接包括国防建设。' },
        { question: '“四个全面”战略布局中，起引领作用的是？', options: ['A. 全面建成小康社会', 'B. 全面深化改革', 'C. 全面依法治国', 'D. 全面从严治党'], answerIndex: 0, explanation: '全面建成小康社会是“四个全面”战略布局的战略目标，居于引领地位。' },
        { question: '新发展理念的核心是？', options: ['A. 创新', 'B. 协调', 'C. 绿色', 'D. 共享'], answerIndex: 3, explanation: '新发展理念是创新、协调、绿色、开放、共享，其中共享是中国特色社会主义的本质要求，是发展的出发点和落脚点。' },
        { question: '我国社会主要矛盾已经转化为？', options: ['A. 人民日益增长的物质文化需要同落后的社会生产之间的矛盾', 'B. 人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾', 'C. 无产阶级和资产阶级的矛盾'], answerIndex: 1, explanation: '党的十九大报告指出，我国社会主要矛盾已经转化为人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾。' },
        { question: '建设现代化经济体系的战略目标是？', options: ['A. 实现高质量发展', 'B. 建设创新型国家', 'C. 实施乡村振兴战略'], answerIndex: 0, explanation: '建设现代化经济体系是我国发展的战略目标，推动经济发展质量变革、效率变革、动力变革，着力点在于实体经济，关键是实现高质量发展。' },
        { question: '全面依法治国的总目标是？', options: ['A. 建设中国特色社会主义法治体系，建设社会主义法治国家', 'B. 有法可依，有法必依，执法必严，违法必究', 'C. 科学立法，严格执法，公正司法，全民守法'], answerIndex: 0, explanation: '总目标是建设中国特色社会主义法治体系，建设社会主义法治国家。' },
        { question: '“一带一路”建设秉持的原则是？', options: ['A. 独立自主、和平共处', 'B. 互不干涉内政、平等互利', 'C. 共商、共建、共享', 'D. 求同存异、和平竞争'], answerIndex: 2, explanation: '“一带一路”建设遵循共商、共建、共享的原则，旨在促进沿线国家经济合作与发展。' }
      ]
    }
  },
  {
    id: 'modern-history',
    title: '中国近现代史纲要',
    cards: [
        { id: 'mh1', term: '近代中国的社会性质', explanation: '半殖民地半封建社会。', details: ['始于1840年鸦片战争。', '主要矛盾：帝国主义和中华民族的矛盾，封建主义和人民大众的矛盾。'] },
        { id: 'mh2', term: '五四运动', explanation: '1919年爆发，是中国新民主主义革命的开端。', details: ['彻底反帝反封建的革命运动。', '促进了马克思主义在中国的传播。'] },
        { id: 'mh3', term: '遵义会议', explanation: '1935年召开，事实上确立了毛泽东在党和红军中的领导地位。', details: ['挽救了党、挽救了红军、挽救了中国革命，是党的历史上一个生死攸关的转折点。'] },
    ],
    quiz: {
      questions: [
        { question: '中国新民主主义革命的开端是？', options: ['A. 辛亥革命', 'B. 五四运动', 'C. 中国共产党成立'], answerIndex: 1, explanation: '五四运动标志着工人阶级作为独立的政治力量登上历史舞台，是新民主主义革命的开端。' },
        { question: '中国近代史上第一个不平等条约是？', options: ['A. 《北京条约》', 'B. 《马关条约》', 'C. 《南京条约》', 'D. 《辛丑条约》'], answerIndex: 2, explanation: '1842年签订的《南京条约》是中国近代史上第一个不平等条约，标志着中国开始沦为半殖民地半封建社会。' },
        { question: '洋务运动的指导思想是？', options: ['A. 师夷长技以制夷', 'B. 中学为体，西学为用', 'C. 维新变法', 'D. 扶清灭洋'], answerIndex: 1, explanation: '“中学为体，西学为用”是洋务运动的指导思想，主张在不改变封建制度的前提下，学习西方的先进技术。' },
        { question: '辛亥革命失败的根本原因是？', options: ['A. 帝国主义的破坏', 'B. 没有彻底的反帝反封建的革命纲领', 'C. 资产阶级的软弱性和妥协性', 'D. 袁世凯窃取革命果实'], answerIndex: 2, explanation: '由于中国民族资产阶级的软弱性和妥协性，他们不敢彻底地反帝反封建，这是辛亥革命失败的根本原因。' },
        { question: '打响武装反抗国民党反动派第一枪的是？', options: ['A. 秋收起义', 'B. 南昌起义', 'C. 广州起义', 'D. 武昌起义'], answerIndex: 1, explanation: '1927年8月1日的南昌起义，打响了武装反抗国民党反动派的第一枪，标志着中国共产党独立领导革命战争的开始。' },
        { question: '标志着第一次国共合作正式形成的会议是？', options: ['A. 中共三大', 'B. 国民党一大', 'C. 中共一大', 'D. 国民党二大'], answerIndex: 1, explanation: '1924年1月，中国国民党第一次全国代表大会在广州召开，标志着第一次国共合作的正式形成。' }
      ]
    }
  },
  {
    id: 'ethics-law',
    title: '思修法基',
    cards: [
        { id: 'el1', term: '社会主义核心价值观', explanation: '国家层面：富强、民主、文明、和谐；社会层面：自由、平等、公正、法治；个人层面：爱国、敬业、诚信、友善。', details: ['是当代中国精神的集中体现，是凝聚中国力量的思想道德基础。'] },
        { id: 'el2', term: '法治思维', explanation: '指以法治的价值和精神为导向，运用法律规范、原则和技术来分析、解决问题的思维方式。', details: ['与人治思维相对立。', '法律的权威源自人民的内心拥护和真诚信仰。'] },
        { id: 'el3', term: '人生价值', explanation: '包含自我价值和社会价值两个方面。人生的社会价值是人生价值的最基本内容。', details: ['衡量人生价值的标准，最重要的是看一个人对社会所作的贡献。'] },
    ],
    quiz: {
      questions: [
        { question: '社会主义核心价值观在社会层面不包括？', options: ['A. 自由', 'B. 敬业', 'C. 平等', 'D. 法治'], answerIndex: 1, explanation: '“敬业”属于个人层面的价值准则，社会层面是“自由、平等、公正、法治”。' },
        { question: '我国法律的本质是？', options: ['A. 统治阶级意志的体现', 'B. 全体人民意志的体现', 'C. 党的主张和人民意志的统一', 'D. 社会契约的产物'], answerIndex: 2, explanation: '我国社会主义法律是中国共产党的主张和人民意志的统一体现，是党领导人民当家作主的制度保障。' },
        { question: '个人理想与社会理想的关系是？', options: ['A. 个人理想决定社会理想', 'B. 社会理想是个人理想的凝练和升华', 'C. 二者没有必然联系', 'D. 二者是相互对立的'], answerIndex: 1, explanation: '社会理想规定、指引着个人理想，是个人理想的凝练和升华。个人理想的实现，必须以社会理想的实现为前提和基础。' },
        { question: '爱国主义的时代价值体现在？', options: ['A. 维护国家统一和民族团结的纽带', 'B. 实现中华民族伟大复兴的动力', 'C. 构筑中华民族共同体意识的基础', 'D. 以上都是'], answerIndex: 3, explanation: '在新时代，爱国主义是维护国家统一和民族团结的纽带，是实现中华民族伟大复兴的强大精神动力。' },
        { question: '我国宪法规定的根本制度是？', options: ['A. 人民代表大会制度', 'B. 社会主义制度', 'C. 民族区域自治制度', 'D. 基层群众自治制度'], answerIndex: 1, explanation: '《中华人民共和国宪法》第一条第二款规定：“社会主义制度是中华人民共和国的根本制度。”' }
      ]
    }
  }
];

export const SUBSTRATES: SubstrateInfo[] = [
    { id: 'glucose', name: '葡萄糖', formula: 'C₆H₁₂O₆' },
    { id: 'glycogen', name: '糖原'},
    { id: 'palmitic_acid', name: '软脂酸 (16C)', formula: 'C₁₆H₃₂O₂' },
];

export const METABOLIC_PATHWAYS_DATA: MetabolicPathway[] = [
    {
        id: 'glucose_aerobic',
        substrate: 'glucose',
        condition: 'aerobic',
        name: '葡萄糖有氧氧化',
        description: '1摩尔葡萄糖在充足氧气供应下，通过糖酵解、三羧酸循环和氧化磷酸化彻底分解为CO₂和H₂O的过程。',
        steps: [
            { title: '阶段一：糖酵解 (胞质)', nadh: 2, fadh2: 0, atp_gtp: 2, details: '1分子葡萄糖分解为2分子丙酮酸，净产生2 ATP和2 NADH。' },
            { title: '阶段二：丙酮酸脱羧 (线粒体基质)', nadh: 2, fadh2: 0, atp_gtp: 0, details: '2分子丙酮酸进入线粒体，氧化脱羧形成2分子乙酰辅酶A，产生2 NADH。' },
            { title: '阶段三：三羧酸循环 (线粒体基质)', nadh: 6, fadh2: 2, atp_gtp: 2, details: '2分子乙酰辅酶A进入三羧酸循环，共产生6 NADH, 2 FADH₂, 和 2 GTP (相当于 2 ATP)。' },
        ],
        oxygen_needed_per_mol: () => 6,
        co2_produced_per_mol: () => 6,
        final_note: '按一个NADH产生2.5个ATP，一个FADH₂产生1.5个ATP计算。总计: 2 ATP (糖酵解) + 2 GTP (三羧酸循环) + 10 NADH * 2.5 + 2 FADH₂ * 1.5 = 4 + 25 + 3 = 32 ATP。'
    },
     {
        id: 'glycogen_aerobic',
        substrate: 'glycogen',
        condition: 'aerobic',
        name: '糖原有氧氧化',
        description: '1摩尔葡萄糖基在充足氧气供应下，从糖原分解开始，彻底氧化分解的过程。',
        steps: [
            { title: '阶段一：糖原分解&糖酵解 (胞质)', nadh: 2, fadh2: 0, atp_gtp: 3, details: '糖原磷酸化分解为葡糖-1-磷酸，再转变为葡糖-6-磷酸进入糖酵解，此过程不消耗ATP，故净产生3 ATP和2 NADH。' },
            { title: '阶段二：丙酮酸脱羧 (线粒体基质)', nadh: 2, fadh2: 0, atp_gtp: 0, details: '2分子丙酮酸进入线粒体，氧化脱羧形成2分子乙酰辅酶A，产生2 NADH。' },
            { title: '阶段三：三羧酸循环 (线粒体基质)', nadh: 6, fadh2: 2, atp_gtp: 2, details: '2分子乙酰辅酶A进入三羧酸循环，共产生6 NADH, 2 FADH₂, 和 2 GTP (相当于 2 ATP)。' },
        ],
        oxygen_needed_per_mol: () => 6,
        co2_produced_per_mol: () => 6,
        final_note: '总计: 3 ATP (糖酵解) + 2 GTP (三羧酸循环) + 10 NADH * 2.5 + 2 FADH₂ * 1.5 = 5 + 25 + 3 = 33 ATP。'
    },
    {
        id: 'glucose_anaerobic',
        substrate: 'glucose',
        condition: 'anaerobic',
        name: '葡萄糖无氧酵解',
        description: '1摩尔葡萄糖在无氧条件下，在细胞质中通过糖酵解分解为乳酸的过程。',
        steps: [
            { title: '阶段一：糖酵解 (胞质)', nadh: 2, fadh2: 0, atp_gtp: 2, details: '1分子葡萄糖分解为2分子丙酮酸，净产生2 ATP和2 NADH。' },
            { title: '阶段二：乳酸生成 (胞质)', nadh: -2, fadh2: 0, atp_gtp: 0, details: '为了让糖酵解持续进行，2分子丙酮酸被2 NADH还原为2分子乳酸，消耗了糖酵解产生的NADH。' },
        ],
        oxygen_needed_per_mol: () => 0,
        co2_produced_per_mol: () => 0,
        final_note: '整个过程在线粒体外完成，没有氧气参与，NADH被循环利用，因此最终净生成的ATP只有2个。'
    },
    {
        id: 'palmitic_acid_aerobic',
        substrate: 'palmitic_acid',
        condition: 'aerobic',
        name: '软脂酸(16C)有氧氧化',
        description: '1摩尔软脂酸（16碳饱和脂肪酸）在线粒体中通过β-氧化和三羧酸循环彻底分解的过程。',
        steps: [
            { title: '活化过程 (胞质)', nadh: 0, fadh2: 0, atp_gtp: -2, details: '软脂酸在进入线粒体前需要活化，此过程消耗2个高能磷酸键（相当于消耗2 ATP）。' },
            { title: 'β-氧化 (线粒体基质)', nadh: 7, fadh2: 7, atp_gtp: 0, details: '16碳的软脂酸进行 (16/2 - 1) = 7轮β-氧化，产生7 NADH 和 7 FADH₂。' },
            { title: '三羧酸循环 (线粒体基质)', nadh: 24, fadh2: 8, atp_gtp: 8, details: 'β-氧化共产生 16/2 = 8个乙酰辅酶A。每个乙酰辅酶A进入三羧酸循环产生3 NADH, 1 FADH₂, 1 GTP。总计 8 * 3=24 NADH, 8 * 1=8 FADH₂, 8 * 1=8 GTP。' },
        ],
        oxygen_needed_per_mol: () => 23,
        co2_produced_per_mol: () => 16,
        final_note: '总NADH = 7+24=31。总FADH₂ = 7+8=15。总ATP = (31 * 2.5) + (15 * 1.5) + 8 GTP - 2(活化) = 77.5 + 22.5 + 8 - 2 = 106 ATP。'
    }
];


export const DAILY_NOTES: string[] = [
  "考研人的每日寄语：每一个不曾起舞的日子，都是对生命的辜负。",
  "考研人的每日寄语：乾坤未定，你我皆是黑马。坚持住！",
  "考研人的每日寄语：星光不问赶路人，时光不负有心人。",
  "考研人的每日寄语：你的努力，终将成就无可替代的自己。",
  "考研人的每日寄语：乾坤未定，你我皆是黑马，冲啊！",
  "考研人的每日寄语：别让怯弱否定了自己，别让懒惰耽误了青春。",
  "考研人的每日寄语：今日事，今日毕，开启元气满满的一天！",
  "考研人的每日寄语：不是无所畏惧，而是带着恐惧依然前行。",
  "考研人的每日寄语：请再努力一下，为了你想见的人，想做的事，想成为的自己。",
  "考研人的每日寄语：你未来的样子，就藏在现在的努力里。",
];

export const FUN_FACTS: string[] = [
    "你知道吗？**'Goodbye'** 这个词其实是 **'God be with ye'** (上帝与你同在) 的缩写演变而来的。",
    "冷知识：在古罗马，紫色染料非常昂贵，只有皇帝和贵族才能穿紫色衣服，所以紫色至今仍有 **'皇室'** 和 **'高贵'** 的象征意义。",
    "英语小趣闻：**'nerd'** (书呆子) 这个词最早出现在苏斯博士 (Dr. Seuss) 的书 *'If I Ran the Zoo'* 中。",
    "政治小贴士：联合国安理会的五个常任理事国 (中、法、俄、英、美) 是二战的主要战胜国，它们都拥有 **'否决权'**。",
    "你知道吗？美国第一任总统乔治·华盛顿的牙齿 **不是木头做的**！他的假牙是用黄金、象牙、铅和人类及动物的牙齿混合制成的。",
    "医学小发现：人的胃酸强度非常高，**足以溶解一块刀片**。幸运的是，我们的胃壁细胞更新得非常快，可以保护胃部不受伤害。",
    "一个有趣的事实：我们身体里最强壮的肌肉，如果按其尺寸比例来算，其实是 **舌头**。",
    "英语里最短、最古老、最常用的词是 **'I'** (我)。",
    "医学史趣闻：在19世纪，**番茄酱** 曾被当作药品来销售，用来治疗消化不良等疾病。",
    "你知道吗？**'muscle'** (肌肉) 这个词来自拉丁语 'musculus'，意思是 **'小老鼠'**，因为古罗马人觉得二头肌收缩时就像一只小老鼠在皮下乱窜。"
];

export const BREAK_TIME_TIPS: string[] = [
  "休息一下吧！站起来走动一下，看看窗外。",
  "专注了这么久，很棒！喝杯水，让眼睛和大脑都放松一下。",
  "短暂的休息是为了更好地出发。可以听一首喜欢的歌。",
  "做得很好！给自己一个微笑，你正在向目标稳步前进。",
  "闭上眼睛，做几个深呼吸。感受一下平静。",
];

export const PLANT_EMOJIS: string[] = ['🌱', '🌸', '🌳', '🌻', '🌷', '🌲', '🍄', '🌵', '🍀', '🍁', '🌾', '🌺'];