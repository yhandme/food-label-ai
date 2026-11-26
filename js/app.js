/* ============================================================
 * 食安标签通 - 主逻辑
 * 结构：纯函数（解析/判定/评分） → 渲染 → 事件 → 初始化
 * 所有数据保存在浏览器本地，不上传服务器
 * ============================================================ */

const state = {
  page: 'home',
  activeCategory: 'all',
  searchKeyword: '',
  foodCategory: 'other',
  activeSample: null,
  manual: [],          // 手动添加的添加剂 [{ id, name }]，id 为空表示自定义名称
  allergens: [],       // 用户标记的过敏原 id
  history: [],
  lastResult: null,
  tipOffset: 0
};

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

// 卡片、标签这类可点击的是 div/span，键盘用 Tab 根本落不到上面。
// 统一补上 role 与 tabindex，并把 Enter / 空格接成点击。
function activateOn(el, fn) {
  if (!el) return;
  if (el.tagName !== 'BUTTON' && el.tagName !== 'A') {
    el.setAttribute('role', 'button');
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
  }
  el.addEventListener('click', fn);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      e.stopPropagation();
      fn(e);
    }
  });
}

/* ============================================================
 * 本地存储
 * ============================================================ */
const Store = {
  ALLERGEN: 'flt.allergens.v1',
  HISTORY: 'flt.history.v1',
  read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* 隐私模式下写入失败时静默降级，不影响主流程 */
    }
  }
};

// localStorage 里的内容有可能被改坏（手动改、旧版本结构），读出来先校验类型
function readList(key) {
  const v = Store.read(key, []);
  return Array.isArray(v) ? v : [];
}

/* ============================================================
 * 导航
 * ============================================================ */
function initNavigation() {
  $$('[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        navigateTo(href.slice(1));
      }
    });
  });

  const toggle = $('#navToggle');
  if (toggle) toggle.addEventListener('click', () => $('#mainNav').classList.toggle('open'));

  // 「关于本站」是首页里的锚点，不是独立页面
  const jumpToAbout = (smooth) => {
    const el = $('#about');
    if (el) el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  };

  $$('[data-goto-about]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      navigateTo('home', false, true);
      jumpToAbout(true);
    });
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash === 'about') {
      navigateTo('home', false, true);
      jumpToAbout(true);
      return;
    }
    if (hash && hash !== state.page) navigateTo(hash, false);
  });

  const initial = window.location.hash.slice(1);
  if (initial === 'about') {
    navigateTo('home', false, true);
    setTimeout(() => jumpToAbout(false), 60);
  } else if (initial && document.getElementById(initial)) {
    navigateTo(initial, false);
  }
}

function navigateTo(pageId, updateHash = true, keepScroll = false) {
  const target = document.getElementById(pageId);
  // 只接受真正的页面容器：#about 这类页内锚点不该被当成页面切走
  if (!target || !target.classList.contains('page')) return;

  state.page = pageId;
  $$('.page').forEach(p => p.classList.remove('active'));
  $('#' + pageId).classList.add('active');

  $$('.nav-link').forEach(link => {
    const on = link.getAttribute('href') === '#' + pageId;
    link.classList.toggle('active', on);
    if (on) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  const nav = $('#mainNav');
  if (nav) nav.classList.remove('open');

  if (updateHash) history.pushState(null, '', '#' + pageId);
  // 锚点跳转时不要先把页面滚到顶部，否则会和后面的 scrollIntoView 打架
  if (!keepScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
 * 纯函数：配料解析与添加剂匹配
 * ============================================================ */
// 这些词是配料表的"标题"，不是配料本身
const NON_INGREDIENT = ['食品添加剂', '复配食品添加剂', '添加剂', '配料', '原料'];

function parseIngredients(text) {
  if (!text || !text.trim()) return [];

  let clean = text.trim();
  clean = clean.replace(/^配\s*料\s*(表)?\s*[：:\s]*/, '');
  clean = clean.replace(/[。．]\s*$/, '');

  // 括号同样是分隔方式：酱油（含小麦、大豆）、食品添加剂（山梨酸钾、亚硝酸钠）
  const parts = clean
    .split(/[、,，;；\n\r（）()【】[\]]+/)
    .map(p => p
      .trim()
      .replace(/^[0-9]+[.、)]\s*/, '')
      .replace(/^[。．.；;：:、\s]+/, '')
      // 括号内常写「含小麦、大豆」，拆开后「含」只是引导词，不该单独成为一项配料
      .replace(/^(?:其中包括|其中含有|其中包括有|包括|含有|包含|添加有|添加|含)\s*/, '')
      .replace(/[。．.；;：:、\s]+$/, '')
      .trim())
    .filter(p => p && p.length < 50 && NON_INGREDIENT.indexOf(p) === -1);

  // 括号里被拆出来的「配料表」「食品添加剂」这类标题词同样要挡掉
  return parts;
}

// 名称归一化：去掉括号内的俗称，使「碳酸氢钠（小苏打）」可被「碳酸氢钠」命中
function normalizeAdditiveName(str) {
  return String(str).replace(/[（(][^）)]*[）)]/g, '').trim().toUpperCase();
}

// 提取条目可用的匹配名：主名称 + 括号内俗称（小苏打、明矾、维生素C 等）
function additiveAliases(add) {
  const names = [normalizeAdditiveName(add.name)];
  const m = String(add.name).match(/[（(]([^）)]+)[）)]/);
  if (m) names.push(m[1].trim().toUpperCase());
  // 俗称、旧名、英文缩写：标签上的写法未必和标准名称一字不差
  (add.alias || []).forEach(a => {
    const n = normalizeAdditiveName(a);
    if (n) names.push(n);
  });
  return names.filter(Boolean);
}

// 从「E330」「INS 330」「防腐剂（202）」里取出 INS 编码
function insCodeOf(text) {
  const s = String(text).toUpperCase().replace(/\s+/g, '');
  const m = s.match(/^(?:INS|E)?(\d{3,4}[A-Z]?)$/) || s.match(/[（(](?:INS|E)?(\d{3,4}[A-Z]?)[）)]/);
  return m ? m[1] : '';
}

function findByIns(text) {
  const code = insCodeOf(text);
  if (!code) return undefined;
  return ADDITIVES.find(add =>
    String(add.ins).toUpperCase().split('+').map(x => x.trim()).indexOf(code) !== -1
  );
}

function findAdditiveForIngredient(ing) {
  const target = normalizeAdditiveName(ing);
  if (!target) return undefined;

  // 先精确比对名称、括号内俗称与英文名。
  // 这一步是必须的：否则「柠檬酸钠」会被「柠檬酸」的包含匹配抢走（两者 INS 编码不同）
  const exact = ADDITIVES.find(add =>
    additiveAliases(add).indexOf(target) !== -1 ||
    String(add.en).toUpperCase() === target
  );
  if (exact) return exact;

  // GB 7718 允许用「功能类别 + INS 编码」标示，标签上常见 E968、防腐剂（202）、甜味剂(955)
  const byIns = findByIns(ing);
  if (byIns) return byIns;

  // E 编号但知识库没有：明确标为「未收录」，好过静默丢掉
  if (/^E\d{3,4}[A-Z]?$/.test(target)) return customAdditive(ing.trim());

  // 再做包含匹配，但只允许 4 字以上的名称，避免短名误伤
  return ADDITIVES.find(add =>
    additiveAliases(add).some(n => n.length >= 4 && target.includes(n))
  );
}

function matchAdditives(ingredients) {
  const matched = [];
  ingredients.forEach(ing => {
    const found = findAdditiveForIngredient(ing);
    if (found && !matched.some(m => m.id === found.id)) matched.push(found);
  });
  return matched;
}

function calculateRisk(additives, totalIngredients) {
  let score = 100;
  let safeCount = 0, cautionCount = 0, alertCount = 0, unknownCount = 0;

  additives.forEach(add => {
    switch (add.safety) {
      // 安全性良好的添加剂在规定用量下没有扣分依据，
      // 这里扣分会让「A 整体良好」配上一个 70 分，自相矛盾
      case 'safe': safeCount++; break;
      case 'caution': cautionCount++; score -= 13; break;
      case 'alert': alertCount++; score -= 26; break;
      default: unknownCount++; score -= 8; break;
    }
  });

  if (totalIngredients > 0) {
    const ratio = additives.length / totalIngredients;
    if (ratio > 0.5) score -= 8;
  }

  score = Math.max(10, Math.min(100, score));

  return { score, safeCount, cautionCount, alertCount, unknownCount, total: additives.length };
}

function gradeOf(risk) {
  if (risk.alertCount > 0) return { letter: 'C', label: '建议关注', fill: '#B4483F', text: '#9A3B33', bg: '#FAF0EE' };
  if (risk.cautionCount > 0) return { letter: 'B', label: '需留意', fill: '#C08A2E', text: '#8A6220', bg: '#FBF6EC' };
  // 有知识库未收录的成分时不能给 A —— 对未知项说"整体良好"是不负责任的
  if (risk.unknownCount > 0) return { letter: 'B', label: '待确认', fill: '#C08A2E', text: '#8A6220', bg: '#FBF6EC' };
  return { letter: 'A', label: '整体良好', fill: '#3A7D44', text: '#2C5F33', bg: '#E8F3EC' };
}

function categoryNameOf(add) {
  const c = CATEGORIES.find(x => x.id === add.category);
  if (c) return c.name;
  return add.category ? '未分类' : '未收录';
}

function categoryIconOf(add) {
  const c = CATEGORIES.find(x => x.id === add.category);
  return c ? c.icon : 'beaker';
}

/* ============================================================
 * 纯函数：营养分析
 * ============================================================ */
function nrvPct(nutrient, value) {
  if (value == null || !nutrient.nrv) return null;
  return Math.round((value / nutrient.nrv) * 1000) / 10;
}

function lightOf(nutrient, value, isDrink) {
  if (value == null) return 'none';
  const t = (isDrink && nutrient.lightDrink) ? nutrient.lightDrink : nutrient.light;
  if (!t) return 'info';
  if (value <= t.low) return 'good';
  if (value <= t.high) return 'mid';
  return 'bad';
}

function analyzeNutrition(nutrition, isDrink) {
  const marks = NUTRIENTS.map(n => {
    const value = nutrition[n.id] == null ? null : Number(nutrition[n.id]);
    return {
      key: n.id,
      nutrient: n,
      value,
      pct: nrvPct(n, value),
      light: lightOf(n, value, isDrink)
    };
  });

  const leds = marks.filter(m => m.light === 'good' || m.light === 'mid' || m.light === 'bad');
  const bad = leds.filter(m => m.light === 'bad').length;
  const mid = leds.filter(m => m.light === 'mid').length;
  const good = leds.filter(m => m.light === 'good').length;
  const filled = marks.filter(m => m.value != null).length;

  let score = 5 - bad * 1.3 - mid * 0.6;
  const fiber = nutrition.fiber == null ? null : Number(nutrition.fiber);
  const protein = nutrition.protein == null ? null : Number(nutrition.protein);
  const sugar = nutrition.sugar == null ? null : Number(nutrition.sugar);

  // 糖密度修正：含糖饮料最容易披着"低脂"外衣，单独加一层扣分
  const sugarRef = isDrink ? 2.5 : 5;
  if (sugar != null && sugar > sugarRef) {
    score -= Math.min(1.6, (sugar - sugarRef) / (isDrink ? 6 : 16));
  }

  if (fiber != null) {
    if (fiber >= 6) score += 0.6;
    else if (fiber >= 3) score += 0.3;
  }
  if (protein != null) {
    if (protein >= 12) score += 0.5;
    else if (protein >= 6) score += 0.25;
  }

  score = Math.max(0.5, Math.min(5, Math.round(score * 2) / 2));

  return {
    marks, leds, bad, mid, good, score, filled,
    // hasData 指"填了任意一项营养"（用来决定要不要出 NRV 表）
    // hasLeds 指"四项红绿灯至少填了一项"（只有这种时候叶子评分才有意义）
    hasData: filled > 0,
    hasLeds: leds.length > 0,
    fullLeds: leds.length === 4,
    isDrink: !!isDrink
  };
}

// 取某项指标在"固体 / 饮料"两套标准下的实际阈值
function thresholdOf(nutrient, isDrink) {
  return (isDrink && nutrient.lightDrink) ? nutrient.lightDrink : nutrient.light;
}

function leafVerdict(score) {
  if (score >= 4.5) return '这份在营养维度相当克制，可以放心常吃。';
  if (score >= 3.5) return '整体尚可，注意别把它当唯一来源。';
  if (score >= 2.5) return '有几项指标偏高，建议控制单次份量。';
  if (score >= 1.5) return '多项指标偏高，适合偶尔解馋而不是日常。';
  return '营养结构偏差较大，建议减少食用频率。';
}

/* ============================================================
 * 纯函数：过敏原
 * ============================================================ */
function detectAllergens(ingredients, additives) {
  const found = [];
  ALLERGENS.forEach(a => {
    const hits = ingredients.filter(ing => a.keywords.some(k => ing.includes(k)));
    const viaAdd = additives
      .filter(x => (x.allergens || []).includes(a.id))
      .map(x => x.name);
    if (hits.length || viaAdd.length) {
      found.push({ id: a.id, name: a.name, short: a.short, icon: a.icon, hits, viaAdd });
    }
  });
  return found;
}

/* ============================================================
 * 工作台输入
 * ============================================================ */
function initFoodCategories() {
  const box = $('#foodCategories');
  if (!box) return;

  box.innerHTML = FOOD_CATEGORIES.map(c => `
    <button class="cat-chip ${c.id === state.foodCategory ? 'active' : ''}" data-food-cat="${c.id}">
      <span data-icon="${c.icon}"></span>${c.name}
    </button>
  `).join('');
  renderIcons(box);

  $$('[data-food-cat]', box).forEach(btn => {
    btn.addEventListener('click', () => {
      state.foodCategory = btn.dataset.foodCat;
      state.activeSample = null;
      syncFoodCategories();
    });
  });

  updateCategoryNote();
}

function syncFoodCategories() {
  $$('[data-food-cat]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.foodCat === state.foodCategory);
  });
  updateCategoryNote();

  const basis = $('#nutritionBasis');
  if (basis) basis.textContent = state.foodCategory === 'drink' ? '每 100 mL' : '每 100 g';
}

