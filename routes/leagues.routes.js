const express = require("express")
const router = express.Router()

const mongoose = require("mongoose")
const League = require("../models/League.model")
const User = require("../models/User.model")
const Bet = require("../models/Bet.model")
const UserInLeague = require("../models/UserInLeague.model")

// CREATE LEAGUES ROUTES

//create new league
router.post("/newleague", (req, res, next) => {
	const { name, inscriptionPrice, maxParticipants, accessCode, pot, condition } = req.body

	League.findOne({ name })
		.then((foundLeague) => {
			// If the user with the same email already exists, send an error response
			if (foundLeague) {
				res.status(400).json({ message: "League already exists." })
				return
			}

			return League.create({ name, inscriptionPrice, maxParticipants, accessCode, participants: [], pot, condition })
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
		//	.populate("User")
		.then((allLeagues) => res.json(allLeagues))
		.catch((err) => res.json(err))
})

//user joins a league

router.post("/join-league", (req, res, next) => {
	const { userId, leagueId, coinsUpdated } = req.body

	UserInLeague.find({ userId: userId, league: leagueId }).then((response) => {
		if (response.length === 0) {
			User.findByIdAndUpdate(userId, { $push: { openLeagues: leagueId }, coins: coinsUpdated }, { new: true })

				.then(() => {
					League.findByIdAndUpdate(leagueId, { $push: { participants: userId } }, { new: true }).then(() => {
						UserInLeague.find({ userId: userId, league: leagueId }).then((result) => {
							if (result.length === 0) {
								UserInLeague.create({ userId: userId, league: leagueId, coinsInLeague: 500, realCoinsInLeague: 500, bets: [] }).then(() => {
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
		} else {
			res.status(500)
		}
	})
})
// view all leagues from one user
router.post("/my-leagues", (req, res, next) => {
	const { userId } = req.body

	User.findById(userId)

		.populate("openLeagues")
		.then((user) => res.json(user))

		.catch((err) => res.json(err))
})

// view league details

router.get("/league-details/:id", (req, res, next) => {
	leagueId = req.params.id

	League.find({ _id: leagueId })

		.populate("participants")
		// .then((league) => console.log(league))
		.then((league) => res.json(league))
		.catch((err) => res.json(err))
})

// search user in league
router.post("/get-userinleague", (req, res, next) => {
	const { userId, leagueId } = req.body

	// console.log(`***`, userId, `****`, leagueId)
	UserInLeague.find({ league: leagueId, userId: userId })

		//.populate("openLeagues")
		.then((user) => res.json(user))

		.catch((err) => res.json(err))
})

//user place a bet

router.post("/place-bet", (req, res, next) => {
	const { userId, leagueId, betMatch, coinsToWin, betSigne, betAmount, matchId, coinsInLeague, condition, matchTime, status } = req.body

	UserInLeague.findOneAndUpdate({ league: leagueId, userId: userId }, { coinsInLeague: coinsInLeague })

		.then(() => {
			Bet.create({ betMatch: betMatch, coinsToWin: coinsToWin, betSigne: betSigne, betAmount: betAmount, matchId: matchId, condition, matchTime, status }).then((bet) => res.json(bet))
		})
		.catch((err) => {
			console.log(err)
			res.status(500).json({ message: "Internal Server Error" })
		})
})

// check bet won or lost

router.post("/bet-check-status-win", (req, res, next) => {
	const { betId } = req.body
	Bet.findByIdAndUpdate(betId, { status: "won" })
		.then((info) => res.json(info))
		.catch((err) => res.json(err))
})
router.post("/bet-check-status-lost", (req, res, next) => {
	const { betId } = req.body
	Bet.findByIdAndUpdate(betId, { status: "lost" })
		.then((info) => res.json(info))
		.catch((err) => res.json(err))
})

//subnavbar league

router.post("/get-userLeague", (req, res, next) => {
	const { userId, leagueId } = req.body

	// console.log(`***`, userId, `****`, leagueId)
	League.find({ _id: leagueId })

		//.populate("openLeagues")
		.then((user) => res.json(user))

		.catch((err) => res.json(err))
})

//get all open bets

router.get("/bet-results", (req, res, next) => {
	// Bet.find({ condition: { $elemMatch: "open" } })
	Bet.find({ condition: { $in: ["open"] } })
		// .filter({ condition: "open" })
		.then((bets) => res.json(bets))
		.catch((err) => res.json(err))
})

// get all users and respective coins in league
router.post("/get-userinleague2", (req, res, next) => {
	const { leagueId } = req.body

	UserInLeague.find({ league: leagueId })

		.sort({ realCoinsInLeague: -1 })
		.populate("userId")
		.then((userInLeague) =>
			res
				.json(userInLeague)

				.catch((err) => res.json(err))
		)
})

module.exports = router
