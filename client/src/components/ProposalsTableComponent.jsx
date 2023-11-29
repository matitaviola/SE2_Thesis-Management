import React, { useContext, useState, useEffect } from "react";
import API from "../API";
import { Container, Row, Col, Table, Form, Button, Card } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../App.jsx";
import NotFound from "./NotFoundComponent.jsx";
import { Link } from 'react-router-dom';

export default function ProposalsTableComponent() {



  const loggedInUser = useContext(AuthContext);

  if (loggedInUser && loggedInUser.role == 'STUDENT') {
    return (<StudentProposalsTableComponent studentId={loggedInUser.id} />);
  }
  if (loggedInUser && loggedInUser.role == 'TEACHER') {
    return (<TeacherProposalsTableComponent />);
  }
  return (
    <NotFound></NotFound>
  )

}

function TeacherProposalsTableComponent() {
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
            <th></th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((p) => (
            <ProposalRow key={p.id} proposal={p} />
          ))}
        </tbody>
      </Table>
      <Link to="/proposals/new">
        <button className="btn btn-primary">Add New Proposal</button>
      </Link>
    </div>
  );
}

function ProposalRow(props) {
  //const loggedInUser = useContext(AuthContext);

  const navigate = useNavigate();

  const handleViewClick = () => {
    const proposal = props.proposal;
    navigate(`/proposals/${props.proposal.id}`, { state: { proposal } });
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
				<Button onClick={handleViewClick}>
					View
				</Button>
            </td>
        </tr>
    );
}



function StudentProposalsTableComponent(props) {

  const [proposals, setProposals] = useState([]);
  const [filter, setFilter] = useState({});
  const [order, setOrder] = useState(null);
  const [studentId, setStudentId] = useState(props.studentId);
  const navigate = useNavigate();
  const loggedInUser = useContext(AuthContext);


  useEffect(() => {
    const fetchProposals = async () => {
      let proposalsResponse = await API.getStudentProposals(studentId, filter, order);
      setProposals(proposalsResponse);

    }
    fetchProposals()
  }, [filter, studentId, order]);

  const handleViewClick = (proposal) => {
    //let proposal = proposals.find(p => p.id == id);
    navigate(`/proposals/${id}`, { state: { proposal, studentId } });
  };

  return (
    <div className="proposal-table">
      <p className="lead" style={{ fontSize: '30px' }}>Thesis Proposals</p>

      <Row className="mb-2 justify-content-end" >
        <SearchBarComponent filter={filter} setFilter={setFilter}></SearchBarComponent>
      </Row>

      <Row>
        <Table striped hover responsive>
          <thead>
            <tr>
              <th className="text-nowrap"><SortButton setOrder={setOrder} order={order} keyword='title'></SortButton>Title <SearchButton filter={filter} setFilter={setFilter} keyword='title' /></th>
              <th className="text-nowrap"><SortButton setOrder={setOrder} order={order} keyword='supervisor'></SortButton>Supervisor <SearchButton filter={filter} setFilter={setFilter} keyword='supervisor' /></th>
              <th className="text-nowrap"><SortButton setOrder={setOrder} order={order} keyword='coSupervisor'></SortButton>Co-Supervisor <SearchButton filter={filter} setFilter={setFilter} keyword='coSupervisor' /></th>
              <th className="text-nowrap"><SortButton setOrder={setOrder} order={order} keyword='keywords'></SortButton>Keywords <SearchButton filter={filter} setFilter={setFilter} keyword='keywords' /></th>
              <th className="text-nowrap"><SortButton setOrder={setOrder} order={order} keyword='type'></SortButton>Type <SearchButton filter={filter} setFilter={setFilter} keyword='type' /></th>
              <th className="text-nowrap"><SortButton setOrder={setOrder} order={order} keyword='groups'></SortButton>Groups <SearchButton filter={filter} setFilter={setFilter} keyword='groups' /></th>
              <th className="text-nowrap"><SortButton setOrder={setOrder} order={order} keyword='reqKnowledge'></SortButton>Required Knowledge <SearchButton filter={filter} setFilter={setFilter} keyword='reqKnowledge' /></th>
              <th className="text-nowrap"><SortButton setOrder={setOrder} order={order} keyword='expiration'></SortButton>Expiration Date <SearchButton filter={filter} setFilter={setFilter} keyword='expiration' /></th>
              <th className="text-nowrap"><SortButton setOrder={setOrder} order={order} keyword='level'></SortButton>Level <SearchButton filter={filter} setFilter={setFilter} keyword='level' /></th>
              <th className="text-nowrap"><SortButton setOrder={setOrder} order={order} keyword='degree'></SortButton>Degree <SearchButton filter={filter} setFilter={setFilter} keyword='degree' /></th>
            </tr>
          </thead>
          <tbody>
            {proposals.map(p => {
              {
                return <tr key={p.id}>
                  <td  grades-table-td><Link to={`/proposals/${p.id}`} state= {{ proposal: p, studentId }} >{p.title} </Link></td>
                  <td  grades-table-td>{p.supervisorName} {p.supervisorSurname}</td>
                  <td  grades-table-td>{p.coSupervisor}</td>
                  <td  grades-table-td>{p.keywords}</td>
                  <td  grades-table-td>{p.type}</td>
                  <td  grades-table-td>{p.groups}</td>
                  <td  grades-table-td>{p.reqKnowledge}</td>
                  <td  grades-table-td>{p.expiration.slice(0, 10)}</td>
                  <td  grades-table-td>{p.level}</td>
                  <td  grades-table-td>{p.cdsName}</td>

                </tr>
              }
            })}
          </tbody>
        </Table>
      </Row>

    </div>
  )
}

