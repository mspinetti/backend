const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Database = require('./../config/database');
const bcrypt = require('bcryptjs');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug';


// Register
router.post('/register', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    logger.debug ('registering user --> user: (s)', email)
    Database.getUser(email, (err, user) => {
        if (err) throw err;

        if (!user) {
            return res.json({ success: false, msg: 'Email invalido no registrado en el sistema' })
        }

        if (user && (user.password != null)) {
            return res.json({ success: false, msg: 'Usuario ya esta registrado! Utilice opcion de cambio de contraseña' })
        }

        // Aca es donde hago el alta inicial de la contraseña del usuario
        let hash = bcrypt.hashSync(password, 10);
        Database.updateUserPassword(email, hash, (err) => {
            if (err) throw err;

            return res.json({ success: true, msg: 'Registracion exitosa' });
        });
    })
});



// Authenticate
router.post('/authenticate', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    logger.debug ('Authenticating user --> user: (s)', email)
    Database.getUser(email, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({ success: false, msg: 'Usuario no registrado' })
        }

        if (bcrypt.compareSync(password, user.password)) {

            const token = jwt.sign(user, Database.secret, {
                expiresIn: '1d'
            });

            Database.updateUserLastLoggedIn (user.id, (err) => {
                if (err) throw err;
            });

            res.json({
                success: true,
                token: 'JWT ' + token,
                user: {
                    id: user.id,
                    fullname: user.fullname,
                    email: user.email,
                    notification_email: user.notification_email,
                    password: user.password,
                    cliecod: user.cliecod,
                    empresa: user.empresa,
                    usertype: user.usertype,
                    userrole: user.userrole,
                    lastloggedin: user.lastloggedin,
                    stage0: user.stage0,
                    stage10: user.stage10,
                    stage20: user.stage20,
                    stage25: user.stage25,
                    stage30: user.stage30,
                    stage50: user.stage50,
                    stage52: user.stage52,
                    stage60: user.stage60,
                    stage65: user.stage65,
                    stage70: user.stage70,
                    stage75: user.stage75,
                    stage80: user.stage80,
                    stage90: user.stage90
                }
            });
        } else {
            return res.json({ success: false, msg: 'Contraseña incorrecta' });
        }
    })

});


// Authenticate
router.post('/passwd', (req, res, next) => {
    const email = req.body.email;
    const currentpwd = req.body.currentpwd;

    logger.info('Method: (passwd), body: (%s)', JSON.stringify(req.body));

    Database.getUser(email, (err, user) => {
        if (err) throw err;

        if (!bcrypt.compareSync(currentpwd, user.password)) {
            return res.json({ success: false, msg: 'Contraseña actual incorrecta' });
        }

        // Aca es donde hago el alta inicial de la contraseña del usuario
        let hash = bcrypt.hashSync(req.body.newpassword, 10);
        Database.updateUserPassword(email, hash, (err) => {
            if (err) throw err;
        });
        return res.json({ success: true, msg: 'Actualizacion de contraseña exitosa' });
})
});



router.post('/update', (req, res, next) => {
    var user = req.body;
    logger.debug ('Updating user --> user: (s)', JSON.stringify(user))
    Database.updateUser(user, (err) => {
        if (err) throw err;
    })
    res.send('ok');
   
});



// Profile
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    logger.debug ('Profiling user')
    res.json({ user: req.user });
});


module.exports = router;