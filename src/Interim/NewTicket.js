import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { rentmobileDb } from '../components/firebase.config';
import { collection, getDoc, doc, updateDoc, getDocs, setDoc } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import { Timestamp } from 'firebase/firestore';
import 'react-datepicker/dist/react-datepicker.css';
import IntSidenav from './IntSidenav';

const NewTicketContainer = styled.div`
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
  display: left;
  align-items: center;
  justify-content: space-between;
  padding: 40px 50px;
  background-color: #188423;
  color: white;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  font-size: 22px;
  font-family: 'Inter', sans-serif;
  font-weight: bold;
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

const NewTicket = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isErrorModal, setIsErrorModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateIssued, setDateIssued] = useState(null);
  const { id } = useParams();
  const dateIssuedTimestamp = dateIssued ? Timestamp.fromDate(new Date(dateIssued)) : null;
  const [ticket, setTicket] = useState(null);
  const [ticketName, setTicketName] = useState('');
  const [rate, setRate] = useState('');

  const saveTicket = async () => {
    try {
      console.log("saveTicket called");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error saving ticket:", error);
      setModalMessage('There was an error saving the ticket. Please try again.');
      setShowModal(true);
    }
  };

  const closeModal = () => {
    console.log("closeModal called");
    setIsModalOpen(false);
    navigate("/ticket");
  };

  const closeErrorModal = () => {
    console.log("closeErrorModal called");
    setIsErrorModal(false);
  };

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        if (id) {
          const ticketDoc = doc(rentmobileDb, 'rate', id);
          const ticketSnapshot = await getDoc(ticketDoc);
          if (ticketSnapshot.exists()) {
            const ticketData = ticketSnapshot.data();
            setTicket(ticketData);
            setTicketName(ticketData.name || '');
            setRate(ticketData.rate || '');
          } else {
            console.log('No ticket found!');
          }
        }
      } catch (error) {
        console.error('Error fetching ticket:', error);
      }
    };

    fetchTicket();
  }, [id]);

  useEffect(() => {
    const today = new Date();
    setSelectedDate(today);
    setDateIssued(today);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit called");
  
    if (!ticketName || !rate || !dateIssued) {
      alert("Please fill out all fields.");
      return;
    }
  
    const ticketData = {
      name: ticketName,
      rate: parseFloat(rate),
      dateIssued: Timestamp.fromDate(new Date(dateIssued)),
    };
  
    try {
      const ticketRef = collection(rentmobileDb, 'rate');
      await setDoc(doc(ticketRef), ticketData);
  
      setShowModal(true);
      setModalMessage("Ticket saved successfully!");
      console.log("Ticket saved successfully!");
  
      // Instead of navigating to "/tickets", we can just reset the form or stay on the same page
      // setTicketName("");
      // setRate("");
      // setDateIssued(null);
  
    } catch (error) {
      console.error("Error saving ticket:", error);
      setShowModal(true);
      setModalMessage("There was an error saving the ticket. Please try again.");
    }
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

  const handleSaveChanges = async (event) => {
    event.preventDefault();
    console.log("handleSaveChanges called");

    if (!ticketName || !rate) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const ticketDocRef = doc(rentmobileDb, 'rate', id);

      const formattedDateIssued = dateIssued ?
        (() => {
          const timestamp = Number(dateIssued);
          if (isNaN(timestamp)) {
            console.error("Invalid dateIssued:", dateIssued);
            return null;
          }

          const date = new Date(timestamp);
          return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
        })() : null;

      await updateDoc(ticketDocRef, {
        name: ticketName,
        rate: Number(rate),
        dateIssued: formattedDateIssued,
      });

      setIsModalOpen(true);
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  };

  const toggleSidebar = () => {
    console.log("toggleSidebar called");
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    console.log("handleLogout called");
    localStorage.removeItem('userData');
    navigate('/login');
  };
  const handleClickOutside = (event) => {
    console.log("handleClickOutside called");
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
    console.log("handleMainContentClick called");
    setIsSidebarOpen(false);
  };

  const handleDropdownToggle = () => {
    console.log("handleDropdownToggle called");
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <NewTicketContainer>
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
          <h3>New Ticket</h3>
          <form onSubmit={handleSubmit}>
            <label htmlFor="ticketName">Ticket Name</label>
            <input
              type="text"
              id="ticketName"
              value={ticketName}
              onChange={(e) => setTicketName(e.target.value)}
              placeholder="Enter ticket name"
            />
            <label htmlFor="rate">Rate</label>
<input
  type="text"
  id="rate"
  value={rate}
  onChange={(e) => {
    // Only allow numbers or an empty string
    if (!isNaN(e.target.value)) {
      setRate(e.target.value);
    }
  }}
  placeholder="Enter rate"
/>
            <label htmlFor="dateIssued">Date Issued</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setDateIssued(date);
              }}
              dateFormat="MMMM d, yyyy"
            />
            <button onClick={saveTicket}>Save Ticket</button>
          </form>

          {isModalOpen && !isErrorModal && (
            <Modal>
              <ModalContent>
                <ModalHeader>Ticket Saved Successfully!</ModalHeader>
                <ModalText>Your ticket has been successfully saved.</ModalText>
                <ModalButtons>
                  <OkButton onClick={closeModal}>OK</OkButton>
                </ModalButtons>
              </ModalContent>
            </Modal>
          )}

          {isErrorModal && (
            <Modal>
              <ModalContent>
                <ModalHeader>Error Saving Ticket</ModalHeader>
                <ModalText>There was an error while saving the ticket. Please try again.</ModalText>
                <ModalButtons>
                  <OkButton onClick={closeErrorModal}>TRY AGAIN</OkButton>
                </ModalButtons>
              </ModalContent>
            </Modal>
          )}
        </FormContainer>
      </MainContent>
    </NewTicketContainer>
  );
};

export default NewTicket;
