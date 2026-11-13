# Soccer Team Manager (Demo)

An interactive demo of a team-management app for soccer coaches and players. There is no sign-up and no backend: pick a role on the landing screen and explore. Everything you change is saved in your browser's `localStorage` only.

## Features

**Manager (coach)**
- Create and manage multiple teams
- Add, edit, view and archive players (name, number, email, position, age, notes, photo)
- Schedule games with opponent, date, time, location, home/away, arrival time and place, and notes
- Message players one-to-one or send a message to everyone ("TO ALL")
- See unread-message indicators per player
- Edit your display name

**Player**
- See your team's upcoming and past games, including arrival details
- Read game notes from the coach
- View and edit your own profile
- Chat with your coach and get notifications for unread messages

**Demo helpers**
- Sample data is seeded on first load: two teams (Thunder FC and Thunder FC U14), seven players, several games and a few messages. Game dates are relative to today, so the schedule always looks current.
- **Account → Reset demo data** restores the original sample data.
- **Account → Switch Role** returns to the role picker.

## Tech stack

- [React](https://react.dev/) 19
- [Create React App](https://create-react-app.dev/) (`react-scripts` 5)
- React Testing Library / Jest for tests
- Deployed to GitHub Pages with GitHub Actions

## Getting started

Requires Node.js 20 or newer (the deploy workflow uses Node 20).

```bash
git clone https://github.com/angelo1528/soccer-manager-demo.git
cd soccer-manager-demo
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Runs the app in development mode with hot reload |
| `npm test` | Runs the tests in watch mode |
| `npm run build` | Creates a production build in `build/` |

## Project structure

```
src/
├── App.js         # Main app: navigation, teams, roster, schedule, player/coach views
├── RolePicker.js  # Landing screen to enter as Manager or as a specific Player
├── Messages.js    # Coach/player chat and broadcast messages
├── Account.js     # Account page, name editing, reset demo data, switch role
├── demoData.js    # Seed data and helpers (COACH, createDemoData, newId)
└── App.test.js    # Smoke tests for the role picker and both views
```

## How data is stored

All state lives in a single `localStorage` entry (`soccerManagerDemo`), plus a `lastReadTimes` entry used for the coach's per-player unread counts. Clearing site data in your browser, or using **Reset demo data**, brings back the original sample data.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds the app and publishes it to GitHub Pages. You can also run it manually from the **Actions** tab. To enable it in a fork, set **Settings → Pages → Source** to **GitHub Actions**. The app uses `"homepage": "."` in `package.json`, so it works from a repository sub-path.

## Limitations

This is a demo, not a production app:
- No authentication or real user accounts
- Data is per-browser and per-device, with no syncing
- Messages are not delivered anywhere; both sides of the conversation are simulated in the same browser
