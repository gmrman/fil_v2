IMPORT util
IMPORT os

#引用全局变量
GLOBALS "api.inc"

FUNCTION afterinput()

   DISPLAY "INFO:AFTER INPUT->",CURRENT YEAR TO FRACTION(5)
   CALL ui.Interface.frontCall("webcomponent", "call", ["formonly.web", "function(){if(typeof(gICAPI)!='undefined'){bridge().onAfterInput()}}"], [])
   DISPLAY "INFO:AFTER INPUT<-",CURRENT YEAR TO FRACTION(5)

END FUNCTION

