import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { interimAuth, interimDb } from '../components/firebase.config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  background-color: #f9f9f9;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
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
`;

const SignUpLink = styled.p`
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

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
`;

const ModalButton = styled.button`
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = credentials;

    try {
      // Query Firestore to check if the user exists in the 'users' collection
      const q = query(
        collection(interimDb, 'users'),
        where('email', '==', username) // Assuming username is the email
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('User not found');
        setIsModalOpen(true); // Open the modal
        return;
      }

      // Sign in with Firebase Authentication
      await signInWithEmailAndPassword(interimAuth, username, password);

      // Redirect to dashboard or home after successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      if (error.code === 'auth/user-not-found') {
        setError('User not found');
      } else if (error.code === 'auth/wrong-password') {
        setError('Invalid password');
      } else {
        setError('An error occurred. Please try again.');
      }
      setIsModalOpen(true); // Open the modal on error
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  return (
    <LoginContainer>
      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <p>{error}</p>
            <ModalButton onClick={closeModal}>Close</ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}

      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="username"
          placeholder="Email"
          value={credentials.username}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          required
        />
        <SubmitButton type="submit">Login</SubmitButton>
      </Form>

      <SignUpLink>
        Don’t have an account? <Link to="/signup">Create a new Account</Link>
      </SignUpLink>
    </LoginContainer>
  );
};

export default Login;
