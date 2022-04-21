#!/bin/sh

cd frontend
npm install
export PORT=63000
export BROWSER=chromium
npm start
