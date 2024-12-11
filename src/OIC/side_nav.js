import React, { useState } from "react"; // Import useState for managing state
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { rentmobileDb, rentmobileAuth } from "../components/firebase.config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import {
  faHome,
  faShoppingCart,
  faUsers,
  faStore,
  faBell,
  faCog,
  faSignOutAlt,
  faGavel,
  faChevronDown,
  faMoneyBill1Wave,
} from "@fortawesome/free-solid-svg-icons"; // Import solid icons from FontAwesome
import {
  ProfileHeader,
  ProfileImage,
  SearchBarContainer,
  SearchInput,
  Sidebar,
  SidebarMenu,
  SidebarItem,
  SidebarFooter,
} from "./StyledComponents"; // Adjust the import based on your file structure

const SideNav = ({ isSidebarOpen, loggedInUser }) => {
  const [openVendors, setOpenVendors] = useState(false);
  const [openStalls, setOpenStalls] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(rentmobileAuth);
      navigate("/login"); // Redirect to the login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleVendorToggle = () => setOpenVendors(!openVendors);
  const handleStallToggle = () => setOpenStalls(!openStalls);

  return (
    <Sidebar isSidebarOpen={isSidebarOpen}>
      <Link to="/profileoic" style={{ textDecoration: "none" }}>
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
        <SearchInput type="text" placeholder="Search..." />
      </SearchBarContainer>

      <SidebarMenu>
        <Link to="/oic_dashboard" style={{ textDecoration: "none" }}>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <FontAwesomeIcon icon={faHome} className="icon" />
            <span>Dashboard</span>
          </SidebarItem>
        </Link>

        {/* Vendors Section */}
        <SidebarItem onClick={handleVendorToggle} isSidebarOpen={isSidebarOpen}>
          <FontAwesomeIcon icon={faUsers} className="icon" />
          <span style={{ marginLeft: "8px" }}>Vendors</span>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="dropdown-icon"
            style={{ marginLeft: "auto" }}
          />
        </SidebarItem>
        {openVendors && (
          <SidebarMenu style={{ paddingLeft: "32px" }}>
            <Link to="/vendors" style={{ textDecoration: "none" }}>
              <SidebarItem isSidebarOpen={isSidebarOpen}>
                List of Vendors
              </SidebarItem>
            </Link>
            <Link to="/vendor-verification" style={{ textDecoration: "none" }}>
              <SidebarItem isSidebarOpen={isSidebarOpen}>
                Vendor Verification
              </SidebarItem>
            </Link>
            {/* <Link to="/declined-vendors" style={{ textDecoration: 'none' }}>
              <SidebarItem isSidebarOpen={isSidebarOpen}>Declined Vendors</SidebarItem>
            </Link> */}
          </SidebarMenu>
        )}

        {/* Stalls Section */}
        <Link to="/stalls" style={{ textDecoration: "none" }}>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <FontAwesomeIcon icon={faStore} className="icon" />
            <span>List of Stalls</span>
          </SidebarItem>
        </Link>

        {/* Violations Section */}
        <Link to="/violations" style={{ textDecoration: "none" }}>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <FontAwesomeIcon icon={faGavel} className="icon" />
            <span>Violations</span>
          </SidebarItem>
        </Link>

        {/* Announcement Section
        <Link to="/announcement" style={{ textDecoration: 'none' }}>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <FontAwesomeIcon icon={faBell} className="icon" />
            <span>Announcement</span>
          </SidebarItem>
        </Link> */}

        {/* Compromise Section
        <Link to="/compromise" style={{ textDecoration: 'none' }}>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <FontAwesomeIcon icon={faMoneyBill1Wave} className="icon" />
            <span>Compromise Payment</span>
          </SidebarItem>
        </Link> */}

        {/* Settings Section */}
        <Link to="/settings" style={{ textDecoration: "none" }}>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <FontAwesomeIcon icon={faCog} className="icon" />
            <span>Settings</span>
          </SidebarItem>
        </Link>

        {/* Logout Section */}
        <SidebarItem isSidebarOpen={isSidebarOpen} onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="icon" />
          <span>Logout</span>
        </SidebarItem>
      </SidebarMenu>

      <SidebarFooter>{/* Add footer content if needed */}</SidebarFooter>
    </Sidebar>
  );
};

export default SideNav;
