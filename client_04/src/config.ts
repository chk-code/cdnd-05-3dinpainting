// DONE: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'wxqis4xqt9'
const stageName = 'dev'
const awsRegion = 'eu-central-1'
export const apiEndpoint = `https://${apiId}.execute-api.${awsRegion}.amazonaws.com/${stageName}`

export const authConfig = {
  // DONE: Create an Auth0 application and copy values from it into this map
  domain: 'hydronet.eu.auth0.com',            // Auth0 domain
  clientId: 'ETvMUHWVGQqIneQ0dSDOAzcCp65RuSLF',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
