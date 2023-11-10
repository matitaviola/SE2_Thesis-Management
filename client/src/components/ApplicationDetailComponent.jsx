import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../API';

function ApplicationDetailComponent() {
    const [studentData, setStudentData] = useState(null);
    const { proposalId, studentId } = useParams();

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

    if (!studentData) {
        return <div>Loading...</div>;
    }
    else {
        console.log(studentData);
    }

    return (
        <div>
        <p className="lead" style={{ fontSize: '30px' }}>{studentData.name + " " + studentData.surname + " " + studentId}</p>
        <p className="lead" style={{ fontSize: '30px' }}>Career:</p>
            {studentData.career.map((careerItem, index) => (
                <table key={index} style={{ marginBottom: '30px', fontSize: '20px', width: '25%' }}>
                    <tbody style={{ backgroundColor: '#f0f0f0', borderRadius: '5px', padding: '20px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)' }}>
                        <tr>
                            <td>{careerItem.title_c} ({careerItem.code_c})</td>
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
        </div>
    );
}

export default ApplicationDetailComponent;