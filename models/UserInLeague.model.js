const mongoose = require("mongoose")
const { Schema, model } = mongoose

const userInLeagueSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	league: {
		type: Schema.Types.ObjectId,
		ref: "League",
	},
	coinsInLeague: { type: Number },
	inPlayCoins: { type: Number },
	bets: [
		{
			type: Schema.Types.ObjectId,
			ref: "Bet",
		},
	],
})

module.exports = model("UserInLeague", userInLeagueSchema)
