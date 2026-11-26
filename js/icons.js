/* ============================================================
 * 食安标签通 - 图标系统
 * 统一 1.5px 描边的线性图标，尺寸随字号继承（1em 基准）
 * ============================================================ */

const ICON_PATHS = {
  /* 导航 */
  home: '<path d="M3.6 10.6 12 3.4l8.4 7.2"/><path d="M5.8 9.4V19a1.4 1.4 0 0 0 1.4 1.4h9.6A1.4 1.4 0 0 0 18.2 19V9.4"/>',
  scan: '<path d="M4.2 8V5.8a1.6 1.6 0 0 1 1.6-1.6H8"/><path d="M16 4.2h2.2a1.6 1.6 0 0 1 1.6 1.6V8"/><path d="M19.8 16v2.2a1.6 1.6 0 0 1-1.6 1.6H16"/><path d="M8 19.8H5.8a1.6 1.6 0 0 1-1.6-1.6V16"/><path d="M4.2 12h15.6"/>',
  book: '<path d="M4.2 5.6A1.6 1.6 0 0 1 5.8 4h4.4v16H5.8a1.6 1.6 0 0 1-1.6-1.6z"/><path d="M10.2 4h8a1.6 1.6 0 0 1 1.6 1.6v12.8a1.6 1.6 0 0 1-1.6 1.6h-8"/><path d="M13.2 8.6h3.4M13.2 12h3.4"/>',
  chat: '<path d="M19.8 11.8a6.9 6.9 0 0 1-6.9 6.9H9.5L5 21.2v-3.6a6.9 6.9 0 0 1-2.8-5.8 6.9 6.9 0 0 1 6.9-6.9h3.8a6.9 6.9 0 0 1 6.9 6.9z"/><path d="M8.8 10.6h6.4M8.8 14h3.6"/>',
  bulb: '<path d="M9.6 18.4h4.8"/><path d="M10.6 21h2.8"/><path d="M12 3.2a6 6 0 0 0-3.6 10.8v2.2h7.2v-2.2A6 6 0 0 0 12 3.2z"/>',

  /* 食品类别 */
  cup: '<path d="M6.2 8h9.6l-.9 11.1a1.7 1.7 0 0 1-1.7 1.5H8.8a1.7 1.7 0 0 1-1.7-1.5z"/><path d="M15.8 10.4h2.3a2.5 2.5 0 0 1 0 5h-2.6"/><path d="M9.8 4.4 8.6 8M13.4 4.6 12.6 8"/>',
  milk: '<path d="M8.8 3.4h6.4v3l1.8 3.1v9.1a1.6 1.6 0 0 1-1.6 1.6H8.6a1.6 1.6 0 0 1-1.6-1.6v-9.1l1.8-3.1z"/><path d="M7 10.2h10"/><path d="M8.8 3.4h6.4v3H8.8z"/>',
  bread: '<path d="M4.4 11.6c0-2.7 1.9-4.6 4.4-4.6h6.4c2.5 0 4.4 1.9 4.4 4.6 0 1.6-1 2.9-2.5 3.3v3.5a1.4 1.4 0 0 1-1.4 1.4H8.3a1.4 1.4 0 0 1-1.4-1.4v-3.5c-1.5-.4-2.5-1.7-2.5-3.3z"/><path d="M9.3 12.8v5.6M14.7 12.8v5.6"/>',
  drumstick: '<path d="M15.4 4.2a4.7 4.7 0 0 1 4.4 7.6l-5.2 5.2a4.7 4.7 0 0 1-6.6-6.6l5.2-5.2c.6-.6 1.4-1 2.2-1z"/><path d="M8.6 13.4 4.8 17.2a2 2 0 1 0 2 2l3.8-3.8"/>',
  candy: '<rect x="8.6" y="8.6" width="6.8" height="6.8" rx="2.2"/><path d="M8.6 11.2 4.8 9.2v5.6l3.8-2M15.4 11.2l3.8-2v5.6l-3.8-2"/>',
  noodle: '<path d="M4.6 12.4h14.8v1.4a5 5 0 0 1-5 5H9.6a5 5 0 0 1-5-5z"/><path d="M8.8 8.8c0-1.4.8-1.6.8-2.9M12 8.8c0-1.4.8-1.6.8-2.9M15.2 8.8c0-1.4.8-1.6.8-2.9"/>',
  sauce: '<path d="M9.4 3.6h5.2v2.8l1.6 2.3v10.4a1.6 1.6 0 0 1-1.6 1.6H9.4a1.6 1.6 0 0 1-1.6-1.6V8.7l1.6-2.3z"/><path d="M7.8 12.4h8.4"/>',

  /* 添加剂分类 */
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  shield: '<path d="M12 3.2 5.5 5.8v5.4c0 4.2 2.8 7.4 6.5 9.2 3.7-1.8 6.5-5 6.5-9.2V5.8z"/><path d="M9.2 11.8l2 2 3.6-3.6"/>',
  sparkle: '<path d="M12 3.5l1.7 4.9 4.9 1.7-4.9 1.7L12 16.7l-1.7-4.9L5.4 10.1l4.9-1.7z"/>',
  crystal: '<path d="M12 3.6l6 3.4v6.9l-6 3.5-6-3.5V7z"/><circle cx="12" cy="10.6" r="1.8"/>',
  palette: '<path d="M12 3.2c-4.9 0-8.8 3.6-8.8 8s3.9 8 8.8 8c1.1 0 1.7-.8 1.7-1.7 0-1-.8-1.7-.8-2.7 0-.8.7-1.5 1.6-1.5h1.9c2.3 0 4.2-1.9 4.2-4.2 0-3.8-3.8-5.9-8.6-5.9z"/><circle cx="8.2" cy="9.2" r=".9"/><circle cx="12" cy="7.2" r=".9"/><circle cx="15.6" cy="9.2" r=".9"/>',
  beaker: '<path d="M9.2 3.2h5.6"/><path d="M10.4 3.2v6L6.8 16.6a2.2 2.2 0 0 0 2 3.2h6.4a2.2 2.2 0 0 0 2-3.2L13.6 9.2v-6"/><path d="M7.9 14.2h8.2"/>',
  drops: '<path d="M8.4 4.6c1.9 2.3 3.1 3.9 3.1 5.4a3.1 3.1 0 1 1-6.2 0c0-1.5 1.2-3.1 3.1-5.4z"/><path d="M16.4 10.6c1.9 2.3 3.1 3.9 3.1 5.4a3.1 3.1 0 1 1-6.2 0c0-1.5 1.2-3.1 3.1-5.4z"/>',
  bubbles: '<path d="M5.5 19.5h13"/><circle cx="9" cy="15.4" r="1.9"/><circle cx="14.2" cy="11.4" r="2.4"/><circle cx="10.6" cy="6.4" r="1.5"/>',
  citrus: '<circle cx="12" cy="12" r="7.2"/><path d="M12 4.8v14.4M4.8 12h14.4M6.9 6.9l10.2 10.2M17.1 6.9 6.9 17.1"/>',
  disc: '<circle cx="12" cy="12" r="7.6"/><circle cx="12" cy="12" r="3.2"/>',
  water: '<path d="M12 3.4c3.4 4 5.2 6.6 5.2 9.1a5.2 5.2 0 0 1-10.4 0c0-2.5 1.8-5.1 5.2-9.1z"/><path d="M9.4 13.6c.6 1.4 1.5 2.1 2.8 2.3"/>',
  steam: '<path d="M4.8 14.6h14.4"/><path d="M8 14.6c0-2.6 1.8-4.6 4-4.6s4 2 4 4.6"/><path d="M9.4 7.4c0-1.2.9-1.4.9-2.6M14 7.4c0-1.2.9-1.4.9-2.6"/>',

  /* 功能与提示 */
  check: '<path d="M5.4 12.4 9.8 16.8 18.6 8"/>',
  checkCircle: '<circle cx="12" cy="12" r="8"/><path d="M8.6 12.2 11 14.6l4.6-4.6"/>',
  alert: '<path d="M12 4.4 20.8 19.6H3.2z"/><path d="M12 10.2v4M12 16.6v.2"/>',
  alertCircle: '<circle cx="12" cy="12" r="8"/><path d="M9.6 9.6l4.8 4.8M14.4 9.6l-4.8 4.8"/>',
  question: '<circle cx="12" cy="12" r="8"/><path d="M9.9 9.6a2.2 2.2 0 1 1 3.2 2c-.7.4-1.1 1-1.1 1.8v.3"/><path d="M12 16.6v.2"/>',
  info: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8.2v.2"/>',
  close: '<path d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6"/>',
  lock: '<rect x="4.8" y="10.4" width="14.4" height="9.4" rx="2"/><path d="M8.4 10.4V8a3.6 3.6 0 0 1 7.2 0v2.4"/>',
  arrow: '<path d="M4.6 12h14M13.2 6.6 18.6 12l-5.4 5.4"/>',
  chevronRight: '<path d="M9.6 6.4 15.2 12l-5.6 5.6"/>',
  chevronDown: '<path d="M6.4 9.6 12 15.2l5.6-5.6"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.2"/><path d="M15.4 15.4 20 20"/>',
  flask: '<path d="M9.4 3.2h5.2"/><path d="M10.6 3.2v6L6.8 16.8a2.2 2.2 0 0 0 2 3.2h6.4a2.2 2.2 0 0 0 2-3.2L13.4 9.2v-6"/><path d="M7.8 13.6h8.4"/>',
  doc: '<path d="M6.8 3.6h7l4 4V19a1.4 1.4 0 0 1-1.4 1.4H6.8A1.4 1.4 0 0 1 5.4 19V5a1.4 1.4 0 0 1 1.4-1.4z"/><path d="M13.8 3.6v4h4"/><path d="M9 12.4h6M9 15.8h4"/>',
  list: '<path d="M8.4 7.2h11M8.4 12h11M8.4 16.8h11"/><path d="M4.6 7.2h.2M4.6 12h.2M4.6 16.8h.2"/>',
  gauge: '<path d="M4.4 17.6a8 8 0 1 1 15.2 0"/><path d="M12 17.6 15.6 10"/>',
  ban: '<circle cx="12" cy="12" r="8"/><path d="M6.4 17.6 17.6 6.4"/>',
  child: '<circle cx="12" cy="7.4" r="2.6"/><path d="M12 10.4v5.2M12 15.6 9.2 20M12 15.6 14.8 20M8.6 12.2h6.8"/>',
  tag: '<path d="M4.6 12.4V5.8A1.2 1.2 0 0 1 5.8 4.6h6.6L19.4 11.6 12.4 18.6z"/><circle cx="8.6" cy="8.6" r="1.1"/>',
  leaf: '<path d="M5.6 18.4c0-6 4-10.4 10-10.4 0 6-4 10.4-10 10.4z"/><path d="M5.6 18.4 12.4 11.6"/>',
  send: '<path d="M20.4 3.6 3.6 10.4l6.6 2.4 2.4 6.6z"/><path d="M10.2 12.8 20.4 3.6"/>',
  user: '<circle cx="12" cy="8.4" r="3.4"/><path d="M5.4 20.4c0-3.6 3-6 6.6-6s6.6 2.4 6.6 6"/>',

  /* 营养与工具 */
  flame: '<path d="M12 3.4c3.2 3 4.8 5.7 4.8 8.3a4.8 4.8 0 0 1-9.6 0c0-2.6 1.6-5.3 4.8-8.3z"/><path d="M12 12.4c1.2 1.2 1.6 2 1.6 2.8a1.6 1.6 0 0 1-3.2 0c0-.8.4-1.6 1.6-2.8z"/>',
  drop: '<path d="M12 3.6c3 3.6 5 6 5 8.4a5 5 0 0 1-10 0c0-2.4 2-4.8 5-8.4z"/>',
  wheat: '<path d="M12 20.6V7.4"/><path d="M12 12.6 8.6 9.8M12 12.6l3.4-2.8M12 8.4 9.4 5.8M12 8.4l2.6-2.6M12 16.6l-3.2-2.4M12 16.6l3.2-2.4"/>',
  salt: '<path d="M8.4 8.6h7.2l1.2 10a1.7 1.7 0 0 1-1.7 1.9H8.9a1.7 1.7 0 0 1-1.7-1.9z"/><path d="M9.6 8.6V6.8a2.4 2.4 0 0 1 4.8 0v1.8"/><path d="M11 12.2h.2M13 12.2h.2M12 15h.2"/>',
  cube: '<path d="M12 4.4 18.6 8v8L12 19.6 5.4 16V8z"/><path d="M5.4 8 12 11.6 18.6 8M12 11.6v8"/>',
  heart: '<path d="M12 20.2c-4.4-2.6-7.4-5.4-7.4-9a3.9 3.9 0 0 1 7.4-1.7 3.9 3.9 0 0 1 7.4 1.7c0 3.6-3 6.4-7.4 9z"/>',
  history: '<path d="M4.6 12a7.4 7.4 0 1 0 2.4-5.4"/><path d="M4.2 4.8v3.6h3.6"/><path d="M12 8.4v4l2.6 1.8"/>',
  copy: '<rect x="8.4" y="8.4" width="10.2" height="10.2" rx="2"/><path d="M15.6 8.4V6.2a1.8 1.8 0 0 0-1.8-1.8H6.6a1.8 1.8 0 0 0-1.8 1.8v7.2a1.8 1.8 0 0 0 1.8 1.8h2.2"/>',
  download: '<path d="M12 3.8v10.8"/><path d="M7.8 10.8 12 15l4.2-4.2"/><path d="M4.8 17.6v1a1.6 1.6 0 0 0 1.6 1.6h11.2a1.6 1.6 0 0 0 1.6-1.6v-1"/>',
  plus: '<path d="M12 5.2v13.6M5.2 12h13.6"/>',
  minus: '<path d="M5.2 12h13.6"/>',
  sliders: '<path d="M4.6 8h8.6M17.2 8h2.2M4.6 16h3.4M12 16h7.4"/><circle cx="15" cy="8" r="2.2"/><circle cx="9.8" cy="16" r="2.2"/>',
  sticker: '<path d="M5 5.6h14v9l-4.4 4.4H5z"/><path d="M19 14.6h-4.4v4.4"/><path d="M10.6 9.2l1.3 2.6 2.7.4-2 2 .5 2.8-2.5-1.4-2.5 1.4.5-2.8-2-2 2.7-.4z"/>',
  calendar: '<rect x="4.4" y="6.2" width="15.2" height="13.4" rx="2.2"/><path d="M4.4 10.4h15.2M8.6 4.2v3.4M15.4 4.2v3.4"/>',
  trash: '<path d="M5.4 7.4h13.2"/><path d="M8.6 7.4V5.6a1.2 1.2 0 0 1 1.2-1.2h4.4a1.2 1.2 0 0 1 1.2 1.2v1.8"/><path d="M7 7.4l.8 11.4a1.4 1.4 0 0 0 1.4 1.3h5.6a1.4 1.4 0 0 0 1.4-1.3l.8-11.4"/>',
  rotate: '<path d="M19.4 12a7.4 7.4 0 0 1-12.8 5"/><path d="M4.6 12a7.4 7.4 0 0 1 12.8-5"/><path d="M17.4 3.6v3.6H20.6M6.6 20.4V16.8H3.4"/>',
  sparkles: '<path d="M9.6 3.4l1.2 3.4 3.4 1.2-3.4 1.2-1.2 3.4-1.2-3.4L5 7.9l3.4-1.2z"/><path d="M16.4 12.6l.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9z"/>',

  /* 过敏原 */
  shrimp: '<path d="M6.4 9.4c0-2.6 2.4-4.6 5.6-4.6 3.6 0 6 2.4 6 5.6 0 3.6-3 6.2-7 6.2-2.6 0-4.6-1-6-2.6"/><path d="M5.4 8.4c-.8-.8-1.6-1-2.4-.6"/><circle cx="14.6" cy="9.4" r=".9"/><path d="M5.6 14.6c1.2.6 1.6 1.6 1.2 2.8"/>',
  fish: '<path d="M4.4 12c2.6-3.4 5.6-5 8.4-5 3.2 0 5.8 2 7.8 5-2 3-4.6 5-7.8 5-2.8 0-5.8-1.6-8.4-5z"/><circle cx="16.4" cy="11" r=".9"/><path d="M4.4 12c-1-.8-1.6-1.6-1.8-2.6M4.4 12c-1 .8-1.6 1.6-1.8 2.6"/>',
  egg: '<path d="M12 3.6c3.4 0 6 4.4 6 8.4a6 6 0 0 1-12 0c0-4 2.6-8.4 6-8.4z"/><path d="M9.4 12.6c0 1.6 1.2 2.8 2.8 2.8"/>',
  peanut: '<path d="M9.4 4.6a3.4 3.4 0 0 1 3.4 3.4c0 1.6.8 2.4 2.4 2.4a3.4 3.4 0 1 1-2.4 5.8"/><path d="M9.4 4.6a3.4 3.4 0 1 0 2.4 5.8c-1.6 0-2.4.8-2.4 2.4a3.4 3.4 0 1 0 5.8 2.4"/><path d="M10.6 10.4l.2.2M13.2 13l.2.2"/>',
  soy: '<path d="M12 4.6c3.6 1.6 5.6 4.4 5.6 7.8 0 3.6-2.4 6.4-5.6 7-3.2-.6-5.6-3.4-5.6-7 0-3.4 2-6.2 5.6-7.8z"/><path d="M12 6.4v11.4M8.4 11.4h7.2M8.8 14.6h6.4"/>',
  nut: '<path d="M12 3.8c3.2 0 5.6 2.8 5.6 6.6 0 3.6-2 6.2-3.4 8.2-.8 1.2-1.4 1.6-2.2 1.6s-1.4-.4-2.2-1.6c-1.4-2-3.4-4.6-3.4-8.2 0-3.8 2.4-6.6 5.6-6.6z"/><path d="M9.4 9.6c1.4-.6 3.8-.6 5.2 0M9.4 12.8c1.4-.6 3.8-.6 5.2 0"/>'
};

