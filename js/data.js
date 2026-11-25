/* ============================================================
 * 食安标签通 - 知识库数据
 * 数据来源：GB 2760-2014《食品安全国家标准 食品添加剂使用标准》
 * 及国家食品安全风险评估中心公开科普资料整理
 * 仅用于课程展示与科普学习，不构成医疗或消费建议
 * ============================================================ */

// 添加剂分类定义
const CATEGORIES = [
  { id: 'all', name: '全部', icon: '📚', desc: '浏览所有食品添加剂' },
  { id: 'preservative', name: '防腐剂', icon: '🛡️', desc: '延长食品保质期，抑制微生物生长' },
  { id: 'antioxidant', name: '抗氧化剂', icon: '✨', desc: '防止食品氧化变质，保持品质' },
  { id: 'sweetener', name: '甜味剂', icon: '🍬', desc: '提供甜味，低热量替代蔗糖' },
  { id: 'colorant', name: '着色剂', icon: '🎨', desc: '赋予或改善食品色泽' },
  { id: 'thickener', name: '增稠剂', icon: '🥣', desc: '改善食品质地和稠度' },
  { id: 'emulsifier', name: '乳化剂', icon: '🧈', desc: '帮助油水混合，稳定食品结构' },
  { id: 'leavening', name: '膨松剂', icon: '🍞', desc: '使面制品蓬松柔软' },
  { id: 'acidity', name: '酸度调节剂', icon: '🍋', desc: '调节食品酸碱度，改善风味' },
  { id: 'colorfix', name: '护色剂', icon: '🥩', desc: '保持肉制品鲜艳色泽' }
];

