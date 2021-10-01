const mongoose = require("mongoose")
const { Schema, model } = mongoose

const betSchema = new Schema({
	betHome: { type: Text },
	betDraw: { type: Text },
	betAway: { type: Text },
	coinsToWin: { type: Text },
	betAmount: { type: Number },
	// userInLeague: [
	// 	{
	// 		type: Schema.Types.ObjectId,
	// 		ref: "UserInLeague",
	// 	},
	// ],
})

module.exports = model("Bet", betSchema)
