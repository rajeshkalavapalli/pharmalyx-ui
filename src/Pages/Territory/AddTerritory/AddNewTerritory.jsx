import {
    Box,
    Button,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";
import { useState } from "react";
import ConfirmationDialog from "../../../components/conformationDialog/ConformationDialog";

function AddNewTerritoty() {

    const [isActive, setisActive] = useState("true");
    const [divisionid, setdivisionId] = useState("DivisionId");

    const [closeDialog, setcloseDialog] = useState(false)

    const handleCloseDialog = () => {
        setcloseDialog(true)
    }

    return (
        <Box
            sx={{
                width: "100%",
                p: 3
            }}
        >
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6">
                    Create Territory
                </Typography>
            </Box>

            {/* Form */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2
                }}
            >
                {/* Territory Name */}
                <TextField
                    label="Territory Name"
                    placeholder="Please enter Territory name"
                    fullWidth
                />

                {/* Division */}
                <Select
                    value={divisionid}
                    fullWidth
                    displayEmpty
                    onChange={(event) => {
                        setdivisionId(event.target.value);
                    }}
                >
                    <MenuItem value="DivisionId">
                        Select Division
                    </MenuItem>

                    <MenuItem value="division-001">
                        General
                    </MenuItem>
                </Select>

                {/* Is Active */}
                <Select
                    value={isActive}
                    fullWidth
                    onChange={(event) => {
                        setisActive(event.target.value);
                    }}
                >
                    <MenuItem value="true">
                        Active
                    </MenuItem>

                    <MenuItem value="false">
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

            {/* Buttons */}

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 3
                }}
            >

                <Button variant="outlined"
                    onClick={handleCloseDialog}
                    value='closeDialog'
                    color="error"
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

export default AddNewTerritoty;