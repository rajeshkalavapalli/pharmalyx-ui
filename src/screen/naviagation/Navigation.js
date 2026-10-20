// Sidebar menu.
// - `ready: true` marks modules that are built; others show a "Soon" badge.
// - `match` lists extra path prefixes that should highlight an item.
// - `group` is the heading a top-level entry sits under; entries of a group stay together.
// - `badge` adds a small label to a top-level entry: { label, tone: 'count' | 'ai' }.
// - `permission`: the screen shows for roles holding at least one of these codes (as the server checks).
const navigation = [
    {
        label: 'Dashboard',
        group: 'Overview',
        path: '/dashboard',
        ready: true,
    },

    {
        label: 'Field Operations',
        group: 'Overview',
        children: [
            { label: 'My Day', path: '/field-operation/my-day', ready: true, permission: ['verifiedwork.view', 'visits.create'] },
            { label: 'Doctors', path: '/field-operation/doctors', ready: true, permission: ['doctors.view', 'masters.view'] },
            { label: 'Doctor Requests', path: '/field-operation/doctor-requests', ready: true, permission: ['doctorrequests.create', 'doctorrequests.approve'] },
            { label: 'Standard Tour Plan', path: '/field-operation/stp', ready: true, permission: ['stp.view'] },
            { label: 'Tour Plan', path: '/field-operation/tour-plan', ready: true, permission: ['tourplan.view'] },
            { label: 'Pre-call Planning', path: '/field-operation/pre-call', ready: true, permission: ['visits.create'] },
            { label: 'Visits', path: '/field-operation/visits', ready: true, permission: ['visits.view'] },
            { label: 'DCR', path: '/field-operation/dcr', ready: true, permission: ['dcr.view'] },
            { label: 'Plan Deviation', path: '/field-operation/plan-deviation', ready: true, permission: ['deviation.view'] },
            { label: 'Verified Work', path: '/field-operation/verified-work', ready: true, permission: ['verifiedwork.view'] },
        ],
    },

    {
        label: 'Doctor Engagement',
        group: 'Overview',
        children: [
            { label: 'RCPA', path: '/doctor-engagement/rcpa', ready: true, permission: ['rcpa.view'] },
            { label: 'Samples', path: '/doctor-engagement/samples', ready: true, permission: ['stock.view'] },
            { label: 'Gifts', path: '/doctor-engagement/gifts', ready: true, permission: ['stock.view'] },
            { label: 'Feedback', path: '/doctor-engagement/feedback', ready: true, permission: ['feedback.view'] },
            { label: 'Doctor Business', path: '/doctor-engagement/doctor-business', ready: true, permission: ['doctors.view'] },
            { label: 'Doctor Spend', path: '/doctor-engagement/spend', ready: true, permission: ['spend.view'] },
        ],
    },

    {
        label: 'Products & Promotion',
        group: 'Overview',
        children: [
            { label: 'Products', path: '/products' },
            { label: 'Promotions', path: '/promotions' },
            { label: 'Campaigns', path: '/campaigns' },
            { label: 'E-Detailing', path: '/e-detailing' },
        ],
    },

    {
        label: 'Sales & Distribution',
        group: 'Overview',
        children: [
            { label: 'POB / Orders', path: '/sales/orders', ready: true, permission: ['orders.view'] },
            { label: 'Retailers', path: '/sales/retailers', ready: true, permission: ['retailers.view'] },
            { label: 'Stockists', path: '/sales/stockists', ready: true, permission: ['stockists.view'] },
            { label: 'Stock', path: '/sales/stock', ready: true, permission: ['inventory.view'] },
            { label: 'Secondary Sales', path: '/sales/secondary', ready: true, permission: ['secondary.view'] },
            { label: 'Business', path: '/sales/business', ready: true, permission: ['salesbusiness.view'] },
            { label: 'Business Tracker', path: '/sales/tracker', ready: true, permission: ['business.view'] },
            { label: 'Business Data', path: '/sales/business-data', ready: true, permission: ['business.approve'] },
            { label: 'Field Stock & Dues', path: '/sales/field-ledger', ready: true, permission: ['ledger.view'] },
            { label: 'Supply & Spend Reports', path: '/sales/supply-reports', ready: true, permission: ['ledger.view'] },
        ],
    },

    {
        label: 'Planning',
        group: 'Workspace',
        children: [
            { label: 'Doctor Business Plan', path: '/planning/doctor-plan', ready: true, permission: ['doctorplan.view'] },
            { label: 'Sales Plan', path: '/planning/sales-plan', ready: true, permission: ['salesplan.view'] },
        ],
    },

    {
        label: 'Expenses',
        group: 'Workspace',
        children: [
            { label: 'TA / Claims', path: '/expenses/claims', ready: true, permission: ['expenses.view'] },
            { label: 'Payments', path: '/expenses/payments', ready: true, permission: ['expensefinance.view'] },
            { label: 'Rate Card', path: '/expenses/rates', ready: true, permission: ['expenserates.view'] },
        ],
    },

    {
        label: 'HR / Employee',
        group: 'Workspace',
        children: [
            { label: 'Attendance', path: '/hr/attendance', ready: true, permission: ['attendance.view'] },
            { label: 'Leave', path: '/hr/leave', ready: true, permission: ['leave.view'] },
            { label: 'Activity', path: '/hr/activity', ready: true, permission: ['activity.view'] },
            { label: 'Appraisals', path: '/hr/appraisals', ready: true, permission: ['appraisal.view'] },
        ],
    },

    {
        label: 'Resources',
        group: 'Workspace',
        children: [
            { label: 'Files', path: '/files' },
            { label: 'Shared Content', path: '/shared-content' },
        ],
    },

    {
        label: 'Communication',
        group: 'Workspace',
        children: [
            { label: 'Internal Communication', path: '/communication' },
            { label: 'Announcements', path: '/announcements' },
            { label: 'Notifications', path: '/notifications' },
        ],
    },

    {
        label: 'Reports & Analytics',
        group: 'Workspace',
        children: [
            { label: 'MIS Reports', path: '/reports/mis', ready: true, permission: ['misreport.view'] },
            { label: 'DCR / Call Reports', path: '/reports/dcr', ready: true, permission: ['callreport.view'] },
            { label: 'Coverage', path: '/reports/coverage', ready: true, permission: ['coveragereport.view'] },
            { label: 'KPI', path: '/reports/kpi', ready: true, permission: ['kpireport.view'] },
            { label: 'Missed Visits', path: '/reports/missed-visits', ready: true, permission: ['missedreport.view'] },
            { label: 'POB Reports', path: '/reports/pob', ready: true, permission: ['pobreport.view'] },
            { label: 'Sales Reports', path: '/reports/sales', ready: true, permission: ['salesreport.view'] },
            { label: 'Graphical Reports', path: '/reports/graphical', ready: true, permission: ['graphreport.view'] },
        ],
    },

    {
        label: 'Insights',
        group: 'Workspace',
        badge: { label: 'AI', tone: 'ai' },
        children: [
            { label: 'Performance Insights', path: '/insights/performance', ready: true, permission: ['performanceinsights.view'] },
            { label: 'Field Intelligence', path: '/insights/field', ready: true, permission: ['fieldintel.view'] },
            { label: 'Risk & Alerts', path: '/insights/risk', ready: true, permission: ['alerts.view'] },
            { label: 'Advanced Analytics', path: '/insights/advanced', ready: true, permission: ['analytics.view'] },
            { label: 'Insight Rules', path: '/insights/rules', ready: true, permission: ['insightrules.view'] },
        ],
    },

    {
        label: 'Administration',
        group: 'Admin',
        children: [
            { label: 'Roles & Permissions', path: '/admin/roles', ready: true, permission: ['roles.view'] },
            {
                label: 'Configuration',
                path: '/admin/configuration',
                ready: true,
                permission: ['configuration.view'],
                // Master data screens opened from the Configuration page.
                match: [
                    '/admin/catalogue',
                    '/admin/Users',
                    '/admin/Divisions',
                    '/admin/Territories',
                    '/admin/Areas',
                    '/admin/UserAreaMapping',
                    '/admin/Doctors',
                    '/admin/UserDoctorMapping',
                    '/admin/Pharmacies',
                    '/admin/UserPharmacyMapping',
                    '/admin/Stockist',
                    '/admin/UserStockistMapping',
                ],
            },
            { label: 'Approvals', path: '/admin/approvals', ready: true, permission: ['tourplan.approve', 'deviation.approve', 'dcr.approve', 'leave.approve', 'doctorrequests.approve', 'secondary.approve', 'doctorplan.approve', 'expenses.approve', 'expensefinance.approve', 'stp.approve'] },
            { label: 'Data Import', path: '/admin/data-import', ready: true, permission: ['dataimport.view'] },
        ],
    },
];

// The menu one person sees: built screens their role can open; sections with nothing left are dropped.
// `permissions` is a Set of codes (null while loading: only entries without a permission show).
export const visibleNavigation = (permissions) => {
    const allowed = (item) => item.ready && (!item.permission || (permissions && item.permission.some((code) => permissions.has(code))));

    return navigation
        .map((section) => {
            if (!section.children) return allowed(section) ? section : null;
            const children = section.children.filter(allowed);
            return children.length ? { ...section, children } : null;
        })
        .filter(Boolean);
};

export default navigation;