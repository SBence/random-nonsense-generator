# Random Nonsense Generator

A Telegram bot to generate messages using Markov chains

## Preparation

### Creating a bot on Telegram

Creating a bot is done through [@BotFather](https://t.me/BotFather). See the [official documentation](https://core.telegram.org/bots/features#creating-a-new-bot) for more details.

**Make sure to disable [privacy mode](https://core.telegram.org/bots/features#privacy-mode), otherwise the bot won't be able to store user messages to generate its replies from.**

### Project installation

1. Install dependencies:

   ```sh
   yarn install
   ```

2. Add your bot token from BotFather to the `.env` file in the project directory:

   ```properties
   TOKEN=<insert your Telegram bot token here>
   ```

## Development

### Running the bot

```sh
yarn run dev:start
```

### Building for production

```sh
yarn run build
```

Build files will be output to `build/prod`.

## Deployment

_The steps below should be done in the deployment environment._

1. Copy the contents of the `build/prod` folder to the desired location on the server.
2. Follow the steps in the [Project installation](#project-installation) section.
3. Apply database migrations:

   ```sh
   yarn run prod:apply-migrations
   ```

4. Run the bot:

   ```sh
   node index.cjs
   ```

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
