import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeedData } from '../assets/js/data.js';
import {
  can, filterEmployees, sortEmployees, validateEmployee, hasShiftConflict,
  computeStats, getWeekStart, dateKey, weekDates, addDays, shiftMeta,
  tenureText, formatCurrency,
} from '../assets/js/core.js';

const db = createSeedData();

test('role permissions are isolated across HR, Supervisor, and Ordinary Employee', () => {
  assert.equal(can('hr', 'employee:delete'), true);
  assert.equal(can('hr', 'schedule:create'), false);
  assert.equal(can('supervisor', 'employee:read'), true);
  assert.equal(can('supervisor', 'employee:delete'), false);
  assert.equal(can('supervisor', 'schedule:create'), true);
  assert.equal(can('employee', 'employee:read'), false);
  assert.equal(can('employee', 'profile:self'), true);
});

test('employee search supports name, employee ID, and position', () => {
  assert.equal(filterEmployees(db.employees, { query: 'Siyuan Chen' }).length, 1);
  assert.equal(filterEmployees(db.employees, { query: 'MT005' })[0].name, 'Hao Sun');
  assert.equal(filterEmployees(db.employees, { query: 'Cashier' }).length >= 3, true);
});

test('employee filters can be combined', () => {
  const result = filterEmployees(db.employees, {
    departmentId: 'd2', status: 'active', query: 'Stock Associate',
  });
  assert.equal(result.every((employee) => employee.departmentId === 'd2'), true);
  assert.equal(result.every((employee) => employee.status === 'active'), true);
  assert.equal(result.some((employee) => employee.name === 'Yifan Zhao'), true);
});

test('employee sorting supports name and hourly rate', () => {
  const byRate = sortEmployees(db.employees, 'hourlyRate', 'desc');
  assert.equal(byRate[0].hourlyRate >= byRate[1].hourlyRate, true);
  const byName = sortEmployees(db.employees.slice(0, 4), 'name', 'asc');
  assert.equal(byName.length, 4);
  assert.equal(new Set(byName.map((item) => item.id)).size, 4);
});

test('employee validation blocks duplicate IDs and invalid contact details', () => {
  const candidate = {
    ...db.employees[0], name: 'Test Employee', phone: '123', email: 'bad-email', hourlyRate: 5,
  };
  const result = validateEmployee(candidate, db.employees, db.departments);
  assert.equal(result.valid, false);
  assert.ok(result.errors.employeeNo);
  assert.ok(result.errors.phone);
  assert.ok(result.errors.email);
  assert.ok(result.errors.hourlyRate);
});

test('employee validation accepts a valid new record', () => {
  const result = validateEmployee({
    employeeNo: 'MT099', name: 'Test Employee', phone: '13800138000',
    email: 'staff@meiti.example', address: '1 Test Road, Zhengzhou', departmentId: 'd1',
    position: 'Stock Associate', hourlyRate: 26, hireDate: '2026-10-19', status: 'active',
  }, db.employees, db.departments);
  assert.equal(result.valid, true);
});

test('the same employee cannot be assigned to the same shift twice in one day', () => {
  const existing = db.shifts[0];
  assert.equal(hasShiftConflict(db.shifts, {
    employeeId: existing.employeeId, date: existing.date, period: existing.period,
  }), true);
  assert.equal(hasShiftConflict(db.shifts, {
    employeeId: existing.employeeId, date: existing.date, period: 'evening',
  }), false);
});

test('statistics correctly aggregate totals, statuses, and departments', () => {
  const stats = computeStats(db.employees, db.departments, db.shifts);
  assert.equal(stats.total, db.employees.length);
  assert.equal(stats.active + stats.leave + stats.inactive, stats.total);
  assert.equal(stats.departmentCounts.reduce((sum, item) => sum + item.count, 0), stats.total);
  assert.equal(stats.weeklyShifts, db.shifts.length);
});

test('the weekly view starts on Monday and contains seven days', () => {
  const start = getWeekStart('2026-10-19');
  assert.equal(dateKey(start), '2026-10-19');
  const days = weekDates(start);
  assert.equal(days.length, 7);
  assert.equal(days[0], '2026-10-19');
  assert.equal(days[6], '2026-10-25');
  assert.equal(dateKey(addDays(start, 7)), '2026-10-26');
});

test('shift labels and display helpers remain consistent', () => {
  assert.equal(shiftMeta('morning').name, 'Morning');
  assert.equal(shiftMeta('afternoon').time, '14:00 - 20:00');
  assert.equal(shiftMeta('evening').name, 'Evening');
  assert.equal(formatCurrency(28), 'CN¥28');
  assert.match(tenureText('2025-01-01', new Date(2026, 0, 1)), /1 year/);
});
