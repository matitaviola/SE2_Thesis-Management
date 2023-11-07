import { React, useState, useEffect} from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API from '../API';

function ApplicationList(props){
    const [applications, setApplications] = useState([]);
    useEffect(()=> {
        const getapplications = async () => {
          try{
              const retrievedApplications = await API.getApplications(3);
              setApplications(retrievedApplications);
          }catch(err){
           console.log("Applications getting an error: "+err);
          }
        }
        getapplications();
    }, []);
    return(
      <>
        {
          /*non logged users can only see published applications */
          applications.map((p) =>
          <div key={p.title+p.student} style={{ padding: '5px' }}>
            <ApplicationRow
              key={p.id} style={{ padding: '5px' }}
              application={p}
            />
          </div>
        )
        }
      </>
    )
}

function ApplicationRow(props){
    return (
        <Container fluid>
          <Row className="d-flex align-items-center">
            <Col className="pt-2">
                {/*<Link to={`/application/${props.application.id}`}>{props.application.proposal}</Link>*/}
                "{props.application.proposal}"  application by student: {`${props.application.student}`}
            </Col>
          </Row>
        </Container>
      );
}

export default ApplicationList;