import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, query, where } from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config";
import SideNav from "./side_nav";
import { FaBars, FaEye, FaStore, FaFilter, FaSearch } from "react-icons/fa";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  display: flex;
  height: 100vh;
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
  padding: 10px 20px;
  background-color: #188423;
  color: white;
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

const SummaryContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

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

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: calc(100% - 30px);
  font-size: 16px;
  color: #333;
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

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #188423;
  font-size: 1.5rem;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
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

const Loading = styled.div`
  text-align: center;
  margin: 20px;
`;

const ListOfStalls = () => {
  const [stalls, setStalls] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const unitsRef = collection(rentmobileDb, "unit");
        const querySnapshot = await getDocs(unitsRef);
        const locationList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return { location: data.location, name: data.name };
        });
        setLocations(locationList);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    const fetchStalls = async () => {
      try {
        const stallsRef = collection(rentmobileDb, "Stall");
        const querySnapshot = await getDocs(stallsRef);
        const stallList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStalls(stallList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stalls:", error);
        setLoading(false);
      }
    };

    const fetchLoggedInUser = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData) {
        setLoggedInUser(userData);
      }
    };

    const fetchBillingConfig = async () => {
      try {
        const billingConfigQuery = query(
          collection(rentmobileDb, "billingconfig"),
          where("title", "==", "RateperMeter")
        );
        const billingConfigSnapshot = await getDocs(billingConfigQuery);
        if (!billingConfigSnapshot.empty) {
          const ratePerMeterData = billingConfigSnapshot.docs[0].data();
          setStalls((prevStalls) =>
            prevStalls.map((stall) => ({
              ...stall,
              ratePerMeter: `${ratePerMeterData.type1}${ratePerMeterData.value1}`,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching billing config:", error);
      }
    };

    fetchLoggedInUser();
    fetchStalls();
    fetchLocations();
    fetchBillingConfig();
  }, []);

  const toggleLocationDropdown = () => {
    setIsLocationDropdownOpen(!isLocationDropdownOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleView = (id) => {
    navigate(`/occupied/${id}`);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const calculateDailyPayment = (stall) => {
    const ratePerMeter =
      parseFloat(stall.ratePerMeter?.replace("₱", "") || "0") || 0;
    const stallSize = parseFloat(stall.stallSize) || 0;
    return (ratePerMeter * stallSize).toFixed(2);
  };

  const filteredStalls = stalls
    .filter(
      (stall) =>
        stall.status === "Occupied" &&
        (locationFilter === "" ||
          stall.location.trim().toLowerCase() ===
            locationFilter.trim().toLowerCase()) &&
        (loggedInUser
          ? stall.location.trim().toLowerCase() ===
            loggedInUser.location.trim().toLowerCase()
          : true) &&
        (stall.stallNumber.includes(searchTerm) ||
          stall.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (a.status === "Available" && b.status !== "Available") return -1; // "Available" comes first
      if (a.status !== "Available" && b.status === "Available") return 1; // "Occupied" comes last
      return 0; // Maintain the relative order if both are the same status
    });

  if (loading) {
    return <Loading>Loading...</Loading>;
  }

  return (
    <Container>
      <SideNav isSidebarOpen={isSidebarOpen} loggedInUser={loggedInUser} />
      <ToggleButton onClick={toggleSidebar}>
        <FaBars />
      </ToggleButton>
      <MainContent isSidebarOpen={isSidebarOpen}>
        <AppBar>
          <ToggleButton isSidebarOpen={isSidebarOpen} onClick={toggleSidebar}>
            <FaBars />
          </ToggleButton>
          <h1>List of Stalls</h1>
        </AppBar>

        <FormContainer>
          <SummaryContainer>
            <ControlsContainer>
              <p>{filteredStalls.length} Stalls</p>
              <SearchBarContainer>
                <FaSearch color="#333" />
                <SearchInput
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </SearchBarContainer>
            </ControlsContainer>
          </SummaryContainer>

          <TableContainer>
            <table>
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Stall Number</th>
                  <th>Daily Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStalls.map((stall) => (
                  <tr key={stall.id}>
                    <td>{stall.location}</td>
                    <td>{stall.stallNumber}</td>
                    <td>₱{calculateDailyPayment(stall)}</td>
                    <td>
                      <ActionButton onClick={() => handleView(stall.id)}>
                        <FaEye />
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableContainer>
        </FormContainer>
      </MainContent>
    </Container>
  );
};

export default ListOfStalls;
