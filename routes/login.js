var express = require('express');

//encriptar clave de usuario
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var Usuario = require('../models/usuario');

//inicializar variables
var app = express();

var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

// ======================================================================
// Autenticacion de google
// ======================================================================
app.post('/google', (req, res ) =>{
    
    var token = req.body.token || 'XXX';

    var client = new auth.OAuth2(GOOGLE_CLIENT_ID,GOOGLE_SECRET, '');

    client.verifyIdToken(
        token,
        GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
        function(e, login) {

            if( e ){
                
            return res.status(400).json({
                    ok:false,
                    mensaje:'Token no valido',
                    errors: e
            });
            }

          var payload = login.getPayload();
          var userid = payload['sub'];

          Usuario.findOne({email: payload.email}, (err , usuario) => {

            if( err ){

                return res.status(500).json({
                    ok:false,
                    mensaje:'Error al buscar usuario -login',
                    errors: errs
                }); 
            }

            if( usuario ){

                if( usuario.google === false){
                    return res.status(400).json({
                        ok:false,
                        mensaje:'Debe usar la autenticación normal',
                        errors: errs
                    }); 
                }else{

                    //crear un token
                   usuario.password = ':)';
    
                   var token = jwt.sign({ usuario: usuario}, SEED, { expiresIn:14400 }); //4 horas
           
    
                   res.status(200).json({
                       ok:true,
                       usuario: usuario,
                       id: usuario.id,
                       token: token
                   });
                }


            }else{
                //si el usuario no existe se debe crear un nuevo usuario
                var usuario = new Usuario();

                usuario.nombre = payload.name;
                usuario.email = payload.email;
                usuario.password = ':)';
                usuario.img = payload.picture;
                usuario.google = true;

                usuario.save( (err, usuarioBb) => {
                    if( err ){
                        return res.status(400).json({
                            ok:false,
                            mensaje:'Error creando usuario - Google',
                            errors: errs
                        }); 
                    }

                     //crear un token
                     usuarioBb.password = ':)';
    
                   var token = jwt.sign({ usuario: usuarioBb}, SEED, { expiresIn:14400 }); //4 horas
           
    
                   res.status(200).json({
                       ok:true,
                       usuario: usuarioBb,
                       id: usuarioBb.id,
                       token: token
                   });
                })
            }
          })
        
        });
    
  
})
// ======================================================================
// Autenticacion normal
// ======================================================================
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