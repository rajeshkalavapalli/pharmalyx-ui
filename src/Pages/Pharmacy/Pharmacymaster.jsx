import { AddRounded, ViewListRounded } from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import MasterLayout from "../../components/MasterLayout/MasterLayout";

const TABS = [
    { value: "list", label: "All pharmacies", icon: ViewListRounded },
    { value: "add", label: "Add pharmacy", icon: AddRounded },
];

export const PharmacyMaster = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const view = pathname.endsWith("/add") ? "add" : "list";

    return (
        <MasterLayout
            eyebrow="Configuration · Customers"
            title="Pharmacies"
            subtitle="Chemists and pharmacies in your territories."
            tabs={TABS}
            value={view}
            onTabChange={(next) => navigate(next)}
        >
            <Outlet />
        </MasterLayout>
    );
}
