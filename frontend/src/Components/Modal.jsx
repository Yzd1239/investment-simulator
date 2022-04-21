import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Input from "@material-ui/core/Input";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";

const StyledButton = withStyles({
  root: {
    background: "green",
    borderRadius: 3,
    border: 0,
    color: "white",
    height: 48,
    padding: "0 30px",
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
    margin: "10px auto",
  },
})(Button);

const SellStyledButton = withStyles({
  root: {
    background: "red",
    borderRadius: 3,
    border: 0,
    color: "white",
    height: 48,
    padding: "0 30px",
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
    margin: "10px auto",
  },
})(Button);

const useStyles = makeStyles((theme) => ({
  error: {
    color: "red",
    verticalAlign: "middle",
    display: "flex",
    margin: "20px 0px",
  },
  icon: {
    marginRight: "10px",
  },
}));

export default function Modal(props) {
  const {
    title,
    token,
    modalOpen,
    modalCode,
    modalPrice,
    handleModalClose,
    modalTotalUnits,
  } = props;
  const classes = useStyles();
  const [quantity, setQuantity] = useState(null);
  const [quantityExceeded, setQuantityExceeded] = useState(false);

  const buyStock = (symbol, quantity) => {
    fetch("/portfolio/buy", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        symbol: symbol,
        quantity: quantity,
      }),
    }).then((response) => {
      if (response.status === 429)
        alert("API limit reached. Please try again in one minute");
      if (response.status === 200) {
        setQuantity(null);
        handleModalClose();
      }
      if (response.status === 400) {
        setQuantityExceeded(true);
      }
    });
  };

  const sellStock = (symbol, quantity) => {
    fetch("/portfolio/sell", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        symbol: symbol,
        quantity: quantity,
      }),
    }).then((response) => {
      if (response.status === 429)
        alert("API limit reached. Please try again in one minute");
      if (response.status === 200) {
        setQuantity(null);
        handleModalClose();
      }
      if (response.status === 400) {
        setQuantityExceeded(true);
      }
    });
  };

  return (
    <div>
      <Dialog
        open={modalOpen}
        onClose={() => handleModalClose()}
        aria-labelledby="form-dialog-title"
        maxWidth="xs"
      >
        <DialogTitle id="form-dialog-title">
          {title} {modalCode} Stocks
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please input the quantity of <strong>{modalCode}</strong> stocks you
            would like to {title} at{" "}
            <strong>${modalPrice && modalPrice.toFixed(2)}</strong> each
          </DialogContentText>
          <h4>Quantity</h4>
          <Input
            autoFocus
            type="number"
            margin="dense"
            id="quantity-input"
            label="Quantity"
            inputProps={{
              min: "0",
              pattern: "[0-9]{10}",
              max: `${modalTotalUnits}`,
            }}
            onKeyDown={(e) => {
              if (e.keyCode === 190) e.preventDefault();
            }}
            fullWidth
            onChange={(event) => setQuantity(event.target.value)}
          />
          <h4>Value</h4>
          <p>${(quantity * modalPrice).toFixed(2)}</p>
          {quantityExceeded && (
            <div className={classes.error}>
              <ErrorOutlineIcon className={classes.icon} />
              Quantity Exceeded!
            </div>
          )}
        </DialogContent>
        <DialogActions>
          {title === "Buy" && (
            <StyledButton
              variant="contained"
              size="small"
              disabled={quantity <= 0}
              onClick={() => buyStock(modalCode, parseInt(quantity))}
            >
              Buy
            </StyledButton>
          )}
          {title === "Sell" && (
            <SellStyledButton
              variant="contained"
              size="small"
              disabled={quantity <= 0}
              onClick={() => sellStock(modalCode, parseInt(quantity))}
            >
              Sell
            </SellStyledButton>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
