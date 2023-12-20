import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../App.jsx";
import { useContext, useState, useEffect } from "react";
import NotFound from "./NotFoundComponent.jsx";
import API from "../API";
import { Button } from 'react-bootstrap';


export default function RequestsComponent(props){
    const loggedInUser = useContext(AuthContext);

    if (loggedInUser && loggedInUser.role == 'STUDENT') {
        return (<RequestStudent studentId={loggedInUser.id} setErrorMessage={props.setErrorMessage}/>);
    }
    if (loggedInUser && (loggedInUser.role == 'TEACHER' || loggedInUser.role == 'CLERK')) {
        return (<RequestsTable teacherId={loggedInUser.role == 'TEACHER'? loggedInUser.id : null}setErrorMessage={props.setErrorMessage} />);
    }
    return (
        <NotFound></NotFound>
    )
}

function RequestsTable(props){

}

function RequestStudent(props){
    const [request, setRequest] = useState({});
    //Tries to get an active request for the student, if any
    useEffect(() => {
        const fetchActiveRequest= async () => {
          try{
            const requestFetched = await API.getStudentActiveRequest(props.studentId);
            setRequest(requestFetched);
          }catch(err){
            props.setErrorMessage(`${err}`);
          }
        }
        fetchActiveRequest()
      }, []);

    return(
        <>
        {request?
            <Button>CREATE NEW REQUEST</Button>
            :
            <p>{request.title}</p>
        }
        </>
    )
}