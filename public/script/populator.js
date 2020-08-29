/**
 * This code is responsible for populating all pages in the site with common data (toolbar, font data, etc.) and page-specific data (title, text content, etc.)
 */

//set the url filepath for the site
var filepath = window.location.href.match(/(http|https|ftp):\/\/[\w\.\-~:]+(\/[\w\.\-~\/]+)$/)
//set url and handle no match
if(filepath) filepath = filepath[2]
else filepath = "/"
        
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
    //populate toolbar using toolbar data
    populateToolbar(toolbar, data.toolbar, "toolbar")
    //add fonts using toolbar data
    populateFonts(data.fonts)
    //add main content, select dir
    console.log(data.pageContents[filepath])
    populateContent(data.pageContents[filepath])
})

//ping server for theme palettes
ping("data/palettes.json", data => {
    //apply themes
    populateTheme(data.sandstonebeach_blue_orange)
})

/**
 * Populates toolbar with menu elements according to elementMap
 * @param {HTMLTag} toolbar The object to be populated
 * @param {Object|JSON} elementMap The information used to populate the toolbar
 * @param {String} prefix The prefix used in the element IDs and classes
 * @returns an array of the populated elements
 */
var populateToolbar = (toolbar, elementMap, prefix) => {
    //create toolbar|create header
    let header = new HTMLTag("header")
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
    return populatedElements
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
        console.warn("No content for current webpage, leaving blank")
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
                contentArray.push(new HTMLTag("h1", { class: "bigtext"}, undefined, [item.content]))
                break
        }
    }

    //create container for content
    console.log(contentArray)
    var contentContainer = new HTMLTag("main", { id: "contentContainer" }, undefined, contentArray)

    //set title
    document.getElementById("title").appendChild(document.createTextNode(content.title))

    //set image above toolbar if it exists
    if (content.mainImage) {
        var mainImage = new HTMLTag("img", { id: "mainImage", src: content.mainImage, alt: "placeholder image" })
        mainImage.toPosition("first")
    }

    //populate webcrawler directives
    document.getElementsByName("robots")[0].setAttribute("content", content.botDirectives)

    //return contents
    return contentArray
}

/**
 * Automatically creates a CSS element to set site's theme color palette
 * @param {Arrray} palette The array of hex colors
 */
var populateTheme = (palette) => {
    let themeTag = new CSSStyle({
        ":root": {
            "--palette-main": palette.main,
            "--palette-main-mod": palette.main_mod,
            "--palette-background": palette.background,
            "--palette-background-mod": palette.background_mod,
            "--palette-contrast": palette.contrast,
            "--palette-contrast-mod": palette.contrast_mod,
            "--palette-dark": palette.main_invert,
        }
    })
    themeTag.style.parent = document.body
    themeTag.style.toPosition("first")
}
