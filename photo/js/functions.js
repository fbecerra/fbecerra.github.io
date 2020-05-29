;(function($) {

  'use strict'; // Using strict mode

  $('body').imagesLoaded( { background: '.hero' }, function() {

    var introTween = new TimelineMax()
      .to('#wrapper, .fadein, .hero', .7, {css:{autoAlpha:1}, onComplete: docLoaded});

    function docLoaded() {
      $('body').addClass('loaded');
    }

    // You can use anchor links, using the .anchor class
    $('.anchor').on('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      var href = $(this).attr('href');
      $('html,body').animate({
        scrollTop : $(href).offset().top+'px'
      });
    });

    // Responsive navigation

    $('.responsive-nav').on('click', function(e){
      $(this).toggleClass('active');
      $('.main-nav, .brand').toggleClass('active');
      $('.main-nav ul').slideToggle();
      if($('body').hasClass('no-scroll-after')){
        $('body').removeClass('no-scroll-after').addClass('no-scroll');
        return;
      }
      if($('body').hasClass('no-scroll')){
        $('body').removeClass('no-scroll').addClass('no-scroll-after');
        return;
      }
    });

    $('.main-nav li').hover(function(){
      $(this).addClass('hover');
    }, function(){
      $(this).removeClass('hover');
    });

    $('.main-nav a').on('click', function(e){
      $(this).parent().siblings().removeClass('hover');
      if(!$(this).hasClass('clicked') && $('.main-nav').hasClass('active') && $(this).parent().find('.dropdown').length){
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('clicked');
        $(this).parent().siblings().find('a').removeClass('clicked');
      } else {
        $('.main-nav li.hover').removeClass('hover');
      }
    });

    // Initialize functions on scroll
    $(window).on('scroll', function(){
      window.requestAnimationFrame(parallax); // Parallax
    });

    // Parallax background script, use the ".parallax" class.
    var parallaxSpeed = 0.15;

    function parallax(){
      // Parallax scrolling function
      $('.parallax').each(function(){
        var el = $(this);
        var yOffset = $(window).scrollTop(),
            parallaxOffset = yOffset * parallaxSpeed,
            parallaxOffset = +parallaxOffset.toFixed(2);
        if(el.hasClass('fs')){
          el.css('transform','translate3d(-50%,-'+(50-parallaxOffset*.15)+'%,0)');
        } else {
          el.css('transform','translate3d(0,'+parallaxOffset+'px,0)');
        }
      });
    }

    // Fix for some browsers with a broken back button
    $(window).bind("pageshow", function(event) {
        if (event.originalEvent.persisted) {
            window.location.reload()
        }
    });

    // Start animation
    var introTL = new TimelineLite,
        header = $('header');
    introTL.from(header, 1, {opacity:0, y: -100, ease:Power2.easeInOut},.6);

    // Smooth transition links
    $('body').on('click', 'a[href!=#][data-toggle!=tab][data-toggle!=collapse][target!=_blank][class!=anchor]', function(e){
      var href = $(this).attr('href');
      var fadeTween = new TimelineMax()
          .to('body', .5, {opacity: 0, ease: Power2.easeOut,onComplete:nextPage});
      function nextPage(){
        window.location = href;
      }
      e.preventDefault();
    });

    // Masonry grid
    var $grid = $('.img-grid');
    $grid.masonry({
      columnWidth: '.item-sizer',
      percentPosition: true
    });

    function gridReset(){
      $grid.masonry('layout');
    }

    gridReset();

    $('#filters a').on('click', function(e){
      var filter = $(this).attr('data-filter');
      $('#filters a').removeClass('active');
      $(this).addClass('active');
      $('.img-grid').find('.item:not('+filter+')').addClass('invis');
      $('.img-grid').find(filter).show(0).removeClass('invis');
      setTimeout(function(){
        $('.img-grid').find('.item:not('+filter+')').hide(0);
        gridReset();
      },300);
      e.preventDefault();
    });

    $('#filters').on('click', function(){
      setTimeout(function(){
        $('#filters').fadeOut();
      }, 500);
    });

    $('.category-trigger').on('click', function(e){
      $('#filters').fadeIn().css('display', 'flex');
    });

  });

  })(jQuery);
