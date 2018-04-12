IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

 TYPE type_scan     RECORD   #單身記錄
         barcode_no                        LIKE app_base_bcaf_t.bcaf006,  #條碼
         item_no                           LIKE app_base_bcaf_t.bcaf007,  #料號
         item_feature_no                   LIKE app_base_bcaf_t.bcaf008,  #产品特征
         item_feature_name                 LIKE app_base_bcaf_t.bcaf009,  #产品特征说明
         item_name                         LIKE app_base_bcaf_t.bcafname, #品名
         item_spec                         LIKE app_base_bcaf_t.bcafspec, #規格
         multi_unit_type                   LIKE app_base_bcaf_t.bcafMunit,#多單位的單位控管方式
         warehouse_no                      LIKE app_base_bcaf_t.bcaf010,  #倉庫
         storage_spaces_no                 LIKE app_base_bcaf_t.bcaf011,  #儲位
         lot_no                            LIKE app_base_bcaf_t.bcaf012,  #批號
         unit                              LIKE app_base_bcaf_t.bcaf017,  #單位
         qty                               LIKE app_base_bcaf_t.bcaf016,  #數量
         main_organization                 LIKE app_base_bcae_t.bcae016,  #主營組織
         ingoing_warehouse_no              LIKE app_base_bcaf_t.bcaf036,  #撥入倉庫
         ingoing_storage_spaces_no         LIKE app_base_bcaf_t.bcaf037,  #撥入儲位
         outgoing_warehouse_no             LIKE app_base_bcaf_t.bcaf036,  #撥出倉庫
         outgoing_storage_spaces_no        LIKE app_base_bcaf_t.bcaf037,  #撥出儲位
         in_transit_cost_warehouse_no      LIKE app_base_bcaf_t.bcaf038,  #在途成本倉
         in_transit_non_cost_warehouse_no  LIKE app_base_bcaf_t.bcaf039,  #在途非成本倉
         run_card_no                       LIKE app_base_bcaf_t.bcaf040,  #RunCard
         source_no                         LIKE app_base_bcaf_t.bcaf020,  #单号
         seq                               LIKE app_base_bcaf_t.bcaf021,  #项次
         doc_line_seq                      LIKE app_base_bcaf_t.bcaf022,  #项序
         doc_batch_seq                     LIKE app_base_bcaf_t.bcaf023,  #分批序
         reason_no                         LIKE app_base_bcaf_t.bcaf041,  #理由碼  
         reference_unit_no                 LIKE app_base_bcaf_t.bcaf042,  #參考單位
         reference_qty                     LIKE app_base_bcaf_t.bcaf043,  #參考數量
         valuation_unit_no                 LIKE app_base_bcaf_t.bcaf044,  #計價單位
         valuation_qty                     LIKE app_base_bcaf_t.bcaf045,  #計價數量
         inventory_unit                    LIKE app_base_bcaf_t.bcaf046,  #庫存單位
         inventory_qty                     LIKE app_base_bcaf_t.bcaf047,  #庫存數量
         packing_barcode                   LIKE app_base_bcaf_t.bcafPcode,#裝箱條碼
         packing_qty                       LIKE app_base_bcaf_t.bcafPqty  #裝箱數量
                                       END RECORD
 TYPE type_bcae                        RECORD
         bcae005                          LIKE app_base_bcae_t.bcae005,  #出入庫瑪
         bcae006                          LIKE app_base_bcae_t.bcae006,  #作業代號
         bcae014                          LIKE app_base_bcae_t.bcae014,  #記錄作業編號
         bcae015                          LIKE app_base_bcae_t.bcae015,  #A開立新單/S過賬/Y確認
         info_id                          LIKE app_base_bcme_t.bcme999
                                       END RECORD
                    
