import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './Interim/AuthContext'; // Ensure the path is correct
import ProtectedRoute from './Interim/ProtectedRoute'; // Ensure the path is correct

import ListOfStallholders from './Collector/ListOfStallholders';
import ViewPayment from './Collector/ViewPayment';
import SignUp from './Interim/Signup'; 
import Login from './Interim/Login';
import Dashboard from './Interim/Dashboard';
import ListOfVendors from './Interim/ListOfVendors'; 
import AddUnit from './Interim/AddUnit';
import UserManagement from './Interim/UserManagement';
import AddNewUser from './Interim/AddNewUser'; 
import LoginCTO from './CTO/LoginCTO';
import Modal from './Interim/Modal';
import Profile from './Interim/Profile';
import UserEdit from './Interim/UserEdit';
import ContractManagement from './Interim/Contract';
import Ticket from './Interim/Ticket';
import TicketEdit from './Interim/TicketEdit';
import AddSpace from './Interim/AddSpace';
import AddCollector from './Interim/AddCollector';
import NewTicket from './Interim/NewTicket';
import ViewCollector from './Interim/ViewCollector'; //delete nya
import Viewunit from './Interim/viewunit';
import ViewUser from './Interim/ViewUser';
import ViewStallholder from './Interim/ViewStallholder'; 
import EditUnit from './Interim/EditUnit'; 
import AddZone from './Interim/AddZone'; 
import ListOfStalls from './Interim/ListOfStalls'; 
import ViewSpace from './Interim/ViewSpace'; 
import EditSpace from './Interim/EditSpace'; 
import AssignCollector from './Interim/AssignCollector'; 
import ManageAppraise from './Interim/ManageAppraise'; 
import Stallholders from './Collector/Stallholders';
import CollectorDash from './Collector/CollectorDash';
import InterimAnnouncement from './Interim/InterimAnnouncement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes */}
       
          <Route path="/view-payment/:id" element={<ProtectedRoute><ViewPayment /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/list" element={<ProtectedRoute element={<ListOfVendors
            />} />} />
          <Route path="/addunit" element={<ProtectedRoute element={<AddUnit
            />} />} />
          <Route path="/userManagement" element={<ProtectedRoute element={<UserManagement
            />} />} />
          <Route path="/newuser" element={<ProtectedRoute element={<AddNewUser
            />} />} />
          <Route path="/modal"  element={<ProtectedRoute element={<Modal
            />} />} />
          <Route path="/profile"  element={<ProtectedRoute element={<Profile
            />} />} />
          <Route path="/edit/:id"  element={<ProtectedRoute element={<UserEdit
            />} />} />
          <Route path="/contract"  element={<ProtectedRoute element={<ContractManagement
            />} />} />
          <Route path="/ticket"  element={<ProtectedRoute element={<Ticket
            />} />} />
          <Route path="/ticketEdit/:id"  element={<ProtectedRoute element={<TicketEdit
            />} />} />
          <Route path="/addspace"  element={<ProtectedRoute element={<AddSpace
            />} />} />
          <Route path="/addcollector" element={<ProtectedRoute element={<AddCollector
            />} />} />
          <Route path="/newticket"  element={<ProtectedRoute element={<NewTicket
            />} />} />
          <Route path="/View"  element={<ProtectedRoute element={<ViewCollector
            />} />} /> /*delete sad later */
          <Route path="/viewunit" element={<ProtectedRoute element={<Viewunit />} />} />
            <Route path="/viewuser/:userId" element={<ViewUser />} />
          <Route path="/view-stallholder/:id" element={<ViewStallholder />} />
          <Route path="/edit-unit/:id" element={<EditUnit />} />
          <Route path="/addzone" element={<AddZone />} />
          <Route path="/listofstalls" element={<ListOfStalls />} />
          <Route path="/viewspace" element={<ViewSpace />} />
          <Route path="/editspace/:id" element={<EditSpace />} />
          <Route path="/assigncollector" element={<AssignCollector />} />
          <Route path="/appraise" element={<ManageAppraise />} />
          <Route path="/stallholders" element={<Stallholders />} />
          <Route path="/collectdash" element={<CollectorDash />} />
          <Route path="/announce" element={<InterimAnnouncement />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
