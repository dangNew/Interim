import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEye,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config"; // Import the correct firestore instance
import IntSidenav from "./IntSidenav";
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt, FaEye, FaEdit, FaTrash} from "react-icons/fa";

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

const Container = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 1rem;
    color: #333333;
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

const AddButton = styled.button`
  background-color: #008000;
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }
`;

const Dropdown = styled.select`
  margin-left: 1rem;
  padding: 0.6rem 1.2rem;
  border: 1px solid #ffa500; /* Orange border */
  border-radius: 8px;
  font-size: 1rem;
  font-family: "Inter", sans-serif;
  cursor: pointer;
  background-color: #ffa500; /* Orange background */
  color: #ffffff; /* White text */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, border-color 0.3s ease;

  &:hover {
    background-color: #ff8c00; /* Darker orange on hover */
    border-color: #ff8c00;
  }

  &:focus {
    outline: none;
    border-color: #ff6700; /* Focus border color */
    box-shadow: 0 0 4px rgba(255, 103, 0, 0.6); /* Orange glow */
  }

  option {
    color: #333; /* Text color for options */
    background-color: #ffffff; /* White background for dropdown items */
  }
`;

const SearchBar = styled.input`
  margin-left: 1rem;
  padding: 0.6rem 1.2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  font-family: "Inter", sans-serif;
  cursor: pointer;
  background-color: #ffffff; /* White background */
  color: #333; /* Black text */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, border-color 0.3s ease;
  flex: 1; /* Make the search bar take available space */

  &:hover {
    background-color: #e0e0e0; /* Light gray on hover */
    border-color: #aaa;
  }

  &:focus {
    outline: none;
    border-color: #66afe9; /* Focus border color */
    box-shadow: 0 0 4px rgba(102, 175, 233, 0.6); /* Blue glow */
  }
`;

const Title = styled.h3`
  color: #333;
  margin-bottom: 2rem;
  font-family: "Inter", sans-serif;
  font-weight: bold;
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const UnitCard = styled.div`
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const UnitName = styled.h4`
  margin: 0;
  color: #007bff;
  font-size: 1.2rem;
  font-weight: bold;
`;

const UnitDetails = styled.p`
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background-color: ${({ color }) => color || "#007bff"};
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: ${({ hoverColor }) => hoverColor || "#0056b3"};
    transform: scale(1.05);
  }
`;

const ModalContainer = styled.div`
  display: ${({ show }) => (show ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  visibility: ${({ show }) => (show ? "visible" : "hidden")};
  opacity: ${({ show }) => (show ? "1" : "0")};
`;

const ModalContent = styled.div`
  background-color: #ffffff;
  padding: 2rem 2.5rem;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  text-align: left;
  width: 400px;
  position: relative;
  max-width: 90%;
  font-family: "Arial", sans-serif;

  h3 {
    color: #333;
    font-size: 1.6rem;
    margin-bottom: 1rem;
    font-weight: 600;
    text-align: center;
  }

  p {
    color: #333;
    font-size: 1rem;
    margin-bottom: 0.8rem;
    line-height: 1.6;
    text-align: left;
  }

  button {
    background-color: #2c6b2f;
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: background-color 0.3s ease, transform 0.2s ease;
    margin-top: 1.5rem;
    font-weight: bold;
    display: block;
    width: 100%;
    text-align: center;

    &:hover {
      background-color: #244f23;
      transform: translateY(-2px);
    }

    &:active {
      background-color: #1d3e1b;
      transform: translateY(0);
    }
  }

  hr {
    border: 0;
    height: 1px;
    background: #ddd;
    margin: 1.5rem 0;
  }
`;

