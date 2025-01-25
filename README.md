# 🤖Robin-San Bot

Robin-San Bot is a feature-rich, anime-centric Telegram bot designed to provide users with the latest information about anime, including top airing shows, popular titles, seasonal recommendations, and more. This bot is in beta and aims to deliver an enjoyable and interactive experience for anime enthusiasts.

## ✨Features

- **Start Command**: A warm greeting from Robin-San, introducing its capabilities.
- **Top Airing Command**: Get a list of top-airing anime.
- **Popular Command**: Fetch a list of currently popular anime.
- **Anime Search**: Search for anime by name.
- **Seasonal Command**: Explore anime currently airing this season.
- **Top Upcoming Command**: Discover upcoming anime releases.
- **Random Anime**: Get a random anime recommendation.
- **Genre Selection**: Explore anime by genre with intuitive inline keyboards.

## 💡Commands Overview

| Command       | Description                          |
|---------------|--------------------------------------|
| `/start`      | Introduction to the bot.            |
| `/topairing`  | Fetch top-airing anime.             |
| `/popular`    | Fetch popular anime.                |
| `/search`     | Search for anime by name.           |
| `/seasonal`   | Discover seasonal anime.            |
| `/upcoming`   | Find upcoming anime releases.       |
| `/random`     | Get a random anime recommendation.  |
| `/genre`      | Select anime by genre.              |

## 🦾Technologies Used

- **Telegraf.js**: For bot development.
- **NeonDB (PostgreSQL)**: (future plan) Database for user specific info.
- **TypeScript**: (future plan) Ensuring robust and type-safe code.
- **Jikan API**: Fetching anime data and recommendations.

## 📦Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/jtuluve/Robin-San-Bot.git
   cd Robin-San-Bot
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```env
   API_URL = your-api-url
   BOT_TOKEN = your-bot-token
   BOT_URL = your-bot-url
   PORT = your-port
   ADMIN_ID = your-telegram-id
   DB_URL= your-db-url
   ```
4. Start the bot:
   ```bash
   npm start
   ```

## ▶️Usage

- Add the bot to a Telegram chat or message it directly.
- Use the commands listed above to interact with the bot.

## 🤝Contributing

Contributions are welcome! Please follow these steps:

0. Make sure to create a issue(if it doesn't exist) for the feature or the problem. Request to assign(This helps others know that someone is already working).
1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your feature or fix description"
   ```
4. Push your branch:
   ```bash
   git push origin feature-name
   ```
5. Submit a pull request with issue id.

## License

Robin-San Bot is licensed under the MIT License. See the LICENSE file for more details.

## Acknowledgements

- [Telegraf.js](https://telegraf.js.org/)
- [Jikan API](https://jikan.moe/)
- [NeonDB](https://neon.tech/)

## Contact

For issues or suggestions, contact me at [jtuluve@gmail.com](mailto:jtuluve@gmail.com).

---

Enjoy using Robin-San Bot and explore the amazing world of anime! 🌸

