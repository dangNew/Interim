import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaBars, FaSearch } from "react-icons/fa";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  getDoc,
  addDoc,
  query,
  where,
  limit,
} from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config";
import SideNav from "./side_nav";

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f5f7;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "70px")};
  padding-left: 40px;
  background-color: #fff;
  width: 100%;
  transition: margin-left 0.3s ease;
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

const VendorListContainer = styled.div`
  margin-top: 20px;
`;

const VendorItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
  background-color: #fff;
`;

const VendorInfo = styled.div`
  flex: 1;
  cursor: pointer;
  color: black;
  text-decoration: none;
`;

const ActionButton = styled.button`
  background-color: ${({ action }) =>
    action === "approve" ? "#4CAF50" : "#F44336"};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 20px;
  width: 900px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
  font-size: 16px;
  color: #333;
`;

const FilterButton = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  background-color: #188423;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #145c17;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 40px;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 200px;

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;

    li {
      padding: 10px;
      cursor: pointer;

      &:hover {
        background-color: #f0f0f0;
      }
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const ModalButton = styled.button`
  background-color: #188423;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background-color: #145c17;
  }
`;

const CancelButton = styled(ModalButton)`
  background-color: red;
  margin-left: 10px;

  &:hover {
    background-color: gray;
  }
`;

const declineReasons = [
  "Document requested not uploaded",
  "Uploaded fake ID",
  "Incomplete application",
  "Incorrect information provided",
  "Application does not meet criteria",
  "Fake Information",
];

const VendorVerification = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [unitNames, setUnitNames] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentVendorId, setCurrentVendorId] = useState(null);
  const [actionType, setActionType] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [selectedDeclineReason, setSelectedDeclineReason] = useState("");
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const loggedInUserData = JSON.parse(localStorage.getItem("userData"));
    if (loggedInUserData) {
      setLoggedInUser(loggedInUserData);
    }

    const fetchPendingVendors = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(rentmobileDb, "Vendorusers")
        );
        const allVendors = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const pendingVendors = allVendors.filter(
          (vendor) => vendor.status?.toLowerCase() === "pending"
        );
        setVendors(pendingVendors);
        setFilteredVendors(pendingVendors);
      } catch (error) {
        console.error("Error fetching pending vendors:", error);
      }
    };

    const fetchUnitNames = async () => {
      const unitSnapshot = await getDocs(collection(rentmobileDb, "unit"));
      const units = unitSnapshot.docs.map((doc) => doc.data().unitName);
      setUnitNames(units);
    };

    fetchPendingVendors();
    fetchUnitNames();
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      const userLocation = loggedInUser.location;
      let updatedVendors = vendors.filter(
        (vendor) =>
          vendor.stallInfo?.location?.toLowerCase() ===
          userLocation.toLowerCase()
      );

      if (searchQuery) {
        updatedVendors = updatedVendors.filter((vendor) =>
          `${vendor.firstName} ${vendor.middleName} ${vendor.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      }

      if (selectedLocation !== "All Locations") {
        updatedVendors = updatedVendors.filter(
          (vendor) =>
            vendor.stallInfo?.location?.toLowerCase() ===
            selectedLocation.toLowerCase()
        );
      }

      setFilteredVendors(updatedVendors);
    }
  }, [searchQuery, selectedLocation, vendors, loggedInUser]);

  const handleApprove = async (vendorId) => {
    try {
      // Reference to the vendor's document in 'Vendorusers' collection
      const vendorRef = doc(rentmobileDb, "Vendorusers", vendorId);

      // Update the vendor's status and stall info status
      await updateDoc(vendorRef, {
        status: "accepted",
        "stallInfo.status": "Occupied",
      });

      // Fetch vendor data to access the associated stall ID
      const vendorSnapshot = await getDoc(vendorRef);
      const vendorData = vendorSnapshot.data();
      const stallId = vendorData.stallId;

      // Reference to the vendor's stall document in 'Stall' collection
      const stallDocRef = doc(rentmobileDb, "Stall", stallId);

      // Update the stall status to 'Occupied'
      await updateDoc(stallDocRef, { status: "Occupied" });

      // Log the approved vendor to a new 'approvedVendors' collection
      await setDoc(doc(rentmobileDb, "approvedVendors", vendorId), {
        ...vendorData,
        approvedBy: loggedInUser.email,
        approvedAt: new Date(),
      });

      // Update the vendor lists to remove the approved vendor from pending list
      setVendors(vendors.filter((vendor) => vendor.id !== vendorId));
      setFilteredVendors(
        filteredVendors.filter((vendor) => vendor.id !== vendorId)
      );

      // Fetch billing configuration
      const billingConfigSnapshot = await getDocs(
        collection(rentmobileDb, "billingconfig")
      );
      const billingConfig = billingConfigSnapshot.docs.reduce((acc, doc) => {
        acc[doc.data().title] = doc.data();
        return acc;
      }, {});

      // Calculate the due date and start date based on the current date and billing cycle
      const approvedAtDate = new Date();
      const billingCycle = vendorData.billingCycle;
      let dueDate, startDate;

      // Set the start date to the next day after the approvedAt date
      startDate = new Date(approvedAtDate);
      startDate.setDate(approvedAtDate.getDate() + 1);
      startDate.setHours(0, 0, 0, 0);

      if (billingCycle === "Daily") {
        dueDate = new Date(startDate);
        dueDate.setHours(23, 59, 59, 999);
      } else if (billingCycle === "Weekly") {
        dueDate = new Date(startDate);
        dueDate.setDate(
          startDate.getDate() + ((1 + 7 - startDate.getDay()) % 7)
        );
        dueDate.setHours(23, 59, 59, 999);
      } else if (billingCycle === "Monthly") {
        const lastDayOfMonth = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          0
        );
        const nextMonth = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          7
        );
        dueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 7);
        dueDate.setHours(23, 59, 59, 999);
      }

      // Calculate the number of days
      const noOfDays = Math.ceil((dueDate - startDate) / (1000 * 60 * 60 * 24));

      // Calculate the daily payment
      const ratePerMeter = billingConfig["RateperMeter"].value1;
      const stallSize = vendorData.stallInfo.stallSize;
      const dailyPayment = ratePerMeter * stallSize;

      // Calculate the amount
      const amount = dailyPayment * noOfDays;

      // Calculate the garbage fee
      const garbageFee = billingConfig["Garbage Fee"].value1 * noOfDays;

      // Calculate the total
      let total = amount + garbageFee;

      // Initialize penalty, surcharge, interestRate, and amountIntRate
      let penalty = 0;
      let surcharge = 0;
      let interestRate = 0;
      let amountIntRate = 0;

      // Calculate the penalty if the vendor status is overdue
      if (vendorData.status === "Overdue") {
        const penaltyPercentage =
          billingConfig["Penalty"][
            `value${
              billingCycle === "Daily" ? 3 : billingCycle === "Weekly" ? 2 : 1
            }`
          ];
        penalty = penaltyPercentage;
        surcharge = (amount + garbageFee) * (penaltyPercentage / 100);
        total += surcharge;
      }

      // Calculate the interest rate if the payment is overdue
      if (vendorData.status === "Overdue") {
        interestRate =
          billingConfig["Interest Rate"][
            `value${
              billingCycle === "Daily" ? 3 : billingCycle === "Weekly" ? 2 : 1
            }`
          ] / 100;
        amountIntRate = total * interestRate;
        total += amountIntRate;
      }

      // Store the current payment in the stall_payment collection with an auto ID
      const paymentDocRef = await addDoc(
        collection(rentmobileDb, "stall_payment"),
        {
          vendorId,
          firstName: vendorData.firstName,
          middleName: vendorData.middleName,
          lastName: vendorData.lastName,
          status: "Pending",
          currentDate: new Date(),
          startDate,
          dueDate,
          noOfDays,
          dailyPayment,
          amount,
          garbageFee,
          penalty,
          surcharge,
          total,
          interestRate,
          amountIntRate,
          billingCycle, // Store the billing cycle
        }
      );

      setIsSuccessModal(true);
      setSuccessMessage("Vendor approved successfully!");
    } catch (error) {
      console.error("Error approving vendor:", error);
    }
  };

  const handleDecline = async () => {
    try {
      const vendorRef = doc(rentmobileDb, "Vendorusers", currentVendorId);
      await updateDoc(vendorRef, { status: "declined" });

      const vendorSnapshot = await getDoc(vendorRef);
      const vendorData = vendorSnapshot.data();

      // Check if the 'declinedVendors' collection exists
      const declinedVendorsCollection = collection(
        rentmobileDb,
        "declinedVendors"
      );
      const declinedVendorsSnapshot = await getDocs(declinedVendorsCollection);

      if (declinedVendorsSnapshot.empty) {
        // Create the 'declinedVendors' collection if it does not exist
        await setDoc(doc(rentmobileDb, "declinedVendors", currentVendorId), {
          ...vendorData,
          reason: selectedDeclineReason || declineReason,
          declinedBy: loggedInUser.email,
          declinedAt: new Date(),
        });
      } else {
        // Add the declined vendor to the existing 'declinedVendors' collection
        await setDoc(doc(rentmobileDb, "declinedVendors", currentVendorId), {
          ...vendorData,
          reason: selectedDeclineReason || declineReason,
          declinedBy: loggedInUser.email,
          declinedAt: new Date(),
        });
      }

      // Update the stall status to "Available"
      const stallId = vendorData.stallId;
      const stallDocRef = doc(rentmobileDb, "Stall", stallId);
      await updateDoc(stallDocRef, { status: "Available" });

      setVendors(vendors.filter((vendor) => vendor.id !== currentVendorId));
      setFilteredVendors(
        filteredVendors.filter((vendor) => vendor.id !== currentVendorId)
      );

      setDeclineReason("");
      setSelectedDeclineReason("");
      setShowDeclineModal(false);

      setIsSuccessModal(true);
      setSuccessMessage("Vendor declined successfully!");
    } catch (error) {
      console.error("Error declining vendor:", error);
    }
  };

  const handleAction = (action) => {
    if (action === "approve") {
      handleApprove(currentVendorId);
    } else if (action === "decline") {
      handleDecline();
    } else if (action === "request") {
      handleRequestInfoOpen(); // Open the request dialog
    }
    setShowModal(false);

    if (action === "decline") {
      setIsSuccessModal(true);
      setSuccessMessage("Declined vendor successfully!");
    }
  };

  const handleRequestInfoOpen = () => {
    // Logic to open the request information dialog or modal
    console.log("Request information dialog opened");
  };

  return (
    <DashboardContainer>
      <SideNav isSidebarOpen={isSidebarOpen} loggedInUser={loggedInUser} />
      <ToggleButton onClick={toggleSidebar}>
        <FaBars />
      </ToggleButton>
      <MainContent isSidebarOpen={isSidebarOpen}>
        <AppBar>
          <div>Vendor Verification</div>
        </AppBar>

        <FormContainer>
          <FilterContainer>
            <SearchBarContainer>
              <FaSearch />
              <SearchInput
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchBarContainer>
            <FilterButton>
              <DropdownButton
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedLocation}
              </DropdownButton>
              {isDropdownOpen && (
                <DropdownMenu>
                  <ul>
                    <li
                      onClick={() => {
                        setSelectedLocation("All Locations");
                        setIsDropdownOpen(false);
                      }}
                    >
                      All Locations
                    </li>
                    {unitNames.map((unit) => (
                      <li
                        key={unit}
                        onClick={() => {
                          setSelectedLocation(unit);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {unit}
                      </li>
                    ))}
                  </ul>
                </DropdownMenu>
              )}
            </FilterButton>
          </FilterContainer>

          <VendorListContainer>
            {filteredVendors.map((vendor) => (
              <VendorItem key={vendor.id}>
                <VendorInfo
                  onClick={() => navigate(`/edit-verification/${vendor.id}`)}
                >
                  {vendor.firstName} {vendor.middleName} {vendor.lastName}
                </VendorInfo>
                <div>
                  <ActionButton
                    action="approve"
                    onClick={() => {
                      setCurrentVendorId(vendor.id);
                      setActionType("approve");
                      setShowModal(true);
                    }}
                  >
                    Approve
                  </ActionButton>
                  <ActionButton
                    action="decline"
                    onClick={() => {
                      setCurrentVendorId(vendor.id);
                      setActionType("decline");
                      setShowDeclineModal(true);
                    }}
                  >
                    Decline
                  </ActionButton>
                </div>
              </VendorItem>
            ))}
          </VendorListContainer>
        </FormContainer>

        {showModal && (
          <ModalOverlay>
            <ModalContainer>
              <h2>
                {actionType === "approve" ? "Approve Vendor" : "Decline Vendor"}
              </h2>
              <p>Are you sure you want to {actionType} this vendor?</p>
              <ModalButton onClick={() => handleAction(actionType)}>
                Confirm
              </ModalButton>
              <CancelButton onClick={() => setShowModal(false)}>
                Cancel
              </CancelButton>
            </ModalContainer>
          </ModalOverlay>
        )}

        {showDeclineModal && (
          <ModalOverlay>
            <ModalContainer>
              <h2>Decline Vendor</h2>
              <p>Select a reason for declining:</p>
              <select
                value={selectedDeclineReason}
                onChange={(e) => setSelectedDeclineReason(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                }}
              >
                <option value="">Select a reason</option>
                {declineReasons.map((reason, index) => (
                  <option key={index} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              <textarea
                rows="4"
                value={declineReason}
                onChange={(e) => {
                  if (e.target.value.split(/\s+/).length <= 100) {
                    setDeclineReason(e.target.value);
                  }
                }}
                placeholder="Optional: Enter additional reason here (max 100 words)"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
              <ModalButton
                onClick={handleDecline}
                disabled={!selectedDeclineReason && !declineReason}
              >
                Confirm Decline
              </ModalButton>
              <CancelButton onClick={() => setShowDeclineModal(false)}>
                Cancel
              </CancelButton>
            </ModalContainer>
          </ModalOverlay>
        )}

        {isSuccessModal && (
          <ModalOverlay>
            <ModalContainer>
              <h2>{successMessage}</h2>
              <ModalButton onClick={() => setIsSuccessModal(false)}>
                OK
              </ModalButton>
            </ModalContainer>
          </ModalOverlay>
        )}

        {showSuccessDialog && (
          <ModalOverlay>
            <ModalContainer>
              <h2>Success!</h2>
              <p>Your request has been successfully submitted.</p>
              <ModalButton onClick={() => setShowSuccessDialog(false)}>
                Close
              </ModalButton>
            </ModalContainer>
          </ModalOverlay>
        )}
      </MainContent>
    </DashboardContainer>
  );
};

export default VendorVerification;