/* ============================================================
 * 水果线稿
 * 与图标同一套语言：1.5 描边、圆头圆角、24 网格。
 * 只做装饰用，不承载信息。
 * ============================================================ */
const FRUIT_PATHS = {
  apple: '<path d="M12 8.4c-1.3-1.5-3.8-1.9-5.5-.3-1.8 1.7-2 4.8-.7 7.4 1 2 2.3 3.6 3.4 4.2 1 .6 1.9-.2 2.8-.2s1.8.8 2.8.2c1.1-.6 2.4-2.2 3.4-4.2 1.3-2.6 1.1-5.7-.7-7.4-1.7-1.6-4.2-1.2-5.5.3Z"/><path d="M12 8.2V4.6"/><path d="M12.3 6.1c1-.1 2-.8 2.4-1.9-1.1-.2-2.1.5-2.4 1.9Z"/>',
  pear: '<path d="M12 5c1.3 0 2.3 1 2.3 2.2 0 1.2-1 1.8-.5 3.2.7 1.8 3.4 2.6 3.4 5.2 0 2.6-2.3 4.4-5.2 4.4s-5.2-1.8-5.2-4.4c0-2.6 2.7-3.4 3.4-5.2.5-1.4-.5-2-.5-3.2C9.7 6 10.7 5 12 5Z"/><path d="M12 5V2.6"/><path d="M11.9 3.4c-.9-.2-1.6-.9-1.9-1.9"/>',
  orange: '<circle cx="12" cy="13.4" r="6.6"/><path d="M12 6.8c0-1.8.8-3 2.4-3.6"/><path d="M14.4 4.4c.9-.9 2.1-1.2 3.3-.9-.3 1.2-1.1 2.1-2.3 2.3"/>',
  strawberry: '<path d="M12 20.6c-3.9 0-7.4-4.2-7.4-8 0-2.8 2.1-4.9 4.9-5h5c2.8.1 4.9 2.2 4.9 5 0 3.8-3.5 8-7.4 8Z"/><path d="M8.5 7.6c.8-1.7 2.1-2.6 3.5-2.6s2.7.9 3.5 2.6"/><path d="M12 5V3.2"/><circle cx="10" cy="12" r=".55" fill="currentColor" stroke="none"/><circle cx="14" cy="12" r=".55" fill="currentColor" stroke="none"/><circle cx="12" cy="14.8" r=".55" fill="currentColor" stroke="none"/><circle cx="10.4" cy="17.2" r=".55" fill="currentColor" stroke="none"/><circle cx="13.6" cy="17.2" r=".55" fill="currentColor" stroke="none"/>',
  cherry: '<path d="M12 4.4C10.4 7.2 8.4 9.2 6.8 11.4"/><path d="M12 4.4c1.8 2.6 3.4 4.6 5.2 7"/><path d="M12 4.4c.1-1.2-.5-2-1.7-2.6"/><circle cx="6.4" cy="15.2" r="3.5"/><circle cx="16.9" cy="15.6" r="3.5"/>',
  tomato: '<circle cx="12" cy="13.6" r="6.6"/><path d="M12 7V4.2"/><path d="M12 7.2 9.2 5.6M12 7.2l2.8-1.6M12 7.2 9.6 8.6M12 7.2l2.4 1.4"/>',
  watermelon: '<path d="M3.8 15.8a8.2 8.2 0 0 1 16.4 0Z"/><path d="M6.8 15.8a5.2 5.2 0 0 1 10.4 0"/><circle cx="9.6" cy="12.6" r=".55" fill="currentColor" stroke="none"/><circle cx="12" cy="10.8" r=".55" fill="currentColor" stroke="none"/><circle cx="14.4" cy="12.6" r=".55" fill="currentColor" stroke="none"/>'
};

