const mongoose = require("mongoose")
const { Schema, model } = mongoose

const betSchema = new Schema(
	{
		betMatch: { type: String },
		betSigne: { type: String },
		coinsToWin: { type: String },
		betAmount: { type: Number },
		idMatch: { type: String },
		// userInLeague: [
		// 	{
		// 		type: Schema.Types.ObjectId,
		// 		ref: "UserInLeague",
		// 	},
		// ],
	},
	{ timestamps: true }
)

module.exports = model("Bet", betSchema)
