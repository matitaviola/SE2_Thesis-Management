// Sever's main file
const appDao = require('./DB/applications-dao');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors()); // Enable CORS for all routes

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



//GET /api/applications/:professorId
app.get('/api/applications/:professorId', 
  async (req, res) => {
    try {
        //gets all the professor's proposals
        const proposals = propDao.getProposalsByProfessor(req.params.professorId);
        //gets all the applications for the proposals
        const applications = await Promise.all(
            proposals.map(p => appDao.getApplicationsByProposal(p.id))
        );
        res.json(applications);
    } catch {
      res.status(500).end();
  }
});