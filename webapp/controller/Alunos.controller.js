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

                let oTable = this.getView().byId("SmartTable");
                // oTable.rebindTable();

                if (oTable.isInitialised()) {
                    oTable.rebindSmartTable();
                } else {
                    oTable.attachEventOnce("afterInit", function() {
                        oTable.rebindSmartTable();
                    }, this);
                }

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

            onBeforeRebindTable: function (oEvent) {
                var oBinding = oEvent.getParameter("bindingParams");
                var Idcurso = parseInt(this._Idcurso);
                var oFilter = new sap.ui.model.Filter("Idcurso", sap.ui.model.FilterOperator.EQ, Idcurso);
                oBinding.filters.push(oFilter);
            },

            _onBindingChange: function () {
                var oView = this.getView(),
                    oElementBinding = oView.getElementBinding();

                if (!oElementBinding.getBoundContext()) {

                    return;
                }

            },

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

                var oDados = {
                    "Idcurso": this._Idcurso,
                    "Alunoid": Alunoid
                }

                this.getView().getModel().callFunction('/GetAlunoExist', {
                    method: "GET",
                    urlParameters: oDados,
                    success: function (oData, oReponse) {
                        if (oData.OK === '') {
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
                                                if (!oModelAuxiliar.oData.Mensagens) {
                                                    oModelAuxiliar.oData.Mensagens = [];
                                                }

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
                        } else {
                            sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("msgErroAlunoExist"));

                        }

                    },
                    error: function (oError) {
                        sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("lblMsgCreateError"));
                    }
                });

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
                    sap.m.MessageBox.alert("Confirma a exclusão dos alunos selecionados?", {
                        actions: ["Sim", "Não"],
                        onClose: function (sAction) {
                            if (sAction == "Sim") {
                                let Indice
                                for (let i = 0; i < selecionados.length; i++) {
                                    Indice = selecionados[i]
                                    oModel.remove(Indice, {
                                        success: function () {
                                            if (!oModelAuxiliar.oData.Mensagens) {
                                                oModelAuxiliar.oData.Mensagens = [];
                                            }

                                            let arrayMsg = {
                                                type: "Success",
                                                title: "Aluno excluido com sucesso",
                                                activeTitle: true,
                                                description: "O aluno com indice " + Indice + " foi excluido com sucesso!!!",
                                            }
                                            oModelAuxiliar.oData.Mensagens.push(arrayMsg);
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
                                            oModelAuxiliar.oData.Mensagens.push(arrayMsg);
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

            onChangeArquivo: function (oEvent) {
                let file = oEvent.mParameters.files[0];
                let tipoArquivo = oEvent.mParameters.files[0].type;
                let oModel = this.getView().getModel()
                let oModelAuxiliar = this.getView().getModel("AuxiliarAluno")
                let that = this

                if (tipoArquivo !== "text/csv") {
                    MessageBox.error("Somente arquivo CSV.");
                    return;
                }

                var reader = new FileReader();
                reader.readAsText(file);

                reader.onload = function () {
                    let texto = reader.result;
                    let linhas = texto.split("\r\n");
                    let lengthLinhas = linhas.length;

                    let Cabecalho = linhas[0].split(";");

                    if (Cabecalho[0] !== "ID do Aluno") {
                        sap.m.MessageBox.error(
                            "A primeira coluna do CSV, deverá ser 'ID do Aluno'."
                        );
                        return;
                    }

                    if (Cabecalho[1] !== "Nome do Aluno") {
                        sap.m.MessageBox.error(
                            "A segunda coluna do CSV, deverá ser 'Nome do Aluno'."
                        );
                        return;
                    }

                    if (Cabecalho[2] !== "Ativo") {
                        sap.m.MessageBox.error(
                            "A terceira coluna do CSV, deverá ser 'Ativo'."
                        );
                        return;
                    }

                    if (lengthLinhas > 0) {
                        sap.m.MessageBox.alert("Deseja fazer a carga de " + (lengthLinhas - 1) + " alunos?", {
                            actions: ["Sim", "Não"],
                            onClose: function (sAction) {
                                if (sAction == "Sim") {

                                    for (let i = 0; i < lengthLinhas; i++) {
                                        if (i !== 0) {
                                            let split = linhas[i].split(";");

                                            let AlunoAtivo = false;

                                            if (split[2] === 'Yes' || split[2] === 'Sim') {
                                                AlunoAtivo = true;
                                            } else if (split[2] === 'No' || split[2] === 'Não') {
                                                AlunoAtivo = false;
                                            }

                                            let objeto = {
                                                Idcurso: parseInt(that._Idcurso),
                                                Alunoid: parseInt(split[0]),
                                                Nomealuno: split[1],
                                                Ativo: AlunoAtivo
                                            };
                                            if (objeto.Idcurso !== "" && objeto.Alunoid !== "") {
                                                
                                                oModel.create('/AlunosSet', objeto, {
                                                    success: function (oData, oReponse) {
                                                        let arrayMsg = {
                                                            type: "Success",
                                                            title: "Aluno incluido com sucesso !!!",
                                                            activeTitle: true,
                                                            description: "O aluno " + objeto.Nomealuno + " foi incluido com sucesso!!!",
                                                        }
                                                        oModelAuxiliar.oData.Mensagens.push(arrayMsg);
                                                        oModelAuxiliar.refresh(true);
                                                        oModel.refresh(true);

                                                        that.byId("messagePopoverBtn").setType("Accept");
                                                        oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));

                                                        that.CancelarAdicionar()
                                                    },
                                                    error: function (oError) {
                                                        let arrayMsg = {
                                                            type: "Error",
                                                            title: "Erro ao incluir aluno !!!",
                                                            activeTitle: true,
                                                            description: "Erro ao incluir aluno " + objeto.Nomealuno + " !!!",
                                                        }
                                                        oModelAuxiliar.oData.Mensagens.push(arrayMsg);
                                                        oModelAuxiliar.refresh(true);
                                                        oModel.refresh(true);

                                                        that.byId("messagePopoverBtn").setType("Accept");
                                                        oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                                    }
                                                });
                                            }
                                        }
                                    }

                                }
                            }
                        })

                    }
                    oModelAuxiliar.refresh()
                    oModel.refresh()
                };
            }
        });
    });
