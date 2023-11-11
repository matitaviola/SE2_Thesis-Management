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

// #region Proposals

const getProposals = async (studentId, filter) =>{
  let path = '?';
  Object.keys(filter).filter(k => filter[k]).forEach(k =>{
    path = path.concat(`${k}=${filter[k]}&`);
  })
  path = path.slice(0, -1);
  console.log(path);

  let response = await fetch(SERVER_URL + `/api/proposals/students/${studentId}${path}`);
  let responseJson = await response.json();


  if(response.ok) {
    console.log(responseJson);
    return responseJson;
  }
  else{
    throw new Error("Error on getting the proposals: "+applicationsJson);
  }
}


// #endregion


const API = {getApplications, getProposals};
export default API;

