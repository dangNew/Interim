import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
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
} from "@fortawesome/free-solid-svg-icons";
import { initializeApp } from "firebase/app";
import { rentmobileDb, rentmobileAuth } from "../components/firebase.config";
import {
  getAuth,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { interimDb } from "../components/firebase.config";
import ConfirmationModal from "./ConfirmationModal"; // Import the modal
import IntSidenav from "./IntSidenav";

const DashboardContainer = styled.div`
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
  display: left;
  align-items: center;
  justify-content: space-between;
  padding: 40px 50px;
  background-color: #188423; /* Updated color */
  color: white;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  font-size: 22px;
  font-family: "Inter", sans-serif; /* Use a professional font */
  font-weight: bold; /* Apply bold weight */
`;

const FormContainer = styled.form`
  display: grid;
  gap: 1.5rem;
  background: #fff;
  border: 2px solid #ddd;
  padding: 1rem;
  border-radius: 20px;
  max-width: 96%;
  width: 100%;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  align-self: center;
  margin-top: 20px;

  label {
    font-size: 20px;
    margin-bottom: 5px;
  }

  input,
  select,
  textarea {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ddd;
    width: 90%;
  }

  .section-title {
    grid-column: span 2;
    font-size: 25px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
  }

  .form-section {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .inline-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .button-group {
    grid-column: span 2;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      background-color: #4caf50;
      color: white;
      cursor: pointer;
      font-size: 1rem;
      font-weight: bold;

      &:hover {
        background-color: #45a049;
      }

      &.cancel {
        background-color: #f44336;

        &:hover {
          background-color: #d32f2f;
        }
      }
    }
  }

  .upload-btn-wrapper {
    position: relative;
    overflow: hidden;
    display: inline-block;

    button {
      border: 1px solid #ddd;
      color: gray;
      background-color: #f0f0f0;
      padding: 8px 20px;
      border-radius: 4px;
      font-size: 1rem;
    }

    input[type="file"] {
      font-size: 100px;
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0;
    }
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

const Divider = styled.hr`
  border: 2;
  height: 1px;
  background-color: #dee2e6;
  margin: 10px 0;
  width: 150%;
`;

const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 12px;
    width: 12px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #4caf50;
  }

  input:checked + .slider:before {
    transform: translateX(20px);
  }
`;

const Modal = styled.div`
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
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
  margin-top: 20px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;

  &:hover {
    background-color: #0056b3;
  }
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [isPositionActive, setIsPositionActive] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [contactNumWarning, setContactNumWarning] = useState("");
  const navigate = useNavigate();

  const handleDropdownToggle = (dropdown) => {
    setIsDropdownOpen((prevState) => ({
      ...prevState,
      [dropdown]: !prevState[dropdown],
    }));
  };

  // Form state for storing the input values
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    contactNum: "",
    contact_collector: "",
    email: "",
    address: "",
    address_collector: "",
    collector: "",
    password: "",
    status: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Handling form input changes
  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === "contactNum" || id === "contact_collector") {
      // Only allow digits and limit to 11 characters
      const numericValue = value.replace(/\D/g, ""); // Remove any non-numeric characters
      if (numericValue.length <= 11) {
        setFormData((prevState) => ({
          ...prevState,
          [id]: numericValue,
        }));

        // Set warning if contactNum is not exactly 11 digits
        if (numericValue.length !== 11 && numericValue.length > 0) {
          setContactNumWarning("Contact number must be exactly 11 digits.");
        } else {
          setContactNumWarning(""); // Clear warning if length is valid
        }
      }
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [id]: value,
      }));
    }
  };

  // Submitting the form and adding data to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Input validation
    if (!formData.email || !formData.password) {
      alert("Email and password are required!");
      return;
    }

    try {
      // Check if the email is already in use
      const signInMethods = await fetchSignInMethodsForEmail(
        rentmobileAuth,
        formData.email
      );
      if (signInMethods.length > 0) {
        setModalMessage("The email address is already in use.");
        setIsModalOpen(true);
        return;
      }

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        rentmobileAuth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      const collectorData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        contactNum: formData.contactNum,
        contact_collector: formData.contact_collector.toString(), // Ensure contact_collector is a string
        email: formData.email,
        address: formData.address,
        address_collector: formData.address_collector,
        collector: formData.collector,
        Image: null,
        status: formData.status,
        zone: "", // Initialize the zone field
      };

      // Reference to the ambulant_collector collection
      const collectorsCollection = collection(
        rentmobileDb,
        "ambulant_collector"
      );

      // Check if collector already exists
      const collectorsSnapshot = await getDocs(collectorsCollection);
      const existingCollector = collectorsSnapshot.docs.find(
        (doc) => doc.data().email === formData.email
      );

      if (!existingCollector) {
        // Save the collector data to Firestore
        await addDoc(collectorsCollection, collectorData);
        setModalMessage("Collector added successfully!");
      } else {
        setModalMessage("Collector already exists!");
      }

      // Reset the form after submission
      setFormData({
        firstName: "",
        lastName: "",
        middleName: "",
        contactNum: "",
        contact_collector: "",
        email: "",
        address: "",
        address_collector: "",
        collector: "",
        Image: null,
        status: "",
        password: "", // Reset password field
      });
    } catch (error) {
      console.error("Error adding document: ", error.message);
      setModalMessage(
        "Failed to add collector or create user: " + error.message
      );
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const togglePositionSwitch = () => {
    setIsPositionActive((prevState) => !prevState);
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSidebarOpen(false);
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

  useEffect(() => {
    const fetchUserData = async () => {
      const loggedInUserData = JSON.parse(localStorage.getItem("userData"));
      if (loggedInUserData) {
        const usersCollection = collection(interimDb, "users");
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

  const handleLogout = () => {
    localStorage.removeItem("formData");
    navigate("/login");
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
      <MainContent
        isSidebarOpen={isSidebarOpen}
        onClick={handleMainContentClick}
      >
        <AppBar>
          <div className="title">OFFICE OF THE CITY MARKETS</div>
        </AppBar>

        <FormContainer onSubmit={handleSubmit}>
          <div className="section-title">Basic Details</div>
          <Divider /> {/* Full-width horizontal line */}
          <span></span>
          <div className="form-section">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter First Name"
              required
            />
          </div>
          <div className="form-section">
            <label htmlFor="middleName">Middle Name</label>
            <input
              type="text"
              id="middleName"
              value={formData.middleName}
              onChange={handleChange}
              placeholder="Enter Middle Name"
              required
            />
          </div>
          <div className="form-section">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter Last Name"
              required
            />
          </div>
          <div className="form-section">
            <label htmlFor="contactNum">Contact Number</label>
            <input
              type="text"
              id="contactNum"
              value={formData.contactNum}
              onChange={handleChange}
              placeholder="Enter 11-digit contact number"
              required
            />
            {contactNumWarning && (
              <p style={{ color: "red" }}>{contactNumWarning}</p>
            )}
          </div>
          <div className="form-section">
            <label htmlFor="contact_collector">Contact Collector</label>
            <input
              type="text"
              id="contact_collector"
              value={formData.contact_collector}
              onChange={handleChange}
              placeholder="Enter 11-digit contact collector number"
              required
            />
            {contactNumWarning && (
              <p style={{ color: "red" }}>{contactNumWarning}</p>
            )}
          </div>
          <div className="form-section">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter Address"
              required
            />
          </div>
          <div className="form-section">
            <label htmlFor="address_collector">Address Collector</label>
            <input
              type="text"
              id="address_collector"
              value={formData.address_collector}
              onChange={handleChange}
              placeholder="Enter Address Collector"
              required
            />
          </div>
          <div className="form-section">
            <label htmlFor="collector">Collector</label>
            <input
              type="text"
              id="collector"
              value={formData.collector}
              onChange={handleChange}
              placeholder="Enter Collector"
              required
            />
          </div>
          <div className="section-title">Login Details</div>
          <Divider /> {/* Add the horizontal line here */}
          <span></span>
          <div className="form-section">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
              required
            />
          </div>
          <div className="form-section">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter Password"
              required
            />
          </div>
          <div className="section-title">Other Details</div>
          <Divider /> {/* Add the horizontal line here */}
          <span></span>
          <div>
            <label htmlFor="toggleSwitch">Active Status</label>
            <ToggleSwitch>
              <span>Active</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isPositionActive}
                  onChange={togglePositionSwitch}
                />
                <span className="slider"></span>
              </label>
            </ToggleSwitch>
          </div>
          <div className="button-group">
            <button
              className="cancel"
              type="button"
              onClick={() => {
                /* Logic for cancel */
              }}
            >
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </FormContainer>

        <Modal isOpen={isModalOpen}>
          <ModalContent>
            <p>{modalMessage}</p>
            <ModalButton onClick={handleModalClose}>Close</ModalButton>
          </ModalContent>
        </Modal>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
