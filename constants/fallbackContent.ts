import type { SentenceAnalysisData } from '../types';

// This is a simplified version of the main BriefingContent type in Dashboard/index.tsx
interface FallbackBriefingContent {
    focus: string;
    clarification: string;
    word: string;
}

export const FALLBACK_BRIEFING_CONTENTS: FallbackBriefingContent[] = [
    {
        focus: `- 心脏的传导系统\n- 剩余价值理论`,
        clarification: `**第一信号系统**与**第二信号系统**: 第一信号系统是具体信号刺激引起的条件反射，是人和动物共有的；第二信号系统是由语言文字信号引起的条件反射，是人类特有的。`,
        word: `**Ambiguous**\nEN: Open to more than one interpretation; not clear or decided.\nZH: 模棱两可的，不明确的\nEx: The election result was ambiguous.`
    },
    {
        focus: `- 肾小球的滤过作用\n- 矛盾的同一性和斗争性`,
        clarification: `**矛盾普遍性**与**矛盾特殊性**: 普遍性指矛盾存在于一切事物中，特殊性指具体矛盾的具体形式。`,
        word: `**Ubiquitous**\nEN: Present, appearing, or found everywhere.\nZH: 无处不在的，普遍存在的\nEx: Coffee shops are ubiquitous these days.`
    },
    {
        focus: `- DNA的半保留复制\n- 实践是检验真理的唯一标准`,
        clarification: `**现象**与**本质**: 现象是事物的外部联系和表面特征；本质是事物的内在联系和根本性质。现象与本质是统一的，现象表现本质，本质决定现象。`,
        word: `**Pragmatic**\nEN: Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.\nZH: 务实的，实用的\nEx: He took a pragmatic approach to management problems.`
    },
    {
        focus: `- 细胞凋亡 (Apoptosis)\n- 党的思想路线`,
        clarification: `**主观能动性**与**客观规律性**: 发挥主观能动性必须以尊重客观规律为前提，客观规律性制约主观能动性。`,
        word: `**Epitome**\nEN: A perfect example of a quality or type.\nZH: 缩影，典范\nEx: He is the epitome of a modern young man.`
    },
    {
        focus: `- 三羧酸循环 (TCA Cycle)\n- “四个全面”战略布局`,
        clarification: `**真理的绝对性**与**相对性**: 绝对性指真理的客观性和无限性；相对性指真理在一定条件下的具体性和近似性。`,
        word: `**Conundrum**\nEN: A confusing and difficult problem or question.\nZH: 难题，谜题\nEx: The government faces the conundrum of how to balance environmental protection and economic growth.`
    },
    {
        focus: `- 神经元的动作电位\n- 新民主主义革命的三大法宝`,
        clarification: `**量变**与**质变**: 量变是事物数量的增减和场所的变更；质变是事物根本性质的变化。量变是质变的必要准备，质变是量变的必然结果。`,
        word: `**Paradigm**\nEN: A typical example or pattern of something; a model.\nZH: 范例，典范\nEx: This discovery shifted the paradigm of our understanding of evolution.`
    },
    {
        focus: `- 糖异生过程\n- “五位一体”总体布局`,
        clarification: `**内因**与**外因**: 内因是事物发展的根本原因，外因是事物发展的条件，外因通过内因起作用。`,
        word: `**Lucrative**\nEN: Producing a great deal of profit.\nZH: 获利丰厚的\nEx: The business has proved to be highly lucrative.`
    },
    {
        focus: `- 免疫应答过程\n- 社会主义核心价值观`,
        clarification: `**必然**与**偶然**: 必然性指事物发展中合乎规律的、确定不移的趋势；偶然性则是不确定的、可以这样也可以那样的趋势。二者相互依存，必然性通过偶然性为自己开辟道路。`,
        word: `**Meticulous**\nEN: Showing great attention to detail; very careful and precise.\nZH: 一丝不苟的，缜密的\nEx: He was meticulous in his research.`
    },
    {
        focus: `- 基因突变与修复\n- 人类命运共同体`,
        clarification: `**个人价值**与**社会价值**: 个人价值指个体对自身存在的意义；社会价值指个体对社会的责任和贡献。人生的价值在于奉献。`,
        word: `**Alleviate**\nEN: Make (suffering, deficiency, or a problem) less severe.\nZH: 减轻，缓和\nEx: The medicine is designed to alleviate pain.`
    },
    {
        focus: `- 呼吸链与氧化磷酸化\n- 全面依法治国`,
        clarification: `**生产力**与**生产关系**: 生产力决定生产关系，生产关系对生产力具有反作用。生产关系一定要适合生产力状况，是社会发展的客观规律。`,
        word: `**Cognitive**\nEN: Relating to the mental process of perception, memory, judgment, and reasoning.\nZH: 认知的\nEx: Cognitive psychology is the study of how people think.`
    },
    {
        focus: `- 激素的分类与作用机制\n- 新发展理念`,
        clarification: `**感性认识**与**理性认识**: 感性认识是对事物现象的认识，理性认识是对事物本质的认识。感性认识是理性认识的基础，理性认识是感性认识的深化。`,
        word: `**Resilient**\nEN: Able to withstand or recover quickly from difficult conditions.\nZH: 有弹性的，能迅速恢复的\nEx: She is a resilient woman who has overcome many difficulties.`
    },
    {
        focus: `- 房室传导阻滞\n- 群众路线`,
        clarification: `**内容**与**形式**: 内容是构成事物的一切要素的总和，形式是这些要素的结构和表现方式。内容决定形式，形式反作用于内容。`,
        word: `**Inherent**\nEN: Existing in something as a permanent, essential, or characteristic attribute.\nZH: 固有的，内在的\nEx: There is an inherent risk in any investment.`
    },
    {
        focus: `- 贫血的分类与诊断\n- 实事求是`,
        clarification: `**运动**与**静止**: 运动是绝对的、无条件的、永恒的；静止是相对的、有条件的、暂时的。静止是运动的特殊状态。`,
        word: `**Profound**\nEN: Very great or intense; having or showing great knowledge or insight.\nZH: 深刻的，深远的\nEx: His speech had a profound impact on everyone.`
    },
    {
        focus: `- 高血压的发病机制\n- 辩证的否定观`,
        clarification: `**共性**与**个性**: 共性（普遍性）存在于个性（特殊性）之中，个性中包含着共性。任何事物都是共性与个性的统一。`,
        word: `**Empirical**\nEN: Based on, concerned with, or verifiable by observation or experience rather than theory or pure logic.\nZH: 经验主义的，以经验为依据的\nEx: They collected plenty of empirical data from their experiments.`
    },
    {
        focus: `- 动脉粥样硬化\n- 党的建设`,
        clarification: `**认识**与**实践**: 实践是认识的基础，是认识发展的动力，是检验认识真理性的唯一标准，也是认识的目的。`,
        word: `**Tenacious**\nEN: Tending to keep a firm hold of something; not readily relinquishing a position, principle, or course of action.\nZH: 顽强的，坚韧的\nEx: He is a tenacious competitor.`
    },
    {
        focus: `- 肺结核的病理变化\n- 和平与发展的时代主题`,
        clarification: `**经济基础**与**上层建筑**: 经济基础决定上层建筑，上层建筑对经济基础具有反作用。`,
        word: `**Catalyst**\nEN: A substance that increases the rate of a chemical reaction without itself undergoing any permanent chemical change.\nZH: 催化剂，促进因素\nEx: The new policy was a catalyst for change.`
    },
    {
        focus: `- 肝硬化的并发症\n- 中国特色社会主义理论体系`,
        clarification: `**社会存在**与**社会意识**: 社会存在决定社会意识，社会意识是社会存在的反映，并对社会存在具有能动的反作用。`,
        word: `**Acumen**\nEN: The ability to make good judgments and quick decisions, typically in a particular domain.\nZH: 敏锐，聪明\nEx: She has considerable business acumen.`
    },
    {
        focus: `- 休克的病理生理\n- 改革、发展、稳定的关系`,
        clarification: `**整体**与**部分**: 整体与部分相互依赖、密不可分。整体的功能不等于部分功能之和，要树立全局观念。`,
        word: `**Exacerbate**\nEN: Make (a problem, bad situation, or negative feeling) worse.\nZH: 使恶化，加剧\nEx: The new law will exacerbate existing problems.`
    },
    {
        focus: `- 糖尿病的诊断标准\n- 供给侧结构性改革`,
        clarification: `**可知论**与**不可知论**: 可知论认为世界是可以被认识的；不可知论否认认识世界的可能性。辩证唯物主义坚持可知论。`,
        word: `**Myriad**\nEN: A countless or extremely great number.\nZH: 无数，大量\nEx: There are a myriad of reasons why this could happen.`
    },
    {
        focus: `- 肾病综合征\n- “一国两制”`,
        clarification: `**主要矛盾**与**次要矛盾**: 主要矛盾在事物发展过程中处于支配地位、起决定作用；次要矛盾则处于从属地位。要坚持两点论和重点论的统一。`,
        word: `**Skepticism**\nEN: A skeptical attitude; doubt as to the truth of something.\nZH: 怀疑主义，怀疑态度\nEx: The report was met with widespread skepticism.`
    }
];

