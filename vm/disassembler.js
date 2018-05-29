/*
 * 反汇编器，用于Debug以及在外部输出
 * 输入整个RAM，返回整个RAM的反汇编结果，为一个列表
 */

function disassembly(data) {
    var lst = new Array(2048);
    for(var i = 0; i < data.length / 2; i++) {
        var opstr = optoString((data[2*i] << 8) | data[2*i+1]);
        lst[i] = fixLenHex(2*i, 4) + ' | ' + fixLenHex(data[2*i], 2) + fixLenHex(data[2*i+1], 2) + ' | ' + opstr;
    }
    return lst;
}

// 25 different classes
function disassemblyClass(data) {
    var lst = new Array(2048);
    var lst_odd = new Array(2048);
    for(var i = 0; i < data.length / 2; i++) {
        var opstr = optoStringClass((data[2*i] << 8) | data[2*i+1]);
        lst[i] = opstr;
    }
    for(var i = 1; i < data.length / 2; i++) {
        var opstr = optoStringClass((data[2*i] << 8) | data[2*i+1]);
        lst_odd[i] = opstr;
    }
    return [lst, lst_odd];
}

function fixLenHex(x, len) {
    return (Array(len).join('0') + x.toString(16).toUpperCase()).slice(-len);
}

function optoString(opcode) {
    var x = (opcode & 0x0F00) >> 8;
    var y = (opcode & 0x00F0) >> 4;
    switch(opcode & 0xF000) {
        case 0x0000:
            switch(opcode & 0x0FF0) {
                case 0x00C0:                 // 00CN: Scroll display N lines down
                    return 'SCD ' + (opcode & 0x000F).toString(16).toUpperCase();
                case 0x00E0:
                    switch(opcode & 0x000F) {
                        case 0x0000:         // CLS
                            return 'CLS';
                        case 0x000E:         // RET
                            return 'RET';
                    }
                case 0x00F0:
                    switch(opcode & 0x000F) {
                        case 0x000B:         // Scroll display 4 pixels right
                            return 'SCR 4';
                        case 0x000C:         // Scroll display 4 pixels left
                            return 'SCL 4';
                        case 0x000D:         // Exit CHIP interpreter
                            return 'EXIT';
                        case 0x000E:         // Disable extended screen mode
                            return 'DAB';
                        case 0x000F:         // Enable extended screen mode for full-screen graphics
                            return 'EAB';
                    }
            }
            return '';
        case 0x1000:                         // JP addr
            return 'JP ' + fixLenHex(opcode & 0x0FFF, 4);
        case 0x2000:                         // CALL addr
            return 'CALL ' + fixLenHex(opcode & 0x0FFF, 4);
        case 0x3000:                         // SE Vx, byte
            return 'SE V' + x.toString(16).toUpperCase() + ', ' + (opcode & 0x00FF).toString(16).toUpperCase();
        case 0x4000:                         // SNE Vx, byte
            return 'SNE V' + x.toString(16).toUpperCase() + ', ' + (opcode & 0x00FF).toString(16).toUpperCase();
        case 0x5000:                         // SE Vx, Vy
            return 'SE V' + x.toString(16).toUpperCase() + ', V' + y.toString(16).toUpperCase();
        case 0x6000:                         // LD Vx, byte
            return 'LD V' + x.toString(16).toUpperCase() + ', ' + (opcode & 0x00FF).toString(16).toUpperCase();
        case 0x7000:                         // ADD Vx, byte
            return 'ADD V' + x.toString(16).toUpperCase() + ', ' + (opcode & 0x00FF).toString(16).toUpperCase();
        case 0x8000:
            switch(opcode & 0x000F) {
                case 0x0000:                 // LD Vx, Vy
                    return 'LD V' + x.toString(16).toUpperCase() + ', V' + y.toString(16).toUpperCase();
                case 0x0001:                 // OR Vx, Vy
                    return 'OR V' + x.toString(16).toUpperCase() + ', V' + y.toString(16).toUpperCase();
                case 0x0002:                 // AND Vx, Vy
                    return 'AND V' + x.toString(16).toUpperCase() + ', V' + y.toString(16).toUpperCase();
                case 0x0003:                 // XOR Vx, Vy
                    return 'XOR V' + x.toString(16).toUpperCase() + ', V' + y.toString(16).toUpperCase();
                case 0x0004:                 // ADD Vx, Vy
                    return 'ADD V' + x.toString(16).toUpperCase() + ', V' + y.toString(16).toUpperCase();
                case 0x0005:                 // SUB Vx, Vy
                    return 'SUB V' + x.toString(16).toUpperCase() + ', V' + y.toString(16).toUpperCase();
                case 0x0006:                 // SHR Vx, Vy
                    return 'SHR V' + x.toString(16).toUpperCase() + ', V' + y.toString(16).toUpperCase();
                case 0x0007:                 // SUBN Vx, Vy
                    return 'SUBN V' + x.toString(16).toUpperCase() + ', V' + y.toString(16).toUpperCase();
                case 0x000E:                 // SHL Vx, Vy
                    return 'SHL V' + x.toString(16).toUpperCase() + ', V' + y.toString(16).toUpperCase();
            }
            break;
        case 0x9000:                         // SNE Vx, Vy
            return 'SNE V' + x.toString(16).toUpperCase() + ', V' + y.toString(16).toUpperCase();
        case 0xA000:                         // LD I, addr
            return 'LD I, ' + (opcode & 0x0FFF).toString(16).toUpperCase();
        case 0xB000:                         // JP V0, addr
            return 'JP V0, ' + (opcode & 0x0FFF).toString(16).toUpperCase();
        case 0xC000:                         // RND Vx, byte
            return 'RND V' + x.toString(16).toUpperCase() + ', ' + (opcode & 0x00FF).toString(16).toUpperCase();
        case 0xD000:                         // DRW Vx, Vy, nibble
            return 'DRW V' + x.toString(16).toUpperCase() + ', V' + y.toString(16).toUpperCase() + ', ' + (opcode & 0x000F).toString(16).toUpperCase();
        case 0xE000:
            switch(opcode & 0x00FF) {
                case 0x009E:                 // SKP Vx
                    return 'SKP V' + x.toString(16).toUpperCase();
                case 0x00A1:                 // SKNP Vx
                    return 'SKNP V' + x.toString(16).toUpperCase();
            }
        case 0xF000:
            switch(opcode & 0x00FF) {
                case 0x0007:                 // LD Vx, DT
                    return 'LD V' + x.toString(16).toUpperCase() + ', DT';
                case 0x000A:                 // LD Vx, K
                    return 'LD V' + x.toString(16).toUpperCase() + ', K';
                case 0x0015:                 // LD DT, Vx
                    return 'LD DT, V' + x.toString(16).toUpperCase();
                case 0x0018:                 // LD ST, Vx
                    return 'LD ST, V' + x.toString(16).toUpperCase();
                case 0x001E:                 // ADD I, Vx
                    return 'ADD I, V' + x.toString(16).toUpperCase();
                case 0x0029:                 // LD F, Vx
                    return 'LD F, V' + x.toString(16).toUpperCase();
                case 0x0033:                 // LD B, Vx
                    return 'LD B, V' + x.toString(16).toUpperCase();
                case 0x0055:                 // LD [I], Vx
                    return 'LD [I], V' + x.toString(16).toUpperCase();
                case 0x0065:                 // LD Vx, [I]
                    return 'LD V' + x.toString(16).toUpperCase() + ', [I]';
            }
        default:
            return '';
    }
}

