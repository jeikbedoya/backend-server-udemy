var express = require('express');

//encriptar clave de usuario
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middlewares/autenticacion');

var Usuario = require('../models/usuario');


//inicializar variables
var app = express();

// ======================================================================
// Obtener todos los usuarios
// ======================================================================
app.get('/', (req, res, next) => {
   
    var desde = req.query.desde || 0;
    desde = Number(desde);
    
    Usuario.find({},'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec(
        
            (err, usuarios) =>{

                if( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario ',
                        errros: err
                    })
                }

                Usuario.count({}, (err, total) => {
                    
                    return res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: total
                    });
                })


            }
        );
    
});



// ======================================================================
// crear un nuevo usuario
// ======================================================================

app.post('/',(req, res ) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
    });

    usuario.save( (err, usuarioGuardado) => {
        if( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando usuario ',
                errros: err
            })
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });

});

// ======================================================================
// Actualizar usuario
// ======================================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {


    var id = req.params.id;
    var body = req.body;

    Usuario.findById( id, (err, usuario) =>{
        if( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario ',
                errros: err
            })
        }

        if( !usuario ){
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id '+id+' mno existe',
                errros: { message: 'No existe el usuario con el ID'}
            })
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
      

        usuario.save( (err, usuarioGuardado) => {
            
            if( err ){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El actualizando el usaurio',
                    errros: err
                })
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        })

       

    });



});


// ======================================================================
// Eliminar un usuario
// ======================================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) =>{
    
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

         
        if( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'El al borrar un usuario',
                errros: err
            })
        }

        if( !usuarioBorrado ){
            res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }  
            });
        }
        
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});


module.exports = app;