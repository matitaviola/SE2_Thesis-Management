import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import API from '../API';
import '../App.css';
import { FileUploadComponent } from './FileUploadComponent';
import Swal from 'sweetalert2';

export function ProposalComponent() {
	let navigate = useNavigate();
	const routeChange = () => {
		let path = `/proposals`;
		navigate(path);
	}

	const location = useLocation();
	const { proposal } = location.state;

	return (
		<Container>
			<Row><h1 className='text-center mt-4'>{proposal.title}</h1></Row>
			<Row>
				<p className='text-end'><strong>Expiration date:</strong> {proposal.expiration}</p>
			</Row>
			<Row>
				<p><strong>CdS:</strong> {proposal.cds}</p>
				<p><strong>Level:</strong> {proposal.level}</p>
			</Row>
			<Row>
				<p><strong>Type:</strong> {proposal.type}</p>
				<p><strong>Groups:</strong> {proposal.group}</p>
			</Row>
			<Row>
				<p><strong>Thesist:</strong> {proposal.thesist ? proposal.thesist : "Not assigned"}</p>
				<p><strong>Co-supervisor:</strong> {proposal.co_supervisor ? proposal.co_supervisor : "Not assigned"}</p>
			</Row>
			<Row style={{ marginTop: '20px' }}>
				<p><strong>Description:</strong> {proposal.description}</p>
				<p><strong>Requested knowledge:</strong> {proposal.knowledge}</p>
				<p><strong>Notes:</strong> {proposal.notes}</p>
			</Row>
			<Row style={{ marginTop: '20px' }}>
				<p><strong>Keywords:</strong> {proposal.keywords}</p>
			</Row>
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
                        confirmButtonColor: "#007BFF",
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
                        confirmButtonColor: "#007BFF",
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
export function StudentProposalComponent() {

	const navigate = useNavigate();
	const location = useLocation();
	const { proposal, studentId } = location.state;
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
			<Row><h1 className='text-center mt-4'>{proposal.title}</h1></Row>
			<Row>
				<p className='text-end'><strong>Expiration date:</strong> {proposal.expiration.slice(0, 10)}</p>
			</Row>
			<Row>
				<p><strong>CdS:</strong> {proposal.cdsId}</p>
				<p><strong>Level:</strong> {proposal.level}</p>
			</Row>
			<Row>
				<p>{proposal.type}</p>
				<p>{proposal.groups}</p>
			</Row>
			<Row>
				<p><strong>Co-supervisor:</strong> {proposal.co_supervisor ? proposal.co_supervisor : "Not assigned"}</p>
			</Row>
			<Row style={{ marginTop: '20px' }}>
				<p><strong>Description:</strong> {proposal.description}</p>
				<p><strong>Requested knowledge:</strong> {proposal.reqKnowledge}</p>
				<p><strong>Notes:</strong> {proposal.notes}</p>
			</Row>
			<Row style={{ marginTop: '20px' }}>
				<p><strong>Keywords:</strong> {proposal.keywords}</p>
			</Row>
			<Row>
				<Button disabled={proposal.applicationExists} onClick={() => handleShowUpdateModal(proposal)}>Apply</Button>
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
                <Button variant="secondary" onClick={handleCloseUpdateModal}>
                  Close
                </Button>
                <Button variant="primary" onClick={() => handleSendApplication(selectedProposal)}>
                  Send Application
                </Button>
              </Modal.Footer>
            </Modal>
		</Container>
		
	);
}