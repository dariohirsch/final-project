const mongoose = require("mongoose")
const { Schema, model } = mongoose

const leagueSchema = new Schema({
	name: { type: String },
	inscriptionPrice: { type: Number },
	maxParticipants: { type: Number },
	accesCode: { type: String },
	participants: [
		{
			type: Schema.Types.ObjectId,
			ref: "UserInLeague",
		},
	],
	pot: { type: Number },
})

module.exports = model("League", leagueSchema)
