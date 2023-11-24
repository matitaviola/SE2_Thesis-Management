import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import API from '../API';
import { Container, Row, Col, Table, Card } from 'react-bootstrap';

function ApplicationDetailComponent(props) {
    const [studentData, setStudentData] = useState(null);
    const { proposalId, studentId } = useParams();
    const navigate = useNavigate();

    const location = useLocation();
	const { application } = location.state;

    useEffect(() => {
        const getStudentData = async () => {
            try {
                const retrievedStudentData = await API.getStudentData(proposalId, studentId);
                setStudentData(retrievedStudentData);
            } catch (err) {
                //should use toast instead
                console.error(err);
            }
        };
        getStudentData();
    }, []);

    const acceptRejectApplication = async (status) => {
        try {
            response = await API.updateApplicationStatus(proposalId, studentId, status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            else {
                // Navigate to the previous page
                navigate('/applications');
            }
        } catch (err) {
            //should use toast instead
            console.error(err);
        }
    };

    if (!studentData) {
        return <div>Loading...</div>;
    }

    return (
        <Container>
        <h2 className='mt-5'>{studentData.name} {studentData.surname}'s application for <i>{application.proposal}</i></h2>
        <Card className='grades-table-card my-4'>
                <Table className='grades-table'striped responsive>
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th className='text-center'>ECTS</th>
                            <th className='text-center'>Grade</th>
                            <th className='text-center'>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentData.career.length === 0 ? <></> :
                            studentData.career.map(careerItem => {
                                {
                                    return (
                                        <tr key={careerItem.code_c}>
                                            <td className='grades-table-td'>{careerItem.title_c}</td>
                                            <td className='grades-table-td text-center'>{careerItem.cfu}</td>
                                            <td className='grades-table-td text-center'>{careerItem.grade}</td>
                                            <td className='grades-table-td text-center'>{careerItem.date}</td>
                                        </tr>)
                                }
                            })
                        }
                    </tbody>
                </Table>
        </Card>
        </Container>

    )

    return (
        <div>
            <p className="lead" style={{ fontSize: '30px' }}>{studentData.name + " " + studentData.surname + " " + studentId}</p>
            <p className="lead" style={{ fontSize: '30px' }}>Career:</p>
            {studentData.career.length > 0 ? studentData.career.map((careerItem, index) => (
                <table key={index} style={{ marginBottom: '30px', fontSize: '20px', width: '25%' }}>
                    <tbody style={{ backgroundColor: '#f0f0f0', borderRadius: '5px', padding: '20px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)' }}>
                        <tr>
                            <td><strong>{careerItem.title_c}</strong> ({careerItem.code_c})</td>
                        </tr>
                        <tr>
                            <td>CFU: {careerItem.cfu} - GRADE: {careerItem.grade}</td>
                        </tr>
                        <tr>
                            <td>DATE: {careerItem.date}</td>
                        </tr>
                    </tbody>
                </table>
            )) : <></>}
            <button onClick={() => acceptRejectApplication(true)} style={{ marginRight: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 20px', fontSize: '15px', cursor: 'pointer', transition: 'transform 0.1s' }}>Accept</button>
            <button onClick={() => acceptRejectApplication(false)} style={{ backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 20px', fontSize: '15px', cursor: 'pointer' }}>Decline</button>
        </div>
    );
}

export default ApplicationDetailComponent;