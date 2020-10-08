import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createBucketPoint, deleteBucketPoint, getBucketList, patchBucketPoint } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Point } from '../types/Point'

interface PointsProps {
  auth: Auth
  history: History
}

interface PointsState {
  points: Point[]
  newPointName: string
  newCategoryName: string
  loadingPoints: boolean
}

export class BucketPoints extends React.PureComponent<PointsProps, PointsState> {
  state: PointsState = {
    points: [],
    newPointName: '',
    newCategoryName: '',
    loadingPoints: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPointName: event.target.value })
  }

  handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newCategoryName: event.target.value })
  }

  onEditButtonClick = (pointId: string) => {
    this.props.history.push(`/bucketPoint/${pointId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newPoint = await createBucketPoint(this.props.auth.getIdToken(), {
        name: this.state.newPointName,
        category: this.state.newCategoryName,
        dueDate
      })
      this.setState({
        points: [...this.state.points, newPoint],
        newPointName: ''
      })
    } catch {
      alert('BucketPoint creation failed')
    }
  }

  onTodoDelete = async (pointId: string) => {
    try {
      await deleteBucketPoint(this.props.auth.getIdToken(), pointId)
      this.setState({
        points: this.state.points.filter(todo => todo.pointId != pointId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const bucketPoint = this.state.points[pos]
      await patchBucketPoint(this.props.auth.getIdToken(), bucketPoint.pointId, {
        name: bucketPoint.name,
        category: this.state.newCategoryName,
        dueDate: bucketPoint.dueDate,
        done: !bucketPoint.done
      })
      this.setState({
        points: update(this.state.points, {
          [pos]: { done: { $set: !bucketPoint.done } }
        })
      })
    } catch {
      alert('Bucketpoint deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const points = await getBucketList(this.props.auth.getIdToken())
      this.setState({
        points,
        loadingPoints: false
      })
    } catch (e) {
      alert(`Failed to fetch points: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">BucketList</Header>

        {this.renderCreatePointInput()}

        {this.renderPoints()}
      </div>
    )
  }

  renderCreatePointInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New Bucket Point',
              onClick: this.onTodoCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Add new Bucket Point..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Input 
          fluid
          placeholder="Which Category of BucketPoint..."
          onChange={this.handleCategoryChange}  //zweites Eingabefeld im Frontend
          />
        </Grid.Column>

      </Grid.Row>
    )
  }

  renderPoints() {
    if (this.state.loadingPoints) {
      return this.renderLoading()
    }

    return this.renderPointsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading BucketPoints
        </Loader>
      </Grid.Row>
    )
  }

  renderPointsList() {
    return (
      <Grid padded>
        {this.state.points.map((point, pos) => {
          return (
            <Grid.Row key={point.pointId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={point.done}
                />
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                {point.name}
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                {point.category}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {point.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(point.pointId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(point.pointId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {point.attachmentUrl && (
                <Image src={point.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
