import axios from "axios";

const userApiInstance = axios.create({
  baseURL: "http://localhost:8080/v1", // Base URL para todas las solicitudes
  headers: {
    "Content-Type": "application/json",
  },
});
// Definir funciones específicas para la API
const userApi = {
  login: (credentials) => userApiInstance.post("/users/login", credentials),
  logout: () => {
      const token = localStorage.getItem("authToken");
      return userApiInstance
        .post("/users/logout", null, {
          headers: { Authorization: `${token}` },
        })
        .finally(() => {
          // Eliminar el token de localStorage después de la solicitud, tanto si falla como si tiene éxito
          localStorage.removeItem("authToken");
        });
    },
  //crear funciones que faltan para los  demas endpoints
  register: (userData) => {
      return userApiInstance.post("/users", userData);
    },
};

export default userApi;