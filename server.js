const http2 = require('http2')
const http = require('http')
const https = require('https')
const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const fs = require('fs')
const { resolveMx } = require('dns')
const app = express()
//ports are as follows: [HTTP, HTTP-ALT (8080), HTTPS]
const ports = [80, 8080, 443]
//list of all active servers
var servers = []
const viewsDir = `${__dirname}/views`
const publicDir = `${__dirname}/public`
//load settings
let settings = JSON.parse(fs.readFileSync(`${__dirname}/settings.json`))
//handle loss of settings file
if (typeof settings !== 'object') settings = { production: false }

//setup HTTPS
if (settings.production && settings.key_dir && settings.cert_dir && settings.ca_dir) {
    var httpsOptions = {
        key: fs.readFileSync(settings.key_dir, 'utf-8'),
        cert: fs.readFileSync(settings.cert_dir, 'utf-8'),
        ca: fs.readFileSync(settings.ca_dir, 'utf-8')
    }
}
//set commonElements for later reference
fs.readFile(`${publicDir}/data/commonElements.json`, (err, data) => {
    if (err || !data) console.error("Error retrieving commonElements file:", err)
    else commonElements = data
})

//setup EJS
app.engine('ejs', ejs.renderFile)
app.set('view engine', 'ejs')

//setup libraries
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use((req, res, next) => {
    res.locals.user = req.user
    next()
})

//redirects when first entering site
app.get('/', (req, res) => {
    res.render(`${viewsDir}/index`)
})

//test page
app.get('/test', (req, res) => {
    res.render(`${viewsDir}/index`)
})

//webcrawler instructions
app.get('/robots.txt', (req, res) => {
    res.sendFile(`${publicDir}/data/robots.txt`)
})

//serve static for anything we don't care about
app.use(express.static(__dirname + '/public'))

//404 page
app.get('*', (req, res) => {
    res.render(`${viewsDir}/index`)
})

//classic + 8080
servers.push(http.createServer(app)
    .listen(ports[0], () => console.log(`HTTP:// Listening at port ${ports[0]}`)))
servers.push(http.createServer(app)
    .listen(ports[1], () => console.log(`HTTP:// Listening at port ${ports[1]}`)))
//secure
if (settings.production && httpsOptions) {
    servers.push(https.createSecureServer(httpsOptions, app)
        .listen(ports[2], () => console.log(`HTTPS:// Listening at port ${ports[2]}`)))
}