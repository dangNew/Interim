import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FaBars,
  FaEye,
  FaPen,
  FaTrash,
  FaSearch,
  FaUserCircle,
  FaUsers,
  FaUser,
  FaUserSlash,
  FaChevronDown,
  FaSignOutAlt,
  FaCaretDown,
  FaPlus,
} from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faShoppingCart,
  faUser,
  faSearch,
  faPlus,
  faUsers,
  faFileContract,
  faTicketAlt,
  faCheck,
  faClipboard,
  faPlusCircle,
  faCogs,
} from "@fortawesome/free-solid-svg-icons";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config";
import IntSidenav from "./IntSidenav";

const UserManagementContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "60px")};
  padding-left: 10px;
  background-color: #fff;
  padding: 2rem;
  width: calc(
    100% - ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "60px")}
  );
  transition: margin-left 0.3s ease, width 0.3s ease;
  overflow-y: auto;
`;

const AppBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 50px;
  background-color: #188423;
  color: white;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  font-size: 22px;
  font-family: "Inter", sans-serif;
  font-weight: bold;
`;

const DashboardTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const StatsContainer = styled.div`
  margin-top: 25px;
  display: flex;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatBox = styled.div`
  background-color: ${({ bgColor }) => bgColor || "#f4f4f4"};
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #ddd;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }

  h3 {
    margin: 0;
    font-size: 1.2rem;
    color: white;
  }

  p {
    font-size: 2rem;
    margin: 0;
    font-weight: bold;
    color: white;
  }

  @media (max-width: 768px) {
    padding: 1rem;

    h3 {
      font-size: 1rem;
    }

    p {
      font-size: 1.6rem;
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
`;

const ModalHeader = styled.h2`
  margin: 0;
`;

const ModalBody = styled.p`
  margin: 20px 0;
`;

const ModalButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
  transition: background 0.3s, transform 0.2s;

  &:hover {
    background: #0056b3;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
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

    th,
    td {
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
      display: flex;
      align-items: center;
      border: none;
      background: none;
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: #0056b3;
      }

      .icon {
        font-size: 24px;
        color: black;
      }
    }
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  border: none;
  border-radius: 5px;
  padding: 5px 5px;
  cursor: pointer;
  gap: 1px;
  font-size: 12px;
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

  &.delete {
    background-color: #dc3545;
    color: white;

    &:hover {
      background-color: #c82333;
    }
  }

  .icon {
    margin-right: 5px;
    font-size: 16px;
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
  display: ${({ isSidebarOpen }) => (isSidebarOpen ? "flex" : "none")};
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownMenu = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  list-style-type: none;
  padding: 0;
  margin: 0;
  z-index: 200;
  width: 100%;

  li {
    padding: 10px;
    cursor: pointer;

    &:hover {
      background-color: #f1f1f1;
    }
  }
`;

const SearchContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  width: 400px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 0 10px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StyledSearchBar = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: #333;

  &::placeholder {
    color: #aaa;
  }
`;

const IconWrapper = styled.div`
  color: #888;
  margin-right: 8px;
  font-size: 16px;
`;

const AddButton = styled.button`
  margin-top: 1rem;
  padding: 10px;
  background-color: #4caf50;
  color: white;
  border: 1rem;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

const DropdownButton = styled.button`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;

  &:hover {
    background-color: #0056b3;
  }

  span {
    margin-left: 10px;
  }
`;

const UserManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [users, setUserData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    userManagement: false,
    addUnit: false,
    appraise: false,
    contract: false,
    ticket: false,
    manageZone: false,
    manageSpace: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [inactiveUsers, setInactiveUsers] = useState(0);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDropdownToggle = (dropdown) => {
    setIsDropdownOpen((prevState) => ({
      ...prevState,
      [dropdown]: !prevState[dropdown],
    }));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const loggedInUserData = JSON.parse(localStorage.getItem("userData"));
      if (loggedInUserData) {
        const usersCollection = collection(rentmobileDb, "admin_users");
        const userDocs = await getDocs(usersCollection);
        const users = userDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const currentUser = users.find(
          (user) => user.email === loggedInUserData.email
        );
        setLoggedInUser(currentUser || loggedInUserData);
      }
    };

    fetchUserData();
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role === "All Users" ? null : role);
    setIsRoleDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/login");
  };

  const handleUserDropdownToggle = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
    if (isRoleDropdownOpen) {
      setIsRoleDropdownOpen(false);
    }
  };

  const handleRoleDropdownToggle = () => {
    setIsRoleDropdownOpen(!isRoleDropdownOpen);
    if (isUserDropdownOpen) {
      setIsUserDropdownOpen(false);
    }
  };

  const handleShowModal = (type, message) => {
    setModalType(type);
    setModalMessage(message);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleEditClick = (userId) => {
    navigate(`/edit/${userId}`);
  };

  const handleViewClick = (userId) => {
    navigate(`/viewuser/${userId}`);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    handleShowModal(
      "confirmation",
      `Are you sure you want to delete ${user.firstName} ${user.lastName}?`
    );
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteDoc(doc(rentmobileDb, "admin_users", userToDelete.id));
        setUserData(users.filter((user) => user.id !== userToDelete.id));
        handleShowModal(
          "success",
          `${userToDelete.firstName} ${userToDelete.lastName} has been deleted.`
        );
      } catch (error) {
        handleShowModal("error", "Failed to delete user");
      } finally {
        setUserToDelete(null);
        handleCloseModal();
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(rentmobileDb, "admin_users")
        );
        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserData(userList);
        setFilteredUsers(userList);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = users;
    if (selectedRole) {
      filtered = filtered.filter((user) => user.position === selectedRole);
    }
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((user) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(lowerQuery)
      );
    }
    setFilteredUsers(filtered);
  }, [users, selectedRole, searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(rentmobileDb, "admin_users")
        );
        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUserData(userList);

        const inactiveCount = userList.filter(
          (user) => user.status === "Inactive"
        ).length;
        setInactiveUsers(inactiveCount);
      } catch (error) {
        console.error("Error fetching user data:", error);
        handleShowModal("error", "Failed to fetch user data");
      }
    };

    fetchData();
  }, [selectedRole]);

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSidebarOpen(false);
    }
    if (isRoleDropdownOpen && !event.target.closest(".dropdown-container")) {
      setIsRoleDropdownOpen(false);
    }
    if (isUserDropdownOpen && !event.target.closest(".dropdown-container")) {
      setIsUserDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMainContentClick = () => {
    setIsSidebarOpen(false);
  };

  const totalUsers = users.filter(
    (user) => user.firstName && user.lastName
  ).length;
  const activeUsers = users.filter(
    (user) => user.status === "Active" && user.firstName && user.lastName
  ).length;

  const handleUserTypeSelect = async (userType) => {
    setSelectedUserType(userType);
    setIsUserDropdownOpen(false);
    if (userType === "All Admins") {
      const querySnapshot = await getDocs(
        collection(rentmobileDb, "admin_users")
      );
      const userList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserData(userList);
      setFilteredUsers(userList);
    } else if (userType === "All Ambulant Collector") {
      const querySnapshot = await getDocs(
        collection(rentmobileDb, "ambulant_collector")
      );
      const userList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserData(userList);
      setFilteredUsers(userList);
    }
  };

  return (
    <UserManagementContainer>
      <div ref={sidebarRef}>
        <IntSidenav
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          loggedInUser={loggedInUser}
        />
      </div>
      <MainContent
        isSidebarOpen={isSidebarOpen}
        onClick={handleMainContentClick}
      >
        <AppBar>
          <div className="title">OFFICE OF THE CITY MARKETS</div>
        </AppBar>

        <SearchBarContainer>
          <input type="text" placeholder="Search users..." />
          <Link to="/newuser">
            <button className="add-user-btn">+ New User</button>
          </Link>
        </SearchBarContainer>

        <StatsContainer>
          <StatBox bgColor="#11768C">
            <h3>Total Users</h3>
            <p>{totalUsers}</p>
            <div className="icon-container">
              <FaUsers
                className="fading-icon"
                style={{
                  fontSize: "30px",
                  opacity: 0.5,
                  animation: "fade 2s infinite alternate",
                }}
              />
            </div>
          </StatBox>

          <StatBox bgColor="#11768C">
            <h3>Active Users</h3>
            <p>{activeUsers}</p>
            <div className="icon-container">
              <FaUser
                className="fading-icon"
                style={{
                  fontSize: "30px",
                  opacity: 0.5,
                  animation: "fade 2s infinite alternate",
                }}
              />
            </div>
          </StatBox>

          <StatBox bgColor="#11768C">
            <h3>Inactive Users</h3>
            <p>{inactiveUsers}</p>
            <div className="icon-container">
              <FaUserSlash
                className="fading-icon"
                style={{
                  fontSize: "30px",
                  opacity: 0.5,
                  animation: "fade 2s infinite alternate",
                }}
              />
            </div>
          </StatBox>
        </StatsContainer>

        <FormContainer>
          <ControlsContainer>
            <AddButton onClick={() => navigate("/newuser")}>
              <FaPlus style={{ marginRight: "8px" }} />
              Add New User
            </AddButton>

            <DropdownContainer className="dropdown-container">
              <DropdownButton onClick={handleRoleDropdownToggle}>
                <FaUser style={{ marginRight: "8px" }} />
                <span>{selectedRole || "Select Role"}</span>
                <FaCaretDown style={{ marginLeft: "8px" }} />
              </DropdownButton>

              {isRoleDropdownOpen && (
                <DropdownMenu>
                  <li onClick={() => handleRoleSelect("All Users")}>
                    All Users
                  </li>
                  <li onClick={() => handleRoleSelect("Collector")}>
                    Collector
                  </li>
                  <li onClick={() => handleRoleSelect("CTO")}>CTO</li>
                  <li onClick={() => handleRoleSelect("OIC")}>OIC</li>
                  <li onClick={() => handleRoleSelect("Interim")}>Interim</li>
                  <li onClick={() => handleRoleSelect("Interim")}>Enforcer</li>
                </DropdownMenu>
              )}
            </DropdownContainer>

            <DropdownContainer className="dropdown-container">
              <DropdownButton onClick={handleUserDropdownToggle}>
                <FaUser style={{ marginRight: "8px" }} />
                <span>{selectedUserType || "Select User Type"}</span>
                <FaCaretDown style={{ marginLeft: "8px" }} />
              </DropdownButton>

              {isUserDropdownOpen && (
                <DropdownMenu>
                  <li onClick={() => handleUserTypeSelect("All Admins")}>
                    All Admins
                  </li>
                  <li
                    onClick={() =>
                      handleUserTypeSelect("All Ambulant Collector")
                    }
                  >
                    All Ambulant Collector
                  </li>
                </DropdownMenu>
              )}
            </DropdownContainer>

            <SearchContainer>
              <IconWrapper>
                <FaSearch />
              </IconWrapper>
              <StyledSearchBar
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </SearchContainer>
          </ControlsContainer>

          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Full Name</th>
                <th>Position</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No data is stored
                  </td>
                </tr>
              ) : (
                filteredUsers
                  .filter((user) => user.firstName && user.lastName)
                  .map((user, index) => (
                    <tr key={index}>
                      <td>{user.email}</td>
                      <td>
                        {user.firstName} {user.lastName}
                      </td>
                      <td>{user.position}</td>
                      <td>{user.location}</td>
                      <td>{user.status}</td>

                      <td>
                        <div className="actions">
                          <ActionButton
                            className="view"
                            onClick={() => handleViewClick(user.id)}
                          >
                            <FaEye className="icon" /> View
                          </ActionButton>
                          <ActionButton
                            className="edit"
                            onClick={() => handleEditClick(user.id)}
                          >
                            <FaPen className="icon" /> Edit
                          </ActionButton>
                          <ActionButton
                            className="delete"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <FaTrash className="icon" /> Delete
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </FormContainer>

        {showModal && (
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>
                {modalType === "confirmation"
                  ? "Confirm Delete"
                  : modalType === "success"
                  ? "Success"
                  : "Error"}
              </ModalHeader>
              <ModalBody
                style={{
                  fontSize: modalType === "confirmation" ? "0.9rem" : "1rem",
                }}
              >
                {modalMessage}
              </ModalBody>
              {modalType === "confirmation" ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "20px",
                  }}
                >
                  <ModalButton
                    style={{ background: "#4caf50", marginRight: "10px" }}
                    onClick={handleConfirmDelete}
                  >
                    Confirm
                  </ModalButton>
                  <ModalButton
                    style={{ background: "#f44336" }}
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </ModalButton>
                </div>
              ) : (
                <ModalButton onClick={handleCloseModal}>OK</ModalButton>
              )}
            </ModalContent>
          </ModalOverlay>
        )}
      </MainContent>
    </UserManagementContainer>
  );
};

export default UserManagement;
