$(function () {
    $grid = $('.masonry-wrapper').masonry({
        itemSelector: '.grid-item',
        columnWidth: '.grid-item',
        percentPosition: true,
        transitionDuration: 300,
    });

    $grid.imagesLoaded().progress( function() {
        $grid.masonry();
    });

    $('.navbar-toggler').on('click dblclick', function () {
        $('.sidebar, .page-holder').toggleClass('active');
    });

    lightbox.option({
        "disableScrolling": true
   });
});

// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);
