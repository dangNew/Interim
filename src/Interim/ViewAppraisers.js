import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaArrowLeft } from "react-icons/fa"; // Importing back icon
import { collection, query, where, getDocs } from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config";
import IntSidenav from "./IntSidenav";
import CarbonLogo from '../CarbonLogo/472647195_1684223168803549_1271657271156175542_n.jpg';


// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
`;


const BackButton = styled.button`
  display: flex;
  align-items: center;
  background-color: #28a745; /* Green background */
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-family: "Inter", sans-serif;
  font-weight: bold;
  margin-bottom: 1rem;

  &:hover {
    background-color: #218838; /* Darker green */
  }

  svg {
    margin-right: 10px;
  }
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

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 1rem 0;
  padding: 1.5rem;
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  background-color: #e9f5e9; /* Light green background */
  border-left: 5px solid #28a745;
  border: 1px solid #cce7cc;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.3);
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.2rem;
  font-size: 17px;
  color: #333;

  span {
    margin-left: 14px;
    font-weight: normal;
    color: #555;
  }

  &:before {
    content: "●";
    color: #28a745;
    margin-right: 8px;
    font-size: 12px;
  }
`;

const TotalCollectedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1.5rem 0;
  padding: 1.5rem;
  width: 100%;
  max-width: 200px; /* Adjusted max-width */
  border-radius: 16px;
  background-color: #e9f5e9; /* Light green background */
  border-left: 5px solid #28a745;
  border: 1px solid #cce7cc;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.3);
  }
`;

const TotalCollectedTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: black;
  font-weight: bold;
  text-align: center;
  width: 100%;
`;

const TotalCollectedValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #28a745; /* Green color */
  margin-bottom: 1rem;
`;

const CompletedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1.5rem 0.5rem; /* Adjusted margin */
  padding: 1rem;
  width: 100%;
  max-width: 100px; /* Small container */
  border-radius: 16px;
  background-color: #e9f5e9; /* Light green background */
  border-left: 5px solid #28a745;
  border: 1px solid #cce7cc;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.3);
  }
`;

const CompletedTitle = styled.h4`
  margin-bottom: 0.5rem;
  color: black;
  font-weight: bold;
  text-align: center;
  width: 100%;
`;

const CompletedValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
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
  }
`;

const ViewAppraisers = () => {
  const { vendorId } = useParams();
  const [appraisalData, setAppraisalData] = useState([]);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  // Fetch appraisal data from Firestore
  const fetchAppraisalData = async () => {
    try {
      const appraisalsCollection = collection(rentmobileDb, "appraisals");
      const q = query(appraisalsCollection, where("vendorId", "==", vendorId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const appraisals = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          created_date: doc.data().created_date
            ? new Date(doc.data().created_date.seconds * 1000)
            : null, // Convert timestamp to Date
        }));
        setAppraisalData(appraisals);
      } else {
        setError("No documents found for the specified vendor ID!");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data: " + error.message);
    }
  };

  // Fetch logged-in user data
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

  useEffect(() => {
    fetchAppraisalData();
    fetchUserData();
  }, [vendorId]);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (appraisalData.length === 0) {
    return <div>Loading...</div>;
  }

  // Calculate total collected amount
  const totalCollected = appraisalData.reduce(
    (total, appraisal) => total + appraisal.total_amount,
    0
  );

  // Calculate total collected amount within the day
  const today = new Date();
  const totalCollectedToday = appraisalData
    .filter((appraisal) => {
      const createdDate = new Date(appraisal.created_date);
      return (
        createdDate.getDate() === today.getDate() &&
        createdDate.getMonth() === today.getMonth() &&
        createdDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((total, appraisal) => total + appraisal.total_amount, 0);

  // Calculate total collected amount within the week
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const totalCollectedWeek = appraisalData
    .filter((appraisal) => {
      const createdDate = new Date(appraisal.created_date);
      return createdDate >= startOfWeek && createdDate <= today;
    })
    .reduce((total, appraisal) => total + appraisal.total_amount, 0);

  // Calculate total collected amount within the month
  const startOfMonth = new Date(today);
  startOfMonth.setDate(1);
  const totalCollectedMonth = appraisalData
    .filter((appraisal) => {
      const createdDate = new Date(appraisal.created_date);
      return createdDate >= startOfMonth && createdDate <= today;
    })
    .reduce((total, appraisal) => total + appraisal.total_amount, 0);

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
                    <div>View Appraisers</div>
                  </Title>
                </AppBar>
                <br></br>
        <br></br>
        <br></br>

        <BackButton onClick={handleBack}>
          <FaArrowLeft /> Back
        </BackButton>


        <div
          style={{
            display: "flex",
            gap: "1rem", /* Reduced gap */
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <InfoContainer>
            {/* Title for the Info Container, centered */}
            <TotalCollectedTitle>
              VENDOR INFORMATION
            </TotalCollectedTitle>

            {/* Display Vendor ID */}
            <InfoItem>
              <strong>Vendor ID:</strong> <span>{vendorId}</span>
            </InfoItem>

            {/* Check if there is appraisal data and display appraiser details */}
            {appraisalData.length > 0 && (
              <>
                {/* Display Appraiser Email */}
                <InfoItem>
                  <strong>Appraiser Email:</strong> <span>{appraisalData[0].appraiser_email}</span>
                </InfoItem>

                {/* Display Appraiser Unit */}
                <InfoItem>
                  <strong>Appraiser Unit:</strong> <span>{appraisalData[0].appraisal_assign}</span>
                </InfoItem>
              </>
            )}
          </InfoContainer>

          <div style={{ display: "flex", gap: "1rem" }}>
            <TotalCollectedContainer>
              <TotalCollectedTitle>
                TOTAL COLLECTED
              </TotalCollectedTitle>
              <TotalCollectedValue>
                ₱{totalCollected.toLocaleString()}
              </TotalCollectedValue>
            </TotalCollectedContainer>

            <CompletedContainer>
              <CompletedTitle>Today</CompletedTitle>
              <CompletedValue>
                ₱{totalCollectedToday.toLocaleString()}
              </CompletedValue>
            </CompletedContainer>

            <CompletedContainer>
              <CompletedTitle>This Week</CompletedTitle>
              <CompletedValue>
                ₱{totalCollectedWeek.toLocaleString()}
              </CompletedValue>
            </CompletedContainer>

            <CompletedContainer>
              <CompletedTitle>This Month</CompletedTitle>
              <CompletedValue>
                ₱{totalCollectedMonth.toLocaleString()}
              </CompletedValue>
            </CompletedContainer>
          </div>
        </div>

        <FormContainer>
          <table>
            <thead>
              <tr>
                <th>Created Date</th>
                <th>App Size</th>
                <th>Goods Name</th>
                <th>Quantity</th>
                <th>Unit Measure</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {appraisalData.map((appraisal) => (
                <tr key={appraisal.id}>
                  <td>
                    {appraisal.created_date
                      ? new Intl.DateTimeFormat("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }).format(appraisal.created_date)
                      : "N/A"}
                  </td>
                  <td>{appraisal.app_size}</td>
                  <td>{appraisal.goods_name}</td>
                  <td>{appraisal.quantity}</td>
                  <td>{appraisal.unit_measure}</td>
                  <td>{appraisal.total_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </FormContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default ViewAppraisers;
