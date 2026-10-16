import { LinkRounded, ViewListRounded } from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import MasterLayout from "../../components/MasterLayout/MasterLayout";

const TABS = [
    { value: "list", label: "Assignments", icon: ViewListRounded },
    { value: "mapping", label: "Assign doctors", icon: LinkRounded },
];

function UserDoctorMappingMaster() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const view = pathname.endsWith("/mapping") ? "mapping" : "list";

    return (
        <MasterLayout
            eyebrow="Configuration · Assignments"
            title="User doctors"
            subtitle="Which doctors each field user calls on."
            tabs={TABS}
            value={view}
            onTabChange={(next) => navigate(next)}
        >
            <Outlet />
        </MasterLayout>
    );
}

export default UserDoctorMappingMaster;
