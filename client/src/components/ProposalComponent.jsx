import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import API from '../API';
import '../App.css';

export function ProposalComponent() {
	let navigate = useNavigate();
	const routeChange = () =>{ 
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
				<p>{proposal.type}</p>
				<p>{proposal.group}</p>
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
			<Row className='text-center mt-4'>
				<Button  className="btn btn-danger" onClick={() => {
					API.deleteProposal(proposal.title);
					routeChange();
				}}>
				DELETE PROPOSAL
				</Button>
			</Row>

	  </Container>
	);
}
export function StudentProposalComponent() {

	const location = useLocation();
	const { proposal } = location.state;

	return (
		<Container>
			<Row><h1 className='text-center mt-4'>{proposal.title}</h1></Row>
			<Row>
				<p className='text-end'><strong>Expiration date:</strong> {proposal.expiration.slice(0,10)}</p>
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
			<Row className="justify-content-end">
            <Col xs="auto" >
                <Button className="apply-button">Apply</Button>
            </Col>
        </Row>
	  </Container>
	);
}