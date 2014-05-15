hosemann = {
    vars: {
        param: "",
        businessUnit: "ecbu",
        view: "",
        // enabled functionality
        caseTherapist: true,
        queueActivity: true,
        queueMonitor: true,
        userOptions: true,
        // default colors, will be overwritten by server
        applicationBG: "#EDEDED",
        queueBG: "#CCCCCC",
        queueFG: "#000000",
        inactiveCallTypeBG: "#FFFFFF",
        inactiveCallTypeFG: "#000000",
        activeCallTypeBG: "#FFC0CB",
        activeCallTypeFG: "#000000",
        extendedCallTypeBG: "#FF0004",
        extendedCallTypeFG: "#000000",
        //user details:
        BusinessUnit: "",
        CiscoExtension: "",
        BluePumpkinUsername: "",        
        Subscriptions: [],
        UserDetails: {},
        
        Products: [],
        

        /* userOptions-specific */
        requirePassword: false,
        // use random color for fun (to be implemented later)
        previousColor: "#1F6D9B",
        userOptionsSendButtonEvent: new Function(),

    },
    signalR: function () {
        var queueBroadcastProxy = $.connection.queueBroadcastHub;
        var userOptionsProxy = $.connection.userOptionsHub;
        /*   CLIENT FUNCTIONS   */
        // Status Message Response
        queueBroadcastProxy.client.status = function (message) {
            //hosemann.userOptions.systemStatusMessage(message);
        };

        // Functionality Critical Failure
        queueBroadcastProxy.client.functionalityFailure = function (functionality) {
            switch (functionality) {
                case 'caseTherapist':
                    hosemann.vars.caseTherapist = false;
                    break;
                case 'queueActivity':
                    hosemann.vars.queueActivity = false;
                    break;
                case 'queueMonitor':
                    hosemann.vars.queueMonitor = false;
                    break;
                case 'userOptions':
                    hosemann.vars.userOptions = false;
                    break;
                default:
                    break;
            }
        }

        // Pulls all UserOptions
        if (hosemann.vars.userOptions == false)
            return;
        userOptionsProxy.client.getData = function (products, userDetails, subscriptions) {
            hosemann.vars.Products = products;
            hosemann.vars.Subscriptions = subscriptions;
            hosemann.vars.BusinessUnit = userDetails.BusinessUnit;
            hosemann.vars.CiscoExtension = userDetails.CiscoExtension;
            hosemann.vars.BluePumpkinUsername = userDetails.BluePumpkinUsername;
            hosemann.vars.applicationBG = userDetails.ApplicationBG;
            hosemann.vars.queueBG = userDetails.QueueBG;
            hosemann.vars.queueFG = userDetails.QueueFG;
            hosemann.vars.inactiveCallTypeBG = userDetails.InactiveCallTypeBG;
            hosemann.vars.inactiveCallTypeFG = userDetails.InactiveCallTypeFG;
            hosemann.vars.activeCallTypeBG = userDetails.ActiveCallTypeBG;
            hosemann.vars.activeCallTypeFG = userDetails.ActiveCallTypeFG;
            hosemann.vars.extendedCallTypeBG = userDetails.ExtendedCallTypeBG;
            hosemann.vars.extendedCallTypeFG = userDetails.ExtendedCallTypeFG;
            hosemann.vars.UserDetails = userDetails;


            for (var i = 0; i < subscriptions.length; ++i) {
                queueBroadcastProxy.server.joinRoom(subscriptions[i].CallTypeID);
            }
        };

        // Receive broadcast functions
        queueBroadcastProxy.client.updateProductQueue = function (product, callType, quantity, waitTime) {


            if (!$('.bbqContainer>#{0}'.f(product)).length > 0) {
                $('.bbqContainer').append('<div class="bbqProduct" id="{0}"><strong>{0}</strong></div>'.f(product));
            }
            if ($('.bbqContainer>#{0}>#{1}'.f(product, callType)).length > 0) {
                $('.bbqContainer>#{0}>#{1}'.f(product, callType)).html('<strong>{0}</strong>{1}|<strong>{2}</strong>', callType, quantity, waitTime);
            }
            else {
                $('.bbqContainer>#{0}'.f(product)).append('<div class="bbqQueue" id="{0}"><strong>{0}</strong>{1}|<strong>{2}</strong></div>'.f(callType, quantity, waitTime));
            }
        };

        /*   SERVER FUNCTIONS   */

        // Error handling
        $.connection.hub.error(function (error) {
            console.log('SignalR error: ' + error)
        });

        // Start the connection.
        $.connection.hub.start().done(function () {

            userOptionsProxy.server.getData('josephho');


            hosemann.vars.userOptionsSendButtonEvent = function () {
                var userDetails = {};
                var subscriptions = [];
                var clarifyPassword;

                //Initial Settings
                userDetails.ClarifyUsername = hosemann.vars.param;
                userDetails.CiscoExtension = $('input[name=CiscoExtension]').val();
                userDetails.BusinessUnit = $('input[name=BusinessUnit]').val();
                userDetails.BluePumpkinUsername = $('input[name=BluePumpkinUsername]').val();

                //Visuals
                userDetails.ApplicationBG = hosemann.vars.applicationBG;
                userDetails.QueueBG = hosemann.vars.queueBG;
                userDetails.QueueFG = hosemann.vars.queueFG;
                userDetails.InactiveCallTypeBG = hosemann.vars.inactiveCallTypeBG;
                userDetails.InactiveCallTypeFG = hosemann.vars.inactiveCallTypeFG;
                userDetails.ActiveCallTypeBG = hosemann.vars.activeCallTypeBG;
                userDetails.ActiveCallTypeFG = hosemann.vars.activeCallTypeFG;
                userDetails.ExtendedCallTypeBG = hosemann.vars.extendedCallTypeBG;
                userDetails.ExtendedCallTypeFG = hosemann.vars.extendedCallTypeFG;

                // Subscriptions
                $('.product:checked').each(function () {
                    subscriptions.push($(this).attr("id"));
                });

                if (hosemann.vars.requirePassword) {
                    // Password Request Dialog (for validation purposes only)
                    $('#userOptionsSubmitButton').append('<div id="dialog-form" title="Clarify password required."><form><fieldset><label for="clarifyPassword">To save changes to your user options, please enter your Clarify password.</label><input type="password" name="clarifyPassword" id="clarifyPassword" class="text ui-widget-content ui-corner-all" /></fieldset></form></div>');

                    $("#dialog-form").dialog({
                        autoOpen: true,
                        modal: true,
                        buttons: {
                            "Submit": function () {
                                proxy.server.setData(userDetails, subscriptions, clarifyPassword).done(function () {
                                    hosemann.userOptions.systemStatusMessage('Successfully updated settings');
                                }).fail(function (error) {
                                    hosemann.userOptions.systemStatusMessage('Failed updating settings');
                                    console.log('Failure setting data.  Error:' + error);
                                });
                            }
                        }
                    });
                }
                else {

                    userOptionsProxy.server.setData(userDetails, subscriptions, 'password').done(function () {
                        hosemann.userOptions.systemStatusMessage('Successfully updated settings');
                        location.reload();
                    }).fail(function (error) {
                        hosemann.userOptions.systemStatusMessage('Failed updating settings');
                        console.log('Failure setting data.  Error:' + error);
                    });
                }
            };

            //// Wire up object events to SignalR
            //$('#userOptionsSubmitButton').click(function () {
            //    var userDetails = {};
            //    var subscriptions = [];
            //    var clarifyPassword;

            //    //Initial Settings
            //    userDetails.ClarifyUsername = hosemann.vars.param;
            //    userDetails.CiscoExtension = $('input[name=CiscoExtension]').val();
            //    userDetails.BusinessUnit = $('input[name=BusinessUnit]').val();
            //    userDetails.BluePumpkinUsername = $('input[name=BluePumpkinUsername]').val();

            //    //Visuals
            //    userDetails.ApplicationBG = hosemann.vars.applicationBG;
            //    userDetails.QueueBG = hosemann.vars.queueBG;
            //    userDetails.QueueFG = hosemann.vars.queueFG;
            //    userDetails.InactiveCallTypeBG = hosemann.vars.inactiveCallTypeBG;
            //    userDetails.InactiveCallTypeFG = hosemann.vars.inactiveCallTypeFG;
            //    userDetails.ActiveCallTypeBG = hosemann.vars.activeCallTypeBG;
            //    userDetails.ActiveCallTypeFG = hosemann.vars.activeCallTypeFG;
            //    userDetails.ExtendedCallTypeBG = hosemann.vars.extendedCallTypeBG;
            //    userDetails.ExtendedCallTypeFG = hosemann.vars.extendedCallTypeFG;

            //    // Subscriptions
            //    $('.product:checked').each(function () {
            //        subscriptions.push($(this).attr("id"));
            //    });

            //    if (hosemann.vars.requirePassword) {
            //        // Password Request Dialog (for validation purposes only)
            //        $('#userOptionsSubmitButton').append('<div id="dialog-form" title="Clarify password required."><form><fieldset><label for="clarifyPassword">To save changes to your user options, please enter your Clarify password.</label><input type="password" name="clarifyPassword" id="clarifyPassword" class="text ui-widget-content ui-corner-all" /></fieldset></form></div>');

            //        $("#dialog-form").dialog({
            //            autoOpen: true,
            //            modal: true,
            //            buttons: {
            //                "Submit": function () {
            //                    proxy.server.setData(userDetails, subscriptions, clarifyPassword).done(function () {
            //                        hosemann.userOptions.systemStatusMessage('Successfully updated settings');
            //                    }).fail(function (error) {
            //                        hosemann.userOptions.systemStatusMessage('Failed updating settings');
            //                        console.log('Failure setting data.  Error:' + error);
            //                    });
            //                }
            //            }
            //        });
            //    }
            //    else {
            //        proxy.server.setData(userDetails, subscriptions, 'password').done(function () {
            //            hosemann.userOptions.systemStatusMessage('Successfully updated settings');
            //        }).fail(function (error) {
            //            hosemann.userOptions.systemStatusMessage('Failed updating settings');
            //            console.log('Failure setting data.  Error:' + error);
            //        });
            //    }
            //});
        })
    },

    casetherapist: {
        pageLoad: function () {
            $.support.cors = true;

            // ensures 
            if (hosemann.vars.caseTherapist == false) {
                $('body').text('A critical failure has occurred.  Disabling CaseTherapist.');
                return;
            }


            hosemann.casetherapist.custom.setParam();
            hosemann.casetherapist.custom.setView();
            hosemann.casetherapist.preloadAssets();

            if (hosemann.vars.param === "") {
                this.getMissingParameter();
            }
            else if (hosemann.vars.view == "analyst" || hosemann.vars.view == "supervisor" && hosemann.vars.param != "") {
                var getUser = $.getJSON(window.location.origin + window.location.pathname + "/hapi/Users?param=" + hosemann.vars.param.toLowerCase(), function () { });
                $.when(getUser).done(
                    function (user) {
                        if (user !== null) {
                            hosemann.vars.businessUnit = user.BusinessUnit;
                            hosemann.casetherapist.views.startViews();
                            if (hosemann.vars.queueActivity)
                                hosemann.casetherapist.cisco.loadCADMonitor();
                        }
                        else if (user === null)
                            hosemann.casetherapist.setUserDetails();
                    }
                );
            }
            else {
                hosemann.casetherapist.views.startViews();
            }

            hosemann.signalR();
        },
        preloadAssets: function () {
            $('body').append('<div id="preload" style="display:none"><img src="images/bluegears20.png"></div>');
        },
        getMissingParameter: function () {
            var label = "Clarify Username:";

            if (this.view == "site" || this.view == "tam")
                label = "Client Site ID:"

            $('.default').html('<div id="dialog-form" title="Parameter missing..."><form><fieldset><label for="param">' + label + '</label><input type="text" name="param" id="param" class="text ui-widget-content ui-corner-all" /></fieldset></form></div>');

            $("#dialog-form").dialog({
                autoOpen: true,
                modal: true,
                buttons: {
                    "Submit": function () {
                        window.location.href = 'http://' + window.location.hostname + window.location.pathname + '?param=' + $("#user").val();
                    }
                }
            });
            $(".ui-dialog-titlebar-close", this.parentNode).hide();
        },
        setUserDetails: function () {
            $('.default').html('<script src="../inc/maskedinput/jquery.maskedinput.min.js"></script><div id="dialog-form" title="Please fill in the following:" style="font-size: 1em !important;"><form><fieldset><label for="businessunit">Business Unit:</label><select id="businessunit"><option value="ecbu">ECBU</option><option value="gmbu">GMBU</option></select><label for="ciscoextension">Phone extension:</label><input type="text" name="ciscoextension" id="ciscoextension" class="text ui-widget-content ui-corner-all" /><label for="bluepumpkinusername">BluePumpkin Username:</label><input type="text" name="bluepumpkinusername" id="bluepumpkinusername" class="text ui-widget-content ui-corner-all" /></fieldset></form></div>');
            $("#dialog-form").dialog({
                autoOpen: true,
                modal: true,
                buttons: {
                    "Submit": function () {
                        var clarifyUsername = hosemann.vars.param;
                        var businessUnit = $("#businessunit>option:selected").text();
                        var ciscoExtension = $('#ciscoextension').val();
                        var bpUsername = $('#bluepumpkinusername').val();
                        if (ciscoExtension !== "" && bpUsername !== "") {
                            $.ajax({ url: window.location.origin + window.location.pathname + "/hapi/Users", type: "POST", contentType: "application/json", data: '{"UserDetails":{"ClarifyUsername":"' + clarifyUsername.toLowerCase() + '","CiscoExtension":"' + ciscoExtension + '","BusinessUnit":"' + businessUnit + '","ChangedByIP":"127.0.0.1","BluePumpkinUsername":"' + bpUsername.toLowerCase() + '"}}', success: function (result) { location.reload(); } });
                        }
                        else { alert('not all fields entered'); }
                    }
                }
            });
            $('[class^=ui]').css('font-size', '1em');
            $('#ciscoextension').mask('6999');
            $(".ui-dialog-titlebar-close", this.parentNode).hide();
        },
        cisco: {
            loadCADMonitor: function () {
                if (hosemann.vars.view == 'analyst' && hosemann.vars.param != '') {
                    hosemann.vars.queueActivity = false;
                    hosemann.casetherapist.cisco.agentDesktopMonitor();
                    setInterval('hosemann.casetherapist.cisco.checkCADMonitor()', 3000);
                }
            },
            checkCADMonitor: function () {
                if (hosemann.vars.queueActivity == false) {
                    hosemann.casetherapist.cisco.agentDesktopMonitor();
                }
            },
            agentDesktopMonitor: function () {
                $.getJSON(window.location.origin + window.location.pathname + "/hapi/QueueActivity?username=" + hosemann.vars.param, function () { })
                    .fail(function () {
                    })
                    .done(function (data) {
                        if (data.length > 0) {
                            if ($('#queueActivityContainer').length === 0) {
                                $('.jqx-tabs-title-container').prepend('<div id="queueActivityContainer" style="width:95%; z-index:99999;"><div id="hoverli" class="jqx-reset jqx-disableselect jqx-tabs-title jqx-tabs-title-metro-lime jqx-item jqx-item-metro-lime jqx-rc-t jqx-rc-t-metro-lime jqx-tabs-title-selected-top jqx-tabs-title-selected-top-metro-lime jqx-fill-state-pressed jqx-fill-state-pressed-metro-lime" style="left:auto; display:inline; right: 3%; position: fixed;"><ul class="hover"><li class="hoverli"><div id="currentUser"></div><ul class="file_menu" style="display: none;"></ul></li><li></li></ul></div></div>');

                                $("#hoverli").hover(

                                    function () {
                                        $('ul.file_menu').slideDown('medium');
                                    },

                                    function () {
                                        $('ul.file_menu').slideUp('medium');
                                    });

                                var initialization = false;
                            }

                            $('.file_menu').children().remove();
                            $.each(data, function (i, item) {
                                if (item.IsPrimary == 'true') {
                                    $('#currentUser').text(item.AgentState + ' ' + item.TimeInStatus);
                                }
                                switch (item.AgentState) {
                                    // Phone Wrap
                                    case 'Work Not Ready':
                                        $("<li>").html('<div class="qaname"><div class="circle red"></div>' + item.Name + '</div><div class="qatimeinstatus">' + item.TimeInStatus + '</div>').appendTo(".file_menu");
                                        if (item.IsPrimary == 'true' && (new Date("1970-1-1 " + item.TimeInStatus) - 18000000) / 1000 > 300) {
                                            $('#hoverli').css('background-color', '#FF4040');
                                        } else if (item.IsPrimary == 'true') {
                                            $('#hoverli').css('background-color', '#FFB040');
                                        }
                                        break;
                                        // Backline Wrap
                                    case 'Work Ready':
                                        $("<li>").html('<div class="qaname"><div class="circle red"></div>' + item.Name + '</div><div class="qatimeinstatus">' + item.TimeInStatus + '</div>').appendTo(".file_menu");
                                        if (item.IsPrimary == 'true' && (new Date("1970-1-1 " + item.TimeInStatus) - 18000000) / 1000 > 600) {
                                            $('#hoverli').css('background-color', '#FF4040');
                                        } else if (item.IsPrimary == 'true') {
                                            $('#hoverli').css('background-color', '#FFB040');
                                        }
                                        break;
                                        // Frontline
                                    case 'Ready':
                                        $("<li>").html('<div class="qaname"><div class="circle green"></div>' + item.Name + '</div><div class="qatimeinstatus">' + item.TimeInStatus + '</div>').appendTo(".file_menu");
                                        if (item.IsPrimary == 'true') {
                                            $('#hoverli').css('background-color', '#70ED3B');
                                        }

                                        break;
                                        // On the phone
                                    case 'Talking':
                                        $("<li>").html('<div class="qaname"><div class="circle orange"></div>' + item.Name + '</div><div class="qatimeinstatus">' + item.TimeInStatus + '</div>').appendTo(".file_menu");
                                        if (item.IsPrimary == 'true') {
                                            $('#hoverli').css('background-color', '#FFB040');
                                        }
                                        break;
                                    default:
                                        $("<li>").html('<div class="qaname"><div class="circle yellow"></div>' + item.Name + '</div><div class="qatimeinstatus">' + item.TimeInStatus + '</div>').appendTo(".file_menu");
                                        if (item.IsPrimary == 'true') {
                                            $('#hoverli').css('background-color', '#FFFFFF');
                                        }
                                }
                            });
                        }
                    });
            }
        },
        custom: {
            setParam: function () {
                var urlVars = hosemann.utilities.getUrlVars();

                if (typeof urlVars['user'] != 'undefined') {
                    hosemann.vars.param = urlVars['user'].toLowerCase();
                } else if (typeof urlVars['param'] != 'undefined') {
                    hosemann.vars.param = urlVars['param'].toLowerCase();
                }

            },
            setView: function () {
                var view = "";

                if (window.location.href.match('team'))
                    view = "supervisor";
                else if (window.location.href.match('site'))
                    view = "site";
                else if (window.location.href.match('tams'))
                    view = "tam";
                else
                    view = "analyst";

                hosemann.vars.view = view;
            }
        },
        views: {
            //Input: Name of column to return
            //Output: Column JSON as string
            getColumn: function (name, type) {
                var cellsrender = function (row, columnfield, value, defaulthtml, columnproperties, rowData) {
                    // set which highlighting class this row will use
                    var highlightClass = "";
                    if (type == "Workable") {
                        if (rowData["Contacted"] == 2) {
                            highlightClass = 'contact2';
                        } else if (rowData["Contacted"] == 3) {
                            highlightClass = 'contact3';
                        } else if (rowData["Contacted"] == 4) {
                            highlightClass = 'contact4';
                        } else if (rowData["Contacted"] == 5) {
                            highlightClass = 'contact5';
                        } else if (rowData["Contacted"] >= 6) {
                            highlightClass = 'contact6';
                        }
                    }

                    // clears all existing styling
                    defaulthtml = defaulthtml.toString().replace(/\sstyle="[\w\d\;\-\:\s]+"/i, "");
                    // applies new styling
                    defaulthtml = [defaulthtml.slice(0, 4), ' style="height:100%;padding-top:5px;"', defaulthtml.slice(4)].join('');

                    switch (columnproperties.classname) {
                        case "colheaderIcons":
                            if (highlightClass.length > 0) return '<div class=\"icon ' + highlightClass + '\" style=\"height:100%;padding-top:5px;text-align:right; padding-right: 5px;\"><img src="' + window.location.origin + window.location.pathname + '/images/icon_important.png" style=""></div>';
                            break;
                        case "colheaderWI":
                            var res = '<div class=\"' + highlightClass + '\" style=\"text-align:center;height:100%;padding-top:5px;\"><a target=\"_blank\" href=\"https://tfs.blackbaud.com/tfs/DefaultCollection/Infinity/_workitems#_a=edit&id=' + rowData["WI"] + '\">' + value + '</a></div>';
                            return res;
                            break;
                        case "colheaderIssueWI":
                            var res = '<div class=\"' + highlightClass + '\" style=\"text-align:center;height:100%;padding-top:5px;\"><a target=\"_blank\" href=\"https://tfs.blackbaud.com/tfs/DefaultCollection/Infinity/_workitems#_a=edit&id=' + rowData["WI"] + '\">' + value + '</a></div>';
                            return res;
                            break;
                        case "colheaderCaseTitle":
                            var res = '<div class=\"' + highlightClass + '\" style=\"padding-left:5px;height:100%;padding-top:5px;\"><a class="various fancybox.iframe" href=\"http://bbecweb/reporter/casedetails.php?id=' + rowData["id_number"] + '\">' + value + '</a></div>';
                            return res;
                            break;
                        case "colheaderCustomer":
                            defaulthtml = hosemann.utilities.modifyString(defaulthtml, 'padding-left: 5px; ', parseInt(defaulthtml.toString().indexOf("style=") + 7));
                            return hosemann.utilities.modifyString(defaulthtml, 'class=\"' + highlightClass + '\" ', parseInt(defaulthtml.toString().indexOf("style=")));
                            break;
                        case "colheaderContacted":
                            if (value == 2 && type == "Workable") {
                                defaulthtml = hosemann.utilities.modifyString(defaulthtml, 'class="contactOrange" ', parseInt(defaulthtml.toString().indexOf("style=")));
                                return hosemann.utilities.modifyString(defaulthtml, 'text-align: center; ', parseInt(defaulthtml.toString().indexOf("style=") + 7));
                            } else if (value > 2 && type == "Workable") {
                                defaulthtml = hosemann.utilities.modifyString(defaulthtml, 'class="contactRed" ', parseInt(defaulthtml.toString().indexOf("style=")));
                                return hosemann.utilities.modifyString(defaulthtml, 'text-align: center; ', parseInt(defaulthtml.toString().indexOf("style=") + 7));
                            } else {
                                return hosemann.utilities.modifyString(defaulthtml, 'text-align: center; ', parseInt(defaulthtml.toString().indexOf("style=") + 7));
                            }
                            break;
                        case "colheaderCaseOwner":
                            defaulthtml = hosemann.utilities.modifyString(defaulthtml, 'padding-left: 5px; ', parseInt(defaulthtml.toString().indexOf("style=") + 7));
                            return hosemann.utilities.modifyString(defaulthtml, 'class=\"' + highlightClass + '\" ', parseInt(defaulthtml.toString().indexOf("style=")));
                            break;
                        case "colheaderStatus":
                            defaulthtml = hosemann.utilities.modifyString(defaulthtml, 'padding-left: 5px; ', parseInt(defaulthtml.toString().indexOf("style=") + 7));
                            return hosemann.utilities.modifyString(defaulthtml, 'class=\"' + highlightClass + '\" ', parseInt(defaulthtml.toString().indexOf("style=")));
                            break;
                        case "colheaderWIPBin":
                            defaulthtml = hosemann.utilities.modifyString(defaulthtml, 'padding-left: 5px; ', parseInt(defaulthtml.toString().indexOf("style=") + 7));
                            var res = defaulthtml.toString().replace(/\d+\s/i, "");
                            return hosemann.utilities.modifyString(res, 'class=\"' + highlightClass + '\" ', parseInt(res.toString().indexOf("style=")));
                            break;
                        default:
                            // provides a list of columns that will be centered
                            var centeredColumns = ["colheaderCaseNum", "colheaderSeverity", "colheaderUpdated", "colheaderProduct", "colheaderCaseAge", "colheaderDaysOwned"];
                            if ($.inArray(columnproperties.classname, centeredColumns) > -1) {
                                defaulthtml = hosemann.utilities.modifyString(defaulthtml, 'text-align: center; ', parseInt(defaulthtml.toString().indexOf("style=") + 7));
                            }
                            return hosemann.utilities.modifyString(defaulthtml, 'class=\"' + highlightClass + '\" ', parseInt(defaulthtml.toString().indexOf("style=")));
                            break;
                    }
                };

                switch (name) {
                    case "icon":
                        return { text: "", classname: "colheaderIcons", filterable: false, cellsrenderer: cellsrender };
                    case "caseage":
                        return { text: "Age", datafield: "CaseAge", width: "35px", classname: "colheaderCaseAge", filterable: false, cellsrenderer: cellsrender, cellsalign: "center", cellsformat: "n" };
                    case "issuewi-analyst":
                        return { text: "Analyst", datafield: "ANALYST", classname: "colheaderAnalyst", filtertype: "checkedlist" };
                    case "casecontact":
                        return { text: "Case Contact", datafield: "CaseContact", width: "100px", classname: "colheaderCaseContact", cellsrenderer: cellsrender, filtertype: "checkedlist" };
                    case "casenum":
                        return { text: "Case Num", datafield: "id_number", width: "80px", classname: "colheaderCaseNum", cellsrenderer: cellsrender, cellsalign: "center" };
                    case "caseowner":
                        return { text: "Case Owner", datafield: "CaseOwner", width: "87px", classname: "colheaderCaseOwner", cellsrenderer: cellsrender, filtertype: "checkedlist" };
                    case "caseownerlogin":
                        return { text: "Case Owner", datafield: "CaseOwnerLogin", width: "87px", classname: "colheaderCaseOwner", cellsrenderer: cellsrender, filtertype: "checkedlist" };
                    case "issuewi-casestatus":
                        return { text: "Case Status", datafield: "CASESTATUS", classname: "colheaderCaseStatus", filtertype: "checkedlist" };
                    case "casetitle":
                        return { text: "Case Title", datafield: "CaseTitle", classname: "colheaderCaseTitle", cellsrenderer: cellsrender };
                    case "issuewi-casetitle":
                        return { text: "Case Title", width: "400px", datafield: "TITLE", classname: "colheaderTitle" };
                    case "casecentrallink":
                        return { text: "CaseCentralLink", datafield: "CaseCentralLink", width: "200px", classname: "colheaderCaseCentralLink", filterable: false, cellsrenderer: cellsrender, cellsformat: "n" };
                    case "issuewi-caseid":
                        return { text: "CaseID", width: "100px", "datafield": "CASEID", classname: "colheaderCaseId" };
                    case "issuewi-client":
                        return { text: "Client", width: "200px", datafield: "CLIENTNAME", classname: "colheaderClient", filtertype: "checkedlist" };
                    case "contacted":
                        return { text: "Contacted", datafield: "Contacted", width: "30px", classname: "colheaderContacted", filterable: false, cellsrenderer: cellsrender, cellsalign: "center", cellsformat: "n" };
                    case "createdon":
                        return { text: "Created On", datafield: "CreatedDate", width: "75px", classname: "colheaderCreatedDate", filterable: false, cellsrenderer: cellsrender, cellsalign: "center", cellsformat: "n" };
                    case "customer":
                        return { text: "Customer", datafield: "Customer", classname: "colheaderCustomer", cellsrenderer: cellsrender, filtertype: "checkedlist" };
                    case "daysowned":
                        return { text: "DaysOwned", datafield: "DaysOwned", width: "35px", classname: "colheaderDaysOwned", filterable: false, cellsrenderer: cellsrender, cellsalign: "center", cellsformat: "n" };
                    case "product":
                        return { text: "Product", datafield: "ProductLine", width: "75px", classname: "colheaderProduct", cellsrenderer: cellsrender, filtertype: "checkedlist", cellsalign: "center" };
                    case "severity":
                        return { text: "Severity", datafield: "Severity", width: "65px", classname: "colheaderSeverity", cellsrenderer: cellsrender, filtertype: "checkedlist", cellsalign: "center" };
                    case "status":
                        return { text: "Status", datafield: "Status", width: "100px", classname: "colheaderStatus", cellsrenderer: cellsrender, filtertype: "checkedlist", cellsalign: "center" };
                    case "updated":
                        return { text: "Updated", datafield: "Updated", width: "35px", classname: "colheaderUpdated", filterable: false, cellsrenderer: cellsrender, cellsalign: "center", cellsformat: "n" };
                    case "wiassignedto":
                        return { text: "WI Assigned To", width: "70px", datafield: "WIASSIGNEDTO", classname: "colheaderWIAssignedTo", filtertype: "checkedlist" };
                    case "issuewi-wiclosedate":
                        return { text: "WI Close Date", datafield: "WICLOSEDATE", classname: "colheaderCloseDate", filterable: false };
                    case "issuewi-wiclosereason":
                        return { text: "WI Close Reason", width: "100px", datafield: "WICLOSEREASON", classname: "colheaderWICloseReason", filtertype: "checkedlist" };
                    case "issuewi-wistate":
                        return { text: "WI State", width: "70px", datafield: "WISTATE", classname: "colheaderWIState", filtertype: "checkedlist" };
                    case "wi":
                        return { text: "WI", datafield: "WI", width: "80px", classname: "colheaderWI", cellsrenderer: cellsrender };
                    case "issuewi-wi":
                        return { text: "WI", width: "50px", datafield: "WI", classname: "colheaderIssueWI", cellsrenderer: cellsrender, filterable: true };
                    case "wipbin":
                        return { text: "WIPBin", datafield: "WIPBin", width: "75px", classname: "colheaderWIPBin", cellsrenderer: cellsrender };
                }
            },
            //Input: View type
            //Output: Complete JSON for grid columns
            buildColumns: function (type) {
                var columns = [];
                switch (hosemann.vars.view) {
                    case "analyst":
                        if (type == "Workable") {
                            $.each(['icon', 'casenum', 'severity', 'casetitle', 'customer', 'updated', 'contacted', 'product', 'status', 'wipbin', 'caseage', 'daysowned'], function (index, value) {
                                columns.push(hosemann.casetherapist.views.getColumn(value, type));
                            });
                        }
                        if (type == "NonWorkable") {
                            $.each(['casenum', 'wi', 'severity', 'casetitle', 'customer', 'updated', 'contacted', 'product', 'status', 'wipbin', 'caseage', 'daysowned'], function (index, value) {
                                columns.push(hosemann.casetherapist.views.getColumn(value, type));
                            });
                        }
                        if (type == "Resolved") {
                            $.each(['casenum', 'severity', 'casetitle', 'customer', 'updated', 'contacted', 'product', 'status', 'wipbin', 'caseage', 'daysowned'], function (index, value) {
                                columns.push(hosemann.casetherapist.views.getColumn(value, type));
                            });
                        }
                        if (type == "IssueWI") {
                            $.each(['issuewi-wi', 'issuewi-caseid', 'issuewi-casetitle', 'issuewi-client', 'issuewi-wistate', 'issuewi-wiclosereason', 'issuewi-wiassignedto', 'issuewi-casestatus', 'issuewi-wiclosedate', 'issuewi-analyst'], function (index, value) {
                                columns.push(hosemann.casetherapist.views.getColumn(value, type));
                            });
                        }
                        break;
                    case "supervisor":
                        if (type == "Workable") {
                            $.each(['icon', 'casenum', 'severity', 'casetitle', 'customer', 'updated', 'contacted', 'product', 'caseownerlogin', 'status', 'wipbin', 'caseage', 'daysowned'], function (index, value) {
                                columns.push(hosemann.casetherapist.views.getColumn(value, type));
                            });
                        }
                        if (type == "NonWorkable") {
                            $.each(['casenum', 'wi', 'severity', 'casetitle', 'customer', 'updated', 'contacted', 'product', 'caseownerlogin', 'status', 'wipbin', 'caseage', 'daysowned'], function (index, value) {
                                columns.push(hosemann.casetherapist.views.getColumn(value, type));
                            });
                        }
                        if (type == "Resolved") {
                            $.each(['casenum', 'severity', 'casetitle', 'customer', 'updated', 'contacted', 'product', 'caseownerlogin', 'status', 'wipbin', 'caseage', 'daysowned'], function (index, value) {
                                columns.push(hosemann.casetherapist.views.getColumn(value, type));
                            });
                        }
                        if (type == "IssueWI") {
                            $.each(['issuewi-wi', 'issuewi-caseid', 'issuewi-casetitle', 'issuewi-client', 'issuewi-wistate', 'issuewi-wiclosereason', 'issuewi-wiassignedto', 'issuewi-casestatus', 'issuewi-wiclosedate', 'issuewi-analyst'], function (index, value) {
                                columns.push(hosemann.casetherapist.views.getColumn(value, type));
                            });
                        }
                        break;
                    case "site":
                        if (type == "Workable") {
                            $.each(['icon', 'casenum', 'severity', 'casetitle', 'customer', 'updated', 'contacted', 'product', 'caseownerlogin', 'status', 'wipbin', 'caseage', 'daysowned'], function (index, value) {
                                columns.push(hosemann.casetherapist.views.getColumn(value, type));
                            });
                        }
                        if (type == "NonWorkable") {
                            $.each(['casenum', 'wi', 'severity', 'casetitle', 'customer', 'updated', 'contacted', 'product', 'caseownerlogin', 'status', 'wipbin', 'caseage', 'daysowned'], function (index, value) {
                                columns.push(hosemann.casetherapist.views.getColumn(value, type));
                            });
                        }
                        if (type == "Resolved") {
                            $.each(['casenum', 'severity', 'casetitle', 'customer', 'updated', 'contacted', 'product', 'caseownerlogin', 'status', 'wipbin', 'caseage', 'daysowned'], function (index, value) {
                                columns.push(hosemann.casetherapist.views.getColumn(value, type));
                            });
                        }
                        if (type == "IssueWI") {
                            $.each(['issuewi-wi', 'issuewi-caseid', 'issuewi-casetitle', 'issuewi-client', 'issuewi-wistate', 'issuewi-wiclosereason', 'issuewi-wiassignedto', 'issuewi-casestatus', 'issuewi-wiclosedate', 'issuewi-analyst'], function (index, value) {
                                columns.push(hosemann.casetherapist.views.getColumn(value, type));
                            });
                        }
                        break;
                    case "tam":
                        if (type == "Workable") {
                            $.each(['icon', 'casenum', 'severity', 'casecontact', 'casetitle', 'updated', 'contacted', 'product', 'caseowner', 'status', 'createdon', 'caseage', 'daysowned', 'casecentrallink'], function (index, value) {
                                columns.push(hosemann.casetherapist.views.getColumn(value, type));
                            });
                        }
                        if (type == "NonWorkable") {
                            $.each(['casenum', 'wi', 'severity', 'casecontact', 'casetitle', 'updated', 'contacted', 'product', 'caseowner', 'status', 'createdon', 'caseage', 'daysowned', 'casecentrallink'], function (index, value) {
                                columns.push(hosemann.casetherapist.views.getColumn(value, type));
                            });
                        }
                        if (type == "Resolved") {
                            $.each(['casenum', 'wi', 'severity', 'casecontact', 'casetitle', 'updated', 'contacted', 'product', 'caseowner', 'status', 'createdon', 'caseage', 'daysowned', 'casecentrallink'], function (index, value) {
                                columns.push(hosemann.casetherapist.views.getColumn(value, type));
                            });
                        }
                        if (type == "IssueWI") {
                            $.each(['issuewi-wi', 'issuewi-caseid', 'issuewi-casetitle', 'issuewi-client', 'issuewi-wistate', 'issuewi-wiclosereason', 'issuewi-wiassignedto', 'issuewi-casestatus', 'issuewi-wiclosedate', 'issuewi-analyst'], function (index, value) {
                                columns.push(hosemann.casetherapist.views.getColumn(value, type));
                            });
                        }
                        if (type == "Closed") {
                            $.each(['casenum', 'wi', 'severity', 'casecontact', 'casetitle', 'updated', 'contacted', 'product', 'caseowner', 'status', 'createdon', 'caseage', 'daysowned', 'casecentrallink'], function (index, value) {
                                columns.push(hosemann.casetherapist.views.getColumn(value, type));
                            });
                        }
                        break;
                    default:
                        break;
                }

                return columns;
            },
            getSource: function (type, url) {
                var source = "";
                switch (hosemann.vars.view) {
                    case "analyst":
                        if (type == "Workable") {
                            source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'WI', type: 'string' }, { name: 'Severity', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Customer', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwnerLogin', type: 'string' }, { name: 'CaseOwner', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'WIPBin', type: 'string' }, { name: 'CreatedDate', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }, { name: 'CaseCentralLink', type: 'string' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "Resolved") {
                            var source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Customer', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'WIPBin', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "NonWorkable") {
                            var source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'WI', type: 'string' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Customer', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'WIPBin', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "IssueWI") {
                            var source = { datatype: "json", datafields: [{ name: 'WI', type: 'string' }, { name: 'CASEID', type: 'string' }, { name: 'TITLE', type: 'string' }, { name: 'CLIENTNAME', type: 'string' }, { name: 'WISTATE', type: 'string' }, { name: 'WICLOSEREASON', type: 'string' }, { name: 'WIASSIGNTO', type: 'string' }, { name: 'CASESTATUS', type: 'string' }, { name: 'WICLOSEDATE', type: 'string' }, { name: 'ANALYST', type: 'string' }], id: 'CASEID', url: url, pagesize: 50 };
                        }
                        break;
                    case "supervisor":
                        if (type == "Workable") {
                            var source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Customer', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwnerLogin', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'WIPBin', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "Resolved") {
                            var source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Customer', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwnerLogin', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'WIPBin', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "NonWorkable") {
                            var source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'WI', type: 'string' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Customer', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwnerLogin', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'WIPBin', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "IssueWI") {
                            var source = { datatype: "json", datafields: [{ name: 'WI', type: 'string' }, { name: 'CASEID', type: 'string' }, { name: 'TITLE', type: 'string' }, { name: 'CLIENTNAME', type: 'string' }, { name: 'WISTATE', type: 'string' }, { name: 'WICLOSEREASON', type: 'string' }, { name: 'WIASSIGNTO', type: 'string' }, { name: 'CASESTATUS', type: 'string' }, { name: 'WICLOSEDATE', type: 'string' }, { name: 'ANALYST', type: 'string' }], id: 'CASEID', url: url, pagesize: 50 };
                        }
                        break;
                    case "site":
                        if (type == "Workable") {
                            var source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Customer', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwnerLogin', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'WIPBin', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "Resolved") {
                            var source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Customer', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwnerLogin', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'WIPBin', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "NonWorkable") {
                            var source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'WI', type: 'string' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Customer', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwnerLogin', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'WIPBin', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "IssueWI") {
                            var source = { datatype: "json", datafields: [{ name: 'WI', type: 'string' }, { name: 'CASEID', type: 'string' }, { name: 'TITLE', type: 'string' }, { name: 'CLIENTNAME', type: 'string' }, { name: 'WISTATE', type: 'string' }, { name: 'WICLOSEREASON', type: 'string' }, { name: 'WIASSIGNTO', type: 'string' }, { name: 'CASESTATUS', type: 'string' }, { name: 'WICLOSEDATE', type: 'string' }, { name: 'ANALYST', type: 'string' }], id: 'CASEID', url: url, pagesize: 50 };
                        }
                        break;
                    case "tam":
                        if (type == "Workable") {
                            var source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'WI', type: 'string' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwner', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'CreatedDate', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }, { name: 'CaseCentralLink', type: 'string' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "Resolved") {
                            var source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'WI', type: 'string' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwner', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'CreatedDate', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }, { name: 'CaseCentralLink', type: 'string' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "NonWorkable") {
                            var source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'WI', type: 'string' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwner', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'CreatedDate', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }, { name: 'CaseCentralLink', type: 'string' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "IssueWI") {
                            var source = { datatype: "json", datafields: [{ name: 'WI', type: 'string' }, { name: 'CASEID', type: 'string' }, { name: 'TITLE', type: 'string' }, { name: 'CLIENTNAME', type: 'string' }, { name: 'WISTATE', type: 'string' }, { name: 'WICLOSEREASON', type: 'string' }, { name: 'WIASSIGNTO', type: 'string' }, { name: 'CASESTATUS', type: 'string' }, { name: 'WICLOSEDATE', type: 'string' }, { name: 'ANALYST', type: 'string' }], id: 'CASEID', url: url, pagesize: 50 };
                        }
                        else if (type == "Closed") {
                            var source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'WI', type: 'string' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwner', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'CreatedDate', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }, { name: 'CaseCentralLink', type: 'string' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        break;
                }
                return source;
            },
            startViews: function () {
                if (hosemann.vars.businessUnit == "gmbu")
                    $('.default').append('<div class="header"><div class="casetherapist" style="">case<strong>therapist</strong></div><div><div id="userOptionsButton"></div></div><div id="bbq"><div class="bbqContainer">&nbsp;</div></div></div><div id="jqxTabs"><ul><li>Workable</li><li>Non-Workable</li><li>WI Issues</li></ul><div style="overflow: hidden;"><div id="jqxgridWorkable"></div></div><div style="overflow: hidden;"><div id="jqxgridNonWorkable"></div></div><div style="overflow: hidden;"><div id="jqxgridIssueWI"></div></div></div>');
                else
                    $('.default').append('<div class="header"><div class="casetherapist" style="">case<strong>therapist</strong></div><div><div id="userOptionsButton"></div></div><div id="bbq"><div class="bbqContainer">&nbsp;</div></div></div><div id="jqxTabs"><ul><li>Workable</li><li>Resolved</li><li>Non-Workable</li><li>WI Issues</li></ul><div style="overflow: hidden;"><div id="jqxgridWorkable"></div></div><div style="overflow: hidden;"><div id="jqxgridResolved"></div></div><div style="overflow: hidden;"><div id="jqxgridNonWorkable"></div></div><div style="overflow: hidden;"><div id="jqxgridIssueWI"></div></div></div>');

                $('body').append('<div id="userOptionsPanel"></div>');

                $('#userOptionsButton').click(function () {
                    hosemann.userOptions.pageLoad();

                    $.fancybox({
                        href: '#userOptionsPanel',
                        minWidth: 700,
                        minHeight: 500
                    });
                });

                var initWidgets = function (tab) {
                    switch (tab) {
                        case 0:
                            hosemann.casetherapist.views.workable();
                            break;
                        case 1:
                            hosemann.casetherapist.views.resolved();
                            break;
                        case 2:
                            hosemann.casetherapist.views.nonWorkable();
                            break;
                        case 3:
                            hosemann.casetherapist.views.issueWIs();
                            break;
                    }
                }
                $('#jqxTabs').jqxTabs({ width: '95%', height: '90%', theme: "metro-lime", initTabContent: initWidgets });

                //Reporter Legend Fancybox.
                $(document).ready(function () {
                    $("a#aLegend").fancybox({
                        maxWidth: 550,
                        maxHeight: 350,
                        fitToView: false,
                        autoSize: false,
                        closeClick: false,
                        openEffect: 'none',
                        closeEffect: 'none'
                    });
                });
            },
            workable: function () {
                var type = "Workable";
                var url = window.location.origin + window.location.pathname + "/hapi/Cases/?type=" + hosemann.vars.view + "&workable=1&resolved=0&param=" + hosemann.vars.param + "&businessUnit=" + hosemann.vars.businessUnit;
                var grid = $("#jqxgridWorkable");

                var source = this.getSource(type, url);
                var dataAdapter = new $.jqx.dataAdapter(source);

                grid.jqxGrid({
                    width: '100%',
                    height: '100%',
                    source: dataAdapter,
                    theme: "metro-lime",
                    columnsresize: true,
                    enabletooltips: true,
                    altrows: false,
                    enablebrowserselection: true,
                    selectionmode: 'none',
                    filterable: true,
                    showfilterrow: true,
                    columnsmenu: false,
                    pageable: true,
                    sortable: true,
                    pagesizeoptions: ['15', '30', '50', '100', '1000'],
                    columns: this.buildColumns(type),
                    rendered: function () {
                        $('.colheaderCreatedOn>div:first-child>div:first-child>span').html('<img src="' + window.location.origin + window.location.pathname + '/images/createdon.png" alt="Created On">');
                        $('.colheaderUpdated>div:first-child>div:first-child>span').html('<img src="' + window.location.origin + window.location.pathname + '/images/activity.png" alt="Activity">');
                        $('.colheaderContacted>div:first-child>div:first-child>span').html('<img src="' + window.location.origin + window.location.pathname + '/images/contacted.png" alt="Contacted">');
                        $('.various').fancybox({
                            Width: 800,
                            Height: 600,
                            fitToView: true,
                            autoSize: false,
                            closeClick: false,
                            openEffect: 'none',
                            closeEffect: 'none'
                        });
                    },
                    ready: function () {
                        $('div[id^=dropdownlistContent]').text("Filter");
                        $('#pagerjqxgridWorkable>div').append('<input style="float: left; margin-left: 5px; padding: 1px 5px; font-size: .9em;" type="button" value="Export to CSV" id="csvExportWorkable" /><div id="version" style="width: 100%; text-align: center; font-size: 1em;">Developed and maintained by <a href="mailto:joseph.hosemann@blackbaud.com?subject=Reporter">Joseph Hosemann</a> - 3.2 - <a id="aLegend" data-fancybox-type="iframe" href="http://bbecweb/reporter/legend.htm">Reporter Legend</a></div>');

                        $("#csvExportWorkable").jqxButton({
                            theme: "metro-lime"
                        });
                        $("#csvExportWorkable").click(function () {
                            grid.jqxGrid('exportdata', 'csv', 'CaseTherapist');
                        });
                    }
                });
            },
            nonWorkable: function () {
                var type = "NonWorkable";
                var url = window.location.origin + window.location.pathname + "/hapi/Cases/?type=" + hosemann.vars.view + "&workable=0&resolved=0&param=" + hosemann.vars.param + "&businessUnit=" + hosemann.vars.businessUnit;
                var grid = $("#jqxgridNonWorkable");

                var source = this.getSource(type, url);
                var dataAdapter = new $.jqx.dataAdapter(source);

                // Create Grid
                grid.jqxGrid({
                    width: '100%',
                    height: '100%',
                    source: dataAdapter,
                    theme: "metro-lime",
                    columnsresize: true,
                    enabletooltips: true,
                    altrows: false,
                    enablebrowserselection: true,
                    selectionmode: 'none',
                    filterable: true,
                    showfilterrow: true,
                    columnsmenu: false,
                    pageable: true,
                    sortable: true,
                    pagesizeoptions: ['15', '30', '50', '100', '1000'],
                    columns: this.buildColumns(type),
                    rendered: function () {
                        $('.colheaderCreatedOn>div:first-child>div:first-child>span').html('<img src="' + window.location.origin + window.location.pathname + '/images/createdon.png" alt="Created On">');
                        $('.colheaderUpdated>div:first-child>div:first-child>span').html('<img src="' + window.location.origin + window.location.pathname + '/images/activity.png" alt="Activity">');
                        $('.colheaderContacted>div:first-child>div:first-child>span').html('<img src="' + window.location.origin + window.location.pathname + '/images/contacted.png" alt="Contacted">');
                        $('.various').fancybox({
                            Width: 800,
                            Height: 600,
                            fitToView: true,
                            autoSize: false,
                            closeClick: false,
                            openEffect: 'none',
                            closeEffect: 'none'
                        });
                    },
                    ready: function () {
                        $('div[id^=dropdownlistContent]').text("Filter");

                        $('#pagerjqxgridNonWorkable>div').append('<input style="float: left; margin-left: 5px; padding: 1px 5px; font-size: .9em;" type="button" value="Export to CSV" id="csvExportNonWorkable" /><div id="version" style="width: 100%; text-align: center; font-size: 1em;">Developed and maintained by <a href="mailto:joseph.hosemann@blackbaud.com?subject=Reporter">Joseph Hosemann</a> - 3.2 - <a id="aLegend" data-fancybox-type="iframe" href="http://bbecweb/reporter/legend.htm">Reporter Legend</a></div>');
                        $("#csvExportNonWorkable").jqxButton({
                            theme: "metro-lime"
                        });
                        $("#csvExportNonWorkable").click(function () {
                            grid.jqxGrid('exportdata', 'csv', 'CaseTherapist');
                        });
                    }
                });
            },
            resolved: function () {
                var type = "Resolved";
                var url = window.location.origin + window.location.pathname + "/hapi/Cases/?type=" + hosemann.vars.view + "&workable=-1&resolved=1&param=" + hosemann.vars.param + "&businessUnit=" + hosemann.vars.businessUnit;
                var grid = $("#jqxgridResolved");

                var source = this.getSource(type, url);
                var dataAdapter = new $.jqx.dataAdapter(source);

                // Create Grid
                grid.jqxGrid({
                    width: '100%',
                    height: '100%',
                    source: dataAdapter,
                    theme: "metro-lime",
                    columnsresize: true,
                    enabletooltips: true,
                    altrows: false,
                    enablebrowserselection: true,
                    selectionmode: 'none',
                    filterable: true,
                    showfilterrow: true,
                    columnsmenu: false,
                    pageable: true,
                    sortable: true,
                    pagesizeoptions: ['15', '30', '50', '100', '1000'],
                    columns: this.buildColumns(type),
                    rendered: function () {
                        $('.colheaderCreatedOn>div:first-child>div:first-child>span').html('<img src="' + window.location.origin + window.location.pathname + '/images/createdon.png" alt="Created On">');
                        $('.colheaderUpdated>div:first-child>div:first-child>span').html('<img src="' + window.location.origin + window.location.pathname + '/images/activity.png" alt="Activity">');
                        $('.colheaderContacted>div:first-child>div:first-child>span').html('<img src="' + window.location.origin + window.location.pathname + '/images/contacted.png" alt="Contacted">');
                        $('.various').fancybox({
                            Width: 800,
                            Height: 600,
                            fitToView: true,
                            autoSize: false,
                            closeClick: false,
                            openEffect: 'none',
                            closeEffect: 'none'
                        });
                    },
                    ready: function () {
                        $('div[id^=dropdownlistContent]').text("Filter");

                        $('#pagerjqxgridResolved>div').append('<input style="float: left; margin-left: 5px; padding: 1px 5px; font-size: .9em;" type="button" value="Export to CSV" id="csvExportResolved" /><div id="version" style="width: 100%; text-align: center; font-size: 1em;">Developed and maintained by <a href="mailto:joseph.hosemann@blackbaud.com?subject=Reporter">Joseph Hosemann</a> - 3.2 - <a id="aLegend" data-fancybox-type="iframe" href="http://bbecweb/reporter/legend.htm">Reporter Legend</a></div>');
                        $("#csvExportResolved").jqxButton({
                            theme: "metro-lime"
                        });
                        $("#csvExportResolved").click(function () {
                            grid.jqxGrid('exportdata', 'csv', 'CaseTherapist');
                        });
                    }
                });
            },
            issueWIs: function () {
                var type = "IssueWI";
                var url = window.location.origin + window.location.pathname + "/hapi/IssueWI/?type=" + hosemann.vars.view + "&param=" + hosemann.vars.param;
                var grid = $("#jqxgridIssueWI");

                var source = this.getSource(type, url);
                var dataAdapter = new $.jqx.dataAdapter(source);

                // Create Grid
                grid.jqxGrid(
                    {
                        width: '100%',
                        height: '100%',
                        source: dataAdapter,
                        theme: "metro-lime",
                        columnsresize: true,
                        enabletooltips: true,
                        altrows: false,
                        enablebrowserselection: true,
                        selectionmode: 'none',
                        filterable: true,
                        showfilterrow: true,
                        columnsmenu: false,
                        pageable: true,
                        sortable: true,
                        pagesizeoptions: ['15', '30', '50', '100', '1000'],
                        columns: this.buildColumns(type),
                        rendered: function () {
                            $('.various').fancybox({ Width: 800, Height: 600, fitToView: true, autoSize: false, closeClick: false, openEffect: 'none', closeEffect: 'none' });
                        },
                        ready: function () {
                            $('div[id^=dropdownlistContent]').text("Filter");

                            $('#pagerjqxgridIssueWI>div').append('<input style="float: left; margin-left: 5px; padding: 1px 5px; font-size: .9em;" type="button" value="Export to CSV" id="csvExportIssueWI" /><div id="version" style="width: 100%; text-align: center; font-size: 1em;">Developed and maintained by <a href="mailto:joseph.hosemann@blackbaud.com?subject=Reporter">Joseph Hosemann</a> - 3.2 - <a id="aLegend" data-fancybox-type="iframe" href="http://bbecweb/reporter/legend.htm">Reporter Legend</a></div>')
                            $("#csvExportIssueWI").jqxButton({ theme: "metro-lime" });
                            $("#csvExportIssueWI").click(function () {
                                grid.jqxGrid('exportdata', 'csv', 'CaseTherapist');
                            });
                        }
                    });
            },
            closed: function () {
                var type = "Closed";
                var url = window.location.origin + window.location.pathname + "/hapi/Cases/?type=" + hosemann.vars.view + "&workable=-1&resolved=-1&param=" + hosemann.vars.param;
                var grid = $("#jqxgridClosed");

                var source = this.getSource(type, url);
                var dataAdapter = new $.jqx.dataAdapter(source);

                // Create Grid
                grid.jqxGrid({
                    width: '100%',
                    height: '100%',
                    source: dataAdapter,
                    theme: "metro-lime",
                    columnsresize: true,
                    enabletooltips: true,
                    altrows: false,
                    enablebrowserselection: true,
                    selectionmode: 'none',
                    filterable: true,
                    showfilterrow: true,
                    columnsmenu: false,
                    pageable: true,
                    sortable: true,
                    pagesizeoptions: ['15', '30', '50', '100', '1000'],
                    columns: this.buildColumns(type),
                    rendered: function () {
                        $('.colheaderCreatedOn>div:first-child>div:first-child>span').html('<img src="' + window.location.origin + window.location.pathname + '/images/createdon.png" alt="Created On">');
                        $('.colheaderUpdated>div:first-child>div:first-child>span').html('<img src="' + window.location.origin + window.location.pathname + '/images/activity.png" alt="Activity">');
                        $('.colheaderContacted>div:first-child>div:first-child>span').html('<img src="' + window.location.origin + window.location.pathname + '/images/contacted.png" alt="Contacted">');
                        $('.various').fancybox({
                            Width: 800,
                            Height: 600,
                            fitToView: true,
                            autoSize: false,
                            closeClick: false,
                            openEffect: 'none',
                            closeEffect: 'none'
                        });
                    },
                    ready: function () {
                        $('div[id^=dropdownlistContent]').text("Filter");

                        $('#pagerjqxgridClosed>div').append('<input style="float: left; margin-left: 5px; padding: 1px 5px; font-size: .9em;" type="button" value="Export to CSV" id="csvExportClosed" /><div id="version" style="width: 100%; text-align: center; font-size: 1em;">Developed and maintained by <a href="mailto:joseph.hosemann@blackbaud.com?subject=Reporter">Joseph Hosemann</a> - 3.2 - <a id="aLegend" data-fancybox-type="iframe" href="http://bbecweb/reporter/legend.htm">Reporter Legend</a></div>');
                        $("#csvExportClosed").jqxButton({
                            theme: "metro-lime"
                        });
                        $("#csvExportClosed").click(function () {
                            grid.jqxGrid('exportdata', 'csv', 'CaseTherapist');
                        });
                    }
                });
            }
        } // end views
    }, // end casetherapist
    userOptions: {
        pageLoad: function () {
            hosemann.userOptions.buildHtml();
            hosemann.userOptions.buildSubscriptions();
            hosemann.userOptions.buildInitialSetup();
            hosemann.userOptions.buildVisuals();
        },
        buildHtml: function () {
            $('#userOptionsPanel').html('<div class="useroptions"><div class="content"><div class="title">user<div style="font-weight: normal; display: inline; color: #1F6D9B;">options</div></div><div id="wizard"><h2>Initial Setup</h2><section><p><div id="labels" style="width:50%; float:left; text-align:right;"><label>Business Unit:</label><label>Cisco Extension:</label><label>BluePumpkin Username:</label></div><div id="inputs" style="float:left"><input type="text" name="BusinessUnit" value="" /><input type="text" name="CiscoExtension" value="" /><input type="text" name="BluePumpkinUsername" value="" /></div></p></section><h2>Subscriptions</h2><section><form action=""><ul id="subscriptions"></ul></form></section><h2>Visuals</h2><section><div class="bbqPreviewParentContainer"><div class="bbqPreviewContainer"><div class="bbqPreviewContainerTitle">Inactive Queue Preview</div><div class="bbq"><div class="bbqContainer" id="Inactive"><div class="bbqProduct" id="BBIS"><strong>BBIS</strong><div class="bbqQueue" id="CL"><strong>CL</strong>0|<strong>0:00:00</strong></div><div class="bbqQueue" id="PH"><strong>PH</strong>0|<strong>0:00:00</strong></div></div></div></div><br /><div><input type="text" id="applicationBG" /><p style="display:inline; margin-left:5px;">Application Background</p></div><div><input type="text" id="queueBG" /><p style="display:inline; margin-left:5px;">Queue Background</p></div><div><input type="text" id="queueFG" /><p style="display:inline; margin-left:5px;">Queue Foreground</p></div><div><input type="text" id="inactiveCallTypeBG" /><p style="display:inline; margin-left:5px;">Call Type Background</p></div><div><input type="text" id="inactiveCallTypeFG" /><p style="display:inline; margin-left:5px;">Call Type Foreground</p></div></div></div><br /><br /><div class="bbqPreviewParentContainer"><div class="bbqPreviewContainer"><div class="bbqPreviewContainerTitle">Active Queue Preview</div><div class="bbq"><div class="bbqContainer" id="Active"><div class="bbqProduct" id="BBIS"><strong>BBIS</strong><div class="bbqQueue" id="CL"><strong>CL</strong>0|<strong>0:00:00</strong></div><div class="bbqQueue" id="PH"><strong>PH</strong>0|<strong>0:00:00</strong></div></div></div></div><br /><div><input type="text" id="activeCallTypeBG" /><p style="display:inline; margin-left:5px;">Call Type Background</p></div><div><input type="text" id="activeCallTypeFG" /><p style="display:inline; margin-left:5px;">Call Type Foreground</p></div></div></div><br /><br /><div class="bbqPreviewParentContainer"><div class="bbqPreviewContainer"><div class="bbqPreviewContainerTitle">Extended Queue Preview</div><div class="bbq"><div class="bbqContainer" id="Extended"><div class="bbqProduct" id="BBIS"><strong>BBIS</strong><div class="bbqQueue" id="CL"><strong>CL</strong>0|<strong>0:00:00</strong></div><div class="bbqQueue" id="PH"><strong>PH</strong>0|<strong>0:00:00</strong></div></div></div></div><br /><div><input type="text" id="extendedCallTypeBG" /><p style="display:inline; margin-left:5px;">Call Type Background</p></div><div><input type="text" id="extendedCallTypeFG" /><p style="display:inline; margin-left:5px;">Call Type Foreground</p></div></div></div><br /><br /></section></div></div><div id="footer" style="height: 32px"><input type="button" id="userOptionsSubmitButton" value="Submit" style="float:right;margin-right:2.5%" /><div id="status"></div></div></div>');

            $("#wizard").steps({
                headerTag: "h2",
                enableFinishButton: false,
                enablePagination: false,
                enableAllSteps: true,
                bodyTag: "section",
                transitionEffect: "slideLeft",
                stepsOrientation: "vertical",
                titleTemplate: "#title#"

            });

            $('#userOptionsSubmitButton').click(hosemann.vars.userOptionsSendButtonEvent);
        },
        buildSubscriptions: function () {
            var i;
            var products = hosemann.vars.Products;
            var subscriptions = hosemann.vars.Subscriptions;

            var tempSubscriptions = [];

            $('#subscriptions').html('');
            for (i = 0; i < subscriptions.length; ++i) {
                tempSubscriptions[subscriptions[i].ProductID] = subscriptions[i].CallTypeID;
            }

            for (i = 0; i < products.length; ++i) {
                var temp = products[i].ID;
                if (typeof tempSubscriptions[temp] !== "undefined")
                    $('#subscriptions').append('<li><label for="' + products[i].ID + '"><input type="checkbox" name="products[]" class="product" id="' + products[i].ID + '" checked />' + products[i].Name + '</label></li>');
                else
                    $('#subscriptions').append('<li><label for="' + products[i].ID + '"><input type="checkbox" name="products[]" class="product" id="' + products[i].ID + '" />' + products[i].Name + '</label></li>');
            }
            hosemann.utilities.multipleSelection(); // Turns the list into a list of checkboxes.
        },
        buildInitialSetup: function () {
            $('input[name=BusinessUnit]').val(hosemann.vars.BusinessUnit);
            $('input[name=CiscoExtension]').val(hosemann.vars.CiscoExtension);
            $('input[name=BluePumpkinUsername]').val(hosemann.vars.BluePumpkinUsername);
        },
        buildVisuals: function () {
            hosemann.userOptions.visualsUpdateColors();
            hosemann.userOptions.visualsColorPicker();
        },
        visualsUpdateColors: function () {
            $('.bbq').css('background-color', hosemann.vars.applicationBG);
            $('.bbqContainer').css('border-color', hosemann.vars.applicationBG);
            $('.bbqQueue').css('border-color', hosemann.vars.applicationBG);
            $('.bbqProduct').css('background-color', hosemann.vars.queueBG);
            $('.bbqProduct').css('color', hosemann.vars.queueFG);
            $('#Inactive .bbqQueue').css('background-color', hosemann.vars.inactiveCallTypeBG);
            $('#Inactive .bbqQueue').css('color', hosemann.vars.inactiveCallTypeFG);
            $('#Active .bbqQueue').css('background-color', hosemann.vars.activeCallTypeBG);
            $('#Active .bbqQueue').css('color', hosemann.vars.activeCallTypeFG);
            $('#Extended .bbqQueue').css('background-color', hosemann.vars.extendedCallTypeBG);
            $('#Extended .bbqQueue').css('color', hosemann.vars.extendedCallTypeFG);
        },
        visualsColorPicker: function () {
            // Note: I'm sure this could be abstracted, but whatever, it's 11:30PM...
            setTimeout(function () {
                $("#applicationBG").spectrum({
                    color: hosemann.vars.applicationBG,
                    clickoutFiresChange: true,
                    move: function (color) {
                        $('.bbq').css('background-color', color.toHexString());
                        $('.bbqContainer').css('border-color', color.toHexString());
                        $('.bbqQueue').css('border-color', color.toHexString());
                    },
                    change: function (color) {
                        hosemann.vars.applicationBG = color.toHexString();
                    }
                });
                $("#queueBG").spectrum({
                    color: hosemann.vars.queueBG,
                    clickoutFiresChange: true,
                    move: function (color) {
                        $('.bbqProduct').css('background-color', color.toHexString());
                    },
                    change: function (color) {
                        hosemann.vars.queueBG = color.toHexString();
                    }
                });
                $("#queueFG").spectrum({
                    color: hosemann.vars.queueFG,
                    clickoutFiresChange: true,
                    move: function (color) {
                        $('.bbqProduct').css('color', color.toHexString());
                    },
                    change: function (color) {
                        hosemann.vars.queueFG = color.toHexString();
                    }
                });
                $("#inactiveCallTypeBG").spectrum({
                    color: hosemann.vars.inactiveCallTypeBG,
                    clickoutFiresChange: true,
                    move: function (color) {
                        $('#Inactive .bbqQueue').css('background-color', color.toHexString());
                    },
                    change: function (color) {
                        hosemann.vars.inactiveCallTypeBG = color.toHexString();
                    }
                });
                $("#inactiveCallTypeFG").spectrum({
                    color: hosemann.vars.inactiveCallTypeFG,
                    clickoutFiresChange: true,
                    move: function (color) {
                        $('#Inactive .bbqQueue').css('color', color.toHexString());
                    },
                    change: function (color) {
                        hosemann.vars.inactiveCallTypeFG = color.toHexString();
                    }
                });
                $("#activeCallTypeBG").spectrum({
                    color: hosemann.vars.activeCallTypeBG,
                    clickoutFiresChange: true,
                    move: function (color) {
                        $('#Active .bbqQueue').css('background-color', color.toHexString());
                    },
                    change: function (color) {
                        hosemann.vars.activeCallTypeBG = color.toHexString();
                    }
                });
                $("#activeCallTypeFG").spectrum({
                    color: hosemann.vars.activeCallTypeFG,
                    clickoutFiresChange: true,
                    move: function (color) {
                        $('#Active .bbqQueue').css('color', color.toHexString());
                    },
                    change: function (color) {
                        hosemann.vars.activeCallTypeFG = color.toHexString();
                    }
                });
                $("#extendedCallTypeBG").spectrum({
                    color: hosemann.vars.extendedCallTypeBG,
                    clickoutFiresChange: true,
                    move: function (color) {
                        $('#Extended .bbqQueue').css('background-color', color.toHexString());
                    },
                    change: function (color) {
                        hosemann.vars.extendedCallTypeBG = color.toHexString();
                    }
                });
                $("#extendedCallTypeFG").spectrum({
                    color: hosemann.vars.extendedCallTypeFG,
                    clickoutFiresChange: true,
                    move: function (color) {
                        $('#Extended .bbqQueue').css('color', color.toHexString());
                    },
                    change: function (color) {
                        hosemann.vars.extendedCallTypeFG = color.toHexString();
                    }
                });
            }, 1000);
        },
        systemStatusMessage: function (message) {
            var encodedMsg = $('<div />').text(message).html();
            $('#status').html('<strong>' + encodedMsg + '</strong>');
            setTimeout(function () {
                $('status').html('');
            }, 4000);
        },
        updateColor: function (selectorText, color, previousColor) {
            for (var ssIdx = 0; ssIdx < document.styleSheets.length; ssIdx++) {
                var ss = document.styleSheets[ssIdx];
                var rules = ss.cssRules || ss.rules;
                var h1Rule = null;
                for (var ruleIdx = 0; ruleIdx < rules.length; ruleIdx++) {
                    var rule = rules[ruleIdx];
                    if (rule.selectorText == selectorText) {
                        if (rule.style.color == previousColor)
                            if (rule.style.color == previousColor)
                                rule.style.color = value;
                            else if (rule.style.background = previousColor)
                                rule.style.background = value;
                        return;
                    }
                }
            }
        },
        updateAllColors: function () {
            var randomColor;
            var rand = hosemann.utilities.randomIntFromInterval(120, 150);
            randomColor = hosemann.utilities.randColor(rand);
            this.updateColor('.randomcolor', randomColor, hosemann.vars.previousColor);
            hosemann.vars.previousColor = randomColor;
        }
    },
    utilities: {
        urlVars: {},
        createTableView: function (objArray, theme, enableHeader) {
            // set optional theme parameter
            if (theme === undefined) {
                theme = 'mediumTable'; //default theme
            }

            if (enableHeader === undefined) {
                enableHeader = true; //default enable headers
            }

            // If the returned data is an object do nothing, else try to parse
            var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

            var str = '<table class="' + theme + '">';

            // table head
            if (enableHeader) {
                str += '<thead><tr>';
                for (var index in array[0]) {
                    str += '<th scope="col">' + index + '</th>';
                }
                str += '</tr></thead>';
            }

            // table body
            str += '<tbody>';
            for (var i = 0; i < array.length; i++) {
                str += (i % 2 == 0) ? '<tr class="alt">' : '<tr>';
                for (var index in array[i]) {
                    str += '<td>' + array[i][index] + '</td>';
                }
                str += '</tr>';
            }
            str += '</tbody>'
            str += '</table>';
            return str;
        },
        getUrlVars: function () {
            // Gets variables and values from URL
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
                vars[key] = unescape(value.replace(/\+/g, " "));
            });
            return vars;
        },
        modifyString: function (str, addition, position) {
            return [str.slice(0, position), addition, str.slice(position)].join('');
        },
        multipleSelection: function () {
            // All credit goes to Joe Lanman for this awesome solution.
            //http://joelanman.com/static/examples/multiple_selection/

            // make sure labels are drawn in the correct state
            $('label').each(function () {
                if ($(this).find(':checkbox').attr('checked'))
                    $(this).addClass('selected');
            });
            // toggle label css when checkbox is clicked
            $(':checkbox').click(function (e) {
                var checked = $(this).attr('checked');
                $(this).closest('label').toggleClass('selected', checked);
            });
        },
        randomIntFromInterval: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        },
        randHex: function (multiplier) {
            // Multiplier can be 0-255, lower = darker
            return (Math.floor(Math.random() * 56) + multiplier).toString(16);
        },
        randColor: function (multiplier) {
            return randHex(multiplier) + "" + randHex(multiplier) + "" + randHex(multiplier);
        },
        hexToRGB: function (value) {
            //http://www.javascripter.net/faq/hextorgb.htm
            R = hexToR(value);
            G = hexToG(value);
            B = hexToB(value);

            function hexToR(h) { return parseInt((cutHex(h)).substring(0, 2), 16) }
            function hexToG(h) { return parseInt((cutHex(h)).substring(2, 4), 16) }
            function hexToB(h) { return parseInt((cutHex(h)).substring(4, 6), 16) }
            function cutHex(h) { return (h.charAt(0) == "#") ? h.substring(1, 7) : h }

            return 'rgb({0}, {1}, {2})'.f(R, G, B);
        }
    } //end utilities
}; // end hosemann
// Functions to run each time the page loads
$(document).ready(function () {
    hosemann.casetherapist.pageLoad();
});

//global functions

// String.Format (aliaed to .f)
// usage: 'Added {0} by {1} to your collection'.f(title, artist)
// credit: http://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery
String.prototype.format = String.prototype.f = function () {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};