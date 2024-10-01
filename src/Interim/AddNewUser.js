import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { faBars, faList, faPlus, faIdBadge, faMagnifyingGlass, faHouseChimney, faUsers, faTriangleExclamation, faEye, faCircleUser, faPlusCircle, faStore, faTicketAlt } from '@fortawesome/free-solid-svg-icons';
import { FaSignOutAlt } from 'react-icons/fa';
import { FaSearch, FaUserCircle, FaBars } from 'react-icons/fa';
import { collection, addDoc, setDoc, doc, getDocs} from 'firebase/firestore';
import { faHome, faShoppingCart, faUser, faSearch, faFileContract, faCog } from '@fortawesome/free-solid-svg-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { interimStorage as storage } from '../components/firebase.config';
import { interimDb, interimAuth } from '../components/firebase.config';
library.add(faList, faPlus, faUser, faIdBadge, faMagnifyingGlass, faHouseChimney, faUsers, faTriangleExclamation, faEye, faCircleUser, faBars, FaSignOutAlt);

const AddUser = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')};
  background-color: #f8f9fa;
  padding: 10px;
  display: flex;
  border: 1px solid #ddd;  /* ADD THIS */
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
    font-size: 1rem;  /* Increase the icon size */
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
  position: relative;
  flex-direction: column;

  .profile-icon {
    font-size: 3rem;
    margin-bottom: 15px;
    color: #6c757d; // Subtle color for icon
  }

  .profile-name {
    font-size: 1.2rem;
    font-weight: 700; // Bolder text
    color: black; // Darker gray for a professional look
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
  }

  hr {
    width: 100%;
    border: 0.5px solid #ccc;
    margin-top: 15px;
  }

  .profile-position {
    font-size: 1rem; /* Increase the font size */
    font-weight: 600; /* Make it bold */
    color: #007bff; /* Change color to blue for better visibility */
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
    margin-top: 5px; /* Add some margin for spacing */
  }
`;


const ProfileImage = styled.img`
  border-radius: 50%;
  width: 60px; /* Adjusted for better visibility */
  height: 60px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); // Subtle shadow for a polished look
`;

const Divider = styled.hr`
  border: 2;
  height: 1px;
  background-color: #dee2e6;
  margin: 10px 0; /* Adjust margin for spacing as needed */
  width: 150%; /* Ensure the line spans the full width */
`;
const FormContainer = styled.form`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  background: #fff;
  border: 2px solid #ddd;
  padding: 60px;
  border-radius: 10px;
  max-width: 100%;
  width: 100%;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  align-self: center;

  label {
    font-size: 20px;
    margin-bottom: 5px;
  }

  input, select, textarea {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ddd;
    width: 100%;
  }

  .section-title {
    grid-column: span 2;
    font-size: 25px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
  }

  .form-section {
    display: flex;
    flex-direction: column;
  }

  .inline-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .button-group {
    grid-column: span 2;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      background-color: #4caf50;
      color: white;
      cursor: pointer;
      font-size: 1rem;
      font-weight: bold;

      &:hover {
        background-color: #45a049;
      }

      &.cancel {
        background-color: #f44336;

        &:hover {
          background-color: #d32f2f;
        }
      }
    }
  }

  .upload-btn-wrapper {
    position: relative;
    overflow: hidden;
    display: inline-block;

    button {
      border: 1px solid #ddd;
      color: gray;
      background-color: #f0f0f0;
      padding: 8px 20px;
      border-radius: 4px;
      font-size: 1rem;
    }

    input[type="file"] {
      font-size: 100px;
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0;
    }
  }
`;

const ImagePreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 2px dashed #ddd;
  border-radius: 10px;
  background-color: #f9f9f9;
  max-width: 300px;
  width: 100%;

  .image-preview {
    height: 200px;
    width: 200px;
    background-color: #e0e0e0;
    border: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    color: gray;
    margin-top: 5px;

    img {
      max-height: 100%;
      max-width: 100%;
      object-fit: cover;
    }
  }
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

const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 12px;
    width: 12px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #4caf50;
  }

  input:checked + .slider:before {
    transform: translateX(20px);
  }
`;

const AppBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 50px;
  background-color: #188423; /* Updated color */
  color: white;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  font-size: 22px;
  font-family: 'Inter', sans-serif; /* Use a professional font */
  font-weight: bold; /* Apply bold weight */
`;

const SidebarFooter = styled.div`
  padding: 10px;
  margin-top: auto; /* Pushes the footer to the bottom */
  display: flex;
  align-items: center;
  justify-content: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex-start' : 'center')};
