var express = require('express');

var Medico = require('../models/medico');

var mdAutenticacion = require('../middlewares/autenticacion');

//inicializar variables
var app = express();

// ======================================================================
// Obtener todos los registros de la coleccion medicos
// ======================================================================

app.get('/',(req, res) =>{


    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario','nombre email')
        .populate('hospital')
        .exec(
            (err, medicos ) => {

                if( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos ',
                        errros: err
                    })
                }

                Medico.count({}, (err, total ) => {

                    return res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: total
                    });
                })



            }
        );

});
// ======================================================================
//  método para crear un medico
// ======================================================================
app.post('/',mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img:body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save( (err, medicoCreado ) => {
        if( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando medico ',
                errros: err
            })
        }

        return res.status(200).json({
            ok: true,
            medico: medicoCreado,
        })
        
    });

});
// ======================================================================
// Actualización del medico
// ======================================================================
app.put('/:id',mdAutenticacion.verificaToken, (req, res ) => {

    var id = req.params.id;
    var body = req.body;
    
    Medico.findById(id, (err, medico) => {
       
        if( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el medico ',
                errros: err
            })
        }

        if( !medico ){
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id '+id+' no existe',
                errros: { message: 'El medico con el id '+id+' no existe'}
            })
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario._id

        medico.save( (err, medicoActualizado ) => {
            if( err ){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error actualizando el medico',
                    errros: err
                }) 
            }

            res.status(200).json({
                ok: true,
                medico: medicoActualizado
            });


        });
    });
});


// ======================================================================
// Eliminar un medico
// ======================================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) =>{
    
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

         
        if( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar un medico',
                errros: err
            })
        }

        if( !medicoBorrado ){  
            res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { message: 'No existe un medico con ese id' }  
            });
        }
        
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });
});

module.exports = app;