import React, { forwardRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaBars, FaUserCircle, FaSignOutAlt, FaSearch } from "react-icons/fa";
import {
  faHome,
  faShoppingCart,
  faUser,
  faSearch,
  faPlus,
  faUsers,
  faFileContract,
  faCogs,
  faTicketAlt,
  faCheck,
  faClipboard,
  faPlusCircle,
  faCubes,
  faUserEdit,
  faCashRegister,
  faPlusSquare,
  faThLarge,
} from "@fortawesome/free-solid-svg-icons";
import { initializeApp } from "firebase/app";
import { rentmobileDb } from "../components/firebase.config";

library.add(
  faHome,
  faShoppingCart,
  faUser,
  faSearch,
  faPlus,
  faUsers,
  faFileContract,
  faCogs,
  faTicketAlt,
  faCheck,
  faClipboard,
  faPlusCircle
);

const Sidebar = styled.div`
  width: ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "60px")};
  background-color: #f8f9fa;
  padding: 10px;
  display: flex;
  border: 1px solid #ddd;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 100;
  overflow-y: auto;
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
  justify-content: ${({ isSidebarOpen }) =>
    isSidebarOpen ? "flex-start" : "center"};
  padding: 10px;
  margin-bottom: 10px;
  margin-top: -10px;
  border-radius: 8px;
  font-size: 13px;
  color: ${({ active }) => (active ? "white" : "#333")};
  background-color: ${({ active }) => (active ? "#007bff" : "transparent")};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ active }) => (active ? "#007bff" : "#f1f3f5")};
  }

  .icon {
    font-size: 1rem;
    color: #000;
    transition: margin-left 0.2s ease;
  }

  span:last-child {
    margin-left: 10px;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? "inline" : "none")};
  }
`;

const SidebarFooter = styled.div`
  padding: 10px;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: ${({ isSidebarOpen }) =>
    isSidebarOpen ? "flex-start" : "center"};
`;

const LogoutButton = styled(SidebarItem)`
  margin-top: 5px;
  background-color: #dc3545;
  color: white;
  align-items: center;
  margin-left: 20px;
  padding: 5px 15px;
  border-radius: 5px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #c82333;
    transform: scale(1.05);
  }
`;

const ToggleButton = styled.div`
  display: ${({ isSidebarOpen }) => (isSidebarOpen ? "none" : "block")};
  position: absolute;
  top: 5px;
  left: 15px;
  font-size: 1.8rem;
  color: #333;
  cursor: pointer;
  z-index: 200;
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
    color: #6c757d;
  }

  .profile-name {
    font-size: 1.2rem;
    font-weight: 700;
    color: black;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? "block" : "none")};
  }

  hr {
    width: 100%;
    border: 0.5px solid #ccc;
    margin-top: 15px;
  }

  .profile-position {
    font-size: 1rem;
    font-weight: 600;
    color: #007bff;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? "block" : "none")};
    margin-top: 5px;
  }
`;

const ProfileImage = styled.img`
  border-radius: 50%;
  width: 60px;
  height: 60px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const ModalButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  font-weight: bold;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #c82333;
  }
`;

