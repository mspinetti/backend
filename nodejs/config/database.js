const sql = require('mssql');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug';

const USERS_TABLE = 'USERS_V2';
const AUDIT_TABLE = 'AUDIT';
const CARPET_CUSTOM_TABLE = 'CARPET_CUSTOM_V2';
const CARPET_CUSTOM_DETALLE_TABLE = 'CARPET_CUSTOM_V2_DETALLE';
const CARPET_CUSTOM_CUSTODIA_TABLE = 'CARPET_CUSTOM_V2_CUSTODIA';
const CARPET_CUSTOM_INTERVENCION_TABLE = 'CARPET_CUSTOM_V2_INTERVENCION';


module.exports = {
    secret: "xxxxxxxxx"
}

var config = {
    user: 'xxx',
    password: 'xxxxxxxxx',
    server: 'xx.xx.xx.xx',
    //    server: '192.168.0.2',
    database: 'DATABASE1',
    pool: {
        max: 10,
        min: 1,
        idleTimeoutMillis: 30000
    },
    options: {
        useUTC: false
    }

};


var config1 = {
    user: 'xx',
    password: 'xxxxx',
    server: 'xx.xx.xx.xx',
    database: 'xxxxxx',
    pool: {
        max: 10,
        min: 1,
        idleTimeoutMillis: 30000
    },
    options: {
        useUTC: false
    }

};

const Database = module.exports;

const pool = new sql.ConnectionPool(config);
const pool1 = new sql.ConnectionPool(config1);

connectToDatabases();


// ----------------------------------------------------------------------
// CMEBAIRES DATABASE (CARPET / MAGEAB / CLIENT / ITEMS, etc)
// ----------------------------------------------------------------------

function connectToDatabases() {
    logger.info("Conectando con CMEBAIRES")
    pool.connect(err => {
        if (err)
            logger.error('Error de conexion con CMEBAIRES')
    });
    logger.info("Conexion a CMEBAIRES OK")

    logger.info("Conectando con BALOG")
    pool1.connect(err => {
        if (err)
            logger.error('Error de conexion con BALOG')
    });
    logger.info("Conexion a BALOG OK")
}


// ----------------------------------------------------------------------
// CMEBAIRES DATABASE (CARPET / MAGEAB / CLIENT / ITEMS, etc)
// ----------------------------------------------------------------------

