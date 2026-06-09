const bcrypt = require('bcrypt');
const saltRounds = 10;

async function Hashing(password) {

    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}

module.exports = Hashing;