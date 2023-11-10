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

const getStudentData = async (proposalId, studentId) =>{
  const response = await fetch(SERVER_URL + `/api/application/${proposalId}/${studentId}`);
  const studentDataJson = await response.json();
  if(response.ok) {
    //console.log("nelle API"+JSON.stringify(studentDataJson)); //stringify needed, otherwise we'd have an [object Object]
    return studentDataJson;
  }
  else{
    throw new Error("Error on getting the studentsData: "+studentDataJson);
  }
}

//#endregion

const API = {getApplications, getStudentData};
export default API;

