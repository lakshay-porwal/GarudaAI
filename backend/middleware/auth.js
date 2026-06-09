const jwt = require('jsonwebtoken');
const { client } = require('../database/redis');

async function Verify_user(req, res, next) {
    try {

        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const isBlacklisted =
            await client.get(`blacklist:${token}`);

        if (isBlacklisted) {
            return res.status(401).json({
                message: "Token is blacklisted"
            });
        }

        const decodedToken = jwt.verify(
            token,
            process.env.JWT_secret_key
        );

        req.userId = decodedToken.userId;

        next();

    } catch (err) {

        return res.status(401).json({
            message: "Invalid or Expired Token"
        });
    }
}

module.exports = Verify_user;