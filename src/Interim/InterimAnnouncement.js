import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt, FaBold, FaItalic, FaUnderline, FaLink } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faClipboard, faCheck, faPlusCircle, faCogs } from '@fortawesome/free-solid-svg-icons';
import { getDocs, collection, addDoc, doc } from 'firebase/firestore';
import { rentmobileDb } from '../components/firebase.config'; // Import the correct firestore instance

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')};
  background-color: #f8f9fa;
  padding: 10px;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;  /* ADD THIS */
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 100;
  overflow: hidden;
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

const ProfileImage = styled.img`
  border-radius: 50%;
  width: 60px; /* Adjusted for better visibility */
  height: 60px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); // Subtle shadow for a polished look
`;

const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 3rem;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #eaeaea;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'Roboto', sans-serif;
  color: #333;

  h2 {
    text-align: center;
    color: #444;
    margin-bottom: 24px;
    font-weight: 600;
    font-size: 1.5rem;
  }
`;

const AnnouncementForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;

  label {
    font-size: 0.9rem;
    color: #555;
    margin-bottom: 5px;
    font-weight: 500;
  }

  input, textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #dcdcdc;
    border-radius: 8px;
    font-size: 0.95rem;
    background-color: #f9f9f9;
    transition: border-color 0.2s;

    &:focus {
      border-color: #007bff;
      outline: none;
      background-color: #fff;
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  .toggle-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  button {
    padding: 12px;
    font-size: 1rem;
    color: #fff;
    background-color: #28a745; /* Green color for button */
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #218838; /* Darker green on hover */
    }
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 1.2rem;
  color: #555;
  border-bottom: 1px solid #dcdcdc;
  padding-bottom: 8px;

  .icon {
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #007bff;
    }
  }
`;

const AnnouncementList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const AnnouncementItem = styled.li`
  background-color: #e9f7ef; /* Light green background */
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  h3 {
    margin: 0 0 8px;
    color: #333;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    color: #555;
  }

  .date,
  .author {
    font-size: 0.8rem;
    color: #888;
    margin-top: 8px;
  }

  .author {
    color: #007bff;
    font-weight: 500;
  }
`;

