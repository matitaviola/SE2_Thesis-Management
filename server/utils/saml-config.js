const loginDao = require('../DB/login-dao');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const fs = require('fs');
const path = require('path');

const certSAMLPath = path.join(__dirname, '../certificates/thesis-management-06.pem');
const certSAML = fs.readFileSync(certSAMLPath, 'utf-8'); // read the certificate
const SAMLconfig = {
    entryPoint: 'https://thesis-management-06.eu.auth0.com/samlp/h4XhUaPJYpejFSJpNKdl1f9SCrd6baBh',
    issuer: 'urn:thesis-management-06.eu.auth0.com',
    callbackUrl: 'http://localhost:3001/login/callback',
    //logoutUrl: 'http://localhost:3001/logout/callback',
    cert: certSAML,
    acceptedClockSkewMs: 30000
};

passport.use(new SamlStrategy(SAMLconfig, 
    (profile, done) => {
        loginDao.effectLogin(profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'])
            .then(user => {
                // Successful login, pass the user to the next middleware
                done(null, user);
            })
            .catch(err => {
                // Handle errors during login
                done(err, false);
            });
    }
));

passport.serializeUser((user, done) => {
    // Implement serialization logic
    done(null, user);
});
  
passport.deserializeUser((user, done) => {
    // Implement deserialization logic
    done(null, user);
});

module.exports = passport;