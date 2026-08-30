import {
    Box,
    Button,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";

import ConfirmationDialog from "../../../components/conformationDialog/ConformationDialog";
import { useState } from "react";

function AddNewDivision() {
    const [closeDialog, setcloseDialog] = useState(false)

    const handleDialog = () => {
        setcloseDialog(true)
    }


    return (
        <Box>
            <Box>
                <Typography variant="h6">
                    Create Division
                </Typography>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mt: 2
                }}
            >
                <TextField
                    label="Division Name"
                    placeholder="Please enter Division name"
                    fullWidth
                />

                <TextField
                    label="Description"
                    multiline
                    rows={5}
                    placeholder="Please enter description"
                    fullWidth
                />

                <Select
                    defaultValue="Yes"
                    fullWidth
                >
                    <MenuItem value="Yes">
                        Active
                    </MenuItem>

                    <MenuItem value="No">
                        Inactive
                    </MenuItem>
                </Select>
            </Box>
            <ConfirmationDialog
                open={closeDialog}
                title="Close Division"
                message="are you sure want to close ?"
                onCancel={() => {
                    setcloseDialog(false)
                }}

                onConfirm={() => {
                    setcloseDialog(false)
                }}

            />


            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 3
                }}
            >
                <Button
                    value='closeDialog'
                    onClick={handleDialog}
                    color="error"
                    variant="outlined"   
                >
                    Close
                </Button>

                <Button variant="contained">
                    Create
                </Button>
            </Box>
        </Box>
    );
}

export default AddNewDivision;