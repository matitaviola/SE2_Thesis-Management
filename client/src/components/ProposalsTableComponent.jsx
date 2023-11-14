import React, { useState, useEffect, useContext } from 'react';
import { Table, Button } from 'react-bootstrap';
import { useNavigate  } from 'react-router-dom';
import { AuthContext } from '../App';
import API from '../API';

export default function ProposalsTableComponent() {
	const [proposals, setProposals] = useState([]);
	const loggedInUser = useContext(AuthContext);

	useEffect(() => {
		const getProposals = async () => {
			try {
				const retrievedProposals = await API.getProposals(loggedInUser);
				setProposals(retrievedProposals);
			} catch (err) {
				console.log("Proposals getting an error: " + err);
			}
		};
		getProposals();
	}, []);

	return (
		<div className="proposal-table">
			<p className="lead" style={{ fontSize: '30px' }}>Active Proposals Table</p>
			<Table striped bordered hover>
                <thead>
                    <tr className="proposal-thead">
                        <th>Title</th>
                        <th>Co-supervisor</th>
                        <th>Keywords</th>
						<th>Requested Knowledge</th>
						<th>Expiration date</th>
						<th>Level</th>
						<th>CdS</th>
						<th>Thesist</th>
                    </tr>
                </thead>
                <tbody>
                    {proposals.map((p) => (
                        <ProposalRow key={p.title} proposal={p} />
                    ))}
                </tbody>
            </Table>
  		</div>
	);
}

function ProposalRow(props) {
    //const loggedInUser = useContext(AuthContext);

	const navigate = useNavigate();

	const handleViewClick = () => {
		const proposal = props.proposal;
		navigate(`/proposals/${props.proposal.title}`, { state: { proposal } });
    };

    return (
        <tr>
            <td>{props.proposal.title}</td>
            <td>
                {props.proposal.cosupervisor
                    ? props.proposal.cosupervisor
                    : "Not assigned"}
            </td>
            <td>{props.proposal.keywords}</td>
			<td>{props.proposal.knowledge}</td>
			<td>{props.proposal.expiration}</td>
			<td>{props.proposal.level}</td>
			<td>{props.proposal.cds}</td>
			<td>
                {props.proposal.thesist
                    ? props.proposal.thesist
                    : "Not assigned"}
            </td>
			<td>
				<Button variant="info" onClick={handleViewClick}>
					View
				</Button>
            </td>
        </tr>
    );
}