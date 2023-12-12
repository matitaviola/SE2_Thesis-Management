import { Button, Col, Container, Row, Form } from "react-bootstrap";
import { AiOutlineUser, AiOutlineTeam, AiOutlineFileText, AiOutlineCalendar, AiOutlineBulb, AiOutlineInfoCircle } from "react-icons/ai";
import API from "../API";
import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from '../App';

export default function ProposalsFormComponent(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const proposalToUpdate = location.state;
  const loggedInUser = useContext(AuthContext);
  const [degrees, setDegrees] = useState([]);
  const [proposal, setProposal] = useState({
    title:proposalToUpdate? proposalToUpdate.title : "",
    supervisor: proposalToUpdate? proposalToUpdate.supervisor : "",
    coSupervisor: proposalToUpdate? proposalToUpdate.coSupervisor : "",//a list of either dXXXXXX (for academic) and/or Surname Name email (for non-academic), separated by commas
    // e.g.: "d100001,Jordan Michael mike@anemail.com,d221100"
    // if the name or the surname are composed the parts must be fused using underscores before being sent:
    // e.g.: the user inputs name:Juan Maria, surname:Perrez Balsamica, mail:jmpb@email.mx and you send "Juan_Maria Perrez_Balsamica jmpb@email.mx"
    notes: proposalToUpdate? proposalToUpdate.notes : "",
    cds: proposalToUpdate? proposalToUpdate.cds : "",//a list of CdS codes separated by a blank space, e.g.: "CS101 BIO303"
    description: proposalToUpdate? proposalToUpdate.description : "",
    expiration: proposalToUpdate? proposalToUpdate.expiration : "",
    level: proposalToUpdate? proposalToUpdate.level : "",
    keywords: proposalToUpdate? proposalToUpdate.keywords : "",
    type: proposalToUpdate? proposalToUpdate.type : "",
    reqKnowledge: proposalToUpdate? proposalToUpdate.reqKnowledge : "",
  });
  const [coSupervisorsList, setCoSupervisorList] = useState([{
    id:"", name:"", surname:""
  }]);
  const [academics, setAcademics] = useState([]);
  const [externals, setExternals] = useState([]);

  const handleChange = (event) => {
    let { name, value } = event.target;
    if(name=="cds"){
      value = value+" "+proposal.cds;
    }
    if(name=="academics"){
      setAcademics([...academics, JSON.parse(value)]);
    }else if(name=="externals"){
      setExternals([...externals, JSON.parse(value)]);
    }else{
    setProposal({ ...proposal, [name]: value });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    proposal.supervisor = loggedInUser.id;
    if(proposalToUpdate) {
      try {
        /*TODO: logic to get the academic ids and the externals in the correct format*/
        await API.updateProposal(proposal);
        navigate("/proposals");
      } catch (err) {
        props.setErrorMessage(`${err}`);
      }
    } else {
      try {
        await API.createProposal(proposal, loggedInUser);
        navigate("/proposals");
      } catch (err) {
        props.setErrorMessage(`${err}`);
      }
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
        setCoSupervisorList(response);
        //TODO: remove console.log and add logic to allow selection of cosupervisors
      } catch (err) {
        props.setErrorMessage(`${err}`);
      }
    };
    const fetchProposalCoSupervisors = async () => {
      try {
        const response = await API.getCoSupervisorByProposal(proposalToUpdate.id);
        setAcademics(response.academic);
        setExternals(response.external);
        //TODO: remove console.log and add logic to allow selection of cosupervisors
      } catch (err) {
        props.setErrorMessage(`${err}`);
      }
    };

    fetchCoSupervisors();
    fetchDegrees();
    if(proposalToUpdate) fetchProposalCoSupervisors();
  }, []);

  const renderCdSList = () => {
    const cdsList = proposal.cds.trim().split(" ").map(c => {
        const degree = degrees.find(d=> d.COD_DEGREE==c);
        console.log(degrees, degree);
        console.log(proposal.cds, c);
        return {code:degree.TITLE_DEGREE, title:degree.TITLE_DEGREE}
    });
    return(
      <>
      {cdsList.map(c => (<p key={c.code}><i>{c.title}</i></p>))}
      </>
    )
  }

  const renderAcademicList = () => {
    return(
      <>
      {academics.map(ac => (<p key={ac.id}><i>{ac.name} {ac.surname}</i></p>))}
      </>
    )
  }

  const renderExternalList = () => {
    return(
      <>
      {externals.map(ex => (<p key={ex.email}><i><b>Name: </b>{ex.name} <b>Surname: </b>{ex.surname} <b>Email:{ex.email}</b></i></p>))}
      </>
    )
  }

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
        <h1>{proposalToUpdate? "Update Proposal" : "New Proposal"}</h1>
      </Row>
      <Row className="justify-content-center">
        <Col md={6}>
          <Form onSubmit={handleSubmit}>
            {renderFormGroup("Title", "title", "text", "", <AiOutlineFileText />)}
            {/*renderFormGroup("Co-Supervisor", "coSupervisor", "text", "", <AiOutlineUser />)*/}
            <Form.Group controlId="formAcademics" className="mb-3">
              <Form.Label>Academic Co-Supervisors<span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="academics"
                value={proposal.coSupervisor}
                onChange={handleChange}
                className="place-holder-style"
              >
                <option key="default" value="">Select Co-Supervisor</option>
                {coSupervisorsList.map((sup) => (
                  (!academics.find(ac=> ac.id==sup.id))?
                    <option key={sup.id} value={JSON.stringify(sup)}>
                      {sup.name} {sup.surname}
                    </option>
                  :
                    <></>
                ))}
              </Form.Select>
              {/* Show list of selected academics supervisors*/}
              {academics?.length>0?
                renderAcademicList()
              :
              <></>}
            </Form.Group>
            {externals?.length>0?
                renderExternalList()
              :
              <></>}
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
                  (!proposal.cds.includes(degree.COD_DEGREE))?
                    <option key={degree.COD_DEGREE} value={degree.COD_DEGREE}>
                      {degree.TITLE_DEGREE}
                    </option>
                  :
                    <></>
                ))}
              </Form.Select>
              {/* Show list of selected values */}
              {proposal.cds?.length>0 && degrees && degrees.length>0?
                renderCdSList()
              :
              <></>}
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