// 添加剂知识库
const ADDITIVES = [
  {
    id: 'sorbate',
    name: '山梨酸钾',
    en: 'Potassium Sorbate',
    ins: '202',
    category: 'preservative',
    icon: '🛡️',
    safety: 'safe',
    safetyText: '较安全',
    usage: '防腐剂',
    foods: ['饮料', '糕点', '肉制品', '酱菜', '乳制品'],
    intro: '山梨酸钾是国际公认的低毒高效防腐剂，进入人体后可参与正常代谢，分解为二氧化碳和水，不会在体内蓄积。',
    adiability: 'ADI 0–25 mg/kg 体重（FAO/WHO）',
    note: '正常使用范围内的安全性有保障，但并非"零食可以随便吃"的理由——高糖高盐食品本身仍需注意摄入量。'
  },
  {
    id: 'benzoate',
    name: '苯甲酸钠',
    en: 'Sodium Benzoate',
    ins: '211',
    category: 'preservative',
    icon: '🛡️',
    safety: 'caution',
    safetyText: '需留意',
    usage: '防腐剂',
    foods: ['碳酸饮料', '果汁', '酱油', '醋'],
    intro: '苯甲酸钠是传统防腐剂，防腐效果好、成本低。在酸性食品中效果最佳，进入人体后大部分可随尿液排出。',
    adiability: 'ADI 0–5 mg/kg 体重',
    note: '与维生素C同时存在时，特定条件下可能生成微量苯。正规产品均严格控制，但建议儿童少喝含苯甲酸钠的碳酸饮料。'
  },
  {
    id: 'nitrite',
    name: '亚硝酸钠',
    en: 'Sodium Nitrite',
    ins: '250',
    category: 'colorfix',
    icon: '🥩',
    safety: 'alert',
    safetyText: '严格限量',
    usage: '护色剂 / 防腐剂',
    foods: ['火腿', '香肠', '培根', '午餐肉'],
    intro: '亚硝酸钠使加工肉制品呈现诱人的粉红色，同时抑制肉毒杆菌。它是食品添加剂中管理最严格的一类之一。',
    adiability: 'ADI 0–0.07 mg/kg 体重',
    note: '过量摄入可能引起急性中毒，长期过量摄入与某些癌症风险相关。正规产品残留量极低，建议控制加工肉制品的食用频率。'
  },
  {
    id: 'bha',
    name: '特丁基对苯二酚（TBHQ）',
    en: 'TBHQ',
    ins: '319',
    category: 'antioxidant',
    icon: '✨',
    safety: 'safe',
    safetyText: '较安全',
    usage: '抗氧化剂',
    foods: ['食用油', '油炸食品', '膨化食品'],
    intro: 'TBHQ 是目前常用的油脂抗氧化剂，能有效延缓油脂氧化酸败，延长煎炸油使用寿命。',
    adiability: 'ADI 0–0.7 mg/kg 体重',
    note: '在规定剂量内使用是安全的，但油炸食品本身油脂含量高，建议适量食用。'
  },
  {
    id: 'ascorbate',
    name: '抗坏血酸（维生素C）',
    en: 'Ascorbic Acid',
    ins: '300',
    category: 'antioxidant',
    icon: '✨',
    safety: 'safe',
    safetyText: '友好',
    usage: '抗氧化剂 / 营养强化剂',
    foods: ['果汁', '饮料', '罐头', '肉制品'],
    intro: '抗坏血酸就是我们熟悉的维生素C，既是营养素又是天然抗氧化剂，安全性极高。',
    adiability: '无需规定 ADI（GRAS 一般认为安全）',
    note: '属于"加分项"添加剂，在配料表中看到它不必担心。'
  },
  {
    id: 'aspartame',
    name: '阿斯巴甜',
    en: 'Aspartame',
    ins: '951',
    category: 'sweetener',
    icon: '🍬',
    safety: 'caution',
    safetyText: '需留意',
    usage: '人工甜味剂',
    foods: ['无糖饮料', '口香糖', '低糖酸奶'],
    intro: '阿斯巴甜甜度约为蔗糖的 200 倍，热量极低，广泛用于无糖产品。进入人体后会分解为苯丙氨酸、天冬氨酸和甲醇。',
    adiability: 'ADI 0–40 mg/kg 体重（JECFA）',
    note: '苯丙酮尿症（PKU）患者必须避免摄入。IARC 将其列为"可能对人类致癌"（2B 类），但 JECFA 认为在 ADI 范围内食用是安全的，日常适量无需恐慌。'
  },
  {
    id: 'sucralose',
    name: '三氯蔗糖',
    en: 'Sucralose',
    ins: '955',
    category: 'sweetener',
    icon: '🍬',
    safety: 'safe',
    safetyText: '较安全',
    usage: '人工甜味剂',
    foods: ['无糖饮料', '烘焙食品', '酸奶'],
    intro: '三氯蔗糖甜度约为蔗糖的 600 倍，几乎不被人体吸收，大部分原样排出体外。',
    adiability: 'ADI 0–15 mg/kg 体重',
    note: '是目前应用最广的高倍甜味剂之一，在规定用量下安全性良好。'
  },
  {
    id: 'stevia',
    name: '甜菊糖苷',
    en: 'Steviol Glycosides',
    ins: '960',
    category: 'sweetener',
    icon: '🍬',
    safety: 'safe',
    safetyText: '天然来源',
    usage: '天然甜味剂',
    foods: ['无糖饮料', '茶饮料', '低糖食品'],
    intro: '甜菊糖苷提取自甜叶菊植物，甜度为蔗糖的 200–300 倍，热量几乎为零。',
    adiability: 'ADI 0–4 mg/kg 体重（以甜菊醇计）',
    note: '属于植物来源甜味剂，部分人会觉得有轻微后苦味，常与其他甜味剂复配使用。'
  },
  {
    id: 'xylitol',
    name: '木糖醇',
    en: 'Xylitol',
    ins: '967',
    category: 'sweetener',
    icon: '🍬',
    safety: 'safe',
    safetyText: '友好',
    usage: '甜味剂 / 保湿剂',
    foods: ['无糖口香糖', '糖尿病患者食品'],
    intro: '木糖醇是天然存在的五碳糖醇，甜度与蔗糖接近但热量更低，且不会被口腔细菌利用产酸，有助于防龋齿。',
    adiability: '无 ADI 限制',
    note: '一次摄入过多可能引起腹胀或腹泻。需注意：**木糖醇对狗有剧毒**，养狗家庭务必妥善存放。'
  },
  {
    id: 'tartrazine',
    name: '柠檬黄',
    en: 'Tartrazine',
    ins: '102',
    category: 'colorant',
    icon: '🎨',
    safety: 'caution',
    safetyText: '敏感人群留意',
    usage: '合成着色剂',
    foods: ['糖果', '饮料', '糕点', '冰淇淋'],
    intro: '柠檬黄是常见的黄色合成色素，色泽鲜艳、稳定性好、成本低廉。',
    adiability: 'ADI 0–7.5 mg/kg 体重',
    note: '少数人可能对合成色素敏感，出现注意力不集中或多动症状，儿童食品应尽量减少人工色素摄入。'
  },
  {
    id: 'sunsetyellow',
    name: '日落黄',
    en: 'Sunset Yellow',
    ins: '110',
    category: 'colorant',
    icon: '🎨',
    safety: 'caution',
    safetyText: '敏感人群留意',
    usage: '合成着色剂',
    foods: ['橙味饮料', '糖果', '糕点'],
    intro: '日落黄为橙黄色合成色素，常与柠檬黄复配调出各种暖色调。',
    adiability: 'ADI 0–2.5 mg/kg 体重',
    note: '与柠檬黄类似，建议儿童少吃颜色过分鲜艳的加工食品。'
  },
  {
    id: 'caramel',
    name: '焦糖色',
    en: 'Caramel Color',
    ins: '150',
    category: 'colorant',
    icon: '🎨',
    safety: 'safe',
    safetyText: '较安全',
    usage: '天然/半合成着色剂',
    foods: ['酱油', '可乐', '啤酒', '糖果'],
    intro: '焦糖色由糖类加热脱水制成，是应用最广泛的食用色素之一。',
    adiability: 'ADI 0–200 mg/kg 体重（氨法焦糖除外需限量）',
    note: '你喝的可乐之所以是深褐色，靠的就是它。安全性良好。'
  },
  {
    id: 'riboflavin',
    name: '核黄素（维生素B2）',
    en: 'Riboflavin',
    ins: '101',
    category: 'colorant',
    icon: '🎨',
    safety: 'safe',
    safetyText: '友好',
    usage: '天然着色剂 / 营养强化剂',
    foods: ['乳制品', '谷物制品', '饮料'],
    intro: '核黄素即维生素 B2，本身就是人体必需营养素，同时可作为黄色天然色素使用。',
    adiability: '无需规定 ADI',
    note: '属于"营养+着色"双重身份的添加剂，看到它大可放心。'
  },
  {
    id: 'xanthan',
    name: '黄原胶',
    en: 'Xanthan Gum',
    ins: '415',
    category: 'thickener',
    icon: '🥣',
    safety: 'safe',
    safetyText: '友好',
    usage: '增稠剂 / 稳定剂',
    foods: ['沙拉酱', '酸奶', '饮料', '面包'],
    intro: '黄原胶由微生物发酵产生，是食品工业中最常用的增稠剂之一，少量即可显著提升体系黏度。',
    adiability: '无需规定 ADI（JECFA）',
    note: '在配料表中非常常见，安全性高，主要作用是让酱料"挂壁"、让面包更柔软。'
  },
  {
    id: 'carrageenan',
    name: '卡拉胶',
    en: 'Carrageenan',
    ins: '407',
    category: 'thickener',
    icon: '🥣',
    safety: 'safe',
    safetyText: '较安全',
    usage: '增稠剂 / 凝胶剂',
    foods: ['牛奶布丁', '冰淇淋', '果冻', '加工肉'],
    intro: '卡拉胶提取自红藻类海藻，是天然来源的增稠凝胶剂。',
    adiability: 'ADI 0–75 mg/kg 体重',
    note: '食品级卡拉胶在规定用量下安全。注意区分"食品级"与"降解型卡拉胶"（后者在实验研究中存在争议，不用于食品）。'
  },
  {
    id: 'pectin',
    name: '果胶',
    en: 'Pectin',
    ins: '440',
    category: 'thickener',
    icon: '🥣',
    safety: 'safe',
    safetyText: '天然来源',
    usage: '增稠剂 / 凝胶剂',
    foods: ['果酱', '酸奶', '果冻'],
    intro: '果胶天然存在于水果细胞壁中，是制作果酱的"灵魂"成分，也是膳食纤维的一种。',
    adiability: '无需规定 ADI',
    note: '属于"清洁标签"趋势下备受青睐的天然添加剂。'
  },
  {
    id: 'lecithin',
    name: '大豆卵磷脂',
    en: 'Soy Lecithin',
    ins: '322',
    category: 'emulsifier',
    icon: '🧈',
    safety: 'safe',
    safetyText: '友好',
    usage: '乳化剂',
    foods: ['巧克力', '人造黄油', '烘焙食品', '饮料'],
    intro: '卵磷脂是天然存在的磷脂类物质，能让油和水"和平共处"，是巧克力顺滑口感的关键。',
    adiability: '无需规定 ADI',
    note: '大豆来源，对大豆严重过敏者需注意。一般人群安全性良好。'
  },
  {
    id: 'monoglyceride',
    name: '单硬脂酸甘油酯',
    en: 'Mono and Diglycerides',
    ins: '471',
    category: 'emulsifier',
    icon: '🧈',
    safety: 'safe',
    safetyText: '较安全',
    usage: '乳化剂',
    foods: ['面包', '蛋糕', '人造奶油', '冰淇淋'],
    intro: '单甘酯是最常用的食品乳化剂之一，能改善面制品组织结构、延缓淀粉老化。',
    adiability: '无需规定 ADI',
    note: '让面包保持松软的"幕后功臣"，安全性良好。'
  },
  {
    id: 'bakingpowder',
    name: '碳酸氢钠（小苏打）',
    en: 'Sodium Bicarbonate',
    ins: '500',
    category: 'leavening',
    icon: '🍞',
    safety: 'safe',
    safetyText: '友好',
    usage: '膨松剂 / 酸度调节剂',
    foods: ['馒头', '面包', '饼干', '糕点'],
    intro: '碳酸氢钠就是家里的小苏打，加热后释放二氧化碳使面食蓬松，是最古老的膨松剂之一。',
    adiability: '无需规定 ADI',
    note: '安全性极高，家庭烘焙也常用。'
  },
  {
    id: 'aluminum',
    name: '硫酸铝钾（明矾）',
    en: 'Aluminum Potassium Sulfate',
    ins: '523',
    category: 'leavening',
    icon: '🍞',
    safety: 'alert',
    safetyText: '含铝需控制',
    usage: '膨松剂（含铝）',
    foods: ['油条', '炸油糕', '粉丝', '海蜇'],
    intro: '明矾是传统膨松剂，含铝。我国已严格限制铝在食品中的残留量，并推广"无铝膨松剂"替代。',
    adiability: '铝的每周耐受摄入量 2 mg/kg 体重（JECFA）',
    note: '长期过量摄入铝可能对神经系统和骨骼健康不利。建议少吃街边油炸面食，购买时留意"无铝"标识。'
  },
  {
    id: 'citric',
    name: '柠檬酸',
    en: 'Citric Acid',
    ins: '330',
    category: 'acidity',
    icon: '🍋',
    safety: 'safe',
    safetyText: '友好',
    usage: '酸度调节剂',
    foods: ['饮料', '糖果', '罐头', '果酱'],
    intro: '柠檬酸天然存在于柑橘类水果中，是食品中最常用的酸味剂和螯合剂。',
    adiability: '无需规定 ADI',
    note: '安全性极高，还能帮助抗氧化剂发挥更好效果。'
  },
  {
    id: 'malic',
    name: '苹果酸',
    en: 'Malic Acid',
    ins: '296',
    category: 'acidity',
    icon: '🍋',
    safety: 'safe',
    safetyText: '友好',
    usage: '酸度调节剂',
    foods: ['果汁', '饮料', '糖果'],
    intro: '苹果酸最初从苹果中提取，酸味柔和持久，常与柠檬酸复配使用。',
    adiability: '无需规定 ADI',
    note: '安全性良好，带来清爽的酸味体验。'
  }
];

