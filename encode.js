(function (encoder) {
    encoder.encode = function (str, ops, vk_id){
        return form_url(encode(str, ops, vk_id));
    };
    function encode(str, ops, vk_id) {
        var op_map = {"reverse": "v", "caesar": "r", "xor": "x", "shuffle": "s", "shuffle_id": "i"};
        var proc_ops = [];
        for (var i = 0; i < ops.length; i++) {
            switch (ops[i]["type"]) {
                case "reverse":
                    str = reverse(str);
                    break;
                case "caesar":
                    str = crypt_caesar(str, -ops[i]["args"][0]);
                    break;
                case "xor":
                    str = crypt_xor(str, ops[i]["args"][0]);
                    break;
                case "shuffle":
                    str = shuffle(str, ops[i]["args"][0]);
                    break;
                case "shuffle_id":
                    str = shuffle(str, ops[i]["args"][0] ^ vk_id);
                    break;
            }
            var proc_op = [];
            proc_op.push(op_map[ops[i]["type"]]);
            if ("args" in ops[i]) {
                proc_op = proc_op.concat(ops[i]["args"]);
            }
            proc_ops.push(proc_op.join(String.fromCharCode(11)));
        }
        var enc_str = main_enc(str);
        var enc_ops = main_enc(proc_ops.join(String.fromCharCode(9)));
        return [enc_str, enc_ops];
    }

    /*Функция формирует URL по результату вызова предыдущей функции*/
    function form_url(vals) {
        return "https://vk.com/mp3/audio_api_unavailable.mp3?extra="
            + vals[0] + "#" + vals[1];
    }

    var vk_str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0PQRSTUVWXYZO123456789+/=";

    function main_enc(str) {
        var shifts = [4, 2, 0];
        var prev_i = 0;
        var res = [];
        var ind2 = (Math.floor(str.length / 3)) * 4 +
            (((str.length % 3) == 0) ? -1 : (str.length % 3));
        for (var ind = str.length; ind--;) {
            var ch = str[ind].charCodeAt(0);
            var shift = shifts[((ind) % 3)];
            prev_i = (ch << shift) | prev_i;
            var res_ch = (prev_i) & 63;
            res.unshift(vk_str[res_ch]);
            prev_i = prev_i >> 6;
            ind2--;
            if ((ind2 % 4) == 0) {
                res_ch = (prev_i) & 63;
                res.unshift(vk_str[res_ch]);
                prev_i = 0;
                ind2--;
            }
        }
        return res.join("");
    }

    function reverse(t) {
        return t.split("").reverse().join("")
    }

    function crypt_caesar(t, i) {
        t = t.split("");
        if (i < 0) {
            i += 65;
        }
        var double_str = vk_str + vk_str;
        for (var j = t.length; j >= 0; j--) {
            var index = double_str.indexOf(t[j]);
            if (index != -1) {
                t[j] = double_str.substr(index - i, 1);
            }
        }
        return t.join("")
    }

    function crypt_xor(t, i) {
        var e = [];
        return i = i.charCodeAt(0),
            t.split("").forEach(function (o) {
                e.push(String.fromCharCode(o.charCodeAt(0) ^ i))
            }),
            e.join("")
    }

    function shuffle(str, arg) {
        var len = str.length;
        var cur = Math.abs(arg);
        var shuffle_pos = [];
        for (var i = len - 1; i >= 0; i--) {
            cur = (len * (i + 1) ^ (cur + i)) % len;
            shuffle_pos.unshift(cur);
        }
        var strArr = str.split('');
        for (var i = 1; i < len; i++) {
            var offset = shuffle_pos[i - 1];
            var prev = strArr[len - i];
            strArr[len - i] = strArr[offset];
            strArr[offset] = prev;
        }
        return strArr.join('');
    }
})(window.encoder = window.encoder || {});