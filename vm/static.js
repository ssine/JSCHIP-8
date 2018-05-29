/*
 * Count all the instruction execution and record them,
 * also providing a set of visualization functions based on heatmap.js
 */

var fs = require('fs');
var instr_seq = new Array(); // integers indicating pc positions
var instr_map = new Int32Array(4096);
var max_ct = 0;
var ramFile = null; // a list contain even / odd parsed instr strings
var instr_seq_str = new Array(); // strings showing instruction class

function init() {
    instr_seq = new Array();
    instr_map = new Int32Array(4096);
    instr_seq_str = new Array();
    max_ct = 0;
}

function count(pc) {
    instr_seq.push(pc);
    instr_map[pc]++;
    max_ct = Math.max(max_ct, instr_map[pc]);
    instr_seq_str.push(ramFile[pc%2][parseInt(pc/2)]);
    // console.log(instr_map[pc]);
}

function setRAM(ram_lst) {
    ramFile = ram_lst;
}

var lineHeight = 15;
var lineLength = 250;
var lineIndent = 14;
var dotSpace = lineHeight/2-2;

function getHeatmapData() {
    var data = {
        max: max_ct,
        min: 0,
        data: []
    };
    for(var i = 512; i < 4096; i++) {
        if(instr_map[i] != 0) {
            for(var j = lineIndent; j <= lineIndent + lineLength; j += dotSpace) {
                data.data.push({
                    x: j,
                    y: (i/2 + 0.5 - 256) * lineHeight,
                    value: instr_map[i]
                })
            }
        }
    }
    return data;
}

function save(romName) {
    fs.writeFileSync(__dirname  + '/static_data/' + romName + '-sequence.json', JSON.stringify(instr_seq));
    fs.writeFileSync(__dirname  + '/static_data/' + romName + '-sequence-str.json', JSON.stringify(instr_seq_str));
    // fs.writeFileSync(__dirname  + '/static_data/' + romName + '-map.json', JSON.stringify(instr_map));
    // fs.writeFileSync(__dirname  + '/static_data/' + romName + '-ram.json', JSON.stringify(ramFile));
}

module.exports = {
    init,
    count,
    getHeatmapData,
    save,
    setRAM,
    lineHeight,
    lineLength,
    lineIndent,
    dotSpace
}
