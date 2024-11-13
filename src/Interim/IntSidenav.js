import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faCogs, faTicketAlt, faCheck, faClipboard, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { initializeApp } from 'firebase/app';
import { rentmobileDb } from '../components/firebase.config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

library.add(faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faCogs, faTicketAlt, faCheck, faClipboard, faPlusCircle);

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
`;

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
  font-size: 14px;
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

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '70px')};
  padding-left: 40px;
  background-color: #fff;
  padding: 2rem;
  width: 100%;
  transition: margin-left 0.3s ease;
  overflow-y: auto;
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

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const sidebarRef = useRef(null);
    const [isPositionActive, setIsPositionActive] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            setIsSidebarOpen(false);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
            if (loggedInUserData) {
                const usersCollection = collection(rentmobileDb, 'users');
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

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <DashboardContainer>
            <ToggleButton onClick={toggleSidebar}>
                <FaBars />
            </ToggleButton>
            <Sidebar ref={sidebarRef} isSidebarOpen={isSidebarOpen}>
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                    <ProfileHeader isSidebarOpen={isSidebarOpen}>
                        {loggedInUser && loggedInUser.Image ? (
                            <ProfileImage src={loggedInUser.Image} alt={`${loggedInUser.firstName} ${loggedInUser.lastName}`} />
                        ) : (
                            <FaUserCircle className="profile-icon" />
                        )}
                        <span className="profile-name">{loggedInUser ? `${loggedInUser.firstName} ${loggedInUser.lastName}` : 'Guest'}</span>
                        <span className="profile-email" style={{ fontSize: '0.9rem', color: '#6c757d', display: isSidebarOpen ? 'block' : 'none' }}>
                            {loggedInUser ? loggedInUser.email : ''}
                        </span>
                        <span className="profile-position" style={{ fontSize: '0.9rem', color: '#6c757d', display: isSidebarOpen ? 'block' : 'none' }}>
                            {loggedInUser ? loggedInUser.position : ''}
                        </span>
                    </ProfileHeader>
                </Link>

                <SidebarMenu>
                    <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <FontAwesomeIcon icon={faHome} className="icon" />
                            <span>Dashboard</span>
                        </SidebarItem>
                    </Link>

                    <Link to="/list" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <FontAwesomeIcon icon={faShoppingCart} className="icon" />
                            <span>List of Vendors</span>
                        </SidebarItem>
                    </Link>

                    <Link to="/listofstalls" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <FontAwesomeIcon icon={faClipboard} className="icon" />
                            <span>List of Stalls</span>
                        </SidebarItem>
                    </Link>

                    <SidebarItem isSidebarOpen={isSidebarOpen} onClick={handleDropdownToggle}>
                        <FontAwesomeIcon icon={faUser} className="icon" />
                        <span>User Management</span>
                    </SidebarItem>

                    {isDropdownOpen && (
                        <ul style={{ paddingLeft: '20px', listStyleType: 'none' }}>
                            <Link to="/usermanagement" style={{ textDecoration: 'none' }}>
                                <li>
                                    <SidebarItem isSidebarOpen={isSidebarOpen}>
                                        <FontAwesomeIcon icon={faSearch} className="icon" />
                                        <span>View Users</span>
                                    </SidebarItem>
                                </li>
                            </Link>
                            <Link to="/newuser" style={{ textDecoration: 'none' }}>
                                <li>
                                    <SidebarItem isSidebarOpen={isSidebarOpen}>
                                        <FontAwesomeIcon icon={faPlus} className="icon" />
                                        <span>Add User</span>
                                    </SidebarItem>
                                </li>
                            </Link>
                            <Link to="/addcollector" style={{ textDecoration: 'none' }}>
                                <li>
                                    <SidebarItem isSidebarOpen={isSidebarOpen}>
                                        <FontAwesomeIcon icon={faPlus} className="icon" />
                                        <span>Add Ambulant Collector</span>
                                    </SidebarItem>
                                </li>
                            </Link>
                        </ul>
                    )}

                    <Link to="/viewspace" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <FontAwesomeIcon icon={faPlus} className="icon" />
                            <span>Add New Unit</span>
                        </SidebarItem>
                    </Link>

                    <Link to="/appraise" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <FontAwesomeIcon icon={faUsers} className="icon" />
                            <span>Manage Appraisal</span>
                        </SidebarItem>
                    </Link>

                    <Link to="/contract" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <FontAwesomeIcon icon={faFileContract} className="icon" />
                            <span>Contract</span>
                        </SidebarItem>
                    </Link>

                    <Link to="/ticket" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <FontAwesomeIcon icon={faTicketAlt} className="icon" />
                            <span>Manage Ticket</span>
                        </SidebarItem>
                    </Link>

                    <SidebarItem isSidebarOpen={isSidebarOpen} onClick={handleDropdownToggle}>
                        <FontAwesomeIcon icon={faCogs} className="icon" />
                        <span>Manage Zone</span>
                    </SidebarItem>

                    {isDropdownOpen && (
                        <ul style={{ paddingLeft: '20px', listStyleType: 'none' }}>
                            <Link to="/addzone" style={{ textDecoration: 'none' }}>
                                <li>
                                    <SidebarItem isSidebarOpen={isSidebarOpen}>
                                        <FontAwesomeIcon icon={faPlusCircle} className="icon" />
                                        <span> Add Zone</span>
                                    </SidebarItem>
                                </li>
                            </Link>
                            <Link to="/viewzone" style={{ textDecoration: 'none' }}>
                                <li>
                                    <SidebarItem isSidebarOpen={isSidebarOpen}>
                                        <FontAwesomeIcon icon={faSearch} className="icon" />
                                        <span> View Zone</span>
                                    </SidebarItem>
                                </li>
                            </Link>
                        </ul>
                    )}

                    <SidebarItem isSidebarOpen={isSidebarOpen} onClick={handleDropdownToggle}>
                        <FontAwesomeIcon icon={faUser} className="icon" />
                        <span>Manage Space</span>
                    </SidebarItem>

                    {isDropdownOpen && (
                        <ul style={{ paddingLeft: '20px', listStyleType: 'none' }}>
                            <Link to="/addspace" style={{ textDecoration: 'none' }}>
                                <li>
                                    <SidebarItem isSidebarOpen={isSidebarOpen}>
                                        <FontAwesomeIcon icon={faPlusCircle} className="icon" />
                                        <span> Add Space</span>
                                    </SidebarItem>
                                </li>
                            </Link>
                            <Link to="/viewspace" style={{ textDecoration: 'none' }}>
                                <li>
                                    <SidebarItem isSidebarOpen={isSidebarOpen}>
                                        <FontAwesomeIcon icon={faSearch} className="icon" />
                                        <span> View Space</span>
                                    </SidebarItem>
                                </li>
                            </Link>
                        </ul>
                    )}
                </SidebarMenu>

                <SidebarFooter isSidebarOpen={isSidebarOpen}>
                    <LogoutButton isSidebarOpen={isSidebarOpen} onClick={handleLogout}>
                        <span><FaSignOutAlt /></span>
                        <span>Logout</span>
                    </LogoutButton>
                </SidebarFooter>
            </Sidebar>

            <MainContent isSidebarOpen={isSidebarOpen}>
                {/* Main content goes here */}
            </MainContent>
        </DashboardContainer>
    );
};

export default Dashboard;
