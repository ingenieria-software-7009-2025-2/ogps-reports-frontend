import { Card, Container, Row, Col, Button, Image } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { HOME_PATH } from "../../../../navigation/sitePaths";

function IncidentDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const incident = location.state?.incident;

  if (!incident) {
    return <Container><p>Incident not found.</p></Container>;
  }

  const handleBack = () => {
    navigate(HOME_PATH);
  };

  const handleUpdateStatus = () => {
    alert("Update Status functionality not implemented yet.");
  };

  const handleValidateStatus = () => {
    alert("Validate Status functionality not implemented yet.");
  };

  const handleVerify = async () => {
      try{
          const response = await userApi.verifyIncident(incident.idIncident);
          setVariant("success");
          setMessage("Verified Incident. Status: " + response.data.message);
          } catch (error) {
              setVariant("danger");
              setMessage(error.response?.data?.error || "Error in verify incident.");
              }
          };

  return (
    <Container fluid className="pt-3">
      <Row>
        <Col lg={9}>
          <Card bg="light" className="mb-3 incident-details-card">
            <h1 className="incident-details-title">Incident Details</h1>
            <Card.Body>
              {/* Title */}
              <div className="incident-detail-section">
                <strong>Title:</strong>
                <p>{incident.title}</p>
              </div>

              {/* Date and Status */}
              <div className="d-flex justify-content-between gap-3 mb-3">
                <div className="incident-detail-section w-50">
                  <strong>Date:</strong>
                  <p>{new Date(incident.reportDate).toLocaleDateString()}</p>
                </div>
                <div className="incident-detail-section w-50">
                  <strong>Status:</strong>
                  <p>{incident.status}</p>
                </div>
              </div>

              {/* Location and Type */}
              <div className="d-flex justify-content-between gap-3 mb-3">
                <div className="incident-detail-section w-50">
                  <strong>Location:</strong>
                  <p>({incident.latitude}, {incident.longitude})</p>
                </div>
                <div className="incident-detail-section w-50">
                  <strong>Type:</strong>
                  <p>{incident.category}</p>
                </div>
              </div>

              {/* Description */}
              <div className="incident-detail-section">
                <strong>Description:</strong>
                <p>{incident.description || "No description provided."}</p>
              </div>

              {/* Images */}
              <div className="incident-detail-section">
                <strong>Images:</strong>
                {incident.evidences && incident.evidences.length > 0 ? (
                  <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                    {incident.evidences.map((evidence) => (
                      <Image
                        key={evidence.id}
                        src={evidence.photoUrl}
                        alt="Evidence"
                        className="incident-detail-image"
                        thumbnail
                      />
                    ))}
                  </div>
                ) : (
                  <p>No images available.</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} className="d-flex align-items-center">
          <div className="incident-details-buttons w-100">
            <Button variant="dark" className="incident-details-button" onClick={handleBack}>
              Back to map
            </Button>
            <Button variant="dark" className="incident-details-button" onClick={handleUpdateStatus}>
              Update Status
            </Button>
            <Button variant="dark" className="incident-details-button" onClick={handleValidateStatus}>
              Validate Status
            </Button>
            <Button variant="dark" className="incident-details-button" onClick={handleVerify} disabled={incident.status === "Resolved"}>
                Verify Incident
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default IncidentDetails;