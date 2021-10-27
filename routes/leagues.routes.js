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
	const { name, inscriptionPrice, maxParticipants, accessCode, pot, condition, finishDate, potToWinners } = req.body

	League.findOne({ name })
		.then((foundLeague) => {
			// If the user with the same email already exists, send an error response
			if (foundLeague) {
				res.status(400).json({ message: "League already exists." })
				return
			}

			return League.create({ name, inscriptionPrice, maxParticipants, accessCode, participants: [], pot, condition, finishDate, potToWinners })
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
	League.find({ condition: { $in: ["open"] } })
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
								UserInLeague.create({ userId: userId, league: leagueId, coinsInLeague: 500, inPlayCoins: 0, bets: [] }).then(() => {
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
	const { userId, leagueId, betMatch, coinsToWin, betSigne, betAmount, matchId, coinsInLeague, condition, matchTime, status, inPlayCoins } = req.body

	UserInLeague.findOneAndUpdate({ league: leagueId, userId: userId }, { coinsInLeague: coinsInLeague, inPlayCoins: inPlayCoins })

		.then(() => {
			Bet.create({ betMatch: betMatch, coinsToWin: coinsToWin, betSigne: betSigne, betAmount: betAmount, matchId: matchId, condition, matchTime, status: "pending" }).then((bet) => {
				UserInLeague.findOneAndUpdate({ league: leagueId, userId: userId }, { $push: { bets: bet._id } })
					.then((response) => {
						res.json(response)
					})
					.catch((err) => {
						console.log(err)
					})
			})
		})
		.catch((err) => {
			console.log(err)
			res.status(500).json({ message: "Internal Server Error" })
		})
})

// check bet won or lost

router.post("/bet-check-status-win", (req, res, next) => {
	const { betId } = req.body
	Bet.findByIdAndUpdate(betId, { status: "won", condition: "closed" })
		.then((result) => {
			res.json(result)
			UserInLeague.find()
				.populate("bets")
				.then((users) => {
					users.forEach((user) => {
						user.bets.forEach((bet) => {
							// console.log("esto es bet", bet)
							if (bet.status === "won") {
								UserInLeague.findByIdAndUpdate(user._id, { coinsInLeague: user.coinsInLeague + bet.coinsToWin, inPlayCoins: user.inPlayCoins - bet.betAmount }, { new: true })
									.then((response) => console.log(response))
									.catch((err) => console.log(err))
							} else {
								console.log("not won")
							}
						})
					})
				})
		})

		.catch((err) => res.json(err))
})

// get all open leagues, close those that should be finished and update users.

router.get("/leagues-results", (req, res, next) => {
	// Bet.find({ condition: { $elemMatch: "open" } })
	League.find({ condition: { $in: ["open"] } })
		.populate("participants")
		.then((leagues) =>
			leagues.forEach((league) => {
				if (league.finishDate < new Date() / 1000) {
					League.findByIdAndUpdate(league._id, { condition: "closed" }, { new: true }).then((res) => console.log("ligas cerradas ok", res))
					UserInLeague.find({ league: league._id }).then((users) => {
						users.sort((a, b) => {
							if (a.coinsInLeague > b.coinsInLeague) {
								return -1
							}
							if (a.coinsInLeague < b.coinsInleague) {
								return 1
							} else {
								return 0
							}
						})
						let pot = league.participants.length * league.inscriptionPrice
						userIdWon = users[0].userId

						userIdWon1 = users[0].userId
						userIdWon2 = users[1].userId
						userIdWon3 = users[2].userId
						let potWinner1 = league.participants.length * league.inscriptionPrice * 0.5
						let potWinner2 = league.participants.length * league.inscriptionPrice * 0.3
						let potWinner3 = (league.participants.length * league.inscriptionPrice * 20) / 100

						if (league.potToWiners === "first-second-third") {
							User.findById(userIdWon1).then((user) => {
								const coins = user.coins
								User.findByIdAndUpdate(userIdWon1, { coins: coins + potWinner1 }, { new: true }).then((user) => console.log("user won with updated coins", user))
							})
						}

						if (league.potToWiners === "first-second-third") {
							User.findById(userIdWon2).then((user) => {
								const coins = user.coins
								User.findByIdAndUpdate(userIdWon2, { coins: coins + potWinner2 }, { new: true }).then((user) => console.log("user won with updated coins", user))
							})
						}

						if (league.potToWiners === "first-second-third") {
							User.findById(userIdWon3).then((user) => {
								const coins = user.coins
								User.findByIdAndUpdate(userIdWon3, { coins: coins + potWinner3 }, { new: true }).then((user) => console.log("user won with updated coins", user))
							})
						} else {
							User.findById(userIdWon).then((user) => {
								const coins = user.coins
								User.findByIdAndUpdate(userIdWon, { coins: coins + pot }, { new: true }).then((user) => console.log("user won with updated coins", user))
							})
						}
					})
				}
			})
		)
})
// })
// })

router.post("/bet-check-status-lost", (req, res, next) => {
	const { betId } = req.body
	Bet.findByIdAndUpdate(betId, { status: "lost", condition: "closed" })
		.then((result) => {
			res.json(result)
			UserInLeague.find()
				.populate("bets")
				.then((users) => {
					users.forEach((user) => {
						user.bets.forEach((bet) => {
							// console.log("esto es bet", bet)
							if (bet.status === "lost") {
								UserInLeague.findByIdAndUpdate(user._id, { inPlayCoins: user.inPlayCoins - bet.betAmount }, { new: true })
									.then((response) => console.log(response))
									.catch((err) => console.log(err))
							} else {
								console.log("not won")
							}
						})
					})
				})
		})

		.catch((err) => res.json(err))
})

// get only won bets

// router.get("/won-bets", (req, res, next) => {
// 	UserInLeague.find()
// 		.populate("bets")
// 		.then((res) => {
// 			console.log("user in league", res)
// 		})
// })

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
	Bet.find({ condition: "open" })
		// .filter({ condition: "open" })
		.then((bets) => res.json(bets))
		.catch((err) => res.json(err))
})

// get all users and respective coins in league
router.post("/get-userinleague2", (req, res, next) => {
	const { leagueId } = req.body

	UserInLeague.find({ league: leagueId })

		.sort({ coinsInLeague: -1 })
		.populate("userId")
		.then((userInLeague) => res.json(userInLeague))
		.catch((err) => res.json(err))
})

// get bets from one user

router.post("/get-mybets", (req, res, next) => {
	const { leagueId, userId } = req.body

	UserInLeague.find({ league: leagueId, userId: userId })
		.populate("bets")
		.then((bets) => {
			res.json(bets)
		})
		.catch((err) => res.json(err))
})

module.exports = router
