import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import Popup from "reactjs-popup";
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Label,
  Pagination
} from 'semantic-ui-react'

import { createJob, deleteJob, getJobs, convertJob, patchJob } from '../api/jobs-api'
import Auth from '../auth/Auth'
import { Job } from '../types/Job'
import * as uuid from 'uuid'

interface JobsProps {
  auth: Auth
  history: History
}

interface JobsState {
  jobs: Job[]
  newJobName: string
  loadingJobs: boolean
  isDisabled: boolean
}

export class Jobs extends React.PureComponent<JobsProps, JobsState> {
  state: JobsState = {
    jobs: [],
    newJobName: '',
    loadingJobs: true,
    isDisabled: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newJobName: event.target.value })
    this.state.isDisabled = false
    if (this.state.newJobName.length<1)
      this.state.isDisabled = true
  }

  onEditButtonClick = (jobId: string) => {
    this.props.history.push(`/jobs/${jobId}/edit`)
  }
  onConvertButtonClick = (jobId: string) => {
    this.props.history.push(`/jobs/${jobId}/convert`)
  }

  onJobConvert = async (jobId: string) => { 
    try {
      await patchJob(this.props.auth.getIdToken(), jobId, {
        jobId: jobId,
        jobStatus: "processing"
      })
      const convJob = await convertJob(this.props.auth.getIdToken(), jobId)
    } catch {
      alert('Job conversion failed')
    }
  }

  onJobCreate = async (jobId: string) => { //event: React.ChangeEvent<HTMLButtonElement> entfernt als Input
    try {
      const creationDate = new Date().toISOString()
      
      const newJob = await createJob(this.props.auth.getIdToken(), {
        jobId: jobId,
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
    //if (this.props.location.pathname === '/callback') return;
    try {
      await this.props.auth.silentAuth();
      this.forceUpdate();
    } catch (err) {
      if (err.error !== 'login_required') console.log(err.error);
    }
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
      <div className="header-img">
        <img src={require('../favicons/favicon-32x32.png')} alt="logo" />
        <Header as="h1">Your image conversion jobs</Header>

        {this.renderCreateJobInput()}

        {this.renderJobs()}
      </div>
    )
  }

  renderCreateJobInput() {
    const newJobId = uuid.v4()
    return (
      <Grid.Row>
        <Grid.Column width={16}>
        </Grid.Column>
        <Grid.Column width={16}>
        <Popup trigger={<button className="button"> Upload an image </button>} modal>
          {close => (
            <div className="modal">
              <a className="close" onClick={close}>
                &times;
              </a>
              <div className="header"> Upload a New Image </div>
              <div className="content">
                {" "}
                {this.state.isDisabled && (
                  <Label basic color='red' pointing='below'>
                  Please enter a value
                  </Label>
                )}
                <Input
                  label='Image Job'
                  fluid
                  actionPosition="left"
                  placeholder="Name your image job..."
                  onChange={this.handleNameChange}
                />
              </div>
              <div className="actions">
                <button
                  className="button"
                  disabled={this.state.isDisabled}
                  onClick={() => {
                    console.log("Popup closed ");
                    close();
                    this.onJobCreate(newJobId);
                    this.onEditButtonClick(newJobId)
                  }}
                >
                  Upload image and add a new job for conversion
                </button>
              </div>
            </div>
          )}
        </Popup>
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
      <Grid columns={4} divided>        
        { this.state.jobs.map((job, pos) => {
          return (
            <Grid.Row key={job.jobId}>
              <Grid.Column width={5} verticalAlign="middle" wrapped>
                <Header as='h4'>
                  {job.jobName}
                </Header>
                <Divider hidden />
                  <Label>
                    <Icon name='info' />
                    Status
                    <Label.Detail>{job.jobStatus}</Label.Detail>
                  </Label>
              </Grid.Column>
              <Grid.Column width={8} verticalAlign="middle">
              {!job.imgUrl && (
                  <Divider hidden />
              )}
              {job.imgUrl && (
                  <Image src={job.imgUrl}
                    size="medium"
                    verticalAlign="middle" 
                    as='a'
                    href={job.imgUrl}
                    target='_blank'
                  />
              )}
              {job.imgUrl && (
                  <Divider hidden />
              )}
              {job.vidUrl_01 && (
                  <Image.Group size='mini' verticalAlign="middle" floated="right">
                    <Image src={job.vidUrl_01} 
                    as='a'
                    href={job.vidUrl_01}
                    target='_blank'
                    />
                  {job.vidUrl_02 && (
                    <Image src={job.vidUrl_02} 
                    as='a'
                    href={job.vidUrl_02}
                    target='_blank'
                    />
                  )}
                  {job.vidUrl_03 && (
                    <Image src={job.vidUrl_03} 
                    as='a'
                    href={job.vidUrl_03}
                    target='_blank'
                    />
                  )}
                  {job.vidUrl_04 && (
                    <Image src={job.vidUrl_04} 
                    as='a'
                    href={job.vidUrl_04}
                    target='_blank'
                    />
                  )}
                  </Image.Group>
                
              )}
              </Grid.Column>
              <Grid.Column width={3} floated="right" verticalAlign="middle">
                {job.jobStatus !== "created" && (
                  
                    <Button
                      icon
                      color="grey"
                      disabled={true}
                    >
                      <Icon name="upload" />
                    </Button>
                )}
                {job.jobStatus === "created" && (
                    <Button
                      icon
                      color="blue"
                      onClick={() => this.onEditButtonClick(job.jobId)}
                      disabled={false}
                    >
                      <Icon name="upload" />
                    </Button>
                )}
                {job.jobStatus === "image uploaded" && (
                    <Button
                      icon
                      color="green"
                      onClick={() => this.onJobConvert(job.jobId)}
                      disabled={false}
                    >
                      <Icon name="play" />
                    </Button>
                )}
                {job.jobStatus !== "image uploaded" && (
                    <Button
                      icon
                      color="grey"
                      disabled={true}
                    >
                      <Icon name="play" />
                    </Button>
                )}
                  <Button
                    icon
                    color="red"
                    onClick={() => this.onJobDelete(job.jobId)}
                  >
                    <Icon name="delete" />
                  </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      <Grid.Row centered columns={2}>
        <Grid.Column width={16} textAlign="center">
          <Pagination defaultActivePage={1} disabled totalPages={5}/>
        </Grid.Column>
      </Grid.Row>
      </Grid>
    )
  }
}