/* ============================================================
 * 食安标签通 - 主逻辑
 * ============================================================ */

// ---------- 全局状态 ----------
const state = {
  currentPage: 'home',
  activeCategory: 'all',
  searchKeyword: '',
  chatHistory: []
};

// ---------- DOM 元素 ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// ============================================================
// 导航系统
// ============================================================
function initNavigation() {
  const navLinks = $$('[data-nav]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = href.slice(1);
        navigateTo(target);
      }
    });
  });

  $('#navToggle').addEventListener('click', () => {
    $('#mainNav').classList.toggle('open');
  });

  // 支持浏览器前进后退
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash && hash !== state.currentPage) navigateTo(hash, false);
  });

  // 根据 URL hash 初始化页面
  const initialHash = window.location.hash.slice(1);
  if (initialHash && document.getElementById(initialHash)) {
    navigateTo(initialHash, false);
  }
}

function navigateTo(pageId, updateHash = true) {
  if (!document.getElementById(pageId)) return;

  state.currentPage = pageId;
  $$('.page').forEach(p => p.classList.remove('active'));
  $('#' + pageId).classList.add('active');

  $$('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + pageId);
  });

  $('#mainNav').classList.remove('open');

  if (updateHash) {
    history.pushState(null, '', '#' + pageId);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// 标签解读功能
// ============================================================

// 从配料表文本中提取配料项
function parseIngredients(text) {
  if (!text || !text.trim()) return [];

  let clean = text.trim();
  // 去掉"配料："、"配料表："等前缀
  clean = clean.replace(/^配[料料表][：:\s]*/, '');
  // 按常见分隔符切分
  const parts = clean.split(/[、,，;；\n\r]+/);

  return parts
    .map(p => p.trim())
    .filter(p => p && p.length < 30); // 过滤过长的异常片段
}

// 名称归一化：去掉括号内的俗称，使「碳酸氢钠（小苏打）」可被「碳酸氢钠」命中
function normalizeAdditiveName(str) {
  return String(str).replace(/[（(][^）)]*[）)]/g, '').trim().toUpperCase();
}

// 提取条目可用的匹配名：主名称 + 括号内俗称
function additiveAliases(add) {
  const names = [normalizeAdditiveName(add.name)];
  const m = String(add.name).match(/[（(]([^）)]+)[）)]/);
  if (m) names.push(m[1].trim().toUpperCase());
  return names.filter(Boolean);
}

// 单个配料项 → 知识库添加剂（统一匹配规则，供高亮与列表共用）
function findAdditiveForIngredient(ing) {
  const target = normalizeAdditiveName(ing);
  if (!target) return undefined;

  return ADDITIVES.find(add =>
    additiveAliases(add).some(n => target === n || target.includes(n)) ||
    target === String(add.en).toUpperCase()
  );
}

// 在配料列表中匹配知识库中的添加剂
function matchAdditives(ingredients) {
  const matched = [];

  ingredients.forEach(ing => {
    const found = findAdditiveForIngredient(ing);
    if (found && !matched.some(m => m.id === found.id)) {
      matched.push(found);
    }
  });

  return matched;
}

// 计算风险评分
function calculateRisk(additives, totalIngredients) {
  let score = 100;
  let safeCount = 0, cautionCount = 0, alertCount = 0;

  additives.forEach(add => {
    switch (add.safety) {
      case 'safe': safeCount++; score -= 3; break;
      case 'caution': cautionCount++; score -= 13; break;
      case 'alert': alertCount++; score -= 26; break;
    }
  });

  // 添加剂占比过高时额外扣分
  if (totalIngredients > 0) {
    const ratio = additives.length / totalIngredients;
    if (ratio > 0.5) score -= 8;
  }

  score = Math.max(10, Math.min(100, score));

  let level, color, bg, label;
  if (score >= 80) {
    level = 'safe'; color = '#10b981'; bg = '#d1fae5'; label = '整体良好';
  } else if (score >= 55) {
    level = 'caution'; color = '#f59e0b'; bg = '#fef3c7'; label = '建议留意';
  } else {
    level = 'alert'; color = '#ef4444'; bg = '#fee2e2'; label = '需要关注';
  }

  return { score, level, color, bg, label, safeCount, cautionCount, alertCount };
}

