/* eslint-env jquery */

(($) => {
  $('.page-scroll a').bind('click', (event) => {
    const $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: ($($anchor.attr('href')).offset().top - 50),
    }, 1250, 'easeInOutExpo');
    event.preventDefault();
  });
  $('body').scrollspy({
    target: '.navbar-fixed-top',
    offset: 51,
  });
  $('.navbar-collapse ul li a').click(() => {
    $('.navbar-toggle:visible').click();
  });
  $('#mainNav').affix({
    offset: {
      top: 100,
    },
  });
  $(() => {
    $('body').on('input propertychange', '.floating-label-form-group', (e) => {
      $(this).toggleClass('floating-label-form-group-with-value', !!$(e.target).val());
    }).on('focus', '.floating-label-form-group', () => {
      $(this).addClass('floating-label-form-group-with-focus');
    }).on('blur', '.floating-label-form-group', () => {
      $(this).removeClass('floating-label-form-group-with-focus');
    });
  });
})(jQuery);
