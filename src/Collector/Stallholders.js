import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars, FaSearch, FaUserCircle, FaFilter, FaPrint } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faCheck, faClipboard, faPlusCircle, faEye, faCogs} from '@fortawesome/free-solid-svg-icons';
import { FaSignOutAlt } from 'react-icons/fa';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { rentmobileDb, stallholderDb } from '../components/firebase.config';
import { interimDb } from '../components/firebase.config';

const ROWS_PER_PAGE = 10;

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')};
  background-color: #f8f9fa;
  padding: 10px;
  display: flex;
  border: 1px solid #ddd;  /* ADD THIS */
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 100;
  overflow: auto;
  max-height: 100vh;
`;

const SidebarMenu = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const SidebarItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex-start' : 'center')};
  padding: 10px;
  margin-bottom: 10px;
  margin-top: -10px;
  border-radius: 8px;
  font-size: 14px;
  color: ${({ active }) => (active ? 'white' : '#333')};
  background-color: ${({ active }) => (active ? '#007bff' : 'transparent')};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ active }) => (active ? '#007bff' : '#f1f3f5')};
  }

  .icon {
    font-size: 1rem;  /* Increase the icon size */
    color: #000;
    transition: margin-left 0.2s ease;
  }

  span:last-child {
    margin-left: 10px;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'inline' : 'none')};
  }
`;


const ToggleButton = styled.div`
  display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'none' : 'block')};
  position: absolute;
  top: 5px;
  left: 15px;
  font-size: 1.8rem;
  color: #333;
  cursor: pointer;
  z-index: 200;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')};
  padding-left: 40px;
  background-color: #fff;
  padding: 2rem;
  width: 100%;
  transition: margin-left 0.3s ease;
  overflow-y: auto;
  flex: 1;
`;

const AppBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 50px;
  background-color: #188423; /* Updated color */
  color: white;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  font-size: 22px;
  font-family: 'Inter', sans-serif; /* Use a professional font */
  font-weight: bold; /* Apply bold weight */
`;



const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 40px 10px;
  position: relative;
  flex-direction: column;

  .profile-icon {
    font-size: 3rem;
    margin-bottom: 15px;
    color: #6c757d; // Subtle color for icon
  }

  .profile-name {
    font-size: 1.2rem;
    font-weight: 700; // Bolder text
    color: black; // Darker gray for a professional look
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
  }

  hr {
    width: 100%;
    border: 0.5px solid #ccc;
    margin-top: 15px;
  }

  .profile-position {
    font-size: 1rem; /* Increase the font size */
    font-weight: 600; /* Make it bold */
    color: #007bff; /* Change color to blue for better visibility */
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
    margin-top: 5px; /* Add some margin for spacing */
  }
`;


const ProfileImage = styled.img`
  border-radius: 50%;
  width: 60px; /* Adjusted for better visibility */
  height: 60px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); // Subtle shadow for a polished look
`;


const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 50px; /* Added margin to avoid overlapping with AppBar */

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatBox = styled.div`
  background-color: ${({ bgColor }) => bgColor || '#f4f4f4'};
  padding: 3rem;
  border-radius: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

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




const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 20px;
  margin-bottom: 20px;
  margin-top: -25px;
  display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex' : 'none')};
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
`;


const SearchBarCont = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  padding-left: 100px; /* Add more padding on the left */
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ced4da;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  margin: 30px 0; /* Remove auto centering */
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const TopBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  
`;



const SidebarFooter = styled.div`
  padding: 10px;
  margin-top: auto; /* Pushes the footer to the bottom */
  display: flex;
  align-items: center;
  justify-content: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex-start' : 'center')};
`;

const LogoutButton = styled(SidebarItem)`
  margin-top: 5px; /* Add some margin */
  background-color: #dc3545; /* Bootstrap danger color */
  color: white;
  align-items: center;
  margin-left: 20px;
  padding: 5px 15px; /* Add padding for a better button size */
  border-radius: 5px; /* Rounded corners */
  font-weight: bold; /* Make text bold */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Subtle shadow for depth */
  transition: background-color 0.3s ease, transform 0.2s ease; /* Smooth transitions */

  &:hover {
    background-color: #c82333; /* Darker red on hover */
    transform: scale(1.05); /* Slightly scale up on hover */
  }
