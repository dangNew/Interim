import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { rentmobileDb } from '../components/firebase.config';
import IntSidenav from './IntSidenav';
import Modal from 'react-modal';

const BillingConfigurationContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f5f7;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '70px')};
  padding: 2rem;
  background-color: #fff;
  width: 100%;
  transition: margin-left 0.3s ease;
  overflow-y: auto;
`;

const AppBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
  background-color: #188423;
  color: white;
  font-size: 24px;
  font-family: 'Inter', sans-serif;
  font-weight: bold;
  margin-bottom: 20px;
`;

const AddButton = styled.button`
  padding: 10px 20px;
  background-color: #188423;
  color: white;
  font-size: 18px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-family: 'Inter', sans-serif;
  font-weight: bold;

  &:hover {
    background-color: #166a1a;
  }
`;

const TitleInput = styled.input`
  width: 100%;
  margin-bottom: 15px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s;
  font-family: 'Inter', sans-serif !important;
  font-weight: bold;

  &:focus {
    border-color: #188423;
    outline: none;
  }
`;

const customModalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'relative',
    inset: 'auto',
    padding: 0,
    border: 'none',
    borderRadius: '10px',
    width: '50%',
    maxHeight: '80%',
    overflowY: 'auto',
  },
};

const ModalContent = styled.div`
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  background-color: white;
`;

const FormRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;

  input, select {
    flex: 1;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    transition: border-color 0.3s;

    &:focus {
      border-color: #188423;
      outline: none;
    }
  }

  input[disabled] {
    background-color: #f0f0f0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;

  button {
    width: 48%;
    padding: 10px;
    font-size: 18px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      opacity: 0.9;
    }
  }

  .add-btn {
    background-color: #007bff;
    color: white;
    border: none;

    &:hover {
      background-color: #0056b3;
    }
  }

  .undo-btn {
    background-color: #ff0000;
    color: white;
    border: none;

    &:hover {
      background-color: #c70000;
    }
  }
`;

const SaveButton = styled.button`
  padding: 10px 20px;
  background-color: #188423;
  color: white;
  font-size: 18px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100px;
  margin-top: 20px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #166a1a;
  }
`;

const HorizontalLine = styled.hr`
  border: none;
  height: 1px;
  background-color: #ccc;
  margin: 20px 0;
`;

const CenteredContainer = styled.div`
  display: flex;
  background-color: #e9f7e3;
  justify-content: center;
  align-items: center;
  height: 20vh;
  border-radius: 8px;
`;

const ConfigItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s, box-shadow 0.3s;

  &:hover {
    background-color: #f9f9f9;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  }

  span {
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }

  div {
    display: flex;
    align-items: center;
  }
`;

const EditButton = styled.button`
  padding: 8px 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const AlertModalContent = styled.div`
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  background-color: white;
  text-align: center;

  button {
    background-color: red;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: darkred;
    }
  }
