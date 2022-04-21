Before proceeding, please ensure that you have at least 1.5GB free disk quota on your CSE account and that ports 63000 and 65000 are not in use.

========
Back End
========

Run the following script:

$ ./run_backend.sh

You can now see and explore the Swagger docs for the API by going to http://127.0.0.1:65000/ in your browser.


=========
Front End
=========

First, make sure the Back End is already running by following the above instructions.

Then, in a new terminal, run the following script:

$ ./run_frontend.sh

The app should automatically run in the browser. If not, open http://localhost:63000/ in the browser to view the app.