import { Typography,Box , ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ListAreas from'../Areas/ListAreas.jsx'
import AddNewArea from "../Areas/AddNewArea.jsx";

function AreaMaster() {
    

    const [view, setView] = useState('list')
    const navigate = useNavigate();
    return (
        <Box>
            <Box>
                <Typography>welcome </Typography>
                <Box>
                    <Typography>Create areas</Typography>
                </Box>
                <Box>
                    <ToggleButtonGroup 

                    >

                        <ToggleButton value='list'
                        onClick={()=>{
                            navigate('/admin/Areas/list')
                        }}
                        >List Areas</ToggleButton>
                        <ToggleButton value='add'
                        onClick={()=>{
                            navigate('/admin/Areas/add')
                        }}
                        >+ Add New Areas</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

               
            </Box>
        </Box>

    )
}

export default AreaMaster;