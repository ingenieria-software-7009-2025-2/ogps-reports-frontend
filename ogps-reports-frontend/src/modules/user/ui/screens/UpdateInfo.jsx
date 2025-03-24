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
        role: "user",
      })
      .then((response) => {
        if (response.status === 200) {
          
          setVariant("success");
          setMessage("Iformación actualizada exitosamente");
          navigate(HOME_PATH);
        }

      })
      .catch(() => {
        setVariant("danger");
        setMessage("Error actualizar información.");
      });
  };

  return (
    <Container>
      <Card className="mt-5">
        <Card.Body>
          <h3>Actualizar Información</h3>
          <h6 className="text-muted">Puedes llenar uno o más campos</h6>
          {message && <Alert variant={variant}>{message}</Alert>}
          <Form onSubmit={handleUpdateInfo}>
            <Form.Group controlId="formUserName">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese su nuevo nombre de usuario"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Actualice primer nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Actualice su apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formMail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Actualice su correo electrónico"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingrese su nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Actualizar
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UpdateInfoForm;