import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import { Line } from "react-chartjs-2";
import Box from "@material-ui/core/Box";
import { Tooltip } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  graphContainer: {
    width: "80%",
    margin: "40px auto 0",
  },
  buttonGroup: {
    width: "150px",
  },
  toggle: {
    marginBottom: "30px",
  },
  disclaimer: {
    marginLeft: "20px",
    marginTop: "20px",
    marginBottom: "30px",
  },
  toggleContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sentiment: {
    display: "flex",
    marginBottom: "30px",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const Graph = (props) => {
  const classes = useStyles();
  const [graphData, setGraphData] = useState({});
  const [sentiment, setSentiment] = useState(null);
  const [timeFrame, setTimeFrame] = useState("oneYear");
  const { stockCode } = props;
  const sentimentTooltip =
    "This score was calculated by sentiment analysis of news articles related to this stock. The higher this score, the more optimistic investors are that the price will rise.";

  useEffect(() => {
    async function getSentimentAnalysis() {
      let priceQuery = await fetch(`/stock/news/sentiment/${stockCode}`);
      let sentiment = await priceQuery.json();
      sentiment && setSentiment(sentiment.bullishPercent);
    }
    getSentimentAnalysis();
  }, [stockCode]);

  useEffect(() => {
    async function getHistoricalPrice() {
      let priceQuery = await fetch(`/stock/hist_data/${stockCode}`);
      let historicalPrice = await priceQuery.json();
      historicalPrice.formattedDate = [];
      historicalPrice.Date.forEach((dates) => {
        historicalPrice.formattedDate.push(
          moment(dates, "DD-MM-YYYY").format("MMM DD YYYY")
        );
      });

      // Alters Graph Data if 6month or 1month options are chosen
      if (timeFrame === "sixMonths") {
        historicalPrice.formattedDate = historicalPrice.formattedDate.splice(
          Math.ceil(historicalPrice.formattedDate.length / 2)
        );
        historicalPrice.Close = historicalPrice.Close.splice(
          Math.ceil(historicalPrice.Close.length / 2)
        );
      }

      if (timeFrame === "oneMonth") {
        historicalPrice.formattedDate = historicalPrice.formattedDate.splice(
          Math.max(historicalPrice.formattedDate.length - 25, 0)
        );
        historicalPrice.Close = historicalPrice.Close.splice(
          Math.max(historicalPrice.Close.length - 25, 0)
        );
      }

      setGraphData(historicalPrice);
    }
    getHistoricalPrice();
  }, [stockCode, timeFrame]);

  const handleAlignment = (event, timeFrame) => {
    if (timeFrame && timeFrame.length) {
      setTimeFrame(timeFrame);
    }
  };

  const data = {
    labels: graphData.formattedDate,
    datasets: [
      {
        label: "Closing Price (USD)",
        data: graphData.Close,
        fill: false,
        lineTension: 0,
        backgroundColor: "lightgreen",
        borderColor: "lightgreen",
      },
    ],
  };

  const options = {
    scales: {
      yAxes: [
        {
          gridLines: {
            display: false,
          },
          ticks: {
            // Include a dollar sign in the ticks
            callback: function (value, index, values) {
              return "$" + value;
            },
          },
        },
      ],
      xAxes: [
        {
          type: "time",
          time: {
            unit: timeFrame === "oneMonth" ? "week" : "month",
          },
        },
      ],
    },
    legend: {
      display: false,
    },
    elements: {
      point: {
        radius: 2,
      },
    },
  };

  return (
    <div className={classes.graphPlaceHolder}>
      <div className={classes.graphContainer}>
        <div className={classes.toggleContainer}>
          <ToggleButtonGroup
            value={timeFrame}
            exclusive
            onChange={handleAlignment}
            aria-label="text alignment"
            className={classes.toggle}
          >
            <ToggleButton
              value="oneMonth"
              aria-label="left aligned"
              className={classes.buttonGroup}
            >
              1 Month
            </ToggleButton>
            <ToggleButton
              value="sixMonths"
              aria-label="centered"
              className={classes.buttonGroup}
            >
              6 Months
            </ToggleButton>
            <ToggleButton
              value="oneYear"
              aria-label="right aligned"
              className={classes.buttonGroup}
            >
              1 Year
            </ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title={sentimentTooltip}>
            <Box
              className={classes.sentiment}
              color="white"
              bgcolor={
                !sentiment
                  ? "gray"
                  : sentiment >= 0.5
                  ? "green"
                  : "red"
              }
              p={1}
              borderRadius={5}
            >
              News Sentiment Bullishness:&nbsp;
              <strong>{sentiment ? `${(sentiment * 100).toFixed(2)}%` : "Calculating"}</strong>
            </Box>
          </Tooltip>
        </div>

        <Line data={data} options={options} />
        <div className={classes.disclaimer}>
          *Due to restrictions with the third-party API, we can only show
          historical data up to a year.
        </div>
      </div>
    </div>
  );
};

export default Graph;