/**
 * 渲染一枚水果线稿
 * @param {string} name 水果名
 * @param {number|string} size 像素尺寸
 * @param {number} opacity 整体透明度
 * @param {number} rotate 旋转角度
 */
function fruitSVG(name, size, opacity, rotate) {
  const paths = FRUIT_PATHS[name];
  if (!paths) return '';
  const s = size || 32;
  const style = `opacity:${opacity == null ? 0.5 : opacity};${rotate ? `transform:rotate(${rotate}deg);` : ''}`;
  return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="${style}" aria-hidden="true" focusable="false">${paths}</svg>`;
}

/**
 * 一排水果，用于填补横向留白
 * @param {Array<string>} names 水果名单
 * @param {number} size 单枚尺寸
 * @param {number} opacity 透明度
 */
function fruitRowHTML(names, size, opacity) {
  const base = size || 24;
  return names.map(function (n, i) {
    /* 交替给一点角度、高低和大小差，避免排成一行图标阵列 */
    const tilt = (i % 3 === 0) ? -5 : (i % 3 === 1 ? 3 : -2);
    const drop = [0, 4, 1, 6][i % 4];
    const grow = [0, 4, -3, 2][i % 4];
    return `<span class="fruit-item" style="transform:translateY(${drop}px)">${fruitSVG(n, base + grow, opacity, tilt)}</span>`;
  }).join('');
}

/**
 * 把页面里的水果占位渲染成 SVG
 * 用法：data-fruit="apple" 单枚；data-fruit-row="apple,pear" 一排
 * 可选 data-size / data-opacity / data-rotate
 */
function renderFruitDeco(root) {
  const scope = root || document;
  scope.querySelectorAll('[data-fruit]').forEach(function (el) {
    el.innerHTML = fruitSVG(
      el.dataset.fruit,
      Number(el.dataset.size) || 32,
      el.dataset.opacity == null ? 0.45 : Number(el.dataset.opacity),
      Number(el.dataset.rotate) || 0
    );
  });
  scope.querySelectorAll('[data-fruit-row]').forEach(function (el) {
    el.innerHTML = fruitRowHTML(
      el.dataset.fruitRow.split(',').map(function (s) { return s.trim(); }),
      Number(el.dataset.size) || 24,
      el.dataset.opacity == null ? 0.4 : Number(el.dataset.opacity)
    );
  });
}

/**
 * 生成图标 SVG 字符串
 * @param {string} name 图标名
 * @param {number|string} size 尺寸，默认 1em（随字号）
 */
function svgIcon(name, size) {
  const paths = ICON_PATHS[name];
  if (!paths) return '';
  const s = size || '1em';
  return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
}

/**
 * 把页面中所有 [data-icon] 占位替换为 SVG
 */
function renderIcons(root) {
  const scope = root || document;
  scope.querySelectorAll('[data-icon]').forEach(function (el) {
    if (el.dataset.iconDone === '1') return;
    el.innerHTML = svgIcon(el.dataset.icon, el.dataset.iconSize || '1em');
    el.dataset.iconDone = '1';
  });
}

/**
 * 可爱点缀：实验室烧瓶小伙伴
 */
function mascotSVG(size) {
  const s = size || 72;
  return `<svg viewBox="0 0 80 80" width="${s}" height="${s}" fill="none" aria-hidden="true" focusable="false">
    <path d="M34 12v18L18.5 62a9 9 0 0 0 8 13h27a9 9 0 0 0 8-13L46 30V12" fill="#E8F3EC" stroke="#3A7D44" stroke-width="3" stroke-linejoin="round"/>
    <path d="M29.5 12h21" stroke="#3A7D44" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M24.5 51h31" stroke="#3A7D44" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="34" cy="43.5" r="2.4" fill="#3A7D44"/>
    <circle cx="46" cy="43.5" r="2.4" fill="#3A7D44"/>
    <path d="M35.6 49.4c1.8 2.2 7 2.2 8.8 0" stroke="#3A7D44" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="27" cy="33" r="3" fill="#C08A2E" opacity=".55"/>
    <circle cx="53" cy="26" r="2.2" fill="#C08A2E" opacity=".4"/>
  </svg>`;
}

/**
 * 手绘感小叶与水果，用于页脚装饰
 * 直接复用水果线稿，保证和界面里的小图标是同一套画法
 */
function leavesDoodle(size) {
  const s = size || 90;
  const w = Math.round(s * 1.72);
  return `<svg viewBox="0 0 172 100" width="${w}" height="${s}" fill="none" aria-hidden="true" focusable="false">
    <path d="M18 74c0-16 12-28 30-28 0 16-12 28-30 28z" fill="#DCEBD9" stroke="#8FB492" stroke-width="1.6"/>
    <path d="M18 74 40 52" stroke="#8FB492" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M44 86c0-12 9-21 22-21 0 12-9 21-22 21z" fill="#F3E7C8" stroke="#CBB07A" stroke-width="1.6"/>
    <path d="M44 86 60 70" stroke="#CBB07A" stroke-width="1.6" stroke-linecap="round"/>
    <g transform="translate(86 30) scale(2.2)" stroke="#9DBE9F" stroke-width="0.72" stroke-linecap="round" stroke-linejoin="round">${FRUIT_PATHS.apple}</g>
    <g transform="translate(136 44) scale(1.6)" stroke="#CBB07A" stroke-width="0.95" stroke-linecap="round" stroke-linejoin="round">${FRUIT_PATHS.cherry}</g>
  </svg>`;
}
