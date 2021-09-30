require("dotenv/config")
require("./db/index.js")
const express = require("express")

const { isAuthenticated } = require("./middleware/jwt.middleware") // <== IMPORT

const app = express()
require("./config")(app)

// 👇 MIDDLEWARE MISSING

const authRouter = require("./routes/auth.routes")
app.use("/api/auth", authRouter)

const LeagueRouter = require("./routes/leagues.routes")
app.use("/api", LeagueRouter)


const allRoutes = require("./routes")
app.use("/api", allRoutes)

const projectRouter = require("./routes/project.routes")
app.use("/api", isAuthenticated, projectRouter) // <== UPDATE

const taskRouter = require("./routes/task.routes")
app.use("/api", isAuthenticated, taskRouter) // <== UPDATE

// app.use((req, res, next) => {
// 	// If no routes match, send them the React HTML.
// 	res.sendFile(__dirname + "/public/index.html")
// })

require("./error-handling")(app)

module.exports = app
