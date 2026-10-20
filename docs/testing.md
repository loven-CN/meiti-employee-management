# Test Plan and Acceptance Results

## 1. Scope

- Sign-in, session restoration, and sign-out
- Role-based navigation and action permissions
- Employee creation, editing, deletion, search, filtering, details, and export
- Shift assignment, duplicate-shift prevention, week navigation, and auto-fill
- Statistics, departments, inventory, and restock requests
- Ordinary Employee profile and own-shift views
- Layout at multiple viewport widths

## 2. Automated Tests

Run:

```bash
npm test
npm run check
```

Latest local result:

```text
tests 10
pass 10
fail 0
```

Coverage:

- Permission differences across HR, Supervisor, and Ordinary Employee
- Name, employee ID, and position search
- Combined department, status, and keyword filters
- Sorting by name and hourly rate
- Required fields, employee ID uniqueness, phone, email, and hourly-rate validation
- Duplicate shift prevention for the same employee, date, and shift
- Employee status and department statistics
- Monday as the first day of the week
- Shift names and times
- Currency and tenure formatting

## 3. Browser Acceptance

| Case | Action | Expected result | Result |
| --- | --- | --- | --- |
| HR sign-in | Select the HR demo account and sign in | Store Overview opens with seven navigation entries | Passed |
| Employee search | Enter “Siyuan Chen” | Only Siyuan Chen remains in the list | Passed |
| Add employee | Complete a valid record and save | List grows from 16 to 17 employees and a success message appears | Passed |
| HR read-only scheduling | Open Shift View | Weekly view appears without assignment controls | Passed |
| Supervisor sign-in | Switch to the supervisor account | Navigation includes Employee Directory, Scheduling, Statistics, Inventory, and Activity Log | Passed |
| Supervisor read-only employees | Open Employee Directory | Add, edit, and delete controls are absent | Passed |
| Assign shift | Select an employee, date, and shift, then save | Weekly view adds the shift and totals update | Passed |
| Auto-fill | Open the auto-fill confirmation | The current weekly gap count and scheduling rules are shown | Passed |
| Statistics | Open Statistics | Status share, department distribution, and shift coverage appear | Passed |
| Inventory | Open Inventory | Eight inventory items and five restock requests appear | Passed |
| Ordinary Employee sign-in | Switch to the employee account | Only My Profile and My Shifts appear | Passed |
| Own shifts | Open My Shifts | Only the current employee's weekly shifts appear | Passed |
| Language check | Inspect all pages and dialogs | No Chinese characters remain in the rendered interface | Passed |
| Console errors | Inspect browser logs | No errors or warnings | Passed |

## 4. Responsive Checks

CSS breakpoints:

- 1180px: KPIs become two columns; statistics cards wrap.
- 920px: the sidebar becomes a drawer and the menu button appears.
- 720px: toolbars, forms, and statistics grids become one or two columns.
- 430px: KPIs and personal shifts become a single column.

## 5. Not Covered

- Real server concurrency, database transactions, and network failure recovery
- Real store account integration, single sign-on, and password recovery
- Pagination performance with large employee datasets
- Legacy Safari compatibility
