import { createSeedData } from './data.js';
import {
  SHIFT_PERIODS, ROLE_META, can, roleName, filterEmployees, sortEmployees,
  validateEmployee, hasShiftConflict, computeStats, addDays, dateKey,
  getWeekStart, weekDates, formatDate, formatFullDate, formatWeekRange,
  formatCurrency, formatDateTime, tenureText, initials, escapeHtml,
  shiftMeta, employeeStatus, parseDateKey,
} from './core.js';

const DB_KEY = 'meiti_employee_system_v1';
const SESSION_KEY = 'meiti_employee_session';
const SESSION_MAX_AGE = 8 * 60 * 60 * 1000;

const DEMO_ACCOUNTS = {
  hr: { username: 'hr.wang', password: 'Hr@2026' },
  supervisor: { username: 'supervisor.chen', password: 'Shift@2026' },
  employee: { username: 'employee.li', password: 'Staff@2026' },
};

const PAGE_INFO = {
  dashboard: { title: '门店概览', eyebrow: '工作台' },
  employees: { title: '员工档案', eyebrow: '人员管理' },
  departments: { title: '部门概览', eyebrow: '组织信息' },
  schedule: { title: '排班管理', eyebrow: '班次安排' },
  statistics: { title: '人员统计', eyebrow: '数据分析' },
  inventory: { title: '库存查看', eyebrow: '门店运营' },
  permissions: { title: '角色与权限', eyebrow: '系统管理' },
  audit: { title: '操作记录', eyebrow: '系统管理' },
  profile: { title: '我的资料', eyebrow: '个人中心' },
  'my-schedule': { title: '我的班次', eyebrow: '个人中心' },
};

const NAV_ITEMS = {
  hr: [
    ['dashboard', 'layout-dashboard', '门店概览'],
    ['employees', 'users', '员工档案'],
    ['departments', 'building', '部门概览'],
    ['schedule', 'calendar', '班次查看'],
    ['statistics', 'chart', '人员统计'],
    ['permissions', 'shield', '角色与权限'],
    ['audit', 'history', '操作记录'],
  ],
  supervisor: [
    ['dashboard', 'layout-dashboard', '门店概览'],
    ['employees', 'users', '员工查询'],
    ['schedule', 'calendar', '排班管理'],
    ['statistics', 'chart', '人员统计'],
    ['inventory', 'boxes', '库存查看'],
    ['audit', 'history', '操作记录'],
  ],
  employee: [
    ['profile', 'badge', '我的资料'],
    ['my-schedule', 'calendar', '我的班次'],
  ],
};

const ICON_PATHS = {
  'layout-dashboard': '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="m3 3 18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a18.7 18.7 0 0 1-3.1 4.2"/><path d="M6.6 6.6C3.6 8.4 2 12 2 12s3.5 8 10 8a10.7 10.7 0 0 0 4.4-.9"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  badge: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17c.7-2 2-3 4-3s3.3 1 4 3"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 21v-4h6v4M8 7h1M15 7h1M8 11h1M15 11h1"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/>',
  boxes: '<path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z"/><path d="m4 6.5 8 4.5 8-4.5M12 11v9"/><path d="m8 4.5 8 4.5"/>',
  shield: '<path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
  'arrow-up': '<path d="m18 15-6-6-6 6"/>',
  'arrow-down': '<path d="m6 9 6 6 6-6"/>',
  sort: '<path d="m8 9 4-4 4 4M16 15l-4 4-4-4"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  alert: '<path d="M10.3 3.4 2.5 18a2 2 0 0 0 1.8 3h15.4a2 2 0 0 0 1.8-3L13.7 3.4a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2.1Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  'map-pin': '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
  wallet: '<path d="M20 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V5"/><path d="M16 13h3"/>',
  activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  package: '<path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z"/><path d="m4 6.5 8 4.5 8-4.5M12 11v9"/>',
  'clipboard-list': '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"/>',
  sparkles: '<path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3ZM5 14l.7 2.3L8 17l-2.3.7L5 20l-.7-2.3L2 17l2.3-.7L5 14ZM19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z"/>',
  filter: '<path d="M4 5h16M7 12h10M10 19h4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
};

const appEl = document.getElementById('appView');
const loginView = document.getElementById('loginView');
const mainContent = document.getElementById('mainContent');
const sideNav = document.getElementById('sideNav');
const modalRoot = document.getElementById('modalRoot');
const toastRoot = document.getElementById('toastRoot');

const state = {
  db: null,
  user: null,
  page: 'dashboard',
  employeeSort: { key: 'name', direction: 'asc' },
  employeeQuery: '',
  employeeDepartment: '',
  employeeStatus: '',
  scheduleWeek: dateKey(getWeekStart(new Date())),
  scheduleEmployee: '',
  inventoryCategory: '',
};

function icon(name, size = 18) {
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name] ?? ICON_PATHS.info}</svg>`;
}

function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((element) => {
    element.innerHTML = icon(element.dataset.icon, Number(element.dataset.size || 18));
  });
}

function loadDatabase() {
  try {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.version === 1 && Array.isArray(parsed.employees)) return parsed;
    }
  } catch (error) {
    console.warn('无法读取本地数据，将使用初始数据。', error);
  }
  const seeded = createSeedData();
  localStorage.setItem(DB_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveDatabase() {
  localStorage.setItem(DB_KEY, JSON.stringify(state.db));
}

function findUser(id) {
  return state.db.users.find((user) => user.id === id) ?? null;
}

function getEmployee(id) {
  return state.db.employees.find((employee) => employee.id === id) ?? null;
}

function getDepartment(id) {
  return state.db.departments.find((department) => department.id === id) ?? null;
}

function defaultPage(role) {
  if (role === 'employee') return 'profile';
  return 'dashboard';
}

function canVisit(page) {
  if (!state.user) return false;
  if (page === 'dashboard' || page === 'statistics' || page === 'audit') {
    return state.user.role === 'hr' || state.user.role === 'supervisor';
  }
  if (page === 'employees' || page === 'departments' || page === 'schedule') {
    return can(state.user.role, 'employee:read') || state.user.role === 'hr';
  }
  if (page === 'inventory') return can(state.user.role, 'inventory:read');
  if (page === 'permissions') return can(state.user.role, 'accounts:read');
  if (page === 'profile' || page === 'my-schedule') return state.user.role === 'employee';
  return false;
}

function pageFromHash() {
  return location.hash.replace(/^#\/?/, '') || defaultPage(state.user?.role);
}

async function hashPassword(password, salt) {
  const bytes = new TextEncoder().encode(`${salt}${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function restoreSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    if (!saved || Date.now() - Number(saved.at) > SESSION_MAX_AGE) return null;
    return findUser(saved.userId);
  } catch {
    return null;
  }
}

function storeSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, at: Date.now() }));
}

function showApp(user) {
  state.user = user;
  loginView.hidden = true;
  appEl.hidden = false;
  renderSidebarUser();
  renderNavigation();
  updateTopbar();
  const requestedPage = pageFromHash();
  navigate(canVisit(requestedPage) ? requestedPage : defaultPage(user.role), { replaceHash: true });
}

function showLogin() {
  state.user = null;
  sessionStorage.removeItem(SESSION_KEY);
  appEl.hidden = true;
  loginView.hidden = false;
  closeModal();
  document.getElementById('loginMessage').classList.remove('is-visible');
  document.getElementById('loginForm').reset();
  history.replaceState(null, '', location.pathname + location.search);
  setTimeout(() => document.getElementById('username')?.focus(), 100);
}

function renderSidebarUser() {
  const employee = getEmployee(state.user.employeeId);
  document.getElementById('sidebarAvatar').textContent = initials(state.user.displayName);
  document.getElementById('sidebarUserName').textContent = state.user.displayName;
  document.getElementById('sidebarUserRole').textContent = roleName(state.user.role);
  if (employee) document.getElementById('sidebarAvatar').title = employee.name;
}

function renderNavigation() {
  const items = NAV_ITEMS[state.user.role] ?? [];
  sideNav.innerHTML = `
    <p class="nav-group-label">${state.user.role === 'employee' ? '个人中心' : '日常管理'}</p>
    ${items.map(([page, iconName, label]) => `
      <button class="nav-item ${state.page === page ? 'is-active' : ''}" type="button" data-action="navigate" data-page="${page}">
        ${icon(iconName, 19)}<span>${label}</span>
      </button>
    `).join('')}
  `;
}

function updateTopbar() {
  const info = PAGE_INFO[state.page] ?? PAGE_INFO.dashboard;
  document.getElementById('pageTitle').textContent = info.title;
  document.getElementById('pageEyebrow').textContent = info.eyebrow;
  document.getElementById('todayLabel').textContent = formatFullDate(new Date());
  const meta = ROLE_META[state.user.role];
  const pill = document.getElementById('rolePill');
  pill.textContent = meta.fullName;
  pill.dataset.tone = meta.tone;

  let notificationCount = 0;
  if (state.user.role === 'supervisor') {
    notificationCount = state.db.restockRequests.filter((item) => item.status === 'pending').length;
  } else if (state.user.role === 'hr') {
    notificationCount = state.db.employees.filter((item) => item.status === 'leave').length;
  } else {
    const today = dateKey(new Date());
    notificationCount = state.db.shifts.filter((item) => item.employeeId === state.user.employeeId && item.date >= today).length;
  }
  document.getElementById('notificationDot').classList.toggle('is-visible', notificationCount > 0);
}

function navigate(page, { replaceHash = false } = {}) {
  if (!canVisit(page)) {
    toast('当前账号没有访问该页面的权限。', 'error');
    page = defaultPage(state.user.role);
  }
  state.page = page;
  const hash = `#/${page}`;
  if (location.hash !== hash) {
    if (replaceHash) history.replaceState(null, '', hash);
    else history.pushState(null, '', hash);
  }
  renderNavigation();
  updateTopbar();
  renderPage();
  closeMobileSidebar();
  mainContent.focus({ preventScroll: true });
}

function renderPage() {
  switch (state.page) {
    case 'dashboard': renderDashboard(); break;
    case 'employees': renderEmployeesPage(); break;
    case 'departments': renderDepartmentsPage(); break;
    case 'schedule': renderSchedulePage(); break;
    case 'statistics': renderStatisticsPage(); break;
    case 'inventory': renderInventoryPage(); break;
    case 'permissions': renderPermissionsPage(); break;
    case 'audit': renderAuditPage(); break;
    case 'profile': renderProfilePage(); break;
    case 'my-schedule': renderMySchedulePage(); break;
    default: renderDashboard();
  }
  hydrateIcons(mainContent);
}

function pageHeading(title, description, actions = '') {
  return `
    <div class="page-heading">
      <div class="page-heading__copy">
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(description)}</p>
      </div>
      ${actions ? `<div class="page-actions">${actions}</div>` : ''}
    </div>
  `;
}

