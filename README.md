# Meiti Mall Employee Management

A browser-based employee management system for the Meiti Mall Zhengzhou Flagship Store. It covers employee records, department views, work shifts, workforce statistics, inventory visibility, and role-based access. The project is a dependency-free static application and can be published directly with GitHub Pages.

## Live Site

[https://loven-cn.github.io/meiti-employee-management/](https://loven-cn.github.io/meiti-employee-management/)

Repository: [https://github.com/loven-CN/meiti-employee-management](https://github.com/loven-CN/meiti-employee-management)

## Demo Accounts

| Role | Username | Password | Main access |
| --- | --- | --- | --- |
| HR | `hr.wang` | `Hr@2026` | Add, edit, delete, and search employee records; view departments, schedules, and statistics; change account roles |
| Supervisor | `supervisor.chen` | `Shift@2026` | Search employees; assign, delete, and auto-fill shifts; view statistics and inventory |
| Ordinary Employee | `employee.li` | `Staff@2026` | View own profile and own shifts |

The role cards on the sign-in page fill the matching demo credentials. All demo data is stored in the browser's `localStorage` and can be reset from the user menu in the lower-left corner.

## Features

- Employee record create, read, update, and delete operations
- Keyword search and department/status filters
- Employee details, recent attendance, and upcoming shifts
- Department headcount, manager, and total hourly-rate views
- Morning, afternoon, and evening shifts
- Weekly schedule view with employee filtering
- Supervisor shift assignment, deletion, and auto-fill
- Employee status, department distribution, shift coverage, and labor-cost statistics
- Inventory status, safety-stock warnings, and restock requests
- Page and action permissions for HR, Supervisor, and Ordinary Employee
- HR role changes for other demo accounts
- Activity log, session expiration, and demo-data reset

## Technology

- HTML5
- CSS3 with no UI framework
- Native JavaScript ES Modules
- Web Crypto API for password digest verification
- `localStorage` for demo data
- `sessionStorage` for the signed-in session
- Node.js built-in test runner
- GitHub Actions and GitHub Pages

The application has no runtime third-party dependencies, so deployment does not depend on package versions, external fonts, or CDN availability.

## Run Locally

Use Node.js 20 or later.

```bash
npm start
```

Open `http://localhost:4173` in a browser.

Any static file server can also be used:

```bash
python3 -m http.server 4173
```

## Tests

```bash
npm test
npm run check
```

The tests cover role permissions, employee search and filtering, form validation, shift conflicts, statistics, and weekly date calculations. Browser acceptance results are recorded in `docs/testing.md`.

## Project Structure

```text
.
├── assets/
│   ├── css/styles.css
│   ├── images/
│   └── js/
│       ├── app.js       # Pages, interactions, and permission control
│       ├── core.js      # Pure functions, validation, dates, and statistics
│       └── data.js      # Initial demo data
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

## Data Notes

The demo uses browser-local storage for course presentations, prototype review, and front-end acceptance. Data does not sync between browsers or devices.

For a real store deployment, replace the initial data in `assets/js/data.js` and the `localStorage` access with a server API. Use PostgreSQL, MySQL, or SQLite for persistent storage. Passwords must be salted and hashed on the server, and the API must enforce authentication, role checks, audit logging, and backups. The migration boundaries are described in `docs/architecture.md`.

## GitHub Pages

The repository includes `.github/workflows/pages.yml`. After pushing to `main`:

1. Open **Settings → Pages** in the repository.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Wait for the `Deploy static site to GitHub Pages` workflow to complete.
4. Find the public URL in Actions or the Pages settings.

## Browser Support

Current versions of Chrome, Edge, Safari, and Firefox are supported. The application uses ES Modules, Web Crypto, CSS Grid, and `color-mix()`. Internet Explorer is not supported.
