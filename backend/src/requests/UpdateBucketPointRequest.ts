/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateBucketPointRequest {
  name: string
  category: string
  dueDate: string
  done: boolean
}