# With Watson Socket.io ChatBot Example

## Overview

This app consist of a server and a client component.  The app showcase a number of different technologies and approaches.

- How to use Socket.io with Loopback (server) and Angular 5 (client)
- How to use Web Socket communication instead of http to communicate with the server
- How to build your Watson Assistant workspace to handle socket communication that is none-blocking
- How to build a Watson Assistant workspace that maintain context in a conversation

You would need a Watson Assistant Service and a Weather API Service.

## Cloud Setup

1. Create a Cloud Foundry application
2. Create a Watson Assistant Service
3. Create a Weather API Service
4. Connect the Assistant and Weather services to the application

In the Watson Assistant tooling for the newly created Watson Assistance Service Instance;
1. Import the provided Assistant Workspace, located in the assistant directly, into your own service instance

Switch to the local directory where you downloaded this code to;
1. Edit the manifest.yml file
2. Rename the application to something unique and save the changes
3. Rename the env-vars.example.json file to env-vars.json
4. Edit the env-vars.json file
5. Copy the Watson Assistant Workspace ID into the value of the `ASSISTANT_WORKSPACE_ID` property
6. Save the file.
7. Ensure you are connected to the correct account and space in IBM Cloud
8. Run `cf push`

Once the app is succeffully deployed, access the chatbot with the application url.

## Running the app locally (Do the Cloud setup first)

1. In the Cloud Console, navigate to the Application that was created.
2. Select `Connections` from the left hand menu.
3. For each of the connected services, select the 3 dots on the right and View the Credentials.
4. Copy the Assistant Username and Password and paste it into the vcap-local.example.json file.
5. Copy the Weather API Username and Password and paste it into the vcap-local.json file.
6. Rename the vcap-local.example.json file to vcap-local.json file.
7. Run `npm install` from the application root folder.
8. Run `npm run develop` to run the application and load the app into the browser.

### The default Username is `guest` and the password is `p@ssw0rd`

## Testing

Note:  There is an intentional delay built into the code to prove some scenarios.

1. Normal conversation

Ask the chatbot the following;
- What is the weather like?
- Specify a city

2. Change in context

Ask the chatbot the following;
- What is the weather like in Denver? (Wait for the answer)
- What about tomorrow (Don't specify a location again.  Context will be maintained as Denver)
- What about rain? (Denver and tomorrow will be maintained in the context)

3. Multitasking

Ask the chatbot the following;
- What is the weather like in Denver? (Don't wait for an answer)
- What about Chicago (Now, wait for the answers.  Both Denver and Chicago weather will be returned.  SOCKETS!!!!)

