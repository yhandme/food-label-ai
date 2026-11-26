/* ============================================================
 * 食安标签通 - 知识库数据
 * 数据来源：GB 2760-2024《食品安全国家标准 食品添加剂使用标准》
 *          （2024 年发布，2025 年 2 月 8 日实施，替代 GB 2760-2014）
 *          GB 28050-2011《预包装食品营养标签通则》
 *          及国家食品安全风险评估中心公开科普资料整理
 * 仅供科普学习，不构成医疗或消费建议
 * ============================================================ */

// 添加剂功能分类
const CATEGORIES = [
  { id: 'all', name: '全部', icon: 'grid', desc: '浏览所有食品添加剂' },
  { id: 'preservative', name: '防腐剂', icon: 'shield', desc: '延长食品保质期，抑制微生物生长' },
  { id: 'antioxidant', name: '抗氧化剂', icon: 'sparkle', desc: '防止食品氧化变质，保持品质' },
  { id: 'sweetener', name: '甜味剂', icon: 'crystal', desc: '提供甜味，低热量替代蔗糖' },
  { id: 'colorant', name: '着色剂', icon: 'palette', desc: '赋予或改善食品色泽' },
  { id: 'thickener', name: '增稠剂', icon: 'beaker', desc: '改善食品质地和稠度' },
  { id: 'emulsifier', name: '乳化剂', icon: 'drops', desc: '帮助油水混合，稳定食品结构' },
  { id: 'leavening', name: '膨松剂', icon: 'bubbles', desc: '使面制品蓬松柔软' },
  { id: 'acidity', name: '酸度调节剂', icon: 'citrus', desc: '调节食品酸碱度，改善风味' },
  { id: 'colorfix', name: '护色剂', icon: 'disc', desc: '保持肉制品鲜艳色泽' },
  { id: 'humectant', name: '水分保持剂', icon: 'water', desc: '保持水分，改善口感与出品率' },
  { id: 'flavor', name: '增味剂', icon: 'steam', desc: '增强或改善食品原有风味' },
  { id: 'anticaking', name: '抗结剂', icon: 'salt', desc: '防止粉末、颗粒食品结块成团' },
  { id: 'bleach', name: '漂白剂', icon: 'sparkles', desc: '使食品褪色或免于褐变，兼具防腐作用' },
  { id: 'stabilizer', name: '稳定剂和凝固剂', icon: 'cube', desc: '维持食品结构稳定，促使蛋白凝固成型' },
  { id: 'coating', name: '被膜剂', icon: 'sticker', desc: '在食品表面形成薄膜，上光、防潮、保鲜' }
];

// 食品类别（解读工作台的第一步）
const FOOD_CATEGORIES = [
  { id: 'drink', name: '饮料', icon: 'cup', note: '含糖饮料建议控制在每日 1 份以内' },
  { id: 'dairy', name: '乳制品', icon: 'milk', note: '留意添加糖与乳糖不耐受' },
  { id: 'bakery', name: '烘焙面点', icon: 'bread', note: '重点看脂肪与钠' },
  { id: 'meat', name: '肉制品', icon: 'drumstick', note: '加工肉制品建议控制食用频率' },
  { id: 'snack', name: '零食糖果', icon: 'candy', note: '糖与油往往同时偏高' },
  { id: 'instant', name: '方便速食', icon: 'noodle', note: '钠含量是主要问题' },
  { id: 'sauce', name: '调味酱料', icon: 'sauce', note: '单次用量小，但钠密度高' },
  { id: 'other', name: '其他', icon: 'grid', note: '' }
];

// 营养素定义：nrv 为每日参考值（GB 28050），light 为每 100 g 红绿灯阈值
const NUTRIENTS = [
  {
    id: 'energy', name: '能量', unit: 'kJ', nrv: 8400, icon: 'flame',
    light: { low: 400, high: 1200 },
    lightDrink: { low: 200, high: 600 },
    hint: '本站以每 100 g 的 400 / 1200 kJ 作为偏低与偏高的参考线'
  },
  { id: 'protein', name: '蛋白质', unit: 'g', nrv: 60, icon: 'wheat', positive: true, hint: '每 100 g 达到 6 g 以上可视为较好的蛋白质来源' },
  {
    id: 'fat', name: '脂肪', unit: 'g', nrv: 60, icon: 'drop',
    light: { low: 3, high: 17.5 }, lightDrink: { low: 1.5, high: 8.75 },
    hint: '参考英国 FSA 前端标识的每 100 g 阈值，饮料另有一套更严格的标准'
  },
  { id: 'carb', name: '碳水化合物', unit: 'g', nrv: 300, icon: 'cube' },
  {
    id: 'sugar', name: '糖', unit: 'g', nrv: 50, icon: 'candy',
    light: { low: 5, high: 22.5 },
    lightDrink: { low: 2.5, high: 11.5 },
    hint: 'WHO 建议每日添加糖摄入不超过 50 g，最好低于 25 g'
  },
  {
    id: 'sodium', name: '钠', unit: 'mg', nrv: 2000, icon: 'salt',
    light: { low: 120, high: 600 }, lightDrink: { low: 120, high: 300 },
    hint: '1 g 食盐约含 400 mg 钠'
  },
  { id: 'fiber', name: '膳食纤维', unit: 'g', nrv: 25, icon: 'leaf', positive: true, hint: '每 100 g 达到 3 g 以上可视为含膳食纤维' }
];

// 营养红绿灯四档
const LIGHT_LEVELS = {
  good: { word: '低', label: '偏低', dot: '#3A7D44', text: '#2C5F33', bg: '#E8F3EC' },
  mid: { word: '中', label: '适中', dot: '#C08A2E', text: '#8A6220', bg: '#FBF6EC' },
  bad: { word: '高', label: '偏高', dot: '#B4483F', text: '#9A3B33', bg: '#FAF0EE' },
  none: { word: '—', label: '未填', dot: '#CBD8CE', text: '#5F6F65', bg: '#F2F6F8' }
};

// 过敏原词典（参照 GB 7718 推荐的八类致敏物质，另加亚硫酸盐）
const ALLERGENS = [
  { id: 'gluten', name: '含麸质谷物', short: '麸质', icon: 'wheat', keywords: ['小麦', '面粉', '大麦', '黑麦', '燕麦', '麸皮', '面筋', '谷蛋白'] },
  { id: 'crustacean', name: '甲壳类', short: '甲壳类', icon: 'shrimp', keywords: ['虾', '蟹', '龙虾', '甲壳'] },
  { id: 'fish', name: '鱼类', short: '鱼类', icon: 'fish', keywords: ['鱼肉', '鱼糜', '鱼露', '鳕', '鲑', '三文鱼', '金枪鱼'] },
  { id: 'egg', name: '蛋类', short: '蛋', icon: 'egg', keywords: ['鸡蛋', '蛋清', '蛋黄', '全蛋', '蛋液', '蛋粉'] },
  { id: 'peanut', name: '花生', short: '花生', icon: 'peanut', keywords: ['花生'] },
  { id: 'soy', name: '大豆', short: '大豆', icon: 'soy', keywords: ['大豆', '黄豆', '豆粉', '酱油', '卵磷脂', '豆浆'] },
  { id: 'milk', name: '乳及乳制品', short: '乳', icon: 'milk', keywords: ['牛乳', '牛奶', '乳粉', '奶粉', '乳清', '奶油', '黄油', '奶酪', '干酪', '炼乳', '全脂奶粉', '生牛乳'] },
  { id: 'nut', name: '坚果', short: '坚果', icon: 'nut', keywords: ['核桃', '杏仁', '腰果', '榛子', '开心果', '松子', '巴旦木', '夏威夷果'] },
  { id: 'sulfite', name: '亚硫酸盐', short: '亚硫酸盐', icon: 'flask', keywords: ['二氧化硫', '亚硫酸', '焦亚硫酸'] }
];

