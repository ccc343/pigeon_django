import React from 'react';
import ReactDOM from 'react-dom';
import {go} from '../router/router';
import actions from '../actions/userActions';

class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null
    };

    this.submit = this.submit.bind(this);
  }

  submit() {
    const email = ReactDOM.findDOMNode(this.refs.email);
    actions.login(email.value, (err) => {
      email.focus();
      this.setState({ error: err });
    });
  }

  render() {
    return (
      <div className="row">
        <div className="span4 offset4">
          <p className="text-red">{this.state.error}</p>
          <div className="btn btn-primary">
            <a href="/auth/google">Sign in with Google</a>
          </div>
          <p>
            No account?&nbsp;
            <span onClick={() => go('/signup')}><a>Sign up</a></span>
            &nbsp;for free!
          </p>
        </div>
      </div>
    );
  }
}

export default Login;