const IntSidenav = forwardRef(
  ({ isSidebarOpen, setIsSidebarOpen, loggedInUser }, ref) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState({
      userManagement: false,
      stallmanagement: false,
      addUnit: false,
      appraise: false,
      contract: false,
      ticket: false,
      manageSection: false,
      manageSpace: false,
      manageAppraise: false,
    });
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const navigate = useNavigate();

    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };

    const handleDropdownToggle = (dropdown) => {
      setIsDropdownOpen((prevState) => ({
        ...prevState,
        [dropdown]: !prevState[dropdown],
      }));
    };

    const handleSearchChange = (event) => {
      setSearchTerm(event.target.value);
    };

    const handleLogout = () => {
      setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
      localStorage.removeItem("userData");
      navigate("/login");
      setIsLogoutModalOpen(false);
    };

    const cancelLogout = () => {
      setIsLogoutModalOpen(false);
    };

    return (
      <Sidebar ref={ref} isSidebarOpen={isSidebarOpen}>
        <ToggleButton onClick={toggleSidebar}>
          <FaBars />
        </ToggleButton>
        <Link to="/profile" style={{ textDecoration: "none" }}>
          <ProfileHeader isSidebarOpen={isSidebarOpen}>
            {loggedInUser && loggedInUser.Image ? (
              <ProfileImage
                src={loggedInUser.Image}
                alt={`${loggedInUser.firstName} ${loggedInUser.lastName}`}
              />
            ) : (
              <FaUserCircle className="profile-icon" />
            )}
            <span className="profile-name">
              {loggedInUser
                ? `${loggedInUser.firstName} ${loggedInUser.lastName}`
                : "Guest"}
            </span>
            <span
              className="profile-email"
              style={{
                fontSize: "0.9rem",
                color: "#6c757d",
                display: isSidebarOpen ? "block" : "none",
              }}
            >
              {loggedInUser ? loggedInUser.email : ""}
            </span>
            <span
              className="profile-position"
              style={{
                fontSize: "0.9rem",
                color: "#6c757d",
                display: isSidebarOpen ? "block" : "none",
              }}
            >
              {loggedInUser ? loggedInUser.position : ""}
            </span>
          </ProfileHeader>
        </Link>

        <SearchBarContainer isSidebarOpen={isSidebarOpen}>
          <FaSearch />
          <SearchInput
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </SearchBarContainer>

        <SidebarMenu>
          <Link to="/dashboard" style={{ textDecoration: "none" }}>
            <SidebarItem isSidebarOpen={isSidebarOpen}>
              <FontAwesomeIcon icon={faHome} className="icon" />
              <span>Dashboard</span>
            </SidebarItem>
          </Link>

          <Link to="/list" style={{ textDecoration: "none" }}>
            <SidebarItem isSidebarOpen={isSidebarOpen}>
              <FontAwesomeIcon icon={faShoppingCart} className="icon" />
              <span>List of Vendors</span>
            </SidebarItem>
          </Link>

          <Link to="/billingconfig" style={{ textDecoration: "none" }}>
            <SidebarItem isSidebarOpen={isSidebarOpen}>
              <FontAwesomeIcon icon={faCashRegister} className="icon" />
              <span>Billing Configuration</span>
            </SidebarItem>
          </Link>

          <SidebarItem
            isSidebarOpen={isSidebarOpen}
            onClick={() => handleDropdownToggle("stallmanagement")}
          >
            <FontAwesomeIcon icon={faCubes} className="icon" />
            <span>Stall Management</span>
          </SidebarItem>

          {isDropdownOpen.stallmanagement && (
            <ul style={{ paddingLeft: "20px", listStyleType: "none" }}>
              <Link to="/listofstalls" style={{ textDecoration: "none" }}>
                <li>
                  <SidebarItem isSidebarOpen={isSidebarOpen}>
                    <FontAwesomeIcon icon={faSearch} className="icon" />
                    <span>List Of Stalls</span>
                  </SidebarItem>
                </li>
              </Link>
              <Link to="/newstall" style={{ textDecoration: "none" }}>
                <li>
                  <SidebarItem isSidebarOpen={isSidebarOpen}>
                    <FontAwesomeIcon icon={faPlus} className="icon" />
                    <span>Add Stalls</span>
                  </SidebarItem>
                </li>
              </Link>
            </ul>
          )}

          <SidebarItem
            isSidebarOpen={isSidebarOpen}
            onClick={() => handleDropdownToggle("userManagement")}
          >
            <FontAwesomeIcon icon={faUser} className="icon" />
            <span>User Management</span>
          </SidebarItem>

          {isDropdownOpen.userManagement && (
            <ul style={{ paddingLeft: "20px", listStyleType: "none" }}>
              <Link to="/usermanagement" style={{ textDecoration: "none" }}>
                <li>
                  <SidebarItem isSidebarOpen={isSidebarOpen}>
                    <FontAwesomeIcon icon={faSearch} className="icon" />
                    <span>View Users</span>
                  </SidebarItem>
                </li>
              </Link>
              <Link to="/newuser" style={{ textDecoration: "none" }}>
                <li>
                  <SidebarItem isSidebarOpen={isSidebarOpen}>
                    <FontAwesomeIcon icon={faPlus} className="icon" />
                    <span>Create Admin User</span>
                  </SidebarItem>
                </li>
              </Link>
              <Link to="/addcollector" style={{ textDecoration: "none" }}>
                <li>
                  <SidebarItem isSidebarOpen={isSidebarOpen}>
                    <FontAwesomeIcon icon={faUserEdit} className="icon" />
                    <span>Add Ambulant Collector</span>
                  </SidebarItem>
                </li>
              </Link>
            </ul>
          )}

          <Link to="/viewunit" style={{ textDecoration: "none" }}>
            <SidebarItem isSidebarOpen={isSidebarOpen}>
              <FontAwesomeIcon icon={faPlusSquare} className="icon" />
              <span>Add New Unit</span>
            </SidebarItem>
          </Link>
          <SidebarItem
            isSidebarOpen={isSidebarOpen}
            onClick={() => handleDropdownToggle("manageSection")}
          >
            <FontAwesomeIcon icon={faCogs} className="icon" />
            <span>Manage Section</span>
          </SidebarItem>

          {isDropdownOpen.manageSection && (
            <ul style={{ paddingLeft: "20px", listStyleType: "none" }}>
              <Link to="/addsection" style={{ textDecoration: "none" }}>
                <li>
                  <SidebarItem isSidebarOpen={isSidebarOpen}>
                    <FontAwesomeIcon icon={faPlusCircle} className="icon" />
                    <span> Add Section</span>
                  </SidebarItem>
                </li>
              </Link>
              <Link to="/viewsection" style={{ textDecoration: "none" }}>
                <li>
                  <SidebarItem isSidebarOpen={isSidebarOpen}>
                    <FontAwesomeIcon icon={faSearch} className="icon" />
                    <span> View All Section</span>
                  </SidebarItem>
                </li>
              </Link>
            </ul>
          )}

          <SidebarItem
            isSidebarOpen={isSidebarOpen}
            onClick={() => handleDropdownToggle("manageAppraise")}
          >
            <FontAwesomeIcon icon={faCogs} className="icon" />
            <span>Manage Appraise</span>
          </SidebarItem>

          {isDropdownOpen.manageAppraise && (
            <ul style={{ paddingLeft: "20px", listStyleType: "none" }}>
              <Link to="/appraiseproduct" style={{ textDecoration: "none" }}>
                <li>
                  <SidebarItem isSidebarOpen={isSidebarOpen}>
                    <FontAwesomeIcon icon={faThLarge} className="icon" />
                    <span> All Appraisal Product</span>
                  </SidebarItem>
                </li>
              </Link>
              <Link to="/appraise" style={{ textDecoration: "none" }}>
                <li>
                  <SidebarItem isSidebarOpen={isSidebarOpen}>
                    <FontAwesomeIcon icon={faPlusCircle} className="icon" />
                    <span> Add Appraise</span>
                  </SidebarItem>
                </li>
              </Link>
              <Link to="/appraisers" style={{ textDecoration: "none" }}>
                <li>
                  <SidebarItem isSidebarOpen={isSidebarOpen}>
                    <FontAwesomeIcon icon={faSearch} className="icon" />
                    <span> View Appraisers</span>
                  </SidebarItem>
                </li>
              </Link>
            </ul>
          )}

          <Link to="/ticket" style={{ textDecoration: "none" }}>
            <SidebarItem isSidebarOpen={isSidebarOpen}>
              <FontAwesomeIcon icon={faTicketAlt} className="icon" />
              <span>Manage Ticket</span>
            </SidebarItem>
          </Link>
        </SidebarMenu>

        <SidebarFooter isSidebarOpen={isSidebarOpen}>
          <LogoutButton isSidebarOpen={isSidebarOpen} onClick={handleLogout}>
            <span>
              <FaSignOutAlt />
            </span>
            <span>Logout</span>
          </LogoutButton>
        </SidebarFooter>

        {isLogoutModalOpen && (
          <ModalBackdrop>
            <ModalContent>
              <h2>Confirm Logout</h2>
              <p>Are you sure you want to log out?</p>
              <ModalButton onClick={confirmLogout}>Yes, Logout</ModalButton>
              <ModalButton
                onClick={cancelLogout}
                style={{ backgroundColor: "#6c757d", marginLeft: "10px" }}
              >
                Cancel
              </ModalButton>
            </ModalContent>
          </ModalBackdrop>
        )}
      </Sidebar>
    );
  }
);

export default IntSidenav;
