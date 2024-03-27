import React, { useEffect, useState } from "react";
import { fetchUserAttributes } from '@aws-amplify/auth';
import { get } from "aws-amplify/api";



const Header = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState(null);

  // Function to print access token and id token
  const printUserAttributes = async () => {
    try {
      const userAttributes = await fetchUserAttributes();
      setUserEmail(userAttributes.email);
      console.log('Email:', userAttributes.email);
      getUsers();
    }
    catch (e) { console.log(e); }
  };

  const getUsers = async () => {
    try {
      const restOperation = get({
        apiName: "usersApi",
        path: "/users",
      });
      const { body } = await restOperation.response;
      const response = await body.json();
      const user = response.data.find(user => user.email === userEmail);
      console.log(user);
      setUserRole(user.role);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    printUserAttributes();
  }, [userEmail, userRole]);
  
  return (
    <header style={headerStyle}>
      <div style={leftContainer}>
        <div style={logoStyle}>Knowledge Nest</div>
      </div>
      <div style={middleContainer}>
        <nav style={navStyle}>
          <a href='/' style={linkStyle}>
            Home
          </a>
          <a href='/questions' style={linkStyle}>
            Questions
          </a>
          <a href='/contribute' style={linkStyle}>
            Contribute
          </a>
          <a href='/users' style={linkStyle}>
            User Management
          </a>
        </nav>
      </div>
      <div style={rightContainer}>
        <div style={userInfoStyle}>
          <div style={userContainerStyle}>
            <span style={usernameStyle}>{userEmail}</span>
            <span style={accountTypeStyle}>{userRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// Styles
const headerStyle = {
  backgroundColor: "#ADD8E6",
  color: "#444444",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px",
  position: "fixed",
  top: "0",
  width: "100%",
};

const leftContainer = {
  flex: "1",
};

const middleContainer = {
  flex: "3",
};

const rightContainer = {
  flex: "1",
};

const logoStyle = {
  fontSize: "24px",
};

const navStyle = {
  display: "flex",
  justifyContent: "space-evenly",
};

const linkStyle = {
  textDecoration: "none",
  fontSize: "18px",
  color: "#003366",
};

const userInfoStyle = {
  fontSize: "14px",
};

const userContainerStyle = {
  display: "flex",
  flexDirection: "column",
};

const usernameStyle = {
  marginRight: "10px",
};

const accountTypeStyle = {
  fontStyle: "italic",
};

export default Header;
