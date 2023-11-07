const SERVER_URL = 'http://localhost:3001';

//#region Application
const getApplications = async (professorId) =>{
    const response = await fetch(SERVER_URL + `/api/applications/${professorId}`);
    const applicationsJson = await response.json();
    if(response.ok) {
      return applicationsJson.map(app => new {"student": app.student, "proposal": app.proposal
        //we'll need to add here the other fields of the application, when we'll know them
        });
    }
    else
      throw "Error on getting the applications: "+applicationsJson;
}
//#endregion

export default API = {getApplications};

