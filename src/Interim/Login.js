import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { interimAuth, interimDb } from '../components/firebase.config';
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem; 
  background-color: #f0f2f5;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
`;

const FormContainer = styled.div`
  background-color: #ffffff;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); 
  width: 100%;
  max-width: 500px; 
`;

const Title = styled.h2`
  margin-bottom: 2rem;
  text-align: center;
  color: #333;
  font-size: 2rem; 
  font-weight: bold;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Input = styled.input`
  padding: 1.25rem; 
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1.25rem; 
  width: 100%;
  box-sizing: border-box;
  transition: box-shadow 0.3s ease-in-out;

  &:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 10px rgba(76, 175, 80, 0.4);
  }
`;

const PasswordContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const TogglePassword = styled.span`
  position: absolute;
  right: 10px;
  cursor: pointer;
  font-size: 1.25rem;
  color: #999;

  &:hover {
    color: #4caf50;
  }
`;

const SubmitButton = styled.button`
  padding: 1rem; 
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.25rem; 
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;

  &:hover {
    background-color: #45a049;
  }
`;

const SignUpLink = styled.p`
  margin-top: 1.5rem;
  text-align: center;
  font-size: 1.1rem;
  color: #666;

  a {
    color: #4caf50;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
`;

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = credentials;

    try {
      const q = query(
        collection(interimDb, 'users'),
        where('email', '==', username)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('User not found');
        return;
      }

      // Set persistence
      await setPersistence(interimAuth, browserSessionPersistence);

      // Sign in
      await signInWithEmailAndPassword(interimAuth, username, password);

      const loggedInUserData = querySnapshot.docs[0].data();
      localStorage.setItem('userData', JSON.stringify({
        ...loggedInUserData,
        image: loggedInUserData.image,
      }));

      console.log('Login successful, navigating to dashboard');
      navigate('/dashboard');
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
      <FormContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Title>Login</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="username"
            placeholder="Email/Username"
            value={credentials.username}
            onChange={handleChange}
            required
          />
          <PasswordContainer>
            <Input
              type={showPassword ? 'text' : 'password'} // Toggle between text and password types
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
            <TogglePassword onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? '🙈' : '👁'} {/* Emoji for toggle */}
            </TogglePassword>
          </PasswordContainer>
          <SubmitButton type="submit">Login</SubmitButton>
        </Form>
        <SignUpLink>
          Don’t have an account? <Link to="/signup">Create a new Account</Link>
        </SignUpLink>
      </FormContainer>
    </LoginContainer>
  );
};

export default Login;