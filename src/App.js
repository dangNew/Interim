import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import ListOfStallholders from './Collector/ListOfStallholders';
import ViewPayment from './Collector/ViewPayment';
import SignUp from './Interim/Signup'; 
import Login from './Interim/Login';
import Dashboard from './Interim/Dashboard';
import ListOfVendors from './Interim/ListOfVendors'; 
import AddUnit from './Interim/AddUnit';
import UserManagement from './Interim/UserManagement';
import AddNewUser from './Interim/AddNewUser'; 
import LoginCTO from './CTO/LoginCTO'; // Correct import//new
import DashboardNew from './NewInt/dashboard';
import Modal from './Interim/Modal';
import Profile from './Interim/Profile';
//import Profile from './CTO/Profile';
import UserEdit from './Interim/UserEdit';
import ContractManagement from './Interim/Contract';
import Ticket from './Interim/Ticket';
import TicketEdit from './Interim/TicketEdit';
import AssignCollector from './Interim/AssignCollector';
import AddCollector from './Interim/AddCollector';
import NewTicket from './Interim/NewTicket';




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/stallholders" element={<ListOfStallholders />} />
        <Route path="/view-payment/:id" element={<ViewPayment />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/list" element={<ListOfVendors />} />
        <Route path="/Addunit" element={<AddUnit />} />
        <Route path="/userManagement" element={<UserManagement />} />
        <Route path="/newuser" element={<AddNewUser />} />
        <Route path="/Login" element={<LoginCTO/>} />
        <Route path="/modal" element={<Modal/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/ctoprofile" element={<Profile/>} />
        <Route path="/edit/:id" element={<UserEdit/>} />
        <Route path="/contract" element={<ContractManagement/>} />
        <Route path="/ticket" element={<Ticket/>} />
        <Route path="/ticketEdit/:id" element={<TicketEdit />} />
        <Route path="/assign" element={<AssignCollector />} />
        <Route path="/addcollector" element={<AddCollector />} />
        <Route path="/newticket" element={<NewTicket />} />
      </Routes>
    </Router>
  );
}

export default App;
