import React, { useEffect, useState } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faList, faPlus, faUser, faIdBadge, faMagnifyingGlass, faHouseChimney, faUsers, faTriangleExclamation, faEye, faCircleUser, faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { collection, getDocs } from 'firebase/firestore';
import { stallholderDb } from '../components/firebase.config';
import { Link } from 'react-router-dom'; 
import './ListOfStallholders.css';

// Add FontAwesome icons to the library
library.add(faList, faPlus, faUser, faIdBadge, faMagnifyingGlass, faHouseChimney, faUsers, faTriangleExclamation, faEye, faCircleUser, faBars);

const ListsOfStallHolders = () => {
  const [stallHolders, setStallHolders] = useState([]);
  const [filteredStallHolders, setFilteredStallHolders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar open state

  useEffect(() => {
    const fetchData = async () => {
        const querySnapshot = await getDocs(collection(stallholderDb, 'users'));

      const data = querySnapshot.docs.map((doc) => {
        const stallInfo = doc.data().stallInfo || {}; // Fetch stallInfo map
        const dateOfRegistration = doc.data().dateOfRegistration ? doc.data().dateOfRegistration.toDate().toLocaleDateString() : '';

        return {
          id: doc.id, // Document ID
          stallNumber: stallInfo.stallNumber || '',  // Retrieve stall number from stallInfo
          firstName: doc.data().firstName || '',      // Retrieve first name
          lastName: doc.data().lastName || '',        // Retrieve last name
          location: stallInfo.location || '',         // Retrieve location from stallInfo
          areaMeters: stallInfo.stallSize || '',      // Retrieve area (size) from stallInfo
          billing: stallInfo.ratePerMeter || '',      // Retrieve rate per meter from stallInfo
          date: dateOfRegistration,               // Retrieve date of registration
          status: stallInfo.status || '',             // Retrieve status from stallInfo
        };
      });
      setStallHolders(data); // Set the stall holders state with fetched data
      setFilteredStallHolders(data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filteredData = stallHolders.filter(stall => 
      stall.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStallHolders(filteredData);
  }, [searchTerm, stallHolders]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar open/close
  };

  return (
    <div className="collector-container">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="toggle-sidebar" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faBars} size="2xl" />
          </button>
          
        </div>
        <div className="sidebar-item home">
          <FontAwesomeIcon icon={faHouseChimney} size="2xl" />
          <span>Home</span>
        </div>
        <div className="sidebar-item stall-holders active">
          <FontAwesomeIcon icon={faUsers} size="2xl" />
          <span>Lists of Stall Holders</span>
        </div>
        <div className="sidebar-item vendor-violations">
          <FontAwesomeIcon icon={faTriangleExclamation} size="2xl" />
          <span>Vendor Violations</span>
        </div>
        <div className="sidebar-item settings">
          <FontAwesomeIcon icon={faUser} size="lg" />
          <span>Settings</span>
        </div>
      </aside>

      <main className={`main-content ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
        <div className="app-bar">
          <div className="title">COLLECTOR</div>
          <div className="profile-section">
            <Link to="/manage-profile" className="profile-link">
              <span>Profile</span>
              <FontAwesomeIcon icon={faCircleUser} size="2xl" style={{ color: "#B197FC" }} />
            </Link>
          </div>
        </div>

        <section className="stall-holders-section">
  <div className="section-header">
    <h2>Lists of Stall Holder</h2>
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search Vendor"
        className="search-input"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <button className="search-button">
        <FontAwesomeIcon icon={faMagnifyingGlass} size="xl" />
      </button>
    </div>
  </div>
  <table className="stall-holders-table">
    <thead>
      <tr>
        <th>Stall No.</th>
        <th>Stall Holder</th>
        <th>Unit</th>
        <th>Area (Meters)</th>
        <th>Rate Per Meter</th>
        <th>Date</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredStallHolders.map((stall, index) => (
        <tr key={index}>
          <td>{stall.stallNumber}</td>
          <td>{stall.firstName} {stall.lastName}</td>
          <td>{stall.location}</td>
          <td>{stall.areaMeters}</td>
          <td>{stall.billing}</td>
          <td>{stall.date}</td>
          <td>{stall.status}</td>
          <td>
            <Link to={`/view-payment/${stall.id}`} className="view-button">
              <FontAwesomeIcon icon={faEye} size="s" />
            </Link>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</section>
      </main>
    </div>
  );
};

export default ListsOfStallHolders;
