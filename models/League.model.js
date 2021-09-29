const mongoose = require("mongoose")
const { Schema, model } = mongoose

const leagueSchema = new Schema({
	name: { type: String },
	inscrptionPrice: { type: Number },
	maxParticipants: { type: Number },
	accesCode: { type: Text },
  participants: [
		{
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	],
  pot: {type: Number}
})

module.exports = model("League", leagueSchema)
