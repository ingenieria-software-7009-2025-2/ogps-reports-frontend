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
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("danger");

  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();
    setMessage("");

    userApi
      .login({
        mail: username,
        password: password,
      })
      .then((response) => {
        if (response.status === 200) {
          const { token } = response.data;
          localStorage.setItem("authToken", token); // Guarda el token en localStorage
          setVariant("success");
          setMessage("Inicio de sesión exitoso");
          navigate(HOME_PATH);
        }

      })
      .catch(() => {
        setVariant("danger");
        setMessage("Error al iniciar sesión. Verifica tus credenciales.");
      });
  };

  return (
    <Container>
      <Row className="justify-content-center mt-3">
        <Col className="col-12">
          <Card className="p-4 shadow ">
            <Card.Body>
              <h2 className="text-center">Iniciar Sesión</h2>
              {message && <Alert variant={variant}>{message}</Alert>}
              <Form onSubmit={handleLogin}>
                <Form.Group controlId="formUsername" className="mb-3">
                  <Form.Label>Usuario</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Iniciar Sesión
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginForm;