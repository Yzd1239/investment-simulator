#!/bin/sh

if [ ! -d "venv" ]
then
    python3 -m venv venv
fi

source venv/bin/activate

pip install --upgrade pip
pip install wheel
pip install -r requirements.txt
cd backend
python create_db.py
export FLASK_APP=investment_simulator.py
export FLASK_RUN_PORT=65000
python -m flask run
