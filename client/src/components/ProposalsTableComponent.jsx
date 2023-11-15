import React, { useContext, useState, useEffect } from "react";
import API from "../API";
import { Container, Row, Col, Table, Form, Button } from "react-bootstrap";
import { useNavigate, Link  } from 'react-router-dom';
import { AuthContext } from "../App.jsx";
import NotFound from "./NotFoundComponent.jsx";
import { useLocation } from 'react-router-dom';



export default function ProposalsTableComponent() {



  const loggedInUser = useContext(AuthContext);

  if (loggedInUser && loggedInUser.role == 'STUDENT') {
    return (<StudentProposalsTableComponent studentId={loggedInUser.id}/>);
  }
  if (loggedInUser && loggedInUser.role == 'TEACHER') {
    return (<TeacherProposalsTableComponent/>);
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
						<th>Thesist</th>
            <th></th>
                    </tr>
                </thead>
                <tbody>
                    {proposals.map((p) => (
                        <ProposalRow key={p.title} proposal={p} />
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



function StudentProposalsTableComponent(props) {

  const [proposals, setProposals] = useState([]);
  const [filter, setFilter] = useState({});
  const [studentId, setStudentId] = useState(props.studentId);
	const navigate = useNavigate();


  useEffect(() => {
    const fetchProposals = async () => {
      let proposalsResponse = await API.getStudentProposals(studentId, filter);
      setProposals(proposalsResponse);
    }
    fetchProposals()
  }, [filter, studentId]);

  const handleViewClick = (title) =>{
    let proposal = proposals.find(p => p.title == title);
		navigate(`/proposals/${title}`, { state: { proposal } });
  }

  return (
    <Container>
      <Row className="mb-5 mt-2"><h1>Thesis Proposal</h1></Row>

      <Row className="mb-2">
        <Col></Col>
        <Col></Col>
        <Col><SearchBarComponent filter={filter} setFilter={setFilter}></SearchBarComponent></Col>
      </Row>

      <Row>
        <Table bordered hover >
          <thead>
            <tr>
              <th>Title <SearchButton filter={filter} setFilter={setFilter} keyword='title'/></th>
              <th>Supervisor <SearchButton filter={filter} setFilter={setFilter} keyword='supervisor'/></th>
              <th>Co-Supervisor <SearchButton filter={filter} setFilter={setFilter} keyword='coSupervisor'/></th>
              <th>Keywords <SearchButton filter={filter} setFilter={setFilter} keyword='keywords'/></th>
              <th>Type <SearchButton filter={filter} setFilter={setFilter} keyword='type'/></th>
              <th>Groups <SearchButton filter={filter} setFilter={setFilter} keyword='groups'/></th>
              <th>Required Knowledge <SearchButton filter={filter} setFilter={setFilter} keyword='reqKnowledge'/></th>
              <th>Expiration Date <SearchButton filter={filter} setFilter={setFilter} keyword='expiration'/></th>
              <th>Level <SearchButton filter={filter} setFilter={setFilter} keyword='level'/></th>
              <th>Degree <SearchButton filter={filter} setFilter={setFilter} keyword='degree'/></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {proposals.map(p => {
              {
                return <tr key={p.title}>
                  <td>{p.title} </td>
                  <td>{p.supervisorName} {p.supervisorSurname}</td>
                  <td>{p.coSupervisor}</td>
                  <td>{p.keywords}</td>
                  <td>{p.type}</td>
                  <td>{p.groups}</td>
                  <td>{p.reqKnowledge}</td>
                  <td>{p.expiration.slice(0,10)}</td>
                  <td>{p.level}</td>
                  <td>{p.cdsName}</td>
                  <td><Button onClick={() => handleViewClick(p.title)}>View</Button></td>
                </tr>
              }
            })}
          </tbody>
        </Table>
      </Row>

    </Container>
  )
}

function SearchBarComponent(props) {
  return (
    Object.keys(props.filter).filter(k => props.filter[k]!=undefined).map(k => {
      {
        return <Container>
          <Row className="mt-1">
            <Col><Button type="button" class="btn btn-danger" onClick={()=>{
              let filter = {...props.filter};
              filter[k]=undefined;
              props.setFilter(filter)
            }}>Clear</Button></Col>
            <Col>{k}</Col>
            <Col>
              <Form.Control type="text" placeholder="Insert search term" value={props.filter[k]} onChange={(event) => {
                let filter = {...props.filter};
                filter[k]=event.target.value;
                props.setFilter(filter)}
                } />
            </Col>
          </Row>
        </Container>
      }
    })

  );
}

function SearchButton(props){

  const onClick = () =>{
    let filter = {...props.filter};
    if(filter[props.keyword]!==undefined){
      return;
    }
    console.log(props)
    filter[props.keyword]='';
    props.setFilter(filter);
  }

  return(
    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" onClick={onClick}><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" /></svg>
  )
}