function updateCategoryNote() {
  const note = $('#categoryNote');
  if (!note) return;
  const c = FOOD_CATEGORIES.find(x => x.id === state.foodCategory);
  note.textContent = c && c.note ? c.note : '选择类别后，会给出这一类食品的重点关注项';
  note.classList.toggle('muted', !(c && c.note));
}

function initNutritionInputs() {
  const grid = $('#nutritionGrid');
  if (!grid) return;

  grid.innerHTML = NUTRIENTS.map(n => `
    <label class="nut-field">
      <span class="nut-name"><span data-icon="${n.icon}"></span>${n.name}</span>
      <span class="nut-input">
        <input type="number" min="0" step="0.1" inputmode="decimal" id="nut-${n.id}" placeholder="未填" aria-label="${n.name}">
        <em>${n.unit}</em>
      </span>
    </label>
  `).join('') + `
    <div class="nut-tip">
      <span data-icon="info"></span>
      <p>按包装上的「营养成分表」填写，没有标注的项留空即可</p>
    </div>
  `;
  renderIcons(grid);

  const basis = $('#nutritionBasis');
  if (basis) basis.textContent = state.foodCategory === 'drink' ? '每 100 mL' : '每 100 g';

  $$('input', grid).forEach(input => {
    input.addEventListener('input', () => {
      state.activeSample = null;
      updateNutritionSummary();
    });
  });
  updateNutritionSummary();
}

function readNutrition() {
  const data = {};
  NUTRIENTS.forEach(n => {
    const el = document.getElementById('nut-' + n.id);
    if (!el) { data[n.id] = null; return; }
    const raw = el.value.trim();
    const v = raw === '' ? null : Number(raw);
    data[n.id] = (v == null || isNaN(v) || v < 0) ? null : v;
  });
  return data;
}

function updateNutritionSummary() {
  const el = $('#nutritionSummary');
  if (!el) return;
  const filled = NUTRIENTS.filter(n => {
    const input = document.getElementById('nut-' + n.id);
    return input && input.value.trim() !== '';
  }).length;
  el.textContent = filled === 0 ? '尚未填写' : `已填写 ${filled} / ${NUTRIENTS.length} 项`;
  el.classList.toggle('muted', filled === 0);
}

/* 添加剂：自动识别 + 手动选择 */
function customAdditive(name) {
  return {
    id: 'custom:' + name,
    name,
    en: 'Not in database',
    ins: '—',
    category: '',
    safety: 'unknown',
    safetyText: '未收录',
    usage: '待补充',
    foods: [],
    intro: '该名称暂未收录在本地知识库中，无法给出分类与限量说明。',
    adiability: '—',
    note: '未收录不代表不安全，只是本站尚未整理该条目。建议对照 GB 2760 或咨询专业人士。',
    custom: true
  };
}

function currentAdditives() {
  const ingredients = parseIngredients(($('#labelInput') || {}).value || '');
  const auto = matchAdditives(ingredients).map(a => Object.assign({}, a, { source: 'auto' }));
  const list = auto.slice();

  state.manual.forEach(m => {
    const lib = m.id ? ADDITIVES.find(a => a.id === m.id) : null;
    const obj = lib ? Object.assign({}, lib, { source: 'manual' }) : customAdditive(m.name);
    if (!list.some(x => x.id === obj.id)) list.push(obj);
  });

  return list;
}

function renderAdditiveChips() {
  const box = $('#additiveChips');
  if (!box) return;

  const ingredients = parseIngredients(($('#labelInput') || {}).value || '');
  const auto = matchAdditives(ingredients);
  const manual = state.manual;

  if (!auto.length && !manual.length) {
    box.innerHTML = `<p class="chips-empty">粘贴配料表后自动识别，也可以从知识库里手动挑选</p>`;
  } else {
    const autoChips = auto.map(a => {
      const lv = RISK_LEVELS[a.safety] || RISK_LEVELS.unknown;
      return `<span class="add-chip is-auto" data-additive="${a.id}">
        <i class="dot" style="background:${lv.dot || lv.color}"></i>${escapeHTML(a.name)}
        <em>自动</em>
      </span>`;
    }).join('');

    const manualChips = manual.map(m => {
      const lib = m.id ? ADDITIVES.find(a => a.id === m.id) : null;
      const lv = lib ? (RISK_LEVELS[lib.safety] || RISK_LEVELS.unknown) : RISK_LEVELS.unknown;
      return `<span class="add-chip is-manual" data-remove="${escapeAttr(m.id || m.name)}">
        <i class="dot" style="background:${lv.color}"></i>${escapeHTML(lib ? lib.name : m.name)}
        <button class="chip-x" aria-label="移除">${svgIcon('close', 11)}</button>
      </span>`;
    }).join('');

    box.innerHTML = autoChips + manualChips;
  }
  renderIcons(box);

  $$('[data-remove]', box).forEach(el => {
    el.querySelector('.chip-x').addEventListener('click', (e) => {
      e.stopPropagation();
      const key = el.dataset.remove;
      state.manual = state.manual.filter(m => (m.id || m.name) !== key);
      renderAdditiveChips();
    });
  });

  $$('.add-chip.is-auto', box).forEach(el => {
    activateOn(el, () => openAdditiveModal(el.dataset.additive));
  });
}

/* 配料表小助手：实时识别预览 */
function renderIngredientPreview() {
  const box = $('#ingredientPreview');
  if (!box) return;

  const text = ($('#labelInput') || {}).value || '';
  const ingredients = parseIngredients(text);

  if (!ingredients.length) {
    box.innerHTML = '<span class="preview-hint">识别结果会显示在这里</span>';
    const counter = $('#previewCount');
    if (counter) counter.textContent = '';
    return;
  }

  const tags = ingredients.map(ing => {
    const add = findAdditiveForIngredient(ing);
    if (add) {
      const lv = RISK_LEVELS[add.safety] || RISK_LEVELS.unknown;
      return `<span class="preview-tag is-additive" style="background:${lv.bg};color:${lv.text}" title="${escapeAttr(categoryNameOf(add))}">${escapeHTML(ing)}</span>`;
    }
    return `<span class="preview-tag">${escapeHTML(ing)}</span>`;
  }).join('');

  const addCount = ingredients.filter(i => findAdditiveForIngredient(i)).length;
  box.innerHTML = tags;

  const counter = $('#previewCount');
  if (counter) counter.textContent = `${ingredients.length} 项配料 · ${addCount} 项添加剂`;
}

function initReaderInputs() {
  const input = $('#labelInput');
  if (!input) return;

  let timer = null;
  input.addEventListener('input', () => {
    state.activeSample = null;
    renderAdditiveChips();
    clearTimeout(timer);
    timer = setTimeout(renderIngredientPreview, 160);
  });

  const pasteBtn = $('#pasteBtn');
  if (pasteBtn) {
    pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (!text.trim()) { toast('剪贴板是空的'); return; }
        input.value = text.trim();
        input.dispatchEvent(new Event('input'));
        toast('已粘贴剪贴板内容');
      } catch (e) {
        toast('浏览器未允许读取剪贴板，请手动粘贴');
        input.focus();
      }
    });
  }

  const tidyBtn = $('#tidyBtn');
  if (tidyBtn) {
    tidyBtn.addEventListener('click', () => {
      const parts = parseIngredients(input.value);
      if (!parts.length) { toast('还没有可整理的内容'); return; }
      input.value = '配料：' + parts.join('、') + '。';
      input.dispatchEvent(new Event('input'));
      toast(`已整理为 ${parts.length} 项配料`);
    });
  }

  const demoBtn = $('#demoFillBtn');
  if (demoBtn) demoBtn.addEventListener('click', () => fillSample('sample3'));

  const clearBtn = $('#clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      NUTRIENTS.forEach(n => {
        const el = document.getElementById('nut-' + n.id);
        if (el) el.value = '';
      });
      state.manual = [];
      state.activeSample = null;
      state.lastResult = null;          // 不清掉会残留：改过敏原时会拿空输入重新分析
      state.foodCategory = 'other';
      renderAdditiveChips();
      renderIngredientPreview();
      updateNutritionSummary();
      syncFoodCategories();
      $('#resultContent').classList.add('hidden');
      $('#resultContent').innerHTML = '';
      $('#emptyState').classList.remove('hidden');
    });
  }
}

/* ============================================================
 * 样例一键填充
 * ============================================================ */
