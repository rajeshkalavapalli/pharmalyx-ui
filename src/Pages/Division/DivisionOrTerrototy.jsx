import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccountTreeRounded, MapRounded } from "@mui/icons-material";

import MasterLayout from "../../components/MasterLayout/MasterLayout";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import TerritoryList from "../Territory/TerritoryList";
import DivisionList from "./DivisionList";
import AddNewDivision from "./AddNewDivision/AddNewDivision";
import AddNewTerritoty from "../Territory/AddTerritory/AddNewTerritory";

const TABS = [
    { value: "division", label: "Divisions", icon: AccountTreeRounded },
    { value: "territory", label: "Territories", icon: MapRounded },
];

const ROUTES = {
    division: "/admin/Divisions",
    territory: "/admin/Territories",
};

const CLOSED = { open: false, mode: "create", item: null };

// Divisions and territories share one page; the tab follows the route.
function DivisionOrTerritoty({ initialTab = "division" }) {
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();

    const [form, setForm] = useState(CLOSED);

    // The same component instance serves both routes, so close any open form on switch.
    useEffect(() => {
        setForm(CLOSED);
    }, [initialTab]);

    const open = (mode, item = null) => setForm({ open: true, mode, item });
    const close = () => setForm(CLOSED);

    // Forms report (message, severity); keep the form open on errors.
    const handleSaved = (fallback) => (message = fallback, severity = "success") => {
        if (severity === "success") close();
        showSnackbar(message, severity);
    };

    const isDivision = initialTab === "division";

    return (
        <MasterLayout
            eyebrow="Configuration · Organisation"
            title={isDivision ? "Divisions" : "Territories"}
            subtitle={
                isDivision
                    ? "Business units and product lines your field force is organised into."
                    : "Regions each division operates in. Areas sit inside territories."
            }
            tabs={TABS}
            value={initialTab}
            onTabChange={(next) => navigate(ROUTES[next])}
        >
            {isDivision && !form.open && (
                <DivisionList
                    handleAddDiv={() => open("create")}
                    handleViewDivision={(division) => open("view", division)}
                    handleEditDivision={(division) => open("edit", division)}
                />
            )}

            {!isDivision && !form.open && (
                <TerritoryList
                    handleAddTerritoty={() => open("create")}
                    handleViewTerritory={(territory) => open("view", territory)}
                    handleEditTerritory={(territory) => open("edit", territory)}
                />
            )}

            {isDivision && form.open && (
                <AddNewDivision
                    mode={form.mode}
                    division={form.item}
                    onDivisionCreated={handleSaved("Division created successfully")}
                    onClose={close}
                />
            )}

            {!isDivision && form.open && (
                <AddNewTerritoty
                    mode={form.mode}
                    territory={form.item}
                    onTerritoryCreated={handleSaved("Territory created successfully")}
                    onClose={close}
                />
            )}
        </MasterLayout>
    );
}

export default DivisionOrTerritoty;
