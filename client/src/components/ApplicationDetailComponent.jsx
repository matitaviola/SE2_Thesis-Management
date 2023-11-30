import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import API from '../API';
import { AuthContext } from '../App';
import { Container, Row, Col, Table, Card } from 'react-bootstrap';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

function ApplicationDetailComponent(props) {
    const loggedInUser = useContext(AuthContext);
    if (loggedInUser.role=='TEACHER'){
        return(<TeacherApplicationDetail setErrorMessage={props.setErrorMessage}></TeacherApplicationDetail>)
    }
    return(<StudentApplicationDetail studId={loggedInUser.id} setErrorMessage={props.setErrorMessage}></StudentApplicationDetail>)
}
function TeacherApplicationDetail(props){
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
                props.setErrorMessage(`${err}`);
            }
        };
        getStudentData();
    }, []);

    const acceptApplication = () => {
        acceptRejectApplication(true);
        toast.success('Application accepted');
    };

    const declineApplication = () => {
        acceptRejectApplication(false);
        toast.error('Application declined');
    };

    const acceptRejectApplication = async (status) => {
        try{
            const response = await API.updateApplicationStatus(proposalId, studentId, status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            else {
                // Navigate to the previous page
                navigate('/applications');
            }
        } catch (err) {
            props.setErrorMessage(`${err}`);
        }
    };

    if (!studentData) {
        return <div>Loading...</div>;
    }

    return (
        <Container>
            <h2 className='mt-5'>{studentData.name} {studentData.surname} {studentData.studentId}'s application for <i>{application.proposal}</i></h2>
            <Card className='grades-table-card my-4'>
                <Table className='grades-table' striped responsive>
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
            <button
                onClick={() => {
                    Swal.fire({
                        title: 'Are you sure?',
                        text: 'Once declined, you will not be able to recover this application!',
                        icon: 'warning',
                        showCancelButton: true,
                        cancelButtonText: 'No, cancel!',
                        confirmButtonText: 'Yes, decline it!',
                        cancelButtonColor: "red",
                        confirmButtonColor: "#449d44",
                        reverseButtons: false,
                        /*imageUrl: "https://upload.wikimedia.org/wikipedia/it/2/27/Politecnico_di_Torino_-_Logo.svg",
                        imageWidth: 400,
                        imageHeight: 300,
                        imageAlt: "Custom image"*/
                    }).then((result) => {
                        if (result.isConfirmed) {
                            declineApplication();
                            Swal.fire('Declined!', 'The application has been declined.', 'success');
                        }
                    });
                }}
                className="decline-button"
            >
                Decline
            </button>
            <button 
                onClick={() => {
                    Swal.fire({
                        title: 'Are you sure?',
                        text: 'Once accepted, you will not be able to decline this application!',
                        icon: 'warning',
                        showCancelButton: true,
                        cancelButtonText: 'No, cancel!',
                        confirmButtonText: 'Yes, accept it!',
                        cancelButtonColor: "red",
                        confirmButtonColor: "#449d44",
                        reverseButtons: false,
                        /*imageUrl: "https://upload.wikimedia.org/wikipedia/it/2/27/Politecnico_di_Torino_-_Logo.svg",
                        imageWidth: 400,
                        imageHeight: 300,
                        imageAlt: "Custom image"*/
                    }).then((result) => {
                        if (result.isConfirmed) {
                            acceptApplication();
                            Swal.fire('Accepted!', 'The application has been accepted.', 'success');
                        }
                    });
                }}
                className="accept-button"
            >
                Accept
            </button>
        </Container>
    )
}
function StudentApplicationDetail(props){
    const [studentData, setStudentData] = useState(null);
    const [proposalData, setProposalData] = useState({id:-1});
    const { proposalId } = useParams();
    const studentId = props.studId;

    const location = useLocation();
    const { application } = location.state;

    useEffect(() => {
        const getStudentData = async () => {
            try {
                const retrievedStudentData = await API.getStudentData(proposalId, studentId);
                setStudentData(retrievedStudentData);
            } catch (err) {
                props.setErrorMessage(`${err}`);
            }
        };
        getStudentData();
    }, []);

    useEffect(() => {
        const getProposalData = async () => {
            try {
                const retrievedProposalData = await API.getSingleProposal(proposalId);
                setProposalData(retrievedProposalData);
            } catch (err) {
                //should use toast instead
                props.setErrorMessage(`${err}`);
            }
        };
        getProposalData();
    }, []);

    if (!studentData) {
        return <div>Loading... still missing your data</div>;
    }

    return (
        <Container>
            <h1 className='mt-5'>{studentData.name} {studentData.surname}'s application for <i>
            <Link
                to={{
                    pathname: `/proposals/${proposalData.id}`,
                }}
                state = {{proposal:proposalData, studentId:studentId, comingFromApp:true}}
            >
                "{application.proposal}"
            </Link></i>
            </h1>
            <p>A <i>{proposalData.Type}</i> thesis for the <i>{proposalData.groups}</i> group</p>
            <p>Expires on <b>{proposalData.expiration.substring(0,10)}</b></p>
            <Card className='grades-table-card my-4'>
                <h2>Your CV</h2>
                <Table className='grades-table' striped responsive>
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
            {/*TODO: put here the download of the uploaded file*/}
        </Container>
    )
}
export default ApplicationDetailComponent;