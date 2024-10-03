@echo off
python -m venv .env

call .env\Scripts\activate.bat

pip install flask

python server.py
