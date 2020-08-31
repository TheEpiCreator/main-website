// When the user scrolls the page, execute myFunction
window.onscroll = () => { sticky() }

// Add the sticky class to the header when you reach its scroll position. Remove "sticky" when you leave the scroll position
function sticky() {
    //update sticky elements
    header = document.getElementById("navbar")
    mainImg = document.getElementById("topContainer")

    //if window scrolls past top of header
    if (window.pageYOffset > mainImg.offsetHeight) {
        //make header sticky
        header.classList.add("sticky")
        //activate spacer
        spacer.classList.remove("invisible")
    } else {
        //unstick header
        header.classList.remove("sticky")
        //deactivate spacer
        spacer.classList.add("invisible")
    }
} 