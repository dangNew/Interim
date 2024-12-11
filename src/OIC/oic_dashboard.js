import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FaBars,
  FaUsers,
  FaHourglassHalf,
  FaStore,
  FaPencilAlt,
  FaSearch,
} from "react-icons/fa";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config";
import SideNav from "./side_nav";
import ReactSwitch from "react-switch";

const DashboardContainer = styled.div`
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
`;

const AppBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #188423;
  color: white;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  font-size: 18px;
  font-family: "Inter", sans-serif;
  font-weight: bold;
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

const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatBox = styled.div`
  background-color: ${({ bgColor }) => bgColor || "#f4f4f4"};
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #ddd;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
  }

  h3 {
    margin: 0;
    font-size: 1.2rem;
    color: white;
  }

  p {
    font-size: 2rem;
    margin: 0;
    font-weight: bold;
    color: white;
  }

  @media (max-width: 768px) {
    padding: 1rem;

    h3 {
      font-size: 1rem;
    }

    p {
      font-size: 1.6rem;
    }
  }
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-top: 20px;

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

    .actions {
      display: flex;
      gap: 5px;
    }

    .action-button {
      display: flex;
      align-items: center;
      border: none;
      background: none;
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: #0056b3;
      }

      .icon {
        font-size: 24px;
        color: black;
      }
    }
  }
`;

const SummaryContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;

  h3 {
    margin: 0;
    font-size: 22px;
    font-weight: bold;
    color: #188423;
  }

  p {
    margin: 0;
    color: #888;
    font-size: 18px;
    margin-right: 5px;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 20px;
  width: 250px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

    // Striped rows
    tr:nth-child(even) {
      background-color: #f2f2f2; // Light gray for even rows
    }

    tr:nth-child(odd) {
      background-color: #ffffff; // White for odd rows
    }

    .actions {
      display: flex;
      gap: 5px; /* Space between the buttons */
    }

    .action-button {
      display: flex;
      align-items: center;
      border: none;
      background: none;
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: #0056b3; /* Darken on hover */
      }

      .icon {
        font-size: 24px; /* Increase icon size */
        color: black;
      }
    }
  }
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: calc(100% - 30px);
  font-size: 16px;
  color: #333;
