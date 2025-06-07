import { Card, Container, Row, Col, Button, Form, Alert, Image } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import userApi from "../../../../network/userApi";
import { INCIDENT_DETAILS_PATH } from "../../../../navigation/sitePaths";

function UpdateIncidentStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const incident = location.state?.incident;

  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("danger");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!incident) {
      navigate(-1);
      return;
    }
  }, [incident, navigate]);

  const handlePhotoChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setPhotos(selectedFiles);

    photoPreviews.forEach(preview => URL.revokeObjectURL(preview));

    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  const handleRemovePhoto = (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);

    URL.revokeObjectURL(photoPreviews[index]);

    setPhotos(updatedPhotos);
    setPhotoPreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const updateData = {
        status: incident.status, // Mantener el estado actual
        description: description.trim() || null,
      };

      // Llamar a la funcion de la API que actualiza el incidente
      await userApi.updateIncidentStatus(incident.idIncident, updateData, photos);

      setVariant("success");
      setMessage("Additional information added successfully");

      // Limpiar vistas previas de la imagenes
      photoPreviews.forEach(preview => URL.revokeObjectURL(preview));

      // Limpiar formulario
      setDescription("");
      setPhotos([]);
      setPhotoPreviews([]);

    } catch (error) {
      setVariant("danger");
      setMessage("Error updating incident: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Limpiar las vistas previas de las imagenes antes de regresar
    photoPreviews.forEach(preview => URL.revokeObjectURL(preview));
    navigate(-1);
  };

  useEffect(() => {
    return () => {
      photoPreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, []);

  if (!incident) {
    return (
      <Container>
        <Alert variant="warning">
          No incident data found. Please go back and try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="pt-3">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card bg="light" className="mb-3">
            <Card.Body>
              <h2 className="text-center mb-4">Incident Information</h2>

              {/* Current Incident Info */}
              <div className="mb-4 p-3 border rounded bg-white">
                <h5>Incident: {incident.title}</h5>
                <p><strong>Current Status:</strong> <span className="badge bg-primary">{incident.status}</span></p>
                <p><strong>Type:</strong> {incident.category}</p>
                <p><strong>Date:</strong> {new Date(incident.reportDate).toLocaleDateString()}</p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add any additional notes or comments about this incident..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Images</Form.Label>
                  <div className="border rounded p-4 text-center bg-white" style={{ minHeight: "150px" }}>
                    <Form.Control
                      type="file"
                      multiple
                      onChange={handlePhotoChange}
                      accept="image/*"
                      style={{ display: "none" }}
                      id="photo-upload"
                    />
                    <Form.Label
                      htmlFor="photo-upload"
                      className="btn btn-outline-secondary mb-0"
                      style={{ cursor: "pointer" }}
                    >
                      Choose Images
                    </Form.Label>
                    <p className="text-muted mt-2 mb-0">Click to add additional evidence images</p>
                  </div>
                </Form.Group>

                {photoPreviews.length > 0 && (
                  <div className="mb-3">
                    <h6>Selected Images:</h6>
                    <Row>
                      {photoPreviews.map((preview, index) => (
                        <Col xs={6} md={3} key={index} className="mb-2">
                          <div className="position-relative">
                            <Image
                              src={preview}
                              thumbnail
                              style={{ width: "100%", height: "100px", objectFit: "cover" }}
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              className="position-absolute top-0 end-0"
                              onClick={() => handleRemovePhoto(index)}
                              style={{ borderRadius: "50%", width: "25px", height: "25px", padding: "0" }}
                            >
                              ×
                            </Button>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                {(description.trim() || photos.length > 0) && (
                  <div className="d-flex justify-content-center gap-3 mt-4">
                    <Button
                      variant="dark"
                      type="submit"
                      disabled={loading}
                      style={{ minWidth: "150px" }}
                    >
                      {loading ? "Adding..." : "Add Information"}
                    </Button>
                  </div>
                )}
              </Form>

              {message && (
                <Alert variant={variant} className="mt-3">
                  {message}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4} className="d-flex align-items-start">
          <div className="w-100">
            <Button 
              variant="dark" 
              className="w-100" 
              onClick={handleBack}
              style={{ minHeight: "50px" }}
            >
              Back to map
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default UpdateIncidentStatus;