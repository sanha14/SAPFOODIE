sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/Label",
    "sap/m/Text",
	"sap/m/TextArea",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/layout/VerticalLayout",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/library",
    "sap/ui/core/Core"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Filter, FilterOperator, MessageBox,Label,Text,TextArea, HorizontalLayout, VerticalLayout, MessageToast, Dialog, Button, library, Core) {
        "use strict";
         // shortcut for sap.m.ButtonType
         var ButtonType = library.ButtonType;

         // shortcut for sap.m.DialogType
         var DialogType = library.DialogType;

        return Controller.extend("b02.mm.orderapproval.mmorderapproval02.controller.View1", {
            onInit: function () {
                   //wizard 클릭이 불가능 하게 설정. 
                this.oWizard = this.getView().byId("ApprovalProcess");
                this.oWizard._getProgressNavigator().ontap = function(){};

                //mm header data get
                this._getMMHdrData();

                //생산 계획 승인 UTC로 설정하기 위해 모델 set
                this.getView().setModel(new JSONModel({Orpddt : null}), "view");
            },
            //리스트 클릭
            onListClick :function(oEvent){
                //초기 화면에서 디테일 화면으로 전환
                this.getView().byId("SplitContDemo").to(this.createId("dynamicPage"));

                //pp header list 전체 취득
                var oModel = this.getView().getModel("mmHdrlist");
                //pp header list 중 선택한 row path
                var sPath = oEvent.getSource().getBindingContextPath();
                //pp header list 중 선택한 row의 정보
                var selectedRow = oModel.getProperty(sPath);
                //선택한 pp header row를 json 모델에 set (다른 펑션에서도 사용하기 위해)
                this.getView().setModel(new JSONModel(selectedRow),"selectedHdr");
                //아이콘 status 취득
                var sStatflag = selectedRow.Statflag

                //상태 아이콘 제어
                this._setIconStatus(sStatflag);
                //아이템 데이터 get
                this._getMMitemData();
            },
            //아이콘 status 설정
            _setIconStatus: function(sStatflag){
                var approvalProcess = this.getView().byId("ApprovalProcess");

                var sValue = ''

                if(sStatflag == "11"){
                    sValue = '1'
                }else if(sStatflag == "12"){
                    sValue = '2'
                }else if(sStatflag == "16"){
                    sValue = '3'
                }
            

                this.byId('ApprovalProcess').setCurrentStep(this.byId('ContentsStep'+ sValue).getId());
                
            },
            //승인 버튼 클릭
            onAccept:function(){
                if (!this.oAcceptDialog) {
                    this.oAcceptDialog = new Dialog({
                        type: DialogType.Message,
                        title: "구매 오더 승인",
                        content: [
                            new Text({ text: "구매 오더 승인을 진행 하시겠습니까? " }),
                                        
                        ],
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "전송",
                            press: function () {
                                // 업데이트 할 status를 넘김.
                                this._onUpdate("12")
                                this.oAcceptDialog.close();
                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: "취소",
                            press: function () {
                                this.oAcceptDialog.close();
                            }.bind(this)
                        })
                    });
                }
                this.oAcceptDialog.open();

            },
            //반려 버튼 클릭
            onReject:function(){
                var sPurcornb = this.getView().getModel('selectedHdr').getData().Purcornb;
                console.log(sPurcornb)
                if (!this.oSubmitDialog) {
                    this.oSubmitDialog = new Dialog({
                        type: DialogType.Message,
                        title: "반려사유",
                        content: [
                            new HorizontalLayout({
                                content: [
                                    new VerticalLayout({
                                        width: "120px",
                                        content: [
                                            new Text({ text: "계획번호: " }),
                                        ]
                                    }),
                                    new VerticalLayout({
                                        content: [
                                            new Text("sPurcornb", { text: sPurcornb }),
                                        ]
                                    })
                                ]
                            }),
                            new TextArea("submissionNote", {
                                width: "100%",
                                placeholder: "반려사유는 필수입니다.",
                                liveChange: function (oEvent) {
                                    //반려 텍스트 취득
                                    var sText = oEvent.getParameter("value");
                                    //반려텍스트를 입력하지 않으면 버튼 클릭 불가능
                                    this.oSubmitDialog.getBeginButton().setEnabled(sText.length > 0);
                                }.bind(this)
                            })
                        ],
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "전송",
                            enabled: false,
                            press: function () {
                                // 입력한 텍스트 get 
                                var sText = Core.byId("submissionNote").getValue();
                                // 업데이트 할 status와 텍스트를 넘김.
                                this._onUpdate('16', sText);
                                this.oSubmitDialog.close();
                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: "취소",
                            press: function () {
                                Core.byId("submissionNote").setValue("");
                                this.oSubmitDialog.close();
                            }.bind(this)
                        })
                    });
                }else{
                    //한번 다이어로그 취득 이후, sPurcornb 다시 세팅.
                    Core.byId("sPurcornb").setText(sPurcornb);
                    Core.byId("submissionNote").setValue("");
                }
                 
                this.oSubmitDialog.open();
            },
            onSyncPress:function(){
                //master page setbusy
                this.getView().byId('master').setBusy(true);
                // this.getView().byId("application-b02ppcommonppapproval01-display-component---Main--master").setBusy(true)
                
                //생산 계획 헤더 데이터 get
                this._getMMHdrData();

               
            },
            onSearch: function(){
                // 승인 요청일
                var dp1Format = this.getView().getModel("view").getProperty("/Orpddt");
                debugger;
                // // 계획년월 low
                // var dp2 = this.getView().byId("DP2").getValue();
                // var dp2Format = new Date(dp2);
                // var dp2Year = dp2Format.getFullYear().toString();
                // var dp2Month = (dp2Format.getMonth() + 1).toString();
                // var sMmlow = dp2Year + dp2Month;


                // // 계획년월 high
                // var dp3 = this.getView().byId("DP3").getValue();
                // var dp3Format = new Date(dp3);
                // var dp3Year = dp3Format.getFullYear().toString();
                // var dp3Month = (dp3Format.getMonth() + 1).toString();
                // var sMmhigh =  dp3Year + dp3Month;
                
                this._getMMHdrData(dp1Format);

            },
             _getMMHdrData:function(dp1Format){
                //버튼 클릭시 날짜가 찍혀용.
                // dp1과 같은 값이 들어가는 것 확인.
                
                var afilters = [];

                var oPlym;
                //승인 요청일
                var dp1 = this.getView().byId("DP1").getValue();
                // //계획년월 low
                // var dp2 = this.getView().byId("DP2").getValue();
                // //계획년월 high
                // var dp3 = this.getView().byId("DP3").getValue();
               
                // 승인 요청, 승인 완료, 반려인 데이터만 출력.
                var oStatus = new Filter([
                    new sap.ui.model.Filter("Statflag", FilterOperator.EQ, "11"),
                    new sap.ui.model.Filter("Statflag", FilterOperator.EQ, "12"),
                    new sap.ui.model.Filter("Statflag", FilterOperator.EQ, "16")
                    // new sap.ui.model.Filter("Delflag",  FilterOperator.NE, "X")
               ], false);

                afilters.push(oStatus);

                //초기 로드 시 filter 없이 출력
                if(dp1Format != undefined){

                    if(dp1.length > 0 ){ //승인 요청일 입력한 경우
                        var oOrpddt = new Filter("Orpddt", FilterOperator.EQ, dp1Format);
                        afilters.push(oOrpddt);
                       

                    }
                    // else if(dp2.length > 0 && dp3.length > 0 ){ //계획년월 low - high 둘다 입력한 경우 
                    //     oPlym = new Filter("Plym", FilterOperator.BT, sMmlow, sMmhigh);
                    //     afilters.push(oPlym);

                    // }else if(dp2.length > 0 && dp3.length == 0){ //계획년월 low만 입력한 경우 
                    //     oPlym = new Filter("Plym", FilterOperator.GE, sMmlow);
                    //     afilters.push(oPlym);

                    // }else if(dp2.length == 0 && dp3.length > 0){ //계획년월 high만 입력한 경우 
                    //     oPlym = new Filter("Plym", FilterOperator.LE, sMmhigh);
                    //     afilters.push(oPlym);
                    // }
                
                }
                //mainService 취득
                const oComponent = this.getOwnerComponent(),
                      oDataModel = oComponent.getModel(); 
                
                var _this = this;
                // var aFilters2 = new sap.ui.model.Filter({filters:afilters});
                //생산 계획 헤더 데이터 get
                oDataModel.read("/MmorderhdrSet",{
                    filters: afilters,
                    success:function(oData,response){
                        // ABAP에서 gateway로 넘어오며 더해진 9시간을 삭제
                        for(var i=0; i<oData.results.length; i++){
                            if(oData.results[i].Orpddt){
                                oData.results[i].Orpddt = new Date(oData.results[i].Orpddt - 9*60*60*1000);
                            }
                        } 
                        _this.getView().setModel(new JSONModel(oData), "mmHdrlist");
                        console.log(oData)
                        // _this.byId("master").setBusy(false);
                        
                    },
                    error: function (oError) {
                        console.log(oError)
                    }
                });
            },
            //업데이트 
            _onUpdate: function(Status, sText) {
                var _this = this;
                
                // 승인, 반려 구분 지어서 사용. 
                var sRejectRn, sMsg;
                
                if(Status == '12'){// 승인일 경우 
                    sRejectRn = '';
                    sMsg = '승인이';
                }else if(Status == '16'){ // 반려일 경우 
                    sRejectRn = sText;
                    sMsg = '반려가'
                }
                
                //pp header 데이터 취득
                var oUpdateModel = this.getView().getModel('selectedHdr').getData();
                
                var sPath = "/MmorderhdrSet(Cmpnc='" + oUpdateModel.Cmpnc + 
                                            "',Plant='"+ oUpdateModel.Plant +
                                            "',Purcornb='" + oUpdateModel.Purcornb +"')" ;                                                                                                                                                                                                                                                                                                                                                                                                                                                                           

                var timeOrpddt  = oUpdateModel.Orpddt.getTime()  +  9*60*60*1000;
                var timeOrmfdt  = oUpdateModel.Ormfdt.getTime()  +  9*60*60*1000;
                // var timeInstrdd = oUpdateModel.Instrdd.getTime() +  9*60*60*1000;
                var timeInstrdt = oUpdateModel.Instrdt.getTime() +  9*60*60*1000;
                

                var oData = {                                                                                                       
                    Cmpnc    : oUpdateModel.Cmpnc,
                    Plant    : oUpdateModel.Plant,                                                                                                                                                                                                                                                              
                    Purcornb : oUpdateModel.Purcornb,
                    Vendorc  : oUpdateModel.Vendorc,
                    Purcym   : oUpdateModel.Purcym,
                    Orpddt   : "/Date(" + timeOrpddt +")/",
                    Ormfdt   : "/Date(" + timeOrmfdt +")/",
                    Purctp   : oUpdateModel.Purctp,
                    Currency : 'KRW',
                    Retnr    : sRejectRn,
                    Resprid  : oUpdateModel.Resprid,
                    Modfid   : oUpdateModel.Modfid,
                    Instrdd  : oUpdateModel.Instrdd,
                    Instrdt  : "/Date(" + timeInstrdt +")/",
                    Statflag : Status,                            
                    Delflag  : oUpdateModel.Delflag
                 
                  }
                  
                //  var oModel = this.getView().getModel();
                // const oComponent = this.getOwnerComponent(),
                //       oDataModel = oComponent.getModel(); 
                 
                //       oDataModel.update(sPath, oData, {
                //     success : function(){
                //     MessageToast.show("구매오더 " + sMsg + " 완료되었습니다.");
                  
                //     _this._setIconStatus(Status);
                //     }
                //  })
                 
                    
                                 
                // * 중요! manifest mainService setting usebatch를 true로 설정할 것.
                // true로 설정할 경우, 아래의 update를 사용할 수 있음.

                // PUT update 
                // oDataModel.update(sPath, oData, { success : function(){                                                                                                                                                                                                                                                                               
                //     MessageToast.show("생산 계획 " + sMsg + " 완료되었습니다.");
                // }})

                //update 처리 아래의 처리는 사용하지 않는 것을 추천. 
                $.ajax({
                    url: '/sap/opu/odata/sap/ZGWB02FOODMM_SRV_02'+sPath,
                    type: 'PUT',
                    dataType: "json",
                    data: JSON.stringify(oData),
                    // data: JSON.stringify(oData),
                    contentType:"application/json",
                    processData: false,
                    success: function(data){
                        console.log(data)
                        MessageToast.show("구매오더 " + sMsg + " 완료되었습니다.");
                        _this._setIconStatus(Status);
                        _this._getMMHdrData();
                    }, 
                    error: function(e){
                        console.log(e);
                    }
                });
            },
            _getMMitemData:function(){
                var _this = this;
                
                const oComponent = this.getOwnerComponent(),
                      oDataModel = oComponent.getModel(); 

                var selectedRow =  this.getView().getModel("selectedHdr");
                
                //생산 계획 번호 취득
                var sPurcornb = selectedRow.getData().Purcornb;
                
                //헤더 데이터에 연결된 아이템 filter
                var itemsFilter = new Filter("Purcornb", FilterOperator.EQ, sPurcornb);

                //생산 계획 아이템 데이터 get
                oDataModel.read("/MmorderitemSet",{
                    filters: [itemsFilter],
                    success:function(oData,response){
                        //items model set
                        _this.getView().setModel(new JSONModel(oData), "mmItemsList");
                    },
                    error: function (oError) {
                        console.log(oError)
                        
                    }
                });
            },
            //refresh 때 busy를 켜주기 위해서 delay
            _setDelayTime: function() {
                setTimeout(function(){
                    // _this.getView().byId("application-b02mmapprovalmmapproval01-display-component---Main--master").setBusy(false)
                    this.getView().byId('master').setBusy(false);
                }.bind(this), 1000);
            },

            onAfterDetailNavigate: function(oEvent) {
                
            }
        });
    });