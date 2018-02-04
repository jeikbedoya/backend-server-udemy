var express = require('express');

//encriptar clave de usuario
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var Usuario = require('../models/usuario');

//inicializar variables
var app = express();


app.post('',(req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuario) => {
        
        if( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario por email ',
                errros: err
            });
        }

        if( !usuario ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales invalidas Email',
                errros: {mensaje: 'Credenciales invalidas email'}
            });
        }

        if( !bcrypt.compareSync(body.password, usuario.password) ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales invalidas Password',
                errros: {mensaje: 'Credenciales invalidas Password'}
            });
        }

        //crear un token
        usuario.password = ':)';

        var token = jwt.sign({ usuario: usuario}, SEED, { expiresIn:14400 }); //4 horas
 

        res.status(200).json({
            ok:true,
            usuario: usuario,
            id: usuario.id,
            token: token
        });

    })
})


module.exports = app;