# SE2_Thesis-Management

## Project Setup Guide

### Cloning the Repository

Be sure to have Node.js installed on your machine!
The application uses Vite+React for the frontend (client) and Express for the backend (server)
- Initialize the project

```bash
git clone https://github.com/matitaviola/SE2_Thesis-Management.git
cd SE2_Thesis-Management
cd server
npm install
cd ../client
npm install
```
### Run the server (inside of 'server' folder)
```bash
node index.js
```
### Run the client (inside of 'client' folder)
```bash
npm run dev
```
### Populate the db (inside of 'server' folder)
Note: it can be used to return the DB at the original state in case you mess it up while testing
```bash
npm run populate
```