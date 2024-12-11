import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { interimDb, rentmobileDb } from '../components/firebase.config'; // Import the correct firestore instance
import IntSidenav from './IntSidenav';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')};
  padding: 2rem;
  background-color: #fff;
  width: calc(100% - ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')});
  transition: margin-left 0.3s ease, width 0.3s ease;
  overflow-y: auto;
`;

const AppBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
  background-color: #188423;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-size: 22px;
  font-family: 'Inter', sans-serif;
  font-weight: bold;
`;

const UnitContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 2rem;
`;

const UnitCard = styled.div`
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;

  h4 {
    margin-bottom: 10px;
    color: #343a40;
    font-size: 18px;
    font-weight: 700;
  }

  p {
    margin-bottom: 10px;
    color: #6c757d;
    font-size: 14px;
  }

  button {
    margin: 5px;
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;

    &.view {
      background-color: #007bff;
      color: white;
    }

    &.edit {
      background-color: #ffc107;
      color: white;
    }

    &.delete {
      background-color: #dc3545;
      color: white;
    }

    &:hover {
      opacity: 0.8;
    }
  }
`;

const AddUnitButton = styled.button`
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;

  &:hover {
    background-color: #218838;
  }
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [zones, setZones] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchZones = async () => {
    const zonesCollection = collection(rentmobileDb, 'zone');
    const zonesSnapshot = await getDocs(zonesCollection);
    const zonesData = zonesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setZones(zonesData);
  };

  useEffect(() => {
    fetchZones();

    const fetchUserData = async () => {
      const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
      if (loggedInUserData) {
        const usersCollection = collection(interimDb, 'users');
        const userDocs = await getDocs(usersCollection);
        const users = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const currentUser = users.find(user => user.email === loggedInUserData.email);
        setLoggedInUser(currentUser || loggedInUserData);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMainContentClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <DashboardContainer>
      <div ref={sidebarRef}>
        <IntSidenav
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          loggedInUser={loggedInUser}
        />
      </div>
      <MainContent isSidebarOpen={isSidebarOpen} onClick={handleMainContentClick}>
        <AppBar>
          <div className="title">OFFICE OF THE CITY MARKETS</div>
        </AppBar>
        <br></br>
        <AddUnitButton>+ Add New Zone</AddUnitButton>
        <UnitContainer>
          {zones.map(zone => (
            <UnitCard key={zone.id}>
              <h4>{zone.zone}</h4>
              <p>Address: {zone.address}</p>
              <button className="view"><FaEye /> View</button>
              <button className="edit"><FaEdit /> Edit</button>
              <button className="delete"><FaTrash /> Delete</button>
            </UnitCard>
          ))}
        </UnitContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
