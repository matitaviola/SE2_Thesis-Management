import { Button, Col, Container, Row, Form } from "react-bootstrap";
import API from "../API";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProposalsFormComponent(props) {
  const navigate = useNavigate();
  const [proposal, setProposal] = useState({
    title: "",
    supervisor: "",
    co_supervisor: "",
    notes: "",
    cds: "",
    description: "",
    expiration: "",
    level: "",
    keywords: "",
    type: "",
    groups: "",
    req_knowledge: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProposal({ ...proposal, [name]: value });
  };

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      await API.createProposal(proposal);
      navigate("/proposals");
    } catch (error) {
      props.setErrorMessage(true);
    }
  };

  return (
    <Container>
      <Row>
        <h1>{"New Proposal"}</h1>
      </Row>
      <Row className="justify-content-center">
        <Col md={6}>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={proposal.title}
                onChange={handleChange}
                placeholder="Enter title"
                required
              />
            </Form.Group>

            <Form.Group controlId="formSupervisor">
              <Form.Label>Supervisor</Form.Label>
              <Form.Control
                type="text"
                name="supervisor"
                value={proposal.supervisor}
                onChange={handleChange}
                placeholder="Enter supervisor"
                required
              />
            </Form.Group>

            <Form.Group controlId="formCoSupervisor">
              <Form.Label>Co_supervisor</Form.Label>
              <Form.Control
                type="text"
                name="co_supervisor"
                value={proposal.co_supervisor}
                onChange={handleChange}
                placeholder="Enter Co-supervisors"
                required
              />
            </Form.Group>

            <Form.Group controlId="formKeywords">
              <Form.Label>Keywords</Form.Label>
              <Form.Control
                type="text"
                name="keywords"
                value={proposal.keywords}
                onChange={handleChange}
                placeholder="Enter keywords"
                required
              />
            </Form.Group>

            <Form.Group controlId="formType">
              <Form.Label>Type</Form.Label>
              <Form.Control
                type="text"
                name="type"
                value={proposal.type}
                onChange={handleChange}
                placeholder="Enter type"
                required
              />
            </Form.Group>

            <Form.Group controlId="formGroups">
              <Form.Label>Groups</Form.Label>
              <Form.Control
                type="text"
                name="groups"
                value={proposal.groups}
                onChange={handleChange}
                placeholder="Enter groups"
                required
              />
            </Form.Group>

            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={proposal.description}
                onChange={handleChange}
                placeholder="Enter description"
              />
            </Form.Group>

            <Form.Group controlId="formReqKnowledge">
              <Form.Label>Required Knowledge</Form.Label>
              <Form.Control
                type="text"
                name="req_knowledge"
                value={proposal.req_knowledge}
                onChange={handleChange}
                placeholder="Enter required knowledge"
                required
              />
            </Form.Group>

            <Form.Group controlId="formNotes">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                type="text"
                name="notes"
                value={proposal.notes}
                onChange={handleChange}
                placeholder="Enter notes"
                required
              />
            </Form.Group>

            <Form.Group controlId="formExpiration">
              <Form.Label>Expiration</Form.Label>
              <Form.Control
                type="text"
                name="expiration"
                value={proposal.expiration}
                onChange={handleChange}
                placeholder="Enter expiration"
                required
              />
            </Form.Group>

            <Form.Group controlId="formLevel">
              <Form.Label>Level</Form.Label>
              <Form.Control
                type="text"
                name="level"
                value={proposal.level}
                onChange={handleChange}
                placeholder="Enter level"
                required
              />
            </Form.Group>

            <Form.Group controlId="formCds">
              <Form.Label>CdS/Programmes</Form.Label>
              <Form.Control
                type="text"
                name="cds"
                value={proposal.cds}
                onChange={handleChange}
                placeholder="Enter CdS/Programmes"
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-2">
              Submit
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
