/**
 * This code is responsible for populating all pages in the site with common data (toolbar, font data, etc.) and page-specific data (title, text content, etc.)
 */

//set the url filepath for the site
var filepath = window.location.href.match(/(http|https|ftp):\/\/[\w\.\-~:]+(\/*[\w\.\-~\/]*)$/)
if (filepath) {
    //set domain
    if (filepath[0]) var domain = filepath[0]
    //set url and handle no match
    if (filepath[2]) filepath = filepath[2]
    else filepath = "/"
}

//theme
var theme = "dark"

ping = (path, callback) => {
    //ping server
    fetch(path).then(response => {
        // test for response (response.ok)
        if (response.ok) return response.json()
        //reject promise if response not ok
        return Promise.reject(response)
    }).then(callback).catch(error => {
        console.warn(`Failed to load resource ${path}: `, error)
    })
}
//ping server for population elements
ping("data/commonElements.json", data => {
    //add site content
    populateSite(data.site)
    //add main content, select dir
    populateContent(data.pageContents[filepath])
})

//ping server for theme palettes
ping("data/palettes.json", data => {
    //apply themes
    populateTheme(data)
})

/**
 * Switches image directory to match current screen size
 * @param {Object} image The image object
 * @returns {String} The correct image directory
 */
var switchImageRes = (image) => {
    //directory to eventually be returned
    let imageDir
    let width = window.screen.width
    switch (image.mode) {
        case "quality":
            if (width > 2560) {
                imageDir = "4"
            } else if (width > 1920) {
                imageDir = "3"
            } else if (width > 1280) {
                imageDir = "2"
            } else if (width > 400) {
                imageDir = "1"
            } else {
                imageDir = "0"
            }
        case "speed":
            if (width >= 3840) {
                imageDir = "4"
            } else if (width >= 2560) {
                imageDir = "3"
            } else if (width >= 1920) {
                imageDir = "2"
            } else if (width > 400) {
                imageDir = "1"
            } else {
                imageDir = "0"
            }
        case "balanced":
            if (width >= 3200) {
                imageDir = "4"
            } else if (width >= 2240) {
                imageDir = "3"
            } else if (width >= 1600) {
                imageDir = "2"
            } else if (width > 400) {
                imageDir = "1"
            } else {
                imageDir = "0"
            }
        default:
            if (width >= 3200) {
                imageDir = "4"
            } else if (width >= 2240) {
                imageDir = "3"
            } else if (width >= 1600) {
                imageDir = "2"
            } else if (width > 400) {
                imageDir = "1"
            } else {
                imageDir = "0"
            }
    }
    return `${image.src}/${imageDir}.${image.type}`
}

/**
 * Populates toolbar with menu elements according to elementMap
 * @param {HTMLTag} toolbar The object to be populated
 * @param {Object|JSON} elementMap The information used to populate the toolbar
 * @param {String} prefix The prefix used in the element IDs and classes
 * @returns an array of the populated elements
 */
var populateToolbar = (toolbar, elementMap, prefix) => {
    //create toolbar|create header
    var header = new HTMLTag("header", { id: "sticky" })
    //push header to top
    header.toPosition("first")
    //create container
    let toolbarContainer = new HTMLTag("div", { class: "toolbar-container" }, header.tag)

    //create image element
    //let toolbarImage = new HTMLTag("img", {src:"images/placeholder.jpg", alt:"toolbar image", class:"toolbar-image"}, toolbarContainer.tag)

    //create navbar element
    let navbarElement = new HTMLTag("nav", undefined, toolbarContainer.tag)
    //create toolbar list
    var toolbar = new HTMLTag("ul", { id: "toolbar", class: "toolbar" }, navbarElement.tag)



    let populatedElements = []

    //loop through array (and each element in the elementMap)
    for (var i = 0; i < elementMap.length; i++) {
        //do different things based on type
        switch (elementMap[i].type) {
            case "link":
                //create link element
                populatedElements.push(new HTMLTag("li", { class: "toolbar-item-container" }, toolbar.tag, [new HTMLTag("a", { class: "toolbar-item", href: elementMap[i].href }, undefined, [elementMap[i].name]).tag]))
                break
            case "button":
                //create button element
                populatedElements.push(new HTMLTag("li", { class: "toolbar-item-container" }, toolbar.tag, [new HTMLTag("button", { class: "toolbar-item", onclick: elementMap[i].onclick }, undefined, [elementMap[i].name]).tag]))
                break
            case "dropdown":
                //define content container for dropdown for later use
                let dropdownContentContainer = new HTMLTag("ul", { class: "toolbar-item" })
                //create dropdown menu and add content container as child
                populatedElements.push(new HTMLTag("li", { class: "toolbar-item-container" }, toolbar.tag, [elementMap[i].name, dropdownContentContainer.tag]))
                //populate dropdown menu
                populateToolbar(dropdownContentContainer, elementMap[i].contents, "dropdown")
                break
            default:
                console.warn("Unrecognized element type provided, appending nothing to toolbar")
                break
        }
    }
    let spacer = header.duplicate()
    spacer.attributes = { id: "spacer", class: "pseudo-invisible invisible" }
    return header
}

/**
 * Automatically creates HTML elements for loading custom fonts
 * @param {Array} fontLinks An array of hyperlinks leading to font files
 */
var populateFonts = (fontLinks) => {
    //loop through fonts
    for (var i = 0; i < fontLinks.length; i++) {
        //add fonts (ex. <link href="https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap" rel="stylesheet"> )
        new HTMLTag("link", { rel: "stylesheet", href: fontLinks[i] }, document.head)
    }
}

/**
 * Automatically creates and styles page-specific content
 * @param {Object} content An object containing all page-specific data
 * @returns {Array} An array of all of the HTML tags making up the page content
 */
var populateContent = (content) => {

    //don't do anything in case of no content
    if (!content) {
        console.warn("No content for current webpage, redirecting to 404 page")
        //prevent infinite loop if 404 page can't load
        if (filepath !== "/404") {
            window.location.replace("/404")
        }
        return
    }
    //create content
    let contentArray = []

    //format and add content to contentArray
    for (let item of content.mainContent) {
        //switch depending on type of content
        switch (item.type) {
            case "p" || "para" || "paragraph":
                //add <p> tag to contentArray
                contentArray.push(new HTMLTag("p", undefined, undefined, [item.content]).tag)
                break
            case "i" || "img" || "image":
                //add <img> tag
                ping(item.content, data => {
                    contentArray.push(imageQueue[item.content], 0, new HTMLTag("img", { src: data }).tag)
                })
                break
            case "bigtext" || "header 1" || "heading" || "h1":
                contentArray.push(new HTMLTag("h1", { class: "bigtext" }, undefined, [item.content]))
                break
        }
    }

    //create container for content
    var contentContainer = new HTMLTag("main", { id: "contentContainer" }, undefined, contentArray)

    //set title
    document.getElementById("title").appendChild(document.createTextNode(content.title))

    //set image above toolbar if it exists
    if (content.mainImage) {
        var mainImage = new HTMLTag("div", { id: "topContainer" }, undefined, [new HTMLTag("img", { id: "mainImage", src: switchImageRes(content.mainImage), alt: content.mainImage.alt }).tag])
        mainImage.toPosition("first")
    }

    //populate webcrawler directives
    document.getElementsByName("robots")[0].setAttribute("content", content.botDirectives)

    //return contents
    return contentArray
}

var populateSite = (data) => {
    //populate toolbar using toolbar data
    populateToolbar(toolbar, data.toolbar, "toolbar")
    //add fonts using toolbar data
    populateFonts(data.fonts)

    //log contents
    console.log(data.logWarn.text, data.logWarn.style)
}

/**
 * Automatically creates a CSS element to set site's theme color palette
 * @param {Arrray} palette The array of hex colors
 */
var populateTheme = (palette) => {
    if(!paletteStylesheet){
        var paletteStylesheet = new CSSStyle({})
    }
    //set style
    let style = {
        ":root": {
            "--main":palette[theme].main,
            "--main-mod":palette[theme].main_mod,
            "--background":palette[theme].background,
            "--background-mod":palette[theme].background_mod,
            "--contrast":palette[theme].contrast,
            "--contrast-mod":palette[theme].contrast_mod,
            "--main-invert":palette[theme].main_invert,
        }
    }
    paletteStylesheet.css = style
    return paletteStylesheet
}