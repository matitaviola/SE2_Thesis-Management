const SERVER_URL = 'http://localhost:3001';

//#region Application
const getApplications = async (professorId) =>{
    const response = await fetch(SERVER_URL + `/api/applications/teacher/${professorId}`);
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

const getStudentData = async (studentId) =>{
  const response = await fetch(SERVER_URL + `/api/applications/teacher/${studentId}`);
  const studentDataJson = await response.json();
  if(response.ok) {
    console.log("nelle API"+studentDataJson);
    return studentDataJson.map(app => {
      return {"surname": app.surname, "name": app.name, "gender":app.gender, "nationality":app.nationality, "email":app.email, "code_degree":app.code_degree, "enrollment":app.enrollment
      //Doubts
      };
    });
  }
  else{
    throw new Error("Error on getting the studentsData: "+studentDataJson);
  }
}

//#endregion

const API = {getApplications, getStudentData};
export default API;

