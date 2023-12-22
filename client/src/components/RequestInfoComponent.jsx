import {useLocation, useNavigate} from 'react-router-dom';
import { Container, Row, Col, Button, Form} from 'react-bootstrap';
import { useContext, useState} from "react";
import { AiOutlineFileText} from "react-icons/ai";
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
    const handleReject = async () => {
       Swal.fire({
            title: 'Reject Request?',
            text: 'This operation will irrevrsibly reject the request',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'NO',
            confirmButtonText: 'Yes, REJECT!',
            cancelButtonColor: "red",
            confirmButtonColor: "#449d44",
            reverseButtons: false,
        }).then(async (result) => {
                if (result.isConfirmed) { 
                try {
                    request.status = 'Rejected';
                    await API.updateRequest(request);
                    navigate('/requests');
                    Swal.fire('Request Rejected!', 'The request will NOT pass to the next phase', 'success');
                } catch (err) {
                    props.setErrorMessage(`${err}`);
                }
        }
        });
    }
    const handleRequestChange = async () => {
        if(request.requiredChanges?.length > 0)
            Swal.fire({
                title: 'Request changes?',
                text: 'This will inform the student on the required changes to perform',
                icon: 'warning',
                showCancelButton: true,
                cancelButtonText: 'NO',
                confirmButtonText: 'Yes, request!',
                cancelButtonColor: "red",
                confirmButtonColor: "#449d44",
                reverseButtons: false,
            }).then(async (result) => {
                    if (result.isConfirmed) { 
                    try {
                        await API.updateRequest(request);
                        navigate('/requests');
                        Swal.fire('Changes requestes!', "Now it is the student's turn", 'success');
                    } catch (err) {
                        props.setErrorMessage(`${err}`);
                    }
            }
        });
        else{
            console.log("Must fill field")
        }
    }
    const handleUpdateChanges = (newChanges) => {
        // Update the request.requiredChanges in the parent component
       request.requiredChanges = newChanges;
       console.log(request);
    };

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
					<p> {request.status == "Approved"?
                        <strong>{status}</strong>
                        :
                        status
                    }</p>
					</Row>
				</Row>
			</Container>
            {loggedInUser.role == "TEACHER"?
                <Row>
                    <Col xs={12} className="text-center">
                        <EditableTextArea
                        initialText={request.requiredChanges || ''}
                        onUpdateText={handleUpdateChanges}
                        handleRequestChange={handleRequestChange}
                        />
                    </Col>
                </Row>
                :
                null
            }
            {loggedInUser.role == "STUDENT"?
                (request.requiredChanges && request.status!="Approved")?
                    <Row>
                        <p className='proposal-field-title' style={{color:'white', backgroundColor:'red'}}><strong>Required Changes:</strong></p>
                        <Row className='proposal-show-field' style={{marginTop:'0px', borderColor:'red'}}>
                        <p> {request.requiredChanges}</p>
                        </Row>
                        {/*
                        <Row className="float-right" style={{ marginTop: '-1.5rem', marginBottom: '0px', color: "white", fontSize: 'large' }}>
                            <Col xs={9}/>
                            <Col xs={3} style={{marginRight:'0px'}}>
                            <Button className="float-right" style={{ border:'none', backgroundColor:'red',width:'100%', marginBottom: '0px', color: "white", fontSize: 'large' }}>
                            <strong>EFFECT CHANGES</strong>
                            </Button>
                            </Col>
                        </Row>
                        */}
                    </Row>
                    : null
                :
                <Row className="justify-content-center">
                    <Col xs={6} className="text-center">
                        <Button variant="success" type="submit" className="mt-3" style={{ color: "white", fontSize: 'large', width: '100%' }} onClick={() => handleAccept()}>
                            ACCEPT
                        </Button>
                    </Col>
                    <Col xs={6} className="text-center">
                        <Button variant="danger" type="submit" className="mt-3" style={{ color: "white", fontSize: 'large', width: '100%' }} onClick={() => handleReject()}>
                            REJECT
                        </Button>
                    </Col>
                </Row>
            }
        </Container>
    )
}

const EditableTextArea = (props) => {
    const [text, setText] = useState(props.initialText);
  
    const handleChange = (event) => {
      const newText = event.target.value;
      setText(newText);
      props.onUpdateText(newText);
    };
  
    return (
        <Form.Group controlId="editableTextArea" style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <Form.Label>
                <AiOutlineFileText />
                <strong style={{ marginLeft: '5px' }}>Edit Required Changes:</strong>
            </Form.Label>
            <Form.Control
                as="textarea"
                rows={5}
                value={text}
                onChange={handleChange}
                className="proposal-show-field"
                style={{ marginTop: '0rem', marginBottom: '0px' }}
            />
            <Row className="float-right" style={{ marginTop: '-1rem', marginBottom: '0px', color: "white", fontSize: 'large' }}>
                <Col xs={9}/>
                <Col xs={3}>
                <Button className="float-right" style={{ border:'none', backgroundColor:'#ebaf0e',width:'100%', marginBottom: '0px', color: "white", fontSize: 'large' }} onClick={() => props.handleRequestChange()}>
                <strong>REQUEST CHANGE</strong>
                </Button>
                </Col>
            </Row>
            
        </Form.Group>
    );
  };