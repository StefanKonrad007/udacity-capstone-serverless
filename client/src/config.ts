// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'hm9biraxbe'
export const apiEndpoint = `https://${apiId}.execute-api.eu-central-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-91mcr5hl.eu.auth0.com',            // Auth0 domain
  clientId: 'k0gNXiqUWFbdeUzZtogGIFD4DyPhTSAR',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
