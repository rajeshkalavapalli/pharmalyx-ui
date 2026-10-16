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

import UserPharmacyMappingMaster from './Pages/UserPharmacyMapping/UserPharmacyMappingMaster.jsx';
import UserPharmacyMappingList from './Pages/UserPharmacyMapping/UserPharmacyMappingList.jsx';
import UserPharmacyMapping from './Pages/UserPharmacyMapping/UserPharmacyMapping.jsx';

import TourPlan from './Pages/Tourplan/TourPlan.jsx'

import TourPlanDeviation from './Pages/TourPlanDeviation/TourPlanDeviation.jsx';

import MyDoctors from './Pages/MyDoctors/MyDoctors.jsx';

import Visits from './Pages/Visits/Visits.jsx';

import Dcr from './Pages/Dcr/Dcr.jsx';

import ComingSoon from './Pages/ComingSoon/ComingSoon.jsx';

import Catalogue from './Pages/Catalogue/Catalogue.jsx';
import StockPage from './Pages/Engagement/Stock/StockPage.jsx';
import Rcpa from './Pages/Engagement/Rcpa/Rcpa.jsx';
import Feedback from './Pages/Engagement/Feedback/Feedback.jsx';
import DoctorBusiness from './Pages/Engagement/DoctorBusiness/DoctorBusiness.jsx';

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
                        path="/admin/UserStockistMapping"
                        element={<UserStockistMappingMaster />}
                    >
                        <Route index element={<UserStockistMappingList />} />
                        <Route path="list" element={<UserStockistMappingList />} />
                        <Route path="mapping" element={<UserStockistMapping />} />
                    </Route>

                    {/* pharmacy user mapping */}
                    <Route
                        path="/admin/UserPharmacyMapping"
                        element={<UserPharmacyMappingMaster />}
                    >
                        <Route index element={<UserPharmacyMappingList />} />
                        <Route path="list" element={<UserPharmacyMappingList />} />
                        <Route path="mapping" element={<UserPharmacyMapping />} />
                    </Route>
                    
                    {/* Field operations: my doctors */}

                    <Route
                        path='field-operation/doctors'
                        element={<MyDoctors />}
                    />

                    {/* Field operations: visits */}

                    <Route
                        path='field-operation/visits'
                        element={<Visits />}
                    />

                    {/* Field operations: daily call reports */}

                    <Route
                        path='field-operation/dcr'
                        element={<Dcr />}
                    />

                    {/* Tour plan */}

                    <Route
                        path='field-operation/tour-plan'
                        element = {<TourPlan/>}
                    >
                        
                    </Route>

                    {/* tour plan deviation */}

                    <Route
                        path='field-operation/plan-deviation'
                        element={<TourPlanDeviation/>}
                    >

                    </Route>

                    {/* Doctor engagement */}

                    <Route path='doctor-engagement/rcpa' element={<Rcpa />} />
                    <Route path='doctor-engagement/samples' element={<StockPage key='samples' itemType='SAMPLE' />} />
                    <Route path='doctor-engagement/gifts' element={<StockPage key='gifts' itemType='GIFT' />} />
                    <Route path='doctor-engagement/feedback' element={<Feedback />} />
                    <Route path='doctor-engagement/doctor-business' element={<DoctorBusiness />} />

                    {/* Catalogue (products & gifts) */}

                    <Route path='admin/catalogue' element={<Catalogue key='products' kind='products' />} />
                    <Route path='admin/catalogue/products' element={<Catalogue key='products' kind='products' />} />
                    <Route path='admin/catalogue/gifts' element={<Catalogue key='gifts' kind='gifts' />} />

                    {/* Sidebar modules not built yet, and unknown URLs */}

                    <Route
                        path='*'
                        element={<ComingSoon />}
                    />
                </Route>

            </Routes>

        </BrowserRouter>
    );
}


export default App;