import { Box, Tabs, Tab } from "@mui/material";
import { useState } from "react";

import TerritoryList from "../Territory/TerritoryList";
import DivisionList from "./DivisionList";
import AddNewDivision from "./AddNewDivision/AddNewDivision";
import AddNewTerritoty from "../Territory/AddTerritory/AddNewTerritory";


function DivisionOrTerritoty (){

    const [selectedTab, setSelectedTab] = useState(0)

    const [showDivision , setShowDivision ] = useState(false)

    const [showTerritory, setShowTerritory] = useState(false)

    const  handleAddDiv = () => {
        setShowDivision(true)
    }

    const handleAddTerritoty = () =>{
        setShowTerritory(true)
    }

    return(
        <Box>
            
            <Tabs value={selectedTab}
            onChange={(event, newValue)=>{
                setSelectedTab(newValue)
                setShowDivision(false)
                setShowTerritory(false)
            }}
            >
                <Tab label= 'Division'>
                    
                </Tab>
                <Tab label='Territory'>
                    
                </Tab>
            </Tabs>
            
            {selectedTab === 0 && !showDivision && (<Box> <DivisionList
            handleAddDiv={handleAddDiv} 
            /></Box>)}
            {selectedTab === 1 && !showTerritory && (<Box><TerritoryList handleAddTerritoty ={handleAddTerritoty}/></Box>)}
            {showDivision && <AddNewDivision/>}
            {showTerritory && <AddNewTerritoty/>}

        </Box>

    )

}

export default DivisionOrTerritoty;