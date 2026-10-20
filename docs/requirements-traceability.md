# Requirements Traceability

## 1. Roles and Terminology

| Role | Entry points | Permission summary |
| --- | --- | --- |
| HR | Employee Records, Departments, Shift View, Statistics, Roles & Access, Activity Log | Employee record CRUD; schedule viewing; statistics; role changes for other accounts |
| Supervisor | Employee Directory, Scheduling, Statistics, Inventory, Activity Log | Employee search; shift assignment and deletion; auto-fill; inventory and restock viewing |
| Ordinary Employee | My Profile, My Shifts | View only own employee record and own shifts |

The system does not use Administrator, Admin, or an ambiguous “manager” role. Unauthenticated users are called User; signed-in users are identified by the full role name.

## 2. Functional Requirements

| ID | Requirement | Implementation | Status |
| --- | --- | --- | --- |
| FR-01 | HR adds employees | Employee Records → Add Employee; `openEmployeeForm` / `handleEmployeeSubmit` | Implemented |
| FR-02 | HR deletes employees | Employee list → Delete; `requestDeleteEmployee` | Implemented |
| FR-03 | View employee list | Employee Records table | Implemented |
| FR-04 | Search employees and view details | Search, department/status filters, employee detail drawer | Implemented |
| FR-05 | Edit employee information | Employee list → Edit; `handleEmployeeSubmit` | Implemented |
| FR-06 | Assign employees to departments | Department field in the employee form | Implemented |
| FR-07 | View employee attendance | Recent attendance in Employee Details and My Profile | Implemented as read-only |
| FR-08 | Employee statistics | Statistics page | Implemented |
| FR-09 | Manually assign shifts | Scheduling → Assign Shift; `openShiftForm` | Implemented |
| FR-10 | Three daily shifts | Morning, Afternoon, Evening | Implemented |
| FR-11 | View shifts by employee | Employee filter on Scheduling; Ordinary Employee My Shifts | Implemented |
| FR-12 | View all store shifts | Scheduling weekly view | Implemented |
| FR-13 | Auto-scheduling (Could) | Scheduling → Auto-Fill; `buildAutoScheduleSuggestions` | Basic suggestions implemented |
| FR-14 | Supervisor views inventory | Inventory page | Implemented |
| FR-15 | View shelf restock requests | Restock request list on Inventory | Implemented |
| FR-16 | Manage product inventory (Could) | Read-only in this release; warehouse data is maintained externally | Out of scope |
| FR-17 | Distinguish three roles | `ROLE_META` and `PERMISSIONS` | Implemented |
| FR-18 | Restrict pages and data by role | `can()`, `canVisit()`, conditional page actions | Implemented |
| FR-19 | HR manages employees; Supervisor manages shifts | Role permission matrix | Implemented |
| FR-20 | Supervisor views statistics and employee information | Statistics and Employee Directory | Implemented |
| FR-21 | View inventory and restocks | Inventory page | Implemented |
| FR-22 | Employees sign in and adjust personal information | Original requirement was Won't; demo provides read-only own-profile access | Out of scope; read-only only |
| FR-23 | Employees view own shifts | My Shifts page | Implemented |
| FR-24 | In-store attendance registration | Demo attendance records are displayed only | Out of scope |
| FR-25 | Add and manage departments | Departments are fixed demo data; assignment happens through employee records | Out of scope |
| FR-26 | Full product management system | Inventory and restock viewing only | Out of scope |

## 3. Non-functional Requirements

| ID | Requirement | Current implementation | Production recommendation |
| --- | --- | --- | --- |
| NFR-01 | Friendly interface | English UI, role-based navigation, empty states, confirmation dialogs, responsive layout | Continue with real user testing |
| NFR-02 | Data security and privacy | Password digest verification, session expiry, role checks, no plaintext credential display | Move to server authentication, HTTPS, database encryption, and access auditing |
| NFR-03 | Response under two seconds | Zero runtime dependencies, local static assets, in-memory list filtering | Add indexes, pagination, and caching after API integration |
| NFR-04 | Multiple concurrent users | GitHub Pages supports static access; demo data is stored per browser | Add a server database and concurrency controls |
| NFR-05 | Extensibility | Data, pure functions, and views are separated; permissions are centralized | Replace `data.js` with an API client |
| NFR-06 | Git version control | Git repository, clear commits, and GitHub Actions | Continue small, focused commits and change notes |

## 4. Code Review Checklist

- Use cases cover add, delete, edit, and search for employee records and shift modules.
- Roles use HR, Supervisor, and Ordinary Employee; Administrator is not used.
- Sign-in leads to the System Home Page and then routes by role.
- HR and Supervisor can search employees; only HR can delete employees.
- HR owns employee records; Supervisor owns shift scheduling.
- Detailed use cases include Precondition, Trigger, Main Scenario, and Extensions.
- Extensions use `1A`, `1B`, and similar numbering.
- Search Employee and Filter by Employee are reused through include relationships.
- Role terminology is consistent throughout.
- `docs/use-cases.md` ends with the System Overall Overview.
