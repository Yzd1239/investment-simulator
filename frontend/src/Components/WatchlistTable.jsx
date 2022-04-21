import React, { useState, useEffect } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import DeleteIcon from "@material-ui/icons/Delete";
import LoadingSpinner from "./LoadingSpinner";
import { Button } from "@material-ui/core";
import { Link } from "react-router-dom";

import { makeStyles, withStyles } from "@material-ui/core/styles";

const StyledButton = withStyles({
  root: {
    background: "green",
    borderRadius: 3,
    border: 0,
    color: "white",
    height: 48,
    padding: "0 30px",
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
  },
})(Button);

const StyledTableCell = withStyles((theme) => ({
  head: {
    fontWeight: "600",
  },
  body: {
    fontSize: 14,
    fontWeight: "600",
  },
}))(TableCell);

const useStyles = makeStyles((theme) => ({
  delete: {
    "&:hover, &:focus": {
      cursor: "pointer",
    },
    zIndex: "1000",
  },
  tableRow: {
    "&:hover, &:focus": {
      cursor: "pointer",
    },
  },
  green: {
    color: "green",
  },
  red: {
    color: "red",
  },
  table: {
    minWidth: 650,
  },
  tableHeader: {
    fontWeight: "600",
  },
}));

const WatchlistTable = (props) => {
  const classes = useStyles();
  const {
    watchlistUpdated,
    token,
    toggleWatchlistFalse,
    handleModalOpen,
    username,
  } = props;
  const [watchlistData, setWatchlistData] = useState(null);
  const [deletedStockCheck, setDeletedStockCheck] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pass token into an API call for the stock info
  const getWatchlist = () => {
    fetch("/watchlist", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => {
        if (response.status === 429)
          alert("API limit reached. Please try again in one minute");
        if (response.status === 200) return response.json();
      })
      .then((data) => {
        setWatchlistData(data);
        toggleWatchlistFalse();
        setLoading(false);
      });
  };

  const deleteStock = (symbol) => {
    fetch("/watchlist", {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        symbol: symbol,
      }),
    }).then((response) => {
      if (response.status === 200) {
        setDeletedStockCheck(true);
      }
    });
  };

  useEffect(() => {
    getWatchlist();
    setDeletedStockCheck(false);
  }, [watchlistUpdated, deletedStockCheck]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <StyledTableCell align="center">Stock Code</StyledTableCell>
            <StyledTableCell>Stock Name</StyledTableCell>
            <StyledTableCell align="center">Current Price&nbsp;(USD)</StyledTableCell>
            <StyledTableCell align="center">High&nbsp;(USD)</StyledTableCell>
            <StyledTableCell align="center">Low&nbsp;(USD)</StyledTableCell>
            <StyledTableCell align="center">Change&nbsp;(%)</StyledTableCell>
            <StyledTableCell align="center">Buy</StyledTableCell>
            <StyledTableCell align="center">Remove</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {watchlistData &&
            watchlistData.map((data) => (
              <TableRow
                className={classes.tableRow}
                key={data.symbol}
                hover={true}
              >
                <TableCell component="th" align="center">
                  {data.symbol}
                </TableCell>
                <TableCell
                  component={Link}
                  to={{
                    pathname: `/news/${data.symbol}`,
                    state: {
                      username: username,
                      token: token,
                    },
                  }}
                  style={{ textDecoration: "none" }}
                >
                  {data.name}
                </TableCell>
                <TableCell
                  className={
                    data.percentage_change > 0 ? classes.green : classes.red
                  }
                  align="center"
                  component={Link}
                  to={{
                    pathname: `/news/${data.symbol}`,
                    state: {
                      username: username,
                      token: token,
                    },
                  }}
                  style={{ textDecoration: "none" }}
                >
                  $
                  {data.current_price
                    .toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </TableCell>
                <TableCell
                  className={
                    data.percentage_change > 0 ? classes.green : classes.red
                  }
                  align="center"
                  component={Link}
                  to={{
                    pathname: `/news/${data.symbol}`,
                    state: {
                      username: username,
                      token: token,
                    },
                  }}
                  style={{ textDecoration: "none" }}
                >
                  ${data.high.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </TableCell>
                <TableCell
                  className={
                    data.percentage_change > 0 ? classes.green : classes.red
                  }
                  align="center"
                  component={Link}
                  to={{
                    pathname: `/news/${data.symbol}`,
                    state: {
                      username: username,
                      token: token,
                    },
                  }}
                  style={{ textDecoration: "none" }}
                >
                  ${data.low.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </TableCell>
                <TableCell
                  className={
                    data.percentage_change > 0 ? classes.green : classes.red
                  }
                  align="center"
                  component={Link}
                  to={{
                    pathname: `/news/${data.symbol}`,
                    state: {
                      username: username,
                      token: token,
                    },
                  }}
                  style={{ textDecoration: "none" }}
                >
                  {data.percentage_change.toFixed(2)}%
                </TableCell>
                <TableCell id="buy-cell" align="center">
                  <StyledButton
                    variant="contained"
                    id="buy-cell"
                    className={classes.button}
                    size="small"
                    onClick={() =>
                      handleModalOpen(data.symbol, data.current_price)
                    }
                  >
                    Buy
                  </StyledButton>
                </TableCell>
                <TableCell id="delete-cell" align="center">
                  <DeleteIcon
                    id="delete-cell"
                    className={classes.delete}
                    onClick={() => deleteStock(data.symbol)}
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {loading && <LoadingSpinner />}
    </TableContainer>
  );
};

export default WatchlistTable;
