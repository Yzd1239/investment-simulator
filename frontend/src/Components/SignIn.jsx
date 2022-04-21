import React, { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import Alert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      Investment Simulator {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(2),
  },
  submit: {
    margin: theme.spacing(1, 0, 2),
  },
  error: {
    color: "red",
    verticalAlign: "middle",
    display: "flex",
    marginBottom: "20px",
  },
  icon: {
    marginRight: "10px",
  },
  field: {
    marginTop: "8px",
  },
}));

export default function SignIn(props) {
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [badSignin, setBadSignin] = useState(false);
  const [alertOpen, setAlertOpen] = useState(props.location.state ? props.location.state.afterSignUp : false);

  const classes = useStyles();

  const checkFilledFields = () => {
    return username && password;
  };

  const submitSignIn = () => {
    fetch("auth/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    }).then((response) => {
      if (response.status === 200) {
        response.json().then((json) => {
          props.history.push({
            pathname: "/watchlist",
            state: {
              username: username,
              token: json.token,
            },
          });
        });
        setBadSignin(false);
      } else {
        setBadSignin(true);
      }
    });
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            className={classes.field}
            required
            fullWidth
            id="Username"
            label="Username"
            name="Username"
            autoComplete="Username"
            autoFocus
            onChange={(event) => setUsername(event.target.value)}
            onBlur={(event) => setUsername(event.target.value)}
            error={username === ""}
            helperText={username === "" ? "Please enter a username" : " "}
          />
          <TextField
            variant="outlined"
            margin="normal"
            className={classes.field}
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            onBlur={(event) => setPassword(event.target.value)}
            error={password === ""}
            helperText={password === "" ? "Please enter a password" : " "}
            onKeyDown={e => {if (e.keyCode === 13 && checkFilledFields()) submitSignIn()}}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={!checkFilledFields()}
            onClick={submitSignIn}
          >
            Sign In
          </Button>
          {badSignin && (
            <div className={classes.error}>
              <ErrorOutlineIcon className={classes.icon} />
              Incorrect Username or Password!
            </div>
          )}

          <Grid container>
            <Grid item>
              <Link href="/signup" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
      <Snackbar open={alertOpen}>
        <Alert onClose={() => setAlertOpen(false)} variant="filled">Sign up successful! Please sign in.</Alert>
      </Snackbar>
    </Container>
  );
}
