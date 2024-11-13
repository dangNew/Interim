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
import LoginCTO from './CTO/LoginCTO'; // Correct import
import Modal from './Interim/Modal';
import Profile from './Interim/Profile';
import UserEdit from './Interim/UserEdit';
import ContractManagement from './Interim/Contract';
import Ticket from './Interim/Ticket';
import TicketEdit from './Interim/TicketEdit';
import AddSpace from './Interim/AddSpace';
import AddCollector from './Interim/AddCollector';
import NewTicket from './Interim/NewTicket';
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

import Payroll from './payroll/payroll';
import Quiz from './quiz';
import SideNav from './OIC/side_nav';
import OICDashboard from './OIC/oic_dashboard';
import OICListOfVendors from './OIC/OICListOfVendors';
import AddNewStall from './OIC/AddNewStall'; // New import
import VendorVerification from './OIC/VendorVerification'; // New import
import VendorReallocation from './OIC/VendorReallocation'; // New import
import DeclinedVendors from './OIC/DeclinedVendors'; // New import
import EditVendors from './OIC/EditVendors';
import EditVerification from './OIC/EditVerification';

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
          <Route path="/list" element={<ProtectedRoute element={<ListOfVendors />} />} />
          <Route path="/addunit" element={<ProtectedRoute element={<AddUnit />} />} />
          <Route path="/userManagement" element={<ProtectedRoute element={<UserManagement />} />} />
          <Route path="/newuser" element={<ProtectedRoute element={<AddNewUser />} />} />
          <Route path="/modal" element={<ProtectedRoute element={<Modal />} />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/edit/:id" element={<ProtectedRoute element={<UserEdit />} />} />
          <Route path="/contract" element={<ProtectedRoute element={<ContractManagement />} />} />
          <Route path="/ticket" element={<ProtectedRoute element={<Ticket />} />} />
          <Route path="/ticketEdit/:id" element={<ProtectedRoute element={<TicketEdit />} />} />
          <Route path="/addspace" element={<ProtectedRoute element={<AddSpace />} />} />
          <Route path="/addcollector" element={<ProtectedRoute element={<AddCollector />} />} />
          <Route path="/newticket" element={<ProtectedRoute element={<NewTicket />} />} />
          <Route path="/viewunit" element={<ProtectedRoute element={<Viewunit />} />} />
          <Route path="/viewuser/:userId" element={<ProtectedRoute element={<ViewUser />} />} />
          <Route path="/view-stallholder/:id" element={<ProtectedRoute element={<ViewStallholder />} />} />
          <Route path="/edit-unit/:id" element={<ProtectedRoute element={<EditUnit />} />} />
          <Route path="/addzone" element={<ProtectedRoute element={<AddZone />} />} />
          <Route path="/listofstalls" element={<ProtectedRoute element={<ListOfStalls />} />} />
          <Route path="/viewspace" element={<ProtectedRoute element={<ViewSpace />} />} />
          <Route path="/editspace/:id" element={<ProtectedRoute element={<EditSpace />} />} />
          <Route path="/assigncollector" element={<ProtectedRoute element={<AssignCollector />} />} />
          <Route path="/appraise" element={<ProtectedRoute element={<ManageAppraise />} />} />
          <Route path="/stallholders" element={<ProtectedRoute element={<Stallholders />} />} />
          <Route path="/collectdash" element={<ProtectedRoute element={<CollectorDash />} />} />
          <Route path="/announce" element={<ProtectedRoute element={<InterimAnnouncement />} />} />

          {/* OIC Routes */}
          <Route path="/oic_dashboard" element={<ProtectedRoute element={<OICDashboard />} />} />
          <Route path="/vendors" element={<ProtectedRoute element={<OICListOfVendors />} />} />
          <Route path="/vendor-verification" element={<ProtectedRoute element={<VendorVerification />} />} />
          <Route path="/vendor-reallocation" element={<ProtectedRoute element={<VendorReallocation />} />} />
          <Route path="/declined-vendors" element={<ProtectedRoute element={<DeclinedVendors />} />} />
          <Route path="/stalls" element={<ProtectedRoute element={<ListOfStalls />} />} />
          <Route path="/add-stall" element={<ProtectedRoute element={<AddNewStall />} />} />
          <Route path="/edit-vendors/:Id" element={<ProtectedRoute element={<EditVendors />} />} />
          <Route path="/edit-verification/:vendorId" element={<ProtectedRoute element={<EditVerification />} />} />

          {/* Other Routes */}
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/side_nav" element={<SideNav />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
