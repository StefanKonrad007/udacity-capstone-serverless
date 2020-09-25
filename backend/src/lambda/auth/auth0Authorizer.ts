import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'

import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const certificate = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJH+ZY+mrx5IcfMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi05MW1jcjVobC5ldS5hdXRoMC5jb20wHhcNMjAwODExMTIzNzE4WhcN
MzQwNDIwMTIzNzE4WjAkMSIwIAYDVQQDExlkZXYtOTFtY3I1aGwuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5ufDpjRmJyiCQe25
Vqw6SUwEVMBs2JHdTzS5EbHwxI9wYWwCiCX7N/4erYRHqbK/Lhh8SgzesA1u5ydI
W50qS6awzTeNdCoEHxVenLydzf6gWrlArOs8YJhlgbMT+hLfEJBZDG9C6PINblGR
GFE+kW3MsR1xNo/BxgwG9AovvpKuC+7vL+a/RmmhtFSUw556CIgZEU5iJuqWlOeU
DXVGohVTXywOl8/oTSMi+iwG/SOqORTMaT+4pToWqXTEzt6okJT8/hXIT3fuSPRT
fpandU2VsjIoQQFD0U9x0Zc5U1YXwGmAKNhBpvnDJA00kHFHEUiDhrpQLQbtcu/G
pBwhXQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSqlOeErqVq
Gdm0wmyilLmyBCiCWzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AMgwRZvS4UvNXdS2A/I0U2Sqi+XyavgpFlvmWqoEr1H5zkvnNmrYs9n467ZE62cu
NxqbwyA0TOWuqMxh0yXfoF8tTqqtrmx0iPPf481bv4eCELa1ww3XVzKMXQv2ODnX
/FtnO5q5a+N03HwQnaRqNM/tRwWb1IFb56jA2fNp8yzPKthGSUCesDns+oVplJU0
9DbiKZeADd7HoCG81rfhgmF1sHkVPV80B3NVHpyN5CxbOM58Lxjvby2FtJNka8Zo
HOC5TPXDHwhUHgg0jIj9akzpTLOR5SbX+9zZvapn3CbAUWy1Y/ku9fbpdAH490Or
ZJjPQlKG8hgPyUg1T0lMHGU=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, certificate,{algorithms:['RS256']}) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
