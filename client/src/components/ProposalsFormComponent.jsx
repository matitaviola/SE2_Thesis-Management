import { Button, Col, Container, Row, Form } from "react-bootstrap";
import { AiOutlineUser, AiOutlineTeam, AiOutlineFileText, AiOutlineCalendar, AiOutlineBulb, AiOutlineInfoCircle } from "react-icons/ai";
import API from "../API";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../App';

export default function ProposalsFormComponent(props) {
  const navigate = useNavigate();
  const loggedInUser = useContext(AuthContext);
  const [degrees, setDegrees] = useState([]);
  const [proposal, setProposal] = useState({
    title: "",
    supervisor: "",
    coSupervisor: "",
    notes: "",
    cds: "",
    description: "",
    expiration: "",
    level: "",
    keywords: "",
    type: "",
    reqKnowledge: "",
  });
  const [coSupervisorsList, setCoSupervisorList] = useState([{
    id:"", name:"", surname:"", dep:"", group:""
  }]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProposal({ ...proposal, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    proposal.supervisor = loggedInUser.id;
    try {
      await API.createProposal(proposal, loggedInUser);
      navigate("/proposals");
    } catch (err) {
      props.setErrorMessage(`${err}`);
    }
  };

  useEffect(() => {
    const fetchDegrees = async () => {
      try {
        const response = await API.getDegrees();
        setDegrees(response);
      } catch (err) {
        props.setErrorMessage(`${err}`);
      }
    };
    const fetchCoSupervisors = async () => {
      try {
        const response = await API.getCoSupervisorsList(loggedInUser);
        console.log(response);
        setCoSupervisorList(response);
        //TODO: remove console.log and add logic to allow selection of cosupervisors
        console.log(coSupervisorsList);
      } catch (err) {
        props.setErrorMessage(`${err}`);
      }
    };

    fetchCoSupervisors();
    fetchDegrees();
  }, []);

  const renderFormGroup = (label, name, type = "text", placeholder = "", icon) => {
    const isRequiredField = name !== 'coSupervisor' && name !== 'notes' && name !== 'reqKnowledge';
    const today = new Date().toISOString().split('T')[0];
    return (
      <Form.Group controlId={`form${name}`} className="mb-3">
        <Form.Label>
        {icon && <span className="icon">{icon}</span>} {label}
        {isRequiredField && <span className="text-danger"> *</span>}
        </Form.Label>
        <Form.Control
          className="place-holder-style"
          type={type}
          as={name === 'notes' ? 'textarea' : 'input'} 
          name={name}
          value={proposal[name]}
          onChange={handleChange}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          required={isRequiredField}
          min={name === 'expiration' ? today : undefined}
        />
      </Form.Group>
    );
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <h1>{"New Proposal"}</h1>
      </Row>
      <Row className="justify-content-center">
        <Col md={6}>
          <Form onSubmit={handleSubmit}>
            {renderFormGroup("Title", "title", "text", "", <AiOutlineFileText />)}
            {renderFormGroup("Co-Supervisor", "coSupervisor", "text", "", <AiOutlineUser />)}
            {renderFormGroup("Keywords", "keywords", "text", "", <AiOutlineBulb />)}
            {renderFormGroup("Type", "type", "text", "", <AiOutlineInfoCircle />)}
            {renderFormGroup("Description", "description", "textarea", "Enter description", <AiOutlineInfoCircle />)}
            {renderFormGroup("Required Knowledge", "reqKnowledge", "text", "", <AiOutlineBulb />)}
            {renderFormGroup("Notes", "notes", "text", "", <AiOutlineInfoCircle />)}
            {renderFormGroup("Expiration", "expiration", "date", "", <AiOutlineCalendar />)}
            <Form.Group controlId="formLevel"  className="mb-3">
              <Form.Label>Level <span className="text-danger"> *</span></Form.Label>
              <Form.Select
                name="level"
                value={proposal.level}
                onChange={handleChange}
                className="place-holder-style"
                required
              >
                <option value="">Select Level</option>
                <option value="BSc">BSc</option>
                <option value="MSc">MSc</option>
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="formDegrees" className="mb-3">
              <Form.Label>Degree <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="cds"
                value={proposal.cds}
                onChange={handleChange}
                className="place-holder-style"
                required
              >
                <option key="default" value="">Select Degree</option>
                {degrees.map((degree) => (
                  <option key={degree.COD_DEGREE} value={degree.COD_DEGREE}>
                    {degree.TITLE_DEGREE}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button variant="success" type="submit" className="mt-2">
              Save
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
