const SERVER_URL = 'http://localhost:3001';

//#region Login
const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + `/api/session`, {
    credentials: 'include',
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw user;  // an object with the error coming from the server
  }
}
const logout = async () => {
  const response = await fetch(SERVER_URL + `/logout`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error(`Logout error! status: ${response.status}`);
  }
  return {success:true};
}
//#endregion

//#region Student
const getStudentData = async (proposalId, studentId) =>{
  
  const response = await fetch(SERVER_URL + `/api/application/${proposalId}/${studentId}`, );
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
  
  let response, proposalsJson;
  if(user.role == 'TEACHER'){
    response = await fetch(SERVER_URL + `/api/proposals/teacher/${user.id}`);
    proposalsJson = await response.json();
  } else{
    throw new Error("Error on getting the proposals: Invalid role");
  }
  if(response.ok) {
    return(proposalsJson);
  }
  else{
    throw new Error("Error on getting the proposals: "+proposalsJson);
  }
}

const getStudentProposals = async (studentId, filter) =>{

  let path = '?';
  Object.keys(filter).filter(k => filter[k]).forEach(k =>{
    path = path.concat(`${k}=${filter[k]}&`);
  })
  path = path.slice(0, -1);

  let response = await fetch(SERVER_URL + `/api/proposals/students/${studentId}${path}`);
  let responseJson = await response.json();


  if(response.ok) {
    return responseJson;
  }
  else{
    throw new Error("Error on getting the proposals: "+responseJson);
  }
}

const createProposal = async (proposal, user) => {
 
  const response = await fetch(`${SERVER_URL}/api/proposals`, {
    method: 'POST',
    
    body: JSON.stringify(proposal)
  });
  if(!response.ok) {
    const errMessage = await response.json();
    throw new Error("Error on creating the proposal: " + errMessage.error);
  } else return {ok:true};
}

const deleteProposal = async (proposal) => {
  
  const response = await fetch(SERVER_URL + `/api/proposals/${proposal}`, {
      method: 'DELETE',
      
  });

  if (!response.ok) {
      const errorJson = await response.json();
      throw new Error("Error on deleting the proposal: " + errorJson);
  }
}

//#endregion

//#region Application
const getApplications = async (user) =>{
 
  let apiURL = SERVER_URL +"/api/applications/";

  if(user.role == 'TEACHER'){
    apiURL += `teacher/${user.id}`;
  }else if(user.role == 'STUDENT'){
    apiURL += `student/${user.id}`;
  }else{
    throw new Error("Error on getting the applications: Invalid role");
  }
  const response = await fetch(apiURL, );
  const applicationsJson = await response.json();

  if(response.ok) {
    return applicationsJson.map(app => {
      return {"id":app.id, "studentId": app.studentId, "proposal_id":app.proposal, "proposal": app.title, "status":app.status
      //we'll need to add here the other fields of the application, when we'll know them
      };
    });
  }
  else{
    throw new Error("Error on getting the applications: "+applicationsJson);
  }
}

const updateApplicationStatus = async (proposalId, studentId, statusSet) => {
  
  //Choose if accept or reject based on the status passed
  const status = statusSet? "Accepted" : "Rejected";

  const response = await fetch(SERVER_URL + `/api/application/${proposalId}/${studentId}`, {
      method: 'PATCH',
      
      body: JSON.stringify({
        'status': status
      }),
  });

  if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
  }
    
  return {ok:true};
};

const addApplication = async (proposalId, studentId) => {
  const reqheader = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'STUDENT'
  };
  const response = await fetch(SERVER_URL + `/api/applications`, {
    method: 'POST',
    
    body: JSON.stringify({ proposalId, studentId }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
    
  return {ok:true};
  
} 

const getDegrees = async () => {
  
  const response = await fetch(SERVER_URL + `/api/degrees`, {
    method: 'GET',
      
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const degreesJson = await response.json();
  return degreesJson;
} 


//#endregion

const API = {getUserInfo, logout, getProposals, createProposal, deleteProposal, getApplications, getStudentData, updateApplicationStatus, getStudentProposals, addApplication, getDegrees};
export default API;

