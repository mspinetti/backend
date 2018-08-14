const sql = require('mssql');
var async = require('async');
var nodeMailer = require("nodemailer");
var EmailTemplate = require('email-templates').EmailTemplate;


var config = {
    user: 'sa',
    password: 'forward8',
    server: '200.69.241.97',
    database: 'BALOG'
};

var sender = 'smtps://tracking%40bairesarg.com.ar'   // The emailto use in sending the email(Change the @ symbol to %40 or do a url encoding )
var password = 'Tr4ck1ng2018'  // password of the email to use
var baseUrl = 'http://trackingtest.baireslogistic.com.ar:4200'

var transporter = nodeMailer.createTransport(sender + ':' + password + '@smtp.gmail.com');

// create template based sender function
// assumes text.{ext} and html.{ext} in template/directory
var sendResetPasswordLink = transporter.templateSender(
    new EmailTemplate('./templates/resetPassword'), {
        from: 'tracking@bairesarg.com.ar',
    });


sendPasswordReset = function (email, tokenUrl) {
    // transporter.template
    sendResetPasswordLink({
        to: email,
        subject: 'Baires Logistic. Registracion de usuario en sistema de Tacking de Operaciones Online'
    }, {
            param1: email,
            param2: tokenUrl
        }, function (err, info) {
            if (err) {
                console.log(err)
            } else {
                console.log('Link sent\n' + JSON.stringify(info));
            }
        });
};

async function startApp() {
    try {
        let pool = await sql.connect(config)
        let result1 = await pool.request()
            //            .input('input_parameter', sql.Int, value)
            .query('SELECT * FROM AUDIT WHERE notified IS NULL ORDER BY CREATED')

        console.dir(result1)

        // Stored procedure

    } catch (err) {
        // ... error checks
    }
}

startApp();
sendPasswordReset('mspinetti@gmail.com', baseUrl + '/register');

