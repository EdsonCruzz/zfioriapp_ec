sap.ui.define([
    "zfioriappec/controller/App.controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/library",
    "sap/m/MessagePopover",
    'sap/ui/table/Column',
    'sap/ui/model/FilterOperator',
    "sap/ui/model/Filter",
    "sap/m/MessageItem"   
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox, MLibrary, MessagePopover, UIColumn, FilterOperator, Filter, MessageItem) {
        "use strict";

        var oMessagePopover;

        return Controller.extend("zfioriappec.controller.Alunos", {
            onInit: function () {
                this.criaModeloAuxiliar()

                this.getRouter().getRoute("RouteAlunos").attachPatternMatched(this._onObjectMatched, this);

                var oSmartTable = this.getView().byId("SmartTable");
            
                oSmartTable.attachBeforeRebindTable(this.onBeforeRebindTable, this);
            },

            criaModeloAuxiliar: function () {
                let oModel = new JSONModel()
                let objeto = {
                    Mensagens: [],
                    Editable: false
                }

                oModel.setData(objeto)
                this.getView().setModel(oModel, "AuxiliarAluno")

                this.AlimentaModeloMenssagens()
            },

            AlimentaModeloMenssagens: function () {
                let oMessageTemplate = new MessageItem({
                    type: '{AuxiliarAluno>type}',
                    title: '{AuxiliarAluno>title}',
                    activeTitle: "{AuxiliarAluno>active}",
                    description: '{AuxiliarAluno>description}',
                    subtitle: '{AuxiliarAluno>subtitle}',
                    counter: '{AuxiliarAluno>counter}'
                });

                oMessagePopover = new MessagePopover({
                    items: {
                        path: 'AuxiliarAluno>/Mensagens',
                        template: oMessageTemplate
                    },
                    activeTitlePress: function () {

                    }
                });

                var messagePopoverBtn = this.byId("messagePopoverBtn");

                if (messagePopoverBtn) {
                    this.byId("messagePopoverBtn").addDependent(oMessagePopover);
                }
            },

            _onObjectMatched: function (oEvent) {
                let ModeloAuxiliar = new JSONModel()
                let objeto = {
                    editable: false,
                    visibleEdit: true,
                    visibleSave: false
                }
                ModeloAuxiliar.setData(objeto)
                this.getView().setModel(ModeloAuxiliar, "AuxiliarAluno")

                let Idcurso = oEvent.getParameter("arguments").Idcurso;

                this.getModel().refresh()
                this.getModel().metadataLoaded().then(function () {
                    var sObjectPath = this.getModel().createKey("CursosSet", {
                        Idcurso: Idcurso
                    });
                    this._bindView("/" + sObjectPath);
                }.bind(this));

                this._Idcurso = Idcurso;

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

            onBeforeRebindTable: function(oEvent) {
                var oBindingParams = oEvent.getParameter("bindingParams");
                var oViewModel = this.getView().getModel();

                var oFilter = new sap.ui.model.Filter("Idcurso", sap.ui.model.FilterOperator.EQ, this._Idcurso);
            
                oViewModel.read("/AlunosSet", {
                    filters: [oFilter],
                    success: function(oData) {
                        oBindingParams.filters = [oFilter];
                    },
                    error: function(oError) {
                        console.error("Erro ao executar a busca:", oError);
                    }
                });

                // var Idcurso = this._Idcurso;
                // var oViewModel = this.getView().getModel();
                // var oSmartTable = this.getView().byId("SmartTable");
                // // var oTable = oSmartTable.getTable();
                // // var oBinding = oTable.getBinding("items");
              
                // var oFilter = new sap.ui.model.Filter("Idcurso", sap.ui.model.FilterOperator.EQ, Idcurso);
              
                // // oBinding.filter([oFilter]);

                // oViewModel.read("/AlunosSet", {
                //     filters: [oFilter],
                //     success: function(oData) {
                //         var oTable = oSmartTable.getTable();
                //         var oBinding = oTable.getBinding("items");
                //         oBinding.setModel(oViewModel);
                //         oBinding.bindRows("/AlunosSet");
                //     },
                //     error: function(oError) {
                //         // Em caso de erro, exiba uma mensagem de erro ou tome alguma outra ação apropriada
                //         console.error("Erro ao executar a busca:", oError);
                //     }
                // });
            },

            _onBindingChange: function () {
                var oView = this.getView(),
                    oElementBinding = oView.getElementBinding();

                if (!oElementBinding.getBoundContext()) {

                    return;
                }

            },

            // onEdita: function () {
            //     let oModel = this.getView().getModel("AuxiliarAluno")
            //     let oData = oModel.getData()

            //     oData.editable = true
            //     oData.visibleEdit = false,
            //         oData.visibleSave = true
            //     oModel.refresh()
            // },

            // onCancela: function () {
            //     let oModel = this.getView().getModel()
            //     oModel.refresh()

            //     let that = this
            //     sap.m.MessageBox.alert("Confirma o cancelamento da edição?", {
            //         actions: ["Sim", "Não"],
            //         onClose: function (sAction) {
            //             let oModelAuxiliar = that.getView().getModel("AuxiliarAluno")
            //             let oData = oModelAuxiliar.getData()

            //             oData.editable = false
            //             oData.visibleEdit = true
            //             oData.visibleSave = false
            //             oModelAuxiliar.refresh()
            //         }
            //     })

            // },

            // onSalva: function () {
            //     let idNome = this.getView().byId("idNome").getValue()
            //     let Email = this.getView().byId("Email").getValue()
            //     let ProjetoSegw = this.getView().byId("ProjetoSegw").getValue()
            //     let idCep = this.getView().byId("idCep").getValue()
            //     let idEndereco = this.getView().byId("idEndereco").getValue()
            //     let idBairro = this.getView().byId("idBairro").getValue()
            //     let that = this
            //     let chave = this.getView().byId("Usuario").getValue()

            //     let objeto = {
            //         Nome: idNome,
            //         ProjetoSegw: ProjetoSegw,
            //         Email: Email,
            //         Cep: idCep,
            //         Endereco: idEndereco,
            //         Bairro: idBairro
            //     }

            //     this.getView().getModel().update("/AlunosSet('" + chave + "')", objeto, {
            //         success: function (oData, oReponse) {
            //             sap.m.MessageBox.success("Usuario atualizado com sucesso!!!", {
            //                 actions: ["Ok"],
            //                 onClose: function (sAction) {
            //                     that.onCancela()
            //                     that.getRouter().navTo("RouteView1")
            //                 }
            //             })

            //         },
            //         error: function (oError) {
            //             sap.m.MessageBox.error("Erro ao atualizar o aluno !!!");
            //         }
            //     });
            // },

            onAdiciona: function () {
                if (!this.adicionar) {
                    this.adicionar = sap.ui.xmlfragment("zfioriappec.view.fragmentos.AdicionarAluno", this);
                    this.getView().addDependent(this.adicionar);
                }
                // open value help dialog filtered by the input value
                this.adicionar.open();
            },

            CancelarAdicionar: function () {
                this.adicionar.close();
            },

            GravaAdicionar: function () {
                let that = this
                let oModel = this.getView().getModel()
                let oModelAuxiliar = this.getView().getModel("AuxiliarAluno")
                let Idcurso = this._Idcurso;
                let Alunoid = this.adicionar.mAggregations.content[0].getValue()
                let Nomealuno = this.adicionar.mAggregations.content[1].getValue()
                let Ativo = this.adicionar.mAggregations.content[3].getSelected()

                // var oDados = {
                //     "Alunoid": Alunoid
                // }

                // this.getView().getModel().callFunction('/GetCursoExist', {                    
                //     method: "GET",
                //     urlParameters: oDados,
                //     success: function (oData, oReponse) {
                //         if (oData.OK === '') {
                            sap.m.MessageBox.alert("Confirma a inclusão?", {
                                actions: ["Sim", "Não"],
                                onClose: function (sAction) {
                                    if (sAction == "Sim") {
                                        let objeto = {
                                            Idcurso: parseInt(Idcurso),
                                            Alunoid: parseInt(Alunoid),
                                            Nomealuno: Nomealuno,
                                            Ativo: Ativo
                                        }
                                        oModel.create('/AlunosSet', objeto, {
                                            success: function (oData, oResponse) {
                                                let arrayMsg = {
                                                    type: "Success",
                                                    title: "Aluno incluido com sucesso !!!",
                                                    activeTitle: true,
                                                    description: "O aluno " + Alunoid + " foi incluido com sucesso!!!",
                                                }
                                                oModelAuxiliar.oData.Mensagens.push(arrayMsg);
                                                oModelAuxiliar.refresh(true);

                                                that.byId("messagePopoverBtn").setType("Accept");
                                                oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                                that.CancelarAdicionar()
                                            },
                                            error: function (oError) {
                                                let arrayMsg = {
                                                    type: "Error",
                                                    title: "Erro ao incluir aluno !!!",
                                                    activeTitle: true,
                                                    description: "Erro ao incluir aluno " + Alunoid + " !!!",
                                                }
                                                oModelAuxiliar.oData.Mensagens.push(arrayMsg);
                                                oModelAuxiliar.refresh(true);

                                                that.byId("messagePopoverBtn").setType("Accept");
                                                oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                            }
                                        });
                                    }
                                }
                            })
                //         } else {
                //             sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("msgErroCursoExist"));

                //         }

                //     },
                //     error: function (oError) {
                //         sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("lblMsgCreateError"));
                //     }
                // });

            },

            handleMessagePopoverPress: function () {
                oMessagePopover.openBy(this.getView().byId("messagePopoverBtn"));
            },

            onDeleta: function () {
                let that = this
                let oModel = this.getView().getModel()
                let oModelAuxiliar = this.getView().getModel("AuxiliarAluno")
                let Table = this.getView().byId("idTable")
                let selecionados = Table.getSelectedContextPaths()
                if (selecionados.length > 0) {
                    sap.m.MessageBox.alert("Confirma a exclusão dos alunos selecionados?"  , {
                        actions: ["Sim", "Não"],
                        onClose: function (sAction) {
                            if (sAction == "Sim") {
                                let Indice
                                for (let i = 0; i < selecionados.length; i++) {
                                    Indice = selecionados[i]
                                    oModel.remove(Indice, {
                                        success: function () {
                                            let arrayMsg = {
                                                type: "Success",
                                                title: "Aluno excluido com sucesso",
                                                activeTitle: true,
                                                description: "O aluno com indice " + Indice + " foi excluido com sucesso!!!",
                                            }
                                            oModelAuxiliar.oData.Menssagens.push(arrayMsg);
                                            oModelAuxiliar.refresh(true);

                                            that.byId("messagePopoverBtn").setType("Accept");
                                            oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                        },
                                        error: function (oError) {
                                            let arrayMsg = {
                                                type: "Error",
                                                title: "Erro ao excluir o aluno",
                                                activeTitle: true,
                                                description: "Erro ao excluir o aluno com indice " + Indice + " !!!",
                                            }
                                            oModelAuxiliar.oData.Menssagens.push(arrayMsg);
                                            oModelAuxiliar.refresh(true);

                                            that.byId("messagePopoverBtn").setType("Accept");
                                            oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                        }
                                    })
                                }
                            }
                        }
                    })
                } else {
                    sap.m.MessageBox.error("Selecione um aluno para exclusão!!!")
                }
            },
        });
    });
