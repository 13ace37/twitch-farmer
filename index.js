const sql = require('sqlite3').verbose();

const database = new sql.Database('twitch_farmer.db');

database.run("CREATE TABLE IF NOT EXISTS channels (name TEXT, channel TEXT);");


const tmi = require('tmi.js');

const config = require('./config.json');

var farmer = new tmi.client({
    options: {
        debug: true
    },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: config.client.username,
        password: config.client.oauth
    },
    channels: ["Ninja", "PVPX", "LIRIK", "GamesDoneQuick", "BobRoss", "DrDisrespect"] // add some big twitch channels here for more efficiency
});

farmer.connect();

farmer.on("connected", function (address, port) {
    console.log("[LOG] connected to " + address + ":" + port);
    joinChannels();
});

function joinChannels() {
    database.all(`SELECT name FROM channels ORDER BY name`, [],(err, rows ) => {
        rows.forEach((row) => {
            setTimeout(function(){farmer.join(row.name);}, 100);
            
        });
    });
}

farmer.on("message", function (channel, userstate, message, self) {
    
    if (self) return;

    let user = "#"+userstate.username;

    if (farmer.channels.includes(user)) return;

    database.run(`INSERT INTO channels VALUES ("${userstate.username}", "${channel}")`);

    farmer.channels.push(user);

    farmer.join(user);

});