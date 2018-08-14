const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const passport = require('passport');
const Database = require('./config/database');
const sql = require('mssql');
const fileUpload = require('express-fileupload');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug';

var AWS = require('aws-sdk');
var app = express();
var s3 = new AWS.S3();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(fileUpload());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Users
const users = require('./routes/users');
app.use('/users', users);

// Stats
const stats = require('./stats/stats');
app.use('/stats', stats);

// Passport Middleware
app.use(passport.initialize());
require('./config/passport')(passport);

// Parameters
app.get('/carpetas/:key', function (req, res) {
    logger.info('Method: (carpetas/:key), body: (%s)', JSON.stringify(req.query));
    var key = req.params.key;
    Database.getCarpeta(key, res);
});

app.get('/carpetas', function (req, res) {
    logger.info('Method: (carpetas), body: (%s)', JSON.stringify(req.query));
    Database.getAllCarpetas(req.query.cliecodigo, res);
});


app.get('/clientes', function (req, res) {
    logger.info('Method: (clientes), body: (%s)', JSON.stringify(req.query));
    Database.getAllClientes(res);
});

app.get('/notificaciones', function (req, res) {
    Database.getUnreadNtfsForClient(req.query.cliecodigo, res);
});

app.put('/notificaciones', async function (req, res) {
    logger.info('Method: (notificaciones), body: (%s)', JSON.stringify(req.body));

    if (req.body.id != '*') {
        Database.markNotificationRead(req.body.id, res);
    } else {
        logger.info('Marcar todas las notificaciones como leidas para el usuario (%s)', req.body.cliecod)
        await Database.markAllNotificationsRead(req.body.cliecod, res);
    }
});


//CARPET CUSTOM

app.post('/simi', async function (req, res) {
    logger.info('Method: (simi), body: (%s)', JSON.stringify(req.body));

    await Database.setCCFieldValue(req.body.operacion, req.body.cliecod, 's1_simi_manual', req.body.simi, (err) => {
        if (err)
            logger.error(err)
    });
    res.send('ok');
});

app.post('/lna', async function (req, res) {
    logger.info('Method: (lna), body: (%s)', JSON.stringify(req.body));

    await Database.setCCFieldValue(req.body.operacion, req.body.cliecod, 's1_lna', req.body.lna, (err) => {
        if (err)
            logger.error(err)
    });
    await Database.setCCFieldValue(req.body.operacion, req.body.cliecod, 's1_lna_status', req.body.lna_estado, (err) => {
        if (err)
            logger.error(err)
    });
    res.send('ok');
});


app.post('/containers', async function (req, res) {
    logger.info('Method: (containers), body: (%s)', JSON.stringify(req.body));

    let containers = req.body.containers;

    await Database.updateContainers(req.body.operacion, req.body.containers, (err) => {
        if (err)
            logger.error(err)
    });

    res.send('ok');
});


app.get('/download', function (req, res) {
    logger.info('Method: (download), body: (%s)', JSON.stringify(req.query));

    let filename = req.query.dtype + "_" + req.query.carpeta + '.pdf';
    let key = req.query.dtype + '/' + filename;
    var params = {
        Bucket: 'tracking.baireslogistic.com.ar',
        Key: key
    };
    s3.getObject(params, function (err, data) {
        if (err) {
            logger.error(err)
            res.contentType('text/plain');
            res.send(err);
            return;
        }

        res.contentType("application/pdf");
        res.send(data.Body);
    });
});


