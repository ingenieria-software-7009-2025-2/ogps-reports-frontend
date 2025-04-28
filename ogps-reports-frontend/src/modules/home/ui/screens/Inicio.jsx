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


  return (
      <Container fluid className="pt-3">
        <Row>
          <Col lg={8}>
            <Card bg="light" className="mb-3">
              <Card.Title>Map</Card.Title>
              <Card.Body>Map placeholder</Card.Body>
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