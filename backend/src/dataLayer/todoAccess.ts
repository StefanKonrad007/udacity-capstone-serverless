import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
//import { join } from 'path'
import { UpdateAttachmentRequest } from '../requests/UpdateAttachmentRequest'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

const logger = createLogger('DataLayer')


export class ToDoAccess {

  constructor(
    private readonly docClient: DocumentClient =  new XAWS.DynamoDB.DocumentClient(),
    private readonly todoTable = process.env.TODO_TABLE,
    private readonly userIdIndex = process.env.USER_ID_INDEX
) {
  }

  async getAllToDo(userid:string): Promise<TodoItem[]> {
    console.log('Getting all ToDos')


    const result = await this.docClient.query({
      TableName: this.todoTable,
      IndexName: this.userIdIndex,
      KeyConditionExpression: 'userId= :userId',
      ExpressionAttributeValues: {':userId':userid}
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }


  async createToDo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todo
    }).promise()

    return todo
  }

  async deleteToDo(todoId: String, userId: String){
    await this.docClient.delete({
      TableName: this.todoTable,
      Key:{userId: userId,
      todoId: todoId}
    }).promise()
  }

  async updateItemAttachment(todoId: String, userId: String, attachment: UpdateAttachmentRequest){
    await this.docClient.update({
      TableName: this.todoTable,
      Key:{userId: userId,
      todoId: todoId},
      UpdateExpression: "SET attachmentUrl = :attachment", 
      ExpressionAttributeValues: {
        ":attachment": attachment.attachmentUrl
      }
    }).promise()
  }

  async updateToDo(todoId: String, userId: String, ToDoUpdate: TodoUpdate ){
    logger.info('updateToDo', {
      Data: {
        todoId,
        userId,
        ToDoUpdate
      }
    })
    await this.docClient.update({
      TableName: this.todoTable,
      Key:{userId: userId,
      todoId: todoId},
      UpdateExpression: "SET #title = :name, dueDate = :dueDate, done = :done", 
      ExpressionAttributeValues: {
        ":name": ToDoUpdate.name,
        ":dueDate": ToDoUpdate.dueDate,
        ":done": ToDoUpdate.done
      },
      ExpressionAttributeNames: {
        "#title": "name"
      }
    }).promise()
  }
}

