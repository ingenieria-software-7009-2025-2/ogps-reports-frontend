import { Card, Container, Stack, Button, Form, Row, Col, Alert, Image, Dropdown } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../../../../network/userApi";
import { INCIDENT_DETAILS_PATH } from "../../../../navigation/sitePaths";

function Inicio() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("danger");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [showIncidents, setShowIncidents] = useState(false);

  const [nearbyIncidents, setNearbyIncidents] = useState([]); // Estado para almacenar incidentes cercanos
  const [userLocation, setUserLocation] = useState(null); // Almacenar la ubicación del usuario
  const [searchRadius, setSearchRadius] = useState(5.0); // Radio de búsqueda en kilómetros
  const marcadores = [{
      id: 1,
      title: "Bache en la calle",
      latitude: 19.4336,
      longitude: -99.1342,
      category: "Potholes",
      description: "Bache profundo en la esquina de la calle",
      status: "Pendiente",
      reportDate: "2025-04-20"
      }
      ]
  const categories = [
    "Potholes and Defects",
    "Street Lighting",
    "Traffic Accidents",
    "Obstacles",
    "Other",
  ];

  const today = new Date();
  const maxDate = today.toISOString().split("T")[0];

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await userApi.getReportedIncidents();
        setIncidents(response.data);
      } catch (error) {
        setVariant("danger");
        setMessage("Error fetching reported incidents: " + (error.response?.data?.error || error.message));
      }
    };
    fetchIncidents();
  }, []);

  const handlePhotoChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setPhotos(selectedFiles);
    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  const handleRemovePhoto = (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
    photoPreviews.forEach((preview, i) => {
      if (i === index) {
        URL.revokeObjectURL(preview);
      }
    });
    setPhotos(updatedPhotos);
    setPhotoPreviews(updatedPreviews);
  };

  // Función para cargar incidentes cercanos
  const loadNearbyIncidents = (lat, lng, radius) => {
    userApi.getNearbyIncidents(lat, lng, radius)
      .then(response => {
        setNearbyIncidents(response.data);
        setVariant("success");
        setMessage(`Loaded ${response.data.length} nearby incidents`);
        
        // Actualizar marcadores en el mapa
        if (window.google && window.map) {
          // Limpiamos los marcadores existentes (excepto el de ubicación del usuario)
          agregarMarcadores(window.map, response.data);
        }
      })
      .catch(error => {
        setVariant("danger");
        setMessage("Error loading nearby incidents: " + 
          (error.response?.data?.message || error.message));
      });
  };

  // Función para obtener la ubicación actual del usuario
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setLatitude(lat.toFixed(6));
          setLongitude(lng.toFixed(6));
          
          // Cargar incidentes cercanos a la ubicación actual
          loadNearbyIncidents(lat, lng, searchRadius);
          
          // Centrar el mapa en la ubicación actual
          if (window.map) {
            window.map.setCenter({ lat, lng });
            
            // Agregar marcador para la ubicación del usuario
            new window.google.maps.Marker({
              position: { lat, lng },
              map: window.map,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 2,
              },
              title: "Your Location"
            });
          }
        },
        (error) => {
          setVariant("warning");
          setMessage("Error obtaining location: " + error.message);
        }
      );
    } else {
      setVariant("warning");
      setMessage("Geolocation is not supported by this browser");
    }
  };

  // Manejar cambio de radio de búsqueda
  const handleRadiusChange = (e) => {
    const newRadius = parseFloat(e.target.value);
    setSearchRadius(newRadius);
    
    // Si tenemos la ubicación del usuario, actualizar la búsqueda
    if (userLocation) {
      loadNearbyIncidents(userLocation.lat, userLocation.lng, newRadius);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setVariant("danger");
      setMessage("Latitude must be a number between -90 and 90");
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      setVariant("danger");
      setMessage("Longitude must be a number between -180 and 180");
      return;
    }

    if (photos.length === 0) {
      setVariant("danger");
      setMessage("At least one photo is required");
      return;
    }

    const selectedDate = new Date(reportDate);
    if (selectedDate > today) {
      setVariant("danger");
      setMessage("Report date cannot be in the future");
      return;
    }

    const incidentData = {
      category,
      title,
      latitude: lat,
      longitude: lon,
      reportDate: selectedDate,
      description,
    };

    userApi
      .reportIncident(incidentData, photos)
      .then((response) => {
        setVariant("success");
        setMessage("Incident reported successfully");
        setShowForm(false);
        setCategory("");
        setTitle("");
        setLatitude("");
        setLongitude("");
        setReportDate("");
        setDescription("");
        setPhotos([]);
        setPhotoPreviews([]);
        photoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
        // Refresh the incidents list
        userApi.getReportedIncidents().then((res) => setIncidents(res.data));
        
        // Recargar incidentes cercanos si tenemos la ubicación del usuario
        if (userLocation) {
          loadNearbyIncidents(userLocation.lat, userLocation.lng, searchRadius);
        }
      })
      .catch((error) => {
        setVariant("danger");
        setMessage(
          "Error reporting incident: " +
            (error.response?.data?.message || error.message)
        );
      });
  };

  const handleDeleteIncident = (incidentId) => {
    if (window.confirm("Are you sure you want to delete this incident?")) {
      userApi
        .deleteIncident(incidentId)
        .then(() => {
          setIncidents(incidents.filter((incident) => incident.idIncident !== incidentId));
          setVariant("success");
          setMessage("Incident deleted successfully");
        })
        .catch((error) => {
          setVariant("danger");
          setMessage(
            "Error deleting incident: " +
              (error.response?.data?.error || error.message)
          );
        });
    }
  };

  const handleUpdateIncident = (incidentId) => {
    // Placeholder for update functionality
    setVariant("info");
    setMessage("Update functionality not implemented yet.");
  };
  const handleViewDetails = (incident) => {
      navigate(`${INCIDENT_DETAILS_PATH}/${incident.idIncident}`, { state: { incident } });
  };

  // Función para agregar marcadores al mapa
  function agregarMarcadores(mapa, incidentes) {
    // Limpiar marcadores existentes (excepto el de ubicación)
    if (window.markers) {
      window.markers.forEach(marker => marker.setMap(null));
    }
    
    // Array para almacenar los nuevos marcadores
    window.markers = [];
    
    incidentes.forEach((incidente) => {
      const marcador = new google.maps.Marker({
        position: { lat: incidente.latitude, lng: incidente.longitude },
        map: mapa,
      });
      
      window.markers.push(marcador);

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div>
            <strong>Title:</strong> ${incidente.title || 'No title'}<br/>
            <strong>Category:</strong> ${incidente.category}<br/>
            <strong>Status:</strong> ${incidente.status || 'Pending'}<br/>
            <strong>Date:</strong> ${new Date(incidente.reportDate).toLocaleDateString()}<br/>
            ${incidente.description ? `<strong>Description:</strong> ${incidente.description}` : ''}
          </div>
        `
      });

      marcador.addListener("click", () => {
        infoWindow.open(mapa, marcador);
      });
    });
  }

  // Inicializar el mapa 
  useEffect(() => {
    if (!window.google) {
      console.error("Google Maps no ha cargado aún.");
      return;
    }

    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 19.4326, lng: -99.1332 },
      zoom: 12,
    });
    
    // Guardar el mapa en una variable global para acceder a él en otras funciones
    window.map = map;
    window.markers = [];

    // Inicialmente agregar los marcadores existentes
    agregarMarcadores(map, marcadores);
  
    let marker = null;
  
    // Evento cuando el usuario hace clic en el mapa
    map.addListener("click", (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
  
      // Si ya hay un marcador, lo movemos
      if (marker) {
        marker.setPosition({ lat, lng });
      } else {
        // Si no hay marcador, creamos uno nuevo
        marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          draggable: false,
        });
      }
  
      // Actualizar los campos de lat/lng del formulario
      setLatitude(lat.toFixed(6));   // 6 decimales como estándar
      setLongitude(lng.toFixed(6));
      
      // Cargar incidentes cercanos a la posición clickeada
      loadNearbyIncidents(lat, lng, searchRadius);
    });
    
    // Intentar obtener la ubicación actual del usuario
    getCurrentLocation();
  }, []);

  return (
    <Container fluid className="pt-3">
      <Row>     
              
        {/* Área del mapa */}
        <Col lg={8}>
          <Card bg="light" className="mb-3">
            <Card.Title>Map</Card.Title>
            <Card.Body>
              <div id="map" style={{ height: "500px", width: "100%" }}></div>
              <div className="mt-2">
                <Button variant="info" onClick={getCurrentLocation} className="me-2">
                  Get My Location
                </Button>
                <Form.Label className="me-2">Search Radius (km):</Form.Label>
                <Form.Control
                  type="number"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={searchRadius}
                  onChange={handleRadiusChange}
                  style={{ width: "100px", display: "inline-block" }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
            <Stack gap={2}>
              <Button variant="dark" onClick={() => setShowIncidents(!showIncidents)}>
                Reported Incidents
              </Button>
              {showIncidents && (
                <Card bg="light" className="mb-3">
                  <Card.Title className="p-3">Reported Incidents</Card.Title>
                  <Card.Body>
                    {incidents.length === 0 ? (
                      <p>No incidents reported yet.</p>
                    ) : (
                      incidents.map((incident) => (
                        <div
                          key={incident.idIncident}
                          className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded incident-item"
                        >
                          <div
                            onClick={() => handleViewDetails(incident)}
                            style={{ cursor: "pointer", flexGrow: 1 }}
                          >
                            <span>
                              {incident.title} - Status: {incident.status} - Date: {new Date(incident.reportDate).toLocaleDateString()}
                            </span>
                          </div>
                          <Dropdown>
                            <Dropdown.Toggle variant="link" id={`dropdown-${incident.idIncident}`}>
                              <span style={{ fontSize: "1.5rem", lineHeight: "1" }}>
                                ⋮
                              </span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleDeleteIncident(incident.idIncident)}>
                                Delete
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleUpdateIncident(incident.idIncident)}>
                                Update
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      ))
                    )}
                  </Card.Body>
                </Card>
              )}
              <Button variant="dark" onClick={() => setShowForm(!showForm)}>
                Register New Incident
              </Button>

              {showForm && (
                <Card bg="light" className="p-3">
                  <Card.Title>New Incident</Card.Title>
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Type of incident</Form.Label>
                      <Form.Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Title</Form.Label>
                      <Form.Control
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Latitude</Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Longitude</Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Report date</Form.Label>
                      <Form.Control
                        type="date"
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
                        max={maxDate}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Attach evidence (at least one photo required)</Form.Label>
                      <Form.Control
                        type="file"
                        multiple
                        onChange={handlePhotoChange}
                        accept="image/*"
                        required
                      />
                    </Form.Group>

                    {photoPreviews.length > 0 && (
                      <div className="mb-3">
                        <h6>Selected Images:</h6>
                        <Row>
                          {photoPreviews.map((preview, index) => (
                            <Col xs={6} md={4} key={index} className="mb-2">
                              <div className="position-relative">
                                <Image
                                  src={preview}
                                  thumbnail
                                  style={{ maxWidth: "100px", maxHeight: "100px" }}
                                />
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="position-absolute top-0 end-0"
                                  onClick={() => handleRemovePhoto(index)}
                                >
                                  X
                                </Button>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}

                    <Button variant="primary" type="submit">
                      Create
                    </Button>
                  </Form>
                </Card>
              )}

              {message && (
                <Alert variant={variant} className="mt-3">
                  {message}
                </Alert>
              )}
              </Stack>
            </Col>
        </Row>
      </Container>
    );
  }

  export default Inicio;