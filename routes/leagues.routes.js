const express = require("express")
const router = express.Router()

const mongoose = require("mongoose")
const League = require("../models/League.model")
const User = require("../models/User.model")
const UserInLeague = require("../models/UserInLeague.model")

// CREATE LEAGUES ROUTES

//create new league
router.post("/newleague", (req, res, next) => {
	const { name, inscriptionPrice, maxParticipants, accessCode, pot } = req.body

	League.findOne({ name })
		.then((foundLeague) => {
			// If the user with the same email already exists, send an error response
			if (foundLeague) {
				res.status(400).json({ message: "League already exists." })
				return
			}

			return League.create({ name, inscriptionPrice, maxParticipants, accessCode, participants: [], pot })
		})
		.then((createdLeague) => {
			res.status(201).json({ league: createdLeague })
		})
		.catch((err) => {
			console.log(err)
			res.status(500).json({ message: "Internal Server Error" })
		})
})

// get all leagues

router.get("/leagues", (req, res, next) => {
	League.find()
		.populate("User")
		.then((allLeagues) => res.json(allLeagues))
		.catch((err) => res.json(err))
})

//user joins a league

router.post("/join-league", (req, res, next) => {
	const { userId, leagueId } = req.body

	User.findByIdAndUpdate(userId, { $push: { openLeagues: leagueId } }, { new: true })

		.then(() => {
			League.findByIdAndUpdate(leagueId, { $push: { participants: userId } }, { new: true }).then(() => {
				UserInLeague.find({ userId: userId, league: leagueId }).then((result) => {
					if (result.length === 0) {
						UserInLeague.create({ userId: userId, league: leagueId, coinsInLeague: 500, bets: [] }).then(() => {
							res.status(201).json({ message: "ok" })
						})
					} else {
						res.status(500)
					}
				})
			})
		})
		.catch((err) => {
			console.log(err)
			res.status(500).json({ message: "Internal Server Error" })
		})
})

module.exports = router
