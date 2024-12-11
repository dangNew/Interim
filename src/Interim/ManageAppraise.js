import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt, FaPlusCircle, FaTimes   } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faClipboard, faCheck, faPlusCircle,faCogs} from '@fortawesome/free-solid-svg-icons';
import { HiPlusCircle, HiXCircle } from 'react-icons/hi';
import { collection, getDocs, addDoc, setDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import { rentmobileDb } from '../components/firebase.config'; 
import { interimDb } from '../components/firebase.config'; 
import "react-datepicker/dist/react-datepicker.css";
import IntSidenav from './IntSidenav';

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
  padding: 3rem;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  max-width: 700px;
  margin: 2rem auto;
  font-family: 'Roboto', sans-serif;

  h3 {
    margin-bottom: 2rem;
    color: #343a40;
    font-size: 26px;
    font-weight: 700;
    text-align: center;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 1rem;
  }

  button {
    display: inline-block;
    margin-top: 1rem;
    padding: 10px 20px;
    border: none;
    background-color: #007bff;
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #0056b3;
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 2rem;

    th, td {
      padding: 15px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
      font-size: 14px;
    }

    th {
      background-color: #f8f9fa;
      font-weight: 700;
      color: #495057;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    tr:hover {
      background-color: #e9ecef;
      transition: background-color 0.3s ease;
    }
  }
`;

const InputField = styled.div`
  position: relative;
  margin-bottom: 20px;

  input, select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    outline: none;
    box-sizing: border-box;
  }

  label {
    position: absolute;
    top: -8px;
    left: 10px;
    background: white;
    padding: 0 5px;
    font-size: 0.9rem;
    color: #555;
  }
`;
const RateSizeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
`;
const SaveButton = styled.button`
  width: 100%;
  padding: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  background-color: #28a745;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.3);
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



const ProfileImage = styled.img`
  border-radius: 50%;
  width: 60px; /* Adjusted for better visibility */
  height: 60px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); // Subtle shadow for a polished look
`;

const DropdownField = styled.select`
  position: relative;
  padding: 0.75rem;
  border: 1px solid #ced4da; 
  border-radius: 4px; 
  font-size: 16px;
  color: #495057; 
  background-color: #fdfdfd; /
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); 
  transition: border-color 0.2s ease, box-shadow 0.2s ease; 
  margin-top: 0.5rem; 
  width: 120%;

  &:focus {
    border-color: #007bff; /* Blue border on focus */
    outline: none; /* Remove outline */
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* Glow effect */
  }

  option {
    color: #495057; /* Dark text color for options */
  }
`;
const StyledButton = styled.button`
  padding: 12px 24px; /* Padding for size */
  font-size: 16px; /* Font size */
  font-family: 'Roboto', sans-serif; /* Professional font */
  font-weight: bold;
  color: #ffffff; /* Text color */
  background-color:#008000;/* Primary color */
  border: 1px solid transparent; /* Transparent border */
  border-radius: 4px; /* Rounded corners */
  cursor: pointer; /* Pointer on hover */
  transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s; /* Smooth transition */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */

  /* Responsive font scaling */
  @media (max-width: 768px) {
    font-size: 14px; /* Slightly smaller font on smaller screens */
  }

  /* Hover effects */
  &:hover {
    background-color:#008000; /* Darker blue */
    transform: translateY(-1px); /* Lift effect */
  }

  &:active {
    transform: translateY(0); /* Reset lift on click */
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); /* Shadow for active state */
  }
`;
const Modal = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
`;

