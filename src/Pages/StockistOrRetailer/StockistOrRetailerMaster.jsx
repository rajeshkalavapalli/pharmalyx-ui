import { AddRounded, ViewListRounded } from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import MasterLayout from "../../components/MasterLayout/MasterLayout";

const TABS = [
    { value: "list", label: "All stockists", icon: ViewListRounded },
    { value: "add", label: "Add stockist", icon: AddRounded },
];

export const StockistOrRetailerMaster = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const view = pathname.endsWith("/add") ? "add" : "list";

    return (
        <MasterLayout
            eyebrow="Configuration · Customers"
            title="Stockists & retailers"
            subtitle="Distributors and retailers that carry your products."
            tabs={TABS}
            value={view}
            onTabChange={(next) => navigate(next)}
        >
            <Outlet />
        </MasterLayout>
    );
}
