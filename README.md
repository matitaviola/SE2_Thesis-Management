# SE2_Thesis-Management

## Project Setup Guide
## Run with docker
### Install the Docker app
Go to [docker's official site](www.docker.com), download and install the docker application following the installation wizard's instructions
### Cloning the repository
```bash
git clone https://github.com/matitaviola/SE2_Thesis-Management.git
cd SE2_Thesis-Management
```
### Run docker build
```
docker-compose up
```
### Go to the webapp page
Either open your browser and go to "127.0.0.1:5173" or clicke this link:
[Thesis Management](127.0.0.1:5173)

## Run locally without docker
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
Note: it can be used to return the DB at the original state in case you mess it up while testing.
Note: Please remove the old file before running to avoid issues with the foreign keys
```bash
npm run populate
```
### Run tests (either inside the 'server' or 'client' folder)
```bash
npm test
```
To also get the tests coverage run
```bash
npm run coverage
```