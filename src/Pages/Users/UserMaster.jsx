import { useState } from "react";
import { AddRounded, EditRounded, ViewListRounded, VisibilityRounded } from "@mui/icons-material";

import MasterLayout from "../../components/MasterLayout/MasterLayout";
import UserList from "./UsersList";
import AddNewUser from "./AddNewUser/AddNewUser";

const CLOSED = { open: false, mode: "create", user: null };

const FORM_TAB = {
    create: { label: "Add user", icon: AddRounded },
    edit: { label: "Edit user", icon: EditRounded },
    view: { label: "View user", icon: VisibilityRounded },
};

function UserMaster() {
    const [form, setForm] = useState(CLOSED);

    const open = (mode, user = null) => setForm({ open: true, mode, user });
    const close = () => setForm(CLOSED);

    const tabs = [
        { value: "list", label: "All users", icon: ViewListRounded },
        { value: "form", ...FORM_TAB[form.open ? form.mode : "create"] },
    ];

    return (
        <MasterLayout
            eyebrow="Configuration · People"
            title="Users"
            subtitle="Field staff, managers and admins, with designations and reporting lines."
            tabs={tabs}
            value={form.open ? "form" : "list"}
            onTabChange={(next) => (next === "form" ? open("create") : close())}
        >
            {form.open ? (
                <AddNewUser
                    mode={form.mode}
                    user={form.user}
                    onUserCreated={close}
                    onClose={close}
                />
            ) : (
                <UserList
                    onAddUser={() => open("create")}
                    onViewUser={(item) => open("view", item)}
                    onEditUser={(item) => open("edit", item)}
                />
            )}
        </MasterLayout>
    );
}

export default UserMaster;
