import * as React from 'react'
import { Redirect } from 'react-router'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile } from '../api/jobs-api'
import {
  Button,
  Form,
  Header,
  Icon,
  Segment
} from 'semantic-ui-react'
enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditJobProps {
  match: {
    params: {
      jobId: string
    }
  }
  auth: Auth
}

interface EditJobState {
  file: any
  uploadState: UploadState
  fireRedirect: boolean
}

export class EditJob extends React.PureComponent<
  EditJobProps,
  EditJobState
> {
  state: EditJobState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    fireRedirect: false
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.jobId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)
      alert('File was uploaded!')
      this.setState({ fireRedirect: true })
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    const { fireRedirect } = this.state
    return (
      <Segment placeholder>
        <Header icon>
          <Icon name='upload' />
          Upload New Image
        </Header>
        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Select an Image File</label>
            <input
              type="file"
              accept="image/jpg"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>
          {this.renderButton()}
        </Form>
        {fireRedirect && (
          <Redirect to={'/'}/>
        )}
      </Segment>
      
    )
  }
  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}