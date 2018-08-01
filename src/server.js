var config = require('../../config.json');

const express = require('express')
const app = express()

var proxy = require('express-http-proxy');

app.use('/proxy', proxy(config.jiraserver));
app.use(express.static('jira-backlog/src/public'));
app.get('/config', (req, res) => res.send(config));

app.listen(3000, () => console.log('App listening on port 3000!'))