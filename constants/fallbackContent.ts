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
    }
];
