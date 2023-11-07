const SERVER_URL = 'http://localhost:3001';

//#region Application
const getApplications = async (professorId) =>{
    const response = await fetch(SERVER_URL + `/api/applications/${professorId}`);
    const applicationsJson = await response.json();
    if(response.ok) {
      return applicationsJson.map(app => {
        return {"student": app.studentId, "proposal": app.proposal, "status":app.status
        //we'll need to add here the other fields of the application, when we'll know them
        };
      });
    }
    else{
      throw new Error("Error on getting the applications: "+applicationsJson);
    }
}
//#endregion

const API = {getApplications};
export default API;