function kpiCard({ label, value, unit = '', meta = '', iconName, tone = 'green' }) {
  return `
    <article class="kpi-card" data-tone="${tone}">
      <div class="kpi-card__top">
        <span class="kpi-card__label">${escapeHtml(label)}</span>
        <span class="kpi-card__icon">${icon(iconName)}</span>
      </div>
      <div class="kpi-card__value">${escapeHtml(String(value))}${unit ? `<small>${escapeHtml(unit)}</small>` : ''}</div>
      <div class="kpi-card__meta">${meta}</div>
    </article>
  `;
}

function employeeOptions(selectedId = '', activeOnly = false) {
  return state.db.employees
    .filter((employee) => !activeOnly || employee.status === 'active')
    .map((employee) => `<option value="${employee.id}" ${employee.id === selectedId ? 'selected' : ''}>${escapeHtml(employee.name)} · ${escapeHtml(employee.position)}</option>`)
    .join('');
}

function departmentOptions(selectedId = '') {
  return state.db.departments
    .map((department) => `<option value="${department.id}" ${department.id === selectedId ? 'selected' : ''}>${escapeHtml(department.name)}</option>`)
    .join('');
}

function renderDashboard() {
  const stats = computeStats(state.db.employees, state.db.departments, state.db.shifts);
  const today = dateKey(new Date());
  const todayShifts = state.db.shifts.filter((shift) => shift.date === today);
  const pendingRequests = state.db.restockRequests.filter((request) => request.status === 'pending');
  const maxDepartment = Math.max(...stats.departmentCounts.map((item) => item.count), 1);
  const roleCopy = state.user.role === 'hr'
    ? '员工档案和人员变动都汇总在这里，今天可以优先处理待返岗人员和资料维护。'
    : '班次和现场人员状态都汇总在这里，今天可以优先检查晚班覆盖和补货事项。';
  const periodRows = SHIFT_PERIODS.map((period) => {
    const shifts = todayShifts.filter((shift) => shift.period === period.id);
    const names = shifts.map((shift) => getEmployee(shift.employeeId)?.name).filter(Boolean);
    return `
      <div class="today-shift">
        <span class="today-shift__time">${period.shortTime}</span>
        <div class="today-shift__people">
          <span class="avatar" style="width:25px;height:25px;flex-basis:25px;font-size:8px">${names[0] ? initials(names[0]) : '—'}</span>
          <span>${names.length ? names.map(escapeHtml).join('、') : '暂未安排'}</span>
        </div>
        <span class="today-shift__count">${shifts.length} 人</span>
      </div>
    `;
  }).join('');

  mainContent.innerHTML = `
    ${pageHeading(
      `${greeting()}，${state.user.displayName}`,
      roleCopy,
      `<button class="button" type="button" data-action="navigate" data-page="${state.user.role === 'hr' ? 'employees' : 'schedule'}">${icon(state.user.role === 'hr' ? 'users' : 'calendar')} ${state.user.role === 'hr' ? '查看员工档案' : '查看本周排班'}</button>`,
    )}
    <div class="grid grid--kpis">
      ${kpiCard({ label: '员工总数', value: stats.total, unit: '人', meta: `本月新增 <b>2 人</b>`, iconName: 'users' })}
      ${kpiCard({ label: '当前在职', value: stats.active, unit: '人', meta: `休假 ${stats.leave} 人 · 离职 ${stats.inactive} 人`, iconName: 'user-check', tone: 'blue' })}
      ${kpiCard({ label: '本周班次', value: stats.weeklyShifts, unit: '班', meta: `覆盖 <b>${new Set(state.db.shifts.map((item) => item.employeeId)).size} 名员工</b>`, iconName: 'calendar', tone: 'amber' })}
      ${kpiCard({ label: '待补货申请', value: pendingRequests.length, unit: '项', meta: pendingRequests.length ? '仓储组正在跟进' : '当前没有待处理事项', iconName: 'clipboard-list', tone: 'red' })}
    </div>
    <div class="grid grid--dashboard">
      <div class="dashboard-stack">
        <section class="card">
          <div class="card-header">
            <div><h3>部门人员分布</h3><p>按当前员工档案统计</p></div>
            <button class="card-link" type="button" data-action="navigate" data-page="departments">查看部门 ${icon('chevron-right', 15)}</button>
          </div>
          <div class="card-body">
            <div class="chart-bars">
              ${stats.departmentCounts.map((department, index) => `
                <div>
                  <div class="chart-bar__head"><span>${escapeHtml(department.name)}</span><span>${department.count} 人 · 在职 ${department.activeCount} 人</span></div>
                  <div class="chart-bar__track"><div class="chart-bar__fill" data-color="${['green', 'amber', 'blue', 'brown'][index]}" style="width:${Math.max(8, department.count / maxDepartment * 100)}%"></div></div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
        <section class="card">
          <div class="card-header">
            <div><h3>今日班次</h3><p>${escapeHtml(formatFullDate(new Date()))}</p></div>
            <button class="card-link" type="button" data-action="navigate" data-page="schedule">整周排班 ${icon('chevron-right', 15)}</button>
          </div>
          <div class="card-body"><div class="today-shifts">${periodRows}</div></div>
        </section>
      </div>
      <div class="dashboard-stack">
        <section class="card">
          <div class="card-header">
            <div><h3>待处理补货</h3><p>来自仓储组的补货申请</p></div>
            <button class="card-link" type="button" data-action="navigate" data-page="inventory">查看全部 ${icon('chevron-right', 15)}</button>
          </div>
          <div class="card-body">
            ${pendingRequests.length ? `<ul class="list-clean">${pendingRequests.slice(0, 4).map((request) => {
              const item = state.db.inventory.find((product) => product.sku === request.sku);
              return `<li class="request-item"><span class="request-item__icon">${icon('package', 17)}</span><span class="request-item__copy"><strong>${escapeHtml(item?.name ?? request.sku)}</strong><small>${escapeHtml(request.requestedBy)} · ${formatDateTime(request.requestedAt)}</small></span><span class="request-item__qty">+${request.requestedQty} ${escapeHtml(item?.unit ?? '')}</span></li>`;
            }).join('')}</ul>` : '<div class="empty-inline">暂无待处理申请</div>'}
          </div>
        </section>
        <section class="card">
          <div class="card-header">
            <div><h3>最近操作</h3><p>员工与班次变更记录</p></div>
            <button class="card-link" type="button" data-action="navigate" data-page="audit">全部记录 ${icon('chevron-right', 15)}</button>
          </div>
          <div class="card-body">
            <div class="audit-list">
              ${state.db.auditLogs.slice(0, 3).map((log) => auditItem(log)).join('')}
            </div>
          </div>
        </section>
      </div>
    </div>
  `;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

function auditItem(log) {
  const user = findUser(log.userId);
  const markIcon = log.entity === 'employee' ? 'users' : log.entity === 'shift' ? 'calendar' : 'shield';
  return `
    <div class="audit-item">
      <span class="audit-item__mark">${icon(markIcon, 13)}</span>
      <div class="audit-item__copy"><strong>${escapeHtml(log.summary)}</strong><small>${escapeHtml(user?.displayName ?? '系统')} · ${escapeHtml(roleName(user?.role ?? 'employee'))}</small></div>
      <time>${formatDateTime(log.at)}</time>
    </div>
  `;
}

function renderEmployeesPage() {
  const canAdd = can(state.user.role, 'employee:create');
  const canExport = can(state.user.role, 'export:employees');
  mainContent.innerHTML = `
    ${pageHeading(
      '员工档案',
      state.user.role === 'hr' ? '新增、编辑和搜索员工资料，变更会保存在当前浏览器中。' : '按姓名、工号、部门或状态查询员工，当前角色为只读权限。',
      `${canExport ? `<button class="button" type="button" data-action="export-employees">${icon('download')} 导出名单</button>` : ''}
       ${canAdd ? `<button class="button button--primary" type="button" data-action="open-employee-form">${icon('plus')} 添加员工</button>` : ''}`,
    )}
    <section class="card card--flush">
      <div class="toolbar">
        <label class="search-box">
          <span class="sr-only"></span>
          ${icon('search')}
          <input id="employeeSearch" type="search" placeholder="搜索姓名、工号、电话或岗位" value="${escapeHtml(state.employeeQuery)}" autocomplete="off">
        </label>
        <select class="select-control" id="employeeDepartment" aria-label="按部门筛选">
          <option value="">全部部门</option>
          ${state.db.departments.map((department) => `<option value="${department.id}" ${department.id === state.employeeDepartment ? 'selected' : ''}>${escapeHtml(department.name)}</option>`).join('')}
        </select>
        <select class="select-control" id="employeeStatus" aria-label="按状态筛选">
          <option value="">全部状态</option>
          <option value="active" ${state.employeeStatus === 'active' ? 'selected' : ''}>在职</option>
          <option value="leave" ${state.employeeStatus === 'leave' ? 'selected' : ''}>休假</option>
          <option value="inactive" ${state.employeeStatus === 'inactive' ? 'selected' : ''}>离职</option>
        </select>
        <button class="button button--ghost" type="button" data-action="clear-employee-filters">重置</button>
        <span class="result-count" id="employeeResultCount"></span>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              ${employeeSortHeader('name', '员工')}
              ${employeeSortHeader('departmentId', '部门 / 岗位')}
              <th>联系方式</th>
              ${employeeSortHeader('hourlyRate', '时薪')}
              <th>入职日期</th>
              ${employeeSortHeader('status', '状态')}
              <th><span style="float:right">操作</span></th>
            </tr>
          </thead>
          <tbody id="employeeTableBody"></tbody>
        </table>
      </div>
      <div class="table-footer">
        <span id="employeeTableFooter"></span>
        <span class="table-footer__hint">${icon('info', 14)} 此处为演示数据，可随时重置</span>
      </div>
    </section>
  `;
  updateEmployeeTable();
}

function employeeSortHeader(key, label) {
  const active = state.employeeSort.key === key;
  const iconName = active ? (state.employeeSort.direction === 'asc' ? 'arrow-up' : 'arrow-down') : 'sort';
  return `<th><button type="button" data-action="sort-employees" data-sort="${key}">${label} ${icon(iconName, 12)}</button></th>`;
}

function currentEmployeeRows() {
  const filtered = filterEmployees(state.db.employees, {
    query: state.employeeQuery,
    departmentId: state.employeeDepartment,
    status: state.employeeStatus,
  });
  return sortEmployees(filtered, state.employeeSort.key, state.employeeSort.direction);
}

function updateEmployeeTable() {
  const tableBody = document.getElementById('employeeTableBody');
  if (!tableBody) return;
  const employees = currentEmployeeRows();
  const canEdit = can(state.user.role, 'employee:update');
  const canDelete = can(state.user.role, 'employee:delete');

  tableBody.innerHTML = employees.length ? employees.map((employee) => {
    const department = getDepartment(employee.departmentId);
    const status = employeeStatus(employee.status);
    return `
      <tr>
        <td>
          <div class="employee-cell">
            <span class="avatar">${escapeHtml(initials(employee.name))}</span>
            <span class="employee-cell__copy"><strong>${escapeHtml(employee.name)}</strong><small>${escapeHtml(employee.employeeNo)}</small></span>
          </div>
        </td>
        <td><span class="cell-primary">${escapeHtml(department?.name ?? '未分配')}</span><span class="cell-secondary">${escapeHtml(employee.position)}</span></td>
        <td><span class="cell-primary">${escapeHtml(employee.phone)}</span><span class="cell-secondary">${escapeHtml(employee.email)}</span></td>
        <td><span class="cell-primary">${formatCurrency(employee.hourlyRate)}</span><span class="cell-secondary">每小时</span></td>
        <td>${escapeHtml(employee.hireDate)}</td>
        <td><span class="badge" data-tone="${status.tone}">${status.label}</span></td>
        <td>
          <div class="row-actions">
            <button class="icon-button" type="button" data-action="view-employee" data-id="${employee.id}" aria-label="查看 ${escapeHtml(employee.name)}" title="查看">${icon('eye', 15)}</button>
            ${canEdit ? `<button class="icon-button" type="button" data-action="open-employee-form" data-id="${employee.id}" aria-label="编辑 ${escapeHtml(employee.name)}" title="编辑">${icon('edit', 15)}</button>` : ''}
            ${canDelete ? `<button class="icon-button is-danger" type="button" data-action="delete-employee" data-id="${employee.id}" aria-label="删除 ${escapeHtml(employee.name)}" title="删除">${icon('trash', 15)}</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('') : `
    <tr><td colspan="7"><div class="empty-state"><span class="empty-state__icon">${icon('search', 26)}</span><h3>没有找到匹配的员工</h3><p>调整搜索词或筛选条件后再试。</p><button class="button" type="button" data-action="clear-employee-filters">清除筛选</button></div></td></tr>
  `;

  const count = employees.length;
  const total = state.db.employees.length;
  const result = document.getElementById('employeeResultCount');
  const footer = document.getElementById('employeeTableFooter');
  if (result) result.textContent = `显示 ${count} / ${total} 人`;
  if (footer) footer.textContent = count === total ? `共 ${total} 名员工` : `已筛选 ${count} 名员工，共 ${total} 名`;
  hydrateIcons(tableBody);
}

function renderDepartmentsPage() {
  const stats = computeStats(state.db.employees, state.db.departments, state.db.shifts);
  mainContent.innerHTML = `
    ${pageHeading('部门概览', '查看各部门当前人员、负责主管与基础人力成本。部门调整通过员工档案完成。')}
    <div class="department-grid">
      ${stats.departmentCounts.map((department) => {
        const manager = getEmployee(department.managerId);
        return `
          <article class="department-card" style="--department-color:${department.color}">
            <div class="department-card__top">
              <div class="department-card__title">
                <span class="department-card__mark">${escapeHtml(department.name.slice(0, 1))}</span>
                <div><h3>${escapeHtml(department.name)}</h3><p>${department.activeCount} 人在职</p></div>
              </div>
              <span class="department-card__count">${department.count}<small> 人</small></span>
            </div>
            <p class="department-card__desc">${escapeHtml(department.description)}</p>
            <div class="department-card__meta">
              <div class="department-card__manager">
                <span class="avatar" style="width:29px;height:29px;flex-basis:29px;font-size:9px">${manager ? escapeHtml(initials(manager.name)) : '—'}</span>
                <span><small>负责主管</small>${escapeHtml(manager?.name ?? '待指定')}</span>
              </div>
              <div class="department-card__pay">合计时薪<strong>${formatCurrency(department.payroll)}</strong></div>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function renderSchedulePage() {
  if (state.user.role === 'employee') {
    renderMySchedulePage();
    return;
  }
  const start = parseDateKey(state.scheduleWeek);
  const days = weekDates(start);
  const canAssign = can(state.user.role, 'schedule:create');
  const canAuto = can(state.user.role, 'schedule:auto');
  const weekShifts = state.db.shifts.filter((shift) => days.includes(shift.date));
  const filteredShifts = state.scheduleEmployee
    ? weekShifts.filter((shift) => shift.employeeId === state.scheduleEmployee)
    : weekShifts;

  mainContent.innerHTML = `
    ${pageHeading(
      '排班管理',
      canAssign ? '按周查看门店三个班次，点击空白时段即可分配人员。' : '按周查看门店三个班次和当班人员，当前角色为只读权限。',
      `${canAuto ? `<button class="button" type="button" data-action="auto-schedule">${icon('sparkles')} 智能补齐</button>` : ''}
       ${canAssign ? `<button class="button button--primary" type="button" data-action="open-shift-form">${icon('plus')} 分配班次</button>` : ''}`,
    )}
    <div class="week-toolbar">
      <div class="week-stepper">
        <button class="icon-button" type="button" data-action="previous-week" aria-label="上一周">${icon('chevron-left')}</button>
        <span class="week-stepper__label">${escapeHtml(formatWeekRange(start))}</span>
        <button class="icon-button" type="button" data-action="next-week" aria-label="下一周">${icon('chevron-right')}</button>
      </div>
      <button class="button" type="button" data-action="current-week">本周</button>
      <select class="select-control" id="scheduleEmployee" aria-label="按员工筛选">
        <option value="">全部员工</option>
        ${state.db.employees.filter((employee) => employee.status !== 'inactive').map((employee) => `<option value="${employee.id}" ${state.scheduleEmployee === employee.id ? 'selected' : ''}>${escapeHtml(employee.name)}</option>`).join('')}
      </select>
      <div class="schedule-legend">
        ${SHIFT_PERIODS.map((period) => `<span class="legend-item" data-period="${period.id}"><i></i>${period.name}</span>`).join('')}
      </div>
    </div>
    <section class="card schedule-card">
      <div style="overflow-x:auto">
        <div class="schedule-grid">
          <div class="schedule-grid__head">
            <div class="schedule-day-head"><strong>班次</strong><small>时段</small></div>
            ${days.map((day) => {
              const date = parseDateKey(day);
              const label = new Intl.DateTimeFormat('zh-CN', { weekday: 'short' }).format(date);
              return `<div class="schedule-day-head ${day === dateKey(new Date()) ? 'is-today' : ''}"><strong>${label}</strong><small>${formatDate(day)}</small></div>`;
            }).join('')}
          </div>
          ${SHIFT_PERIODS.map((period) => `
            <div class="schedule-grid__row" data-period="${period.id}">
              <div class="schedule-period"><i class="schedule-period__mark"></i><div><strong>${period.name}</strong><small>${period.time}</small></div></div>
              ${days.map((day) => {
                const cellShifts = filteredShifts.filter((shift) => shift.date === day && shift.period === period.id);
                return `
                  <div class="schedule-cell ${day === dateKey(new Date()) ? 'is-today' : ''}">
                    ${cellShifts.map((shift) => scheduleChip(shift)).join('')}
                    ${canAssign && !state.scheduleEmployee ? `<button class="add-shift-button" type="button" data-action="open-shift-form" data-date="${day}" data-period="${period.id}">${icon('plus', 12)} 分配</button>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          `).join('')}
        </div>
      </div>
      <div class="schedule-summary">
        <span>本周共 <b>${weekShifts.length}</b> 个班次</span>
        <span>已安排 <b>${new Set(weekShifts.map((shift) => shift.employeeId)).size}</b> 名员工</span>
        <span>平均每班 <b>${(weekShifts.length / 21).toFixed(1)}</b> 人</span>
      </div>
    </section>
  `;
}

function scheduleChip(shift) {
  const employee = getEmployee(shift.employeeId);
  return `
    <button class="shift-chip" type="button" data-action="open-shift-detail" data-id="${shift.id}" title="${escapeHtml(employee?.name ?? '')} · ${escapeHtml(shift.station || shiftMeta(shift.period).name)}">
      <span class="avatar">${escapeHtml(initials(employee?.name ?? ''))}</span>
      <span class="shift-chip__copy"><strong>${escapeHtml(employee?.name ?? '未知员工')}</strong><small>${escapeHtml(shift.station || shiftMeta(shift.period).name)}</small></span>
    </button>
  `;
}

function renderMySchedulePage() {
  const start = parseDateKey(state.scheduleWeek);
  const days = weekDates(start);
  const myShifts = state.db.shifts.filter((shift) => shift.employeeId === state.user.employeeId);
  const weekShifts = myShifts.filter((shift) => days.includes(shift.date));
  const totalHours = weekShifts.length * 6;
  mainContent.innerHTML = `
    ${pageHeading('我的班次', '查看本人本周班次。如需调整，请与门店主管联系。')}
    <div class="week-toolbar">
      <div class="week-stepper">
        <button class="icon-button" type="button" data-action="previous-week" aria-label="上一周">${icon('chevron-left')}</button>
        <span class="week-stepper__label">${escapeHtml(formatWeekRange(start))}</span>
        <button class="icon-button" type="button" data-action="next-week" aria-label="下一周">${icon('chevron-right')}</button>
      </div>
      <button class="button" type="button" data-action="current-week">回到本周</button>
    </div>
    <div class="grid grid--kpis">
      ${kpiCard({ label: '本周班次', value: weekShifts.length, unit: '班', meta: '按已发布排班统计', iconName: 'calendar' })}
      ${kpiCard({ label: '预计工时', value: totalHours, unit: '小时', meta: '每班按 6 小时计算', iconName: 'clock', tone: 'blue' })}
      ${kpiCard({ label: '下一个班次', value: nextShiftLabel(myShifts), unit: '', meta: '以门店最新排班为准', iconName: 'activity', tone: 'amber' })}
    </div>
    <div class="self-schedule-grid">
      ${days.map((day) => {
        const shifts = weekShifts.filter((shift) => shift.date === day);
        const date = parseDateKey(day);
        return `
          <article class="self-day ${day === dateKey(new Date()) ? 'is-today' : ''}">
            <div class="self-day__head"><strong>${new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(date)}</strong><small>${formatDate(day)}</small></div>
            ${shifts.length ? shifts.map((shift) => {
              const period = shiftMeta(shift.period);
              return `<div class="self-shift" data-period="${period.id}"><strong>${period.name}</strong><span>${period.time}</span><br><span>${escapeHtml(shift.station || '门店值班')}</span></div>`;
            }).join('') : '<div class="self-day__empty">无排班</div>'}
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function nextShiftLabel(shifts) {
  const today = dateKey(new Date());
  const upcoming = shifts.filter((shift) => shift.date >= today).sort((a, b) => `${a.date}${a.period}`.localeCompare(`${b.date}${b.period}`))[0];
  if (!upcoming) return '暂无';
  return `${formatDate(upcoming.date)} ${shiftMeta(upcoming.period).name}`;
}

function renderStatisticsPage() {
  const stats = computeStats(state.db.employees, state.db.departments, state.db.shifts);
  const statusTotal = Math.max(stats.total, 1);
  const activePct = Math.round(stats.statusCounts.active / statusTotal * 100);
  const leavePct = Math.round(stats.statusCounts.leave / statusTotal * 100);
  const inactivePct = Math.max(0, 100 - activePct - leavePct);
  const maxDept = Math.max(...stats.departmentCounts.map((item) => item.count), 1);
  const maxPayroll = Math.max(...stats.departmentCounts.map((item) => item.payroll), 1);
  const weekStart = parseDateKey(dateKey(getWeekStart(new Date())));
  const week = weekDates(weekStart);
  const weekShifts = state.db.shifts.filter((shift) => week.includes(shift.date));
  const periodCounts = SHIFT_PERIODS.map((period) => ({
    ...period,
    count: weekShifts.filter((shift) => shift.period === period.id).length,
  }));

  mainContent.innerHTML = `
    ${pageHeading('人员统计', '从部门分布、员工状态和本周班次覆盖情况了解门店人力。')}
    <div class="grid grid--kpis">
      ${kpiCard({ label: '员工总数', value: stats.total, unit: '人', meta: `平均时薪 <b>${formatCurrency(stats.averageRate)}</b>`, iconName: 'users' })}
      ${kpiCard({ label: '在职率', value: activePct, unit: '%', meta: `${stats.active} 名员工当前在岗`, iconName: 'activity', tone: 'blue' })}
      ${kpiCard({ label: '休假员工', value: stats.leave, unit: '人', meta: '需关注返岗日期', iconName: 'calendar', tone: 'amber' })}
      ${kpiCard({ label: '本周工时', value: weekShifts.length * 6, unit: '小时', meta: `共 ${weekShifts.length} 个班次`, iconName: 'clock', tone: 'red' })}
    </div>
    <div class="stats-layout">
      <section class="card stats-span-5">
        <div class="card-header"><div><h3>员工状态</h3><p>当前档案状态占比</p></div></div>
        <div class="card-body">
          <div class="donut-wrap">
            <div class="donut-chart" style="background:conic-gradient(var(--forest) 0 ${activePct}%, var(--orange) ${activePct}% ${activePct + leavePct}%, #d7d7d1 ${activePct + leavePct}% 100%)">
              <div class="donut-chart__center"><strong>${stats.total}</strong><span>员工总数</span></div>
            </div>
            <div class="donut-legend">
              <div><i></i><span>在职</span><strong>${stats.statusCounts.active}</strong></div>
              <div><i></i><span>休假</span><strong>${stats.statusCounts.leave}</strong></div>
              <div><i></i><span>离职</span><strong>${stats.statusCounts.inactive}</strong></div>
            </div>
          </div>
        </div>
      </section>
      <section class="card stats-span-7">
        <div class="card-header"><div><h3>部门人员分布</h3><p>按员工档案所属部门统计</p></div></div>
        <div class="card-body">
          <div class="stat-list">
            ${stats.departmentCounts.map((department) => `
              <div class="stat-list__row">
                <span>${escapeHtml(department.name)}</span>
                <div class="stat-list__track"><div class="stat-list__fill" style="width:${department.count / maxDept * 100}%"></div></div>
                <strong>${department.count} 人</strong>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
      <section class="card stats-span-7">
        <div class="card-header"><div><h3>部门时薪合计</h3><p>以员工当前时薪求和，仅用于人力成本参考</p></div></div>
        <div class="card-body">
          <div class="chart-bars">
            ${stats.departmentCounts.map((department, index) => `
              <div>
                <div class="chart-bar__head"><span>${escapeHtml(department.name)}</span><span>${formatCurrency(department.payroll)}</span></div>
                <div class="chart-bar__track"><div class="chart-bar__fill" data-color="${['green', 'amber', 'blue', 'brown'][index]}" style="width:${Math.max(8, department.payroll / maxPayroll * 100)}%"></div></div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
      <section class="card stats-span-5">
        <div class="card-header"><div><h3>本周班次覆盖</h3><p>上午、下午、晚班安排数量</p></div></div>
        <div class="card-body">
          <div class="coverage-grid">
            ${periodCounts.map((period) => `<div class="coverage-box"><strong>${period.count}</strong><span>${period.name}</span></div>`).join('')}
          </div>
          <p class="form-note" style="margin-top:18px">当前排班覆盖 ${new Set(weekShifts.map((shift) => shift.employeeId)).size} 名员工。主管可在排班页按实际客流调整。</p>
        </div>
      </section>
    </div>
  `;
}

function inventoryStatus(item) {
  if (item.stock <= 0) return { label: '缺货', tone: 'red', key: 'out' };
  if (item.stock < item.minStock) return { label: '库存偏低', tone: 'amber', key: 'low' };
  return { label: '库存正常', tone: 'green', key: 'ok' };
}

function renderInventoryPage() {
  const categories = [...new Set(state.db.inventory.map((item) => item.category))];
  mainContent.innerHTML = `
    ${pageHeading('库存查看', '查看门店货架库存与仓储组提交的补货申请。当前页面为只读，库存调整由仓储组处理。')}
    <div class="grid grid--kpis">
      ${kpiCard({ label: '库存品项', value: state.db.inventory.length, unit: '项', meta: '覆盖常用五金与劳保用品', iconName: 'boxes' })}
      ${kpiCard({ label: '库存偏低', value: state.db.inventory.filter((item) => item.stock < item.minStock).length, unit: '项', meta: '低于设定安全库存', iconName: 'alert', tone: 'amber' })}
      ${kpiCard({ label: '待处理申请', value: state.db.restockRequests.filter((item) => item.status === 'pending').length, unit: '项', meta: '等待仓储组确认', iconName: 'clipboard-list', tone: 'red' })}
      ${kpiCard({ label: '已完成申请', value: state.db.restockRequests.filter((item) => item.status === 'completed').length, unit: '项', meta: '近期补货记录', iconName: 'check', tone: 'blue' })}
    </div>
    <div class="inventory-layout">
      <section class="card card--flush">
        <div class="toolbar">
          <div><strong style="font-size:12px">货架库存</strong><span class="result-count" style="margin-left:8px">共 ${state.db.inventory.length} 项</span></div>
          <div class="toolbar__spacer"></div>
          <select class="select-control" id="inventoryCategory" aria-label="按商品分类筛选">
            <option value="">全部分类</option>
            ${categories.map((category) => `<option value="${escapeHtml(category)}" ${category === state.inventoryCategory ? 'selected' : ''}>${escapeHtml(category)}</option>`).join('')}
          </select>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>商品</th><th>货架</th><th>当前库存</th><th>安全库存</th><th>状态</th></tr></thead>
            <tbody id="inventoryTableBody"></tbody>
          </table>
        </div>
        <div class="table-footer"><span>库存数据为演示数据</span><span class="table-footer__hint">${icon('info', 14)} 安全库存低于 20% 时标记预警</span></div>
      </section>
      <section class="card">
        <div class="card-header"><div><h3>补货申请</h3><p>仓储组提交的最新申请</p></div></div>
        <div class="card-body">
          <div class="restock-list">
            ${state.db.restockRequests.map((request) => {
              const item = state.db.inventory.find((product) => product.sku === request.sku);
              const statusMeta = {
                pending: ['待处理', 'amber'],
                processing: ['处理中', 'blue'],
                completed: ['已完成', 'gray'],
              }[request.status] ?? [request.status, 'gray'];
              return `
                <article class="restock-card">
                  <div class="restock-card__top"><h4>${escapeHtml(item?.name ?? request.sku)}</h4><span class="badge" data-tone="${statusMeta[1]}">${statusMeta[0]}</span></div>
                  <p>${escapeHtml(request.note || item?.category || '')}</p>
                  <div class="restock-card__meta"><span>${escapeHtml(request.requestedBy)} · ${formatDateTime(request.requestedAt)}</span><strong>申请 +${request.requestedQty} ${escapeHtml(item?.unit ?? '')}</strong></div>
                </article>
              `;
            }).join('')}
          </div>
        </div>
      </section>
    </div>
  `;
  updateInventoryTable();
}

function updateInventoryTable() {
  const tbody = document.getElementById('inventoryTableBody');
  if (!tbody) return;
  const rows = state.db.inventory.filter((item) => !state.inventoryCategory || item.category === state.inventoryCategory);
  tbody.innerHTML = rows.length ? rows.map((item) => {
    const status = inventoryStatus(item);
    const ratio = Math.min(100, item.stock / Math.max(item.minStock, 1) * 100);
    return `
      <tr>
        <td><span class="cell-primary">${escapeHtml(item.name)}</span><span class="cell-secondary">${escapeHtml(item.sku)} · ${escapeHtml(item.category)}</span></td>
        <td><span class="tag">${escapeHtml(item.shelf)}</span></td>
        <td><strong style="font-family:Georgia,serif;font-size:14px">${item.stock}</strong> <span class="cell-secondary" style="display:inline">${escapeHtml(item.unit)}</span></td>
        <td>${item.minStock} ${escapeHtml(item.unit)}</td>
        <td>
          <div class="stock-level">
            <div class="stock-level__bar"><i data-status="${status.key}" style="width:${ratio}%"></i></div>
            <span class="badge" data-tone="${status.tone}">${status.label}</span>
          </div>
        </td>
      </tr>
    `;
  }).join('') : '<tr><td colspan="5"><div class="empty-inline">没有该分类的库存记录</div></td></tr>';
}

function renderPermissionsPage() {
  const permissionRows = [
    ['查看员工档案', ['yes', 'yes', 'no']],
    ['新增及编辑员工', ['yes', 'no', 'no']],
    ['删除员工', ['yes', 'no', 'no']],
    ['分配及删除班次', ['no', 'yes', 'no']],
    ['查看统计与库存', ['yes', 'yes', 'no']],
    ['查看本人资料与班次', ['no', 'no', 'yes']],
  ];
  const roleCards = [
    { role: 'hr', icon: 'briefcase', items: ['维护员工档案', '删除离职员工', '查看部门与统计', '查看操作记录'] },
    { role: 'supervisor', icon: 'calendar', items: ['查询员工资料', '分配与调整班次', '查看库存与补货', '查看门店统计'] },
    { role: 'employee', icon: 'badge', items: ['查看本人资料', '查看本人班次'] },
  ];
  mainContent.innerHTML = `
    ${pageHeading('角色与权限', '系统按 HR、Supervisor、Ordinary Employee 三类角色限制页面与操作。')}
    <div class="permission-summary">
      ${roleCards.map((card) => {
        const meta = ROLE_META[card.role];
        return `
          <article class="role-card" data-tone="${meta.tone}">
            <div class="role-card__top">
              <span class="role-card__icon">${icon(card.icon)}</span>
              <div><h3>${meta.name}</h3><p>${meta.fullName}</p></div>
            </div>
            <ul>${card.items.map((item) => `<li>${icon('check', 13)}${escapeHtml(item)}</li>`).join('')}</ul>
          </article>
        `;
      }).join('')}
    </div>
    <div class="grid" style="grid-template-columns:minmax(0,1.25fr) minmax(300px,.75fr)">
      <section class="card card--flush">
        <div class="card-header"><div><h3>权限矩阵</h3><p>页面和操作按钮会按当前登录角色自动隐藏</p></div></div>
        <div class="table-wrap">
          <table class="data-table permission-table">
            <thead><tr><th>操作</th><th>HR</th><th>Supervisor</th><th>Ordinary Employee</th></tr></thead>
            <tbody>
              ${permissionRows.map(([label, roles]) => `
                <tr><td>${escapeHtml(label)}</td>${roles.map((allowed) => `<td>${allowed === 'yes' ? `<span class="permission-check">${icon('check', 11)}</span>` : '<span class="permission-none">—</span>'}</td>`).join('')}</tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
      <section class="card card--flush">
        <div class="card-header"><div><h3>系统账号</h3><p>仅展示账号角色，不显示密码</p></div></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>账号</th><th>角色</th><th>操作</th></tr></thead>
            <tbody>
              ${state.db.users.map((user) => `<tr><td><span class="cell-primary">${escapeHtml(user.username)}</span><span class="cell-secondary">${escapeHtml(user.displayName)}</span></td><td><span class="badge" data-tone="${ROLE_META[user.role].tone}">${escapeHtml(ROLE_META[user.role].name)}</span></td><td><button class="icon-button" type="button" data-action="edit-user-role" data-id="${user.id}" aria-label="修改 ${escapeHtml(user.displayName)} 的角色" title="修改角色" ${user.id === state.user.id ? 'disabled' : ''}>${icon('edit', 15)}</button></td></tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="card-body"><p class="form-note">演示版本使用浏览器本地数据。接入真实数据库时，账号密码应由服务端加密保存，并启用登录失败限制和会话过期。</p></div>
      </section>
    </div>
  `;
}

function openUserRoleForm(id) {
  if (!can(state.user.role, 'accounts:read')) {
    toast('当前账号没有修改角色的权限。', 'error');
    return;
  }
  if (id === state.user.id) {
    toast('不能修改当前登录账号的角色。', 'error');
    return;
  }
  const user = findUser(id);
  if (!user) return;
  openModal({
    title: '修改账号角色',
    subtitle: `正在设置 ${user.displayName}（${user.username}）的访问权限`,
    size: 'small',
    body: `
      <div class="form-field">
        <label for="userRoleSelect">角色</label>
        <select class="form-control" id="userRoleSelect">
          ${Object.entries(ROLE_META).map(([role, meta]) => `<option value="${role}" ${user.role === role ? 'selected' : ''}>${meta.name} · ${meta.fullName}</option>`).join('')}
        </select>
      </div>
      <p class="form-note">保存后，该账号下一次进入页面时会按新角色显示导航和操作权限。</p>
    `,
    footer: `
      <button class="button" type="button" data-action="close-modal">取消</button>
      <button class="button button--primary" type="button" data-action="save-user-role" data-id="${user.id}">保存角色</button>
    `,
  });
}

function renderAuditPage() {
  mainContent.innerHTML = `
    ${pageHeading('操作记录', '记录员工档案与班次的主要变更，便于后续核对。')}
    <section class="card">
      <div class="card-header"><div><h3>最近操作</h3><p>共 ${state.db.auditLogs.length} 条记录</p></div></div>
      <div class="card-body">
        ${state.db.auditLogs.length ? `<div class="audit-list">${state.db.auditLogs.map((log) => auditItem(log)).join('')}</div>` : '<div class="empty-inline">暂无操作记录</div>'}
      </div>
    </section>
  `;
}

function renderProfilePage() {
  const employee = getEmployee(state.user.employeeId);
  if (!employee) {
    mainContent.innerHTML = `<div class="empty-state"><h3>未找到员工档案</h3><p>请联系 HR 核对账号关联信息。</p></div>`;
    return;
  }
  const department = getDepartment(employee.departmentId);
  const attendance = state.db.attendance.filter((record) => record.employeeId === employee.id).slice(0, 5);
  const upcoming = state.db.shifts
    .filter((shift) => shift.employeeId === employee.id && shift.date >= dateKey(new Date()))
    .sort((a, b) => `${a.date}${a.period}`.localeCompare(`${b.date}${b.period}`))
    .slice(0, 5);
  const status = employeeStatus(employee.status);
  mainContent.innerHTML = `
    ${pageHeading('我的资料', '查看本人档案信息与近期出勤记录。如需修改联系方式，请联系 HR。')}
    <div class="profile-layout">
      <aside class="profile-card">
        <span class="avatar">${escapeHtml(initials(employee.name))}</span>
        <h2>${escapeHtml(employee.name)}</h2>
        <p>${escapeHtml(employee.position)} · ${escapeHtml(department?.name ?? '')}</p>
        <div class="profile-card__badges"><span class="badge" data-tone="${status.tone}">${status.label}</span><span class="badge" data-tone="blue">${escapeHtml(employee.employeeNo)}</span></div>
        <div class="profile-facts">
          <div class="profile-fact"><span>入职日期</span><strong>${escapeHtml(employee.hireDate)}</strong></div>
          <div class="profile-fact"><span>在职时长</span><strong>${tenureText(employee.hireDate)}</strong></div>
          <div class="profile-fact"><span>直属主管</span><strong>${escapeHtml(getEmployee(department?.managerId)?.name ?? '待指定')}</strong></div>
        </div>
      </aside>
      <div class="dashboard-stack">
        <section class="card">
          <div class="card-header"><div><h3>基本信息</h3><p>员工档案中的联系与岗位信息</p></div></div>
          <div class="card-body">
            <div class="info-grid">
              <div class="info-row"><span>手机号码</span><strong>${escapeHtml(employee.phone)}</strong></div>
              <div class="info-row"><span>电子邮箱</span><strong>${escapeHtml(employee.email)}</strong></div>
              <div class="info-row"><span>居住地址</span><strong>${escapeHtml(employee.address)}</strong></div>
              <div class="info-row"><span>紧急联系人</span><strong>${escapeHtml(employee.emergencyContact || '—')}</strong></div>
              <div class="info-row"><span>所属部门</span><strong>${escapeHtml(department?.name ?? '—')}</strong></div>
              <div class="info-row"><span>时薪标准</span><strong>${formatCurrency(employee.hourlyRate)} / 小时</strong></div>
            </div>
          </div>
        </section>
        <section class="card">
          <div class="card-header"><div><h3>近期出勤</h3><p>只读记录，由门店考勤系统汇总</p></div></div>
          <div class="card-body">
            ${attendance.length ? `<div class="attendance-list">${attendance.map((record) => {
              const statusMeta = { normal: ['正常', 'green'], late: ['迟到', 'amber'], leave: ['请假', 'blue'] }[record.status] ?? [record.status, 'gray'];
              return `<div class="attendance-row"><span>${escapeHtml(record.date)}</span><span>${record.checkIn ? `${record.checkIn} - ${record.checkOut}` : '请假'}</span><span class="badge" data-tone="${statusMeta[1]}">${statusMeta[0]}</span></div>`;
            }).join('')}</div>` : '<div class="empty-inline">暂无出勤记录</div>'}
          </div>
        </section>
        <section class="card">
          <div class="card-header"><div><h3>即将开始的班次</h3><p>最近 5 个已发布班次</p></div><button class="card-link" type="button" data-action="navigate" data-page="my-schedule">查看整周 ${icon('chevron-right', 15)}</button></div>
          <div class="card-body">
            ${upcoming.length ? `<div class="today-shifts">${upcoming.map((shift) => {
              const period = shiftMeta(shift.period);
              return `<div class="today-shift"><span class="today-shift__time">${formatDate(shift.date)}</span><div class="today-shift__people"><span>${period.name} · ${period.time}</span></div><span class="today-shift__count">${escapeHtml(shift.station || '门店')}</span></div>`;
            }).join('')}</div>` : '<div class="empty-inline">暂无已发布班次</div>'}
          </div>
        </section>
      </div>
    </div>
  `;
}

function openModal({ title, subtitle = '', body, footer = '', size = '', drawer = false }) {
  closeModal();
  const classes = ['modal'];
  if (size === 'small') classes.push('modal--small');
  if (size === 'wide') classes.push('modal--wide');
  if (drawer) classes.push('modal--drawer');
  modalRoot.innerHTML = `
    <div class="modal-backdrop">
      <section class="${classes.join(' ')}" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <header class="modal__header">
          <div><h2 id="modalTitle">${escapeHtml(title)}</h2>${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}</div>
          <button class="icon-button" type="button" data-action="close-modal" aria-label="关闭">${icon('x')}</button>
        </header>
        <div class="modal__body">${body}</div>
        ${footer ? `<footer class="modal__footer">${footer}</footer>` : ''}
      </section>
    </div>
  `;
  hydrateIcons(modalRoot);
  const backdrop = modalRoot.querySelector('.modal-backdrop');
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });
  setTimeout(() => {
    const focusTarget = modalRoot.querySelector('input:not([type="hidden"]), select, textarea, button');
    focusTarget?.focus();
  }, 20);
}

function closeModal() {
  modalRoot.innerHTML = '';
}

function toast(message, tone = 'success') {
  const element = document.createElement('div');
  element.className = 'toast';
  element.dataset.tone = tone;
  element.innerHTML = `${icon(tone === 'error' ? 'alert' : 'check', 17)}<span>${escapeHtml(message)}</span>`;
  toastRoot.appendChild(element);
  setTimeout(() => {
    element.classList.add('is-leaving');
    setTimeout(() => element.remove(), 190);
  }, 3200);
}

function confirmDialog({ title, message, confirmLabel = '确认', danger = false, onConfirm }) {
  openModal({
    title,
    size: 'small',
    body: `
      <span class="confirm-icon">${icon(danger ? 'alert' : 'info', 24)}</span>
      <p class="confirm-copy">${message}</p>
    `,
    footer: `
      <button class="button" type="button" data-action="close-modal">取消</button>
      <button class="button ${danger ? 'button--danger' : 'button--primary'}" type="button" id="confirmDialogButton">${escapeHtml(confirmLabel)}</button>
    `,
  });
  document.getElementById('confirmDialogButton').addEventListener('click', async () => {
    const button = document.getElementById('confirmDialogButton');
    button.disabled = true;
    try {
      await onConfirm();
    } finally {
      if (document.body.contains(button)) button.disabled = false;
    }
  });
}

function logAction(action, entity, summary) {
  state.db.auditLogs.unshift({
    id: `l-${Date.now()}`,
    userId: state.user.id,
    action,
    entity,
    summary,
    at: new Date().toISOString(),
  });
}

function openEmployeeForm(id = '') {
  const editing = Boolean(id);
  if (editing && !can(state.user.role, 'employee:update')) {
    toast('当前账号没有编辑员工档案的权限。', 'error');
    return;
  }
  if (!editing && !can(state.user.role, 'employee:create')) {
    toast('当前账号没有新增员工档案的权限。', 'error');
    return;
  }
  const employee = editing ? getEmployee(id) : null;
  if (editing && !employee) return;
  const maxNo = Math.max(0, ...state.db.employees.map((item) => Number(item.employeeNo.replace(/\D/g, '')) || 0));
  const nextNo = `MT${String(maxNo + 1).padStart(3, '0')}`;
  const value = employee ?? {
    employeeNo: nextNo,
    name: '',
    gender: '女',
    phone: '',
    email: '',
    address: '',
    departmentId: state.db.departments[0].id,
    position: '',
    hourlyRate: 26,
    hireDate: dateKey(new Date()),
    status: 'active',
    emergencyContact: '',
    note: '',
  };

  openModal({
    title: editing ? '编辑员工档案' : '添加员工',
    subtitle: editing ? `正在修改 ${employee.name} 的档案信息` : '填写基础信息后保存，工号不能与现有员工重复',
    size: 'wide',
    body: `
      <form id="employeeForm" class="form-grid" novalidate>
        <input type="hidden" name="id" value="${escapeHtml(employee?.id ?? '')}">
        <div class="form-field">
          <label for="employeeName">姓名 <em>*</em></label>
          <input class="form-control" id="employeeName" name="name" value="${escapeHtml(value.name)}" maxlength="30" autocomplete="off" required>
          <div class="field-error" data-error="name"></div>
        </div>
        <div class="form-field">
          <label for="employeeNo">工号 <em>*</em></label>
          <input class="form-control" id="employeeNo" name="employeeNo" value="${escapeHtml(value.employeeNo)}" maxlength="5" placeholder="MT001" required>
          <div class="field-error" data-error="employeeNo"></div>
        </div>
        <div class="form-field">
          <label for="employeeGender">性别</label>
          <select class="form-control" id="employeeGender" name="gender">
            <option value="女" ${value.gender === '女' ? 'selected' : ''}>女</option>
            <option value="男" ${value.gender === '男' ? 'selected' : ''}>男</option>
            <option value="其他" ${value.gender === '其他' ? 'selected' : ''}>其他</option>
          </select>
          <div class="field-error"></div>
        </div>
        <div class="form-field">
          <label for="employeePhone">手机号码 <em>*</em></label>
          <input class="form-control" id="employeePhone" name="phone" type="tel" value="${escapeHtml(value.phone)}" maxlength="11" autocomplete="off" required>
          <div class="field-error" data-error="phone"></div>
        </div>
        <div class="form-field">
          <label for="employeeEmail">电子邮箱 <em>*</em></label>
          <input class="form-control" id="employeeEmail" name="email" type="email" value="${escapeHtml(value.email)}" autocomplete="off" required>
          <div class="field-error" data-error="email"></div>
        </div>
        <div class="form-field">
          <label for="employeeDepartmentField">所属部门 <em>*</em></label>
          <select class="form-control" id="employeeDepartmentField" name="departmentId" required>${departmentOptions(value.departmentId)}</select>
          <div class="field-error" data-error="departmentId"></div>
        </div>
        <div class="form-field">
          <label for="employeePosition">岗位 <em>*</em></label>
          <input class="form-control" id="employeePosition" name="position" value="${escapeHtml(value.position)}" maxlength="30" required>
          <div class="field-error" data-error="position"></div>
        </div>
        <div class="form-field">
          <label for="employeeRate">时薪（元） <em>*</em></label>
          <input class="form-control" id="employeeRate" name="hourlyRate" type="number" value="${escapeHtml(value.hourlyRate)}" min="10" max="500" step="1" required>
          <div class="field-error" data-error="hourlyRate"></div>
        </div>
        <div class="form-field">
          <label for="employeeHireDate">入职日期 <em>*</em></label>
          <input class="form-control" id="employeeHireDate" name="hireDate" type="date" value="${escapeHtml(value.hireDate)}" required>
          <div class="field-error" data-error="hireDate"></div>
        </div>
        <div class="form-field">
          <label for="employeeStatusField">员工状态 <em>*</em></label>
          <select class="form-control" id="employeeStatusField" name="status">
            <option value="active" ${value.status === 'active' ? 'selected' : ''}>在职</option>
            <option value="leave" ${value.status === 'leave' ? 'selected' : ''}>休假</option>
            <option value="inactive" ${value.status === 'inactive' ? 'selected' : ''}>离职</option>
          </select>
          <div class="field-error" data-error="status"></div>
        </div>
        <div class="form-field form-field--full">
          <label for="employeeAddress">居住地址 <em>*</em></label>
          <input class="form-control" id="employeeAddress" name="address" value="${escapeHtml(value.address)}" maxlength="100" required>
          <div class="field-error" data-error="address"></div>
        </div>
        <div class="form-field form-field--full">
          <label for="employeeEmergency">紧急联系人</label>
          <input class="form-control" id="employeeEmergency" name="emergencyContact" value="${escapeHtml(value.emergencyContact)}" maxlength="60" placeholder="姓名与联系电话">
          <div class="field-error"></div>
        </div>
        <div class="form-field form-field--full">
          <label for="employeeNote">备注</label>
          <textarea class="form-control" id="employeeNote" name="note" maxlength="200">${escapeHtml(value.note)}</textarea>
          <div class="field-error"></div>
        </div>
      </form>
    `,
    footer: `
      <button class="button" type="button" data-action="close-modal">取消</button>
      <button class="button button--primary" type="submit" form="employeeForm">${editing ? '保存修改' : '添加员工'}</button>
    `,
  });
  document.getElementById('employeeForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    handleEmployeeSubmit(event.currentTarget);
  });
}

async function handleEmployeeSubmit(form) {
  const data = new FormData(form);
  const payload = {
    employeeNo: String(data.get('employeeNo') ?? '').trim().toUpperCase(),
    name: String(data.get('name') ?? '').trim(),
    gender: String(data.get('gender') ?? ''),
    phone: String(data.get('phone') ?? '').trim(),
    email: String(data.get('email') ?? '').trim(),
    address: String(data.get('address') ?? '').trim(),
    departmentId: String(data.get('departmentId') ?? ''),
    position: String(data.get('position') ?? '').trim(),
    hourlyRate: Number(data.get('hourlyRate')),
    hireDate: String(data.get('hireDate') ?? ''),
    status: String(data.get('status') ?? ''),
    emergencyContact: String(data.get('emergencyContact') ?? '').trim(),
    note: String(data.get('note') ?? '').trim(),
  };
  const id = String(data.get('id') ?? '');
  const validation = validateEmployee(payload, state.db.employees, state.db.departments, id || null);

  form.querySelectorAll('[data-error]').forEach((element) => {
    element.textContent = '';
    element.closest('.form-field')?.querySelector('.form-control')?.classList.remove('has-error');
  });
  if (!validation.valid) {
    Object.entries(validation.errors).forEach(([key, message]) => {
      const error = form.querySelector(`[data-error="${key}"]`);
      if (error) {
        error.textContent = message;
        error.closest('.form-field')?.querySelector('.form-control')?.classList.add('has-error');
      }
    });
    form.querySelector('.has-error')?.focus();
    return;
  }

  if (id) {
    const index = state.db.employees.findIndex((employee) => employee.id === id);
    if (index < 0) return;
    state.db.employees[index] = { ...state.db.employees[index], ...payload };
    logAction('update', 'employee', `更新员工${payload.name}的档案`);
    toast('员工档案已更新。');
  } else {
    state.db.employees.push({ id: `e-${Date.now()}`, ...payload });
    logAction('create', 'employee', `录入新员工${payload.name}的档案`);
    toast('新员工已添加。');
  }
  saveDatabase();
  closeModal();
  renderPage();
  updateTopbar();
}

function openEmployeeDetail(id) {
  const employee = getEmployee(id);
  if (!employee) return;
  if (state.user.role === 'employee' && employee.id !== state.user.employeeId) {
    toast('当前账号只能查看本人档案。', 'error');
    return;
  }
  const department = getDepartment(employee.departmentId);
  const status = employeeStatus(employee.status);
  const attendance = state.db.attendance
    .filter((record) => record.employeeId === employee.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);
  const shifts = state.db.shifts
    .filter((shift) => shift.employeeId === employee.id && shift.date >= dateKey(new Date()))
    .sort((a, b) => `${a.date}${a.period}`.localeCompare(`${b.date}${b.period}`))
    .slice(0, 5);

  openModal({
    title: '员工详情',
    subtitle: '档案、出勤与近期班次',
    drawer: true,
    body: `
      <div class="detail-head">
        <span class="avatar avatar--large">${escapeHtml(initials(employee.name))}</span>
        <div><h3>${escapeHtml(employee.name)}</h3><p>${escapeHtml(employee.employeeNo)} · ${escapeHtml(department?.name ?? '未分配')} · ${escapeHtml(employee.position)}</p></div>
        <span class="badge" data-tone="${status.tone}" style="margin-left:auto">${status.label}</span>
      </div>
      <div class="detail-section">
        <div class="detail-section__title"><h4>基础信息</h4><span>入职 ${escapeHtml(employee.hireDate)}</span></div>
        <ul class="detail-list">
          <li><span>手机号码</span><strong>${escapeHtml(employee.phone)}</strong></li>
          <li><span>电子邮箱</span><strong>${escapeHtml(employee.email)}</strong></li>
          <li><span>居住地址</span><strong>${escapeHtml(employee.address)}</strong></li>
          <li><span>紧急联系人</span><strong>${escapeHtml(employee.emergencyContact || '—')}</strong></li>
          <li><span>时薪标准</span><strong>${formatCurrency(employee.hourlyRate)} / 小时</strong></li>
          <li><span>在职时长</span><strong>${tenureText(employee.hireDate)}</strong></li>
          ${employee.note ? `<li><span>备注</span><strong>${escapeHtml(employee.note)}</strong></li>` : ''}
        </ul>
      </div>
      <div class="detail-section">
        <div class="detail-section__title"><h4>近期出勤</h4><span>最近 ${attendance.length} 条</span></div>
        ${attendance.length ? `<div class="attendance-list">${attendance.map((record) => {
          const meta = { normal: ['正常', 'green'], late: ['迟到', 'amber'], leave: ['请假', 'blue'] }[record.status] ?? [record.status, 'gray'];
          return `<div class="attendance-row"><span>${escapeHtml(record.date)}</span><span>${record.checkIn ? `${record.checkIn} - ${record.checkOut}` : '请假'}</span><span class="badge" data-tone="${meta[1]}">${meta[0]}</span></div>`;
        }).join('')}</div>` : '<div class="empty-inline">暂无出勤记录</div>'}
      </div>
      <div class="detail-section">
        <div class="detail-section__title"><h4>近期班次</h4><span>未来 ${shifts.length} 个</span></div>
        ${shifts.length ? `<ul class="detail-list">${shifts.map((shift) => {
          const period = shiftMeta(shift.period);
          return `<li><span>${formatDate(shift.date)} · ${period.name}</span><strong>${escapeHtml(shift.station || period.time)}</strong></li>`;
        }).join('')}</ul>` : '<div class="empty-inline">暂无已发布班次</div>'}
      </div>
    `,
    footer: `
      <button class="button" type="button" data-action="close-modal">关闭</button>
      ${can(state.user.role, 'employee:update') ? `<button class="button button--primary" type="button" data-action="open-employee-form" data-id="${employee.id}">${icon('edit')} 编辑档案</button>` : ''}
    `,
  });
}

function requestDeleteEmployee(id) {
  if (!can(state.user.role, 'employee:delete')) {
    toast('只有 HR 可以删除员工档案。', 'error');
    return;
  }
  const employee = getEmployee(id);
  if (!employee) return;
  confirmDialog({
    title: '删除员工档案',
    message: `确定删除 <strong>${escapeHtml(employee.name)}（${escapeHtml(employee.employeeNo)}）</strong> 的档案吗？与该员工关联的班次记录会保留，但无法再从员工列表访问其资料。`,
    confirmLabel: '确认删除',
    danger: true,
    onConfirm: () => {
      state.db.employees = state.db.employees.filter((item) => item.id !== id);
      logAction('delete', 'employee', `删除员工${employee.name}的档案`);
      saveDatabase();
      closeModal();
      updateEmployeeTable();
      updateTopbar();
      toast('员工档案已删除。');
    },
  });
}

function openShiftForm(defaultDate = dateKey(new Date()), defaultPeriod = 'morning') {
  if (!can(state.user.role, 'schedule:create')) {
    toast('只有 Supervisor 可以分配班次。', 'error');
    return;
  }
  const activeEmployees = state.db.employees.filter((employee) => employee.status === 'active');
  if (!activeEmployees.length) {
    toast('当前没有可排班在职员工。', 'error');
    return;
  }
  const selectedEmployee = state.scheduleEmployee || activeEmployees[0].id;
  openModal({
    title: '分配班次',
    subtitle: '同一员工不能在同一天重复进入同一班次',
    body: `
      <form id="shiftForm" class="form-grid" novalidate>
        <div class="form-field">
          <label for="shiftEmployee">员工 <em>*</em></label>
          <select class="form-control" id="shiftEmployee" name="employeeId">${employeeOptions(selectedEmployee, true)}</select>
          <div class="field-error" data-error="employeeId"></div>
        </div>
        <div class="form-field">
          <label for="shiftDate">日期 <em>*</em></label>
          <input class="form-control" id="shiftDate" name="date" type="date" value="${escapeHtml(defaultDate)}" required>
          <div class="field-error" data-error="date"></div>
        </div>
        <div class="form-field">
          <label for="shiftPeriod">班次 <em>*</em></label>
          <select class="form-control" id="shiftPeriod" name="period">
            ${SHIFT_PERIODS.map((period) => `<option value="${period.id}" ${period.id === defaultPeriod ? 'selected' : ''}>${period.name} · ${period.time}</option>`).join('')}
          </select>
          <div class="field-error" data-error="period"></div>
        </div>
        <div class="form-field">
          <label for="shiftStation">岗位 / 区域</label>
          <input class="form-control" id="shiftStation" name="station" maxlength="30" placeholder="例如 一号收银台">
          <div class="field-error"></div>
        </div>
        <div class="form-field form-field--full">
          <label for="shiftNote">排班备注</label>
          <textarea class="form-control" id="shiftNote" name="note" maxlength="120" placeholder="交接事项或特殊说明"></textarea>
          <div class="field-error"></div>
        </div>
        <p class="form-note form-field--full">上午班 08:00 - 14:00，下午班 14:00 - 20:00，晚班 20:00 - 次日 02:00。</p>
        <div class="form-message form-field--full" id="shiftFormMessage" role="alert"></div>
      </form>
    `,
    footer: `
      <button class="button" type="button" data-action="close-modal">取消</button>
      <button class="button button--primary" type="submit" form="shiftForm">保存班次</button>
    `,
  });
  document.getElementById('shiftForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    handleShiftSubmit(event.currentTarget);
  });
}

function handleShiftSubmit(form) {
  if (!can(state.user.role, 'schedule:create')) return;
  const data = new FormData(form);
  const candidate = {
    employeeId: String(data.get('employeeId') ?? ''),
    date: String(data.get('date') ?? ''),
    period: String(data.get('period') ?? ''),
    station: String(data.get('station') ?? '').trim(),
    note: String(data.get('note') ?? '').trim(),
  };
  const message = document.getElementById('shiftFormMessage');
  message.classList.remove('is-visible');
  const employee = getEmployee(candidate.employeeId);
  if (!employee || !candidate.date || !SHIFT_PERIODS.some((period) => period.id === candidate.period)) {
    message.textContent = '请完整填写员工、日期和班次。';
    message.classList.add('is-visible');
    return;
  }
  if (employee.status !== 'active') {
    message.textContent = '休假或离职员工不能安排新班次。';
    message.classList.add('is-visible');
    return;
  }
  if (hasShiftConflict(state.db.shifts, candidate)) {
    message.textContent = '该员工在这天已经安排了相同班次，请更换员工或班次。';
    message.classList.add('is-visible');
    return;
  }
  state.db.shifts.push({
    id: `s-${Date.now()}`,
    ...candidate,
    createdAt: new Date().toISOString(),
    createdBy: state.user.id,
  });
  logAction('create', 'shift', `为${employee.name}分配${formatDate(candidate.date)}${shiftMeta(candidate.period).name}`);
  saveDatabase();
  closeModal();
  state.scheduleWeek = dateKey(getWeekStart(parseDateKey(candidate.date)));
  renderPage();
  toast('班次已保存。');
}

function openShiftDetail(id) {
  const shift = state.db.shifts.find((item) => item.id === id);
  if (!shift) return;
  const employee = getEmployee(shift.employeeId);
  const period = shiftMeta(shift.period);
  openModal({
    title: '班次详情',
    size: 'small',
    body: `
      <div class="detail-head">
        <span class="avatar avatar--large">${escapeHtml(initials(employee?.name ?? ''))}</span>
        <div><h3>${escapeHtml(employee?.name ?? '未知员工')}</h3><p>${escapeHtml(employee?.position ?? '')} · ${escapeHtml(getDepartment(employee?.departmentId)?.name ?? '')}</p></div>
      </div>
      <ul class="detail-list">
        <li><span>日期</span><strong>${formatDate(shift.date, { weekday: 'short' })}</strong></li>
        <li><span>班次</span><strong>${period.name} · ${period.time}</strong></li>
        <li><span>岗位 / 区域</span><strong>${escapeHtml(shift.station || '门店值班')}</strong></li>
        <li><span>备注</span><strong>${escapeHtml(shift.note || '—')}</strong></li>
      </ul>
    `,
    footer: `
      <button class="button" type="button" data-action="close-modal">关闭</button>
      ${can(state.user.role, 'schedule:delete') ? `<button class="button button--danger" type="button" data-action="delete-shift" data-id="${shift.id}">${icon('trash')} 删除班次</button>` : ''}
    `,
  });
}

function requestDeleteShift(id) {
  if (!can(state.user.role, 'schedule:delete')) {
    toast('只有 Supervisor 可以删除班次。', 'error');
    return;
  }
  const shift = state.db.shifts.find((item) => item.id === id);
  if (!shift) return;
  const employee = getEmployee(shift.employeeId);
  confirmDialog({
    title: '删除班次',
    message: `确定删除 <strong>${escapeHtml(employee?.name ?? '该员工')}</strong> 在 ${formatDate(shift.date)} ${shiftMeta(shift.period).name} 的排班吗？`,
    confirmLabel: '删除班次',
    danger: true,
    onConfirm: () => {
      state.db.shifts = state.db.shifts.filter((item) => item.id !== id);
      logAction('delete', 'shift', `删除${employee?.name ?? '员工'}的${formatDate(shift.date)}${shiftMeta(shift.period).name}`);
      saveDatabase();
      closeModal();
      renderPage();
      toast('班次已删除。');
    },
  });
}

function buildAutoScheduleSuggestions() {
  const days = weekDates(parseDateKey(state.scheduleWeek));
  const workingShifts = state.db.shifts.map((shift) => ({ ...shift }));
  const suggestions = [];
  const targets = { morning: 2, afternoon: 2, evening: 1 };
  const activeEmployees = state.db.employees.filter((employee) => employee.status === 'active');

  days.forEach((day) => {
    SHIFT_PERIODS.forEach((period) => {
      let count = workingShifts.filter((shift) => shift.date === day && shift.period === period.id).length;
      while (count < targets[period.id]) {
        const dailyAssigned = new Set(workingShifts.filter((shift) => shift.date === day).map((shift) => shift.employeeId));
        const candidates = activeEmployees
          .filter((employee) => !dailyAssigned.has(employee.id))
          .sort((a, b) => {
            const aCount = workingShifts.filter((shift) => shift.employeeId === a.id).length;
            const bCount = workingShifts.filter((shift) => shift.employeeId === b.id).length;
            return aCount - bCount || a.employeeNo.localeCompare(b.employeeNo);
          });
        const employee = candidates[0];
        if (!employee) break;
        const suggestion = {
          id: `auto-${Date.now()}-${suggestions.length}`,
          employeeId: employee.id,
          date: day,
          period: period.id,
          station: autoStation(employee),
          note: '智能补齐建议',
          createdAt: new Date().toISOString(),
          createdBy: state.user.id,
        };
        suggestions.push(suggestion);
        workingShifts.push(suggestion);
        count += 1;
      }
    });
  });
  return suggestions;
}

function autoStation(employee) {
  if (employee.departmentId === 'd2') return '卖场补货';
  if (employee.departmentId === 'd3') return '销售区';
  if (employee.departmentId === 'd4') return '行政值班';
  return '收银与巡场';
}

function requestAutoSchedule() {
  if (!can(state.user.role, 'schedule:auto')) {
    toast('当前账号没有自动排班权限。', 'error');
    return;
  }
  const suggestions = buildAutoScheduleSuggestions();
  if (!suggestions.length) {
    toast('本周各班次已达到建议覆盖人数。');
    return;
  }
  confirmDialog({
    title: '智能补齐班次',
    message: `当前周还有 <strong>${suggestions.length} 个班次缺口</strong>。系统会优先选择当日未排班、本周班次较少的在职员工，并生成上午和下午各 2 人、晚班 1 人的建议安排。`,
    confirmLabel: '生成排班',
    onConfirm: () => {
      state.db.shifts.push(...suggestions);
      logAction('create', 'shift', `使用智能补齐生成${suggestions.length}个班次建议`);
      saveDatabase();
      closeModal();
      renderPage();
      toast(`已补齐 ${suggestions.length} 个班次。`);
    },
  });
}

function exportEmployees() {
  if (!can(state.user.role, 'export:employees')) {
    toast('当前账号没有导出权限。', 'error');
    return;
  }
  const rows = currentEmployeeRows();
  const header = ['工号', '姓名', '性别', '手机号码', '电子邮箱', '部门', '岗位', '时薪', '入职日期', '状态', '地址'];
  const lines = [header, ...rows.map((employee) => [
    employee.employeeNo,
    employee.name,
    employee.gender,
    employee.phone,
    employee.email,
    getDepartment(employee.departmentId)?.name ?? '',
    employee.position,
    employee.hourlyRate,
    employee.hireDate,
    employeeStatus(employee.status).label,
    employee.address,
  ])].map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','));
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `梅提商城员工名单_${dateKey(new Date())}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
  toast('员工名单已导出。');
}

function showNotifications() {
  if (state.user.role === 'supervisor') {
    const pending = state.db.restockRequests.filter((request) => request.status === 'pending');
    openModal({
      title: '待处理事项',
      subtitle: `${pending.length} 项补货申请等待确认`,
      body: pending.length ? `<div class="restock-list">${pending.map((request) => {
        const item = state.db.inventory.find((product) => product.sku === request.sku);
        return `<article class="restock-card"><div class="restock-card__top"><h4>${escapeHtml(item?.name ?? request.sku)}</h4><span class="badge" data-tone="amber">待处理</span></div><p>${escapeHtml(request.note || '')}</p><div class="restock-card__meta"><span>${escapeHtml(request.requestedBy)} · ${formatDateTime(request.requestedAt)}</span><strong>+${request.requestedQty} ${escapeHtml(item?.unit ?? '')}</strong></div></article>`;
      }).join('')}</div>` : '<div class="empty-inline">当前没有待处理事项</div>',
      footer: '<button class="button" type="button" data-action="close-modal">关闭</button>',
    });
    return;
  }
  if (state.user.role === 'hr') {
    const leaveEmployees = state.db.employees.filter((employee) => employee.status === 'leave');
    openModal({
      title: '待关注人员',
      subtitle: `${leaveEmployees.length} 名员工处于休假状态`,
      body: leaveEmployees.length ? `<ul class="detail-list">${leaveEmployees.map((employee) => `<li><span>${escapeHtml(employee.name)} · ${escapeHtml(employee.position)}</span><strong>${escapeHtml(employee.note || '休假中')}</strong></li>`).join('')}</ul>` : '<div class="empty-inline">当前没有休假员工</div>',
      footer: '<button class="button" type="button" data-action="close-modal">关闭</button>',
    });
    return;
  }
  const upcoming = state.db.shifts
    .filter((shift) => shift.employeeId === state.user.employeeId && shift.date >= dateKey(new Date()))
    .sort((a, b) => `${a.date}${a.period}`.localeCompare(`${b.date}${b.period}`));
  openModal({
    title: '我的近期班次',
    subtitle: `共 ${upcoming.length} 个已发布班次`,
    body: upcoming.length ? `<ul class="detail-list">${upcoming.slice(0, 8).map((shift) => `<li><span>${formatDate(shift.date)} · ${shiftMeta(shift.period).name}</span><strong>${escapeHtml(shift.station || shiftMeta(shift.period).time)}</strong></li>`).join('')}</ul>` : '<div class="empty-inline">暂无即将开始的班次</div>',
    footer: '<button class="button" type="button" data-action="close-modal">关闭</button>',
  });
}

function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('is-open');
  document.getElementById('mobileScrim').classList.remove('is-visible');
}

function toggleMobileSidebar() {
  document.getElementById('sidebar').classList.toggle('is-open');
  document.getElementById('mobileScrim').classList.toggle('is-visible');
}

function handleAction(action, target) {
  switch (action) {
    case 'navigate':
      navigate(target.dataset.page);
      break;
    case 'open-user-menu': {
      const popover = document.getElementById('userPopover');
      const expanded = popover.hidden;
      popover.hidden = !expanded;
      document.getElementById('sidebarUser').setAttribute('aria-expanded', String(expanded));
      break;
    }
    case 'logout':
      showLogin();
      toast('已退出当前账号。');
      break;
    case 'reset-data':
      document.getElementById('userPopover').hidden = true;
      confirmDialog({
        title: '重置演示数据',
        message: '当前浏览器中的员工、班次和操作记录会恢复为初始演示数据。登录状态也会同时退出。',
        confirmLabel: '重置数据',
        danger: true,
        onConfirm: () => {
          localStorage.removeItem(DB_KEY);
          state.db = createSeedData();
          saveDatabase();
          closeModal();
          showLogin();
        },
      });
      break;
    case 'show-notifications':
      showNotifications();
      break;
    case 'clear-employee-filters':
      state.employeeQuery = '';
      state.employeeDepartment = '';
      state.employeeStatus = '';
      renderEmployeesPage();
      hydrateIcons(mainContent);
      break;
    case 'sort-employees': {
      const key = target.dataset.sort;
      state.employeeSort.direction = state.employeeSort.key === key && state.employeeSort.direction === 'asc' ? 'desc' : 'asc';
      state.employeeSort.key = key;
      renderEmployeesPage();
      hydrateIcons(mainContent);
      break;
    }
    case 'open-employee-form':
      openEmployeeForm(target.dataset.id ?? '');
      break;
    case 'view-employee':
      openEmployeeDetail(target.dataset.id);
      break;
    case 'delete-employee':
      requestDeleteEmployee(target.dataset.id);
      break;
    case 'export-employees':
      exportEmployees();
      break;
    case 'previous-week':
      state.scheduleWeek = dateKey(addDays(parseDateKey(state.scheduleWeek), -7));
      renderPage();
      break;
    case 'next-week':
      state.scheduleWeek = dateKey(addDays(parseDateKey(state.scheduleWeek), 7));
      renderPage();
      break;
    case 'current-week':
      state.scheduleWeek = dateKey(getWeekStart(new Date()));
      renderPage();
      break;
    case 'open-shift-form':
      openShiftForm(target.dataset.date ?? dateKey(new Date()), target.dataset.period ?? 'morning');
      break;
    case 'open-shift-detail':
      openShiftDetail(target.dataset.id);
      break;
    case 'delete-shift':
      requestDeleteShift(target.dataset.id);
      break;
    case 'auto-schedule':
      requestAutoSchedule();
      break;
    case 'edit-user-role':
      openUserRoleForm(target.dataset.id);
      break;
    case 'save-user-role': {
      const user = findUser(target.dataset.id);
      const role = document.getElementById('userRoleSelect')?.value;
      if (!user || !ROLE_META[role]) return;
      if (user.id === state.user.id) {
        toast('不能修改当前登录账号的角色。', 'error');
        return;
      }
      user.role = role;
      logAction('update', 'account', `将账号${user.username}的角色调整为${ROLE_META[role].name}`);
      saveDatabase();
      closeModal();
      renderPage();
      toast('账号角色已更新。');
      break;
    }
    case 'close-modal':
      closeModal();
      break;
    default:
      break;
  }
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  const popover = document.getElementById('userPopover');
  if (popover && !popover.hidden && !event.target.closest('#userPopover') && !event.target.closest('#sidebarUser')) {
    popover.hidden = true;
    document.getElementById('sidebarUser').setAttribute('aria-expanded', 'false');
  }
  if (target) handleAction(target.dataset.action, target);
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'employeeSearch') {
    state.employeeQuery = event.target.value;
    updateEmployeeTable();
  }
});

document.addEventListener('change', (event) => {
  if (event.target.id === 'employeeDepartment') {
    state.employeeDepartment = event.target.value;
    updateEmployeeTable();
  }
  if (event.target.id === 'employeeStatus') {
    state.employeeStatus = event.target.value;
    updateEmployeeTable();
  }
  if (event.target.id === 'scheduleEmployee') {
    state.scheduleEmployee = event.target.value;
    renderPage();
  }
  if (event.target.id === 'inventoryCategory') {
    state.inventoryCategory = event.target.value;
    updateInventoryTable();
  }
});


document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const message = document.getElementById('loginMessage');
  const button = document.getElementById('loginButton');
  message.classList.remove('is-visible');

  if (!username || !password) {
    message.textContent = '请输入账号和密码。';
    message.classList.add('is-visible');
    return;
  }

  button.disabled = true;
  button.querySelector('span').textContent = '正在验证...';
  try {
    const user = state.db.users.find((item) => item.username === username);
    if (!user) throw new Error('账号或密码不正确');
    const hash = await hashPassword(password, user.salt);
    if (hash !== user.passwordHash) throw new Error('账号或密码不正确');
    storeSession(user);
    showApp(user);
  } catch (error) {
    message.textContent = error.message || '登录失败，请稍后重试。';
    message.classList.add('is-visible');
  } finally {
    button.disabled = false;
    button.querySelector('span').textContent = '进入系统';
  }
});

document.querySelectorAll('[data-demo-account]').forEach((button) => {
  button.addEventListener('click', () => {
    const account = DEMO_ACCOUNTS[button.dataset.demoAccount];
    if (!account) return;
    document.getElementById('username').value = account.username;
    document.getElementById('password').value = account.password;
    document.getElementById('loginMessage').classList.remove('is-visible');
    document.getElementById('password').focus();
  });
});

const passwordToggle = document.getElementById('togglePassword');
passwordToggle.innerHTML = icon('eye');
passwordToggle.addEventListener('click', () => {
  const input = document.getElementById('password');
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  passwordToggle.innerHTML = icon(show ? 'eye-off' : 'eye');
  passwordToggle.setAttribute('aria-label', show ? '隐藏密码' : '显示密码');
});

document.getElementById('menuButton').addEventListener('click', toggleMobileSidebar);
document.getElementById('mobileScrim').addEventListener('click', closeMobileSidebar);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (modalRoot.innerHTML) closeModal();
    const popover = document.getElementById('userPopover');
    if (popover && !popover.hidden) popover.hidden = true;
    closeMobileSidebar();
  }
});

window.addEventListener('popstate', () => {
  if (!state.user) return;
  const page = pageFromHash();
  state.page = canVisit(page) ? page : defaultPage(state.user.role);
  renderNavigation();
  updateTopbar();
  renderPage();
});

function initialize() {
  state.db = loadDatabase();
  hydrateIcons();
  const user = restoreSession();
  if (user) showApp(user);
  else showLogin();
}

initialize();
