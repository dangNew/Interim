import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'; // Import useParams here
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt, FaCalendarAlt  } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faUsers, faPlus, faFileContract, faTicketAlt,faSearch, faClipboard, faCheck,faPlusCircle, faCogs} from '@fortawesome/free-solid-svg-icons';
import { rentmobileDb } from '../components/firebase.config';
import { collection, getDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import { Timestamp } from 'firebase/firestore';
import 'react-datepicker/dist/react-datepicker.css';
import IntSidenav from './IntSidenav';


const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
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
  
  padding-left: 20px;
  background-color: #fff;
  padding: 2rem;
  width: calc(120% - ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')});
  transition: margin-left 0.3s ease, width 0.3s ease;
 
`;
const AppBar = styled.div`
  display: left;
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
 margin-top: 100 rem;
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  font: bold;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  font-family: 'Inter', sans-serif;

  h3 {
    margin-top: 1px; /* Increased from 30px to 40px */
    text-align: center;
    margin-bottom: 25px;
    color: #333;
    font-size: 2rem; /* Larger font size for the heading */
    font-weight: bold; /* Make heading bold */
}


  form {
    display: flex;
    flex-direction: column;
  }

  label {
    font-size: 1rem;
    color: #333;
    margin-bottom: 8px;
    font-weight: bold; /* Make the label slightly bolder */
  }

  input[type="text"],
  input[type="number"],
  input[type="file"],
  textarea,
  .react-datepicker-wrapper {
    padding: 12px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
    background-color: #f5f5f5; /* Light gray background */
    transition: border-color 0.3s;
    width: 100%;
  }

  input[type="text"]:focus,
  input[type="number"]:focus,
  textarea:focus,
  .react-datepicker-wrapper:focus-within {
    border-color: #007bff;
    outline: none;
  }

  button {
    padding: 12px;
    border: none;
    border-radius: 8px;
    color: white;
    background-color: blue;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    margin-top: 20px;
    transition: background-color 0.3s, transform 0.2s;
    width: 100%; /* Full-width button */
  }

  button:hover {
    background-color: #0056b3;
    transform: scale(1.02);
  }

  button[type="button"] {
    background-color: #6c757d;
  }

  button[type="button"]:hover {
    background-color: #5a6268;
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


const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.6); /* Darker overlay for better contrast */
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #ffffff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  width: 400px;
  max-width: 90%;
  text-align: center;
  font-family: 'Inter', sans-serif;
`;

const ModalHeader = styled.h3`
  margin-bottom: 20px;
  color: #333333;
  font-size: 1.8rem;
  font-weight: bold;
`;

const ModalText = styled.p`
  color: #666666;
  font-size: 1.2rem;
  margin-bottom: 30px;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;
`;

const CancelButton = styled.button`
  background-color: #dc3545; /* Bootstrap danger color */
  color: #ffffff;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  flex: 1;

  &:hover {
    background-color: #c82333;
    transform: scale(1.05); /* Slightly enlarge on hover */
  }
`;
const OkButton = styled.button`
  background-color: #007bff; /* Bootstrap primary color */
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  flex: 1;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05); /* Slightly enlarge on hover */
  }
`;

const ConfirmButton = styled.button`
  background-color: #28a745; /* Bootstrap success color */
  color: #ffffff;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  flex: 1;

  &:hover {
    background-color: #218838;
    transform: scale(1.05); /* Slightly enlarge on hover */
  }
`;

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const sidebarRef = useRef(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
    const [zones, setZones] = useState([]); // State to hold fetched zones
    const { id } = useParams(); // Retrieve the ID from the URL
    const [spaceNumber, setSpaceNumber] = useState('');
    const [rate, setRate] = useState('');
    const [size, setSize] = useState('');
    const [zone, setZone] = useState('');
    const [dateIssued, setDateIssued] = useState(new Date());
    const navigate = useNavigate();

  
    useEffect(() => {
      const fetchSpaceData = async () => {
          try {
              const docRef = doc(rentmobileDb, 'Space', id);
              const docSnap = await getDoc(docRef);

              if (docSnap.exists()) {
                  const data = docSnap.data();
                  setSpaceNumber(data.spaceNumber || '');
                  setRate(data.rate || '');
                  setSize(data.size || '');
                  setZone(data.zone || '');
              } else {
                  console.log('No such document!');
              }
          } catch (error) {
              console.error('Error fetching space data:', error);
          }
      };

      fetchSpaceData();
  }, [id]);
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleDropdownToggle = (dropdown) => {
    setIsDropdownOpen(prevState => ({
      ...prevState,
      [dropdown]: !prevState[dropdown],
    }));
  };
  
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
        const docRef = doc(rentmobileDb, 'Space', id);
        await updateDoc(docRef, {
            spaceNumber,
            rate: parseFloat(rate),
            size: parseFloat(size),
            zone,
        });
        alert('Space updated successfully!');
        navigate('/viewspace'); // Redirect after saving
    } catch (error) {
        console.error('Error updating space:', error);
    }
};
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('userData'); 
    navigate('/login');
  };

 

  return (
    <DashboardContainer>
       <IntSidenav isSidebarOpen={isSidebarOpen} loggedInUser={loggedInUser} /> {/* Include SideNav here */}
    

    <MainContent isSidebarOpen={isSidebarOpen}>
      
        
        <AppBar>
          <div className="title">OFFICE OF THE CITY MARKETS</div>
        </AppBar>

        
          <ToggleButton onClick={toggleSidebar}>
            <FaBars />
          </ToggleButton>
          
        
         <br></br> <br></br>
         <FormContainer>
         <h3>Edit Space</h3>
            <form onSubmit={handleSaveChanges}>
                <div>
                    <label htmlFor="spaceNumber">Space Number:</label>
                    <input
                        id="spaceNumber"
                        type="text"
                        value={spaceNumber}
                        onChange={(e) => setSpaceNumber(e.target.value)}
                        placeholder="Space Number"
                    />
                </div>
                <div>
                    <label htmlFor="rate">Rate:</label>
                    <input
                        id="rate"
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        placeholder="Rate"
                    />
                </div>
                <div>
                    <label htmlFor="size">Size:</label>
                    <input
                        id="size"
                        type="number"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        placeholder="Size"
                    />
                </div>
                <div>
                    <label htmlFor="zone">Zone:</label>
                    <input
                        id="zone"
                        type="text"
                        value={zone}
                        onChange={(e) => setZone(e.target.value)}
                        placeholder="Zone"
                    />
                </div>
                
                <button type="submit">Update Changes</button>
            </form>
</FormContainer>


      </MainContent>
      </DashboardContainer>
  );
};

export default Dashboard;