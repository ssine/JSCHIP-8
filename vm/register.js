// general: the group of 16 general registers -- from V0 to VF

var register = new Uint8Array(16);

register.RPL = new Uint8Array(8);

// timer: delay and sound timer

var timer_interval = 1 / 60 * 1000;

function Timer() {
    this.value = 0;
    this.minus_one = function() {
        this.value--;
        if(this.value <= 0) {
            clearTimeout(this.minus_one_timer);
            this.value = 0;
        }
    }
    this.set = function(value) {
        if(typeof value == 'number' && value >= 0) {
            if(value >= 256) value %= 256;
            this.value = value;
            if(value > 0)
                this.minus_one_timer = setInterval(this.minus_one.bind(this), timer_interval);
        } else {
            console.log('Timer set illegal!');
        }
    }
    this.get = function() {
        return this.value;
    }
}

register.delay = new Timer();
register.sound = new Timer();

register.init = function() {
    var i;
    for(i = 0; i < register.length; i++) {
        register[i] = 0;
    }
    this.delay.set(0);
    this.sound.set(0);
}

module.exports = register;