const express = require('express')
const sha1 = require('sha1')
const DBClient = require('../utils/db')
const { v4 } = require('uuid')
const redisClient = require('../utils/redis')

const router = express.Router();

router.post('/users', async (req, res) => {
    const { email, pswd } = res.body;

    if(!email) {
        return res.status(400).json({'error': 'Missing email!'})
    };

    if(!pswd) {
        return res.status(400).json({'error': 'Missing password!'})
    };

    const users = await DBClient.usersCollection();
    const existingUser = await users.findOne({email});
    
    if(existingUser) {
        return res.status(400).json({'Error': 'User already existing'})
    };

    const new_user = await users.inserOne({
        email, password: sha1(password)
    });

    return res.status(201).json({
        id: new_user.insertedId.toString(),
        email: email,
    });
});


router.get('/connect', async (req, res) => {
    const headAuth = req.headers.authorization;

    if(!headAuth || !headAuth.startsWith('Basic ')) {
        return res.status(400).json({Error: 'Unauthorized'});
    };

    const Token = headAuth.split(' ')[1]
    const decoded = Buffer.from(Token, 'base64').toString('utf-8');
    const [email, password] = decoded.split(':')

    const user = DBClient.usersCollection.findOne({
        email: email, password: sha1(password)
    })

    if(!user) {
        return res.status(401).json({Error: 'Unauthorized'});
    };

    const new_token = v4()

    await redisClient.set(`auth_${new_token}`, user._id.toString(), 24*60*60);

    res.status(201).send(new_token)
});

router.post('/drops', async(req, res) => {
    const token = req.headers['x-token'];
    if(!token) {
        return null
    };
    
    const userId = redisClient.get(`auth_${token}`);
    if(!userId) {
        res.status(401).json({Error: 'Unauthorized'})
    };

    const { msg } = res.body;

    if(!msg) {
        return res.status(404).json({Error: 'Missing message'})
    }

    const tokenRead = v4()

    await redisClient.set(
        `drop_${tokenRead}`, JSON.stringify(userId, msg), 20*60
    )

    return res.status(201).json({tokenRead, readOnce: true})
});

router.get('/drops/:token', async() => {
    const { token } = req.params;
    const key = `drop_${token}`;

    const message = await redisClient.get(key);

    if(!data) {
        res.status(400).json({Error: 'Gone'})
    };
    await redisClient.del(key)

    const result = JSON.parse(message)
    return res.status(200).json({
        message: result.message,
    });
});

export default router;