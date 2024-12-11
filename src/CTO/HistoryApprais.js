import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { stallholderDb } from '../components/firebase.config';
import { collection, getDocs } from 'firebase/firestore';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

// Define theme colors
const themeColors = {
  primary: '#4CAF50',  // Green
  secondary: '#388E3C', // Darker Green
  lightGray: '#F4F4F4', // Light Gray for background
  darkGray: '#333333', // Dark Gray for text
  white: '#FFFFFF',
};

// Styled components
const DashboardContainer = styled.div`
  padding: 30px;
  background-color: ${themeColors.lightGray};
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TableContainer = styled.div`
  margin-top: 30px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: ${themeColors.white};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  th, td {
    padding: 14px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: ${themeColors.primary};
    color: ${themeColors.white};
    font-size: 16px;
  }

  tr:hover {
    background-color: ${themeColors.lightGray};
  }

  td {
    color: ${themeColors.darkGray};
    font-size: 14px;
  }
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 26px;
  font-weight: bold;
`;

const LoadingMessage = styled.p`
  text-align: center;
  color: ${themeColors.darkGray};
  font-size: 18px;
`;

const DateInputLabel = styled.label`
  margin-right: 10px; /* Add space between label and input */
`;

const NoDataMessage = styled.p`
  text-align: center;
  color: ${themeColors.darkGray};
  font-size: 18px;
  margin-top: 20px;
`;

const FiltersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const FiltersRightSide = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  align-items: center;
`;

const FilterOption = styled.span`
  font-size: 16px;
  color: ${props => (props.active ? '#45a049' : '#333')};
  cursor: pointer;
  font-weight: ${props => (props.active ? 'bold' : 'normal')};

  &:hover {
    color: #45a049;
    font-weight: bold;
  }
`;

const DateInputWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 15px;
`;

const DateInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  width: 200px;
  font-size: 16px;
`;

const CollectorLink = styled(Link)`
  color: ${themeColors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const DateTotalHeader = styled.h3`
  background-color: ${themeColors.lightGray};
  padding: 12px;
  margin: 0;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  color: ${themeColors.darkGray};
`;

const SearchInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  width: 250px;
  font-size: 16px;
`;

const SelectedRow = styled.tr`
  background-color: ${themeColors.lightGray} !important;
`;

