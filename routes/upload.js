var express = require('express');

const fileUpload = require('express-fileupload');

var fs = require('fs');

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

//inicializar variables
var app = express();

// default options
app.use(fileUpload());


// rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;
    
    if( !req.files ){
        res.status(400).json({
            ok:false,
            mensaje: 'Debe seleccionar una imagen',
            error:{mensaje: 'Debe seleccionar una imagen'}
        })
    }

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extArchivo = nombreCortado[ nombreCortado.length -1 ];

    //solo estas extensiones se acptan
    var extencionesValidas = ['png', 'jpg', 'gif','jpeg'];

    //validamos extenciones
    if( extencionesValidas.indexOf(extArchivo)  < 0){
        res.status(400).json({
            ok:false,
            mensaje: 'Extensión no valida',
            error:{mensaje: 'Extensión no valida, las extensiones validas son '+extencionesValidas.join(', ')}
        }) 
    }

    //nombre de archivo personalizado
    var nombreArchivo = `${id}-${(new Date()).getMilliseconds()}.${extArchivo}`;

    //validacion de tipos 
    var tiposValidos = ['hospitales','medicos','usuarios'];
    if( tiposValidos.indexOf(tipo) < 0){
        res.status(400).json({
            ok:false,
            mensaje: 'Tipo de coleccion invalida',
            error:{mensaje: 'Tipo invalido, los tipos validos son '+tiposValidos.join(', ')}
        })   
    }

    //mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv( path, err => {
        if ( err ) {
            res.status(400).json({
                ok:false,
                mensaje: 'Error al mover el archivo',
                error:err
            });
        }

        subirPorTipos(tipo, id, nombreArchivo, res);
    })

});

function subirPorTipos(tipo, id, nombreArchivo, res){
    if( tipo == 'usuarios'){
        Usuario.findById(id, (err, usuario) => {
            
            if( err ){
                res.status(400).json({
                    ok:false,
                    mensaje: 'Error buscando el usuario',
                    error:err
                });
            }

            if( !usuario ){
                res.status(400).json({
                    ok:false,
                    mensaje: 'Usuario no existe',
                    error:{ mensaje: 'Usuario no existe'}
                });
            }

            var pathAnterior = './uploads/usuarios/'+usuario.img;

            //si existe elimina la imagen anterior
            if ( fs.existsSync(pathAnterior)){
                fs.unlink(pathAnterior);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                if( err ){
                    res.status(500).json({
                        ok:false,
                        mensaje:'Error actualizando el usuario'
                    })
                }

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok:true,
                    mensaje:'Imagen de usuario actualizado',
                    usuario: usuarioActualizado
                })
            })
        })
    }
    if( tipo == 'medicos'){
        Medico.findById(id, (err, medico) => {
            if( err ){
                res.status(400).json({
                    ok:false,
                    mensaje: 'Error buscando el medico',
                    error:err
                });
            }

            if( !medico ){
                res.status(400).json({
                    ok:false,
                    mensaje: 'medico no existe',
                    error:{ mensaje: 'medico no existe'}
                });
            }

           
            var pathAnterior = './uploads/medicos/'+medico.img;

            //si existe elimina la imagen anterior
            if ( fs.existsSync(pathAnterior)){
                fs.unlink(pathAnterior);
            }
            

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                if( err ){
                    res.status(500).json({
                        ok:false,
                        mensaje:'Error actualizando el medico'
                    })
                }

                return res.status(200).json({
                    ok:true,
                    mensaje:'Imagen de medico actualizado',
                    medico: medicoActualizado
                })
            })
        })
    }
    if( tipo == 'hospitales'){
        Hospital.findById(id, (err, hospital) => {
            if( err ){
                res.status(400).json({
                    ok:false,
                    mensaje: 'Error buscando el hospital',
                    error:err
                });
            }

            if( !hospital ){
                res.status(400).json({
                    ok:false,
                    mensaje: 'hospital no existe',
                    error:{ mensaje: 'hospital no existe'}
                });
            }

            var pathAnterior = './uploads/hospitales/'+hospital.img;

            //si existe elimina la imagen anterior
            if ( fs.existsSync(pathAnterior)){
                fs.unlink(pathAnterior);
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                if( err ){
                    res.status(500).json({
                        ok:false,
                        mensaje:'Error actualizando el hospital'
                    })
                }

                return res.status(200).json({
                    ok:true,
                    mensaje:'Imagen de hospital actualizado',
                    hospital: hospitalActualizado
                })
            })
        })
    }
}


module.exports = app;