/**
 * A collection of tools for representing HTML tags and CSS styles in JS and manipulating it.
 */

//The node/tag to which created elements are parented by default
const defaultParent = document.getElementById("visibleContent")

class HTMLTag {

    /**
     * @typedef ChildArray
     * @type {Array}
     * @property {String} [textContent] Text input (ex. ["this is a string", ...] => <tag>this is a string</tag>)
     * @property {HTMLElement} [property] A reference to an HTML element (usually a tag)
     */

    /**
     * Creates an HTML tag which can be referenced in JS
     * @param {String|HTMLElement} type The type of tag to be created ("p" => <p>, "a" => <a>, "ul" => <ul>, "div" => <div>, etc.) A preexisting tag can also be used as input.
     * @param {Object} [attributes] An object containing the attributes and their values (ex. {id:"thisIsAnID"} means <tag id="thisIsAnID"> will be created)
     * @param {HTMLElement} [parent] A reference to the HTML element under which the tag should be appended
     * @param {ChildArray} [children] An array containing references to HTML objects or String objects that should be appended as a child
     */
    constructor(type, attributes, parent, children) {
        //store input
        this._type = type
        this._attributes = attributes
        this._parent = parent
        this._children = children

        //skip construction if tag is defined
        if (type instanceof HTMLElement) {
            this._tag = type
            this._type = this._tag.tagName.toLowerCase()
        } else {
            //create element
            this._tag = document.createElement(this._type)
        }

        //only execute if attributes are defined
        if (this._attributes) {
            //format attribute object
            let attributeArray = Object.entries(this._attributes)

            //loop through and set attributes
            for (var i = 0; i < attributeArray.length; i++) {
                //set attributes
                this._tag.setAttribute(attributeArray[i][0], attributeArray[i][1])
            }
        }

        if (!this._parent) {
            //set parent to body
            this._parent = defaultParent
        }
        //set as child of parent object
        this._parent.appendChild(this._tag)

        //only execute if children are defined
        if (children) {
            //loops through all children elements
            children.forEach(element => {
                //switch based on whether children are defined as array of pointers or pointer or string
                if (typeof element === "string") { //child should be String
                    //append Textified string to tag
                    this._tag.appendChild(document.createTextNode(element))
                } else { //child should be HTMLElement
                    this._tag.appendChild(element)
                }
            })
        }
    }

    set attributes(attributes) {
        //store type before change for comparison
        let attributesOld = this._attributes
        //redefine type
        this._attributes = attributes
        //check if new type is different to avoid unnecesary performance drops
        if (this._attributes !== attributesOld) {
            //create temporary pointer to new tag
            let newTag = new HTMLTag(this.type, this._attributes, this.parent, this.children)
            //destroy old tag
            this.remove()
            //set permanent tag pointer to new tag
            this._tag = newTag.tag
        }
    }

    set parent(parent) {
        //store type before change for comparison
        let parentOld = this._parent
        //redefine type
        this._parent = parent
        //check if new type is different to avoid unnecesary performance drops
        if (this._parent !== parentOld) {
            //create temporary pointer to new tag
            let newTag = new HTMLTag(this.type, this.attributes, this._parent, this.children)
            //destroy old tag
            this.remove()
            //set permanent tag pointer to new tag
            this._tag = newTag.tag
        }
    }

    set children(children) {
        //store type before change for comparison
        let childrenOld = this._children
        //redefine type
        this._children = children
        //check if new type is different to avoid unnecesary performance drops
        if (this._children !== childrenOld) {
            //create temporary pointer to new tag
            let newTag = new HTMLTag(this.type, this.attributes, this.parent, this._children)
            //destroy old tag
            this.remove()
            //set permanent tag pointer to new tag
            this._tag = newTag.tag
        }
    }

