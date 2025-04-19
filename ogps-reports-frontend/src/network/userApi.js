import axios from "axios";

const userApiInstance = axios.create({
  baseURL: "http://localhost:8080/v1",
});

const userApi = {
  login: (credentials) =>
    userApiInstance.post("/users/login", credentials, {
      headers: { "Content-Type": "application/json" },
    }),
  logout: () => {
    const token = localStorage.getItem("authToken");
    return userApiInstance
      .post("/users/logout", null, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      })
      .finally(() => {
        localStorage.removeItem("authToken");
      });
  },
  register: (userData) =>
    userApiInstance.post("/users", userData, {
      headers: { "Content-Type": "application/json" },
    }),
  updateInfo: (userData) => {
    const token = localStorage.getItem("authToken");
    return userApiInstance.put("/users/me", userData, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });
  },
  getMe: () => {
    const token = localStorage.getItem("authToken");
    return userApiInstance.get("/users/me", {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });
  },
  checkUsername: (username) =>
    userApiInstance.get(`/users/check-username?username=${username}`, {
      headers: { "Content-Type": "application/json" },
    }),
  checkEmail: (email) =>
    userApiInstance.get(`/users/check-email?email=${email}`, {
      headers: { "Content-Type": "application/json" },
    }),
  reportIncident: (incidentData, photos) => {
    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("incident", JSON.stringify(incidentData));
    console.log("Incident data being sent:", incidentData); // Log para depurar
    if (photos && photos.length > 0) {
      photos.forEach((photo, index) => {
        formData.append("photos", photo);
        console.log(`Photo ${index}:`, photo.name, photo.size, photo.type); // Log para depurar
      });
    } else {
      console.log("No photos attached");
    }

    return userApiInstance.post("/incidents", formData, {
      headers: {
        Authorization: `${token}`,
      },
    });
  },
};

export default userApi;