import {
  addDays, dateKey, getWeekStart, weekDates,
} from './core.js';

const departments = [
  { id: 'd1', name: 'Store Operations', color: '#2f6b4f', managerId: 'e001', description: 'Runs daily store operations, shift order, and floor coordination' },
  { id: 'd2', name: 'Warehouse & Logistics', color: '#c57a35', managerId: 'e005', description: 'Handles receiving, shelf organization, and replenishment delivery' },
  { id: 'd3', name: 'Sales & Service', color: '#426d8b', managerId: 'e009', description: 'Supports customer service, product guidance, and after-sales follow-up' },
  { id: 'd4', name: 'Administration & HR', color: '#76664f', managerId: 'e002', description: 'Maintains employee records, policy compliance, and administrative matters' },
];

const employees = [
  {
    id: 'e001', employeeNo: 'MT001', name: 'Siyuan Chen', gender: 'Male', phone: '13837126541',
    email: 'siyuan.chen@meiti.example', address: '88 Huayuan Road, Jinshui District, Zhengzhou',
    departmentId: 'd1', position: 'Store Supervisor', hourlyRate: 46, hireDate: '2023-03-13',
    status: 'active', emergencyContact: 'Jianguo Chen 13937100218', note: 'Manages store scheduling and floor operations',
  },
  {
    id: 'e002', employeeNo: 'MT002', name: 'Min Wang', gender: 'Female', phone: '13733876920',
    email: 'min.wang@meiti.example', address: '126 Songshan Road, Zhongyuan District, Zhengzhou',
    departmentId: 'd4', position: 'HR Specialist', hourlyRate: 42, hireDate: '2023-05-08',
    status: 'active', emergencyContact: 'Haifeng Wang 13603715362', note: 'Responsible for employee records and onboarding and offboarding',
  },
  {
    id: 'e003', employeeNo: 'MT003', name: 'Jianing Li', gender: 'Female', phone: '15137168234',
    email: 'jianing.li@meiti.example', address: '52 Daxue Road, Erqi District, Zhengzhou',
    departmentId: 'd1', position: 'Cashier', hourlyRate: 28, hireDate: '2024-02-19',
    status: 'active', emergencyContact: 'Xiulan Li 13526581944', note: '',
  },
  {
    id: 'e004', employeeNo: 'MT004', name: 'Yifan Zhao', gender: 'Male', phone: '13938214756',
    email: 'yifan.zhao@meiti.example', address: '201 Hanghai Road, Guancheng District, Zhengzhou',
    departmentId: 'd2', position: 'Stock Associate', hourlyRate: 26, hireDate: '2024-04-07',
    status: 'active', emergencyContact: 'Hongwei Zhao 13838590671', note: '',
  },
  {
    id: 'e005', employeeNo: 'MT005', name: 'Hao Sun', gender: 'Male', phone: '13673982145',
    email: 'hao.sun@meiti.example', address: '66 Dongfeng Road, Jinshui District, Zhengzhou',
    departmentId: 'd2', position: 'Warehouse Supervisor', hourlyRate: 40, hireDate: '2022-11-21',
    status: 'active', emergencyContact: 'Fang Liu 13603718652', note: 'Oversees warehouse safety and restock approvals',
  },
  {
    id: 'e006', employeeNo: 'MT006', name: 'Yutong Zhou', gender: 'Female', phone: '15837142903',
    email: 'yutong.zhou@meiti.example', address: '35 Jiangshan Road, Huiji District, Zhengzhou',
    departmentId: 'd3', position: 'Sales Consultant', hourlyRate: 30, hireDate: '2024-06-17',
    status: 'active', emergencyContact: 'Lixin Zhou 15937120478', note: '',
  },
  {
    id: 'e007', employeeNo: 'MT007', name: 'Qian Wu', gender: 'Female', phone: '15038276019',
    email: 'qian.wu@meiti.example', address: '187 Jianshe Road, Zhongyuan District, Zhengzhou',
    departmentId: 'd3', position: 'Customer Service Specialist', hourlyRate: 29, hireDate: '2024-08-12',
    status: 'leave', emergencyContact: 'Zhenhua Wu 13503711320', note: 'Expected to return in November',
  },
  {
    id: 'e008', employeeNo: 'MT008', name: 'Kai Zheng', gender: 'Male', phone: '13213087543',
    email: 'kai.zheng@meiti.example', address: '73 Jingguang Road, Erqi District, Zhengzhou',
    departmentId: 'd2', position: 'Stock Associate', hourlyRate: 26, hireDate: '2025-01-06',
    status: 'active', emergencyContact: 'Li Zheng 15837102846', note: '',
  },
  {
    id: 'e009', employeeNo: 'MT009', name: 'Xiaoyu He', gender: 'Female', phone: '18637152608',
    email: 'xiaoyu.he@meiti.example', address: '109 Nongye Road, Jinshui District, Zhengzhou',
    departmentId: 'd3', position: 'Sales Supervisor', hourlyRate: 39, hireDate: '2023-09-04',
    status: 'active', emergencyContact: 'Jianping He 13733861572', note: 'Manages daily operations for the sales and service team',
  },
  {
    id: 'e010', employeeNo: 'MT010', name: 'Bo Feng', gender: 'Male', phone: '15537190462',
    email: 'bo.feng@meiti.example', address: '18 Ruida Road, High-Tech Zone, Zhengzhou',
    departmentId: 'd1', position: 'Cashier', hourlyRate: 27, hireDate: '2025-03-10',
    status: 'active', emergencyContact: 'Zhiqiang Feng 15137152039', note: '',
  },
  {
    id: 'e011', employeeNo: 'MT011', name: 'Wenjing Xu', gender: 'Female', phone: '15738341269',
    email: 'wenjing.xu@meiti.example', address: '23 Shangdu Road, Zhengdong New District, Zhengzhou',
    departmentId: 'd4', position: 'Administrative Assistant', hourlyRate: 31, hireDate: '2025-05-19',
    status: 'active', emergencyContact: 'Guoping Xu 13938217056', note: '',
  },
  {
    id: 'e012', employeeNo: 'MT012', name: 'Chen Ma', gender: 'Male', phone: '13461892730',
    email: 'chen.ma@meiti.example', address: '9 Jingbei 2nd Road, Economic Development Zone, Zhengzhou',
    departmentId: 'd2', position: 'Warehouse Specialist', hourlyRate: 28, hireDate: '2025-07-14',
    status: 'active', emergencyContact: 'Junfeng Ma 13526598310', note: '',
  },
  {
    id: 'e013', employeeNo: 'MT013', name: 'Xue Luo', gender: 'Female', phone: '18937105842',
    email: 'xue.luo@meiti.example', address: '47 Qinling Road, Zhongyuan District, Zhengzhou',
    departmentId: 'd3', position: 'Sales Consultant', hourlyRate: 29, hireDate: '2025-08-25',
    status: 'active', emergencyContact: 'Zhiyuan Luo 13837162405', note: '',
  },
  {
    id: 'e014', employeeNo: 'MT014', name: 'Yuan Gao', gender: 'Male', phone: '15238670514',
    email: 'yuan.gao@meiti.example', address: '156 Guoji Road, Jinshui District, Zhengzhou',
    departmentId: 'd2', position: 'Stock Associate', hourlyRate: 25, hireDate: '2026-01-12',
    status: 'active', emergencyContact: 'Shuying Gao 15937145028', note: '',
  },
  {
    id: 'e015', employeeNo: 'MT015', name: 'Yue Tang', gender: 'Female', phone: '17637124938',
    email: 'yue.tang@meiti.example', address: '64 Chengdong Road, Guancheng District, Zhengzhou',
    departmentId: 'd1', position: 'Cashier', hourlyRate: 27, hireDate: '2026-03-02',
    status: 'active', emergencyContact: 'Mingli Tang 13733847160', note: '',
  },
  {
    id: 'e016', employeeNo: 'MT016', name: 'Ming Shao', gender: 'Male', phone: '18538017264',
    email: 'ming.shao@meiti.example', address: '31 Xinghua Street, Erqi District, Zhengzhou',
    departmentId: 'd3', position: 'Maintenance Consultant', hourlyRate: 35, hireDate: '2024-10-14',
    status: 'inactive', emergencyContact: 'Chunxia Shao 13213075891', note: 'Left the company in August 2026',
  },
];

