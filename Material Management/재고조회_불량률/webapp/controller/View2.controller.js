sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel,UIComponent,MessageToast) {
        "use strict";

        var PageController = Controller.extend("b02.mm.inquiry.mminquiry.controller.View2", {
            onInit: function () {


                var oData = {
                    Graph  : []
                
                
                }             
              
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel , "view");   
                           
               },

               init: function () {

                // call the base component's init function

                UIComponent.prototype.init.apply(this, arguments); },

            onBeforeRendering: function(){
                this._getData();
            },

            // oDataModel의 데이터를 onInit에서 추가한 view(JSON Model)로 변환 //
            // 오데이터 없는 오데이터팀.
            _getData: function(){
                var oDataModel = this.getView().getModel();
                var oViewModel = this.getView().getModel("view");

                oDataModel.read("/MmgraphSet", {  
                    success: function (oData) { 
                        oData.results.forEach(function(e){ e.Instq   = parseInt(e.Instq) })
                        oData.results.forEach(function(e){ e.Falutyq = parseInt(e.Falutyq) })

                        
                        for(var i = 0 ; i < oData.results.length ; i++)[
                           oData.results[i].Perc = Math.round(oData.results[i].Instq /  oData.results[i].Falutyq)
                           
                         ];      
                         for(var i = 0 ; i < oData.results.length ; i++)[
                            oData.results[i].Perc2 = 100-oData.results[i].Perc
                            
                          ];                               
                                          
                        var oMaterialData = oData.results;
                        oViewModel.setProperty("/Graph", oMaterialData);
                    },
                    error: function (oError) {
                    }})
            },      
            
            
            getRouter:function(){

                return UIComponent.getRouterFor(this) 
            },

            onSelectionChanged: function (oEvent) {
                // var oSegment = oEvent.getParameter("segment");
                var oViewModel = this.getView().getModel("view");  // 모델불러오기
                var iIndex = oEvent.oSource.oParent.sId.slice(-1)  // 오이벤트가 발생한 인덱스 값을 찾음 
                var oChartData = oViewModel.getProperty('/Graph'); // 제이슨 모델을 불러옴
                
                MessageToast.show(" 입고수량 : " + oChartData[iIndex].Instq + '\n' + " 불량수량 : " + oChartData[iIndex].Falutyq);
                debugger;
                           }     
        
                
        });
       
        return PageController;
    });