`;

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    if (onSearch) {
      onSearch(event.target.value);
    }
  };

  return (
    <SearchBarContainer>
      <FaSearch color="#333" />
      <SearchInput
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
      />
    </SearchBarContainer>
  );
};

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [totalVendors, setTotalVendors] = useState(0);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [vacantStallsCount, setVacantStallsCount] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [stallHolders, setStallHolders] = useState([]);
  const [filteredStallHolders, setFilteredStallHolders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const loggedInUserData = JSON.parse(localStorage.getItem("userData"));
        const userLocation = loggedInUserData?.location || "";

        const vendorsQuery = query(
          collection(rentmobileDb, "approvedVendors"),
          where("stallInfo.location", "==", userLocation)
        );
        const querySnapshot = await getDocs(vendorsQuery);
        const vendorsCount = querySnapshot.size;
        setTotalVendors(vendorsCount);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    fetchVendors();
  }, []);

  useEffect(() => {
    const fetchPendingApproval = async () => {
      try {
        const loggedInUserData = JSON.parse(localStorage.getItem("userData"));
        const userLocation = loggedInUserData?.location || "";

        const pendingQuery = query(
          collection(rentmobileDb, "Vendorusers"),
          where("status", "==", "pending"),
          where("stallInfo.location", "==", userLocation)
        );
        const querySnapshot = await getDocs(pendingQuery);
        const pendingCount = querySnapshot.size;
        setPendingApprovalCount(pendingCount);
      } catch (error) {
        console.error("Error fetching pending approval:", error);
      }
    };

    fetchPendingApproval();
  }, []);

  useEffect(() => {
    const fetchVacantStalls = async () => {
      try {
        const loggedInUserData = JSON.parse(localStorage.getItem("userData"));
        const userLocation = loggedInUserData?.location || "";

        const vacantQuery = query(
          collection(rentmobileDb, "Stall"),
          where("status", "==", "Available"),
          where("location", "==", userLocation)
        );
        const querySnapshot = await getDocs(vacantQuery);
        const vacantCount = querySnapshot.size;
        setVacantStallsCount(vacantCount);
      } catch (error) {
        console.error("Error fetching vacant stalls:", error);
      }
    };

    fetchVacantStalls();
  }, []);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        const loggedInUserData = JSON.parse(localStorage.getItem("userData"));
        const userLocation = loggedInUserData?.location || "";

        const recentQuery = query(
          collection(rentmobileDb, "approvedVendors"),
          where("status", "==", "accepted"),
          where("stallInfo.location", "==", userLocation),
          orderBy("approvedAt", "desc"),
          limit(5)
        );
        const querySnapshot = await getDocs(recentQuery);
        const recentUsersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecentUsers(recentUsersData);
      } catch (error) {
        console.error("Error fetching recent users:", error);
      }
    };

    fetchRecentUsers();
  }, []);

  useEffect(() => {
    const fetchStallHolders = async () => {
      const loggedInUserData = JSON.parse(localStorage.getItem("userData"));
      const userLocation = loggedInUserData?.location || "";

      const querySnapshot = await getDocs(
        query(
          collection(rentmobileDb, "approvedVendors"),
          where("stallInfo.location", "==", userLocation),
          limit(5)
        )
      );
      const data = querySnapshot.docs.map((doc) => {
        const stallInfo = doc.data().stallInfo || {};
        const dateOfRegistration = doc.data().dateOfRegistration
          ? doc.data().dateOfRegistration.toDate().toLocaleDateString()
          : "";
        return {
          id: doc.id,
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,
          stallNumber: stallInfo.stallNumber || "",
          location: stallInfo.location || "",
          dateOfRegistration,
          status: doc.data().status || "accepted", // Include the status field
        };
      });
      setStallHolders(data);
      setFilteredStallHolders(data);
    };

    fetchStallHolders();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(rentmobileDb, "Vendorusers")
        );
        const allUsers = querySnapshot.docs.map((doc) => doc.data());
        const validUsers = allUsers.filter(
          (user) => user.email && user.firstName && user.lastName
        );

        const loggedInUserData = JSON.parse(localStorage.getItem("userData"));
        if (loggedInUserData) {
          const currentUser = allUsers.find(
            (user) => user.email === loggedInUserData.email
          );
          setLoggedInUser(currentUser || loggedInUserData);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (term) => {
    const filtered = stallHolders.filter(
      (stall) =>
        stall.firstName.toLowerCase().includes(term.toLowerCase()) ||
        stall.lastName.toLowerCase().includes(term.toLowerCase()) ||
        stall.stallNumber.includes(term)
    );
    setFilteredStallHolders(filtered);
  };

  const handleEditClick = (stallId) => {
    navigate(`/edit-vendors/${stallId}`);
  };

  const handleStatusChange = async (stallId, isActive) => {
    const status = isActive ? "accepted" : "inactive";
    const stallRef = doc(rentmobileDb, "approvedVendors", stallId);
    await updateDoc(stallRef, { status });
    setStallHolders((prevStallHolders) =>
      prevStallHolders.map((stall) =>
        stall.id === stallId ? { ...stall, status } : stall
      )
    );
    setFilteredStallHolders((prevStallHolders) =>
      prevStallHolders.map((stall) =>
        stall.id === stallId ? { ...stall, status } : stall
      )
    );
  };

  return (
    <DashboardContainer>
      <SideNav isSidebarOpen={isSidebarOpen} loggedInUser={loggedInUser} />
      <ToggleButton onClick={toggleSidebar}>
        <FaBars />
      </ToggleButton>
      <MainContent isSidebarOpen={isSidebarOpen}>
        <AppBar>
          <h1>Office in Charge</h1>
        </AppBar>
        <br></br>
        <StatsContainer>
          <StatBox bgColor="#5c6bc0" onClick={() => navigate("/vendors")}>
            <h3>Total Vendors</h3>
            <p>{totalVendors}</p>
            <div className="icon-container">
              <FaUsers
                className="fading-icon"
                style={{
                  fontSize: "30px",
                  opacity: 0.5,
                  animation: "fade 2s infinite alternate",
                }}
              />
            </div>
          </StatBox>
          <StatBox
            bgColor="#42a5f5"
            onClick={() => navigate("/vendor-verification")}
          >
            <h3>Pending Approval</h3>
            <p>{pendingApprovalCount}</p>
            <div className="icon-container">
              <FaHourglassHalf
                className="fading-icon"
                style={{
                  fontSize: "30px",
                  opacity: 0.5,
                  animation: "fade 2s infinite alternate",
                }}
              />
            </div>
          </StatBox>
          <StatBox bgColor="#66bb6a" onClick={() => navigate("/available")}>
            <h3>Vacant Stalls</h3>
            <p>{vacantStallsCount}</p>
            <div className="icon-container">
              <FaStore
                className="fading-icon"
                style={{
                  fontSize: "30px",
                  opacity: 0.5,
                  animation: "fade 2s infinite alternate",
                }}
              />
            </div>
          </StatBox>
        </StatsContainer>

        <FormContainer>
          <h3>Recent Approved Vendors</h3>
          <SummaryContainer>
            <ControlsContainer>
              <p>{filteredStallHolders.length} Vendors</p>
              <SearchBar onSearch={handleSearch} />
            </ControlsContainer>
          </SummaryContainer>
          <TableContainer>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Stall Number</th>
                  <th>Date of Registration</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStallHolders.map((stallHolder) => (
                  <tr key={stallHolder.id}>
                    <td>{`${stallHolder.firstName} ${stallHolder.lastName}`}</td>
                    <td>{stallHolder.stallNumber}</td>
                    <td>{stallHolder.dateOfRegistration}</td>
                    <td>{stallHolder.location}</td>
                    <td className="actions">
                      <div className="action-button">
                        <ReactSwitch
                          onChange={(checked) =>
                            handleStatusChange(stallHolder.id, checked)
                          }
                          checked={stallHolder.status === "accepted"}
                          uncheckedIcon={false}
                          checkedIcon={false}
                          handleDiameter={20}
                        />
                      </div>
                      <div
                        className="action-button"
                        onClick={() => handleEditClick(stallHolder.id)}
                      >
                        <FaPencilAlt
                          className="icon"
                          style={{ color: "green" }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableContainer>
        </FormContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
