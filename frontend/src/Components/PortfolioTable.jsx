import React, { useState, useEffect } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { Button } from "@material-ui/core";
import LoadingSpinner from "./LoadingSpinner";
import { Link } from "react-router-dom";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { Tooltip } from "@material-ui/core";

const StyledButton = withStyles({
  root: {
    background: "red",
    borderRadius: 3,
    border: 0,
    color: "white",
    height: 48,
    padding: "0 30px",
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
  },
})(Button);

const StyledTableCell = withStyles(() => ({
  head: {
    fontWeight: "600",
  },
  body: {
    fontSize: 14,
    fontWeight: "600",
  },
}))(TableCell);

const useStyles = makeStyles(() => ({
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
  totals: {
    fontWeight: "bold",
  },
}));

const PortfolioTable = (props) => {
  const classes = useStyles();
  const {
    token,
    updatedPortfolio,
    handleModalOpen,
    handleGetUpdatedPortfolio,
    username,
  } = props;
  const [portfolioData, setPortfolioData] = useState(null);
  const [sumProfitLoss, setSumProfitLoss] = useState(null);
  const [sumMarketValue, setSumMarketValue] = useState(null);
  const [sumTotalPaid, setSumTotalPaid] = useState(null);
  const [loading, setLoading] = useState(true);

  const getPortfolio = () => {
    fetch("/portfolio", {
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
        setPortfolioData(data);
        let sumPnl = 0,
          sumMarketValue = 0,
          sumTotalPaid = 0;
        data.forEach((value) => {
          sumPnl += value.total_pnl;
          sumMarketValue += value.total_current_worth;
          sumTotalPaid += value.total_paid;
        });
        setSumProfitLoss(sumPnl);
        setSumMarketValue(sumMarketValue);
        setSumTotalPaid(sumTotalPaid);
        setLoading(false);
      });
  };

  // Need to update
  useEffect(() => {
    getPortfolio();
    handleGetUpdatedPortfolio();
  }, [updatedPortfolio]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <StyledTableCell align="center">Stock Code</StyledTableCell>
            <StyledTableCell>Stock Name</StyledTableCell>
            <Tooltip title="Total amount of shares owned">
              <StyledTableCell align="center">Available Units</StyledTableCell>
            </Tooltip>
            <Tooltip title="Current price of EACH holding">
              <StyledTableCell align="center">
                Current Price&nbsp;(USD)
              </StyledTableCell>
            </Tooltip>
            <Tooltip title="Average amount paid for EACH holding">
              <StyledTableCell align="center">
                Average Purchase Price&nbsp;(USD)
              </StyledTableCell>
            </Tooltip>
            <Tooltip title="Total amount paid for ALL holdings">
              <StyledTableCell align="center">
                Total Paid&nbsp;(USD)
              </StyledTableCell>
            </Tooltip>
            <Tooltip title="Total current value of ALL holdings">
              <StyledTableCell align="center">
                Market Value&nbsp;(USD)
              </StyledTableCell>
            </Tooltip>
            <Tooltip title="Total profit or loss if ALL holdings are sold">
              <StyledTableCell align="center">
                Profit/Loss&nbsp;(USD)
              </StyledTableCell>
            </Tooltip>
            <StyledTableCell align="center">Sell</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {portfolioData &&
            portfolioData.map((data) => {
              const total_profit_loss = `$${data.total_pnl.toFixed(2)}`;
              const formatted_pnl = total_profit_loss.replace("$-", "-$");
              return (
                <TableRow
                  className={classes.tableRow}
                  key={data.symbol}
                  hover={true}
                >
                  <TableCell
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
                    {data.total_units}
                  </TableCell>
                  <TableCell
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
                    {data.average_price
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </TableCell>
                  <TableCell
                    className={
                      data.total_pnl.toFixed(1) === 0.0
                        ? classes.black
                        : data.total_pnl < 0
                        ? classes.red
                        : classes.green
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
                    {data.total_paid
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </TableCell>
                  <TableCell
                    className={
                      data.total_pnl.toFixed(1) === 0.0
                        ? classes.black
                        : data.total_pnl < 0
                        ? classes.red
                        : classes.green
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
                    {data.total_current_worth
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </TableCell>
                  <TableCell
                    className={
                      data.total_pnl.toFixed(1) === 0.0
                        ? classes.black
                        : data.total_pnl < 0
                        ? classes.red
                        : classes.green
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
                    {formatted_pnl.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </TableCell>
                  <TableCell id="delete-cell" align="center">
                    <StyledButton
                      variant="contained"
                      className={classes.button}
                      size="small"
                      onClick={() =>
                        handleModalOpen(
                          data.symbol,
                          data.current_price,
                          data.total_units
                        )
                      }
                    >
                      Sell
                    </StyledButton>
                  </TableCell>
                </TableRow>
              );
            })}
          {!loading && (
            <TableRow className={classes.totals}>
              <TableCell colSpan={4} />
              <TableCell colSpan={1} align="center">
                <strong>Total</strong>
              </TableCell>
              <TableCell
                className={
                  sumProfitLoss === 0.0
                    ? classes.black
                    : sumMarketValue < sumTotalPaid
                    ? classes.red
                    : classes.green
                }
                align="center"
                colSpan={1}
              >
                <strong>
                  {sumTotalPaid >= 0 &&
                    `$${sumTotalPaid
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
                </strong>
              </TableCell>
              <TableCell
                className={
                  sumProfitLoss === 0.0
                    ? classes.black
                    : sumMarketValue < sumTotalPaid
                    ? classes.red
                    : classes.green
                }
                align="center"
              >
                <strong>
                  {sumMarketValue >= 0 &&
                    `$${sumMarketValue
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
                </strong>
              </TableCell>
              <TableCell
                className={
                  sumProfitLoss === 0.0
                    ? classes.black
                    : sumProfitLoss < 0
                    ? classes.red
                    : classes.green
                }
                align="center"
              >
                <strong>
                  {sumProfitLoss < 0 &&
                    sumProfitLoss
                      .toFixed(2)
                      .replace("-", "-$")
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  {sumProfitLoss >= 0 &&
                    `$${sumProfitLoss
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
                </strong>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {loading && <LoadingSpinner />}
    </TableContainer>
  );
};

export default PortfolioTable;
