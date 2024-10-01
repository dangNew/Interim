import React, { useEffect, useState } from 'react';
import './dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPlus, faCog, faUsers, faFileContract, faTachometerAlt, faSearch } from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  const [data, setData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalLogins: 0
  });
  
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch('http://localhost:5000/api/dashboard')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
    // Implement search functionality here
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <div className="profile">
          <FontAwesomeIcon icon={faUser} className="profile-icon" />
          <img src="/path/to/profile.png" alt="Profile" className="profile-img" />
          <span>John Doe</span>
          <a href="#" className="view-profile">View Profile</a>
        </div>
        <hr className="profile-divider" />
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </form>
        <nav className="menu">
          <a href="#" className="menu-item">
            <FontAwesomeIcon icon={faTachometerAlt} className="menu-icon" /> Dashboard
          </a>
          <a href="#" className="menu-item">
            <FontAwesomeIcon icon={faPlus} className="menu-icon" /> Add New Unit
          </a>
          <a href="#" className="menu-item">
            <FontAwesomeIcon icon={faCog} className="menu-icon" /> Manage Roles
          </a>
          <a href="#" className="menu-item">
            <FontAwesomeIcon icon={faUsers} className="menu-icon" /> User Management
          </a>
          <a href="#" className="menu-item">
            <FontAwesomeIcon icon={faFileContract} className="menu-icon" /> Contract
          </a>
        </nav>
        <div className="settings">
          <a href="#"><FontAwesomeIcon icon={faCog} /> Settings</a>
        </div>
      </aside>

      <main className="content">
        <header className="content-header">
          <h1>Dashboard</h1>
        </header>
        <section className="cards">
          <div className="card">
            <FontAwesomeIcon icon={faUser} className="card-icon" />
            <h2>{data.totalUsers}</h2>
            <p>Total Users</p>
          </div>
          <div className="card">
            <FontAwesomeIcon icon={faUsers} className="card-icon" />
            <h2>{data.activeUsers}</h2>
            <p>Active Users</p>
          </div>
          <div className="card">
            <FontAwesomeIcon icon={faUser} className="card-icon" />
            <h2>{data.totalLogins}</h2>
            <p>Total Logins</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
