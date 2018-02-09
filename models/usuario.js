var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');


var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE','USER_ROLE'],
    message: '{VALUE} no es un rol valido'
}

var usuarioSchema = new Schema({
    
    nombre: { type: String, required: [true, 'El nombre es obligatorio'] },
    email: { type: String, unique: true, required: [true, 'El correo es obligatorio'] },
    password: { type: String, required: [true, 'La contraseña es obligatorio'] },
    img: { type: String },
    role: { type: String, required : true, default: 'USER_ROLE', enum: rolesValidos  },
    google: { type: Boolean, required: true, default: false }

});

usuarioSchema.plugin( uniqueValidator, {
    message: ' {PATH} debe ser unico'
})

module.exports = mongoose.model('Usuario', usuarioSchema);