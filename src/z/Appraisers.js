import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { rentmobileDb } from '../components/firebase.config';
import "react-datepicker/dist/react-datepicker.css";
import IntSidenav from './IntSidenav';
import { FaEye, FaSearch, FaPlus, FaEdit, FaSync } from 'react-icons/fa';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { interimStorage as storage } from '../components/firebase.config';

const DashboardContainer = styled.div`
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

const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 1rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;

    th, td {
      padding: 15px;
      text-align: left;
      border-bottom: 2px solid #dee2e6;
    }

    th {
      background-color: #e9ecef;
    }

    tr:nth-child(even) {
      background-color: #f2f2f2;
    }

    tr:nth-child(odd) {
      background-color: #ffffff;
    }

    .actions {
      display: flex;
      gap: 5px;
    }

    .action-button {
      padding: 0.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: background-color 0.2s ease;

      &.view {
        background-color: #007bff;
        color: white;

        &:hover {
          background-color: #0056b3;
        }
      }

      &.edit {
        background-color: #28a745;
        color: white;

        &:hover {
          background-color: #218838;
        }
      }

      .icon {
        font-size: 16px;
        margin-right: 0.5rem;
      }
    }
  }

  .search-container {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;

    input {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-right: 0.5rem;
      flex: 1;
    }

    button {
      padding: 0.5rem;
      border: none;
      background-color: #007bff;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;

      .icon {
        font-size: 16px;
        margin-right: 0.5rem;
      }
    }
  }

  .button-container {
    display: flex;
    gap: 10px;
    margin-bottom: 1rem;

    button {
      padding: 0.5rem;
      border: none;
      background-color: #007bff;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;

      .icon {
        font-size: 16px;
        margin-right: 0.5rem;
      }
    }
  }
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  padding: 2rem; /* Add padding to ensure the modal content doesn't touch the edges */
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 800px; /* Increased width */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto; /* Handle overflow within the modal */
  max-height: 90vh; /* Ensure the modal doesn't exceed the viewport height */

  h2 {
    margin-bottom: 1rem;
  }

  .profile-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }

  .form-group {
    margin-bottom: 1rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
    }

    input, select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .toggle-switch {
      display: flex;
      align-items: center;

      input[type="checkbox"] {
        display: none;
      }

      label {
        position: relative;
        width: 40px;
        height: 20px;
        background-color: #ccc;
        border-radius: 20px;
        cursor: pointer;

        &:after {
          content: '';
          position: absolute;
          width: 18px;
          height: 18px;
          background-color: white;
          border-radius: 50%;
          top: 1px;
          left: 1px;
          transition: 0.2s;
        }
      }

      input:checked + label {
        background-color: #4caf50;

        &:after {
          left: calc(100% - 1px);
          transform: translateX(-100%);
        }
      }
    }
  }

  .button-container {
    display: flex;
    justify-content: flex-end;
    gap: 10px;

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &.save {
        background-color: #28a745;
        color: white;
      }

      &.cancel {
        background-color: #dc3545;
        color: white;
      }
    }
  }
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    userManagement: false,
    addUnit: false,
    appraise: false,
    contract: false,
    ticket: false,
    manageZone: false,
    manageSpace: false,
  });

  const [appraisalData, setAppraisalData] = useState([]);
  const [filteredAppraisalData, setFilteredAppraisalData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    firstname: '',
    lastname: '',
    appraisal: '',
    appraisal_assign: '',
    Address_appraisal: '',
    contact_number: '',
    address: '',
    profileImages: '',
    status: false,
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

  useEffect(() => {
    const fetchUserData = async () => {
      const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
      if (loggedInUserData) {
        const usersCollection = collection(rentmobileDb, 'admin_users');
        const userDocs = await getDocs(usersCollection);
        const users = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const currentUser = users.find(user => user.email === loggedInUserData.email);
        setLoggedInUser(currentUser || loggedInUserData);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchAppraisalData = async () => {
      const appraisalCollection = collection(rentmobileDb, 'appraisal_user');
      const appraisalDocs = await getDocs(appraisalCollection);
      const appraisals = appraisalDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppraisalData(appraisals);
      setFilteredAppraisalData(appraisals);
    };

    fetchAppraisalData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const handleView = (appraisal) => {
    navigate(`/view-appraisers/${appraisal.id}`);
  };

  const handleAdd = () => {
    navigate('/addappraisers');
  };

  const handleEdit = async (appraisal) => {
    const appraisalDocRef = doc(rentmobileDb, 'appraisal_user', appraisal.id);
    const appraisalDoc = await getDoc(appraisalDocRef);
    if (appraisalDoc.exists()) {
      setSelectedAppraisal(appraisalDoc.data());
      setFormData({
        email: appraisalDoc.data().email,
        firstname: appraisalDoc.data().firstname,
        lastname: appraisalDoc.data().lastname,
        appraisal: appraisalDoc.data().appraisal,
        appraisal_assign: appraisalDoc.data().appraisal_assign,
        Address_appraisal: appraisalDoc.data().Address_appraisal,
        contact_number: appraisalDoc.data().contact_number,
        address: appraisalDoc.data().address,
        profileImages: appraisalDoc.data().profileImages,
        status: appraisalDoc.data().status || false,
      });
      setIsModalOpen(true);
    }
  };

  const handleRefresh = async () => {
    const appraisalCollection = collection(rentmobileDb, 'appraisal_user');
    const appraisalDocs = await getDocs(appraisalCollection);
    const appraisals = appraisalDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAppraisalData(appraisals);
    setFilteredAppraisalData(appraisals);
  };

  const handleSearch = () => {
    const filteredData = appraisalData.filter(appraisal =>
      appraisal.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appraisal.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appraisal.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appraisal.appraisal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appraisal.appraisal_assign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appraisal.Address_appraisal.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAppraisalData(filteredData);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppraisal(null);
    setFormData({
      email: '',
      firstname: '',
      lastname: '',
      appraisal: '',
      appraisal_assign: '',
      Address_appraisal: '',
      contact_number: '',
      address: '',
      profileImages: '',
      status: false,
    });
  };

  const handleSave = async () => {
    const appraisalDocRef = doc(rentmobileDb, 'appraisal_user', selectedAppraisal.id);
    await updateDoc(appraisalDocRef, formData);
    handleCloseModal();
    handleRefresh();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `profileImages/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setFormData(prevData => ({
        ...prevData,
        profileImages: downloadURL,
      }));
    }
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
        <br></br>

        <FormContainer>
          <h3>Appraisal Details</h3>
          <div className="button-container">
            <button onClick={handleAdd}>
              <FaPlus className="icon" /> Add
            </button>
            <button onClick={handleRefresh}>
              <FaSync className="icon" /> Refresh
            </button>
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>
              <FaSearch className="icon" /> Search
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Profile Image</th>
                <th>Email</th>
                <th>Name</th>
                <th>Appraisal</th>
                <th>Appraisal Assign</th>
                <th>Address Appraisal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppraisalData.map(appraisal => (
                <tr key={appraisal.id}>
                  <td>
                    {appraisal.profileImages ? (
                      <img src={appraisal.profileImages} alt="Profile" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                    ) : (
                      <span>No Image</span>
                    )}
                  </td>
                  <td>{appraisal.email}</td>
                  <td>{appraisal.firstname} {appraisal.lastname}</td>
                  <td>{appraisal.appraisal}</td>
                  <td>{appraisal.appraisal_assign}</td>
                  <td>{appraisal.Address_appraisal}</td>
                  <td className="actions">
                    <button className="action-button view" onClick={() => handleView(appraisal)}>
                      <FaEye className="icon" /> View
                    </button>
                    <button className="action-button edit" onClick={() => handleEdit(appraisal)}>
                      <FaEdit className="icon" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FormContainer>
      </MainContent>
      {isModalOpen && (
        <ModalContainer>
          <ModalContent>
            <h2>Edit Appraiser</h2>
            <div className="profile-circle">
              {formData.profileImages ? (
                <img src={formData.profileImages} alt="Profile" />
              ) : (
                <span>No Image</span>
              )}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Appraisal</label>
              <input type="text" name="appraisal" value={formData.appraisal} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Appraisal Assign</label>
              <input type="text" name="appraisal_assign" value={formData.appraisal_assign} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Address Appraisal</label>
              <input type="text" name="Address_appraisal" value={formData.Address_appraisal} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <div className="toggle-switch">
                <input type="checkbox" name="status" checked={formData.status} onChange={handleChange} />
                <label></label>
              </div>
            </div>
            <div className="form-group">
              <label>Profile Image</label>
              <input type="file" onChange={handleFileChange} />
            </div>
            <div className="button-container">
              <button className="save" onClick={handleSave}>Save</button>
              <button className="cancel" onClick={handleCloseModal}>Cancel</button>
            </div>
          </ModalContent>
        </ModalContainer>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
