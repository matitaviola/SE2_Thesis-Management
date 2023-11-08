import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ApplicationDetailComponent() {
    const [studentData, setStudentData] = useState(null);
    const { proposalId, studentId } = useParams();

    useEffect(() => {
        const getStudentData = async () => {
            try {
                const retrievedStudentData = await API.getStudentData(studentId);
                setStudentData(retrievedStudentData);
            } catch (err) {
                console.log("Applications getting an error: " + err);
            }
        };
        getStudentData();
    }, []);

    if (!studentId) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Acceptance Detail</h1>
            {/* Display the proposal details */}
            {/*<p>Proposal ID: {application.id}</p>
            <p>Student ID: {application.studentId}</p>
            <p>Title: {application.title}</p>*/}
            {/* Add more fields as needed */}
        </div>
    );
}

export default ApplicationDetailComponent;