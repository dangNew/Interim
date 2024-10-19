import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
<<<<<<< HEAD
import { AuthProvider } from './Interim/AuthContext'; // Ensure the path is correct
import ProtectedRoute from './Interim/ProtectedRoute'; // Ensure the path is correct
=======
>>>>>>> a8f5076 (main)

import ListOfStallholders from './Collector/ListOfStallholders';
import ViewPayment from './Collector/ViewPayment';
import SignUp from './Interim/Signup'; 
import Login from './Interim/Login';
import Dashboard from './Interim/Dashboard';
import ListOfVendors from './Interim/ListOfVendors'; 
import AddUnit from './Interim/AddUnit';
import UserManagement from './Interim/UserManagement';
import AddNewUser from './Interim/AddNewUser'; 
<<<<<<< HEAD
import LoginCTO from './CTO/LoginCTO';
=======
import LoginCTO from './CTO/LoginCTO'; // Correct import
import DashboardNew from './NewInt/dashboard';
>>>>>>> a8f5076 (main)
import Modal from './Interim/Modal';
import Profile from './Interim/Profile';
import UserEdit from './Interim/UserEdit';
import ContractManagement from './Interim/Contract';
import Ticket from './Interim/Ticket';
import TicketEdit from './Interim/TicketEdit';
import AssignCollector from './Interim/AssignCollector';
import AddCollector from './Interim/AddCollector';
import NewTicket from './Interim/NewTicket';
<<<<<<< HEAD
import ViewCollector from './Interim/ViewCollector';
import Viewunit from './Interim/viewunit';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes */}
          <Route path="/stallholders" element={<ProtectedRoute><ListOfStallholders /></ProtectedRoute>} />
          <Route path="/view-payment/:id" element={<ProtectedRoute><ViewPayment /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/list" element={<ProtectedRoute element={<ListOfVendors
            />} />} />
          <Route path="/Addunit" element={<ProtectedRoute element={<AddUnit
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
          <Route path="/assign"  element={<ProtectedRoute element={<AssignCollector
            />} />} />
          <Route path="/addcollector" element={<ProtectedRoute element={<AddCollector
            />} />} />
          <Route path="/newticket"  element={<ProtectedRoute element={<NewTicket
            />} />} />
          <Route path="/View"  element={<ProtectedRoute element={<ViewCollector
            />} />} />
          <Route path="/viewunit"  element={<ProtectedRoute element={<Viewunit
            />} />} />
        </Routes>
      </Router>
    </AuthProvider>
=======
import Payroll from './payroll/payroll';
import Quiz from './quiz';
import SideNav from './OIC/side_nav';
import OICDashboard from './OIC/oic_dashboard';
import ListOfStalls from './OIC/ListOfStalls'; 
import OICListOfVendors from './OIC/OICListOfVendors'; 
import AddNewStall from './OIC/AddNewStall'; // New import
import VendorVerification from './OIC/VendorVerification'; // New import
import VendorReallocation from './OIC/VendorReallocation'; // New import
import DeclinedVendors from './OIC/DeclinedVendors'; // New import
import EditVendors from './OIC/EditVendors';
import EditVerification from './OIC/EditVerification';
// import Violations from './OIC/Violations'; // New import
// import Announcement from './OIC/Announcement'; // New import
// import Settings from './OIC/Settings'; // New import

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
        <Route path="/Login" element={<LoginCTO />} />
        <Route path="/modal" element={<Modal />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ctoprofile" element={<Profile />} />
        <Route path="/edit/:id" element={<UserEdit />} />
        <Route path="/contract" element={<ContractManagement />} />
        <Route path="/ticket" element={<Ticket />} />
        <Route path="/ticketEdit/:id" element={<TicketEdit />} />
        <Route path="/assign" element={<AssignCollector />} />
        <Route path="/addcollector" element={<AddCollector />} />
        <Route path="/newticket" element={<NewTicket />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/quiz" element={<Quiz />} />
        
        {/* OIC Routes */}
        <Route path="/oic_dashboard" element={<OICDashboard />} />
        <Route path="/vendors" element={<OICListOfVendors />} />
        <Route path="/vendor-verification" element={<VendorVerification />} />
        <Route path="/vendor-reallocation" element={<VendorReallocation />} />
        <Route path="/declined-vendors" element={<DeclinedVendors />} />
        <Route path="/stalls" element={<ListOfStalls />} />
        <Route path="/add-stall" element={<AddNewStall />} />
        <Route path="/edit-vendors/:Id" element={<EditVendors />} />
        <Route path="/edit-verification/:vendorId" element={<EditVerification />} />



        {/* <Route path="/violations" element={<Violations />} />
        <Route path="/announcement" element={<Announcement />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/logout" element={<Logout />} />  */}

        <Route path="/side_nav" element={<SideNav />} />
      </Routes>
    </Router>
>>>>>>> a8f5076 (main)
  );
}

export default App;
