$(document).ready(function () {
    $('#background').fadeIn(1000);
    $('#title').fadeIn(2000);
    $('#socialMedia').fadeIn(2000);
});

// $('#myCarousel').bind('mousewheel', function(e){
//     if(e.originalEvent.wheelDelta > 50) {
//         $(this).carousel('prev');
//     }
//     else if (e.originalEvent.wheelDelta < -50){
//         $(this).carousel('next');
//     }
// });
//
// var $item = $('.carousel-item'),
//     $numberofSlides = $item.length;
// var $wHeight = $(window).height(),
//     $wWidth = $(window).width();
//
// var $currentSlide = Math.floor((Math.random() * $numberofSlides));
// $item.eq($currentSlide).addClass('active');
// $item.height($wHeight);
// $item.width($wWidth);
// $item.addClass('full-screen');
//
// $('.carousel img').each(function() {
//   var $src = $(this).attr('src');
//   $(this).parent().css({
//     'background-image' : 'url(' + $src + ')',
//   });
//   $(this).remove();
// });
//
// $(window).on('resize', function (){
//   $wHeight = $(window).height();
//   $wWidth = $(window).width();
//   $item.height($wHeight);
//   $item.width($wWidth);
// });
//
// $("#menu-toggle").on("click", function(e) {
//     $("#wrapper").addClass("toggled");
// });
//
// $("#wrapper").on("mouseleave", function(e) {
//     $("#wrapper").removeClass("toggled");
// });
//
// // DROPDOWN MENU
// var dropdown = document.getElementsByClassName("dropdown");
// for (var i = 0; i < dropdown.length; i++) {
//   dropdown[i].addEventListener("click", function() {
//     this.classList.toggle("active");
//     var icon = $(".fa-angle-down", this)
//     var dropdownContent = this.nextElementSibling;
//     if (dropdownContent.style.display === "block") {
//       dropdownContent.style.display = "none";
//       $(icon).removeClass('fa-flip-vertical')
//     } else {
//       dropdownContent.style.display = "block";
//       $(icon).addClass('fa-flip-vertical')
//     }
//   });
// }
