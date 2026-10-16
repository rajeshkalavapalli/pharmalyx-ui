import { MenuItem, TextField } from "@mui/material";

// Dev-only picker for who the API acts as, until real sign-in exists.
function ActingUserSelect({ users, value, onChange }) {
    return (
        <TextField
            select
            size="small"
            label="Acting as (dev only)"
            value={users.some((user) => user.id === value) ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            sx={(theme) => ({
                minWidth: theme.spacing(26),
                "& .MuiOutlinedInput-root": { minHeight: theme.field.compactHeight },
                "& .MuiSelect-select": { py: 0 },
            })}
        >
            {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                    {user.name}
                </MenuItem>
            ))}
        </TextField>
    );
}

export default ActingUserSelect;
