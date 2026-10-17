import { useEffect, useState } from "react";
import { AddRounded, ViewListRounded } from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import MasterLayout from "../../components/MasterLayout/MasterLayout";
import { getMyPermissions } from "../DoctorRequests/index";

const TABS = [
    { value: "list", label: "All doctors", icon: ViewListRounded },
    { value: "add", label: "Add doctor", icon: AddRounded },
];

export const Doctormaster = function () {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const view = pathname.endsWith("/add") ? "add" : "list";

    // "Add doctor": admins add directly; others send the same form to their manager.
    const [canCreate, setCanCreate] = useState(false);
    useEffect(() => {
        getMyPermissions()
            .then((permissions) => setCanCreate(permissions.has("masters.create") || permissions.has("doctorrequests.create")))
            .catch(() => setCanCreate(false));
    }, []);

    return (
        <MasterLayout
            eyebrow="Configuration · Customers"
            title="Doctors"
            subtitle="Doctors your field team calls on, with category, visit targets and occasions."
            tabs={canCreate ? TABS : TABS.filter((tab) => tab.value !== "add")}
            value={view}
            onTabChange={(next) => navigate(next)}
        >
            <Outlet />
        </MasterLayout>
    );
}
