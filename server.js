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
console.log('something')
let settings = JSON.parse(fs.readFileSync(`${__dirname}/settings.json`))
console.log('something')
if (typeof settings !== 'object') settings = { production: false }

//setup HTTPS
if (settings.production && settings.key_dir && settings.cert_dir) {
    var httpsOptions = {
        key: fs.readFileSync(settings.key_dir),
        cert: fs.readFileSync(settings.cert_dir)
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

if (settings.production) {
    https.createServer(httpsOptions, app)
        .listen(port, () => console.log(`Listening at port ${port}`))
} else {
    app.listen(port, () => console.log(`Listening at port ${port}`))
}