var express = require('express');

var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');


//inicializar variables
var app = express();


// ======================================================================
// Busqueda general
// ======================================================================
app.get('/todo/:busqueda', (req, res, next) => {
    
    var busqueda = req.params.busqueda;
    var regex = new RegExp( busqueda, 'i');

    Promise.all([ 
        buscarHospitales(busqueda, regex), 
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda,regex)])
            .then(respuestas => {

                res.status(200).json({
                    ok: true,
                    Hospitales: respuestas[0],
                    medicos:respuestas[1],
                    usuarios:respuestas[2]
                })
            });
    
});

// ======================================================================
// Busqueda especifica hospitales
// ======================================================================
app.get('/coleccion/:tabla/:busqueda',(req, res)=> {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

   var promesa;

   switch( tabla ){
       case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        
        case 'hospitales':
             promesa = buscarHospitales(busqueda, regex);
             break;
        case 'medicos':
             promesa = buscarMedicos(busqueda, regex);
             break;
        default:
            return res.status(400).json({
                ok:false,
                mensaje:'Solo se aceptan busquedas por usuarios, medicos, hospitales',
                error:{ mensaje:'Solo se aceptan busquedas por usuario, medico, hospital' }
            })
    }

    promesa.then( data => {
        res.status(200).json({
            ok:true,
            [tabla]:data
        });
    })
})


function buscarHospitales(busqueda, regex){
    
    return new Promise( (resolve, rejec ) =>{
        
        Hospital.find({nombre:regex})
            .populate('usuario','nombre email')
            .exec(
                (err, hospitales) =>{
                    if( err ){
                        rejec('Error al cargar hospitales');
                    }else{
                        resolve(hospitales);
                    }
        })
    })
    
}

function buscarMedicos(busqueda, regex){
    
    return new Promise( (resolve, rejec ) =>{
        
        Medico.find({nombre:regex})
            .populate('usuario','nombre email')
            .populate('hospital','nombre')
            .exec(
                (err, medicos) =>{
                    if( err ){
                        rejec('Error al cargar medicos');
                    }else{
                        resolve(medicos);
                    }
            })
    })
    
}

function buscarUsuarios(busqueda, regex){
    
    return new Promise( (resolve, rejec ) =>{
        
        Usuario.find({},'nombre email role')
            .or([{nombre:regex},{email: regex}])
            .exec(
                (err, usuarios)=> {
                    if( err ){
                        rejec('Error al cargar usuarios')
                    }else{
                        resolve(usuarios);
                    }
                }
            )
    })
    
}


module.exports = app;