*&---------------------------------------------------------------------*
*& Include SAPMZC2FI2001_TOP                        - Module Pool      SAPMZC2FI2001
*&---------------------------------------------------------------------*
PROGRAM sapmzc2fi2001 MESSAGE-ID zc202.
TYPE-POOLS: icon.
TABLES : ztc2md2005, ztc2mm2007, ztc2sd2008, ztc2mm2004.

CLASS lcl_event_handler DEFINITION DEFERRED.

"매입조회목록 data

DATA : BEGIN OF gs_data.
         INCLUDE STRUCTURE ztc2mm2004.
DATA :   status      TYPE c LENGTH 4,
         icon        TYPE icon-id,
*         plant2     TYPE ztc2sd2006-plant,
*         cmpnc2     TYPE ztc2sd2006-cmpnc,
*         vendorc2   TYPE ztc2sd2006-vendorc,
         saleym      TYPE ztc2sd2006-saleym,
         ordercd     TYPE ztc2sd2006-ordercd,
         orderdate   TYPE ztc2sd2006-orderdate,
         duedate     TYPE ztc2sd2006-duedate,
         ttamount    TYPE ztc2sd2006-ttamount,
         waers       TYPE ztc2sd2006-waers,
         odmaxwt     TYPE ztc2sd2006-odmaxwt,
         weightunit  TYPE ztc2sd2006-weightunit,
         outstoredt  TYPE ztc2sd2006-outstoredt,
         resprid2    TYPE ztc2sd2006-resprid,
*         statflag2  TYPE ztc2sd2006-statflag,
*         delflag2   TYPE ztc2sd2006-delflag,
         dispatchcd  TYPE ztc2sd2006-dispatchcd,
         statementnb TYPE ztc2md2008-statementnb,
       END OF gs_data,
       gt_data LIKE TABLE OF gs_data.



*상세조회 data
DATA : BEGIN OF gs_data2.
         INCLUDE STRUCTURE ztc2md2008.
DATA :   statflag  TYPE   ztc2mm2004-statflag,
         statflag2 TYPE   ztc2sd2006-statflag,
         saleym    TYPE ztc2sd2006-saleym,
       END OF gs_data2,
       gt_data2 LIKE TABLE OF gs_data2.

DATA : BEGIN OF gs_data3,
         vendorc  TYPE ztc2md2005-vendorc,
         busi_nb  TYPE ztc2md2005-busi_nb,
         vendorn  TYPE ztc2md2005-vendorn,
         repr     TYPE ztc2md2005-repr,
         ploc     TYPE ztc2md2005-ploc,
         wktp     TYPE ztc2md2005-wktp,
         bzit     TYPE ztc2md2005-bzit,
         svalue   TYPE ztc2md2008-svalue,
         vat      TYPE ztc2md2008-vat,
         total    TYPE ztc2md2008-total,
         currency TYPE ztc2md2008-currency,
         matrc    TYPE ztc2md2006-matrc,
         matrnm   TYPE ztc2md2006-matrnm,
         unit     TYPE ztc2md2006-unit,
         purcp    TYPE ztc2mm2005-purcp,
         purcym   TYPE ztc2mm2005-purcym,
         itemqty  TYPE ztc2sd2007-itemqty,
         saleym   TYPE ztc2sd2007-saleym,
       END OF gs_data3,
       gt_data3 LIKE TABLE OF gs_data3.


DATA : gs_row  TYPE lvc_s_row,
       gt_rows TYPE lvc_t_row.


"전표 data
DATA : gv_svalue TYPE i,
       gv_vat    TYPE i,
       gv_total  TYPE i,
       gv_bg     TYPE i, "사업자번호
       gv_rp     TYPE i, "대표자
       gv_name   type i, "상호
       gv_up     TYPE i, "업태
       gv_bell   TYPE i. "업종

* 조회목록 ALV
DATA : gcl_container TYPE REF TO cl_gui_custom_container,
       gcl_grid      TYPE REF TO cl_gui_alv_grid,
       gcl_handler   TYPE REF TO lcl_event_handler,
       gs_fcat       TYPE lvc_s_fcat,
       gt_fcat       TYPE lvc_t_fcat,
       gs_layout     TYPE lvc_s_layo,
       gs_variant    TYPE disvariant,
       gs_stable     TYPE lvc_s_stbl,

       gs_fcat2      TYPE lvc_s_fcat,
       gt_fcat2      TYPE lvc_t_fcat,
       gs_layout2    TYPE lvc_s_layo,
       gs_variant2   TYPE disvariant,
       gs_stable2    TYPE lvc_s_stbl.



*상세조회ALV
DATA : gcl_container3 TYPE REF TO cl_gui_custom_container,
       gcl_grid3      TYPE REF TO cl_gui_alv_grid,
       gcl_handler3   TYPE REF TO lcl_event_handler,
       gs_fcat3       TYPE lvc_s_fcat,
       gt_fcat3       TYPE lvc_t_fcat,
       gs_layout3     TYPE lvc_s_layo,
       gs_variant3    TYPE disvariant,
       gs_stable3     TYPE lvc_s_stbl.


* 전표입력 ALV
DATA : gcl_container4 TYPE REF TO cl_gui_custom_container,
       gcl_grid4      TYPE REF TO cl_gui_alv_grid,
       gcl_handler4   TYPE REF TO lcl_event_handler,
       gs_fcat4       TYPE lvc_s_fcat,
       gt_fcat4       TYPE lvc_t_fcat,
       gs_layout4     TYPE lvc_s_layo,
       gs_variant4    TYPE disvariant,
       gs_stable4     TYPE lvc_s_stbl.

DATA : gv_okcode TYPE sy-ucomm.