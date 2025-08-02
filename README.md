## install backend
python3 -m venv venv
pip install -r requirements.txt

# install frontend
npm i

# run
npm start
uvicorn app:app --reload