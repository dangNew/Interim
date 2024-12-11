import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  stallholderDb,
  stallholderStorage,
  stallholderAuth,
} from "../components/firebase.config"; // Import the Firebase configuration
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateEmail, updatePassword } from "firebase/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const ProfileContainer = styled.div`
  padding: 30px;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 700px;
  margin: 50px auto;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
`;

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-right: 30px;
  border: 2px solid #ddd;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProfileName = styled.h2`
  margin: 0;
  font-size: 1.8rem;
  color: #333;
`;

const ProfileEmail = styled.p`
  margin: 5px 0;
  color: #6c757d;
  font-size: 1rem;
`;

const ProfilePosition = styled.p`
  margin: 5px 0;
  color: #6c757d;
  font-size: 1rem;
`;

const ProfileDetails = styled.div`
  margin-top: 30px;
`;

const ProfileDetailItem = styled.div`
  margin-bottom: 20px;
`;

const ProfileLabel = styled.span`
  font-weight: bold;
  margin-right: 10px;
  color: #333;
`;

const ProfileValue = styled.span`
  color: #6c757d;
  font-size: 1rem;
`;

const EditButton = styled.button`
  background-color: #28a745; /* Green color */
  color: white;
  border: none;
  border-radius: 5px;
  padding: 12px 24px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838; /* Darker green on hover */
  }
`;

const InputField = styled.input`
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  position: relative;
  font-size: 1rem;
`;

const FileInput = styled.input`
  margin-top: 10px;
`;

const Message = styled.div`
  margin-top: 20px;
  color: #28a745; /* Green color for messages */
  font-weight: bold;
`;

const ToggleIcon = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
`;

const Pprofile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setMessage("Loading...");
        const storedUserData = JSON.parse(localStorage.getItem("userData"));
        if (storedUserData && storedUserData.email) {
          const usersRef = collection(stallholderDb, "admin_users");
          const q = query(usersRef, where("email", "==", storedUserData.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              setUserData({ ...doc.data(), id: doc.id });
              setEditedData({ ...doc.data(), id: doc.id });
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
        setMessage("");
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData({ ...editedData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSignatureChange = (e) => {
    setSignatureFile(e.target.files[0]);
  };

  const handleSave = async () => {
    try {
      setMessage("Saving...");
      const userRef = doc(stallholderDb, "admin_users", userData.id);

      // Update Firestore data
      await updateDoc(userRef, editedData);

      if (imageFile) {
        setMessage("Uploading image...");
        const storageRef = ref(stallholderStorage, `images/${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(storageRef);
        await updateDoc(userRef, { Image: imageUrl });
        setEditedData({ ...editedData, Image: imageUrl });
        setMessage("Successfully uploaded image.");
      }

      if (signatureFile) {
        setMessage("Uploading signature...");
        const storageRef = ref(
          stallholderStorage,
          `signatures/${signatureFile.name}`
        );
        await uploadBytes(storageRef, signatureFile);
        const signatureUrl = await getDownloadURL(storageRef);
        await updateDoc(userRef, { Signature: signatureUrl });
        setEditedData({ ...editedData, Signature: signatureUrl });
        setMessage("Successfully uploaded signature.");
      }

      // Update Firebase Authentication email if changed
      if (editedData.email !== userData.email) {
        await updateEmail(stallholderAuth.currentUser, editedData.email);
        // Update the email in Firestore as well
        await updateDoc(userRef, { email: editedData.email });
      }

      // Update Firebase Authentication password if changed
      if (editedData.password && editedData.password !== userData.password) {
        await updatePassword(stallholderAuth.currentUser, editedData.password);
      }

      setUserData(editedData);
      setEditing(false);
      setMessage("Successfully saved.");
    } catch (error) {
      console.error("Error updating user data:", error);
      setMessage("Error saving data.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>No user data found.</div>;
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        {userData.Image ? (
          <ProfileImage
            src={userData.Image}
            alt={`${userData.firstName} ${userData.lastName}`}
          />
        ) : (
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              backgroundColor: "#ddd",
            }}
          />
        )}
        <ProfileInfo>
          <ProfileName>{`${userData.firstName} ${userData.middleName} ${userData.lastName}`}</ProfileName>
          <ProfileEmail>{userData.email}</ProfileEmail>
          <ProfilePosition>{`${userData.position}, ${userData.location}`}</ProfilePosition>
        </ProfileInfo>
      </ProfileHeader>
      <ProfileDetails>
        {editing ? (
          <>
            <ProfileDetailItem>
              <ProfileLabel>Image:</ProfileLabel>
              <FileInput type="file" onChange={handleImageChange} />
            </ProfileDetailItem>
            <ProfileDetailItem>
              <ProfileLabel>Signature:</ProfileLabel>
              <FileInput type="file" onChange={handleSignatureChange} />
            </ProfileDetailItem>
            <ProfileDetailItem>
              <ProfileLabel>Email:</ProfileLabel>
              <InputField
                type="email"
                name="email"
                value={editedData.email}
                onChange={handleChange}
              />
            </ProfileDetailItem>
            <ProfileDetailItem style={{ position: "relative" }}>
              <ProfileLabel>Password:</ProfileLabel>
              <InputField
                type={showPassword ? "text" : "password"}
                name="password"
                value={editedData.password || ""}
                onChange={handleChange}
              />
              <ToggleIcon onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </ToggleIcon>
            </ProfileDetailItem>
            <ProfileDetailItem>
              <ProfileLabel>Address:</ProfileLabel>
              <InputField
                type="text"
                name="address"
                value={editedData.address}
                onChange={handleChange}
              />
            </ProfileDetailItem>
            <ProfileDetailItem>
              <ProfileLabel>Contact Number:</ProfileLabel>
              <InputField
                type="text"
                name="contactNum"
                value={editedData.contactNum}
                onChange={handleChange}
              />
            </ProfileDetailItem>
            <ProfileDetailItem>
              <ProfileLabel>Status:</ProfileLabel>
              <ProfileValue>{userData.status}</ProfileValue>
            </ProfileDetailItem>
            <EditButton onClick={handleSave}>Save</EditButton>
          </>
        ) : (
          <>
            <ProfileDetailItem>
              <ProfileLabel>Address:</ProfileLabel>
              <ProfileValue>{userData.address}</ProfileValue>
            </ProfileDetailItem>
            <ProfileDetailItem>
              <ProfileLabel>Contact Number:</ProfileLabel>
              <ProfileValue>{userData.contactNum}</ProfileValue>
            </ProfileDetailItem>
            <ProfileDetailItem>
              <ProfileLabel>Status:</ProfileLabel>
              <ProfileValue>{userData.status}</ProfileValue>
            </ProfileDetailItem>
            <EditButton onClick={() => setEditing(true)}>
              Edit Profile
            </EditButton>
          </>
        )}
        {message && <Message>{message}</Message>}
      </ProfileDetails>
    </ProfileContainer>
  );
};

export default Pprofile;