function initSamples() {
  const list = $('#sampleList');
  if (list) {
    list.innerHTML = SAMPLE_LABELS.map(s => `
      <button class="sample-btn" data-sample="${s.id}">
        <span data-icon="flask"></span>
        <span class="sample-btn-text">${s.name}</span>
        <span class="sample-btn-type mono">${s.type}</span>
      </button>
    `).join('');
    renderIcons(list);
    $$('[data-sample]', list).forEach(btn => {
      btn.addEventListener('click', () => fillSample(btn.dataset.sample, true));
    });
  }

  const quick = $('#quickSamples');
  if (quick) {
    quick.innerHTML = ['sample3', 'sample6', 'sample5'].map(id => {
      const s = SAMPLE_LABELS.find(x => x.id === id);
      const additives = matchAdditives(parseIngredients(s.text));
      const risk = calculateRisk(additives, parseIngredients(s.text).length);
      const g = gradeOf(risk);
      const nut = analyzeNutrition(s.nutrition, s.categoryId === 'drink');
      return `
        <button class="quick-card" data-quick="${s.id}">
          <span class="quick-card-top">
            <span class="quick-card-cat">${s.type}</span>
            <span class="quick-card-grade" style="color:${g.text};background:${g.bg}">${g.letter}</span>
          </span>
          <strong>${s.name}</strong>
          <span class="quick-card-leaf">${leafIcons(nut.score, 15)}<em>${nut.score.toFixed(1)}</em></span>
          <span class="quick-card-foot">${additives.length} 种添加剂 · 点此代入解读</span>
        </button>`;
    }).join('');
    renderIcons(quick);
    $$('[data-quick]', quick).forEach(btn => {
      btn.addEventListener('click', () => {
        navigateTo('reader');
        fillSample(btn.dataset.quick, true);
      });
    });
  }
}

function fillSample(id, scroll) {
  const s = SAMPLE_LABELS.find(x => x.id === id);
  if (!s) return;

  state.foodCategory = s.categoryId;
  state.activeSample = s.id;
  state.manual = [];

  const input = $('#labelInput');
  input.value = s.text;

  NUTRIENTS.forEach(n => {
    const el = document.getElementById('nut-' + n.id);
    if (el) el.value = s.nutrition[n.id] == null ? '' : s.nutrition[n.id];
  });

  syncFoodCategories();
  renderAdditiveChips();
  renderIngredientPreview();
  updateNutritionSummary();
  analyzeLabel();

  if (scroll) {
    const panel = $('#resultPanel');
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ============================================================
 * 添加剂选择器
 * ============================================================ */
function openAdditivePicker() {
  const selectedIds = new Set(state.manual.filter(m => m.id).map(m => m.id));

  const body = `
    <div class="modal-head">
      <div class="modal-icon" data-icon="beaker"></div>
      <div class="modal-title">
        <h2>添加添加剂</h2>
        <p>从知识库中挑选，或直接输入名称</p>
      </div>
    </div>

    <div class="picker-custom">
      <input type="text" id="customAdditiveInput" placeholder="输入名称，如：乳酸链球菌素">
      <button class="btn btn-primary" id="customAdditiveBtn">添加</button>
    </div>
    <div class="picker-head-row">
      <span class="label">知识库条目</span>
      <span class="preview-count" id="pickerCount"></span>
    </div>

    <div class="picker-search">
      <span data-icon="search"></span>
      <input type="text" id="pickerSearch" placeholder="搜索名称、英文名或 INS 编码">
    </div>

    <div class="picker-list" id="pickerList"></div>
  `;

  openModal(body);

  const renderList = (kw) => {
    const key = (kw || '').trim().toLowerCase();
    const list = ADDITIVES.filter(a =>
      !key ||
      a.name.toLowerCase().includes(key) ||
      a.en.toLowerCase().includes(key) ||
      a.ins.includes(key)
    );

    $('#pickerList').innerHTML = list.length ? list.map(a => {
      const on = selectedIds.has(a.id);
      const lv = RISK_LEVELS[a.safety] || RISK_LEVELS.unknown;
      return `
        <button class="picker-row ${on ? 'is-on' : ''}" data-pick="${a.id}">
          <span class="dot" style="background:${lv.color}"></span>
          <span class="picker-name">${escapeHTML(a.name)}<em class="mono">INS ${a.ins}</em></span>
          <span class="picker-cat">${categoryNameOf(a)}</span>
          <span class="picker-check">${on ? svgIcon('check', 14) : svgIcon('plus', 14)}</span>
        </button>`;
    }).join('') : `<p class="chips-empty">没有匹配的条目，可以改用上面的输入框添加自定义名称</p>`;

    $$('[data-pick]').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.dataset.pick;
        if (selectedIds.has(id)) {
          selectedIds.delete(id);
          state.manual = state.manual.filter(m => m.id !== id);
        } else {
          selectedIds.add(id);
          state.manual.push({ id });
        }
        renderList($('#pickerSearch').value);
        renderAdditiveChips();
        updatePickerCount();
      });
    });
  };

  renderList('');
  renderIcons($('#modalBody'));

  $('#pickerSearch').addEventListener('input', (e) => renderList(e.target.value));
  $('#pickerSearch').focus();

  $('#customAdditiveBtn').addEventListener('click', () => {
    const val = $('#customAdditiveInput').value.trim();
    if (!val) { toast('请输入添加剂名称'); return; }
    if (state.manual.some(m => m.name === val)) { toast('已经添加过了'); return; }
    const lib = ADDITIVES.find(a => a.name === val || additiveAliases(a).includes(val.toUpperCase()));
    if (lib) {
      if (!state.manual.some(m => m.id === lib.id)) state.manual.push({ id: lib.id });
      selectedIds.add(lib.id);
      toast(`已添加「${lib.name}」`);
    } else {
      state.manual.push({ name: val });
      toast(`「${val}」已作为自定义项添加`);
    }
    $('#customAdditiveInput').value = '';
    renderAdditiveChips();
    renderList($('#pickerSearch').value);
    updatePickerCount();
  });

  $('#customAdditiveInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') $('#customAdditiveBtn').click();
  });
}

function updatePickerCount() {
  const el = $('#pickerCount');
  if (!el) return;
  el.textContent = state.manual.length ? `已选 ${state.manual.length} 项` : '';
}

/* ============================================================
 * 结果构建与渲染
 * ============================================================ */
function buildResult() {
  const text = ($('#labelInput') || {}).value || '';
  const ingredients = parseIngredients(text);
  const additives = currentAdditives();
  const risk = calculateRisk(additives, ingredients.length);
  const grade = gradeOf(risk);
  const nutrition = readNutrition();
  const nut = analyzeNutrition(nutrition, state.foodCategory === 'drink');
  const allergens = detectAllergens(ingredients, additives);
  const userHits = allergens.filter(a => state.allergens.includes(a.id));
  const category = FOOD_CATEGORIES.find(c => c.id === state.foodCategory) || FOOD_CATEGORIES[FOOD_CATEGORIES.length - 1];

  const sample = SAMPLE_LABELS.find(s => s.id === state.activeSample);
  const title = sample ? sample.name : `${category.name} · 我的解读`;

  return { text, ingredients, additives, risk, grade, nutrition, nut, allergens, userHits, category, title };
}

// 三段条的宽度按实际条目数分配，否则「2 良好 1 留意」和「1 良好 1 留意 1 关注」看起来一样
// 只渲染有条目的分段，否则空段会变成一排等宽灰条，和「未收录 1」的统计对不上
function segBarHTML(risk) {
  const segs = [
    { n: risk.safeCount, c: '#3A7D44' },
    { n: risk.cautionCount, c: '#C08A2E' },
    { n: risk.alertCount, c: '#B4483F' },
    { n: risk.unknownCount, c: '#9AA8A0' }
  ].filter(s => s.n > 0);

  // 一条都没识别出来时保留一条整宽浅灰，色条不会凭空消失让标题跳位
  if (!segs.length) return '<span style="flex:1;background:var(--border-soft)"></span>';

  return segs.map(s => `<span style="flex:${s.n};background:${s.c}"></span>`).join('');
}

function leafIcons(score, size) {
  const s = size || 18;
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const full = score >= i;
    const half = !full && score > i - 1;
    const width = full ? 100 : (half ? 50 : 0);
    html += `<span class="leaf" style="width:${s}px;height:${s}px">
      <span class="leaf-bg">${svgIcon('leaf', s)}</span>
      <span class="leaf-fill" style="width:${width}%">${svgIcon('leaf', s)}</span>
    </span>`;
  }
  return html;
}

function badgeHTML(add) {
  const lv = RISK_LEVELS[add.safety] || RISK_LEVELS.unknown;
  return `<span class="badge" style="background:${lv.bg};color:${lv.text}">${svgIcon(lv.icon, 12)}${escapeHTML(add.safetyText)}</span>`;
}

function tagsHTML(add) {
  const attention = (add.safety === 'caution' || add.safety === 'alert')
    ? `<span class="tag tag-alert">注意 · ${escapeHTML(add.caution || add.safetyText)}</span>`
    : '';
  return `
    <div class="tags">
      <span class="tag">类别 · ${categoryNameOf(add)}</span>
      <span class="tag tag-outline">用途 · ${escapeHTML(add.usage)}</span>
      ${attention}
    </div>`;
}

function stickerHTML(r) {
  const g = r.grade;
  const topAlert = r.additives.find(a => a.safety === 'alert');
  const topCaution = r.additives.find(a => a.safety === 'caution');
  const unknowns = r.additives.filter(a => a.safety === 'unknown');
  const warn = topAlert ? `${topAlert.name}等 ${r.risk.alertCount} 项需重点关注`
    : topCaution ? `${topCaution.name}等 ${r.risk.cautionCount} 项建议留意`
      : unknowns.length ? `${unknowns[0].name}等 ${unknowns.length} 项未收录，建议核对包装`
        : r.additives.length ? '均为知识库中安全性良好的成分'
          : '未识别到收录的添加剂';

  const ledWords = r.nut.leds.map(m => `
    <span class="st-led"><i style="background:${LIGHT_LEVELS[m.light].dot}"></i>${m.nutrient.name}${LIGHT_LEVELS[m.light].word}</span>
  `).join('');

  return `
    <div class="sticker">
      <div class="sticker-notch" aria-hidden="true"></div>
      <div class="sticker-top">
        <span class="sticker-kicker">Food label note</span>
        <span class="sticker-no mono">${new Date().getFullYear().toString().slice(2)}${String(new Date().getMonth() + 1).padStart(2, '0')}</span>
      </div>

      <div class="sticker-cat">
        <span data-icon="${r.category.icon}"></span>${r.category.name}
      </div>

      <div class="sticker-title">${escapeHTML(r.title)}</div>
      <div class="sticker-sub">${r.ingredients.length} 项配料 · ${r.additives.length} 种添加剂</div>

      <div class="sticker-main">
        <div class="sticker-grade" style="color:${g.text};background:${g.bg}">${g.letter}</div>
        <div class="sticker-grade-meta">
          <strong style="color:${g.text}">${g.label}</strong>
          <span>${r.nut.hasLeds ? '叶子 ' + r.nut.score.toFixed(1) + ' / 5' : '营养待补充'}</span>
        </div>
      </div>

      <div class="sticker-leaves">${leafIcons(r.nut.hasLeds ? r.nut.score : 0, 18)}</div>

      <div class="sticker-leds">${ledWords || '<span class="st-led is-muted">未填营养成分</span>'}</div>

      <div class="sticker-warn">${escapeHTML(warn)}</div>

      <div class="sticker-foot">
        <span>规则化估算 · 仅供科普</span>
        <span class="sticker-stamp">小叶子</span>
      </div>
    </div>`;
}

/* ============================================================
 * 贴纸卡导出 PNG
 * 不用第三方库：按设计稿配色在 canvas 上重绘一张，再触发下载
 * 背景最后用 destination-over 垫底，这样高度可以边画边算
 * ============================================================ */
