# Travel Companion Server

## Set up

Complete the following steps to start a new project (NEW-PROJECT-NAME):

1. Clone this repository to your local machine `git clone SERVER-URL  NEW-PROJECTS-NAME`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Create an Environment file to `.env` that will be ignored by git and read by the express server
6. Edit the contents of the `package.json` to use NEW-PROJECT-NAME instead of `"name": "express-boilerplate",`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for development, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push this remote's master branch.

##Endpoints
The /api/users endpoint is used for registering new users
The /api/auth/login endpoint is for existing users to login
The /api/list endpoint is for a logged in user to create and maintain their packing list
The /api/travel endpoint is for a logged in user to create and maintain their transportation information