module.exports.getAllCarpetas = async function (cliecod, res, callback) {
    let result = null;
    let carpetas = [];

    logger.debug('getAllCarpetas');
    if (!pool.connected)
        connectToDatabases();

    try {

        if (cliecod == '*') {
            result = await pool.request()
                .query(`SELECT DISTINCT RTRIM(a.intsnum) as intsnum
                        FROM CARPET a
                        WHERE a.intsnum LIKE '701%'`)

        } else {
            result = await pool.request()
                .input('input_parameter', sql.NVarChar, cliecod)
                .query(`SELECT intsnum, 
                        RTRIM(IntsRefere) as IntsRefere, 
                        SUBSTRING(convert(varchar, IntsFecAlt, 126), 1,10) as IntsFecAlt
                    FROM CARPET 
                    WHERE cliecod= @input_parameter 
                    ORDER BY IntsFecAlt DESC, intsnum DESC`)

        }
        res.send(result.recordsets[0]);

    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}



module.exports.getAllClientes = async function (res, callback) {
    let result = null;

    logger.debug('getAllCarpetas');
    if (!pool.connected)
        connectToDatabases();

    try {
        result = await pool1.request()
            .query(`SELECT RTRIM(empresa) as empresa, RTRIM(cliecod) as cliecod
                        FROM USERS_V2 
                        WHERE usertype='C' ORDER BY empresa`)

        res.send(result.recordsets[0]);

    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}




module.exports.getCarpeta = async function (key, res, callback) {
    detail = [];
    stage = 0;

    logger.debug('getCarpeta, id: (%s)', key);
    if (!pool.connected)
        connectToDatabases();

    for (i = 0; i <= 10; i++)
        detail.push(null);

    try {

        // Buscar carpeta
        let result0 = await pool.request()
            .input('input_parameter', sql.NVarChar, key)
            .query(`SELECT 
                        a.intsnum, 
                        a.cliecod, 
                        a.IntsFecAlt, 
                        a.IntsRefere, 
                        a.IntsDocuNu, 
                        a.DestCod, 
                        a.IsegFecPag, 
                        RTRIM(ISNULL(a.IntsViaCod,'')) as IntsViaCod, 
                        RTRIM(ISNULL(a.IntsViaDes,'')) as IntsViaDes, 
                        b.ClieRazonS
                    FROM CARPET a
                    INNER JOIN CLIENT b ON b.cliecod = a.cliecod
                    WHERE intsnum = @input_parameter`);

        let carpet = result0.recordset[0];

        // Buscar MAGEAB
        let result1 = await pool.request()
            .input('input_parameter', sql.NVarChar, carpet.intsnum)
            .query(`SELECT MMintenum, MMAduaCod, MMDestina, MMestado, 
                    MMFecofi, MMIntsnum, MMReferenc, MMDJAIEsta, MMDespacho, MMCanal
                    FROM MAGEAB 
                    WHERE MMIntsnum = @input_parameter AND MMIntenum like '%SIMI%'`);

        let mageab1 = result1.recordset[0];

        // Buscar CARPET_CUSTOM_TABLE
        let result2 = await pool1.request()
            .input('input_parameter', sql.NVarChar, key)
            .query('SELECT * FROM ' + CARPET_CUSTOM_TABLE + ' WHERE intsnum = @input_parameter')

        let carpet_custom = result2.recordset[0];

        // Buscar CARPET_CUSTOM_DETALLE_TABLE
        let result2_1 = await pool1.request()
            .input('input_parameter', sql.NVarChar, key)
            .query('SELECT * FROM ' + CARPET_CUSTOM_DETALLE_TABLE + ' WHERE intsnum = @input_parameter')


        // Buscar CARPET_CUSTOM_DETALLE_TABLE
        let result2_2 = await pool1.request()
            .input('input_parameter', sql.NVarChar, key)
            .query('SELECT * FROM ' + CARPET_CUSTOM_CUSTODIA_TABLE + ' WHERE intsnum = @input_parameter')

        // Buscar CARPET_CUSTOM_INTERVENCION_TABLE
        let result2_3 = await pool1.request()
            .input('input_parameter', sql.NVarChar, key)
            .query('SELECT * FROM ' + CARPET_CUSTOM_INTERVENCION_TABLE + ' WHERE intsnum = @input_parameter')
        //        console.log (result2_3)

        // Buscar CARPET_CUSTOM_DETALLE_TABLE cargas pendientes
        let result2_4 = await pool1.request()
            .input('input_parameter', sql.NVarChar, key)
            .query('SELECT count(*) as count FROM ' + CARPET_CUSTOM_DETALLE_TABLE +
                ` WHERE intsnum = @input_parameter AND s6_fecha_salida_camion IS NULL`)

        // Buscar CARPET_CUSTOM_DETALLE_TABLE entregas pendientes
        let result2_5 = await pool1.request()
            .input('input_parameter', sql.NVarChar, key)
            .query('SELECT count(*) as count FROM ' + CARPET_CUSTOM_DETALLE_TABLE +
                ` WHERE intsnum = @input_parameter AND s7_fecha_entrega IS NULL`)

        // Buscar CARPET_CUSTOM_DETALLE_TABLE devoluciones pendientes
        let result2_6 = await pool1.request()
            .input('input_parameter', sql.NVarChar, key)
            .query('SELECT count(*) as count FROM ' + CARPET_CUSTOM_DETALLE_TABLE +
                ` WHERE intsnum = @input_parameter AND s8_fecha_dev_container IS NULL`)

        carpet_custom.detalles = result2_1.recordsets[0];
        carpet_custom.custodias = result2_2.recordsets[0];
        carpet_custom.intervenciones = result2_3.recordsets[0];
        carpet_custom.fsc_pendientes = result2_4.recordsets[0][0]
        carpet_custom.fec_pendientes = result2_5.recordsets[0][0]
        carpet_custom.fdc_pendientes = result2_6.recordsets[0][0]

        // Buscar DESPACHO MAGEAB
        let result3 = await pool.request()
            .input('input_parameter', sql.NVarChar, carpet.intsnum)
            .query(`SELECT MMintenum, 
                        MMAduaCod, 
                        MMDestina, 
                        MMestado, 
                        MMFecofi, 
                        MMIntsnum, 
                        MMReferenc, 
                        RTRIM(ISNULL(MMDJAIEsta,'')) as MMDJAIEsta, 
                        MMDespacho, 
                        RTRIM(ISNULL(MMCanal,'')) as MMCanal, 
                        RTRIM(ISNULL(MMViaMedio,'')) as MMViaMedio
                    FROM MAGEAB 
                    WHERE MMIntsnum = @input_parameter AND MMIntenum not like '%SIMI%'`);

        let mageab2 = result3.recordset[0];



        // Beginning of processing
        detail[0] = true;

        if (carpet_custom != undefined && carpet_custom.s1_simi_manual != undefined) {
            detail[1] = 'carpet_custom';
            stage = 1;
        }
        else {
            if (mageab1) {
                detail[1] = 'mageab';
                stage = 1;
            }
        }

        // stages 2, 3 y 4
        if (carpet_custom != undefined) {

            // Solicitud de fondos
            if (carpet_custom.s2_fecha_solic_fondos_pdf != undefined) {
                detail[2] = true;
                stage = 2;
            }

            // Intervenciones
            if (carpet_custom.intervenciones.length > 0) {
                detail[4] = true;
                stage = 2.5;
            }

            // Fecha de Arribo, Cierre y Forzoso
            if (carpet_custom.s3_fecha_arribo_mt != undefined) {
                detail[3] = true;
                stage = 3;
            }

        }

        // Oficializacion  de  Despacho (MAGEAB2)
        if (mageab2 != undefined) {
            detail[5] = true;
            stage = 5;
        }

        if (carpet_custom.s6_fecha_carga != undefined) {
            detail[6] = true;
            stage = 6;
        }

        // stages 6....10
        if (carpet_custom != undefined) {

            for (k = 0; k < carpet_custom.detalles.length; k++) {
                let detalle = carpet_custom.detalles[k];

                // Devolucion container
                if (detalle.s8_fecha_dev_container != undefined) {
                    detail[6] = true;
                    detail[7] = true;
                    detail[8] = true;
                    stage = 8;
                }
            }

            if (stage < 8) {
                for (k = 0; k < carpet_custom.detalles.length; k++) {
                    let detalle = carpet_custom.detalles[k];

                    // Fecha Entrega
                    if (detalle.s7_fecha_entrega != undefined) {
                        detail[6] = true;
                        detail[7] = true;
                        stage = 7;
                    }
                }
            }

            if (stage < 7) {
                for (k = 0; k < carpet_custom.detalles.length; k++) {
                    let detalle = carpet_custom.detalles[k];

                    // Fecha Carga
                    if (detalle.s6_fecha_salida_camion != undefined) {
                        detail[6] = true;
                        stage = 6;
                    }
                }
            }


            // Facturacion
            if (carpet_custom.s9_fecha_facturacion_pdf != undefined) {
                detail[9] = true;
                stage = 9;
            }
        }

        if (mageab1 == undefined)
            mageab1 = null;
        if (mageab2 == undefined)
            mageab2 = null;
        if (carpet_custom == undefined)
            carpet_custom = null;

        res.send({ data: carpet, mageab1: mageab1, mageab2: mageab2, carpet_custom: carpet_custom, stage: stage, h: detail });

    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}


// ----------------------------------------------------------------------
// AUDIT TABLE 
// ----------------------------------------------------------------------

module.exports.getUnreadNtfsForClient = async function (cliecod, res, callback) {

    if (!pool.connected)
        connectToDatabases();

    try {
        let result = await pool.request()
            .input('input_parameter', sql.NVarChar, cliecod)
            .query(`SELECT * from audit 
                    WHERE cliecod= @input_parameter and marked_read is null 
                    ORDER BY created DESC`)
        res.send(result.recordsets[0]);

    } catch (err) {
        logger.error(err)
        // ... error checks
    }

}


module.exports.markNotificationRead = async function (id, res, callback) {

    logger.debug('markNotificationRead');
    if (!pool.connected)
        connectToDatabases();

    try {
        let result = await pool1.request()
            .input('param1', sql.BigInt, id)
            .input('param2', sql.NVarChar, new Date().toLocaleString())
            .query('UPDATE AUDIT SET marked_read = @param2 WHERE id = @param1')

    } catch (err) {
        logger.error(err)
        // ... error checks
    }

}

module.exports.markAllNotificationsRead = async function (cliecod, res, callback) {

    logger.debug('markAllNotificationsRead');
    if (!pool.connected)
        connectToDatabases();

    try {
        let result = await pool1.request()
            .input('param1', sql.NVarChar, cliecod)
            .input('param2', sql.NVarChar, new Date().toLocaleString())
            .query(`UPDATE AUDIT 
                    SET marked_read = @param2 
                    WHERE marked_read is null AND cliecod = @param1`)

    } catch (err) {
        logger.error(err)
        // ... error checks
    }

}
// ----------------------------------------------------------------------
// USERS TABLE 
// ----------------------------------------------------------------------

module.exports.getUser = async function (email, callback) {

    logger.debug('getUser --> user: (%s)', email);
    if (!pool.connected) {
        connectToDatabases();
    }

    try {
        let result = await pool1.request()
            .input('input_parameter', sql.NVarChar, email.toLowerCase())
            .query('SELECT * FROM ' + USERS_TABLE + ' WHERE email = @input_parameter')
        callback(null, result.recordset[0]);

    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}

module.exports.updateUserPassword = async function (email, hash, callback) {

    logger.debug('updateUserPassword --> user: (%s)', email);
    if (!pool.connected)
        connectToDatabases();

    try {
        let result = await pool1.request()
            .input('param1', sql.NVarChar, email.toLowerCase())
            .input('param2', sql.NVarChar, hash)
            .query('UPDATE ' + USERS_TABLE + ' SET password = @param2 WHERE email = @param1')

        console.log(result)

    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}

module.exports.updateUserLastLoggedIn = async function (id, callback) {

    logger.debug('updateUserLastLoggedIn --> userid: (%d)', id);
    if (!pool.connected)
        connectToDatabases();

    try {
        let result = await pool1.request()
            .input('param1', sql.Int, id)
            .input('param2', sql.NVarChar, new Date().toLocaleString())
            .query('UPDATE ' + USERS_TABLE + ' SET lastloggedin = @param2 WHERE id = @param1')

    } catch (err) {
        logger.error(err)
        // ... error checks
    }

}

module.exports.updateUser = async function (user, callback) {

    logger.debug('updateUser --> userid: (%d)', user.id);
    if (!pool.connected)
        connectToDatabases();

    try {

        let setstring = `
             SET 
            notification_email = @notification_email,
            fullname = @fullname,
            stage0 = @stage0,
            stage10 = @stage10,
            stage20 = @stage20,
            stage25 = @stage25,
            stage30 = @stage30,
            stage50 = @stage50,
            stage52 = @stage52,
            stage60 = @stage60,
            stage65 = @stage65,
            stage70 = @stage70,
            stage75 = @stage75,
            stage80 = @stage80,
            stage90 = @stage90 
        `
        let myquery = 'UPDATE ' + USERS_TABLE + setstring + 'WHERE id = @id';

        let result = await pool1.request()
            .input('id', sql.BigInt, user.id)
            .input('notification_email', sql.NVarChar, user.notification_email)
            .input('fullname', sql.NVarChar, user.fullname)
            .input('stage0', sql.Bit, user.stage0)
            .input('stage10', sql.Bit, user.stage10)
            .input('stage20', sql.Bit, user.stage20)
            .input('stage25', sql.Bit, user.stage25)
            .input('stage30', sql.Bit, user.stage30)
            .input('stage50', sql.Bit, user.stage50)
            .input('stage52', sql.Bit, user.stage52)
            .input('stage60', sql.Bit, user.stage60)
            .input('stage65', sql.Bit, user.stage65)
            .input('stage70', sql.Bit, user.stage70)
            .input('stage75', sql.Bit, user.stage75)
            .input('stage80', sql.Bit, user.stage80)
            .input('stage90', sql.Bit, user.stage90)
            .query(myquery)

    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}
// ----------------------------------------------------------------------
// CARPET CUSTOM TABLE 
// ----------------------------------------------------------------------
module.exports.setCCFieldValueAsNow = async function (operacion, cliecod, fieldname, callback) {

    logger.debug('setCCFieldValueAsNow --> op: (%s)', operacion);
    if (!pool.connected)
        connectToDatabases();

    try {
        let myquery = 'UPDATE ' + CARPET_CUSTOM_TABLE + ' SET ' + fieldname + ' = @fecha WHERE intsnum = @op';
        logger.info(myquery + " ,op = " + operacion + ", fieldname= " + fieldname)
        // UPDATE RECORD
        let result1 = await pool1.request()
            .input('op', sql.NVarChar, operacion)
            .input('fecha', sql.DateTime, new Date())
            .query(myquery)

    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}


module.exports.setCCFieldValueAsNull = async function (operacion, fieldname, callback) {

    logger.debug('setCCFieldValueAsNull --> op: (%s)', operacion);
    if (!pool.connected)
        connectToDatabases();

    try {
        let myquery = 'UPDATE ' + CARPET_CUSTOM_TABLE + ' SET ' + fieldname + ' = NULL WHERE intsnum = @op';
        logger.info(myquery + " ,op = " + operacion + ", fieldname= " + fieldname)
        // UPDATE RECORD
        let result1 = await pool1.request()
            .input('op', sql.NVarChar, operacion)
            .query(myquery)

    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}

module.exports.setCCFieldValue = async function (operacion, cliecod, fieldname, value, callback) {

    logger.debug('setCCFieldValue --> op: (%s)', operacion);
    if (!pool.connected)
        connectToDatabases();

    try {
        let myquery = 'UPDATE ' + CARPET_CUSTOM_TABLE + ' SET ' + fieldname + ' = @value WHERE intsnum = @op';
        logger.info(myquery)

        // UPDATE RECORD
        let result1 = await pool1.request()
            .input('op', sql.NVarChar, operacion)
            .input('value', sql.NVarChar, value)
            .query(myquery)

    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}


module.exports.setCCDateFieldValue = async function (operacion, cliecod, fieldname, value, callback) {

    logger.debug('setCCDateFieldValue --> op: (%s)', operacion);
    if (!pool.connected)
        connectToDatabases();

    try {
        let myquery = 'UPDATE ' + CARPET_CUSTOM_TABLE + ' SET ' + fieldname + ' = @value WHERE intsnum = @op';
        logger.info(myquery)

        // UPDATE RECORD
        let result1 = await pool1.request()
            .input('op', sql.NVarChar, operacion)
            .input('value', sql.Date, new Date(value))
            .query(myquery)

    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}

module.exports.setCCDateTimeFieldValue = async function (operacion, cliecod, fieldname, value, callback) {

    logger.debug('setCCDateTimeFieldValue --> op: (%s), value: (%s)', operacion, value);
    if (!pool.connected)
        connectToDatabases();

    try {
        let myquery = 'UPDATE ' + CARPET_CUSTOM_TABLE + ' SET ' + fieldname + ' = @value WHERE intsnum = @op';
        logger.info(myquery)

        // UPDATE RECORD
        let result1 = await pool1.request()
            .input('op', sql.NVarChar, operacion)
            .input('value', sql.DateTime, new Date(value))
            .query(myquery)


    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}



// ----------------------------------------------------------------------
// STATS
// ----------------------------------------------------------------------
module.exports.getCountCarpetasPerMonth = async function (year, res, callback) {
    let result = null;
    let carpetas = [];

    logger.debug('getCountCarpetasPerMonth');
    if (!pool.connected)
        connectToDatabases();

    try {
        result = await pool.request()
            .input('year', sql.Int, year)
            .query(`SELECT MONTH(IntsFecAlt) as mes, count(*) as count
                    FROM CARPET
                    WHERE YEAR(IntsFecAlt) = @year
                    GROUP BY MONTH(IntsFecAlt)
                    ORDER BY MONTH(IntsFecAlt)`)

        res.send(result.recordsets[0]);

    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}





module.exports.getDistributionByStage = async function (mask, value, res, callback) {
    let result = [];

    logger.debug('getDistributionByStage');
    if (!pool.connected)
        connectToDatabases();

    try {

        // Operaciones
        result[0] = await pool.request()
            .input('mask', sql.NVarChar, mask)
            .input('value', sql.NVarChar, value)
            .query(`SELECT count(*) as count
                FROM CARPET c
                WHERE FORMAT(IntsFecAlt, @mask) = @value`);

        // SIMIs
        result[1] = await pool.request()
            .input('mask', sql.NVarChar, mask)
            .input('value', sql.NVarChar, value)
            .query(`SELECT count(*) as count
                FROM MAGEAB m
                WHERE FORMAT(m.MMFecOfi, @mask) = @value AND 
                      m.MMintenum LIKE '%SIMI%' AND
                      m.MMIntsnum is not null`);

        // Solicitiudes de fondos
        result[2] = await pool1.request()
            .input('mask', sql.NVarChar, mask)
            .input('value', sql.NVarChar, value)
            .query('SELECT count(*) as count FROM ' + CARPET_CUSTOM_TABLE + ' m WHERE FORMAT(m.s2_fecha_solic_fondos_pdf, @mask) = @value');

        // Despachos
        result[3] = await pool.request()
            .input('mask', sql.NVarChar, mask)
            .input('value', sql.NVarChar, value)
            .query(`SELECT count(*) as count
                    FROM MAGEAB m
                    WHERE FORMAT(m.MMFecOfi, @mask) = @value AND m.MMintenum NOT LIKE '%SIMI%'`);

        // Fechas de Carga
        result[4] = await pool1.request()
            .input('mask', sql.NVarChar, mask)
            .input('value', sql.NVarChar, value)
            .query('SELECT count(*) as count FROM ' + CARPET_CUSTOM_TABLE + ' m WHERE FORMAT(m.s6_fecha_carga, @mask) = @value');

        // Fechas de Salida de Camion
        result[5] = await pool1.request()
            .input('mask', sql.NVarChar, mask)
            .input('value', sql.NVarChar, value)
            .query(`SELECT count(*) as count
                    FROM CARPET_CUSTOM_V2_DETALLE m
                    WHERE FORMAT(m.s6_fecha_salida_camion, @mask) = @value`);

         // Fechas de Entrega
         result[6] = await pool1.request()
         .input('mask', sql.NVarChar, mask)
         .input('value', sql.NVarChar, value)
         .query(`SELECT count(*) as count
                 FROM CARPET_CUSTOM_V2_DETALLE m
                 WHERE FORMAT(m.s7_fecha_entrega, @mask) = @value`);

         // Fechas Dev. Container
         result[7] = await pool1.request()
         .input('mask', sql.NVarChar, mask)
         .input('value', sql.NVarChar, value)
         .query(`SELECT count(*) as count
                 FROM CARPET_CUSTOM_V2_DETALLE m
                 WHERE FORMAT(m.s8_fecha_dev_container, @mask) = @value`);
                 
        // Fechas de facturacion
        result[8] = await pool1.request()
            .input('mask', sql.NVarChar, mask)
            .input('value', sql.NVarChar, value)
            .query('SELECT count(*) as count FROM ' + CARPET_CUSTOM_TABLE + ' m WHERE FORMAT(m.s9_fecha_facturacion_pdf, @mask) = @value');

        // SIMIs sin operacion
        result[9] = await pool.request()
            .input('mask', sql.NVarChar, mask)
            .input('value', sql.NVarChar, value)
            .query(`SELECT count(*) as count
                        FROM MAGEAB m
                        WHERE FORMAT(m.MMFecOfi, @mask) = @value AND 
                        m.MMintenum LIKE '%SIMI%' AND
                        m.MMintsnum IS NULL`);

        // IDAs4 de Yamaha
        result[10] = await pool.request()
            .input('mask', sql.NVarChar, mask)
            .input('value', sql.NVarChar, value)
            .query(`SELECT count(*) as count
                        FROM MAGEAB m
                        WHERE FORMAT(m.MMFecOfi, @mask) = @value AND 
                        m.MMintenum LIKE '%IDA4%' AND
                        m.MMCliecod = '0227'`);

        res.send({
            ops: result[0].recordsets[0],
            simis: result[1].recordsets[0],
            solicitudes: result[2].recordsets[0],
            despachos: result[3].recordsets[0],
            fcargas: result[4].recordsets[0],
            fsalidascamion: result[5].recordsets[0],
            fentregas: result[6].recordsets[0],
            devoluciones: result[7].recordsets[0],
            facturaciones: result[8].recordsets[0],
            simissinop: result[9].recordsets[0],
            idas4yamaha: result[10].recordsets[0]
        });

    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}

module.exports.getOpsByClientWithMask = async function (mask, value, res, callback) {
    let result = null;

    logger.debug('getStats_Clientes');
    if (!pool.connected)
        connectToDatabases();

    try {
        result = await pool.request()
            .input('mask', sql.NVarChar, mask)
            .input('value', sql.NVarChar, value)
            .query(`SELECT TOP 20 RTRIM(d.ClieRazonS) as cliente, count(*) as count
                    FROM CARPET c
                    INNER JOIN CLIENT d ON (d.cliecod = c.cliecod)
                    WHERE FORMAT(c.IntsFecAlt, @mask) = @value
                    GROUP BY RTRIM(d.ClieRazonS)
                    ORDER BY count(*) DESC`)

        res.send(result.recordsets[0]);

    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}




// ----------------------------------------------------------------------
// CONTAINERS
// ----------------------------------------------------------------------

module.exports.updateContainers = async function (operacion, containers, callback) {
    let result = null;

    logger.debug('updateContainers --> op: (%s)', operacion);
    if (!pool.connected)
        connectToDatabases();

    try {

        //First delete all containers para la operacion
        let myquery = 'DELETE FROM ' + CARPET_CUSTOM_DETALLE_TABLE + ' WHERE intsnum = @op';
        logger.info(myquery)

        let result1 = await pool1.request()
            .input('op', sql.NVarChar, operacion)
            .query(myquery);

        if (containers.length == 0) {
            containers.push ({name: 'N/A'});
        }

        for (i = 0; i < containers.length; i++) {
            // INSERT CONTAINERS RECORD BY RECORD
            myquery = 'INSERT INTO ' + CARPET_CUSTOM_DETALLE_TABLE + ' (intsnum, identificador) VALUES (@op, @identificador)';
            logger.info(myquery);

            let result = await pool1.request()
                .input('op', sql.NVarChar, operacion)
                .input('identificador', sql.NVarChar, containers[i].name)
                .query(myquery);
        }

    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}


// ----------------------------------------------------------------------
// INTERVENCIONES
// ----------------------------------------------------------------------

module.exports.updateIntervenciones = async function (operacion, cliecod, intervenciones, callback) {
    let result = null;

    logger.debug('updateIntervenciones --> op: (%s)', operacion);
    if (!pool.connected)
        connectToDatabases();

    try {
        //First delete all intervenciones for operacion
        let myquery = 'DELETE FROM ' + CARPET_CUSTOM_INTERVENCION_TABLE + ' WHERE intsnum = @op';
        logger.info(myquery)

        let result1 = await pool1.request()
            .input('op', sql.NVarChar, operacion)
            .query(myquery);

        let iflag = false;
        for (i = 0; i < intervenciones.length; i++) {
            if (!intervenciones[i].status)
                continue;

            iflag = true;

            // INSERT INTERVENCIONES RECORD BY RECORD
            myquery = 'INSERT INTO ' + CARPET_CUSTOM_INTERVENCION_TABLE + ' VALUES (@op, @agente, @fpedido, @frecibido)';
            logger.info(myquery);

            let fpedido = null;
            if (intervenciones[i].fecha_pedido)
                fpedido = intervenciones[i].fecha_pedido.substring(0, 10);

            let frecibido = null;
            if (intervenciones[i].fecha_recibido)
                frecibido = intervenciones[i].fecha_recibido.substring(0, 10);

            let result = await pool1.request()
                .input('op', sql.NVarChar, operacion)
                .input('agente', sql.NVarChar, intervenciones[i].agente)
                .input('fpedido', sql.Date, new Date(fpedido))
                .input('frecibido', sql.Date, new Date(frecibido))
                .query(myquery);
        }

        if (iflag) {

            // NOTIFICAR AL CLIENTE SI TODAS LAS INTERVENCIONES ESTAN COMPLETAS
            let result = await pool1.request()
                .input('p_intsnum', sql.NVarChar, operacion)
                .input('p_cliecod', sql.NVarChar, cliecod)
                .execute('sp_notify_intervenciones');

        }


    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}


// ----------------------------------------------------------------------
// CUSTODIAS
// ----------------------------------------------------------------------

module.exports.modifyCustodias = async function (operacion, cliecod, custodias, callback) {
    let result = null;

    logger.debug('updateCustodias --> op: (%s)', operacion);
    if (!pool.connected)
        connectToDatabases();

    try {
        //First delete all intervenciones for operacion
        let myquery = 'DELETE FROM ' + CARPET_CUSTOM_CUSTODIA_TABLE + ' WHERE intsnum = @op';
        logger.info(myquery)

        let result1 = await pool1.request()
            .input('op', sql.NVarChar, operacion)
            .query(myquery);

        for (i = 0; i < custodias.length; i++) {

            // INSERT CUSTODIAS RECORD BY RECORD
            myquery = 'INSERT INTO ' + CARPET_CUSTOM_CUSTODIA_TABLE + ' VALUES (@op, @idcustodia, @fllegada, @fretiro)';
            logger.info(myquery);

            let x = null;
            if (custodias[i].frc == undefined)
                x = undefined;
            else
                x = new Date(custodias[i].frc);

            let result = await pool1.request()
                .input('op', sql.NVarChar, operacion)
                .input('idcustodia', sql.NVarChar, custodias[i].s6_idcustodia.toUpperCase())
                .input('fllegada', sql.DateTime, new Date(custodias[i].fllc))
                .input('fretiro', sql.DateTime, x)
                .query(myquery);
        }

    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}



// -------------------------------------------------------------------------------------------
// DETALLES  (pendiente implementar esta funcion)
// agregar un parametro para indicar si se esta actualizando en CARGA, ENTREGA o DEVCONTAINER
// asi se especifican claramente cuales campos actualizar
// otra opcion es no actualiar y guardar todo de nuevo pero puede ser mas lento
// ------------------------------------------------------------------------------------------

module.exports.updateDetalles = async function (operacion, detalles, flag, callback) {
    logger.debug('updateDetalles --> op: (%s, %s)', operacion, flag);
    if (!pool.connected)
        connectToDatabases();

    try {

        for (j = 0; j < detalles.length; j++) {
            let det = detalles[j];

            if (flag == 60) {
                if (det.s6_patente_camion != null) {

                    // UPDATE RECORD IN CARPET_CUSTOM_DETALLE_TABLE
                    myquery = 'UPDATE ' + CARPET_CUSTOM_DETALLE_TABLE +
                        ` SET s6_patente_camion = @patente, s6_fecha_salida_camion = @fsalida, s6_idcustodia = @custodia 
                    WHERE intsnum = @op AND identificador = @id`;

                    logger.info(myquery);

                    let result = await pool1.request()
                        .input('op', sql.NChar(10), det.intsnum)
                        .input('id', sql.NVarChar, det.identificador)
                        .input('patente', sql.NVarChar, det.s6_patente_camion.toUpperCase())
                        .input('fsalida', sql.DateTime, new Date(det.fsc))
                        .input('custodia', sql.NVarChar, det.s6_idcustodia)
                        .query(myquery);

                }
            }

            if (flag == 70) {
                if (det.fec != null) {

                    // UPDATE RECORD IN CARPET_CUSTOM_DETALLE_TABLE
                    myquery = 'UPDATE ' + CARPET_CUSTOM_DETALLE_TABLE +
                        ` SET s7_fecha_entrega = @fentrega WHERE intsnum = @op AND identificador = @id`;

                    logger.info(myquery);

                    let result = await pool1.request()
                        .input('op', sql.NChar(10), det.intsnum)
                        .input('id', sql.NVarChar, det.identificador)
                        .input('fentrega', sql.DateTime, new Date(det.fec))
                        .query(myquery);

                }
            }

            if (flag == 80) {
                if (det.fdc != null) {

                    // UPDATE RECORD IN CARPET_CUSTOM_DETALLE_TABLE
                    myquery = 'UPDATE ' + CARPET_CUSTOM_DETALLE_TABLE +
                        ` SET s8_fecha_dev_container = @fdev WHERE intsnum = @op AND identificador = @id`;

                    logger.info(myquery);

                    let result = await pool1.request()
                        .input('op', sql.NChar(10), det.intsnum)
                        .input('id', sql.NVarChar, det.identificador)
                        .input('fdev', sql.DateTime, new Date(det.fdc))
                        .query(myquery);

                }
            }


        }


    } catch (err) {
        console.log(err)
        logger.error(err)
        // ... error checks
    }
}



// ----------------------------------------------------------------------
// NOFITY EVENT TO CLIENT
// ----------------------------------------------------------------------

module.exports.notifyClient = async function (operacion, cliecod, procedure, callback) {
    let result = null;

    logger.debug('notifySalidaCamiones --> op: (%s)', operacion);
    if (!pool.connected)
        connectToDatabases();

    try {

        // NOTIFICAR AL CLIENTE SALIDA DE CAMIONES (65)
        let result = await pool1.request()
            .input('p_intsnum', sql.NVarChar, operacion)
            .input('p_cliecod', sql.NVarChar, cliecod)
            .execute(procedure);


    } catch (err) {
        logger.error(err)
        // ... error checks
    }
}

