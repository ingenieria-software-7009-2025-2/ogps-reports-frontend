import { Card, Container, Stack, Button, Form, Row, Col, Alert, Image, Dropdown, Offcanvas } from "react-bootstrap";
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

  const [nearbyIncidents, setNearbyIncidents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5.0);

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(false);

  const marcadores = [
    {
      id: 1,
      title: "Pothole on the street",
      latitude: 19.4336,
      longitude: -99.1342,
      category: "Potholes",
      description: "Deep pothole at the street corner",
      status: "Pending",
      reportDate: "2025-04-20",
    },
  ];

  const categories = [
    "Potholes and Defects",
    "Street Lighting",
    "Traffic Accidents",
    "Obstacles",
    "Other",
  ];

  const categoryTranslations = {
    "Potholes and Defects": "Potholes and Defects",
    "Street Lighting": "Street Lighting",
    "Traffic Accidents": "Traffic Accidents",
    "Obstacles": "Obstacles",
    "Other": "Other",
  };

  const today = new Date();
  const maxDate = today.toISOString().split("T")[0];

  useEffect(() => {
    // Obtener incidentes reportados al cargar el componente
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
    // Manejar la selección de fotos
    const selectedFiles = Array.from(e.target.files);
    setPhotos(selectedFiles);
    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  const handleRemovePhoto = (index) => {
    // Eliminar una foto seleccionada
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

  const loadNearbyIncidents = (lat, lng, radius) => {
    // Cargar incidentes cercanos
    userApi
      .getNearbyIncidents(lat, lng, radius)
      .then((response) => {
        setNearbyIncidents(response.data);
        setVariant("success");
        setMessage(`Loaded ${response.data.length} nearby incidents`);

        if (window.google && window.map) {
          agregarMarcadores(window.map, response.data);
        }
      })
      .catch((error) => {
        setVariant("danger");
        setMessage("Error loading nearby incidents: " + (error.response?.data?.message || error.message));
      });
  };

  const getCurrentLocation = () => {
    // Obtener la ubicación actual del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setLatitude(lat.toFixed(6));
          setLongitude(lng.toFixed(6));

          loadNearbyIncidents(lat, lng, searchRadius);

          if (window.map) {
            window.map.setCenter({ lat, lng });

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
              title: "Your Location",
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

  const handleRadiusChange = (e) => {
    // Actualizar el radio de búsqueda
    const newRadius = parseFloat(e.target.value);
    setSearchRadius(newRadius);

    if (userLocation) {
      loadNearbyIncidents(userLocation.lat, userLocation.lng, newRadius);
    }
  };

  const handleSubmit = (e) => {
    // Manejar el envío del formulario de nuevo incidente
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
        userApi.getReportedIncidents().then((res) => setIncidents(res.data));

        if (userLocation) {
          loadNearbyIncidents(userLocation.lat, userLocation.lng, searchRadius);
        }
      })
      .catch((error) => {
        setVariant("danger");
        setMessage("Error reporting incident: " + (error.response?.data?.message || error.message));
      });
  };

  const handleDeleteIncident = (incidentId) => {
    // Manejar la eliminación de un incidente
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
          setMessage("Error deleting incident: " + (error.response?.data?.error || error.message));
        });
    }
  };

  const handleUpdateIncident = (incidentId) => {
    // Manejar la actualización de un incidente (pendiente de implementación)
    setVariant("info");
    setMessage("Update functionality not implemented yet.");
  };

  const handleViewDetails = (incident) => {
    // Navegar a los detalles del incidente
    navigate(`${INCIDENT_DETAILS_PATH}/${incident.idIncident}`, { state: { incident } });
  };

  function agregarMarcadores(mapa, incidentes) {
    // Agregar marcadores al mapa
    if (window.markers) {
      window.markers.forEach((marker) => marker.setMap(null));
    }

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
            <strong>Title:</strong> ${incidente.title || "No title"}<br/>
            <strong>Category:</strong> ${incidente.category}<br/>
            <strong>Status:</strong> ${incidente.status || "Pending"}<br/>
            <strong>Date:</strong> ${new Date(incidente.reportDate).toLocaleDateString()}<br/>
            ${incidente.description ? `<strong>Description:</strong> ${incidente.description}` : ""}
          </div>
        `,
      });

      marcador.addListener("click", () => {
        infoWindow.open(mapa, marcador);
      });
    });
  }

  useEffect(() => {
    // Inicializar el mapa al cargar el componente
    if (!window.google) {
      console.error("Google Maps no ha sido cargado aún.");
      return;
    }

    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 19.4326, lng: -99.1332 },
      zoom: 12,
    });

    window.map = map;
    window.markers = [];

    agregarMarcadores(map, marcadores);

    let marker = null;

    map.addListener("click", (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      if (marker) {
        marker.setPosition({ lat, lng });
      } else {
        marker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          draggable: false,
        });
      }

      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));

      loadNearbyIncidents(lat, lng, searchRadius);
    });

    getCurrentLocation();
  }, []);

  const handleFilterChange = (category) => {
    // Alternar la selección de una categoría
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const applyFilters = async () => {
    // Aplicar los filtros seleccionados
    if (selectedCategories.length === 0) {
      if (userLocation) {
        loadNearbyIncidents(userLocation.lat, userLocation.lng, searchRadius);
        setFilteredIncidents([]);
      }
      handleCloseFilterMenu();
      return;
    }

    setLoading(true);
    try {
      const response = await userApi.getIncidentsByCategories(selectedCategories);
      setFilteredIncidents(response.data);
      if (window.google && window.map) {
        agregarMarcadores(window.map, response.data);
      }
      setVariant("success");
      setMessage(`Filtered ${response.data.length} incidents`);
    } catch (error) {
      setVariant("danger");
      setMessage(
        error.response?.status === 404
          ? "No incidents match the selected filters."
          : error.response?.status === 503
          ? "Error loading incidents. Please try again later."
          : "Error filtering incidents: " + (error.response?.data?.error || error.message)
      );
      if (window.google && window.map) {
        agregarMarcadores(window.map, []);
      }
    } finally {
      setLoading(false);
      handleCloseFilterMenu();
    }
  };

  const clearFilters = () => {
    // Limpiar todos los filtros seleccionados
    setSelectedCategories([]);
    if (userLocation) {
      loadNearbyIncidents(userLocation.lat, userLocation.lng, searchRadius);
    } else {
      if (window.google && window.map) {
        agregarMarcadores(window.map, marcadores);
      }
    }
    setFilteredIncidents([]);
    handleCloseFilterMenu();
  };

  const handleShowFilterMenu = () => setShowFilterMenu(true);
  const handleCloseFilterMenu = () => setShowFilterMenu(false);

  return (
    <Container fluid className="pt-3">
      <Row>
        {/* Área del mapa */}
        <Col lg={8}>
          <Card bg="light" className="mb-3">
            <Card.Title>Map</Card.Title>
            <Card.Body>
              <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 1000 }}>
                <Button variant="primary" onClick={handleShowFilterMenu}>
                  <span>☰ Filters</span>
                </Button>
              </div>

              <Offcanvas show={showFilterMenu} onHide={handleCloseFilterMenu} placement="end">
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title>Filter Incidents</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  <Form>
                    {categories.map((cat) => (
                      <div
                        key={cat}
                        style={{
                          marginBottom: "15px",
                          padding: "10px",
                          borderRadius: "8px",
                          backgroundColor: selectedCategories.includes(cat) ? "#e0f7fa" : "#f8f9fa",
                          border: "1px solid #dee2e6",
                          transition: "background-color 0.3s ease",
                          cursor: "pointer",
                        }}
                        onClick={() => handleFilterChange(cat)}
                      >
                        <span
                          style={{
                            fontSize: "1.1rem",
                            color: "#333",
                          }}
                        >
                          {categoryTranslations[cat] || cat}
                        </span>
                      </div>
                    ))}
                  </Form>
                  <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
                    <Button variant="primary" onClick={applyFilters} disabled={loading}>
                      {loading ? "Loading..." : "Apply Filters"}
                    </Button>
                    <Button variant="secondary" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                </Offcanvas.Body>
              </Offcanvas>

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
              {loading && <p>Loading incidents...</p>}
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
                            <span style={{ fontSize: "1.5rem", lineHeight: "1" }}>⋮</span>
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
                    <Form.Label>Type of Incident</Form.Label>
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
                    <Form.Label>Report Date</Form.Label>
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
                    <Form.Label>Attach Evidence (at least one photo required)</Form.Label>
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