import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { PortfolioTable, HeaderBar, ErrorPage, Modal } from "../../Components";

const drawerWidth = 240;

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
}));

const Portfolio = (props) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCode, setModalCode] = useState(null);
  const [modalPrice, setModalPrice] = useState(null);
  const [modalTotalUnits, setModalTotalUnits] = useState(null);
  const [updatedPortfolio, setUpdatedPortfolio] = useState(false);
  const token = props.location.state ? props.location.state.token : false;
  const username = props.location.state ? props.location.state.username : null;
  const [firstName, setFirstName] = useState(null);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleModalOpen = (symbol, price, totalUnits) => {
    setModalOpen(true);
    setModalCode(symbol);
    setModalPrice(price);
    setModalTotalUnits(totalUnits);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setUpdatedPortfolio(true);
  };

  const handleGetUpdatedPortfolio = () => {
    setUpdatedPortfolio(false);
  };

  // Getting stock names for search function
  useEffect(() => {
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
  }, [token]);

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
            title="Portfolio"
            updatedPortfolio={updatedPortfolio}
          />
          <main
            className={clsx(classes.content, {
              [classes.contentShift]: open,
            })}
          >
            <div className={classes.drawerHeader} />
            <h2>{firstName}'s Portfolio</h2>
            <PortfolioTable
              token={token}
              handleModalOpen={handleModalOpen}
              updatedPortfolio={updatedPortfolio}
              handleGetUpdatedPortfolio={handleGetUpdatedPortfolio}
              username={username}
            />
            <Modal
              title="Sell"
              modalOpen={modalOpen}
              modalCode={modalCode}
              modalPrice={modalPrice}
              handleModalClose={handleModalClose}
              modalTotalUnits={modalTotalUnits}
              token={token}
            />
          </main>
        </div>
      )}
      {!token && <ErrorPage />}
    </>
  );
};

export default Portfolio;
