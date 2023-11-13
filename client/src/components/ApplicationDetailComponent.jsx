import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../API';

function ApplicationDetailComponent() {
    const [studentData, setStudentData] = useState(null);
    const { proposalId, studentId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const getStudentData = async () => {
            try {
                const retrievedStudentData = await API.getStudentData(proposalId,studentId);
                setStudentData(retrievedStudentData);
            } catch (err) {
                console.log("Applications getting an error: " + err);
            }
        };
        getStudentData();
    }, []);

    const acceptRejectApplication = async (status) => {
        const response = await API.updateApplicationStatus(proposalId, studentId, status);
    
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        else{
            // Navigate to the previous page
            navigate('/applications');
        }
    };

    if (!studentData) {
        return <div>Loading...</div>;
    }
    /*else {
        console.log(studentData);
    }*/

    return (
        <div>
        <p className="lead" style={{ fontSize: '30px' }}>{studentData.name + " " + studentData.surname + " " + studentId}</p>
        <p className="lead" style={{ fontSize: '30px' }}>Career:</p>
            {studentData.career.map((careerItem, index) => (
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
            ))}
            <button onClick={() => acceptRejectApplication(true)} style={{ marginRight: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 20px', fontSize: '15px', cursor: 'pointer', transition: 'transform 0.1s' }}>Accept</button>
            <button onClick={() => acceptRejectApplication(false)} style={{ backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 20px', fontSize: '15px', cursor: 'pointer' }}>Decline</button>
        </div>
    );
}

export default ApplicationDetailComponent;