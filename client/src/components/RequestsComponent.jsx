import { Link} from 'react-router-dom';
import { AuthContext } from "../App.jsx";
import { useContext, useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Form} from 'react-bootstrap';
import { AiOutlineUser, AiOutlineTeam, AiOutlineFileText, AiOutlineInfoCircle } from "react-icons/ai";
import Swal from 'sweetalert2';
import NotFound from "./NotFoundComponent.jsx";
import API from "../API";
import RequestInfo from './RequestInfoComponent.jsx';


export default function RequestsComponent(props){
    const loggedInUser = useContext(AuthContext);

    if (loggedInUser && loggedInUser.role == 'STUDENT') {
        return (<RequestStudent studentId={loggedInUser.id} setErrorMessage={props.setErrorMessage}/>);
    }
    if (loggedInUser && (loggedInUser.role == 'TEACHER' || loggedInUser.role == 'CLERK')) {
        return (<RequestsTable user={loggedInUser} setErrorMessage={props.setErrorMessage} />);
    }
    return (
        <NotFound></NotFound>
    )
}

function RequestsTable(props){
    const [requests, setRequests] = useState([]);
    const user = props.user;

    useEffect(() => {
        const fetchRequests = async () => {
          try{
            let requestsResponse = await API.getRequests(user);
            setRequests(requestsResponse);
          }catch(err){
            props.setErrorMessage(`${err}`);
          }
        }
        fetchRequests()
      }, []);

    return (
        <div className="proposal-table">
          <h1>Requests to evaluate</h1>
          <Row>
            <Table striped hover responsive border={1}>
              <thead>
                <tr>
                  <th className="text-nowrap">Title</th>
                  <th className="text-nowrap">Supervisor </th>
                  <th className="text-nowrap">Co-Supervisors </th>
                  <th className='text-nowrap'>Student</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => {
                  {
                    return <tr key={r.id}>
                      <td className="grades-table-td">{r.title}</td>
                      <td className="grades-table-td">{r.supervisorName} {r.supervisorSurname}</td>
                      <td className="grades-table-td">{r.coSupervisorNames}</td>
                      <td className="grades-table-td">{r.studentName} {r.studentSurname}</td>
                      <td><Link to={`/requests/${r.id}`} state= {{ request: r}} ><Button className="btn-secondary">View</Button></Link></td>
                    </tr>
                  }
                })}
              </tbody>
            </Table>
          </Row>
    
        </div>
    )

}

function RequestStudent(props){
    const [request, setRequest] = useState({});
    const [refreshRequest, setRefreshRequest] = useState(true);
    //Tries to get an active request for the student, if any
    useEffect(() => {
        const fetchActiveRequest= async () => {
          try{
            const requestFetched = await API.getStudentActiveRequest(props.studentId);
            setRequest(requestFetched);
          }catch(err){
            props.setErrorMessage(`${err}`);
          }
        }
        if(refreshRequest){
            fetchActiveRequest();
            setRefreshRequest(false);
        }
      }, [refreshRequest]);

    return(
        <>
        {request.id?
            <RequestInfo setErrorMessage={props.setErrorMessage} request={request}/>
            :
            <RequestForm setErrorMessage={props.setErrorMessage} setRefreshRequest={setRefreshRequest}/>
        }
        </>
    )
}

