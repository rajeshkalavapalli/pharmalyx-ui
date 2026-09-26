import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './screen/login/Login';
import AppShell from './screen/sidebarshell/Appshell';

import Dashboard from './screen/dashboard/Dashboard';

import Users from './Pages/Users/Users.jsx';

import DivisionOrTerritoty from './Pages/Division/DivisionOrTerrototy.jsx';

import AreaMaster from './Pages/Areas/AreaMaster.jsx';

import Configuration from './Pages/Configuration/Configuration.jsx';

import UserAreaMappingMaster from './Pages/UserAreaMapping/UserAreaMappingmaster.jsx';

import UserAreaMappingList from './Pages/UserAreaMapping/UserAreaMappinglist.jsx';

import UserAreaMapping from './Pages/UserAreaMapping/UserAreaMapping.jsx';

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
                    />

                    <Route
                        path="admin/Areas/list"
                        element={<AreaMaster initialView="list" />}
                    />

                    <Route
                        path="admin/Areas/add"
                        element={<AreaMaster initialView="add" />}
                    />


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


                </Route>

            </Routes>

        </BrowserRouter>
    );
}


export default App;