app.post('/remove_attachment', async function (req, res) {
    logger.info('Method: (remove_attachment), body: (%s)', JSON.stringify(req.body));

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let filename = req.body.type + "_" + req.body.intsnum + '.pdf';
    let key = req.body.type + '/' + filename;

    var params = { Bucket: 'tracking.baireslogistic.com.ar', Key: key };
    s3.deleteObject(params, async function (err, data) {
        if (err) {
            logger.error(err)
            return res.status(500).send(err);
        }

        var fieldname = null;
        switch (req.body.type) {
            case 'invoice':
                fieldname = 's0_fecha_invoice_pdf';
                break;

            case 'bol':
                fieldname = 's0_fecha_bol_pdf';
                break;

            case 'packinglist':
                fieldname = 's0_fecha_packinglist_pdf';
                break;

            case 'simi':
                fieldname = 's1_fecha_simi_pdf';
                break;

            case 'solicitud':
                fieldname = 's2_fecha_solic_fondos_pdf';
                break;

            case 'vep':
                fieldname = 's2_fecha_vep_pago_pdf';
                break;

            case 'despacho':
                fieldname = 's5_fecha_despacho_pdf';
                break;

            case 'factura':
                fieldname = 's9_fecha_facturacion_pdf';
                break;

        }
        if (fieldname) {
            await Database.setCCFieldValueAsNull(req.body.intsnum, fieldname, (err) => {
                if (err)
                    logger.error(err)

                return res.status(500).send(err);
            });
        }
        res.send('File uploaded!');
    });

});



app.post('/upload', async function (req, res) {
    logger.info('Method: (upload), body: (%s)', JSON.stringify(req.body));

    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let data = req.files.data;
    let filename = req.body.type + "_" + req.body.intsnum + '.pdf';
    let key = req.body.type + '/' + filename;


    var base64data = new Buffer(data.data, 'binary');
    var params = { Bucket: 'tracking.baireslogistic.com.ar', Key: key, Body: base64data };
    s3.upload(params, async function (err, data) {
        if (err) {
            logger.error(err)
            return res.status(500).send(err);
        }

        var fieldname = null;
        switch (req.body.type) {
            case 'invoice':
                fieldname = 's0_fecha_invoice_pdf';
                break;

            case 'bol':
                fieldname = 's0_fecha_bol_pdf';
                break;

            case 'packinglist':
                fieldname = 's0_fecha_packinglist_pdf';
                break;

            case 'simi':
                fieldname = 's1_fecha_simi_pdf';
                break;

            case 'solicitud':
                fieldname = 's2_fecha_solic_fondos_pdf';
                break;

            case 'vep':
                fieldname = 's2_fecha_vep_pago_pdf';
                break;

            case 'despacho':
                fieldname = 's5_fecha_despacho_pdf';
                break;

            case 'factura':
                fieldname = 's9_fecha_facturacion_pdf';
                break;

        }
        if (fieldname) {
            await Database.setCCFieldValueAsNow(req.body.intsnum, req.body.cliecod, fieldname, (err) => {
                if (err)
                    logger.error(err)

                return res.status(500).send(err);
            });
        }
        res.send('File uploaded!');
    });

});

app.post('/intervenciones', async function (req, res) {
    logger.info('Method: (intervenciones), body: (%s)', JSON.stringify(req.body));

    let intervenciones = req.body.intervenciones;
    console.log(intervenciones[0]);

    await Database.updateIntervenciones(req.body.operacion, req.body.cliecod, req.body.intervenciones, (err) => {
        if (err)
            logger.error(err)
    });

    await Database.setCCFieldValue(req.body.operacion, req.body.cliecod, 's25_observaciones', req.body.observaciones, (err) => {
        if (err)
            logger.error(err)
    });

    res.send('ok');
});


app.post('/arribo', async function (req, res) {
    logger.info('Method: (arribo), body: (%s)', JSON.stringify(req.body));

    await Database.setCCDateFieldValue(req.body.operacion, req.body.cliecod, 's3_fecha_arribo_mt', new Date(req.body.arribo), (err) => {
        if (err)
            logger.error(err)
    });

    await Database.setCCDateFieldValue(req.body.operacion, req.body.cliecod, 's3_fecha_cierre_ingreso', new Date(req.body.cierre), (err) => {
        if (err)
            logger.error(err)
    });

    await Database.setCCDateFieldValue(req.body.operacion, req.body.cliecod, 's3_fecha_forzoso', new Date(req.body.forzoso), (err) => {
        if (err)
            logger.error(err)
    });

    await Database.setCCFieldValue(req.body.operacion, req.body.cliecod, 's3_terminal', req.body.terminal, (err) => {
        if (err)
            logger.error(err)
    });

    await Database.setCCFieldValue(req.body.operacion, req.body.cliecod, 's3_tipo_transporte', req.body.tipo, (err) => {
        if (err)
            logger.error(err)
    });

    await Database.setCCFieldValue(req.body.operacion, req.body.cliecod, 's3_nombre_transporte', req.body.nombre, (err) => {
        if (err)
            logger.error(err)
    });

    res.send('ok');
});