// 生成个性化建议
function generateAdvice(additives, risk) {
  const advice = [];

  if (additives.length === 0) {
    advice.push('未识别到知识库收录的常见添加剂，配料表看起来比较简洁。');
  } else {
    const cautions = additives.filter(a => a.safety === 'caution');
    const alerts = additives.filter(a => a.safety === 'alert');

    if (alerts.length > 0) {
      advice.push(`配料中含 ${alerts.map(a => a.name).join('、')}，属于需要重点关注的成分，建议控制食用频率。`);
    }
    if (cautions.length > 0) {
      advice.push(`有 ${cautions.length} 种添加剂建议留意：${cautions.map(a => a.name).join('、')}，可按科普说明了解具体注意事项。`);
    }
    if (risk.safeCount > 0) {
      advice.push(`识别到 ${risk.safeCount} 种安全性良好的添加剂（如${additives.find(a => a.safety === 'safe').name}），正常情况下无需担心。`);
    }
  }

  advice.push(`本解读仅覆盖知识库收录的 ${ADDITIVES.length} 种常见添加剂，未识别不代表不存在，建议结合营养成分表综合判断。`);
  advice.push('食品的安全性取决于整体饮食结构，偶尔食用含添加剂食品无需过度焦虑，均衡饮食才是关键。');

  return advice;
}

// 渲染解读结果
function renderAnalysisResult(ingredients, additives, risk) {
  const container = $('#resultContent');

  // 配料标签（添加剂高亮）
  const ingredientTags = ingredients.map(ing => {
    const add = findAdditiveForIngredient(ing);
    if (add) {
      const lv = RISK_LEVELS[add.safety];
      return `<span class="ingredient-tag is-additive" style="background:${lv.bg};color:${lv.color}" data-additive="${add.id}" title="点击查看科普详情">${ing} ${lv.icon}</span>`;
    }
    return `<span class="ingredient-tag">${escapeHTML(ing)}</span>`;
  }).join('');

  // 添加剂详情列表
  const additiveList = additives.length
    ? additives.map(add => {
        const lv = RISK_LEVELS[add.safety];
        return `
          <div class="additive-result-item">
            <div class="ar-icon">${add.icon}</div>
            <div>
              <div class="ar-name">${add.name}</div>
              <div class="ar-meta">${add.usage} · INS ${add.ins}</div>
              <div class="ar-note">${add.intro}</div>
            </div>
            <div class="ar-level" style="background:${lv.bg};color:${lv.color}">${lv.icon} ${add.safetyText}</div>
          </div>`;
      }).join('')
    : '<p style="color:var(--text-muted);font-size:13px;">未识别到知识库收录的添加剂。可能配料较简单，或该添加剂尚未收录。</p>';

  const adviceList = generateAdvice(additives, risk).map(a => `<li>${a}</li>`).join('');

  container.innerHTML = `
    <h3>📋 解读报告</h3>
    <p class="result-subtitle">共识别 ${ingredients.length} 种配料，其中 ${additives.length} 种为知识库收录的食品添加剂</p>

    <div class="result-score-card">
      <div class="score-circle" style="background:linear-gradient(135deg, ${risk.color}, ${risk.color}cc)">
        <strong>${risk.score}</strong><span>安心指数</span>
      </div>
      <div class="score-detail">
        <h4 style="color:${risk.color}">${risk.icon || ''} ${risk.label}</h4>
        <p>安全性良好 ${risk.safeCount} 种 · 建议留意 ${risk.cautionCount} 种 · 需要关注 ${risk.alertCount} 种</p>
        <div class="score-badges">
          <span class="score-badge" style="background:#d1fae5;color:#047857">✅ 安心 ${risk.safeCount}</span>
          <span class="score-badge" style="background:#fef3c7;color:#b45309">⚠️ 留意 ${risk.cautionCount}</span>
          <span class="score-badge" style="background:#fee2e2;color:#b91c1c">🚨 关注 ${risk.alertCount}</span>
        </div>
      </div>
    </div>

    <div class="result-section-title">🏷️ 配料表逐项识别</div>
    <div class="ingredient-tags">${ingredientTags}</div>

    <div class="result-section-title">🧪 添加剂科普解读</div>
    <div class="additive-result-list">${additiveList}</div>

    <div class="result-advice">
      <h4>💡 综合建议</h4>
      <ul>${adviceList}</ul>
    </div>

    <p class="result-disclaimer">⚠️ 本报告基于本地知识库规则生成，仅供科普学习参考，不构成医疗或消费建议。</p>
  `;

  // 绑定配料标签点击 → 打开详情
  $$('[data-additive]', container).forEach(tag => {
    tag.addEventListener('click', () => openAdditiveModal(tag.dataset.additive));
  });
}

