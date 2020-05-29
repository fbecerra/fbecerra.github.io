;(function($) {

  'use strict'; // Using strict mode

  var controller = new ScrollMagic.Controller();
  var scroller = $('.img-scroller');
  var scrolleritem = $('.img-scroller li');
  var scrollerItems = $('.img-scroller li').length;
  var scrollIndex = 1;
  var scrollIndexCached = scrollIndex;
  var scrolled = 1;
  var controls = $('<div class="img-scroll-controls"><div class="img-up"></div><div class="img-down"></div></div>');
  var fadeInScroller = new TimelineMax().from(scroller.find('img'), 1, {css:{autoAlpha:0}},1.5);

  $('#wrapper').append(controls);

  $('body').on('click', '.img-scroll-controls .img-up', function(){
    if(scrollIndex != 1){
      scrollIndex--;
      scrolled = scrollIndex;
      scrollTrigger();
    }
  });

  $('body').on('click', '.img-scroll-controls .img-down', function(){
    if(scrollIndex < scrollerItems){
      scrollIndex++;
      scrolled = scrollIndex;
      scrollTrigger();
    }
  });

  // Call trigger function on load
  scrollTrigger();

  // The trigger function
  function scrollTrigger(){
    var newItem = scroller.find('li:nth-child('+scrollIndex+')');
    newItem.addClass('active').siblings().removeClass('active');
    scroller.animate({
      scrollTop: newItem.offset().top - scroller.offset().top + scroller.scrollTop()
    },1000,'easeInOutExpo');
    // Check buttons
    if(scrollIndex != 1)
      $('body').find('.img-scroll-controls .img-up').removeClass('disabled');
    else
      $('body').find('.img-scroll-controls .img-up').addClass('disabled');
    if(scrollIndex < scrolleritem.length)
      $('body').find('.img-scroll-controls .img-down').removeClass('disabled');
    else
      $('body').find('.img-scroll-controls .img-down').addClass('disabled');
  }

  var doMouseWheel = true;

  function mouseHandler(e,d){
    if(!doMouseWheel)
      return;
    setTimeout(turnWheelOff, 200);
    setTimeout(turnWheelBackOn, 1000);
    if(e.originalEvent.wheelDelta / 120 > 0 && scrolled > 1)
      scrolled = scrolled - 0.055;
    else if(scrolled <= scrollerItems)
      scrolled = scrolled + 0.055;
    scrollIndex = Math.round(scrolled);
    checkChange();
  }

  $('.img-scroller').bind('mousewheel', mouseHandler);

  function turnWheelBackOn() { doMouseWheel = true; }
  function turnWheelOff() { doMouseWheel = false; }

  function checkChange(){
    if(scrollIndexCached === scrollIndex){
      return;
    }
    scrollIndexCached = scrollIndex;
    scrollTrigger();
  }

  $('body').addClass('no-scroll');

  $(document).keydown(function(e){
    if (e.keyCode == 37 || e.keyCode == 38) { // If key is Up or Left arrow key
       if(scrollIndex != 1){
         scrollIndex--;
         scrollTrigger();
         scrolled = scrollIndex;
       }
       return false;
    }
    if (e.keyCode == 39 || e.keyCode == 40) { // If key is Down or Right arrow key
       if(scrollIndex < scrollerItems){
         scrollIndex++;
         scrollTrigger();
         scrolled = scrollIndex;
       }
       return false;
    }
  });

})(jQuery);
