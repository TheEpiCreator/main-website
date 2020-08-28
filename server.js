const https = require('https')
const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const fs = require('fs')
const { resolveMx } = require('dns')
const app = express()
const port = 8080
const viewsDir = `${__dirname}/views`
const publicDir = `${__dirname}/public`

let commonElements

//setup HTTPS
const httpsOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}

//set commonElements for later reference
fs.readFile(`${publicDir}/data/commonElements.json`, (err, data) => {
    if(err || !data) console.error("Error retrieving commonElements file:", err)
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

https.createServer(httpsOptions, app)
.listen(port, () => {
    console.log(`App listening on port ${port}`)
})