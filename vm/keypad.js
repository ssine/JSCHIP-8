var keypad = new Array();

keypad.keymap = {};

// 初始化：配置按键映射
keypad.init = function() {
    layout = "1234qwerasdfzxcv";
    Layout = "1234QWERASDFZXCV";
    origin = "123C456D789EA0BF";
    for(var i = 0; i < 16; i++) {
        this.keymap[layout[i]] = parseInt(origin[i], 16);
        this.keymap[Layout[i]] = parseInt(origin[i], 16);
    }
}

keypad.press = function(event) {
    var curkey = this.keymap[event.key];
    if(curkey || curkey == '0') {
        this[curkey] = true;
    }
}

keypad.release = function(event) {
    var curkey = this.keymap[event.key];
    if(curkey || curkey == '0') {
        delete this[curkey];
    }
}

module.exports = keypad;