// 添加剂知识库
const ADDITIVES = [
  {
    id: 'sorbate',
    name: '山梨酸钾',
    en: 'Potassium Sorbate',
    ins: '202',
    category: 'preservative',
    safety: 'safe',
    safetyText: '较安全',
    usage: '抑制霉菌与酵母',
    foods: ['饮料', '糕点', '肉制品', '酱菜', '乳制品'],
    intro: '山梨酸钾是国际公认的低毒高效防腐剂，进入人体后可参与正常代谢，分解为二氧化碳和水，不会在体内蓄积。',
    adiability: 'ADI 0–25 mg/kg 体重（FAO/WHO）',
    note: '正常使用范围内的安全性有保障，但并非“零食可以随便吃”的理由——高糖高盐食品本身仍需注意摄入量。新版 GB 2760 规定罐头类食品不再允许使用山梨酸及其钾盐。'
  },
  {
    id: 'benzoate',
    name: '苯甲酸钠',
    en: 'Sodium Benzoate',
    ins: '211',
    category: 'preservative',
    safety: 'caution',
    safetyText: '需留意',
    caution: '碳酸饮料少喝',
    usage: '抑制细菌与酵母',
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
    safety: 'alert',
    safetyText: '严格限量',
    caution: '加工肉控制频率',
    usage: '保持肉色 / 抑制肉毒杆菌',
    foods: ['火腿', '香肠', '培根', '午餐肉'],
    intro: '亚硝酸钠使加工肉制品呈现诱人的粉红色，同时抑制肉毒杆菌。它是食品添加剂中管理最严格的一类之一。',
    adiability: 'ADI 0–0.07 mg/kg 体重',
    note: '过量摄入可能引起急性中毒，长期过量摄入与某些癌症风险相关。正规产品残留量极低，建议控制加工肉制品的食用频率。'
  },
  {
    id: 'propionate',
    name: '丙酸钙',
    en: 'Calcium Propionate',
    ins: '282',
    category: 'preservative',
    safety: 'safe',
    safetyText: '较安全',
    usage: '抑制霉菌（面包防霉）',
    foods: ['面包', '糕点', '面饼'],
    intro: '丙酸钙是烘焙食品中最常用的防霉剂，对霉菌和部分芽孢杆菌有抑制作用，在面包中还能顺带补充少量钙。',
    adiability: '无需规定 ADI',
    note: '在规定用量下安全性良好。它的存在通常意味着这是一款需要较长货架期的工业化面点。'
  },
  {
    id: 'sulfite',
    name: '亚硫酸钠',
    en: 'Sodium Sulfite',
    ins: '221',
    category: 'preservative',
    safety: 'caution',
    safetyText: '敏感人群留意',
    caution: '哮喘患者留意',
    allergens: ['sulfite'],
    usage: '防腐 / 抗氧化 / 漂白',
    foods: ['果干', '葡萄酒', '蜜饯', '淀粉制品'],
    intro: '亚硫酸盐通过释放二氧化硫抑制微生物并防止褐变，在果干和葡萄酒中尤其常见。',
    adiability: 'ADI 0–0.7 mg/kg 体重（以二氧化硫计）',
    note: '部分哮喘患者对亚硫酸盐敏感，可能诱发支气管痉挛。含亚硫酸盐的食品需在标签上标注，残留量有严格限量。'
  },
  {
    id: 'tbhq',
    name: '特丁基对苯二酚（TBHQ）',
    en: 'TBHQ',
    ins: '319',
    category: 'antioxidant',
    safety: 'safe',
    safetyText: '较安全',
    usage: '延缓油脂酸败',
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
    safety: 'safe',
    safetyText: '友好',
    usage: '抗氧化 / 营养强化',
    foods: ['果汁', '饮料', '罐头', '肉制品'],
    intro: '抗坏血酸就是我们熟悉的维生素C，既是营养素又是天然抗氧化剂，安全性极高。',
    adiability: '无需规定 ADI（GRAS 一般认为安全）',
    note: '属于“加分项”添加剂，在配料表中看到它不必担心。'
  },
  {
    id: 'aspartame',
    name: '阿斯巴甜',
    en: 'Aspartame',
    ins: '951',
    category: 'sweetener',
    safety: 'caution',
    safetyText: '需留意',
    caution: '苯丙酮尿症忌用',
    usage: '提供甜味 / 低热量',
    foods: ['无糖饮料', '口香糖', '低糖酸奶'],
    intro: '阿斯巴甜甜度约为蔗糖的 200 倍，热量极低，广泛用于无糖产品。进入人体后会分解为苯丙氨酸、天冬氨酸和甲醇。',
    adiability: 'ADI 0–40 mg/kg 体重（JECFA）',
    note: '苯丙酮尿症（PKU）患者必须避免摄入。IARC 将其列为“可能对人类致癌”（2B 类），但 JECFA 认为在 ADI 范围内食用是安全的，日常适量无需恐慌。'
  },
  {
    id: 'sucralose',
    name: '三氯蔗糖',
    en: 'Sucralose',
    ins: '955',
    category: 'sweetener',
    safety: 'safe',
    safetyText: '较安全',
    usage: '高倍甜味 / 几乎不吸收',
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
    safety: 'safe',
    safetyText: '天然来源',
    usage: '植物来源甜味',
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
    safety: 'safe',
    safetyText: '友好',
    usage: '提供甜味 / 不易致龋',
    foods: ['无糖口香糖', '糖尿病患者食品'],
    intro: '木糖醇是天然存在的五碳糖醇，甜度与蔗糖接近但热量更低，且不会被口腔细菌利用产酸，有助于防龋齿。',
    adiability: '无 ADI 限制',
    note: '一次摄入过多可能引起腹胀或腹泻。需注意：木糖醇对狗有剧毒，养狗家庭务必妥善存放。'
  },
  {
    id: 'sorbitol',
    name: '山梨糖醇',
    en: 'Sorbitol',
    ins: '420',
    category: 'sweetener',
    safety: 'caution',
    safetyText: '过量留意',
    caution: '一次别吃太多',
    usage: '提供甜味 / 保湿',
    foods: ['无糖糖果', '口香糖', '糕点', '蜜饯'],
    intro: '山梨糖醇甜度约为蔗糖的 0.6 倍，兼具保湿作用，常用于无糖糖果和蜜饯，让产品不易变干。',
    adiability: '无需规定 ADI',
    note: '糖醇在肠道中吸收不完全，一次摄入 20 g 以上容易引起腹胀、肠鸣或腹泻，肠易激人群尤其要注意。'
  },
  {
    id: 'tartrazine',
    name: '柠檬黄',
    en: 'Tartrazine',
    ins: '102',
    category: 'colorant',
    safety: 'caution',
    safetyText: '敏感人群留意',
    caution: '儿童少食',
    usage: '着黄色',
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
    safety: 'caution',
    safetyText: '敏感人群留意',
    caution: '儿童少食',
    usage: '着橙黄色',
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
    safety: 'safe',
    safetyText: '较安全',
    usage: '着棕褐色',
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
    safety: 'safe',
    safetyText: '友好',
    usage: '着黄色 / 补充维生素B2',
    foods: ['乳制品', '谷物制品', '饮料'],
    intro: '核黄素即维生素 B2，本身就是人体必需营养素，同时可作为黄色天然色素使用。',
    adiability: '无需规定 ADI',
    note: '属于“营养+着色”双重身份的添加剂，看到它大可放心。'
  },
  {
    id: 'titanium',
    name: '二氧化钛',
    en: 'Titanium Dioxide',
    ins: '171',
    category: 'colorant',
    safety: 'caution',
    safetyText: '法规有变化',
    caution: '关注法规差异',
    usage: '着白色 / 增白',
    foods: ['口香糖', '糖果包衣', '巧克力制品'],
    intro: '二氧化钛是最常用的白色着色剂，能让糖果包衣和口香糖呈现干净的白色。',
    adiability: '我国 GB 2760 允许在限定食品类别中按限量使用',
    note: '欧盟自 2022 年起已禁止将 E171 用作食品添加剂，我国目前仍允许在部分类别中限量使用。这类“法规差异”值得持续关注，但不必因此恐慌。'
  },
  {
    id: 'xanthan',
    name: '黄原胶',
    en: 'Xanthan Gum',
    ins: '415',
    category: 'thickener',
    safety: 'safe',
    safetyText: '友好',
    usage: '增稠 / 稳定体系',
    foods: ['沙拉酱', '酸奶', '饮料', '面包'],
    intro: '黄原胶由微生物发酵产生，是食品工业中最常用的增稠剂之一，少量即可显著提升体系黏度。',
    adiability: '无需规定 ADI（JECFA）',
    note: '在配料表中非常常见，安全性高，主要作用是让酱料“挂壁”、让面包更柔软。'
  },
  {
    id: 'carrageenan',
    name: '卡拉胶',
    en: 'Carrageenan',
    ins: '407',
    category: 'thickener',
    safety: 'safe',
    safetyText: '较安全',
    usage: '凝胶 / 增稠',
    foods: ['牛奶布丁', '冰淇淋', '果冻', '加工肉'],
    intro: '卡拉胶提取自红藻类海藻，是天然来源的增稠凝胶剂。',
    adiability: 'ADI 0–75 mg/kg 体重',
    note: '食品级卡拉胶在规定用量下安全。注意区分“食品级”与“降解型卡拉胶”（后者在实验研究中存在争议，不用于食品）。'
  },
  {
    id: 'pectin',
    name: '果胶',
    en: 'Pectin',
    ins: '440',
    category: 'thickener',
    safety: 'safe',
    safetyText: '天然来源',
    usage: '凝胶 / 补充膳食纤维',
    foods: ['果酱', '酸奶', '果冻'],
    intro: '果胶天然存在于水果细胞壁中，是制作果酱的“灵魂”成分，也是膳食纤维的一种。',
    adiability: '无需规定 ADI',
    note: '属于“清洁标签”趋势下备受青睐的天然添加剂。'
  },
  {
    id: 'cmc',
    name: '羧甲基纤维素钠',
    en: 'Sodium Carboxymethyl Cellulose',
    ins: '466',
    category: 'thickener',
    safety: 'safe',
    safetyText: '较安全',
    usage: '增稠 / 防止分层',
    foods: ['酸奶', '冰淇淋', '植物蛋白饮料'],
    intro: 'CMC 是纤维素经化学改性得到的水溶性增稠剂，能让饮料中的颗粒悬浮、防止分层沉淀。',
    adiability: 'ADI 0–25 mg/kg 体重',
    note: '在规定用量下安全性良好，是酸奶和植物奶中防止“分层”的常见成分。'
  },
  {
    id: 'lecithin',
    name: '大豆卵磷脂',
    en: 'Soy Lecithin',
    ins: '322',
    category: 'emulsifier',
    safety: 'safe',
    safetyText: '友好',
    allergens: ['soy'],
    usage: '乳化油与水',
    foods: ['巧克力', '人造黄油', '烘焙食品', '饮料'],
    intro: '卵磷脂是天然存在的磷脂类物质，能让油和水“和平共处”，是巧克力顺滑口感的关键。',
    adiability: '无需规定 ADI',
    note: '大豆来源，对大豆严重过敏者需注意。一般人群安全性良好。'
  },
  {
    id: 'monoglyceride',
    name: '单硬脂酸甘油酯',
    en: 'Mono and Diglycerides',
    ins: '471',
    category: 'emulsifier',
    safety: 'safe',
    safetyText: '较安全',
    usage: '乳化 / 延缓淀粉老化',
    foods: ['面包', '蛋糕', '人造奶油', '冰淇淋'],
    intro: '单甘酯是最常用的食品乳化剂之一，能改善面制品组织结构、延缓淀粉老化。',
    adiability: '无需规定 ADI',
    note: '让面包保持松软的“幕后功臣”，安全性良好。'
  },
  {
    id: 'bakingpowder',
    name: '碳酸氢钠（小苏打）',
    en: 'Sodium Bicarbonate',
    ins: '500',
    category: 'leavening',
    safety: 'safe',
    safetyText: '友好',
    usage: '受热产气使面食蓬松',
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
    safety: 'alert',
    safetyText: '含铝需控制',
    caution: '控制铝摄入',
    usage: '受热产气使面食蓬松',
    foods: ['油条', '炸油糕', '粉丝', '海蜇'],
    intro: '明矾是传统膨松剂，含铝。我国已严格限制铝在食品中的残留量，并推广“无铝膨松剂”替代。',
    adiability: '铝的每周耐受摄入量 2 mg/kg 体重（JECFA）',
    note: '长期过量摄入铝可能对神经系统和骨骼健康不利。建议少吃街边油炸面食，购买时留意“无铝”标识。'
  },
  {
    id: 'citric',
    name: '柠檬酸',
    en: 'Citric Acid',
    ins: '330',
    category: 'acidity',
    safety: 'safe',
    safetyText: '友好',
    usage: '调节酸度',
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
    safety: 'safe',
    safetyText: '友好',
    usage: '调节酸度 / 柔和酸味',
    foods: ['果汁', '饮料', '糖果'],
    intro: '苹果酸最初从苹果中提取，酸味柔和持久，常与柠檬酸复配使用。',
    adiability: '无需规定 ADI',
    note: '安全性良好，带来清爽的酸味体验。'
  },
  {
    id: 'phosphate',
    name: '三聚磷酸钠',
    en: 'Sodium Tripolyphosphate',
    ins: '451',
    category: 'humectant',
    safety: 'caution',
    safetyText: '需留意总量',
    caution: '肾病人群控制',
    usage: '保水 / 改善嫩度',
    foods: ['火腿肠', '速冻虾仁', '肉丸', '方便面'],
    intro: '磷酸盐能提高肉的持水性，让加工肉制品更嫩、出品率更高，也能防止速冻水产表面失水。',
    adiability: 'ADI 0–70 mg/kg 体重（以磷计，JECFA）',
    note: '单看一种食品的磷酸盐并不可怕，问题在于加工食品吃得多时“总量叠加”。肾功能不全者需要严格控制磷摄入。'
  },
  {
    id: 'msg',
    name: '谷氨酸钠（味精）',
    en: 'Monosodium Glutamate',
    ins: '621',
    category: 'flavor',
    safety: 'safe',
    safetyText: '较安全',
    usage: '提鲜 / 增强风味',
    foods: ['方便面', '调味料', '膨化食品', '酱料'],
    intro: '谷氨酸钠就是味精的主要成分，鲜味来自谷氨酸——它天然存在于番茄、海带、奶酪中。',
    adiability: '无需规定 ADI（JECFA）',
    note: '所谓“中餐馆综合征”始终缺乏严谨证据。正常食用安全，但婴幼儿食品不建议添加，且它常与高钠同时出现，控钠才是重点。'
  },
  {
    id: 'tocopherol',
    name: '维生素E（生育酚）',
    en: 'Tocopherol',
    ins: '307',
    category: 'antioxidant',
    safety: 'safe',
    safetyText: '友好',
    usage: '抗氧化 / 营养强化',
    foods: ['食用油', '坚果制品', '方便面', '饮料'],
    intro: '维生素 E 即生育酚，既是人体必需营养素，也是最常用的天然抗氧化剂之一，能延缓油脂氧化酸败。',
    adiability: '无需规定 ADI',
    note: '属于营养与抗氧化双重身份的添加剂。油炸面饼、坚果类食品里常见，用来防止油脂哈喇味。'
  },
  {
    id: 'paprika',
    name: '辣椒红',
    en: 'Paprika Red',
    ins: '160c',
    category: 'colorant',
    safety: 'safe',
    safetyText: '天然来源',
    usage: '着红橙色',
    foods: ['调味料', '肉制品', '方便面', '酱料'],
    intro: '辣椒红从辣椒中提取，属于天然着色剂，能给出稳定的红橙色调，微量带入的辣椒素几乎可以忽略。',
    adiability: 'ADI 0–5 mg/kg 体重（JECFA，以辣椒红素计）',
    note: '天然色素，安全性良好。它不会让食品变辣——辣味来自辣椒素，与色素是两回事。'
  },
  {
    id: 'phosphoric',
    name: '磷酸',
    en: 'Phosphoric Acid',
    ins: '338',
    category: 'acidity',
    safety: 'caution',
    safetyText: '需留意总量',
    caution: '可乐少喝 / 关注磷摄入',
    usage: '调节酸度 / 提供酸味',
    foods: ['可乐', '碳酸饮料', '果味饮料'],
    intro: '磷酸是可乐类饮料的关键酸味来源，也是可乐区别于其他碳酸饮料的风味基础之一。',
    adiability: 'ADI 0–70 mg/kg 体重（以磷计，JECFA）',
    note: '单瓶可乐的磷不足为虑，但长期用含磷饮料替代饮水会挤占钙的摄入。肾功能不全者需严格控磷。'
  },
  {
    id: 'potassiumcarbonate',
    name: '碳酸钾',
    en: 'Potassium Carbonate',
    ins: '501',
    category: 'acidity',
    safety: 'safe',
    safetyText: '较安全',
    usage: '调节酸度 / 让面条筋道',
    foods: ['方便面', '生湿面制品', '拉面'],
    intro: '碳酸钾在面制品中用来调节酸碱度，让面条更筋道、更耐煮，是拉面里碱水的主要成分之一。',
    adiability: '无需规定 ADI',
    note: '安全性良好。它带来的碱性正是面条弹牙口感的来源，也会让面汤略带碱味。'
  },

  // ---------------- 防腐剂 ----------------
  {
    id: 'dehydroacetate',
    name: '脱氢乙酸钠',
    alias: ['脱氢醋酸钠'],
    en: 'Sodium Dehydroacetate',
    ins: '266',
    category: 'preservative',
    safety: 'caution',
    safetyText: '法规有变化',
    caution: '新国标已大幅限用',
    usage: '抑制霉菌与酵母',
    foods: ['腌渍蔬菜', '熟肉制品', '复合调味料', '发酵豆制品'],
    intro: '脱氢乙酸钠对霉菌、酵母菌和腐败菌的抑制力很强，成本低、效果好，曾经是面包糕点里最常见的防腐剂之一。',
    adiability: 'ADI 0–0.5 mg/kg 体重（以脱氢乙酸计）',
    note: '2025 年 2 月 8 日起实施的新版 GB 2760 已禁止它在面包、糕点、淀粉制品、预制肉制品、果蔬汁等食品中使用，腌渍蔬菜的限量也从 1.0 g/kg 降到 0.3 g/kg。现在还能在货架上看到这个名字，多半是标准切换期生产的存量产品。'
  },
  {
    id: 'nisin',
    name: '乳酸链球菌素',
    alias: ['Nisin', '尼辛'],
    en: 'Nisin',
    ins: '234',
    category: 'preservative',
    safety: 'safe',
    safetyText: '较安全',
    usage: '天然抗菌肽 / 抑制肉毒杆菌',
    foods: ['肉制品', '乳制品', '酱料', '植物蛋白饮料'],
    intro: '乳酸链球菌素是乳酸乳球菌发酵产生的一种天然抗菌肽，进入人体后会被消化酶分解成氨基酸，对肉毒杆菌等革兰氏阳性菌抑制效果突出。',
    adiability: 'ADI 0–33 000 IU/kg 体重（JECFA）',
    note: '属于微生物发酵来源的防腐剂，安全性评价较好，是少数被允许用在部分乳制品中的“生物防腐剂”。新版 GB 2760 规定罐头类食品不再允许使用。'
  },
  {
    id: 'natamycin',
    name: '纳他霉素',
    alias: ['游霉素', '匹马菌素'],
    en: 'Natamycin',
    ins: '235',
    category: 'preservative',
    safety: 'safe',
    safetyText: '较安全',
    usage: '表面防霉（抗真菌）',
    foods: ['糕点表面', '干酪', '肉制品表面', '发酵酒'],
    intro: '纳他霉素是链霉菌发酵产生的多烯类抗真菌剂，几乎不溶于水、也难以被肠道吸收，所以通常用喷洒或浸泡的方式处理食品表面。',
    adiability: 'ADI 0–0.3 mg/kg 体重（JECFA）',
    note: '它只对霉菌和酵母有效，对细菌无效，因此定位是“表面防霉”而不是整体防腐。新版 GB 2760 规定果蔬汁（浆）中不得使用。'
  },
  {
    id: 'sodiumlactate',
    name: '乳酸钠',
    en: 'Sodium Lactate',
    ins: '325',
    category: 'preservative',
    safety: 'safe',
    safetyText: '较安全',
    usage: '抑菌 / 保水 / 调节风味',
    foods: ['熟肉制品', '火腿', '酱卤肉', '生湿面制品'],
    intro: '乳酸钠是乳酸的钠盐，能降低水分活度、抑制微生物生长，同时让肉制品更保水、口感更嫩，是预包装熟肉里的常客。',
    adiability: '无需规定 ADI',
    note: '安全性高，但它的“钠”同样计入每日钠摄入。高血压人群看营养成分表时，别忘了这一份钠也要算进去。'
  },

  // ---------------- 抗氧化剂 ----------------
  {
    id: 'erythorbate',
    name: '异抗坏血酸钠',
    alias: ['D-异抗坏血酸钠', '异VC钠'],
    en: 'Sodium Erythorbate',
    ins: '316',
    category: 'antioxidant',
    safety: 'safe',
    safetyText: '较安全',
    usage: '防止氧化变色',
    foods: ['肉制品', '果蔬罐头', '啤酒', '冷冻水产'],
    intro: '异抗坏血酸钠是维生素 C 的“镜像分子”，抗氧化能力接近，但几乎没有维生素 C 的营养作用，主要用来防止肉制品发色不良和果蔬褐变。',
    adiability: 'ADI 0–5 mg/kg 体重（JECFA，以异抗坏血酸计）',
    note: '常被误当成“加了维生素 C”，其实它不提供维生素 C 的营养价值，只是抗氧化剂——名字像，作用不一样。'
  },
  {
    id: 'bha',
    name: '丁基羟基茴香醚',
    alias: ['BHA'],
    en: 'Butylated Hydroxyanisole',
    ins: '320',
    category: 'antioxidant',
    safety: 'caution',
    safetyText: '需留意',
    caution: '油炸食品少吃',
    usage: '防止油脂酸败',
    foods: ['食用油', '油炸食品', '饼干', '方便面'],
    intro: 'BHA 是常用的合成抗氧化剂，能阻断油脂氧化的链式反应，让含油食品不容易产生哈喇味。',
    adiability: 'ADI 0–0.5 mg/kg 体重（JECFA）',
    note: '高剂量动物实验中观察到过一定影响，各国限量差异较大。正常饮食的摄入量通常远低于 ADI，但油炸食品本身也不宜多吃。'
  },
  {
    id: 'bht',
    name: '二丁基羟基甲苯',
    alias: ['BHT'],
    en: 'Butylated Hydroxytoluene',
    ins: '321',
    category: 'antioxidant',
    safety: 'caution',
    safetyText: '需留意',
    usage: '延缓油脂氧化',
    foods: ['食用油', '坚果炒货', '油炸食品', '口香糖'],
    intro: 'BHT 常与 BHA 配合使用，两者协同能更有效地延缓油脂酸败，是食用油和坚果炒货里的常见组合。',
    adiability: 'ADI 0–0.3 mg/kg 体重（JECFA）',
    note: '脂溶性较强，会在脂肪组织中有所分布。正常饮食下摄入量远低于 ADI，不必恐慌，但也不建议长期大量吃同一种深加工食品。'
  },
  {
    id: 'propylgallate',
    name: '没食子酸丙酯',
    alias: ['PG'],
    en: 'Propyl Gallate',
    ins: '310',
    category: 'antioxidant',
    safety: 'caution',
    safetyText: '需留意',
    usage: '防止油脂氧化',
    foods: ['食用油脂', '油炸食品', '腌腊肉制品'],
    intro: '没食子酸丙酯抗氧化效果强，常与 BHA、BHT 复配使用，起协同增效作用，多出现在油脂和油炸类食品中。',
    adiability: 'ADI 0–1.4 mg/kg 体重（JECFA）',
    note: '在几种常见合成抗氧化剂中 ADI 相对较低，所以实际配方里往往与其他品种复配，以降低单一品种的用量。'
  },

  // ---------------- 甜味剂 ----------------
  {
    id: 'acesulfame',
    name: '安赛蜜',
    alias: ['乙酰磺胺酸钾', 'AK糖'],
    en: 'Acesulfame Potassium',
    ins: '950',
    category: 'sweetener',
    safety: 'safe',
    safetyText: '较安全',
    usage: '高倍甜味 / 不参与代谢',
    foods: ['无糖饮料', '口香糖', '低糖烘焙', '乳饮料'],
    intro: '安赛蜜甜度约为蔗糖的 200 倍，人体不代谢、原样排出，常与阿斯巴甜或三氯蔗糖复配，用来把甜味曲线补圆。',
    adiability: 'ADI 0–15 mg/kg 体重（JECFA）',
    note: '单独使用时后味略苦，所以配方里几乎总是和别的甜味剂搭档。新版 GB 2760 对阿斯巴甜、安赛蜜等同时使用时的总量提出了控制要求。'
  },
  {
    id: 'saccharin',
    name: '糖精钠',
    alias: ['糖精'],
    en: 'Sodium Saccharin',
    ins: '954',
    category: 'sweetener',
    safety: 'caution',
    safetyText: '需留意',
    caution: '婴幼儿食品禁用',
    usage: '高倍甜味 / 成本低',
    foods: ['蜜饯', '饮料', '酱菜', '冰淇淋'],
    intro: '糖精钠是最早使用的高倍甜味剂之一，甜度约为蔗糖的 300 倍，带轻微的金属后味。',
    adiability: 'ADI 0–5 mg/kg 体重（JECFA）',
    note: '上世纪的大鼠实验曾引发争议，后续研究认为与人类膀胱癌无明确因果关系，JECFA 已两次上调其 ADI。我国规定婴幼儿食品中不得使用。'
  },
  {
    id: 'erythritol',
    name: '赤藓糖醇',
    alias: ['赤藓醇'],
    en: 'Erythritol',
    ins: '968',
    category: 'sweetener',
    safety: 'safe',
    safetyText: '较安全',
    usage: '低热量甜味 / 几乎不升血糖',
    foods: ['无糖饮料', '零糖气泡水', '巧克力', '口香糖'],
    intro: '赤藓糖醇是一种糖醇，甜度约为蔗糖的 70%，分子小，绝大部分以原型从尿中排出，因此热量几乎可以忽略，也不引起血糖明显波动。',
    adiability: '无需规定 ADI',
    note: '一次性摄入较多（尤其空腹）可能引起腹胀或轻度腹泻，这是糖醇的共性，不等于“有毒”。'
  },
  {
    id: 'maltitol',
    name: '麦芽糖醇',
    alias: ['氢化麦芽糖'],
    en: 'Maltitol',
    ins: '965',
    category: 'sweetener',
    safety: 'safe',
    safetyText: '较安全',
    usage: '低糖甜味 / 改善口感',
    foods: ['无糖糖果', '巧克力', '糕点', '冰淇淋'],
    intro: '麦芽糖醇甜度接近蔗糖，口感比赤藓糖醇更“像糖”，常用在无糖巧克力和糖果中，但会部分被肠道菌群发酵。',
    adiability: '无需规定 ADI',
    note: '升糖幅度低于蔗糖但并非为零，糖尿病患者仍需计入碳水总量。吃多了容易腹胀，部分产品会标注“过量食用可能引起腹泻”。'
  },

  // ---------------- 着色剂 ----------------
  {
    id: 'ponceau4r',
    name: '胭脂红',
    alias: ['丽春红4R'],
    en: 'Ponceau 4R',
    ins: '124',
    category: 'colorant',
    safety: 'caution',
    safetyText: '需留意',
    caution: '儿童零食留意',
    usage: '赋予红艳色泽',
    foods: ['饮料', '蜜饯', '糖果', '肉制品'],
    intro: '胭脂红是水溶性合成偶氮类色素，色泽鲜艳、稳定性好，是饮料和蜜饯里最常见的红色来源之一。',
    adiability: 'ADI 0–4 mg/kg 体重（JECFA）',
    note: '属于合成色素。欧盟要求含此类色素的食品标注“可能对儿童活动和注意力产生不良影响”，我国则按限量管理。'
  },
  {
    id: 'brilliantblue',
    name: '亮蓝',
    alias: ['亮蓝FCF'],
    en: 'Brilliant Blue FCF',
    ins: '133',
    category: 'colorant',
    safety: 'caution',
    safetyText: '需留意',
    usage: '赋予蓝色 / 复配调色',
    foods: ['饮料', '糖果', '冰淇淋', '糕点装饰'],
    intro: '亮蓝是水溶性合成色素，常与柠檬黄复配调出绿色，或单独用于蓝色饮料和糖果。',
    adiability: 'ADI 0–12.5 mg/kg 体重（JECFA）',
    note: 'ADI 在常见合成色素中相对较高，正常食用风险很低。但它出现的时候，通常说明颜色是“设计”出来的，不是原料本色。'
  },
  {
    id: 'betacarotene',
    name: 'β-胡萝卜素',
    alias: ['胡萝卜素'],
    en: 'Beta-Carotene',
    ins: '160a',
    category: 'colorant',
    safety: 'safe',
    safetyText: '天然来源',
    usage: '橙黄色着色 / 维生素 A 前体',
    foods: ['果汁饮料', '黄油', '糕点', '冰淇淋'],
    intro: 'β-胡萝卜素是天然存在的类胡萝卜素，既是橙黄色色素，也是维生素 A 的前体，可在体内按需转化。',
    adiability: 'ADI 0–5 mg/kg 体重（JECFA，以 β-胡萝卜素计）',
    note: '安全性较好。高剂量补充剂形式与吸烟者肺癌风险的关联曾被观察到，但食物着色用量与补充剂完全不是一个量级。新版 GB 2760 规定蒸馏酒中不得使用。'
  },
  {
    id: 'allurared',
    name: '诱惑红',
    alias: ['阿洛拉红'],
    en: 'Allura Red AC',
    ins: '129',
    category: 'colorant',
    safety: 'caution',
    safetyText: '需留意',
    caution: '儿童零食留意',
    usage: '赋予红橙色',
    foods: ['糖果', '饮料', '烘焙装饰', '肉制品'],
    intro: '诱惑红是合成偶氮色素，色泽偏橙红，比胭脂红更“亮”，常用于糖果、饮料和烘焙装饰。',
    adiability: 'ADI 0–7 mg/kg 体重（JECFA）',
    note: '与柠檬黄、日落黄等同类，欧盟同样要求加注儿童注意力提示。正常饮食摄入量通常远低于 ADI。'
  },

  // ---------------- 增稠剂 ----------------
  {
    id: 'guargum',
    name: '瓜尔胶',
    alias: ['瓜尔豆胶'],
    en: 'Guar Gum',
    ins: '412',
    category: 'thickener',
    safety: 'safe',
    safetyText: '天然来源',
    usage: '增稠 / 稳定',
    foods: ['冰淇淋', '乳饮料', '酱料', '方便面'],
    intro: '瓜尔胶提取自瓜尔豆种子，遇水能形成高黏度溶液，少量就能明显增稠，是植物来源的天然增稠剂。',
    adiability: '无需规定 ADI',
    note: '本质上是一种可溶性膳食纤维，安全性很高。用量大时有轻微通便作用，这也是它被用在“高纤”产品里的原因之一。'
  },
  {
    id: 'sodiumalginate',
    name: '海藻酸钠',
    alias: ['褐藻酸钠'],
    en: 'Sodium Alginate',
    ins: '401',
    category: 'thickener',
    safety: 'safe',
    safetyText: '天然来源',
    usage: '增稠 / 遇钙成胶',
    foods: ['冰淇淋', '果冻', '仿生食品', '乳饮料'],
    intro: '海藻酸钠从褐藻中提取，遇到钙离子会形成凝胶，是“人造鱼子”“分子料理”里最常见的原料之一。',
    adiability: '无需规定 ADI',
    note: '安全性良好，本身也是膳食纤维。它既能增稠也能成胶，因此既可作增稠剂也可作稳定剂。'
  },
  {
    id: 'agar',
    name: '琼脂',
    alias: ['洋菜', '寒天'],
    en: 'Agar',
    ins: '406',
    category: 'thickener',
    safety: 'safe',
    safetyText: '天然来源',
    usage: '凝胶 / 增稠',
    foods: ['果冻', '软糖', '布丁', '罐头'],
    intro: '琼脂从石花菜等红藻中提取，冷却后能形成比明胶更挺的凝胶，而且熔点高，所以果冻和软糖常用它定型。',
    adiability: '无需规定 ADI',
    note: '植物来源的凝胶剂，素食者可以放心。口感比明胶更脆、更“断”，不是弹。'
  },

  // ---------------- 乳化剂 ----------------
  {
    id: 'sucroseesters',
    name: '蔗糖脂肪酸酯',
    alias: ['蔗糖酯'],
    en: 'Sucrose Esters of Fatty Acids',
    ins: '473',
    category: 'emulsifier',
    safety: 'safe',
    safetyText: '较安全',
    usage: '乳化 / 稳定',
    foods: ['饮料', '冰淇淋', '烘焙食品', '巧克力'],
    intro: '蔗糖脂肪酸酯由蔗糖与食用脂肪酸酯化而成，亲水亲油平衡值跨度大，从饮料到巧克力都能用，是用途最广的乳化剂之一。',
    adiability: 'ADI 0–30 mg/kg 体重（JECFA）',
    note: '在体内会分解为蔗糖和脂肪酸，安全性较好。它也是“乳化剂”最典型的代表：让油和水不分家。'
  },
  {
    id: 'polyglycerolesters',
    name: '聚甘油脂肪酸酯',
    alias: ['聚甘油酯'],
    en: 'Polyglycerol Esters of Fatty Acids',
    ins: '475',
    category: 'emulsifier',
    safety: 'safe',
    safetyText: '较安全',
    usage: '乳化 / 防结晶',
    foods: ['蛋糕', '饮料', '巧克力', '植脂奶油'],
    intro: '聚甘油脂肪酸酯是聚合甘油与脂肪酸的酯化物，乳化能力强，常用于蛋糕糊和饮料中稳定整个体系。',
    adiability: 'ADI 0–25 mg/kg 体重（JECFA）',
    note: '安全性评价良好。它多见于需要“长时间不分层”的饮料，和需要“打发后不塌”的蛋糕。'
  },
  {
    id: 'ssl',
    name: '硬脂酰乳酸钠',
    alias: ['SSL'],
    en: 'Sodium Stearoyl Lactylate',
    ins: '481',
    category: 'emulsifier',
    safety: 'safe',
    safetyText: '较安全',
    usage: '面团改良 / 乳化',
    foods: ['面包', '馒头', '饼干', '植脂奶油'],
    intro: '硬脂酰乳酸钠能与面粉中的淀粉和蛋白质结合，让面团更耐搅拌、面包更柔软、老化更慢，是烘焙里最常用的面团改良剂之一。',
    adiability: 'ADI 0–20 mg/kg 体重（JECFA）',
    note: '乳化剂兼面团改良剂。它让面包“放几天还软”，这既是工艺优势，也提醒我们：软不等于刚出炉。'
  },

  // ---------------- 膨松剂 ----------------
  {
    id: 'ammoniumbicarbonate',
    name: '碳酸氢铵',
    alias: ['臭粉'],
    en: 'Ammonium Bicarbonate',
    ins: '503',
    category: 'leavening',
    safety: 'safe',
    safetyText: '较安全',
    usage: '受热全部分解产气',
    foods: ['饼干', '桃酥', '油条', '威化'],
    intro: '碳酸氢铵受热会全部分解成气体（氨、二氧化碳和水），几乎不留残渣，所以特别适合需要“脆”而不是“松”的饼干类产品。',
    adiability: '无需规定 ADI',
    note: '分解时会产生氨味，因此只用于薄型、烘烤充分的饼干。厚制品若用它，容易残留异味。'
  },
  {
    id: 'calciumcarbonate',
    name: '碳酸钙',
    en: 'Calcium Carbonate',
    ins: '170',
    category: 'leavening',
    safety: 'safe',
    safetyText: '较安全',
    usage: '膨松 / 补钙 / 抗结',
    foods: ['面粉', '饼干', '奶粉', '口香糖'],
    intro: '碳酸钙遇酸产生二氧化碳，可作膨松剂；同时它也是常见的钙强化剂和抗结剂，用途跨度很大。',
    adiability: '无需规定 ADI',
    note: '安全性很高，本身就是钙的来源。它在配料表里可能出现，是起膨松、抗结还是营养强化，要看具体食品。'
  },

  // ---------------- 酸度调节剂 ----------------
  {
    id: 'lacticacid',
    name: '乳酸',
    en: 'Lactic Acid',
    ins: '270',
    category: 'acidity',
    safety: 'safe',
    safetyText: '较安全',
    usage: '调节酸度 / 柔和酸味',
    foods: ['酸奶', '饮料', '酱菜', '面包'],
    intro: '乳酸是最常见的天然有机酸之一，酸味柔和，广泛用于乳制品、饮料和发酵食品的调酸。',
    adiability: '无需规定 ADI',
    note: '安全性高，人体代谢本身就会产生乳酸。它和“运动后肌肉酸痛”的那个乳酸不是一回事，不必联想。'
  },
  {
    id: 'sodiumcitrate',
    name: '柠檬酸钠',
    alias: ['枸橼酸钠'],
    en: 'Sodium Citrate',
    ins: '331',
    category: 'acidity',
    safety: 'safe',
    safetyText: '较安全',
    usage: '缓冲酸度 / 稳定体系',
    foods: ['饮料', '乳饮料', '果酱', '冰淇淋'],
    intro: '柠檬酸钠是柠檬酸的钠盐，pH 缓冲能力强，能防止饮料和乳制品在储存中酸度漂移、蛋白沉淀。',
    adiability: '无需规定 ADI',
    note: '安全性良好，医疗上还用作抗凝剂。它在配料表里出现，多数时候是为了“让味道和状态稳住”。'
  },
  {
    id: 'tartaricacid',
    name: '酒石酸',
    en: 'Tartaric Acid',
    ins: '334',
    category: 'acidity',
    safety: 'safe',
    safetyText: '天然来源',
    usage: '酸度调节 / 葡萄特征酸',
    foods: ['葡萄酒', '饮料', '糖果', '烘焙'],
    intro: '酒石酸天然存在于葡萄中，是葡萄酒里最主要的固定酸之一，酸味比柠檬酸更“硬”，带明显的葡萄特征。',
    adiability: 'ADI 0–30 mg/kg 体重（JECFA）',
    note: '葡萄酒中天然存在，通常无需标示。作为添加剂使用时，多见于葡萄味饮料和糖果。'
  },

  // ---------------- 护色剂 ----------------
  {
    id: 'sodiumnitrate',
    name: '硝酸钠',
    en: 'Sodium Nitrate',
    ins: '251',
    category: 'colorfix',
    safety: 'caution',
    safetyText: '需留意',
    caution: '加工肉控制频率',
    usage: '缓慢释放亚硝酸盐',
    foods: ['腊肉', '香肠', '火腿', '风干肉'],
    intro: '硝酸钠在肉中会缓慢转化为亚硝酸盐，起到持久护色和抑菌作用，适合需要长时间腌制的传统肉制品。',
    adiability: 'ADI 0–3.7 mg/kg 体重（以硝酸根计）',
    note: '相当于亚硝酸盐的“缓释版本”，最终风险与亚硝酸盐同源。传统腊肉、风干肠里更常见，建议控制食用频率。'
  },
  {
    id: 'potassiumnitrate',
    name: '硝酸钾',
    alias: ['硝石'],
    en: 'Potassium Nitrate',
    ins: '252',
    category: 'colorfix',
    safety: 'caution',
    safetyText: '需留意',
    caution: '加工肉控制频率',
    usage: '护色 / 抑菌',
    foods: ['腊肠', '火腿', '腌肉'],
    intro: '硝酸钾的作用与硝酸钠一致，主要在长时间腌制的肉制品中缓慢释放亚硝酸盐，让肉色保持稳定。',
    adiability: 'ADI 0–3.7 mg/kg 体重（以硝酸根计）',
    note: '它就是传统腌肉里说的“硝”，历史上还是火药原料。现代工艺已大幅降低用量，但加工肉制品整体仍建议少吃。'
  },
  {
    id: 'potassiumnitrite',
    name: '亚硝酸钾',
    en: 'Potassium Nitrite',
    ins: '249',
    category: 'colorfix',
    safety: 'alert',
    safetyText: '严格限量',
    caution: '严格控量',
    usage: '护色 / 抑制肉毒杆菌',
    foods: ['腌肉', '香肠', '罐头肉'],
    intro: '亚硝酸钾与亚硝酸钠作用相同，用于部分肉制品的护色和抑菌，使用量与残留量都受严格限制。',
    adiability: 'ADI 0–0.07 mg/kg 体重（以亚硝酸根计）',
    note: '与亚硝酸钠同属管理最严的一类添加剂。它的核心价值是抑制肉毒杆菌——这种菌产生的毒素，危险性远高于添加剂本身。'
  },

  // ---------------- 水分保持剂 ----------------
  {
    id: 'shmp',
    name: '六偏磷酸钠',
    alias: ['格雷姆盐'],
    en: 'Sodium Hexametaphosphate',
    ins: '452',
    category: 'humectant',
    safety: 'caution',
    safetyText: '需留意总量',
    caution: '关注磷总量',
    usage: '保水 / 螯合金属离子',
    foods: ['肉制品', '水产加工', '饮料', '冰淇淋'],
    intro: '六偏磷酸钠能螯合金属离子、提高蛋白持水性，让肉制品更嫩，速冻水产不易失水变柴。',
    adiability: 'ADI 0–70 mg/kg 体重（以磷计，JECFA）',
    note: '磷酸盐的风险在于“总量叠加”：多种加工食品都含磷时会累积。肾功能不全者需要严格控磷。'
  },
  {
    id: 'sodiumpyrophosphate',
    name: '焦磷酸钠',
    alias: ['焦磷酸四钠'],
    en: 'Sodium Pyrophosphate',
    ins: '450',
    category: 'humectant',
    safety: 'caution',
    safetyText: '需留意总量',
    caution: '关注磷总量',
    usage: '保水 / 改善弹性',
    foods: ['火腿肠', '鱼糜制品', '方便面', '速冻食品'],
    intro: '焦磷酸钠是聚磷酸盐的一种，能提高肉的保水性和弹性，鱼丸、蟹棒这类鱼糜制品里尤其常见。',
    adiability: 'ADI 0–70 mg/kg 体重（以磷计，JECFA）',
    note: '常与三聚磷酸钠、六偏磷酸钠复配。看配料表时，如果几种“磷酸某钠”同时出现，说明磷的总量值得留意。'
  },
  {
    id: 'trisodiumphosphate',
    name: '磷酸三钠',
    en: 'Trisodium Phosphate',
    ins: '339',
    category: 'humectant',
    safety: 'safe',
    safetyText: '较安全',
    usage: '调节 pH / 保水',
    foods: ['乳制品', '肉制品', '方便面', '罐头'],
    intro: '磷酸三钠呈强碱性，主要用于调节 pH 和保持水分，在乳制品和面制品中还能改善体系稳定性。',
    adiability: 'ADI 0–70 mg/kg 体重（以磷计，JECFA）',
    note: '仍属磷酸盐家族，同样计入磷的总摄入。单独看用量不高，叠加摄入才是关键。'
  },

  // ---------------- 增味剂 ----------------
  {
    id: 'disodiumribonucleotide',
    name: '5\'-呈味核苷酸二钠',
    alias: ['呈味核苷酸二钠', 'I+G'],
    en: 'Disodium 5\'-Ribonucleotide',
    ins: '631+627',
    category: 'flavor',
    safety: 'safe',
    safetyText: '较安全',
    usage: '增鲜 / 与味精协同',
    foods: ['鸡精', '方便面', '酱油', '复合调味料'],
    intro: '它是 5\'-肌苷酸二钠与 5\'-鸟苷酸二钠的混合物，本身鲜味不强，但与谷氨酸钠同用时鲜味能放大数倍，这就是“鲜味协同效应”。',
    adiability: '无需规定 ADI',
    note: '配料表上的“呈味核苷酸二钠”“I+G”就是它。它让鸡精的鲜味远超单纯味精，也常被当成“更高级的鲜味剂”。'
  },
  {
    id: 'disodiumguanylate',
    name: '5\'-鸟苷酸二钠',
    alias: ['鸟苷酸二钠'],
    en: 'Disodium 5\'-Guanylate',
    ins: '627',
    category: 'flavor',
    safety: 'safe',
    safetyText: '较安全',
    usage: '增鲜',
    foods: ['调味料', '汤料', '方便面', '酱油'],
    intro: '5\'-鸟苷酸二钠是核酸类鲜味剂，鲜味强度高，与谷氨酸钠协同后能让汤料和调味料的鲜味更持久。',
    adiability: '无需规定 ADI',
    note: '它本来就是酵母抽提物等天然原料中的成分。痛风患者常担心的嘌呤问题，在正常调味用量下影响很小。'
  },
  {
    id: 'disodiumsuccinate',
    name: '琥珀酸二钠',
    alias: ['干贝素'],
    en: 'Disodium Succinate',
    ins: '364',
    category: 'flavor',
    safety: 'safe',
    safetyText: '较安全',
    usage: '贝类鲜味 / 增味',
    foods: ['酱油', '贝类调味料', '汤料', '料酒'],
    intro: '琥珀酸二钠带有明显的贝类鲜味，是扇贝、蛤蜊那种“海鲜味”的来源之一，常用于海鲜风味调味料。',
    adiability: '无需规定 ADI',
    note: '安全性良好。它提供的是区别于味精的“海鲜鲜”，所以海鲜味调料里经常能看到它。'
  },

  // ---------------- 抗结剂 ----------------
  {
    id: 'silicondioxide',
    name: '二氧化硅',
    alias: ['无定形二氧化硅'],
    en: 'Silicon Dioxide',
    ins: '551',
    category: 'anticaking',
    safety: 'safe',
    safetyText: '较安全',
    usage: '防止结块',
    foods: ['食盐', '奶粉', '香辛料', '粉状调味料'],
    intro: '二氧化硅颗粒极细、吸湿性强，包裹在粉粒表面就能阻止它们黏连成团，是食盐和奶粉中最常见的抗结剂。',
    adiability: '无需规定 ADI',
    note: '化学性质稳定，不被人体吸收，随粪便排出。它与“石英粉尘吸入伤肺”是两条完全不同的暴露途径，食品中的用量和形态都不构成该风险。'
  },
  {
    id: 'calciumsilicate',
    name: '硅酸钙',
    en: 'Calcium Silicate',
    ins: '552',
    category: 'anticaking',
    safety: 'safe',
    safetyText: '较安全',
    usage: '抗结 / 吸附',
    foods: ['食盐', '糖粉', '奶粉', '烘焙粉'],
    intro: '硅酸钙是多孔结构的抗结剂，除防止结块外还能吸附部分油脂和水分，常用于粉状食品。',
    adiability: '无需规定 ADI',
    note: '安全性高，同时可作为钙的来源。它通常排在配料表很靠后的位置，说明用量很小。'
  },
  {
    id: 'potassiumferrocyanide',
    name: '亚铁氰化钾',
    alias: ['黄血盐钾'],
    en: 'Potassium Ferrocyanide',
    ins: '536',
    category: 'anticaking',
    safety: 'caution',
    safetyText: '需留意',
    caution: '名字吓人，限量极低',
    usage: '食盐抗结（防结块）',
    foods: ['食盐'],
    intro: '亚铁氰化钾是食盐专用的抗结剂，加一点点就能让食盐在潮湿环境中不结成硬块。名字里的“氰”常让人紧张。',
    adiability: 'ADI 0–0.025 mg/kg 体重（以亚铁氰根计）',
    note: '“亚铁氰”是稳定的络合物，氰基被铁牢牢锁住，不会在体内释放氰化物，且需 400 ℃ 以上才分解。按我国限量折算，每天要吃上百克食盐才可能接近 ADI。'
  },
  {
    id: 'mcc',
    name: '微晶纤维素',
    alias: ['结晶纤维素'],
    en: 'Microcrystalline Cellulose',
    ins: '460',
    category: 'anticaking',
    safety: 'safe',
    safetyText: '较安全',
    usage: '抗结 / 增稠 / 填充',
    foods: ['乳饮料', '冰淇淋', '奶酪', '压片糖果'],
    intro: '微晶纤维素由植物纤维部分水解制得，不溶于水，能提供结构支撑、防止结块，也常作为低热量填充剂。',
    adiability: '无需规定 ADI',
    note: '本质上是不可消化的纤维素，安全性很高。它也算膳食纤维，但食品中的用量远达不到“补充纤维”的程度。'
  },

  // ---------------- 漂白剂 ----------------
  {
    id: 'sulfurdioxide',
    name: '二氧化硫',
    en: 'Sulfur Dioxide',
    ins: '220',
    category: 'bleach',
    safety: 'caution',
    safetyText: '敏感人群留意',
    caution: '哮喘患者留意',
    usage: '漂白 / 防腐 / 抗氧化',
    foods: ['蜜饯', '葡萄酒', '干果', '笋干'],
    intro: '二氧化硫既是漂白剂，也是防腐剂和抗氧化剂，能防止蜜饯、干果褐变，也用于葡萄酒杀菌。它是最需要“看标签”的添加剂之一。',
    adiability: 'ADI 0–0.7 mg/kg 体重（以二氧化硫计）',
    note: '约 3%–5% 的哮喘人群对亚硫酸盐敏感，可能诱发支气管痉挛。我国规定残留量超过 10 mg/kg 时必须在标签上标示。'
  },
  {
    id: 'sodiummetabisulfite',
    name: '焦亚硫酸钠',
    alias: ['偏重亚硫酸钠'],
    en: 'Sodium Metabisulfite',
    ins: '223',
    category: 'bleach',
    safety: 'caution',
    safetyText: '敏感人群留意',
    caution: '哮喘患者留意',
    usage: '漂白 / 防腐',
    foods: ['蜜饯', '腐竹', '粉丝', '果干'],
    intro: '焦亚硫酸钠溶于水后释放二氧化硫，起漂白、防腐和抗氧化作用，是蜜饯和干制蔬菜里最常见的亚硫酸盐。',
    adiability: 'ADI 0–0.7 mg/kg 体重（以二氧化硫计）',
    note: '所有亚硫酸盐的 ADI 是合并计算的。除了蜜饯，颜色特别白亮的腐竹、银耳也要多留个心眼。'
  },
  {
    id: 'sodiumbisulfite',
    name: '亚硫酸氢钠',
    alias: ['重亚硫酸钠'],
    en: 'Sodium Bisulfite',
    ins: '222',
    category: 'bleach',
    safety: 'caution',
    safetyText: '敏感人群留意',
    caution: '哮喘患者留意',
    usage: '漂白 / 抗氧化',
    foods: ['果干', '蔬菜制品', '淀粉制品', '葡萄酒'],
    intro: '亚硫酸氢钠在酸性条件下释放二氧化硫，兼具漂白与抗氧化作用，常用于果蔬干制和淀粉类产品。',
    adiability: 'ADI 0–0.7 mg/kg 体重（以二氧化硫计）',
    note: '与焦亚硫酸钠同属亚硫酸盐家族，注意事项一致：哮喘患者需留意，且残留量按二氧化硫合并计算。'
  },
  {
    id: 'potassiummetabisulfite',
    name: '焦亚硫酸钾',
    alias: ['偏重亚硫酸钾'],
    en: 'Potassium Metabisulfite',
    ins: '224',
    category: 'bleach',
    safety: 'caution',
    safetyText: '敏感人群留意',
    caution: '哮喘患者留意',
    usage: '漂白 / 防腐 / 葡萄酒杀菌',
    foods: ['葡萄酒', '果酒', '蜜饯', '果干'],
    intro: '焦亚硫酸钾是葡萄酒酿造中最常用的亚硫酸盐，用来抑制杂菌、防止氧化，几乎所有非有机葡萄酒都会用到。',
    adiability: 'ADI 0–0.7 mg/kg 体重（以二氧化硫计）',
    note: '葡萄酒标签上的“含亚硫酸盐”指的就是它。如果开瓶前“二氧化硫味”过重，通常说明用量偏高或酒已老化。'
  },

  // ---------------- 稳定剂和凝固剂 ----------------
  {
    id: 'gdl',
    name: '葡萄糖酸-δ-内酯',
    alias: ['葡萄糖酸内酯', '内酯', 'GDL'],
    en: 'Glucono-delta-Lactone',
    ins: '575',
    category: 'stabilizer',
    safety: 'safe',
    safetyText: '较安全',
    usage: '缓慢凝固（内酯豆腐）',
    foods: ['内酯豆腐', '豆花', '火腿肠', '果汁'],
    intro: '葡萄糖酸-δ-内酯遇水后缓慢水解成葡萄糖酸，让大豆蛋白温和凝固，这就是内酯豆腐比卤水豆腐更嫩的原因。',
    adiability: '无需规定 ADI',
    note: '安全性很高，最终产物是葡萄糖酸。它的关键在一个“慢”字——太快豆腐会粗糙，太慢则不成型。'
  },
  {
    id: 'calciumchloride',
    name: '氯化钙',
    en: 'Calcium Chloride',
    ins: '509',
    category: 'stabilizer',
    safety: 'safe',
    safetyText: '较安全',
    usage: '凝固 / 保脆 / 补钙',
    foods: ['罐头蔬菜', '豆腐', '奶酪', '运动饮料'],
    intro: '氯化钙能让果蔬中的果胶交联，保持罐头蔬菜的脆度，也是豆腐凝固剂之一，同时可作钙强化剂。',
    adiability: '无需规定 ADI',
    note: '本身有一定苦味，用量过大会让产品发苦。它提供的是可利用钙，但食物中的用量不足以当补钙来源。'
  },
  {
    id: 'calciumsulfate',
    name: '硫酸钙',
    alias: ['石膏'],
    en: 'Calcium Sulfate',
    ins: '516',
    category: 'stabilizer',
    safety: 'safe',
    safetyText: '较安全',
    usage: '凝固（石膏点豆腐）',
    foods: ['豆腐', '豆干', '面粉', '罐头'],
    intro: '硫酸钙就是石膏，是传统点豆腐用的凝固剂，与大豆蛋白结合形成细腻凝胶，也是北方豆腐的典型工艺。',
    adiability: '无需规定 ADI',
    note: '“卤水点豆腐”里的卤水主要成分是氯化镁，石膏豆腐用的是硫酸钙。两者都是安全工艺，只是口感不同：石膏豆腐更嫩。'
  },
  {
    id: 'magnesiumchloride',
    name: '氯化镁',
    alias: ['卤水'],
    en: 'Magnesium Chloride',
    ins: '511',
    category: 'stabilizer',
    safety: 'safe',
    safetyText: '较安全',
    usage: '凝固（卤水）',
    foods: ['豆腐', '豆干', '海藻制品'],
    intro: '氯化镁是传统“卤水”的主要成分，能让大豆蛋白凝固，做出来的豆腐质地更紧实、豆香更足。',
    adiability: '无需规定 ADI',
    note: '卤水本身有腐蚀性，但点进豆腐后已被大幅稀释并参与凝固反应。它同时是镁的来源，那点苦味就是镁离子的特征。'
  },

  // ---------------- 被膜剂 ----------------
  {
    id: 'carnaubawax',
    name: '巴西棕榈蜡',
    alias: ['卡那巴蜡'],
    en: 'Carnauba Wax',
    ins: '903',
    category: 'coating',
    safety: 'safe',
    safetyText: '较安全',
    usage: '上光 / 防潮',
    foods: ['糖果', '巧克力', '水果表面', '口香糖'],
    intro: '巴西棕榈蜡提取自巴西棕榈树叶，是天然蜡中熔点最高的一种，能给糖果和巧克力表面带来光亮并防止受潮。',
    adiability: 'ADI 0–7 mg/kg 体重（JECFA）',
    note: '食用后基本不被吸收、原样排出。巧克力表面那层亮光和“不容易化”的手感，多半就来自它。'
  },
  {
    id: 'beeswax',
    name: '蜂蜡',
    en: 'Beeswax',
    ins: '901',
    category: 'coating',
    safety: 'safe',
    safetyText: '天然来源',
    usage: '上光 / 被膜保鲜',
    foods: ['糖果', '水果保鲜', '糕点装饰'],
    intro: '蜂蜡是蜜蜂分泌的天然蜡质，可用于糖果上光和水果表面保鲜，是少数“从名字就能看出天然来源”的添加剂。',
    adiability: '无需规定 ADI',
    note: '安全性很好。水果表面的食用蜡多为巴西棕榈蜡或蜂蜡，清水加一点盐搓洗即可去除，不必用洗涤剂反复洗。'
  },
  {
    id: 'pullulan',
    name: '普鲁兰多糖',
    alias: ['茁霉多糖', '短梗霉多糖'],
    en: 'Pullulan',
    ins: '1204',
    category: 'coating',
    safety: 'safe',
    safetyText: '较安全',
    usage: '可食用膜 / 防潮',
    foods: ['糖果', '坚果', '果蔬保鲜', '速溶饮品'],
    intro: '普鲁兰多糖由出芽短梗霉发酵产生，能形成透明、隔氧的可食用薄膜，用于坚果防潮、糖果防粘和果蔬保鲜。',
    adiability: '无需规定 ADI',
    note: '是可食用的微生物多糖，安全性良好。它形成的膜很薄且透明，肉眼几乎看不出“包了一层”。'
  },
  {
    id: 'stearicacid',
    name: '硬脂酸',
    alias: ['十八酸'],
    en: 'Stearic Acid',
    ins: '570',
    category: 'coating',
    safety: 'safe',
    safetyText: '较安全',
    usage: '被膜 / 抗结 / 润滑',
    foods: ['糖果', '口香糖', '粉状食品', '压片糖果'],
    intro: '硬脂酸是天然存在的饱和脂肪酸，可作被膜剂和抗结剂，让压片糖果表面光滑、粉体不易黏连。',
    adiability: '无需规定 ADI',
    note: '本身就是食物脂肪的组成成分之一，安全性高。它在配料表里出现时，用量通常只有千分之几。'
  }
];

