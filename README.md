# Invitation Project

This project is a Node.js/Express web app for managing wedding invitations, RSVP, and guest lists.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- [MySQL](https://www.mysql.com/) database

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd invitation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory with your database credentials:
   ```
   DB_USER=your_db_user
   DB_PASS=your_db_password
   DB_NAME=your_db_name
   DB_HOST=localhost
   # For Cloud SQL, add INSTANCE_UNIX_SOCKET if needed
   ```

4. **Set up the database**

   - Create the database and tables using the SQL in the `/query` file.
   - Example:
     ```sql
     CREATE DATABASE your_db_name;
     USE your_db_name;
     -- Then run the table creation and seed queries from /query
     ```

5. **Add assets**

   - Place any background images or assets in the `public/assets` folder.

6. **Run the app**

   ```bash
   npm start
   ```
   or for development with auto-reload:
   ```bash
   npm run dev
   ```

7. **Access the app**

   Open your browser and go to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
invitation/
├── public/           # Static assets (CSS, JS, images)
├── routes/           # Express route files
├── views/            # EJS templates
├── .env              # Environment variables (not committed)
├── app.js            # Main Express app
├── db.js             # Database connection
├── package.json
└── README.md
```

## Common Commands

- `npm start` — Start the server
- `npm run dev` — Start the server with nodemon (auto-reload)
- `npm install` — Install dependencies

## Notes

- Make sure your MySQL server is running and accessible.
- For production or cloud deployment (e.g., Google Cloud Run), set environment variables accordingly.
- Admin features are shown if `isAdmin` is set to `true` in the Express route.

---

Feel free to customize this README for your team or deployment!