// 示例标签数据（用于演示标签解读功能）
const SAMPLE_LABELS = [
  {
    id: 'sample1',
    name: '某品牌碳酸饮料',
    type: '饮料',
    text: '配料：水、果葡糖浆、白砂糖、二氧化碳、焦糖色、磷酸、咖啡因、山梨酸钾、阿斯巴甜、柠檬酸、香精。'
  },
  {
    id: 'sample2',
    name: '某品牌切片面包',
    type: '烘焙食品',
    text: '配料：小麦粉、水、白砂糖、酵母、食用盐、大豆卵磷脂、单硬脂酸甘油酯、黄原胶、抗坏血酸、丙酸钙。'
  },
  {
    id: 'sample3',
    name: '某品牌火腿肠',
    type: '肉制品',
    text: '配料：猪肉、鸡肉、水、食用盐、白砂糖、亚硝酸钠、山梨酸钾、卡拉胶、大豆蛋白、香辛料、三聚磷酸钠。'
  },
  {
    id: 'sample4',
    name: '某品牌无糖口香糖',
    type: '糖果',
    text: '配料：木糖醇、山梨糖醇、胶基、麦芽糊精、阿拉伯胶、柠檬黄、二氧化钛、薄荷香精、阿斯巴甜。'
  },
  {
    id: 'sample5',
    name: '某品牌果味酸奶',
    type: '乳制品',
    text: '配料：生牛乳、白砂糖、水、全脂奶粉、果胶、羧甲基纤维素钠、三氯蔗糖、柠檬黄、日落黄、乳酸菌、食用香精。'
  }
];