const EditModalContent = styled.div`
  background-color: #ffffff;
  padding: 2rem 2.5rem;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  text-align: left;
  width: 400px;
  position: relative;
  max-width: 90%;
  font-family: "Arial", sans-serif;

  h3 {
    color: #333;
    font-size: 1.6rem;
    margin-bottom: 1rem;
    font-weight: 600;
    text-align: center;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: bold;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  button {
    background-color: #2c6b2f;
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: background-color 0.3s ease, transform 0.2s ease;
    margin-top: 1.5rem;
    font-weight: bold;
    display: block;
    width: 100%;
    text-align: center;

    &:hover {
      background-color: #244f23;
      transform: translateY(-2px);
    }

    &:active {
      background-color: #1d3e1b;
      transform: translateY(0);
    }
  }

  hr {
    border: 0;
    height: 1px;
    background: #ddd;
    margin: 1.5rem 0;
  }
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [sections, setSections] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [editMode, setEditMode] = useState(false);
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
  const [editedSection, setEditedSection] = useState({
    section: "",
    unit: "",
  });
  const navigate = useNavigate();

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDropdownToggle = (dropdown) => {
    setIsDropdownOpen((prevState) => ({
      ...prevState,
      [dropdown]: !prevState[dropdown],
    }));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchSections = async () => {
    try {
      const sectionsCollection = collection(rentmobileDb, "section");
      const sectionsSnapshot = await getDocs(sectionsCollection);
      const sectionsList = sectionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Remove the filter for exactly 2 sections
      setSections(sectionsList);
    } catch (error) {
      console.error("Error fetching sections: ", error);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [searchTerm]);

  const handleViewSection = (section) => {
    setSelectedSection(section);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSection(null);
    setEditMode(false);
    setEditedSection({
      section: "",
      unit: "",
    });
  };

  const deleteSection = async (id) => {
    try {
      await deleteDoc(doc(rentmobileDb, "section", id));
      fetchSections(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting section: ", error);
    }
  };

  const handleEditSection = (section) => {
    setSelectedSection(section);
    setEditedSection(section);
    setEditMode(true);
    setShowModal(true);
  };

  const handleUpdateSection = async () => {
    try {
      const sectionRef = doc(rentmobileDb, "section", selectedSection.id);
      await updateDoc(sectionRef, editedSection);
      fetchSections(); // Refresh the list after update
      closeModal();
    } catch (error) {
      console.error("Error updating section: ", error);
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

    fetchUserData(); // Fetch user data
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem("userData");
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
        <br></br>

        <Container>
          <div style={{ display: "flex", alignItems: "center" }}>
            <AddButton onClick={() => navigate("/addsection")}>
              <FontAwesomeIcon
                icon={faPlus}
                style={{ marginRight: "0.5rem" }}
              />
              Add New Section
            </AddButton>
            <SearchBar
              type="text"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <Title>Section Management</Title>
          <CardContainer>
            {sections.map((section) => (
              <UnitCard key={section.id}>
                <UnitName>{section.section}</UnitName>
                <UnitDetails>Location: {section.location}</UnitDetails>
                <UnitDetails>Sections: {section.sections.join(", ")}</UnitDetails>
                <ActionButtons>
                  <ActionButton
                    color="#007bff"
                    hoverColor="#0056b3"
                    onClick={() => handleViewSection(section)} // Open modal with section details
                  >
                    <FaEye /> View
                  </ActionButton>
                  <ActionButton
                    color="#ffc107"
                    hoverColor="#e0a800"
                    onClick={() => handleEditSection(section)}
                  >
                    <FaEdit /> Edit
                  </ActionButton>
                  <ActionButton
                    color="#dc3545"
                    hoverColor="#c82333"
                    onClick={() => deleteSection(section.id)}
                  >
                    <FaTrash /> Delete
                  </ActionButton>
                </ActionButtons>
              </UnitCard>
            ))}
          </CardContainer>

          {/* Modal Section */}
          {showModal && (
            <ModalContainer show={showModal}>
              <ModalContent>
                {editMode ? (
                  <EditModalContent>
                    <h3>Edit Section</h3>
                    <label>Section</label>
                    <input
                      type="text"
                      value={editedSection.section}
                      onChange={(e) =>
                        setEditedSection({
                          ...editedSection,
                          section: e.target.value,
                        })
                      }
                    />
                    <label>Location</label>
                    <input
                      type="text"
                      value={editedSection.location}
                      onChange={(e) =>
                        setEditedSection({
                          ...editedSection,
                          location: e.target.value,
                        })
                      }
                    />
                    <label>Sections</label>
                    <input
                      type="text"
                      value={editedSection.sections.join(", ")}
                      onChange={(e) =>
                        setEditedSection({
                          ...editedSection,
                          sections: e.target.value.split(", "),
                        })
                      }
                    />
                    <hr />
                    <button onClick={handleUpdateSection}>Update</button>
                    <button onClick={closeModal}>Cancel</button>
                  </EditModalContent>
                ) : (
                  <>
                    <h3>Section Details</h3>
                    <p>
                      <strong>Section:</strong> {selectedSection.section}
                    </p>
                    <p>
                      <strong>Location:</strong> {selectedSection.location}
                    </p>
                    <p>
                      <strong>Sections:</strong> {selectedSection.sections.join(", ")}
                    </p>
                    <hr />
                    <button onClick={closeModal}>Close</button>
                  </>
                )}
              </ModalContent>
            </ModalContainer>
          )}
        </Container>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
