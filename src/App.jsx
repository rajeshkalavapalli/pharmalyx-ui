import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './screen/login/Login';
import AppShell from './screen/sidebarshell/Appshell';

import Dashboard from './screen/dashboard/Dashboard';

import Users from './Pages/Users/UserMaster.jsx';

import DivisionOrTerritoty from './Pages/Division/DivisionOrTerrototy.jsx';

import AreaMaster from './Pages/Areas/AreaMaster.jsx';
import ListAreas from './Pages/Areas/ListAreas.jsx';
import AddNewArea from './Pages/Areas/AddNewArea.jsx';

import Configuration from './Pages/Configuration/Configuration.jsx';

import UserAreaMappingMaster from './Pages/UserAreaMapping/UserAreaMappingmaster.jsx';

import UserAreaMappingList from './Pages/UserAreaMapping/UserAreaMappinglist.jsx';

import UserAreaMapping from './Pages/UserAreaMapping/UserAreaMapping.jsx';

import { Doctormaster } from './Pages/Doctors/Doctormaster.jsx';

import { DoctorList } from './Pages/Doctors/DoctorList.jsx';
import { AddNewDoctors } from './Pages/Doctors/addNewDoctors/AddNewDoctors.jsx';

import UserDoctorMappingMaster from './Pages/UserDoctorMapping/UserDoctorMappingmaster.jsx';
import UserDoctorMappingList from './Pages/UserDoctorMapping/UserDoctorMappinglist.jsx';
import UserDoctorMapping from './Pages/UserDoctorMapping/UserDoctorMapping.jsx';

import { PharmacyMaster } from './Pages/Pharmacy/Pharmacymaster.jsx';
import { PharmacyList } from './Pages/Pharmacy/Pharmacylist.jsx';
import { AddNewPharmacy } from './Pages/Pharmacy/AddnewPharmacy.jsx';

import { StockistOrRetailerMaster } from './Pages/StockistOrRetailer/StockistOrRetailerMaster.jsx';
import { AddStockistOrRetailer } from './Pages/StockistOrRetailer/AddStockistOrRetailer.jsx';
import { StockistOrRetailerList } from './Pages/StockistOrRetailer/StockistOrRetailerlist.jsx';

import UserStockistMappingMaster from './Pages/UserStockistMapping/UserStockistMappingMaster.jsx';
import UserStockistMappingList from './Pages/UserStockistMapping/UserStockistMappingList.jsx';
import UserStockistMapping from './Pages/UserStockistMapping/UserStockistMapping.jsx';

function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* LOGIN */}

                <Route
                    path="/"
                    element={<Login />}
                />


                {/* PHARMALYX APPLICATION SHELL */}

                <Route element={<AppShell />}>

                    {/* DASHBOARD */}

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />


                    {/* USERS */}

                    <Route
                        path="admin/Users"
                        element={<Users />}
                    />


                    {/* DIVISION */}

                    <Route
                        path="admin/Divisions"
                        element={
                            <DivisionOrTerritoty />
                        }
                    />


                    {/* TERRITORY */}

                    <Route
                        path="admin/Territories"
                        element={
                            <DivisionOrTerritoty
                                initialTab="territory"
                            />
                        }
                    />


                    {/* AREA MASTER */}

                    <Route
                        path="admin/Areas"
                        element={<AreaMaster />}
                    >
                        <Route
                            index
                            element={<ListAreas />}
                        />

                        <Route
                            path="list"
                            element={<ListAreas />}
                        />

                        <Route
                            path="add"
                            element={<AddNewArea />}
                        />
                    </Route>


                    {/* CONFIGURATION */}

                    <Route
                        path="admin/configuration"
                        element={<Configuration />}
                    />

                    <Route
                        path="admin/UserAreaMapping"
                        element={<UserAreaMappingMaster />}
                    >
                        <Route
                            index
                            element={<UserAreaMappingList />}
                        />

                        <Route
                            path="list"
                            element={<UserAreaMappingList />}
                        />

                        <Route
                            path="mapping"
                            element={<UserAreaMapping />}
                        />
                    </Route>
                        {/* Doctors Route  */}
                    <Route 
                     path='/admin/Doctors'
                     element={<Doctormaster />}
                    >
                        <Route
                            index
                            element={<DoctorList />}
                        />
                        <Route
                            path="list"
                            element={<DoctorList />}
                        />
                        <Route
                            path="add"
                            element={<AddNewDoctors />}
                        />
                    </Route>

                    {/* User Doctor Mapping */}
                    <Route
                        path="admin/UserDoctorMapping"
                        element={<UserDoctorMappingMaster />}
                    >
                        <Route
                            index
                            element={<UserDoctorMappingList />}
                        />

                        <Route
                            path="list"
                            element={<UserDoctorMappingList />}
                        />

                        <Route
                            path="mapping"
                            element={<UserDoctorMapping />}
                        />
                    </Route>
                    {/* Pharmacies Route  */}
                    <Route
                    path="admin/Pharmacies"
                    element={<PharmacyMaster />}
                    >
                        <Route
                            index
                            element={<PharmacyList />}
                        />
                        <Route path='list'
                        element={<PharmacyList />}
                        />
                         <Route path='add'
                        element={<AddNewPharmacy/>}
                        />
                         
                    </Route>
                    {/* stockist Route  */}
                    <Route
                        path="/admin/Stockist"
                        element={<StockistOrRetailerMaster />}
                    >
                        <Route index element={<StockistOrRetailerList />} />
                        <Route path="list" element={<StockistOrRetailerList />} />
                        <Route path="add" element={<AddStockistOrRetailer />} />
                    </Route>

                   {/* stockist user mapping */}
                    <Route
                        path="/admin/UserstockistMapping"
                        element={<UserStockistMappingMaster />}
                    >
                        <Route index element={<UserStockistMappingList />} />
                        <Route path="list" element={<UserStockistMappingList />} />
                        <Route path="add" element={<UserStockistMapping />} />
                    </Route>
                    
                </Route>

            </Routes>

        </BrowserRouter>
    );
}


export default App;