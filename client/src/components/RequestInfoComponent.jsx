import {useLocation, useNavigate} from 'react-router-dom';
import { Container, Row, Col, Button} from 'react-bootstrap';
import { useContext} from "react";
import { AuthContext } from "../App.jsx";
import Swal from 'sweetalert2';
import API from "../API";

export default function RequestInfo(props){
    const loggedInUser = useContext(AuthContext);
    const { state } = useLocation();
    const navigate = useNavigate();
    const request = props.request || state.request || {};
    let status = request.status;
    if(status == "Created") status = "Awaiting acceptance from secretary";
    else if(status == "SEC_Approved") status = "Awaiting acceptance from supervisor";
    else if(status == "Approved") status = "Thesis started on "+request.approvalDate;
    console.log(request)

    const handleAccept = async () => {
        const swalText =  loggedInUser.role == "CLERK"? 'pass the request to the appointed Supervisor' : 'allow the student to stark working on it'
        Swal.fire({
            title: 'Approve Request?',
            text: 'This operation will '+swalText,
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'NO',
            confirmButtonText: 'Yes, Approve!',
            cancelButtonColor: "red",
            confirmButtonColor: "#449d44",
            reverseButtons: false,
        }).then(async (result) => {
                if (result.isConfirmed) { 
                try {
                    request.status = loggedInUser.role == "CLERK"? 'SEC_Approved' : 'Approved';
                    await API.updateRequest(request);
                    navigate('/requests');
                    Swal.fire('Acceptance completed!', 'The request passed to the next phase.', 'success');
                } catch (err) {
                    props.setErrorMessage(`${err}`);
                }
        }
        });
    }

    return(
        <Container>
            <Row className='proposal-show-field text-center' style={{padding:'2px'}}>
				<h1>{request.title}</h1>
			</Row>
            <Container className='proposal-container'>
				<Row>
					<Col className='proposal-show-field' style={{height:'fit-content'}}>
						<p><strong>Supervisor:</strong> {request.supervisorName} {request.supervisorSurname}</p>
						<p><strong>Co-supervisor:</strong> {request.coSupervisorId ? request.coSupervisorNames:<i> None</i>}</p>
						<p><strong>Student:</strong> {request.studentName} {request.studentSurname}</p>
					</Col>
				</Row>
				<Row>
					<p className='proposal-field-title'><strong>Description:</strong></p>
					<Row className='proposal-show-field' style={{marginTop:'0px'}}>
					<p> {request.description}</p>
					</Row>
				</Row>
                {request.applicationId?
                    <Row>
                        <p className='proposal-field-title'><strong>Application Id:</strong></p>
                        <Row className='proposal-show-field' style={{marginTop:'0px'}}>
                        <p>{request.applicationId}</p>
                        </Row>
                    </Row>:null
                }
                <Row>
					<p className='proposal-field-title'><strong>Status:</strong></p>
					<Row className='proposal-show-field' style={{marginTop:'0px'}}>
					<p> {status}</p>
					</Row>
				</Row>
			</Container>
            {loggedInUser.role == "STUDENT"?
                null
                :
                <Row>
                    <Col>
                        <Button variant="success" type="submit" className="mt-3" style={{color:"white", marginRight:"10px"}} onClick={()=>handleAccept()}>
                            ACCEPT
                        </Button>
                    </Col>
                </Row>
            }
        </Container>
    )
}