#掃描紀錄檔單頭預設值
FUNCTION gat_bcae_def(p_scan,p_data)
   DEFINE p_data            type_bcae
   DEFINE p_scan            type_scan
   DEFINE l_bcae_t          RECORD LIKE app_base_bcae_t.*
   
   IF p_scan.source_no IS NULL THEN
      LET p_scan.source_no = " "
   END IF
   
   LET l_bcae_t.bcaeent = g_userInfo.enterprise_no
   LET l_bcae_t.bcaesite = g_userinfo.site_no
   LET l_bcae_t.bcae001 = p_data.info_id
   LET l_bcae_t.bcae002 = p_scan.source_no   
   LET l_bcae_t.bcae003 = g_scanno
   LET l_bcae_t.bcae005 = p_data.bcae005
   LET l_bcae_t.bcae006 = p_data.bcae006
   LET l_bcae_t.bcae007 = g_userInfo.employee_no
   LET l_bcae_t.bcae014 = p_data.bcae014
   LET l_bcae_t.bcae015 = p_data.bcae015
   LET l_bcae_t.bcae016 = p_scan.main_organization

   IF cl_null(l_bcae_t.bcae016) THEN
      SELECT bcme040
        INTO l_bcae_t.bcae016
        FROM app_base_bcme_t
       WHERE bcmeent = g_userInfo.enterprise_no
         AND bcmesite = g_userinfo.site_no
         AND bcme002 = p_scan.source_no
         AND bcme003 = p_data.bcae014
         AND bcme005 = p_scan.seq
         AND bcme006 = p_scan.doc_line_seq
         AND bcme007 = p_scan.doc_batch_seq
   END IF

   LET l_bcae_t.bcae999 = g_datetime
   LET l_bcae_t.bcaestus = 'Y'
   
   RETURN l_bcae_t.*

END FUNCTION

#掃描紀錄檔單身預設值
#增加回传参数，判断是否是1-1,3-1,1-2，bcaf020需要给采购单
FUNCTION gat_bcaf_def(p_bcae_t,p_scan,p_data)
   DEFINE p_bcae_t          RECORD LIKE app_base_bcae_t.*
   DEFINE p_scan            type_scan
   DEFINE l_bcaf_t          RECORD LIKE app_base_bcaf_t.*
   DEFINE l_bcaf004         LIKE app_base_bcaf_t.bcaf004      #掃描項次
   DEFINE p_data            type_bcae

   WHENEVER ERROR CONTINUE

   SELECT MAX(bcaf004)+1 INTO l_bcaf004
     FROM app_base_bcaf_t
    WHERE bcafent  = g_userInfo.enterprise_no
      AND bcafsite = g_userinfo.site_no
      AND bcaf003  = g_scanno

   IF cl_null(l_bcaf004) THEN
      LET l_bcaf004 = 1
   END IF
   
   LET l_bcaf_t.bcafent  = p_bcae_t.bcaeent
   LET l_bcaf_t.bcafsite = p_bcae_t.bcaesite
   LET l_bcaf_t.bcafname = p_scan.item_name
   LET l_bcaf_t.bcafspec = p_scan.item_spec
   LET l_bcaf_t.bcafMunit= p_scan.multi_unit_type
   LET l_bcaf_t.bcaf001  = p_bcae_t.bcae001
   LET l_bcaf_t.bcaf002  = p_bcae_t.bcae002
   LET l_bcaf_t.bcaf003  = p_bcae_t.bcae003
   LET l_bcaf_t.bcaf004  = l_bcaf004
   LET l_bcaf_t.bcaf005  = p_bcae_t.bcae005
   LET l_bcaf_t.bcaf006  = p_scan.barcode_no
   LET l_bcaf_t.bcaf007  = p_scan.item_no
   LET l_bcaf_t.bcaf008  = p_scan.item_feature_no
   LET l_bcaf_t.bcaf009  = p_scan.item_feature_name

   IF cl_null(l_bcaf_t.bcaf008) THEN
      SELECT bcme011, bcme012 
        INTO l_bcaf_t.bcaf008,l_bcaf_t.bcaf009
        FROM app_base_bcme_t
       WHERE bcmeent = g_userInfo.enterprise_no
         AND bcmesite = g_userinfo.site_no
         AND bcme002 = p_scan.source_no
         AND bcme005 = p_scan.seq
         AND bcme006 = p_scan.doc_line_seq
         AND bcme007 = p_scan.doc_batch_seq
   END IF
   
   LET l_bcaf_t.bcaf010 = p_scan.warehouse_no
   LET l_bcaf_t.bcaf011 = p_scan.storage_spaces_no
   LET l_bcaf_t.bcaf012 = p_scan.lot_no
   LET l_bcaf_t.bcaf013 = ''
   LET l_bcaf_t.bcaf014 = ''
   LET l_bcaf_t.bcaf015 = ''
   LET l_bcaf_t.bcaf016 = p_scan.qty
   LET l_bcaf_t.bcaf017 = p_scan.unit

   IF cl_null(l_bcaf_t.bcaf017) THEN
      SELECT bcme035 INTO l_bcaf_t.bcaf017
        FROM app_base_bcme_t
       WHERE bcmeent = g_userInfo.enterprise_no
         AND bcmesite = g_userinfo.site_no
         AND bcme002 = p_scan.source_no
         AND bcme005 = p_scan.seq
         AND bcme006 = p_scan.doc_line_seq
         AND bcme007 = p_scan.doc_batch_seq    
   END IF

   IF cl_null(l_bcaf_t.bcaf017) THEN
      SELECT bcme048 INTO l_bcaf_t.bcaf017
        FROM app_base_bcme_t
       WHERE bcmeent = g_userInfo.enterprise_no
         AND bcmesite = g_userinfo.site_no
         AND bcme002 = p_scan.source_no
         AND bcme005 = p_scan.seq
         AND bcme006 = p_scan.doc_line_seq
         AND bcme007 = p_scan.doc_batch_seq    
   END IF

   LET l_bcaf_t.bcaf018 = g_datetime
   LET l_bcaf_t.bcaf019 = NULL
   LET l_bcaf_t.bcaf020 = p_scan.source_no
   LET l_bcaf_t.bcaf021 = p_scan.seq
   LET l_bcaf_t.bcaf022 = p_scan.doc_line_seq
   LET l_bcaf_t.bcaf023 = p_scan.doc_batch_seq
   LET l_bcaf_t.bcaf036 = p_scan.ingoing_warehouse_no
   LET l_bcaf_t.bcaf037 = p_scan.ingoing_storage_spaces_no
   LET l_bcaf_t.bcaf038 = p_scan.in_transit_cost_warehouse_no
   LET l_bcaf_t.bcaf039 = p_scan.in_transit_non_cost_warehouse_no
   LET l_bcaf_t.bcaf040 = p_scan.run_card_no
   LET l_bcaf_t.bcaf041 = p_scan.reason_no
   LET l_bcaf_t.bcaf042 = p_scan.reference_unit_no
   LET l_bcaf_t.bcaf043 = p_scan.reference_qty
   LET l_bcaf_t.bcaf044 = p_scan.valuation_unit_no
   LET l_bcaf_t.bcaf045 = p_scan.valuation_qty
   LET l_bcaf_t.bcaf046 = p_scan.inventory_unit
   LET l_bcaf_t.bcaf047 = p_scan.inventory_qty
   
   LET l_bcaf_t.bcafPcode = p_scan.packing_barcode
   LET l_bcaf_t.bcafPqty = p_scan.packing_qty
   
   RETURN l_bcaf_t.*

