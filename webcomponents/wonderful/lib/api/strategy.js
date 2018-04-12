/**
 * Created by cocoa on 16/8/12.
 */
/************表单校验策略对象************/
var strategies = {
    isNonEmpty:function (value,errorMesg) {
        if (value == ""){
            return errorMesg;
        }
    },
    minLength: function (value,length,errorMesg) {
        if(value.length< length){
            return errorMesg;
        }
    },
    isMobile : function (value ,errorMesg) {
        if(! /(^1[3|5|8][0-9]{9}$)/.test( value )){
            return errorMesg;
        }
    },
    isEqual : function (value ,equalValue, errorMesg) {
        if(value !== equalValue){
            return errorMesg;
        }
    }

}
/************Validator 类************/
var Validator = function(){
    this.cache = [];
}
Validator.prototype.add = function(dom ,rules){
    var self = this;

    for(var i = 0,rule ; rule = rules[ i++ ];){
        (function ( rule ) {
            var strategyAry = rule.strategy.split( ':' );
            var errorMsg = rule.errorMsg;

            self.cache.push(function(){
                var strategy = strategyAry.shift();
                strategyAry.unshift( dom.value );
                strategyAry.push( errorMsg );
                return strategies[ strategy ].apply( dom, strategyAry);
            })
        })( rule )
    }
};
Validator.prototype.start = function(){
    for( var i = 0, validatorFunc; validatorFunc = this.cache[ i++ ]; ){
        var errorMsg = validatorFunc();
        if(errorMsg){
            return errorMsg;
        }
    }
}