$(function () {

    var containerElementTree = $('.tree-elements');

    init(function (data) {

        var urls = data.urls,
            data = data.data;

        treeBuilding(data);

    });

    function init(cb) {
        // получение dataInit в дальнейшем будет запросом
        var dataInit = {
            data: [
                {
                    id: 1,
                    name: "Страна 1",
                    cnt_children: 12
                },
                {
                    id: 2,
                    name: "Страна 2",
                    cnt_children: 60
                },{
                    id: 3,
                    name: "Страна 3",
                    cnt_children: 30
                }
            ],
            urls: {
                "parents": 'http://localhost/parents/?token=123',
                "children": 'http://localhost/children/?token=123',
                'autocomplete': 'http://localhost/ac/?token=123'
            }
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
    function sendSearchQuery(query) { }

    function dataGenerate() {
        var data = [];
        var lvl1 = findGetParameter('lvl1') || 6,
            lvl2 = findGetParameter('lvl2') || 6,
            lvl3 = findGetParameter('lvl3') || 6;

        $('input[name="lvl1"]').val(findGetParameter('lvl1') || 6);
        $('input[name="lvl2"]').val(findGetParameter('lvl2') || 6);
        $('input[name="lvl3"]').val(findGetParameter('lvl3') || 6);
        var ii = 1;
        for (var i = 1; i < lvl1; i++) {
            data.push(itemGenerate(ii, 'Страна'));
            ii++;
        }

        for (var p in data) {
            for (var i = 1; i < lvl2; i++) {
                data[p].children.push(itemGenerate(ii, 'C' + (data[p].id) + ' Регион'));
                ii++;
            }
        }

        for (var p in data) {
            for (var p2 in data[p].children) {
                for (var i = 1; i < lvl3; i++) {
                    data[p].children[p2].children.push(itemGenerate(ii, 'C' + (data[p].id) + ' Р' + data[p].children[p2].id + ' Город'));
                    ii++;
                }
            }
        }

        function itemGenerate(id, name) {
            return {
                id: id,
                name: `${name} ${id} `,
                children: []
            };
        }

        function findGetParameter(parameterName) {
            var result = null,
                tmp = [];
            location.search
                .substr(1)
                .split("&")
                .forEach(function (item) {
                    tmp = item.split("=");
                    if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
                });
            return result;
        }

        return data;
    }

    // var data = dataGenerate();

    // function requestData(callback) {
    //     setTimeout(function () {
    //         callback(data);
    //     }, 200);
    // }

    // requestData(function (data) {
    //     treeBuilding(data);
    // });

    function treeBuilding(data) {
        var threeArr = handler(data, 1);
        containerElementTree.html(threeArr);
        setHandler();

        function tplItem(id, name, children, lvl) {
            return `<li>
                        ${children ? '<span class="toggle splus"></span>' : ''}
                        <input type="checkbox" class="tree-element" data-lvl="${lvl}" name="item_${id}"><span>${name}</span>
                        ${children}
                    </li>`;
        }

        function handler(arr, lvl) {
            var tpl = [];
            for (var p in arr) {
                var children = '';
                if (arr[p].children && arr[p].children.length) {
                    var newLvl = lvl + 1;
                    children = handler(arr[p].children, newLvl);
                }
                tpl.push(tplItem(arr[p].id, arr[p].name, children, lvl));
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
        var isAllCheck = true;
        items.each(function (i, e) {
            if (!e.checked) {
                isAllCheck = false;
                return;
            }
        });
        var parent = $(item).parent().parent().parent().find(`input[data-lvl="${lvl - 1}"]`);
        if (isAllCheck) {
            parent.prop('checked', true);
        } else {
            parent.prop('checked', false);
        }

        if (parent.length > 0) {
            updThree(parent);
        }
    }

    function setHandler() {
        $(".tree-element").change(function () {

            var item = this;
            var children = $(item).nextAll('ul');
            // выбран родитель. проверим есть ли дети
            // если есть, то проставим им выбор + флаг, что выбраны родителем
            if (children.length > 0) {
                $(children).find('input').each(function (i, e) {
                    $(e).prop('checked', item.checked ? true : false);
                });
            }

            updThree(item);
        });

        $(".toggle").click(function () {
            var item = $(this);
            item.nextAll('ul').toggle(0, function () {
                item.toggleClass('splus');
            });
        });
    }

});
