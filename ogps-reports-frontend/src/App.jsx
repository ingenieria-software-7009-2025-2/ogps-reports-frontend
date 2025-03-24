import "./App.css";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { Container, Nav, Navbar, Button, Alert } from "react-bootstrap";
import Inicio from "./modules/home/ui/screens/Inicio";
import Registro from "./modules/user/ui/screens/Registro";
import LoginForm from "./modules/user/ui/screens/Login";
import userApi from "./network/userApi";
import { useEffect, useState } from "react";
import { HOME_PATH, REGISTER_PATH, LOGIN_PATH } from "./navigation/sitePaths";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Agrega useLocation para obtener la ruta actual
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("danger");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const publicPaths = [`/${LOGIN_PATH}`, `/${REGISTER_PATH}`]; // Rutas públicas
    if (!token && !publicPaths.includes(location.pathname)) {
      navigate(`/${LOGIN_PATH}`); // Usa una barra inicial para consistencia
    }
  }, [navigate, location.pathname]); // Agrega location.pathname como dependencia

  const logout = () => {
    userApi
      .logout()
      .then((response) => {
        if (response.status === 200) {
          navigate(`/${LOGIN_PATH}`);
        }
      })
      .catch((error) => {
        setVariant("danger");
        setMessage("Error al cerrar sesión. Intenta de nuevo.");
        console.error("Error en el logout:", error);
        navigate(`/${LOGIN_PATH}`);
      });
  };

  const isAuthenticated = !!localStorage.getItem("authToken");

  return (
    <div className="App">
      <Navbar expand="lg" bg="dark" data-bs-theme="dark" className="mb-3">
        <Container>
          <Navbar.Brand>OGPS</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {isAuthenticated && <Nav.Link href={HOME_PATH}>Home</Nav.Link>}
            </Nav>
            <Nav>
              {isAuthenticated ? (
                <Button variant="outline-light" onClick={logout}>
                  Logout
                </Button>
              ) : (
                <Button
                  variant="outline-light"
                  onClick={() => {
                    navigate(`/${REGISTER_PATH}`);
                  }}
                >
                  Signup
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {message && (
        <Container className="mt-3">
          <Alert variant={variant}>{message}</Alert>
        </Container>
      )}

      <div className="content">
        <Routes>
          <Route path={HOME_PATH} element={<Inicio />} />
          <Route path={REGISTER_PATH} element={<Registro />} />
          <Route path={LOGIN_PATH} element={<LoginForm />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;