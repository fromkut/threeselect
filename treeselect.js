$(function () {

    var container = $('.treeselect2'),
        containerSelectedItems = $('.selected-items'),
        containerElementTree = $('.tree-elements');

    function dataGenerate() {
        var data = [];
        var lvl1 = 5,
            lvl2 = 5,
            lvl3 = 5;

        for (var i = 1; i < lvl1; i++) {
            data.push(itemGenerate(i, 'Страна'));
        }

        for (var p in data) {
            for (var i = 1; i < lvl2; i++) {
                data[p].children.push(itemGenerate(i, 'Регион'));
            }
        }

        for (var p in data) {
            for (var p2 in data[p].children) {
                for (var i = 1; i < lvl3; i++) {
                    data[p].children[p2].children.push(itemGenerate(i, 'Город'));
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

    function rmFromSelected(target) {
        $('#' + $(target).attr('name')).remove();
    }

    function setHandler() {
        $(".tree-element").change(function () {

            var item = this;
            var lvl = $(item).data('lvl');
            var children = $(item).nextAll('ul');

            // провери есть ли дети
            // если есть, то проставим им выбор + флаг, что выбраны родителем
            if (children.length > 0) {
                $(children).find('input').each(function(i,e) {
                    $(e).prop('checked', item.checked ? true : false);
                    $(e).data('selected-parent', 1);
                });
            }

            // все элементы на этом уровне
            var items = $(item).closest('ul').find(`input[data-lvl="${$(item).data('lvl')}"]`);

            if (items.length > 0) {

                // проверим не выбраны ли все эелементы на данном уровне
                // если выбраны все, то добавим только родительский
                var allSelected = false;

                items.each(function(i, e) {
                    allSelected = e.checked;
                });
                if (allSelected) {
                    var parent = $(item).parent().parent().parent().find(`input[data-lvl="${lvl-1}"]`);
                    parent.prop('checked', true);
                    items.each(function(i, e) {
                        $('#' + $(e).attr('name')).remove();
                    });
                    containerSelectedItems.append(`<span id="${parent.attr('name')}">${parent.next().text()}</span>`);
                }
            } else {
                
            }

            if (this.checked) {
                containerSelectedItems.append(`<span id="${$(this).attr('name')}">${$(this).next().text()}</span>`);
            } else {
                $('#' + $(this).attr('name')).remove();
            }

            
        });

        $(".toggle").click(function () {
            var item = $(this);
            item.nextAll('ul').toggle(0, function () {
                item.toggleClass('splus');
            });
        });
    }

});
