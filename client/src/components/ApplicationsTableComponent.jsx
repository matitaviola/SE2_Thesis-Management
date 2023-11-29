import { useState, useEffect, useContext } from 'react';
import { Container, Button, Table, Card } from 'react-bootstrap';
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
                        <Table className='grades-table' striped hover responsive>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Student Anagraphic</th>
                                <th>StudentID</th>
                                <th></th>
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
                                                <td>{application.studentId}</td>
                                                <td>
                                                    <Button variant="primary" className='evaluate-button'>
                                                    <Link to={`/application/${application.proposal_id}/${application.studentId}`}
                                                        state={{ application }}
                                                        style={{ textDecoration: 'none', color: 'inherit' }}>
                                                            Evaluate
                                                    </Link>
                                                    </Button>
                                                </td>
                                            </tr>)
                                    }
                                })}
                            </tbody>
                        </Table>
                    </Card>
                    :
                    <Card className='grades-table-card my-4'>
                        <Table className='grades-table' responsive>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    {/*<th>StudentID</th>*/}
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((application, index) => {
                                    let className;
                                    switch (application.status) {
                                        case 'Rejected':
                                            className = 'table-row-danger';
                                            break;
                                        case 'Accepted':
                                            className = 'table-row-success';
                                            break;
                                        case 'Cancelled':
                                            className = 'table-row-default';
                                            break;
                                        default:
                                            className = 'table-row-warning';
                                    }
                                    return (
                                        <tr key={index} className={className}>
                                            <td><Link to={`/applications/${application.proposal_id}`}
                                                state={{ application: application }}
                                                style={{ textDecoration: 'none' }} >{application.proposal}
                                            </Link></td>
                                            {/*<td>{application.studentId}</td>*/}
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