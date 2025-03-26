import React, { useState } from "react";
import axios from "axios";
import userApi from "../../../../network/userApi";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Alert,
} from "react-bootstrap";
import { HOME_PATH } from "../../../../navigation/sitePaths";
import { UPDATE_INFO_PATH } from "../../../../navigation/sitePaths";
import { useNavigate } from "react-router-dom";

const UpdateInfoForm = () => {
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [mail, setMail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("danger");

  const navigate = useNavigate();

  const handleUpdateInfo = (event) => {
      event.preventDefault();
      setMessage("");

      // Validaciones de formato previas al envío
      const userNameRegex = /^[a-zA-Z0-9._-]{3,}$/;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|outlook|hotmail)\.com$/;
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      const nameRegex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ]{2,}$/;

      const validateField = (field, regex, errorMessage) => {
          if (field && !regex.test(field)) {
              setMessage(errorMessage);
              setVariant("danger");
              return false;
          }
          return true;
      };

      if (
          !validateField(
              userName.trim(),
              userNameRegex,
              "Invalid username format, must be at least 3 characters and can only contain letters, numbers, hyphens, or periods"
          ) ||
          !validateField(
              mail.trim(),
              emailRegex,
              "Invalid email format, only gmail, outlook, and hotmail domains are accepted"
          ) ||
          !validateField(
              password.trim(),
              passwordRegex,
              "Weak password, must contain at least 1 uppercase letter, 1 number, 1 special character, and be at least 8 characters long"
          ) ||
          !validateField(
              firstName.trim(),
              nameRegex,
              "Invalid first name, use at least 2 letters and no special characters"
          ) ||
          !validateField(
              lastName.trim(),
              nameRegex,
              "Invalid last name, use at least 2 letters and no special characters"
          )
      ) {
          return;
      }

      // Send request to the update API
      userApi
          .updateInfo({
              userName: userName.trim(),
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              mail: mail.trim(),
              password: password.trim(),
              role: "User",
          })
          .then((response) => {
              setVariant("success");
              setMessage("Information updated successfully");
              navigate(HOME_PATH);
          })
          .catch((error) => {
              console.error("Update error:", error);
              let errorMsg = "Unknown error. Please try again.";

              if (error.response) {
                  errorMsg = error.response.data || "Error without description";
              } else if (error.request) {
                  errorMsg = "No response from the server. Please check your connection";
              }

              setMessage(errorMsg);
              setVariant("danger");
          });
  };


  return (
    <Container>
      <Card className="mt-5">
        <Card.Body>
          <h3>Update Information</h3>
          <h6 className="text-muted">You can fill one or more fields</h6>
          {message && <Alert variant={variant}>{message}</Alert>}
          <Form onSubmit={handleUpdateInfo}>
            <Form.Group controlId="formUserName">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your new username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Update your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Update your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formMail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Update your email"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Update
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UpdateInfoForm;