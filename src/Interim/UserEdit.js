import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { rentmobileDb } from '../components/firebase.config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import IntSidenav from './IntSidenav';
import CarbonLogo from '../CarbonLogo/472647195_1684223168803549_1271657271156175542_n.jpg';

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "60px")};
  padding: 2rem;
  background-color: #fff;
  width: calc(100% - ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "60px")});
  transition: margin-left 0.3s ease, width 0.3s ease;
  overflow-y: auto;
`;

const AppBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #ffffff;
  color: #333;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  font-size: 1.5rem;
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
`;

const Logo = styled.img`
  height: 40px;
  margin-right: 1rem;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
`;


const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  input {
    display: none;
  }

  .switch {
    position: relative;
    width: 50px;
    height: 28px;
    background-color: #e0e0e0;
    border-radius: 50px;
    transition: background-color 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);

    .slider {
      position: absolute;
      cursor: pointer;
      top: 2px;
      left: 2px;
      width: 24px;
      height: 24px;
      background-color: white;
      border-radius: 50%;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

      &:before {
        content: "";
        position: absolute;
        height: 24px;
        width: 24px;
        border-radius: 50%;
        background-color: white;
        transition: transform 0.3s ease;
      }
    }
  }

  input:checked + .switch {
    background-color: #4caf50;
  }

  input:not(:checked) + .switch {
    background-color: #e0e0e0;
  }

  input:checked + .switch .slider {
    transform: translateX(22px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  input:not(:checked) + .switch .slider {
    transform: translateX(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .status-label {
    margin-left: 12px;
    font-size: 0.9rem;
    color: #333;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .switch {
      width: 45px;
      height: 26px;

      .slider {
        width: 22px;
        height: 22px;
        left: 2px;
      }
    }

    .status-label {
      font-size: 0.8rem;
    }
  }

  @media (max-width: 480px) {
    .switch {
      width: 40px;
      height: 24px;

      .slider {
        width: 20px;
        height: 20px;
        left: 2px;
      }
    }

    .status-label {
      font-size: 0.7rem;
    }
  }
`;

const BackButton = styled.button`
  background-color: red !important;
  color: white !important;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: darkred !important;
  }
`;

const FormContainerLarge = styled.div`
  flex: 3;
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 12px;
  background-color: #f8f9fa;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
  border: 2px solid #ced4da;

  h3 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1.5rem;
  }

  form {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  label {
    display: block;
    font-size: 1rem;
    color: #495057;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 8px;
    font-size: 1rem;
    color: #495057;
    background-color: #f8f9fa;
    transition: border-color 0.3s;

    &:focus {
      border-color: #007bff;
      outline: none;
    }
  }

  button {
    grid-column: span 2;
    padding: 0.75rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #0056b3;
    }
  }
`;

const FormContainerSmall = styled.div`
  flex: 1;
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ced4da;

  img {
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
  }
`;

const LoadingModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  width: 80%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const ConfirmationModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
  text-align: center;
`;

const ModalMessage = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const CancelButton = styled.button`
  background-color: #ccc;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
`;

const ConfirmButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-left: 10px;
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
`;

const ModalButton = styled.button`
  margin-top: 1rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
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
  const sidebarRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(rentmobileDb, 'admin_users'));
        const allUsers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(allUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (id) {
      const user = users.find((user) => user.id === id);
      setSelectedUser(user);
    }
  }, [id, users]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.checked ? 'Active' : 'Inactive';
    if (selectedUser) {
      try {
        const userDocRef = doc(rentmobileDb, 'admin_users', selectedUser.id);
        await updateDoc(userDocRef, { status: newStatus });
        setSelectedUser((prev) => ({ ...prev, status: newStatus }));
      } catch (error) {
        console.error('Error updating status:', error);
      }
    }
  };

  const handleSaveChanges = () => {
    setIsConfirmationModalVisible(true);
  };

  const handleConfirmSave = async () => {
    setIsConfirmationModalVisible(false);
    const formData = {
      firstName: selectedUser.firstName,
      lastName: selectedUser.lastName,
      middleName: selectedUser.middleName,
      email: selectedUser.email,
      address: selectedUser.address,
      contactNum: selectedUser.contactNum,
      location: selectedUser.location,
      position: selectedUser.position,
      status: selectedUser.status,
      Image: selectedUser.Image,
    };

    try {
      const docRef = doc(rentmobileDb, 'admin_users', id);
      await updateDoc(docRef, formData);
      setIsModalVisible(true); // Show the success modal
      setTimeout(() => {
        setIsModalVisible(false); // Hide it after a few seconds
      }, 3000); // Adjust the duration as needed
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const handleCancelSave = () => {
    setIsConfirmationModalVisible(false);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    navigate('/usermanagement');
  };

  if (!selectedUser) return <div>Loading...</div>;

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const handleInputChange = (field, value) => {
    setSelectedUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <DashboardContainer>
      {isLoading && (
        <LoadingModal>
          <ModalContent>Wait... Please</ModalContent>
        </LoadingModal>
      )}

      <div ref={sidebarRef}>
        <IntSidenav
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          loggedInUser={loggedInUser}
        />
      </div>
      <MainContent isSidebarOpen={isSidebarOpen} onClick={handleMainContentClick}>
        <AppBar>
                  <Title>
                    <Logo src={CarbonLogo} alt="Carbon Logo" />
                    <div>User Edit</div>
                  </Title>
                </AppBar>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <FormContainerLarge>
            <h3>User Details</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label>
                First Name:
                <input
                  type="text"
                  value={selectedUser.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </label>
              <label>
                Last Name:
                <input
                  type="text"
                  value={selectedUser.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </label>
              <label>
                Middle Name:
                <input
                  type="text"
                  value={selectedUser.middleName}
                  onChange={(e) => handleInputChange('middleName', e.target.value)}
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </label>
              <label>
                Address:
                <input
                  type="text"
                  value={selectedUser.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </label>
              <label>
                Contact Number:
                <input
                  type="text"
                  value={selectedUser.contactNum}
                  onChange={(e) => handleInputChange('contactNum', e.target.value)}
                />
              </label>
              <label>
                Location:
                <input
                  type="text"
                  value={selectedUser.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </label>
              <label>
                Position:
                <input
                  type="text"
                  value={selectedUser.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                />
              </label>

              <label>
                Status:
                <ToggleSwitch isChecked={selectedUser.status === 'Active'}>
                  <input
                    type="checkbox"
                    checked={selectedUser.status === 'Active'}
                    onChange={handleStatusChange}
                  />
                  <div className="switch">
                    <div className="slider"></div>
                  </div>
                  <span className="status-label">
                    {selectedUser.status === 'Active' ? 'Active' : 'Inactive'}
                  </span>
                </ToggleSwitch>
              </label>
              <button type="button" onClick={handleSaveChanges}>Save Changes</button>
              <BackButton onClick={() => navigate('/userManagement')}>Back to Users</BackButton>
            </form>
          </FormContainerLarge>

          <FormContainerSmall>
            {selectedUser.Image && <img src={selectedUser.Image} alt="User" />}
          </FormContainerSmall>
        </div>
      </MainContent>
      <Modal isVisible={isModalVisible}>
        <ModalMessage>Changes saved successfully!</ModalMessage>
        <ModalButtonContainer>
          <ModalButton onClick={handleModalClose}>Close</ModalButton>
        </ModalButtonContainer>
      </Modal>

      <ConfirmationModal isVisible={isConfirmationModalVisible}>
        <ModalMessage>Save Changes</ModalMessage>
        <ModalMessage>Are you sure you want to save changes?</ModalMessage>
        <ModalButtonContainer>
          <CancelButton onClick={handleCancelSave}>Cancel</CancelButton>
          <ConfirmButton onClick={handleConfirmSave}>Confirm</ConfirmButton>
        </ModalButtonContainer>
      </ConfirmationModal>
    </DashboardContainer>
  );
};

export default Dashboard;
