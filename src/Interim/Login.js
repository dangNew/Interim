import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom'; // Changed useHistory to useNavigate
import { interimAuth, interimDb } from '../components/firebase.config'; // Import Firebase Auth and Firestore
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


const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Changed useHistory to useNavigate

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = credentials;

    try {
      // Query Firestore to check if the user exists in the 'interim' collection
      const q = query(
        collection(interimDb, 'users'),
        where('email', '==', username) // Assuming username is the email
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('User not found');
        return;
      }

      // Sign in with Firebase Authentication
      await signInWithEmailAndPassword(interimAuth, username, password);

      const loggedInUserData = querySnapshot.docs[0].data();
      localStorage.setItem('userData', JSON.stringify({
        ...loggedInUserData,
        image: loggedInUserData.image, // Ensure 'image' field exists in your Firestore document
      }));


      // Redirect to dashboard or home after successful login
      navigate('/dashboard'); // Replace '/dashboard' with your actual route
  } catch (error) {
    console.error('Login failed:', error);
    if (error.code === 'auth/user-not-found') {
      setError('User not found');
    } else if (error.code === 'auth/wrong-password') {
      setError('Invalid password');
    } else {
      setError('Invalid email or password');
    }
  }
};
  return (
    <LoginContainer>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {/* Logo and form components */}
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="username"
          placeholder="Email/Username"
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
