import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { ToDoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { parseUserId } from '../auth/utils'
import { UpdateAttachmentRequest} from '../requests/UpdateAttachmentRequest'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import { TodoUpdate } from '../models/TodoUpdate'

const logger = createLogger('todo_businessLogic')



const todoAccess = new ToDoAccess()
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({signatureVersion: "v4"})



export async function getAllToDo(jwtToken): Promise<TodoItem[]> {
  // const userId = parseUserId(jwtToken)
  // return todoAccess.getAllToDo(userId)

  let items = await todoAccess.getAllToDo(parseUserId(jwtToken))
  for (let item of items) {
     
      if(item['attachmentUrl']) {
          item['attachmentUrl'] = signedUrl(item['attachmentUrl'])
      }
  }   
  return items
}

export async function createToDo(
  createToDoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)
  
  return await todoAccess.createToDo({
    userId: userId,
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: createToDoRequest.name,
    dueDate: createToDoRequest.dueDate,
    done: false,
  })
}
export async function deleteToDo(todoId, jwtToken){
  //console.log('todo businesslogic ...todoid ist : ' + todoId + '- userid ist: ' + jwtToken)
  logger.info('deleteToDo', {
    Data: {
      todoId,
      jwtToken
    }
  })
  
  const userId = parseUserId(jwtToken)
  return todoAccess.deleteToDo(todoId, userId)
  
}

export async function updateTodoAttachment(
  itemId:string,
  updatedItem: UpdateAttachmentRequest,
  jwt:string) {
      const userId = parseUserId(jwt)

      return await todoAccess.updateItemAttachment(itemId, userId, updatedItem) 

}

export function signedUrl (attachment:string) {

  return s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: attachment,
      Expires: urlExpiration,
  })
}

export async function updateTodo(TodoUpdate: TodoUpdate, jwtToken, todoId ){
  const userId = parseUserId(jwtToken)
  await todoAccess.updateToDo(todoId, userId, TodoUpdate)
  logger.info('updateToDoBusniessLogic', {
    Data: {
      todoId,
      jwtToken,
      TodoUpdate
    }
  })
}