const STICKER_FONT = '"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif';

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// 按字符折行（中文没有词边界，逐字测量最稳）
function wrapLines(ctx, text, maxWidth, maxLines) {
  const chars = Array.from(String(text == null ? '' : text));
  const lines = [];
  let cur = '';

  for (let i = 0; i < chars.length; i++) {
    const next = cur + chars[i];
    if (cur && ctx.measureText(next).width > maxWidth) {
      lines.push(cur);
      cur = chars[i];
      if (maxLines && lines.length === maxLines) {
        // 放不下了，最后一行用省略号收尾
        const last = lines[maxLines - 1];
        lines[maxLines - 1] = last.slice(0, Math.max(1, last.length - 1)) + '…';
        return lines;
      }
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawLeaf(ctx, x, y, size, color, filled) {
  ctx.beginPath();
  ctx.moveTo(x + size, y + size * 0.5);
  ctx.bezierCurveTo(x + size * 0.72, y, x + size * 0.22, y, x, y);
  ctx.bezierCurveTo(x, y + size * 0.55, x + size * 0.36, y + size, x + size, y + size * 0.5);
  ctx.closePath();
  if (filled) {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.3;
    ctx.stroke();
  }
}

// 在 ctx 上从 (0,0) 开画，返回整张卡片的高度
function drawStickerCard(ctx, r, W) {
  const g = r.grade;
  const PAD = 44;
  const inner = W - PAD * 2;
  const INK = '#2A3A30';
  const MUTED = '#5F6F65';
  const CREAM = '#FBF3E3';
  const BORDER = '#E4D9BE';
  const BROWN = '#8A7040';

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  let y = 62;

  // 顶部标签行
  ctx.font = `500 11px ${STICKER_FONT}`;
  try { ctx.letterSpacing = '2.2px'; } catch (e) { /* 老浏览器忽略 */ }
  ctx.fillStyle = BROWN;
  ctx.fillText('FOOD LABEL NOTE', PAD, y);
  try { ctx.letterSpacing = '0px'; } catch (e) {}
  ctx.font = `400 11px ${STICKER_FONT}`;
  ctx.fillStyle = '#9A8258';
  ctx.textAlign = 'right';
  ctx.fillText(`${new Date().getFullYear().toString().slice(2)}${String(new Date().getMonth() + 1).padStart(2, '0')}`, W - PAD, y);
  ctx.textAlign = 'left';

  // 类别胶囊
  y += 22;
  ctx.font = `500 12px ${STICKER_FONT}`;
  const catText = r.category ? r.category.name : '未分类';
  const catW = ctx.measureText(catText).width + 26;
  roundRectPath(ctx, PAD, y, catW, 25, 12.5);
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = MUTED;
  ctx.fillText(catText, PAD + 13, y + 17);

  // 标题
  y += 25 + 26;
  ctx.font = `700 27px ${STICKER_FONT}`;
  ctx.fillStyle = INK;
  const titleLines = wrapLines(ctx, r.title, inner, 2);
  titleLines.forEach((line, i) => ctx.fillText(line, PAD, y + i * 35));
  y += (titleLines.length - 1) * 35;

  // 副标题
  y += 24;
  ctx.font = `400 13px ${STICKER_FONT}`;
  ctx.fillStyle = MUTED;
  ctx.fillText(`${r.ingredients.length} 项配料 · ${r.additives.length} 种添加剂`, PAD, y);

  // 评级块
  y += 20;
  roundRectPath(ctx, PAD, y, 88, 88, 14);
  ctx.fillStyle = g.bg;
  ctx.fill();
  ctx.font = `700 44px ${STICKER_FONT}`;
  ctx.fillStyle = g.text;
  ctx.textAlign = 'center';
  ctx.fillText(g.letter, PAD + 44, y + 61);
  ctx.textAlign = 'left';

  ctx.font = `700 17px ${STICKER_FONT}`;
  ctx.fillText(g.label, PAD + 108, y + 36);
  ctx.fillStyle = g.text;
  ctx.font = `400 12.5px ${STICKER_FONT}`;
  ctx.fillStyle = MUTED;
  ctx.fillText(r.nut.hasLeds ? `叶子 ${r.nut.score.toFixed(1)} / 5` : '营养待补充', PAD + 108, y + 62);

  // 叶子
  y += 88 + 26;
  const full = r.nut.hasLeds ? r.nut.score : 0;
  for (let i = 0; i < 5; i++) {
    const leafOn = full >= i + 1;
    const leafHalf = !leafOn && full > i;
    drawLeaf(ctx, PAD + i * 24, y, 18,
      leafOn || leafHalf ? '#3A7D44' : '#C4D3C8', leafOn);
  }

  // 红绿灯
  y += 18 + 24;
  ctx.font = `400 12.5px ${STICKER_FONT}`;
  if (!r.nut.leds.length) {
    ctx.fillStyle = MUTED;
    ctx.fillText('未填营养成分', PAD, y);
    y += 22;
  } else {
    r.nut.leds.forEach((m, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const lv = LIGHT_LEVELS[m.light];
      const x = PAD + col * (inner / 2);
      const yy = y + row * 23;
      ctx.beginPath();
      ctx.arc(x + 3, yy - 4, 3.4, 0, Math.PI * 2);
      ctx.fillStyle = lv.dot;
      ctx.fill();
      ctx.fillStyle = MUTED;
      ctx.fillText(`${m.nutrient.name}${lv.word}`, x + 14, yy);
    });
    y += Math.ceil(r.nut.leds.length / 2) * 23;
  }

  // 重点提示
  y += 26;
  const topAlert = r.additives.find(a => a.safety === 'alert');
  const topCaution = r.additives.find(a => a.safety === 'caution');
  const unknowns = r.additives.filter(a => a.safety === 'unknown');
  const warn = topAlert ? `${topAlert.name}等 ${r.risk.alertCount} 项需重点关注`
    : topCaution ? `${topCaution.name}等 ${r.risk.cautionCount} 项建议留意`
      : unknowns.length ? `${unknowns[0].name}等 ${unknowns.length} 项未收录，建议核对包装`
        : r.additives.length ? '均为知识库中安全性良好的成分'
          : '未识别到收录的添加剂';

  ctx.font = `400 12.5px ${STICKER_FONT}`;
  const warnLines = wrapLines(ctx, warn, inner - 18, 3);
  ctx.fillStyle = '#6B5B3E';
  warnLines.forEach((line, i) => ctx.fillText(line, PAD + 12, y + i * 20));
  ctx.beginPath();
  ctx.moveTo(PAD + 1, y - 12);
  ctx.lineTo(PAD + 1, y + (warnLines.length - 1) * 20 + 4);
  ctx.strokeStyle = BROWN;
  ctx.lineWidth = 2;
  ctx.stroke();

  y += (warnLines.length - 1) * 20 + 24;

  // 分隔线 + 页脚
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.stroke();

  y += 19;
  ctx.font = `400 11px ${STICKER_FONT}`;
  ctx.fillStyle = BROWN;
  ctx.fillText('规则化估算 · 仅供科普', PAD, y);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#9A8258';
  ctx.fillText('食安标签通', W - PAD, y);
  ctx.textAlign = 'left';

  const H = y + 30;

  // ---- 背景最后垫底，这样上面的高度才是已知的 ----
  ctx.globalCompositeOperation = 'destination-over';
  roundRectPath(ctx, 0, 0, W, H, 18);
  ctx.fillStyle = CREAM;
  ctx.fill();
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';

  // 顶部垂挂标签（画在背景之上，位置不与正文冲突）
  const tabW = 88;
  const tabH = 17;
  ctx.beginPath();
  ctx.moveTo(W / 2 - tabW / 2, tabH);
  ctx.lineTo(W / 2 - tabW / 2, 7);
  ctx.quadraticCurveTo(W / 2 - tabW / 2, 0, W / 2 - tabW / 2 + 7, 0);
  ctx.lineTo(W / 2 + tabW / 2 - 7, 0);
  ctx.quadraticCurveTo(W / 2 + tabW / 2, 0, W / 2 + tabW / 2, 7);
  ctx.lineTo(W / 2 + tabW / 2, tabH);
  ctx.closePath();
  ctx.fillStyle = '#F0E4C8';
  ctx.fill();
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.stroke();

  return H;
}

function exportSticker(r) {
  if (!r) return;
  try {
    const W = 640;
    const probe = document.createElement('canvas').getContext('2d');
    const H = drawStickerCard(probe, r, W); // 先量高度，画在 1×1 画布上会被丢弃

    const DPR = 2;
    const canvas = document.createElement('canvas');
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    const ctx = canvas.getContext('2d');
    ctx.scale(DPR, DPR);
    drawStickerCard(ctx, r, W);

    const name = String(r.title || '食品标签').replace(/[\\/:*?"<>|\s]+/g, '') || '食品标签';
    canvas.toBlob(blob => {
      if (!blob) { toast('导出失败，试试截图保存'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `食安标签-${name}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast('贴纸图已保存到下载文件夹');
    }, 'image/png');
  } catch (err) {
    toast('导出失败，可以直接截图保存');
  }
}

function gradeHeadHTML(r) {
  const g = r.grade;
  return `
    <div class="result-head">
      <div class="result-head-main">
        <div class="result-grade" style="color:${g.text}">${g.letter}</div>
        <div class="result-grade-meta">
          <strong style="color:${g.text}">${g.label}</strong>
          <span>添加剂维度 · 参考值 ${r.risk.score} / 100</span>
        </div>
      </div>
      <div class="result-ref">
        点击贴纸卡可复制摘要
      </div>
    </div>
    <div class="result-summary">
      <div class="seg-bar">${segBarHTML(r.risk)}</div>
      <div class="counts">
        <span><i class="dot" style="background:#3A7D44"></i>良好 ${r.risk.safeCount}</span>
        <span><i class="dot" style="background:#C08A2E"></i>留意 ${r.risk.cautionCount}</span>
        <span><i class="dot" style="background:#B4483F"></i>关注 ${r.risk.alertCount}</span>
        ${r.risk.unknownCount ? `<span><i class="dot" style="background:#8A9A90"></i>未收录 ${r.risk.unknownCount}</span>` : ''}
      </div>
    </div>`;
}

function ledHTML(r) {
  if (!r.nut.hasLeds) {
    return `
      <div class="led-block">
        <div class="block-title">营养红绿灯</div>
        <p class="led-empty">能量、脂肪、糖、钠这四项还没有填。这四项决定红绿灯，填任意一项就能看到提示。</p>
      </div>`;
  }

  const rows = r.nut.leds.map(m => {
    const lv = LIGHT_LEVELS[m.light];
    const show = m.value == null ? '未填' : `${m.value} ${m.nutrient.unit}`;
    return `
      <div class="led-row">
        <span class="led-dot" style="background:${lv.dot}"></span>
        <span class="led-name">${m.nutrient.name}</span>
        <span class="led-val mono">${show}</span>
        <span class="led-word" style="color:${lv.text};background:${lv.bg}">${lv.word}</span>
      </div>`;
  }).join('');

  const summary = [
    r.nut.bad ? `${r.nut.bad} 项偏高` : '',
    r.nut.mid ? `${r.nut.mid} 项适中` : '',
    r.nut.good ? `${r.nut.good} 项偏低` : ''
  ].filter(Boolean).join(' · ') || '四项均未填写';

  return `
    <div class="led-block">
      <div class="block-title">
        <span data-icon="gauge"></span>营养红绿灯
        <em class="led-summary">${summary}</em>
      </div>
      <div class="led-rows">${rows}</div>
    </div>`;
}

function leafBlockHTML(r) {
  if (!r.nut.hasLeds) {
    return `
      <div class="leaf-block">
        <div class="leaf-head">
          <span class="label">Nutrition leaf score</span>
          <span class="leaf-score mono">—</span>
        </div>
        <p class="leaf-empty">叶子评分只看能量、脂肪、糖、钠四项。填上其中任意一项才会出分——否则所有指标都是空的，给满分没有意义。</p>
      </div>`;
  }

  const partial = r.nut.fullLeds
    ? ''
    : `<em class="leaf-partial">仅按已填的 ${r.nut.leds.length} 项判定</em>`;

  return `
    <div class="leaf-block">
      <div class="leaf-head">
        <span class="label">Nutrition leaf score</span>
        <span class="leaf-score mono">${r.nut.score.toFixed(1)}<em>/ 5</em></span>
      </div>
      <div class="leaf-row">${leafIcons(r.nut.score, 24)}</div>
      <p class="leaf-verdict">${leafVerdict(r.nut.score)}${partial}</p>
    </div>`;
}

function nrvSectionHTML(r) {
  if (!r.nut.hasData) return '';

  const rows = r.nut.marks.filter(m => m.value != null).map(m => {
    const lv = LIGHT_LEVELS[m.light] || LIGHT_LEVELS.none;
    const pct = m.pct == null ? 0 : m.pct;
    // 四位以上的百分比会把 48px 的单元格撑破，超出就收口显示
    const pctText = pct > 999 ? '>999' : pct;
    return `
      <div class="nrv-row">
        <span class="nrv-name"><span data-icon="${m.nutrient.icon}"></span>${m.nutrient.name}</span>
        <span class="nrv-val mono" title="${m.value}${m.nutrient.unit}">${m.value}<em>${m.nutrient.unit}</em></span>
        <span class="nrv-bar"><i style="width:${Math.min(100, pct)}%;background:${lv.dot}"></i></span>
        <span class="nrv-pct mono" style="color:${lv.text}" title="NRV ${pctText}%">${pctText}%</span>
      </div>`;
  }).join('');

  return `
    <section class="rsec">
      <div class="block-title"><span data-icon="gauge"></span>NRV% 每日参考值<em class="block-note">按本页所填数值占每日推荐量的比例</em></div>
      <div class="nrv-list">${rows}</div>
      <p class="nrv-note">NRV 参考 GB 28050：能量 8400 kJ、蛋白质 60 g、脂肪 60 g、碳水 300 g、钠 2000 mg、膳食纤维 25 g；糖按 WHO 建议上限 50 g 计。</p>
    </section>`;
}

function ingredientSectionHTML(r) {
  const tags = r.ingredients.length
    ? r.ingredients.map(ing => {
      const add = findAdditiveForIngredient(ing);
      const isUserAllergen = ALLERGENS.some(a =>
        state.allergens.includes(a.id) && a.keywords.some(k => ing.includes(k))
      );
      if (add) {
        const lv = RISK_LEVELS[add.safety] || RISK_LEVELS.unknown;
        return `<span class="ingredient-tag is-additive ${isUserAllergen ? 'has-allergen' : ''}" style="background:${lv.bg};color:${lv.text}" data-additive="${add.id}">${escapeHTML(ing)}</span>`;
      }
      return `<span class="ingredient-tag ${isUserAllergen ? 'has-allergen' : ''}">${escapeHTML(ing)}</span>`;
    }).join('')
    : '<span class="ingredient-tag">未填写配料表</span>';

  return `
    <section class="rsec">
      <div class="block-title"><span data-icon="tag"></span>配料表逐项<em class="block-note">带底色的是已识别的添加剂，可点击查看详情</em></div>
      <div class="ingredient-tags">${tags}</div>
    </section>`;
}

function additiveSectionHTML(r) {
  if (!r.additives.length) {
    return `
      <section class="rsec">
        <div class="block-title"><span data-icon="beaker"></span>添加剂解读</div>
        <p class="led-empty">没有识别到知识库收录的添加剂。如果包装上确实有，可以点「添加添加剂」手动补上。</p>
      </section>`;
  }

  const cards = r.additives.map(a => {
    const allergenTags = (a.allergens || []).map(id => {
      const al = ALLERGENS.find(x => x.id === id);
      return al ? `<span class="tag tag-allergen">致敏 · ${al.short}</span>` : '';
    }).join('');

    return `
      <article class="add-card" data-additive="${a.id}">
        <div class="add-card-top">
          <span class="add-icon" data-icon="${categoryIconOf(a)}"></span>
          <div class="add-card-title">
            <h4>${escapeHTML(a.name)}</h4>
            <p class="mono">${escapeHTML(a.en)} · INS ${escapeHTML(a.ins)}</p>
          </div>
          ${badgeHTML(a)}
        </div>
        <p class="add-card-desc">${escapeHTML(a.intro)}</p>
        <div class="tags">
          ${a.custom
            ? '<span class="tag tag-outline">未收录 · 建议核对包装</span>'
            : `<span class="tag">类别 · ${categoryNameOf(a)}</span>
               <span class="tag tag-outline">用途 · ${escapeHTML(a.usage)}</span>`}
          ${allergenTags}
          ${a.source === 'manual' ? '<span class="tag tag-manual">手动添加</span>' : ''}
        </div>
      </article>`;
  }).join('');

  return `
    <section class="rsec">
      <div class="block-title"><span data-icon="beaker"></span>添加剂科普卡片<em class="block-note">共 ${r.additives.length} 种</em></div>
      <div class="add-card-grid">${cards}</div>
    </section>`;
}

function allergenSectionHTML(r) {
  const userHits = r.userHits;

  let banner = '';
  if (userHits.length) {
    banner = `
      <div class="allergen-banner is-hit">
        <span data-icon="alert"></span>
        <div>
          <strong>检出你设置的过敏原：${userHits.map(a => a.name).join('、')}</strong>
          <p>建议避免选择，或与医生确认后再决定。标签识别不能替代专业的过敏诊断。</p>
        </div>
      </div>`;
  } else if (r.allergens.length) {
    banner = `
      <div class="allergen-banner">
        <span data-icon="info"></span>
        <div>
          <strong>检出 ${r.allergens.length} 类常见致敏物质</strong>
          <p>你尚未标记相关过敏原；如有过敏史，可在「我的过敏原」中设置后获得提醒。</p>
        </div>
      </div>`;
  } else {
    banner = `
      <div class="allergen-banner is-clear">
        <span data-icon="checkCircle"></span>
        <div>
          <strong>未从配料表中检出常见致敏物质</strong>
          <p>识别仅覆盖八类致敏物质的关键词，最终以包装上的致敏物质提示为准。</p>
        </div>
      </div>`;
  }

  const chips = r.allergens.map(a => {
    const mine = state.allergens.includes(a.id);
    return `
      <span class="allergen-chip ${mine ? 'is-mine' : ''}">
        <span data-icon="${a.icon}"></span>${a.name}
        ${mine ? '<em>我的</em>' : ''}
        ${a.hits.length ? `<small>${escapeHTML(a.hits.slice(0, 2).join(' / '))}</small>` : ''}
      </span>`;
  }).join('');

  return `
    <section class="rsec">
      <div class="block-title">
        <span data-icon="shield"></span>过敏原提示
        <button class="link-btn" id="openAllergenBtn">我的过敏原设置</button>
      </div>
      ${banner}
      ${chips ? `<div class="allergen-chips">${chips}</div>` : ''}
    </section>`;
}

function generateAdvice(r) {
  const advice = [];

  // 过敏原优先
  if (r.userHits.length) {
    advice.push(`⚠ 配料中检出你标记的过敏原（${r.userHits.map(a => a.name).join('、')}），这类食品建议直接避开。`);
  } else if (r.allergens.length) {
    advice.push(`检出常见致敏物质（${r.allergens.map(a => a.short).join('、')}），有过敏史的家人请留意。`);
  }

  // 添加剂
  const alerts = r.additives.filter(a => a.safety === 'alert');
  const cautions = r.additives.filter(a => a.safety === 'caution');
  const safes = r.additives.filter(a => a.safety === 'safe');
  const unknowns = r.additives.filter(a => a.safety === 'unknown');

  if (alerts.length) {
    advice.push(`含 ${alerts.map(a => a.name).join('、')}，属于需要重点关注的成分，建议控制食用频率。`);
  }
  if (cautions.length) {
    advice.push(`有 ${cautions.length} 种成分建议留意：${cautions.map(a => a.name).join('、')}，具体原因见上方逐项说明。`);
  }
  if (safes.length) {
    advice.push(`识别到 ${safes.length} 种安全性良好的添加剂（如${safes[0].name}），在规定用量下无需担心。`);
  }
  if (unknowns.length) {
    advice.push(`另有 ${unknowns.length} 项（${unknowns.map(a => a.name).join('、')}）不在本地知识库中，等级按「待确认」处理。可以对照包装说明或查询 GB 2760 确认。`);
  }
  if (!r.additives.length && r.ingredients.length) {
    advice.push('未识别到知识库收录的常见添加剂，配料结构相对简单。');
  }

  // 营养
  const m = r.nut.marks;
  const get = (k) => m.find(x => x.key === k);
  const sugar = get('sugar');
  const sodium = get('sodium');
  const fat = get('fat');
  const protein = get('protein');
  const fiber = get('fiber');
  const isDrink = r.nut.isDrink;
  const basis = isDrink ? '100 mL' : '100 g';

  if (!r.nut.hasLeds) {
    advice.push('能量、脂肪、糖、钠四项还没填，本次只评估了添加剂维度。补上这四项可以得到红绿灯与叶子评分。');
  } else {
    // 阈值必须从数据里取：饮料与固体是两套标准，写死会给出错误数字
    if (sugar && sugar.light === 'bad') {
      const t = thresholdOf(sugar.nutrient, isDrink);
      advice.push(`糖 ${sugar.value} g/${basis}，超过 ${t.high} g 的偏高参考线，建议减少食用频次或控制单次份量。`);
    }
    if (sodium && sodium.light === 'bad') {
      const t = thresholdOf(sodium.nutrient, isDrink);
      const salt = (sodium.value * 2.5 / 1000).toFixed(1);
      advice.push(`钠 ${sodium.value} mg/${basis}（折合食盐约 ${salt} g/${basis}），超过 ${t.high} mg 的偏高参考线，高血压人群尤其要注意。`);
    }
    if (fat && fat.light === 'bad') {
      const t = thresholdOf(fat.nutrient, isDrink);
      advice.push(`脂肪 ${fat.value} g/${basis}，超过 ${t.high} g 的偏高参考线，吃的时候适当减少其他油脂来源。`);
    }
    if (protein && protein.value != null && protein.value >= 12) {
      advice.push(`蛋白质 ${protein.value} g/${basis}，是不错的蛋白质来源。`);
    }
    if (fiber && fiber.value != null && fiber.value >= 3) {
      advice.push(`膳食纤维 ${fiber.value} g/${basis}，有助于增加饱腹感。`);
    }
    if (r.nut.fullLeds && r.nut.bad === 0 && r.nut.mid === 0) {
      advice.push('能量、脂肪、糖、钠四项都在偏低区间，是同类产品里比较清爽的选择。');
    }
    if (!r.nut.fullLeds) {
      advice.push(`红绿灯目前只判定出 ${r.nut.leds.length} 项，补齐其余几项后结论会更可靠。`);
    }
  }

  if (r.category && r.category.note) advice.push(`${r.category.name}类提示：${r.category.note}。`);

  advice.push(`本次比对覆盖知识库收录的 ${ADDITIVES.length} 种添加剂，未识别不代表不存在，建议结合包装上的致敏物质提示与生产日期一并判断。`);
  advice.push('食品安全取决于整体饮食结构，偶尔食用含添加剂的食品不必过度焦虑，均衡与适量才是关键。');

  return advice;
}

function adviceSectionHTML(r) {
  const list = generateAdvice(r).map(a => `<li>${escapeHTML(a)}</li>`).join('');
  return `
    <section class="rsec advice">
      <h4><span data-icon="info"></span>综合建议</h4>
      <ul>${list}</ul>
    </section>`;
}

function renderResult(r) {
  const box = $('#resultContent');

  box.innerHTML = `
    <div class="result-top">
      <div class="sticker-wrap">
        ${stickerHTML(r)}
        <div class="sticker-actions">
          <button class="btn btn-soft btn-save" id="saveStickerBtn"><span class="icon-inline" data-icon="download"></span>保存贴纸图</button>
          <button class="btn btn-ghost" id="copySummaryBtn"><span class="icon-inline" data-icon="copy"></span>复制摘要</button>
          <button class="btn btn-ghost" id="copyResultBtn"><span class="icon-inline" data-icon="doc"></span>复制全文</button>
        </div>
        <p class="sticker-hint">保存为 PNG 后可发群或贴进文档，也可以直接点卡片复制摘要</p>
      </div>

      <div class="result-panel">
        ${gradeHeadHTML(r)}
        ${ledHTML(r)}
        ${leafBlockHTML(r)}
      </div>
    </div>

    ${nrvSectionHTML(r)}
    ${ingredientSectionHTML(r)}
    ${additiveSectionHTML(r)}
    ${allergenSectionHTML(r)}
    ${adviceSectionHTML(r)}

    <p class="result-disclaimer">评估结果由规则化知识库生成，仅供科普学习参考，不等同于权威检测结论。营养红绿灯阈值为参考值，不代表产品合格与否。</p>
  `;

  renderIcons(box);

  $$('[data-additive]', box).forEach(el => {
    activateOn(el, () => openAdditiveModal(el.dataset.additive));
  });

  const sticker = $('.sticker', box);
  if (sticker) {
    sticker.setAttribute('aria-label', '贴纸摘要卡，回车复制摘要');
    activateOn(sticker, () => copyText(buildSummaryText(r), '摘要已复制'));
  }

  const saveSticker = $('#saveStickerBtn');
  if (saveSticker) saveSticker.addEventListener('click', () => exportSticker(r));

  const copySummary = $('#copySummaryBtn');
  if (copySummary) copySummary.addEventListener('click', () => copyText(buildSummaryText(r), '摘要已复制'));

  const copyResult = $('#copyResultBtn');
  if (copyResult) copyResult.addEventListener('click', () => copyText(buildResultText(r), '完整结果已复制'));

  const openAllergen = $('#openAllergenBtn');
  if (openAllergen) openAllergen.addEventListener('click', openAllergenModal);
}

function analyzeLabel() {
  const text = ($('#labelInput') || {}).value || '';
  const nutrition = readNutrition();
  const hasNutrition = Object.values(nutrition).some(v => v != null);

  if (!text.trim() && state.manual.length === 0 && !hasNutrition) {
    toast('先粘贴配料表，或至少填写一项信息');
    const input = $('#labelInput');
    if (input) input.focus();
    return;
  }

  const result = buildResult();

  if (!result.ingredients.length && !result.additives.length && !hasNutrition) {
    toast('没能识别出有效配料，检查一下分隔符是否为顿号或逗号');
    return;
  }

  state.lastResult = result;

  $('#emptyState').classList.add('hidden');
  $('#resultContent').classList.remove('hidden');
  renderResult(result);
  pushHistory(result);
}

/* ============================================================
 * 复制
 * ============================================================ */
function buildSummaryText(r) {
  const led = r.nut.leds.map(m => `${m.nutrient.name}${LIGHT_LEVELS[m.light].word}`).join(' · ');
  return [
    `【${r.title}】`,
    `${r.category.name} · ${r.ingredients.length} 项配料 · ${r.additives.length} 种添加剂`,
    `添加剂评估：${r.grade.letter} ${r.grade.label}`,
    r.nut.hasLeds ? `营养小叶子：${r.nut.score.toFixed(1)} / 5` : '营养小叶子：红绿灯四项未填，暂不评分',
    led ? `红绿灯：${led}` : '',
    r.allergens.length ? `致敏物质：${r.allergens.map(a => a.short).join('、')}` : '致敏物质：未检出',
    '',
    '由「食安标签通」生成 · 规则化估算，仅供科普参考'
  ].filter(Boolean).join('\n');
}

function buildResultText(r) {
  const lines = [];
  lines.push('【食安标签通 · 解读结果】');
  lines.push(`名称：${r.title}`);
  lines.push(`类别：${r.category.name}`);
  lines.push(`配料：${r.ingredients.length} 项，识别添加剂 ${r.additives.length} 种`);
  lines.push(`添加剂评估：${r.grade.letter} ${r.grade.label}（参考值 ${r.risk.score}/100）`);
  lines.push(`分项：良好 ${r.risk.safeCount} · 留意 ${r.risk.cautionCount} · 关注 ${r.risk.alertCount}`
    + (r.risk.unknownCount ? ` · 未收录 ${r.risk.unknownCount}` : ''));
  lines.push('');

  if (r.nut.hasData) {
    if (r.nut.hasLeds) {
      lines.push(`营养小叶子：${r.nut.score.toFixed(1)} / 5`
        + (r.nut.fullLeds ? '' : `（仅按已填 ${r.nut.leds.length} 项判定）`));
      lines.push('营养红绿灯：');
      r.nut.leds.forEach(m => {
        lines.push(`  ${m.nutrient.name} ${m.value} ${m.nutrient.unit} → ${LIGHT_LEVELS[m.light].label}（NRV ${m.pct}%）`);
      });
    } else {
      lines.push('营养小叶子：未判定（能量、脂肪、糖、钠四项未填）');
    }
    lines.push('');
  }

  if (r.additives.length) {
    lines.push('添加剂明细：');
    r.additives.forEach(a => {
      lines.push(`  ${a.name}（${categoryNameOf(a)}，INS ${a.ins}，${a.safetyText}）`);
    });
    lines.push('');
  }

  lines.push(`致敏物质：${r.allergens.length ? r.allergens.map(a => a.name).join('、') : '未检出'}`);
  if (r.userHits.length) lines.push(`⚠ 命中我的过敏原：${r.userHits.map(a => a.name).join('、')}`);
  lines.push('');
  lines.push('综合建议：');
  generateAdvice(r).forEach(a => lines.push(`· ${a}`));
  lines.push('');
  lines.push('—— 由「食安标签通」生成，规则化估算，仅供科普参考');

  return lines.join('\n');
}

function copyText(text, okMsg) {
  const done = () => toast(okMsg || '已复制');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    done();
  } catch (e) {
    toast('复制失败，请手动选择文本');
  }
  ta.remove();
}

/* ============================================================
 * 历史记录
 * ============================================================ */
function signatureOf(r) {
  return [
    r.text.trim(),
    JSON.stringify(r.nutrition),
    state.manual.map(m => m.id || m.name).join('|')
  ].join('##');
}

function pushHistory(r) {
  const sig = signatureOf(r);
  const entry = {
    id: 'h' + Date.now(),
    ts: Date.now(),
    sig,
    title: r.title,
    categoryId: r.category.id,
    categoryName: r.category.name,
    grade: r.grade.letter,
    gradeLabel: r.grade.label,
    gradeText: r.grade.text,
    gradeBg: r.grade.bg,
    leaf: r.nut.hasData ? r.nut.score : null,
    addCount: r.additives.length,
    text: r.text,
    nutrition: r.nutrition,
    manual: state.manual.slice(),
    allergens: state.allergens.slice()
  };

  state.history = [entry].concat(state.history.filter(h => h.sig !== sig)).slice(0, 8);
  Store.write(Store.HISTORY, state.history);
  renderHistory();
}

// 清空历史是不可撤销的，一下点掉太危险，改成连点两次确认
let historyClearArmed = false;
let historyClearTimer = null;

function renderHistory() {
  const box = $('#historyList');
  if (!box) return;

  const clear = $('#clearHistoryBtn');
  if (clear) {
    if (historyClearArmed) {
      clear.textContent = '再点一次清空';
      clear.classList.add('is-danger');
    } else {
      clear.textContent = '清空历史';
      clear.classList.remove('is-danger');
    }

    clear.onclick = () => {
      if (!state.history.length) { toast('还没有历史记录'); return; }
      if (!historyClearArmed) {
        historyClearArmed = true;
        renderHistory();
        clearTimeout(historyClearTimer);
        historyClearTimer = setTimeout(() => {
          historyClearArmed = false;
          renderHistory();
        }, 4000);
        return;
      }
      clearTimeout(historyClearTimer);
      historyClearArmed = false;
      state.history = [];
      Store.write(Store.HISTORY, state.history);
      renderHistory();
      toast('历史记录已清空');
    };
  }

  const count = $('#historyCount');
  if (count) count.textContent = state.history.length ? `${state.history.length} 条` : '暂无';

  if (!state.history.length) {
    box.innerHTML = `
      <div class="history-empty">
        <span data-icon="history"></span>
        <p>解读过的标签会保存在这里，方便下次直接对比</p>
      </div>`;
    renderIcons(box);
    return;
  }

  box.innerHTML = state.history.map(h => `
    <div class="history-item">
      <div class="hi-grade" style="color:${h.gradeText || '#2C5F33'};background:${h.gradeBg || (h.grade === 'C' ? '#FAF0EE' : h.grade === 'B' ? '#FBF6EC' : '#E8F3EC')}">${h.grade}</div>
      <div class="hi-body">
        <strong>${escapeHTML(h.title)}</strong>
        <span>${formatTime(h.ts)} · ${h.categoryName} · ${h.addCount} 种添加剂${h.leaf != null ? ` · 叶子 ${h.leaf.toFixed(1)}` : ''}</span>
      </div>
      <button class="hi-btn" data-restore="${h.id}" title="重新载入">${svgIcon('rotate', 14)}</button>
      <button class="hi-btn" data-del="${h.id}" title="删除">${svgIcon('trash', 14)}</button>
    </div>
  `).join('');

  $$('[data-restore]', box).forEach(btn => {
    btn.addEventListener('click', () => restoreHistory(btn.dataset.restore));
  });
  $$('[data-del]', box).forEach(btn => {
    btn.addEventListener('click', () => {
      state.history = state.history.filter(h => h.id !== btn.dataset.del);
      Store.write(Store.HISTORY, state.history);
      renderHistory();
    });
  });
}

function restoreHistory(id) {
  const h = state.history.find(x => x.id === id);
  if (!h) return;

  navigateTo('reader');
  state.foodCategory = h.categoryId || 'other';
  state.activeSample = null;
  state.manual = Array.isArray(h.manual) ? h.manual.slice() : [];

  $('#labelInput').value = h.text || '';
  const nut = h.nutrition || {};
  NUTRIENTS.forEach(n => {
    const el = document.getElementById('nut-' + n.id);
    if (el) el.value = nut[n.id] == null ? '' : nut[n.id];
  });

  syncFoodCategories();
  renderAdditiveChips();
  renderIngredientPreview();
  updateNutritionSummary();
  analyzeLabel();

  const panel = $('#resultPanel');
  if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  toast('已重新载入这条记录');
}

function formatTime(ts) {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${mm}-${dd} ${hh}:${mi}`;
}

/* ============================================================
 * 我的过敏原
 * ============================================================ */
function initAllergens() {
  state.allergens = readList(Store.ALLERGEN);
  renderAllergenBadge();

  $$('#allergenBtn, #allergenBtn2, #allergenBtn3').forEach(btn => {
    btn.addEventListener('click', openAllergenModal);
  });
}

function renderAllergenBadge() {
  const dot = $('#allergenDot');
  if (dot) dot.classList.toggle('hidden', state.allergens.length === 0);
  const html = state.allergens.length
    ? state.allergens.map(id => {
      const a = ALLERGENS.find(x => x.id === id);
      return a ? `<span class="tag">${a.short}</span>` : '';
    }).join('')
    : '<p class="muted small">还没有设置，设置后解读时会自动标红提醒</p>';

  $$('[data-allergen-list]').forEach(el => { el.innerHTML = html; });
}

function openAllergenModal() {
  const body = `
    <div class="modal-head">
      <div class="modal-icon" data-icon="shield"></div>
      <div class="modal-title">
        <h2>我的过敏原</h2>
        <p>勾选后，解读结果里命中项会自动标红提醒</p>
      </div>
    </div>

    <div class="allergen-grid" id="allergenGrid">
      ${ALLERGENS.map(a => `
        <button class="allergen-opt ${state.allergens.includes(a.id) ? 'active' : ''}" data-allergen="${a.id}">
          <span data-icon="${a.icon}"></span>
          <span>${a.name}</span>
          <em class="allergen-tick">${svgIcon('check', 13)}</em>
        </button>
      `).join('')}
    </div>

    <p class="modal-note">过敏原设置只保存在你本机浏览器，不会上传。标签识别不能替代医生的诊断，严重过敏请以包装上的致敏物质提示和医生建议为准。</p>

    <div class="modal-actions">
      <button class="btn btn-ghost" id="allergenClear">全部取消</button>
      <button class="btn btn-primary" id="allergenSave">保存设置</button>
    </div>
  `;

  openModal(body);

  const chosen = new Set(state.allergens);
  $$('[data-allergen]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.allergen;
      if (chosen.has(id)) chosen.delete(id); else chosen.add(id);
      btn.classList.toggle('active', chosen.has(id));
    });
  });

  $('#allergenClear').addEventListener('click', () => {
    chosen.clear();
    $$('[data-allergen]').forEach(b => b.classList.remove('active'));
  });

  $('#allergenSave').addEventListener('click', () => {
    state.allergens = Array.from(chosen);
    Store.write(Store.ALLERGEN, state.allergens);
    renderAllergenBadge();
    closeModal();
    toast(state.allergens.length ? `已设置 ${state.allergens.length} 项过敏原` : '已清空过敏原设置');
    if (state.lastResult) analyzeLabel();
  });
}

/* ============================================================
 * 科普库
 * ============================================================ */
function initLibrary() {
  $('#filterChips').innerHTML = CATEGORIES.map(cat => `
    <button class="filter-chip ${cat.id === 'all' ? 'active' : ''}" data-category="${cat.id}">
      <span data-icon="${cat.icon}"></span>${cat.name}
    </button>
  `).join('');
  renderIcons($('#filterChips'));

  $$('[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeCategory = btn.dataset.category;
      $$('.filter-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      renderLibrary();
    });
  });

  $('#searchInput').addEventListener('input', (e) => {
    state.searchKeyword = e.target.value.trim().toLowerCase();
    renderLibrary();
  });

  renderLibrary();
}

// 搜索用的匹配字段：名称、英文名、INS、功能类别、用途、俗称、常见食品
// 少一项就会出现「搜『防腐剂』0 条结果，但筛选按钮上明明写着防腐剂」这种尴尬
function searchHaystack(add) {
  /* 同时收录裸编码（330）与带前缀写法（E330 / INS 330），
     否则搜索框提示里写的「E330」会搜不到东西 */
  const ins = String(add.ins || '').toLowerCase();
  return [
    add.name,
    add.en,
    add.ins,
    ins ? `e${ins}` : '',
    ins ? `ins${ins}` : '',
    categoryNameOf(add),
    add.usage,
    (add.alias || []).join(' '),
    (add.foods || []).join(' ')
  ].join(' ').toLowerCase();
}

function renderLibrary() {
  const kw = state.searchKeyword;
  /* 「INS 330」「E 330」这类带空格的写法，去掉空格再匹配一次 */
  const kwTight = kw.replace(/[\s\-–—]+/g, '');
  const list = ADDITIVES.filter(add => {
    const catOk = state.activeCategory === 'all' || add.category === state.activeCategory;
    const hay = searchHaystack(add);
    const kwOk = !kw || hay.indexOf(kw) !== -1 || (kwTight !== kw && hay.indexOf(kwTight) !== -1);
    return catOk && kwOk;
  });

  $('#libraryCount').textContent = `共 ${list.length} 条记录`;
  const aside = $('#libraryAside');
  if (aside) aside.textContent = `${list.length} / ${ADDITIVES.length} entries`;

  const grid = $('#additiveGrid');

  if (list.length === 0) {
    grid.innerHTML = '';
    $('#noResult').classList.remove('hidden');
    renderIcons($('#noResult'));
    return;
  }
  $('#noResult').classList.add('hidden');

  grid.innerHTML = list.map(add => `
    <div class="additive-card" data-additive="${add.id}" aria-label="查看 ${escapeAttr(add.name)} 的详细说明">
      <div class="ac-top">
        <div>
          <div class="ac-icon" data-icon="${categoryIconOf(add)}"></div>
          <div class="ac-name">${escapeHTML(add.name)}</div>
          <div class="ac-en mono">${escapeHTML(add.en)} · INS ${escapeHTML(add.ins)}</div>
        </div>
        ${badgeHTML(add)}
      </div>
      <div class="ac-desc">${escapeHTML(add.intro)}</div>
      ${tagsHTML(add)}
      ${(add.allergens || []).length ? `<div class="ac-allergen">${svgIcon('alert', 12)}含致敏物质：${add.allergens.map(id => (ALLERGENS.find(x => x.id === id) || {}).short).join('、')}</div>` : ''}
      <div class="ac-footer">
        <span>查看详情</span>
        <span class="arrow" data-icon="arrow"></span>
      </div>
    </div>
  `).join('');

  renderIcons(grid);

  $$('[data-additive]', grid).forEach(card => {
    activateOn(card, () => openAdditiveModal(card.dataset.additive));
  });
}

function openAdditiveModal(id) {
  let add = ADDITIVES.find(a => a.id === id);
  if (!add && String(id).indexOf('custom:') === 0) {
    add = currentAdditives().find(a => a.id === id);
  }
  if (!add) return;

  const allergenInfo = (add.allergens || []).map(aid => {
    const al = ALLERGENS.find(x => x.id === aid);
    return al ? al.name : '';
  }).filter(Boolean);

  const body = `
    <div class="modal-head">
      <div class="modal-icon" data-icon="${categoryIconOf(add)}"></div>
      <div class="modal-title">
        <h2>${escapeHTML(add.name)}</h2>
        <p class="mono">${escapeHTML(add.en)} · INS ${escapeHTML(add.ins)}</p>
      </div>
    </div>

    <div class="modal-badges">
      ${badgeHTML(add)}
      <span class="badge" style="background:var(--grayblue);color:var(--muted)">${categoryNameOf(add)}</span>
      <span class="badge" style="background:var(--grayblue);color:var(--muted)">${escapeHTML(add.usage)}</span>
    </div>

    <div class="msec">
      <h3>基本介绍</h3>
      <p>${escapeHTML(add.intro)}</p>
    </div>

    <div class="msec">
      <h3>常见食品</h3>
      <div class="mfood">${add.foods.map(f => `<span>${escapeHTML(f)}</span>`).join('') || '<span>暂无</span>'}</div>
    </div>

    <div class="msec">
      <h3>安全限量</h3>
      <p>${escapeHTML(add.adiability)}</p>
    </div>

    ${allergenInfo.length ? `
    <div class="msec">
      <h3>致敏提示</h3>
      <div class="mnote">该添加剂本身或来源可能涉及：${allergenInfo.join('、')}。相关人群请留意。</div>
    </div>` : ''}

    <div class="msec">
      <h3>注意事项</h3>
      <div class="mnote">${escapeHTML(add.note)}</div>
    </div>
  `;

  openModal(body);
}

/* ============================================================
 * 弹窗
 * ============================================================ */
// 弹窗打开时记住焦点来源，关闭后还回去；
// 不处理的话键盘用户 Tab 一下就跑回背后的页面上了
let modalReturnFocus = null;

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

function openModal(html) {
  const body = $('#modalBody');
  const overlay = $('#modalOverlay');
  if (!body || !overlay) return;

  modalReturnFocus = document.activeElement;
  body.innerHTML = html;
  renderIcons(body);

  // 弹窗本身是滚动容器，不重置的话第二次打开会停在上次的位置
  const modal = $('.modal');
  if (modal) modal.scrollTop = 0;

  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // 焦点移入弹窗：优先第一个可聚焦控件，没有就落在弹窗容器上
  const first = $('.modal ' + FOCUSABLE.split(',').map(s => s.trim()).join(', .modal '), overlay);
  const target = first || $('.modal', overlay);
  if (target) {
    if (!target.hasAttribute('tabindex') && target.tagName !== 'BUTTON') target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
}

function closeModal() {
  const overlay = $('#modalOverlay');
  if (!overlay || overlay.classList.contains('hidden')) return;

  overlay.classList.add('hidden');
  document.body.style.overflow = '';

  if (modalReturnFocus && modalReturnFocus !== document.body && document.contains(modalReturnFocus)) {
    modalReturnFocus.focus({ preventScroll: true });
  } else if (document.activeElement && overlay.contains(document.activeElement)) {
    // 没有可靠的归还目标时，别把焦点留在已隐藏的弹窗里
    document.activeElement.blur();
  }
  modalReturnFocus = null;
}

// Tab 在弹窗内循环，别跑到背景页面去
function trapModalFocus(e) {
  const overlay = $('#modalOverlay');
  if (!overlay || overlay.classList.contains('hidden') || e.key !== 'Tab') return;

  const items = $$(FOCUSABLE, overlay).filter(el => el.offsetParent !== null);
  if (!items.length) return;

  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

/* ============================================================
 * 提示条
 * ============================================================ */
function toast(msg) {
  const box = $('#toast');
  if (!box) return;
  box.textContent = msg;
  box.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => box.classList.remove('show'), 2200);
}

/* ============================================================
 * 问答
 * ============================================================ */
function initChat() {
  const picks = [
    '食品添加剂都有害吗？',
    '无糖饮料里的甜味剂安全吗？',
    '营养成分表里的 NRV% 是什么意思？',
    '配料表里的过敏原怎么识别？',
    '亚硝酸盐为什么用在肉制品里？'
  ];

  $('#quickQuestions').innerHTML = picks.map(q =>
    `<button class="quick-q" data-question="${q}">${q}</button>`
  ).join('');

  $$('[data-question]').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.question));
  });

  $('#sendBtn').addEventListener('click', () => {
    const input = $('#chatInput');
    sendMessage(input.value.trim());
    input.value = '';
  });

  $('#chatInput').addEventListener('keydown', (e) => {
    // 中文输入法选字时按 Enter 也会触发 keydown，
    // 不判断 isComposing 就会把拼音当成问题发出去
    if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    sendMessage(e.target.value.trim());
    e.target.value = '';
  });
}

function findAdditiveByName(text) {
  const qu = String(text).toUpperCase();
  let hit = null;
  let hitLen = 0;
  ADDITIVES.forEach(add => {
    additiveAliases(add).concat([String(add.en).toUpperCase()]).forEach(n => {
      if (n && qu.includes(n) && n.length > hitLen) {
        hitLen = n.length;
        hit = add;
      }
    });
  });
  return hit;
}

function additiveAnswerText(additive) {
  return `**${additive.name}**（${additive.en}，INS ${additive.ins}）的主要作用是${additive.usage}，安全等级为「${additive.safetyText}」。\n\n${additive.intro}\n\n注意事项：${additive.note}\n\n常见食品：${additive.foods.join('、')}。完整信息可在「添加剂科普」中查看。`;
}

function findAnswer(question) {
  const q = String(question).toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  QA_KNOWLEDGE.forEach(item => {
    let score = 0;
    item.keywords.forEach(kw => {
      if (q.includes(kw.toLowerCase())) score += kw.length;
    });
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  });

  if (bestMatch && bestScore > 0) {
    // 通用条目（如「添加剂都有害吗」）不该抢走点名提问：
    // 「苯甲酸钠有害吗」应该给出苯甲酸钠那张卡片，而不是一段泛泛而谈
    if (!bestMatch.generic) return bestMatch.answer;
    const named = findAdditiveByName(question);
    return named ? additiveAnswerText(named) : bestMatch.answer;
  }

  // 名称查询：走和配料识别同一套别名逻辑，这样「小苏打」「味精」也能问到
  const additive = findAdditiveByName(question);
  if (additive) return additiveAnswerText(additive);

  return `这个问题暂时还没有对应的知识条目。可以换成下面这些问法：\n\n· XX 添加剂安全吗\n· 怎么看懂配料表\n· 无糖饮料里的甜味剂能不能喝\n· NRV% 是什么意思\n\n也可以到「添加剂科普」按名称搜索，那里收录了 ${ADDITIVES.length} 种常见添加剂。`;
}

function renderMarkdown(text) {
  return escapeHTML(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

// 问答应答要排队：之前每个提问各自 setTimeout 随机延迟，
// 连发三条时后发的可能先答，问题和答案会对不上号。
// 现在把回答插回「它自己那条提问」的下面，中间夹着别的问题也不会串位。
const chatQueue = [];
let chatBusy = false;

function appendChatMsg(role, innerHTML, afterEl) {
  const messages = $('#chatMessages');
  if (!messages) return null;
  const el = document.createElement('div');
  el.className = 'chat-msg ' + role;
  el.innerHTML = `
    <div class="msg-avatar" data-icon="${role === 'user' ? 'user' : 'flask'}"></div>
    <div class="msg-bubble">${innerHTML}</div>`;

  if (afterEl && afterEl.parentNode === messages) afterEl.insertAdjacentElement('afterend', el);
  else messages.appendChild(el);

  renderIcons(el);
  messages.scrollTop = messages.scrollHeight;
  return el;
}

function sendMessage(text) {
  const q = String(text || '').trim();
  if (!q) return;

  const anchor = appendChatMsg('user', escapeHTML(q));
  chatQueue.push({ text: q, anchor });
  pumpChat();
}

function pumpChat() {
  if (chatBusy || !chatQueue.length) return;
  chatBusy = true;

  const messages = $('#chatMessages');
  const { text: q, anchor } = chatQueue.shift();

  const typing = document.createElement('div');
  typing.className = 'chat-msg bot chat-typing';
  typing.setAttribute('aria-hidden', 'true');
  typing.innerHTML = `
    <div class="msg-avatar" data-icon="flask"></div>
    <div class="msg-bubble typing">正在检索知识库<i></i><i></i><i></i></div>`;

  if (anchor && anchor.parentNode === messages) anchor.insertAdjacentElement('afterend', typing);
  else messages.appendChild(typing);

  renderIcons(typing);
  messages.scrollTop = messages.scrollHeight;

  setTimeout(() => {
    typing.remove();
    appendChatMsg('bot', renderMarkdown(findAnswer(q)), anchor);
    chatBusy = false;
    pumpChat();
  }, 420);
}

/* ============================================================
 * 贴士与每日一贴
 * ============================================================ */
function initTips() {
  const grid = $('#tipsGrid');
  if (grid) {
    grid.innerHTML = TIPS.map(tip => `
      <div class="tip-card">
        <span class="tip-icon" data-icon="${tip.icon}"></span>
        <div>
          <h3>${escapeHTML(tip.title)}</h3>
          <p>${escapeHTML(tip.desc)}</p>
        </div>
      </div>
    `).join('');
    renderIcons(grid);
  }

  const list = $('#tipList');
  if (list) {
    list.innerHTML = DAILY_TIPS.map(t => `
      <div class="tip-line">
        <span class="tip-line-tag">${escapeHTML(t.tag)}</span>
        <div>
          <strong>${escapeHTML(t.title)}</strong>
          <p>${escapeHTML(t.text)}</p>
        </div>
      </div>
    `).join('');
  }
}

function dailyTip() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayIndex = Math.floor((Date.now() - start.getTime()) / 86400000);
  const idx = (dayIndex + state.tipOffset) % DAILY_TIPS.length;
  return DAILY_TIPS[idx < 0 ? idx + DAILY_TIPS.length : idx];
}

function renderDailyTip() {
  const t = dailyTip();
  $$('[data-tip-title]').forEach(el => { el.textContent = t.title; });
  $$('[data-tip-text]').forEach(el => { el.textContent = t.text; });
  $$('[data-tip-tag]').forEach(el => { el.textContent = t.tag; });
}

function initDailyTip() {
  renderDailyTip();
  $$('[data-tip-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.tipOffset = (state.tipOffset + 1) % DAILY_TIPS.length;
      renderDailyTip();
    });
  });
}

