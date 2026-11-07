import { useState } from "react";
import { Button } from "@mui/material";
import { LinkRounded, SwapHorizRounded, ViewListRounded } from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import MasterLayout from "../../components/MasterLayout/MasterLayout";
import HandoverDialog from "./HandoverDialog";

const TABS = [
    { value: "list", label: "Assignments", icon: ViewListRounded },
    { value: "mapping", label: "Assign doctors", icon: LinkRounded },
];

function UserDoctorMappingMaster() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const view = pathname.endsWith("/mapping") ? "mapping" : "list";
    const [handover, setHandover] = useState(false);

    return (
        <MasterLayout
            eyebrow="Configuration · Assignments"
            title="User doctors"
            subtitle="Which doctors each field user calls on."
            tabs={TABS}
            value={view}
            onTabChange={(next) => navigate(next)}
            actions={
                <Button variant="contained" startIcon={<SwapHorizRounded />} onClick={() => setHandover(true)}>
                    Hand over doctors
                </Button>
            }
        >
            <Outlet />
            {handover && <HandoverDialog onClose={() => setHandover(false)} onDone={() => navigate(0)} />}
        </MasterLayout>
    );
}

export default UserDoctorMappingMaster;
