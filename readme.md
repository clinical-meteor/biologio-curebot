## Dave's MS Azure account
https://portal.azure.com
dd@daviddonohue.com

##. View Logs
https://biologio-curebot-upgrade.scm.azurewebsites.net/DebugConsole

## Use Azure app service editor

1. make code change in the online editor

Your code changes go live as the code changes are saved.

## Use Visual Studio Code

### Build and debug
1. download source code zip and extract source in local folder
2. open the source folder in  Visual Studio Code
3. make code changes
4. download and run [botframework-emulator](https://emulator.botframework.com/)
5. connect the emulator to http://localhost:3987

### Publish back

```
npm run azure-publish
```

## Use continuous integration

If you have setup continuous integration, then your bot will automatically deployed when new changes are pushed to the source repository.

```
git push origin master
```

## To Test
```
npm test
```


## Pull conversation values out of 
```
session.message= {
  "type": "message",
  "agent": "botbuilder",
  "address": {
    "channelId": "console",
    "user": {
      "id": "user",
      "name": "User1"
    },
    "bot": {
      "id": "bot",
      "name": "Bot"
    },
    "conversation": {
      "id": "Convo1"
    }
  },
  "source": "console",
  "timestamp": "2018-03-08T02:10:36.414Z",
  "text": "5555555555",
  "user": {
    "id": "user",
    "name": "User1"
  }
}


			{
				"type" : "message",
				"timestamp" : "2018-03-22T02:03:12.254366Z",
				"textFormat" : "plain",
				"text" : "1",
				"textLocale" : "en",
				"sourceEvent" : {
					"clientActivityId" : "1521684174885.5907588439178666.2"
				},
				"attachments" : [ ],
				"entities" : [ ],
				"address" : {
					"id" : "13fdccddc0d748e18211dc4b4e6c84ca|0000002",
					"channelId" : "webchat",
					"user" : {
						"id" : "TpSroKgUJG",
						"name" : "You"
					},
					"conversation" : {
						"id" : "13fdccddc0d748e18211dc4b4e6c84ca"
					},
					"bot" : {
						"id" : "biologio-curebot@MSvcmR0jdbM",
						"name" : "biologio-curebot-bot"
					},
					"serviceUrl" : "https://webchat.botframework.com/"
				},
				"source" : "webchat",
				"agent" : "botbuilder",
				"user" : {
					"id" : "TpSroKgUJG",
					"name" : "You"
				}
			}
		}
	],

```

## Populate session.userData fields for storage:
```
    subject: {
        reference: session.userData.biolog.subject.id
    },
    context: {
        reference: session.userData.biolog.currentQuestion.id,
        display: session.userData.biolog.currentQuestion.text,
    },
```

