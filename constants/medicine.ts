import type { SubstrateInfo, MetabolicPathway } from '../types';

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