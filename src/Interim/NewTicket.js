import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'; // Import useParams here
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
<<<<<<< HEAD
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt} from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faUsers, faPlus, faFileContract, faTicketAlt,faSearch, faClipboard, faCheck } from '@fortawesome/free-solid-svg-icons';
=======
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt, FaCalendarAlt  } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faUsers, faPlus, faFileContract, faCog, faTicketAlt,faSearch } from '@fortawesome/free-solid-svg-icons';
>>>>>>> a8f5076 (main)
import { rentmobileDb } from '../components/firebase.config';
import { collection, getDoc, doc, updateDoc, getDocs,setDoc } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import { Timestamp } from 'firebase/firestore';
import 'react-datepicker/dist/react-datepicker.css';

const NewTicketContainer = styled.div`
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
<<<<<<< HEAD
    padding: 10px;
=======
    padding: 12px;
>>>>>>> a8f5076 (main)
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
    background-color: #f5f5f5; /* Light gray background */
    transition: border-color 0.3s;
<<<<<<< HEAD
    width: 95%;
=======
    width: 100%;
>>>>>>> a8f5076 (main)
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


const AppBar = styled.div`
  background-color: #188423; // Set the desired color
  padding: 40px 50px;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
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

<<<<<<< HEAD
=======
const TicketTable = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.1);

  table {
    width: 100%;
    border-collapse: collapse;

    th, td {
      padding: 15px;
      text-align: left;
      border-bottom: 2px solid #dee2e6;
    }

    th {
      background-color: #e9ecef;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .actions {
      display: flex;
      gap: 20px;
      justify-content: center;
    }
  }
`;
>>>>>>> a8f5076 (main)
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

<<<<<<< HEAD

=======
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
>>>>>>> a8f5076 (main)
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

<<<<<<< HEAD
=======
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

>>>>>>> a8f5076 (main)
const NewTicket = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const sidebarRef = useRef(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [isErrorModal, setIsErrorModal] = useState(false);
    const [showModal, setShowModal] = useState(false); 
    const [modalMessage, setModalMessage] = useState(''); // Define modalMessage state
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
          
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error saving ticket:", error);
            setModalMessage('There was an error saving the ticket. Please try again.');
            setShowModal(true); // Show the modal with the error message
        }
    };

    const closeModal = () => {
        setIsModalOpen(false); // Close the modal
        navigate("/ticket");  // Redirect to /ticket after closing the modal
      };
    const closeErrorModal = () => { // Function to close the error modal
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
            setTicketName(ticketData.name || ''); // Assuming the field is 'name'
            setRate(ticketData.rate || ''); // Assuming the field is 'rate'
          } else {
            console.log('No ticket found!');
          }
        }
      } catch (error) {
        console.error('Error fetching ticket:', error);
      }
    };
  
    fetchTicket();
  }, [id]); // The effect will re-run whenever `id` changes
  useEffect(() => {
    // Set current date as default for dateIssued
    const today = new Date();
    setSelectedDate(today);
    setDateIssued(today);  // Set dateIssued to current date
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure the fields are not empty and the rate is a number
    if (!ticketName || !rate || !dateIssued) {
        alert("Please fill out all fields.");
        return;
    }
    
    const ticketData = {
        name: ticketName,
        rate: parseFloat(rate),  // Ensure it's stored as a number
        dateIssued: Timestamp.fromDate(new Date(dateIssued)),  // Store as Firestore Timestamp
      };
      
      try {
        // Add ticket to Firestore 'rate' collection
        const ticketRef = collection(rentmobileDb, 'rate');
        await setDoc(doc(ticketRef), ticketData);
        
        // Show success modal instead of alert
        setShowModal(true);  // Show the modal with success message
        setModalMessage("Ticket saved successfully!");  // Set success message
        setTimeout(() => {
          navigate("/tickets");  // Redirect to tickets page after saving
        }, 2000);  // Delay the redirect to give user time to see the message
        
      } catch (error) {
        console.error("Error saving ticket:", error);
        
        // Show error modal instead of alert
        setShowModal(true);  // Show the modal with error message
        setModalMessage("There was an error saving the ticket. Please try again.");
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
  }, []); // Ensure hooks are called unconditionally

  const handleSaveChanges = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior
  
    // Validate that fields are not empty
    if (!ticketName || !rate) {
      alert('Please fill in all required fields.');
      return; // Exit the function if fields are empty
    }
  
    try {
      const ticketDocRef = doc(rentmobileDb, 'rate', id);
  
      // Format dateIssued to yyyy/MM/dd
      const formattedDateIssued = dateIssued ? 
        (() => {
          // Ensure dateIssued is a valid timestamp
          const timestamp = Number(dateIssued); // Convert dateIssued to a number
          if (isNaN(timestamp)) {
            console.error("Invalid dateIssued:", dateIssued);
            return null; // or set a default value
          }
  
          const date = new Date(timestamp); // Convert from seconds to milliseconds
          return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
        })() : null;
  
      await updateDoc(ticketDocRef, {
        name: ticketName,
        rate: Number(rate), // Ensure rate is stored as a number
        dateIssued: formattedDateIssued, // Store formatted date as a string
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

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  
  return (
    <NewTicketContainer>
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
<<<<<<< HEAD
  <Link to="/stalls" style={{ textDecoration: 'none' }}>
  <SidebarItem isSidebarOpen={isSidebarOpen}>
    <FontAwesomeIcon icon={faClipboard} className="icon" />
    <span>List of Stalls</span>
  </SidebarItem>
</Link>
=======
>>>>>>> a8f5076 (main)

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

<<<<<<< HEAD
  <Link to="/viewunit" style={{ textDecoration: 'none' }}>
=======
  <Link to="/Addunit" style={{ textDecoration: 'none' }}>
>>>>>>> a8f5076 (main)
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

<<<<<<< HEAD
<SidebarItem isSidebarOpen={isSidebarOpen} onClick={handleDropdownToggle}>
    <FontAwesomeIcon icon={faUser} className="icon" />
    <span>Manage Ambulant</span>
  </SidebarItem>

  {isDropdownOpen && (
    <ul style={{ paddingLeft: '20px', listStyleType: 'none' }}>
      <Link to="/assign" style={{ textDecoration: 'none' }}>
        <li>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <FontAwesomeIcon icon={faCheck} className="icon" />
            <span> Assign Collector</span>
          </SidebarItem>
        </li>
      </Link>
      <Link to="/View" style={{ textDecoration: 'none' }}>
        <li>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
          <FontAwesomeIcon icon={faSearch} className="icon" />
            <span> View Collector</span>
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
=======
  <Link to="/settings" style={{ textDecoration: 'none' }}>
    <SidebarItem isSidebarOpen={isSidebarOpen}>
      <FontAwesomeIcon icon={faCog} className="icon" />
      <span>Settings</span>
    </SidebarItem>
  </Link>
>>>>>>> a8f5076 (main)
</SidebarMenu>

      <SidebarFooter isSidebarOpen={isSidebarOpen}>
          <LogoutButton isSidebarOpen={isSidebarOpen} onClick={handleLogout}>
            <span><FaSignOutAlt /></span>
            <span>Logout</span>
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>



        <MainContent isSidebarOpen={isSidebarOpen}>
        
          <ToggleButton onClick={toggleSidebar}>
            <FaBars />
          </ToggleButton>
          
        
          <AppBar>
        <div className="title">INTERIM</div>
      </AppBar>
         
         <br></br> <br></br>
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
                    type="number"
                    id="rate"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
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
                   <OkButton onClick={closeModal}>OKAYYYY GUD</OkButton>
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