// 执行解读
function analyzeLabel() {
  const text = $('#labelInput').value.trim();

  if (!text) {
    alert('请先粘贴配料表内容，或选择一个示例数据。');
    $('#labelInput').focus();
    return;
  }

  const ingredients = parseIngredients(text);
  if (ingredients.length === 0) {
    alert('未能识别出有效配料，请检查输入格式。');
    return;
  }

  const additives = matchAdditives(ingredients);
  const risk = calculateRisk(additives, ingredients.length);

  $('#emptyState').classList.add('hidden');
  $('#resultContent').classList.remove('hidden');
  renderAnalysisResult(ingredients, additives, risk);
}

// 初始化示例列表
function initSamples() {
  const list = $('#sampleList');
  list.innerHTML = SAMPLE_LABELS.map(s =>
    `<button class="sample-btn" data-sample="${s.id}">🧪 ${s.name}</button>`
  ).join('');

  $$('[data-sample]', list).forEach(btn => {
    btn.addEventListener('click', () => {
      const sample = SAMPLE_LABELS.find(s => s.id === btn.dataset.sample);
      $('#labelInput').value = sample.text;
      analyzeLabel();
      $('#resultPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ============================================================
// 添加剂科普库
// ============================================================

function initLibrary() {
  // 渲染筛选标签
  $('#filterChips').innerHTML = CATEGORIES.map(cat => `
    <button class="filter-chip ${cat.id === 'all' ? 'active' : ''}" data-category="${cat.id}">
      ${cat.icon} ${cat.name}
    </button>
  `).join('');

  $$('[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeCategory = btn.dataset.category;
      $$('.filter-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      renderLibrary();
    });
  });

  // 搜索
  $('#searchInput').addEventListener('input', (e) => {
    state.searchKeyword = e.target.value.trim().toLowerCase();
    renderLibrary();
  });

  renderLibrary();
}

function renderLibrary() {
  let list = ADDITIVES.filter(add => {
    const categoryMatch = state.activeCategory === 'all' || add.category === state.activeCategory;
    const kw = state.searchKeyword;
    const searchMatch = !kw ||
      add.name.toLowerCase().includes(kw) ||
      add.en.toLowerCase().includes(kw) ||
      add.ins.includes(kw) ||
      add.foods.some(f => f.includes(kw));
    return categoryMatch && searchMatch;
  });

  $('#libraryCount').textContent = `共找到 ${list.length} 种添加剂`;

  if (list.length === 0) {
    $('#additiveGrid').innerHTML = '';
    $('#noResult').classList.remove('hidden');
    return;
  }
  $('#noResult').classList.add('hidden');

  $('#additiveGrid').innerHTML = list.map(add => {
    const lv = RISK_LEVELS[add.safety];
    return `
      <div class="additive-card" data-additive="${add.id}">
        <div class="ac-top">
          <div>
            <div class="ac-icon">${add.icon}</div>
            <div class="ac-name">${add.name}</div>
            <div class="ac-en">${add.en} · INS ${add.ins}</div>
          </div>
          <span class="ac-safety" style="background:${lv.bg};color:${lv.color}">${lv.icon} ${add.safetyText}</span>
        </div>
        <span class="ac-usage">${add.usage}</span>
        <div class="ac-desc">${add.intro}</div>
        <div class="ac-footer">查看详细科普 →</div>
      </div>`;
  }).join('');

  $$('[data-additive]', $('#additiveGrid')).forEach(card => {
    card.addEventListener('click', () => openAdditiveModal(card.dataset.additive));
  });
}

// 打开添加剂详情弹窗
function openAdditiveModal(id) {
  const add = ADDITIVES.find(a => a.id === id);
  if (!add) return;

  const lv = RISK_LEVELS[add.safety];

  $('#modalBody').innerHTML = `
    <div class="modal-head">
      <div class="modal-icon">${add.icon}</div>
      <div class="modal-title">
        <h2>${add.name}</h2>
        <p>${add.en} · 国际编码 INS ${add.ins}</p>
      </div>
    </div>
    <div class="modal-badges">
      <span class="modal-badge" style="background:${lv.bg};color:${lv.color}">${lv.icon} ${add.safetyText}</span>
      <span class="modal-badge" style="background:#f3f4f6;color:var(--text-muted)">${add.usage}</span>
    </div>
    <div class="modal-section">
      <h3>📖 基本介绍</h3>
      <p>${add.intro}</p>
    </div>
    <div class="modal-section">
      <h3>🍽️ 常见食品</h3>
      <div class="modal-food-list">${add.foods.map(f => `<span class="modal-food">${f}</span>`).join('')}</div>
    </div>
    <div class="modal-section">
      <h3>⚖️ 安全限量</h3>
      <p>${add.adiability}</p>
    </div>
    <div class="modal-section">
      <h3>💡 科学解读</h3>
      <div class="modal-note">${add.note}</div>
    </div>
  `;

  $('#modalOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('#modalOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// ============================================================
// AI 问答
// ============================================================

function initChat() {
  // 快捷问题
  const suggestions = QA_KNOWLEDGE.slice(0, 5).map(q => q.question);
  $('#quickQuestions').innerHTML = suggestions.map(q =>
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

  $('#chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage(e.target.value.trim());
      e.target.value = '';
    }
  });
}

// 匹配知识库回答
function findAnswer(question) {
  const q = question.toLowerCase();

  // 1. 关键词匹配（计算匹配度）
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
    return bestMatch.answer;
  }

  // 2. 添加剂名称直接匹配
  const additive = ADDITIVES.find(add =>
    q.includes(add.name) || q.toLowerCase().includes(add.en.toLowerCase())
  );
  if (additive) {
    const lv = RISK_LEVELS[additive.safety];
    return `**${additive.name}**（${additive.en}，INS ${additive.ins}）是一种常见的${additive.usage}，安全等级为「${additive.safetyText}」${lv.icon}。\n\n${additive.intro}\n\n💡 ${additive.note}\n\n常见食品：${additive.foods.join('、')}。想了解更多，可以到「添加剂科普库」搜索查看完整信息。`;
  }

  // 3. 兜底回答
  return `这个问题我暂时还没学到 🤔 不过你可以试试这样提问：\n\n• 「XX 添加剂安全吗？」\n• 「怎么看懂配料表？」\n• 「无糖饮料安全吗？」\n• 「亚硝酸盐为什么用在肉制品里？」\n\n也可以到「添加剂科普库」按名称搜索，那里收录了 ${ADDITIVES.length} 种常见添加剂的详细科普。`;
}

// 简单的 Markdown 加粗渲染（仅处理 **text**）
function renderMarkdown(text) {
  return escapeHTML(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}

function sendMessage(text) {
  if (!text) return;

  const messages = $('#chatMessages');

  // 用户消息
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-message user';
  userMsg.innerHTML = `
    <div class="message-avatar">👤</div>
    <div class="message-bubble">${escapeHTML(text)}</div>`;
  messages.appendChild(userMsg);

  // 模拟 AI 思考延迟
  const typing = document.createElement('div');
  typing.className = 'chat-message bot';
  typing.id = 'typingIndicator';
  typing.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-bubble">思考中<span class="dots">...</span></div>`;
  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;

  setTimeout(() => {
    typing.remove();
    const answer = findAnswer(text);
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-message bot';
    botMsg.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-bubble">${renderMarkdown(answer)}</div>`;
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;

    state.chatHistory.push({ question: text, answer });
  }, 600 + Math.random() * 400);
}

// ============================================================
// 贴士页面
// ============================================================
function initTips() {
  $('#tipsGrid').innerHTML = TIPS.map(tip => `
    <div class="tip-card">
      <div class="tip-icon">${tip.icon}</div>
      <div>
        <h3>${tip.title}</h3>
        <p>${tip.desc}</p>
      </div>
    </div>
  `).join('');
}

// ============================================================
// 工具函数
// ============================================================
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// 初始化
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  $('#statAdditives').textContent = ADDITIVES.length;

  initNavigation();
  initSamples();
  initLibrary();
  initChat();
  initTips();

  // 解读按钮
  $('#analyzeBtn').addEventListener('click', analyzeLabel);
  $('#clearBtn').addEventListener('click', () => {
    $('#labelInput').value = '';
    $('#resultContent').classList.add('hidden');
    $('#emptyState').classList.remove('hidden');
  });

  // 弹窗关闭
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalOverlay').addEventListener('click', (e) => {
    if (e.target === $('#modalOverlay')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  console.log('%c🥗 食安标签通 已就绪', 'color:#10b981;font-size:16px;font-weight:bold');
  console.log(`%c知识库：${ADDITIVES.length} 种添加剂 / ${SAMPLE_LABELS.length} 个示例 / ${QA_KNOWLEDGE.length} 条问答`, 'color:#6b7280');
});