const ToggleSwitch = styled.input.attrs({ type: 'checkbox' })`
  margin-left: 10px;
`;

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const sidebarRef = useRef(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [date, setDate] = useState(new Date());
    const [author, setAuthor] = useState('');
    const [enableReadMore, setEnableReadMore] = useState(false);
    const [readMoreLabel, setReadMoreLabel] = useState('Read more');
    const [announcements, setAnnouncements] = useState([]);
    const contentRef = useRef(null);

    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleIconClick = (command) => {
        document.execCommand(command, false, null); // Apply style to selected text
    };

    const handleLinkClick = () => {
        const url = prompt('Enter the URL');
        if (url) {
            document.execCommand('createLink', false, url);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
            if (loggedInUserData) {
                const usersCollection = collection(rentmobileDb, 'users');
                const userDocs = await getDocs(usersCollection);
                const users = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const currentUser = users.find(user => user.email === loggedInUserData.email);
                setLoggedInUser(currentUser || loggedInUserData);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            const querySnapshot = await getDocs(collection(rentmobileDb, "announcements"));
            const announcementsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnnouncements(announcementsData);
        };

        fetchAnnouncements();
    }, []);

    const handleClickOutside = (event) => {
        // Handle click outside logic if needed
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const docRef = await addDoc(collection(rentmobileDb, "announcements"), {
                title,
                content,
                date,
                author
            });
            console.log("Document written with ID: ", docRef.id);
            setTitle('');
            setContent('');
            setDate(new Date());
            setAuthor('Admin');
            // Fetch announcements again to update the list
            const querySnapshot = await getDocs(collection(rentmobileDb, "announcements"));
            const announcementsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnnouncements(announcementsData);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown

    const handleLogout = () => {
        localStorage.removeItem('userData');
        navigate('/login');
    };

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

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
                    <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <FontAwesomeIcon icon={faHome} className="icon" />
                            <span>Dashboard</span>
                        </SidebarItem>
                    </Link>

                    <Link to="/list" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <FontAwesomeIcon icon={faShoppingCart} className="icon" />
                            <span>List of Vendors</span>
                        </SidebarItem>
                    </Link>
                    <Link to="/listofstalls" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <FontAwesomeIcon icon={faClipboard} className="icon" />
                            <span>List of Stalls</span>
                        </SidebarItem>
                    </Link>

                    <SidebarItem isSidebarOpen={isSidebarOpen} onClick={handleDropdownToggle}>
                        <FontAwesomeIcon icon={faUser} className="icon" />
                        <span>User Management</span>
                    </SidebarItem>

                    {isDropdownOpen && (
                        <ul style={{ paddingLeft: '20px', listStyleType: 'none' }}>
                            <Link to="/usermanagement" style={{ textDecoration: 'none' }}>
                                <li>
                                    <SidebarItem isSidebarOpen={isSidebarOpen}>
                                        <FontAwesomeIcon icon={faSearch} className="icon" />
                                        <span>View Users</span>
                                    </SidebarItem>
                                </li>
                            </Link>
                            <Link to="/newuser" style={{ textDecoration: 'none' }}>
                                <li>
                                    <SidebarItem isSidebarOpen={isSidebarOpen}>
                                        <FontAwesomeIcon icon={faPlus} className="icon" />
                                        <span>Add User</span>
                                    </SidebarItem>
                                </li>
                            </Link>
                        </ul>
                    )}

                    <Link to="/viewunit" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <FontAwesomeIcon icon={faPlus} className="icon" />
                            <span>Add New Unit</span>
                        </SidebarItem>
                    </Link>

                    <Link to="/appraise" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <FontAwesomeIcon icon={faUsers} className="icon" />
                            <span>Manage Appraisal</span>
                        </SidebarItem>
                    </Link>
                    <Link to="/contract" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <FontAwesomeIcon icon={faFileContract} className="icon" />
                            <span>Contract</span>
                        </SidebarItem>
                    </Link>

                    <Link to="/ticket" style={{ textDecoration: 'none' }}>
                        <SidebarItem isSidebarOpen={isSidebarOpen}>
                            <FontAwesomeIcon icon={faTicketAlt} className="icon" />
                            <span>Manage Ticket</span>
                        </SidebarItem>
                    </Link>
                    <SidebarItem isSidebarOpen={isSidebarOpen} onClick={handleDropdownToggle}>
                        <FontAwesomeIcon icon={faCogs} className="icon" />
                        <span>Manage Zone</span>
                    </SidebarItem>

                    {isDropdownOpen && (
                        <ul style={{ paddingLeft: '20px', listStyleType: 'none' }}>
                            <Link to="/addzone" style={{ textDecoration: 'none' }}>
                                <li>
                                    <SidebarItem isSidebarOpen={isSidebarOpen}>
                                        <FontAwesomeIcon icon={faPlusCircle} className="icon" />
                                        <span> Add Zone</span>
                                    </SidebarItem>
                                </li>
                            </Link>
                            <Link to="/viewzone" style={{ textDecoration: 'none' }}>
                                <li>
                                    <SidebarItem isSidebarOpen={isSidebarOpen}>
                                        <FontAwesomeIcon icon={faSearch} className="icon" />
                                        <span> View Zone</span>
                                    </SidebarItem>
                                </li>
                            </Link>

                        </ul>
                    )}
                    <SidebarItem isSidebarOpen={isSidebarOpen} onClick={handleDropdownToggle}>
                        <FontAwesomeIcon icon={faUser} className="icon" />
                        <span>Manage Space</span>
                    </SidebarItem>

                    {isDropdownOpen && (
                        <ul style={{ paddingLeft: '20px', listStyleType: 'none' }}>
                            <Link to="/addspace" style={{ textDecoration: 'none' }}>
                                <li>
                                    <SidebarItem isSidebarOpen={isSidebarOpen}>
                                        <FontAwesomeIcon icon={faPlusCircle} className="icon" />
                                        <span> Add Space</span>
                                    </SidebarItem>
                                </li>
                            </Link>
                            <Link to="/viewspace" style={{ textDecoration: 'none' }}>
                                <li>
                                    <SidebarItem isSidebarOpen={isSidebarOpen}>
                                        <FontAwesomeIcon icon={faSearch} className="icon" />
                                        <span> View Space</span>
                                    </SidebarItem>
                                </li>
                            </Link>
                            <Link to="/addcollector" style={{ textDecoration: 'none' }}>
                                <li>
                                    <SidebarItem isSidebarOpen={isSidebarOpen}>
                                        <FontAwesomeIcon icon={faPlus} className="icon" />
                                        <span>Add Ambulant Collector</span>
                                    </SidebarItem>
                                </li>
                            </Link>
                        </ul>
                    )}
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

                <br></br>

                <ToggleButton isSidebarOpen={isSidebarOpen} onClick={toggleSidebar}>
                    <FaBars />
                </ToggleButton>

                <FormContainer>
                    <h2>Create Announcement</h2>
                    <AnnouncementForm onSubmit={handleSubmit}>
                        <div>
                            <label>Title:</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>

                        <div>
                            <label>Content:</label>
                            <Toolbar>
                                <span className="icon" onClick={() => handleIconClick('bold')}><FaBold /></span>
                                <span className="icon" onClick={() => handleIconClick('italic')}><FaItalic /></span>
                                <span className="icon" onClick={() => handleIconClick('underline')}><FaUnderline /></span>
                                <span className="icon" onClick={handleLinkClick}><FaLink /></span>
                            </Toolbar>
                            <textarea
                                ref={contentRef}
                                contentEditable
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        </div>

                        <div className="toggle-container">
                            <label>Enable Read More:</label>
                            <ToggleSwitch checked={enableReadMore} onChange={(e) => setEnableReadMore(e.target.checked)} />
                        </div>

                        {enableReadMore && (
                            <div>
                                <label>Read more - button label:</label>
                                <input type="text" value={readMoreLabel} onChange={(e) => setReadMoreLabel(e.target.value)} placeholder="Read more" />
                            </div>
                        )}

                        <div>
                            <label>Date:</label>
                            <input type="date" value={date.toISOString().split('T')[0]} onChange={(e) => setDate(new Date(e.target.value))} required />
                        </div>

                        <div>
                            <label>Author:</label>
                            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required />
                        </div>

                        <button type="submit">Add Announcement</button>
                    </AnnouncementForm>

                    <h2>Announcements</h2>
                       <AnnouncementList>
                    {announcements.map((announcement) => (
                        <AnnouncementItem key={announcement.id}>
                            <h3>{announcement.title}</h3>
                            <p>{announcement.content}</p>
                            <p className="date">
                                Date: {announcement.date && announcement.date.seconds 
                                    ? new Date(announcement.date.seconds * 1000).toLocaleDateString()
                                    : 'No date available'}
                            </p>
                            <p className="author">Author: {announcement.author}</p>
                        </AnnouncementItem>
                    ))}
                </AnnouncementList>

                </FormContainer>
            </MainContent>
        </DashboardContainer>
    );
};

export default Dashboard;
