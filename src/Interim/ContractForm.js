import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { stallholderDb } from '../components/firebase.config';
import styled from 'styled-components';

const FormContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.1);
`;

const FormSection = styled.div`
  width: 48%;
  padding: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const Button = styled.button`
  background-color: #188423;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;

  &:hover {
    background-color: #155724;
  }
`;

const SuggestionsList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 5px 0 0 0;
  border: 1px solid #ddd;
  background-color: white;
  position: absolute;
  width: calc(100% - 20px);
  max-height: 150px;
  overflow-y: auto;
  z-index: 1000;
`;

const SuggestionItem = styled.li`
  padding: 10px;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const ContractForm = () => {
  const [contractData, setContractData] = useState({
    stallholderFullName: '',
    stallNumber: '',
    subject: '',
    startDate: '',
    endDate: '',
    terms: '',
  });

  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [loadingNames, setLoadingNames] = useState(false);

  useEffect(() => {
    if (contractData.stallNumber) {
      setLoadingNames(true);
      const q = query(collection(stallholderDb, 'users'), where('stallNumber', '==', contractData.stallNumber));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        console.log('Query snapshot:', querySnapshot); // Log the snapshot
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          console.log('User Data:', userData); // Log user data
          const fullName = `${userData.firstName} ${userData.lastName}`;
          setContractData((prevData) => ({
            ...prevData,
            stallholderFullName: fullName,
          }));
        } else {
          console.log('No user found for stall number:', contractData.stallNumber); // Log when no user found
          setContractData((prevData) => ({
            ...prevData,
            stallholderFullName: '',
          }));
        }
        setLoadingNames(false);
      });
  
      return () => unsubscribe();
    } else {
      setContractData((prevData) => ({
        ...prevData,
        stallholderFullName: '',
      }));
    }
  }, [contractData.stallNumber]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContractData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(stallholderDb, 'contracts'), contractData);
      alert('Contract added successfully!');
      setContractData({
        stallholderFullName: '',
        stallNumber: '',
        subject: '',
        startDate: '',
        endDate: '',
        terms: '',
      });
      setNameSuggestions([]);
    } catch (error) {
      console.error('Error adding contract: ', error);
    }
  };

  return (
    <FormContainer>
      <FormSection>
        <h3>Add New Contract</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative' }}>
            {/* Stall Number Input */}
            <Input
              type="text"
              name="stallNumber"
              placeholder="Stall Number"
              value={contractData.stallNumber}
              onChange={handleChange}
              required
            />
            {/* Stallholder Full Name Input */}
            <Input
              type="text"
              name="stallholderFullName"
              placeholder="Stallholder Full Name"
              value={contractData.stallholderFullName}
              onChange={handleChange}
              required
              readOnly
            />
            {loadingNames && <p>Loading names...</p>}
          </div>

          {/* Remaining Inputs */}
          <Input
            type="text"
            name="subject"
            placeholder="Subject"
            value={contractData.subject}
            onChange={handleChange}
            required
          />
          <Input
            type="date"
            name="startDate"
            value={contractData.startDate}
            onChange={handleChange}
            required
          />
          <Input
            type="date"
            name="endDate"
            value={contractData.endDate}
            onChange={handleChange}
            required
          />
          <Input
            type="text"
            name="terms"
            placeholder="Contract Terms"
            value={contractData.terms}
            onChange={handleChange}
            required
          />
          <Button type="submit">Add Contract</Button>
        </form>
      </FormSection>

      <FormSection>
        {/* Placeholder for the new form on the right side */}
        <h3>Additional Form</h3>
        {/* You can add additional inputs here as needed */}
        <p>This area can be used for additional information or another form.</p>
      </FormSection>
    </FormContainer>
  );
};

export default ContractForm;
