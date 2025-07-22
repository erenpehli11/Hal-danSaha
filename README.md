
# HalıdanSaha

🏟️ **HalıdanSaha** is a fun and interactive web platform designed for amateur football groups to manage weekly matches, track player statistics, and organize private leagues. Ideal for local friend groups, this platform brings competitive edge and analytics to your halı saha games.

## 🚀 Features

- 📅 **Weekly Match Scheduling**: Organize and display upcoming weekly fixtures.
- 🥅 **Goal Tracking & Leaderboards**: Record goals per match and generate live goal rankings.
- 🏆 **League Management**: Create private leagues and manage members, fixtures, and points.
- 📊 **Statistics Dashboard**: Automatically calculate assists, clean sheets, and match ratings.
- 👥 **User Authentication**: Secure login and JWT-based session handling.
- 🧹 **Database Cleanup Scripts**:
  - `cleanUpDeletedUserReferences.js`: Removes orphaned references in weekly matches, leagues, and user stats.
  - `cleanUpWeeklyMatches.js`: Cleans match data from deleted users to ensure data integrity.

## 🧠 Technologies Used

- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- EJS Template Engine
- Nodemailer (optional email features)
- Scheduled cleanup logic for stale or corrupted references

## 📁 Project Structure (Partial)

```
controllers/
├── LeagueController.js         # League creation, fixture publishing, table updates
├── pageController.js           # Page rendering (AnaSayfa, Login, etc.)
├── UserControl.js              # Login, cookie auth, token management

scripts/
├── cleanUpDeletedUserReferences.js  # Orphan reference removal in DB
├── cleanUpWeeklyMatches.js          # Team & goal cleanup from deleted users
```

## 🛠️ API Highlights

### Login (UserControl.js)
```http
POST /login
Body: { email, password }
```

### Render Main Page
```http
GET /AnaSayfa
Cookie: jwt (Token-based session)
```

## 🖼️ UI Samples

![Dashboard](./assets/dashboard.png)
![Fixtures](./assets/fixtures.png)
![GoalLeaderboard](./assets/leaderboard.png)

## 🔐 Security

- JWT-based secure login
- Passwords hashed with bcrypt
- HTTP-only cookie storage for session tokens

## 📌 Future Improvements

- Team auto-draft based on availability
- Match highlight uploads
- Real-time voting for MVP

---

🎉 Play smarter. Track better. Compete harder.
