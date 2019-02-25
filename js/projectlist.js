$(function () {
    var app = {
        apiUrl: 'https://h5.yscase.com/mt-official/backend/public/api/',
        dataPageAll: null,
        dataList: [],
        curPage: 1,
        init: function () {
            _this = this;
            _this.dataAjax();
            _this.nextPage();
            _this.prevPage();
        },
        //请求数据
        dataAjax: function () {
            $.ajax({
                url: _this.apiUrl + 'projectLists',
                type: 'get',
                async: false,
                dataType: 'json',
                data: {
                    start: (_this.curPage - 1) * 3,
                    count: 3,
                },
                success: function (res) {
                    // console.log(res);
                    if (res.code == 0) {
                        var data = res.data;
                        _this.dataPageAll = Math.ceil(data.total / 3);
                        _this.dataList = data.lists;
                        _this.updateSlide();
                        _this.updatePage();
                    }
                }
            });
        },
        updateSlide: function () {
            // console.log(_this.dataList);
            // console.log(_this.dataPageAll);

            var str = '';
            for (var i = 0; i < _this.dataList.length; i++) {
                str += '<li data-id="' + _this.dataList[i].id + '"><a href="javascript:;"><img src="' + _this.dataList[i].cover + '" class="p3_1"><h5>' + _this.dataList[i].title + '</h5></a></li>'
            }
            $('.slide_box').html(str);

        },
        updatePage: function () {
            var str = '';
            var startPage = _this.curPage - 2 <= 0 ? 1 : _this.curPage - 2;
            var endPage = _this.curPage + 2 >= _this.dataPageAll ? _this.dataPageAll : _this.curPage + 2;
            // console.log(endPage);

            if (startPage == 1 || _this.dataPageAll <= 5) {
                startPage = 1;
                if (_this.dataPageAll <= 5) {
                    endPage = _this.dataPageAll;
                } else {
                    endPage = 5;
                }

            }

            for (var i = startPage; i <= endPage; i++) {
                if (i == _this.curPage) {
                    str += '<li class="active">' + i + '</li>';
                } else {
                    str += '<li>' + i + '</li>';
                }

            }
            $('.page_prev,.page_next').show();
            $('.page_item').html(str);

            if ($('.page_item>li').eq(0).text() != 1) {
                $('.more_reduce').show();
            } else {
                $('.more_reduce').hide();
            }

            if (endPage < _this.dataPageAll) {
                $('.more_add').show();
            } else {
                $('.more_add').hide();
            }
            if (_this.curPage == 1) {
                $('.page_prev').hide();
            }

            if (_this.curPage > 1) {
                $('.page_prev').show();
            }
            if (_this.curPage >= _this.dataPageAll) {
                $('.page_next').hide();
            }
            _this.changePage();
            _this.getDetailAjax();
        },
        nextPage: function () {
            $('.page_next').on('click', function () {
                if (_this.curPage >= _this.dataPageAll) return false;
                _this.curPage++;
                _this.dataAjax();
            });

        },
        prevPage: function () {
            $('.page_prev').on('click', function () {
                if (_this.curPage <= 1) return false;
                _this.curPage--;
                _this.dataAjax();
            });
        },
        changePage: function () {
            $('.page_item li').on('click', function () {
                _this.curPage = parseInt($(this).text());
                _this.dataAjax();
            });
        },
        getDetailAjax: function () {
            $('.slide_box>li').on('click', function () {
                _this.dataId = $(this).attr('data-id');
                $.ajax({
                    url: _this.apiUrl + 'project',
                    type: 'get',
                    async: false,
                    dataType: 'json',
                    data: {
                        id: _this.dataId
                    },
                    success: function (res) {

                        if (res.code == 0) {
                            var data = res.data;

                            _this.updateContent(data);
                        }
                    }
                });
            })
        },
        //更新下面内容
        updateContent: function (data) {
            var bgColor = data.summary_color ? data.summary_color : '#dc0032';
            var smImg = data.summary_image ? data.summary_image : 'img/p3_5.png';
            var smTitle = data.summary_title ? data.summary_title : '罗莱家纺“粹”：柔软此刻，柔软你';
            var smText = data.summary_text ? data.summary_text : '如何将罗莱家纺“超柔床品”传递给高端目标用户';
            var contenInner = data.content ? data.content : '';

            $('.main').css('background', bgColor);
            $('.p3_5').attr('src', smImg);
            $('.main_right h3').text(smTitle);
            $('.main_font').html(smText);
            $('.content').html(contenInner);
        }
    }
    app.init();

});