export const FALLBACK_SENTENCE_DATA: SentenceAnalysisData[] = [
    {
        sentence: "While the new census data reveal that the country is becoming more diverse, they also show that many of the divisions that have long shaped it remain.",
        translation: "虽然新的人口普查数据显示这个国家正变得更加多样化，但这些数据也表明，长期以来塑造这个国家的许多分歧依然存在。",
        components: [
            { text: "While the new census data reveal that the country is becoming more diverse", type: "clause", explanation: "让步状语从句，由 'While' 引导，表示“虽然...”。" },
            { text: "they", type: "subject", explanation: "主句的主语，代指 'the new census data'。" },
            { text: "also show", type: "predicate", explanation: "主句的谓语。" },
            { text: "that many of the divisions that have long shaped it remain", type: "clause", explanation: "宾语从句，作 'show' 的宾语。" },
            { text: "that have long shaped it", type: "clause", explanation: "定语从句，修饰 'divisions'。" },
        ]
    },
    {
        sentence: "The astonishing growth of the Internet has been a major source of concern for retailers, who have been worrying that their customers will abandon bricks-and-mortar stores for the convenience of shopping online.",
        translation: "互联网的惊人增长一直是零售商们主要担忧的来源，他们一直担心顾客会为了网络购物的便利而抛弃实体店。",
        components: [
            { text: "The astonishing growth of the Internet", type: "subject", explanation: "主语，核心词是 growth。" },
            { text: "has been", type: "predicate", explanation: "谓语，现在完成时。" },
            { text: "a major source of concern for retailers", type: "object", explanation: "宾语，说明增长是什么。" },
            { text: "who have been worrying that their customers will abandon bricks-and-mortar stores...", type: "clause", explanation: "非限制性定语从句，修饰 retailers，解释他们担忧的内容。" },
            { text: "that their customers will abandon...", type: "clause", explanation: "宾语从句，作 worrying 的宾语。" },
        ]
    },
    {
        sentence: "Governments that want to attract and retain talented people must invest in the quality of life that makes communities vibrant and appealing, not just low taxes and business-friendly regulations.",
        translation: "希望吸引和留住人才的政府，不仅要投资于低税收和亲商法规，还必须投资于能让社区充满活力和吸引力的生活质量。",
        components: [
            { text: "Governments", type: "subject", explanation: "主句的主语。" },
            { text: "that want to attract and retain talented people", type: "clause", explanation: "定语从句，修饰'Governments'。" },
            { text: "must invest in", type: "predicate", explanation: "主句的谓语。" },
            { text: "the quality of life", type: "object", explanation: "invest in 的宾语。" },
            { text: "that makes communities vibrant and appealing", type: "clause", explanation: "定语从句，修饰'the quality of life'。" },
            { text: "not just low taxes and business-friendly regulations", type: "phrase", explanation: "与 'the quality of life' 并列，是投资的另一方面，由'not just'引出。" }
        ]
    },
    {
        sentence: "The belief that success is determined by innate talent, a view that has been widely promoted in popular culture, is being challenged by new research suggesting that hard work and practice are far more important.",
        translation: "成功由天赋决定的信念——一种在流行文化中被广泛宣传的观点——正受到新研究的挑战，该研究表明努力和练习远比天赋重要。",
        components: [
            { text: "The belief", type: "subject", explanation: "主句的主语。" },
            { text: "that success is determined by innate talent", type: "clause", explanation: "同位语从句，解释'belief'的内容。" },
            { text: "a view that has been widely promoted in popular culture", type: "phrase", explanation: "同位语，进一步解释'The belief'。" },
            { text: "is being challenged", type: "predicate", explanation: "主句的谓语，现在进行时的被动语态。" },
            { text: "by new research", type: "adverbial", explanation: "介词短语作状语，表示方式。" },
            { text: "suggesting that hard work and practice are far more important", type: "phrase", explanation: "现在分词短语作后置定语，修饰'research'。" }
        ]
    },
    {
        sentence: "Whether the policy will be effective in the long run is a matter of considerable debate among economists, who are divided over its potential impacts on employment and inflation.",
        translation: "这项政策从长远来看是否有效，是经济学家们激烈争论的问题，他们对其在就业和通货膨膨胀方面的潜在影响存在分歧。",
        components: [
            { text: "Whether the policy will be effective in the long run", type: "clause", explanation: "主语从句，是整个句子的主语。" },
            { text: "is", type: "predicate", explanation: "系动词，作谓语。" },
            { text: "a matter of considerable debate among economists", type: "object", explanation: "表语，说明主语是什么。" },
            { text: "who are divided over its potential impacts on employment and inflation", type: "clause", explanation: "非限制性定语从句，修饰'economists'。" }
        ]
    },
    {
        sentence: "It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife.",
        translation: "凡是有钱的单身汉，总想娶位太太，这已经成了一条举世公认的真理。",
        components: [
            { text: "It", type: "subject", explanation: "形式主语，真正的主语是后面的 that 从句。" },
            { text: "is a truth", type: "predicate", explanation: "系动词和表语。" },
            { text: "universally acknowledged", type: "attributive", explanation: "过去分词短语作后置定语，修饰 truth。" },
            { text: "that a single man in possession of a good fortune must be in want of a wife", type: "clause", explanation: "主语从句，是句子的真正主语。" }
        ]
    },
    {
        sentence: "The extent to which a society is innovative is largely determined by its members' willingness to embrace new ideas and challenge established norms.",
        translation: "一个社会的创新程度，很大程度上取决于其成员拥抱新思想和挑战既定规范的意愿。",
        components: [
            { text: "The extent", type: "subject", explanation: "主句的主语。" },
            { text: "to which a society is innovative", type: "clause", explanation: "定语从句，修饰'The extent'，其中 'to which' 是'介词+关系代词'结构。" },
            { text: "is largely determined by", type: "predicate", explanation: "主句的谓语，被动语态。" },
            { text: "its members' willingness to embrace new ideas and challenge established norms", type: "object", explanation: "介词 by 的宾语。" }
        ]
    },
    {
        sentence: "Despite the abundance of information available online, it remains difficult for the average person to distinguish credible sources from misinformation.",
        translation: "尽管网上有大量信息，但普通人仍然很难区分可靠来源和虚假信息。",
        components: [
            { text: "Despite the abundance of information available online", type: "adverbial", explanation: "介词短语作让步状语。" },
            { text: "it", type: "subject", explanation: "形式主语，真正的主语是后面的不定式短语。" },
            { text: "remains difficult", type: "predicate", explanation: "系动词和表语。" },
            { text: "for the average person", type: "adverbial", explanation: "对于普通人来说，逻辑主语。" },
            { text: "to distinguish credible sources from misinformation", type: "subject", explanation: "不定式短语，是句子的真正主语。" }
        ]
    },
    {
        sentence: "What is most striking about their research is not the results themselves, but the innovative methodology they employed to arrive at them.",
        translation: "他们的研究最引人注目的不是研究结果本身，而是他们为得出这些结果所采用的创新方法。",
        components: [
            { text: "What is most striking about their research", type: "clause", explanation: "主语从句。" },
            { text: "is", type: "predicate", explanation: "主句谓语。" },
            { text: "not the results themselves, but the innovative methodology", type: "object", explanation: "表语，由 'not...but...' 连接的并列结构。" },
            { text: "they employed to arrive at them", type: "clause", explanation: "定语从句，修饰 'methodology'，省略了关系代词 that/which。" }
        ]
    },
    {
        sentence: "One of the most significant challenges facing modern society is how to harness the power of technology without compromising fundamental human values.",
        translation: "现代社会面临的最重大挑战之一是如何在不损害基本人类价值观的情况下利用技术的力量。",
        components: [
            { text: "One of the most significant challenges facing modern society", type: "subject", explanation: "主语，核心词是 One。" },
            { text: "facing modern society", type: "phrase", explanation: "现在分词短语作后置定语，修饰 challenges。" },
            { text: "is", type: "predicate", explanation: "谓语。" },
            { text: "how to harness the power of technology without compromising fundamental human values", type: "clause", explanation: "表语从句，解释主语是什么。" }
        ]
    },
    {
        sentence: "The argument that automation will inevitably lead to mass unemployment fails to consider the new types of jobs that technological advancements have historically created.",
        translation: "那种认为自动化将不可避免地导致大规模失业的论点，没有考虑到技术进步在历史上所创造的新型工作岗位。",
        components: [
            { text: "The argument", type: "subject", explanation: "主句主语。" },
            { text: "that automation will inevitably lead to mass unemployment", type: "clause", explanation: "同位语从句，解释 argument 的内容。" },
            { text: "fails to consider", type: "predicate", explanation: "主句谓语。" },
            { text: "the new types of jobs", type: "object", explanation: "consider 的宾语。" },
            { text: "that technological advancements have historically created", type: "clause", explanation: "定语从句，修饰 jobs。" }
        ]
    },
    {
        sentence: "It is imperative that we develop sustainable energy solutions to mitigate the effects of climate change, a threat that endangers ecosystems and livelihoods worldwide.",
        translation: "我们必须发展可持续的能源解决方案来减缓气候变化的影响，这是一个危及全球生态系统和生计的威胁。",
        components: [
            { text: "It", type: "subject", explanation: "形式主语。" },
            { text: "is imperative", type: "predicate", explanation: "系动词及表语。" },
            { text: "that we develop sustainable energy solutions to mitigate the effects of climate change", type: "clause", explanation: "主语从句，是句子的真正主语。注意 imperative 后面的从句用虚拟语气，谓语动词用 (should) do。" },
            { text: "a threat that endangers ecosystems and livelihoods worldwide", type: "phrase", explanation: "同位语，进一步说明 a threat。" }
        ]
    },
    {
        sentence: "Only by understanding the cultural context in which the text was written can we fully appreciate its nuances and significance.",
        translation: "只有通过理解该文本被创作时的文化背景，我们才能完全欣赏其细微之处和重要意义。",
        components: [
            { text: "Only by understanding the cultural context...", type: "adverbial", explanation: "“Only + 状语”位于句首，引起句子部分倒装。" },
            { text: "can we fully appreciate", type: "predicate", explanation: "倒装结构，将助动词 can 提至主语 we 之前。" },
            { text: "its nuances and significance", type: "object", explanation: "appreciate 的宾语。" },
            { text: "in which the text was written", type: "clause", explanation: "定语从句，修饰 context。" }
        ]
    },
    {
        sentence: "So pervasive has the influence of social media become that it now plays a crucial role in shaping public opinion and political discourse.",
        translation: "社交媒体的影响已经变得如此普遍，以至于它现在在塑造公众舆论和政治话语方面扮演着至关重要的角色。",
        components: [
            { text: "So pervasive has the influence of social media become", type: "adverbial", explanation: "“So + 形容词”位于句首，引起句子部分倒装，将助动词 has 提至主语 the influence... 之前。" },
            { text: "that it now plays a crucial role in shaping public opinion and political discourse", type: "clause", explanation: "结果状语从句，与前面的 so 构成 so...that... 结构。" }
        ]
    },
    {
        sentence: "The very notion of objective truth is frequently questioned in an era where personalized news feeds create filter bubbles that reinforce existing beliefs.",
        translation: "在一个个性化新闻推送制造出强化现有信念的“过滤气泡”的时代，客观真理这一概念本身就经常受到质疑。",
        components: [
            { text: "The very notion of objective truth", type: "subject", explanation: "主句主语，very 在此强调 notion。" },
            { text: "is frequently questioned", type: "predicate", explanation: "谓语，被动语态。" },
            { text: "in an era", type: "adverbial", explanation: "时间状语。" },
            { text: "where personalized news feeds create filter bubbles that reinforce existing beliefs", type: "clause", explanation: "定语从句，修饰 era。" }
        ]
    },
    {
        sentence: "What was once considered a luxury for the few has now become an essential commodity for the many, fundamentally altering patterns of consumption and trade.",
        translation: "曾经被少数人视为奢侈品的东西，如今已成为多数人的必需品，从而从根本上改变了消费和贸易模式。",
        components: [
            { text: "What was once considered a luxury for the few", type: "clause", explanation: "主语从句。" },
            { text: "has now become", type: "predicate", explanation: "谓语。" },
            { text: "an essential commodity for the many", type: "object", explanation: "表语。" },
            { text: "fundamentally altering patterns of consumption and trade", type: "phrase", explanation: "现在分词短语作结果状语，表示前面主句所带来的结果。" }
        ]
    },
    {
        sentence: "While many people are excited about the potential of artificial intelligence, there is also a growing concern that it could exacerbate existing social inequalities if not implemented responsibly.",
        translation: "尽管许多人对人工智能的潜力感到兴奋，但人们也越来越担心，如果不能负责任地加以实施，它可能会加剧现有的社会不平等。",
        components: [
            { text: "While many people are excited about the potential of artificial intelligence", type: "clause", explanation: "让步状语从句。" },
            { text: "there is also a growing concern", type: "subject", explanation: "主句，存在句结构。" },
            { text: "that it could exacerbate existing social inequalities", type: "clause", explanation: "同位语从句，解释 concern 的内容。" },
            { text: "if not implemented responsibly", type: "clause", explanation: "条件状语从句，是 if it is not implemented responsibly 的省略形式。" }
        ]
    },
    {
        sentence: "The ability to communicate effectively, long regarded as a soft skill, is now recognized as a critical competency for success in almost every profession.",
        translation: "有效沟通的能力，长期以来被视为一种软技能，现在被认为是几乎所有职业成功的关键能力。",
        components: [
            { text: "The ability to communicate effectively", type: "subject", explanation: "主句主语，核心词是 ability。" },
            { text: "long regarded as a soft skill", type: "phrase", explanation: "过去分词短语作非限制性定语，修饰主语 The ability。" },
            { text: "is now recognized as", type: "predicate", explanation: "谓语，被动语态。" },
            { text: "a critical competency for success in almost every profession", type: "object", explanation: "宾语补足语。" }
        ]
    },
    {
        sentence: "Far from being a static set of rules, language is a dynamic, evolving entity that constantly adapts to the changing needs of its users.",
        translation: "语言远非一套静态的规则，而是一个动态的、不断演变的实体，它不断地适应其使用者变化的需求。",
        components: [
            { text: "Far from being a static set of rules", type: "phrase", explanation: "介词短语，意为“远非，不但不”，作状语。" },
            { text: "language", type: "subject", explanation: "主语。" },
            { text: "is", type: "predicate", explanation: "谓语。" },
            { text: "a dynamic, evolving entity", type: "object", explanation: "表语。" },
            { text: "that constantly adapts to the changing needs of its users", type: "clause", explanation: "定语从句，修饰 entity。" }
        ]
    },
    {
        sentence: "The complexity of the human brain is such that scientists are only just beginning to understand the intricate neural circuits that give rise to consciousness.",
        translation: "人脑的复杂性如此之高，以至于科学家们才刚刚开始了解产生意识的复杂神经回路。",
        components: [
            { text: "The complexity of the human brain", type: "subject", explanation: "主语。" },
            { text: "is such", type: "predicate", explanation: "谓语和表语。" },
            { text: "that scientists are only just beginning to understand the intricate neural circuits", type: "clause", explanation: "结果状语从句，与 such 构成 such...that... 结构。" },
            { text: "that give rise to consciousness", type: "clause", explanation: "定语从句，修饰 circuits。" }
        ]
    }
];