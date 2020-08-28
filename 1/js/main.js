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
          $dropdown.empty();
          $.each(categoriesAPI, function () {
            $dropdown.append($("<option />").val(this.id).text(this.name));
          });
          $dropdown.prop('disabled', false);
          isLoading(0);
        });

        /*Fill fields from localstorage*/
        let lsArr = [];
        if (localStorage.getItem('order') !== null) {
          lsArr = JSON.parse(localStorage.getItem('order'));
          getFromLs(lsArr).then(r => console.log('ok'));
        }
      }
    )
    .catch(function (err) {
      console.log('Fetch Error :-S', err);
      notify("Возникла ошибка при получении данных! Попробуйте перезагрузить страницу или зайти позже.", "error");
    });

 /*ToDO
     вызвать функцию определение цены для первого элемента во втором селекте
  */
// заполняем дочерний селект при выборе опции в родительском
  const fillChildSelect = function (id, catId = 0) {
    isLoading(1); //Отображаем лоадер
    let thiscatID = 0;
    let $row = $('.els-row-'+id);

    if (catId > 0) {
      thiscatID = catId;
      $row.find('.el-type').val(catId);
    } else {
      thiscatID = $row.find('.el-type').val(); // получаем ID категории
    }

    let $childDD = $row.find('.el-name'); // получаем ссылку на дочерний селект
    $childDD.prop('disabled', 'disabled'); // блокируем дочерний селект пока идет загрузка
    delete_notify($childDD); // удаляем все сообщения об ошибках и красную обводку с поля


    if (localStorage.getItem('category' + thiscatID) !== null) {

      let lsArr = [];
      lsArr = JSON.parse(localStorage.getItem('category' + thiscatID));

      $childDD.empty(); // очищаем селект

      for (const [i, arr] of lsArr.entries()) {
        $childDD.append($("<option />")
          .val(arr[0])
          .text(arr[2])
          .attr({
            'data-g': arr[3],
            'data-s': arr[4],
            'data-pt': arr[5],
            'data-pd': arr[6],
            'data-counttype': arr[7], // 1 это килограммы, 2 это штуки
          }).prop('selected', true));
      }

      $childDD.prop('disabled', false);
      getPrice(id);
      isLoading(0);
    } else {
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
              let temp = [];
              if (data.length) {
                $childDD.empty(); // очищаем селект
                let i = 0;
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
                      }).prop('selected', true));


                    //заполняем локальное хранилище

                    let lsId = productsAPI[key].id; //ID самой радиодетали
                    let lsCatId = productsAPI[key].categories[0].id; //Id категории
                    let lsName = productsAPI[key].name; //Имя детали
                    let lsMeta0 = productsAPI[key].meta_data[0].value; //Gold
                    let lsMeta2 = productsAPI[key].meta_data[2].value; //Silver
                    let lsMeta4 = productsAPI[key].meta_data[4].value; //Platinum
                    let lsMeta6 = productsAPI[key].meta_data[6].value; //Palladium
                    let lsMeta8 = productsAPI[key].meta_data[8].value; //Мера измерения (кг или шт)
                    temp[i] = [lsId, lsCatId, lsName, lsMeta0, lsMeta2, lsMeta4, lsMeta6, lsMeta8];
                  }
                  i++;
                }

                if (localStorage.getItem('category' + thiscatID) === null) {
                  localStorage.setItem('category' + thiscatID, JSON.stringify(temp));
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
  }

 /* const getItem = function (id, rowId, col) { //ID товара по каталогу, rowId номер строки в верстке, col вес или штуки для поля Кол-во
    fetch(`${CONST_HOST}/wp-json/wc/v3/products/${id}?consumer_key=${CONST_CK}&consumer_secret=${CONST_CS}`)
      .then(
        function (response) {
          if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            notify("Возникла ошибка при получении данных! Попробуйте перезагрузить страницу или зайти позже.", "error");
            return;
          }

          /!**!/
          response.json().then(function (data) {


            if (data) {
              console.log(data);
              console.log(data.categories[0].id);
              console.log(rowId);
              $(".inputCount-" + rowId).val(col);
              fillChildSelect(rowId, data.categories[0].id);

            } else {
              /!* $childDD.empty(); // очищаем селект
               $childDD.append($("<option />")
                 .val('')
                 .text('Нет данных!')
               );*!/
            }

            isLoading(0);
          });
          /!**!/

        }
      )
      .catch(function (err) {
        console.log('Fetch Error :-S', err);
        notify("Возникла ошибка при получении данных! Попробуйте перезагрузить страницу или зайти позже.", "error");
      });
  }*/

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

  // сохраняем данные в локальное хранилище
  const saveToLS = function () {

    let temp = [];
    let rowsLength = $(".els-row").length;

    for (let i = 1; i <= rowsLength; i++) {
      let $row = $('.els-row-' + i);
      let lsType = $row.find('.el-type option:selected').text(); //Название категории
      let lsName = $row.find('.el-name option:selected').text(); //Название самой радиодетали
      let lsId = $row.find('.el-name option:selected').attr('value').toString(); //ID самой радиодетали
      let lsCount = $row.find('.inputCount').val().toString(); //Кол-во радиодеталей
      let lsTypeOf = $row.find('.typeOfCount').text(); //Мера исчисления (1 - кг, 2 - штуки)
      let lsRowSum = $row.find('.row-total span').text(); //Сумма как (кол-во * меру исчесления)
      temp[i - 1] = [lsId, lsType, lsName, lsCount, lsTypeOf, lsRowSum];
    }

    localStorage.setItem('order', JSON.stringify(temp)); //превращаем все данные в строку и сохраняем в локальное хранилище

  }

  //Удаление строки из локального хранилища
  const removeFromLS = function (rowID) {
    let items = JSON.parse(localStorage.getItem('order'));
    const filteredItems = items.slice(0, rowID-1).concat(items.slice(rowID, items.length))
    localStorage.setItem('order', JSON.stringify(filteredItems));
  }


  //в эту функцию передаем объект из локального хранилища, где из него создаются и заполняются данными строки
  async function getFromLs(lsArr) {
    isLoading(1);
    for (const [i, arr] of lsArr.entries()) {
      //вызываем асинхронную функцию создания строки
      await buildRow(arr[0], i + 1, arr[3]);
    }
    //пересчитываем итоговую цену
    await getTotalPrice();
    isLoading(0);
  }

  //Кнопка ОФОРМИТЬ ЗАЯВКУ. Отсылает все данные на почту (через форму CF7)
  $(".send-btn-wrapper a").on('click', function (e) {
/*    let lsArr = [];
    if (localStorage.length > 0) {
      lsArr = JSON.parse(localStorage.getItem('order'));
    }
    getFromLs(lsArr).then(r => console.log('ok'));*/
    e.stopPropagation();
    //buildRow(24,1,2);
  })


  /**/
  /**/
  /**/
  /**/
  /**/

  /*Построение строки с данными из локального хранилища*/
  async function buildRow(id, rowCol, col) { //id элемента, rowCol порядковый номер создаваемой строки, col кол-во элементов данного типа
    isLoading(1);
    let $row;
    let catId = 0;
    rowsCount = rowCol

    if (rowCol) {

      if (rowCol > 1) {
        await createRow(rowCol);
        $row = $(".els-row-" + rowCol);
      }

      await getItemById(id).then(item => {
        $row.find(".el-type").val(item.categories[0].id);
        catId = item.categories[0].id;
      });

      //тут await заполнения второго селекта
      // Проверяем, был ли такой запрос, есть ли объект с данными уже в локальном хранилище
      if (localStorage.getItem('category' + catId) !== null) {
        let lsArr = [];

        lsArr = JSON.parse(localStorage.getItem('category' + catId));
        $row.find('.el-name').empty();
        for (const [i, arr] of lsArr.entries()) {
          $row.find('.el-name').append($("<option />")
            .val(arr[0])
            .text(arr[2])
            .attr({
              'data-g': arr[3],
              'data-s': arr[4],
              'data-pt': arr[5],
              'data-pd': arr[6],
              'data-counttype': arr[7], // 1 это килограммы, 2 это штуки
            }));
        }
        $row.find('.el-type').val(catId);
        $row.find('.el-name').val(id).prop('disabled', false).prop('selected', true);
        $row.find('.inputCount').val(col);
      } else {
        await fillChildSelectById(rowCol, catId).then(res => {
          $row.find('.el-name').val(id).prop('selected', true);
          $row.find('.inputCount').val(col);
        });
      }

      await getPrice(rowCol);
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
    let $row = $('.els-row-' + rowCol);
    console.log($row);
    if (catId > 0) {
      thiscatID = catId;
      $row.find('.el-type').val(catId);
    } else {
      thiscatID = $row.find('.el-type').val(); // получаем ID категории
    }

    let $childDD = $row.find('.el-name'); // получаем ссылку на дочерний селект
    $childDD.prop('disabled', 'disabled'); // блокируем дочерний селект пока идет загрузка
    delete_notify($childDD); // удаляем все сообщения об ошибках и красную обводку с поля

      // запрос на АПИ
      try {
        let response = await fetch(`${CONST_HOST}/wp-json/wc/v3/products?consumer_key=${CONST_CK}&consumer_secret=${CONST_CS}&category=${thiscatID}`);
        let item = await response.json();

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

  //простая функция добавления строки и заполнения первого селекта
  async function createRow(rowId) {
    delete_notify();

    $(".els-body").append('<div class="els-row els-row-' + rowId + ' collapsed" data-id="' + rowId + '">\n' +
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
    setTimeout(function () {
      $('.els-row-' + rowId).removeClass("collapsed");
    }, 100);

  }

  /**/
  /**/
  /**/
  /**/
  /**/


  //price composing
  const getPrice = function (id, countTotal) { //id - номер строки
    let item_price = 0;
    let $row = $('.els-row-' + id);
    let $inputText = $row.find('.inputCount');
    let $childDD = $row.find('.el-name');
    let item_gold = $('option:selected', $childDD).data('g');
    let item_silver = $('option:selected', $childDD).data('s');
    let item_platinum = $('option:selected', $childDD).data('pt');
    let item_palladium = $('option:selected', $childDD).data('pd');
    let ItemTypeOf = $('option:selected', $childDD).data('counttype');
    let $childTypeOf = $row.find('.typeOfCount'); // получаем ссылку на дочерний селект
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
      $row.find('.row-total span').text(Math.round((item_price + Number.EPSILON) * 100) / 100);
    } else {
      $row.find('.row-total span').text("0");
    }

    getTotalPrice();

  }

/*
*ToDo: Проверка некорректна, когда удалена строка из середины списка.
* Надо при удалении наверное переписывать классы. Либо надо хранить номер последней созданной строки
* Надо при удалении удалять из локального хранилища данные.
* +- Сделать плавное открытие новое строки
*/

// Добавление новой строки (тут проверка, заполнена ли предыдущая строка)
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
        $(".els-body").append('<div class="els-row els-row-' + rowsCount + ' collapsed" data-id="' + rowsCount + '">\n' +
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
        let currentDD = $('.els-row-' + rowsCount).find('.el-type');
        isLoading(1);
        $.each(categoriesAPI, function () {
          currentDD.append($("<option />").val(this.id).text(this.name));
        });
        currentDD.prop('disabled', false);
        isLoading(0);
        setTimeout(function () {
          $('.els-row-' + rowsCount).removeClass("collapsed");
        }, 100);

      }
    }
  })

  // Удаление строки
  $parentEl.on('click', '.els-del', function () {
    delete_notify();
    let rowId = $(this).parent().attr("data-id");

    $(this).parent().remove();

    removeFromLS(rowId);

    let visibleRowsCount = $('.els-body .els-row').length;
    if (visibleRowsCount > 1) {
      $('.els-row:last-child').prepend('<div class="els-del">×</div>');
    }
    rowsCount = rowsCount - 1;

    getTotalPrice(); // пересчет итоговой цены
  })

});

/*https://woocommerce.github.io/woocommerce-rest-api-docs/?shell#list-all-products*/

/*
ck_670b652a9f73358f82c849217a0d2d5a61356840
cs_f6839273529302a1a530006eb82eabc0ada17edc
*/


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
3. Сохранение данных в локалсторэдж+++
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
*/

