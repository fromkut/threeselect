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

        function tplItem(id, name, t, lvl) {
            return `<li id="item-${id}">
                        ${t ? '<span class="toggle splus"></span>' : ''}
                        <input type="checkbox" class="tree-element" name="item_${lvl}_${id}"> <span>${name} (lvl ${lvl})</span>
                        ${t}
                    </li>`;
        }

        function render(obj, lvl) {
            var item = '';
            for (var prop in obj) {
                if (obj[prop].id && obj[prop].name) {
                    var t = '';
                    if (obj[prop].children) {
                        var newLvl = lvl + 1;
                        t = render(obj[prop].children, newLvl);
                    }
                    item += tplItem(obj[prop].id, obj[prop].name, t, lvl);
                }
            }
            return item ? `<ul class="ul-${lvl}">${item}</ul>` : '';
        }

        setHandler();
    }

    function setHandler() {
        $(".tree-element").change(function () {
            if (this.checked) {
                containerSelectedItems.append(`<span id="${$(this).attr('name')}">${$(this).next().text()}</span>`);
            } else {
                $('#' + $(this).attr('name')).remove();
            }
        });

        $(".toggle").click(function () {
            var item = $(this);
            console.log(item.nextAll('ul'));
            item.nextAll('ul').toggle(0, function () {
                item.toggleClass('splus');
            });
        });
    }

});
