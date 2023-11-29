# SE2_Thesis-Management

## Project Setup Guide
## Run with docker
### 1 - Install the Docker app
Go to [docker's official site](www.docker.com), download and install the docker application following the installation wizard's instructions
### 2 - Cloning the repository
```bash
git clone https://github.com/matitaviola/SE2_Thesis-Management.git
cd SE2_Thesis-Management
```
### 3 - Run docker build
```
docker-compose up
```
### 4 - Go to the webapp page
Either open your browser and go to "127.0.0.1:5173" or clicke this link:
[Thesis Management](http://127.0.0.1:5173)

## Run locally without docker
### 1 - Cloning the Repository

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
### 2 - Populate the db (inside of 'server' folder)
Note: it can be used to return the DB at the original state in case you mess it up while testing.
Note: Please remove the old file before running to avoid issues with the foreign keys
```bash
npm run populate
```

### 3a - Run the server (inside of 'server' folder)
```bash
node index.js
```
### 3b - Run the client (inside of 'client' folder)
```bash
npm run dev
```
### 4 - Run tests (either inside the 'server' or 'client' folder)
```bash
npm test
```
To also get the tests coverage run
```bash
npm run coverage
```


## Users:
### Students
- usr:john@studenti.polito.com psw:s200000
- usr:alice@studenti.polito.com psw:s200001
- usr:carlos@studenti.polito.com psw:s200002
- usr:ling@studenti.polito.com psw:s200003
- usr:raj@studenti.polito.com psw:s200004

### Teachers
- usr:michael@docenti.polito.com psw:d100001
- usr:emily@docenti.polito.com psw:d200002
- usr:david@docenti.polito.com psw:d100003
- usr:emma@docenti.polito.com psw:d100011
