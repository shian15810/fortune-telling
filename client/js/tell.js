/* eslint-env jquery */

$(() => {
  const hasData = (name, data) => {
    $('#success').html('<div class="alert alert-success">');
    $('#success > .alert-success').html('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;').append('</button>');
    $('#success > .alert-success').append(`</strong>${name}</strong>`);
    $('#success > .alert-success').append('很有可能會成為');
    $('#success > .alert-success').append(`<strong>${data.market}</strong>`);
    $('#success > .alert-success').append('公司哦！');
    $('#success > .alert-success').append('</div>');
  };
  const noData = () => {
    $('#success').html('<div class="alert alert-danger">');
    $('#success > .alert-danger').html('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;').append('</button>');
    $('#success > .alert-danger').append('伺服器忙碌中，請再試試！');
    $('#success > .alert-danger').append('</div>');
  };
  $('#contactForm input,#contactForm textarea').jqBootstrapValidation({
    preventSubmit: true,
    submitSuccess: ($form, event) => {
      $('#btnSubmit').attr('disabled', true);
      event.preventDefault();
      const name = $('input#name').val();
      $.ajax({
        url: `/tell?id=${name}`,
        type: 'GET',
        success: (data) => {
          if (!data.market) noData();
          if (data.market) hasData(name, data);
        },
        error: () => {
          noData();
        },
      });
    },
    filter: () => $(this).is(':visible'),
  });
  $('a[data-toggle=\'tab\']').click((e) => {
    e.preventDefault();
    $(this).tab('show');
  });
});
