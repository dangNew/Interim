import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { interimDb, interimAuth } from '../components/firebase.config';
import './signup.css';

// Styled-components
const SignUpContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: auto;

  @media (max-width: 768px) {
    padding: 1rem;
    max-width: 90%;
  }
`;

const FormTitle = styled.h1`
  margin-bottom: 2rem;
  color: #333;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

const SubmitButton = styled.button`
  grid-column: span 2;
  padding: 0.75rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }

  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const SignInLink = styled.p`
  margin-top: 1rem;
  color: #666;

  a {
    color: #4caf50;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

// SignUp component
const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, contactNumber, username, password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !contactNumber || !username || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      // Register the user with Firebase Authentication
      await createUserWithEmailAndPassword(interimAuth, email, password);

      // Add user data to Firestore in the 'interim' collection
      await addDoc(collection(interimDb, 'interim'), {
        firstName: firstName,
        lastName: lastName,
        email: email,
        contactNum: contactNumber,
        username: username
      });

      // Clear the form after successful submission
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        username: '',
        password: '',
        confirmPassword: ''
      });

      // Redirect to login page after successful signup
      navigate('/login');
    } catch (error) {
      console.error('Error signing up:', error);
      setError('Failed to sign up. Please try again.');
    }
  };

  return (
    <SignUpContainer>
      {error && <p className='error'>{error}</p>}
      <FormTitle>Sign Up</FormTitle>
      <Form onSubmit={handleSubmit}>
        <Input 
          type="text" 
          name="firstName" 
          placeholder="First Name" 
          value={formData.firstName} 
          onChange={handleChange} 
          required 
        />
        <Input 
          type="text" 
          name="lastName" 
          placeholder="Last Name" 
          value={formData.lastName} 
          onChange={handleChange} 
          required 
        />
        <Input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={formData.email} 
          onChange={handleChange} 
          required 
        />
        <Input 
          type="tel" 
          name="contactNumber" 
          placeholder="Contact Number" 
          value={formData.contactNumber} 
          onChange={handleChange} 
        />
        <Input 
          type="text" 
          name="username" 
          placeholder="Username" 
          value={formData.username} 
          onChange={handleChange} 
          required 
        />
        <Input 
          type="password" 
          name="password" 
          placeholder="Password" 
          value={formData.password} 
          onChange={handleChange} 
          required 
        />
        <Input 
          type="password" 
          name="confirmPassword" 
          placeholder="Confirm Password" 
          value={formData.confirmPassword} 
          onChange={handleChange} 
          required 
        />
        <SubmitButton type="submit">Sign Up</SubmitButton>
      </Form>
      <SignInLink>
        Already have an account? <span onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: '#4caf50' }}>Sign In</span>
      </SignInLink>
    </SignUpContainer>
  );
};

export default SignUp;
