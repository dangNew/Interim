import React, { useState, useEffect } from 'react';
import { FaSearch, FaBars, FaEye } from 'react-icons/fa';
import styled from 'styled-components';
import SideNav from './side_nav';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { rentmobileDb } from '../components/firebase.config'; // Ensure you have this configuration

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f5f7;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '70px')};
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
  font-family: 'Inter', sans-serif;
  font-weight: bold;
`;

const ToggleButton = styled.div`
  display: block;
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

    th, td {
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
  const [searchTerm, setSearchTerm] = useState('');

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

const AddVendorButton = styled.button`
  background-color: blue;
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

const ViolationReports = () => {
  const [violations, setViolations] = useState([]);
  const [filteredViolations, setFilteredViolations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = violations.filter(violation =>
      (violation.vendorName.toLowerCase().includes(term.toLowerCase()) ||
      violation.stallNumber.includes(term) ||
      violation.violationType.toLowerCase().includes(term.toLowerCase()))
    );
    setFilteredViolations(filtered);
  };

  const handleViewDetails = (violationId) => {
    navigate(`/violations-details/${violationId}`);
  };

  const handleViewReports = () => {
    navigate('/violation-reports');
  };

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (userData) {
        setLoggedInUser(userData);
      }
    };

    fetchLoggedInUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(rentmobileDb, 'Market_violations'));
      const data = querySnapshot.docs.map((doc) => {
        const date = doc.data().date ? doc.data().date.toDate().toLocaleString() : '';
        return {
          id: doc.id,
          vendorId: doc.data().vendorId,
          vendorName: doc.data().vendorName,
          stallNumber: doc.data().stallNo,
          violationType: doc.data().violationType,
          dateTime: date,
          imageUrl: doc.data().image,
          status: doc.data().status,
          stallLocation: doc.data().stallLocation,
          dailyPayment: doc.data().dailyPayment,
          violationPayment: doc.data().violationPayment, // Add violationPayment field
        };
      });
      setViolations(data);
      setFilteredViolations(data.filter(violation => !violation.violationPayment));
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
          <ToggleButton onClick={toggleSidebar}>
            <FaBars />
          </ToggleButton>
          <div>Manage Violations</div>
        </AppBar>
        <SummaryContainer>
          <ControlsContainer>
            <p>{filteredViolations.length} Violations</p>
            <SearchBar onSearch={handleSearch} />
            <AddVendorButton onClick={handleViewReports}>Violation Reports</AddVendorButton>
          </ControlsContainer>
        </SummaryContainer>
        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Stall Number</th>
                <th>Violation Type</th>
                <th>Date/Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredViolations.map((violation) => (
                <tr key={violation.id}>
                  <td>{violation.vendorName}</td>
                  <td>{violation.stallNumber}</td>
                  <td>{violation.violationType}</td>
                  <td>{violation.dateTime}</td>
                  <td className="actions">
                    <div className="action-button" onClick={() => handleViewDetails(violation.id)}>
                      <FaEye className="icon" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default ViolationReports;