END FUNCTION

#新增掃描紀錄
FUNCTION bcaf_create(p_jsonarr)
   DEFINE p_jsonarr         util.JSONArray 
   DEFINE tempobj           util.JSONObject
   DEFINE temparr           util.JSONArray
   DEFINE r_json            util.JSONArray
   DEFINE r_return          STRING
   DEFINE l_cnt             INTEGER
   DEFINE l_bcae003         LIKE app_base_bcae_t.bcae003
   DEFINE l_i               INTEGER
   DEFINE l_bcae_t          RECORD LIKE app_base_bcae_t.*
   DEFINE l_bcaf_t          RECORD LIKE app_base_bcaf_t.*
   DEFINE l_states          DYNAMIC ARRAY OF RECORD
          code              BOOLEAN,     #0:success, 其他:fail
          MESSAGE           STRING,      #说明信息
          data              STRING       #回传值 必需为JSON  String  一般为util.JSON.stringify（DYNAMIC ARRAY OF RECORD）
                            END RECORD
   DEFINE l_data            type_bcae
   DEFINE l_scan            DYNAMIC ARRAY OF type_scan

   WHENEVER ERROR CONTINUE

   INITIALIZE l_scan TO NULL
   INITIALIZE l_data TO NULL

   LET temparr = p_jsonarr.get(1)
   CALL temparr.toFGL(l_scan)
   LET tempobj = p_jsonarr.get(2)
   CALL tempobj.toFGL(l_data)

   #產生掃描單號
   LET g_datetime = CURRENT YEAR TO SECOND
   LET g_scanno = cl_timestamp_from_datetime(CURRENT)
   LET g_status.code = TRUE

   LET l_cnt = 0
   SELECT COUNT(1)
     INTO l_cnt
     FROM app_base_bcae_t
    WHERE bcaeent = g_userInfo.enterprise_no
      AND bcaesite = g_userInfo.site_no
      AND bcae014 = l_data.bcae014
      AND bcae015 = l_data.bcae015
      AND bcae001 = l_data.info_id

   IF l_cnt > 0 THEN
      SELECT bcae003
        INTO l_bcae003
        FROM app_base_bcae_t
       WHERE bcaeent = g_userInfo.enterprise_no
         AND bcaesite = g_userInfo.site_no
         AND bcae014 = l_data.bcae014
         AND bcae015 = l_data.bcae015
         AND bcae001 = l_data.info_id
         
      BEGIN WORK
      
      DELETE FROM app_base_bcae_t 
       WHERE bcaeent = g_userInfo.enterprise_no
         AND bcaesite = g_userInfo.site_no
         AND bcae003 = l_bcae003
         
      DELETE FROM app_base_bcaf_t 
       WHERE bcafent = g_userInfo.enterprise_no
         AND bcafsite = g_userInfo.site_no
         AND bcaf003 = l_bcae003

      IF g_status.code THEN
         COMMIT WORK
      ELSE
         ROLLBACK WORK
      END IF
   END IF

   BEGIN WORK

   FOR l_i = 1 TO l_scan.getLength()
      INITIALIZE l_bcaf_t TO NULL
      INITIALIZE l_bcae_t TO NULL

      IF l_scan[l_i].qty = 0 THEN
         CONTINUE FOR
      END IF 
        
      #若已有掃描異動紀錄單頭資料，則忽略不處理
      LET l_cnt = 0
      SELECT COUNT(*) INTO l_cnt
        FROM app_base_bcae_t
       WHERE bcaeent = g_userInfo.enterprise_no
         AND bcaesite = g_userInfo.site_no
         AND COALESCE(bcae002,' ') = COALESCE(l_scan[l_i].source_no,' ')
         AND bcae003 = g_scanno
   
      IF l_cnt = 0 THEN
         CALL gat_bcae_def(l_scan[l_i].*,l_data.*) RETURNING l_bcae_t.*
      
         INSERT INTO app_base_bcae_t VALUES(l_bcae_t.*)
         IF SQLCA.SQLCODE THEN
            LET g_status.code = FALSE
            LET g_status.message = SQLCA.SQLCODE
         END IF
      ELSE
         SELECT * INTO l_bcae_t.*
           FROM app_base_bcae_t
          WHERE bcaeent = g_userInfo.enterprise_no
            AND bcaesite = g_userInfo.site_no
            AND COALESCE(bcae002,' ') = COALESCE(l_scan[l_i].source_no,' ')
            AND bcae003 = g_scanno
      END IF

      CALL gat_bcaf_def(l_bcae_t.*,l_scan[l_i].*,l_data.*) RETURNING l_bcaf_t.*
      
      INSERT INTO app_base_bcaf_t VALUES(l_bcaf_t.*)
      IF SQLCA.SQLCODE THEN
         LET g_status.code = FALSE
         LET g_status.message = SQLCA.SQLCODE
      END IF
   END FOR 
   
   IF g_status.code THEN
      COMMIT WORK
   ELSE
      ROLLBACK WORK
   END IF

   LET l_states[1].* = g_status.*

   LET r_json  = util.JSONArray.fromFGL(l_states)
   LET r_return = r_json.toString()

   RETURN r_return

END FUNCTION

FUNCTION cl_timestamp_from_datetime(p_datetime)
    DEFINE p_datetime DATETIME YEAR TO FRACTION(5)
    DEFINE r_timestamp STRING
    DEFINE l_sb base.StringBuffer
    DEFINE l_datetimeStr STRING

    LET l_datetimeStr = p_datetime
    LET l_sb = base.StringBuffer.create()
    CALL l_sb.append(l_datetimeStr)
    CALL l_sb.replace(":", "", 0)
    CALL l_sb.replace(" ", "", 0)
    CALL l_sb.replace("-", "", 0)
    CALL l_sb.replace(".", "", 0)
    LET r_timestamp = l_sb.toString()

    RETURN r_timestamp.trim()
END FUNCTION