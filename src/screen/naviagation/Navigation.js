const navigation = [
    {
        label: 'Dashboard',
        path: '/dashboard',
    },

    {
        label: 'Field Operations',
        children: [
            { label: 'Doctors', path: '/doctors' },
            { label: 'Tour Plan', path: '/tour-plan' },
            { label: 'Visits', path: '/visits' },
            { label: 'DCR', path: '/dcr' },
            { label: 'Deviation', path: '/deviation' },
        ],
    },

    {
        label: 'Doctor Engagement',
        children: [
            { label: 'RCPA', path: '/rcpa' },
            { label: 'Samples', path: '/samples' },
            { label: 'Gifts', path: '/gifts' },
            { label: 'Feedback', path: '/feedback' },
            { label: 'Doctor Business', path: '/doctor-business' },
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
            { label: 'Users', path: '/admin/users' },
            { label: 'Roles & Permissions', path: '/admin/roles' },
            {
                label: 'Masters',
                children: [
                    { label: 'Divisions', path: '/admin/divisions' },
                    { label: 'Territories', path: '/admin/territories' },
                ],
            },
            { label: 'Stockist / Retailer Masters', path: '/admin/stockist-retailer' },
            { label: 'Configuration', path: '/admin/configuration' },
            { label: 'Approvals', path: '/admin/approvals' },
            { label: 'Integrations', path: '/admin/integrations' },
        ],
    },
];

export default navigation;