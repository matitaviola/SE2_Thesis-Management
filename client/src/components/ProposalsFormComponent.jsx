import { Button, Col, Container, Row, Form } from "react-bootstrap";
import { AiOutlineUser, AiOutlineTeam, AiOutlineFileText, AiOutlineCalendar, AiOutlineBulb, AiOutlineInfoCircle } from "react-icons/ai";
import API from "../API";
import { useState, useContext, useEffect, React } from "react";
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
  const [externalsFormData, setExternalsFormData] = useState({
    name: '',
    surname: '',
    mail: '',
  });
  const [externalsError, setExternalsError] = useState('');
  const [submitError, setSubmitError] = useState('');

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
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    proposal.supervisor = loggedInUser.id;
    proposal.cds = proposal.cds.trim();
    proposal.coSupervisor = formatCoSupervisors();
    if(submitFormsCheck()){
      if(proposalToUpdate) {
        try {
          proposal.id = proposalToUpdate.id;
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
    }
  };

  const submitFormsCheck = () => {
    //checks for multiple cds
      if(!proposal.cds){
        setSubmitError('At least 1 Degree is required.');
        return false;
      }
      return true;
  }

  const formatCoSupervisors = () =>{
    const formattedAcademics = academics? academics.map(ac => ac.id).join(",") : ""
    const formattedExternals = externals? externals.map(ex => ex.name.trim().replace(" ","_")+" "+ex.surname.trim().replace(" ","_")+" "+ex.mail.trim()).join(",") :"";
    const formattedAll = formattedAcademics + (academics?.length>0 && externals?.length>0 ?",":"") + formattedExternals;
    return formattedAll;
  }

  const removeOption = (name, value) =>{
    if(name=="cds"){
      const newCds = proposal.cds.replace(" "+value, "").replace(value+" ", "").replace(value,""); //if it's the first or if there is something after it or is the only one
      setProposal({...proposal, cds:newCds});
    }
    else if(name=="academics"){
      setAcademics(academics => academics.filter(ac => ac.id!=value));
    }else if(name=="externals"){
      setExternals(externals => externals.filter(ex => ex.mail!=value));
    }
  }

//External cosupervisors utilities
  const handleExternalsInputChange = (e) => {
    const { name, value } = e.target;
    setExternalsFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setExternalsError('');
  };
  const validateExternalsForm = () => {
    if (!externalsFormData.name || !externalsFormData.surname || !externalsFormData.mail) {
      setExternalsError('All fields must be filled.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(externalsFormData.mail)) {
      setExternalsError('Enter a valid email address.');
      return false;
    }
    return true;
  };
  const handleExternalsButtonClick = () => {
    if(validateExternalsForm()){
      const name = externalsFormData.name.trim();
      const surname= externalsFormData.surname.trim();
      const mail= externalsFormData.mail.trim();
      setExternals([...externals, {mail:mail, name:name, surname:surname}]);
      // Clear the form fields
      setExternalsFormData({
        name: '',
        surname: '',
        mail: '',
      });
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
      } catch (err) {
        props.setErrorMessage(`${err}`);
      }
    };
    const fetchProposalCoSupervisors = async () => {
      try {
        const response = await API.getCoSupervisorByProposal(proposalToUpdate.id);
        setAcademics(response.academic);
        setExternals(response.external);
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
        return {code:degree.COD_DEGREE, title:degree.TITLE_DEGREE}
    });
    return(
      <Container style={{padding:'0px', marginTop:'10px'}}>
      {cdsList.map(c => ((
        <Row key={c.code} style={{padding:'0px'}}>
          <Col xs={1}>
          <Button
                    className="remove-option-button"
                    variant=""
                    size="sm"
                    onClick={() => removeOption("cds", c.code)}
                  >
                    X
                  </Button>
                  </Col>
        <Col xs={11}>
          <p><i>{c.title}</i></p>
          </Col>
        </Row>
        )))}
      </Container>
    )
  }

  const renderAcademicList = () => {
    return(
      <>
      {academics.map(ac => (
        <Row key={ac.id} style={{padding:'0px', marginTop:'5px'}}>
          <Col xs={1}>
          <Button
                    className="remove-option-button"
                    variant=""
                    size="sm"
                    onClick={() => removeOption("academics", ac.id)}
                  >
                    X
                  </Button>
        </Col>
          <Col xs={11}>
          <p><i>{ac.name} {ac.surname}</i></p>
          </Col>
        </Row>
        ))
      }
      </>
    )
  }

  const renderExternalList = () => {
    return(
      <>
      {externals.map(ex => (
        <Row key={ex.mail} style={{padding:'0px', marginTop:'5px'}}>
          <Col xs={1}>
          <Button
                    className="remove-option-button"
                    variant=""
                    size="sm"
                    onClick={() => removeOption("externals", ex.mail)}
                  >
                    X
                  </Button>
          </Col>
          <Col xs={11}>
          <p>Name: <i>{ex.name}</i> Surname: <i>{ex.surname}</i> Email: <i>{ex.mail}</i></p>
          </Col>
        </Row>
        ))}
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
              <Form.Label><AiOutlineUser />Academic Co-Supervisors<span className="text-danger">*</span></Form.Label>
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
                    null
                ))}
              </Form.Select>
              {/* Show list of selected academics supervisors*/}
              {academics?.length>0?
                renderAcademicList()
              :
              <></>}
            </Form.Group>
            {/*External Co-supervisor*/}
            <Form.Group controlId="formExternals" className="mb-3">
              <Form.Label>
                <AiOutlineUser />External Co-Supervisors
                <span className="text-danger">*</span>
              </Form.Label>
              <Container className="externals-container">
                <Container className="externals-form">
                  <Row>
                    <Col>
                      Name:
                      <Form.Control
                        aria-label="Name"
                        name="name"
                        value={externalsFormData.name}
                        onChange={handleExternalsInputChange}
                      />
                    </Col>
                    <Col>
                      Surname:
                      <Form.Control
                        aria-label="Surname"
                        name="surname"
                        value={externalsFormData.surname}
                        onChange={handleExternalsInputChange}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      Email:
                      <Form.Control
                        aria-label="Email"
                        name="mail"
                        value={externalsFormData.mail}
                        onChange={handleExternalsInputChange}
                      />
                    </Col>
                  </Row>
                </Container>
                <div className="centered-button">
                  <Button
                    className="add-option-button"
                    variant=""
                    size="lg"
                    onClick={handleExternalsButtonClick}
                  >
                    +
                  </Button>
                </div>
              </Container>
              {externalsError && <div className="error-message" style={{color:'red'}}>{externalsError}</div>}
            </Form.Group>
            {externals?.length>0?
                renderExternalList()
              :
              null}
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
              >
                <option key="default" value="">Select Degree</option>
                {degrees.map((degree) => (
                  (!proposal.cds.includes(degree.COD_DEGREE))?
                    <option key={degree.COD_DEGREE} value={degree.COD_DEGREE}>
                      {degree.TITLE_DEGREE}
                    </option>
                  :
                    null
                ))}
              </Form.Select>
              {/* Show list of selected values */}
              {proposal.cds?.length>0 && degrees && degrees.length>0?
                renderCdSList()
              :
              <></>}
              {submitError && <div className="error-message" style={{color:'red'}}>{submitError}</div>}
            </Form.Group>
            <Button variant="success" type="submit" className="mt-3" style={{color:"white", marginRight:"10px"}}>
              SUBMIT
            </Button>
            { proposalToUpdate?
              <Button variant="danger" onClick={() => {
                let proposal = proposalToUpdate;
                console.log(proposal);
                navigate(`/proposals/${proposalToUpdate.id}`, { state: {proposal} })}} className="mt-3">
              CANCEL
            </Button> 
            : null
            }
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
