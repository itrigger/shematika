window.$ = require('jquery');
import Swiper from 'swiper/bundle';
import 'swiper/swiper-bundle.css';
import domtoimage from 'dom-to-image';


$(document).ready(function () {

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


  /*ВЫПАДАЮЩИЙ СПИСОК МЕНЮ ДЛЯ СМЕНЫ ТЕЛЕФОНА В ШАПКЕ*/
  let flag = 0;

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


  let categoriesAPI = {};
  let productsAPI = {};
  let rowsCount = 1;
  let $parentEl = $('.calculator');
  let totalPrice = 0;

  const GOLD = 2067.15 / 31.1;
  const SILVER = 28.2700 / 31.1;
  const PLATINUM = 986.00 / 31.1;
  const PALLADIUM = 2220.00 / 31.1;
  const USD = 73.4;


  const CONST_HOST = 'http://shematika';
  const CONST_CK = 'ck_4771acb3fb0f9a8a0aa4ff91508c51b479843f9a';
  const CONST_CS = 'cs_d4f6f902c2d7d3ec65159392fa6d245a2ce722cf';
  const $dropdown = $(".el-type-1");
  const $dropdownChild = $(".el-name-1");


  $dropdown.prop('disabled', 'disabled');
  $dropdownChild.prop('disabled', 'disabled');

  /*******************/
  /*****Notifier*******/
  /*******************/
  const notify = function (message, type = "success") {
    //type can be success or error
    $parentEl.append(`<div class='flex alert ${type}'>${message} <span class="closebtn">×</span></div>`)
    if (type === "success") {
      setTimeout(function () {
        $parentEl.find(".alert").remove();
      }, 3000);
    }
  }
  $(document).on('click', '.closebtn', function () {
    let $alert = $(this).parent();
    $alert.css({"opacity": "0", "height": "1px"});
    setTimeout(function () {
      $alert.css("display", "none")
    }, 600);
  })
  const delete_notify = function () {
    $('.alert').each(function () {
      let $alert = $(this);
      $alert.css({"opacity": "0", "height": "1px"});
      setTimeout(function () {
        $alert.remove();
      }, 600);
    })
  }
  const harddelete_notify = function (input) {
    $('.alert').each(function () {
      $(this).remove();
    })
    if (input) {
      input.removeClass("input-error");
    }
  }
  /****************/
  /****************/
  /****************/


  const isLoading = (cond) => {
    if (cond === 1) {
      $(".loader").css("opacity", "1");
    } else {
      $(".loader").css("opacity", "0");
    }
  }


  fetch(`${CONST_HOST}/wp-json/wc/v3/products/categories?consumer_key=${CONST_CK}&consumer_secret=${CONST_CS}&exclude=15`)
    .then(
      function (response) {
        isLoading(1);
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          notify("Возникла ошибка при получении данных! Попробуйте перезагрузить страницу или зайти позже.", "error");
          return;
        }

        // Examine the text in the response
        response.json().then(function (data) {
          console.log(data);
          categoriesAPI = data;
          $.each(categoriesAPI, function () {
            $dropdown.append($("<option />").val(this.id).text(this.name));
          });
          $dropdown.prop('disabled', false);
          isLoading(0);
        });
      }
    )
    .catch(function (err) {
      console.log('Fetch Error :-S', err);
      notify("Возникла ошибка при получении данных! Попробуйте перезагрузить страницу или зайти позже.", "error");
    });


  const fillParentSelect = function (id) {
    isLoading(1);
    delete_notify();
    let catID = $('.el-type-' + id).val();
    let $childDD = $('.el-name-' + id);
    $childDD.prop('disabled', 'disabled');

    fetch(`${CONST_HOST}/wp-json/wc/v3/products?consumer_key=${CONST_CK}&consumer_secret=${CONST_CS}&category=${catID}`)
      .then(
        function (response) {
          if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            notify("Возникла ошибка при получении данных! Попробуйте перезагрузить страницу или зайти позже.", "error");
            return;
          }

          response.json().then(function (data) {
            console.log(data);
            productsAPI = data;

            for (let key in productsAPI) {
              $childDD.empty();
              $.each(productsAPI, function () {
                $childDD.append($("<option />")
                  .val(this.id)
                  .text(this.name)
                  .attr({
                    'data-g': this.meta_data[0].value,
                    'data-s': this.meta_data[2].value,
                    'data-pt': this.meta_data[4].value,
                    'data-pd': this.meta_data[6].value,
                    'data-counttype': this.meta_data[8].value,
                  }));
              });
            }
            $childDD.prop('disabled', false);
            isLoading(0);
          });
        }
      )
      .catch(function (err) {
        console.log('Fetch Error :-S', err);
        notify("Возникла ошибка при получении данных! Попробуйте перезагрузить страницу или зайти позже.", "error");
      });

  }

  //run function on dynamic els
  $parentEl.on('change', '.el-type', function () {
    let id = $(this).parent().parent().attr("data-id");
    fillParentSelect(id);
  })

  $parentEl.on('change', '.el-name', function () {
    let id = $(this).parent().parent().attr("data-id");
    getPrice(id);
  })

  $parentEl.on('input', '.inputCount', function () {
    let id = $(this).parent().parent().parent().attr("data-id");
    let $errorInput = $('.inputCount-' + id);
    harddelete_notify($errorInput);
    getPrice(id);
  })

  // calculate total price
  const getTotalPrice = function () {
    totalPrice = 0;
    $parentEl.find('.row-total').each(function () {
      let temp = parseInt($(this).find('span').text(), 10);
      totalPrice += temp;
    })
    console.log(totalPrice);
    if (totalPrice > 0) {
      $(".els-total-price-num span").text(totalPrice.toFixed(2));
    } else {
      $(".els-total-price-num span").text("0");
    }

  }

  //price composing
  const getPrice = function (id) {
    let item_price = 0;
    let $inputText = $('.inputCount-' + id);
    let $childDD = $('.el-name-' + id);
    let item_gold = $('option:selected', $childDD).data('g');
    let item_silver = $('option:selected', $childDD).data('s');
    let item_platinum = $('option:selected', $childDD).data('pt');
    let item_palladium = $('option:selected', $childDD).data('pd');
    let weight;

    if ($inputText.val()) {
      weight = $('.inputCount-' + id).val()
    } else {
      notify("Не указано количество!", "error");
      $inputText.addClass('input-error');
    }

    item_price = (item_gold * GOLD + item_silver * SILVER + item_palladium * PALLADIUM + item_platinum * PLATINUM) * 0.4 * USD * weight;
    if (item_price > 0) {
      $('.row-total-' + id).find('span').text(Math.round((item_price + Number.EPSILON) * 100) / 100);
    } else {
      $('.row-total-' + id).find('span').text("0");
    }

    getTotalPrice();
  }


  $dropdownChild.on('change', function () {
    $('#itemprice').html(
      '<span>Au:' + $('option:selected', this).data('g') + ' </span>'
      + '<span>Ag:' + $('option:selected', this).data('s') + ' </span>'
      + '<span>Pt:' + $('option:selected', this).data('pt') + ' </span>'
      + '<span>Pd:' + $('option:selected', this).data('pd') + ' </span>'
    );
    if ($('option:selected', this).data('counttype') === 1) {
      $('#inputCount').attr("placeholder", "кг.");
    } else {
      $('#inputCount').attr("placeholder", "шт.");
    }
  });