app.post('/despacho', async function (req, res) {
    logger.info('Method: (despacho), body: (%s)', JSON.stringify(req.body));

    if (req.body.fverificacion) {
        await Database.setCCDateFieldValue(req.body.operacion, req.body.cliecod, 's5_fecha_verificacion', new Date(req.body.fverificacion), (err) => {
            if (err)
                logger.error(err)
        });
    }

    if (req.body.fcontroldocumental) {
        await Database.setCCDateFieldValue(req.body.operacion, req.body.cliecod, 's5_fecha_control_doc', new Date(req.body.fcontroldocumental), (err) => {
            if (err)
                logger.error(err)
        });
    }

    await Database.setCCFieldValue(req.body.operacion, req.body.cliecod, 's5_observaciones', req.body.observaciones, (err) => {
        if (err)
            logger.error(err)
    });
    res.send('ok');
});



app.post('/carga', async function (req, res) {
    logger.info('Method: (fechacarga), body: (%s)', JSON.stringify(req.body));

    if (req.body.fechacarga != null) {
        await Database.setCCDateTimeFieldValue(req.body.operacion, req.body.cliecod, 's6_fecha_carga', new Date(req.body.fechacarga), (err) => {
            if (err)
                logger.error(err)
        });
    }

    await Database.setCCFieldValue(req.body.operacion, req.body.cliecod, 's6_observaciones', req.body.observaciones, (err) => {
        if (err)
            logger.error(err)
    });

    await Database.modifyCustodias(req.body.operacion, req.body.cliecod, req.body.custodias, (err) => {
        if (err)
            logger.error(err)
    });

    if (!req.body.newcarga) {
        await Database.updateDetalles(req.body.operacion, req.body.detalles, req.body.flag, (err) => {
            if (err)
                logger.error(err)
        });
    }

    await Database.notifyClient(req.body.operacion, req.body.cliecod, 'sp_notify_salidacamiones', (err) => {
        if (err)
            logger.error(err)
    });

    res.send('ok');
});



app.post('/entrega', async function (req, res) {
    logger.info('Method: (entrega), body: (%s)', JSON.stringify(req.body));

    await Database.modifyCustodias(req.body.operacion, req.body.cliecod, req.body.custodias, (err) => {
        if (err)
            logger.error(err)
    });

    await Database.updateDetalles(req.body.operacion, req.body.detalles, req.body.flag, (err) => {
        if (err)
            logger.error(err)
    });


    await Database.notifyClient(req.body.operacion, req.body.cliecod, 'sp_notify_entregas', (err) => {
        if (err)
            logger.error(err)
    });

    res.send('ok');
});



app.post('/devolucion', async function (req, res) {
    logger.info('Method: (devolucion), body: (%s)', JSON.stringify(req.body));

    await Database.updateDetalles(req.body.operacion, req.body.detalles, req.body.flag, (err) => {
        if (err)
            logger.error(err)
    });

    await Database.notifyClient(req.body.operacion, req.body.cliecod, 'sp_notify_devoluciones', (err) => {
        if (err)
            logger.error(err)
    });
    res.send('ok');
});

/*
app.post('/facturacion', async function (req, res) {
    logger.info('Method: (facturacion), body: (%s)', JSON.stringify(req.body));

    if (req.body.ffacturacion.fecha != null) {
        let ffacturacion = new Date(Date.UTC(
            req.body.ffacturacion.fecha.year,
            req.body.ffacturacion.fecha.month - 1,
            req.body.ffacturacion.fecha.day,
            req.body.ffacturacion.hora.hour,
            req.body.ffacturacion.hora.minute));

        await Database.setCCDateTimeFieldValue(req.body.operacion, req.body.cliecod, 's9_fecha_facturacion', ffacturacion, (err) => {
            if (err)
                logger.error(err)
        });
    }
    res.send('ok');
});
*/

var server = app.listen(5000, function () {
    logger.info('Server is running..')
});