function SearchBarComponent(props) {
  return (
    Object.keys(props.filter).filter(k => props.filter[k] != undefined).map(k => {
      {
        return <Container>
          <Row className="mt-1">
            <Col className="col-2 "><b>{k.charAt(0).toUpperCase() + k.slice(1)}</b></Col>
            <Col className='col-3'>
              {
                k === 'expiration' ?
                  <Form.Control type="date" value={props.filter[k]} onChange={(event) => {
                    let filter = { ...props.filter };
                    filter[k] = event.target.value;
                    props.setFilter(filter)
                  }
                  } /> :
                  <Form.Control type="text" placeholder="Insert search term" value={props.filter[k]} onChange={(event) => {
                    let filter = { ...props.filter };
                    filter[k] = event.target.value;
                    props.setFilter(filter)
                  }
                  } />
              }

            </Col>
            <Col>
              <button type="button" class="btn btn-danger" onClick={() => {
                let filter = { ...props.filter };
                filter[k] = undefined;
                props.setFilter(filter)
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"></path>
                </svg>
              </button></Col>
          </Row>
        </Container>
      }
    })

  );
}

function SearchButton(props) {

  const onClick = () => {
    let filter = { ...props.filter };
    if (filter[props.keyword] !== undefined) {
      return;
    }
    console.log(props)
    filter[props.keyword] = '';
    props.setFilter(filter);
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" onClick={onClick}><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" /></svg>
  )
}

function SortButton(props) {

  const {order, setOrder, keyword} = props;
  const onClick = () => {
    if(!order || order.field != keyword){
      setOrder({field : keyword, direction: true});
      return;
    }
    if(order && order.field == keyword && order.direction){
      setOrder({field : keyword, direction: false});
      return;
    }
    setOrder(null);
    return;

  }

  if(!order || order.field != keyword){
    return(
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-up mx-1 ml-0" viewBox="0 0 16 16" onClick={onClick}><path fill-rule="evenodd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5m-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5"/></svg>
    )
  }
  if(order && order.field == keyword && order.direction ){
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sort-down mx-1 ml-0" viewBox="0 0 16 16" onClick={onClick}><path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1z"/></svg>
    )
  }
  return (
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sort-up mx-1 ml-0" viewBox="0 0 16 16" onClick={onClick}><path d="M3.5 12.5a.5.5 0 0 1-1 0V3.707L1.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L3.5 3.707zm3.5-9a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1z"/></svg>
  )
}

