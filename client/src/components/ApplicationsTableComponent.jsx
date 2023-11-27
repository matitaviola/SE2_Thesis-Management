import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Table, Card } from 'react-bootstrap';
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

    /*return (
        <div className="application-table">
            <p className="lead" style={{ fontSize: '30px' }}>Applications Table</p>
            {applications.map((p) => (
                <div key={p.proposal + p.studentId} className="application-row">
                    <ApplicationRow application={p} />
                </div>
            ))}
        </div>
    );*/

    return (
        <Container fluid>
            {
                loggedInUser.role === 'TEACHER' ?
                    <Card className='grades-table-card my-4'>
                        <Table className='grades-table' striped responsive>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>StudentID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map(application => {
                                    {
                                        return (
                                            <tr key={application.id}>
                                                <td>{application.proposal}</td>
                                                <td><Link to={`/application/${application.proposal_id}/${application.studentId}`}
                                                    state={{ application }}
                                                    style={{ textDecoration: 'none' }}>
                                                    {application.studentId}
                                                </Link></td>
                                            </tr>)
                                    }
                                })
                                }
                            </tbody>
                        </Table>
                    </Card>
                    :
                    //<Link to={`/application/${application.proposal_id}/${application.studentId}`} state={{ application }} style={{ textDecoration: 'none' }}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Student ID</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map(application => {
                                let className;
                                switch (application.status) {
                                    case 'Rejected':
                                        className = 'table-danger';
                                        break;
                                    case 'Accepted':
                                        className = 'table-success';
                                        break;
                                    case 'Cancelled':
                                        className = 'table-default';
                                        break;
                                    default:
                                        className = 'table-warning';
                                }
                                return (
                                    <tr key={application.id} className={className}>
                                        <td><Link to={`/applications/${application.proposal_id}`} 
                                        state={{application:application}} 
                                        style={{ textDecoration: 'none' }} >{application.proposal}
                                        </Link></td>
                                        <td>{application.studentId}</td>
                                        <td>{application.status}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                //</Link>
            }
        </Container>
    );
}

/*function ApplicationRow(props) {
    const loggedInUser = useContext(AuthContext);
    return (
        <Container fluid>
        {
            loggedInUser.role == 'TEACHER'?

            <Link to={`/application/${props.application.proposal_id}/${props.application.studentId}`} state={{application: props.application}} style={{ textDecoration: 'none' }}>
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
            <Link to={`/applications/${props.application.proposal_id}`} state={{application:props.application}} style={{ textDecoration: 'none' }} >
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
}*/
