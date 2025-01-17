const mongoose = require("mongoose")
const { Schema, model } = mongoose

const leagueSchema = new Schema(
	{
		name: { type: String },
		inscriptionPrice: { type: Number },
		maxParticipants: { type: Number },
		accessCode: { type: String },
		participants: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		],

		pot: { type: Number },
		potToWinners: { type: String },
		condition: { type: String },
		finishDate: { type: Number },
	},
	{
		timestamps: true,
	}
)

module.exports = model("League", leagueSchema)