`;
const ButtonContainer = ({ children }) => (
  <div style={{ display: 'flex', gap: '10px' }}>{children}</div>
);


const FormContainer = styled.div`
  padding: 40px;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', sans-serif;
  max-width: 1200px;
  margin: auto;

  h3 {
    font-size: 22px;
    color: #000;
    font-weight: 700;
    margin-bottom: 25px;
  }
`;

const UnitFilterContainer = styled.div`
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between; /* Aligns select and search box to opposite ends */

  .select-container {
    flex: 1;
  }

  .search-container {
    flex: 1;
    max-width: 300px;
    display: flex;
    position: relative;
  }
   .filter-container {
    margin-left: 10px; /* Add some space between the select and filter button */
  }

  .filter-button {
    padding: 12px 20px;
    font-size: 14px;
    border: 1px solid #ddd;
    border-radius: 12px;
    background-color: #3498db;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: #2980b9;
    }

    &:active {
      background-color: #2471a3;
    }
  }

  select {
    padding: 12px 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
    font-size: 15px;
    font-weight: bold;
    color: #333;
    outline: none;
    transition: all 0.3s;

    &:hover,
    &:focus {
      border-color: #2ecc71;
      box-shadow: 0 0 6px rgba(46, 204, 113, 0.4);
    }
  }

   .search-container input {
    padding: 12px 15px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 10px;
    width: 100%; /* Ensure input takes full width */
    transition: all 0.3s;
    outline: none;
    font-weight: bold;
    padding-left: 30px; /* Add padding to the left to make space for the icon */

    &:focus {
      border-color: #3498db;
      box-shadow: 0 0 5px rgba(52, 152, 219, 0.4);
    }

    &::placeholder {
      color: #bbb; /* Placeholder text color */
      font-weight: bold; /* Bold placeholder text */
    }
  }

  .search-icon {
    position: absolute;
    left: 10px; /* Position the icon inside the input */
    top: 50%;
    transform: translateY(-50%); /* Vertically center the icon */
    color: #888; /* Icon color */
    font-size: 18px; /* Icon size */
  }
`;

const StallHolderContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
`;

const StallHolderCard = styled.div`
  background-color: #f9fafb;
  border-radius: 15px;
  border: 3px solid #ddd; /* Adding 4px solid border with light gray color */
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  padding: 25px;
  width: 320px;
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
`;

const PaymentDate = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 12px;
  color: #888; /* Changed to a lighter gray color */
  font-weight: bold;
`;

const StallHolderInfo = styled.div`
  margin-bottom: 20px;
  font-size: 15px;
  color: #333;

  div {
    margin-bottom: 10px;
    color: #333;

    &::before {
      font-weight: bold;
      margin-right: 5px;
    }

    &:nth-child(1)::before { content: "Name:"; }
    &:nth-child(2)::before { content: "Amount Due:"; }
    &:nth-child(3)::before { content: "Garbage Fee:"; }
    &:nth-child(4)::before { content: "Interest Amount:"; }
    &:nth-child(5)::before { content: "Interest Rate:"; }
    &:nth-child(6)::before { content: "Total Amount Due:"; }
    &:nth-child(7)::before { content: "Status:"; }
  }
