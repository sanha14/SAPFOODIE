sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    'require',
    "sap/ui/core/UIComponent" 

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Filter, FilterOperator,require,UIComponent) {
        "use strict";

        var PageController = Controller.extend("b02.mm.inquiry.mminquiry.controller.View1", {
            onInit: function () {


                var oData = {
                    searchValue1  : null,
                    searchValue2  : null,
                    btnEnabled    : true,
                    MaterialData  : []
                   
                    //오데이터는 결국 여기에 제이슨모델로 들어가있음ㅎㅎ.
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

                oDataModel.read("/MmItemSet", {  
                    success: function (oData) { 
                        oData.results.forEach(function(e){ e.Stckq = parseFloat(e.Stckq) })
                        oData.results.forEach(function(e){ e.Saveq = parseFloat(e.Saveq) })
                        oData.results.forEach(function(e){ e.Minvalue = parseFloat(e.Minvalue) })
                        oData.results.forEach(function(e){ e.Maxvlaue = parseFloat(e.Maxvlaue) })
                        
                        var oMaterialData = oData.results;

                    


                        // for(var i; i<oMaterialData.length; i++){
                        //     oMaterialData[i].Stckq = (oMaterialData[i].Stckq);
                        //     oMaterialData[i].Saveq = parseFloat(oMaterialData[i].Saveq);
                            
                        // console.log(typeof parseFloat(oMaterialData[i].Saveq))
                        // }

                        oViewModel.setProperty("/MaterialData", oMaterialData);
                      
                    },
                    error: function (oError) {
                    }})
            },
            
            getRouter:function(){

                return UIComponent.getRouterFor(this) 
            },


            onPress : function(){
                this.getRouter().navTo("View2") 
                  
            },

            
            onPress2 : function() {
                sap.m.MessageBox.success("발주요청이 완료되었습니다.");
                
            },

            onSearch:function(){
                var oViewModel = this.getView().getModel("view");
                var sSearchText = oViewModel.getProperty("/searchValue1");
               
                var oTable = this.getView().byId("mainTable"); 
                var oBinding = oTable.getBinding("rows"); 

                var aFilter = [];

                var oFilter1 = new Filter ({
                    path : 'Vendorc', 
                    operator: FilterOperator.Contains,
                    value1: sSearchText,
                    caseSensitive : false
                });
           
                aFilter.push(oFilter1)

                oBinding.filter(aFilter); 
            
                return oFilter1

                },

                onSearch2:function(){
                    var oViewModel = this.getView().getModel("view");
                    var sSearchText2 = oViewModel.getProperty("/searchValue2");
                   
                    var oTable = this.getView().byId("mainTable"); 
                    var oBinding = oTable.getBinding("rows"); 
    
                    var aFilter = [];
    
                    var oFilter2 = new Filter ({
                        path : 'Matrnm', 
                        operator: FilterOperator.Contains,
                        value1: sSearchText2,
                        caseSensitive : false
                    });
               
                    aFilter.push(oFilter2)
    
                    oBinding.filter(aFilter); 
                
                    return oFilter2

                    },



                onTotalSearch:function(){
                    // var oViewModel = this.getView().getModel("view");
                    var oTable= this.getView().byId('mainTable');
                    var oBinding = oTable.getBinding("rows")
                    
                    var aFilter = [];
                    
                    var Filter1 = this.onSearch();
                    var Filter2 = this.onSearch2();

                    if(Filter1.length !==0){
                        aFilter.push(Filter2);
                    }

                    if(Filter2.length !==0){
                        aFilter.push(Filter1)
                    }

                    oBinding.filter(aFilter);
                    debugger;
                }      
                
        });
       
        return PageController;
    });