const HistoryApprais = () => {
  const { collectorName } = useParams();
  const navigate = useNavigate();
  const [allItems, setAllItems] = useState([]);
  const [collectors, setCollectors] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // New state for the search term
  const [selectedItem, setSelectedItem] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const applyFilter = useCallback((data) => {
    let filteredData = [...data];

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filteredData = filteredData.filter(item => {
        return item.date.toDateString() === filterDate.toDateString();
      });
    }

    if (filter === 'Recent') {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 7);
      filteredData = filteredData.filter(item => item.date >= recentDate);
    }

    if (filter === 'This Week') {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      filteredData = filteredData.filter(item => item.date >= startOfWeek && item.date <= endOfWeek);
    }

    // Filter based on the search term
    if (searchTerm) {
      filteredData = filteredData.filter(item =>
        collectors[item.appraisal]?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date in descending order
    filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filteredData;
  }, [dateFilter, filter, searchTerm, collectors]);

  useEffect(() => {
    const fetchUserData = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
          setLoggedInUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);

      try {
        // Fetch appraisals data
        const appraisalsSnapshot = await getDocs(collection(stallholderDb, 'appraisals'));
        const appraisalsData = appraisalsSnapshot.docs.map(doc => {
          const appraisalData = doc.data();
          return {
            code: doc.id,
            productName: appraisalData.goods_name,
            unit: appraisalData.unit_measure,
            quantity: appraisalData.quantity,
            totalAmount: appraisalData.total_amount,
            date: appraisalData.created_date ? new Date(appraisalData.created_date.seconds * 1000) : new Date(),
            createdDate: appraisalData.created_date ? new Date(appraisalData.created_date.seconds * 1000).toLocaleDateString() : 'N/A',
            appraisal: appraisalData.appraisal,
            location: appraisalData.appraisal_assign, // Fetch the location
          };
        });
        console.log('Appraisals Data:', appraisalsData);

        // Fetch collectors from the appraisal_user collection
        const collectorsSnapshot = await getDocs(collection(stallholderDb, 'appraisal_user'));
        const collectorsData = collectorsSnapshot.docs.reduce((acc, doc) => {
          const userData = doc.data();
          acc[userData.appraisal] = `${userData.firstname} ${userData.lastname}`;
          return acc;
        }, {});
        console.log('Collectors Data:', collectorsData);

        // Filter appraisals based on admin user's location
        const filteredAppraisals = appraisalsData.filter(appraisal =>
          loggedInUser && appraisal.location === loggedInUser.location
        );

        setCollectors(collectorsData);
        setAllItems(filteredAppraisals);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchItems();
  }, [loggedInUser]);

  const filteredItems = useMemo(() => applyFilter(allItems), [allItems, applyFilter]);

  const groupByDate = useMemo(() => (items) => {
    return items.reduce((acc, item) => {
      const date = item.createdDate;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});
  }, []);

  const handleCellClick = (item) => {
    const collector = collectors[item.appraisal];
    const date = item.createdDate;
    navigate(`/appraisalCollects?collector=${collector}&date=${date}`); // Redirect to the AppraisalCollects page with query parameters
  };

  const handleRowClick = (item, e) => {
    if (e.target.tagName === 'TD') {
      handleCellClick(item);
    }
  };

  console.log('Rendering HistoryApprais component');

  return (
    <DashboardContainer>
      <HeaderContainer>
        <Title>Appraisal Payment History</Title>
      </HeaderContainer>

      <FiltersContainer>
        <FiltersRightSide>
          <FilterOption active={filter === 'All'} onClick={() => setFilter('All')}>All</FilterOption>
          <FilterOption active={filter === 'Recent'} onClick={() => setFilter('Recent')}>Recent</FilterOption>
          <FilterOption active={filter === 'This Week'} onClick={() => setFilter('This Week')}>This Week</FilterOption>
        </FiltersRightSide>

        <DateInputWrapper>
          <DateInputLabel>Filter by:</DateInputLabel>
          <SearchInput
            type="text"
            placeholder="Search Collector Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <DateInput
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </DateInputWrapper>
      </FiltersContainer>

      {loading ? (
        <LoadingMessage>Loading...</LoadingMessage>
      ) : filteredItems.length === 0 ? (
        <NoDataMessage>No Data</NoDataMessage>
      ) : (
        <TableContainer>
          {Object.entries(groupByDate(filteredItems)).map(([date, groupedItems]) => {
            const totalForDate = groupedItems.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2);

            return (
              <div key={date}>
                <DateTotalHeader>
                  {date} <span>Total: ₱{totalForDate}</span>
                </DateTotalHeader>
                <Table>
                  <thead>
                    <tr>
                      <th>Item Code</th>
                      <th>Product Name</th>
                      <th>Unit</th>
                      <th>Quantity</th>
                      <th>Total Amount</th>
                      <th>Date Created</th>
                      <th>Collector</th>
                      <th>Location</th> {/* Add Location column */}
                    </tr>
                  </thead>
                  <tbody>
                    {groupedItems.map(item => (
                      <tr
                        key={item.code}
                        onClick={(e) => handleRowClick(item, e)}
                        style={{ backgroundColor: selectedItem?.code === item.code ? themeColors.lightGray : 'transparent' }}
                      >
                        <td>{item.code}</td>
                        <td>{item.productName}</td>
                        <td>{item.unit}</td>
                        <td>{item.quantity}</td>
                        <td>₱{item.totalAmount.toFixed(2)}</td>
                        <td>{item.createdDate}</td>
                        <td>{collectors[item.appraisal]}</td>
                        <td>{item.location}</td> {/* Display Location */}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            );
          })}
        </TableContainer>
      )}
    </DashboardContainer>
  );
};

export default HistoryApprais;