// AI 问答知识条目
const QA_KNOWLEDGE = [
  {
    keywords: ['添加剂有害吗', '添加剂安全吗', '添加剂是不是有害', '食品安全'],
    question: '食品添加剂都有害吗？',
    answer: '不是的。食品添加剂在**批准使用的范围和剂量内**是安全的，它们要经过严格的毒理学评估才被允许使用。真正需要警惕的是：①超范围超限量使用；②非法添加物（如三聚氰胺、苏丹红，它们根本不是食品添加剂）；③长期大量食用高度加工食品。建议看配料表、控制加工食品摄入频率，而不是一味恐惧添加剂。'
  },
  {
    keywords: ['配料表', '怎么看', '配料表顺序', '怎么看配料表'],
    question: '看食品标签时应该注意什么？',
    answer: '重点看三处：①**配料表**：按含量从高到低排列，前三位基本决定了食品的主要成分；②**营养成分表**：关注能量、脂肪、钠、糖的 NRV%；③**生产日期和保质期**。配料表越短通常意味着加工程度越低，但也不绝对。建议优先选择配料表简单、钠和糖含量低的产品。'
  },
  {
    keywords: ['亚硝酸盐', '亚硝酸钠', '火腿肠', '培根', '加工肉'],
    question: '亚硝酸盐为什么用在肉制品里？',
    answer: '亚硝酸盐有三个作用：护色（让肉保持粉红色）、防腐（尤其抑制肉毒杆菌）、增味。它确实是管理最严格的添加剂之一，因为过量有急性毒性。但正规产品添加量受到严格限制（残留量通常 ≤30mg/kg）。建议：控制加工肉制品食用频率，多吃新鲜肉类。世界卫生组织下属 IARC 将加工肉制品列为 1 类致癌物，主要是基于长期大量食用的流行病学证据，偶尔吃不必过度担心。'
  },
  {
    keywords: ['无糖', '代糖', '甜味剂', '阿斯巴甜', '三氯蔗糖', '木糖醇', '甜菊糖'],
    question: '无糖饮料里的甜味剂安全吗？',
    answer: '目前主流甜味剂（三氯蔗糖、阿斯巴甜、甜菊糖苷、木糖醇等）在规定的每日允许摄入量（ADI）范围内是安全的。需要注意：①阿斯巴甜不适合苯丙酮尿症患者；②木糖醇对狗有剧毒；③部分人大量摄入糖醇可能腹胀腹泻。另外，"无糖"不等于"健康"——还要看整体营养构成。'
  },
  {
    keywords: ['色素', '着色剂', '柠檬黄', '日落黄', '儿童', '多动'],
    question: '人工色素会影响儿童健康吗？',
    answer: '部分研究提示，某些合成色素（如柠檬黄、日落黄）与防腐剂苯甲酸钠复配时，可能与儿童注意力不集中、多动行为存在关联。欧盟已要求含这些色素的食品标注"可能对儿童活动及注意力产生不良影响"的警示语。建议：儿童少吃颜色过分鲜艳的糖果饮料，优先选择天然着色（如胡萝卜素、花青素）的产品。'
  },
  {
    keywords: ['保质期', '过期', '保存', '贮存'],
    question: '保质期过了还能吃吗？',
    answer: '保质期是厂家对产品品质的承诺期限，不是绝对的"安全分界线"。过期食品不一定立即变质，但风味、质地、营养可能下降，且存在微生物风险，建议不要食用。另外要注意：保质期依赖正确的贮存条件（冷藏、避光、干燥等），如果贮存不当，即使在保质期内也可能提前变质。'
  },
  {
    keywords: ['清洁标签', '天然添加剂', '配料表短'],
    question: '什么是"清洁标签"？',
    answer: '清洁标签（Clean Label）是食品行业的一种趋势，指消费者倾向于选择配料表简短、成分可识别、添加剂天然来源的产品。比如用果胶代替明胶、用甜菊糖代替阿斯巴甜。但要注意：配料表短不等于更安全，天然也不等于绝对无害——关键还是看具体成分和使用量。'
  },
  {
    keywords: ['非法添加物', '三聚氰胺', '苏丹红', '区别'],
    question: '非法添加物和食品添加剂有什么区别？',
    answer: '这是两个完全不同的概念。**食品添加剂**是法律法规允许使用的、经过安全评估的物质（如山梨酸钾、维生素C）；**非法添加物**是根本不允许加到食品里的物质（如三聚氰胺、苏丹红、工业明胶）。很多食品安全事件被误传为"添加剂有害"，其实是非法添加物作祟。学会区分这两者，是理性看待食品安全的第一步。'
  }
];

