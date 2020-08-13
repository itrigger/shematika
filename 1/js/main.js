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


  let categoriesAPI = {}; // объект где храним список категорий
  let productsAPI = {}; // объект где храним список продуктов
  let rowsCount = 1; // изначальное кол-во строк
  let $parentEl = $('.calculator'); // ссылка на родительскую обертку
  let totalPrice = 0; // начальное значение итоговой цены

  const GOLD = 2067.15 / 31.1; // здесь будут курсы драгметаллов и доллара делим на 31,1 для перевода из унций в кг
  const SILVER = 28.2700 / 31.1;
  const PLATINUM = 986.00 / 31.1;
  const PALLADIUM = 2220.00 / 31.1;
  const USD = 73.4;


  const CONST_HOST = 'http://shematika'; // храним ХОСТ
  const CONST_CK = 'ck_4771acb3fb0f9a8a0aa4ff91508c51b479843f9a'; // ключи аутентификации
  const CONST_CS = 'cs_d4f6f902c2d7d3ec65159392fa6d245a2ce722cf';
  const $dropdown = $(".el-type-1"); // начальные ссылки на селекты
  const $dropdownChild = $(".el-name-1");


  $dropdown.prop('disabled', 'disabled'); // отключаем селекты, пока в них не подгрузятся данные
  $dropdownChild.prop('disabled', 'disabled');

  /*******************/
  /*****Notifier*******/
  /*******************/
  //Собственный модуль уведомлений
  const notify = function (message, type = "success") { // type может быть success (по умолчанию) или error
    $parentEl.append(`<div class='flex alert ${type}'>${message} <span class="closebtn">×</span></div>`) // вставляем алерт в дом
    if (type === "success") { // если алерт об успешной операции, то автоматически прячем через 3 секунды
      setTimeout(function () {
        $parentEl.find(".alert").remove();
      }, 3000);
    }
  }
  $(document).on('click', '.closebtn', function () { // кнопка закрытия алерта
    let $alert = $(this).parent();
    $alert.css({"opacity": "0", "height": "1px"});
    setTimeout(function () {
      $alert.css("display", "none")
    }, 600);
  })
  const delete_notify = function (input) { // функция "мягкого" скрытия алертов (с анимацией). В качестве input передаем ссылку на элемент, у которого надо убрать класс input-error
    $('.alert').each(function () {
      let $alert = $(this);
      $alert.css({"opacity": "0", "height": "1px"});
      setTimeout(function () {
        $alert.remove();
      }, 600);
    })
    if (input) {
      input.removeClass("input-error");
    }
  }
  const harddelete_notify = function (input) { // тоже самое, только скрытие всех алертов без анимации (например, сркыть все алерты перед проверкой и в случае необходимости отобразить новый)
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

// небольшая функция скрывающая или показывающая анимированный лоадер
  const isLoading = (cond) => {
    if (cond === 1) {
      $(".loader").css("opacity", "1");
    } else {
      $(".loader").css("opacity", "0");
    }
  }


  // первоначальный запрос при загрузке страницы, чтобы заполнить первый селект данными
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

// заполняем дочерний селект при выборе опции в родительском
  const fillChildSelect = function (id, catId = 0) {
    isLoading(1); //Отображаем лоадер
    let thiscatID = 0;
    if (catId > 0) {
      thiscatID = catId;
      $('.el-type-' + id).val(catId);
    } else {
      thiscatID = $('.el-type-' + id).val(); // получаем ID категории
    }


    let $childDD = $('.el-name-' + id); // получаем ссылку на дочерний селект
    $childDD.prop('disabled', 'disabled'); // блокируем дочерний селект пока идет загрузка
    delete_notify($childDD); // удаляем все сообщения об ошибках и красную обводку с поля

    // запрос на АПИ
    fetch(`${CONST_HOST}/wp-json/wc/v3/products?consumer_key=${CONST_CK}&consumer_secret=${CONST_CS}&category=${thiscatID}`)
      .then(
        function (response) {
          if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            notify("Возникла ошибка при получении данных! Попробуйте перезагрузить страницу или зайти позже.", "error");
            return;
          }

          /**/
          response.json().then(function (data) {
            productsAPI = data;

            if (data.length) {
              $childDD.empty(); // очищаем селект
              for (let key in productsAPI) {
                // заполняем селект данными
                if (productsAPI.hasOwnProperty(key)) {
                  $childDD.append($("<option />")
                    .val(productsAPI[key].id)
                    .text(productsAPI[key].name)
                    .attr({
                      'data-g': productsAPI[key].meta_data[0].value,
                      'data-s': productsAPI[key].meta_data[2].value,
                      'data-pt': productsAPI[key].meta_data[4].value,
                      'data-pd': productsAPI[key].meta_data[6].value,
                      'data-counttype': productsAPI[key].meta_data[8].value, // 1 это килограммы, 2 это штуки
                    }));
                }
              }
              $childDD.prop('disabled', false);
              getPrice(id);
            } else {
              $childDD.empty(); // очищаем селект
              $childDD.append($("<option />")
                .val('')
                .text('Нет данных!')
              );
            }

            isLoading(0);
          });
          /**/

        }
      )
      .catch(function (err) {
        console.log('Fetch Error :-S', err);
        notify("Возникла ошибка при получении данных! Попробуйте перезагрузить страницу или зайти позже.", "error");
      });

  }

  const getItem = function (id, rowId, col) { //ID товара по каталогу, rowId номер строки в верстке, col вес или штуки для поля Кол-во
    fetch(`${CONST_HOST}/wp-json/wc/v3/products/${id}?consumer_key=${CONST_CK}&consumer_secret=${CONST_CS}`)
      .then(
        function (response) {
          if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            notify("Возникла ошибка при получении данных! Попробуйте перезагрузить страницу или зайти позже.", "error");
            return;
          }

          /**/
          response.json().then(function (data) {


            if (data) {
              console.log(data);
              console.log(data.categories[0].id);
              console.log(rowId);
              $(".inputCount-" + rowId).val(col);
              fillChildSelect(rowId, data.categories[0].id);


              /*  $childDD.empty(); // очищаем селект
                for (let key in productsAPI) {
                  // заполняем селект данными
                  if (productsAPI.hasOwnProperty(key)) {
                    $childDD.append($("<option />")
                      .val(productsAPI[key].id)
                      .text(productsAPI[key].name)
                      .attr({
                        'data-g': productsAPI[key].meta_data[0].value,
                        'data-s': productsAPI[key].meta_data[2].value,
                        'data-pt': productsAPI[key].meta_data[4].value,
                        'data-pd': productsAPI[key].meta_data[6].value,
                        'data-counttype': productsAPI[key].meta_data[8].value, // 1 это килограммы, 2 это штуки
                      }));
                  }
                }
                $childDD.prop('disabled', false);
                getPrice(id);*/
            } else {
              /* $childDD.empty(); // очищаем селект
               $childDD.append($("<option />")
                 .val('')
                 .text('Нет данных!')
               );*/
            }

            isLoading(0);
          });
          /**/

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
    fillChildSelect(id);
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
      let temp = parseFloat($(this).find('span').text());
      totalPrice += temp;
    })
    if (totalPrice > 0) {
      $(".els-total-price-num span").text(totalPrice.toFixed(2));
    } else {
      $(".els-total-price-num span").text("0");
    }
    saveToLS();
  }


  // save to local storage
  const saveToLS = function () {

    let temp = [];
    let rowsLength = $(".els-row").length;

    for (let i = 1; i <= rowsLength; i++) {
      let lsType = $('.els-row-' + i).find('.el-type option:selected').text();
      let lsName = $('.els-row-' + i).find('.el-name option:selected').text();
      let lsId = $('.els-row-' + i).find('.el-name option:selected').val().toString();
      let lsCount = $('.els-row-' + i).find('.inputCount').val().toString();
      let lsTypeOf = $('.els-row-' + i).find('.typeOfCount').text();
      let lsRowSumm = $('.els-row-' + i).find('.row-total span').text();
      temp[i - 1] = [lsId, lsType, lsName, lsCount, lsTypeOf, lsRowSumm];
    }

    localStorage.setItem('order', JSON.stringify(temp));

  }

  const getFromLs = function () {
    let arr = [];

    if (localStorage.length > 0) {
      arr = JSON.parse(localStorage.getItem('order'));

      for (let i = 0; i < arr.length; i++) {
        buildRow(arr[i][0], i + 1, arr[i][3]);
      }
    }
  }

  $(".send-btn-wrapper a").on('click', function (e) {

    getFromLs();
    e.stopPropagation();
    //buildRow(24,1,2);
  })


  /**/
  /**/
  /**/
  /**/
  /**/

  /*Построение формы данными из локального хранилища*/

  async function buildRow(id, rowCol, col) {
    isLoading(1);
    let $row;
    let catId = 0;
    rowsCount = rowCol;
    if (rowCol) {
      $row = $(".els-row-" + rowCol);
    } else {
      $row = $(".els-row-1");
    }
    if (rowCol && (rowCol === 1)) {

      await getItemById(id).then(item => {
        console.log(item)
        $row.find(".el-type").val(item.categories[0].id);
        catId = item.categories[0].id;
        /*
          console.log(data);
          console.log(data.categories[0].id);
          console.log(rowId);
          $(".inputCount-"+rowId).val(col);
          fillChildSelect(rowId, data.categories[0].id);
        */
      });

      console.log(catId);
      //тут await заполнения второго селекта
      await fillChildSelectById(rowCol, catId);
      $row.find(".inputCount").val(col);

      //формирование цены и пересчет итоговой суммы
      getPrice(rowCol);

    } else {
      for (let i = 2; i<=rowCol; i++) {
        console.log('iteration: '+i);
        await createRow(i);
        await getItemById(id).then(item => {
          console.log(item)
          $row.find(".el-type").val(item.categories[0].id);
          catId = item.categories[0].id;
        });
        //тут await заполнения второго селекта
        await fillChildSelectById(rowCol, catId);
        $row.find(".inputCount").val(col);

        //формирование цены и пересчет итоговой суммы
        //getPrice(rowCol);

      }

    }




  }

  async function getItemById(id) {
    try {
      let response = await fetch(`${CONST_HOST}/wp-json/wc/v3/products/${id}?consumer_key=${CONST_CK}&consumer_secret=${CONST_CS}`);
      let item = await response.json();
      isLoading(0);
      return item;
    } catch (err) {
      // перехватит любую ошибку в блоке try: и в fetch, и в response.json
      notify("При получении данных возникла ошибка! (" + err + ")", "error")
    }
  }

  async function fillChildSelectById(rowCol, catId = 0) {
    isLoading(1); //Отображаем лоадер
    let thiscatID = 0;
    if (catId > 0) {
      thiscatID = catId;
      $('.el-type-' + rowCol).val(catId);
    } else {
      thiscatID = $('.el-type-' + rowCol).val(); // получаем ID категории
    }

    let $childDD = $('.el-name-' + rowCol); // получаем ссылку на дочерний селект
    $childDD.prop('disabled', 'disabled'); // блокируем дочерний селект пока идет загрузка
    delete_notify($childDD); // удаляем все сообщения об ошибках и красную обводку с поля

    // запрос на АПИ
    try {
      let response = await fetch(`${CONST_HOST}/wp-json/wc/v3/products?consumer_key=${CONST_CK}&consumer_secret=${CONST_CS}&category=${thiscatID}`);
      let item = await response.json();
      console.log(item)
      isLoading(0);
      $childDD.empty(); // очищаем селект

      for (let key in item) {
        // заполняем селект данными
        if (item.hasOwnProperty(key)) {
          $childDD.append($("<option />")
            .val(item[key].id)
            .text(item[key].name)
            .attr({
              'data-g': item[key].meta_data[0].value,
              'data-s': item[key].meta_data[2].value,
              'data-pt': item[key].meta_data[4].value,
              'data-pd': item[key].meta_data[6].value,
              'data-counttype': item[key].meta_data[8].value, // 1 это килограммы, 2 это штуки
            }));
        }
      }
      $childDD.prop('disabled', false);
      // getPrice(id);
    } catch (err) {
      notify("При получении данных возникла ошибка! (" + err + ")", "error")
    }

  }


  //create a row
  async function createRow(rowId) {


        delete_notify();

        $(".els-body").append('<div class="els-row els-row-' + rowId + '" data-id="' + rowId + '">\n' +
          '        <div class="els-del">×</div><div class="el-wrap">\n' +
          '          <select class="el-type el-type-' + rowId + '" name="el-type" disabled>\n' +
          '            <option disabled hidden selected value="">Выберите тип элемента</option>\n' +
          '          </select>\n' +
          '        </div>\n' +
          '        <div class="el-wrap">\n' +
          '          <select class="el-name el-name-' + rowId + '" name="el-name" disabled>\n' +
          '            <option disabled hidden selected value="">Наименование</option>\n' +
          '          </select>\n' +
          '        </div>\n' +
          '        <div class="el-wrap radio-group">\n' +
          '          <div class="itemprice"></div>\n' +
          '        </div>\n' +
          '        <div class="el-wrap labeled-input">\n' +
          '          <label>Количество\n' +
          '            <input  type="text" value="1" class="inputCount inputCount-' + rowId + '"/> <span class="typeOfCount typeOfCount-' + rowId + '">кг.</span>\n' +
          '          </label>\n' +
          '        </div>\n' +
          '        <div class="el-wrap labeled-input input-dark to-right">\n' +
          '          <label>Сумма</label>\n' +
          '          <div class="row-total row-total-' + rowId + '"><span>0</span> ₽</div>\n' +
          '        </div>\n' +
          '      </div>');
        // заполнение родительского селекта уже полученными данными о категориях
        let currentDD = $(".el-type-" + rowId);
        isLoading(1);
        $.each(categoriesAPI, function () {
          currentDD.append($("<option />").val(this.id).text(this.name));
        });
        currentDD.prop('disabled', false);
        isLoading(0);

  }

  /**/
  /**/
  /**/
  /**/
  /**/


  //price composing
  const getPrice = function (id) {
    let item_price = 0;
    let $inputText = $('.inputCount-' + id);
    let $childDD = $('.el-name-' + id);
    let item_gold = $('option:selected', $childDD).data('g');
    let item_silver = $('option:selected', $childDD).data('s');
    let item_platinum = $('option:selected', $childDD).data('pt');
    let item_palladium = $('option:selected', $childDD).data('pd');
    let ItemTypeOf = $('option:selected', $childDD).data('counttype');
    let $childTypeOf = $('.typeOfCount-' + id); // получаем ссылку на дочерний селект
    let weight;

    if (ItemTypeOf === 1) {
      $childTypeOf.text('кг.');
    } else {
      $childTypeOf.text('шт.');
    }


    if ($inputText.val()) {
      weight = $inputText.val()
    } else {
      notify("Не указано количество!", "error");
      $inputText.addClass('input-error');
    }

    // Основная формула (0,4 кэф)
    item_price = (item_gold * GOLD + item_silver * SILVER + item_palladium * PALLADIUM + item_platinum * PLATINUM) * 0.4 * USD * weight;

    if (item_price > 0) {
      $('.row-total-' + id).find('span').text(Math.round((item_price + Number.EPSILON) * 100) / 100);
    } else {
      $('.row-total-' + id).find('span').text("0");
    }

    getTotalPrice();
  }


