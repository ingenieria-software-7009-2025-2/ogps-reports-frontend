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
      setMessage("Incorrect format for mail.");
      return;
  }

  const usernameVal = /^[a-zA-Z0-9_]+$/;
  if (!usernameVal.test(userName)) {
    setVariant("danger");
    setMessage("Incoreect credentials. Wrong characters for username.");
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
        role: "User", // We add the role field
      })
      .then((response) => {
        if (response.status === 200) {
          setVariant("success");
          setMessage("Successful registration. Please log in.");
          setTimeout(() => {
            navigate("/" + LOGIN_PATH);
          }, 2000); // Redirect to login screen after 2 seconds
        }
      })
      .catch((error) => {
          console.error("Error en registro: ", error)
        if (error.response) {
            console.error("Error response: ", error.response)
          switch (error.response.status) {
            case 400:
              setMessage("Wrong format for First name and Last name.");
              break;
            case 409:
              setMessage("Username or mail already in use.");
              break;
            default:
              setMessage("Error with information, try again.");
          }
        } else {
          console.error("Error while confirming the request.", error.message)
          setMessage("Couldn't connect to the server.");
        }
        setVariant("danger");
      });
  };

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
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formConfirmPassword" className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
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