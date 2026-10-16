import { AddRounded, ViewListRounded } from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import MasterLayout from "../../components/MasterLayout/MasterLayout";

const TABS = [
    { value: "list", label: "All doctors", icon: ViewListRounded },
    { value: "add", label: "Add doctor", icon: AddRounded },
];

export const Doctormaster = function () {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const view = pathname.endsWith("/add") ? "add" : "list";

    return (
        <MasterLayout
            eyebrow="Configuration · Customers"
            title="Doctors"
            subtitle="Doctors your field team calls on, with category, visit targets and occasions."
            tabs={TABS}
            value={view}
            onTabChange={(next) => navigate(next)}
        >
            <Outlet />
        </MasterLayout>
    );
}