    set type(type) {
        //store type before change for comparison
        let typeOld = this._type
        //redefine type
        this._type = type
        //check if new type is different to avoid unnecesary performance drops
        if (this._type !== typeOld) {
            //create temporary pointer to new tag
            let newTag = new HTMLTag(this._type, this.attributes, this.parent, this.children)
            //destroy old tag
            this.remove()
            //set permanent tag pointer to new tag
            this._tag = newTag.tag
        }
    }

    set tag(tag) {
        this._tag = tag
    }

    get type() {
        //update type | get tag name
        this._type = this.tag.tagName.toLowerCase()
        return this._type
    }

    get attributes() {
        //update attributes | create variable to store new attributes
        let newAttributes = {}
        //create variable to store tag attributes
        let oldAttributes = this.tag.attributes
        //loop through tag.attributes
        for (var i = 0; i < this.tag.attributes.length; i++) {
            //add attributes to newAttributes object
            newAttributes[oldAttributes[i].nodeName] = this.tag.getAttribute(oldAttributes[i].nodeName)
        }
        this._attributes = newAttributes
        return this._attributes
    }

    get parent() {
        this._parent = this.tag.parentNode
        return this._parent
    }

    get children() {
        //update attributes | create variable to store new attributes
        let childrenArray = []
        //create variable to store tag attributes
        let children = this.tag.childNodes
        //loop through tag.attributes
        for (var i = 0; i < children.length; i++) {
            //add attributes to newAttributes object
            childrenArray[i] = children[i]
        }
        this._children = childrenArray
        return this._children
    }

    /**
     * Gets the children of the [tag]'s parents, excluding [tag]
     */
    get relatives() {
        //use same method as children getter to set relatives
        let relativeArray = []
        let relatives = this.parent.children

        for (var i = 0; i < relatives.length; i++) {
            //exclude self
            if (relatives[i] !== this.tag) {
                relativeArray[i] = relatives[i]
            }
        }

        this._relatives = relativeArray
        return this._relatives
    }

    get tag() {
        return this._tag
    }

    /**
     * Duplicates object and all children
     * @returns {HTMLTag} Duplicated element
     */
    duplicate() {
        //clone self and format as HTMLTag
        let dupedTag = new HTMLTag(undefined, undefined, undefined, undefined, this.tag.cloneNode(true))
        dupedTag.parent = this.parent
        return dupedTag
    }

    /**
     * Reorders the tag's relatives so that the tag is in [position] position.
     * @param {Number|"first"|"last"} position The position in which to place the tag
     */
    toPosition(position) {
        //create fragment
        let fragment = document.createDocumentFragment()
        //create list of relatives
        let relativeList = this.relatives
        //test if position was "first" or "last"
        switch (position) {
            case "first":
                relativeList.splice(0, 0, this.tag)
                break
            case "last":
                relativeList.push(this.tag)
                break
            default:
                //splice tag into array at position
                relativeList.splice(position, 0, this.tag)
                break
        }

        for (let item of relativeList) {
            fragment.appendChild(item)
        }
        //use internal parent, using real parent when updating order causes error
        this._parent.appendChild(fragment)
    }

    /**
     * Removes the tag
     */
    delete() {
        this.remove()
    }

    /**
     * Removes the tag
     */
    remove() {
        this._tag.remove()
        this._tag = null
    }
}

class CSSStyle {
    //TODO: add documentation and comments
    constructor(styles) {
        this.html = new HTMLTag("style", { id: "generated-style", class: "generated-style" }, document.getElementById("invisibleContent"))
        this.css = styles
        this.html.parent = document.body
        this.html.toPosition("first")
    }
    set css(styles) {
        this._css = styles
        let finalStringArray = []
        for (let selector of Object.entries(styles)) {
            let styleArray = Object.entries(selector[1])
            let styleStringArray = ["", `${selector[0]} {`]

            for (let item of styleArray) {
                styleStringArray.push(`${item[0]}:${item[1]};`)
            }
            styleStringArray.push("}")
            styleStringArray.push("")
            finalStringArray.push(styleStringArray.join("\n"))
        }
        this.html.children = finalStringArray
    }
    get css() {
        return this._css
    }
}