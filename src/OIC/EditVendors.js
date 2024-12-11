import React, { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import {
  getDoc,
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
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
  padding: 2rem;
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

const VendorDetailsContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
`;

const FieldGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 90%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  ${({ disabled }) =>
    disabled && "background-color: #f0f0f0; cursor: not-allowed;"}
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const SaveButton = styled.button`
  background-color: #188423;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  margin-right: 10px;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const BackButton = styled.button`
  background-color: #ccc;
  color: black;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
`;

const ImagePreview = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-top: 10px;
  cursor: pointer;
`;

const PlaceholderAvatar = styled.div`
  width: 100px;
  height: 100px;
  background-color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: green;
`;

const TimelineContainer = styled.div`
  margin-top: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  background-color: #f9f9f9;
`;

const TimelineItem = styled.div`
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const DocumentContainer = styled.div`
  margin-top: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  background-color: #f9f9f9;
`;

const DocumentItem = styled.div`
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DocumentButton = styled.button`
  background-color: ${({ approve }) => (approve ? "#188423" : "#cc0000")};
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 500px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ModalButton = styled.button`
  background-color: #188423;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
`;

const ImageModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ImageModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 50%; // Adjusted to 50% of the viewport width
  max-height: 50%; // Adjusted to 50% of the viewport height
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImageModal = styled.img`
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
`;

const EditVendors = () => {
  const { Id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [declineMessage, setDeclineMessage] = useState("");
  const [isBillingCycleEditable, setIsBillingCycleEditable] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchVendorData = async () => {
      const vendorDoc = await getDoc(doc(rentmobileDb, "approvedVendors", Id));
      if (vendorDoc.exists()) {
        setVendor(vendorDoc.data());
        setDocuments(vendorDoc.data().Documents || []);
      } else {
        console.log("No such vendor!");
      }
    };

    fetchVendorData();
  }, [Id]);

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData) {
        setLoggedInUser(userData);
      }
    };

    fetchLoggedInUser();
  }, []);

  useEffect(() => {
    const fetchBillingConfig = async () => {
      const billingConfigCollection = collection(rentmobileDb, "billingconfig");
      const q = query(
        billingConfigCollection,
        where("title", "==", "RateperMeter")
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setVendor((prevVendor) => ({
          ...prevVendor,
          stallInfo: {
            ...prevVendor.stallInfo,
            ratePerMeter: doc.data().value1,
          },
        }));
      });
    };

    fetchBillingConfig();
  }, []);

  useEffect(() => {
    const checkBillingCycleEditable = async () => {
      const stallPaymentCollection = collection(rentmobileDb, "stall_payment");
      const q = query(
        stallPaymentCollection,
        where("vendorId", "==", Id),
        where("status", "==", "Overdue")
      );
      const querySnapshot = await getDocs(q);
      setIsBillingCycleEditable(querySnapshot.empty);
    };

    checkBillingCycleEditable();
  }, [Id]);

  const handleSave = async () => {
    try {
      await updateDoc(doc(rentmobileDb, "approvedVendors", Id), vendor);
      setSuccessMessage("Vendor details updated successfully!");
      setShowModal(true);
      setIsEditing(false); // Revert to display mode
    } catch (error) {
      console.error("Error updating vendor:", error);
      setSuccessMessage("Error updating vendor details. Please try again.");
      setShowModal(true);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleImageClick = (url) => {
    setImageUrl(url);
    setShowImageModal(true);
  };

  const handleImageModalClose = () => {
    setShowImageModal(false);
  };

  const handleInputChange = (field, value) => {
    setVendor((prevVendor) => {
      const updatedVendor = { ...prevVendor, [field]: value };
      setIsEditing(
        JSON.stringify(updatedVendor) !== JSON.stringify(prevVendor)
      );
      return updatedVendor;
    });
  };

  const handleStallInfoChange = (field, value) => {
    setVendor((prevVendor) => {
      const updatedVendor = {
        ...prevVendor,
        stallInfo: { ...prevVendor.stallInfo, [field]: value },
      };
      setIsEditing(
        JSON.stringify(updatedVendor) !== JSON.stringify(prevVendor)
      );
      return updatedVendor;
    });
  };

  const handleDocumentAction = async (docIndex, action) => {
    if (action === "decline") {
      setShowDeclineModal(true);
      setDeclineMessage(docIndex);
    } else if (action === "approve") {
      try {
        await updateDoc(doc(rentmobileDb, "approvedVendors", Id), {
          [`Documents.${docIndex}.status`]: "approved",
          [`Documents.${docIndex}.sentdocs`]: documents[docIndex].sentdocs, // Ensure sentdocs is preserved
        });
        setSuccessMessage("Document approved successfully!");
        setShowModal(true);
      } catch (error) {
        console.error("Error approving document:", error);
        setSuccessMessage("Error approving document. Please try again.");
        setShowModal(true);
      }
    }
  };

  const handleDeclineSubmit = async () => {
    try {
      await updateDoc(doc(rentmobileDb, "approvedVendors", Id), {
        [`Documents.${declineMessage}.status`]: "declined",
        [`Documents.${declineMessage}.message`]: declineReason,
        [`Documents.${declineMessage}.sentdocs`]:
          documents[declineMessage].sentdocs, // Ensure sentdocs is preserved
      });
      setSuccessMessage("Document declined successfully!");
      setShowModal(true);
      setShowDeclineModal(false);
    } catch (error) {
      console.error("Error declining document:", error);
      setSuccessMessage("Error declining document. Please try again.");
      setShowModal(true);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const getFileIcon = (fileExtension) => {
    switch (fileExtension.toLowerCase()) {
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "webp":
        return "📸";
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📄";
      case "html":
        return "🌐";
      case "odt":
        return "📄";
      case "xls":
      case "xlsx":
        return "📊";
      case "txt":
        return "📝";
      default:
        return "📁";
    }
  };

  const getFileNameFromUrl = (url) => {
    const urlParts = url.split("/");
    return urlParts[urlParts.length - 1].split("?")[0];
  };

  return (
    <DashboardContainer>
      <SideNav isSidebarOpen={isSidebarOpen} loggedInUser={loggedInUser} />
      <ToggleButton onClick={toggleSidebar}>
        <FaBars />
      </ToggleButton>
      <MainContent isSidebarOpen={isSidebarOpen}>
        <AppBar>
          <div>Edit Vendor Details</div>
          <Button onClick={() => navigate(-1)} sx={{ color: "white" }}>
            Back
          </Button>
        </AppBar>
        {vendor && (
          <VendorDetailsContainer>
            <FieldGroup>
              <Label>Profile Image</Label>
              {vendor.profileImageUrls && vendor.profileImageUrls.length > 0 ? (
                <ImagePreview
                  src={vendor.profileImageUrls[0]}
                  alt="Profile"
                  onClick={() => handleImageClick(vendor.profileImageUrls[0])}
                />
              ) : (
                <PlaceholderAvatar>
                  <span role="img" aria-label="user">
                    👤
                  </span>
                </PlaceholderAvatar>
              )}
            </FieldGroup>
            <FieldGroup>
              <Label>Email</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={vendor.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              ) : (
                <p>{vendor.email}</p>
              )}
            </FieldGroup>
            <FieldGroup>
              <Label>First Name</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={vendor.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                />
              ) : (
                <p>{vendor.firstName}</p>
              )}
            </FieldGroup>
            <FieldGroup>
              <Label>Middle Name</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={vendor.middleName}
                  onChange={(e) =>
                    handleInputChange("middleName", e.target.value)
                  }
                />
              ) : (
                <p>{vendor.middleName}</p>
              )}
            </FieldGroup>
            <FieldGroup>
              <Label>Last Name</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={vendor.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                />
              ) : (
                <p>{vendor.lastName}</p>
              )}
            </FieldGroup>
            <FieldGroup>
              <Label>Contact Number</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={vendor.contactNumber}
                  onChange={(e) =>
                    handleInputChange("contactNumber", e.target.value)
                  }
                />
              ) : (
                <p>{vendor.contactNumber}</p>
              )}
            </FieldGroup>
            <FieldGroup>
              <Label>Barangay</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={vendor.barangay}
                  onChange={(e) =>
                    handleInputChange("barangay", e.target.value)
                  }
                />
              ) : (
                <p>{vendor.barangay}</p>
              )}
            </FieldGroup>
            <FieldGroup>
              <Label>City</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={vendor.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              ) : (
                <p>{vendor.city}</p>
              )}
            </FieldGroup>
            <FieldGroup>
              <Label>Stall Location</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={vendor.stallInfo.location}
                  onChange={(e) =>
                    handleStallInfoChange("location", e.target.value)
                  }
                />
              ) : (
                <p>{vendor.stallInfo.location}</p>
              )}
            </FieldGroup>
            <FieldGroup>
              <Label>Stall Number</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={vendor.stallInfo.stallNumber}
                  onChange={(e) =>
                    handleStallInfoChange("stallNumber", e.target.value)
                  }
                />
              ) : (
                <p>{vendor.stallInfo.stallNumber}</p>
              )}
            </FieldGroup>
            <FieldGroup>
              <Label>Rate Per Meter</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={vendor.stallInfo.ratePerMeter}
                  onChange={(e) =>
                    handleStallInfoChange("ratePerMeter", e.target.value)
                  }
                />
              ) : (
                <p>{vendor.stallInfo.ratePerMeter}</p>
              )}
            </FieldGroup>
            <FieldGroup>
              <Label>Stall Size</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={vendor.stallInfo.stallSize}
                  onChange={(e) =>
                    handleStallInfoChange("stallSize", e.target.value)
                  }
                />
              ) : (
                <p>{vendor.stallInfo.stallSize}</p>
              )}
            </FieldGroup>
            <FieldGroup>
              <Label>Billing Cycle</Label>
              {isEditing && isBillingCycleEditable ? (
                <Input
                  type="text"
                  value={vendor.billingCycle}
                  onChange={(e) =>
                    handleInputChange("billingCycle", e.target.value)
                  }
                />
              ) : (
                <p>{vendor.billingCycle}</p>
              )}
            </FieldGroup>
            <ButtonGroup>
              {isEditing ? (
                <>
                  <SaveButton onClick={handleSave} disabled={!isEditing}>
                    Save Changes
                  </SaveButton>
                  <BackButton onClick={handleCancelEdit}>Cancel</BackButton>
                </>
              ) : (
                <SaveButton onClick={handleEditClick}>Edit</SaveButton>
              )}
            </ButtonGroup>
          </VendorDetailsContainer>
        )}
        {vendor && vendor.timeline && vendor.timeline.length > 0 ? (
          <TimelineContainer>
            <h3>Timeline</h3>
            {vendor.timeline.map((item, index) => (
              <TimelineItem key={index}>
                <p>
                  <strong>Status:</strong> {item.status}
                </p>
                <p>
                  <strong>Message:</strong> {item.message}
                </p>
                <p>
                  <strong>Email:</strong> {item.email}
                </p>
                <p>
                  <strong>Timestamp:</strong>{" "}
                  {item.timestamp.toDate().toLocaleString()}
                </p>
                {item.uploadedImageUrl && (
                  <ImagePreview
                    src={item.uploadedImageUrl}
                    alt={`Timeline upload ${index + 1}`}
                    onClick={() => handleImageClick(item.uploadedImageUrl)}
                  />
                )}
              </TimelineItem>
            ))}
          </TimelineContainer>
        ) : (
          <TimelineContainer>
            <h3>Timeline</h3>
            <p>No timeline data available.</p>
          </TimelineContainer>
        )}
        {documents && documents.length > 0 ? (
          <DocumentContainer>
            <h3>Documents</h3>
            {documents.map((doc, index) => (
              <DocumentItem key={index}>
                <div>
                  {Object.entries(doc).map(
                    ([key, value], docIndex) =>
                      key.startsWith("sentdocs") &&
                      value && (
                        <div
                          key={docIndex}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <ImagePreview
                            src={value}
                            alt={`Document ${index + 1}`}
                            onClick={() => handleImageClick(value)}
                          />
                        </div>
                      )
                  )}
                  <p>
                    <strong>Status:</strong> {doc.status || "Pending"}
                  </p>
                </div>
                <div>
                  <DocumentButton
                    approve={true}
                    onClick={() => handleDocumentAction(index, "approve")}
                    style={{ marginBottom: "10px" }}
                  >
                    Approve
                  </DocumentButton>
                  <DocumentButton
                    approve={false}
                    onClick={() => handleDocumentAction(index, "decline")}
                  >
                    Decline
                  </DocumentButton>
                </div>
              </DocumentItem>
            ))}
          </DocumentContainer>
        ) : (
          <DocumentContainer>
            <h3>Documents</h3>
            <p>No documents available.</p>
          </DocumentContainer>
        )}
      </MainContent>

      {showModal && (
        <ModalOverlay>
          <ModalContainer>
            <h3>Success!</h3>
            <p>{successMessage}</p>
            <ModalButton onClick={handleModalClose}>Close</ModalButton>
          </ModalContainer>
        </ModalOverlay>
      )}

      {showImageModal && (
        <ImageModalOverlay>
          <ImageModalContainer>
            <ImageModal src={imageUrl} alt="Preview" />
            <ModalButton onClick={handleImageModalClose}>Close</ModalButton>
          </ImageModalContainer>
        </ImageModalOverlay>
      )}

      {showDeclineModal && (
        <ModalOverlay>
          <ModalContainer>
            <h3>Decline Document</h3>
            <Input
              type="text"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter decline reason"
            />
            <ModalButton
              onClick={handleDeclineSubmit}
              style={{ marginRight: "10px" }}
            >
              Submit
            </ModalButton>
            <ModalButton
              onClick={() => setShowDeclineModal(false)}
              style={{ backgroundColor: "red" }}
            >
              Cancel
            </ModalButton>
          </ModalContainer>
        </ModalOverlay>
      )}
    </DashboardContainer>
  );
};

export default EditVendors;
