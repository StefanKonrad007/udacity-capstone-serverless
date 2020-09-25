import 'source-map-support/register'
import { getAllToDo } from '../../businessLogic/todo'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  //console.log('Caller event', event)
  //console.log('Token: '+ jwtToken)
  


try{  
  
  const result = await getAllToDo(jwtToken)
  
  return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({'items': result})
    }
  }catch(error){
    logger.error('getAllTodoFail', {
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
      body: JSON.stringify({message: error.message})
    }


  }

}