`;

const BillingConfiguration = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const sidebarRef = useRef(null);
  const [title, setTitle] = useState('');
  const [formRows, setFormRows] = useState([{ label: '', type: '%', value: '' }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [configurations, setConfigurations] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
    if (loggedInUserData) {
      setLoggedInUser(loggedInUserData);
    }

    const fetchConfigurations = async () => {
      const billingConfigCollection = collection(rentmobileDb, 'billingconfig');
      const billingConfigSnapshot = await getDocs(billingConfigCollection);
      const fetchedConfigs = billingConfigSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConfigurations(fetchedConfigs);
    };

    fetchConfigurations();
  }, []);

  const handleAddField = () => {
    setFormRows([...formRows, { label: '', type: '%', value: '' }]);
  };

  const handleUndo = () => {
    if (formRows.length > 1) {
      setFormRows(formRows.slice(0, -1));
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openEditModal = (config) => {
    setSelectedConfig(config);
    const rows = Object.keys(config)
      .filter(key => key.startsWith('label'))
      .map((key, index) => ({
        label: config[`label${index + 1}`],
        type: config[`type${index + 1}`] || '%',
        value: config[`value${index + 1}`]?.toString().replace('%', '').replace('₱', ''),
      }));
    setFormRows(rows);
    setTitle(config.title);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedConfig(null);
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...formRows];

    if (field === 'value') {
      updatedRows[index][field] = parseFloat(value) || 0;
    } else {
      updatedRows[index][field] = value;
    }

    if (field === 'type' && value === 'None') {
      updatedRows[index].value = '';
    }

    setFormRows(updatedRows);
  };

  const openAlertModal = (message) => {
    setAlertMessage(message);
    setIsAlertModalOpen(true);
  };

  const closeAlertModal = () => {
    setIsAlertModalOpen(false);
    setTitle('');
    setFormRows([{ label: '', type: '%', value: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isDuplicateTitle = configurations.some(
      (config) => config.title.toLowerCase() === title.toLowerCase()
    );

    if (isDuplicateTitle) {
      openAlertModal('A billing configuration with this title already exists.');
      return;
    }

    try {
      const billingConfigCollection = collection(rentmobileDb, 'billingconfig');

      const formattedData = { title };
      formRows.forEach((row, index) => {
        formattedData[`label${index + 1}`] = row.label;
        if (row.type !== 'None') {
          formattedData[`value${index + 1}`] = parseFloat(row.value) || 0;
          formattedData[`type${index + 1}`] = row.type;
        }
      });

      await addDoc(billingConfigCollection, formattedData);
      setConfigurations([...configurations, formattedData]);
      openAlertModal('Billing configuration saved successfully!');
      closeModal();
    } catch (error) {
      console.error('Error saving billing configuration: ', error);
      openAlertModal('Failed to save billing configuration.');
    }
  };

  const handleUpdate = async () => {
    const isDuplicateTitle = configurations.some(
      (config) =>
        config.title.toLowerCase() === title.toLowerCase() &&
        config.id !== selectedConfig.id
    );

    if (isDuplicateTitle) {
      openAlertModal('A billing configuration with this title already exists.');
      return;
    }

    try {
      const configRef = doc(rentmobileDb, 'billingconfig', selectedConfig.id);

      const updatedData = { title };
      formRows.forEach((row, index) => {
        updatedData[`label${index + 1}`] = row.label;
        if (row.type !== 'None') {
          updatedData[`value${index + 1}`] = parseFloat(row.value) || 0;
          updatedData[`type${index + 1}`] = row.type;
        } else {
          updatedData[`value${index + 1}`] = '';
          updatedData[`type${index + 1}`] = '';
        }
      });

      await updateDoc(configRef, updatedData);
      setConfigurations(
        configurations.map((config) =>
          config.id === selectedConfig.id ? updatedData : config
        )
      );
      closeEditModal();
      openAlertModal('Billing configuration updated successfully!');
    } catch (error) {
      console.error('Error updating billing configuration: ', error);
      openAlertModal('Failed to update billing configuration.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const configRef = doc(rentmobileDb, 'billingconfig', id);
      await deleteDoc(configRef);
      setConfigurations(configurations.filter(config => config.id !== id));
      openAlertModal('Billing configuration deleted successfully!');
    } catch (error) {
      console.error('Error deleting billing configuration: ', error);
      openAlertModal('Failed to delete billing configuration.');
    }
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMainContentClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <BillingConfigurationContainer>
      <div ref={sidebarRef}>
        <IntSidenav
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          loggedInUser={loggedInUser}
        />
      </div>
      <MainContent isSidebarOpen={isSidebarOpen} onClick={handleMainContentClick}>
        <AppBar>
          <div className="title">OFFICE OF THE CITY MARKETS</div>
        </AppBar>

        <CenteredContainer>
          <AddButton onClick={openModal}>+ Add Billing Configuration</AddButton>
        </CenteredContainer>

        <HorizontalLine />

        {configurations.map((config) => (
          <ConfigItem key={config.id}>
            <span>{config.title}</span>
            <div>
              <EditButton onClick={() => openEditModal(config)}>
                <FaEdit /> Edit
              </EditButton>
              <button onClick={() => handleDelete(config.id)} style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>
                <FaTrash /> Delete
              </button>
            </div>
          </ConfigItem>
        ))}

        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Add Billing Configuration"
          style={customModalStyles}
        >
          <ModalContent>
            <h2>Add Billing Configuration</h2>
            <TitleInput
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {formRows.map((row, index) => (
              <FormRow key={index}>
                <input
                  type="text"
                  placeholder={`Label ${index + 1}`}
                  value={row.label}
                  onChange={(e) => handleInputChange(index, 'label', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Value"
                  value={row.value}
                  onChange={(e) => handleInputChange(index, 'value', e.target.value)}
                />
                <select
                  value={row.type}
                  onChange={(e) => handleInputChange(index, 'type', e.target.value)}
                >
                  <option value="%">%</option>
                  <option value="₱">₱</option>
                  <option value="None">None</option>
                </select>
              </FormRow>
            ))}

            <ButtonGroup>
              <button className="add-btn" onClick={handleAddField}>Add Field</button>
              <button className="undo-btn" onClick={handleUndo}>Undo</button>
            </ButtonGroup>

            <SaveButton onClick={handleSubmit}>Save</SaveButton>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onRequestClose={closeEditModal}
          contentLabel="Edit Billing Configuration"
          style={customModalStyles}
        >
          <ModalContent>
            <h2>Edit Billing Configuration</h2>
            <TitleInput
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {formRows.map((row, index) => (
              <FormRow key={index}>
                <input
                  type="text"
                  placeholder={`Label ${index + 1}`}
                  value={row.label}
                  onChange={(e) => handleInputChange(index, 'label', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Value"
                  value={row.value}
                  onChange={(e) => handleInputChange(index, 'value', e.target.value)}
                  disabled={row.type === 'None'}
                />
                <select
                  value={row.type}
                  onChange={(e) => handleInputChange(index, 'type', e.target.value)}
                >
                  <option value="%">%</option>
                  <option value="₱">₱</option>
                  <option value="None">None</option>
                </select>
              </FormRow>
            ))}
            <SaveButton onClick={handleUpdate}>Update</SaveButton>
          </ModalContent>
        </Modal>

        <Modal isOpen={isAlertModalOpen} onRequestClose={closeAlertModal} style={customModalStyles}>
          <AlertModalContent>
            <h2>{alertMessage}</h2>
            <button onClick={closeAlertModal}>Close</button>
          </AlertModalContent>
        </Modal>

      </MainContent>
    </BillingConfigurationContainer>
  );
};

export default BillingConfiguration;
