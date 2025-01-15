import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faPen,
  faTrash

} from "@fortawesome/free-solid-svg-icons";
import { rentmobileDb } from "../components/firebase.config";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import IntSidenav from "./IntSidenav";

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
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

const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 10px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;

  h3 {
    margin-bottom: 1rem;
    font-size: 1.6rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    border: 1px solid #ddd;

    th, td {
      padding: 15px;
      text-align: left;
      border-bottom: 2px solid #dee2e6;
      transition: background-color 0.2s ease;
    }

    th {
      background-color: #e9ecef;
      font-weight: bold;
      color: #495057;
    }

    td {
      background-color: #fff;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    tr:hover {
      background-color: #f1f3f5;
    }

    .actions {
      margin-left: 0px;
      display: flex;
      justify-content: left;
      gap: 15px;
    }

    .icon {
      margin-left: 10px;
      font-size: 20px;
      color: #007bff;
      justify-content: left;
      cursor: pointer;
      transition: color 0.3s ease;

      &:hover {
        color: #0056b3;
      }
    }
  }
`;

const AppBar = styled.div`
  display: left;
  align-items: center;
  justify-content: space-between;
  padding: 40px 50px;
  background-color: #188423;
  color: white;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  font-size: 22px;
  font-family: "Inter", sans-serif;
  font-weight: bold;
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 20px;
  margin-bottom: 20px;
  margin-top: -25px;
  display: ${({ isSidebarOpen }) => (isSidebarOpen ? "flex" : "none")};
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
`;

const SearchButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const AddTicketButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }

  .icon {
    margin-right: 10px;
    font-size: 1.2rem;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  margin: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 1rem;
`;

const CancelButton = styled(ModalButton)`
  background-color: #6c757d;
  color: white;

  &:hover {
    background-color: #5a6268;
  }
`;

const EditButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  margin-right: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #218838;
  }
`;

const DeleteButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #c82333;
  }
`;

const ButtonDelete = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #c82333;
  }
`;

const ButtonCancel = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #5a6268;
  }
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [rates, setRates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRateId, setSelectedRateId] = useState(null);

  useEffect(() => {
    const checkAndCreateRateCollection = async () => {
      try {
        const ratesCollection = collection(rentmobileDb, "rate");
        const ratesSnapshot = await getDocs(ratesCollection);

        if (ratesSnapshot.empty) {
          await setDoc(doc(ratesCollection), {});
        }

        const ratesList = ratesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRates(ratesList);
      } catch (error) {
        console.error("Error checking/creating rate collection: ", error);
      }
    };

    checkAndCreateRateCollection();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log("Fetching user data");
      const loggedInUserData = JSON.parse(localStorage.getItem("userData"));
      if (loggedInUserData) {
        const usersCollection = collection(rentmobileDb, "admin_users");
        const userDocs = await getDocs(usersCollection);
        const users = userDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const currentUser = users.find(
          (user) => user.email === loggedInUserData.email
        );
        setLoggedInUser(currentUser || loggedInUserData);
        console.log("User data fetched:", currentUser || loggedInUserData);
      } else {
        console.log("No user data found in localStorage");
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleEdit = (id) => {
    navigate(`/ticketEdit/${id}`);
  };

  const fetchRates = async () => {
    try {
      const ratesCollection = collection(rentmobileDb, "rate");
      const ratesSnapshot = await getDocs(ratesCollection);
      const ratesList = ratesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRates(ratesList);
    } catch (error) {
      console.error("Error fetching rates: ", error);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const handleAddTicket = () => {
    setLoading(true);
    navigate("/newticket");
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

  const handleMainContentClick = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    console.log("handleLogout called");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  const openModal = (id) => {
    setSelectedRateId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRateId(null);
  };

  const handleDelete = async (id) => {
    try {
      const rateDocRef = doc(rentmobileDb, "rate", id);
      await deleteDoc(rateDocRef);
      setRates(rates.filter((rate) => rate.id !== id));
      closeModal();
    } catch (error) {
      console.error("Error deleting rate: ", error);
    }
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(
        query(collection(rentmobileDb, "rate"), where("name", ">=", searchTerm), where("name", "<=", searchTerm + "\uf8ff"))
      );

      const filteredRates = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRates(filteredRates);
    } catch (error) {
      console.error("Error searching rates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      } else {
        fetchRates();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <DashboardContainer>
      <div ref={sidebarRef}>
        <IntSidenav
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
          <div className="title">OFFICE OF THE CITY MARKETS</div>
        </AppBar>

        <FormContainer>
          <h3>Manage Rates</h3>
          {/* Search Input and Button */}
          <div style={{ display: "flex", marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Search by Ticket Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "10px",
                flex: "1",
                marginRight: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <SearchButton onClick={handleSearch} disabled={loading}>
              <FontAwesomeIcon icon={faSearch} />
            </SearchButton>
          </div>
          <AddTicketButton onClick={handleAddTicket} disabled={loading}>
            {loading ? "Loading..." : "Add New Ticket"}
          </AddTicketButton>
          <table>
            <thead>
              <tr>
                <th>TICKET NAME</th>
                <th>RATES</th>
                <th>DATE ISSUED</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr key={rate.id}>
                  <td>{rate.name || "N/A"}</td>
                  <td>{rate.rate || "N/A"}</td>
                  <td>
                    {rate.dateIssued && rate.dateIssued.seconds
                      ? new Date(
                          rate.dateIssued.seconds * 1000
                        ).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="actions">
                    <EditButton onClick={() => handleEdit(rate.id)}>
                      <FontAwesomeIcon
                        icon={faPen}
                        style={{ marginRight: "5px" }}
                      />
                      Edit
                    </EditButton>
                    <DeleteButton onClick={() => openModal(rate.id)}>
                      <FontAwesomeIcon
                        icon={faTrash}
                        style={{ marginRight: "5px" }}
                      />
                      Delete
                    </DeleteButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isModalOpen && (
            <ModalOverlay>
              <ModalContainer>
                <h3>Are you sure you want to delete this rate?</h3>
                <ButtonDelete onClick={() => handleDelete(selectedRateId)}>
                  Delete
                </ButtonDelete>
                <ButtonCancel onClick={closeModal}>Cancel</ButtonCancel>
              </ModalContainer>
            </ModalOverlay>
          )}
        </FormContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
