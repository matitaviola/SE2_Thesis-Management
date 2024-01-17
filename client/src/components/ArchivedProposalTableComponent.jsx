import React, { useContext, useState, useEffect } from "react";
import API from "../API";
import { Container, Row, Col, Table, Form, Button, Card, Dropdown } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../App.jsx";


export default function ArchivedProposalsTableComponent({proposals, filter, setFilter}) {
  
	return(
      <div className="proposal-table">

            <Row className="mb-4 mt-4" >              
              <Col><SearchBarComponent filter={filter} setFilter={setFilter}></SearchBarComponent></Col>  
              <Col></Col>

            </Row>

			<Table striped border={1} responsive hover>
                <thead>
                    <tr className="proposal-thead">
                        <th>Title</th>
                        <th>Co-supervisor</th>
                        <th>Keywords</th>
						<th>Requested Knowledge</th>
						<th>Expiration date</th>
						<th>Level</th>
						<th>CdS</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((p) => (
            <ProposalRow key={p.id} proposal={p} />
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function ProposalRow(props) {
  //const loggedInUser = useContext(AuthContext);

  const navigate = useNavigate();

  const fixOrder = (s) => {
    let vec = s.split(', ').sort();
    let ret = '';
    vec.forEach(a => ret = ret+', '+ a);
    ret = ret.slice(2);
    return ret;
  }

  const handleViewClick = () => {
    const proposal = props.proposal;
    navigate(`/proposals/${props.proposal.id}`, { state: { proposal, archived: true } });
  };

    return (
        <tr>
            <td>{props.proposal.title}</td>
            <td>
                {props.proposal.coSupervisor
                    ? fixOrder(props.proposal.coSupervisorNames)
                    : "Not assigned"}
            </td>
            <td>{props.proposal.keywords}</td>
			<td>{props.proposal.reqKnowledge}</td>
			<td>{props.proposal.expiration.slice(0, 10)}</td>
			<td>{props.proposal.level}</td>
			<td>{props.proposal.cdsId}</td>
			<td>
				<Button variant="secondary" onClick={handleViewClick}>
					View
				</Button>
            </td>
        </tr>
    );
}

function SearchBarComponent({ filter, setFilter }){
  const handleInputChange = (event) => {
    setFilter(event.target.value);
  };

  return (
    <Container>
      <Row className="mt-1">
        <Col className="col-md-4 align-self-center"><b>Filter:</b></Col>
        <Col className='col-5'>
            <Form.Control
              type="text"
              placeholder="Insert search term"
              value={filter}
              onChange={handleInputChange}
            />
        </Col>
      </Row>
    </Container>
  );
};
  
