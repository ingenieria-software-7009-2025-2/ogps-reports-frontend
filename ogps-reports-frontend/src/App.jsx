import "./App.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import Inicio from "./modules/home/ui/screens/Inicio";
import Registro from "./modules/user/ui/screens/Registro";
import { Container, Nav, Navbar, Button } from "react-bootstrap";
import LoginForm from "./modules/user/ui/screens/Login";
import userApi from "./network/userApi";
import { useEffect, useState } from "react";
import { HOME_PATH, REGISTER_PATH, LOGIN_PATH } from "./navigation/sitePaths";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const navigate = useNavigate();

  useEffect(() => {
    setToken(localStorage.getItem("authToken"));
  }, [localStorage.getItem("authToken")]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/" + LOGIN_PATH);
    }
  }, []);

  const logout = () => {
    userApi
      .logout()
      .then((response) => {
        if (response.status === 200) {
          localStorage.removeItem("authToken");
          navigate("/" + LOGIN_PATH);
          //aqui falta eliminar el token de la base de datos, no estoy segura si seria aqui en front o en
          //el archivo userApi.js en la funcion logout usando axios
        }
      })
      .catch((reason) => {
        console.log("********* reason" + reason);

        localStorage.removeItem("authToken");
        navigate("/" + LOGIN_PATH);
      });
  };

  return (
    <div className="App">
      <Navbar expand="lg" bg="dark" data-bs-theme="dark" className="mb-3">
        <Container>
          <Navbar.Brand>OGPS</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {token && <Nav.Link href={HOME_PATH}>Home</Nav.Link>}
              {/* Eliminamos el enlace "Registrate" */}
            </Nav>
            <Nav>
              {token ? (
                <Button variant="outline-light" onClick={logout}>
                  Logout
                </Button>
              ) : (
                <Button
                  variant="outline-light"
                  onClick={() => {
                    navigate("/" + REGISTER_PATH); // Cambiamos LOGIN_PATH por REGISTER_PATH
                  }}
                >
                  Signup {/* Cambiamos "Login" por "Signup" */}
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
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