import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config";
import styled from "styled-components";
import IntSidenav from "./IntSidenav";

// Styled Components
const AddNewStallContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f5f7;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "70px")};
  padding-left: 40px;
  background-color: #fff;
  padding: 2rem;
  width: 100%;
  transition: margin-left 0.3s ease;
  overflow-y: auto;

  & > *:not(:first-child) {
    margin-top: 20px;
  }
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
  font-family: "Inter", sans-serif; /* Use a professional font */
  font-weight: bold; /* Apply bold weight */
`;

const FormContainer = styled.div`
  margin-top: 20px;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  max-width: 800px;
  margin: 0 auto; /* Center the container */

  h2 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
`;

const StyledInput = styled.input`
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  background-color: #fff;
  transition: all 0.3s ease;

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 4px rgba(0, 123, 255, 0.3);
    outline: none;
  }
`;

const StyledSelect = styled.select`
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  background-color: #fff;
  transition: all 0.3s ease;

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 4px rgba(0, 123, 255, 0.3);
    outline: none;
  }
`;

const SectionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const SectionItem = styled.div`
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #007bff;
    box-shadow: 0 0 4px rgba(0, 123, 255, 0.3);
  }

  &.selected {
    background-color: #007bff;
    color: #fff;
  }
`;

const StyledButton = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  background-color: #007bff;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorText = styled.p`
  color: #dc3545;
  font-size: 14px;
  margin-top: -10px;
`;

// Modal Component
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  width: 400px;
  text-align: center;
`;

const ModalButton = styled.button`
  margin-top: 1rem;
  padding: 10px 20px;
  background-color: #188423;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    background-color: #0e5e14;
  }
`;

const AddNewStall = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [locations, setLocations] = useState([]);
  const [location, setLocation] = useState("");
  const [stallNumber, setStallNumber] = useState("");
  const [stallSize, setStallSize] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [sections, setSections] = useState([]); // New state for sections
  const [selectedSection, setSelectedSection] = useState(""); // New state for selected section
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsCollectionRef = collection(rentmobileDb, "unit");
        const snapshot = await getDocs(locationsCollectionRef);
        const fetchedLocations = snapshot.docs.map((doc) => doc.data().name);
        setLocations(fetchedLocations);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const sectionsCollectionRef = collection(rentmobileDb, "section");
        const q = query(
          sectionsCollectionRef,
          where("location", "==", location)
        );
        const snapshot = await getDocs(q);
        const fetchedSections = snapshot.docs
          .map((doc) => doc.data().sections)
          .flat();
        setSections(fetchedSections);
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    };

    if (location) {
      fetchSections();
    } else {
      setSections([]);
    }
  }, [location]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleStallSizeChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setStallSize(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericStallSize = parseFloat(stallSize.trim());

    try {
      const stallsCollectionRef = collection(rentmobileDb, "Stall");
      const q = query(
        stallsCollectionRef,
        where("stallNumber", "==", stallNumber),
        where("location", "==", location)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError("Stall number already exists in this location.");
        return;
      }

      await addDoc(stallsCollectionRef, {
        location,
        stallNumber,
        stallSize: numericStallSize,
        status: "Available",
        section: selectedSection, // Add the selected section
      });

      setLocation("");
      setStallNumber("");
      setStallSize("");
      setSelectedSection(""); // Reset the selected section
      setError("");
      setIsModalOpen(true); // Show modal on success
    } catch (error) {
      console.error("Error adding document: ", error);
      setError("Error submitting form: " + error.message);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate(0); // Refresh the current page
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSidebarOpen(false);
    }
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
    <AddNewStallContainer>
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

        <FormContainer>
          <h2>Add Stall</h2>
          <form onSubmit={handleSubmit}>
            <StyledInput
              type="text"
              placeholder="Stall Number"
              value={stallNumber}
              onChange={(e) => setStallNumber(e.target.value)}
              required
            />
            <StyledInput
              type="text"
              placeholder="Stall Size (Meter)"
              value={stallSize}
              onChange={handleStallSizeChange}
              required
            />
            <StyledSelect
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            >
              <option value="" disabled>
                Select Location
              </option>
              {loading ? (
                <option disabled>Loading locations...</option>
              ) : (
                locations.map((loc, index) => (
                  <option key={index} value={loc}>
                    {loc}
                  </option>
                ))
              )}
            </StyledSelect>
            <SectionContainer>
              {sections.map((section, index) => (
                <SectionItem
                  key={index}
                  className={selectedSection === section ? "selected" : ""}
                  onClick={() => setSelectedSection(section)}
                >
                  {section}
                </SectionItem>
              ))}
            </SectionContainer>
            {error && <ErrorText>{error}</ErrorText>}
            <StyledButton type="submit">Add Stall</StyledButton>
          </form>
        </FormContainer>

        {isModalOpen && (
          <ModalOverlay>
            <ModalContent>
              <h2>Stall added successfully!</h2>
              <ModalButton onClick={closeModal}>OK</ModalButton>
            </ModalContent>
          </ModalOverlay>
        )}
      </MainContent>
    </AddNewStallContainer>
  );
};

export default AddNewStall;
