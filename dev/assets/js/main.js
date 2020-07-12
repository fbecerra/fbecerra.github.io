! function (e) {
    "use strict";

    function scrollSmoothTop() {
        if (('.scroll_down').length > 0) {
            //js for scroll to section content
            $('.scroll_down a[href^="#"], .go_to_top a[href^="#"]').on('click', function (event) {
                var target = $(this.getAttribute('href'));
                if (target.length) {
                    event.preventDefault();
                    $('html, body').stop().animate({
                        scrollTop: target.offset().top
                    }, 500);
                }
            });
        }
    }
    scrollSmoothTop();


    function testSlider() {
        if ($(".user_img_slider").length > 0) {
            $('.user_img_slider').slick({
                slidesToShow: 3,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 3000,
                arrows: false,
                vertical: true,
                verticalSwiping: true,
                centerMode: true,
                centerPadding: '0px',
                dots: false,
                asNavFor: '.test_details_slider',
                focusOnSelect: true,
                responsive: [
                    {
                        breakpoint: 991,
                        settings: {

                        }
                },
                    {
                        breakpoint: 768,
                        settings: {
                            arrows: false,
                            vertical: false,
                            verticalSwiping: false,
                        }
                },
                    {
                        breakpoint: 640,
                        settings: {
                            arrows: false,
                            slidesToShow: 1,
                            vertical: false,
                            verticalSwiping: false,
                        }
                }
                ]
            });
        }

        //js for latest_news_slider
        if ($(".test_details_slider").length > 0) {
            $('.test_details_slider').slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 3000,
                arrows: false,
                dots: false,
                asNavFor: '.user_img_slider',
                responsive: [
                    {
                        breakpoint: 991,
                        settings: {

                        }
                },
                    {
                        breakpoint: 768,
                        settings: {
                            arrows: false,
                        }
                }
                ]
            });
        }
    }
    testSlider();

    function heroBgSlider() {
        if ($('.bg_img_slider').length > 0) {
            //js for bg_img_slider
            $('.bg_img_slider').slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 2000,
                speed: 3000,
                arrows: false,
                dots: false,
                fade: true,
                responsive: [
                    {
                        breakpoint: 991,
                        settings: {

                        }
                },
                    {
                        breakpoint: 767,
                        settings: {
                            arrows: false,
                        }
                }
                ]
            });
        }
    }
    heroBgSlider();



    function selectLang() {
        if ($('.select_lang').length > 0) {
            $('.select_lang a').on('click', function () {
                $('.select_lang a').removeClass('active');
                $(this).addClass('active');
            });
        }
    }
    selectLang();


    $(window).on('scroll', function () {
        var $scTop = $(window).scrollTop();
        var $opcn = 1 - $scTop / 700;
        $(".hero_warp").css("opacity", $opcn);
        if ($opcn < 0) {
            $(".hero_warp").addClass('hide');
        } else {
            $(".hero_warp").removeClass('hide');
        }
        if ($scTop < 120) {
            $('.go_to_top').hide(300);
        } else {
            $('.go_to_top').show(300);
        }
    });


    function menUOpen() {
        if ($('.hamburger').length > 0) {
            $('.hamburger').on('click', function () {
                $('.header').toggleClass('menu_open');
                $('body').toggleClass('menu_open');
            });
        }
    }
    menUOpen();


    /*===========Portfolio isotope js===========*/
    function portfolio() {
        var $grid = $('.portfolio_single_wrap');
        if ($grid.length > 0) {
            $grid.imagesLoaded(function () {
                $grid.isotope({
                    itemSelector: '.portfolio_single_item',
                    percentPosition: true,
                    layoutMode: 'masonry',
                    masonry: {
                        // use outer width of grid-sizer for columnWidth
                        columnWidth: 1
                    }
                });
            });
        }
    }
    portfolio();


    function wowInit() {
        new WOW().init();
    }
    wowInit();

    function menuOpenOnHover() {
        if ($('.submenu').length > 0) {
            $('.submenu a').on('mouseenter', function (e) {
                $(this).find(' + .submenu_item').slideDown(500);
            });
            $('.submenu').on('mouseleave', function (e) {
                $(this).find('.submenu_item').slideUp(500);
            });
        }
    }
    //menuOpenOnHover();

    function tiltJsParallUx() {
        var windowWidth = $(window).width();
        if (windowWidth > 991) {
            $('.tilt').UniversalTilt({
                max: 35,
                perspective: 1500,
                mobile: false,
            });
        }
    }
    tiltJsParallUx();

    function bgVideo() {
        if ($("#bgndVideo").length > 0) {
            $("#bgndVideo").YTPlayer();
        }
    }
    bgVideo();



}(jQuery);
