import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateBucketPointRequest } from '../../requests/UpdateBucketPointRequest'
import { updateBucketPoint } from '../../businessLogic/bucketPoint'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const pointId = event.pathParameters.pointId
  const updatedBucketPoint: UpdateBucketPointRequest = JSON.parse(event.body)
  const token = event.headers.Authorization.split(' ')[1]
  console.log(pointId+updatedBucketPoint)

try{
  await updateBucketPoint(updatedBucketPoint, token, pointId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body:''
  }

}catch(error){
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  logger.error('updateToDo failed', {
    Data: {
      updatedBucketPoint,
      token,
      pointId
    }
  })
  return {
    statusCode: 400,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: '',
    }
  }
}
