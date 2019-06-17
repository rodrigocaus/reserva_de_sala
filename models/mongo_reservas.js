var mongoose = require("mongoose");
conn1 = mongoose.createConnection('mongodb://localhost:27017/reservasBD', {useNewUrlParser: true});
var Schema = mongoose.Schema;
var reservaSchema = new Schema({
    "sala": String,
	"autor": String,
	"dia": String,
	"evento": String,
	"descricao": String,
	"horario": [Number]
});
module.exports = conn1.model('reservas', reservaSchema);
