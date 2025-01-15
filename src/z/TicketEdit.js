import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt, FaCalendarAlt } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faUsers, faPlus, faFileContract, faTicketAlt, faSearch, faClipboard, faCogs, faPlusCircle} from '@fortawesome/free-solid-svg-icons';
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
  margin-top: 100rem;
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  font: bold;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  font-family: 'Inter', sans-serif;

  h3 {
    margin-top: 1px;
    text-align: center;
    margin-bottom: 25px;
    color: #333;
    font-size: 2rem;
    font-weight: bold;
  }

  form {
    display: flex;
    flex-direction: column;
  }

  label {
    font-size: 1rem;
    color: #333;
    margin-bottom: 8px;
    font-weight: bold;
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
  background-color: #f5f5f5;
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
    width: 100%;
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
  background-color: rgba(0, 0, 0, 0.6);
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
  background-color: #dc3545;
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
    transform: scale(1.05);
  }
`;

const OkButton = styled.button`
  background-color: #007bff;
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
    transform: scale(1.05);
  }
`;

const ConfirmButton = styled.button`
  background-color: #28a745;
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
    transform: scale(1.05);
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

  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateIssued, setDateIssued] = useState(null);
  const { id } = useParams();
  const dateIssuedTimestamp = dateIssued ? Timestamp.fromDate(new Date(dateIssued)) : null;
  const [ticket, setTicket] = useState(null);
  const [ticketName, setTicketName] = useState('');
  const [rate, setRate] = useState('');


  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleDropdownToggle = (dropdown) => {
    setIsDropdownOpen(prevState => ({
      ...prevState,
      [dropdown]: !prevState[dropdown],
    }));
  };

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const ticketDoc = doc(rentmobileDb, 'rate', id);
        const ticketSnapshot = await getDoc(ticketDoc);
        if (ticketSnapshot.exists()) {
          const ticketData = ticketSnapshot.data();
          setTicket(ticketData);
          setTicketName(ticketData.fee_name);
          setRate(ticketData.fee_rate);
          if (ticketData.dateIssued && ticketData.dateIssued.seconds) {
            setDateIssued(new Date(ticketData.dateIssued.seconds * 1000));
          }
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching ticket details: ', error);
      }
    };

    fetchTicket();
  }, [id]);

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

  const handleSaveChanges = async (event) => {
    event.preventDefault();

    if (!ticketName || !rate) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const ticketDocRef = doc(rentmobileDb, 'rate', id);
      const formattedDateIssued = dateIssued
        ? `${dateIssued.getFullYear()}/${String(dateIssued.getMonth() + 1).padStart(2, '0')}/${String(dateIssued.getDate()).padStart(2, '0')}`
        : null;

      await updateDoc(ticketDocRef, {
        fee_name: ticketName,
        fee_rate: Number(rate),
        dateIssued: formattedDateIssued,
      });

      setIsModalOpen(true);
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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

        <br /><br />
        <FormContainer>
          <h3>Edit Ticket</h3>
          <form onSubmit={handleSaveChanges}>
            <div>
              <label htmlFor="ticketName">Ticket Name:</label>
              <input
                id="fee_name"
                type="text"
                value={ticketName}
                onChange={(e) => setTicketName(e.target.value)}
                placeholder="Ticket Name"
              />
            </div>

            <div>
              <label htmlFor="rate">Rate:</label>
              <input
                id="fee_rate"
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="Rate"
              />
            </div>

            <div>
              <label htmlFor="dateIssued">Date Issued:</label>
              <div style={{ position: 'relative' }}>
                <DatePicker
                  selected={dateIssued}
                  onChange={(date) => setDateIssued(date)}
                  dateFormat="yyyy/MM/dd"
                  className="react-datepicker-input"
                />
                <FaCalendarAlt
                  style={{
                    position: 'absolute',
                    right: '20px',
                    top: '30%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>

            <button type="submit">Update Changes</button>
          </form>

          {isModalOpen && (
            <Modal>
              <ModalContent>
                <ModalHeader>Save Changes</ModalHeader>
                <ModalText>Are you sure you want to save changes?</ModalText>
                <ModalButtons>
                  <CancelButton onClick={() => setIsModalOpen(false)}>Cancel</CancelButton>
                  <OkButton onClick={() => navigate('/ticket')}>OK</OkButton>
                </ModalButtons>
              </ModalContent>
            </Modal>
          )}
        </FormContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
