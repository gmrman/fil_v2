IMPORT util
GLOBALS "api.inc"
GLOBALS "../wonderful/app.inc"

PUBLIC FUNCTION api()
   DEFINE updateurl STRING
   
   TRY
      LET operation = jsonobj.get("operation")
      DISPLAY "INFO:OPERATION:", operation,"->"
      INITIALIZE g_result TO NULL
      LET g_result = util.JSONObject.create()
      LET result='[]'

      TRY
         CASE operation
         # add by 08628
         WHEN "xyc_bcme_ae_af_get"
               CALL strategies('type_data') 
               CALL xyc_bcme_ae_af_get(jsonarr) RETURNING result

            WHEN "xyc_bcme_ae_af_delete"
               CALL strategies('type_data') 
               CALL xyc_bcme_ae_af_delete(jsonarr) RETURNING result

            WHEN "xyc_bcme_create"
               CALL strategies('type_data')
               CALL xyc_bcme_create(jsonarr)

            WHEN "xyc_bcme_delete"
               CALL strategies('type_data')
               CALL xyc_bcme_delete(jsonarr) RETURNING result

            WHEN "xyc_bcaf_create"
               CALL strategies('type_data')
               CALL xyc_bcaf_create(jsonarr) RETURNING result
               
            WHEN "xyc_bcme_get"
               CALL strategies('type_data')
               CALL xyc_bcme_get(jsonarr) RETURNING result

            WHEN "xyc_bcaf_get"
               CALL strategies('type_data')
               CALL xyc_bcaf_get(jsonarr) RETURNING result

            WHEN "xyc_bcae_bcaf_upload_create"
               CALL strategies('type_data')
               CALL xyc_bcae_bcaf_upload_create(jsonarr) RETURNING result

               # add by 08628
            WHEN "changeTitle"
               CALL strategies('type_data')
               CALL changeTitle(jsonarr)  RETURNING result
               
            WHEN "scanBarcode"
               CALL strategies('type_data')
               CALL scanBarcode(jsonarr)  RETURNING result
               
            WHEN "takePhoto"
               CALL strategies('type_data')
               CALL takePhoto(jsonarr)  RETURNING result

            WHEN "choosePhoto"
               CALL strategies('type_data')
               CALL choosePhoto(jsonarr)  RETURNING result

            WHEN "getFileDetail"
               CALL strategies('type_data')
               CALL getFileDetail(jsonarr)  RETURNING result

            WHEN "DeviceListActivity" #Hybrid API 蓝牙连接
               CALL strategies('type_data')
               CALL DeviceListActivity(jsonarr) RETURNING result

            WHEN "hOpenConnection" #Hybrid API 蓝牙连接
               CALL strategies('type_data')
               CALL hOpenConnection(jsonarr) RETURNING result

            WHEN "hSendMessage" #Hybrid API 连接蓝牙Printer
               CALL strategies('type_data')
               CALL hSendMessage(jsonarr) RETURNING result
               
            WHEN "BluetoothWidgetInit"#初始化蓝牙打印控件
               CALL strategies('type_data')
               CALL BluetoothWidgetInit(jsonarr) RETURNING result
               
            WHEN "BluetoothWidgetShow"#显示蓝牙打印按钮
               CALL strategies('type_data')
               CALL BluetoothWidgetShow(jsonarr) RETURNING result
               
            WHEN "BluetoothWidgetHide"#隐藏蓝牙打印按钮
               CALL strategies('type_data')
               CALL BluetoothWidgetHide(jsonarr) RETURNING result
               
            WHEN "BluetoothWidgetSend"#发送蓝牙打印命令
               CALL strategies('type_data')
               CALL BluetoothWidgetSend(jsonarr) RETURNING result
               
            WHEN "basicinformation_get" #抓取基礎資料、使用者資料
               CALL strategies('type_data')
               CALL basicinformation_get(jsonarr) RETURNING result

            WHEN "basicinformation_upd" #更新基礎資料、使用者資料
               CALL strategies('type_data')
               CALL basicinformation_upd(jsonarr) RETURNING result

            WHEN "warehouse_get" #取得庫位、儲位
               CALL strategies('type_data')
               CALL warehouse_get(jsonarr) RETURNING result  

            WHEN "storage_spaces_get" #取得儲位
               CALL strategies('type_data')
               CALL storage_spaces_get(jsonarr) RETURNING result
                
            WHEN "stockinformation_get" #取得庫位、儲位
               CALL strategies('type_data')
               CALL stockinformation_upd(jsonarr) RETURNING result

            WHEN "stockinformation_upd" #更新庫位、儲位
               CALL strategies('type_data')
               CALL stockinformation_upd(jsonarr) RETURNING result

            WHEN "menuinformation_get"  #取得常用MENU
               CALL strategies('type_data')
               CALL menuinformation_get(jsonarr) RETURNING result

            WHEN "menuinformation_upd"  #設定常用MENU
               CALL strategies('type_data')
               CALL menuinformation_upd(jsonarr) RETURNING result

            WHEN "bcme_ae_af_get"
               CALL strategies('type_data') 
               CALL bcme_ae_af_get(jsonarr) RETURNING result

            WHEN "bcme_ae_af_delete"
               CALL strategies('type_data') 
               CALL bcme_ae_af_delete(jsonarr) RETURNING result

            WHEN "bcme_create"
               CALL strategies('type_data')
               CALL bcme_create(jsonarr)

            WHEN "bcme_delete"
               CALL strategies('type_data')
               CALL bcme_delete(jsonarr) RETURNING result

            WHEN "bcaf_create"
               CALL strategies('type_data')
               CALL bcaf_create(jsonarr) RETURNING result
               
            WHEN "bcme_get"
               CALL strategies('type_data')
               CALL bcme_get(jsonarr) RETURNING result

            WHEN "bcaf_get"
               CALL strategies('type_data')
               CALL bcaf_get(jsonarr) RETURNING result

            WHEN "bcae_bcaf_upload_create"
               CALL strategies('type_data')
               CALL bcae_bcaf_upload_create(jsonarr) RETURNING result

            WHEN "qbecondition_upd"
               CALL strategies('type_data')
               CALL qbecondition_upd(jsonarr) RETURNING result

            WHEN "qbecondition_get"
               CALL strategies('type_data')
               CALL qbecondition_get(jsonarr) RETURNING result

            WHEN "fil3_bcme_create"
               CALL strategies('type_data')
               CALL fil3_bcme_create(jsonarr) RETURNING result

            WHEN "fil3_bcme_get"
               CALL strategies('type_data')
               CALL fil3_bcme_get(jsonarr) RETURNING result

            WHEN "fil3_bcmc_creat"
               CALL strategies('type_data')
               CALL fil3_bcmc_creat(jsonarr) RETURNING result
               
            WHEN "fil3_bcmc_get"
               CALL strategies('type_data')
               CALL fil3_bcmc_get(jsonarr) RETURNING result

            WHEN "fil3_bcmc_del"
               CALL strategies('type_data')
               CALL fil3_bcmc_del(jsonarr) RETURNING result

            WHEN "fil3_bcaf_create"
               CALL strategies('type_data')
               CALL fil3_bcaf_create(jsonarr) RETURNING result
               
            WHEN "fil3_bcmc_me_ae_af_delete"
               CALL strategies('type_data')
               CALL fil3_bcmc_me_ae_af_delete(jsonarr) RETURNING result

            WHEN "fil3_bcae_get" 
               CALL strategies('type_data')
               CALL fil3_bcae_get(jsonarr) RETURNING result

            WHEN "fil3_bcae_bcaf_upload_create"
               CALL strategies('type_data')
               CALL fil3_bcae_bcaf_upload_create(jsonarr) RETURNING result

            WHEN "department_create" 
               CALL strategies('type_data')
               CALL department_create(jsonarr) RETURNING result 

            WHEN "department_delete" 
               CALL strategies('type_data')
               CALL department_delete(jsonarr) RETURNING result 

            WHEN "department_get" 
               CALL strategies('type_data')
               CALL department_get(jsonarr) RETURNING result 
            
            WHEN "getConfig"#获取配置 Hybrid API 
               CALL strategies('type_data')
               CALL getConfig(jsonarr) RETURNING result
               
            WHEN "clearConfig"#清除配置 Hybrid API 
               CALL strategies('type_data')
               CALL clearConfig(jsonarr) RETURNING result
               
            WHEN "setConfig"#设定配置 Hybrid API 
               CALL strategies('type_data')
               CALL setConfig(jsonarr) RETURNING result

            WHEN "Vibrator"#振动 Hybrid API 
               CALL strategies('type_data')
               CALL Vibrator(jsonarr) RETURNING result
	       
            WHEN "VoiceUtils"  ###语音 Hybrid API 
               CALL strategies('type_data')
               CALL VoiceUtils(jsonarr) RETURNING result

            WHEN "WiFiPrinter" #Hybrid API 设定IP
               CALL strategies('type_data')
               CALL WiFiPrinter(jsonarr) RETURNING result  

            WHEN "OpenConnection"  #Hybrid API 连接打印机
                CALL strategies('type_data')
                CALL OpenConnection(jsonarr) RETURNING result 

            WHEN "sendMessage"  #Hybrid API 发送打印内容
                CALL strategies('type_data')
                CALL sendMessage(jsonarr) RETURNING result 

            OTHERWISE
               LET g_status.code = FALSE
               LET g_status.message = "Operation ", operation, " is not defined!"
            END CASE

            IF NOT g_status.code THEN
               DISPLAY g_status.message
            END IF
            
            CALL g_result.put('message',g_status.message)
            CALL g_result.put('data',util.JSONArray.parse(result))
            LET g_status.data = g_result.toString()
            #DISPLAY "INFO:RESULT:",g_status.data
            DISPLAY "INFO:OPERATION <-",operation

        #    MESSAGE "G_RESULT:" , g_status.data
      CATCH
         LET g_status.code = FALSE
         LET g_status.message = "ERROR:GET DATA ERROR!"
      END TRY
   CATCH
      LET g_status.code = FALSE
      LET g_status.message= "发生错语：未捕获异常"
   END TRY
   RETURN
END FUNCTION

FUNCTION strategies(changetype)
   DEFINE  changetype STRING
   CASE changetype
   WHEN 'type_data'
      LET jsonarr = util.JSONArray.create()
      LET jsonarr= jsonobj.get("data")
      #DISPLAY "INFO:",jsonarr.toString()
   OTHERWISE
      DISPLAY "INFO:尚无策略信息"
   END CASE
END FUNCTION
