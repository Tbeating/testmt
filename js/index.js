$(function () {
    var app = {
        directionFlag: true, //上 -> 下
        goDown: '-=110',
        goFastDown: '-=220',
        rotation: 10,
        apiUrl: 'https://h5.yscase.com/mt-official/backend/public/api/',
        dataJSon: { //数据json
            imgArr: [],
            chFont: [],
            egFont: [],
            linkArr: [],
        }, //数据json
        curIndex: 0, //记录当前个数
        _this: null,
        allFontData: '', //记录上翻转的文字
        enterFlag: true,
        cursorArrow: document.querySelector('.cursor_arrow'),
        svgParams: {
            stroke: 'rgba(255,0,18,1)',
            fillOpacity: "0",
            strokeWidth: 4,
            strokeMiterlimit: 4,
            strokelinejoin: "miter",
            strokelinecap: "butt",
        },
        cursorDom: document.querySelector('.cursor'),
        loadingFunc: function () {
            _this = this;
            var loadMoveBox = $('.load_move');
            var loadT = new TimelineMax();
            loadT.to(loadMoveBox, 1.5, {
                left: '-110%',
                ease: Power0.easeIn,
            }).to(loadMoveBox, 0.4, {
                left: '-130%',
            }).to(loadMoveBox, 0.4, {
                left: '-110%',
            }).to(loadMoveBox, 0.2, {
                left: '-130%',
            }).to(loadMoveBox, 0.2, {
                left: '-110%',
                ease: Power0.easeNone,
                onComplete: function () {
                    new TimelineMax().to(loadMoveBox, 3, {
                        left: '0%',
                        ease: Power0.easeIn,
                        onComplete: function () {
                            $('.loading').fadeOut(300);
                            $('.home').fadeIn(300);
                            _this.init();
                        }
                    });
                }
            })
        },
        init: function () {
            _this = this;
            _this.tNormal = new TimelineMax();
            _this.tFast = new TimelineMax();
            _this.tMore = new TimelineMax();
            _this.tBox = new TimelineMax();
            //FF,火狐浏览器会识别该方法
            if (window.addEventListener)
                window.addEventListener('DOMMouseScroll', _this.wheel, false);
            window.onmousewheel = document.onmousewheel = _this.wheel; //W3C
            _this.dataAjax();
            _this.initCursor();
        },
        //获取文字dom
        getFontEl: function () {
            var fontChData = _this.dataJSon.chFont[_this.curIndex];
            var fontEgData = _this.dataJSon.egFont[_this.curIndex];
            var strCh = '',
                strEg = '';
            if (_this.allFontData) {
                _this.allFontData = $('.font_box').html();
            }
            if (fontChData) {
                for (var i = 0; i < fontChData.length; i++) {
                    if ((i + 1) % 3 == 1) {
                        strCh += '<div><span class="normal">' + fontChData[i] + '</span></div>';
                    } else if ((i + 1) % 3 == 0) {
                        strCh += '<div><span class="more">' + fontChData[i] + '</span><span class="more">' + fontChData[i] + '</span><span class="more">' + fontChData[i] + '</span></div>';
                    } else {
                        strCh += '<div><span class="addfast">' + fontChData[i] + '</span></div>';
                    }

                }
                $('.font_ch').html(strCh);
            } else {
                $('.font_ch').html('');
            }
            if (fontEgData) {
                for (var i = 0; i < fontEgData.length; i++) {
                    if ((i + 1) % 3 == 1) {
                        strEg += '<div><span class="normal">' + fontEgData[i] + '</span></div>';
                    } else if ((i + 1) % 3 == 0) {
                        strEg += '<div><span class="more">' + fontEgData[i] + '</span><span class="more">' + fontEgData[i] + '</span><span class="more">' + fontEgData[i] + '</span></div>';
                    } else {
                        strEg += '<div><span class="addfast">' + fontEgData[i] + '</span></div>';
                    }
                }
                $('.font_eg').html(strEg);
            } else {
                $('.font_eg').html('');
            }
            if (!_this.allFontData) {
                _this.allFontData = $('.font_box').html();

            }
        },
        //文字动画
        fontAnimate: function () {
            _this.objects = document.querySelectorAll('.normal');
            _this.objectfast = document.querySelectorAll('.addfast');
            _this.objectmore = document.querySelectorAll('.more');
            _this.objectText = document.querySelectorAll('.font_text');
            if (_this.directionFlag) {
                _this.goDown = '-=110';
                _this.goFastDown = '-=220';
                _this.rotation = 10;
            } else {
                _this.goDown = '+=110';
                _this.goFastDown = '+=220';
                _this.rotation = -10;
            }
            _this.tNormal.to(_this.objects, 0.3, {
                y: _this.goDown,
                ease: Power0.easeNone
            });
            _this.tFast.to(_this.objectfast, 0.5, {
                y: _this.goDown,
                ease: Power0.easeNone
            });
            _this.tMore.to(_this.objectmore, 0.7, {
                y: _this.goFastDown,

            });
            _this.tBox.from(_this.objectText, 0.5, {
                rotation: _this.rotation,
                // ease: Power0.easeNone
            });
        },
        //统一处理滚轮滚动事件
        wheel: function (e) {
            var delta = 0;
            e.stopPropagation();
            if (!e) e = window.event;
            if (e.wheelDelta) { //IE、chrome浏览器使用的是wheelDelta，并且值为“正负120”
                delta = e.wheelDelta / 120;
                if (window.opera) delta = -delta; //因为IE、chrome等向下滚动是负值，FF是正值，为了处理一致性，在此取反处理
            } else if (e.detail) { //FF浏览器使用的是detail,其值为“正负3”
                delta = -e.detail / 3;
            }
            if (delta) {
                if (delta < 0) { //向下滚动
                    _this.upFunc();
                } else { //向上滚动
                    _this.downFunc();
                }
            }
        },
        //请求数据
        dataAjax: function () {
            $.ajax({
                url: _this.apiUrl + 'home',
                type: 'get',
                async: false,
                dataType: 'json',
                success: function (res) {
                    var data = res.data;
                    if (res.code == 0) {
                        for (var i = 0; i < data.length; i++) {
                            _this.dataJSon.imgArr.push(data[i].image);
                            _this.dataJSon.chFont.push(data[i].chinese_title);
                            _this.dataJSon.egFont.push(data[i].english_title);
                            _this.dataJSon.linkArr.push(data[i].url);
                        }
                        _this.initPage();
                    }
                }
            });
        },
        //初始化文字+图片
        initPage: function () {
            _this.light = new SearchLight({
                el: '#myCanvas',
                // w: window.innerWidth,
                // h: window.innerHeight,
                w: 1920,
                h: 974,
                font: 'MTOMORROW',
                imgSrc: _this.dataJSon.imgArr,
                flagIndex: _this.curIndex,
            });
            _this.light.init();
            _this.getFontEl();
            _this.fontAnimate();
        },
        //文字动画复制
        copyFont: function () {
            if (_this.directionFlag) {
                _this.goDown = '-=110';
                _this.goFastDown = '-=220';
                _this.rotation = -10;
            } else {
                _this.goDown = '+=110';
                _this.goFastDown = '+=220';
                _this.rotation = 10;
            }
            $('.font_box').prepend(_this.allFontData);
            $('.font_box_inner').eq(0).addClass('prevDom');
            $('.font_box_inner').eq(1).removeClass('uprotate').removeClass('downrotate');

            _this.objectBacks = $('.prevDom .normal');
            _this.objectBackfast = $('.prevDom .addfast');
            _this.objectBackmore = $('.prevDom .more');
            _this.objectBackText = $('.prevDom .font_text');
            if (_this.directionFlag) {
                $('.font_box_inner').eq(1).addClass('uprotate');
            } else {
                $('.font_box_inner').eq(1).addClass('downrotate');
            }


            _this.tNormal.to(_this.objectBacks, 0.5, {
                y: _this.goDown,
                ease: Power0.easeNone
            });
            _this.tFast.to(_this.objectBackfast, 0.5, {
                y: _this.goDown,
                ease: Power0.easeNone
            });
            _this.tMore.to(_this.objectBackmore, 0.5, {
                y: _this.goFastDown,
            });
            _this.tBox.to(_this.objectBackText, 0.5, {
                rotation: _this.rotation,
                onComplete: function () {
                    $('.prevDom').remove();
                }
            });
            _this.fontAnimate();

        },
        //下一页
        upFunc: function () {
            if (_this.light.timer) return false;
            _this.light.up = _this.directionFlag = true;
            _this.curIndex >= _this.dataJSon.imgArr.length - 1 ? _this.curIndex = 0 : _this.curIndex++;
            _this.light.flagIndex = _this.curIndex;
            _this.getFontEl();
            _this.copyFont();
            _this.light.getSlope();

        },
        //上一页
        downFunc: function () {
            if (_this.light.timer) return false;
            _this.light.up = _this.directionFlag = false;
            _this.curIndex > 0 ? _this.curIndex-- : _this.curIndex = _this.dataJSon.imgArr.length - 1;
            _this.light.flagIndex = _this.curIndex;
            _this.getFontEl();
            _this.copyFont();
            _this.light.getSlope();

        },
        //鼠标动画
        initCursor: function () {
            _this.s = Snap(670, 670);
            _this.cursorArrow.appendChild(_this.s.node);
            _this.s.node.style.width = '100%';
            _this.s.node.style.height = '100%';
            _this.g = _this.s.paper.g({
                opacity: 0,
                display: 'none',
                transform: 'matrix(0.998904, -0.0468027, 0.0468027, 0.998904, 371.969, 315.048)',
            });
            _this.s.node.setAttribute('viewBox', '0 0 670 670');
            _this.path = _this.s.paper.path({
                d: "M0,-82.9406509399414 C0,-82.9406509399414 -37.236454010009766,-41.395469665527344 -37.236454010009766,-41.395469665527344 C-37.236454010009766,-41.395469665527344 -18.33922576904297,-23.674625396728516 -18.33922576904297,-23.674625396728516 C-18.33922576904297,-23.674625396728516 -15.25,-27.013853073120117 -15.25,-27.013853073120117 C-15.25,-27.013853073120117 -15.25,-19.920564651489258 -15.25,-19.920564651489258 C-15.25,-19.920564651489258 14.75,-19.920564651489258 14.75,-19.920564651489258 C14.75,-19.920564651489258 14.75,-27.013853073120117 14.75,-27.013853073120117 C14.75,-27.013853073120117 18.883792877197266,-23.63006019592285 18.883792877197266,-23.63006019592285 C18.883792877197266,-23.63006019592285 36.53102111816406,-40.35090255737305 36.53102111816406,-40.35090255737305 C36.53102111816406,-40.35090255737305 0,-82.9406509399414 0,-82.9406509399414z",
                stroke: _this.svgParams.stroke,
                fillOpacity: _this.svgParams.fillOpacity,
                strokeWidth: _this.svgParams.strokeWidth,
                strokeMiterlimit: _this.svgParams.strokeMiterlimit,
                strokelinejoin: _this.svgParams.strokelinejoin,
                strokelinecap: _this.svgParams.strokelinecap,
            });;
            _this.g.add(_this.path);
            _this.cursorEvent();
        },
        enterCursor: function () {
            _this.enterFlag = false;
            _this.g.node.style.display = 'block';
            _this.g.animate({
                transform: 'matrix(0.707107, -0.707107, 0.707107, 0.707107, 329.068, 333.611)',
                opacity: 1,
            }, 300, mina.linear, function () {})
            _this.path.animate({
                d: "M0,-106.72173389326172 C0,-106.72173309326172 -15.152999427246094,-71.56597137451172 -15.152900427246994,-71.56597137451172 C-15.15299042724694,-71.56597137451172 -15.190999984741211,-12.307404518127441 -15.190999984741211,-12.307404518127441 C-15.190999984741211,-12.307404518127441 -15.25,-12.194354057312012 -15.25,-12.194354057312012 C-15.25,-12.194354057312012 -15.25,64.75 -15.25,64.75 C-15.25,64.75 14.75,64.75 14.75,64.75 C14.75,64.75 14.75,-12.194354057312012 14.75,-12.194354057312012 C14.75,-12.194354057312012 14.79699993133545,-12.897404670715332 14.79699993133545,-12.897404670715332 C14.79699993133545,-12.897404670715332 15.0596923828125,-71.41551971435547 15.0596923828125,-71.41551971435547 C15.0596923828125,-71.41551971435547 0,-106.721733993261720, -106.72173309326172z",
            }, 500, mina.bounce, function () {
                _this.path.animate({
                    d: " M0,-72.5 C0,-72.5 -56.5,-16.25 -56.5,-16.25 C-56.5,-16.25 -35.25,5 -35.25,5 C-35.25,5 -15.25,-15.25 -15.25,-15.25 C-15.25,-15.25 -15.25,64.75 -15.25,64.75 C-15.25,64.75 14.75,64.75 14.75,64.75 C14.75,64.75 14.75,-15.25 14.75,-15.25 C14.75,-15.25 35.5,4.75 35.5,4.75 C35.5,4.75 55.5,-15.5 55.5,-15.5 C55.5,-15.5 0,-72.5 0,-72.5z",
                }, 500, mina.bounce, function () {})
            });
        },
        leaveCursor: function () {
            _this.enterFlag = true;
            _this.path.animate({
                d: "M0,-82.9406509399414 C0,-82.9406509399414 -37.236454010009766,-41.395469665527344 -37.236454010009766,-41.395469665527344 C-37.236454010009766,-41.395469665527344 -18.33922576904297,-23.674625396728516 -18.33922576904297,-23.674625396728516 C-18.33922576904297,-23.674625396728516 -15.25,-27.013853073120117 -15.25,-27.013853073120117 C-15.25,-27.013853073120117 -15.25,-19.920564651489258 -15.25,-19.920564651489258 C-15.25,-19.920564651489258 14.75,-19.920564651489258 14.75,-19.920564651489258 C14.75,-19.920564651489258 14.75,-27.013853073120117 14.75,-27.013853073120117 C14.75,-27.013853073120117 18.883792877197266,-23.63006019592285 18.883792877197266,-23.63006019592285 C18.883792877197266,-23.63006019592285 36.53102111816406,-40.35090255737305 36.53102111816406,-40.35090255737305 C36.53102111816406,-40.35090255737305 0,-82.9406509399414 0,-82.9406509399414z",
            }, 200, mina.easeIn, function () {});
            _this.g.animate({
                transform: 'matrix(0.998904, -0.0468027, 0.0468027, 0.998904, 371.969, 315.048)',
                opacity: 0,
            }, 200, mina.easeIn, function () {
                _this.g.node.style.display = 'none';
            })
        },
        cursorEvent: function () {

            document.body.onmousemove = function (e) {
                e.stopPropagation();
                _this.cursorDom.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
                _this.chW = parseInt($('.font_ch').css('width'));
                _this.egW = parseInt($('.font_eg').css('width'));
                _this.offsetLeft = $('.font_ch').offset().left;

                if (_this.chW > _this.egW) {
                    _this.rightEndX = _this.chW + _this.offsetLeft;
                } else {
                    _this.offsetLeft = $('.font_eg').offset().left;
                    _this.rightEndX = _this.egW + _this.offsetLeft;
                }
                if (e.clientX > 185 && e.clientY > 70 && e.clientY < 750 && e.clientX < _this.rightEndX) {
                    if (_this.enterFlag) {
                        $('.cursor').css('cursor', 'none');
                        _this.enterCursor();

                    }
                } else {
                    if (!_this.enterFlag) {
                        _this.leaveCursor();
                        $('.cursor').css('cursor', 'default');
                    }
                }

            };
        }
    }
    app.loadingFunc();

});