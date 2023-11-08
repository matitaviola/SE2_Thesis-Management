import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API from '../API';

export default function ApplicationTable(props) {
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        const getApplications = async () => {
            try {
                const retrievedApplications = await API.getApplications(props.professorId);
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
                <div key={p.title + p.student} className="application-row">
                    <ApplicationRow application={p} />
                </div>
            ))}
        </div>
    );
}

function ApplicationRow(props) {
    return (
        <Container fluid>
            <Row className="d-flex align-items-center">
                <Col className="pt-2 application-info">
                    <p>
                        <span className="title">
                          <Link to={`/application/${props.application.proposal}/${props.application.student}`} style={{marginRight:'5px'}}>
                            {props.application.proposal} 
                          </Link>
                        </span>
                        application by student:{' '}
                        <span className="student">{props.application.student}</span>
                    </p>
                </Col>
            </Row>
        </Container>
    );
}
