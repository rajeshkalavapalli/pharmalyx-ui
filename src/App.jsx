import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './screen/login/Login';
import AppShell from './screen/sidebarshell/Appshell';

import Dashboard from './screen/dashboard/Dashboard';

import Users from './Pages/Users/Users.jsx';

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


                </Route>

            </Routes>

        </BrowserRouter>
    );
}


export default App;