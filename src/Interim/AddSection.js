import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  collection,
  getDocs,
  addDoc,
  setDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config";
import { interimDb } from "../components/firebase.config";
import IntSidenav from "./IntSidenav";
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

const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 3rem; /* Spacious feel */
  border-radius: 12px; /* Softer border radius */
  background-color: #ffffff; /* White background */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* Soft shadow */
  border: 1px solid #e0e0e0; /* Subtle border */
  max-width: 600px; /* Max width */
  margin-left: auto; /* Center align */
  margin-right: auto; /* Center align */
  font-family: "Roboto", sans-serif; /* Consistent font */

  h3 {
    margin-bottom: 2rem; /* Increased margin */
    color: #343a40; /* Dark gray for the heading */
    font-size: 26px; /* Larger heading */
    font-weight: 700; /* Bold weight */
    text-align: center; /* Centered heading */
    border-bottom: 2px solid #e0e0e0; /* Underline */
    padding-bottom: 1rem; /* Space below heading */
  }

  table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 15px; /* Standardized padding */
      text-align: left;
      border-bottom: 1px solid #e0e0e0; /* Subtle border */
    }

    th {
      background-color: #f8f9fa; /* Light gray header */
      font-weight: 700; /* Bold headers */
      color: #495057; /* Darker text */
    }

    tr:nth-child(even) {
      background-color: #f9f9f9; /* Alternating row colors */
    }

    tr:hover {
      background-color: #e9ecef; /* Highlight row on hover */
      transition: background-color 0.3s ease; /* Smooth transition */
    }
  }
`;

const InputField = styled.div`
  position: relative;
  margin-bottom: 1.5rem;

  input,
  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 16px;
    font-family: "Roboto", sans-serif;
    color: #495057;
    transition: border-color 0.3s ease;

    &:focus {
      border-color: #188423;
      outline: none;
    }
  }

  label {
    position: absolute;
    top: -10px;
    left: 12px;
    background-color: #ffffff;
    color: #000000; /* Changed to black */
    font-size: 16px;
    padding: 0 5px;
    transition: all 0.3s ease;
    font-family: "Roboto", sans-serif;
  }
`;

const SaveButton = styled.button`
  background-color: #4caf50;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;

  &:hover {
    background-color: #45a049;
  }
`;

const DropdownField = styled.select`
  position: relative;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
  color: #495057;
  background-color: #fdfdfd;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  margin-top: 0.5rem;
  width: 100%;

  &:focus {
    border-color: #007bff; /* Blue border on focus */
    outline: none; /* Remove outline */
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* Glow effect */
  }

  option {
    color: #495057; /* Dark text color for options */
    padding: 0.5rem;
    background-color: #ffffff; /* White background for options */

    &:hover {
      background-color: #f0f0f0; /* Light gray background on hover */
    }
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
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;

  h3 {
    color: #333;
    font-size: 24px;
    margin-bottom: 20px;
    font-weight: 600;
  }

  p {
    color: #333;
    font-size: 18px;
    margin-bottom: 20px;
    line-height: 1.6;
  }

  button {
    background-color: #2c6b2f;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease, transform 0.2s ease;
    margin-top: 10px;
    font-weight: bold;
    width: 100%;

    &:hover {
      background-color: #244f23;
      transform: translateY(-2px);
    }

    &:active {
      background-color: #1d3e1b;
      transform: translateY(0);
    }
  }
`;

const CloseButton = styled.span`
  cursor: pointer;
  color: red;
  font-size: 24px;
  position: absolute;
  top: 10px;
  right: 10px;
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

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [sectionName, setSectionName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    userManagement: false,
    addLocation: false,
    appraise: false,
    contract: false,
    ticket: false,
    manageZone: false,
    manageSpace: false,
  });
  const [locations, setLocations] = useState([]);

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

  const handleSaveSection = async () => {
    try {
      const sectionsCollection = collection(rentmobileDb, "section");
      const q = query(sectionsCollection, where("location", "==", selectedLocation));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Document with the same location exists
        const docRef = querySnapshot.docs[0].ref;
        const docData = querySnapshot.docs[0].data();
        const currentSections = docData.sections || [];
        const newSection = sectionName;

        await setDoc(docRef, {
          location: selectedLocation,
          sections: [...currentSections, newSection],
        }, { merge: true });

        setModalMessage("Section added successfully!");
      } else {
        // No document with the same location exists
        await addDoc(sectionsCollection, {
          location: selectedLocation,
          sections: [sectionName],
        });

        setModalMessage("Section saved successfully!");
      }

      setIsModalOpen(true);
      setSectionName("");
      setSelectedLocation("");
    } catch (error) {
      console.error("Error adding document: ", error);
      setModalMessage("Failed to save section. Please try again.");
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchLocations();
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const fetchUserData = async () => {
    const loggedInUserData = JSON.parse(localStorage.getItem("userData"));
    if (loggedInUserData) {
      const usersCollection = collection(interimDb, "users");
      const userDocs = await getDocs(usersCollection);
      const users = userDocs.docs.map((doc) => ({ ...doc.data() }));

      const currentUser = users.find(
        (user) => user.email === loggedInUserData.email
      );
      setLoggedInUser(currentUser || loggedInUserData);
    }
  };

  const fetchLocations = async () => {
    try {
      const locationsCollection = collection(rentmobileDb, "unit");
      const q = searchTerm
        ? query(
            locationsCollection,
            where("name", ">=", searchTerm),
            where("name", "<=", searchTerm + "\uf8ff")
          )
        : locationsCollection;
      const locationsSnapshot = await getDocs(q);
      const locationsList = locationsSnapshot.docs.map((doc) => ({
        ...doc.data(),
      }));
      setLocations(locationsList);
    } catch (error) {
      console.error("Error fetching locations: ", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/login");
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
                 <Title>
                   <Logo src={CarbonLogo} alt="Carbon Logo" />
                   <div>Add Section</div>
                 </Title>
               </AppBar>
        <br></br>
        <br></br>

        <FormContainer>
          <h3>Add New Section</h3>

          <InputField>
            <input
              type="text" // Allow letters and numbers
              required
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder=" "
            />
            <label htmlFor="sectionName">Section Name</label>
          </InputField>

          <InputField>
            <DropdownField
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              required
            >
              <option value="" disabled>
                Select Location
              </option>
              {locations.map((location) => (
                <option key={location.name} value={location.name}>
                  {location.name}
                </option>
              ))}
            </DropdownField>
            <label htmlFor="location">Assign Location</label>
          </InputField>

          <SaveButton onClick={handleSaveSection}>Save Section</SaveButton>
          {isModalOpen && (
            <Modal>
              <ModalContent>
                <CloseButton onClick={closeModal} aria-label="Close modal">
                  ×
                </CloseButton>
                <h3>{modalMessage}</h3>
                <button onClick={closeModal}>Close</button>
              </ModalContent>
            </Modal>
          )}
        </FormContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
