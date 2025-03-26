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

    userApi
      .updateInfo({
        userName: userName,
        firstName: firstName,
        lastName: lastName,
        mail: mail,
        password: password,
        role: "User",
      })
      .then((response) => {
        if (response.status === 200) {
          setVariant("success");
          setMessage("Information updated successfully");
          navigate(HOME_PATH);
        }
      })
      .catch(() => {
        setVariant("danger");
        setMessage("Error updating information.");
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