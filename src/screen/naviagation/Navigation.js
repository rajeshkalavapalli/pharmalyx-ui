// Sidebar menu.
// - `ready: true` marks modules that are built; others show a "Soon" badge.
// - `match` lists extra path prefixes that should highlight an item.
// - `group` is the heading a top-level entry sits under; entries of a group stay together.
// - `badge` adds a small label to a top-level entry: { label, tone: 'count' | 'ai' }.
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
            { label: 'My Day', path: '/field-operation/my-day', ready: true },
            { label: 'Doctors', path: '/field-operation/doctors', ready: true },
            { label: 'Doctor Requests', path: '/field-operation/doctor-requests', ready: true },
            { label: 'Standard Tour Plan', path: '/field-operation/stp', ready: true },
            { label: 'Tour Plan', path: '/field-operation/tour-plan', ready: true },
            { label: 'Pre-call Planning', path: '/field-operation/pre-call', ready: true },
            { label: 'Visits', path: '/field-operation/visits', ready: true },
            { label: 'DCR', path: '/field-operation/dcr', ready: true },
            { label: 'Plan Deviation', path: '/field-operation/plan-deviation', ready: true },
            { label: 'Verified Work', path: '/field-operation/verified-work', ready: true },
        ],
    },

    {
        label: 'Doctor Engagement',
        group: 'Overview',
        children: [
            { label: 'RCPA', path: '/doctor-engagement/rcpa', ready: true },
            { label: 'Samples', path: '/doctor-engagement/samples', ready: true },
            { label: 'Gifts', path: '/doctor-engagement/gifts', ready: true },
            { label: 'Feedback', path: '/doctor-engagement/feedback', ready: true },
            { label: 'Doctor Business', path: '/doctor-engagement/doctor-business', ready: true },
            { label: 'Doctor Spend', path: '/doctor-engagement/spend', ready: true },
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
            { label: 'POB / Orders', path: '/sales/orders', ready: true },
            { label: 'Retailers', path: '/sales/retailers', ready: true },
            { label: 'Stockists', path: '/sales/stockists', ready: true },
            { label: 'Stock', path: '/sales/stock', ready: true },
            { label: 'Secondary Sales', path: '/sales/secondary', ready: true },
            { label: 'Business', path: '/sales/business', ready: true },
            { label: 'Business Tracker', path: '/sales/tracker', ready: true },
            { label: 'Business Data', path: '/sales/business-data', ready: true },
            { label: 'Field Stock & Dues', path: '/sales/field-ledger', ready: true },
            { label: 'Supply & Spend Reports', path: '/sales/supply-reports', ready: true },
        ],
    },

    {
        label: 'Planning',
        group: 'Workspace',
        children: [
            { label: 'Doctor Business Plan', path: '/planning/doctor-plan', ready: true },
            { label: 'Sales Plan', path: '/planning/sales-plan', ready: true },
        ],
    },

    {
        label: 'Expenses',
        group: 'Workspace',
        children: [
            { label: 'TA / Claims', path: '/expenses/claims', ready: true },
            { label: 'Payments', path: '/expenses/payments', ready: true },
            { label: 'Rate Card', path: '/expenses/rates', ready: true },
        ],
    },

    {
        label: 'HR / Employee',
        group: 'Workspace',
        children: [
            { label: 'Attendance', path: '/hr/attendance', ready: true },
            { label: 'Leave', path: '/hr/leave', ready: true },
            { label: 'Activity', path: '/hr/activity', ready: true },
            { label: 'Appraisals', path: '/hr/appraisals', ready: true },
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
            { label: 'MIS Reports', path: '/reports/mis', ready: true },
            { label: 'DCR / Call Reports', path: '/reports/dcr', ready: true },
            { label: 'Coverage', path: '/reports/coverage', ready: true },
            { label: 'KPI', path: '/reports/kpi', ready: true },
            { label: 'Missed Visits', path: '/reports/missed-visits', ready: true },
            { label: 'POB Reports', path: '/reports/pob', ready: true },
            { label: 'Sales Reports', path: '/reports/sales', ready: true },
            { label: 'Graphical Reports', path: '/reports/graphical', ready: true },
        ],
    },

    {
        label: 'Insights',
        group: 'Workspace',
        badge: { label: 'AI', tone: 'ai' },
        children: [
            { label: 'Performance Insights', path: '/insights/performance', ready: true },
            { label: 'Field Intelligence', path: '/insights/field', ready: true },
            { label: 'Risk & Alerts', path: '/insights/risk', ready: true },
            { label: 'Advanced Analytics', path: '/insights/advanced', ready: true },
            { label: 'Insight Rules', path: '/insights/rules', ready: true },
        ],
    },

    {
        label: 'Administration',
        group: 'Admin',
        children: [
            { label: 'Roles & Permissions', path: '/admin/roles', ready: true },
            {
                label: 'Configuration',
                path: '/admin/configuration',
                ready: true,
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
            { label: 'Approvals', path: '/admin/approvals', ready: true },
            { label: 'Data Import', path: '/admin/data-import', ready: true },
        ],
    },
];

export default navigation;