//Adding new row
  $(".el-add-row-btn").on('click', function () {

    if ($('.els-row-' + rowsCount).find(".el-name").attr("disabled")) {
      harddelete_notify();
      notify("Заполните поля в предыдущей строке!", "error");
    } else {
      delete_notify();
      rowsCount += 1;
      $(".els-body").append('<div class="els-row els-row-' + rowsCount + '" data-id="' + rowsCount + '">\n' +
        '        <div class="els-del">×</div><div class="el-wrap">\n' +
        '          <select class="el-type el-type-' + rowsCount + '" name="el-type" disabled>\n' +
        '            <option disabled hidden selected value="">Выберите тип элемента</option>\n' +
        '          </select>\n' +
        '        </div>\n' +
        '        <div class="el-wrap">\n' +
        '          <select class="el-name el-name-' + rowsCount + '" name="el-name" disabled>\n' +
        '            <option disabled hidden selected value="">Наименование</option>\n' +
        '          </select>\n' +
        '        </div>\n' +
        '        <div class="el-wrap radio-group">\n' +
        '          <div class="itemprice"></div>\n' +
        '        </div>\n' +
        '        <div class="el-wrap labeled-input">\n' +
        '          <label>Количество\n' +
        '            <input placeholder="кг." type="text" value="" class="inputCount inputCount-' + rowsCount + '"/>\n' +
        '          </label>\n' +
        '        </div>\n' +
        '        <div class="el-wrap labeled-input input-dark to-right">\n' +
        '          <label>Сумма</label>\n' +
        '          <div class="row-total row-total-' + rowsCount + '"><span>0</span> ₽</div>\n' +
        '        </div>\n' +
        '      </div>');
      //fill select by stored API cats data
      let currentDD = $(".el-type-" + rowsCount);
      isLoading(1);
      $.each(categoriesAPI, function () {
        currentDD.append($("<option />").val(this.id).text(this.name));
      });
      currentDD.prop('disabled', false);
      isLoading(0);
    }
  })

  //Delete row
  $parentEl.on('click', '.els-del', function () {
    delete_notify();
    $(this).parent().remove();
    let visibleRowsCount = $('.els-body .els-row').length;
    if (visibleRowsCount > 1) {
      $('.els-row:last-child').prepend('<div class="els-del">×</div>');
    }
  })

});
/*https://woocommerce.github.io/woocommerce-rest-api-docs/?shell#list-all-products*/

/*
ck_670b652a9f73358f82c849217a0d2d5a61356840
cs_f6839273529302a1a530006eb82eabc0ada17edc
*/

// shematika/wp-json/wc/v3/products?consumer_key=ck_670b652a9f73358f82c849217a0d2d5a61356840&consumer_secret=cs_f6839273529302a1a530006eb82eabc0ada17edc


/*
* <script type="text/javascript">
jQuery(document).ready(function(){
     jQuery("#wpcf7-f3857-o1 form").submit(1);
});
</script>
*/
//*[@id="middlecol"]/div[5]/table/tbody/tr[4]/td[3]
/********/


$(document).ready(function () {
  $("#btn-Convert-Html2Image").on('click', function () {
    let element = document.querySelector("#table");
    domtoimage.toJpeg(element, {quality: 0.95})
      .then(function (dataUrl) {
        let link = document.createElement('a');
        link.download = 'my-image-name.jpeg';
        link.href = dataUrl;
        link.click();
      });
  });
});

/* ToDO
* 0. Максимальное кол-во строк в калькуляторе??
1. Парсинг цен
2. Калькуляция цены
3. Сохранение данных в локалсторэдж
4. Отправка данных на почту

--Проверка данных на недозаполненные поля
--Хранить данные в локалсторэдже и подгружать их в калькулятор всегда??*/
