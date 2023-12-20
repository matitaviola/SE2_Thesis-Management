import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../App.jsx";
import { useContext, useState, useEffect } from "react";
import { Container, Row, Col, Button, Modal} from 'react-bootstrap';
import Swal from 'sweetalert2';
import NotFound from "./NotFoundComponent.jsx";
import API from "../API";


export default function RequestsComponent(props){
    const loggedInUser = useContext(AuthContext);

    if (loggedInUser && loggedInUser.role == 'STUDENT') {
        return (<RequestStudent studentId={loggedInUser.id} setErrorMessage={props.setErrorMessage}/>);
    }
    if (loggedInUser && (loggedInUser.role == 'TEACHER' || loggedInUser.role == 'CLERK')) {
        return (<RequestsTable teacherId={loggedInUser.role == 'TEACHER'? loggedInUser.id : null}setErrorMessage={props.setErrorMessage} />);
    }
    return (
        <NotFound></NotFound>
    )
}

function RequestsTable(props){

}

function RequestStudent(props){
    const [request, setRequest] = useState({});
    //Tries to get an active request for the student, if any
    useEffect(() => {
        const fetchActiveRequest= async () => {
          try{
            const requestFetched = await API.getStudentActiveRequest(props.studentId);
            console.log("request",requestFetched);
            setRequest(requestFetched);
          }catch(err){
            props.setErrorMessage(`${err}`);
          }
        }
        fetchActiveRequest()
      }, []);

    return(
        <>
        {request?
            <RequestInfo request={request}/>
            :
            <RequestForm/>
        }
        </>
    )
}

function RequestInfo(props){
    const request = props.request;
    return(
        <Container>
            <Row className='proposal-show-field text-center' style={{padding:'2px'}}>
				<h1>{request.title}</h1>
			</Row>
            <Container className='proposal-container'>
				<Row>
					<Col className='proposal-show-field' style={{height:'fit-content'}}>
						<p><strong>Supervisor:</strong> {request.supervisorName} {request.supervisorSurname}</p>
						<p><strong>Co-supervisor:</strong> {request.coSupervisor ? request.coSupervisorNames:<i> None</i>}</p>
						<p><strong>Student:</strong> {request.studentName} {request.studentSurname}</p>
					</Col>
				</Row>
				<Row>
					<p className='proposal-field-title'><strong>Description:</strong></p>
					<Row className='proposal-show-field' style={{marginTop:'0px'}}>
					<p> {request.description}</p>
					</Row>
				</Row>
                {proposal.applicationId?
                    <Row>
                        <p className='proposal-field-title'><strong>Application:</strong></p>
                        <Row className='proposal-show-field' style={{marginTop:'0px'}}>
                        </Row>
                    </Row>:null
                }
			</Container>
        </Container>
    )
}

function RequestForm(props){
    return(
        <>
        <Button>CREATE NEW REQUEST</Button>
        </>
    )
}