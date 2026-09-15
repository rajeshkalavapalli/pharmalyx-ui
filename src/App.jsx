import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './screen/login/Login';
import AppShell from './screen/sidebarshell/Appshell';

import Dashboard from './screen/dashboard/Dashboard';

import AddNewUser from './Pages/Users/AddNewUser/AddNewUser.jsx';
import Users from './Pages/Users/Users.jsx';
import DivisionOrTerritoty from './Pages/Division/DivisionOrTerrototy.jsx';
import AreaMaster from './Pages/Areas/AreaMaster.jsx';
import ListAreas from './Pages/Areas/ListAreas.jsx';
import AddNewArea from './Pages/Areas/AddNewArea.jsx';

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


          {/* ALL OTHER MODULES */}

          <Route path='admin/Users' element={<Users/>} ></Route>

          <Route path='admin/Divisions' element= {<DivisionOrTerritoty/>}></Route>

          <Route path='admin/Areas' element={<AreaMaster></AreaMaster>}></Route>
          <Route path='admin/Areas/list' element={<ListAreas></ListAreas>}></Route>
          <Route path='admin/Areas/add' element={<AddNewArea></AddNewArea>}></Route>

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;