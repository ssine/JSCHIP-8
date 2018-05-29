/*
 * ============================================================================
 *                  JSCHIP-8 Emulator with Super CHIP Extension
 *                         Author: Sine Liu / 刘思尧
 *                              Date: 2018-5-17
 * 
 *   _(  )__  _(  )__    _(  )__   _(  )__
 *  (_______)(_______)  (_______) (_______)         _________________
 *                                                 < Enjoy yourself! >
 *     -.-    -.-     -.-    -.-      -.-     -.-   -----------------
 *                                                         \   ^__^
 * .---.____.---.____.---.____.---.____.---.____.---.____   \  (oo)\_______
 * ___.---.___.---.___.---.___.---.___.---.___.---.___.---._   (__)\       )\/\
 * .--.__.--.__.--.__.--.__.--.__.--.__.--.__.--.__.--.__.--.__.   ||----w |
 * __.-.__.-.__.-.__.-.__.-.__.-.__.-.__.-.__.-.__.-.__.-.__.-._   ||     ||
 * ============================================================================
 */

remote = require('electron').remote;
ipcRenderer = require('electron').ipcRenderer;
fs = require('fs');
ch = require('./vm/controller');
da = require('./vm/disassembler');
st = require('./vm/static');
const path = require('path');
const url = require('url');

var display = new Uint8Array(65 * 129);
var screen = document.getElementById('Ch8Screen');
var bgcolor = "black", fgcolor = "aqua";
var runTimerHandle, runMachine = true;
// Ideal frequency: 14 instructions/time upgrade (840Hz)
var cycleTime = 25, loopTimes = 21;
var toPCPos = true;
var enableDebugger = false;
var heatmapOpen = false;
var curROMName = '';


/* ============================================================================
 *                        Initialization functions
 *                             初始化&装载ROM
 * ============================================================================
 */

function initialize() {
    ch.setDisplay(display);
    ch.init();
    st.init();
    document.onkeydown = ch.key.press.bind(ch.key);
    document.onkeyup = ch.key.release.bind(ch.key);
}

function loadROM() {
    var files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
        filters: [
            { name: 'All Files', extensions: ['ch8'] } ],
        properties: ['openFile']
    });
    if(files){
        var currentFile=files[0];
        var data = fs.readFileSync(currentFile);
        ch.load(data);
    }
    document.getElementById('title').innerText = 'CHIP-8 Emulator by LSY  -  ' + path.basename(currentFile);
    curROMName = path.basename(currentFile);
    st.setRAM(da.disassemblyClass(ch.mem));
    drawMemory();
}



/* ============================================================================
 *                         Main Process functions
 *                            虚拟机主循环函数
 * ============================================================================
 */


function emulateCycle() {
    if(runMachine) {
        for(var i = 0; i < loopTimes; i++)
            emulateStep();
    }
}

function emulateStep() {
    if(ch.running) {
        st.count(ch.pc);
        if(heatmapOpen) {
            // ipcRenderer.send('pass-pc-data', ch.pc);
        }
        ch.run();
        if(ch.redraw) {
            drawScreen();
            ch.redraw = 0;
        }
        if(enableDebugger) {
            if(ch.memshow) {
                drawMemory();
                ch.memshow = 0;
            }
            if(ch.stdraw) {
                drawStack();
                ch.stdraw = 0;
            }
            if(toPCPos) {
                gotoPCPos();
            }
            drawRegister();
        }
    }
}


/* ============================================================================
 *                      Process Management functions
 *                             流程管理函数
 * ============================================================================
 */

function pauseGame() {
    runMachine = false;
    // console.log('before push:', remote.getGlobal('sharedObject').executedInstruction);
    // arr = remote.getGlobal('sharedObject').executedInstruction;
    // arr.push(123);
    // remote.getGlobal('sharedObject').executedInstruction = arr;
    // console.log('after push:', remote.getGlobal('sharedObject').executedInstruction);
    // remote.getCurrentWindow().webContents.send('ping', 'wooooh!');
}

function resumeGame() {
    runMachine = true;
}

function startGame() {
    initialize();
    if(runTimerHandle) clearInterval(runTimerHandle);
    runMachine = true;
    runTimerHandle = setInterval(emulateCycle, cycleTime);
}

function resetGame() {
    for(var i = 0; i < display.length; i++)
        display[i] = 0;
    drawScreen();
    initialize();
    runMachine = false;
}

function followPC() {
    toPCPos = !toPCPos;
}

function changeSpeed(mul) {
    if(mul == 0.5) {
        cycleTime = 25;
        loopTimes = 10;
    } else if(mul == 1) {
        cycleTime = 25;
        loopTimes = 21;
    } else if(mul == 2) {
        cycleTime = 12;
        loopTimes = 21;
    } else if(mul == 5) {
        cycleTime = 5;
        loopTimes = 21;
    } else if(mul == 0.1) {
        cycleTime = 0.5;
        loopTimes = 1;
    }
    if(runTimerHandle) clearInterval(runTimerHandle);
    runTimerHandle = setInterval(emulateCycle, cycleTime);
}

function changeForegroundColor(color) {
    fgcolor = color;
    drawScreen();
}

function changeBackgroundColor(color) {
    bgcolor = color;
    drawScreen();
}

