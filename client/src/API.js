const SERVER_URL = 'http://localhost:3001';

//#region Student
const getStudentData = async (proposalId, studentId) =>{
  const reqheader = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'TEACHER'
  };
  const response = await fetch(SERVER_URL + `/api/application/${proposalId}/${studentId}`, {
    headers: reqheader
  });
  const studentDataJson = await response.json();
  if(response.ok) {
    return studentDataJson;
  }
  else{
    throw new Error("Error on getting the studentsData: "+studentDataJson);
  }
}
//#endregion

//#region Proposal
const getProposals = async (user) =>{
  const reqheader = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'TEACHER'
  };
  let response, proposalsJson;
  if(user.role == 'TEACHER'){
    response = await fetch(SERVER_URL + `/api/proposals/teacher/${user.id}`, {headers:reqheader});
    proposalsJson = await response.json();
  } else{
    throw new Error("Error on getting the applications: Invalid role");
  }
  if(response.ok) {
    console.log(proposalsJson);
    return(proposalsJson);
  }
  else{
    throw new Error("Error on getting the applications: "+proposalsJson);
  }
}
//#endregion

//#region Application
const getApplications = async (user) =>{
  const reqheader = {
    'Content-Type':'application/json',
    'X-USER-ROLE':user.role
  };
  let apiURL = SERVER_URL +"/api/applications/";

  if(user.role == 'TEACHER'){
    apiURL += `teacher/${user.id}`;
  }else if(user.role == 'STUDENT'){
    apiURL += `student/${user.id}`;
  }else{
    throw new Error("Error on getting the applications: Invalid role");
  }
  const response = await fetch(apiURL, {
    headers: reqheader
  });
  const applicationsJson = await response.json();

  if(response.ok) {
    return applicationsJson.map(app => {
      return {"studentId": app.studentId, "proposal": app.proposal, "status":app.status
      //we'll need to add here the other fields of the application, when we'll know them
      };
    });
  }
  else{
    throw new Error("Error on getting the applications: "+applicationsJson);
  }
}

const updateApplicationStatus = async (proposalId, studentId, statusSet) => {
  const reqheader = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'TEACHER'
  };
  //Choose if accept or reject based on the status passed
  const status = statusSet? "Accepted" : "Rejected";
  console.log(status);
  const response = await fetch(SERVER_URL + `/api/application/${proposalId}/${studentId}`, {
      method: 'PATCH',
      headers: reqheader,
      body: JSON.stringify({
        'status': status
      }),
  });

  if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
  }
    
  return {ok:true};
};


//#endregion

const API = {getProposals, getApplications, getStudentData, updateApplicationStatus};
export default API;

