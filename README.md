# Random Nonsense Generator

A Telegram bot to generate messages using Markov chains

## Preparation

### Creating a bot on Telegram

Creating a bot is done through [@BotFather](https://t.me/BotFather). See the [official documentation](https://core.telegram.org/bots/features#creating-a-new-bot) for more details.

> [!IMPORTANT]  
> [Privacy mode](https://core.telegram.org/bots/features#privacy-mode) has to be disabled so that the bot can store user messages to generate its replies from.

#### Setting bot commands

1. Send `/setcommands` to [@BotFather](https://t.me/BotFather).
2. Select this bot.
3. Enter the commands that are registered in the bot (using `bot.command()`):

   > settings - Adjust bot settings  
   > stats - View stats about the bot's activity in your group

> [!IMPORTANT]  
> Make sure to do the steps above, otherwise users won't be able to configure the bot's settings.

### Project installation

1. Install dependencies:

   ```sh
   yarn install
   ```

2. Add the database URL and your bot token from BotFather to the `.env` file in the project directory:

   ```properties
   DATABASE_URL="file:database/store.db"
   TOKEN=<insert your Telegram bot token here>
   ```

## Development

1. Follow the steps in the [Project installation](#project-installation) section.
2. Start the bot in development mode:

   ```sh
   yarn run dev
   ```

### Generating migrations for production

```sh
yarn run generate-migrations
```

> [!IMPORTANT]
> Make sure to run the command above before every deployment.

## Deployment

_Follow the steps below in the deployment environment._

1. Follow the steps in the [Project installation](#project-installation) section.
2. Build the bot:

   ```sh
   yarn run build
   ```

3. Run `build/index.js` using your preferred method. (For example, to run with Node.js: `node --enable-source-maps build/index.js`)

## Usage

### Adding the bot to your group

The process of adding the bot user is the same as adding any other user.

### Generating messages

By default, the bot replies with a generated message when it is **@mention**ed.

For more information on how to adjust reply settings see [Bot configuration](#bot-configuration).

### Bot configuration

Send `/settings` in the group chat to access the bot's settings menu and configure its settings for that group.

#### Options

- **Reply on mention:** Reply when the bot is mentioned.
- **Reply randomly:** Send a message when the number of messages sent in the group reaches a certain amount since the bot's last message.
- **Admin-only settings:** Allow setting changes only by group admins.
- **Admin-only bot commands:** Allow the bot's commands to be used only by group admins.
