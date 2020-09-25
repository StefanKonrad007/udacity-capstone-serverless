import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteToDo } from '../../businessLogic/todo'
import { createLogger } from '../../utils/logger'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const token = event.headers.Authorization.split(' ')[1]
  // TODO: Remove a TODO item by id
  const logger = createLogger('deleteTodo')

try{
  await deleteToDo(todoId, token)
  
  return {
  statusCode: 201,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  },
  body: JSON.stringify({
    message: "todo deleted"
  })
}
}catch(error){
  logger.error('deleteTodoFail', {
    Data: {
      error
    }
  })
  return {
    statusCode: 400,
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
