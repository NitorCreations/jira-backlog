module.exports.server = function(port){

console.log(__dirname);

const config = require('../../config.json');

const express = require('express')
const proxy = require('express-http-proxy');

const app = express()

app.use('/proxy', proxy(config.jiraserver));
app.use(express.static('jira-backlog/src/public'));
app.get('/config', (req, res) => res.send(config));

app.listen(port, () => console.log('App listening on port '+port));

}
