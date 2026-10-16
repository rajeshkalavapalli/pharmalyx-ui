import { useState } from "react";
import { AddRounded, EditRounded, ViewListRounded, VisibilityRounded } from "@mui/icons-material";

import MasterLayout from "../../components/MasterLayout/MasterLayout";
import ListAreas from "./ListAreas";
import AddNewArea from "./AddNewArea";

const CLOSED = { open: false, mode: "create", area: null };

const FORM_TAB = {
    create: { label: "Add area", icon: AddRounded },
    edit: { label: "Edit area", icon: EditRounded },
    view: { label: "View area", icon: VisibilityRounded },
};

function AreaMaster() {
    const [form, setForm] = useState(CLOSED);

    const open = (mode, area = null) => setForm({ open: true, mode, area });
    const close = () => setForm(CLOSED);

    const tabs = [
        { value: "list", label: "All areas", icon: ViewListRounded },
        { value: "form", ...FORM_TAB[form.open ? form.mode : "create"] },
    ];

    return (
        <MasterLayout
            eyebrow="Configuration · Organisation"
            title="Areas"
            subtitle="Working areas inside each territory."
            tabs={tabs}
            value={form.open ? "form" : "list"}
            onTabChange={(next) => (next === "form" ? open("create") : close())}
        >
            {form.open ? (
                <AddNewArea
                    mode={form.mode}
                    area={form.area}
                    onAreaCreated={close}
                    onClose={close}
                />
            ) : (
                <ListAreas
                    onAddArea={() => open("create")}
                    onViewArea={(item) => open("view", item)}
                    onEditArea={(item) => open("edit", item)}
                />
            )}
        </MasterLayout>
    );
}

export default AreaMaster;
