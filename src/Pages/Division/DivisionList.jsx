import {
    Box, Typography, Button, TextField, Table, TableHead,
    TableBody, TableRow, TableCell, Select, MenuItem, IconButton
} from "@mui/material";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import handleAddDiv from '../Division/DivisionOrTerrototy'


function DivisionList({handleAddDiv}) {
    const [status, setStatus] = useState('All')




    return (
        <Box>
            <Box
                sx={{ mt: 2 }}
            >
                <Typography
                    variant="6"
                >
                    Divisions
                </Typography>
            </Box>

            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1
            }}>
                <Box>
                    <TextField
                        placeholder="search divisions..."
                    >

                    </TextField>
                    <Select 
                    value={status}
                    onChange={(event)=>{
                        setStatus(event.target.value)
                    }}> 
                        <MenuItem value='All'>All</MenuItem>
                    </Select>
                </Box>
                <Button 
                    variant="contained"
                    onClick={handleAddDiv}

                >
                    + Add Division
                </Button>
            </Box>
            <Box sx={{ mt: 1 }}>
                <table>
                    <TableHead>
                
                            <TableRow>
                                <TableCell>Action</TableCell>
                                <TableCell>Division Name</TableCell>
                                <TableCell>status</TableCell>
                                <TableCell>CreatedOn</TableCell>
                                <TableCell>ModifiedOn</TableCell>
                                <TableCell>ModifiedBy</TableCell>
                            </TableRow>
                        
                    </TableHead>
                </table>
            </Box>
        </Box>
    )
}

export default DivisionList;