import React, { useState, useEffect } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faMagnifyingGlass, faEye } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { stallholderDb } from "../components/firebase.config";// Adjust the path to your Firebase configuration
import { useNavigate } from 'react-router-dom';
import ViolationReport from './ViolationReport'; // Import the ViolationReport component

library.add(faMagnifyingGlass, faEye);

// Styled components
const DashboardContainer = styled.div`
  padding: 50px 80px;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 20px; /* Reduced gap */
`;

const TableContainer = styled.div`
  margin: 0 auto; /* Centered */
  max-width: 100%; /* Made the table wider */
  overflow-x: auto;
  width: 100%;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 0; /* Removed margin */
  font-size: 14px;
  text-align: center;
`;

const TableHeader = styled.th`
  padding: 12px;
  border: 1px solid #ddd;
  background-color: #4caf50; // Green background color
  color: white;
  font-weight: bold;
  text-align: left;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f9f9f9;
  }
`;

const TableData = styled.td`
  padding: 12px;
  border: 1px solid #ddd;
  text-align: left;
`;

const NoDataMessage = styled.p`
  text-align: center;
  color: #888;
  font-size: 16px;
  margin-top: 30px;
`;

const LoadingMessage = styled.p`
  text-align: center;
  color: #888;
  font-size: 16px;
  margin-top: 30px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 26px;
  font-weight: bold;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Search group
const FiltersRightSide = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  align-items: center;
`;

const FilterOption = styled.span`
  font-size: 16px;
  color: ${props => (props.active ? '#4caf50' : '#333')};
  cursor: pointer;
  font-weight: ${props => (props.active ? 'bold' : 'normal')};

  &:hover {
    color: #4caf50;
    font-weight: bold;
  }
`;

const SearchbarLabel = styled.label`
  margin-right: 10px;
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px; /* Reduced margin */
`;

const SearchGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const SearchBar = styled.input`
  width: 200px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
`;

const DateInput = styled.input`
  width: 200px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px; /* Adjust the gap as needed */
`;

