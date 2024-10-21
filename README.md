Start the docker image
Run local mongodb
[Hint] Install mongodb.mongodb-vscode extension Once docker is running

Install package module
cd frontend
npm i

cd backend
npm i

cd frontend
npm start

cd backend
npm start

On backend require env file
 JWT_SECRET='I+d2B3wZZz8Li7XFYTUX11gT6eA9v0LLLYbed+d7lOWmv+Xd11pJx/ZaNArWmpE6ItlQLC8qfcunFZxQuKq2yQ=='
 JWT_EXPIRES_IN=5
 MONGO_URI=mongodb://localhost:27017/demo