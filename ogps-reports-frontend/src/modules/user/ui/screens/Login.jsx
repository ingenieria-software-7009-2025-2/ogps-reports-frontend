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
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("danger");

  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();
    setMessage("");

    userApi
      .login({
        mail: mail,
        password: password,
      })
      .then((response) => {
        if (response.status === 200) {
          const { token } = response.data;
          localStorage.setItem("authToken", token);
          setVariant("success");
          setMessage("Login successful");
          navigate(HOME_PATH);
        }
      })
      .catch((error) => {
          console.error("Error en login:", error);
          let handled = false;

          if (error.response) {
              console.error("Error response:", error.response);
              switch (error.response.status) {
                  case 400:
                      setMessage("Correo con formato inválido.");
                      handled = true;
                      break;
                  case 401: // Nueva condición para credenciales incorrectas
                      setMessage("Contraseña incorrecta.");
                      handled = true;
                      break;
                  case 404:
                      setMessage("Correo no registrado.");
                      handled = true;
                      break;
                  case 500:
                      setMessage("Error del servidor.");
                      handled = true;
                      break;
              }
          } else if (error.request) {
              console.error("No hay respuesta del servidor:", error.request);
              setMessage("No hay respuesta del servidor. Verifica tu conexión.");
              handled = true;
          } else {
              console.error("Error en la configuración de la solicitud:", error.message);
              setMessage("Error al procesar la solicitud.");
              handled = true;
          }
          setVariant("danger");
      });
  };

  return (
    <Container>
      <Row className="justify-content-center mt-3">
        <Col className="col-12">
          <Card className="p-4 shadow">
            <Card.Body>
              <h2 className="text-center">Log In</h2>
              {message && <Alert variant={variant}>{message}</Alert>}
              <Form onSubmit={handleLogin}>
                <Form.Group controlId="formMail" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your email"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Log In
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