const express = require('express');
const app = new express();
const port = process.env.PORT || 3000;
const server = require('http').createServer(app);
const io = require('socket.io')(server)
const dir = __dirname;
const fs = require('fs');
const timers = require('timers');
const readline = require('readline');
const {
    google
} = require('googleapis');
const dateFormat = require('dateformat');
// let serverTime = new Date().getTime()-3*60*60*1000;
// console.log(dateFormat(serverTime, "HH:MM"));
let now = new Date();
// now.setHours(now.getHours + 3);
// console.log(dateFormat(now, "HH:MM"));
let twoHoursEarlier = now.getTime() - 2 * 60 * 60 * 1000;
let twoHoursAhead = now.getTime() + (2 * 60 * 60 * 1000);
global.full_address = '';
global.sent = 'N';
global.index = '.';
global.id = ".";
global.date = ".";
global.seller = ".";
global.city = ".";
global.address = ".";
global.seller_name = ".";
global.seller_phone = ".";
global.expert_name = ".";
global.expert_phone = ".";
global.meeting_date = ".";
global.meeting_time = ".";
global.sent_before = "";
global.happened = ".";
global.signed = ".";
global.undecided = ".";
global.reason = ".";
global.expert_sms_time = ".";
global.expert_sms_unix = ".";
global.second_seller_sms_date = ".";
global.second_seller_sms_time = ".";
global.second_seller_sms_unix = ".";
global.third_seller_sms_date = ".";
global.third_seller_sms_time = ".";
global.third_seller_sms_unix = ".";
let spreadsheetId = '1I6ADcGlCqYTH7bQD9v19FLvNcbZUjCkUiq82sgQHlnU';
let range = 'Format For Meetings!A:Y';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), listMajors);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {
        client_secret,
        client_id,
        redirect_uris
    } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
    const sheets = google.sheets({
        version: 'v4',
        auth
    });
    sheets.spreadsheets.values.get({
        spreadsheetId: '1I6ADcGlCqYTH7bQD9v19FLvNcbZUjCkUiq82sgQHlnU',
        range: 'Format For Meetings!A:Y',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            console.log('ID, Address:');
            rows.map((row) => {
                // console.log(`
                //     ${row[1]},
                //     Row  0: ${row[0]},
                //     Row  1: ${row[1]},
                //     Row  2: ${row[2]},
                //     Row  3: ${row[3]},
                //     Row  4: ${row[4]},
                //     Row  5: ${row[5]},
                //     Row  6: ${row[6]},
                //     Row  7: ${row[7]},
                //     Row  8: ${row[8]},
                //     Row  9: ${row[9]},
                //     Row  10: ${row[10]},
                //     Row  11: ${row[11]},
                //     Row  12: ${row[12]},
                //     Row  13: ${row[13]},
                //     Row  14: ${row[14]},
                //     Row  15: ${row[15]}`);
                // console.log(`${row[0]}, ${row[1]}, ${row[2]}, ${row[3]}, ${row[4]}, ${row[5]}, ${row[6]} , ${row[7]}, ${row[8]} , ${row[9]}, ${row[10]}, ${row[11]} `);
                // console.log(row[10] + "," + row[11]);
                // if (row[10] == dateFormat(now, "dd/mm/yyyy") && (row[11] >= dateFormat(twoHoursEarlier, "HH:MM") && row[11] <= dateFormat(twoHoursAhead, "HH:MM"))) {
                if (row[1] == id) {
                    index = row[0];
                    id = row[1];
                    date = row[2];
                    seller = row[3];
                    city = row[4];
                    address = row[5];
                    seller_name = row[6];
                    seller_phone = row[7];
                    expert_name = row[8];
                    expert_phone = row[9];
                    meeting_date = row[10];
                    meeting_time = row[11];
                    full_address = row[5] + "," + row[4];
                    sent_before = row[12];
                    happened = row[13];
                    signed = row[14];
                    undecided = row[15];
                    reason = row[16];
                    expert_sms_time = row[17];
                    expert_sms_unix = row[18];
                    second_seller_sms_date = row[19];
                    second_seller_sms_time = row[20];
                    second_seller_sms_unix = row[21];
                    third_seller_sms_date = row[22];
                    third_seller_sms_time = row[23];
                    third_seller_sms_unix = row[24];
                    sent = 'Y';
                    console.log(`Row  0: ${row[0]},
                    Row  1: ${row[1]},
                    Row  2: ${row[2]},
                    Row  3: ${row[3]},
                    Row  4: ${row[4]},
                    Row  5: ${row[5]},
                    Row  6: ${row[6]},
                    Row  7: ${row[7]},
                    Row  8: ${row[8]},
                    Row  9: ${row[9]},
                    Row  10: ${row[10]},
                    Row  11: ${row[11]},
                    Row  12: ${row[12]},
                    Row  13: ${row[13]},
                    Row  14: ${row[14]},
                    Row  15: ${row[15]},
                    Row  16: ${row[16]},
                    Row  17: ${row[17]},
                    Row  18: ${row[18]},
                    Row  19: ${row[19]},
                    Row  20: ${row[20]},
                    Row  21: ${row[21]},
                    Row  22: ${row[22]},
                    Row  23: ${row[23]},
                    Row  24: ${row[24]}`);
                }
                //   console.log(dateFormat(now, "isoDate"));
                //   console.log(dateFormat(now, "dd/mm/yyyy"));
                //   console.log(dateFormat(now, "HH:MM"));
                //   console.log(dateFormat(twoHoursAhead, "HH:MM"));
                //   console.log(dateFormat(twoHoursEarlier, "HH:MM"));
            });
        } else {
            console.log('No data found.');
        }
    });
}

// this is 

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(dir + '/index.html');
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), listMajors);
    });
    res.sendFile(dir + '/index.html');
});

app.get('/:id', (req, res) => {
    id = req.params.id;
    console.log(id);

    // var regex = /_/gi;
    // full_address = full_address.replace(regex, " ");
    // console.log(full_address);
    res.sendFile(dir + '/index.html');
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), listMajors);
    });
    res.sendFile(dir + '/index.html');
});

io.on('connection', function (socket) {
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), listMajors);
    });
    // if (sent_before == 'Y') {
        console.log(full_address, sent, index, id, date)
        socket.emit('change_address', {
            full_address: full_address,
            sent: sent,
            index: index,
            id: id,
            date: date,
            seller: seller,
            city: city,
            address: address,
            seller_name: seller_name,
            seller_phone: seller_phone,
            expert_name: expert_name,
            expert_phone: expert_phone,
            meeting_date: meeting_date,
            meeting_time: meeting_time,
            full_address: full_address,
            sent_before: sent_before,
            happened: happened,
            signed: signed,
            undecided: undecided,
            reason: reason,
            expert_sms_time: expert_sms_time,
            expert_sms_unix: expert_sms_unix,
            second_seller_sms_date: second_seller_sms_date,
            second_seller_sms_time: second_seller_sms_time,
            second_seller_sms_unix: second_seller_sms_unix,
            third_seller_sms_date: third_seller_sms_date,
            third_seller_sms_time: third_seller_sms_time,
            third_seller_sms_unix: third_seller_sms_unix
        });
    // } else {
    //     // do nothing if already sent
    // }
});

server.listen(port, () => {
    console.log("listening on port 3000");
});