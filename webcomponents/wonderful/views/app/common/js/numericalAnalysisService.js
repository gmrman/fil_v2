define(["app", "API", "APIS"], function(app) {
    app.service('numericalAnalysisService', [
        function() {

            var self = this;

            /***********************************************************************************************************************
             * Descriptions...: 乘法函数，用来得到精确的乘法结果
             *                : javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
             * Usage..........: accMul(arg1,arg2)
             * Input parameter: arg1   變數1
             *                : arg2   變數2
             * Return code....: arg1乘以arg2的精确结果
             * Modify.........: 20170911 By lyw
             ***********************************************************************************************************************/
            self.accMul = function(arg1, arg2) {
                if (arg1 == " " || arg1 === null || arg1 === "" || typeof arg1 == "undefined") arg1 = 0;
                if (arg2 == " " || arg2 === null || arg2 === "" || typeof arg2 == "undefined") arg2 = 0;

                var m = 0,
                    r1, r2,
                    s1 = arg1.toString(),
                    s2 = arg2.toString();
                try {
                    m += s1.split(".")[1].length;
                } catch (e) {}
                try {
                    m += s2.split(".")[1].length;
                } catch (e) {}

                r1 = Number(s1.replace(".", ""));
                r2 = Number(s2.replace(".", ""));
                return Number(r1 * r2 / Math.pow(10, m));
            };

            /***********************************************************************************************************************
             * Descriptions...: 除法函数，用来得到精确的除法结果
             *                : javascript的除法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的除法结果。
             * Usage..........: accDiv(arg1,arg2)
             * Input parameter: arg1   變數1
             *                : arg2   變數2
             * Return code....: arg1除以arg2的精确结果
             * Modify.........: 20170911 By lyw
             ***********************************************************************************************************************/
            self.accDiv = function(arg1, arg2) {
                if (arg1 == " " || arg1 === null || arg1 === "" || typeof arg1 == "undefined") arg1 = 0;
                if (arg2 == " " || arg2 === null || arg2 === "" || typeof arg2 == "undefined") arg2 = 0;

                if (Number(arg1) === 0 || Number(arg2) === 0) {
                    return 0;
                }

                var t1 = 0,
                    t2 = 0,
                    r1, r2;
                try {
                    t1 = arg1.toString().split(".")[1].length;
                } catch (e) {}
                try {
                    t2 = arg2.toString().split(".")[1].length;
                } catch (e) {}

                r1 = Number(arg1.toString().replace(".", ""));
                r2 = Number(arg2.toString().replace(".", ""));
                return Number((r1 / r2) * Math.pow(10, t2 - t1));
            };

            /***********************************************************************************************************************
             * Descriptions...: 加法函数，用来得到精确的加法结果
             *                : javascript的加法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的加法结果。
             * Usage..........: accAdd(arg1,arg2)
             * Input parameter: arg1   變數1
             *                : arg2   變數2
             * Return code....: arg1加arg2的精确结果
             * Modify.........: 20170911 By lyw
             ***********************************************************************************************************************/
            self.accAdd = function(arg1, arg2) {
                if (arg1 == " " || arg1 === null || arg1 === "" || typeof arg1 == "undefined") arg1 = 0;
                if (arg2 == " " || arg2 === null || arg2 === "" || typeof arg2 == "undefined") arg2 = 0;

                var m = 0,
                    c = 0,
                    s1 = arg1.toString(),
                    s2 = arg2.toString();
                try {
                    s1 = arg1.toString().split(".")[1].length;
                } catch (e) {
                    s1 = 0;
                }
                try {
                    s2 = arg2.toString().split(".")[1].length;
                } catch (e) {
                    s2 = 0;
                }

                c = Math.abs(s1 - s2);
                m = Math.pow(10, Math.max(s1, s2));

                if (c > 0) {
                    var cm = Math.pow(10, c);
                    if (s1 > s2) {
                        arg1 = Number(arg1.toString().replace(".", ""));
                        arg2 = Number(arg2.toString().replace(".", "")) * cm;
                    } else {
                        arg1 = Number(arg1.toString().replace(".", "")) * cm;
                        arg2 = Number(arg2.toString().replace(".", ""));
                    }
                } else {
                    arg1 = Number(arg1.toString().replace(".", ""));
                    arg2 = Number(arg2.toString().replace(".", ""));
                }
                return Number((arg1 + arg2) / Number(m));
            };

            /***********************************************************************************************************************
             * Descriptions...: 減法函数，用来得到精确的減法结果
             *                : javascript的減法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的減法结果。
             * Usage..........: accSub(arg1,arg2)
             * Input parameter: arg1   變數1
             *                : arg2   變數2
             * Return code....: arg1減arg2的精确结果
             * Modify.........: 20170911 By lyw
             ***********************************************************************************************************************/
            self.accSub = function(arg1, arg2) {
                if (arg1 == " " || arg1 === null || arg1 === "" || typeof arg1 == "undefined") arg1 = 0;
                if (arg2 == " " || arg2 === null || arg2 === "" || typeof arg2 == "undefined") arg2 = 0;

                var r1, r2, m, n;
                try {
                    r1 = arg1.toString().split(".")[1].length;
                } catch (e) {
                    r1 = 0;
                }
                try {
                    r2 = arg2.toString().split(".")[1].length;
                } catch (e) {
                    r2 = 0;
                }
                m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
                n = (r1 >= r2) ? r1 : r2;
                return Number(((Number(arg1) * Number(m) - Number(arg2) * Number(m)) / Number(m)).toFixed(n));
            };

            /***********************************************************************************************************************
             * Descriptions...: 取位
             * Usage..........: to_round(value, point, round_type)
             * Input parameter: value       數值
             *                : point       取位小數位數
             *                : round_type  取位方式  (1.四捨五入 2.四捨六入五成雙 3.無條件捨棄 4.無條件進位)
             * Return code....: val         取位後結果
             * Modify.........: 20170911 By lyw
             ***********************************************************************************************************************/
            self.to_round = function(value, point, round_type) {

                //預設取位小數位數： 六位
                if (!angular.isNumber(point)) {
                    if (point == " " || point === null || point === "" || typeof point == "undefined") {
                        point = 6;
                    } else {
                        point = Number(point);
                    }
                }

                //預設取位方式： 1.四捨五入
                if (!angular.isNumber(round_type)) {
                    if (round_type == " " || round_type === null || round_type === "" || typeof round_type == "undefined") {
                        round_type = 1;
                    } else {
                        round_type = Number(round_type);
                    }
                }

                var val = 0;
                switch (round_type) {
                    case 1:
                    case "1":
                        //1.四捨五入
                        val = to_round_off(value, point);
                        break;
                    case 2:
                    case "2":
                        //2.四捨六入五成雙
                        val = to_round_off_2(value, point);
                        break;
                    case 3:
                    case "3":
                        //3.無條件捨棄
                        val = to_round_down(value, point);
                        break;
                    case 4:
                    case "4":
                        //4.無條件進位
                        val = to_round_up(value, point);
                        break;
                    default:
                        val = to_round_off_2(value, point);
                }
                return Number(val);
            };

            //四捨五入
            var to_round_off = function(n, m) {
                var po = Math.pow(10, m);
                return self.accDiv(Math.round(self.accMul(n, po)), po).toFixed(m);
            };

            //無條件捨棄
            var to_round_down = function(n, m) {
                var po = Math.pow(10, m);
                return self.accDiv(Math.floor(self.accMul(n, po)), po).toFixed(m);
            };

            //無條件進位
            var to_round_up = function(n, m) {
                var po = Math.pow(10, m);
                return self.accDiv(Math.ceil(self.accMul(n, po)), po);
            };

            //4捨6入5成雙,n值;m小數位數
            var to_round_off_2 = function(n, m) {
                //主要值
                var po = Math.pow(10, m);
                var v = self.accMul(n, po);

                //取小數點前的數值
                var base = Math.floor(v);

                //取小數點
                var rem = v - base;

                //參考數/對照用
                var po1 = Math.pow(10, m + 1);
                var v1 = self.accMul(n, po1);
                var base1 = Math.floor(v1);
                var rem1 = v1 - base1;
                var ans = "";
                var bns = base.toString();
                var blen = bns.length;
                var loastw = 0;

                if (blen > 1) {
                    loastw = parseFloat(bns.substring(blen - 1, blen)) % 2;
                } else {
                    loastw = parseFloat(bns) % 2;
                }

                //4捨6入5成雙很煩人的判斷
                if (rem >= 0.6) {
                    ans = base + 1;
                } else if (rem < 0.5) {
                    ans = base;
                } else if (rem >= 0.5) {
                    //如果指定的小數點位數後還有值,就自動進位
                    if (rem1 > 0) {
                        ans = base + 1;
                    } else {
                        if (loastw === 0) {
                            ans = base;
                        } else {
                            ans = base + 1;
                        }
                    }
                }

                var strAns = ans.toString();
                var strLen = strAns.length;
                if (m > 0) {
                    return strAns.slice(0, strLen - m) + '.' + strAns.slice(strLen - m, strLen);
                } else {
                    return strAns.slice(0, strLen - m);
                }
            };

            return self;
        }
    ]);
});
