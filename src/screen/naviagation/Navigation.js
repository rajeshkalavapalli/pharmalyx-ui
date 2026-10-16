// Sidebar menu.
// - `ready: true` marks modules that are built; others show a "Soon" badge.
// - `match` lists extra path prefixes that should highlight an item.
const navigation = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        ready: true,
    },

    {
        label: 'Field Operations',
        children: [
            { label: 'Doctors', path: '/field-operation/doctors', ready: true },
            { label: 'Tour Plan', path: '/field-operation/tour-plan', ready: true },
            { label: 'Visits', path: '/field-operation/visits', ready: true },
            { label: 'DCR', path: '/field-operation/dcr', ready: true },
            { label: 'Plan Deviation', path: '/field-operation/plan-deviation', ready: true },
        ],
    },

    {
        label: 'Doctor Engagement',
        children: [
            { label: 'RCPA', path: '/doctor-engagement/rcpa', ready: true },
            { label: 'Samples', path: '/doctor-engagement/samples', ready: true },
            { label: 'Gifts', path: '/doctor-engagement/gifts', ready: true },
            { label: 'Feedback', path: '/doctor-engagement/feedback', ready: true },
            { label: 'Doctor Business', path: '/doctor-engagement/doctor-business', ready: true },
        ],
    },

    {
        label: 'Products & Promotion',
        children: [
            { label: 'Products', path: '/products' },
            { label: 'Promotions', path: '/promotions' },
            { label: 'Campaigns', path: '/campaigns' },
            { label: 'E-Detailing', path: '/e-detailing' },
        ],
    },

    {
        label: 'Sales & Distribution',
        children: [
            { label: 'POB / Orders', path: '/orders' },
            { label: 'Retailers', path: '/retailers' },
            { label: 'Stockists', path: '/stockists' },
            { label: 'Stock', path: '/stock' },
            { label: 'Secondary Sales', path: '/secondary-sales' },
            { label: 'Business', path: '/business' },
        ],
    },

    {
        label: 'Planning',
        children: [
            { label: 'Doctor Business Plan', path: '/doctor-business-plan' },
            { label: 'Sales Plan', path: '/sales-plan' },
        ],
    },

    {
        label: 'Expenses',
        children: [
            { label: 'TA / Claims', path: '/expenses' },
        ],
    },

    {
        label: 'HR / Employee',
        children: [
            { label: 'Attendance', path: '/attendance' },
            { label: 'Leave', path: '/leave' },
            { label: 'Activity', path: '/activity' },
            { label: 'Appraisals', path: '/appraisals' },
            { label: 'Learning / Quiz', path: '/learning' },
        ],
    },

    {
        label: 'Resources',
        children: [
            { label: 'Files', path: '/files' },
            { label: 'Shared Content', path: '/shared-content' },
        ],
    },

    {
        label: 'Communication',
        children: [
            { label: 'Internal Communication', path: '/communication' },
            { label: 'Announcements', path: '/announcements' },
            { label: 'Notifications', path: '/notifications' },
        ],
    },

    {
        label: 'Reports & Analytics',
        children: [
            { label: 'MIS Reports', path: '/reports/mis' },
            { label: 'DCR / Call Reports', path: '/reports/dcr' },
            { label: 'Coverage', path: '/reports/coverage' },
            { label: 'KPI', path: '/reports/kpi' },
            { label: 'Missed Visits', path: '/reports/missed-visits' },
            { label: 'POB Reports', path: '/reports/pob' },
            { label: 'Sales Reports', path: '/reports/sales' },
            { label: 'Graphical Reports', path: '/reports/graphical' },
        ],
    },

    {
        label: 'Insights',
        children: [
            { label: 'Performance Insights', path: '/insights/performance' },
            { label: 'Field Intelligence', path: '/insights/field' },
            { label: 'Risk & Alerts', path: '/insights/risk' },
            { label: 'Advanced Analytics', path: '/insights/advanced' },
        ],
    },

    {
        label: 'Administration',
        children: [
            { label: 'Roles & Permissions', path: '/admin/roles' },
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
            { label: 'Approvals', path: '/admin/approvals' },
            { label: 'Integrations', path: '/admin/integrations' },
        ],
    },
];

export default navigation;