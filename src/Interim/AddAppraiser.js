import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faList, faPlus, faIdBadge, faMagnifyingGlass, faHouseChimney, faUsers, faTriangleExclamation, faEye, faCircleUser, faPlusCircle, faStore, faTicketAlt, faCheck, faClipboard, faFileContract, faCogs, faUser, faHome, faShoppingCart, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FaSignOutAlt, FaUserCircle, FaBars } from 'react-icons/fa';
import { collection, addDoc, setDoc, doc, getDocs, serverTimestamp, query, where, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { interimStorage as storage } from '../components/firebase.config';
import { rentmobileDb, rentmobileAuth } from '../components/firebase.config';
import IntSidenav from './IntSidenav';

library.add(faList, faPlus, faUser, faIdBadge, faMagnifyingGlass, faHouseChimney, faUsers, faTriangleExclamation, faEye, faCircleUser, faBars, FaSignOutAlt);

const AddUser = styled.div`
  display: flex;
  height: 100vh;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')};
  padding-left: 10px;
  background-color: #fff;
  padding: 2rem;
  width: calc(100% - ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')});
  transition: margin-left 0.3s ease, width 0.3s ease;
  overflow-y: auto;
`;

const Divider = styled.hr`
  border: 2;
  height: 1px;
  background-color: #dee2e6;
  margin: 10px 0;
  width: 100%;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: #fff;
  border: 2px solid #ddd;
  padding: 1rem;
  border-radius: 20px;
  max-width: 98%;
  width: 100%;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  align-self: center;
  margin-top: 20px;

  .section-title {
    font-size: 25px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .inline-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .button-group {
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

const NewUnit = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const sidebarRef = useRef(null);
  const [isPositionActive, setIsPositionActive] = useState(false); // State for Toggle Switch
  const [contactNumWarning, setContactNumWarning] = useState('');
  const [locations, setLocations] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    userManagement: false,
    addUnit: false,
    appraise: false,
    contract: false,
    ticket: false,
    manageZone: false,
    manageSpace: false,
  });
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    appraisal: '',
    appraisal_assign: '',
    Address_appraisal: '',
    contact_number: '',
    contact_appraisal: '',
    created_date: '',
    address: '',
    profileImages: null,
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
      const collectionName = 'appraisal_user';
      const usersCollection = collection(rentmobileDb, collectionName);
      const userDocs = await getDocs(usersCollection);

      // If the collection is empty, we can assume it doesn't exist
      if (userDocs.empty) {
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
        const usersCollection = collection(rentmobileDb, 'appraisal_user');
        const userDocs = await getDocs(usersCollection);
        const users = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const currentUser = users.find(user => user.email === loggedInUserData.email);
        setLoggedInUser(currentUser || loggedInUserData);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      const unitsCollection = collection(rentmobileDb, 'unit');
      const unitDocs = await getDocs(unitsCollection);
      const unitNames = unitDocs.docs.map(doc => doc.data().name);
      setLocations(unitNames);
    };

    fetchLocations();
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

  const handleMainContentClick = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === 'contact_number') {
      // Only allow digits and limit to 11 characters
      const numericValue = value.replace(/\D/g, ''); // Remove any non-numeric characters
      if (numericValue.length <= 11) {
        setUserData(prevState => ({
          ...prevState,
          [id]: numericValue
        }));

        // Set warning if contact_number is not exactly 11 digits
        if (numericValue.length !== 11 && numericValue.length > 0) {
          setContactNumWarning('Contact number must be exactly 11 digits.');
        } else {
          setContactNumWarning(''); // Clear warning if length is valid
        }
      }
    } else {
      setUserData(prevState => ({
        ...prevState,
        [id]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
      setUserData(prevState => ({
        ...prevState,
        profileImages: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData.email || !userData.password || !/\S+@\S+\.\S+/.test(userData.email)) {
      alert('Please provide a valid email and password.');
      return;
    }
    if (!userData.firstname || !userData.lastname || !userData.contact_number || !userData.address) {
      alert('Please fill in all required fields.');
      return;
    }

    // Check if the appraisal value exists in Firestore
    const appraisalCollection = collection(rentmobileDb, 'appraisal_user');
    const appraisalQuery = query(appraisalCollection, where('appraisal', '==', userData.appraisal));
    const appraisalDocs = await getDocs(appraisalQuery);

    if (!appraisalDocs.empty) {
      alert('Appraisal value already exists. Please choose a different value.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(rentmobileAuth, userData.email, userData.password);
      const user = userCredential.user;

      const { password, ...userWithoutPassword } = userData;

      let imageUrl = '';
      if (userData.profileImages) {
        try {
          const imageRef = ref(storage, 'images/' + userData.profileImages.name);
          await uploadBytes(imageRef, userData.profileImages);
          imageUrl = await getDownloadURL(imageRef);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
          return;
        }
      }

      await setDoc(doc(rentmobileDb, 'appraisal_user', user.uid), {
        ...userWithoutPassword,
        profileImages: imageUrl,
        status: userData.status || 'Active',
        created_date: serverTimestamp()
      });

      alert('User added successfully!');
      setUserData({
        firstname: '',
        lastname: '',
        email: '',
        appraisal: '',
        appraisal_assign: '',
        Address_appraisal: '',
        contact_number: '',
        contact_appraisal: '',
        created_date: '',
        address: '',
        profileImages: null,
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
      <AddUser>
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

          <FormContainer onSubmit={handleSubmit}>
            <div className="section-title">Basic Details</div>
            <Divider /> {/* Full-width horizontal line */}
            <div className="inline-group">
              <div className="form-section">
                <label htmlFor="firstname">First Name</label>
                <input id="firstname" type="text" value={userData.firstname} onChange={handleChange} placeholder="Enter First Name" />
              </div>
              <div className="form-section">
                <label htmlFor="lastname">Last Name</label>
                <input id="lastname" type="text" value={userData.lastName} onChange={handleChange} placeholder="Enter Last Name" />
              </div>
            </div>
            <div className="inline-group">
              <div className="form-section">
                <label htmlFor="contact_number">Contact Number</label>
                <input
                  type="text"
                  id="contact_number"
                  value={userData.contact_number}
                  onChange={handleChange}
                  placeholder="Enter 11-digit contact number"
                />
                {contactNumWarning && <p style={{ color: 'red' }}>{contactNumWarning}</p>}
              </div>
              <div className="form-section">
                <label htmlFor="contact_appraisal">Contact Appraisal</label>
                <input
                  type="text"
                  id="contact_appraisal"
                  value={userData.contact_appraisal}
                  onChange={handleChange}
                  placeholder="Enter contact appraisal (e.g., Gmail account)"
                />
              </div>
            </div>
            <div className="section-title">Login Details</div>
            <Divider /> {/* Add the horizontal line here */}
            <div className="inline-group">
              <div className="form-section">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={userData.email} onChange={handleChange} placeholder="Enter Email" />
              </div>
              <div className="form-section">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" value={userData.password} onChange={handleChange} placeholder="Enter Password" />
              </div>
            </div>
            <div className="section-title">Other Details</div>
            <Divider /> {/* Add the horizontal line here */}
            <div className="inline-group">
              <div className="form-section">
                <label htmlFor="appraisal">Appraisal</label>
                <input id="appraisal" type="text" value={userData.appraisal} onChange={handleChange} placeholder="Enter Appraisal" />
              </div>
              <div className="form-section">
              <label htmlFor="appraisal_assign">Assign Unit</label>
              <select id="appraisal_assign" value={userData.appraisal_assign} onChange={handleChange}>
                <option value="">Select Unit</option>
                {locations.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            </div>
            <div className="inline-group">
              <div className="form-section">
                <label htmlFor="Address_appraisal">Address Appraisal</label>
                <input id="Address_appraisal" type="text" value={userData.Address_appraisal} onChange={handleChange} placeholder="Enter Address Appraisal" />
              </div>
              <div className="form-section">
                <label htmlFor="address">Address</label>
                <input id="address" type="text" value={userData.address} onChange={handleChange} placeholder="Enter Address" />
              </div>
            </div>
            
            <div className="form-section">
              <label htmlFor="profileImages">Upload Image:</label>
              <input type="file" id="profileImages" onChange={handleFileChange} />
              <div className="image-preview">
                {imagePreviewUrl ? <img src={imagePreviewUrl} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }} /> : 'No file chosen'}
              </div>
            </div>
            <div className="form-section">
              <label htmlFor="status">Status</label>
              <ToggleSwitch>
                <span>Active</span>
                <label className="switch">
                  <input type="checkbox" checked={isPositionActive} onChange={togglePositionSwitch} />
                  <span className="slider"></span>
                </label>
              </ToggleSwitch>
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
