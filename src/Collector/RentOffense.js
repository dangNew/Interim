import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {

  FaSearch,
  
  FaPrint,
  
  FaExclamationTriangle,
} from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  
  faCheck
} from "@fortawesome/free-solid-svg-icons";
import { collection, getDocs, query, where } from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config";

import SidenavCollector from "./SidenavCollector";
import NoticeModal from "../Interim/NoticeModal";
import CollectorViolationModal from "./CollectorViolationModal"; // Corrected import path
import OffensePaid from "./OffensePaid"; // Import the OffensePaid modal

const ROWS_PER_PAGE = 10;

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
  font-size: 22px;
  font-family: "Inter", sans-serif;
  font-weight: bold;
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
    font-size: 12px;

    th,
    td {
      padding: 10px;
      text-align: left;
      border-bottom: 2px solid #dee2e6;
    }

    th {
      background-color: #e9ecef;
      color: #000; /* Change to black */
      font-weight: bold;
    }

    tr:nth-child(even) {
      background-color: #f2f2f2;
    }

    tr:nth-child(odd) {
      background-color: #ffffff;
    }

    tr:hover {
      background-color: #f1f3f5;
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

const SearchBarCont = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ced4da;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
  margin: 30px 0;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const SearchIcon = styled(FaSearch)`
  color: #6c757d;
  font-size: 1.2em;
`;

const SearchIn = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
  font-size: 1em;
  color: #495057;

  ::placeholder {
    color: #adb5bd;
  }

  &:focus {
    color: #212529;
  }
`;

const DateSearchBarCont = styled(SearchBarCont)`
  margin-left: 10px;
  width: 60%;
`;

const TopBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PrintButton = styled.button`
  background-color: #188423;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  height: 48px; /* Same height as search bars */
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  &:hover {
    background-color: #155724;
  }

  svg {
    margin-right: 5px;
  }
`;

const DropdownButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  height: 48px; /* Same height as search bars */
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  &:hover {
    background-color: #155724;
  }

  svg {
    margin-right: 5px;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled.div`
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  position: absolute;
  background-color: #f1f1f1;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
`;

const DropdownItem = styled.div`
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  cursor: pointer;

  &:hover {
    background-color: #ddd;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
`;

const PageButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 1.1rem;
  min-width: 50px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }

  &:disabled {
    background-color: #c3c3c3;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    padding: 10px 14px;
    font-size: 1rem;
  }
`;

const CurrentPageIndicator = styled.span`
  margin: 0 8px;
  font-size: 1.2rem;
  color: #333;
`;

const ViewButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0056b3; /* Blue color on hover */
  }
`;

const ViolationButton = styled.button`
  background-color: ${({ hasViolation }) =>
    hasViolation ? "#ff4d4d" : "#ddd"};
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ hasViolation }) =>
      hasViolation ? "#e63939" : "#ccc"}; /* Red color on hover */
  }
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stallHolders, setStallHolders] = useState([]);
  const sidebarRef = useRef(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filteredStallHolders, setFilteredStallHolders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [stallNoFilter, setStallNoFilter] = useState("");
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("Select Unit");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateSearchTerm, setDateSearchTerm] = useState(""); // State for date search term
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStallHolder, setSelectedStallHolder] = useState(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false); // State for ViolationModal
  const [selectedViolation, setSelectedViolation] = useState(null); // State for selected violation
  const [isOffensePaidModalOpen, setIsOffensePaidModalOpen] = useState(false); // State for OffensePaidModal
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleView = (stallHolder) => {
    setSelectedStallHolder(stallHolder);
    setIsModalOpen(true);
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
    setIsDropdownOpen(false);
    setFilteredStallHolders(
      unit === "All"
        ? stallHolders
        : stallHolders.filter((stall) => stall.location === unit)
    );
  };

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const querySnapshot = await getDocs(collection(rentmobileDb, "unit"));
        const unitData = querySnapshot.docs.map((doc) => doc.data().name);
        setUnits(["All", ...unitData]);
      } catch (error) {
        console.error("Error fetching units:", error);
      }
    };

    fetchUnits();
  }, []);

  const totalPages = Math.ceil(filteredStallHolders.length / itemsPerPage);
  const currentStallHolders = filteredStallHolders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
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

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(
        collection(rentmobileDb, "approvedVendors")
      );
      const data = querySnapshot.docs.map((doc) => {
        const stallInfo = doc.data().stallInfo || {};
        const dateOfRegistration = doc.data().dateOfRegistration
          ? doc.data().dateOfRegistration.toDate().toLocaleDateString()
          : "";

        return {
          id: doc.id,
          stallNumber: stallInfo.stallNumber || "",
          firstName: doc.data().firstName || "",
          lastName: doc.data().lastName || "",
          location: stallInfo.location || "",
          areaMeters: stallInfo.stallSize || "",
          billing: stallInfo.ratePerMeter || "",
          date: dateOfRegistration,
          approvedBy: doc.data().approvedBy || "",
          contactNumber: doc.data().contactNumber || "",
          email: doc.data().email || "",
        };
      });

      const checkViolation = async (vendorId) => {
        try {
          const violationCollection = collection(
            rentmobileDb,
            "Market_violations"
          );
          const q = query(
            violationCollection,
            where("vendorId", "==", vendorId)
          );
          const querySnapshot = await getDocs(q);
          return querySnapshot.size; // Return the count of documents
        } catch (error) {
          console.error("Error checking violation:", error);
          return 0;
        }
      };

      const dataWithChecks = await Promise.all(
        data.map(async (stall) => {
          const violationCount = await checkViolation(stall.id);
          return { ...stall, violationCount };
        })
      );

      const vendorsWithViolations = dataWithChecks.filter(
        (stall) => stall.violationCount > 0
      );

      setStallHolders(vendorsWithViolations);
      setTotalUsers(vendorsWithViolations.length);

      let filteredData = vendorsWithViolations;

      if (selectedUnit !== "Select Unit") {
        filteredData = filteredData.filter(
          (stall) => stall.location === selectedUnit
        );
      }

      setFilteredStallHolders(filteredData);
    };

    fetchData();
  }, [selectedUnit]);

  useEffect(() => {
    if (selectedUnit === "All") {
      setFilteredStallHolders(stallHolders);
    } else if (selectedUnit !== "Select Unit") {
      setFilteredStallHolders(
        stallHolders.filter((stall) => stall.location === selectedUnit)
      );
    }
  }, [selectedUnit, stallHolders]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedStallHolder(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDateSearchChange = (event) => {
    setDateSearchTerm(event.target.value);
  };

  useEffect(() => {
    let filteredData = stallHolders.filter((stall) =>
      (stall.firstName + " " + stall.lastName)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    if (dateSearchTerm) {
      filteredData = filteredData.filter(
        (stall) => stall.date === dateSearchTerm
      );
    }

    if (stallNoFilter) {
      filteredData = filteredData.filter(
        (stall) => stall.stallNumber === stallNoFilter
      );
    }
    if (selectedUnit !== "Select Unit") {
      filteredData = filteredData.filter(
        (stall) => stall.location === selectedUnit
      );
    }

    setFilteredStallHolders(filteredData);
  }, [searchTerm, dateSearchTerm, stallHolders, stallNoFilter, selectedUnit]);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/login");
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Print</title>
          <style>
            body {
              font-family: 'Arial, sans-serif';
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            .container {
              width: 100%;
              margin: 20px auto;
              padding: 20px;
              background: #fff;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              text-align: center;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 12px;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f2f2f2;
              color: #333;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            tr:hover {
              background-color: #f1f1f1;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #777;
            }
            .divider {
              border-top: 1px dotted #333;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>CARBON MARKET</h1>
            <div class="divider"></div>
            <table>
              <thead>
                <tr>
                  <th>Stall No.</th>
                  <th>Stall Holder</th>
                  <th>Email</th>
                  <th>Unit</th>
                  <th>Area (Meters)</th>
                  <th>Date</th>
                  <th>Contact Number</th>
                  <th>Violation</th>
                </tr>
              </thead>
              <tbody>
                ${filteredStallHolders
                  .map(
                    (stall) => `
                    <tr>
                      <td>${stall.stallNumber}</td>
                      <td>${stall.firstName} ${stall.lastName}</td>
                      <td>${stall.email}</td>
                      <td>${stall.location}</td>
                      <td>${stall.areaMeters}</td>
                      <td>${stall.date}</td>
                      <td>${stall.contactNumber}</td>
                      <td>
                        ${
                          stall.violationCount > 0
                            ? `<span style="color: red;">Violation (${stall.violationCount})</span>`
                            : "No Violation"
                        }
                      </td>
                    </tr>
                  `
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="footer">
              Printed on: ${new Date().toLocaleDateString()}
            </div>
          </div>
        </body>
      </html>
    `;

    const newWindow = window.open("", "_blank");
    newWindow.document.write(printContent);
    newWindow.document.close();
    newWindow.print();
    newWindow.close();
  };

  useEffect(() => {
    try {
      const loggedInUserData = JSON.parse(localStorage.getItem("userData"));
      if (loggedInUserData) {
        const currentUser = stallHolders.find(
          (user) => user.email === loggedInUserData.email
        );
        setLoggedInUser(currentUser || loggedInUserData);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [stallHolders]);

  const handleMainContentClick = () => {
    setIsSidebarOpen(false);
  };

  const handleNotice = (vendorId) => {
    setSelectedNotice(vendorId);
    setIsNoticeModalOpen(true);
  };

  const handleNoticeModalClose = () => {
    setIsNoticeModalOpen(false);
    setSelectedNotice(null);
  };

  const handleViolation = (vendorId) => {
    setSelectedViolation(vendorId);
    setIsViolationModalOpen(true);
  };

  const handleViolationModalClose = () => {
    setIsViolationModalOpen(false);
    setSelectedViolation(null);
  };

  const handleMarkAsPaid = (vendorId) => {
    setSelectedStallHolder(vendorId);
    setIsOffensePaidModalOpen(true);
  };

  const handleOffensePaidModalClose = () => {
    setIsOffensePaidModalOpen(false);
    setSelectedStallHolder(null);
  };

  return (
    <DashboardContainer>
      <div ref={sidebarRef}>
        <SidenavCollector
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
          <div className="title">LIST OF STALLHOLDER</div>
        </AppBar>

        <FormContainer>
          <TopBarContainer>
            <SearchBarCont>
              <SearchIcon />
              <SearchIn
                type="text"
                placeholder="Search Stall Holders..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </SearchBarCont>
            <DateSearchBarCont>
              <SearchIcon />
              <SearchIn
                type="date"
                placeholder="Search by Date..."
                value={dateSearchTerm}
                onChange={handleDateSearchChange}
              />
            </DateSearchBarCont>
            <ButtonContainer>
              <PrintButton onClick={handlePrint}>
                <FaPrint />
                Print
              </PrintButton>
              <DropdownContainer>
                <DropdownButton onClick={handleDropdownToggle}>
                  {selectedUnit}
                </DropdownButton>
                <DropdownContent isOpen={isDropdownOpen}>
                  {units.map((unit, index) => (
                    <DropdownItem
                      key={index}
                      onClick={() => handleUnitSelect(unit)}
                    >
                      {unit}
                    </DropdownItem>
                  ))}
                </DropdownContent>
              </DropdownContainer>
            </ButtonContainer>
          </TopBarContainer>
          <table>
            <thead>
              <tr>
                <th>Stall No.</th>
                <th>Stall Holder</th>
                <th>Email</th>
                <th>Unit</th>
                <th>Area </th>
                <th>Date</th>
                <th>Contact Number</th>
                <th>Violation</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStallHolders.map((stall, index) => (
                <tr key={index}>
                  <td>{stall.stallNumber}</td>
                  <td>
                    {stall.firstName} {stall.lastName}
                  </td>
                  <td>{stall.email}</td>
                  <td>{stall.location}</td>
                  <td>{stall.areaMeters}</td>
                  <td>{stall.date}</td>
                  <td>{stall.contactNumber}</td>
                  <td>
                    {stall.violationCount > 0 ? (
                      <ViolationButton
                        hasViolation={true}
                        onClick={() => handleViolation(stall.id)}
                      >
                        <FaExclamationTriangle style={{ marginRight: "6px" }} />
                        Violation ({stall.violationCount})
                      </ViolationButton>
                    ) : (
                      "No Violation"
                    )}
                  </td>
                  <td className="actions">
                    <ViewButton onClick={() => handleMarkAsPaid(stall.id)}>
                      <FontAwesomeIcon icon={faCheck} /> Mark As Paid
                    </ViewButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FormContainer>

        <PaginationContainer>
          <PageButton onClick={handlePrevPage} disabled={currentPage === 1}>
            Prev
          </PageButton>
          <CurrentPageIndicator>
            Page {currentPage} of {totalPages}
          </CurrentPageIndicator>
          <PageButton
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </PageButton>
        </PaginationContainer>

        <NoticeModal
          isOpen={isNoticeModalOpen}
          onClose={handleNoticeModalClose}
          vendorId={selectedNotice}
        />
        <CollectorViolationModal
          isOpen={isViolationModalOpen}
          onClose={handleViolationModalClose}
          vendorId={selectedViolation}
        />
        <OffensePaid
          isOpen={isOffensePaidModalOpen}
          onClose={handleOffensePaidModalClose}
          vendorId={selectedStallHolder}
        />
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
