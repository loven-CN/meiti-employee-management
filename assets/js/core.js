export const SHIFT_PERIODS = [
  { id: 'morning', name: 'Morning', time: '08:00 - 14:00', shortTime: '08:00', color: 'green' },
  { id: 'afternoon', name: 'Afternoon', time: '14:00 - 20:00', shortTime: '14:00', color: 'amber' },
  { id: 'evening', name: 'Evening', time: '20:00 - 02:00', shortTime: '20:00', color: 'blue' },
];

export const ROLE_META = {
  hr: { name: 'HR', fullName: 'Human Resources', tone: 'green' },
  supervisor: { name: 'Supervisor', fullName: 'Store Supervisor', tone: 'amber' },
  employee: { name: 'Ordinary Employee', fullName: 'Ordinary Employee', tone: 'blue' },
};

const PERMISSIONS = {
  hr: new Set([
    'employee:read', 'employee:create', 'employee:update', 'employee:delete',
    'department:read', 'schedule:read', 'stats:read', 'inventory:read',
    'restock:read', 'accounts:read', 'audit:read', 'export:employees',
  ]),
  supervisor: new Set([
    'employee:read', 'department:read', 'schedule:read', 'schedule:create',
    'schedule:delete', 'schedule:auto', 'stats:read', 'inventory:read',
    'restock:read', 'audit:read',
  ]),
  employee: new Set(['profile:self', 'schedule:self']),
};

export function can(role, permission) {
  return Boolean(PERMISSIONS[role]?.has(permission));
}

export function roleName(role) {
  return ROLE_META[role]?.fullName ?? role;
}

export function normalizeSearch(value) {
  return String(value ?? '').trim().toLocaleLowerCase('en-US');
}

export function filterEmployees(employees, { query = '', departmentId = '', status = '' } = {}) {
  const q = normalizeSearch(query);
  return employees.filter((employee) => {
    const matchesQuery = !q || [
      employee.name, employee.employeeNo, employee.phone, employee.email,
      employee.position, employee.address,
    ].some((value) => normalizeSearch(value).includes(q));
    const matchesDepartment = !departmentId || employee.departmentId === departmentId;
    const matchesStatus = !status || employee.status === status;
    return matchesQuery && matchesDepartment && matchesStatus;
  });
}

export function sortEmployees(employees, key = 'name', direction = 'asc') {
  const collator = new Intl.Collator('en-US', { numeric: true, sensitivity: 'base' });
  const multiplier = direction === 'desc' ? -1 : 1;
  return [...employees].sort((a, b) => {
    let left = a[key];
    let right = b[key];
    if (key === 'hourlyRate') {
      left = Number(left);
      right = Number(right);
    }
    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * multiplier;
    }
    return collator.compare(String(left ?? ''), String(right ?? '')) * multiplier;
  });
}

export function validateEmployee(employee, employees, departments, currentId = null) {
  const errors = {};
  const name = String(employee.name ?? '').trim();
  const employeeNo = String(employee.employeeNo ?? '').trim().toUpperCase();
  const phone = String(employee.phone ?? '').trim();
  const email = String(employee.email ?? '').trim();
  const rate = Number(employee.hourlyRate);
  const hireDate = String(employee.hireDate ?? '');

  if (name.length < 2 || name.length > 30) errors.name = 'Name must be 2 to 30 characters';
  if (!/^MT\d{3}$/.test(employeeNo)) errors.employeeNo = 'Employee ID must use the MT001 format';
  if (employees.some((item) => item.employeeNo === employeeNo && item.id !== currentId)) {
    errors.employeeNo = 'This employee ID already exists';
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) errors.phone = 'Enter an 11-digit mobile number';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address';
  if (!departments.some((item) => item.id === employee.departmentId)) errors.departmentId = 'Select a department';
  if (!String(employee.position ?? '').trim()) errors.position = 'Enter a position';
  if (!String(employee.address ?? '').trim()) errors.address = 'Enter an address';
  if (!Number.isFinite(rate) || rate < 10 || rate > 500) errors.hourlyRate = 'Hourly rate must be between CNY 10 and CNY 500';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(hireDate) || Number.isNaN(parseDateKey(hireDate).getTime())) {
    errors.hireDate = 'Select a hire date';
  }
  if (!['active', 'leave', 'inactive'].includes(employee.status)) errors.status = 'Select a status';

  return { valid: Object.keys(errors).length === 0, errors };
}