function optoStringClass(opcode) {
    switch(opcode & 0xF000) {
        case 0x0000:
            switch(opcode & 0x0FF0) {
                case 0x00C0:                 // 00CN: Scroll display N lines down
                    return 'SCD';
                case 0x00E0:
                    switch(opcode & 0x000F) {
                        case 0x0000:         // CLS
                            return 'CLS';
                        case 0x000E:         // RET
                            return 'RET';
                    }
                case 0x00F0:
                    switch(opcode & 0x000F) {
                        case 0x000B:         // Scroll display 4 pixels right
                            return 'SCR';
                        case 0x000C:         // Scroll display 4 pixels left
                            return 'SCL';
                        case 0x000D:         // Exit CHIP interpreter
                            return 'EXIT';
                        case 0x000E:         // Disable extended screen mode
                            return 'DAB';
                        case 0x000F:         // Enable extended screen mode for full-screen graphics
                            return 'EAB';
                    }
            }
            return '';
        case 0x1000:                         // JP addr
            return 'JP';
        case 0x2000:                         // CALL addr
            return 'CALL';
        case 0x3000:                         // SE Vx, byte
            return 'SE';
        case 0x4000:                         // SNE Vx, byte
            return 'SNE';
        case 0x5000:                         // SE Vx, Vy
            return 'SE';
        case 0x6000:                         // LD Vx, byte
            return 'LD';
        case 0x7000:                         // ADD Vx, byte
            return 'ADD';
        case 0x8000:
            switch(opcode & 0x000F) {
                case 0x0000:                 // LD Vx, Vy
                    return 'LD';
                case 0x0001:                 // OR Vx, Vy
                    return 'OR';
                case 0x0002:                 // AND Vx, Vy
                    return 'AND';
                case 0x0003:                 // XOR Vx, Vy
                    return 'XOR';
                case 0x0004:                 // ADD Vx, Vy
                    return 'ADD';
                case 0x0005:                 // SUB Vx, Vy
                    return 'SUB';
                case 0x0006:                 // SHR Vx, Vy
                    return 'SHR';
                case 0x0007:                 // SUBN Vx, Vy
                    return 'SUBN';
                case 0x000E:                 // SHL Vx, Vy
                    return 'SHL';
            }
            break;
        case 0x9000:                         // SNE Vx, Vy
            return 'SNE';
        case 0xA000:                         // LD I, addr
            return 'LD';
        case 0xB000:                         // JP V0, addr
            return 'JP';
        case 0xC000:                         // RND Vx, byte
            return 'RND';
        case 0xD000:                         // DRW Vx, Vy, nibble
            return 'DRW';
        case 0xE000:
            switch(opcode & 0x00FF) {
                case 0x009E:                 // SKP Vx
                    return 'SKP';
                case 0x00A1:                 // SKNP Vx
                    return 'SKNP';
            }
        case 0xF000:
            switch(opcode & 0x00FF) {
                case 0x0007:                 // LD Vx, DT
                    return 'LD';
                case 0x000A:                 // LD Vx, K
                    return 'LD';
                case 0x0015:                 // LD DT, Vx
                    return 'LD';
                case 0x0018:                 // LD ST, Vx
                    return 'LD';
                case 0x001E:                 // ADD I, Vx
                    return 'ADD';
                case 0x0029:                 // LD F, Vx
                    return 'LD';
                case 0x0033:                 // LD B, Vx
                    return 'LD';
                case 0x0055:                 // LD [I], Vx
                    return 'LD';
                case 0x0065:                 // LD Vx, [I]
                    return 'LD';
            }
        default:
            return '';
    }
}

module.exports = {
    disassembly,
    disassemblyClass,
    optoString
}