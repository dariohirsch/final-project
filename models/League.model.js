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
			ref: "User",
		},
	],
	pot: { type: Number },
	condition: { type: String },
})

module.exports = model("League", leagueSchema)
