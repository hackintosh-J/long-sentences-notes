import type { SentenceData } from '../types';

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