export function hasShiftConflict(shifts, candidate, ignoreId = null) {
  return shifts.some((shift) => (
    shift.id !== ignoreId
    && shift.employeeId === candidate.employeeId
    && shift.date === candidate.date
    && shift.period === candidate.period
  ));
}

export function computeStats(employees, departments, shifts = []) {
  const active = employees.filter((item) => item.status === 'active').length;
  const departmentCounts = departments.map((department) => {
    const members = employees.filter((item) => item.departmentId === department.id);
    return {
      ...department,
      count: members.length,
      activeCount: members.filter((item) => item.status === 'active').length,
      payroll: members.reduce((sum, item) => sum + Number(item.hourlyRate || 0), 0),
    };
  });
  const statusCounts = {
    active: employees.filter((item) => item.status === 'active').length,
    leave: employees.filter((item) => item.status === 'leave').length,
    inactive: employees.filter((item) => item.status === 'inactive').length,
  };
  return {
    total: employees.length,
    active,
    leave: statusCounts.leave,
    inactive: statusCounts.inactive,
    departmentCounts,
    statusCounts,
    weeklyShifts: shifts.length,
    averageRate: employees.length
      ? employees.reduce((sum, item) => sum + Number(item.hourlyRate || 0), 0) / employees.length
      : 0,
  };
}

export function parseDateKey(key) {
  const [year, month, day] = String(key).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(input, amount) {
  const date = input instanceof Date ? new Date(input) : parseDateKey(input);
  date.setDate(date.getDate() + amount);
  return date;
}

export function getWeekStart(input = new Date()) {
  const date = input instanceof Date ? new Date(input) : parseDateKey(input);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date;
}

export function weekDates(weekStart) {
  const start = typeof weekStart === 'string' ? parseDateKey(weekStart) : new Date(weekStart);
  return Array.from({ length: 7 }, (_, index) => dateKey(addDays(start, index)));
}

export function formatDate(key, options = {}) {
  const date = key instanceof Date ? key : parseDateKey(key);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', ...options,
  }).format(date);
}

export function formatFullDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  }).format(date);
}

export function formatWeekRange(weekStart) {
  const end = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === end.getMonth();
  const startText = new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric',
  }).format(weekStart);
  const endText = new Intl.DateTimeFormat('en-US', sameMonth ? { day: 'numeric' } : {
    month: 'short', day: 'numeric',
  }).format(end);
  return `${startText} - ${endText}, ${end.getFullYear()}`;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'CNY', maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

export function tenureText(hireDate, now = new Date()) {
  const start = parseDateKey(hireDate);
  let months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
  if (now.getDate() < start.getDate()) months -= 1;
  if (months < 1) return 'Less than 1 month';
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest ? `${years} year${years === 1 ? '' : 's'} ${rest} month${rest === 1 ? '' : 's'}` : `${years} year${years === 1 ? '' : 's'}`;
}

export function initials(name) {
  const parts = String(name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'ST';
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function shiftMeta(period) {
  return SHIFT_PERIODS.find((item) => item.id === period) ?? SHIFT_PERIODS[0];
}

export function employeeStatus(status) {
  return {
    active: { label: 'Active', tone: 'green' },
    leave: { label: 'On Leave', tone: 'amber' },
    inactive: { label: 'Inactive', tone: 'gray' },
  }[status] ?? { label: status, tone: 'gray' };
}
