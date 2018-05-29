register = require('./register');
memory = require('./memory');
keypad = require('./keypad');

var ch8 = {
    mem : memory,
    reg : register,
    key : keypad,
    running : true,
    stack : new Array(16),
    smode : false,

    // 初始化
    init : function() {
        this.mem.init();
        this.reg.init();
        this.key.init();
        this.redraw = 1;
        this.stdraw = 1;
        this.memshow = 1;
        this.pc = 0x0200;
        this.sp = 0;
        this.i = 0;
        this.running = true;
        this.smode = false;
    },

    // 将ROM文件装入内存
    load : function(data) {
        if(!data || !'length' in data || data.length > 3232) {
            throw new Error('Wrong ROM file!');
        }
        for(var i = 0x200; i < this.mem.length; i++) {
            this.mem[i] = 0;
        }
        for(var i = 0; i < data.length; i++) {
            this.mem[0x0200 + i] = data[i];
        }
    },

    // 执行一个周期
    run : function() {
        var opcode = this.mem[this.pc] << 8 | this.mem[this.pc + 1];
        this.pc += 2;
        this.execute(opcode);
    },

    // 设置显存
    setDisplay : function(d) {
        this.display = d;
    },

    // 在屏幕上绘制一个像素点
    drawPixel : function(x, y) {
        var height = 32;
        var width = 64;

        if(this.smode) {
            height = 64;
            width = 128;
        }

        if(x > width) x -= width;
        else if(x < 0) x += width;

        if(y > height) y -= height;
        else if(y < 0) y += height;

        var loc = y * width + x;
        this.display[loc] ^= 1;
        return !this.display[loc];
    },

    // 执行一条指令（运算器功能）
    execute : function(opcode) {
        var x = (opcode & 0x0F00) >> 8;
        var y = (opcode & 0x00F0) >> 4;
        switch(opcode & 0xF000) {
            case 0x0000:
                switch(opcode & 0x0FF0) {
                    case 0x00C0:                 // 00CN: Scroll display N lines down
                        var N = opcode & 0x000F;
                        if(this.smode) {
                            var w = 128;
                            var h = 64;
                        } else {
                            var w = 64;
                            var h = 32;
                        }
                        for(y = h-1; y >= N; y--) {
                            for(x = 0; x < w; x++) {
                                this.display[y*w + x] = this.display[(y-N)*w + x];
                            }
                        }
                        for(y = N-1; y >= 0; y--) {
                            for(x = 0; x < w; x++) {
                                this.display[y*w + x] = 0;
                            }
                        }
                        this.redraw = 1;
                        // console.log('shift down');
                        break;
                    case 0x00E0:
                        switch(opcode & 0x000F) {
                            case 0x0000:         // CLS
                                for(var i = 0; i < this.display.length; i++) {
                                    this.display[i] = 0;
                                }
                                this.redraw = 1;
                                break;
                            case 0x000E:         // RET
                                this.pc = this.stack[--this.sp];
                                this.stdraw = 1;
                                break;
                        }
                        break;
                    case 0x00F0:
                        switch(opcode & 0x000F) {
                            case 0x000B:         // Scroll display 4 pixels right
                                if(this.smode) {
                                    var w = 128;
                                    var h = 64;
                                } else {
                                    var w = 64;
                                    var h = 32;
                                }
                                for(y = 0; y < h; y++) {
                                    for(x = w; x >= 4; x--)
                                        this.display[y*w + x] = this.display[y*w + x - 4];
                                    for(x = 3; x >= 0; x--)
                                        this.display[y*w + x] = 0;
                                }
                                this.redraw = 1;
                                // console.log('shift right');
                                break;
                            case 0x000C:         // Scroll display 4 pixels left
                                if(this.smode) {
                                    var w = 128;
                                    var h = 64;
                                } else {
                                    var w = 64;
                                    var h = 32;
                                }
                                for(y = 0; y < h; y++) {
                                    for(x = 0; x < w - 4; x++)
                                        this.display[y*w + x] = this.display[y*w + x + 4];
                                    for(x = w - 4; x < w; x++)
                                        this.display[y*w + x] = 0;
                                }
                                this.redraw = 1;
                                // console.log('shift left');
                                break;
                            case 0x000D:         // Exit CHIP interpreter
                                this.running = false;
                                break;
                            case 0x000E:         // Disable extended screen mode
                                this.smode = false;
                                break;
                            case 0x000F:         // Enable extended screen mode for full-screen graphics
                                this.smode = true;
                                break;
                        }
                        break;
                }
                break;
            case 0x1000:                         // JP addr
                this.pc = opcode & 0x0FFF;
                break;
            case 0x2000:                         // CALL addr
                this.stack[this.sp++] = this.pc;
                this.stdraw = 1;
                this.pc = opcode & 0x0FFF;
                break;
            case 0x3000:                         // SE Vx, byte
                if(this.reg[x] == (opcode & 0x00FF)) {
                    this.pc += 2;
                }
                break;
            case 0x4000:                         // SNE Vx, byte
                if(this.reg[x] != (opcode & 0x00FF)) {
                    this.pc += 2;
                }
                break;
            case 0x5000:                         // SE Vx, Vy
                if(this.reg[x] == this.reg[y]) {
                    this.pc += 2;
                }
                break;
            case 0x6000:                         // LD Vx, byte
                this.reg[x] = opcode & 0x00FF;
                break;
            case 0x7000:                         // ADD Vx, byte
                this.reg[x] += opcode & 0x00FF;
                break;
            case 0x8000:
                switch(opcode & 0x000F) {
                    case 0x0000:                 // LD Vx, Vy
                        this.reg[x] = this.reg[y];
                        break;
                    case 0x0001:                 // OR Vx, Vy
                        this.reg[x] |= this.reg[y];
                        break;
                    case 0x0002:                 // AND Vx, Vy
                        this.reg[x] &= this.reg[y];
                        break;
                    case 0x0003:                 // XOR Vx, Vy
                        this.reg[x] ^= this.reg[y];
                        break;
                    case 0x0004:                 // ADD Vx, Vy
                        res = this.reg[x] += this.reg[y];
                        if(res > 0xFF) this.reg[0xF] = 1;
                        else this.reg[0xF] = 0;
                        break;
                    case 0x0005:                 // SUB Vx, Vy
                        this.reg[0xF] = +(this.reg[x] > this.reg[y]);
                        this.reg[x] -= this.reg[y];
                        break;
                    case 0x0006:                 // SHR Vx, Vy
                        this.reg[0xF] = this.reg[x] & 0x01;
                        this.reg[x] >>= 1;
                        break;
                    case 0x0007:                 // SUBN Vx, Vy
                        this.reg[0xF] = +(this.reg[x] > this.reg[y]);
                        this.reg[x] = this.reg[y] - this.reg[x];
                        break;
                    case 0x000E:                 // SHL Vx, Vy
                        this.reg[0xF] = this.reg[x] & 0x80;
                        this.reg[x] <<= 1;
                        break;
                }
                break;
            case 0x9000:                         // SNE Vx, Vy
                if(this.reg[x] != this.reg[y]) this.pc += 2;
                break;
            case 0xA000:                         // LD I, addr
                this.i = opcode & 0x0FFF;
                break;
            case 0xB000:                         // JP V0, addr
                this.pc = this.reg[0] + (opcode & 0x0FFF);
                break;
            case 0xC000:                         // RND Vx, byte
                this.reg[x] = Math.floor(Math.random() * 0xFF) & (opcode & 0xFF);
                break;
            case 0xD000:                         // DRW Vx, Vy, nibble
                this.reg[0xF] = 0;

                var height = opcode & 0x000F;
                var regX = this.reg[x];
                var regY = this.reg[y];
                var x, y, spr;

                if(this.smode && height == 0) {
                    for(y = 0; y < 16; y++) {
                        spr = (this.mem[this.i + 2*y] << 8) | (this.mem[this.i + 2*y + 1]);
                        for(x = 0; x < 16; x++) {
                            if((spr & 0x8000) > 0) {
                                if(this.drawPixel(regX + x, regY + y)) {
                                    this.reg[0xF] = 1;
                                }
                            }
                            spr <<= 1;
                        }
                    }
                } else {

                    for(y = 0; y < height; y++) {
                        spr = this.mem[this.i + y];
                        for(x = 0; x < 8; x++) {
                            if((spr & 0x80) > 0) {
                                if(this.drawPixel(regX + x, regY + y)) {
                                    this.reg[0xF] = 1;
                                }
                            }
                            spr <<= 1;
                        }
                    }
                }

                this.redraw = 1;

                break;
            case 0xE000:
                switch(opcode & 0x00FF) {
                    case 0x009E:                 // SKP Vx
                        if(this.key[this.reg[x]]) {
                            this.pc += 2;
                        }
                        break;
                    case 0x00A1:                 // SKNP Vx
                        if(!this.key[this.reg[x]]) {
                            this.pc += 2;
                        }
                        break;
                }
                break;
            case 0xF000:
                switch(opcode & 0x00FF) {
                    case 0x0007:                 // LD Vx, DT
                        this.reg[x] = this.reg.delay.value;
                        break;
                    case 0x000A:                 // LD Vx, K
                        console.log('waiting for key press...');
                        console.log(document);
                        this.running = false;

                        document.onkeydown = function(event) {
                            console.log('modifyed func executed!');
                            var curkey = this.key.keymap[event.key];
                            if(curkey) {
                                this.key[curkey] = true;
                                this.reg[x] = curkey;
                                this.running = true;
                                document.onkeydown = this.key.press.bind(this.key);
                            }
                        }.bind(this);

                        return;
                    case 0x0015:                 // LD DT, Vx
                        this.reg.delay.set(this.reg[x]);
                        break;
                    case 0x0018:                 // LD ST, Vx
                        this.reg.sound.set(this.reg[x]);
                        break;
                    case 0x001E:                 // ADD I, Vx
                        this.i += this.reg[x];
                        break;
                    case 0x0029:                 // LD F, Vx
                        this.i = this.reg[x] * 5;
                        break;
                    case 0x0030:                 // Point I to 10-byte font sprite for digit VX (0..9)
                        this.i = 80 + this.reg[x] * 10;
                        break;
                    case 0x0033:                 // LD B, Vx
                        var num = this.reg[x], it;
                        for(it = 3; it > 0; it--) {
                            this.mem[this.i + it - 1]  = parseInt(num % 10);
                            num /= 10;
                        }
                        this.memshow = 1;
                        break;
                    case 0x0055:                 // LD [I], Vx
                        for(var it = 0; it <= x; it++) {
                            this.mem[this.i + it] = this.reg[it];
                        }
                        this.memshow = 1;
                        break;
                    case 0x0065:                 // LD Vx, [I]
                        for(var it = 0; it <= x; it++) {
                            this.reg[it] = this.mem[this.i + it];
                        }
                        this.memshow = 1;
                        break;
                    case 0x0075:                 // Store V0..VX in RPL user flags (X <= 7)
                        for(var it = 0; it <= x; it++) {
                            this.reg.RPL[it] = this.reg[it];
                        }
                        break;
                    case 0x0085:                 // Read V0..VX from RPL user flags (X <= 7)
                        for(var it = 0; it <= x; it++) {
                            this.reg[it] = this.reg.RPL[it];
                        }
                        break;
                }
                break;
            default:
                throw new Error("Unknown opcode " + opcode.toString(16) + " passed. Terminating.");
        } // switch ended.
    }
};

module.exports = ch8;