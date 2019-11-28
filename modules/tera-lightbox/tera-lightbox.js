/*

Tera Lightbox JS
Version 4.0
Made by Themanoid

*/

(function($) {

    "use strict"; // Strict mode

    var $lightboxContainer = $('<div id="lightbox"><div class="lightbox-inner"><div class="controls"><div class="galleryPrev"><span class="ion-ios-arrow-left"></span></div><div class="galleryNext"><span class="ion-ios-arrow-right"></span></div><div class="galleryClose ion-ios-close-empty fa-2x"></div></div></div>');
    if($('.lightbox').length)
        $('body').append($lightboxContainer);
    var $gallery = [],
        $galleryCaption = [],
        $galleryIndex = 0,
        $lightboxInner = $('body').find('.lightbox-inner');

    function isYoutube(url) {
      var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
      return (url.match(p)) ? RegExp.$1 : false;
    }

    function isVimeo(url) {
      var p = /player\.vimeo\.com\/video\/([0-9]*)/;
      return (url.match(p)) ? RegExp.$1 : false;
    }

    $('.lightbox').each(function(){ // For each lightbox link
        var href = $(this).attr('href');
        var caption = $(this).attr('data-caption');
        $gallery.push(href); // Push the img url to the gallery array
        $galleryCaption.push(caption);
        $(this).attr('data-index', $galleryIndex);
        $galleryIndex++; // Next index
        $(this).on('click', function(e){
            e.stopImmediatePropagation();
            loadLightbox($(this).attr('data-index'),href,caption);
            e.preventDefault();
        });
    });

    $('body').on('click', '.galleryClose', function(e) {
        $lightboxContainer.fadeOut(500, function(){
            $(this).find('.lightbox-item').remove(); // Remove contents
        }); // Fade out lightbox
    });

    $('html').on('click', 'body', function(e) {
       $lightboxContainer.fadeOut(500, function(){
            $(this).find('.lightbox-item').remove(); // Remove contents
        }); // Fade out lightbox
    });

    // Lightbox controls
    $('html').on('click', '.galleryNext, .galleryPrev', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        var curIndex = parseInt($('.lightbox-item').attr('data-index'));
        var newIndex;
        if($(this).hasClass('galleryNext'))
            newIndex = curIndex+1; // New index will be the next one
        else
            newIndex = curIndex-1; // New index will be the previous one
        if($gallery.length == newIndex) // If the last item is reached
            newIndex = 0; // Set index to the first one
        if(newIndex == -1) // If the first item is reached
            newIndex = $gallery.length-1; // Set it to the last item
        $('#lightbox [data-index]').css({
          'opacity': 0,
          'transform': 'scale(.95)',
          'transition': 'opacity .3s, transform .3s'
        });
        $('.galleryClose').css({
          'opacity' : 0,
        });
        setTimeout(function(){
          $('#lightbox [data-index]').attr('data-index', newIndex); // Give the image a new index
          loadLightbox(newIndex,$gallery[newIndex],$galleryCaption[newIndex]);
        }, 200);
    });

    $('html').on('keydown', 'body', function(e){
        // Esc to close lightbox
        if(e.keyCode === 27) {
           $lightboxContainer.fadeOut(500, function(){
                $(this).find('.lightbox-item').remove(); // Remove contents
            }); // Fade out lightbox
        }
        // Arrow keys for next/previous image
        else if (e.keyCode === 37 || e.keyCode === 39){
            e.preventDefault();
            e.stopImmediatePropagation();
            var curIndex = parseInt($('.lightbox-item').attr('data-index'));
            var newIndex;
            if(e.keyCode === 39)
                newIndex = curIndex+1; // New index will be the next one
            else
                newIndex = curIndex-1; // New index will be the previous one
            if($gallery.length == newIndex) // If the last item is reached
                newIndex = 0; // Set index to the first one
            if(newIndex == -1) // If the first item is reached
                newIndex = $gallery.length-1; // Set it to the last item
            $('#lightbox [data-index]').css({
              'opacity': 0,
              'transform': 'scale(.95)',
              'transition': 'opacity .3s, transform .3s'
            });
            $('.galleryClose').css({
              'opacity' : 0,
            });
            setTimeout(function(){
              $('#lightbox [data-index]').attr('data-index', newIndex); // Give the image a new index
              loadLightbox(newIndex,$gallery[newIndex],$galleryCaption[newIndex]);
            }, 200);
        }
    });

    function loadLightbox(index,href,caption){
        var $index = index,
            $lightboxItem,
            $lightboxCaption = $('<div class="caption">'+caption+'</div>');
        $lightboxContainer.find('.lightbox-item').remove();
        $lightboxContainer.find('.caption').fadeOut(200, function(){$(this).remove();});
        if(href.indexOf(".mp4") > -1){
          $lightboxItem = $('<video class="lightbox-item" autoplay loop data-index="'+$index+'"><source src="'+href+'" type="video/mp4"></video>');
          $lightboxInner.append($lightboxItem).parent().fadeIn().css('display','flex'); // Fade in lightbox
          setTimeout(function(){
            $('.lightbox-item').css({
              'opacity' : 1,
              'transform' : 'scale(1)'
            }); // Fade in video
          }, 500);
        }
        if(isYoutube(href) || isVimeo(href)) { // Check if it's Vimeo or YouTube
            $lightboxItem = $('<iframe class="lightbox-item" src="'+href+'" frameborder="0" allowfullscreen data-index="'+$index+'"/></iframe>');
            $lightboxInner.append($lightboxItem).parent().fadeIn().css('display','flex'); // Fade in lightbox
            setTimeout(function(){
              $('.lightbox-item').css({
                'opacity' : 1,
                'transform' : 'scale(1)'
              }); // Fade in video
            }, 500);
        }
        else {
            $lightboxItem = $('<img class="lightbox-item" src="'+href+'" data-index="'+$index+'"/>');
            $lightboxItem = $lightboxItem.load(function(){
                $lightboxInner.append($(this)).parent().fadeIn().css('display','flex'); // Fade in lightbox
                setTimeout(function(){
                  $lightboxItem.css({
                    'opacity' : 1,
                    'transform' : 'scale(1)'
                  }); // Fade in image
                }, 500);
            });
        }
        if(caption){
          $lightboxContainer.append($lightboxCaption)
          $lightboxCaption.delay(200).fadeIn(); // Fade in caption
        }
        setTimeout(function(){
          $('.galleryClose').css({
            'opacity' : 1
          });
        }, 1300);

    }

})(jQuery);
