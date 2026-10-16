import { Avatar } from "@mui/material";
import { alpha } from "@mui/material/styles";

import { DOCTOR_CATEGORY, initials } from "../index";

// Initials avatar tinted by the doctor's category.
function DoctorAvatar({ doctor, size = "size" }) {
    const color = DOCTOR_CATEGORY[doctor.Category]?.color || "secondary";

    return (
        <Avatar
            sx={(theme) => ({
                width: theme.avatar[size],
                height: theme.avatar[size],
                ...theme.typography.subtitle2,
                color: theme.palette[color].dark,
                backgroundColor: alpha(theme.palette[color].main, theme.tint.soft),
            })}
        >
            {initials(doctor.DoctorName)}
        </Avatar>
    );
}

export default DoctorAvatar;
