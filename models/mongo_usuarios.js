var mongoose = require("mongoose");
conn1 = mongoose.createConnection('mongodb://localhost:27017/usuariosBD', {useNewUrlParser: true});
var Schema = mongoose.Schema;
var usuarioSchema = new Schema({
    "matricula": String,
	"nome": String,
	"senha": String,
	"admin": Boolean
});
module.exports = conn1.model('usuarios', usuarioSchema);