// 示例标签数据：categoryId + 每 100 g(mL) 营养成分，用于一键填充
const SAMPLE_LABELS = [
  {
    id: 'sample1',
    name: '某品牌碳酸饮料',
    type: '饮料',
    categoryId: 'drink',
    basis: '每 100 mL',
    text: '配料：水、果葡糖浆、白砂糖、二氧化碳、焦糖色、磷酸、咖啡因、山梨酸钾、阿斯巴甜、柠檬酸、香精。',
    nutrition: { energy: 180, protein: 0, fat: 0, carb: 10.6, sugar: 10.6, sodium: 12, fiber: 0 }
  },
  {
    id: 'sample2',
    name: '某品牌切片面包',
    type: '烘焙面点',
    categoryId: 'bakery',
    basis: '每 100 g',
    text: '配料：小麦粉、水、白砂糖、酵母、食用盐、大豆卵磷脂、单硬脂酸甘油酯、黄原胶、抗坏血酸、丙酸钙。',
    nutrition: { energy: 1100, protein: 8.2, fat: 4.5, carb: 48, sugar: 6, sodium: 380, fiber: 2.6 }
  },
  {
    id: 'sample3',
    name: '某品牌火腿肠',
    type: '肉制品',
    categoryId: 'meat',
    basis: '每 100 g',
    text: '配料：猪肉、鸡肉、水、食用盐、白砂糖、亚硝酸钠、山梨酸钾、卡拉胶、大豆蛋白、香辛料、三聚磷酸钠。',
    nutrition: { energy: 1000, protein: 12, fat: 18, carb: 6, sugar: 3, sodium: 900, fiber: 0 }
  },
  {
    id: 'sample4',
    name: '某品牌无糖口香糖',
    type: '零食糖果',
    categoryId: 'snack',
    basis: '每 100 g',
    text: '配料：木糖醇、山梨糖醇、胶基、麦芽糊精、阿拉伯胶、柠檬黄、二氧化钛、薄荷香精、阿斯巴甜。',
    nutrition: { energy: 720, protein: 0, fat: 0, carb: 45, sugar: 0, sodium: 0, fiber: 0 }
  },
  {
    id: 'sample5',
    name: '某品牌果味酸奶',
    type: '乳制品',
    categoryId: 'dairy',
    basis: '每 100 g',
    text: '配料：生牛乳、白砂糖、水、全脂奶粉、果胶、羧甲基纤维素钠、三氯蔗糖、柠檬黄、日落黄、乳酸菌、食用香精。',
    nutrition: { energy: 380, protein: 2.8, fat: 2.5, carb: 12, sugar: 11, sodium: 45, fiber: 0 }
  },
  {
    id: 'sample6',
    name: '某品牌红烧牛肉面',
    type: '方便速食',
    categoryId: 'instant',
    basis: '每 100 g',
    text: '配料：小麦粉、棕榈油、食用盐、谷氨酸钠、白砂糖、酱油、三聚磷酸钠、碳酸钾、维生素E、香辛料、脱水牛肉粒、辣椒红。',
    nutrition: { energy: 1900, protein: 9, fat: 18, carb: 60, sugar: 4, sodium: 1800, fiber: 1.2 }
  }
];

