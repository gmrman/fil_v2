IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

PUBLIC FUNCTION fil3_bcme_get(p_json)
   DEFINE p_json              util.JSONArray
   DEFINE tempobj             util.JSONObject
   DEFINE r_json              util.JSONArray
   DEFINE r_return            STRING
   DEFINE obj                 RECORD
            type_no              STRING
                              END RECORD
   DEFINE l_data              RECORD
            bcae005              LIKE app_base_bcae_t.bcae005,  #出入庫瑪
            bcae006              LIKE app_base_bcae_t.bcae006,  #作業代號
            bcae014              LIKE app_base_bcae_t.bcae014,  #記錄作業編號
            bcae015              LIKE app_base_bcae_t.bcae015,  #A開立新單/S過賬/Y確認
            bcae002              LIKE app_base_bcae_t.bcae002   #單號
                              END RECORD
   DEFINE l_bcmc              RECORD
            barcode_no           LIKE app_base_bcmc_t.bcmc001,  #條碼
            item_no              LIKE app_base_bcmc_t.bcmc002,  #料號
            item_feature_no      LIKE app_base_bcmc_t.bcmc003   #產品特徵
                              END RECORD
   DEFINE l_sql               STRING
   DEFINE l_i                 INTEGER
   DEFINE l_allow_qty         DECIMAL(26,10)
   DEFINE l_bcme              RECORD
            item_no              LIKE app_base_bcme_t.bcme010,
            item_feature_no      LIKE app_base_bcme_t.bcme011,
            item_feature_name    LIKE app_base_bcme_t.bcme012,
            item_name            LIKE app_base_bcme_t.bcme043,
            item_spec            LIKE app_base_bcme_t.bcme044,
            doc_qty              LIKE app_base_bcme_t.bcme017,
            in_out_qty           LIKE app_base_bcme_t.bcme018,
            already_qty          LIKE app_base_bcme_t.bcme017,
            allow_error_rate     LIKE app_base_bcme_t.bcme036,
            source_no            LIKE app_base_bcme_t.bcme002,
            unit_no              LIKE app_base_bcme_t.bcme035,
            create_date          LIKE app_base_bcme_t.bcme004,
            object_no            LIKE app_base_bcme_t.bcme008,
            object_name          LIKE app_base_bcme_t.bcme009,
            lot_no               LIKE app_base_bcme_t.bcme015,
            lot_control_type     LIKE app_base_bcme_t.bcme045,
            decimal_places       LIKE app_base_bcme_t.bcme049,
            decimal_places_type  LIKE app_base_bcme_t.bcme050
                              END RECORD
   DEFINE r_obj               DYNAMIC ARRAY OF RECORD
            submit_show          BOOLEAN,
            list                 DYNAMIC ARRAY OF RECORD
               item_no              LIKE app_base_bcme_t.bcme010,
               item_feature_no      LIKE app_base_bcme_t.bcme011,
               item_feature_name    LIKE app_base_bcme_t.bcme012,
               item_name            LIKE app_base_bcme_t.bcme043,
               item_spec            LIKE app_base_bcme_t.bcme044,
               should_qty           LIKE app_base_bcme_t.bcme017,
               already_qty          LIKE app_base_bcme_t.bcme017,
               allow_qty            LIKE app_base_bcme_t.bcme017,
               source_no            LIKE app_base_bcme_t.bcme002,
               unit_no              LIKE app_base_bcme_t.bcme035,
               create_date          LIKE app_base_bcme_t.bcme004,
               object_no            LIKE app_base_bcme_t.bcme008,
               object_name          LIKE app_base_bcme_t.bcme009,
               lot_no               LIKE app_base_bcme_t.bcme015,
               lot_control_type     LIKE app_base_bcme_t.bcme045
                                 END RECORD
                              END RECORD
               
   LET tempobj = p_json.get(1)
   CALL tempobj.toFGL(obj)     
   LET tempobj = p_json.get(2)
   CALL tempobj.toFGL(l_data)
   LET tempobj = p_json.get(3)
   CALL tempobj.toFGL(l_bcmc)

   LET l_sql = " SELECT bcme010, bcme043, bcme044, bcme011, bcme012,       ",
               "        SUM(bcme017), SUM(COALESCE(bcme018,0)),            ",
               "        COALESCE((SELECT SUM(bcmc998)                      ",
               "                    FROM app_base_bcmc_t                   ",
               "                   WHERE bcmcent  = bcmeent                ",
               "                     AND bcmcsite = bcmesite               ",
               "                     AND bcmc002  = bcme010                ",
               "                     AND COALESCE(bcmc003,' ') = COALESCE(bcme011,' ')",
               "                     AND bcmc014  = bcme003                ",
               "                     AND bcmc015  = bcme002) ,0),          ",
               "        COALESCE(bcme036,0), bcme002, bcme004, bcme008, bcme009,       ",
               "        bcme015, bcme045, bcme035,                         ",
               "        COALESCE(bcme049,6), COALESCE(bcme050,1)           ",
               "   FROM app_base_bcme_t                                    ",
               "  WHERE bcmeent = '",g_userInfo.enterprise_no,"'",
               "    AND bcmesite = '",g_userInfo.site_no,"'",
               "    AND bcme003 = '",l_data.bcae006,"'",
               "    AND bcme002 = '",l_data.bcae002,"' "

   IF obj.type_no = "2" THEN
      LET l_sql = l_sql , "  AND bcme010 = '",l_bcmc.item_no,"' "
      LET l_sql = l_sql , "  AND bcme011 = COALESCE('",l_bcmc.item_feature_no,"',' ') "
   END IF
   LET l_sql = l_sql , " GROUP BY bcme010 ,bcme011 "

   PREPARE bcme_pre FROM l_sql 
   DECLARE bcme_cr  CURSOR FOR bcme_pre 

   LET r_obj[1].submit_show = FALSE
   
   LET l_i = 1
   FOREACH bcme_cr INTO l_bcme.item_no, l_bcme.item_name, l_bcme.item_spec, l_bcme.item_feature_no, 
                        l_bcme.item_feature_name, l_bcme.doc_qty, l_bcme.in_out_qty ,l_bcme.already_qty,
                        l_bcme.allow_error_rate, l_bcme.source_no, l_bcme.create_date,
                        l_bcme.object_no, l_bcme.object_name, l_bcme.lot_no,l_bcme.lot_control_type,
                        l_bcme.unit_no, l_bcme.decimal_places, l_bcme.decimal_places_type

                        
      LET r_obj[1].list[l_i].item_no            = l_bcme.item_no
      LET r_obj[1].list[l_i].item_name          = l_bcme.item_name
      LET r_obj[1].list[l_i].item_spec          = l_bcme.item_spec
      LET r_obj[1].list[l_i].item_feature_no    = l_bcme.item_feature_no
      LET r_obj[1].list[l_i].item_feature_name  = l_bcme.item_feature_name
      LET r_obj[1].list[l_i].should_qty         = l_bcme.doc_qty - l_bcme.in_out_qty
      LET r_obj[1].list[l_i].already_qty        = l_bcme.already_qty 

      IF l_bcme.allow_error_rate = "99999999999999" OR
         l_bcme.allow_error_rate = 99999999999999   THEN
         LET r_obj[1].list[l_i].allow_qty       = l_bcme.allow_error_rate
      ELSE
         LET l_allow_qty = l_bcme.doc_qty * ( 1 + l_bcme.allow_error_rate / 100) - l_bcme.in_out_qty
         LET r_obj[1].list[l_i].allow_qty = s_num_rounding(l_bcme.decimal_places_type,l_allow_qty,l_bcme.decimal_places)
      END IF
      
      LET r_obj[1].list[l_i].source_no          = l_bcme.source_no
      LET r_obj[1].list[l_i].unit_no            = l_bcme.unit_no
      LET r_obj[1].list[l_i].create_date        = l_bcme.create_date
      LET r_obj[1].list[l_i].object_no          = l_bcme.object_no
      LET r_obj[1].list[l_i].object_name        = l_bcme.object_name
      LET r_obj[1].list[l_i].lot_no             = l_bcme.lot_no
      LET r_obj[1].list[l_i].lot_control_type   = l_bcme.lot_control_type


      IF (l_bcme.already_qty > 0 AND r_obj[1].submit_show = FALSE) THEN
         LET r_obj[1].submit_show = TRUE
      END IF
      
      LET l_i = l_i + 1
   END FOREACH
      
   LET r_json  = util.JSONArray.fromFGL(r_obj)
   LET r_return = r_json.toString()

   RETURN r_return

END FUNCTION
