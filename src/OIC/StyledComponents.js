import styled from 'styled-components';

// Sidebar component
export const Sidebar = styled.div`
  width: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')};
  background-color: #f8f9fa;
  padding: 10px;
  display: flex;
  border: 1px solid #ddd; /* ADD THIS */
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 100;
  overflow-y: auto;
`;

// Profile Header component
export const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 40px 10px;
  position: relative;
  flex-direction: column;
  text-align: center; // Add this line to center text

  .profile-icon {
    font-size: 3rem;
    margin-bottom: 15px;
    color: #6c757d; // Subtle color for icon
  }

  .profile-name {
    font-size: 1.2rem;
    font-weight: 700; // Bolder text
    color: black; // Darker gray for a professional look
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
    margin: 0; 
  }

  hr {
    width: 100%;
    border: 0.5px solid #ccc;
    margin-top: 15px;
  }

  .profile-position {
    font-size: 1rem; /* Increase the font size */
    font-weight: 600; /* Make it bold */
    color: #007bff; /* Change color to blue for better visibility */
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
    margin-top: 5px; /* Add some margin for spacing */
  }
`;

// Profile Image component
export const ProfileImage = styled.img`
  border-radius: 50%;
  width: 60px; /* Adjusted for better visibility */
  height: 60px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); // Subtle shadow for a polished look
`;

// Search Bar Container component
export const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 20px;
  margin-bottom: 20px;
  margin-top: -25px;
  display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex' : 'none')};
`;

// Search Input component
export const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
`;

// Sidebar Menu component
export const SidebarMenu = styled.div`
  list-style-type: none;
  padding: 0;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

// Sidebar Item component
export const SidebarItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px;
  margin-bottom: 10px;
  margin-top: -10px;
  border-radius: 8px;
  font-size: 13px;
  color: ${({ active }) => (active ? 'white' : '#333')};
  background-color: ${({ active }) => (active ? '#007bff' : 'transparent')};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ active }) => (active ? '#007bff' : '#f1f3f5')};
  }

  .icon {
    font-size: 1.2rem; /* Adjust the icon size */
    color: #000;
    transition: margin-left 0.2s ease;
    width: 30px; /* Fixed width for consistent spacing */
  }

  span {
    margin-left: 10px;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'inline' : 'none')};
  }
`;

// Sidebar Footer component
export const SidebarFooter = styled.div`
  padding: 10px;
  margin-top: auto; /* Pushes the footer to the bottom */
  display: flex;
  align-items: center;
  justify-content: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex-start' : 'center')};
`;

// New Styled Components for UpdatePayment
export const FormContainer = styled.div`
  max-width: 600px; /* Maximum width for the form */
  margin: 0 auto; /* Center the form */
  padding: 20px; /* Padding around the form */
  background-color: #ffffff; /* White background for the form */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow */
`;

export const StyledInput = styled.input`
  width: 100%; /* Full width */
  padding: 12px 15px; /* Padding for input */
  margin-bottom: 15px; /* Space between inputs */
  border: 1px solid #ccc; /* Light gray border */
  border-radius: 4px; /* Rounded corners */
  font-size: 16px; /* Font size */
  transition: border-color 0.3s; /* Transition for border color */

  &:focus {
    border-color: #007bff; /* Change border color on focus */
    outline: none; /* Remove outline */
  }
`;

export const ErrorText = styled.span`
  color: red; /* Red color for error messages */
  font-size: 14px; /* Font size for error messages */
  margin-top: -10px; /* Space above error messages */
  margin-bottom: 15px; /* Space below error messages */
`;

export const StyledButton = styled.button`
  width: 100%; /* Full width */
  padding: 12px; /* Padding for button */
  background-color: #007bff; /* Blue background */
  color: white; /* White text */
  border: none; /* Remove border */
  border-radius: 4px; /* Rounded corners */
  font-size: 16px; /* Font size */
  cursor: pointer; /* Pointer cursor on hover */
  transition: background-color 0.3s; /* Transition for background color */

  &:hover {
    background-color: #0056b3; /* Darker blue on hover */
  }
`;