// 食品安全小贴士
const TIPS = [
  {
    icon: '🔍',
    title: '先看配料表前三位',
    desc: '配料按含量递减排列，前三位决定食品"本质"。若白砂糖、果葡糖浆排在前面，说明含糖量高。'
  },
  {
    icon: '⚖️',
    title: '关注 NRV% 而非绝对值',
    desc: '营养成分表中的 NRV% 表示占每日推荐摄入量的比例。钠超过 30% NRV 就要留意了。'
  },
  {
    icon: '🚫',
    title: '区分添加剂与非法添加物',
    desc: '山梨酸钾、维生素C 是合法添加剂；三聚氰胺、苏丹红是非法添加物，两者不可混为一谈。'
  },
  {
    icon: '🧒',
    title: '儿童少吃高色素零食',
    desc: '颜色过分鲜艳的糖果饮料往往含较多人工色素，建议优先选择天然着色的产品。'
  }
];

// 风险等级说明
const RISK_LEVELS = {
  safe: { label: '安心', color: '#10b981', bg: '#d1fae5', icon: '✅' },
  caution: { label: '留意', color: '#f59e0b', bg: '#fef3c7', icon: '⚠️' },
  alert: { label: '注意', color: '#ef4444', bg: '#fee2e2', icon: '🚨' },
  unknown: { label: '未知', color: '#6b7280', bg: '#f3f4f6', icon: '❓' }
};