// AI 问答知识条目
const QA_KNOWLEDGE = [
  {
    // generic：这条讲的是“添加剂整体”，用户若点名了具体添加剂，应优先回那张卡片
    generic: true,
    keywords: ['添加剂有害吗', '添加剂安全吗', '添加剂是不是有害', '食品安全', '有害吗', '添加剂有毒', '添加剂能不能吃'],
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
    answer: '目前主流甜味剂（三氯蔗糖、阿斯巴甜、甜菊糖苷、木糖醇等）在规定的每日允许摄入量（ADI）范围内是安全的。需要注意：①阿斯巴甜不适合苯丙酮尿症患者；②木糖醇对狗有剧毒；③部分人大量摄入糖醇可能腹胀腹泻。另外，“无糖”不等于“健康”——还要看整体营养构成。'
  },
  {
    keywords: ['色素', '着色剂', '柠檬黄', '日落黄', '儿童', '多动'],
    question: '人工色素会影响儿童健康吗？',
    answer: '部分研究提示，某些合成色素（如柠檬黄、日落黄）与防腐剂苯甲酸钠复配时，可能与儿童注意力不集中、多动行为存在关联。欧盟已要求含这些色素的食品标注“可能对儿童活动及注意力产生不良影响”的警示语。建议：儿童少吃颜色过分鲜艳的糖果饮料，优先选择天然着色（如胡萝卜素、花青素）的产品。'
  },
  {
    keywords: ['保质期', '过期', '保存', '贮存'],
    question: '保质期过了还能吃吗？',
    answer: '保质期是厂家对产品品质的承诺期限，不是绝对的“安全分界线”。过期食品不一定立即变质，但风味、质地、营养可能下降，且存在微生物风险，建议不要食用。另外要注意：保质期依赖正确的贮存条件（冷藏、避光、干燥等），如果贮存不当，即使在保质期内也可能提前变质。'
  },
  {
    keywords: ['清洁标签', '天然添加剂', '配料表短'],
    question: '什么是“清洁标签”？',
    answer: '清洁标签（Clean Label）是食品行业的一种趋势，指消费者倾向于选择配料表简短、成分可识别、添加剂天然来源的产品。比如用果胶代替明胶、用甜菊糖代替阿斯巴甜。但要注意：配料表短不等于更安全，天然也不等于绝对无害——关键还是看具体成分和使用量。'
  },
  {
    keywords: ['非法添加物', '三聚氰胺', '苏丹红', '区别'],
    question: '非法添加物和食品添加剂有什么区别？',
    answer: '这是两个完全不同的概念。**食品添加剂**是法律法规允许使用的、经过安全评估的物质（如山梨酸钾、维生素C）；**非法添加物**是根本不允许加到食品里的物质（如三聚氰胺、苏丹红、工业明胶）。很多食品安全事件被误传为“添加剂有害”，其实是非法添加物作祟。学会区分这两者，是理性看待食品安全的第一步。'
  },
  {
    keywords: ['nrv', '营养素参考值', '每日参考', '百分比'],
    question: '营养成分表里的 NRV% 是什么意思？',
    answer: 'NRV% 指这份食品中某营养素占**每日推荐摄入量**的比例。比如钠的 NRV 是 2000 mg，某食品每 100 g 含钠 600 mg，NRV% 就是 30%。读法建议：①钠、脂肪、添加糖的 NRV% 越高越要谨慎；②蛋白质、膳食纤维的 NRV% 越高越好；③注意它通常按每 100 g 计算，吃完整包要按实际重量换算。'
  },
  {
    keywords: ['红绿灯', '交通灯', '营养评分', '小叶子'],
    question: '营养红绿灯和小叶子评分怎么来的？',
    answer: '红绿灯针对能量、脂肪、糖、钠四项，按每 100 g 的阈值分成低/中/高三档，思路参考了英国 FSA 的前端包装标识。小叶子评分从 5 片叶子起算：每出现一项“偏高”扣分，“适中”少量扣分，蛋白质和膳食纤维充足则适当加分。它是**规则化估算**，用来快速比较同类产品，不等于精确的营养评价。'
  },
  {
    keywords: ['过敏原', '过敏', '致敏'],
    question: '配料表里的过敏原怎么识别？',
    answer: '我国 GB 7718 建议标示八类致敏物质：含麸质谷物、甲壳类、鱼类、蛋类、花生、大豆、乳及乳制品、坚果，另外亚硫酸盐也常需关注。识别时可以抓关键词：小麦粉/面筋→麸质，生牛乳/乳粉/乳清→乳，大豆卵磷脂/酱油→大豆。你可以在本站「我的过敏原」里勾选自己的过敏原，解读时会自动标红提醒——但请记住，标签识别不能替代医生的诊断与建议。'
  },
  {
    keywords: ['反式脂肪', '反式脂肪酸', '氢化植物油', '起酥油', '植脂末', '奶精', '人造奶油'],
    question: '反式脂肪酸到底有多危险？',
    answer: '反式脂肪会升高低密度脂蛋白、降低高密度脂蛋白，是心血管疾病明确的危险因素，WHO 建议其供能比低于总能量的 1%。需要留意的是**标示为“0”不等于完全没有**：GB 28050 允许每 100 g 低于 0.3 g 时标为 0。真正的判断线索在配料表——出现“氢化植物油”“部分氢化植物油”“起酥油”“植脂末”“人造奶油”，就说明工艺上可能引入反式脂肪。奶茶、廉价糕点、油炸零食是常见来源。'
  },
  {
    keywords: ['零添加', '0添加', '无添加', '不加防腐剂', '不含添加剂'],
    question: '“零添加”的食品更安全吗？',
    answer: '“零添加”从来不是国家标准里的分级，而是企业自己写的宣传语。它通常只表示没加某几类添加剂，不代表更安全、更有营养——有些产品靠提高盐、糖含量或改进杀菌工艺来替代防腐剂，反而带来别的问题。监管层面已经不认可这种表述：新版 GB 7718 明确不得使用“零添加”“不添加”这类容易引起误解的用语。判断一款食品，还是回到配料表顺序和营养成分表。'
  },
  {
    keywords: ['有机', '有机食品', '绿色食品', '无公害', '有机认证'],
    question: '有机食品比普通食品更有营养吗？',
    answer: '有机认证主要约束的是**生产过程**：不用化学合成农药、化肥、生长调节剂等，而不是营养更高。多数对比研究显示，有机与常规食品在维生素、矿物质含量上的差异并不显著。选购时认准包装上的“中国有机产品”标志和 17 位有机码，可以在中国食品农产品认证信息系统查验真伪。另外“绿色食品”“无公害农产品”是另外两套不同的认证体系，标准比有机宽松，不要混为一谈。'
  },
  {
    keywords: ['预制菜', '料理包', '半成品菜', '速冻菜肴'],
    question: '预制菜能不能放心吃？',
    answer: '按现行监管口径，预制菜是经工业化预加工、需加热或熟制后食用的预包装菜肴，**不添加防腐剂**，主要靠冷藏冷冻、高温杀菌和密封包装来控制微生物——这也是它必须全程冷链的原因。选购时重点看三点：贮存条件是否符合（冷冻品不能在常温货架久放）、钠含量（预制菜普遍偏咸）、配料表长度。营养上它不比现做菜差，但蔬菜比例通常偏低，别长期单一依赖。'
  },
  {
    keywords: ['辐照', '辐照食品', '辐照杀菌'],
    question: '辐照过的食品有辐射残留吗？',
    answer: '没有。辐照用的是伽马射线、电子束等对食品进行杀菌杀虫，食品本身**不会因此带有放射性**，就像行李过安检机不会变“有辐射”。我国 GB 14891 系列标准规定了允许辐照的食品种类和剂量上限（一般不超过 10 kGy），并要求在标签上标示“辐照食品”。常见于香辛料、脱水蔬菜、大蒜洋葱的抑芽处理。剂量的安全性有充分评估，但辐照食品不能重复照射。'
  },
  {
    keywords: ['转基因', '非转基因', '转基因食品'],
    question: '转基因食品需要标出来吗？',
    answer: '我国对列入目录的农业转基因生物实行**标识管理**，大豆、玉米、油菜、棉花等及其加工品在目录内，含有转基因成分的要标示。但要注意：精炼后不再含转基因成分的产品（如高度精炼的植物油）按现行规定可以不标。“非转基因”是企业的自愿标注，本身不是安全等级——它只说明原料来源。从已有科学共识看，通过审批上市的转基因食品在安全性上与同类传统食品没有实质差异。'
  },
  {
    keywords: ['代可可脂', '可可脂', '巧克力'],
    question: '代可可脂巧克力算巧克力吗？',
    answer: '按 GB 9678.2，代可可脂添加量超过 5%（以重量计）的产品**必须叫“代可可脂巧克力”**，不能直接叫“巧克力”。两者的差别在成本和口感：可可脂从可可豆提取，熔点接近体温、入口即化；代可可脂多用氢化或酯交换油脂，成本低，但口感偏蜡、可能带入反式脂肪。买的时候看配料表第一位是“可可液块/可可脂”还是“代可可脂”，一眼就能分辨。'
  },
  {
    keywords: ['隐形盐', '高钠', '钠含量', '挂面', '话梅'],
    question: '哪些食品里藏着看不见的盐？',
    answer: '最容易被忽略的是**尝不出咸味**的那几类：挂面（每 100 g 常见 500–1200 mg 钠）、切片面包（约 300–500 mg）、话梅蜜饯、火腿肠、酱油与蚝油、火锅底料、苏打饼干。世界卫生组织建议每日钠摄入低于 2000 mg（约 5 g 盐），而一包方便面的调料加面饼常常就接近这个额度。实用做法是看营养成分表的钠 NRV%：单份超过 30% 就要有意识地把当天其他菜的盐减下来。'
  },
  {
    keywords: ['adi', '每日允许摄入量', '安全剂量', '吃多少才超标', '摄入量'],
    question: '一种添加剂吃多少才算过量？',
    answer: '监管上用 **ADI（每日允许摄入量）** 来衡量：单位是 mg 每公斤体重每天，指人一生中每天摄入都不会带来可察觉风险的量。换算方法很直观：ADI × 体重 ÷ 食品中该添加剂的含量 = 每天可以吃的量。各国设定 ADI 时通常已除以 100 倍安全系数，也就是说，正常饮食要达到 ADI 需要相当大的摄入量。这也是为什么“含有某添加剂”和“超标”是两件事——关键在剂量。'
  },
  {
    keywords: ['gb2760', 'gb 2760', '2760', '国标', '国家标准', '添加剂标准'],
    question: '怎么查一种添加剂能不能用、能用多少？',
    answer: '查 **GB 2760《食品安全国家标准 食品添加剂使用标准》**。它按功能类别列出每个添加剂允许使用的食品类别、最大使用量或残留量，是判断“超范围、超限量”的唯一依据。使用逻辑有两层：一是**范围**（这类食品允不允许用），二是**限量**（最多用多少）。配料表里出现某添加剂，只能说明它被使用了，是否合规要看它出现在哪类食品里、用量多少——这一点普通消费者很难直接判断，所以本站在科普库里标注的是功能与注意事项，而不是“合格/不合格”。'
  },
  {
    keywords: ['增稠剂', '黄原胶', '明胶', '果胶', '胶体', '增稠'],
    question: '酸奶里的增稠剂是什么东西？',
    answer: '增稠剂大多是**多糖或蛋白质**：黄原胶由微生物发酵得到，果胶来自柑橘皮和苹果渣，卡拉胶提取自红藻，明胶是动物胶原蛋白水解产物。它们的作用是让产品有黏度、防止分层、改善口感。多数水溶性胶体不被人体消化吸收，会随粪便排出，安全性较高，GB 2760 中不少类别按生产需要适量使用。需要留意的是个别产品用增稠剂来“补偿”被稀释的原料——比如乳饮料靠胶体做出酸奶的稠度，这时看蛋白质含量更实在。'
  },
  {
    keywords: ['儿童食品', '儿童零食', '宝宝', '婴幼儿', '辅食', '儿童酱油'],
    question: '“儿童食品”有专门标准吗？',
    answer: '**目前没有统一定义的“儿童食品”国家标准**，市面上大量“儿童酱油”“儿童奶酪”执行的是普通食品标准，只是包装更可爱、价格更高，钠含量未必更低。真正有专门标准的是婴幼儿配方食品（GB 10765、GB 10767 等）和婴幼儿辅助食品，这类产品的标签、营养成分、污染物限量都有强制要求。给学龄前孩子选零食，与其看“儿童”两个字，不如看配料表前三位和钠、糖的 NRV%。'
  },
  {
    keywords: ['临期', '临期食品', '快过期', '打折食品'],
    question: '临期食品能吃吗？',
    answer: '能。临期只表示**接近保质期末端**，仍在保质期内，厂家对品质的承诺依然有效，安全性没有问题。需要判断的是品类：饼干、罐头、真空包装的常温食品风险很低；巴氏鲜奶、生鲜熟食、需要冷藏的即食食品，即使没过期，也要确认全程冷链没断过。买回家后按标示条件贮存、尽快吃完。价格上确实划算，但别因为便宜就一次囤太多——吃不完扔掉反而更浪费。'
  },
  {
    keywords: ['营养强化剂', '强化', '加碘盐', '铁强化', '强化面粉', '叶酸'],
    question: '加了钙、铁、维生素的食品算添加剂吗？',
    answer: '这类叫**营养强化剂**，管理依据是 GB 14880，和 GB 2760 是两套体系。它们的目的是弥补膳食中某些营养素的不足，比如加碘盐、铁强化酱油、维生素 D 强化奶、叶酸强化面粉，都是公共卫生层面很成功的措施。选购时注意看营养成分表的 NRV%：强化不等于越多越好，脂溶性维生素（A、D、E、K）长期过量会在体内蓄积。如果已经在吃复合补充剂，就要把强化食品里的量一起算进去。'
  },
  {
    keywords: ['新国标', '2760-2024', 'gb2760', '新标准', '标准变化', '国标变化', '标准修订'],
    question: '新国标 GB 2760-2024 有哪些变化？',
    answer: '新版 GB 2760 于 **2025 年 2 月 8 日**正式实施，替代 2014 版。与普通消费者关系最大的有三点：\n\n· **脱氢乙酸及其钠盐大幅限用。** 面包、糕点、淀粉制品、预制肉制品、果蔬汁（浆）、黄油等食品中不再允许使用；腌渍蔬菜的限量从 1.0 g/kg 降到 0.3 g/kg。所以老包装上还能看到它，新生产的烘焙品基本没有了。\n· **部分品种不再作为添加剂管理。** 偶氮甲酰胺、落葵红、密蒙黄、酸枣色等被删除，不得再使用。\n· **甜味剂总量有了约束。** 阿斯巴甜、安赛蜜等同时使用时，混合使用的总量不能超过各自的最大使用量，防止“多种甜味剂各加一点、总量却超标”。\n\n另外，罐头类食品不再允许使用山梨酸及其钾盐、乳酸链球菌素，食醋不再允许使用冰乙酸。这些调整的方向一致：**不是发现原来的添加剂“有毒”，而是随消费量上升重新评估风险，把限量收得更保守。**',
    generic: true
  },
  {
    keywords: ['茶多酚', '茶多酚是什么', '绿茶提取物', '儿茶素'],
    question: '茶多酚是什么？',
    answer: '**茶多酚**是从茶叶中提取的一类多酚化合物（主要是儿茶素），在 GB 2760 中作**抗氧化剂**使用，常见于食用油、肉制品、烘焙食品和饮料，用来延缓油脂氧化、保持色泽。它没有 INS 编号，属于我国标准中按品种列出的添加剂。\n\n它常被当成“保健品成分”宣传，但要分清两件事：作为**食品添加剂**，它的作用是抗氧化，用量很小；作为**膳食补充剂**，高剂量茶多酚（尤其是空腹服用）有报道引起肝损伤的案例，欧洲食品安全局也曾提示高剂量儿茶素的肝毒性风险。喝茶和吃含茶多酚的食品与吞高剂量提取物，不是一回事。'
  }
];

