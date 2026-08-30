import {
    Box,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    TableHead,
    Table,
    TableRow,
    TableCell,
    TableBody,
} from "@mui/material";
import { useState } from "react";

function TerritoryList({ handleAddTerritoty }) {
    const [selectMenu, setselectMenu] = useState("All");

    return (
        <Box>
            <Box>
                <Typography variant="6">
                    Add Territory
                </Typography>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 1
                }}
            >
                <Box>
                    <TextField
                        placeholder="search terriotorys"
                    />

                    <Select
                        value={selectMenu}
                        onChange={(event) => {
                            setselectMenu(event.target.value);
                        }}
                    >
                        <MenuItem value="All">
                            All
                        </MenuItem>
                    </Select>
                </Box>

                <Button
                    variant="contained"
                    onClick={handleAddTerritoty}
                >
                    + Add Territory
                </Button>
            </Box>

            <Box>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>a</TableCell>
                            <TableCell>b</TableCell>
                            <TableCell>c</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                    </TableBody>
                </Table>
            </Box>
        </Box>
    );
}

export default TerritoryList;