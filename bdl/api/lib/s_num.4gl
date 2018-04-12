################################################################################
# Descriptions...: 小数位前N位或后N位做运算后的取整
# Memo...........:
# Usage..........: CALL s_num_rounding(p_type,p_num,p_pos) RETURNING r_num
# Input parameter: p_type    #1.四舍五入 2.四舍六入五留双 3.无条件截位 4.无条件进位
#                  p_num     数值
#                  p_pos     小数位(可正负)
# Return code....: r_num     运算后的结果值
# Date & Author..: 13/09/24  By Carrier
# Modify.........:
################################################################################
PUBLIC FUNCTION s_num_rounding(p_type,p_num,p_pos)
   DEFINE p_type      VARCHAR(1)       #1.四舍五入 2.四舍六入五留双 3.无条件截位 4.无条件进位
   DEFINE p_num       DECIMAL(26,10)   #原始值
   DEFINE p_pos       DECIMAL(5,0)     #小数位前/后的第N位
   DEFINE r_num       DECIMAL(26,10)   #回收值
   DEFINE l_p1        DECIMAL(5,0)     #位置1-精确至哪位
   DEFINE l_p2        DECIMAL(5,0)     #位置2-精确位+1;进位否的最主要位置
   DEFINE l_p_zero    DECIMAL(5,0)     #小数点的位置
   DEFINE l_str       VARCHAR(50)
   DEFINE l_tmp       VARCHAR(50)      #l_str[1,l_p1]
   DEFINE l_tmp1      STRING           #l_str[l_p2+1,length(l_str)]
   DEFINE l_flag      VARCHAR(1)       #标识位
   DEFINE l_add       DECIMAL(5,0)     #进位值 0/1
   DEFINE l_i         INTEGER
   DEFINE l_n1        DECIMAL(5,0)     #精确位上的值,用于判断奇偶
   DEFINE l_n2        DECIMAL(5,0)     #是否进位的值,要与5做比较

   LET l_str = p_num USING "&&&&&&&&&&&&&&&&.&&&&&&&&&&"
   #小数点的位置
   LET l_tmp1 = l_str
   LET l_p_zero = l_tmp1.getIndexOf('.',1)

   #1.取得精确位及进入参考数字的位置
   #ex:p_num = 3.1415926 ,p_pos = 4;l_str = "0000000000000003.1415926000"
   #   l_p1 = 21 l_p2 = 22
   #ex:p_num = 3.1415926 ,p_pos = -4;l_str = "0000000000000003.1415926000"
   #   l_p1 = 12 l_p2 = 13
   CASE
       WHEN p_pos > 0   LET l_p1 = l_p_zero + p_pos
                        LET l_p2 = l_p_zero + p_pos + 1
       WHEN p_pos = 0   LET l_p1 = l_p_zero - 1
                        LET l_p2 = l_p_zero + 1
       WHEN p_pos <0    LET l_p1 = l_p_zero + p_pos - 1
                        LET l_p2 = l_p_zero + p_pos
   END CASE

   #2.不管是否进位,直接将非精确位置及后面的内容舍弃
   #p_num = 3.1415926 , p_pos = 3 ;l_tmp = 3.141
   LET l_tmp = l_str[1,l_p1]

   #若p_pos < 0 时,小数位前要补0
   IF p_pos < 0 THEN
      FOR l_i = LENGTH(l_tmp) + 1 TO l_p_zero - 1
          LET l_tmp = l_tmp CLIPPED,'0'
      END FOR
   END IF

   #3.l_flag 用于判断l_p2后面的内容是否非零
   #p_type = '1' 四舍五入时,不需要考虑l_p2后面的数字
   #p_type = '2' 四舍六入五留双时,当l_p2的数字为5时,若后面有非零的数字,则直接进位
   #                              当l_p2的数字为5时,l_p2后面均为0,则要看l_p1的数字若是奇数则进位,若偶数,则不进位
   #p_type = '3' 无条件截位时,不需要考虑l_p2后面的数字
   #p_type = '4' 无条件进位时,当l_p2后面有任何数字时,就会进位
   #ex:3.14159260000, p_pos = 4 ;l_flag = 'Y'
   #ex:3.14159260000, p_pos = 7 ;l_flag = 'N'
   CASE
       WHEN p_type = '1' OR p_type = '3'
            LET l_flag = 'N'
       WHEN p_type = '2' OR p_type = '4'
            LET l_tmp1 = l_str[l_p2 + 1,LENGTH(l_str)]
            LET l_flag = 'N'
            FOR l_i = 1 TO 9
                IF l_tmp1.getIndexOf(l_i,1) THEN
                   LET l_flag = 'Y'
                   EXIT FOR
                END IF
            END FOR
   END CASE

   #4.判断是否要进位
   LET l_n1 = l_str[l_p1,l_p1]
   LET l_n2 = l_str[l_p2,l_p2]
   #l_add=0 不进位 l_add=1 进位
   LET l_add = 0

   CASE p_type
        WHEN '1'   #四舍五入
                   IF l_n2 >=5 THEN LET l_add = 1 END IF

        WHEN '2'   #四舍六入五留双
                   IF l_n2 > 5 OR                              #l_p2上的数字大于5,直接进位
                      l_n2 = 5 AND l_flag = 'Y' OR             #l_p2上的数字等于5,且l_p2后面还有数字
                      l_n2 = 5 AND (l_n1 MOD 2 = 1) THEN       #l_p2上的数字等于5,且l_n1前面的数字为奇数
                      LET l_add = 1
                   END IF

        WHEN '4'   #无条件进位                           
                   IF l_flag = 'Y' OR l_n2 <> 0 THEN LET l_add = 1 END IF   #n2不为零,或是l_p2位置后面有值,均进位
   END CASE

   #5.进位时,要确认进位的数值是多少,ex:0.1;0.01;100等
   #ex:p_num=3.14561;p_pos=4时,l_tmp1='0.0001'
   #   p_num=3.14561;p_pos=-4时,l_tmp1='10000' 
   LET l_tmp1 = 0
   IF l_add = 1 THEN
      IF p_pos > 0 THEN
         LET l_tmp1 = '0.'
         FOR l_i = 1 TO p_pos -1
             LET l_tmp1 = l_tmp1 CLIPPED,'0'
         END FOR
         LET l_tmp1 = l_tmp1 CLIPPED,'1'
      ELSE
         LET l_tmp1 = ''
         FOR l_i = p_pos TO -1
             LET l_tmp1 = l_tmp1 CLIPPED,'0'
         END FOR
         LET l_tmp1 = 1,l_tmp1 CLIPPED
      END IF
   END IF

   LET r_num = l_tmp + l_tmp1

   RETURN r_num
END FUNCTION