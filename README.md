# Slack Standup Bot

## Getting Started

In Slack:
- Create a new Custom Integration -> Bot configuration
- Record the API Token and the username you configured
- Invite the bot to a channel in Slack

```sh
> git clone https://github.com/seikho/slack-standup && cd slack-standup

# From the command line:
> yarn
> yarn build
> export SLACK_TOKEN={API TOKEN} yarn start

# Using Docker:
> docker build -t standup .
> docker run -dt --env SLACK_TOKEN={API TOKEN} --name standupbot --restart=always standup
```


To get started with the bot in Slack:
- Message the bot directly with `@username help`
- Or in any channel the bot is in: `@username help`

## License

MIT
