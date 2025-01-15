import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { rentmobileAuth } from '../components/firebase.config';
import { sendPasswordResetEmail } from 'firebase/auth';

const ForgotPasswordContainer = styled.div`
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

const ErrorMessage = styled.p`
  color: #e74c3c;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
`;

const BackToLoginLink = styled.p`
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

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setResetEmailSent(false);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      console.log('Sending password reset email to:', email);
      await sendPasswordResetEmail(rentmobileAuth, email);
      setResetEmailSent(true);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email format.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        default:
          setError('Failed to send password reset email. Please try again.');
      }
    }
  };

  return (
    <ForgotPasswordContainer>
      <FormContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {resetEmailSent && <ErrorMessage>Password reset email sent! Check your inbox.</ErrorMessage>}
        <Title>Forgot Password</Title>
        <Form onSubmit={handleForgotPassword}>
          <Input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <SubmitButton type="submit">Send Password Reset Email</SubmitButton>
        </Form>
        <BackToLoginLink>
          <Link to="/login">Back to Login</Link>
        </BackToLoginLink>
      </FormContainer>
    </ForgotPasswordContainer>
  );
};

export default ForgotPassword;
