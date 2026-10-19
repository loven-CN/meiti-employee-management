import {
  addDays, dateKey, getWeekStart, weekDates,
} from './core.js';

const departments = [
  { id: 'd1', name: '门店运营', color: '#2f6b4f', managerId: 'e001', description: '负责门店日常运营、值班秩序与现场协调' },
  { id: 'd2', name: '仓储物流', color: '#c57a35', managerId: 'e005', description: '负责到货验收、库位整理与补货配送' },
  { id: 'd3', name: '销售服务', color: '#426d8b', managerId: 'e009', description: '负责顾客接待、商品介绍与售后跟进' },
  { id: 'd4', name: '行政人事', color: '#76664f', managerId: 'e002', description: '负责员工档案、制度执行与行政事务' },
];

const employees = [
  {
    id: 'e001', employeeNo: 'MT001', name: '陈思远', gender: '男', phone: '13837126541',
    email: 'siyuan.chen@meiti.example', address: '郑州市金水区花园路 88 号',
    departmentId: 'd1', position: '门店主管', hourlyRate: 46, hireDate: '2023-03-13',
    status: 'active', emergencyContact: '陈建国 13937100218', note: '负责门店排班与现场管理',
  },
  {
    id: 'e002', employeeNo: 'MT002', name: '王敏', gender: '女', phone: '13733876920',
    email: 'min.wang@meiti.example', address: '郑州市中原区嵩山路 126 号',
    departmentId: 'd4', position: '人事专员', hourlyRate: 42, hireDate: '2023-05-08',
    status: 'active', emergencyContact: '王海峰 13603715362', note: '员工档案与入离职手续负责人',
  },
  {
    id: 'e003', employeeNo: 'MT003', name: '李佳宁', gender: '女', phone: '15137168234',
    email: 'jianing.li@meiti.example', address: '郑州市二七区大学路 52 号',
    departmentId: 'd1', position: '收银员', hourlyRate: 28, hireDate: '2024-02-19',
    status: 'active', emergencyContact: '李秀兰 13526581944', note: '',
  },
  {
    id: 'e004', employeeNo: 'MT004', name: '赵一凡', gender: '男', phone: '13938214756',
    email: 'yifan.zhao@meiti.example', address: '郑州市管城区航海路 201 号',
    departmentId: 'd2', position: '理货员', hourlyRate: 26, hireDate: '2024-04-07',
    status: 'active', emergencyContact: '赵红卫 13838590671', note: '',
  },
  {
    id: 'e005', employeeNo: 'MT005', name: '孙浩', gender: '男', phone: '13673982145',
    email: 'hao.sun@meiti.example', address: '郑州市金水区东风路 66 号',
    departmentId: 'd2', position: '仓储主管', hourlyRate: 40, hireDate: '2022-11-21',
    status: 'active', emergencyContact: '刘芳 13603718652', note: '负责仓储安全与补货审核',
  },
  {
    id: 'e006', employeeNo: 'MT006', name: '周雨桐', gender: '女', phone: '15837142903',
    email: 'yutong.zhou@meiti.example', address: '郑州市惠济区江山路 35 号',
    departmentId: 'd3', position: '销售顾问', hourlyRate: 30, hireDate: '2024-06-17',
    status: 'active', emergencyContact: '周立新 15937120478', note: '',
  },
  {
    id: 'e007', employeeNo: 'MT007', name: '吴倩', gender: '女', phone: '15038276019',
    email: 'qian.wu@meiti.example', address: '郑州市中原区建设路 187 号',
    departmentId: 'd3', position: '客服专员', hourlyRate: 29, hireDate: '2024-08-12',
    status: 'leave', emergencyContact: '吴振华 13503711320', note: '预计 11 月返岗',
  },
  {
    id: 'e008', employeeNo: 'MT008', name: '郑凯', gender: '男', phone: '13213087543',
    email: 'kai.zheng@meiti.example', address: '郑州市二七区京广路 73 号',
    departmentId: 'd2', position: '理货员', hourlyRate: 26, hireDate: '2025-01-06',
    status: 'active', emergencyContact: '郑丽 15837102846', note: '',
  },
  {
    id: 'e009', employeeNo: 'MT009', name: '何晓雨', gender: '女', phone: '18637152608',
    email: 'xiaoyu.he@meiti.example', address: '郑州市金水区农业路 109 号',
    departmentId: 'd3', position: '销售主管', hourlyRate: 39, hireDate: '2023-09-04',
    status: 'active', emergencyContact: '何建平 13733861572', note: '负责销售服务组现场事务',
  },
  {
    id: 'e010', employeeNo: 'MT010', name: '冯博', gender: '男', phone: '15537190462',
    email: 'bo.feng@meiti.example', address: '郑州市高新区瑞达路 18 号',
    departmentId: 'd1', position: '收银员', hourlyRate: 27, hireDate: '2025-03-10',
    status: 'active', emergencyContact: '冯志强 15137152039', note: '',
  },
  {
    id: 'e011', employeeNo: 'MT011', name: '许文静', gender: '女', phone: '15738341269',
    email: 'wenjing.xu@meiti.example', address: '郑州市郑东新区商都路 23 号',
    departmentId: 'd4', position: '行政助理', hourlyRate: 31, hireDate: '2025-05-19',
    status: 'active', emergencyContact: '许国平 13938217056', note: '',
  },
  {
    id: 'e012', employeeNo: 'MT012', name: '马晨', gender: '男', phone: '13461892730',
    email: 'chen.ma@meiti.example', address: '郑州市经开区经北二路 9 号',
    departmentId: 'd2', position: '仓储专员', hourlyRate: 28, hireDate: '2025-07-14',
    status: 'active', emergencyContact: '马俊峰 13526598310', note: '',
  },
  {
    id: 'e013', employeeNo: 'MT013', name: '罗雪', gender: '女', phone: '18937105842',
    email: 'xue.luo@meiti.example', address: '郑州市中原区秦岭路 47 号',
    departmentId: 'd3', position: '销售顾问', hourlyRate: 29, hireDate: '2025-08-25',
    status: 'active', emergencyContact: '罗志远 13837162405', note: '',
  },
  {
    id: 'e014', employeeNo: 'MT014', name: '高远', gender: '男', phone: '15238670514',
    email: 'yuan.gao@meiti.example', address: '郑州市金水区国基路 156 号',
    departmentId: 'd2', position: '理货员', hourlyRate: 25, hireDate: '2026-01-12',
    status: 'active', emergencyContact: '高淑英 15937145028', note: '',
  },
  {
    id: 'e015', employeeNo: 'MT015', name: '唐悦', gender: '女', phone: '17637124938',
    email: 'yue.tang@meiti.example', address: '郑州市管城区城东路 64 号',
    departmentId: 'd1', position: '收银员', hourlyRate: 27, hireDate: '2026-03-02',
    status: 'active', emergencyContact: '唐明礼 13733847160', note: '',
  },
  {
    id: 'e016', employeeNo: 'MT016', name: '邵明', gender: '男', phone: '18538017264',
    email: 'ming.shao@meiti.example', address: '郑州市二七区兴华街 31 号',
    departmentId: 'd3', position: '维修顾问', hourlyRate: 35, hireDate: '2024-10-14',
    status: 'inactive', emergencyContact: '邵春霞 13213075891', note: '2026 年 8 月离职',
  },
];

