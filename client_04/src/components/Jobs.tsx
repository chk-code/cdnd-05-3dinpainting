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

import { createJob, deleteJob, getJobs, patchJob } from '../api/jobs-api'
import Auth from '../auth/Auth'
import { Job } from '../types/Job'

interface JobsProps {
  auth: Auth
  history: History
}

interface JobsState {
  jobs: Job[]
  newJobName: string
  loadingJobs: boolean
}

export class Jobs extends React.PureComponent<JobsProps, JobsState> {
  state: JobsState = {
    jobs: [],
    newJobName: '',
    loadingJobs: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newJobName: event.target.value })
  }

  onEditButtonClick = (jobId: string) => {
    this.props.history.push(`/jobs/${jobId}/edit`)
  }

  onJobCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const creationDate = new Date().toISOString()
      const newJob = await createJob(this.props.auth.getIdToken(), {
        jobName: this.state.newJobName,
        createdAt: creationDate
      })
      this.setState({
        jobs: [...this.state.jobs, newJob],
        newJobName: ''
      })
    } catch {
      alert('Job creation failed')
    }
  }

  onJobDelete = async (jobId: string) => {
    try {
      await deleteJob(this.props.auth.getIdToken(), jobId)
      this.setState({
        jobs: this.state.jobs.filter(job => job.jobId !== jobId)
      })
    } catch {
      alert('Job deletion failed')
    }
  }

  /* onJobCheck = async (pos: number) => {
    try {
      const job = this.state.jobs[pos]
      await patchJob(this.props.auth.getIdToken(), job.jobId, {
        jobId: job.jobId,
        jobStatus: job.jobStatus
      })
      this.setState({
        jobs: update(this.state.jobs, {
          [pos]: { done: { $set: !job.done } }
        })
      })
    } catch {
      alert('Job deletion failed')
    }
  } */

  async componentDidMount() {
    try {
      const jobs = await getJobs(this.props.auth.getIdToken())
      this.setState({
        jobs,
        loadingJobs: false
      })
    } catch (e) {
      alert(`Failed to fetch jobs: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Your image conversion jobs</Header>

        {this.renderCreateJobInput()}

        {this.renderJobs()}
      </div>
    )
  }

  renderCreateJobInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Add Image job',
              onClick: this.onJobCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderJobs() {
    if (this.state.loadingJobs) {
      return this.renderLoading()
    }

    return this.renderJobsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Image Jobs
        </Loader>
      </Grid.Row>
    )
  }

  renderJobsList() {
    console.log('JOBS ARRAY: ',this.state.jobs)
    return (
      <Grid padded>        
        { this.state.jobs.map((job, pos) => {
          return (
            <Grid.Row key={job.jobId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  //onChange={() => this.onJobCheck(pos)}
                  //checked={job.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {job.jobName}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {job.createdAt}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(job.jobId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onJobDelete(job.jobId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {job.imgUrl && (
                <Image src={job.imgUrl} size="small" wrapped />
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
}