import { useLocation } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

export default function ProposalComponent() {

	const location = useLocation();
	const { proposal } = location.state;

	return (
		<Container>
			<Row><h1 className='text-center mt-4'>{proposal.title}</h1></Row>
			<Row>
				<Col><p className='text-end'><strong>Expiration date:</strong> {proposal.expiration}</p></Col>
			</Row>
			<Row>
				<Col>
					<p><strong>CdS:</strong> {proposal.cds}</p>
				</Col>
				<Col>
					<p><strong>Level:</strong> {proposal.level}</p>
				</Col>
			</Row>
			<Row>
				<Col>
					<p>{proposal.type}</p>
				</Col>
				<Col>
					<p>{proposal.group}</p>
				</Col>
			</Row>
			<Row>
				<Col>
					<p><strong>Thesist:</strong> {proposal.thesist ? proposal.thesist : "Not assigned"}</p>
				</Col>
				<Col>
					<p><strong>Co-supervisor:</strong> {proposal.co_supervisor ? proposal.co_supervisor : "Not assigned"}</p>
				</Col>
			</Row>
			<Row style={{ marginTop: '20px' }}>
				<p><strong>Description:</strong> {proposal.description}</p>
				<p><strong>Requested knowledge:</strong> {proposal.knowledge}</p>
				<p><strong>Notes:</strong> {proposal.notes}</p>
			</Row>
			<Row style={{ marginTop: '20px' }}>
				<p><strong>Keywords:</strong> {proposal.keywords}</p>
			</Row>
	  </Container>
	);
}