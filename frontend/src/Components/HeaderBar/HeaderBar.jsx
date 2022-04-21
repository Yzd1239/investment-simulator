import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { Link, useHistory } from "react-router-dom";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import { Tooltip } from "@material-ui/core";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor: "black",
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
  infoContainer: {
    marginLeft: "auto",
    display: "flex",
    flexDirection: "row",
  },
  profits: {
    display: "flex",
    marginRight: "30px",
    alignSelf: "flex-end",
    justifyContent: "center",
    textAlign: "center",
    fontFamily: "Helvetica",
    fontSize: "1.15rem",
    cursor: "pointer",
  },
  welcome: {
    marginLeft: "auto",
    fontFamily: "Helvetica",
    fontSize: "1.23rem",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

const HeaderBar = (props) => {
  const {
    username,
    onDrawerOpen,
    onDrawerClose,
    open,
    token,
    title,
    updatedPortfolio,
  } = props;
  const history = useHistory();
  const [totalProfits, setTotalProfits] = useState(0.0);
  const [userFirstName, setuserFirstName] = useState(null);
  const classes = useStyles();
  const theme = useTheme();
  const profitLossTooltip =
    "This is your total profits and losses from stocks that you have sold.";

  useEffect(() => {
    const getUserInfo = () => {
      fetch("/user", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
        .then((response) => {
          if (response.status === 200) return response.json();
          if (response.status === 401) {
            history.push("/signin");
          }
        })
        .then((data) => {
          if (data) {
            let profitLoss = `$${data.realised_pnl.toFixed(2)}`;
            const formattedProfitLoss = profitLoss.replace("$-", "-$");
            setTotalProfits(formattedProfitLoss);
            setuserFirstName(data.first_name);
          }
        });
    };
    getUserInfo();
  }, [props.location, updatedPortfolio, token, history]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => {
              onDrawerOpen();
            }}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            {title}
          </Typography>
          <div className={classes.infoContainer}>
            <Tooltip title={profitLossTooltip}>
              <div className={classes.profits}>
                Realised P&L: {totalProfits}
              </div>
            </Tooltip>
            <div className={classes.welcome}>Welcome {userFirstName}</div>
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton
            onClick={() => {
              onDrawerClose();
            }}
          >
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </div>
        <Divider />
        <List>
          <Link
            to={{
              pathname: "/watchlist",
              state: {
                username: username,
                token: token,
              },
            }}
            style={{ textDecoration: "none", color: "black" }}
          >
            <ListItem button key={"Watchlist"}>
              <ListItemIcon>
                <TrendingUpIcon />
              </ListItemIcon>
              <ListItemText primary={"Watchlist"} />
            </ListItem>
          </Link>
          <Link
            to={{
              pathname: "/portfolio",
              state: {
                username: username,
                token: token,
              },
            }}
            style={{ textDecoration: "none", color: "black" }}
          >
            <ListItem button key={"Portfolio"}>
              <ListItemIcon>
                <AccountBalanceIcon />
              </ListItemIcon>
              <ListItemText primary={"Portfolio"} />
            </ListItem>
          </Link>
          <Link
            to={{
              pathname: "/news",
              state: {
                username: username,
                token: token,
              },
            }}
            style={{ textDecoration: "none", color: "black" }}
          >
            <ListItem button key={"News"}>
              <ListItemIcon>
                <MenuBookIcon />
              </ListItemIcon>
              <ListItemText primary={"News"} />
            </ListItem>
          </Link>
        </List>
        <Divider />
        <List>
          <Link
            to={{
              pathname: "/signin",
            }}
            style={{ textDecoration: "none", color: "black" }}
          >
            <ListItem button key={"Sign Out"}>
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary={"Sign Out"} />
            </ListItem>
          </Link>
        </List>
      </Drawer>
    </div>
  );
};

export default HeaderBar;
