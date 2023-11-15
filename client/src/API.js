const SERVER_URL = 'http://localhost:3001';

//#region Application
const getApplications = async (user) =>{
  let response, applicationsJson;
  if(user.role == 'TEACHER'){
    response = await fetch(SERVER_URL + `/api/applications/teacher/${user.id}`);
    applicationsJson = await response.json();
  }else if(user.role == 'STUDENT'){
    response = await fetch(SERVER_URL + `/api/applications/student/${user.id}`);
    applicationsJson = await response.json();
  }else{
    throw new Error("Error on getting the applications: Invalid role");
  }
  if(response.ok) {
    console.log(applicationsJson);
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

//#endregion

//#region Proposal
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
const API = {getApplications, deleteProposal};
export default API;