function openDebugger() {
    var width = parseInt(document.getElementById("dbpane").style.width);
    if(enableDebugger) {
        var win = remote.BrowserWindow.getFocusedWindow();
        win.setSize(win.getSize()[0] - width - 2, win.getSize()[1]);
        document.getElementById("dbpane").style.display = "none";
        enableDebugger = false;
    } else {
        var win = remote.BrowserWindow.getFocusedWindow();
        win.setSize(win.getSize()[0] + width, win.getSize()[1]);
        document.getElementById("dbpane").style.display = "inline";
        enableDebugger = true;
    }
}

function openHelp() {
    let helpWindow = new remote.BrowserWindow({width: 800, height: 600});
    helpWindow.on('closed', () => {
        helpWindow = null
    });
    helpWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'help.html'),
        protocol: 'file:',
        slashes: true
    }));
    // console.log(path.join(__dirname, 'help.html'));
}

function openHeatmap() {

    remote.getGlobal('sharedObject').heatData = st.getHeatmapData();
    remote.getGlobal('sharedObject').lineHeight = st.lineHeight;
    remote.getGlobal('sharedObject').lineLength = st.lineLength;
    remote.getGlobal('sharedObject').lineIndent = st.lineIndent;
    remote.getGlobal('sharedObject').dotSpace = st.dotSpace;
    remote.getGlobal('sharedObject').memory = da.disassembly(ch.mem);

    console.log(remote.getGlobal('sharedObject').memory);

    let heatmapWindow = new remote.BrowserWindow({width: 800, height: 600});
    heatmapWindow.on('closed', () => {
        heatmapOpen = false;
        heatmapWindow = null;
    });
    heatmapWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'heatmap.html'),
        protocol: 'file:',
        slashes: true
    }));
    // heatmapOpen = true;

    // console.log(path.join(__dirname, 'help.html'));
}

function saveStatic() {
    st.save(curROMName);    
}

/* ============================================================================
 *                          Front-end Update
 *                              前端更新
 * ============================================================================
 */

function drawScreen() {
    var ctx = screen.getContext("2d");

    // 检测是否开启扩展模式
    if(ch.smode) {
        var w = 128;
        var h = 64;
    } else {
        var w = 64;
        var h = 32;
    }
    var xscale = screen.width / w, yscale = screen.height / h;
    var curColor;

    // 绘制显存到屏幕输出
    for(var y = 0; y < h; y++) {
        for(var x = 0; x < w; x++) {
            curColor = display[w * y + x];
            if(curColor == 0) {
                ctx.fillStyle = bgcolor;
                ctx.fillRect(x * xscale, y * yscale, xscale, yscale);
            } else {
                ctx.fillStyle = fgcolor;
                ctx.fillRect(x * xscale, y * yscale, xscale, yscale);
            }
        }
    }
}

function drawStack() {
    var lst = ch.stack;
    var view = document.getElementById('stackview');
    view.innerHTML = "";
    for(var i = 0; i < ch.sp; i++) {
        var div = document.createElement('div');
        div.setAttribute('class', 'line');
        div.innerHTML = lst[i].toString(16).toUpperCase();
        view.appendChild(div);
    }
}

function drawRegister() {
    for(var i = 0; i < 16; i++) {
        var curReg = document.getElementById("V" + i.toString(16));
        curReg.innerText = "0x" + fixLenHex(ch.reg[i], 2);
    }
    document.getElementById("PC").innerText = "0x" + fixLenHex(ch.pc, 4);
    document.getElementById("SP").innerText = "0x" + fixLenHex(ch.sp, 2);
    document.getElementById("I").innerText = "0x" + fixLenHex(ch.i, 4);
    document.getElementById("DT").innerText = "0x" + fixLenHex(ch.reg.delay.value, 2);
    document.getElementById("ST").innerText = "0x" + fixLenHex(ch.reg.sound.value, 2);
    document.getElementById("Run").innerText = (+ch.running).toString();
}

function drawMemory() {
    var lst = da.disassembly(ch.mem);
    var view = document.getElementById('romview');
    view.innerHTML = "";
    for(var i = 0; i < lst.length; i++) {
        var div = document.createElement('div');
        div.setAttribute('class', 'line');
        div.innerHTML = lst[i];
        view.appendChild(div);
    }
}

function gotoPCPos() {
    var view = document.getElementById('romview');
    var pre = document.getElementById('focus');
    if(pre) {
        pre.removeAttribute('id');
    }
    view.childNodes[Math.floor(ch.pc / 2)].setAttribute('id', 'focus');
    view.scrollTop = (ch.pc / 2) * 16 - 4 * 16;
    document.getElementById('pcview').innerHTML = 'PC -> ' + da.optoString((ch.mem[ch.pc]<<8)|ch.mem[ch.pc+1]);
}

/* ============================================================================
 *                          Functional Tools
 * ============================================================================
 */

function fixLenHex(x, len) {
    return (Array(len).join('0') + x.toString(16).toUpperCase()).slice(-len);
}

ipcRenderer.on('heat-ok', (event, arg)=>{
    heatmapOpen = true;
})



module.exports = {
    loadROM,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    followPC,
    changeSpeed,
    changeForegroundColor,
    changeBackgroundColor,
    openDebugger,
    openHelp,
    openHeatmap,
    saveStatic,
    emulateStep
}