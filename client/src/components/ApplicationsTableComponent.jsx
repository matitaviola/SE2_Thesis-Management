import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import API from '../API';

export default function ApplicationTable() {
    const [applications, setApplications] = useState([]);
    const loggedInUser = useContext(AuthContext);

    useEffect(() => {
        const getApplications = async () => {
            try {
                const retrievedApplications = await API.getApplications(loggedInUser.id);
                setApplications(retrievedApplications);
            } catch (err) {
                console.log("Applications getting an error: " + err);
            }
        };
        getApplications();
    }, []);

    return (
        <div className="application-table">
            <p className="lead" style={{ fontSize: '30px' }}>Applications Table</p>
            {applications.map((p) => (
                <div key={p.title + p.studentId} className="application-row">
                    <ApplicationRow application={p} />
                </div>
            ))}
        </div>
    );
}

function ApplicationRow(props) {
    return (
        <Container fluid>
            <Link to={`/application/${props.application.proposal}/${props.application.studentId}`} style={{ textDecoration: 'none' }}>
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
        </Container>
    );
}