const users = [
  {
    id: 'u001', username: 'hr.wang', displayName: 'Min Wang', role: 'hr', employeeId: 'e002',
    salt: 'meiti-hr-01', passwordHash: 'a081ec13ea4e355df5ada64656e11ce24b3685310724d6714f88e5e14dfaf837',
  },
  {
    id: 'u002', username: 'supervisor.chen', displayName: 'Siyuan Chen', role: 'supervisor', employeeId: 'e001',
    salt: 'meiti-sup-02', passwordHash: 'e45cd3b79a78c6a371d92ed68d9d4914426c463485f92cc42d50d0009246807c',
  },
  {
    id: 'u003', username: 'employee.li', displayName: 'Jianing Li', role: 'employee', employeeId: 'e003',
    salt: 'meiti-emp-03', passwordHash: 'd5b92d086c947825ae72f7c315da0b077cd0cbb036d29554b4da06299547ccf9',
  },
];

function buildShifts() {
  const start = getWeekStart(new Date());
  const days = weekDates(start);
  const plan = [
    [0, 'morning', 'e003', 'Register 1'], [0, 'afternoon', 'e010', 'Register 2'],
    [0, 'evening', 'e015', 'Register 1'], [0, 'morning', 'e004', 'Aisle A Replenishment'],
    [0, 'afternoon', 'e008', 'Aisle B Replenishment'], [1, 'morning', 'e006', 'Sales Floor'],
    [1, 'afternoon', 'e013', 'Sales Floor'], [1, 'evening', 'e003', 'Register 1'],
    [2, 'morning', 'e010', 'Register 2'], [2, 'afternoon', 'e015', 'Register 1'],
    [2, 'evening', 'e004', 'Aisle A Replenishment'], [3, 'morning', 'e008', 'Aisle B Replenishment'],
    [3, 'afternoon', 'e006', 'Sales Floor'], [3, 'evening', 'e013', 'After-sales Desk'],
    [4, 'morning', 'e003', 'Register 1'], [4, 'afternoon', 'e010', 'Register 2'],
    [4, 'evening', 'e015', 'Register 1'], [4, 'morning', 'e012', 'Receiving Area'],
    [5, 'morning', 'e006', 'Sales Floor'], [5, 'afternoon', 'e013', 'Sales Floor'],
    [5, 'evening', 'e003', 'Register 1'], [6, 'morning', 'e004', 'Aisle A Replenishment'],
    [6, 'afternoon', 'e008', 'Aisle B Replenishment'], [6, 'evening', 'e010', 'Register 2'],
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
  { sku: 'MT-HW-1001', name: 'Stainless Steel Hex Bolts M8', category: 'Fasteners', stock: 126, minStock: 80, unit: 'box', shelf: 'A-03-02' },
  { sku: 'MT-HW-1002', name: 'Zinc-Plated Flat Washers M10', category: 'Fasteners', stock: 42, minStock: 60, unit: 'box', shelf: 'A-04-01' },
  { sku: 'MT-TL-2014', name: '24-Piece Ratchet Wrench Set', category: 'Hand Tools', stock: 18, minStock: 12, unit: 'set', shelf: 'B-01-04' },
  { sku: 'MT-TL-2021', name: 'Rubber Mallet 16oz', category: 'Hand Tools', stock: 7, minStock: 15, unit: 'pc', shelf: 'B-02-03' },
  { sku: 'MT-EL-3006', name: 'Duplex Outlet 16A', category: 'Electrical', stock: 65, minStock: 40, unit: 'pc', shelf: 'C-02-01' },
  { sku: 'MT-EL-3012', name: 'Flame-Retardant Wire BV 2.5mm²', category: 'Electrical', stock: 24, minStock: 50, unit: 'roll', shelf: 'C-03-05' },
  { sku: 'MT-PA-4008', name: 'Exterior Latex Paint 18L', category: 'Paint & Supplies', stock: 9, minStock: 10, unit: 'bucket', shelf: 'D-01-02' },
  { sku: 'MT-SA-5003', name: 'Cut-Resistant Gloves L', category: 'Safety Equipment', stock: 118, minStock: 70, unit: 'pair', shelf: 'E-02-04' },
];

const restockRequests = [
  { id: 'r001', sku: 'MT-HW-1002', requestedQty: 40, requestedBy: 'Yifan Zhao', requestedAt: '2026-10-18T09:20:00+08:00', status: 'pending', note: 'Aisle A stock is low' },
  { id: 'r002', sku: 'MT-EL-3012', requestedQty: 30, requestedBy: 'Chen Ma', requestedAt: '2026-10-18T14:05:00+08:00', status: 'pending', note: 'Replenish before the weekend' },
  { id: 'r003', sku: 'MT-TL-2021', requestedQty: 18, requestedBy: 'Yuan Gao', requestedAt: '2026-10-17T16:32:00+08:00', status: 'processing', note: 'Supplier contacted' },
  { id: 'r004', sku: 'MT-PA-4008', requestedQty: 12, requestedBy: 'Kai Zheng', requestedAt: '2026-10-16T11:10:00+08:00', status: 'completed', note: '' },
  { id: 'r005', sku: 'MT-EL-3012', requestedQty: 20, requestedBy: 'Yifan Zhao', requestedAt: '2026-10-15T10:46:00+08:00', status: 'completed', note: '' },
];

const auditLogs = [
  { id: 'l001', userId: 'u002', action: 'create', entity: 'shift', summary: 'Assigned Yue Tang to the October 18 afternoon shift', at: '2026-10-18T10:24:00+08:00' },
  { id: 'l002', userId: 'u001', action: 'update', entity: 'employee', summary: 'Updated Kai Zheng\'s contact number', at: '2026-10-17T15:42:00+08:00' },
  { id: 'l003', userId: 'u002', action: 'create', entity: 'shift', summary: 'Assigned Siyuan Chen to store duty', at: '2026-10-16T09:18:00+08:00' },
  { id: 'l004', userId: 'u001', action: 'create', entity: 'employee', summary: 'Added Yuan Gao\'s employee record', at: '2026-10-15T13:06:00+08:00' },
];

export function createSeedData() {
  return {
    version: 2,
    company: {
      name: 'Meiti Mall',
      shortName: 'MEITI',
      city: 'Zhengzhou',
      storeName: 'Zhengzhou Flagship Store',
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
