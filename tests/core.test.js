import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeedData } from '../assets/js/data.js';
import {
  can, filterEmployees, sortEmployees, validateEmployee, hasShiftConflict,
  computeStats, getWeekStart, dateKey, weekDates, addDays, shiftMeta,
  tenureText, formatCurrency,
} from '../assets/js/core.js';

const db = createSeedData();

test('角色权限按 HR、Supervisor、普通员工隔离', () => {
  assert.equal(can('hr', 'employee:delete'), true);
  assert.equal(can('hr', 'schedule:create'), false);
  assert.equal(can('supervisor', 'employee:read'), true);
  assert.equal(can('supervisor', 'employee:delete'), false);
  assert.equal(can('supervisor', 'schedule:create'), true);
  assert.equal(can('employee', 'employee:read'), false);
  assert.equal(can('employee', 'profile:self'), true);
});

test('员工搜索支持姓名、工号和岗位', () => {
  assert.equal(filterEmployees(db.employees, { query: '陈思远' }).length, 1);
  assert.equal(filterEmployees(db.employees, { query: 'MT005' })[0].name, '孙浩');
  assert.equal(filterEmployees(db.employees, { query: '收银员' }).length >= 3, true);
});

test('员工筛选条件可以组合使用', () => {
  const result = filterEmployees(db.employees, {
    departmentId: 'd2', status: 'active', query: '理货员',
  });
  assert.equal(result.every((employee) => employee.departmentId === 'd2'), true);
  assert.equal(result.every((employee) => employee.status === 'active'), true);
  assert.equal(result.some((employee) => employee.name === '赵一凡'), true);
});

test('员工排序支持姓名与时薪', () => {
  const byRate = sortEmployees(db.employees, 'hourlyRate', 'desc');
  assert.equal(byRate[0].hourlyRate >= byRate[1].hourlyRate, true);
  const byName = sortEmployees(db.employees.slice(0, 4), 'name', 'asc');
  assert.equal(byName.length, 4);
  assert.equal(new Set(byName.map((item) => item.id)).size, 4);
});

test('员工表单校验能拦截重复工号与错误联系方式', () => {
  const candidate = {
    ...db.employees[0], name: '测试员工', phone: '123', email: 'bad-email', hourlyRate: 5,
  };
  const result = validateEmployee(candidate, db.employees, db.departments);
  assert.equal(result.valid, false);
  assert.ok(result.errors.employeeNo);
  assert.ok(result.errors.phone);
  assert.ok(result.errors.email);
  assert.ok(result.errors.hourlyRate);
});

test('员工表单校验接受合法的新档案', () => {
  const result = validateEmployee({
    employeeNo: 'MT099', name: '测试员工', phone: '13800138000',
    email: 'staff@meiti.example', address: '郑州市测试路 1 号', departmentId: 'd1',
    position: '理货员', hourlyRate: 26, hireDate: '2026-10-19', status: 'active',
  }, db.employees, db.departments);
  assert.equal(result.valid, true);
});

test('同一员工同一天同一班次不能重复分配', () => {
  const existing = db.shifts[0];
  assert.equal(hasShiftConflict(db.shifts, {
    employeeId: existing.employeeId, date: existing.date, period: existing.period,
  }), true);
  assert.equal(hasShiftConflict(db.shifts, {
    employeeId: existing.employeeId, date: existing.date, period: 'evening',
  }), false);
});

test('统计数据正确汇总总数、状态和部门', () => {
  const stats = computeStats(db.employees, db.departments, db.shifts);
  assert.equal(stats.total, db.employees.length);
  assert.equal(stats.active + stats.leave + stats.inactive, stats.total);
  assert.equal(stats.departmentCounts.reduce((sum, item) => sum + item.count, 0), stats.total);
  assert.equal(stats.weeklyShifts, db.shifts.length);
});

test('周视图从周一开始并包含七天', () => {
  const start = getWeekStart('2026-10-19');
  assert.equal(dateKey(start), '2026-10-19');
  const days = weekDates(start);
  assert.equal(days.length, 7);
  assert.equal(days[0], '2026-10-19');
  assert.equal(days[6], '2026-10-25');
  assert.equal(dateKey(addDays(start, 7)), '2026-10-26');
});

test('班次时段与展示辅助函数保持一致', () => {
  assert.equal(shiftMeta('morning').name, '上午班');
  assert.equal(shiftMeta('afternoon').time, '14:00 - 20:00');
  assert.equal(shiftMeta('evening').name, '晚班');
  assert.equal(formatCurrency(28), '¥28');
  assert.match(tenureText('2025-01-01', new Date(2026, 0, 1)), /1 年/);
});
