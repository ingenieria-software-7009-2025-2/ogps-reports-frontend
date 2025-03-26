import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import userApi from "../../../../network/userApi";
import { HOME_PATH } from "../../../../navigation/sitePaths";

const UserInfo = () => {
  const [user, setUser] = useState(null); // State for user data
  const [error, setError] = useState(""); // State for handling errors
  const navigate = useNavigate();

  useEffect(() => {
    // Make a request to the /me endpoint when the component mounts
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No token available. Please log in again.");
      return;
    }

    userApi
      .getMe()
      .then((response) => {
        if (response.status === 200) {
          setUser(response.data); // Store user data
        } else {
          setError("Could not load user information. Your session may have expired.");
        }
      })
      .catch((error) => {
        console.error("Error fetching information:", error);
        setError("Could not load user information. Your session may have expired.");
      });
  }, []); // Empty array ensures the request is made only on component mount

  return (
    <Container>
      <Card className="mt-5">
        <Card.Body>
          <h3>User Information</h3>
          {error ? (
            <p>{error}</p>
          ) : !user ? (
            <p>Loading information...</p>
          ) : (
            <>
              <p><strong>ID:</strong> {user.id || "N/A"}</p>
              <p><strong>Username:</strong> {user.userName || "N/A"}</p>
              <p><strong>First Name:</strong> {user.firstName || "N/A"}</p>
              <p><strong>Last Name:</strong> {user.lastName || "N/A"}</p>
              <p><strong>Email:</strong> {user.mail || "N/A"}</p>
              <p><strong>Role:</strong> {user.role || "N/A"}</p>
            </>
          )}
          <Button variant="primary" onClick={() => navigate(HOME_PATH)}>
            Go Back
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserInfo;