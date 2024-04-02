import React, { useState, useEffect } from "react";
import { getUserInfo } from "./utils";

const Header = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [accessLevel, setAccessLevel] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const { role, email } = await getUserInfo();
        setAccessLevel(role);
        setUserEmail(email);
      } catch (error) {
        console.error(error);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

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
          {accessLevel !== "viewer" && !isLoading && (
            <a href='/contribute' style={linkStyle}>
              Contribute
            </a>
          )}
          {accessLevel === "admin" && !isLoading && (
            <a href='/users' style={linkStyle}>
              User Management
            </a>
          )}
        </nav>
      </div>
      <div style={rightContainer}>
        {userEmail && (
          <div style={userContainerStyle}>
            <span style={usernameStyle}>{userEmail}</span>
          </div>
        )}
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

const userContainerStyle = {
  display: "flex",
  flexDirection: "column",
};

const usernameStyle = {
  marginRight: "10px",
};

export default Header;
