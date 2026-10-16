import { LinkRounded, ViewListRounded } from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import MasterLayout from "../../components/MasterLayout/MasterLayout";

const TABS = [
    { value: "list", label: "Assignments", icon: ViewListRounded },
    { value: "mapping", label: "Assign areas", icon: LinkRounded },
];

function UserAreaMappingMaster() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const view = pathname.endsWith("/mapping") ? "mapping" : "list";

    return (
        <MasterLayout
            eyebrow="Configuration · Assignments"
            title="User areas"
            subtitle="Which territories and areas each field user covers."
            tabs={TABS}
            value={view}
            onTabChange={(next) => navigate(next)}
        >
            <Outlet />
        </MasterLayout>
    );
}

export default UserAreaMappingMaster;