// 每日一贴小知识
const DAILY_TIPS = [
  { tag: '读标签', title: '配料表前三位，决定了一包食品的“本质”', text: '配料按含量从高到低排列。如果白砂糖、果葡糖浆排在前两位，那它本质上就是一份糖。' },
  { tag: '读标签', title: 'NRV% 比绝对值更好用', text: '同样写“钠 600 mg”，配 100 g 和配 30 g 差别巨大。看 NRV% 才知道这一份占了你一天多少额度。' },
  { tag: '控糖', title: '“无糖”不等于“无热量”', text: '无糖只要求糖 ≤0.5 g/100 g，脂肪和淀粉照样能带来不少热量。无糖饼干常常油更多。' },
  { tag: '控盐', title: '1 g 盐 ≈ 400 mg 钠', text: '每日 5 g 盐的建议，换算过来就是 2000 mg 钠。一包方便面的钠常常就接近全天额度。' },
  { tag: '饮料', title: '“果汁饮料”和“果汁”是两种东西', text: '果汁含量 10% 也能叫果汁饮料。想喝真果汁，看配料表第一位是不是浓缩果汁或原果汁。' },
  { tag: '油脂', title: '反式脂肪标“0”不等于完全没有', text: '国标允许每 100 g 低于 0.3 g 时标为 0。配料表里出现“氢化植物油”“起酥油”仍要留意。' },
  { tag: '儿童', title: '颜色越鲜艳，色素往往越多', text: '糖果饮料里那些漂亮的荧光色，多半来自合成色素复配。给孩子选零食，颜色朴素一点更稳妥。' },
  { tag: '储存', title: '保质期建立在贮存条件之上', text: '写着“冷藏保存”的酸奶放在常温下，保质期就不再成立。买回家后的储存方式同样重要。' },
  { tag: '读标签', title: '“零添加”是个营销词，不是安全等级', text: '零添加通常只指某几类添加剂未使用，不代表更安全或更有营养，也可能靠高盐高糖来防腐保鲜。' },
  { tag: '全谷物', title: '“全麦面包”里可能没有多少全麦', text: '看配料表：全麦粉排第一位才算真正的全麦面包；只写“小麦粉 + 麸皮”的是复配出来的颜色。' },
  { tag: '添加剂', title: '添加剂的名字陌生，不代表它危险', text: '抗坏血酸就是维生素C，碳酸氢钠就是小苏打。陌生感来自命名方式，不是毒性。' },
  { tag: '平衡', title: '偶尔吃一次，不必有负罪感', text: '风险评估看的是长期摄入总量。真正影响健康的是一天三顿的日常结构，而不是偶尔一根火腿肠。' },
  { tag: '读标签', title: '“每 100 g”和“每份”差得很远', text: '有些进口食品按“每份 30 g”标注，数字看着漂亮。换算成每 100 g 再比，才是同一把尺子。' },
  { tag: '控糖', title: '果汁里的糖，和可乐里的糖没有本质区别', text: '榨汁把水果的纤维结构破坏了，剩下的是游离糖。一杯橙汁的糖分，往往不比同体积可乐少多少。' },
  { tag: '控盐', title: '酱油是隐形钠的第一个来源', text: '10 ml 酱油约含 600–700 mg 钠，相当于 1.5 g 盐。炒菜时先放酱油再放盐，很容易一顿就超。' },
  { tag: '油脂', title: '“非油炸”不等于低脂', text: '非油炸薯片多用热风加喷油烘烤，脂肪含量常在 20% 以上。看营养成分表的脂肪一栏，比看包装上的三个字靠谱。' },
  { tag: '蛋白', title: '乳饮料不是奶', text: '纯牛奶蛋白质 ≥2.9 g/100 g，含乳饮料只有 1 g 左右。名字里带“乳”或“奶”的产品，先看蛋白质那一栏。' },
  { tag: '饮料', title: '“0 糖”的门槛是 0.5 g', text: '国标允许每 100 mL 含糖低于 0.5 g 时标为 0。所以“0 糖”是“几乎不含”，不是化学意义上的绝对零。' },
  { tag: '添加剂', title: '复配添加剂要拆开看', text: '配料表里写“复配乳化剂”“复配增稠剂”时，括号里才是真正的成分清单，别只看到大类名就放心。' },
  { tag: '储存', title: '开封那天，保质期就重新计算了', text: '坚果、食用油、奶粉开封后接触氧气和湿气，氧化速度大幅加快。包装上写的“开封后请冷藏并于 X 日内食完”要当真。' },
  { tag: '储存', title: '冰箱不是万能保险箱', text: '香蕉、芒果放冷藏会冻伤发黑，蜂蜜会结晶，巧克力表面会起白霜。这些都不影响安全，但口感会打折。' },
  { tag: '烹饪', title: '腌腊制品先泡再焯', text: '香肠、腊肉、腌菜用温水泡 20 分钟再焯水，能溶出一部分盐和亚硝酸盐。别用焯过的水做汤。' },
  { tag: '选购', title: '保质期越短，通常加工程度越低', text: '短保面包靠冷链和新鲜度，长保面包靠糖油和防腐体系。同样叫面包，配料表长度可能差一倍。' },
  { tag: '过敏', title: '“可能含有微量花生”不是免责废话', text: '这行字表示同一条生产线或同一车间处理过花生，存在交叉污染风险。对严重过敏的人来说，它值得当真。' },
  { tag: '全谷物', title: '“粗粮饼干”的主料往往还是小麦粉', text: '判断是不是真粗粮，看膳食纤维：每 100 g 达到 6 g 以上才算高纤维，很多粗粮饼干只有 2–3 g。' },
  { tag: '读标签', title: '能量单位是千焦，不是千卡', text: '营养成分表用 kJ，日常说的“大卡”是 kcal，1 kcal ≈ 4.184 kJ。1000 kJ 其实只有约 239 kcal。' },
  { tag: '控糖', title: '果葡糖浆比白砂糖更便宜，也更甜', text: '果糖比例高、甜度上来得快，饮料里用得很多。它和蔗糖一样属于游离糖，过量摄入的代谢风险并不更低。' },
  { tag: '读标签', title: '“无蔗糖”不等于无糖', text: '果葡糖浆、麦芽糖浆、浓缩果汁都不叫蔗糖。看到“无蔗糖”，先翻到营养成分表看糖那一行。' },
  { tag: '控盐', title: '面包和挂面，是钠的沉默来源', text: '两片吐司约含 300 mg 钠，100 g 挂面常在 500 mg 以上。它们尝起来不咸，但一天算下来并不少。' },
  { tag: '平衡', title: '没有一种“超级食物”能抵消整体饮食', text: '蓝莓、奇亚籽、藜麦都不错，但它们改变不了三餐的结构。把注意力放在整体比例上，比追单品更有效。' }
];

