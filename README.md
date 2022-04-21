# capstone-project-comp9900-h14a-runtime-terror

## Deployment instructions
### Dependencies

You will need to have the following installed on your local machine before executing the deployment instructions:

 | Dependencies |
 | ------------ |
 |[Python 3](https://wiki.python.org/moin/BeginnersGuide/Download) |
 |[Node.js](https://nodejs.org/en/download/) |
 
 Please ensure you have 1.5GB free disk-space before running this project.

### Back End

Run the following script:

```
$ ./run_backend.sh
```

You can now see and explore the Swagger docs for the API by going to http://127.0.0.1:65000/ in your browser.

### Front End

First, make sure the Back End is already running by following the above instructions.

Then, in a new terminal, run the following script:

```
$ ./run_frontend.sh
```

The app should automatically run in the browser. If not, open http://localhost:63000/ in the browser to view the app.

