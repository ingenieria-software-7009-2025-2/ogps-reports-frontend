import { useState } from "react";
import { Button, Container, Form, Row, Col, Card, Alert, InputGroup } from "react-bootstrap";
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
  // Estados para manejar la visibilidad de las contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const checkUsernameAvailability = async (username) => {
      try {
        const response = await userApi.checkUsername(username);
        setUsernameAvailable(response.data.available); // Suponiendo que el backend devuelve { available: true/false }
      } catch (error) {
        setUsernameAvailable(false);
        setMessage("Error checking username availability.");
        setVariant("danger");
      }
    };

    // Función para verificar disponibilidad de correo
    const checkEmailAvailability = async (email) => {
      try {
        const response = await userApi.checkEmail(email);
        setEmailAvailable(response.data.available); // Suponiendo que el backend devuelve { available: true/false }
      } catch (error) {
        setEmailAvailable(false);
        setMessage("Error checking email availability.");
        setVariant("danger");
      }
    };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");

    if (!userName || !mail || !password || !confirmPassword || !firstName || !lastName) {
      setVariant("danger");
      setMessage("You have to fill all the blank spaces.");
      return;
    }

    const emailVal = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal.test(mail)) {
      setVariant("danger");
      setMessage("Incorrect format for email.");
      return;
    }

    const usernameVal = /^[a-zA-Z0-9_]+$/;
    if (!usernameVal.test(userName)) {
      setVariant("danger");
      setMessage("Incorrect credentials. Wrong characters for username.");
      return;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setVariant("danger");
      setMessage("Passwords do not match.");
      return;
    }

    // Send data to the backend
    userApi
      .register({
        userName: userName,
        mail: mail,
        password: password,
        firstName: firstName,
        lastName: lastName,
        role: "User",
      })
      .then((response) => {
        if (response.status === 200) {
          setVariant("success");
          setMessage("Successful registration. Please log in.");
          setTimeout(() => {
            navigate("/" + LOGIN_PATH);
          }, 2000);
        }
      })
      .catch((error) => {
        console.error("Error en registro: ", error);
        if (error.response) {
          console.error("Error response: ", error.response);
          switch (error.response.status) {
            case 400:
              setMessage("Invalid format for first name, last name, password, or email domain.");
              break;
            case 409:
              setMessage("Username or email already in use.");
              break;
            default:
              setMessage("Error with information, try again.");
          }
        } else {
          console.error("Error while confirming the request.", error.message);
          setMessage("Couldn't connect to the server.");
        }
        setVariant("danger");
      });
  };

  // Funciones para alternar la visibilidad de las contraseñas
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <Container fluid className="h-100">
      <Row className="justify-content-center align-items-center h-100">
        <Col xs={12} sm={10} md={8} lg={4}>
          <Card className="p-3 p-md-4 shadow">
            <Card.Body>
              <h2 className="text-center mb-3">Sign Up</h2>
              {message && <Alert variant={variant}>{message}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formUserName" className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formFirstName" className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formLastName" className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formMail" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={togglePasswordVisibility}
                      style={{ borderLeft: 0 }}
                    >
                      {showPassword ? (
                        // Icono de ojo cerrado (ocultar contraseña)
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-eye-slash"
                          viewBox="0 0 16 16"
                        >
                          <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3.94-4.72-7.641-6.238a.75.75 0 0 0-.718 1.312C10.14 4.22 12 6.22 12 8s-1.86 3.78-4.359 4.926a.75.75 0 0 0-.718-1.312C9.94 10.28 12 9.28 12 8c0-.72-.46-1.74-1.359-2.762L1.47.47a.75.75 0 0 0-1.06 1.06l14.12 14.12a.75.75 0 0 0 1.06-1.06l-1.232-1.232z"/>
                        </svg>
                      ) : (
                        // Icono de ojo abierto (mostrar contraseña)
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-eye"
                          viewBox="0 0 16 16"
                        >
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                        </svg>
                      )}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group controlId="formConfirmPassword" className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={toggleConfirmPasswordVisibility}
                      style={{ borderLeft: 0 }}
                    >
                      {showConfirmPassword ? (
                        // Icono de ojo cerrado (ocultar contraseña)
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-eye-slash"
                          viewBox="0 0 16 16"
                        >
                          <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3.94-4.72-7.641-6.238a.75.75 0 0 0-.718 1.312C10.14 4.22 12 6.22 12 8s-1.86 3.78-4.359 4.926a.75.75 0 0 0-.718-1.312C9.94 10.28 12 9.28 12 8c0-.72-.46-1.74-1.359-2.762L1.47.47a.75.75 0 0 0-1.06 1.06l14.12 14.12a.75.75 0 0 0 1.06-1.06l-1.232-1.232z"/>
                        </svg>
                      ) : (
                        // Icono de ojo abierto (mostrar contraseña)
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-eye"
                          viewBox="0 0 16 16"
                        >
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                        </svg>
                      )}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Sign Up
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