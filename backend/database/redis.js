const { createClient } = require('redis');
require('dotenv').config();

const client = createClient({
    username: 'default',
    password: process.env.Redis_password,
    socket: {
        host: process.env.Redis_socket_host,
        port: process.env.Redis_socket_port
    }
});

client.on('ready', () => {
    console.log("Redis Connected");
});

client.on('error', (err) => {
    console.log(" Redis Error:", err);
});

async function redis_cache() {
    await client.connect();
}

module.exports = { client, redis_cache };