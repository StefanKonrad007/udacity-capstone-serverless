import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateBucketPointRequest } from '../../requests/CreateBucketPointRequest'
import { createBucketPoint } from '../../businessLogic/bucketPoint'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createBucketPoint')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const newBucketPoint: CreateBucketPointRequest = JSON.parse(event.body)
  // TODO: Implement creating a new TODO item
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  console.log('hello create Buckepoint')


try{
  const newItem = await createBucketPoint(newBucketPoint, jwtToken)
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      "item":newItem
    })
  }

}catch(error){
  logger.error('createBucketPoint failed', {
    Data: {
      newBucketPoint,
      jwtToken,
      error
    }
  })
  return {
    statusCode: error.statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      message: error.message
    })
  }
}
}