`;

const LogoutButton = styled(SidebarItem)`
  margin-top: 5px; /* Add some margin */
  background-color: #dc3545; /* Bootstrap danger color */
  color: white;
  align-items: center;
  margin-left: 20px;
  padding: 5px 15px; /* Add padding for a better button size */
  border-radius: 5px; /* Rounded corners */
  font-weight: bold; /* Make text bold */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Subtle shadow for depth */
  transition: background-color 0.3s ease, transform 0.2s ease; /* Smooth transitions */

  &:hover {
    background-color: #c82333; /* Darker red on hover */
    transform: scale(1.05); /* Slightly scale up on hover */
  }
`;

const NewUnit = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); 
  const sidebarRef = useRef(null);
  const [isPositionActive, setIsPositionActive] = useState(false); // State for Toggle Switch
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    contactNum: '',
    email: '',
    password: '',
    address: '',
    position: '',
    location: '',
    Image: null,
    status: 'Active' 
  });

  const togglePositionSwitch = () => {
    setIsPositionActive(prevState => !prevState); 
  };
  
    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };
    useEffect(() => {
      const checkAndCreateCollection = async () => {
        const collectionName = 'users'; // Replace with your desired collection name
        const usersCollection = collection(interimDb, collectionName);
        const userDocs = await getDocs(usersCollection);
        
        // If the collection is empty, we can assume it doesn't exist
        if (userDocs.empty) {
          // Create the collection by adding a document or using setDoc if you want a specific document
          await setDoc(doc(usersCollection, 'dummyDocument'), {
            // Provide default fields as necessary
            firstName: '',
            lastName: '',
            middleName: '',
            contactNum: '',
            email: '',
            password: '',
            address: '',
            position: '',
            location: '',
            Image: null,
            status: 'Active'
          });
          console.log(`Collection '${collectionName}' was created.`);
        } else {
          console.log(`Collection '${collectionName}' already exists.`);
        }
      };
  
      checkAndCreateCollection(); // Call the function
    }, []);  

    useEffect(() => {
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
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); 

    const handleLogout = () => {
   
      localStorage.removeItem('userData'); 
      navigate('/login');
    };

    const handleDropdownToggle = () => {
      setIsDropdownOpen(!isDropdownOpen);
    };
  
    const handleChange = (e) => {
      const { id, value } = e.target;
      setUserData(prevState => ({
        ...prevState,
        [id]: value
      }));
    };
  
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file); 
        setImagePreviewUrl(previewUrl);              
        setUserData(prevState => ({
          ...prevState,
          Image: file
        }));
      }
    };


    const handleSubmit = async (e) => {
      e.preventDefault();
    
      
      if (!userData.email || !userData.password || !/\S+@\S+\.\S+/.test(userData.email)) {
        alert('Please provide a valid email and password.');
        return;
      }
      if (!userData.firstName || !userData.lastName || !userData.contactNum || !userData.address) {
        alert('Please fill in all required fields.');
        return;
      }
    
      try {
       
        const userCredential = await createUserWithEmailAndPassword(interimAuth, userData.email, userData.password);
        const user = userCredential.user;
    
        const { password, ...userWithoutPassword } = userData;
  
        let imageUrl = '';
        if (userData.Image) {
          try {
            const imageRef = ref(storage, 'images/' + userData.Image.name); 
            await uploadBytes(imageRef, userData.Image); 
            imageUrl = await getDownloadURL(imageRef); 
          } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
            return; 
          }
        }

        await setDoc(doc(interimDb, 'users', user.uid), {
          ...userWithoutPassword, 
          Image: imageUrl,        
          status: userData.status || 'Active'
        });
    
        alert('User added successfully!');
        setUserData({
          firstName: '',
          lastName: '',
          middleName: '',
          contactNum: '',
          email: '',
          password: '',
          address: '',
          position: '',
          location: '',
          Image: null,
          status: 'Active'
        });
        setImagePreviewUrl(null); 
      } catch (error) {
        console.error('Error adding user: ', error);
        if (error.code === 'auth/email-already-in-use') {
          alert('The email address is already in use.');
        } else if (error.code === 'auth/weak-password') {
          alert('The password is too weak.');
        } else {
          alert('Failed to add user. Please try again.');
        }
      }
    };

      

  return (
    <>
      <ToggleButton onClick={toggleSidebar}>
        <FaBars />
      </ToggleButton>

      <AddUser>
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
          
          {/* Add position below the email */}
          <span className="profile-position" style={{ fontSize: '0.9rem', color: '#6c757d', display: isSidebarOpen ? 'block' : 'none' }}>
            {loggedInUser ? loggedInUser.position : ''}
          </span>
        </ProfileHeader>
      </Link>


        <SearchBarContainer isSidebarOpen={isSidebarOpen}>
          <FaSearch />
          <SearchInput type="text" placeholder="Search..." />
        </SearchBarContainer>
        
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
    </ul>
  )}

  <Link to="/Addunit" style={{ textDecoration: 'none' }}>
    <SidebarItem isSidebarOpen={isSidebarOpen}>
      <FontAwesomeIcon icon={faPlus} className="icon" />
      <span>Add New Unit</span>
    </SidebarItem>
  </Link>

  <Link to="/manage-roles" style={{ textDecoration: 'none' }}>
    <SidebarItem isSidebarOpen={isSidebarOpen}>
      <FontAwesomeIcon icon={faUsers} className="icon" />
      <span>Manage Roles</span>
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

  <Link to="/settings" style={{ textDecoration: 'none' }}>
    <SidebarItem isSidebarOpen={isSidebarOpen}>
      <FontAwesomeIcon icon={faCog} className="icon" />
      <span>Settings</span>
    </SidebarItem>
  </Link>
</SidebarMenu>

      <SidebarFooter isSidebarOpen={isSidebarOpen}>
          <LogoutButton isSidebarOpen={isSidebarOpen} onClick={handleLogout}>
            <span><FaSignOutAlt /></span>
            <span>Logout</span>
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

        <MainContent isSidebarOpen={isSidebarOpen}>
        <AppBar>
        <div className="title">INTERIM</div>
      </AppBar>

            <ProfileHeader>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faPlusCircle} style={{ color: 'green', marginRight: '10px' }} size="3x" />
              <h1 style={{ margin: 0 }}>NEW USER</h1>
            </div>
          </ProfileHeader>

          <FormContainer onSubmit={handleSubmit}>
            <div className="section-title">Basic Details</div>
            <Divider /> {/* Full-width horizontal line */}<span></span>
            <div className="form-section">
              <label htmlFor="firstName">First Name</label>
              <input id="firstName" type="text" value={userData.firstName} onChange={handleChange} placeholder="Enter First Name" />
            </div>
            <div className="form-section">
              <label htmlFor="middleName">Middle Name</label>
              <input id="middleName" type="text" value={userData.middleName} onChange={handleChange} placeholder="Enter Middle Name" />
            </div>
            <div className="form-section">
              <label htmlFor="lastName">Last Name</label>
              <input id="lastName" type="text" value={userData.lastName} onChange={handleChange} placeholder="Enter Last Name" />
            </div>
            <div className="form-section">
              <label htmlFor="contactNum">Contact Number</label>
              <input id="contactNum" type="text" value={userData.contactNum} onChange={handleChange} placeholder="Enter Contact Number" />
            </div>
            <span></span>
            <div className="section-title">Login Details</div>
            <Divider /> {/* Add the horizontal line here */}<span></span>
            <div className="form-section">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={userData.email} onChange={handleChange} placeholder="Enter Email" />
            </div>
            <div className="form-section">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={userData.password} onChange={handleChange} placeholder="Enter Password" />
            </div>
            <span></span><span></span>
            <div className="section-title">Other Details</div>
            <Divider /> {/* Add the horizontal line here */}<span></span>
            <div className="form-section">
              <label htmlFor="address">Address</label>
              <input id="address" type="text" value={userData.address} onChange={handleChange} placeholder="Enter Address" />
            </div>
            <div className="form-section">
              <label htmlFor="location">Location</label>
              <input id="location" type="text" value={userData.location} onChange={handleChange} placeholder="Enter Location" />
            </div>
            <div className="form-section">
              <label htmlFor="position">Position</label>
              <select id="position" value={userData.position} onChange={handleChange}>
              <option value="Admin">Admin</option>
              <option value="Collector">Collector</option>
              <option value="Office In Charge">Office In Charge</option>
              <option value="CTO">CTO</option>
              <option value="Interim">Interim</option>

              </select>
            </div>

            <div>
            <label htmlFor="toggleSwitch">Active Status</label>
            <ToggleSwitch>
            <span>Active</span>
            <label className="switch">
              <input type="checkbox" checked={isPositionActive} onChange={togglePositionSwitch} />
              <span className="slider"></span>
            </label>
          </ToggleSwitch>
                </div>

            <div className="form-section">
              <label htmlFor="Image">Upload Image:</label>
              <input type="file" id="Image" onChange={handleFileChange} />
              <div className="image-preview">
                {imagePreviewUrl ? <img src={imagePreviewUrl} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }} /> : 'No file chosen'}
              </div>
            </div>

            <div className="button-group">
              <button className="cancel" type="button">Cancel</button>
              <button type="submit">Save</button>
            </div>
          </FormContainer>
        
        </MainContent>
      </AddUser>
    </>
  );
};

export default NewUnit;