const Violators = () => {
  const [violators, setViolators] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminLocation, setAdminLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [displayDate, setDisplayDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedViolator, setSelectedViolator] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminLocation = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData && userData.email) {
          const adminQuery = query(
            collection(stallholderDb, 'admin_users'),
            where('email', '==', userData.email)
          );
          const adminSnapshot = await getDocs(adminQuery);
          if (!adminSnapshot.empty) {
            const adminData = adminSnapshot.docs[0].data();
            setAdminLocation(adminData.location);
          }
        }
      } catch (error) {
        console.error('Error fetching admin location:', error);
      }
    };

    const fetchViolators = async () => {
      try {
        const paymentsQuery = query(
          collection(stallholderDb, 'stall_payment'),
          where('status', '==', 'Overdue')
        );
        const paymentsSnapshot = await getDocs(paymentsQuery);

        const paymentsData = paymentsSnapshot.docs.map((doc) => {
          const data = doc.data();
          const interestRatePercentage = data.interestRate * 100;
          const noOfDays = data.noOfDays || 1; // Default to 1 if noOfDays is not available
          const total = (data.dailyPayment || 0) * noOfDays + (data.garbageFee || 0) + (data.surcharge || 0);
          return {
            id: doc.id,
            date: data.dueDate ? data.dueDate.toDate().toLocaleDateString() : "N/A",
            name: `${data.firstName} ${data.middleName || ''} ${data.lastName}`.trim(),
            status: data.status,
            dailyStallRental: data.dailyPayment || 0,
            garbageFee: data.garbageFee || 0,
            surcharge: data.surcharge || 0,
            total: total,
            interestRate: interestRatePercentage || 0,
            amountIntRate: ((interestRatePercentage || 0) / 100) * total,
            amountDue: total + ((interestRatePercentage || 0) / 100) * total,
            vendorID: data.vendorId,
            billingCycle: data.billingCycle || 'N/A', // Fetch billingCycle
          };
        });

        const approvedVendorsQuery = query(
          collection(stallholderDb, 'approvedVendors')
        );
        const approvedVendorsSnapshot = await getDocs(approvedVendorsQuery);

        const approvedVendorsData = approvedVendorsSnapshot.docs.reduce(
          (acc, doc) => {
            const data = doc.data();
            acc[doc.id] = {
              location: data.stallInfo.location,
              stallNumber: data.stallInfo.stallNumber, // Add stallNumber
            };
            return acc;
          },
          {}
        );

        const combinedData = paymentsData.map((payment) => ({
          ...payment,
          location: approvedVendorsData[payment.vendorID]?.location || 'N/A',
          stallNumber: approvedVendorsData[payment.vendorID]?.stallNumber || 'N/A', // Add stallNumber
        }));

        const filteredData = combinedData.filter(transaction => transaction.location === adminLocation);

        // Sort the filteredData by date in descending order
        const sortedData = filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Fetch report status and offense type
        const reportStatusMap = {};
        const reportsQuery = query(
          collection(stallholderDb, 'Notice_Report'),
          where('vendorId', 'in', filteredData.map(item => item.vendorID))
        );
        const reportsSnapshot = await getDocs(reportsQuery);
        reportsSnapshot.forEach(doc => {
          const data = doc.data();
          reportStatusMap[data.vendorId] = {
            reportSent: data.reportSent,
            offenseType: data.offenseType,
          };
        });

        const dataWithReportStatus = sortedData.map(item => ({
          ...item,
          ...reportStatusMap[item.vendorID],
        }));

        setViolators(dataWithReportStatus);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
        setLoading(false);
      }
    };

    fetchAdminLocation().then(() => fetchViolators());
  }, [adminLocation]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (e) => {
    setDisplayDate(e.target.value);
  };

  const filteredViolators = violators.filter(
    violator =>
      violator.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filter === 'All' ||
       (filter === 'Daily' && new Date(violator.date).toDateString() === new Date().toDateString()) ||
       (filter === 'Weekly' && new Date(violator.date) >= new Date(new Date().setDate(new Date().getDate() - 7))) ||
       (filter === 'Monthly' && new Date(violator.date).getMonth() === new Date().getMonth())) &&
      (displayDate ? new Date(violator.date).toDateString() === new Date(displayDate).toDateString() : true)
  );

  const handleViewDetails = (violator) => {
    setSelectedViolator(violator);
    setShowModal(true);
  };

  const handleSendNotification = (violator) => {
    // Implement your send notification logic here
    console.log('Send notification to:', violator);
  };

  return (
    <DashboardContainer>
      <HeaderContainer>
        <Title>Stall Holder Violator</Title>
      </HeaderContainer>
      <SearchContainer>
        <FiltersRightSide>
          <FilterOption active={filter === 'All'} onClick={() => handleFilterChange('All')}>All</FilterOption>
          <FilterOption active={filter === 'Daily'} onClick={() => handleFilterChange('Daily')}>Daily</FilterOption>
          <FilterOption active={filter === 'Weekly'} onClick={() => handleFilterChange('Weekly')}>Weekly</FilterOption>
          <FilterOption active={filter === 'Monthly'} onClick={() => handleFilterChange('Monthly')}>Monthly</FilterOption>
        </FiltersRightSide>
        <SearchGroup>
          <SearchbarLabel>Filter by:</SearchbarLabel>
          <SearchBar
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <DateInput
            type="date"
            value={displayDate}
            onChange={handleDateChange}
          />
        </SearchGroup>
      </SearchContainer>
      {loading ? (
        <LoadingMessage>Loading...</LoadingMessage>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <TableRow>
                <TableHeader>Date</TableHeader>
                <TableHeader>Vendor ID</TableHeader> {/* Add Vendor ID */}
                <TableHeader>Name</TableHeader>
                <TableHeader>Stall Number</TableHeader> {/* Add Stall Number */}
                <TableHeader>Status</TableHeader>
                <TableHeader>Billing Cycle</TableHeader> {/* Add Billing Cycle */}
                <TableHeader>Daily Rate</TableHeader>
                <TableHeader>Garbage Fee</TableHeader>
                <TableHeader>Surcharge</TableHeader>
                <TableHeader>Total</TableHeader>
                <TableHeader>Interest Rate</TableHeader>
                <TableHeader>Amount Int. Rate</TableHeader>
                <TableHeader>Amount Due</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </thead>
            <tbody>
              {filteredViolators.map(violator => (
                <TableRow key={violator.id}>
                  <TableData>{violator.date}</TableData>
                  <TableData>{violator.vendorID}</TableData> {/* Add Vendor ID */}
                  <TableData>{violator.name}</TableData>
                  <TableData>{violator.stallNumber}</TableData> {/* Add Stall Number */}
                  <TableData>{violator.status}</TableData>
                  <TableData>{violator.billingCycle}</TableData> {/* Add Billing Cycle */}
                  <TableData>₱{violator.dailyStallRental || 0}</TableData>
                  <TableData>₱{violator.garbageFee || 0}</TableData>
                  <TableData>₱{violator.surcharge || 0}</TableData>
                  <TableData>₱{violator.total || 0}</TableData>
                  <TableData>{violator.interestRate.toFixed(2) || '0'}%</TableData>
                  <TableData>₱{violator.amountIntRate.toFixed(2) || 0}</TableData>
                  <TableData>₱{violator.amountDue.toFixed(2) || 0}</TableData>
                  <TableData>
                    <ButtonContainer>
                      <Button
                        variant={violator.reportSent ? (violator.offenseType === 'Final Offense' || violator.offenseType === 'Second Offense' ? "danger" : "success") : "warning"}
                        onClick={() => handleViewDetails(violator)}
                        size="sm"
                      >
                        {violator.reportSent ? (
                          violator.offenseType === 'First Offense' ? '1st' :
                          violator.offenseType === 'Second Offense' ? '2nd' :
                          violator.offenseType === 'Final Offense' ? 'Final' : 'Sent'
                        ) : "View"}
                      </Button>
                    </ButtonContainer>
                  </TableData>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
      {!loading && filteredViolators.length === 0 && (
        <NoDataMessage>No violators found.</NoDataMessage>
      )}
      <ViolationReport
        show={showModal}
        onHide={() => setShowModal(false)}
        violator={selectedViolator}
      />
    </DashboardContainer>
  );
};

export default Violators;