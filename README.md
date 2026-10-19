# 梅提商城员工管理系统

面向梅提商城郑州首店的员工管理演示系统，覆盖员工档案、部门查询、工作班次、人员统计、库存查看和角色权限。项目为纯前端静态应用，不需要安装依赖，可通过 GitHub Pages 直接访问。

## 在线地址

部署完成后访问：

`https://<github-username>.github.io/meiti-employee-management/`

## 演示账号

| 角色 | 账号 | 密码 | 主要权限 |
| --- | --- | --- | --- |
| HR | `hr.wang` | `Hr@2026` | 新增、编辑、删除、搜索员工；查看部门、排班和统计；调整账号角色 |
| Supervisor | `supervisor.chen` | `Shift@2026` | 查询员工；分配、删除和智能补齐班次；查看统计与库存 |
| Ordinary Employee | `employee.li` | `Staff@2026` | 查看本人资料与本人班次 |

登录页可以直接点击角色卡片填入对应账号。所有演示数据保存在当前浏览器的 `localStorage` 中，可以在左下角用户菜单中重置。

## 功能范围

- 员工档案增删改查、关键字搜索、部门与状态筛选、CSV 导出
- 员工详情、近期出勤和未来班次查看
- 部门人员、负责主管和部门时薪合计
- 上午、下午、晚班三个班次；按周查看与按员工筛选
- Supervisor 手动分配班次、删除班次和智能补齐
- 员工状态、部门分布、班次覆盖与人力成本统计
- 库存状态、安全库存预警和补货申请查看
- HR、Supervisor、Ordinary Employee 三类角色的页面与按钮级权限控制
- HR 查看并调整其他演示账号的角色
- 操作记录、登录会话过期与演示数据重置

## 技术栈

- HTML5
- CSS3，无 UI 框架
- 原生 JavaScript ES Modules
- Web Crypto API 进行密码摘要校验
- `localStorage` 保存演示数据
- `sessionStorage` 保存会话
- Node.js 内置测试运行器
- GitHub Actions + GitHub Pages

项目没有运行时第三方依赖，避免部署时出现包版本或网络字体问题。

## 本地运行

需要 Node.js 20 或更高版本。

```bash
npm start
```

浏览器打开 `http://localhost:4173`。

也可以使用任意静态文件服务器，例如：

```bash
python3 -m http.server 4173
```

## 测试

```bash
npm test
npm run check
```

测试覆盖角色权限、员工搜索与筛选、表单校验、班次冲突、统计汇总和周视图日期计算。浏览器验收记录见 `docs/testing.md`。

## 目录结构

```text
.
├── assets/
│   ├── css/styles.css
│   ├── images/
│   └── js/
│       ├── app.js       # 页面、交互与权限控制
│       ├── core.js      # 纯函数、校验、日期和统计
│       └── data.js      # 初始演示数据
├── docs/
│   ├── architecture.md
│   ├── requirements-traceability.md
│   ├── testing.md
│   └── use-cases.md
├── scripts/serve.js
├── tests/core.test.js
├── index.html
└── package.json
```

## 数据说明

演示版本使用浏览器本地存储，适合课程展示、原型确认和前端验收。不同浏览器或不同设备之间不会同步数据。

如果用于真实门店，需要将 `assets/js/data.js` 的初始数据和 `localStorage` 读写替换为服务端 API，并使用 PostgreSQL、MySQL 或 SQLite 保存数据。账号密码必须在服务端加盐哈希，接口需要鉴权、角色校验、审计日志和备份策略。具体迁移边界见 `docs/architecture.md`。

## GitHub Pages 部署

仓库已包含 `.github/workflows/pages.yml`。将代码推送到 `main` 分支后：

1. 打开仓库的 **Settings → Pages**。
2. 在 **Build and deployment** 中将 Source 设为 **GitHub Actions**。
3. 等待 `Deploy static site to GitHub Pages` 工作流完成。
4. 在 Actions 或 Pages 设置中获取公开地址。

## 浏览器支持

支持当前版本的 Chrome、Edge、Safari 和 Firefox。系统使用 ES Modules、Web Crypto、CSS Grid 和 `color-mix()`，不建议使用 Internet Explorer。
