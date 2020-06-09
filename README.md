# CDND 05 - Picture Capstone Project
> This is the final project of the Cloud Developer Nanodegree @ Udacity. The purpose of the cloud developer capstone project is to combine what I learned throughout the program. In this project, I build a cloud-based application on a serverless architecture. 

# Table of contents
* [Functionality of the application](#functionality-of-the-application)
* [How to run the application](#how-to-run-the-application)
* [Postman collection](#postman-collection)


# Functionality of the application

This application allows an user to create image jobs. These image jobs will convert automatically an uploaded picture into 4 modified alternatives (used filters are: posterized, sepia, greyscale and inverted). After converting, the user is able to download the pictures by using a zip & download function. Each user can only access his own image jobs. 

# Key Learnings

## Setup Travis CI/CD for AWS and Serverless - (Option 1): CI/CD, Github & Code Quality

The project is configured to user CI with GItHub and CD with TravisCI. The code will be served by a serverless.yml for AWS. A pushed code change (either dev or master branch) will be processed by TravisCI, deployment will be donbe automatically.

## AUTH0

The project uses Auth0 as Authorization provider.
Config for Auth0: Client Name SLS-3D-Inpainting and Domain: hydronet.eu.auth0.com. ClientID and Secret will be stored in AWS

# Implemented Functions - (Option 2): Functionality

The application allows users to create, update, delete image job items. Each item consists of a job name and a picture and various other options (see below)

## The JOB items

The application stores Image Job items. Each Job item contains the following fields:

* `userId` (string) - the unique user id for each job
* `jobId` (string) - a unique id for a job item
* `createdAt` (string) - date and time when an item was created
* `jobName` (string) - name of an image job (e.g. "My first car")
* `jobStatus` (string) - current status of job processing
* `todoId` (string) - a unique id for an item
* `todoId` (string) - a unique id for an item
* `todoId` (string) - a unique id for an item
* `imgUrl` (string) (optional) - a URL pointing to an image uploaded to a image job
* `vidUrl_01` (string) (optional) - a URL pointing to the converted image (Posterized version)
* `vidUrl_02` (string) (optional) - a URL pointing to the converted image (Sepia version)
* `vidUrl_03` (string) (optional) - a URL pointing to the converted image (Greyscale version)
* `vidUrl_04` (string) (optional) - a URL pointing to the converted image (Inverted version)
* `zipUrl` (string) (optional) - a URL pointing to the zip file (containing all 4 converted images) after conversion

## Frontend

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
## Backendend

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







