var SearchLight = (function () {
    function SearchLight(pams) {
        var _o = this;
        _o.w = pams.w;
        _o.h = pams.h;
        _o.up = true;
        _o.font = pams.font;
        _o.fontSize = '150';
        _o.picArr = pams.imgSrc;
        _o.picture = {};
        _o.court = 0;
        _o.flagIndex = pams.flagIndex;
        _o.cvs = document.querySelector(pams.el);
        /*矩形倾斜角度*/
        _o.deg = -20;
        _o.isOnce = true;
        // 矩形最终停止的点
        _o.center = {
            x: _o.w / 2,
            y: _o.h / 2
        };
        // 矩形开始的点,指定x即可
        _o.startPot = {
            x: _o.w / 2 + 200,
            y: null
        };
        // 矩形结束的点,指定x即可
        _o.endPot = {
            x: _o.w / 2 - 200,
            y: null
        };
        //矩形区域
        _o.rect = {
            w: 474,
            h: 672,
            x: null,
            y: null,
        };
        //图片大小
        _o.pic = {
            w: 474,
            h: 672,
            x: null,
            y: null,
        };
        // _o.init();
    }
    var _proto = SearchLight.prototype;
    _proto.init = function () {
        var _o = this;
        for (var i = 0; i < _o.picArr.length; i++) {
            _o.picture[i] = new Image();
            _o.picture[i].src = _o.picArr[i];
            _o.picture[i].onload = function () {
                if (_o.court >= _o.picArr.length - 1)
                    _o.pictureEnd = true;
                _o.court++;
            }
        }



        _o.cvs.width = _o.w;
        _o.cvs.height = _o.h;
        _o.ctx = _o.cvs.getContext('2d');
        _o.getSlope();



    };
    /*规定直线*/
    _proto.getSlope = function () {
        var _o = this;
        // var k = (_o.endPot.y-_o.startPot.y)/(_o.endPot.x-_o.startPot.x);
        // var a = _o.endPot.y-k*_o.endPot.x;
        /* y=kx+a */
        var k = Math.tan((90 + _o.deg) * Math.PI / 180);
        var a = _o.center.y - k * _o.center.x;


        if (_o.up) {
            //反 -> 正
            if (!_o.isOnce) {
                _o.flagX = _o.endPot.x;
                _o.endPot.x = _o.startPot.x;
                _o.startPot.x = _o.flagX;
                _o.isOnce = true;
            }
            _o.startPot.y = k * _o.startPot.x + a;
            _o.endPot.y = k * _o.endPot.x + a;
        } else {
            //正 -> 反
            if (_o.isOnce) {
                _o.startPot.y = k * _o.endPot.x + a;
                _o.endPot.y = k * _o.startPot.x + a;
            }
        }
        _o.rect.x = _o.startPot.x;
        _o.rect.y = _o.startPot.y;
        //正 -> 反
        if (!_o.up && _o.isOnce) {
            _o.rect.x = _o.endPot.x;
            _o.flagX = _o.endPot.x;
            _o.endPot.x = _o.startPot.x;
            _o.startPot.x = _o.flagX;
            _o.isOnce = false;
        }

        /*第一次绘制*/
        _o.update()();
        /*开始动画*/
        _o.animation();
        /*开启计时器*/
        _o.timer = setInterval(function () {
            TWEEN.update();
        }, 20)
    };
    /*动画*/
    _proto.animation = function () {
        var _o = this;
        /*位置对象*/
        var position = _o.rect;

        /*tween1为重复的动画*/
        var tween1 = new TWEEN.Tween(position)
            .to({
                x: _o.endPot.x,
                y: _o.endPot.y
            }, 200)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(_o.update())
            .onComplete(function () {
                /*更新位置到最下边*/
                position = {
                    x: _o.startPot.x,
                    y: _o.startPot.y
                };
                _o.rect.x = _o.startPot.x;
                _o.rect.y = _o.startPot.y;
                _o.update()();
                /*tween2为最终停止的动画*/
                var tween2 = new TWEEN.Tween(_o.rect)
                    .to({
                        x: _o.center.x,
                        y: _o.center.y
                    }, 1600)
                    .easing(TWEEN.Easing.Elastic.Out)
                    .onUpdate(_o.update())
                    .onComplete(function () {
                        /*动画完成后关闭计时器*/
                        clearInterval(_o.timer);
                        _o.timer = null;
                    });
                tween2.start();
            });
        tween1.repeat(3);
        tween1.start();
    };

    /*更新画布*/
    _proto.update = function () {
        var _o = this;
        return function () {
            /*黑色底*/
            _o.ctx.clearRect(0, 0, _o.w, _o.h);
            _o.ctx.beginPath();
            _o.ctx.fillStyle = '#fff';
            _o.ctx.fillRect(0, 0, _o.w, _o.h);
            /*红色文字*/
            // _o.drawFont('#ff0000');
            _o.ctx.save();
            /*白色矩形*/
            // _o.drawRect();
            /*插入图片*/
            _o.drawImg();
            /*黑色文字*/
            // _o.drawFont('#000');
            _o.ctx.restore();
        }
    };
    /*绘制矩形*/
    _proto.drawRect = function () {
        var _o = this;
        _o.ctx.save();
        _o.ctx.beginPath();
        _o.ctx.translate(_o.rect.x, _o.rect.y);
        _o.ctx.rotate(_o.deg * Math.PI / 180);
        _o.ctx.fillStyle = 'red';
        _o.ctx.rect(-_o.rect.w / 2, -_o.rect.h / 2, _o.rect.w, _o.rect.h);
        _o.ctx.fill();
        _o.ctx.restore();
        _o.ctx.clip();
    };
    /*绘制图片*/
    _proto.drawImg = function () {
        var _o = this;
        // console.log(_o.picture);
        if (!_o.pictureEnd) return false;
        _o.ctx.save();
        _o.ctx.beginPath();
        _o.ctx.translate(_o.rect.x, _o.rect.y);
        // console.log(_o.rect.x, _o.rect.y, -_o.rect.w / 2, -_o.rect.h / 2);
        // (-_o.rect.w / 2) , (-_o.rect.h / 2) 绝对居中
        _o.ctx.drawImage(_o.picture[_o.flagIndex], (-_o.rect.w / 2) - (_o.rect.w * 1.09), (-_o.rect.h / 2) - (_o.rect.h / 22), _o.pic.w, _o.pic.h);
        _o.ctx.fill();
        _o.ctx.restore();
        _o.ctx.clip();

    };
    /*绘制文字*/
    _proto.drawFont = function (color) {
        var _o = this;
        _o.ctx.beginPath();
        _o.ctx.fillStyle = color;
        _o.ctx.font = 'bold ' + _o.fontSize + 'px Arial';
        _o.ctx.textAlign = 'center';
        _o.ctx.textBaseline = 'top';
        _o.ctx.fillText(_o.font, _o.w / 2, _o.h / 2 - _o.fontSize / 2);
    };

    return SearchLight
})();