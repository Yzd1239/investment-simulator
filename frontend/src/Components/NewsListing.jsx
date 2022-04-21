import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  listContainer: {
    width: "90%",
    margin: "20px auto",
  },
  trending: {
    marginTop: "60px",
    marginBottom: "40px",
  },
  newsContainer: {
    display: "flex",
    flexDirection: "row",
    minHeight: "200px",
    margin: "20px 0px",
  },
  buttonGroup: {
    width: "150px",
  },
  toggle: {
    marginBottom: "30px",
  },
  image: {
    width: "20%",
    borderRadius: "15px",
    marginRight: "5%",
  },
  newsTitle: {
    marginTop: "0px",
    marginBottom: "10px",
  },
  date: {
    color: "Gray",
    fontWeight: "bold",
    marginBottom: "10px",
  },
}));

const NewsListing = (props) => {
  const classes = useStyles();
  const { stockCode } = props;
  const [newsList, setNewsList] = useState(null);

  useEffect(() => {
    async function getNewsList() {
      let newsQuery = await fetch(`/stock/news/${stockCode}`);
      let newsObject = await newsQuery.json();
      setNewsList(newsObject.slice(0, 5));
    }
    getNewsList();
  }, [stockCode]);

  return (
    <div className={classes.listContainer}>
      <h3 className={classes.trending}> Trending Articles</h3>
      {newsList &&
        newsList.map((news) => {
          const rawDate = new Date(news.publishedAt);
          return (
            <div className={classes.newsContainer}>
              <img className={classes.image} src={news.urlToImage} alt={news.title}></img>
              <div className={classes.textContainer}>
                <h3 className={classes.newsTitle}>
                  <a href={news.url} target="_blank" rel="noreferrer">
                    {news.title}
                  </a>
                </h3>

                <div className={classes.date}>{rawDate.toLocaleString()}</div>
                <div className={classes.description}>{news.description}</div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default NewsListing;
