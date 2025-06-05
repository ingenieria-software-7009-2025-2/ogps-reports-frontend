import "./App.css";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { Container, Nav, Navbar, Button, Alert } from "react-bootstrap";
import Inicio from "./modules/home/ui/screens/Inicio";
import Registro from "./modules/user/ui/screens/Registro";
import LoginForm from "./modules/user/ui/screens/Login";
import IncidentDetails from "./modules/home/ui/screens/IncidentDetails";
import IncidentUpdate from "./modules/home/ui/screens/UpdateIncidentStatus";
import userApi from "./network/userApi";
import { useEffect, useState } from "react";
import {
  HOME_PATH,
  REGISTER_PATH,
  LOGIN_PATH,
  UPDATE_INFO_PATH,
  USER_INFO_PATH,
  INCIDENT_DETAILS_PATH,
  UPDATE_INCIDENT_PATH,
} from "./navigation/sitePaths";
import UpdateInfoForm from "./modules/user/ui/screens/UpdateInfo";
import UserInfo from "./modules/user/ui/screens/GetInfo";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("danger");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const publicPaths = [`/${LOGIN_PATH}`, `/${REGISTER_PATH}`];
    if (!token && !publicPaths.includes(location.pathname)) {
      navigate(`/${LOGIN_PATH}`);
    }
  }, [navigate, location.pathname]);

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
        setMessage("Error logging out. Please try again.");
        console.error("Error during logout:", error);
        navigate(`/${LOGIN_PATH}`);
      });
  };

  const getInfo = () => {
    navigate(`/${USER_INFO_PATH}`);
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
                <>
                  <Button variant="outline-light" onClick={getInfo}>
                    Get Info
                  </Button>
                  <Button
                    variant="outline-light"
                    onClick={() => {
                      navigate(`/${UPDATE_INFO_PATH}`);
                    }}
                    className="ms-2"
                  >
                    Update Info
                  </Button>
                  <Button
                    variant="outline-light"
                    onClick={logout}
                    className="ms-2"
                  >
                    Logout
                  </Button>
                </>
              ) : location.pathname === `/${REGISTER_PATH}` ? (
                <Button
                  variant="outline-light"
                  onClick={() => {
                    navigate(`/${LOGIN_PATH}`);
                  }}
                >
                  Return to Login
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
        <Container className="mt-3 message-container">
          <Alert variant={variant}>{message}</Alert>
        </Container>
      )}

      <div className="content">
        <Routes>
          <Route path={HOME_PATH} element={<Inicio />} />
          <Route path={REGISTER_PATH} element={<Registro />} />
          <Route path={LOGIN_PATH} element={<LoginForm />} />
          <Route path={UPDATE_INFO_PATH} element={<UpdateInfoForm />} />
          <Route path={USER_INFO_PATH} element={<UserInfo />} />
          <Route path={`${INCIDENT_DETAILS_PATH}/:id`} element={<IncidentDetails />} />
          <Route path={UPDATE_INCIDENT_PATH} element={<IncidentUpdate />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;