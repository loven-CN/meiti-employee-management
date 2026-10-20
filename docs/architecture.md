# System Design and Architecture

## 1. Design Goals

- Run directly in a standard browser for classroom demonstrations and GitHub Pages deployment.
- Keep employees, scheduling, statistics, inventory, and access control in one workspace.
- Separate pages, pure business functions, and initial data so the data layer can later be replaced by a server API.
- Centralize permission checks instead of scattering role-name comparisons across page code.

## 2. Runtime Structure

```text
index.html
  └─ assets/js/app.js
       ├─ core.js     Pure functions: dates, filtering, validation, statistics, permissions
       ├─ data.js     Initial demo data
       ├─ localStorage
       └─ sessionStorage
```

### `core.js`

Contains business logic that does not depend on the DOM:

- Role permission sets and `can(role, permission)`
- Employee search, filtering, and sorting
- Employee form validation
- Shift conflict detection
- Department, status, and labor-cost statistics
- Weekly date calculations and display formatting

These functions can be called directly by Node.js tests.

### `data.js`

Contains initial departments, employees, accounts, shifts, attendance, inventory, restock requests, and activity records. Shift and attendance dates are generated from the current week so the project never opens with an expired schedule.

### `app.js`

Handles:

- Sign-in and session restoration
- URL routing and role-based entry
- Page rendering
- Form, filter, and dialog interactions
- Local data persistence
- Permission-based display of actions
- Activity logging and user messages

## 3. Data Model

### Employee

```text
id                Unique identifier
employeeNo        Employee ID in MT001 format
name              Full name
gender            Gender
phone             Mobile number
email             Email address
address           Residential address
departmentId      Department
position          Position
hourlyRate        Hourly rate
hireDate          Hire date
status            active / leave / inactive
emergencyContact  Emergency contact
note              Notes
```

### Shift

```text
id          Unique identifier
employeeId  Employee
date        Work date
period      morning / afternoon / evening
station     Station or area
note        Notes
createdAt   Creation time
createdBy   Creating account
```

Constraint: the same employee cannot be assigned to the same shift twice on one date. Employees on leave or inactive cannot receive new shifts.

### User

```text
id            Unique identifier
username      Sign-in name
displayName   Display name
role          hr / supervisor / employee
employeeId    Linked employee
salt          Password salt
passwordHash  SHA-256(salt + password)
```

### Other Entities

- `Department`: name, color, manager, and description.
- `Attendance`: date, check-in, check-out, and status.
- `InventoryItem`: SKU, name, category, on-hand stock, safety stock, and shelf.
- `RestockRequest`: product, quantity, requester, status, and notes.
- `AuditLog`: account, entity, summary, and time.

## 4. Permission Design

Permissions are maintained in the `PERMISSIONS` collection:

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

Page entry is checked again through `canVisit()` so a hidden navigation item cannot be accessed by typing a URL. Queries for Ordinary Employees use only the `employeeId` linked to the current account.

## 5. Session and Password Handling

- Passwords use Web Crypto SHA-256 with an account-specific salt.
- The sign-in session is stored in `sessionStorage` and expires after eight hours.
- Failed sign-in attempts return one generic “Incorrect username or password” message.
- The demo never stores plaintext passwords, but a static front end cannot replace a server-side security boundary.

## 6. Page Structure

| Page | HR | Supervisor | Ordinary Employee |
| --- | --- | --- | --- |
| Store Overview | Yes | Yes | No |
| Employee Records / Directory | Full management | Read-only search | No |
| Departments | Yes | Yes | No |
| Scheduling | Read-only | Management and auto-fill | Own shifts only |
| Statistics | Yes | Yes | No |
| Inventory | Available from the overview | Yes | No |
| Roles & Access | Yes | No | No |
| Activity Log | Yes | Yes | No |
| My Profile | No | No | Yes |
| My Shifts | No | No | Yes |

## 7. Production Migration Guidance

The current version is a static demonstration system. A production store deployment should migrate in this order:

1. Keep the validation and statistics rules in `core.js` and replace data access with a REST API.
2. Use Node.js, Java, or Python on the server. PostgreSQL or MySQL is recommended for persistence.
3. Hash passwords with Argon2id or bcrypt. After sign-in, issue an HttpOnly, Secure, SameSite cookie.
4. Enforce role checks on every API endpoint; never rely on hidden front-end buttons.
5. Soft-delete employees to preserve audit history and shift relationships.
6. Add a database uniqueness constraint for shift assignments to prevent concurrent duplicates.
7. Add date and department indexes for statistics and pagination for list endpoints.
8. Write sensitive actions to a tamper-resistant audit table and schedule regular backups.

## 8. Performance Considerations

- Current data volumes are small, so filtering and statistics run in browser memory.
- Static assets use no external CDN or web fonts, so the first load creates no third-party requests.
- Page changes redraw only the relevant content instead of reloading the browser.
- Charts use CSS and native SVG without a large charting library.
- Responsive breakpoints are set at 1180, 920, 720, and 430 pixels.
