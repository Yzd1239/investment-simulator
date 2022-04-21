import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
  spinnerContainer: {
    display: "flex",
    "& > * + *": {
      marginLeft: theme.spacing(2),
    },
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    color: "gray",
    margin: "20px auto",
  },
}));

export default function LoadingSpinner(props) {
  const classes = useStyles();

  return (
    <div className={classes.spinnerContainer}>
      <CircularProgress className={classes.spinner} />
      <div>Loading...</div>
    </div>
  );
}
