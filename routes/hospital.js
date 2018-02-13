var express = require('express');

var Hospital = require('../models/hospital');

var mdAutenticacion = require('../middlewares/autenticacion');

//inicializar variables
var app = express();

// ======================================================================
// Obtener todos los registros de la coleccion hospital
// ======================================================================

app.get('/',(req, res) =>{

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {

                if( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales ',
                        errros: err
                    })
                }

                Hospital.count({}, (err, total) => {
                    
                    return res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: total
                    });
                })



            }
        );
        


});

// ======================================================================
// Método para consultar un hospital por su id
// ======================================================================

app.get('/:id', (req, res ) => {
    var id = req.params.id;


    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec(
            (err, hospital ) => {
                
                if( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Se produjo un erro al buscar el hospital por id',
                        errors : err 
                    });
                }

                if ( !hospital ) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'EL hospital con el id '+id+' no existe',
                        errros: { mensaje: 'EL hospital con el id '+id+' no existe' }
                    });
                }

                res.status(200).json({
                    ok: true,
                    hospital: hospital
                });
            }
        );

});

// ======================================================================
//  método para crear un hospital
// ======================================================================
app.post('/',mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img:body.img,
        usuario: req.usuario._id
    });

    hospital.save( (err, hospitalCreado ) => {
        if( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando usuario ',
                errros: err
            })
        }

        return res.status(200).json({
            ok: true,
            hospital: hospitalCreado,
        })
        
    });

});
// ======================================================================
// Actualización del hospital
// ======================================================================
app.put('/:id',mdAutenticacion.verificaToken, (req, res ) => {

    var id = req.params.id;
    var body = req.body;
    
    Hospital.findById(id, (err, hospital) => {
       
        if( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital ',
                errros: err
            })
        }

        if( !hospital ){
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id '+id+' no existe',
                errros: { message: 'El hospital con el id '+id+' no existe'}
            })
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id

        hospital.save( (err, hospitalActualizado ) => {
            if( err ){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error actualizando el hospital',
                    errros: err
                }) 
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalActualizado
            });


        });
    });
});


// ======================================================================
// Eliminar un hospital
// ======================================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) =>{
    
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

         
        if( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar un hospital',
                errros: err
            })
        }

        if( !hospitalBorrado ){
            res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }  
            });
        }
        
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });
});

module.exports = app;