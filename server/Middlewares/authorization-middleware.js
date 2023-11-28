const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

function checkUserRole(role) {
  return function(req, res, next) {
    // Assuming your user object has a 'roles' property that contains an array of roles
    const userRoles = req.user.roles; // Adjust this based on your actual user object structure

    if (userRoles && userRoles.includes(role)) {
      // User has the required role, proceed to the next middleware or route handler
      next();
    } else {
      // User does not have the required role, redirect or send an error response
      res.status(403).send('Access forbidden. Insufficient role.');
    }
  };
}

module.exports = {
  checkTeacherRole: checkUserRole('Teacher'),
  checkStudentRole: checkUserRole('Student'),
  isLoggedIn
};