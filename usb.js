(function () {
    'use strict';
/*

    (function () {
        'use strict';

        tizen.filesystem.listStorages(function(result) {
            console.log(JSON.stringify(result));
        }, function() {
            console.log(JSON.stringify(error));
        });

        tizen.filesystem.addStorageStateChangeListener(function(result) {
            console.log(JSON.stringify(result));
        }, function(error) {
            console.log(JSON.stringify(error));
        });

    })();
    */

    function Component(object) {
        var html = Lampa.Template.js('client_usb_main'),
            head = html.find('.client-usb-main__head'),
            body = html.find('.client-usb-main__body');
        var listener_id, scroll, tree;

        this.create = function () {
            this.activity.loader(true);

            if (window.tizen) {
                scroll = new Lampa.Scroll({
                    mask: true,
                    over: true
                });
                scroll.minus(head);
                body.append(scroll.render(true));
                try {
                    if (!listener_id) {
                        listener_id = tizen.filesystem.addStorageStateChangeListener(result => {
                            console.log('usb', 'state changed');
                            this.drawDevices();
                        }, error => {
                            console.log('usb', JSON.stringify(error));
                        });
                        console.log('usb', 'addStorageStateChangeListener', listener_id);
                    }
                } catch (e) {
                    console.log('usb', 'addStorageStateChangeListener error: ', e.message);
                }
                this.drawDevices();
            } else {
                var empty = new Lampa.Empty({
                    descr: Lampa.Lang.translate('client_usb_nosuport')
                });
                html.empty();
                html.append(empty.render(true));
                this.start = empty.start;
            }

            this.activity.loader(false);
        };

        this.drawDevices = function () {
            var _this = this;

            var devices = [];

            try {
                tizen.filesystem.listStorages(result => {
                    result.forEach(element => {
                        if (element.type === "EXTERNAL" && element.state === "MOUNTED") {
                            devices.push(element);
                        }
                    });
                    this.drawDevicesAsync(devices);
                }, function () {
                    console.log(JSON.stringify(error));
                });
            } catch (e) {
                console.log('usb', 'listStorages error: ', e.message);
            }
        }

        this.drawDevicesAsync = function (devices) {
            var _this = this;
            scroll.clear();
            scroll.reset();

            if (devices.length) {
                console.log('usb', devices);
                devices.forEach(function (element) {
                    var item = Lampa.Template.js('client_usb_device');
                    item.find('.client-usb-device__name').text(element.label);
                    //item.find('.client-usb-device__ip').text(element.ipAddress);
                    item.on('hover:enter', function () {
                        tree = {
                            device: {name: element.label},
                            tree: [{title:"/", url: element.label+"/"}]
                        };
                        _this.displayFolder();
                    });
                    item.on('hover:focus', function () {
                        scroll.update(item);
                    });
                    scroll.append(item);
                });
            } else {
                this.drawLoading(Lampa.Lang.translate('client_usb_search_device'));
            }

            this.drawHead();
            this.activity.toggle();
        };

        this.drawLoading = function (text) {
            scroll.clear();
            scroll.reset();
            Lampa.Controller.clear();
            var load = Lampa.Template.js('client_usb_loading');
            load.find('.client-usb-loading__title').text(text);
            scroll.append(load);
        };

        this.drawFolder = function (elems) {
            var _this2 = this;

            scroll.clear();
            scroll.reset();
            var folders = elems.filter(function (a) {
                return a.isDirectory;
            });
            var files = elems.filter(function (element) {
                var fileName = element.name;
                var videoExtensions = [".mp4", ".mkv", ".avi", ".mov", ".flv"]; // Додайте інші розширення за потребою
                var extension = fileName.substr(fileName.lastIndexOf("."));
                return videoExtensions.indexOf(extension.toLowerCase()) !== -1;
            });
            folders.forEach(function (element) {
                var item = Lampa.Template.js('client_usb_folder');
                item.find('.client-usb-device__name').text(element.name);
                item.on('hover:enter', function () {
                    tree.tree.push({title:element.name, url:element.fullPath});
                    _this2.displayFolder();
                });
                item.on('hover:focus', function () {
                    scroll.update(item);
                });
                scroll.append(item);
            });
            if (files.length) {
                var spl = document.createElement('div');
                spl.addClass('client-usb-main__split');
                spl.text(Lampa.Lang.translate('title_files'));
                scroll.append(spl);
                files.forEach(function (element) {
                    var item = Lampa.Template.js('client_usb_file');
                    item.find('.client-usb-file__name').text(element.name);
                    item.find('.client-usb-file__size').text(Lampa.Utils.bytesToSize(element.fileSize));
                    item.on('hover:enter', function () {
                        var video = {
                            title: element.name,
                            url: element.fullPath
                        };
                        Lampa.Player.play(video);
                        Lampa.Player.playlist([video]);
                    });
                    item.on('hover:focus', function () {
                        scroll.update(item);
                    });
                    scroll.append(item);
                });
            }

            this.drawHead();
            this.activity.toggle();
        };

        this.drawHead = function () {
            head.empty();
            var nav = [];

            if (tree) {
                var device_item = document.createElement('div');
                device_item.addClass('client-usb-head__device');
                var icon = "<svg viewBox=\"0 0 122.83 122.88\"  xml:space=\"preserve\"><g><path fill=\"currentColor\" d=\"M60.18,24.74l0.86,0.86L84.54,2.11C85.94,0.71,87.8,0,89.66,0h0.01h0.01h0.01c1.86,0.01,3.71,0.71,5.11,2.11l25.91,25.91 c1.41,1.41,2.12,3.27,2.12,5.13c0,0.1-0.01,0.2-0.01,0.3c-0.07,1.76-0.77,3.5-2.11,4.84L97.22,61.77l0.92,0.92 c0.99,0.99,1.49,2.29,1.49,3.6c0,0.11-0.01,0.22-0.02,0.33c-0.07,1.19-0.56,2.36-1.47,3.26l-48.38,48.38 c-3.08,3.08-7.13,4.61-11.18,4.61c-4.05,0-8.1-1.54-11.18-4.61l-2.18-2.18L7.24,98.1l-2.63-2.63C1.54,92.4,0,88.35,0,84.3 c0-4.05,1.54-8.1,4.61-11.18l48.38-48.38c0.99-0.99,2.29-1.48,3.59-1.48l0.01,0v-0.01C57.89,23.25,59.19,23.75,60.18,24.74 L60.18,24.74z M37.63,79.35c1.47-1.47,3.39-1.55,4.95-0.64l1.31-1.31c0.03-1.46-0.54-2.89-1.07-4.23c-1.15-2.88-2.15-5.38,1.3-7.7 c-0.68-1.17-0.51-2.7,0.49-3.7c1.2-1.2,3.14-1.2,4.34,0c1.2,1.2,1.2,3.14,0,4.34c-0.86,0.86-2.12,1.11-3.2,0.72l0.02,0.03 c-0.4,0.23-0.72,0.47-0.98,0.71c-1.45,1.39-0.81,3-0.07,4.83c0.04,0.11,0.09,0.22,0.13,0.33c0.35,0.88,0.7,1.81,0.91,2.79 L57.8,63.5l-1.62-1.62l-0.37-0.37l0.63-0.16l6.95-1.78l-1.94,7.59l-2.2-2.2l-9.18,9.18c0.99,0.2,1.92,0.54,2.82,0.9 c0.14,0.05,0.27,0.11,0.41,0.16c1.85,0.74,3.48,1.39,4.88-0.13c0.19-0.2,0.37-0.45,0.55-0.74l-1.03-1.03 c-0.17-0.17-0.17-0.46,0-0.63l3.81-3.81c0.17-0.17,0.45-0.17,0.63,0L66,72.74c0.17,0.17,0.17,0.45,0,0.63l-3.81,3.81 c-0.17,0.17-0.45,0.17-0.63,0l-1.35-1.35c-2.31,3.43-4.81,2.43-7.68,1.28c-1.37-0.55-2.85-1.14-4.35-1.07l-4.14,4.14 c0.92,1.56,0.83,3.48-0.64,4.95c-1.47,1.47-4.18,1.6-5.77,0C36.04,83.53,36.16,80.82,37.63,79.35L37.63,79.35z M13.15,95.57 c0.16,0.11,0.31,0.23,0.45,0.37l13.79,13.79c0.14,0.14,0.26,0.29,0.37,0.45l3.87,3.87c1.91,1.91,4.43,2.87,6.96,2.87 c2.52,0,5.05-0.96,6.96-2.87L93.3,66.29L56.59,29.58L8.83,77.34c-1.91,1.91-2.87,4.43-2.87,6.96c0,2.52,0.96,5.05,2.87,6.96 L13.15,95.57L13.15,95.57z M100.67,36.81L100.67,36.81c1.26,1.26,1.26,3.32,0,4.57l-4.23,4.23c-1.26,1.26-3.32,1.26-4.57,0l0,0 c-1.26-1.26-1.26-3.31,0-4.57l4.23-4.23C97.36,35.55,99.42,35.55,100.67,36.81L100.67,36.81z M87,23.13L87,23.13 c1.26,1.26,1.26,3.32,0,4.57l-4.23,4.23c-1.26,1.26-3.32,1.26-4.57,0l0,0c-1.26-1.26-1.26-3.31,0-4.57l4.23-4.23 C83.68,21.88,85.74,21.88,87,23.13L87,23.13z M116.49,32.24L90.58,6.33C90.33,6.07,90,5.95,89.68,5.95v0l-0.02,0 c-0.32,0-0.65,0.13-0.91,0.38L65.32,29.76l27.74,27.74l23.43-23.43c0.22-0.22,0.35-0.51,0.38-0.79c0-0.04,0-0.08,0-0.12 C116.86,32.82,116.74,32.48,116.49,32.24L116.49,32.24z\"/></g></svg>";
                icon += '<span>' + tree.device.name + '</span>';
                device_item.html(icon);
                nav.push(device_item);
                tree.tree.forEach(function (folder) {
                    if (folder.isRootFolder) return;
                    var folder_item = document.createElement('div');
                    folder_item.text(folder.title);
                    folder_item.addClass('client-usb-head__folder');
                    nav.push(folder_item);
                });
            } else {
                var empty_item = document.createElement('div');
                empty_item.addClass('client-usb-head__device');
                var _icon = "<svg viewBox=\"0 0 122.83 122.88\"  xml:space=\"preserve\"><g><path fill=\"currentColor\" d=\"M60.18,24.74l0.86,0.86L84.54,2.11C85.94,0.71,87.8,0,89.66,0h0.01h0.01h0.01c1.86,0.01,3.71,0.71,5.11,2.11l25.91,25.91 c1.41,1.41,2.12,3.27,2.12,5.13c0,0.1-0.01,0.2-0.01,0.3c-0.07,1.76-0.77,3.5-2.11,4.84L97.22,61.77l0.92,0.92 c0.99,0.99,1.49,2.29,1.49,3.6c0,0.11-0.01,0.22-0.02,0.33c-0.07,1.19-0.56,2.36-1.47,3.26l-48.38,48.38 c-3.08,3.08-7.13,4.61-11.18,4.61c-4.05,0-8.1-1.54-11.18-4.61l-2.18-2.18L7.24,98.1l-2.63-2.63C1.54,92.4,0,88.35,0,84.3 c0-4.05,1.54-8.1,4.61-11.18l48.38-48.38c0.99-0.99,2.29-1.48,3.59-1.48l0.01,0v-0.01C57.89,23.25,59.19,23.75,60.18,24.74 L60.18,24.74z M37.63,79.35c1.47-1.47,3.39-1.55,4.95-0.64l1.31-1.31c0.03-1.46-0.54-2.89-1.07-4.23c-1.15-2.88-2.15-5.38,1.3-7.7 c-0.68-1.17-0.51-2.7,0.49-3.7c1.2-1.2,3.14-1.2,4.34,0c1.2,1.2,1.2,3.14,0,4.34c-0.86,0.86-2.12,1.11-3.2,0.72l0.02,0.03 c-0.4,0.23-0.72,0.47-0.98,0.71c-1.45,1.39-0.81,3-0.07,4.83c0.04,0.11,0.09,0.22,0.13,0.33c0.35,0.88,0.7,1.81,0.91,2.79 L57.8,63.5l-1.62-1.62l-0.37-0.37l0.63-0.16l6.95-1.78l-1.94,7.59l-2.2-2.2l-9.18,9.18c0.99,0.2,1.92,0.54,2.82,0.9 c0.14,0.05,0.27,0.11,0.41,0.16c1.85,0.74,3.48,1.39,4.88-0.13c0.19-0.2,0.37-0.45,0.55-0.74l-1.03-1.03 c-0.17-0.17-0.17-0.46,0-0.63l3.81-3.81c0.17-0.17,0.45-0.17,0.63,0L66,72.74c0.17,0.17,0.17,0.45,0,0.63l-3.81,3.81 c-0.17,0.17-0.45,0.17-0.63,0l-1.35-1.35c-2.31,3.43-4.81,2.43-7.68,1.28c-1.37-0.55-2.85-1.14-4.35-1.07l-4.14,4.14 c0.92,1.56,0.83,3.48-0.64,4.95c-1.47,1.47-4.18,1.6-5.77,0C36.04,83.53,36.16,80.82,37.63,79.35L37.63,79.35z M13.15,95.57 c0.16,0.11,0.31,0.23,0.45,0.37l13.79,13.79c0.14,0.14,0.26,0.29,0.37,0.45l3.87,3.87c1.91,1.91,4.43,2.87,6.96,2.87 c2.52,0,5.05-0.96,6.96-2.87L93.3,66.29L56.59,29.58L8.83,77.34c-1.91,1.91-2.87,4.43-2.87,6.96c0,2.52,0.96,5.05,2.87,6.96 L13.15,95.57L13.15,95.57z M100.67,36.81L100.67,36.81c1.26,1.26,1.26,3.32,0,4.57l-4.23,4.23c-1.26,1.26-3.32,1.26-4.57,0l0,0 c-1.26-1.26-1.26-3.31,0-4.57l4.23-4.23C97.36,35.55,99.42,35.55,100.67,36.81L100.67,36.81z M87,23.13L87,23.13 c1.26,1.26,1.26,3.32,0,4.57l-4.23,4.23c-1.26,1.26-3.32,1.26-4.57,0l0,0c-1.26-1.26-1.26-3.31,0-4.57l4.23-4.23 C83.68,21.88,85.74,21.88,87,23.13L87,23.13z M116.49,32.24L90.58,6.33C90.33,6.07,90,5.95,89.68,5.95v0l-0.02,0 c-0.32,0-0.65,0.13-0.91,0.38L65.32,29.76l27.74,27.74l23.43-23.43c0.22-0.22,0.35-0.51,0.38-0.79c0-0.04,0-0.08,0-0.12 C116.86,32.82,116.74,32.48,116.49,32.24L116.49,32.24z\"/></g></svg>";
                _icon += '<span>' + Lampa.Lang.translate('client_usb_all_device') + '</span>';
                empty_item.html(_icon);
                nav.push(empty_item);
            }

            for (var i = 0; i < nav.length; i++) {
                if (i > 0) {
                    var spl = document.createElement('div');
                    spl.addClass('client-usb-head__split');
                    head.append(spl);
                }

                head.append(nav[i]);
            }
        };

        this.displayFolder = function () {
            var _this3 = this;

            var device = tree.device;
            var folder = tree.tree[tree.tree.length - 1];
            this.drawLoading(Lampa.Lang.translate('loading'));
            tizen.filesystem.listDirectory(folder.url, function(files, path) {
                var promises = [];
                files.forEach(file => {
                    if (!file.startsWith('.')) {
                        var promise = new Promise((resolve, reject) => {
                            tizen.filesystem.resolve(path + "/" + file, resolvedFile => {
                                resolve(resolvedFile);
                            });
                        });
                        promises.push(promise);
                    }
                });
                Promise.all(promises)
                .then(elems => {
                    _this3.drawFolder(elems);
                })
                .catch(error => {
                    console.error('usb', "Error resolving files: " + error);
                });
            }, function (error) {
                console.log(JSON.stringify(error));
            });
        };

        this.back = function () {
            if (tree) {
                if (tree.tree.length > 1) {
                    tree.tree.pop();
                    this.displayFolder();
                } else {
                    tree = false;
                    this.drawDevices();
                }
            } else {
                Lampa.Activity.backward();
            }
        };

        this.background = function () {
            Lampa.Background.immediately('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAZCAYAAABD2GxlAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHASURBVHgBlZaLrsMgDENXxAf3/9XHFdXNZLm2YZHQymPk4CS0277v9+ffrut62nEcn/M8nzb69cxj6le1+75f/RqrZ9fatm3F9wwMR7yhawilNke4Gis/7j9srQbdaVFBnkcQ1WrfgmIIBcTrvgqqsKiTzvpOQbUnAykVW4VVqZXyyDllYFSKx9QaVrO7nGJIB63g+FAq/xhcHWBYdwCsmAtvFZUKE0MlVZWCT4idOlyhTp3K35R/6Nzlq0uBnsKWlEzgSh1VGJxv6rmpXMO7EK+XWUPnDFRWqitQFeY2UyZVryuWlI8ulLgGf19FooAUwC9gCWLcwzWPb7Wa60qdlZxjx6ooUuUqVQsK+y1VoAJyBeJAVsLJeYmg/RIXdG2kPhwYPBUQQyYF0XC8lwP3MTCrYAXB88556peCbUUZV7WccwkUQfCZC4PXdA5hKhSVhythZqjZM0J39w5m8BRadKAcrsIpNZsLIYdOqcZ9hExhZ1MH+QL+ciFzXzmYhZr/M6yUUwp2dp5U4naZDwAF5JRSefdScJZ3SkU0nl8xpaAy+7ml1EqvMXSs1HRrZ9bc3eZUSXmGa/mdyjbmqyX7A9RaYQa9IRJ0AAAAAElFTkSuQmCC');
        };

        this.start = function () {
            if (Lampa.Activity.active() && Lampa.Activity.active().activity !== this.activity) return;
            this.background();
            Lampa.Controller.add('content', {
                invisible: true,
                toggle: function toggle() {
                    Lampa.Controller.collectionSet(html);
                    Lampa.Controller.collectionFocus(false, html);
                },
                left: function left() {
                    if (Navigator.canmove('left')) Navigator.move('left');else Lampa.Controller.toggle('menu');
                },
                up: function up() {
                    if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
                },
                right: function right() {
                    Navigator.move('right');
                },
                down: function down() {
                    Navigator.move('down');
                },
                back: this.back.bind(this)
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};

        this.stop = function () {};

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            if(window.tizen)tizen.filesystem.removeStorageStateChangeListener(listener_id)
            if (scroll) scroll.destroy();
            html.remove();
        };
    }

    function startPlugin() {
        window.plugin_client_usb = true;
        Lampa.Lang.add({
            client_usb_search_device: {
                ru: 'Поиск устройств',
                en: 'Device search',
                uk: 'Пошук пристроїв',
                be: 'Пошук прылад',
                zh: '设备搜索',
                pt: 'Pesquisa de dispositivos'
            },
            client_usb_nosuport: {
                ru: 'Ваш виджет не поддерживается, обновите виджет на новую версию',
                en: 'Your widget is not supported, update the widget to a newer version',
                uk: 'Віджет не підтримується, оновіть віджет на нову версію',
                be: 'Ваш віджэт не падтрымліваецца, абнавіце віджэт на новую версію',
                zh: '不支持您的小部件，请将小部件更新到较新版本',
                pt: 'Seu widget não é compatível, atualize o widget para uma versão mais recente'
            },
            client_usb_all_device: {
                ru: 'Все устройства',
                en: 'All devices',
                uk: 'Усі пристрої',
                be: 'Усе прылады',
                zh: '所有设备',
                pt: 'Todos os dispositivos'
            }
        });
        var manifest = {
            type: 'plugin',
            version: '1.1.1',
            name: 'USB',
            description: '',
            component: 'client_usb'
        };
        Lampa.Manifest.plugins = manifest;
        Lampa.Template.add('client_usb_main', "\n        <div class=\"client-usb-main\">\n            <div class=\"client-usb-main__head client-usb-head\"></div>\n            <div class=\"client-usb-main__body\"></div>\n        </div>\n    ");
        Lampa.Template.add('client_usb_loading', "\n        <div class=\"client-usb-loading\">\n            <div class=\"client-usb-loading__title\"></div>\n            <div class=\"client-usb-loading__loader\">\n                <div class=\"broadcast__scan\"><div></div></div>\n            </div>\n        </div>\n    ");
        Lampa.Template.add('client_usb_device', "\n        <div class=\"client-usb-device selector\">\n            <div class=\"client-usb-device__body\">\n                <div class=\"client-usb-device__icon\">\n                    <svg viewBox=\"0 0 122.83 122.88\"  xml:space=\"preserve\"><g><path fill=\"currentColor\" d=\"M60.18,24.74l0.86,0.86L84.54,2.11C85.94,0.71,87.8,0,89.66,0h0.01h0.01h0.01c1.86,0.01,3.71,0.71,5.11,2.11l25.91,25.91 c1.41,1.41,2.12,3.27,2.12,5.13c0,0.1-0.01,0.2-0.01,0.3c-0.07,1.76-0.77,3.5-2.11,4.84L97.22,61.77l0.92,0.92 c0.99,0.99,1.49,2.29,1.49,3.6c0,0.11-0.01,0.22-0.02,0.33c-0.07,1.19-0.56,2.36-1.47,3.26l-48.38,48.38 c-3.08,3.08-7.13,4.61-11.18,4.61c-4.05,0-8.1-1.54-11.18-4.61l-2.18-2.18L7.24,98.1l-2.63-2.63C1.54,92.4,0,88.35,0,84.3 c0-4.05,1.54-8.1,4.61-11.18l48.38-48.38c0.99-0.99,2.29-1.48,3.59-1.48l0.01,0v-0.01C57.89,23.25,59.19,23.75,60.18,24.74 L60.18,24.74z M37.63,79.35c1.47-1.47,3.39-1.55,4.95-0.64l1.31-1.31c0.03-1.46-0.54-2.89-1.07-4.23c-1.15-2.88-2.15-5.38,1.3-7.7 c-0.68-1.17-0.51-2.7,0.49-3.7c1.2-1.2,3.14-1.2,4.34,0c1.2,1.2,1.2,3.14,0,4.34c-0.86,0.86-2.12,1.11-3.2,0.72l0.02,0.03 c-0.4,0.23-0.72,0.47-0.98,0.71c-1.45,1.39-0.81,3-0.07,4.83c0.04,0.11,0.09,0.22,0.13,0.33c0.35,0.88,0.7,1.81,0.91,2.79 L57.8,63.5l-1.62-1.62l-0.37-0.37l0.63-0.16l6.95-1.78l-1.94,7.59l-2.2-2.2l-9.18,9.18c0.99,0.2,1.92,0.54,2.82,0.9 c0.14,0.05,0.27,0.11,0.41,0.16c1.85,0.74,3.48,1.39,4.88-0.13c0.19-0.2,0.37-0.45,0.55-0.74l-1.03-1.03 c-0.17-0.17-0.17-0.46,0-0.63l3.81-3.81c0.17-0.17,0.45-0.17,0.63,0L66,72.74c0.17,0.17,0.17,0.45,0,0.63l-3.81,3.81 c-0.17,0.17-0.45,0.17-0.63,0l-1.35-1.35c-2.31,3.43-4.81,2.43-7.68,1.28c-1.37-0.55-2.85-1.14-4.35-1.07l-4.14,4.14 c0.92,1.56,0.83,3.48-0.64,4.95c-1.47,1.47-4.18,1.6-5.77,0C36.04,83.53,36.16,80.82,37.63,79.35L37.63,79.35z M13.15,95.57 c0.16,0.11,0.31,0.23,0.45,0.37l13.79,13.79c0.14,0.14,0.26,0.29,0.37,0.45l3.87,3.87c1.91,1.91,4.43,2.87,6.96,2.87 c2.52,0,5.05-0.96,6.96-2.87L93.3,66.29L56.59,29.58L8.83,77.34c-1.91,1.91-2.87,4.43-2.87,6.96c0,2.52,0.96,5.05,2.87,6.96 L13.15,95.57L13.15,95.57z M100.67,36.81L100.67,36.81c1.26,1.26,1.26,3.32,0,4.57l-4.23,4.23c-1.26,1.26-3.32,1.26-4.57,0l0,0 c-1.26-1.26-1.26-3.31,0-4.57l4.23-4.23C97.36,35.55,99.42,35.55,100.67,36.81L100.67,36.81z M87,23.13L87,23.13 c1.26,1.26,1.26,3.32,0,4.57l-4.23,4.23c-1.26,1.26-3.32,1.26-4.57,0l0,0c-1.26-1.26-1.26-3.31,0-4.57l4.23-4.23 C83.68,21.88,85.74,21.88,87,23.13L87,23.13z M116.49,32.24L90.58,6.33C90.33,6.07,90,5.95,89.68,5.95v0l-0.02,0 c-0.32,0-0.65,0.13-0.91,0.38L65.32,29.76l27.74,27.74l23.43-23.43c0.22-0.22,0.35-0.51,0.38-0.79c0-0.04,0-0.08,0-0.12 C116.86,32.82,116.74,32.48,116.49,32.24L116.49,32.24z\"/></g></svg>\n                </div>\n                <div class=\"client-usb-device__name\"></div>\n                <div class=\"client-usb-device__ip\"></div>\n            </div>\n        </div>\n    ");
        Lampa.Template.add('client_usb_folder', "\n        <div class=\"client-usb-device selector\">\n            <div class=\"client-usb-device__body\">\n                <div class=\"client-usb-device__icon\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 408 408\" style=\"enable-background:new 0 0 512 512\" xml:space=\"preserve\">\n                        <path d=\"M372 88.661H206.32l-33-39.24a5.001 5.001 0 0 0-4-1.8H36c-19.956.198-36.023 16.443-36 36.4v240c-.001 19.941 16.06 36.163 36 36.36h336c19.94-.197 36.001-16.419 36-36.36v-199c.001-19.941-16.06-36.162-36-36.36z\" fill=\"currentColor\"></path>\n                    </svg>\n                </div>\n                <div class=\"client-usb-device__name\"></div>\n            </div>\n        </div>\n    ");
        Lampa.Template.add('client_usb_file', "\n        <div class=\"client-usb-file selector\">\n            <div class=\"client-usb-file__body\">\n                <div class=\"client-usb-file__icon\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 477.867 477.867\" xml:space=\"preserve\">\n                        <path d=\"M238.933 0C106.974 0 0 106.974 0 238.933s106.974 238.933 238.933 238.933 238.933-106.974 238.933-238.933C477.726 107.033 370.834.141 238.933 0zm100.624 246.546a17.068 17.068 0 0 1-7.662 7.662v.085L195.362 322.56c-8.432 4.213-18.682.794-22.896-7.638a17.061 17.061 0 0 1-1.8-7.722V170.667c-.004-9.426 7.633-17.07 17.059-17.075a17.068 17.068 0 0 1 7.637 1.8l136.533 68.267c8.436 4.204 11.867 14.451 7.662 22.887z\" fill=\"currentColor\"></path>\n                    </svg>\n                </div>\n                <div class=\"client-usb-file__name\"></div>\n                <div class=\"client-usb-file__size\"></div>\n            </div>\n        </div>\n    ");
        Lampa.Template.add(manifest.component + '_style', "\n        <style>\n        .client-usb-main__wrap::after{content:'';display:block;clear:both}.client-usb-main__split{clear:both;padding:1.2em;font-size:1.4em}.client-usb-head{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;line-height:1.4;font-size:1.2em;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;min-height:4.1em;padding:.7em;padding-bottom:0}.client-usb-head>*{margin:.5em;-webkit-border-radius:.3em;-moz-border-radius:.3em;border-radius:.3em;padding:.4em 1em;-o-text-overflow:ellipsis;text-overflow:ellipsis;max-width:20em;overflow:hidden;white-space:nowrap;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.client-usb-head__device{background-color:#404040;font-weight:600;margin-right:1.4em}.client-usb-head__device>svg{width:1.5em !important;height:1.5em !important;margin-right:1em;vertical-align:middle;opacity:.5}.client-usb-head__split{padding:0;margin:0;overflow:inherit}.client-usb-head__split::before{content:'';display:block;width:.3em;height:.3em;border-right:.2em solid #fff;border-bottom:.2em solid #fff;-webkit-transform:rotate(-45deg);-moz-transform:rotate(-45deg);-ms-transform:rotate(-45deg);-o-transform:rotate(-45deg);transform:rotate(-45deg);opacity:.5;margin-top:.15em}.client-usb-device{float:left;width:33.3%;padding:1.5em;line-height:1.4}.client-usb-device__body{background-color:#404040;-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em;padding:1.5em;position:relative;min-height:12.5em}.client-usb-device__name{font-weight:600;font-size:1.4em;margin-bottom:.4em;overflow:hidden;-o-text-overflow:'.';text-overflow:'.';display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical}.client-usb-device__ip{opacity:.5}.client-usb-device__icon{opacity:.5;margin-bottom:1em}.client-usb-device__icon svg{width:4em !important;height:4em !important}.client-usb-device.focus .client-usb-device__body::after,.client-usb-device.hover .client-usb-device__body::after{content:'';position:absolute;top:-0.5em;left:-0.5em;right:-0.5em;bottom:-0.5em;border:.3em solid #fff;-webkit-border-radius:1.4em;-moz-border-radius:1.4em;border-radius:1.4em;z-index:-1;pointer-events:none}.client-usb-loading{margin:0 auto;padding:1.5em;text-align:center}.client-usb-loading__title{font-size:1.4em;margin-bottom:2em}.client-usb-file{padding:1.5em;line-height:1.4;padding-bottom:0}.client-usb-file__body{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;background-color:#404040;-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em;padding:1.5em;position:relative}.client-usb-file__icon{opacity:.5;margin-right:2em}.client-usb-file__icon svg{width:3em !important;height:3em !important}.client-usb-file__name{font-weight:600;font-size:1.4em;overflow:hidden;-o-text-overflow:'.';text-overflow:'.';display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical}.client-usb-file__size{padding-left:2em;margin-left:auto}.client-usb-file.focus .client-usb-file__body::after,.client-usb-file.hover .client-usb-file__body::after{content:'';position:absolute;top:-0.5em;left:-0.5em;right:-0.5em;bottom:-0.5em;border:.3em solid #fff;-webkit-border-radius:1.4em;-moz-border-radius:1.4em;border-radius:1.4em;z-index:-1;pointer-events:none}\n        </style>\n    ");

        function add() {
            if(!Lampa.Platform.is('tizen')) return
            var button = $("<li class=\"menu__item selector\">\n<div class=\"menu__ico\">\n <svg viewBox=\"0 0 122.83 122.88\"  xml:space=\"preserve\"><g><path fill=\"currentColor\" d=\"M60.18,24.74l0.86,0.86L84.54,2.11C85.94,0.71,87.8,0,89.66,0h0.01h0.01h0.01c1.86,0.01,3.71,0.71,5.11,2.11l25.91,25.91 c1.41,1.41,2.12,3.27,2.12,5.13c0,0.1-0.01,0.2-0.01,0.3c-0.07,1.76-0.77,3.5-2.11,4.84L97.22,61.77l0.92,0.92 c0.99,0.99,1.49,2.29,1.49,3.6c0,0.11-0.01,0.22-0.02,0.33c-0.07,1.19-0.56,2.36-1.47,3.26l-48.38,48.38 c-3.08,3.08-7.13,4.61-11.18,4.61c-4.05,0-8.1-1.54-11.18-4.61l-2.18-2.18L7.24,98.1l-2.63-2.63C1.54,92.4,0,88.35,0,84.3 c0-4.05,1.54-8.1,4.61-11.18l48.38-48.38c0.99-0.99,2.29-1.48,3.59-1.48l0.01,0v-0.01C57.89,23.25,59.19,23.75,60.18,24.74 L60.18,24.74z M37.63,79.35c1.47-1.47,3.39-1.55,4.95-0.64l1.31-1.31c0.03-1.46-0.54-2.89-1.07-4.23c-1.15-2.88-2.15-5.38,1.3-7.7 c-0.68-1.17-0.51-2.7,0.49-3.7c1.2-1.2,3.14-1.2,4.34,0c1.2,1.2,1.2,3.14,0,4.34c-0.86,0.86-2.12,1.11-3.2,0.72l0.02,0.03 c-0.4,0.23-0.72,0.47-0.98,0.71c-1.45,1.39-0.81,3-0.07,4.83c0.04,0.11,0.09,0.22,0.13,0.33c0.35,0.88,0.7,1.81,0.91,2.79 L57.8,63.5l-1.62-1.62l-0.37-0.37l0.63-0.16l6.95-1.78l-1.94,7.59l-2.2-2.2l-9.18,9.18c0.99,0.2,1.92,0.54,2.82,0.9 c0.14,0.05,0.27,0.11,0.41,0.16c1.85,0.74,3.48,1.39,4.88-0.13c0.19-0.2,0.37-0.45,0.55-0.74l-1.03-1.03 c-0.17-0.17-0.17-0.46,0-0.63l3.81-3.81c0.17-0.17,0.45-0.17,0.63,0L66,72.74c0.17,0.17,0.17,0.45,0,0.63l-3.81,3.81 c-0.17,0.17-0.45,0.17-0.63,0l-1.35-1.35c-2.31,3.43-4.81,2.43-7.68,1.28c-1.37-0.55-2.85-1.14-4.35-1.07l-4.14,4.14 c0.92,1.56,0.83,3.48-0.64,4.95c-1.47,1.47-4.18,1.6-5.77,0C36.04,83.53,36.16,80.82,37.63,79.35L37.63,79.35z M13.15,95.57 c0.16,0.11,0.31,0.23,0.45,0.37l13.79,13.79c0.14,0.14,0.26,0.29,0.37,0.45l3.87,3.87c1.91,1.91,4.43,2.87,6.96,2.87 c2.52,0,5.05-0.96,6.96-2.87L93.3,66.29L56.59,29.58L8.83,77.34c-1.91,1.91-2.87,4.43-2.87,6.96c0,2.52,0.96,5.05,2.87,6.96 L13.15,95.57L13.15,95.57z M100.67,36.81L100.67,36.81c1.26,1.26,1.26,3.32,0,4.57l-4.23,4.23c-1.26,1.26-3.32,1.26-4.57,0l0,0 c-1.26-1.26-1.26-3.31,0-4.57l4.23-4.23C97.36,35.55,99.42,35.55,100.67,36.81L100.67,36.81z M87,23.13L87,23.13 c1.26,1.26,1.26,3.32,0,4.57l-4.23,4.23c-1.26,1.26-3.32,1.26-4.57,0l0,0c-1.26-1.26-1.26-3.31,0-4.57l4.23-4.23 C83.68,21.88,85.74,21.88,87,23.13L87,23.13z M116.49,32.24L90.58,6.33C90.33,6.07,90,5.95,89.68,5.95v0l-0.02,0 c-0.32,0-0.65,0.13-0.91,0.38L65.32,29.76l27.74,27.74l23.43-23.43c0.22-0.22,0.35-0.51,0.38-0.79c0-0.04,0-0.08,0-0.12 C116.86,32.82,116.74,32.48,116.49,32.24L116.49,32.24z\"/></g></svg>\n</div>\n            <div class=\"menu__text\">".concat(manifest.name, "</div>\n        </li>"));
            button.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: '',
                    title: manifest.name,
                    component: manifest.component,
                    page: 1
                });
            });
            $('.menu .menu__list').eq(0).append(button);
            $('body').append(Lampa.Template.get(manifest.component + '_style', {}, true));
        }

        Lampa.Component.add(manifest.component, Component);
        if (window.appready) add();else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') add();
            });
        }
    }

    if (!window.plugin_client_usb) startPlugin();

})();
