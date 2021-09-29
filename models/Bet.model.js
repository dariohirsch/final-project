const mongoose = require("mongoose")
const { Schema, model } = mongoose

const betSchema = new Schema({
	cuoteHome: { type: Number },
	cuoteDraw: { type: Number },
	cuoteAway: { type: Number },
	betAmount: { type: Number },
	userInLeague: [
		{
			type: Schema.Types.ObjectId,
			ref: "UserInLeague",
		},
	],
})

module.exports = model("Bet", betSchema)