const CloseButton = styled.span`
  cursor: pointer;
  color: red;
  font-size: 20px;
  float: right;
`;
const AddIcon = styled(HiPlusCircle)`
  font-size: 28px;
  color: #007bff;
  cursor: pointer;
  margin-left: 50px;
  margin-top: -25px; /* Adjust this value to position the icon higher */
  position: relative;
  transition: color 0.3s;

  &:hover {
    color: #0056b3;
  }
`;
const DeleteIcon = styled(HiXCircle)`
  font-size: 28px;
  color: #ff4d4d;
  cursor: pointer;
  margin-left: 50px;
  margin-top: -25px; /* Adjust this value to position the icon higher */
  position: relative;
  transition: color 0.3s;

  &:hover {
    color: #0056b3;
  }
`;
const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    userManagement: false,
    addUnit: false,
    appraise: false,
    contract: false,
    ticket: false,
    manageZone: false,
    manageSpace: false,
  });
  const [appRate, setAppRate] = useState('');
  const [appSize, setAppSize] = useState('');
  const [goodsName, setGoodsName] = useState('');
  const [unitMeasure, setUnitMeasure] = useState('');
  const [location, setLocation] = useState(''); 
  const [rateSizePairs, setRateSizePairs] = useState([{ rate_1: '', size_1: '' }]);
  const [locations, setLocations] = useState([]);


  const addRateSizePair = () => {
    setRateSizePairs([...rateSizePairs, { [`rate_${rateSizePairs.length + 1}`]: '', [`size_${rateSizePairs.length + 1}`]: '' }]);
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleDropdownToggle = (dropdown) => {
    setIsDropdownOpen(prevState => ({
      ...prevState,
      [dropdown]: !prevState[dropdown],
    }));
  };

  const removeRateSizePair = (index) => {
    const updatedPairs = rateSizePairs.filter((_, i) => i !== index);
    setRateSizePairs(updatedPairs);
  };

  // Function to handle changes in rate-size pair inputs
  const handleRateSizeChange = (index, field, value) => {
    const updatedPairs = rateSizePairs.map((pair, i) =>
      i === index ? { ...pair, [field]: value } : pair
    );
    setRateSizePairs(updatedPairs);
  };

  // Save appraisal to Firestore
  const handleSaveAppraisal = async () => {
    try {
      await addDoc(collection(rentmobileDb, 'appraisal_rate'), {
        goods_name: goodsName,
        location: location,
        unit_measure: unitMeasure,
        rate_size_pairs: rateSizePairs.map((pair, index) => ({
          [`rate_${index + 1}`]: Number(pair[`rate_${index + 1}`]),
          [`size_${index + 1}`]: pair[`size_${index + 1}`]
        })),
      });
      setModalMessage('Appraisal data saved successfully!');
      setIsModalOpen(true);

      // Clear input fields after saving
      setGoodsName('');
      setLocation('');
      setUnitMeasure('');
      setRateSizePairs([{ rate_1: '', size_1: '' }]);
    } catch (error) {
      setModalMessage('Error saving appraisal data');
      setIsModalOpen(true);
      console.error('Error saving appraisal data:', error);
    }
  };

  // Save appraisal to Firestore
 

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  
  
  const closeModal = () => {
    setIsModalOpen(false);
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

  const handleLogout = () => {
    localStorage.removeItem('userData'); 
    navigate('/login');
  };

  
  const fetchLocations = async () => {
    const unitsCollection = collection(rentmobileDb, 'unit');
    const unitDocs = await getDocs(unitsCollection);
    const unitNames = unitDocs.docs.map(doc => doc.data().name);
    setLocations(unitNames);
  };
  useEffect(() => {
    fetchLocations();
  }, []);
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
      <h3>Add Appraisal Data</h3>

      <InputField>
        <input
          type="text"
          value={goodsName}
          onChange={(e) => setGoodsName(e.target.value)}
          placeholder=" "
          required
        />
        <label htmlFor="goodsName">Goods Name</label>
      </InputField>

      <InputField>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        >
          <option value="" disabled>Select Location</option>
          {locations.map((loc, index) => (
            <option key={index} value={loc}>{loc}</option>
          ))}
        </select>
        <label htmlFor="location">Location</label>
      </InputField>

      {rateSizePairs.map((pair, index) => (
        <RateSizeContainer key={index}>
          <InputField>
            <input
              type="number"
              placeholder={`Rate ${index + 1}`}
              value={pair[`rate_${index + 1}`]}
              onChange={(e) => handleRateSizeChange(index, `rate_${index + 1}`, e.target.value)}
            />
            <label htmlFor={`rate_${index + 1}`}>Rate {index + 1}</label>
          </InputField>

          <InputField>
            <input
              type="text"
              value={pair[`size_${index + 1}`]}
              onChange={(e) => handleRateSizeChange(index, `size_${index + 1}`, e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor={`size_${index + 1}`}>Size {index + 1}</label>
          </InputField>

          {/* Icon for adding more rate/size pairs */}
          {index === 0 && <AddIcon onClick={addRateSizePair} title="Add Rate/Size Pair" />}
          {/* Show delete icon for pairs after the first */}
          {index > 0 && <DeleteIcon onClick={() => removeRateSizePair(index)} title="Remove Rate/Size Pair" />}
        </RateSizeContainer>
      ))}

      <InputField>
        <input
          type="text"
          value={unitMeasure}
          onChange={(e) => setUnitMeasure(e.target.value)}
          placeholder=" "
          required
        />
        <label htmlFor="unitMeasure">Unit Measure</label>
      </InputField>

      <SaveButton onClick={handleSaveAppraisal}>Save Appraisal Data</SaveButton>

      {isModalOpen && (
        <Modal>
          <ModalContent>
            <CloseButton onClick={() => setIsModalOpen(false)} aria-label="Close modal">×</CloseButton>
            <p>{modalMessage}</p>
            <button onClick={() => setIsModalOpen(false)}>Close</button>
          </ModalContent>
        </Modal>
      )}
    </FormContainer>


      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
