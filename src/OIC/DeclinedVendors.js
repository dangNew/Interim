import React, { useState, useEffect } from "react";
import { FaSearch, FaBars, FaEye } from "react-icons/fa";
import styled from "styled-components";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config";
import SideNav from "./side_nav";
import { Button } from "@mui/material";

import { useNavigate } from "react-router-dom";
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

  & > *:not(:first-child) {
    margin-top: 20px;
  }
`;

const AppBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 50px;
  background-color: #188423;
  color: white;
  font-size: 22px;
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

const AddVendorButton = styled.button`
  background-color: #188423;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #146c1f;
  }
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

const DeclinedVendors = () => {
  const [declinedVendors, setDeclinedVendors] = useState([]);
  const [filteredDeclinedVendors, setFilteredDeclinedVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = declinedVendors.filter(
      (vendor) =>
        vendor.firstName.toLowerCase().includes(term.toLowerCase()) ||
        vendor.lastName.toLowerCase().includes(term.toLowerCase()) ||
        vendor.stallNumber.includes(term)
    );
    setFilteredDeclinedVendors(filtered);
  };

  const handleViewClick = (vendorId) => {
    navigate(`/view-vendor/${vendorId}`);
  };

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData) {
        setLoggedInUser(userData);
      }
    };

    fetchLoggedInUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const loggedInUserData = JSON.parse(localStorage.getItem("userData"));
      const userLocation = loggedInUserData?.location || "";

      const querySnapshot = await getDocs(
        query(
          collection(rentmobileDb, "declinedVendors"),
          where("stallInfo.location", "==", userLocation)
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
          status: doc.data().status || "declined", // Include the status field
        };
      });
      setDeclinedVendors(data);
      setFilteredDeclinedVendors(data);
    };

    fetchData();
  }, []);

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
          <div>{loggedInUser?.name || "List of Declined Vendors"}</div>

          <Button onClick={() => navigate(-1)} sx={{ color: "white" }}>
            Back
          </Button>
        </AppBar>
        <FormContainer>
          <SummaryContainer>
            <ControlsContainer>
              <p>{filteredDeclinedVendors.length} Vendors</p>
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
                {filteredDeclinedVendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>{`${vendor.firstName} ${vendor.lastName}`}</td>
                    <td>{vendor.stallNumber}</td>
                    <td>{vendor.dateOfRegistration}</td>
                    <td>{vendor.location}</td>
                    <td className="actions">
                      <div
                        className="action-button"
                        onClick={() => handleViewClick(vendor.id)}
                      >
                        <FaEye className="icon" />
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

export default DeclinedVendors;
