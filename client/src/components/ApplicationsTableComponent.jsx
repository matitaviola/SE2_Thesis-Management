import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import API from '../API';

export default function ApplicationTable(props) {
    const [applications, setApplications] = useState([]);
    const loggedInUser = useContext(AuthContext);

    useEffect(() => {
        const getApplications = async () => {
            try {
                const retrievedApplications = await API.getApplications(loggedInUser);
                setApplications(retrievedApplications);
            } catch (err) {
                //should use toast instead
                console.error(err);
            }
        };
        getApplications();
    }, []);

    return (
        <div className="application-table">
            <p className="lead" style={{ fontSize: '30px' }}>Applications Table</p>
            {applications.map((p) => (
                <div key={p.proposal + p.studentId} className="application-row">
                    <ApplicationRow application={p} />
                </div>
            ))}
        </div>
    );
}

function ApplicationRow(props) {
    const loggedInUser = useContext(AuthContext);
    return (
        <Container fluid>
        {
            loggedInUser.role == 'TEACHER'?

            <Link to={`/application/${props.application.proposal_id}/${props.application.studentId}`} style={{ textDecoration: 'none' }}>
            <Row className="d-flex align-items-center">
                <Col className="pt-2 application-info">
                    <p>
                        <span className="title">
                            "{props.application.proposal}"  
                        </span>
                        application by student 
                        <span className="student"> {props.application.studentId}</span>
                    </p>
                </Col>
            </Row>
            </Link>
            :
            <Link to={`/applications/${props.application.proposal_id}`} style={{ textDecoration: 'none' }}>
            <Row className="d-flex align-items-center">
                <Col className="pt-2 application-info">
                    <p>
                        <span className="title">
                            "{props.application.proposal}" 
                        </span>
                    </p>
                </Col>
                <Col className="pt-2 application-info">
                <span className="student" style={{ color: 
                    props.application.status === 'Rejected' ? 'red' :
                    props.application.status === 'Accepted' ? 'green' :
                    props.application.status === 'Cancelled'? 'black' : 'orange'
                }}>
                        Status: {props.application.status}
                </span>
                </Col>
            </Row>
            </Link>
        }
        </Container>
    );
}
