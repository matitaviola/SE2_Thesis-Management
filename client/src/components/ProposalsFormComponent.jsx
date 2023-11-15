import { Button, Col, Container, Row, Form } from "react-bootstrap";
import API from "../API";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../App';

export default function ProposalsFormComponent(props) {
  const navigate = useNavigate();
  const loggedInUser = useContext(AuthContext);
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
      proposal.supervisor = loggedInUser.id;
      await API.createProposal(proposal, loggedInUser);
      navigate("/proposals");
    } catch (error) {
      console.log("Error in inserting proposal: ", error);
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
                type="date"
                name="expiration"
                value={proposal.expiration}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formLevel">
              <Form.Label>Level</Form.Label>
              <Form.Select
              name="level"
              value={proposal.level}
              onChange={handleChange}
              required
              >
                <option value="">Select Level</option>
                <option value="BSc">BSc</option>
                <option value="MSc">MSc</option>
              </Form.Select>
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
