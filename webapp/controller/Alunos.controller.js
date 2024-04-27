sap.ui.define([
    "zfioriappec/controller/App.controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox) {
        "use strict";

        return Controller.extend("zfioriappec.controller.Alunos", {
            onInit: function () {
                this.getRouter().getRoute("RouteAlunos").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function (oEvent) {
                let ModeloAuxiliar = new JSONModel()
                let objeto = {
                    editable: false,
                    visibleEdit: true,
                    visibleSave: false
                }
                ModeloAuxiliar.setData(objeto)
                this.getView().setModel(ModeloAuxiliar, "Auxiliar")

                let Idcurso = oEvent.getParameter("arguments").Idcurso;

                this.getModel().refresh()
                this.getModel().metadataLoaded().then(function () {
                    var sObjectPath = this.getModel().createKey("CursosSet", {
                        Idcurso: Idcurso
                    });
                    this._bindView("/" + sObjectPath);
                }.bind(this));

                this._bindSmartTable(Idcurso);

            },

            _bindView: function (sObjectPath) {
                // Set busy indicator during view binding
                var oViewModel = this.getView().getModel();
                var that = this;
                // If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
                oViewModel.setProperty("/busy", false);
                this.getView().bindElement({
                    path: sObjectPath,
                    events: {
                        change: this._onBindingChange.bind(this),
                        dataRequested: function () {
                            oViewModel.setProperty("/busy", true);
                        },
                        dataReceived: function () {
                            oViewModel.setProperty("/busy", false);
                        }
                    }
                });
            },

            _bindSmartTable: function(Idcurso) {
                var oSmartTable = this.getView().byId("SmartTable");
                var oTable = oSmartTable.getTable();
                var oBinding = oTable.getBinding("items");
              
                var oFilter = new sap.ui.model.Filter("Idcurso", sap.ui.model.FilterOperator.EQ, Idcurso);
              
                oBinding.filter([oFilter]);
            },

            _onBindingChange: function () {
                var oView = this.getView(),
                    oElementBinding = oView.getElementBinding();

                if (!oElementBinding.getBoundContext()) {

                    return;
                }

            },

            onEdita: function () {
                let oModel = this.getView().getModel("Auxiliar")
                let oData = oModel.getData()

                oData.editable = true
                oData.visibleEdit = false,
                    oData.visibleSave = true
                oModel.refresh()
            },

            onCancela: function () {
                let oModel = this.getView().getModel()
                oModel.refresh()

                let that = this
                sap.m.MessageBox.alert("Confirma o cancelamento da edição?", {
                    actions: ["Sim", "Não"],
                    onClose: function (sAction) {
                        let oModelAuxiliar = that.getView().getModel("Auxiliar")
                        let oData = oModelAuxiliar.getData()

                        oData.editable = false
                        oData.visibleEdit = true
                        oData.visibleSave = false
                        oModelAuxiliar.refresh()
                    }
                })

            },

            onSalva: function () {
                let idNome = this.getView().byId("idNome").getValue()
                let Email = this.getView().byId("Email").getValue()
                let ProjetoSegw = this.getView().byId("ProjetoSegw").getValue()
                let idCep = this.getView().byId("idCep").getValue()
                let idEndereco = this.getView().byId("idEndereco").getValue()
                let idBairro = this.getView().byId("idBairro").getValue()
                let that = this
                let chave = this.getView().byId("Usuario").getValue()

                let objeto = {
                    Nome: idNome,
                    ProjetoSegw: ProjetoSegw,
                    Email: Email,
                    Cep: idCep,
                    Endereco: idEndereco,
                    Bairro: idBairro
                }

                this.getView().getModel().update("/AlunosSet('" + chave + "')", objeto, {
                    success: function (oData, oReponse) {
                        sap.m.MessageBox.success("Usuario atualizado com sucesso!!!", {
                            actions: ["Ok"],
                            onClose: function (sAction) {
                                that.onCancela()
                                that.getRouter().navTo("RouteView1")
                            }
                        })

                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Erro ao atualizar o aluno !!!");
                    }
                });
            }
        });
    });
