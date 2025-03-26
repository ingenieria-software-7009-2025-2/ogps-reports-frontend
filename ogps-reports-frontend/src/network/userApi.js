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

  updateInfo: (userData) => {
    const token = localStorage.getItem("authToken");
    return userApiInstance.put("/users/me", userData, {
      headers: { Authorization: `${token}` },
    });
  },

  getMe: () => {
    const token = localStorage.getItem("authToken");
    return userApiInstance.get("/users/me", {
      headers: { Authorization: `${token}` },
    });
  },
  checkUsername: (username) => {
      return userApiInstance.get(`/users/check-username?username=${username}`);
    },
    checkEmail: (email) => {
      return userApiInstance.get(`/users/check-email?email=${email}`);
    },
};

export default userApi;