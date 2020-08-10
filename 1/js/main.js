window.$ = require('jquery');
import Swiper from 'swiper/bundle';
import 'swiper/swiper-bundle.css';
import domtoimage from 'dom-to-image';

const mySwiper = new Swiper('.swiper-container', {
  // Optional parameters
  direction: 'horizontal',
  loop: true,
  effect: "fade",
  fadeEffect: {
    crossFade: true
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
    renderBullet: function (index, className) {
      return '<span class="' + className + '"></span>';
    },
  }
});


$(document).ready(function () {


  /*ВЫПАДАЮЩИЙ СПИСОК МЕНЮ ДЛЯ СМЕНЫ ТЕЛЕФОНА В ШАПКЕ*/
  let flag = 0;

  /*  $('#getaddress .tabs_h').click(function() {
      var tab_id=jQuery(this).attr('id');
      tabClick(tab_id)
    });*/

  function tabClick(tab_id) {
    if (tab_id != $('#tabs .tabs_h.active').attr('id')) {
      $('#getaddress .tabs_h').removeClass('active');
      $('#getaddress .tabs').removeClass('active').css("opacity", "0");
      $('#getaddress #' + tab_id).addClass('active');
      $('#getaddress .top-contact__list__input').html("<i class='top-contact__list__input_marker sprite-marker'></i><i class='top-contact__list__input_arrow sprite-arr-down'></i>" + jQuery('#getaddress #' + tab_id).text());
      $('#getaddress #con_' + tab_id).addClass('active').animate({opacity: "1"}, 500);
    }
  }

  function hideList() {
    $(".selector-dd").animate({opacity: "0"}, 100).css({
      "display": "none",
      "width": "125px",
      "marginLeft": "4px"
    });
    flag = 0;
  };

  $(".selector").on("click", ".selector-title", function (event) {
    event.stopPropagation();
    if (flag === 0) {
      $(this).next().css("display", "block").animate({opacity: "1", width: "auto", marginLeft: "0px"}, 150);
      flag = 1;
    } else {
      hideList()
    }
  });
  /*  $("#getaddress").on("click", ".tabs_h", function(event){
      event.stopPropagation();
      hideList()
    });*/

  $('html').click(function () {
    hideList()
  });
  /*КОНЕЦ ВЫПАДАЮЩЕГО СПИСКА*/


})


/*
* document ready заполнить первый дропдаун данными
* при выборе значения заполнять второй дропдаун и поле (кг/шт)
*
* */


/********/
let catalog = {
  condensators: {
    title: "Конденсаторы",
    val: "condensators",
    values: "кг",
    items: {
      "RT3233": {
        title: "RT3233",
        val: "RT3233",
        gold: 5,
        silver: 0,
        platinum: 0,
        palladium: 0
      },
      "RT3234":
        {
          title: "RT3234",
          val: "RT3234",
          gold: 5,
          silver: 0,
          platinum: 0,
          palladium: 0
        }
    }
  },
  diods: {
    title: "Диоды",
    val: "diods",
    values: "кг",
    items: {
      "D01": {
        title: "D01",
        val: "D01",
        gold: 5,
        silver: 0,
        platinum: 0,
        palladium: 0
      },
      "D02":
        {
          title: "D02",
          val: "D02",
          gold: 5,
          silver: 0,
          platinum: 0,
          palladium: 0
        }
    }
  }
};

let categoriesAPI = {};
let productsAPI = {};


fetch('http://shematika/wp-json/wc/v3/products/categories?consumer_key=ck_670b652a9f73358f82c849217a0d2d5a61356840&consumer_secret=cs_f6839273529302a1a530006eb82eabc0ada17edc&exclude=15')
  .then(
    function (response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }

      // Examine the text in the response
      response.json().then(function (data) {
        console.log(data);
        categoriesAPI = data;
        $.each(categoriesAPI, function () {
          $dropdown.append($("<option />").val(this.id).text(this.name));
        });
      });
    }
  )
  .catch(function (err) {
    console.log('Fetch Error :-S', err);
  });


let parentSelect = '';

const $dropdown = $("#el-type");
const $dropdownChild = $("#el-name");

/*$.each(catalog, function() {
  $dropdown.append($("<option />").val(this.val).text(this.title));
});*/

$dropdown.on('change', function () {
  let catID = $(this).val();
  let result;

  //result = catalog.filter(obj => obj.val === temp);
  fetch(`http://shematika/wp-json/wc/v3/products?consumer_key=ck_670b652a9f73358f82c849217a0d2d5a61356840&consumer_secret=cs_f6839273529302a1a530006eb82eabc0ada17edc&category=${catID}`)
    .then(
      function (response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }

        response.json().then(function (data) {
          console.log(data);
          productsAPI = data;

          for (let key in productsAPI) {
            $dropdownChild.empty();
            $.each(productsAPI, function () {
              $dropdownChild.append($("<option />")
                .val(this.id)
                .text(this.name)
                .attr({
                  'data-g':this.meta_data[0].value,
                  'data-s':this.meta_data[2].value,
                  'data-pt':this.meta_data[4].value,
                  'data-pd':this.meta_data[6].value,
                }));
            });
          }
        });
      }
    )
    .catch(function (err) {
      console.log('Fetch Error :-S', err);
    });


})

$dropdownChild.on('change', function () {
  $('#itemprice').html(
    '<span>Au:'+$('option:selected',this).data('g')+' </span>'
    +'<span>Ag:'+$('option:selected',this).data('s')+' </span>'
    +'<span>Pt:'+$('option:selected',this).data('pt')+' </span>'
    +'<span>Pd:'+$('option:selected',this).data('pd')+' </span>'
  );

});


/*https://woocommerce.github.io/woocommerce-rest-api-docs/?shell#list-all-products*/

/*ck_670b652a9f73358f82c849217a0d2d5a61356840
cs_f6839273529302a1a530006eb82eabc0ada17edc*/

// shematika/wp-json/wc/v3/products?consumer_key=ck_670b652a9f73358f82c849217a0d2d5a61356840&consumer_secret=cs_f6839273529302a1a530006eb82eabc0ada17edc


/*
* <script type="text/javascript">
jQuery(document).ready(function(){
     jQuery("#wpcf7-f3857-o1 form").submit();
});
</script>
* */

/********/


$(document).ready(function() {
  $("#btn-Convert-Html2Image").on('click', function() {
    let element = document.querySelector("#table");
    domtoimage.toJpeg(element, { quality: 0.95 })
      .then(function (dataUrl) {
        let link = document.createElement('a');
        link.download = 'my-image-name.jpeg';
        link.href = dataUrl;
        link.click();
      });
  });
});