// 食品安全小贴士
const TIPS = [
  {
    icon: 'list',
    title: '先看配料表前三位',
    desc: '配料按含量递减排列，前三位决定食品“本质”。若白砂糖、果葡糖浆排在前面，说明含糖量高。'
  },
  {
    icon: 'gauge',
    title: '关注 NRV% 而非绝对值',
    desc: '营养成分表中的 NRV% 表示占每日推荐摄入量的比例。钠超过 30% NRV 就要留意了。'
  },
  {
    icon: 'salt',
    title: '把钠换算成盐来理解',
    desc: '钠 × 2.5 约等于食盐量。每日 5 g 盐的建议，对应钠摄入不宜超过 2000 mg。'
  },
  {
    icon: 'ban',
    title: '区分添加剂与非法添加物',
    desc: '山梨酸钾、维生素C 是合法添加剂；三聚氰胺、苏丹红是非法添加物，两者不可混为一谈。'
  },
  {
    icon: 'child',
    title: '儿童少吃高色素零食',
    desc: '颜色过分鲜艳的糖果饮料往往含较多人工色素，建议优先选择天然着色的产品。'
  },
  {
    icon: 'shield',
    title: '过敏人群先看致敏物质提示',
    desc: '八类致敏物质需重点关注，配料表中的“小麦粉”“生牛乳”“大豆卵磷脂”都是关键线索。'
  }
];

// 风险等级说明（配色统一到实验室色板，深色仅用于文字以保证对比度）
const RISK_LEVELS = {
  safe: { label: '良好', color: '#3A7D44', text: '#2C5F33', bg: '#E8F3EC', icon: 'check' },
  caution: { label: '留意', color: '#C08A2E', text: '#8A6220', bg: '#FBF6EC', icon: 'alert' },
  alert: { label: '关注', color: '#B4483F', text: '#9A3B33', bg: '#FAF0EE', icon: 'alertCircle' },
  unknown: { label: '未知', color: '#8A9A90', text: '#5F6F65', bg: '#F2F6F8', icon: 'question' }
};
