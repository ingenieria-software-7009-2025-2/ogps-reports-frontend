import { useState } from "react";
import { Button, Container, Form, Row, Col, Card, Alert } from "react-bootstrap";
import userApi from "../../../../network/userApi";
import { LOGIN_PATH } from "../../../../navigation/sitePaths";
import { useNavigate } from "react-router-dom";

function Registro() {
  const [userName, setUserName] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("danger");

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setVariant("danger");
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    // Enviar los datos al backend
    userApi
      .register({
        userName: userName,
        mail: mail,
        password: password,
        firstName: firstName,
        lastName: lastName,
        role: "User", // Agregamos el campo role
      })
      .then((response) => {
        if (response.status === 200) {
          setVariant("success");
          setMessage("Registro exitoso. Por favor inicia sesión.");
          setTimeout(() => {
            navigate("/" + LOGIN_PATH);
          }, 2000); // Redirige a la pantalla de login después de 2 segundos
        }
      })
      .catch((error) => {
        setVariant("danger");
        setMessage("Error al registrarse. Verifica tus datos.");
        console.error("Error en el registro:", error);
      });
  };

  return (
    <Container fluid className="h-100">
      <Row className="justify-content-center align-items-center h-100">
        <Col xs={12} sm={10} md={8} lg={4}>
          <Card className="p-3 p-md-4 shadow">
            <Card.Body>
              <h2 className="text-center mb-3">Registrarse</h2>
              {message && <Alert variant={variant}>{message}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formUserName" className="mb-3">
                  <Form.Label>Nombre de usuario</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu nombre de usuario"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formFirstName" className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formLastName" className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formMail" className="mb-3">
                  <Form.Label>Mail</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingresa tu mail"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formConfirmPassword" className="mb-3">
                  <Form.Label>Confirmar Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirma tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Registrarse
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Registro;