$(function () {

    const MainContainer = '#treeselect',
        ContainerElementTree = '.tree-elements';

    var urls = {}, // адреса полученные при инициализации
        objChildren = []; // сохраняю всех загруженных детей

    init(function (data) {
        urls = data.urls;
        treeBuilding(data.data, 1, $(ContainerElementTree));
    });

    function init(cb) {
        // получение dataInit в дальнейшем будет ajax запросом
        var dataInit = {
            data: [
                {
                    id: (+new Date()),
                    name: "Страна 1",
                    cnt_children: 12
                },
                {
                    id: (+new Date()),
                    name: "Страна 2",
                    cnt_children: 60
                }, {
                    id: (+new Date()),
                    name: "Страна 3",
                    cnt_children: 30
                }
            ],
            urls: {
                "parents": 'http://localhost/parents/?token=123',
                "children": 'http://localhost/children/?token=123',
                'autocomplete': 'http://localhost/ac/?token=123'
            },
            saved_ids: [12,13,15]
            
        };
        cb(dataInit);
    }

    function filter(data, text) {

        data = $.extend(true, [], data);
        return handler(data, text);

        function handler(arr, text) {
            text = text.toLowerCase();

            var result = arr.filter(function (v, k) {
                if (v.children && v.children.length) {
                    v.children = handler(v.children, text);
                }

                return ((v.children && v.children.length) || v.name.toLowerCase().indexOf(text) > -1);
            });

            return result;
        }
    }

    var searchInputTimer = null;
    $('[name="three_search"]').on('input', function (e) {
        clearTimeout(searchInputTimer);
        var query = $(this).val();
        searchInputTimer = setTimeout(function () {
            sendSearchQuery(query);
        }, e.type === 'input' ? 200 : 0);
    });
    function sendSearchQuery(query) {

    }

    function treeBuilding(data, lvl, container) {
        var threeArr = handler(data, lvl);
        container.append(threeArr);

        function tplItem(id, name, children, lvl) {
            return `<li>
                        ${children ? '<span class="toggle splus"></span>' : ''}
                        <span class="tree-element">
                            <input type="checkbox" class="tree-element-checkbox" data-lvl="${lvl}" data-cnt-children="${children}" data-id="${id}" name="i_${id}">
                        </span
                        <span>${name}</span>
                    </li>`;
        }

        function handler(arr, lvl) {
            var tpl = [];
            for (var p in arr) {
                tpl.push(tplItem(arr[p].id, arr[p].name, arr[p].cnt_children, lvl));
            }
            if (tpl.length) {
                tpl.push('</ul>');
                tpl.unshift(`<ul class="ul-${lvl}">`);
                tpl = tpl.join('');
                return tpl;
            }
        }
    }

    function updThree(item) {

        var lvl = $(item).data('lvl');
        var items = $(item).closest('ul').find(`input[data-lvl="${$(item).data('lvl')}"]`);
        var parent = $(item).parent().parent().parent().parent().find(`input[data-lvl="${lvl - 1}"]`);

        var countCheckedItems = 0;
        var countCheckedChildrenItems = 0;

        items.each(function (i, e) {
            if (e.checked) {
                countCheckedItems++;
            }
            if ($(e).parent().hasClass('children-selected')) {
                countCheckedChildrenItems++;
            }
        });

        if (countCheckedItems === items.length) {
            parent.prop('checked', true);
            parent.parent().removeClass('children-selected');
        } else {
            parent.prop('checked', false);
            if (countCheckedItems > 0) {
                parent.parent().addClass('children-selected');
            } else {
                if (countCheckedChildrenItems) {
                    parent.parent().addClass('children-selected');
                } else {
                    parent.parent().removeClass('children-selected');
                }
            }
        }

        if (parent.length > 0) {
            updThree(parent);
        }
    }

    $(MainContainer).on('change', '.tree-element-checkbox', function () {
        var item = this;
        var children = $(item).parent().nextAll('ul');
        $(item).parent().removeClass('children-selected');
        // выбран родитель. проверим есть ли дети
        // если есть, то проставим им выбор + флаг, что выбраны родителем
        if (children.length > 0) {
            $(children).find('input').each(function (i, e) {
                if (item.checked) {
                    $(e).parent().removeClass('children-selected');
                }
                $(e).prop('checked', item.checked ? true : false);
            });
        }
        updThree(item);
    });

    // чтобы во время загрузки не обрабатывать повторные клики
    var loadingData = [];

    $(MainContainer).on('click', '.toggle', function () {
        var icon = $(this);
        var children = icon.siblings('ul');
        // если уже загружали детей
        if (children.length > 0) {
            children.toggle(0, function () {
                icon.toggleClass('splus');
            });
        } else {
            var item = $(this).siblings('.tree-element').children('input');
            if (item.data('cnt-children')) {
                var id = item.data('id');
                if (loadingData.indexOf(id) === -1) {
                    loadingData.push(id);
                    loadChildren(id, function () {
                        if (item.is(':checked')) {
                            icon.siblings('ul').find('input').each(function(i, e) {
                                $(e).prop('checked',true);
                            });
                        }
                        icon.siblings('ul').show(0);
                        icon.toggleClass('splus');
                        var indexID = loadingData.indexOf(id);
                        delete loadingData[indexID];
                    });
                }
            }
        }
    });

    function loadChildren(parent_id, cb) {
        // send request: urls.children + '&parent=' + parent_id
        setTimeout(function () {
            var data = [
                {
                    id: (+ new Date()),
                    name: "Регион 1",
                    cnt_children: 12
                },
                {
                    id: (+ new Date()),
                    name: "Регион 2",
                    cnt_children: 60
                }, {
                    id: (+ new Date()),
                    name: "Регион 3",
                    cnt_children: 30
                }
            ];
            objChildren.push({parent_id: parent_id, children: data});
            var container = $('[data-id="' + parent_id + '"]').parent().parent();
            var lvl = (+$('[data-id="' + parent_id + '"]').data('lvl')) + 1;
            treeBuilding(data, lvl, container);
            cb();
        }, 0);
    }

    function loadParent(itemsIds, cb) {
        // send request: urls.parent + '&ids=' + itemsIds.join(',')
        setTimeout(function () {
            // получаем родителей
            cb();
        }, 300);
    }

});
