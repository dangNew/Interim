import React, { forwardRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaUserCircle, FaSignOutAlt, FaSearch } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faCogs, faTicketAlt, faCheck, faClipboard, faPlusCircle, faCubes, faUserEdit, faCashRegister, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { initializeApp } from 'firebase/app';
import { rentmobileDb } from '../components/firebase.config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

library.add(faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faCogs, faTicketAlt, faCheck, faClipboard, faPlusCircle);

const Sidebar = styled.div`
  width: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')};
  background-color: #f8f9fa;
  padding: 10px;
  display: flex;
  border: 1px solid #ddd;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 100;
  overflow-y: auto;
`;

const SidebarMenu = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const SidebarItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex-start' : 'center')};
  padding: 10px;
  margin-bottom: 10px;
  margin-top: -10px;
  border-radius: 8px;
  font-size: 13px;
  color: ${({ active }) => (active ? 'white' : '#333')};
  background-color: ${({ active }) => (active ? '#007bff' : 'transparent')};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ active }) => (active ? '#007bff' : '#f1f3f5')};
  }

  .icon {
    font-size: 1rem;
    color: #000;
    transition: margin-left 0.2s ease;
  }

  span:last-child {
    margin-left: 10px;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'inline' : 'none')};
  }
`;

const SidebarFooter = styled.div`
  padding: 10px;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex-start' : 'center')};
`;

const LogoutButton = styled(SidebarItem)`
  margin-top: 5px;
  background-color: #dc3545;
  color: white;
  align-items: center;
  margin-left: 20px;
  padding: 5px 15px;
  border-radius: 5px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #c82333;
    transform: scale(1.05);
  }
`;

const ToggleButton = styled.div`
  display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'none' : 'block')};
  position: absolute;
  top: 5px;
  left: 15px;
  font-size: 1.8rem;
  color: #333;
  cursor: pointer;
  z-index: 200;
`;


const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 40px 10px;
  position: relative;
  flex-direction: column;

  .profile-icon {
    font-size: 3rem;
    margin-bottom: 15px;
    color: #6c757d;
  }

  .profile-name {
    font-size: 1.2rem;
    font-weight: 700;
    color: black;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
  }

  hr {
    width: 100%;
    border: 0.5px solid #ccc;
    margin-top: 15px;
  }

  .profile-position {
    font-size: 1rem;
    font-weight: 600;
    color: #007bff;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
    margin-top: 5px;
  }
`;

const ProfileImage = styled.img`
  border-radius: 50%;
  width: 60px;
  height: 60px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 20px;
  margin-bottom: 20px;
  margin-top: -25px;
  display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex' : 'none')};
`;
const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
`;

const SidenavCollector = forwardRef(({ isSidebarOpen, setIsSidebarOpen, loggedInUser }, ref) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    userManagement: false,
    stallmanagement: false,
    addUnit: false,
    appraise: false,
    contract: false,
    ticket: false,
    manageZone: false,
    manageSpace: false,
  });
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDropdownToggle = (dropdown) => {
    setIsDropdownOpen(prevState => ({
      ...prevState,
      [dropdown]: !prevState[dropdown],
    }));
  };


  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/login');
  };

  return (
    <Sidebar ref={ref} isSidebarOpen={isSidebarOpen}>
        <ToggleButton onClick={toggleSidebar}>
        <FaBars />
      </ToggleButton>
        <Link to="/profile" style={{ textDecoration: "none" }}>
          <ProfileHeader isSidebarOpen={isSidebarOpen}>
            {loggedInUser && loggedInUser.Image ? (
              <ProfileImage
                src={loggedInUser.Image}
                alt={`${loggedInUser.firstName} ${loggedInUser.lastName}`}
              />
            ) : (
              <FaUserCircle className="profile-icon" />
            )}
            <span className="profile-name">
              {loggedInUser
                ? `${loggedInUser.firstName} ${loggedInUser.lastName}`
                : "Guest"}
            </span>
            <span
              className="profile-email"
              style={{
                fontSize: "0.9rem",
                color: "#6c757d",
                display: isSidebarOpen ? "block" : "none",
              }}
            >
              {loggedInUser ? loggedInUser.email : ""}
            </span>
            <span
              className="profile-position"
              style={{
                fontSize: "0.9rem",
                color: "#6c757d",
                display: isSidebarOpen ? "block" : "none",
              }}
            >
              {loggedInUser ? loggedInUser.position : ""}
            </span>
          </ProfileHeader>
        </Link>

        <SearchBarContainer isSidebarOpen={isSidebarOpen}>
          <FaSearch />
          <SearchInput type="text" placeholder="Search..." />
        </SearchBarContainer>

        <SidebarMenu>
          <Link to="/collectdash" style={{ textDecoration: "none" }}>
            <SidebarItem isSidebarOpen={isSidebarOpen}>
              <FontAwesomeIcon icon={faHome} className="icon" />
              <span>Dashboard</span>
            </SidebarItem>
          </Link>

          <Link to="/stallholders" style={{ textDecoration: "none" }}>
            <SidebarItem isSidebarOpen={isSidebarOpen}>
              <FontAwesomeIcon icon={faShoppingCart} className="icon" />
              <span> Transaction</span>
            </SidebarItem>
          </Link>
          <Link to="/transaction" style={{ textDecoration: "none" }}>
            <SidebarItem isSidebarOpen={isSidebarOpen}>
              <FontAwesomeIcon icon={faShoppingCart} className="icon" />
              <span>List Of Vendors</span>
            </SidebarItem>
          </Link>
        </SidebarMenu>

        <SidebarFooter isSidebarOpen={isSidebarOpen}>
          <LogoutButton isSidebarOpen={isSidebarOpen} onClick={handleLogout}>
            <span>
              <FaSignOutAlt />
            </span>
            <span>Logout</span>
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>
  );
});

export default SidenavCollector;