/* ============================================================
 * 首页 FAQ
 * ============================================================ */
function initFaq() {
  const items = $$('.faq-item');
  if (!items.length) return;

  // 用实测内容高度代替 CSS 里写死的 max-height，窄屏长答案才不会被截断
  const syncHeights = () => {
    $$('.faq-item.open .faq-a').forEach(body => {
      body.style.maxHeight = body.scrollHeight + 'px';
    });
  };

  items.forEach(item => {
    const head = $('.faq-q', item);
    const body = $('.faq-a', item);
    if (!head || !body) return;

    if (item.classList.contains('open')) body.style.maxHeight = body.scrollHeight + 'px';

    head.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');

    head.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      items.forEach(i => {
        i.classList.remove('open');
        const b = $('.faq-a', i);
        if (b) b.style.maxHeight = '0px';
        const q = $('.faq-q', i);
        if (q) q.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
        head.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 字体是异步加载的，加载完成后行高会变，需要重算
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncHeights);

  let timer = null;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(syncHeights, 150);
  });
}

/* ============================================================
 * 工具
 * ============================================================ */
// 复用同一个 div，避免每次转义都新建节点
let _escDiv = null;
function escapeHTML(str) {
  if (!_escDiv) _escDiv = document.createElement('div');
  _escDiv.textContent = str == null ? '' : String(str);
  return _escDiv.innerHTML;
}

// 属性值里还要挡住引号：名称里带 " 或 ' 会把标签撕开
function escapeAttr(str) {
  return escapeHTML(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ============================================================
 * 首页样张
 * 用示例数据实时算出来，而不是写死在 HTML 里 ——
 * 否则改了知识库或评分规则，首页的"3 种添加剂"就会和实际结果对不上
 * ============================================================ */
function renderSpecimen() {
  const box = $('#specimenBody');
  if (!box) return;

  const s = SAMPLE_LABELS.find(x => x.id === 'sample3');
  if (!s) return;

  const ingredients = parseIngredients(s.text);
  const additives = matchAdditives(ingredients);
  const risk = calculateRisk(additives, ingredients.length);
  const g = gradeOf(risk);
  const nut = analyzeNutrition(s.nutrition, s.categoryId === 'drink');
  const category = FOOD_CATEGORIES.find(c => c.id === s.categoryId) || FOOD_CATEGORIES[FOOD_CATEGORIES.length - 1];
  const top = additives.find(a => a.safety === 'alert')
    || additives.find(a => a.safety === 'caution')
    || additives[0];

  const leds = nut.leds.map(m =>
    `<span class="st-led"><i style="background:${LIGHT_LEVELS[m.light].dot}"></i>${m.nutrient.name}${LIGHT_LEVELS[m.light].word}</span>`
  ).join('');

  box.innerHTML = `
    <div class="specimen-head">
      <span class="label">Sample note</span>
      <span class="label mono">NO. 003</span>
    </div>
    <div class="specimen-title">${escapeHTML(s.name)}</div>
    <div class="specimen-sub">${ingredients.length} 项配料 · ${additives.length} 种添加剂 · ${category.name}</div>

    <div class="specimen-grade">
      <div class="grade-letter" style="color:${g.text}">${g.letter}</div>
      <div class="grade-meta">
        <strong style="color:${g.text}">${g.label}</strong>
        <span>${risk.alertCount ? `含${escapeHTML(top.name)}等严格限量成分` : '未识别到严格限量成分'}</span>
      </div>
    </div>

    <div class="specimen-leaves">
      <div class="mini-leaves">${leafIcons(nut.score, 16)}</div>
      <span class="mono">${nut.score.toFixed(1)} / 5</span>
    </div>

    <div class="seg-bar" aria-hidden="true">${segBarHTML(risk)}</div>
    <div class="seg-legend">
      <span>${risk.safeCount} 项良好</span>
      <span>${risk.cautionCount} 项留意</span>
      <span>${risk.alertCount} 项关注</span>
    </div>

    <div class="specimen-leds">${leds}</div>

    ${top ? `
    <div class="specimen-row">
      <span class="dot" style="background:${(RISK_LEVELS[top.safety] || RISK_LEVELS.unknown).color}"></span>
      <div style="flex:1">
        <b>${escapeHTML(top.name)}</b>
        <small class="mono">${categoryNameOf(top)} · INS ${escapeHTML(top.ins)}</small>
      </div>
      ${badgeHTML(top)}
    </div>` : ''}
  `;

  renderIcons(box);
}

/* ============================================================
 * 初始化
 * ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderIcons(document);

  // 插画直接从图标库里生成，避免同一段 SVG 在 HTML 里再抄一遍
  const mascot = $('#heroMascot');
  if (mascot) mascot.innerHTML = mascotSVG(56);
  const doodle = $('#footerDoodle');
  if (doodle) doodle.innerHTML = leavesDoodle(86);
  renderFruitDeco(document);

  const statAdd = $('#statAdditives');
  if (statAdd) statAdd.textContent = ADDITIVES.length;
  const statCat = $('#statCategories');
  if (statCat) statCat.textContent = CATEGORIES.length - 1;
  const statNut = $('#statNutrients');
  if (statNut) statNut.textContent = NUTRIENTS.length;
  const featureCount = $('#featureAddCount');
  if (featureCount) featureCount.textContent = ADDITIVES.length;
  const featureCat = $('#featureCatCount');
  if (featureCat) featureCat.textContent = CATEGORIES.length - 1;

  initNavigation();
  initFoodCategories();
  initNutritionInputs();
  initReaderInputs();
  initSamples();
  initAllergens();
  initLibrary();
  initChat();
  initTips();
  initDailyTip();
  initFaq();
  renderSpecimen();

  // 关于区块里的条目数从数据里取，避免改了知识库忘了改文案
  const aboutAdd = $('#aboutAddCount');
  if (aboutAdd) aboutAdd.textContent = ADDITIVES.length;
  const aboutQa = $('#aboutQaCount');
  if (aboutQa) aboutQa.textContent = QA_KNOWLEDGE.length;
  const tipNoteCount = $('#tipNoteCount');
  if (tipNoteCount) tipNoteCount.textContent = `${DAILY_TIPS.length} notes`;

  state.history = readList(Store.HISTORY);
  renderHistory();

  const analyzeBtn = $('#analyzeBtn');
  if (analyzeBtn) analyzeBtn.addEventListener('click', analyzeLabel);

  const addBtn = $('#addAdditiveBtn');
  if (addBtn) addBtn.addEventListener('click', openAdditivePicker);

  const modalClose = $('#modalClose');
  if (modalClose) modalClose.addEventListener('click', closeModal);
  const overlay = $('#modalOverlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    trapModalFocus(e);
  });
});
