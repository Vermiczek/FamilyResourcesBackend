# FamilyResourcesBackend
Simple API for authentication and family finances management. 

Recruitment task. To run the project the "npm i" command should do most of the work. It will also be neccessary to connect the MongoDB database by changing the .env file - just connect the database and all the collections should be created by itself thanks to Mongoose. I've left the request commands file "test.http" with the requests I've made to test the app, they might prove useful when checking whether the app works.The app contains JWT based authentication, although without the refresh token - I haven't managed to implement it in time so I scrapped it so there were no trash code.I've checked and this app for some reason will not work on Windows while it works flawlessly on Linux. Probably has something to do with my packages being badly configured on my windows, but this is not the first time something like this happens so I don't really know yet, I just hope it will work for whoever is checking this.

unfinished front end: https://github.com/Vermiczek/FamilyResourcesFrontend