`;

const StallHolderActions = styled.div`
  display: flex;
  justify-content: space-between;

  button {
    background-color: #3498db; /* Default color */
    color: #ffffff;
    border: none;
    padding: 12px 20px; /* Adjust padding to match your design */
    border-radius: 10px;
    cursor: pointer;
    font-size: 16px; /* Font size */
    font-weight: bold;
    transition: background-color 0.3s, transform 0.2s;

    &:hover {
      background-color: #2980b9; /* Darker shade on hover */
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.98); /* Slightly smaller when active */
    }
  }

  .mark-as-paid {
    background-color: #2ecc71; /* Green color for 'Mark as Paid' button */

    &:hover {
      background-color: #27ae60; /* Darker green on hover */
    }
  }

  /* Custom styles for the View button */
  .view-button {
    background-color: #3498db; /* Default blue color */
    padding: 10px 16px; /* Adjusted padding for a larger button */
    font-size: 16px; /* Font size matching your design */
    border-radius: 10px; /* Slightly rounder corners */
    width: 40%; /* Ensure it takes up full width of its container */
    transition: background-color 0.3s, transform 0.2s;

    &:hover {
      background-color: #2980b9; /* Darker shade on hover */
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.98); /* Slightly smaller when active */
    }
  }
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stallHolders, setStallHolders] = useState([]);
  const [totalDailyRent, setTotalDailyRent] = useState(0);
  const sidebarRef = useRef(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('Select Unit');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const fetchStallholders = async () => {
    try {
      const querySnapshot = await getDocs(collection(rentmobileDb, 'stall_payment'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        firstName: doc.data().firstName || '',
        lastName: doc.data().lastName || '',
        dailyRent: doc.data().dailyRent || 0,
        garbageFee: doc.data().garbageFee || 0,
        amountDue: doc.data().amountDue || 0,
        interestAmount: doc.data().interestAmount || 0,
        interestRat: doc.data().interestRat || 0,
        numOfDays: doc.data().numOfDays || 0,
        paymentDate: doc.data().paymentDate?.toDate() || null,
        status: doc.data().status || 'Unpaid',
        surcharge: doc.data().surcharge || 0,
        totalAmountDue: doc.data().totalAmountDue || 0,
      }));

      // Calculate total daily rent
      const totalRent = data.reduce((sum, stall) => sum + stall.dailyRent, 0);
      setTotalDailyRent(totalRent);

      setStallHolders(data);
    } catch (error) {
      console.error("Error fetching stallholders:", error);
    }
  };

  useEffect(() => {
    fetchStallholders();
  }, []);

  const handleFilter = () => {
    // Add your filter logic here
    console.log('Filter button clicked');
  };

  const fetchUnits = async () => {
    try {
      const querySnapshot = await getDocs(collection(rentmobileDb, 'unit'));
      const unitData = querySnapshot.docs.map(doc => doc.data().name);
      setUnits(['All', ...unitData]);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const markAsPaid = async (stallId) => {
    try {
      const stallRef = doc(rentmobileDb, 'stall_payment', stallId);
      await updateDoc(stallRef, { status: 'Paid' });

      // Update local state
      setStallHolders(prevStallHolders =>
        prevStallHolders.map(stall =>
          stall.id === stallId ? { ...stall, status: 'Paid' } : stall
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/login');
  };

  useEffect(() => {
    try {
      const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
      if (loggedInUserData) {
        const currentUser = stallHolders.find(user => user.email === loggedInUserData.email);
        setLoggedInUser(currentUser || loggedInUserData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [stallHolders]);

  return (

    <DashboardContainer>
     <Sidebar ref={sidebarRef} isSidebarOpen={isSidebarOpen}>
        <Link to="/profile" style={{ textDecoration: 'none' }}>
        <ProfileHeader isSidebarOpen={isSidebarOpen}>
          {loggedInUser && loggedInUser.Image ? (
            <ProfileImage src={loggedInUser.Image} alt={`${loggedInUser.firstName} ${loggedInUser.lastName}`} />
          ) : (
            <FaUserCircle className="profile-icon" />
          )}
          <span className="profile-name">{loggedInUser ? `${loggedInUser.firstName} ${loggedInUser.lastName}` : 'Guest'}</span>
          
          <span className="profile-email" style={{ fontSize: '0.9rem', color: '#6c757d', display: isSidebarOpen ? 'block' : 'none' }}>
            {loggedInUser ? loggedInUser.email : ''}
          </span>
          
          {/* Add position below the email */}
          <span className="profile-position" style={{ fontSize: '0.9rem', color: '#6c757d', display: isSidebarOpen ? 'block' : 'none' }}>
            {loggedInUser ? loggedInUser.position : ''}
          </span>
        </ProfileHeader>
      </Link>
      
        <SearchBarContainer isSidebarOpen={isSidebarOpen}>
          <FaSearch />
          <SearchInput type="text" placeholder="Search..." />
        </SearchBarContainer>
        
        <SidebarMenu>
  <Link to="/collectdash" style={{ textDecoration: 'none' }}>
    <SidebarItem isSidebarOpen={isSidebarOpen}>
      <FontAwesomeIcon icon={faHome} className="icon" />
      <span>Dashboard</span>
    </SidebarItem>
  </Link>
  
  <Link to="/stallholders" style={{ textDecoration: 'none' }}>
    <SidebarItem isSidebarOpen={isSidebarOpen}>
      <FontAwesomeIcon icon={faShoppingCart} className="icon" />
      <span>List of Vendors</span>
    </SidebarItem>
  </Link>
  

  
</SidebarMenu>
      <SidebarFooter isSidebarOpen={isSidebarOpen}>
          <LogoutButton isSidebarOpen={isSidebarOpen} onClick={handleLogout}>
            <span><FaSignOutAlt /></span>
            <span>Logout</span>
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>



      <MainContent isSidebarOpen={isSidebarOpen}>
        <AppBar>
          <ToggleButton onClick={toggleSidebar}>
              <FaBars />
          </ToggleButton>
          <div>LIST OF VENDORS</div>
        </AppBar>

        <ToggleButton isSidebarOpen={isSidebarOpen} onClick={toggleSidebar}>
          <FaBars />
        </ToggleButton>

        <StatsContainer>
        <StatBox bgColor="#11768C">
          <h3>Daily Rent</h3>
          <p>{totalDailyRent}</p>
        </StatBox>

        <StatBox bgColor="#188423">
          <h3>Weekly Rent</h3>
          <p>{/* Add your weekly rent logic here */}</p>
        </StatBox>

        <StatBox bgColor="#188423">
          <h3>Monthly Rent</h3>
          <p>{/* Add your monthly rent logic here */}</p>
        </StatBox>
      </StatsContainer>
          
        

        <TopBarContainer>
       

        <ButtonContainer>
        
          </ButtonContainer>
          </TopBarContainer>

          <FormContainer>
      <h3>Stall Holders</h3>
      <UnitFilterContainer>
        <div className="select-container">
          <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
            {units.map((unit, index) => (
              <option key={index} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
       
       {/* Filter Button */}
    <div className="filter-container">
      <button className="filter-button" onClick={handleFilter}>
        Filter
      </button>
    </div>


        <div className="search-container">
  <input
    type="text"
    placeholder="Search Stallholder"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  <div className="search-icon">
    <FontAwesomeIcon icon={faSearch} /> {/* FontAwesome search icon */}
  </div>
</div>

      </UnitFilterContainer>

     

      <StallHolderContainer>
        {stallHolders.map((stall) => (
          <StallHolderCard key={stall.id}>
            <PaymentDate>{stall.paymentDate ? stall.paymentDate.toLocaleDateString() : 'N/A'}</PaymentDate>
            <StallHolderInfo>
              <div>{stall.firstName} {stall.lastName}</div>
              <div>{stall.amountDue}</div>
              <div>{stall.garbageFee}</div>
              <div>{stall.interestAmount}</div>
              <div>{stall.interestRat}</div>
              <div>{stall.totalAmountDue}</div>
              <div style={{ color: stall.status === 'Pending' ? 'red' : stall.status === 'Paid' ? 'blue' : 'black' }}>
                {stall.status}
              </div>
            </StallHolderInfo>
            <StallHolderActions>
              {(stall.status === 'Pending' || stall.status === 'Unpaid') && (
                <button className="mark-as-paid" onClick={() => markAsPaid(stall.id)}>
                  Mark as Paid
                </button>
              )}
              <button className="view-button" onClick={() => navigate(`/view-stallholder/${stall.id}`)}>View</button>
            </StallHolderActions>
          </StallHolderCard>
        ))}
      </StallHolderContainer>
    </FormContainer>

      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