function RequestForm(props){

    const loggedInUser = useContext(AuthContext);
    //we'll use the props when creating one starting from the Application
    const [request, setRequest] = useState({
        title:props.request? props.request.title : "",
        studentId: props.request? props.request.student : "",
        supervisorId: props.request? props.request.supervisor : "",
        coSupervisorId: props.request? props.request.coSupervisorId : "",//a list of dXXXXXX (only academics) separated by blank spaces e.g.: "d100001 d221100"
        description: props.request? props.request.description : "",
    });
    const [coSupervisorsList, setCoSupervisorList] = useState([{
        id:"", name:"", surname:""
    }]);
    const [coSupervisors, setCoSupervisors] = useState([]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        if(name=="coSupervisors"){
            setCoSupervisors([...coSupervisors, JSON.parse(value)]);
        }else{
            setRequest({ ...request, [name]: value });
        }
    };

    useEffect(() => {
        const fetchCoSupervisors = async () => {
          try {
            const response = await API.getAllSupervisorsList(loggedInUser);
            setCoSupervisorList(response);
          } catch (err) {
            props.setErrorMessage(`${err}`);
          }
        };
        fetchCoSupervisors();
    }, []);

    const formatCoSupervisors = () =>{
        return coSupervisors? coSupervisors.map(ac => ac.id).join(" ") : ""
    };

    const removeOption = (name, value) =>{
        if(name=="coSupervisors"){
            setCoSupervisors(coSupervisors => coSupervisors.filter(ac => ac.id!=value));
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        request.studentId = loggedInUser.id;
        request.coSupervisorId = formatCoSupervisors();
        Swal.fire({
                title: 'Create Request?',
                text: 'This operation will create a new Request with the inserted data',
                icon: 'warning',
                showCancelButton: true,
                cancelButtonText: 'NO',
                confirmButtonText: 'Yes, create!',
                cancelButtonColor: "red",
                confirmButtonColor: "#449d44",
                reverseButtons: false,
        }).then(async (result) => {
                if (result.isConfirmed) { 
                  try {
                    await API.createRequest(request);
                    //I changed something, i'll recall the hook
                    props.setRefreshRequest(true);
                    Swal.fire('Creation completed!', 'The new request has been successfully created.', 'success');
                  } catch (err) {
                    props.setErrorMessage(`${err}`);
                  }
          }
        });
    };

    const renderCoSupervisorsList = () => {
        return(
          <>
          {coSupervisors.map(ac => (
            <Row key={ac.id} style={{padding:'0px', marginTop:'5px'}}>
              <Col xs={1}>
              <Button
                        className="remove-option-button"
                        variant=""
                        size="sm"
                        onClick={() => removeOption("coSupervisors", ac.id)}
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
              value={request[name]}
              onChange={handleChange}
              placeholder={placeholder || `Enter ${label.toLowerCase()}`}
              required={isRequiredField}
              min={name === 'expiration' ? today : undefined}
            />
          </Form.Group>
        );
    };

    return(
        <Container>
            <Row className="justify-content-center">
                <h1>Create Thesis Request {props.request?.applicationId? `from application ${props.request.applicationId}` : null}</h1>
            </Row>
        <Col md={6}>
            <Form onSubmit={handleSubmit}>
                {renderFormGroup("Title", "title", "text", "", <AiOutlineFileText />)}
                <Form.Group controlId="formSupervisor"  className="mb-3">
                <Form.Label><AiOutlineUser />Supervisor <span className="text-danger"> *</span></Form.Label>
                <Form.Select
                    name="supervisorId"
                    value={request.supervisorId}
                    onChange={handleChange}
                    className="place-holder-style"
                    required
                >
                   {request.supervisorId ?
                        <option key={request.supervisorId} value={request.supervisorId}>
                            {coSupervisorsList.find((sup) => sup.id === request.supervisorId)?.name}{" "}
                            {coSupervisorsList.find((sup) => sup.id === request.supervisorId)?.surname}
                        </option>
                        : 
                        <option value="">Select Supervisor</option>
                    }
                    {coSupervisorsList.map((sup) => (
                    (!coSupervisors.find(ac=> (ac.id==sup.id)) && !(sup.id==request.supervisorId))?
                        <option key={sup.id} value={sup.id}>
                        {sup.name} {sup.surname}
                        </option>
                    :
                        null
                    ))}
                </Form.Select>
                </Form.Group>
                <Form.Group controlId="formCoSupervisors" className="mb-3">
                <Form.Label><AiOutlineTeam />Academic Co-Supervisors</Form.Label>
                <Form.Select
                    name="coSupervisors"
                    value={request.coSupervisor? request.coSupervisor : ""}
                    onChange={handleChange}
                    className="place-holder-style"
                >
                    <option key="default" value="">Select Co-Supervisor(s)</option>
                    {coSupervisorsList.map((sup) => (
                    (!coSupervisors.find(ac=> (ac.id==sup.id)) && !(sup.id==request.supervisorId))?
                        <option key={sup.id} value={JSON.stringify(sup)}>
                        {sup.name} {sup.surname}
                        </option>
                    :
                        null
                    ))}
                </Form.Select>
                {/* Show list of selected academics supervisors*/}
                {coSupervisors?.length>0?
                    renderCoSupervisorsList()
                :
                <></>}
                </Form.Group>
                {renderFormGroup("Description", "description", "textarea", "Enter description", <AiOutlineInfoCircle />)}
                <Button variant="success" type="submit" className="mt-3" style={{color:"white", marginRight:"10px"}}>
                SUBMIT
                </Button>
            </Form>
        </Col>
        </Container>
    )
}