const users = [
  {
    id: 'u001', username: 'hr.wang', displayName: '王敏', role: 'hr', employeeId: 'e002',
    salt: 'meiti-hr-01', passwordHash: 'a081ec13ea4e355df5ada64656e11ce24b3685310724d6714f88e5e14dfaf837',
  },
  {
    id: 'u002', username: 'supervisor.chen', displayName: '陈思远', role: 'supervisor', employeeId: 'e001',
    salt: 'meiti-sup-02', passwordHash: 'e45cd3b79a78c6a371d92ed68d9d4914426c463485f92cc42d50d0009246807c',
  },
  {
    id: 'u003', username: 'employee.li', displayName: '李佳宁', role: 'employee', employeeId: 'e003',
    salt: 'meiti-emp-03', passwordHash: 'd5b92d086c947825ae72f7c315da0b077cd0cbb036d29554b4da06299547ccf9',
  },
];

function buildShifts() {
  const start = getWeekStart(new Date());
  const days = weekDates(start);
  const plan = [
    [0, 'morning', 'e003', '一号收银台'], [0, 'afternoon', 'e010', '二号收银台'],
    [0, 'evening', 'e015', '一号收银台'], [0, 'morning', 'e004', 'A 区补货'],
    [0, 'afternoon', 'e008', 'B 区补货'], [1, 'morning', 'e006', '销售区'],
    [1, 'afternoon', 'e013', '销售区'], [1, 'evening', 'e003', '一号收银台'],
    [2, 'morning', 'e010', '二号收银台'], [2, 'afternoon', 'e015', '一号收银台'],
    [2, 'evening', 'e004', 'A 区补货'], [3, 'morning', 'e008', 'B 区补货'],
    [3, 'afternoon', 'e006', '销售区'], [3, 'evening', 'e013', '售后接待'],
    [4, 'morning', 'e003', '一号收银台'], [4, 'afternoon', 'e010', '二号收银台'],
    [4, 'evening', 'e015', '一号收银台'], [4, 'morning', 'e012', '收货区'],
    [5, 'morning', 'e006', '销售区'], [5, 'afternoon', 'e013', '销售区'],
    [5, 'evening', 'e003', '一号收银台'], [6, 'morning', 'e004', 'A 区补货'],
    [6, 'afternoon', 'e008', 'B 区补货'], [6, 'evening', 'e010', '二号收银台'],
  ];
  return plan.map(([dayIndex, period, employeeId, station], index) => ({
    id: `s${String(index + 1).padStart(3, '0')}`,
    date: days[dayIndex], period, employeeId, station, note: '',
    createdAt: new Date(start.getTime() - 86400000 + index * 60000).toISOString(),
    createdBy: 'u002',
  }));
}

