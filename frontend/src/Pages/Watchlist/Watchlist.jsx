import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { fade, makeStyles, withStyles } from "@material-ui/core/styles";
import { Autocomplete } from "@material-ui/lab";
import TextField from "@material-ui/core/TextField";
import { WatchlistTable, HeaderBar, ErrorPage, Modal } from "../../Components";
import { Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";

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
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.85),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    display: "flex",
    flexDirection: "row",
  },
  disabledButton: {
    marginBottom: "50px",
  },
  button: {
    background:
      "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(35,81,91,1) 100%)",
    marginBottom: "50px",
  },
  table: {
    minWidth: 650,
  },
  tableHeader: {
    fontWeight: "600",
  },
}));

const Watchlist = (props) => {
  const classes = useStyles();
  const [stockList, setStockList] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [watchlistUpdated, setwatchlistUpdated] = useState(false);
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCode, setModalCode] = useState(null);
  const [modalPrice, setModalPrice] = useState(null);
  const token = props.location.state ? props.location.state.token : false;
  const username = props.location.state ? props.location.state.username : null;
  const [firstName, setFirstName] = useState(null);

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

  const toggleWatchlistFalse = () => {
    setwatchlistUpdated(false);
  };

  const handleModalOpen = (symbol, price) => {
    setModalOpen(true);
    setModalCode(symbol);
    setModalPrice(price);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const selectStock = (event, values) => {
    setSelectedStock(values);
  };

  // Getting stock names for search function
  useEffect(() => {
    async function getStocks() {
      let stockQuery = await fetch(`/stock`);
      let stocks = await stockQuery.json();
      stocks.map(
        (stockObject) =>
          (stockObject.label = `${stockObject.symbol}: ${stockObject.name}`)
      );
      setStockList(stocks);
    }
    async function getUserInfo() {
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
        })
        .then((data) => {
          data && setFirstName(data.first_name);
        });
    }
    getUserInfo();
    getStocks();
  }, [token]);

  // Post to backend
  const addToWatchlist = () => {
    fetch("/watchlist", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        symbol: selectedStock.symbol,
      }),
    }).then((response) => {
      if (response.status === 403) {
        alert(
          "You have hit the limit of 30 stocks in a watchlist. Please remove stocks to add more"
        );
      }
      if (response.status === 201) {
        setwatchlistUpdated(true);
      }
    });
  };

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
            title="Watchlist"
          />
          <main
            className={clsx(classes.content, {
              [classes.contentShift]: open,
            })}
          >
            <div className={classes.drawerHeader} />
            <h2>Search</h2>
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
              startIcon={<AddIcon />}
              size="small"
              onClick={addToWatchlist}
            >
              Add {selectedStock && selectedStock.symbol} to Watchlist
            </StyledButton>
            <h2>{firstName}'s Watchlist</h2>
            <WatchlistTable
              watchlistUpdated={watchlistUpdated}
              toggleWatchlistFalse={toggleWatchlistFalse}
              handleModalOpen={handleModalOpen}
              token={token}
              username={username}
            />
            <Modal
              title="Buy"
              modalOpen={modalOpen}
              modalCode={modalCode}
              modalPrice={modalPrice}
              handleModalClose={handleModalClose}
              token={token}
            />
          </main>
        </div>
      )}
      {!token && <ErrorPage />}
    </>
  );
};

export default Watchlist;
