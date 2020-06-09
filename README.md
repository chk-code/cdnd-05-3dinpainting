# CDND 05 - Picture Capstone Project :rocket: 
> This is the final project of the Cloud Developer Nanodegree @ Udacity. The purpose of the cloud developer capstone project is to combine what I learned throughout the program. In this project, I build a cloud-based application on a serverless architecture. 

# Table of contents
* [Functionality of the application](#functionality-of-the-application)
* [How to run the application](#how-to-run-the-application)
* [Postman collection](#postman-collection)


# Functionality of the application

This application allows an user to create image jobs. These image jobs will convert automatically an uploaded picture into 4 modified alternatives (used filters are: posterized, sepia, greyscale and inverted). After converting, the user is able to download the pictures by using a zip & download function. Each user can only access his own image jobs. 

# Key Learnings

## Setup Travis CI/CD for AWS and Serverless
**(Option 1): CI/CD, Github & Code Quality**

The project is configured to user CI with GItHub and CD with TravisCI. The code will be served by a serverless.yml for AWS. A pushed code change (either dev or master branch) will be processed by TravisCI, deployment will be done automatically.

[![Build Status](https://travis-ci.org/chk-code/cdnd-05-3dinpainting.svg?branch=dev)](https://travis-ci.org/chk-code/cdnd-05-3dinpainting)

## AUTH0

The project uses Auth0 as Authorization provider.
Config for Auth0: Client Name SLS-3D-Inpainting and Domain: hydronet.eu.auth0.com. ClientID and Secret will be stored in AWS

# Implemented Functions
**(Option 2): Functionality**

The application allows users to create, update, delete image job items. Each item consists of a job name and a picture and various other options (see below). The application allows users to upload an image file.. 

The user needs to sign in with credentials, Authentication is implemented and does not allow unauthenticated access. Each user can only see, edit/create his own image jobs (The application only displays items for a logged in user). After deleting a job, all images and zip archives are deleted automatically on S3.

The code is split into multiple layers separating business logic from I/O related code. 
Code of Lambda functions is split into multiple files/classes. The business logic of an application is separated from code for database access, file storage, and code related to AWS Lambda.

Used AWS products, configured by serverless:
- [x] Amazon X-Ray for tracing
- [x] nodejs12.x
- [x] A DynamoDB (table with 3 Global Indexes and composite key)
- [x] Two S3 Buckets
- [x] SNS 
- [x] 8 function handlers
- [x] API Gateway (REST)
- [x] Authorization handler


## The JOB items

The application stores Image Job items. Each Job item contains the following fields:

* `userId` (string) - the unique user id for each job
* `jobId` (string) - a unique id for a job item
* `createdAt` (string) - date and time when an item was created
* `jobName` (string) - name of an image job (e.g. "My first car")
* `jobStatus` (string) - current status of job processing
* `imgUrl` (string) (optional) - a URL pointing to an image uploaded to a image job
* `vidUrl_01` (string) (optional) - a URL pointing to the converted image (Posterized version)
* `vidUrl_02` (string) (optional) - a URL pointing to the converted image (Sepia version)
* `vidUrl_03` (string) (optional) - a URL pointing to the converted image (Greyscale version)
* `vidUrl_04` (string) (optional) - a URL pointing to the converted image (Inverted version)
* `zipUrl` (string) (optional) - a URL pointing to the zip file (containing all 4 converted images) after conversion

## Frontend

The `client04` folder contains a web application that can use the API that was developed in this project.

This frontend works with the serverless application identical to the frontend provided in the project "serverless". The configuration in the `config.ts` file in the `client04` folder is prepared for the use with the "dev" stage. Also, the Auth0 configuration is setup.

```ts
const apiId = 'wxqis4xqt9'
const stageName = 'dev'
const awsRegion = 'eu-central-1'
export const apiEndpoint = `https://${apiId}.execute-api.${awsRegion}.amazonaws.com/${stageName}`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

## Backend
The backend code in the `backend` folder is deployed automatically after each push to the dev/master branch via TravisCI. All resources in the application are defined in the "serverless.yml" file. It uses the serverless architecture.
Each function has its own set of permissions. Application has distributed tracing enabled, it has an decent amount of log statements and it generates application level metrics. HTTP requests are validated, using the serverless-reqvalidator-plugin and by providing request schemas in function definitions.
Data is stored in a table with a composite key.

# How to run the application

## Backend

The backend is running on AWS with serverless configuration. Please use the provided frontend client or postman collection for tests.

## Frontend

To run a client application, clone the repo and cd into repo directory. Then run the following commands:

```
cd client04
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless image job application.

# Postman collection

An alternative way to access the API is a Postman collection that contains sample requests. You can find the Postman collection in this project.

# Screenshots
## Application - Login Screen
![LoginScreen](https://github.com/chk-code/cdnd-05-3dinpainting/raw/master/screenshots/LoginScreen.png)

## Application - Home Screen
![AppScreen](https://github.com/chk-code/cdnd-05-3dinpainting/raw/master/screenshots/AppScreen.png)

## TravisCI - Build Screen
![BuildScreen](https://github.com/chk-code/cdnd-05-3dinpainting/raw/master/screenshots/TRavisCI%20Builds.png)


