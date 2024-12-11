import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FaBars,
  FaSearch,
  FaUserCircle,
  FaSignOutAlt,
  FaCamera,
} from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { rentmobileDb } from "../components/firebase.config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import {
  faHome,
  faShoppingCart,
  faUser,
  faSearch,
  faPlus,
  faUsers,
  faFileContract,
  faCog,
  faTicketAlt,
  faClipboard,
  faCheck,
  faPlusCircle,
  faCogs,
} from "@fortawesome/free-solid-svg-icons";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import SideNav from "./side_nav";

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
  background-color: #188423; /* Updated color */
  color: white;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  font-size: 22px;
  font-family: "Inter", sans-serif; /* Use a professional font */
  font-weight: bold; /* Apply bold weight */
`;

const FormContainer = styled.div`
  flex: 3;
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e9ecef;
  font-family: "Arial", sans-serif;

  h3 {
    font-size: 1.75rem;
    color: #343a40;
    margin-bottom: 1.5rem;
    text-align: left;
    font-weight: 700;
  }

  form {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    margin-bottom: 2rem;
  }

  label {
    display: block;
    font-size: 1rem;
    color: #495057;
    font-weight: 600;
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
      box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
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
    transition: background-color 0.3s, transform 0.2s;

    &:hover {
      background-color: #0056b3;
      transform: scale(1.05);
    }
  }

  .form-section {
    margin-bottom: 1.5rem;
    padding: 1.5rem;
    border-radius: 8px;
    background-color: #e9ecef;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .section-title {
    font-size: 1.25rem;
    color: #007bff;
    margin-bottom: 1rem;
    text-align: center;
    font-weight: 600;
  }
`;

const SmallContainer = styled.div`
  flex: 1;
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 50%;
  background-color: #f8f9fa;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
  max-width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ced4da;
  position: relative;

  img {
    max-width: 100%;
    max-height: 100%;
    border-radius: 50%;
  }
`;

const CameraIcon = styled(FaCamera)`
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 24px;
  color: #007bff;
  cursor: pointer;

  &:hover {
    color: #0056b3;
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

const InputField = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
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

const SaveButton = styled.button`
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #45a049;
  }
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState({
    userManagement: false,
    addUnit: false,
    appraise: false,
    contract: false,
    ticket: false,
    manageZone: false,
    manageSpace: false,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    position: "",
  });
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [fileInputKey] = useState(Date.now());
  const [newImage, setNewImage] = useState(null);

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

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setNewImage(file);
  };

  const saveChanges = async () => {
    if (newImage && loggedInUser) {
      try {
        setIsUploading(true);

        // Firebase Storage reference
        const storage = getStorage();
        const storageRef = ref(
          storage,
          `profileImages/${loggedInUser.id}/${newImage.name}`
        );

        // Upload the file to Firebase Storage
        await uploadBytes(storageRef, newImage);

        // Get the file's download URL
        const imageUrl = await getDownloadURL(storageRef);

        // Update the user's Firestore document with the new image URL
        const userDocRef = doc(rentmobileDb, "admin_users", loggedInUser.id);
        await updateDoc(userDocRef, { Image: imageUrl });

        setUserData((prevData) => ({
          ...prevData,
          Image: imageUrl,
        }));
        setIsUploading(false);

        alert("Image updated successfully!");
      } catch (error) {
        console.error("Error updating image:", error);
        setIsUploading(false);
      }
    } else {
      alert("Please select an image first.");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewImage(URL.createObjectURL(file)); // Create a local URL for the selected file
    }
  };

  const handleIconClick = () => {
    // Trigger the file input click
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleEditClick = () => {
    setIsEditing(true); // Enable editing mode
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (loggedInUser) {
      try {
        const userRef = doc(rentmobileDb, "admin_users", loggedInUser.id);
        await updateDoc(userRef, userData);
        setLoggedInUser((prevUser) => ({ ...prevUser, ...userData }));
        setIsEditing(false); // Disable editing mode
      } catch (error) {
        console.error("Error updating document: ", error);
      }
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
        setUserData(currentUser || loggedInUserData);
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
      <SideNav isSidebarOpen={isSidebarOpen} loggedInUser={loggedInUser} />
      <ToggleButton onClick={toggleSidebar}>
        <FaBars />
      </ToggleButton>
      <MainContent isSidebarOpen={isSidebarOpen}>
        <AppBar>
          <ToggleButton isSidebarOpen={isSidebarOpen} onClick={toggleSidebar}>
            <FaBars />
          </ToggleButton>
          <div>{loggedInUser?.name || "Profile"}</div>
        </AppBar>

        <FormContainer>
          <h3>Edit User Details</h3>
          <SmallContainer>
            <img
              src={newImage || userData.Image || "defaultProfileImage.jpg"}
              alt="Profile"
            />
            <input
              type="file"
              id="fileInput"
              key={fileInputKey}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <FaUserCircle className="profile-icon" onClick={handleIconClick} />
            <CameraIcon onClick={handleIconClick} />
          </SmallContainer>{" "}
          <br></br>
          <form>
            <div className="form-section">
              <div className="section-title">Personal Information</div>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={userData.firstName}
                onChange={handleInputChange}
              />
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={userData.lastName}
                onChange={handleInputChange}
              />
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-section">
              <div className="section-title">Job Information</div>
              <label htmlFor="position">Position</label>
              <input
                type="text"
                id="position"
                name="position"
                value={userData.position}
                onChange={handleInputChange}
              />
            </div>

            <SaveButton onClick={saveChanges} disabled={isUploading}>
              {isUploading ? "Saving..." : "Save Changes"}
            </SaveButton>
          </form>
        </FormContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
