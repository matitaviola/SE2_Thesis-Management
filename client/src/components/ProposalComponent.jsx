import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Container, Row, Col, Button, Modal, Card } from 'react-bootstrap';
import API from '../API';
import { FileUploadComponent } from './FileUploadComponent';
import Swal from 'sweetalert2';

export function ProposalComponent(props) {
	let navigate = useNavigate();
	const routeChange = () => {
		let path = `/proposals`;
		navigate(path);
	}

	const location = useLocation();
	const { proposal } = location.state;

	return (
		<Container>
			<Row>
			<h1 className='text-center mt-4'>{proposal.title}</h1>
			<h4 className='text-center'><i>expires on: <strong>{proposal.expiration.substring(0, 10)}</strong></i></h4>
			</Row>
			<Container className='proposal-container'>
				<Row>
					<Col className='proposal-show-field'>
						<p><strong>Supervisor:</strong> {proposal.supervisorName} {proposal.supervisorSurname}</p>
						<p><strong>Co-supervisor:</strong>{proposal.coSupervisor ? proposal.coSupervisor:<i> None</i>}</p>
						<p><strong>Thesist:</strong>{proposal.thesist ? proposal.thesist:<i> Not yet assigned</i>}</p>
					</Col>
					<Col className='proposal-show-field'>
					<p><strong>CdS:</strong> {proposal.cds}</p>
					<p><strong>Level:</strong> {proposal.level}</p>
					</Col>
					<Col className='proposal-show-field'>
					<p><strong>Type:</strong> {proposal.type}</p>
					<p><strong>Groups:</strong> {proposal.group}</p>
					</Col>
				</Row>
				<Row>		
					<p style={{marginBottom:'0px'}}><strong>Keywords:</strong></p>
					<Col className='proposal-show-field' style={{marginTop:'2px'}}>
						<p>{proposal.keywords}</p>
  					</Col>
				</Row>
				<Row>
					<p style={{marginBottom:'0px'}}><strong>Description:</strong></p>
					<Col className='proposal-show-field' style={{marginTop:'2px'}}>
					<p> {proposal.description}</p>
				</Col>
				</Row>
				<Row>
					<p style={{marginBottom:'0px'}}><strong>Requested knowledge:</strong></p>
					<Col className='proposal-show-field' style={{marginTop:'2px'}}>
					<p> {proposal.reqKnowledge? proposal.reqKnowledge : <i> None</i>}</p>
					</Col>
				</Row>
				<Row>
				<p style={{marginBottom:'0px'}}><strong>Notes:</strong></p>
				<Col className='proposal-show-field' style={{marginTop:'2px'}}>
					<p> {proposal.notes}</p>
				</Col>
				</Row>
			</Container>

			<button 
                onClick={() => {
                    Swal.fire({
                        title: 'Copy Proposal?',
                        text: 'By copying it, more students will be able to conduct this thesis',
                        icon: 'warning',
                        showCancelButton: true,
                        cancelButtonText: 'No, cancel!',
                        confirmButtonText: 'Yes, copy it!',
                        cancelButtonColor: "red",
                        confirmButtonColor: "#449d44",
                        reverseButtons: false,
                    }).then((result) => {
                        if (result.isConfirmed) {
                            API.createProposal(proposal);
							routeChange();
                            Swal.fire('Copy completed!', 'The proposal has been successfully duplicated.', 'success');
                        }
                    });
                }}
                className="copy-button"
            >
                Copy
            </button>
			<button
                onClick={() => {
                    Swal.fire({
                        title: 'Are you sure?',
                        text: 'Once deleted, you will not be able to recover this proposal!',
                        icon: 'warning',
                        showCancelButton: true,
                        cancelButtonText: 'No, cancel!',
                        confirmButtonText: 'Yes, delete it!',
                        cancelButtonColor: "red",
                        confirmButtonColor: "#449d44",
                        reverseButtons: false,
                        /*imageUrl: "https://upload.wikimedia.org/wikipedia/it/2/27/Politecnico_di_Torino_-_Logo.svg",
                        imageWidth: 400,
                        imageHeight: 300,
                        imageAlt: "Custom image"*/
                    }).then((result) => {
                        if (result.isConfirmed) {
                            API.deleteProposal(proposal.id);
							routeChange();
                            Swal.fire('Deleted!', 'The proposal has been deleted.', 'success');
                        }
                    });
                }}
                className="decline-button"
            >
                Delete
            </button>
            <button
                onClick={() => {
                    Swal.fire({
                        title: 'Are you sure?',
                        text: 'Once archived, you will be able to see this proposal in the archive!',
                        icon: 'warning',
                        showCancelButton: true,
                        cancelButtonText: 'No, cancel!',
                        confirmButtonText: 'Yes, archive it!',
                        cancelButtonColor: "red",
                        confirmButtonColor: "#449d44",
                        reverseButtons: false,
                        /*imageUrl: "https://upload.wikimedia.org/wikipedia/it/2/27/Politecnico_di_Torino_-_Logo.svg",
                        imageWidth: 400,
                        imageHeight: 300,
                        imageAlt: "Custom image"*/
                    }).then((result) => {
                        if (result.isConfirmed) {
                            API.archiveProposal(proposal.id);
							routeChange();
                            Swal.fire('Archived!', 'The proposal has been archived.', 'success');
                        }
                    });
                }}
                className="archive-button"
            >
                Archive
            </button>

	  </Container>
	);
}
export function StudentProposalComponent(props) {

	const navigate = useNavigate();
	const location = useLocation();
	const { proposal, studentId, comingFromApp } = location.state;
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [selectedProposal, setSelectedProposal] = useState({ title: "", id: -1 });
	const [file, setFile] = useState(null);


	const handleShowUpdateModal = (proposal) => {
		setSelectedProposal(proposal);
		setShowUpdateModal(true);
	};

	const handleCloseUpdateModal = () => setShowUpdateModal(false);

	const handleSendApplication = (proposal) => {
		const isValidFileType = (file) => {
			const allowedFileTypes = ['application/pdf'];
			return allowedFileTypes.includes(file.type);
		};

		const isValidFileSize = (file) => {
			const maxSizeInBytes = 5 * 1024 * 1024;
			return file.size <= maxSizeInBytes;
		};

		if (file && !isValidFileSize(file)) {
			alert("Max 10MB files accepted");
			return;
		}

		if (file && !isValidFileType(file)) {
			alert("Only PDF file are accepted");
			return;
		}
		try{
			API.addApplication(file, proposal.id, studentId);
			setShowUpdateModal(false);
			navigate('/proposals');
		}catch(err){
			props.setErrorMessage(`${err}`);
		}
	};

	return (
		<Container>
			<Row>
			<h1 className='text-center mt-4'>{proposal.title}</h1>
			<h4 className='text-center'><i>expires on: <strong>{proposal.expiration.substring(0, 10)}</strong></i></h4>
			</Row>
			<Container className='proposal-container'>
				<Row>
					<Col className='proposal-show-field'>
						<p><strong>Supervisor:</strong> {proposal.supervisorName} {proposal.supervisorSurname}</p>
						<p><strong>Co-supervisor:</strong>{proposal.coSupervisor ? proposal.coSupervisor:<i> None</i>}</p>
					</Col>
					<Col className='proposal-show-field'>
					<p><strong>CdS:</strong> {proposal.cdsId} -  {proposal.cdsName}</p>
					<p><strong>Level:</strong> {proposal.level}</p>
					</Col>
					<Col className='proposal-show-field'>
					<p><strong>Type:</strong> {proposal.type}</p>
					<p><strong>Groups:</strong> {proposal.groups}</p>
					</Col>
				</Row>
				<Row>		
					<p style={{marginBottom:'0px'}}><strong>Keywords:</strong></p>
					<Col className='proposal-show-field' style={{marginTop:'2px'}}>
						<p>{proposal.keywords}</p>
  					</Col>
				</Row>
				<Row>
					<p style={{marginBottom:'0px'}}><strong>Description:</strong></p>
					<Col className='proposal-show-field' style={{marginTop:'2px'}}>
					<p> {proposal.description}</p>
				</Col>
				</Row>
				<Row>
					<p style={{marginBottom:'0px'}}><strong>Requested knowledge:</strong></p>
					<Col className='proposal-show-field' style={{marginTop:'2px'}}>
					<p> {proposal.reqKnowledge? proposal.reqKnowledge : <i> None</i>}</p>
					</Col>
				</Row>
				<Row>
				<p style={{marginBottom:'0px'}}><strong>Notes:</strong></p>
				<Col className='proposal-show-field' style={{marginTop:'2px'}}>
					<p> {proposal.notes}</p>
				</Col>
				</Row>
			</Container>
			<Row className='my-3'>
				<Button variant="secondary" disabled={proposal.applicationExists || comingFromApp} onClick={() => handleShowUpdateModal(proposal)}>Apply</Button>
			</Row>
			<Modal show={showUpdateModal} onHide={handleCloseUpdateModal}>
              <Modal.Header closeButton>
                <Modal.Title>{selectedProposal.title}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
				<span>Upload CV</span>
				<br />
				<br />
                <FileUploadComponent setFile={setFile}></FileUploadComponent>
				<br />
                <span>Are you sure to apply for {selectedProposal.title}?</span>
                </Modal.Body>
              <Modal.Footer>
                {<Button variant="success" style={{ color: 'white'}} onClick={() => handleSendApplication(selectedProposal)}>
                  Send Application
                </Button>}
				<Button variant="danger" onClick={handleCloseUpdateModal}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
		</Container>
		
	);
}