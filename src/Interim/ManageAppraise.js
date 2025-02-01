import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { HiPlusCircle, HiXCircle } from "react-icons/hi";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config";
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
  padding: 4rem;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  max-width: 700px;
  margin: 2rem auto;
  font-family: "Roboto", sans-serif;

  h3 {
    margin-bottom: 2rem;
    color: #343a40;
    font-size: 26px;
    font-weight: 700;
    text-align: center;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 1rem;
  }

  button {
    display: inline-block;
    margin-top: 1rem;
    padding: 10px 20px;
    border: none;
    background-color: #007bff;
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #0056b3;
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
    }
  }
`;

const InputField = styled.div`
  position: relative;
  margin-bottom: 30px;

  input,
  select {
    width: 100%;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    outline: none;
    box-sizing: border-box;
    font-size: 16px;
  }

  label {
    position: absolute;
    top: -12px;
    left: 10px;
    background: white;
    padding: 0 5px;
    font-size: 1rem;
    font-weight: bold;
    color: black;
  }
`;

const RateSizeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 15px;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  background-color: #28a745;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.3);
  }
`;

const AddIcon = styled(HiPlusCircle)`
  font-size: 40px;
  color: #007bff;
  cursor: pointer;
  margin-left: 10px;
  margin-top: -25px;
  position: relative;
  transition: color 0.3s;

  &:hover {
    color: #0056b3;
  }
`;

const DeleteIcon = styled(HiXCircle)`
  font-size: 40px;
  color: #ff4d4d;
  cursor: pointer;
  margin-left: 10px;
  margin-top: -25px;
  position: relative;
  transition: color 0.3s;

  &:hover {
    color: #0056b3;
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
  padding: 20px;
  border-radius: 5px;
  text-align: center;
`;

const CloseButton = styled.span`
  cursor: pointer;
  color: red;
  font-size: 20px;
  float: right;
`;

const WideContainer = styled.div`
  width: 100%;
  padding: 2rem;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  margin-top: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h4 {
    margin-bottom: 1rem;
    color: #343a40;
    font-size: 18px;
    font-weight: 600;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    background-color: #ffffff;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const InvisibleTable = styled.table`
  display: none;
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
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
  const [goodsName, setGoodsName] = useState("");
  const [unitMeasure, setUnitMeasure] = useState("");
  const [location, setLocation] = useState("");
  const [rateSizePairs, setRateSizePairs] = useState([
    { rate_1: "", size_1: "" },
  ]);
  const [locations, setLocations] = useState([]);

  const exampleUnitsOfMeasure = [
    "Kilograms (kg)",
    "Liters (L)",
    "Meters (m)",
    "Pieces (pcs)",
    "Boxes",
    "Bags",
    "Bottles",
    "Cans",
    "Cartons",
    "Dozens",
  ];

  const addRateSizePair = () => {
    setRateSizePairs([
      ...rateSizePairs,
      {
        [`rate_${rateSizePairs.length + 1}`]: "",
        [`size_${rateSizePairs.length + 1}`]: "",
      },
    ]);
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

  const removeRateSizePair = (index) => {
    const updatedPairs = rateSizePairs.filter((_, i) => i !== index);
    setRateSizePairs(updatedPairs);
  };

  const handleRateSizeChange = (index, field, value) => {
    const updatedPairs = rateSizePairs.map((pair, i) =>
      i === index ? { ...pair, [field]: value } : pair
    );
    setRateSizePairs(updatedPairs);
  };

  const handleSaveAppraisal = async () => {
    try {
      await addDoc(collection(rentmobileDb, "appraisal_rate"), {
        goods_name: goodsName,
        location: location,
        unit_measure: unitMeasure,
        rate_size_pairs: rateSizePairs.map((pair, index) => ({
          [`rate_${index + 1}`]: parseFloat(pair[`rate_${index + 1}`]), // Convert to number
          [`size_${index + 1}`]: pair[`size_${index + 1}`],
        })),
      });
      setModalMessage("Appraisal data saved successfully!");
      setIsModalOpen(true);

      setGoodsName("");
      setLocation("");
      setUnitMeasure("");
      setRateSizePairs([{ rate_1: "", size_1: "" }]);
    } catch (error) {
      setModalMessage("Error saving appraisal data");
      setIsModalOpen(true);
      console.error("Error saving appraisal data:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/login");
  };

  const fetchLocations = async () => {
    const unitsCollection = collection(rentmobileDb, "unit");
    const unitDocs = await getDocs(unitsCollection);
    const unitNames = unitDocs.docs.map((doc) => doc.data().name);
    setLocations(unitNames);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

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
                    <div>Add Appraisal</div>
                  </Title>
                </AppBar>
        <br></br>
        <br></br>

        <FormContainer>
          <h3>Add Appraisal Data</h3>

          <InputField>
            <input
              type="text"
              value={goodsName}
              onChange={(e) => setGoodsName(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="goodsName">Goods Name</label>
          </InputField>

          <InputField>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            >
              <option value="" disabled>
                Select Location
              </option>
              {locations.map((loc, index) => (
                <option key={index} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <label htmlFor="location">Location</label>
          </InputField>

          {rateSizePairs.map((pair, index) => (
            <RateSizeContainer key={index}>
              <InputField>
                <input
                  type="text" // Allow text input
                  placeholder={`Rate ${index + 1}`}
                  value={pair[`rate_${index + 1}`]}
                  onChange={(e) =>
                    handleRateSizeChange(
                      index,
                      `rate_${index + 1}`,
                      e.target.value
                    )
                  }
                />
                <label htmlFor={`rate_${index + 1}`}>Rate {index + 1}</label>
              </InputField>

              <InputField>
                <input
                  type="text"
                  value={pair[`size_${index + 1}`]}
                  onChange={(e) =>
                    handleRateSizeChange(
                      index,
                      `size_${index + 1}`,
                      e.target.value
                    )
                  }
                  placeholder=" "
                  required
                />
                <label htmlFor={`size_${index + 1}`}>Size {index + 1}</label>
              </InputField>

              {index === 0 && (
                <AddIcon onClick={addRateSizePair} title="Add Rate/Size Pair" />
              )}
              {index > 0 && (
                <DeleteIcon
                  onClick={() => removeRateSizePair(index)}
                  title="Remove Rate/Size Pair"
                />
              )}
            </RateSizeContainer>
          ))}

          <InputField>
            <input
              type="text"
              value={unitMeasure}
              onChange={(e) => setUnitMeasure(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="unitMeasure">Unit Measure</label>
          </InputField>

          <SaveButton onClick={handleSaveAppraisal}>
            Save Appraisal Data
          </SaveButton>

          {isModalOpen && (
            <Modal>
              <ModalContent>
                <CloseButton
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close modal"
                >
                  ×
                </CloseButton>
                <p>{modalMessage}</p>
                <button onClick={() => setIsModalOpen(false)}>Close</button>
              </ModalContent>
            </Modal>
          )}
        </FormContainer>

        <WideContainer>
          <h4>Example Units of Measure</h4>
          <ul>
            {exampleUnitsOfMeasure.map((unit, index) => (
              <li key={index}>{unit}</li>
            ))}
          </ul>
          <InvisibleTable>
            <thead>
              <tr>
                <th>Unit of Measure</th>
              </tr>
            </thead>
            <tbody>
              {exampleUnitsOfMeasure.map((unit, index) => (
                <tr key={index}>
                  <td>{unit}</td>
                </tr>
              ))}
            </tbody>
          </InvisibleTable>
        </WideContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
