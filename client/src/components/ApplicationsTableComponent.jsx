import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Table, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import API from '../API';

export default function ApplicationTable(props) {
    const [applications, setApplications] = useState([]);
    const [studentData, setStudentData] = useState(null);
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

    //Added for student data
    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const response = await API.getStudents();
                setStudentData(response);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStudentData();
    }, []);

    return (
        <Container fluid>
            {
                loggedInUser.role === 'TEACHER' ?
                    <Card className='grades-table-card my-4'>
                        <Table className='grades-table' striped responsive>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Student Anagraphic</th>
                                    <th>StudentID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((application, index) => {
                                    let student;
                                    if (studentData) {
                                        student = studentData.find(s => s.studentId === application.studentId);
                                    }
                                    {
                                        return (
                                            <tr key={index}>
                                                <td>{application.proposal}</td>
                                                <td>{student ? student.name + ' ' + student.surname : 'N/A'}</td>
                                                <td><Link to={`/application/${application.proposal_id}/${application.studentId}`}
                                                    state={{ application }}
                                                    style={{ textDecoration: 'none' }}>
                                                    {application.studentId}
                                                </Link></td>
                                            </tr>)
                                    }
                                })}
                            </tbody>
                        </Table>
                    </Card>
                    :
                    <Card className='grades-table-card my-4'>
                        <Table className='grades-table' striped responsive>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Student ID</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((application, index) => {
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
                                        <tr key={index} className={className}>
                                            <td><Link to={`/applications/${application.proposal_id}`}
                                                state={{ application: application }}
                                                style={{ textDecoration: 'none' }} >{application.proposal}
                                            </Link></td>
                                            <td>{application.studentId}</td>
                                            <td>{application.status}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </Table>
                    </Card>
            }
        </Container>
    );
}