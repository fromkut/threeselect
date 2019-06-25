$(function () {

    var container = $('.treeselect2'),
        containerSelectedItems = $('.selected-items'),
        containerElementTree = $('.tree-elements');


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

    var data = dataGenerate();

    // var data = [
    //     {
    //         id: 1,
    //         name: "Страна 1",
    //         children: [
    //             {
    //                 id: 1,
    //                 name: "Регион 1",
    //                 children: [
    //                     {
    //                         id: 1,
    //                         name: "Город 1",
    //                         children: [1]
    //                     }, {
    //                         id: 2,
    //                         name: "Город 2",
    //                         children: [1]
    //                     }, {
    //                         id: 3,
    //                         name: "Город 3",
    //                         children: [1]
    //                     }
    //                 ]
    //             }
    //         ]
    //     }
    // ];

    function requestData(callback) {
        setTimeout(function () {
            callback(data);
        }, 200);
    }

    requestData(function (data) {
        treeBuilding(data);
    });

    function treeBuilding(data) {

        var three = render(data, 1);
        containerElementTree.append(three);

        function tplItem(id, name, t, lvl, itemNum) {
            return `<li id="item-${id}">
                        ${t ? '<span class="toggle splus"></span>' : ''}
                        <input type="checkbox" class="tree-element" data-lvl="${lvl}" name="item_${itemNum}_${lvl}_${id}"> <span>${name} (lvl ${lvl})</span>
                        ${t}
                    </li>`;
        }

        function render(obj, lvl) {
            var itemNum = 0;
            var item = '';
            for (var prop in obj) {
                if (obj[prop].id && obj[prop].name) {
                    var t = '';
                    if (obj[prop].children) {
                        var newLvl = lvl + 1;
                        t = render(obj[prop].children, newLvl);
                    }
                    item += tplItem(obj[prop].id, obj[prop].name, t, lvl, itemNum);
                    itemNum++;
                }
            }
            return item ? `<ul class="ul-${lvl}">${item}</ul>` : '';
        }

        setHandler();
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
            items.each(function (i, e) {
                $('#' + $(e).attr('name')).remove();
            });
            parent.prop('checked', true);
            containerSelectedItems.append(`<span id="${parent.attr('name')}">${parent.next().text()}</span>`);

        } else {

            parent.prop('checked', false);
            $('#' + parent.attr('name')).remove();

            items.each(function (i, e) {
                $('#' + $(e).attr('name')).remove();
                if (e.checked) {
                    containerSelectedItems.append(`<span id="${$(e).attr('name')}">${$(e).next().text()}</span>`);
                }
            });
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
                    $(e).data('selected-parent', 1);
                    $('#' + $(e).attr('name')).remove();
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