// Добавление новой строки
  $(".el-add-row-btn").on('click', function () {

    if ($('.els-row-' + rowsCount).find(".el-name").attr("disabled")) {
      harddelete_notify();
      notify("Заполните все поля!", "error");
      $('.els-row-' + rowsCount).find(".el-name").addClass('input-error');
    } else {
      if (!($('.inputCount-' + rowsCount).val())) {
        harddelete_notify();
        notify("Заполните все поля!", "error");
        $('.inputCount-' + rowsCount).find(".el-name").addClass('input-error');
      } else {
        let $errorInput = $('.els-row-' + rowsCount).find(".el-name");
        delete_notify($errorInput);
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
          '            <input  type="text" value="1" class="inputCount inputCount-' + rowsCount + '"/> <span class="typeOfCount typeOfCount-' + rowsCount + '">кг.</span>\n' +
          '          </label>\n' +
          '        </div>\n' +
          '        <div class="el-wrap labeled-input input-dark to-right">\n' +
          '          <label>Сумма</label>\n' +
          '          <div class="row-total row-total-' + rowsCount + '"><span>0</span> ₽</div>\n' +
          '        </div>\n' +
          '      </div>');
        // заполнение родительского селекта уже полученными данными о категориях
        let currentDD = $(".el-type-" + rowsCount);
        isLoading(1);
        $.each(categoriesAPI, function () {
          currentDD.append($("<option />").val(this.id).text(this.name));
        });
        currentDD.prop('disabled', false);
        isLoading(0);
      }
    }
  })

  // Удаление строки
  $parentEl.on('click', '.els-del', function () {
    delete_notify();
    $(this).parent().remove();
    let visibleRowsCount = $('.els-body .els-row').length;
    if (visibleRowsCount > 1) {
      $('.els-row:last-child').prepend('<div class="els-del">×</div>');
    }
    getTotalPrice(); // пересчет итоговой цены
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
1. Парсинг цен+++
2. Калькуляция цены+++
3. Сохранение данных в локалсторэдж
4. Отправка данных на почту
*
* в итерации
* 1. Из сохраненных данных заполнить первый селект
* 2. В первом селекте выбрать нужный оптион
* 3. Подгрузить во второй селект данные по ИД
* 4. Выбрать во втором селекте нужный оптион
* 5. Установить кол-во в инпут
* 6. Просчитать общую цену??
* 7. Создать новую строку
*
*/

