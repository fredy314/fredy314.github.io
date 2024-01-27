(function () {
    'use strict';
    Lampa.Platform.tv();

    function hideItems() {
        var hide = Lampa.Storage.get('menu_hide', []);
        $('.wrap__left .menu__list .menu__item').removeClass('hidden');
        $('.wrap__left .menu__list .menu__item').each(function () {
            var name = $(this).text().trim();
            if (hide.indexOf(name) !== -1) {
                $(this).addClass('hidden');
            }
        });
    }

    function add() {
        Lampa.SettingsApi.addComponent({
            component: 'Multi_Menu_Component_conf',
            name: 'Настройка меню', //Задаём название меню
            icon: '<svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"/><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/><g id="SVGRepo_iconCarrier"><path d="M527.579429 186.660571a119.954286 119.954286 0 1 1-67.949715 0V47.542857a33.938286 33.938286 0 0 1 67.949715 0v139.190857z m281.380571 604.598858a119.954286 119.954286 0 1 1 67.949714 0v139.190857a33.938286 33.938286 0 1 1-67.949714 0v-139.190857z m-698.441143 0a119.954286 119.954286 0 1 1 67.949714 0v139.190857a33.938286 33.938286 0 0 1-67.949714 0v-139.190857zM144.457143 13.531429c18.797714 0 34.011429 15.213714 34.011428 33.938285v410.038857a33.938286 33.938286 0 0 1-67.949714 0V47.542857c0-18.724571 15.213714-33.938286 33.938286-33.938286z m0 722.139428a60.269714 60.269714 0 1 0 0-120.466286 60.269714 60.269714 0 0 0 0 120.466286z m698.514286-722.139428c18.724571 0 33.938286 15.213714 33.938285 33.938285v410.038857a33.938286 33.938286 0 1 1-67.949714 0V47.542857c0-18.724571 15.213714-33.938286 34.011429-33.938286z m0 722.139428a60.269714 60.269714 0 1 0 0-120.466286 60.269714 60.269714 0 0 0 0 120.466286z m-349.403429 228.717714a33.938286 33.938286 0 0 1-33.938286-33.938285V520.411429a33.938286 33.938286 0 0 1 67.949715 0v410.038857a33.938286 33.938286 0 0 1-34.011429 33.938285z m0-722.139428a60.269714 60.269714 0 1 0 0 120.539428 60.269714 60.269714 0 0 0 0-120.539428z" fill="#ffffff"/></g></svg>'
        });
        var hide = Lampa.Storage.get('menu_hide', []);
        $('.wrap__left .menu__list .menu__item').each(function () {
            var name = $(this).data('action');
            var text = $(this).text().trim();
            Lampa.SettingsApi.addParam({
                component: 'Multi_Menu_Component_conf',
                param: {
                    name: 'Multi_Menu_Component_conf_' + text,
                    type: 'trigger', //доступно select,input,trigger,title,static
                    default: false
                },
                field: {
                    name: 'Скрыть ' + $(this).text(),
                    description: 'Скрывает пункт в левом меню'
                },
                onChange: function (value) {
                    var hide = Lampa.Storage.get('menu_hide', []);
                    if (value === "true") {
                        if (hide.indexOf(text) === -1) {
                            hide.push(text);
                            Lampa.Storage.set('menu_hide', hide);
                        }
                    } else {
                        if (hide.indexOf(text) !== -1) {
                            hide.splice(hide.indexOf(text), 1);
                            Lampa.Storage.set('menu_hide', hide);
                        }
                    }
                    hideItems();
                }
            });
            if (hide.indexOf(text) !== -1) {
                Lampa.Storage.set('Multi_Menu_Component_conf_' + text, "true");
            } else {
                Lampa.Storage.set('Multi_Menu_Component_conf_' + text, "false");
            }
        });
        Lampa.Storage.listener.follow('change', function (e) {
            if (e.name == 'menu_hide') {
                $('.wrap__left .menu__list .menu__item').each(function () {
                    var text = $(this).text().trim();
                    if (e.value.indexOf(name) !== -1) {
                        Lampa.Storage.set('Multi_Menu_Component_conf_' + text, "true");
                    } else {
                        Lampa.Storage.set('Multi_Menu_Component_conf_' + text, "false");
                    }
                });
            }
        });
    }

    if (window.appready) add();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                add();
            }
        });
    }

})();
