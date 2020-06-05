import * as React from 'react'
import Auth from '../auth/Auth'
//import { Button } from 'semantic-ui-react'

import SignInSide from './SignInSide'

interface LogInProps {
  auth: Auth
}

interface LogInState {}

export class LogIn extends React.PureComponent<LogInProps, LogInState> {
  onLogin = () => {
    this.props.auth.login()
  }
  render() {
    return (
      // OLD STYLE
      /* <div>
        <h1>Please log in</h1>

        <Button onClick={this.onLogin} size="huge" color="olive">
          Log in
        </Button>
      </div> */
      <SignInSide onClickHandler={this.onLogin}/>
    )
  }
}


