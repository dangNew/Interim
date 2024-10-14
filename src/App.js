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
import AssignCollector from './Interim/AssignCollector';
import AddCollector from './Interim/AddCollector';
import NewTicket from './Interim/NewTicket';
import ViewCollector from './Interim/ViewCollector';

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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
