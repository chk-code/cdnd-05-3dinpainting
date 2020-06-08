# CDND 05 - Picture Capstone Project

This is the final project of the Cloud Developer Nanodegree @ Udacity. The purpose of the cloud developer capstone project is to combine what I learned throughout the program. In this project, I build a cloud-based application on a serverless architecture. 

# Functionality of the application

This application allows an user to create image jobs. These image jobs will convert an uploaded picture into 4 modified alternatives automatically (used filters are posterized, sepia, greyscale and inverted). After converting, the user is able to download the pictures by using a zip & download function. Each user can only access his own image jobs. 

# Key Learnings

## Setup Travis CI/CD for AWS and Serverless

Helpful link to setup a nice .travis.yml https://medium.com/swlh/setup-ci-cd-pipeline-for-aws-lambda-using-github-travis-ci-9812c8ef7199

## AUTH0

Config for Auth0: CLient Name SLS-3D-Inpainting and Domain: hydronet.eu.auth0.com. ClientID and Secret will be stored in AWS



# The JOB items

The application should store TODO items, and each TODO item contains the following fields:

* `todoId` (string) - a unique id for an item
* `createdAt` (string) - date and time when an item was created
* `name` (string) - name of a TODO item (e.g. "Change a light bulb")
* `dueDate` (string) - date and time by which an item should be completed
* `done` (boolean) - true if an item was completed, false otherwise
* `attachmentUrl` (string) (optional) - a URL pointing to an image attached to a TODO item

You might also store an id of a user who created a TODO item.


# Implemented Functions



# Frontend

The `client04` folder contains a web application that can use the API that should be developed in the project.

This frontend should work with your serverless application once it is developed, you don't need to make any changes to the code. The only file that you need to edit is the `config.ts` file in the `client` folder. This file configures your client application just as it was done in the course and contains an API endpoint and Auth0 configuration:

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

# How to run the application

## Backend

The backend is running on AWS with serverless configuration.

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless TODO application.

# Postman collection

An alternative way to access the API is a Postman collection that contains sample requests. You can find the Postman collection in this project.







