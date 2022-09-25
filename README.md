# Node.js REST API starter kit

This repository contains the skeleton for a Node.js REST API.
It runs with the following packages:
- Express: The framework to expose data through the HTTP protocol
- pg: The PostgreSQL driver
- Morgan: A log framework
- Joi: An object validation framework
- Mocha and Chai: Unit testing / assertion frameworks to properly test the API
- Nodemon: a package that allows quick building and execution of the API when developping

## Installation

1. Clone the repository
2. Rename the project and update the description in "package.json" file
3. Update NPM dependencies to the lastest version by running the following command:
```
npm update
```
4. Install all dependencies by running the following command:
```
npm install
```
5. Configure the database's connection string in the .env file
6. (OPTIONAL) If you count on using the exemple routes (tasks), execute the src/v1/db.init.sql script in the PostgreSQL database
6. Run the following command to start the server in developing mode (auto restart when editing the code):
```
npm run dev
```
7. (OPTIONAL) Test the api with Postman (you can use the "tasks.postman_collection.json" file)
8. Edit the classes and happy coding !

## Project architecture
- The source code is located in "src" directory
- The .env file allows you to configure the api (HTTP port and database settings)