import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faList,
  faPlus,
  faIdBadge,
  faMagnifyingGlass,
  faHouseChimney,
  faUsers,
  faUser,
  faTriangleExclamation,
  faEye,
  faCircleUser,
} from "@fortawesome/free-solid-svg-icons";
import { FaSignOutAlt } from "react-icons/fa";
import {
  collection,
  addDoc,
  setDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { interimStorage as storage } from "../components/firebase.config";
import { rentmobileDb, rentmobileAuth } from "../components/firebase.config";
import { serverTimestamp } from "firebase/firestore";
import IntSidenav from "./IntSidenav";

library.add(
  faList,
  faPlus,
  faUser,
  faIdBadge,
  faMagnifyingGlass,
  faHouseChimney,
  faUsers,
  faTriangleExclamation,
  faEye,
  faCircleUser,
  faBars,
  FaSignOutAlt
);

const AddUser = styled.div`
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

const Divider = styled.hr`
  border: 2;
  height: 1px;
  background-color: #dee2e6;
  margin: 10px 0;
  width: 150%;
`;

const FormContainer = styled.form`
  display: grid;
  gap: 1.5rem;
  background: #fff;
  border: 2px solid #ddd;
  padding: 1rem;
  border-radius: 20px;
  max-width: 98%;
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

const ImagePreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 2px dashed #ddd;
  border-radius: 10px;
  background-color: #f9f9f9;
  max-width: 300px;
  width: 100%;

  .image-preview {
    height: 200px;
    width: 200px;
    background-color: #e0e0e0;
    border: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    color: gray;
    margin-top: 5px;

    img {
      max-height: 100%;
      max-width: 100%;
      object-fit: cover;
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

const ContactNumberInput = styled.div`
  display: flex;
  align-items: center;

  .country-code {
    padding: 0.5rem;
    border-radius: 4px 0 0 4px;
    border: 1px solid #ddd;
    border-right: none;
    background-color: #f0f0f0;
    color: #333;
  }

  input {
    padding: 0.5rem;
    border-radius: 0 4px 4px 0;
    border: 1px solid #ddd;
    width: calc(100% - 60px); /* Adjust width to accommodate country code */
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  input[type="checkbox"] {
    width: 14px;
    height: 14px;
    margin-right: 8px;
  }

  label {
    font-size: 14px;
  }
`;

const NewUnit = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const sidebarRef = useRef(null);
  const [isPositionActive, setIsPositionActive] = useState(false); // State for Toggle Switch
  const [contactNumWarning, setContactNumWarning] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    userManagement: false,
    addUnit: false,
    appraise: false,
    contract: false,
    ticket: false,
    manageZone: false,
    manageSpace: false,
  });
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    contactNum: "",
    email: "",
    password: "",
    address: "",
    position: [],
    location: "",
    Image: null,
    status: "Active",
  });

  const [locations, setLocations] = useState([]);

  const togglePositionSwitch = () => {
    setIsPositionActive((prevState) => !prevState);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const checkAndCreateCollection = async () => {
      const collectionName = "admin_users"; // Replace with your desired collection name
      const usersCollection = collection(rentmobileDb, collectionName);
      const userDocs = await getDocs(usersCollection);

      // If the collection is empty, we can assume it doesn't exist
      if (userDocs.empty) {
        console.log(`Collection '${collectionName}' was created.`);
      } else {
        console.log(`Collection '${collectionName}' already exists.`);
      }
    };

    checkAndCreateCollection(); // Call the function
  }, []);

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
    const fetchLocations = async () => {
      const unitsCollection = collection(rentmobileDb, "unit");
      const unitDocs = await getDocs(unitsCollection);
      const unitNames = unitDocs.docs.map((doc) => doc.data().name);
      setLocations(unitNames);
    };

    fetchLocations();
  }, []);

  const handleDropdownToggle = (dropdown) => {
    setIsDropdownOpen((prevState) => ({
      ...prevState,
      [dropdown]: !prevState[dropdown],
    }));
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

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/login");
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === "contactNum") {
      // Only allow digits and limit to 10 characters (excluding country code)
      const numericValue = value.replace(/\D/g, ""); // Remove any non-numeric characters
      if (numericValue.length <= 10) {
        setUserData((prevState) => ({
          ...prevState,
          [id]: `+63${numericValue}`,
        }));

        // Set warning if contactNum is not exactly 10 digits (excluding country code)
        if (numericValue.length !== 10) {
          setContactNumWarning(
            "Contact number must be exactly 10 digits (excluding country code)."
          );
        } else {
          setContactNumWarning(""); // Clear warning if length is valid
        }
      }
    } else {
      setUserData((prevState) => ({
        ...prevState,
        [id]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
      setUserData((prevState) => ({
        ...prevState,
        Image: file,
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      position: checked
        ? [...prevState.position, value]
        : prevState.position.filter((pos) => pos !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !userData.email ||
      !userData.password ||
      !/\S+@\S+\.\S+/.test(userData.email)
    ) {
      alert("Please provide a valid email and password.");
      return;
    }
    if (
      !userData.firstName ||
      !userData.lastName ||
      !userData.contactNum ||
      !userData.address
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    // Check if the password is unique
    const usersCollection = collection(rentmobileDb, "admin_users");
    const passwordQuery = query(
      usersCollection,
      where("password", "==", userData.password)
    );
    const passwordDocs = await getDocs(passwordQuery);
    if (!passwordDocs.empty) {
      alert("The password must be unique.");
      return;
    }

    // Check if the contact number starts with the Philippines country code and is exactly 11 digits
    if (
      !userData.contactNum.startsWith("+63") ||
      userData.contactNum.length !== 13
    ) {
      alert(
        "The contact number must start with the Philippines country code (+63) and be exactly 11 digits long."
      );
      return;
    }

    // Check if there is already a user with the position "Office In Charge" in the selected location
    const positionQuery = query(
      usersCollection,
      where("position", "array-contains", "Office In Charge"),
      where("location", "==", userData.location)
    );
    const positionDocs = await getDocs(positionQuery);
    if (!positionDocs.empty) {
      alert(
        "There is already a user with the position 'Office In Charge' in the selected location."
      );
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        rentmobileAuth,
        userData.email,
        userData.password
      );
      const user = userCredential.user;

      const { password, ...userWithoutPassword } = userData;

      let imageUrl = "";
      if (userData.Image) {
        try {
          const imageRef = ref(storage, "images/" + userData.Image.name);
          await uploadBytes(imageRef, userData.Image);
          imageUrl = await getDownloadURL(imageRef);
        } catch (error) {
          console.error("Error uploading image:", error);
          alert("Failed to upload image. Please try again.");
          return;
        }
      }

      await setDoc(doc(rentmobileDb, "admin_users", user.uid), {
        ...userWithoutPassword,
        Image: imageUrl,
        status: userData.status || "Active",
        createdAt: serverTimestamp(),
      });

      alert("User added successfully!");
      setUserData({
        firstName: "",
        lastName: "",
        middleName: "",
        contactNum: "",
        email: "",
        password: "",
        address: "",
        position: [],
        location: "",
        Image: null,
        status: "Active",
      });
      setImagePreviewUrl(null);

      // Redirect to UserManagement.js
      navigate("/usermanagement");
    } catch (error) {
      console.error("Error adding user: ", error);
      if (error.code === "auth/email-already-in-use") {
        alert("The email address is already in use.");
      } else if (error.code === "auth/weak-password") {
        alert("The password is too weak.");
      } else {
        alert("Failed to add user. Please try again.");
      }
    }
  };

  return (
    <>
      <AddUser>
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
                id="firstName"
                type="text"
                value={userData.firstName}
                onChange={handleChange}
                placeholder="Enter First Name"
              />
            </div>
            <div className="form-section">
              <label htmlFor="middleName">Middle Name</label>
              <input
                id="middleName"
                type="text"
                value={userData.middleName}
                onChange={handleChange}
                placeholder="Enter Middle Name"
              />
            </div>
            <div className="form-section">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={userData.lastName}
                onChange={handleChange}
                placeholder="Enter Last Name"
              />
            </div>
            <div className="form-section">
              <label htmlFor="contactNum">Contact Number</label>
              <ContactNumberInput>
                <span className="country-code">+63</span>
                <input
                  type="text"
                  id="contactNum"
                  value={userData.contactNum.replace("+63", "")}
                  onChange={handleChange}
                  placeholder="Enter 10-digit contact number"
                />
              </ContactNumberInput>
              {contactNumWarning && (
                <p style={{ color: "red" }}>{contactNumWarning}</p>
              )}
              {/* Other form elements */}
            </div>
            <span></span>
            <div className="section-title">Login Details</div>
            <Divider /> {/* Add the horizontal line here */}
            <span></span>
            <div className="form-section">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={userData.email}
                onChange={handleChange}
                placeholder="Enter Email"
              />
            </div>
            <div className="form-section">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={userData.password}
                onChange={handleChange}
                placeholder="Enter Password"
              />
            </div>
            <span></span>
            <span></span>
            <div className="section-title">Other Details</div>
            <Divider /> {/* Add the horizontal line here */}
            <span></span>
            <div className="form-section">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                type="text"
                value={userData.address}
                onChange={handleChange}
                placeholder="Enter Address"
              />
            </div>
            <div className="form-section">
              <label htmlFor="location">Assign Unit</label>
              <select
                id="location"
                value={userData.location}
                onChange={handleChange}
              >
                <option value="">Select Location</option>
                {locations.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-section">
              <label htmlFor="position">Position</label>
              <CheckboxContainer>
                <label>
                  <input
                    type="checkbox"
                    value="Select all"
                    checked={userData.position.length === 6}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setUserData((prevState) => ({
                          ...prevState,
                          position: [
                            "Admin",
                            "Collector",
                            "Office In Charge",
                            "Enforcer",
                            "CTO",
                            "Interim",
                          ],
                        }));
                      } else {
                        setUserData((prevState) => ({
                          ...prevState,
                          position: [],
                        }));
                      }
                    }}
                  />
                  Select all
                </label>
              </CheckboxContainer>
              <CheckboxContainer>
                <label>
                  <input
                    type="checkbox"
                    value="Admin"
                    checked={userData.position.includes("Admin")}
                    onChange={handleCheckboxChange}
                  />
                  Admin
                </label>
              </CheckboxContainer>
              <CheckboxContainer>
                <label>
                  <input
                    type="checkbox"
                    value="Collector"
                    checked={userData.position.includes("Collector")}
                    onChange={handleCheckboxChange}
                  />
                  Collector
                </label>
              </CheckboxContainer>
              <CheckboxContainer>
                <label>
                  <input
                    type="checkbox"
                    value="Office In Charge"
                    checked={userData.position.includes("Office In Charge")}
                    onChange={handleCheckboxChange}
                  />
                  Office In Charge
                </label>
              </CheckboxContainer>
              <CheckboxContainer>
                <label>
                  <input
                    type="checkbox"
                    value="Enforcer"
                    checked={userData.position.includes("Enforcer")}
                    onChange={handleCheckboxChange}
                  />
                  Enforcer
                </label>
              </CheckboxContainer>
              <CheckboxContainer>
                <label>
                  <input
                    type="checkbox"
                    value="CTO"
                    checked={userData.position.includes("CTO")}
                    onChange={handleCheckboxChange}
                  />
                  CTO
                </label>
              </CheckboxContainer>
              <CheckboxContainer>
                <label>
                  <input
                    type="checkbox"
                    value="Interim"
                    checked={userData.position.includes("Interim")}
                    onChange={handleCheckboxChange}
                  />
                  Interim
                </label>
              </CheckboxContainer>
            </div>
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
            <div className="form-section">
              <label htmlFor="Image">Upload Image:</label>
              <input type="file" id="Image" onChange={handleFileChange} />
              <div className="image-preview">
                {imagePreviewUrl ? (
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  "No file chosen"
                )}
              </div>
            </div>
            <div className="button-group">
              <button className="cancel" type="button">
                Cancel
              </button>
              <button type="submit">Save</button>
            </div>
          </FormContainer>
        </MainContent>
      </AddUser>
    </>
  );
};

export default NewUnit;
