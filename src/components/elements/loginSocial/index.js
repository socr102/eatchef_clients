import React from 'react';
import { connect } from 'react-redux';
import { ButtonLogin } from '@/components/elements/button';
import {
  loginViaFacebook,
  loginViaGoogle,
} from '@/utils/authSocial';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import classes from "./loginSocial.module.scss";

function LoginSocial (props) {

  return (
    <div>
      <ArrowBackIcon
        style={{
          color: '#fff',
          fontSize: 36,
          cursor: 'pointer',
          marginLeft: '33px'
        }}
        onClick={props.onClickReturn}
      />
      <h2 className={classes.registerTitle}>LOGIN</h2>
      <ButtonLogin onClick={loginViaFacebook()}>LOGIN WITH FACEBOOK</ButtonLogin>
      <ButtonLogin onClick={loginViaGoogle()}>LOGIN WITH GOOGLE</ButtonLogin>
    </div>
  );
}

export default connect()(LoginSocial);