function buildAttendance() {
  const today = new Date();
  const records = [];
  const staff = ['e003', 'e004', 'e006', 'e010', 'e013'];
  for (let offset = 1; offset <= 6; offset += 1) {
    const day = dateKey(addDays(today, -offset));
    staff.forEach((employeeId, index) => {
      const isLate = offset === 2 && index === 1;
      const isLeave = offset === 4 && index === 3;
      records.push({
        id: `a-${offset}-${employeeId}`,
        employeeId,
        date: day,
        checkIn: isLeave ? '' : isLate ? '08:12' : '07:56',
        checkOut: isLeave ? '' : '16:03',
        status: isLeave ? 'leave' : isLate ? 'late' : 'normal',
      });
    });
  }
  return records;
}

const inventory = [
  { sku: 'MT-HW-1001', name: '不锈钢内六角螺栓 M8', category: '紧固件', stock: 126, minStock: 80, unit: '盒', shelf: 'A-03-02' },
  { sku: 'MT-HW-1002', name: '镀锌平垫圈 M10', category: '紧固件', stock: 42, minStock: 60, unit: '盒', shelf: 'A-04-01' },
  { sku: 'MT-TL-2014', name: '棘轮扳手套装 24 件', category: '手动工具', stock: 18, minStock: 12, unit: '套', shelf: 'B-01-04' },
  { sku: 'MT-TL-2021', name: '橡塑羊角锤 16oz', category: '手动工具', stock: 7, minStock: 15, unit: '把', shelf: 'B-02-03' },
  { sku: 'MT-EL-3006', name: '两孔插座 16A', category: '电工材料', stock: 65, minStock: 40, unit: '只', shelf: 'C-02-01' },
  { sku: 'MT-EL-3012', name: '阻燃电线 BV 2.5mm²', category: '电工材料', stock: 24, minStock: 50, unit: '卷', shelf: 'C-03-05' },
  { sku: 'MT-PA-4008', name: '外墙乳胶漆 18L', category: '涂料辅料', stock: 9, minStock: 10, unit: '桶', shelf: 'D-01-02' },
  { sku: 'MT-SA-5003', name: '防割手套 L 码', category: '劳保用品', stock: 118, minStock: 70, unit: '双', shelf: 'E-02-04' },
];

const restockRequests = [
  { id: 'r001', sku: 'MT-HW-1002', requestedQty: 40, requestedBy: '赵一凡', requestedAt: '2026-10-18T09:20:00+08:00', status: 'pending', note: 'A 区货架库存偏低' },
  { id: 'r002', sku: 'MT-EL-3012', requestedQty: 30, requestedBy: '马晨', requestedAt: '2026-10-18T14:05:00+08:00', status: 'pending', note: '周末前补齐' },
  { id: 'r003', sku: 'MT-TL-2021', requestedQty: 18, requestedBy: '高远', requestedAt: '2026-10-17T16:32:00+08:00', status: 'processing', note: '已联系供应商' },
  { id: 'r004', sku: 'MT-PA-4008', requestedQty: 12, requestedBy: '郑凯', requestedAt: '2026-10-16T11:10:00+08:00', status: 'completed', note: '' },
  { id: 'r005', sku: 'MT-EL-3012', requestedQty: 20, requestedBy: '赵一凡', requestedAt: '2026-10-15T10:46:00+08:00', status: 'completed', note: '' },
];

const auditLogs = [
  { id: 'l001', userId: 'u002', action: 'create', entity: 'shift', summary: '为唐悦分配 10 月 18 日下午班', at: '2026-10-18T10:24:00+08:00' },
  { id: 'l002', userId: 'u001', action: 'update', entity: 'employee', summary: '更新员工郑凯的联系电话', at: '2026-10-17T15:42:00+08:00' },
  { id: 'l003', userId: 'u002', action: 'create', entity: 'shift', summary: '为陈思远分配门店值班', at: '2026-10-16T09:18:00+08:00' },
  { id: 'l004', userId: 'u001', action: 'create', entity: 'employee', summary: '录入新员工高远的档案', at: '2026-10-15T13:06:00+08:00' },
];

export function createSeedData() {
  return {
    version: 1,
    company: {
      name: '梅提商城',
      shortName: 'MEITI',
      city: '郑州',
      storeName: '郑州首店',
    },
    departments,
    employees,
    users,
    shifts: buildShifts(),
    attendance: buildAttendance(),
    inventory,
    restockRequests,
    auditLogs,
    createdAt: new Date().toISOString(),
  };
}
