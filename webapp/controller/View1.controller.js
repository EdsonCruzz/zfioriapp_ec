sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("zfioriappec.controller.View1", {
            onInit: function () {

            },

            onDeleta: function () {
                let that = this
                let oModel = this.getView().getModel()
                let oModelAuxiliar = this.getView().getModel("Auxiliar")
                let Table = this.getView().byId("idTable")
                let selecionados = Table.getSelectedContextPaths()
                if (selecionados.length > 0) {
                    sap.m.MessageBox.alert("Confirma a exclusão dos cursos selecionados?"  , {
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
                                                title: "Curso excluido com sucesso",
                                                activeTitle: true,
                                                description: "O curso com indice " + Indice + " foi excluido com sucesso!!!",
                                            }
                                            oModelAuxiliar.oData.Menssagens.push(arrayMsg);
                                            oModelAuxiliar.refresh(true);

                                            that.byId("messagePopoverBtn").setType("Accept");
                                            oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                        },
                                        error: function () {
                                            let arrayMsg = {
                                                type: "Error",
                                                title: "Erro ao excluir o curso",
                                                activeTitle: true,
                                                description: "Erro ao excluir o curso com indice " + Indice + " !!!",
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
                    sap.m.MessageBox.error("Selecione um curso para exclusão!!!")
                }
            },

            onAdiciona: function () {
                if (!this.adicionar) {
                    this.adicionar = sap.ui.xmlfragment("zfioriappec.view.fragmentos.Adicionar", this);
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
                let oModelAuxiliar = this.getView().getModel("Auxiliar")
                let Idcurso = this.adicionar.mAggregations.content[0].getValue()
                let Nomecurso = this.adicionar.mAggregations.content[1].getValue()
                let Duracao = this.adicionar.mAggregations.content[2].getValue()

                var oDados = {
                    "Idcurso": Idcurso
                }

                this.getView().getModel().callFunction('/GetCursoExist', {                    
                    method: "GET",
                    urlParameters: oDados,
                    success: function (oData, oReponse) {
                        if (oData.OK === '') {
                            sap.m.MessageBox.alert("Confirma a inclusão?", {
                                actions: ["Sim", "Não"],
                                onClose: function (sAction) {
                                    if (sAction == "Sim") {
                                        let objeto = {
                                            Idcurso: Idcurso,
                                            Nomecurso: Nomecurso,
                                            Duracao: Duracao
                                        }
                                        oModel.create('/CursosSet', objeto, {
                                            success: function (oData, oReponse) {
                                                let arrayMsg = {
                                                    type: "Success",
                                                    title: "Curso incluido com sucesso !!!",
                                                    activeTitle: true,
                                                    description: "O curso " + Idcurso + " foi incluido com sucesso!!!",
                                                }
                                                oModelAuxiliar.oData.Menssagens.push(arrayMsg);
                                                oModelAuxiliar.refresh(true);

                                                that.byId("messagePopoverBtn").setType("Accept");
                                                oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                                that.CancelarAdicionar()
                                            },
                                            error: function (oError) {
                                                let arrayMsg = {
                                                    type: "Error",
                                                    title: "Erro ao incluir curso !!!",
                                                    activeTitle: true,
                                                    description: "Erro ao incluir curso " + Idcurso + " !!!",
                                                }
                                                oModelAuxiliar.oData.Menssagens.push(arrayMsg);
                                                oModelAuxiliar.refresh(true);

                                                that.byId("messagePopoverBtn").setType("Accept");
                                                oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                            }
                                        });
                                    }
                                }
                            })
                        } else {
                            sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("msgErroCursoExist"));
                        }
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("lblMsgCreateError"));
                    }
                });

            },

            handleMessagePopoverPress: function () {
                oMessagePopover.openBy(this.getView().byId("messagePopoverBtn"));
            }

        });
    });
