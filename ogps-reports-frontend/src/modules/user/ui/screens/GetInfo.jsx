// UserInfo.jsx
import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import userApi from "../../../../network/userApi"; // Asegúrate de que la ruta sea correcta
import { HOME_PATH } from "../../../../navigation/sitePaths";

const UserInfo = () => {
  const [user, setUser] = useState(null); // Estado para los datos del usuario
  const [error, setError] = useState(""); // Estado para manejar errores
  const navigate = useNavigate();

  useEffect(() => {
    // Hacer la solicitud al endpoint /me cuando el componente se monte
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No hay token disponible. Por favor, inicia sesión nuevamente.");
      return;
    }

    userApi
      .getMe()
      .then((response) => {
        if (response.status === 200) {
          setUser(response.data); // Guardar los datos del usuario
        } else {
          setError("No se pudo cargar la información del usuario. Es posible que tu sesión haya expirado.");
        }
      })
      .catch((error) => {
        console.error("Error al obtener información:", error);
        setError("No se pudo cargar la información del usuario. Es posible que tu sesión haya expirado.");
      });
  }, []); // El array vacío asegura que la solicitud se haga solo al montar el componente

  return (
    <Container>
      <Card className="mt-5">
        <Card.Body>
          <h3>Información del Usuario</h3>
          {error ? (
            <p>{error}</p>
          ) : !user ? (
            <p>Cargando información...</p>
          ) : (
            <>
              <p><strong>ID:</strong> {user.id || "N/A"}</p>
              <p><strong>Username:</strong> {user.userName || "N/A"}</p>
              <p><strong>Nombre:</strong> {user.firstName || "N/A"}</p>
              <p><strong>Apellido:</strong> {user.lastName || "N/A"}</p>
              <p><strong>Email:</strong> {user.mail || "N/A"}</p>
              <p><strong>Rol:</strong> {user.role || "N/A"}</p>
            </>
          )}
          <Button variant="primary" onClick={() => navigate(HOME_PATH)}>
            Volver
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserInfo;