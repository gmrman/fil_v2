IMPORT util
IMPORT os

#引用全局变量
GLOBALS "api.inc"

FUNCTION calcel()
   DISPLAY "INFO:BACK BUTTON->",CURRENT YEAR TO FRACTION(5)
   CALL ui.Interface.frontCall("webcomponent", "call", ["formonly.web", "function(){if(typeof(gICAPI)!='undefined'){return onBack()}}"],[res])
   DISPLAY "INFO:BACK BUTTON ",res,"<-",CURRENT YEAR TO FRACTION(5)
END FUNCTION
