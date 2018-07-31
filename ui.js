window.onload = function () {
    var opTypes = {
        "xor": "XOR",
        "caesar": "Шифр Цезаря",
        "reverse": "Обратный порядок",
        "shuffle": "Перемешивание",
        "shuffle_id": "Перемешивание с VK ID"
    };
    var allNames = [];
    for(var type in opTypes){
        allNames.push({name:opTypes[type], value:type});
    }
    function isStringType(str){
        return str === "xor";
    }
    function haveArgs(str){
        return str !== 'reverse';
    }

    function xorEncode(str){
        return str.replace(/\\/g, "\\\\").
        replace(/[\x00-\x1F\x7F-\xFF]/g, function(m){
            return "\\x" + (0 + m.charCodeAt(0).toString(16)).slice(-2).toUpperCase();
        });
    }

    function xorDecode(str) {
        return String(str).
        replace(/\\x([0-F]{2})/ig, function (a, b) {
            return String.fromCharCode(parseInt(b, 16));
        }).replace(/\\\\/g, "\\");
    }

    Vue.component('op', {
        props: ['type', 'args', 'index', 'displayerr'],
        template: '#op-template',
        computed:{
            options: function(){
                return allNames;
            },
            arg:function (){
                return this.args[0];
            },
            isNum:function () {
                return !isStringType(this.type);
            },
            haveArgs:function(){
                return haveArgs(this.type);
            },
            error:function(){
                if(this.args[0] === "" && haveArgs(this.type)){
                    return {haveError: true, errorMsg: "Значение не должно быть пустым"};
                }
                switch (this.type){
                    case "caesar":
                        if(!(this.args[0] >= 0 && this.args[0] <= 130)) {
                            return {haveError: true, errorMsg: "Число должно быть в интервале [0; 130]"};
                        }
                        break;
                    case 'xor':
                        if(xorDecode(this.args[0]).indexOf('\x09') !== -1 || xorDecode(this.args[0]).indexOf('\x11') !== -1){
                            return {haveError: true, errorMsg: "Строка не должна содержать символы \\x09 и \\x11"};
                        }
                        if(/[^\x00-\xFF]/.test(xorDecode(this.args[0]))){
                            return {haveError: true, errorMsg: "Строка не должна содержать символы вне интервала [\\x00;\\xFF]"};
                        }
                        break;
                }
                return {haveError:false, errorMsg:""};
            }
        },
        methods:{
            changeType: function(type){
                if(!isStringType(type)){
                    this.args[0] = this.args[0].replace(/[^0-9]/g, "");
                    this.changeArg(this.args[0])
                }
                this.$emit('change', this.index, {args:this.args, type:type});
            },
            changeArg: function(val){
                this.$emit('change', this.index, {args:[val], type:this.type});
            },
            remove: function(){
                this.$emit('remove', this.index);
            }
        }
    });

    var vm = new Vue({
        el: "#main",
        data: {
            ops:[],
            dragOptions: {
                handle:'.dragHandle',
                ghostClass:'placeholder',
                chosenClass:'chosen'
            },
            decodeVal:"",
            encodeVal:"",
            vkId:"0",
            displayErr: true
        },
        methods:{
            change: function(index, val){
                Vue.set(this.ops, index, val);
            },
            decode: function(){
                var data = {ops: []};
                this.encodeVal = decoder.decode(this.decodeVal, data, this.vkId);
                for(var i = 0; i < data.ops.length; i++){
                    if(haveArgs(data.ops[i].type)) {
                        data.ops[i].args[0] = String(data.ops[i].args[0]);
                        if (isStringType(data.ops[i].type)) {
                            data.ops[i].args[0] = xorEncode(data.ops[i].args[0]);
                        }
                    } else {
                        data.ops[i].args = [""];
                    }
                }
                this.ops = data.ops;
            },
            encode: function(){
                var revOps = this.ops.slice(0).reverse();
                for(var i = 0; i < revOps.length; i++){
                    if(isStringType(revOps[i].type)){
                        revOps[i].args[0] = xorDecode(revOps[i].args[0]);
                    } else if(haveArgs(revOps[i].type)){
                        revOps[i].args[0] = parseInt(revOps[i].args[0]);
                    } else {
                        revOps[i].args = [];
                    }
                }
                this.decodeVal = encoder.encode(this.encodeVal, revOps, this.vkId);
            },
            add: function () {
                this.ops.push({type: "caesar", args: ["0"]});
            },
            remove: function (index) {
                this.ops.splice(index, 1);
            },
            start: function () {
                this.displayErr = false;
            },
            end: function () {
                this.displayErr = true;
            }
        }
    });

    vm.decodeVal = "https://vk.com/mp3/audio_api_unavailable.mp3?extra=lvuKtJaSmLy3twztmsWYn1KS#AqSXmJqjCGSZnqLZcZGjDGL4cX4jCGS3";
    vm.vkId = "1234";
    vm.decode();
};
