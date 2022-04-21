import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { Autocomplete } from "@material-ui/lab";
import TextField from "@material-ui/core/TextField";
import { HeaderBar, ErrorPage, Graph, Newslisting } from "../../Components";
import { Button } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import { Link } from "react-router-dom";

const drawerWidth = 240;

const StyledButton = withStyles({
  root: {
    borderRadius: 3,
    border: 0,
    color: "white",
    height: 48,
    padding: "0 30px",
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
  },
})(Button);

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  disabledButton: {
    backgroundColor: "gray",
    marginBottom: "50px",
  },
  button: {
    background:
      "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(35,81,91,1) 100%)",
    marginBottom: "50px",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
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

const NewsPage = (props) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  // Stock variables for stock search function
  const [stockList, setStockList] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const stockSymbol = selectedStock ? selectedStock.symbol : "";

  // Stock variable from URL used to make API calls
  const pathname = props.location.pathname;
  const searchStockSymbol = pathname.substring(pathname.lastIndexOf("/") + 1);

  const token = props.location.state ? props.location.state.token : false;
  const username = props.location.state ? props.location.state.username : null;

  const defaultProps = {
    options: stockList,
    getOptionLabel: (option) => option.label,
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const selectStock = (event, values) => {
    setSelectedStock(values);
  };

  // Getting stock names for search function
  useEffect(() => {
    async function getStocks() {
      let stockQuery = await fetch(`/stock`);
      let stocks = await stockQuery.json();
      stocks.forEach((stockObject) => {
        stockObject.label = `${stockObject.symbol}: ${stockObject.name}`;
      });
      setStockList(stocks);
    }
    getStocks();
  }, []);

  return (
    <>
      {token && (
        <div className={classes.root}>
          <HeaderBar
            username={username}
            onDrawerOpen={handleDrawerOpen}
            onDrawerClose={handleDrawerClose}
            open={open}
            token={token}
            title="News and Charts"
          />
          <main
            className={clsx(classes.content, {
              [classes.contentShift]: open,
            })}
          >
            <div className={classes.drawerHeader} />
            <Autocomplete
              {...defaultProps}
              id="select-on-focus"
              selectOnFocus
              onChange={selectStock}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={"Select S&P500 Stock Code"}
                  margin="normal"
                />
              )}
            />
            <StyledButton
              disabled={!selectedStock}
              variant="contained"
              className={
                !selectedStock ? classes.disabledButton : classes.button
              }
              endIcon={<SearchIcon />}
              size="small"
              onClick={() => setSelectedStock(null)}
              component={Link}
              to={{
                pathname: `/news/${stockSymbol}`,
                state: {
                  username: username,
                  token: token,
                },
              }}
              style={{ textDecoration: "none" }}
            >
              Search for {stockSymbol} News
            </StyledButton>
            {searchStockSymbol !== "news" && (
              <>
                <h2>{searchStockSymbol} News and Chart</h2>
                <Graph stockCode={searchStockSymbol} />
                <Newslisting stockCode={searchStockSymbol} />
              </>
            )}
          </main>
        </div>
      )}
      {!token && <ErrorPage />}
    </>
  );
};

export default NewsPage;
