# 系统设计与架构

## 1. 设计目标

- 在普通浏览器中直接运行，方便课堂演示和 GitHub Pages 部署。
- 将员工、排班、统计、库存和权限集中在同一工作台。
- 页面、纯业务函数和初始数据分离，便于后续替换为服务端接口。
- 权限判断集中管理，不在页面中散落角色字符串比较。

## 2. 运行结构

```text
index.html
  └─ assets/js/app.js
       ├─ core.js     纯函数：日期、筛选、校验、统计、权限
       ├─ data.js     初始演示数据
       ├─ localStorage
       └─ sessionStorage
```

### `core.js`

负责不依赖 DOM 的业务逻辑：

- 角色权限集合与 `can(role, permission)`
- 员工搜索、筛选与排序
- 员工表单校验
- 班次冲突检测
- 部门、状态、人力成本统计
- 周视图日期计算和展示格式化

这些函数可以在 Node.js 测试中直接调用。

### `data.js`

包含部门、员工、账号、班次、出勤、库存、补货申请和操作记录初始数据。班次与出勤日期以当前周为基准生成，避免打开项目时显示过期排班。

### `app.js`

负责：

- 登录和会话恢复
- URL 路由与角色分流
- 页面 HTML 渲染
- 表单、筛选和弹窗交互
- 本地数据持久化
- 权限按钮显示与隐藏
- 操作日志和提示消息

## 3. 数据模型

### Employee

```text
id              唯一标识
employeeNo      工号，格式 MT001
name            姓名
gender          性别
phone           手机号码
email           电子邮箱
address         居住地址
departmentId    所属部门
position        岗位
hourlyRate      时薪
hireDate        入职日期
status          active / leave / inactive
emergencyContact 紧急联系人
note            备注
```

### Shift

```text
id          唯一标识
employeeId  员工
date        工作日期
period      morning / afternoon / evening
station     岗位或区域
note        备注
createdAt   创建时间
createdBy   创建账号
```

约束：同一员工同一天同一班次不能重复安排。休假和离职员工不能新增班次。

### User

```text
id           唯一标识
username     登录账号
displayName  显示名称
role         hr / supervisor / employee
employeeId   关联员工
salt         密码盐
passwordHash SHA-256(salt + password)
```

### 其他实体

- `Department`：部门名称、颜色、负责主管、说明。
- `Attendance`：日期、签到、签退、状态。
- `InventoryItem`：SKU、名称、分类、当前库存、安全库存、货架。
- `RestockRequest`：申请商品、数量、申请人、状态和备注。
- `AuditLog`：操作账号、实体、摘要和时间。

## 4. 权限设计

权限由 `PERMISSIONS` 集合统一维护：

```text
HR:
  employee:read / create / update / delete
  department:read
  schedule:read
  stats:read
  accounts:read
  audit:read
  export:employees

Supervisor:
  employee:read
  department:read
  schedule:read / create / delete / auto
  stats:read
  inventory:read
  restock:read
  audit:read

Ordinary Employee:
  profile:self
  schedule:self
```

页面入口通过 `canVisit()` 二次校验，避免仅隐藏导航但仍可通过 URL 访问。普通员工的数据查询只使用当前账号关联的 `employeeId`。

## 5. 会话与密码

- 登录密码使用 Web Crypto SHA-256，以账号独立盐值计算摘要。
- 登录会话写入 `sessionStorage`，有效期 8 小时。
- 错误登录统一显示“账号或密码不正确”，不区分账号不存在和密码错误。
- 当前演示版不保存明文密码，但静态前端仍不能替代服务端安全边界。

## 6. 页面结构

| 页面 | HR | Supervisor | Ordinary Employee |
| --- | --- | --- | --- |
| 门店概览 | 是 | 是 | 否 |
| 员工档案/查询 | 完整管理 | 只读查询 | 否 |
| 部门概览 | 是 | 是 | 否 |
| 班次 | 只读 | 管理与自动补齐 | 仅本人 |
| 人员统计 | 是 | 是 | 否 |
| 库存 | 从概览可进入查看 | 是 | 否 |
| 角色与权限 | 是 | 否 | 否 |
| 操作记录 | 是 | 是 | 否 |
| 我的资料 | 否 | 否 | 是 |
| 我的班次 | 否 | 否 | 是 |

## 7. 生产环境迁移建议

当前版本是静态演示系统。真实门店使用时，建议按以下顺序迁移：

1. 保留 `core.js` 的校验与统计规则，将数据访问改为 REST API。
2. 服务端采用 Node.js、Java 或 Python 均可，数据库建议 PostgreSQL 或 MySQL。
3. 密码使用 Argon2id 或 bcrypt 加盐哈希，登录成功后签发 HttpOnly、Secure、SameSite Cookie。
4. 每个 API 都在服务端重新校验角色，不依赖前端隐藏按钮。
5. 员工删除采用软删除，保留审计与历史班次关联。
6. 排班新增使用数据库唯一约束防止并发重复分配。
7. 统计查询增加日期与部门索引，列表接口增加分页。
8. 敏感操作写入不可篡改审计表，并设置定期备份。

## 8. 性能考虑

- 当前数据量较小，筛选和统计在浏览器内存中完成。
- 静态资源不使用外部 CDN 或网络字体，首次加载后无需第三方请求。
- 页面切换只重绘对应区域，不刷新浏览器。
- 图表使用 CSS 和原生 SVG，不引入大型图表库。
- 响应式布局在 1180、920、720 和 430 像素设置断点。
