import React, { useState, useRef, useEffect } from 'react';
import './Profile.css';  
import { Link } from 'react-router-dom';
import { FaBars, FaSearch, FaUserCircle } from 'react-icons/fa';
import styled from 'styled-components';
import { getDownloadURL, ref } from 'firebase/storage';
import { collection, addDoc, setDoc, doc, getDoc } from 'firebase/firestore';
import { interimDb, interimStorage } from '../components/firebase.config';


// Styled components for Sidebar and Main Content
const ProfileContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #f4f7f9; /* Light gray background for a modern look */
  font-family: 'Inter', sans-serif; /* Use Inter font */
`;

const Sidebar = styled.div`
  width: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')};
  background-color: #f8f9fa;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 100;
  overflow: hidden;
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
  border-radius: 8px;
  font-size: 14px;
  color: ${({ active }) => (active ? 'white' : '#333')};
  background-color: ${({ active }) => (active ? '#007bff' : 'transparent')};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ active }) => (active ? '#007bff' : '#f1f3f5')};
  }

  span:first-child {
    margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '10px' : '0px')};
    font-size: 1.2rem;
    color: #000;
    transition: margin-left 0.2s ease;
  }

  span:last-child {
    margin-left: 10px;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'inline' : 'none')};
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
  border-bottom: 1px solid #dee2e6;
  position: relative;

  .profile-icon {
    font-size: 2rem;
    margin-right: 10px;
  }

  .profile-name {
    font-size: 1rem;
    font-weight: 600;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
  }
`;

const Divider = styled.hr`
  border: 0;
  height: 1px;
  background-color: #dee2e6;
  margin: 10px 0;
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 20px;
  margin-bottom: 20px;
  display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex' : 'none')};
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
`;

const Profile = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [profileData, setProfileData] = useState({});
    const [profileImageURL, setProfileImageURL] = useState(null);
    const sidebarRef = useRef(null);

    const userId = 'user-id'; // Replace with dynamic user ID if available
    const profileImagePath = 'path/to/profile-image.jpg'; // Replace with dynamic image path if needed

    useEffect(() => {
        // Fetch user data from Firestore
        const fetchUserData = async () => {
            try {
                const docRef = doc(interimDb, 'users', userId); // Use the appropriate user ID
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfileData(docSnap.data());
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        // Fetch profile image URL from Storage
        const fetchProfileImage = async () => {
            try {
                const imageRef = ref(interimStorage, profileImagePath); // Adjust the path
                const url = await getDownloadURL(imageRef);
                setProfileImageURL(url);
            } catch (error) {
                console.error('Error fetching profile image URL:', error);
            }
        };

        fetchUserData();
        fetchProfileImage();

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <ProfileContainer>
            <Sidebar ref={sidebarRef} isSidebarOpen={isSidebarOpen}>
                <ProfileHeader isSidebarOpen={isSidebarOpen}>
                    {profileImageURL && <ProfileImage src={profileImageURL} alt="Profile" />}
                    <FaUserCircle className="profile-icon" />
                    <span className="profile-name">{profileData.firstName} {profileData.lastName}</span>
                </ProfileHeader>

                <Divider />

                <SearchBarContainer isSidebarOpen={isSidebarOpen}>
                    <FaSearch />
                    <SearchInput type="text" placeholder="Search..." />
                </SearchBarContainer>

                <SidebarMenu>
                    <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <span>🏠</span>
                            <span>Dashboard</span>
                        </SidebarItem>
                    </Link>
                    <Link to="/list-of-vendors" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <span>🛍️</span>
                            <span>List of Vendors</span>
                        </SidebarItem>
                    </Link>
                    <Link to="/Addunit" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <span>➕</span>
                            <span>Add New Unit</span>
                        </SidebarItem>
                    </Link>
                    <Link to="/manage-roles" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <span>👥</span>
                            <span>Manage Roles</span>
                        </SidebarItem>
                    </Link>
                    <Link to="/UserManagement" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <span>👤</span>
                            <span>User Management</span>
                        </SidebarItem>
                    </Link>
                    <Link to="/contract" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <span>📄</span>
                            <span>Contract</span>
                        </SidebarItem>
                    </Link>
                    <Link to="/settings" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <span>⚙️</span>
                            <span>Settings</span>
                        </SidebarItem>
                    </Link>
                </SidebarMenu>
            </Sidebar>

            <MainContent isSidebarOpen={isSidebarOpen}>
                <ToggleButton isSidebarOpen={isSidebarOpen} onClick={toggleSidebar}>
                    <FaBars />
                </ToggleButton>

                <h2>Profile</h2>

                <div className="profile-right">
                    <form>
                        <div className="form-group">
                            <label>First Name</label>
                            <input type="text" placeholder="John" />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input type="text" placeholder="Doe" />
                        </div>
                        <div className="form-group">
                            <label>Middle Name</label>
                            <input type="text" placeholder="Edward" />
                        </div>
                        <div className="form-group">
                            <label>Contact Number</label>
                            <input type="text" placeholder="(239) 816-9029" />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="john@example.com" />
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <input type="text" placeholder="Bay Area, San Francisco, CA" />
                        </div>
                        <div className="form-group">
                            <label>Position</label>
                            <input type="text" placeholder="Full Stack Developer" />
                        </div>
                        <div className="form-group">
                            <label>Location</label>
                            <input type="text" placeholder="San Francisco, CA" />
                        </div>

                        <button type="submit" className="btn-save">Save Changes</button>
                    </form>
                </div>
            </MainContent>
        </ProfileContainer>
    );
};

export default Profile;
