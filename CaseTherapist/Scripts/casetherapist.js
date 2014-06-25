// Had to remove the follow line for IE8 Support
// var hosemann, $;

hosemann = {
    vars: {
        view: "",
        //user details:
        param: "",
        businessUnit: "ecbu",
        ciscoExtension: "",
        bluePumpkinUsername: "",
        subscriptions: [],
        userDetails: {},
        // functionality toggling
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
        // BBQ color periods (in seconds)
        extendedTimeTrigger: 120,
        // global application vars        
        products: [],
        requirePassword: false,
        userOptionsSendButtonEvent: "",
        // use random color for fun (to be implemented later)
        previousColor: "#1F6D9B",
        fullpath: "",
        origin: "",
        debug: false,
        pwd: ""
    },
    signalR: function () {
        hosemann.vars.queueBroadcastProxy = $.connection.queueBroadcastHub;
        hosemann.vars.userOptionsProxy = $.connection.userOptionsHub;
        hosemann.vars.adminProxy = $.connection.adminHub;
        var queueBroadcastProxy = $.connection.queueBroadcastHub;
        var userOptionsProxy = $.connection.userOptionsHub;
        var adminProxy = $.connection.adminHub;
        var productList = [];

        /*   CLIENT FUNCTIONS   */
        // Status Message Response
        queueBroadcastProxy.client.status = function (message) {
            hosemann.userOptions.systemStatusMessage(message);
        };

        userOptionsProxy.client.clientConsole = function (message) {
            hosemann.utilities.trace(message);
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
        };

        // Pulls all UserOptions
        if (hosemann.vars.userOptions && hosemann.vars.view != 'tam' && hosemann.vars.view != 'site') {
            userOptionsProxy.client.getData = function (products, userDetails, subscriptions) {
                hosemann.vars.products = products;
                hosemann.vars.subscriptions = subscriptions;

                if (userDetails.BusinessUnit !== null)
                    hosemann.vars.businessUnit = userDetails.BusinessUnit.toLowerCase();

                if (userDetails.CiscoExtension !== null)
                    hosemann.vars.ciscoExtension = userDetails.CiscoExtension;

                if (userDetails.BluePumpkinUsername !== null)
                    hosemann.vars.bluePumpkinUsername = userDetails.BluePumpkinUsername.toLowerCase();

                if (userDetails.ApplicationBG !== null) {
                    hosemann.vars.applicationBG = userDetails.ApplicationBG;
                    hosemann.vars.queueBG = userDetails.QueueBG;
                    hosemann.vars.queueFG = userDetails.QueueFG;
                    hosemann.vars.inactiveCallTypeBG = userDetails.InactiveCallTypeBG;
                    hosemann.vars.inactiveCallTypeFG = userDetails.InactiveCallTypeFG;
                    hosemann.vars.activeCallTypeBG = userDetails.ActiveCallTypeBG;
                    hosemann.vars.activeCallTypeFG = userDetails.ActiveCallTypeFG;
                    hosemann.vars.extendedCallTypeBG = userDetails.ExtendedCallTypeBG;
                    hosemann.vars.extendedCallTypeFG = userDetails.ExtendedCallTypeFG;
                    hosemann.vars.userDetails = userDetails;
                }

                for (var i = 0; i < subscriptions.length; ++i) {
                    queueBroadcastProxy.server.joinRoom(subscriptions[i].ProductID);
                }
            };
        }

        // Queue Monitor Broadcast
        queueBroadcastProxy.client.updateProductQueue = function (product, productID, callType, quantity, waitTime) {
            var waitTimeArray = waitTime.split(':');
            var waitTimeSeconds = parseInt(waitTimeArray[0] * 60 * 60) + parseInt(waitTimeArray[1] * 60) + parseInt(waitTimeArray[2]);
            var background = hosemann.vars.inactiveCallTypeBG;
            var color = hosemann.vars.inactiveCallTypeFG;

            if (quantity > 0 && waitTimeSeconds < 120) {

                background = hosemann.vars.activeCallTypeBG;
                color = hosemann.vars.activeCallTypeFG;
            }
            else if (quantity > 0 && waitTimeSeconds >= 120) {
                background = hosemann.vars.extendedCallTypeBG;
                color = hosemann.vars.extendedCallTypeFG;
            }

            $('.header #bbq').css('background', hosemann.vars.applicationBG);

            if ($('.header #bbq .bbqContainer>#{0}'.f(product)).length <= 0) {
                $('.header #bbq .bbqContainer').append('<div class="bbqProduct" id="{0}" style="background:{1};color:{2};"><strong>{0}</strong></div>'.f(product, hosemann.vars.queueBG, hosemann.vars.queueFG));
            }
            if ($('.header #bbq .bbqContainer>#{0}>#{1}'.f(product, callType)).length > 0) {
                $('.header #bbq .bbqContainer>#{0}>#{1}'.f(product, callType)).html('<strong>{0}</strong>{1}|<strong>{2}</strong>'.f(callType, quantity, waitTime));
            }
            else {
                $('.header #bbq .bbqContainer>#{0}'.f(product)).append('<div class="bbqQueue" id="{0}"><strong>{0}</strong>{1}|<strong>{2}</strong></div>'.f(callType, quantity, waitTime));
            }

            $('.header #bbq .bbqContainer>#{0}>#{1}'.f(product, callType)).css('background', background).attr('color', color);
        };

        // Queue Status Broadcast
        queueBroadcastProxy.client.updateAllProductQueue = function (callTypeDetailModel) {
            var combinedQueueData = [];
            var queueData = [];

            var ie8sucks = callTypeDetailModel;

            for (i = 0; i < ie8sucks.length; i++) {
                var background = "transparent";
                var color = "#444";

                if (ie8sucks[i].WaitTime != "0:00:00") {
                    var waitTimeArray = ie8sucks[i].WaitTime.split(':');
                    var waitTimeSeconds = parseInt(waitTimeArray[0] * 60 * 60) + parseInt(waitTimeArray[1] * 60) + parseInt(waitTimeArray[2]);
                    if (ie8sucks[i].Quantity > 0 && waitTimeSeconds < 120) {

                        background = hosemann.vars.activeCallTypeBG;
                        color = hosemann.vars.activeCallTypeFG;
                    }
                    else if (ie8sucks[i].Quantity > 0 && waitTimeSeconds >= 120) {
                        background = hosemann.vars.extendedCallTypeBG;
                        color = hosemann.vars.extendedCallTypeFG;
                    }
                }

                // Changed from Regex to Length (assumes CallTypeIDs will be 4 digits in length)
                if (ie8sucks[i].CallTypeID.length > 5) {
                    if ($('#combinedQueueStatusContainer ol li#{0}'.f(ie8sucks[i].CallTypeID)).length === 0) {
                        // New Combined Queue Header Row
                        $('#combinedQueueStatusContainer ol').append('<li id="{0}" class="combined"><ul class="stats-tabs"></ul></li>'.f(ie8sucks[i].CallTypeID));
                    }
                    else {
                        // Update Combined Queue Rows
                        $('li[id={0}][class="combined"] ul'.f(ie8sucks[i].CallTypeID)).html('<li class="grid0">{0}</li><li class="grid1">{1}</li><li class="grid2">{2}</li><li class="grid3">{3}</li><li class="grid4">{4}</li><li class="grid5">{5}</li><li class="grid6">{6}</li><li class="grid7">{7}</li><li class="grid8">{8}</li><li class="grid9">{9}</li><li class="grid10">{10}</li><li class="grid11">{11}</li>'.f($.trim(ie8sucks[i].Product), ie8sucks[i].CallType, ie8sucks[i].Quantity, ie8sucks[i].WaitTime, ie8sucks[i].Offered, ie8sucks[i].Handled, ie8sucks[i].SLAbandoned, ie8sucks[i].PercentLive, ie8sucks[i].AverageAnswer, ie8sucks[i].HandleTime, ie8sucks[i].TalkTime, ie8sucks[i].ServiceLevel));
                        $('li[id={0}][class="combined"] ul'.f(ie8sucks[i].CallTypeID)).css('background-color', background).css('color', color);
                    }
                }
                else {
                    if ($('#singleQueueStatusContainer ol li#{0}'.f(ie8sucks[i].CallTypeID)).length === 0) {
                        // New Single Queue Row
                        $('#singleQueueStatusContainer ol').append('<li id="{0}" class="single"><ul class="stats-tabs"></ul></li>'.f(ie8sucks[i].CallTypeID));
                    }
                    else {
                        // Update Single Queue Row
                        $('li[id={0}][class="single"] ul'.f(ie8sucks[i].CallTypeID)).html('<li class="grid0">{0}</li><li class="grid1">{1}</li><li class="grid2">{2}</li><li class="grid3">{3}</li><li class="grid4">{4}</li><li class="grid5">{5}</li><li class="grid6">{6}</li><li class="grid7">{7}</li><li class="grid8">{8}</li><li class="grid9">{9}</li><li class="grid10">{10}</li><li class="grid11">{11}</li>'.f($.trim(ie8sucks[i].Product), ie8sucks[i].CallType, ie8sucks[i].Quantity, ie8sucks[i].WaitTime, ie8sucks[i].Offered, ie8sucks[i].Handled, ie8sucks[i].SLAbandoned, ie8sucks[i].PercentLive, ie8sucks[i].AverageAnswer, ie8sucks[i].HandleTime, ie8sucks[i].TalkTime, ie8sucks[i].ServiceLevel));
                        $('li[id={0}][class="single"] ul'.f(ie8sucks[i].CallTypeID)).css('background-color', background).css('color', color);
                    }
                }

                if ($('#queueSelection').children().length == 2) {
                    productList.push(ie8sucks[i].Product.match(/^[A-Za-z]+/).toString());
                }
            }

            if ($('#queueSelection').children().length == 2) {
                if (productList.length > 0) {
                    var distinctProdList = hosemann.bbq.utilities.distinctString(productList);

                    for (i = 0; i < distinctProdList.length; i++) {
                        $('#queueSelection').append('<input class="productListFilter" id={0} type="checkbox">{0}<br/>'.f(distinctProdList[i]));
                    }

                    $('.productListFilter').change(function (object) {
                        if ($('#selectAllFilter:checked').length > 0)
                            $('#selectAllFilter:checked').prop('checked', false);
                        hosemann.bbq.updateView();
                    });
                }
            }
        };

        // Admin Hub Begin
        adminProxy.client.response_AdminUser = function (bool) {
            if (bool == 'true')
                hosemann.admin.buildIcon();
        };

        adminProxy.client.response_GetProductData = function (products) {
            var html;
            if (products.length > 0) {
                for (var i = 0; i < products.length; i++) {
                    html = '<h2 id="{0}">{1}</h2><section><div id="{0}" class="wizardAdmin_CallTypeRowContainer"><ol class="admin_header"><li><div class="actions"><i class="fa fa-plus-square-o" onclick="hosemann.admin.buttonEvents($(this));"></i></div></li><li>CallTypeID</li><li>CallType</li><li>IsDisabled</li></ol></div></section>'.f(products[i].ID, products[i].Name);
                    $('#wizardAdmin').append(html);
                }
            }
        };

        adminProxy.client.response_GetCallTypeData = function (callTypes) {
            if (callTypes.length > 0) {
                for (var i = 0; i < callTypes.length; i++) {
                    hosemann.admin.addCallType(callTypes[i]);
                }
            }
        };

        adminProxy.client.response_InsertProduct = function (productID, name) {
            productID = productID.ID;

            $("#addproduct-dialog-form").dialog('destroy');
            $("#addproduct-dialog-form").remove();

            $('#wizardAdmin').steps('add', {
                title: name,
                content: '<div id="{0}" class="wizardAdmin_CallTypeRowContainer"><ol class="admin_header"><li><div class="actions"><i class="fa fa-plus-square-o" onclick="hosemann.admin.buttonEvents($(this));"></i></div></li><li>CallTypeID</li><li>CallType</li><li>IsDisabled</li></ol></div>'.f(productID)
            });

            $('ul[role=tablist]>li:last').each(function () {
                var _href = $(this).children('a').attr('href');
                var _prodID = $('h2{0}'.f(_href)).next().find('div.wizardAdmin_CallTypeRowContainer').attr('id');
                $(this).attr('ProductID', _prodID);

                if (_prodID == productID) {
                    $(this).prepend('<div class="wizardAdmin_RemoveProductContainer" onclick="hosemann.admin.buttonEvents($(this));"><i class="fa fa-ban" style=""></i></div>');
                }
            });
        };

        adminProxy.client.response_InsertCallType = function (results) {
            $('#cellTypeNew').remove();
            hosemann.admin.addCallType(results);
        };

        adminProxy.client.response_RemoveProduct = function (productID) {
            var _temp = $('li[ProductID={0}]'.f(productID)).index();
            $('#wizardAdmin').steps('remove', _temp);
        };

        adminProxy.client.response_RemoveCallType = function (ID) {
            $('i.fa-minus-square-o[ctid={0}]'.f(ID)).parents('ol').remove();
            //$('ol#{0}'.f(ID)).remove();
        };

        adminProxy.client.response_ValidatePassword = function (isValid) {
            if (isValid) {
                var pwd = $('div#admin-dialog-form #thispass').val();
                hosemann.vars.pwd = pwd;
                $('div#ctadmin-dialog-form').dialog("destroy");
                $('div#ctadmin-dialog-form').remove();
            }
            else {
                $('div#admin-dialog-form #thispass').val('');
                alert("Incorrect password. Instance logged.");
            }
        };

        // Admin Hub End

        /*   SERVER FUNCTIONS   */
        // Error handling
        $.connection.hub.error(function (error) {
            hosemann.utilities.trace('SignalR error: ' + error);
        });

        // Start the connection.
        $.connection.hub.start().done(function () {

            if (hosemann.vars.param !== "") {
                userOptionsProxy.server.getData(hosemann.vars.param);
            }

            if (hosemann.vars.view == "analyst" || hosemann.vars.view == "supervisor" && hosemann.vars.param !== "")
                adminProxy.server.server_IsUserAdmin(hosemann.vars.param);

            hosemann.vars.userOptionsSendButtonEvent = function () {
                var userDetails = {};
                var subscriptions = [];
                var clarifyPassword;

                //Initial Settings
                userDetails.ClarifyUsername = hosemann.vars.param;
                userDetails.CiscoExtension = $('input[name=CiscoExtension]').val();
                userDetails.BusinessUnit = $('input[name=BusinessUnits]:checked').val();
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
                    $('#userOptionsSubmitButton').append('<div id="userOptions-dialog-form" title="Clarify password required."><form><fieldset><label for="clarifyPassword">To save changes to your user options, please enter your Clarify password.</label><input type="password" name="clarifyPassword" id="clarifyPassword" class="text ui-widget-content ui-corner-all" /></fieldset></form></div>');

                    $("#userOptions-dialog-form").dialog({
                        autoOpen: true,
                        modal: true,
                        buttons: {
                            "Submit": function () {
                                hosemann.userOptionsProxy.server.setData(userDetails, subscriptions, clarifyPassword).done(function () {
                                    hosemann.userOptions.systemStatusMessage('Successfully updated settings');
                                }).fail(function (error) {
                                    hosemann.userOptions.systemStatusMessage('Failed updating settings');
                                    hosemann.utilities.trace('Failure setting data.  Error:' + error);
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
                        hosemann.utilities.trace('Failure setting data.  Error:' + error);
                    });
                }
            };
        });
    },
    casetherapist: {
        pageLoad: function () {
            $.support.cors = true;

            hosemann.utilities.buildPath();

            if (hosemann.vars.caseTherapist === false) {
                $('body').text('A critical failure has occurred.  Disabling CaseTherapist.');
                return;
            }

            hosemann.casetherapist.custom.setParam();
            hosemann.casetherapist.custom.setView();
            hosemann.casetherapist.preloadAssets();

            hosemann.signalR();


            if (hosemann.vars.param === "") {
                this.getMissingParameter();
            }
            else if (hosemann.vars.view == "analyst" || hosemann.vars.view == "supervisor" && hosemann.vars.param !== "") {
                var path = '{0}hapi/Users?param={1}'.f(hosemann.vars.origin, hosemann.vars.param.toLowerCase());
                var getUser = $.getJSON(path, function () { });
                $.when(getUser).done(
                    function (user) {
                        // If user details are already in database.
                        if (user !== null) {
                            hosemann.vars.businessUnit = user.BusinessUnit.toLowerCase();
                            hosemann.casetherapist.views.startViews();

                            hosemann.userOptions.buildIcon();

                            // hosemann.signalR();


                            if (hosemann.vars.queueActivity) {
                                hosemann.casetherapist.cisco.loadCADMonitor();
                            }

                            if (!hosemann.utilities.isOldIE() || hosemann.vars.param.toLowerCase() == 'josephho') {
                                // Queue Summary is effectively broken in IE8.
                                hosemann.casetherapist.isOldIE();
                                hosemann.bbq.buildIcon();
                            }
                            else {
                                hosemann.casetherapist.isOldIE();
                            }
                        }
                            // If the user details aren't in the database.
                        else if (user === null && hosemann.vars.view != 'tam' && hosemann.vars.view != 'site') {
                            // Requires timeout to let all functions load.
                            setTimeout(function () {
                                hosemann.userOptions.buildIcon();
                                hosemann.userOptions.buildHtml();

                                // Brings up the UserOptionsPanel automatically.
                                $.fancybox({
                                    href: '#userOptionsPanel',
                                    minWidth: 700,
                                    minHeight: 500
                                });

                                // hosemann.signalR();
                            }, 1000);

                        }
                        else if (hosemann.vars.view == 'tam' && hosemann.vars.view == 'site') {
                            // Turn off User Details and Queue Activity for Sites and Tams
                            hosemann.vars.userDetails = false;
                            hosemann.vars.queueActivity = false;
                        }
                    }
                );
            }
            else {
                hosemann.casetherapist.views.startViews();
            }
            hosemann.utilities.analytics();
        },
        preloadAssets: function () {

        },
        isOldIE: function () {
            var _isOldIE = hosemann.utilities.isOldIE();
            if (_isOldIE) {
                $('.header').prepend('<div class="headernotification">!! Some features will not work with IE 8 or 9.  Please use <a href="http://chrome.google.com">Chrome</a> with <a href="http://www.ietab.net/">IETab.net</a> instead !!</div>');
            }
        },
        getMissingParameter: function () {
            var label = "Clarify Username:";

            if (hosemann.vars.view == "site" || hosemann.vars.view == "tam")
                label = "Client Site ID:";

            $('.default').html('<div id="dialog-form" title="Parameter missing..."><form><fieldset><label for="param">{0}</label><input type="text" name="param" id="param" class="text ui-widget-content ui-corner-all" /></fieldset></form></div>'.f(label));

            $(".default #dialog-form").dialog({
                autoOpen: true,
                modal: true,
                buttons: {
                    "Submit": function () {
                        window.location.replace("{0}?param={1}".f(hosemann.vars.fullpath, $('input#param').val()));
                    }
                }
            });
            $(".ui-dialog-titlebar-close", this.parentNode).hide();
        },
        cisco: {
            loadCADMonitor: function () {
                if (hosemann.vars.view != 'analyst' || hosemann.vars.param === '') {
                    hosemann.vars.queueActivity = false;
                }
                else if (hosemann.vars.queueActivity) {
                    hosemann.casetherapist.cisco.agentDesktopMonitor();
                    setInterval(function () {
                        hosemann.casetherapist.cisco.checkCADMonitor();
                    }, 5000);
                }
            },
            checkCADMonitor: function () {
                if (hosemann.vars.queueActivity) {
                    hosemann.casetherapist.cisco.agentDesktopMonitor();
                }
            },
            agentDesktopMonitor: function () {
                $.getJSON('{0}hapi/QueueActivity?username={1}'.f(hosemann.vars.origin, hosemann.vars.param), function () { })
                    .fail(function () {
                        hosemann.vars.queueActivity = false;
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
                        else {
                            hosemann.vars.queueActivity = false;
                        }
                    });
            }
        },
        custom: {
            setParam: function () {
                var urlVars = hosemann.utilities.getUrlVars();

                if (typeof urlVars.user != 'undefined') {
                    hosemann.vars.param = urlVars.user.toLowerCase();
                } else if (typeof urlVars.param != 'undefined') {
                    hosemann.vars.param = urlVars.param.toLowerCase();
                }

            },
            setView: function () {
                var view = "";

                if (window.location.href.match(/team/i))
                    view = "supervisor";
                else if (window.location.href.match(/site/i))
                    view = "site";
                else if (window.location.href.match(/tams/i))
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
                        if (rowData.Contacted == 2) {
                            highlightClass = 'contact2';
                        } else if (rowData.Contacted == 3) {
                            highlightClass = 'contact3';
                        } else if (rowData.Contacted == 4) {
                            highlightClass = 'contact4';
                        } else if (rowData.Contacted == 5) {
                            highlightClass = 'contact5';
                        } else if (rowData.Contacted >= 6) {
                            highlightClass = 'contact6';
                        }
                    }

                    // clears all existing styling
                    defaulthtml = defaulthtml.toString().replace(/\sstyle="[\w\d\;\-\:\s]+"/i, "");
                    // applies new styling
                    defaulthtml = [defaulthtml.slice(0, 4), ' style="height:100%;padding-top:5px;"', defaulthtml.slice(4)].join('');
                    var res;
                    switch (columnproperties.classname) {
                        case "colheaderIcons":
                            if (highlightClass.length > 0) return '<div class=\"icon {0}\" style=\"height:100%;padding-top:5px;text-align:right; padding-right: 5px;\"><img src="{1}images/icon_important.png" style=""></div>'.f(highlightClass, hosemann.vars.origin);
                            break;
                        case "colheaderWI":
                            res = '<div class=\"{0}\" style=\"text-align:center;height:100%;padding-top:5px;\"><a target=\"_blank\" href=\"https://tfs.blackbaud.com/tfs/DefaultCollection/Infinity/_workitems#_a=edit&id={1}\">{2}</a></div>'.f(highlightClass, rowData.WI, value);
                            return res;
                        case "colheaderIssueWI":
                            res = '<div class=\"{0}\" style=\"text-align:center;height:100%;padding-top:5px;\"><a target=\"_blank\" href=\"https://tfs.blackbaud.com/tfs/DefaultCollection/Infinity/_workitems#_a=edit&id={1}\">{2}</a></div>'.f(highlightClass, rowData.WI, value);
                            return res;
                        case "colheaderCaseTitle":
                            res = '<div class=\"{0}\" style=\"padding-left:5px;height:100%;padding-top:5px;\"><a class="various fancybox.iframe" href=\"http://bbecweb/casedetails.php?id={1}\">{2}</a></div>'.f(highlightClass, rowData.id_number, value);
                            return res;
                        case "colheaderTitle":
                            res = '<div class=\"{0}\" style=\"padding-left:5px;height:100%;padding-top:5px;\"><a class="various fancybox.iframe" href=\"http://bbecweb/casedetails.php?id={1}\">{2}</a></div>'.f(highlightClass, rowData.CASEID, value);
                            return res;
                        case "colheaderCustomer":
                            defaulthtml = hosemann.utilities.modifyString(defaulthtml, 'padding-left: 5px; ', parseInt(defaulthtml.toString().indexOf("style=") + 7));
                            return hosemann.utilities.modifyString(defaulthtml, 'class=\"' + highlightClass + '\" ', parseInt(defaulthtml.toString().indexOf("style=")));

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

                        case "colheaderStatus":
                            defaulthtml = hosemann.utilities.modifyString(defaulthtml, 'padding-left: 5px; ', parseInt(defaulthtml.toString().indexOf("style=") + 7));
                            return hosemann.utilities.modifyString(defaulthtml, 'class=\"' + highlightClass + '\" ', parseInt(defaulthtml.toString().indexOf("style=")));

                        case "colheaderWIPBin":
                            defaulthtml = hosemann.utilities.modifyString(defaulthtml, 'padding-left: 5px; ', parseInt(defaulthtml.toString().indexOf("style=") + 7));
                            res = defaulthtml.toString().replace(/\d+\s/i, "");
                            return hosemann.utilities.modifyString(res, 'class=\"' + highlightClass + '\" ', parseInt(res.toString().indexOf("style=")));

                        default:
                            // provides a list of columns that will be centered
                            var centeredColumns = ["colheaderCaseNum", "colheaderSeverity", "colheaderUpdated", "colheaderProduct", "colheaderCaseAge", "colheaderDaysOwned"];
                            if ($.inArray(columnproperties.classname, centeredColumns) > -1) {
                                defaulthtml = hosemann.utilities.modifyString(defaulthtml, 'text-align: center; ', parseInt(defaulthtml.toString().indexOf("style=") + 7));
                            }
                            return hosemann.utilities.modifyString(defaulthtml, 'class=\"' + highlightClass + '\" ', parseInt(defaulthtml.toString().indexOf("style=")));

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
                        return { text: "Case Title", width: "400px", datafield: "TITLE", classname: "colheaderTitle", cellsrenderer: cellsrender };
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
                            source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Customer', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'WIPBin', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "NonWorkable") {
                            source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'WI', type: 'string' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Customer', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'WIPBin', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "IssueWI") {
                            source = { datatype: "json", datafields: [{ name: 'WI', type: 'string' }, { name: 'CASEID', type: 'string' }, { name: 'TITLE', type: 'string' }, { name: 'CLIENTNAME', type: 'string' }, { name: 'WISTATE', type: 'string' }, { name: 'WICLOSEREASON', type: 'string' }, { name: 'WIASSIGNTO', type: 'string' }, { name: 'CASESTATUS', type: 'string' }, { name: 'WICLOSEDATE', type: 'string' }, { name: 'ANALYST', type: 'string' }], id: 'CASEID', url: url, pagesize: 50 };
                        }
                        break;
                    case "supervisor":
                        if (type == "Workable") {
                            source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Customer', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwnerLogin', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'WIPBin', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "Resolved") {
                            source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Customer', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwnerLogin', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'WIPBin', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "NonWorkable") {
                            source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'WI', type: 'string' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Customer', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwnerLogin', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'WIPBin', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "IssueWI") {
                            source = { datatype: "json", datafields: [{ name: 'WI', type: 'string' }, { name: 'CASEID', type: 'string' }, { name: 'TITLE', type: 'string' }, { name: 'CLIENTNAME', type: 'string' }, { name: 'WISTATE', type: 'string' }, { name: 'WICLOSEREASON', type: 'string' }, { name: 'WIASSIGNTO', type: 'string' }, { name: 'CASESTATUS', type: 'string' }, { name: 'WICLOSEDATE', type: 'string' }, { name: 'ANALYST', type: 'string' }], id: 'CASEID', url: url, pagesize: 50 };
                        }
                        break;
                    case "site":
                        if (type == "Workable") {
                            source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Customer', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwnerLogin', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'WIPBin', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "Resolved") {
                            source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Customer', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwnerLogin', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'WIPBin', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "NonWorkable") {
                            source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'WI', type: 'string' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Customer', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwnerLogin', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'WIPBin', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "IssueWI") {
                            source = { datatype: "json", datafields: [{ name: 'WI', type: 'string' }, { name: 'CASEID', type: 'string' }, { name: 'TITLE', type: 'string' }, { name: 'CLIENTNAME', type: 'string' }, { name: 'WISTATE', type: 'string' }, { name: 'WICLOSEREASON', type: 'string' }, { name: 'WIASSIGNTO', type: 'string' }, { name: 'CASESTATUS', type: 'string' }, { name: 'WICLOSEDATE', type: 'string' }, { name: 'ANALYST', type: 'string' }], id: 'CASEID', url: url, pagesize: 50 };
                        }
                        break;
                    case "tam":
                        if (type == "Workable") {
                            source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'WI', type: 'string' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwner', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'CreatedDate', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }, { name: 'CaseCentralLink', type: 'string' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "Resolved") {
                            source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'WI', type: 'string' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwner', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'CreatedDate', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }, { name: 'CaseCentralLink', type: 'string' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "NonWorkable") {
                            source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'WI', type: 'string' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwner', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'CreatedDate', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }, { name: 'CaseCentralLink', type: 'string' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        else if (type == "IssueWI") {
                            source = { datatype: "json", datafields: [{ name: 'WI', type: 'string' }, { name: 'CASEID', type: 'string' }, { name: 'TITLE', type: 'string' }, { name: 'CLIENTNAME', type: 'string' }, { name: 'WISTATE', type: 'string' }, { name: 'WICLOSEREASON', type: 'string' }, { name: 'WIASSIGNTO', type: 'string' }, { name: 'CASESTATUS', type: 'string' }, { name: 'WICLOSEDATE', type: 'string' }, { name: 'ANALYST', type: 'string' }], id: 'CASEID', url: url, pagesize: 50 };
                        }
                        else if (type == "Closed") {
                            source = { datatype: "json", datafields: [{ name: 'id_number', type: 'int' }, { name: 'WI', type: 'string' }, { name: 'Severity', type: 'string' }, { name: 'CaseContact', type: 'string' }, { name: 'CaseTitle', type: 'string' }, { name: 'Updated', type: 'int' }, { name: 'Contacted', type: 'int' }, { name: 'ProductLine', type: 'string' }, { name: 'CaseOwner', type: 'string' }, { name: 'Status', type: 'string' }, { name: 'CreatedDate', type: 'string' }, { name: 'CaseAge', type: 'int' }, { name: 'DaysOwned', type: 'int' }, { name: 'CaseCentralLink', type: 'string' }], id: 'id_number', url: url, pagesize: 50 };
                        }
                        break;
                }
                return source;
            },
            buildTabs: function (name) {
                $('#jqxTabs>ul').append('<li>{0}</li>'.f(name));
                $('#jqxTabs').append('<div style="overflow: hidden;"><div id="jqxgrid{0}"></div></div>'.f(name));
            },
            startViews: function () {
                var bu = hosemann.vars.businessUnit.toLowerCase();
                var view = hosemann.vars.view.toLowerCase();
                var initWidgets = function (tab) {
                    if (tab === 0) {
                        hosemann.casetherapist.views.workable();
                    }
                    else if (tab == 1 && bu == 'ecbu') {
                        hosemann.casetherapist.views.resolved();
                    }
                    else if (tab == 1 && bu == 'gmbu') {
                        hosemann.casetherapist.views.nonWorkable();
                    }
                    else if (tab == 2 && bu == 'ecbu') {
                        hosemann.casetherapist.views.nonWorkable();
                    }
                    else if (tab == 2 && bu == 'gmbu') {
                        hosemann.casetherapist.views.issueWIs();
                    }
                    else if (tab == 3 && bu == 'ecbu') {
                        hosemann.casetherapist.views.issueWIs();
                    }
                    else if (tab == 3 && bu == 'gmbu' && view == 'supervisor') {
                        hosemann.casetherapist.views.summary();
                    }
                    else if (tab == 4 && bu == 'ecbu' && view == 'supervisor') {
                        hosemann.casetherapist.views.summary();
                    }
                };

                if (hosemann.vars.view != 'tam' && hosemann.vars.view != 'site')
                    $('.default').append('<div class="header"><div class="casetherapist" style="">case<strong>therapist</strong></div><div id="featureButtons"></div><div id="bbq" style="{0}"><div class="bbqContainer">&nbsp;</div></div></div>'.f(hosemann.vars.applicationBG));

                $('.default').append('<div id="jqxTabs"><ul></ul></div>');

                if (bu == 'ecbu') {
                    hosemann.casetherapist.views.buildTabs('Workable');
                    hosemann.casetherapist.views.buildTabs('Resolved');
                    hosemann.casetherapist.views.buildTabs('NonWorkable');
                    hosemann.casetherapist.views.buildTabs('IssueWI');
                    if (view == 'supervisor')
                        hosemann.casetherapist.views.buildTabs('Summary');
                }
                else if (bu == 'gmbu') {
                    hosemann.casetherapist.views.buildTabs('Workable');
                    hosemann.casetherapist.views.buildTabs('NonWorkable');
                    hosemann.casetherapist.views.buildTabs('IssueWI');
                    if (view == 'supervisor')
                        hosemann.casetherapist.views.buildTabs('Summary');
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
                var url = "{0}hapi/Cases/?type={1}&workable={2}&resolved={3}&param={4}&businessUnit={5}".f(hosemann.vars.origin, hosemann.vars.view, '1', '0', hosemann.vars.param, hosemann.vars.businessUnit);
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
                        $('.colheaderCreatedOn>div:first-child>div:first-child>span').html('<img src="{0}images/createdon.png" alt="Created On">'.f(hosemann.vars.origin));
                        $('.colheaderUpdated>div:first-child>div:first-child>span').html('<img src="{0}images/activity.png" alt="Activity">'.f(hosemann.vars.origin));
                        $('.colheaderContacted>div:first-child>div:first-child>span').html('<img src="{0}images/contacted.png" alt="Contacted">'.f(hosemann.vars.origin));
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
                        $('#pagerjqxgridWorkable>div').append('<input style="float: left; margin-left: 5px; padding: 1px 5px; font-size: .9em;" type="button" value="Export to CSV" id="csvExportWorkable" /><div id="version" style="width: 100%; text-align: center; font-size: 1em;">Developed by <a href="mailto:joseph.hosemann@blackbaud.com?subject=CaseTherapist">Joseph Hosemann</a> - Maintained by <a href="mailto:sort@blackbaud.com?subject=CaseTherapist">SORT</a> - 3.5 - <a id="aLegend" data-fancybox-type="iframe" href="http://bbecweb/legend.htm">Reporter Legend</a></div>');

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
                var url = "{0}hapi/Cases/?type={1}&workable={2}&resolved={3}&param={4}&businessUnit={5}".f(hosemann.vars.origin, hosemann.vars.view, '0', '0', hosemann.vars.param, hosemann.vars.businessUnit);
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
                        $('.colheaderCreatedOn>div:first-child>div:first-child>span').html('<img src="{0}images/createdon.png" alt="Created On">'.f(hosemann.vars.origin));
                        $('.colheaderUpdated>div:first-child>div:first-child>span').html('<img src="{0}images/activity.png" alt="Activity">'.f(hosemann.vars.origin));
                        $('.colheaderContacted>div:first-child>div:first-child>span').html('<img src="{0}images/contacted.png" alt="Contacted">'.f(hosemann.vars.origin));
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

                        $('#pagerjqxgridNonWorkable>div').append('<input style="float: left; margin-left: 5px; padding: 1px 5px; font-size: .9em;" type="button" value="Export to CSV" id="csvExportNonWorkable" /><div id="version" style="width: 100%; text-align: center; font-size: 1em;">Developed by <a href="mailto:joseph.hosemann@blackbaud.com?subject=CaseTherapist">Joseph Hosemann</a> - Maintained by <a href="mailto:sort@blackbaud.com?subject=CaseTherapist">SORT</a> - 3.5 - <a id="aLegend" data-fancybox-type="iframe" href="http://bbecweb/reporter/legend.htm">Reporter Legend</a></div>');
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
                var url = "{0}hapi/Cases/?type={1}&workable={2}&resolved={3}&param={4}&businessUnit={5}".f(hosemann.vars.origin, hosemann.vars.view, '-1', '1', hosemann.vars.param, hosemann.vars.businessUnit);
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
                        $('.colheaderCreatedOn>div:first-child>div:first-child>span').html('<img src="{0}images/createdon.png" alt="Created On">'.f(hosemann.vars.origin));
                        $('.colheaderUpdated>div:first-child>div:first-child>span').html('<img src="{0}images/activity.png" alt="Activity">'.f(hosemann.vars.origin));
                        $('.colheaderContacted>div:first-child>div:first-child>span').html('<img src="{0}images/contacted.png" alt="Contacted">'.f(hosemann.vars.origin));
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

                        $('#pagerjqxgridResolved>div').append('<input style="float: left; margin-left: 5px; padding: 1px 5px; font-size: .9em;" type="button" value="Export to CSV" id="csvExportResolved" /><div id="version" style="width: 100%; text-align: center; font-size: 1em;">Developed by <a href="mailto:joseph.hosemann@blackbaud.com?subject=CaseTherapist">Joseph Hosemann</a> - Maintained by <a href="mailto:sort@blackbaud.com?subject=CaseTherapist">SORT</a> - 3.5 - <a id="aLegend" data-fancybox-type="iframe" href="http://bbecweb/reporter/legend.htm">Reporter Legend</a></div>');
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

                var url = '{0}hapi/IssueWI/?type={1}&param={2}'.f(hosemann.vars.origin, hosemann.vars.view, hosemann.vars.param);
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

                            $('#pagerjqxgridIssueWI>div').append('<input style="float: left; margin-left: 5px; padding: 1px 5px; font-size: .9em;" type="button" value="Export to CSV" id="csvExportIssueWI" /><div id="version" style="width: 100%; text-align: center; font-size: 1em;">Developed by <a href="mailto:joseph.hosemann@blackbaud.com?subject=CaseTherapist">Joseph Hosemann</a> - Maintained by <a href="mailto:sort@blackbaud.com?subject=CaseTherapist">SORT</a> - 3.5 - <a id="aLegend" data-fancybox-type="iframe" href="http://bbecweb/reporter/legend.htm">Reporter Legend</a></div>');
                            $("#csvExportIssueWI").jqxButton({ theme: "metro-lime" });
                            $("#csvExportIssueWI").click(function () {
                                grid.jqxGrid('exportdata', 'csv', 'CaseTherapist');
                            });
                        }
                    });
            },
            closed: function () {
                var type = "Closed";
                var url = "{0}hapi/Cases/?type={1}&workable={2}&resolved={3}&param={4}&businessUnit={5}".f(hosemann.vars.origin, hosemann.vars.view, '-1', '-1', hosemann.vars.param, hosemann.vars.businessUnit);
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
                        $('.colheaderCreatedOn>div:first-child>div:first-child>span').html('<img src="{0}images/createdon.png" alt="Created On">'.f(hosemann.vars.origin));
                        $('.colheaderUpdated>div:first-child>div:first-child>span').html('<img src="{0}images/activity.png" alt="Activity">'.f(hosemann.vars.origin));
                        $('.colheaderContacted>div:first-child>div:first-child>span').html('<img src="{0}images/contacted.png" alt="Contacted">'.f(hosemann.vars.origin));
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

                        $('#pagerjqxgridClosed>div').append('<input style="float: left; margin-left: 5px; padding: 1px 5px; font-size: .9em;" type="button" value="Export to CSV" id="csvExportClosed" /><div id="version" style="width: 100%; text-align: center; font-size: 1em;">Developed by <a href="mailto:joseph.hosemann@blackbaud.com?subject=CaseTherapist">Joseph Hosemann</a> - Maintained by <a href="mailto:sort@blackbaud.com?subject=CaseTherapist">SORT</a> - 3.5 - <a id="aLegend" data-fancybox-type="iframe" href="http://bbecweb/reporter/legend.htm">Reporter Legend</a></div>');
                        $("#csvExportClosed").jqxButton({
                            theme: "metro-lime"
                        });
                        $("#csvExportClosed").click(function () {
                            grid.jqxGrid('exportdata', 'csv', 'CaseTherapist');
                        });
                    }
                });
            },
            summary: function () {
                var type = "Summary";
                var url = "{0}hapi/CasesSummary/?param={1}&businessUnit={2}".f(hosemann.vars.origin, hosemann.vars.param, hosemann.vars.businessUnit);
                var grid = $("#jqxgridSummary");

                $.ajax({
                    type: "GET", url: url, contentType: "application/json; charset=utf-8", dataType: "json", success: function (res) {
                        grid.append(hosemann.utilities.createTableView(res)).fadeIn();
                    }
                });
            }
        }
    },
    userOptions: {
        pageLoad: function () {
            hosemann.userOptions.buildHtml();
            hosemann.userOptions.buildSubscriptions();
            hosemann.userOptions.buildInitialSetup();
            hosemann.userOptions.buildVisuals();
        },
        buildIcon: function () {
            $('#featureButtons').append('<div id="userOptionsButton" class="featureButton"><i title="Options" class="fa fa-gear"></i></div>');

            $('body').append('<div id="userOptionsPanel"></div>');

            $('#userOptionsButton').click(function () {
                hosemann.userOptions.pageLoad();

                $.fancybox({
                    href: '#userOptionsPanel',
                    minWidth: 700,
                    minHeight: 500
                });
            });
        },
        buildHtml: function () {

            $('#userOptionsPanel').html('<div class="useroptions"><div class="content"><div class="title">user<div style="font-weight: normal; display: inline; color: #1F6D9B;">options</div></div><div id="wizard"><h2>Initial Setup</h2><section><div id="row"><div id="labels" style="width:50%; float:left; text-align:right;"><label>Business Unit:</label></div><div id="inputs" style="float:left;"><div><input type="radio" name="BusinessUnits" value="ECBU" style="float: left;" />ECBU</div><div><input type="radio" name="BusinessUnits" value="GMBU" style="float: left;" />GMBU</div></div></div><div id="row"><div id="labels" style="width:50%; float:left; text-align:right;"><label>Cisco Extension (6xxx):</label></div><div id="inputs" style="float:left;"><input type="text" name="CiscoExtension" value="" /></div></div><div id="row"><div id="labels" style="width:50%; float:left; text-align:right;"><label>BluePumpkin Username:</label></div><div id="inputs" style="float:left;"><input type="text" name="BluePumpkinUsername" value="" /></div></div></section><h2>Subscriptions</h2><section><form action=""><ul id="subscriptions"></ul></form></section><h2>Visuals</h2><section><div class="bbqPreviewParentContainer"><div class="bbqPreviewContainer"><div class="bbqPreviewContainerTitle">Inactive Queue Preview</div><div class="bbq"><div class="bbqContainer" id="Inactive"><div class="bbqProduct" id="BBIS"><strong>BBIS</strong><div class="bbqQueue" id="CL"><strong>CL</strong>0|<strong>0:00:00</strong></div><div class="bbqQueue" id="PH"><strong>PH</strong>0|<strong>0:00:00</strong></div></div></div></div><br /><div><input type="text" id="applicationBG" /><p style="display:inline; margin-left:5px;">Application Background</p></div><div><input type="text" id="queueBG" /><p style="display:inline; margin-left:5px;">Queue Background</p></div><div><input type="text" id="queueFG" /><p style="display:inline; margin-left:5px;">Queue Foreground</p></div><div><input type="text" id="inactiveCallTypeBG" /><p style="display:inline; margin-left:5px;">Call Type Background</p></div><div><input type="text" id="inactiveCallTypeFG" /><p style="display:inline; margin-left:5px;">Call Type Foreground</p></div></div></div><br /><br /><div class="bbqPreviewParentContainer"><div class="bbqPreviewContainer"><div class="bbqPreviewContainerTitle">Active Queue Preview</div><div class="bbq"><div class="bbqContainer" id="Active"><div class="bbqProduct" id="BBIS"><strong>BBIS</strong><div class="bbqQueue" id="CL"><strong>CL</strong>0|<strong>0:00:00</strong></div><div class="bbqQueue" id="PH"><strong>PH</strong>0|<strong>0:00:00</strong></div></div></div></div><br /><div><input type="text" id="activeCallTypeBG" /><p style="display:inline; margin-left:5px;">Call Type Background</p></div><div><input type="text" id="activeCallTypeFG" /><p style="display:inline; margin-left:5px;">Call Type Foreground</p></div></div></div><br /><br /><div class="bbqPreviewParentContainer"><div class="bbqPreviewContainer"><div class="bbqPreviewContainerTitle">Extended Queue Preview</div><div class="bbq"><div class="bbqContainer" id="Extended"><div class="bbqProduct" id="BBIS"><strong>BBIS</strong><div class="bbqQueue" id="CL"><strong>CL</strong>0|<strong>0:00:00</strong></div><div class="bbqQueue" id="PH"><strong>PH</strong>0|<strong>0:00:00</strong></div></div></div></div><br /><div><input type="text" id="extendedCallTypeBG" /><p style="display:inline; margin-left:5px;">Call Type Background</p></div><div><input type="text" id="extendedCallTypeFG" /><p style="display:inline; margin-left:5px;">Call Type Foreground</p></div></div></div><br /><br /></section></div></div><div id="footer" style="height: 32px"><input type="button" id="userOptionsSubmitButton" value="Submit" style="float:right;margin-right:2.5%" /><div id="status"></div></div></div>');

            $('input[name=CiscoExtension]').mask('6999');

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
            var products = hosemann.vars.products;
            var subscriptions = hosemann.vars.subscriptions;

            var tempSubscriptions = [];

            $('#subscriptions').html('');
            for (i = 0; i < subscriptions.length; ++i) {
                tempSubscriptions[subscriptions[i].ProductID] = "subscribed";
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
            if (hosemann.vars.businessUnit.length > 0)
                $('input[name=BusinessUnits][value={0}]'.f(hosemann.vars.businessUnit.toUpperCase())).prop("checked", true);
            else
                $('input[name=BusinessUnits][value=ECBU]').prop("checked", true);

            $('input[name=CiscoExtension]').val(hosemann.vars.ciscoExtension);
            $('input[name=BluePumpkinUsername]').val(hosemann.vars.bluePumpkinUsername);
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
            }, 10000);
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
                                rule.style.color = color;
                            else if (rule.style.background == previousColor)
                                rule.style.background = color;
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
    admin: {
        pageLoad: function () {
            if (hosemann.vars.pwd === "") {
                hosemann.admin.getPassword();
            }
            else {
                hosemann.admin.buildBody();
            }
        },
        buildIcon: function () {
            $('#featureButtons').append('<div id="adminButton" class="featureButton"><i title="Admin" class="fa fa-lock"></i></div>');

            $('body').append('<div id="adminPanel"></div>');

            $('#adminButton').click(function () {
                hosemann.admin.pageLoad();
            });
        },
        buildBody: function () {
            $('div#adminPanel').html('<div><div><div class="panelTitle">admin<div style="font-weight: normal; display: inline; color: #1F6D9B;">options</div></div><div id="wizardAdmin"></div></div><div id="footer" style="height: 32px"><div id="status"></div></div></div>');

            $.fancybox({
                href: '#adminPanel',
                minWidth: 700,
                maxWidth: 700,
                minHeight: 500,
                maxHeight: 500,
                'beforeClose': function () {
                    $("div#addproduct-dialog-form").dialog('destroy');
                    $('div#adminPanel').html('');
                }
            });

            hosemann.vars.adminProxy.server.server_GetProductData();
            hosemann.vars.adminProxy.server.server_GetCallTypeData();

            setTimeout(function () {
                $("#wizardAdmin").steps({
                    headerTag: "h2",
                    enableFinishButton: false,
                    enablePagination: false,
                    enableAllSteps: true,
                    bodyTag: "section",
                    transitionEffect: "slideLeft",
                    stepsOrientation: "vertical",
                    titleTemplate: "#title#"
                });

                $('div.steps').prepend('<div id="wizardAdmin_Container"><input type="text" id="wizardAdmin_ProductFilter"><input type="button" value="Add" class="wizardAdmin_ProductAddButton" /></div>');

                $('ul[role=tablist]>li').each(function () {
                    var _href = $(this).children('a').attr('href');
                    var _prodID = $('h2{0}'.f(_href)).next().find('div.wizardAdmin_CallTypeRowContainer').attr('id');
                    $(this).attr('ProductID', _prodID);

                    //var product = $(this).text().replace('current step: ', '');
                    //$(this).prop('product', product);
                    $(this).prepend('<div class="wizardAdmin_RemoveProductContainer" onclick="hosemann.admin.buttonEvents($(this));"><i class="fa fa-ban" style=""></i></div>');
                });

                $('#wizardAdmin_ProductFilter').keyup(function () {
                    var currentValue = $(this).val();
                    $('li[role=tab]').each(function (i, val) {
                        if ($(this).text().match(currentValue) === null) {
                            $(this).hide();
                        } else {
                            $(this).show();
                        }
                    });
                });

                //$('.wizardAdmin_RemoveProductContainer').click(function () {
                //    hosemann.vars.adminProxy.server.server_RemoveProduct(($(this).parent().attr('ProductID')), hosemann.admin.getPassword());
                //});
                $('.wizardAdmin_ProductAddButton').click(function () { hosemann.admin.buttonEvents($(this)); });

            }, 500);
        },
        buttonEvents: function (element) {
            switch (element.prop('class')) {
                case 'fa fa-edit': // not using edit, keeping code.
                    if (element.prop('active') != 'true') {
                        element.prop('active', 'true');
                        element.parent().parent().siblings().each(function () {
                            $(this).html('<input class="callTypeEdit" type="text" value="' + $(this).text() + '"></input>');
                        });
                        element.parent().parent().parent().append('<li id="li-save"><i class="fa fa-save" onclick="hosemann.admin.buttonEvents($(this));"></i></li>');
                    } else {
                        element.removeProp('active');
                        element.parent().parent().siblings().each(function () {
                            $(this).html($(this).children('input').val());
                        });
                        $('li#li-save').remove();
                    }
                    break;
                case 'fa fa-minus-square-o':

                    // checks to see if its a new row, if so, go ahead and remove the object, cancelling the insert.
                    if (element.parent().parent().parent().attr('id') == 'cellTypeNew')
                        element.parent().parent().parent().remove();
                    else {
                        // Remove calltype function                        
                        hosemann.vars.adminProxy.server.server_RemoveCallType(element.attr('ctid'), hosemann.admin.getPassword());
                    }
                    break;
                case 'fa fa-plus-square-o':
                    $('#cellTypeNew').remove();
                    element.parents('.wizardAdmin_CallTypeRowContainer').append('<ol id="cellTypeNew"><li><div class="actions"><i class="fa fa-minus-square-o" onclick="hosemann.admin.buttonEvents($(this));"></i></div></li><li><input id="callTypeID" type="text"></input></li><li><input id="callType" type="text"></input></li><li><input id="isDisabled" type="text"></input></li><li id="li-save"><i class="fa fa-save" onclick="hosemann.admin.buttonEvents($(this));"></i></li></ol>');
                    break;
                case 'fa fa-save':
                    var _callTypeID = $('input#callTypeID').val();
                    var _callType = $('input#callType').val();
                    var _isDisabled = $('input#isDisabled').val();
                    var _productID = element.parents('.wizardAdmin_CallTypeRowContainer').attr('id');

                    if (_callTypeID.length !== 0 && _callType.length !== 0 && _isDisabled.length !== 0) {
                        hosemann.vars.adminProxy.server.server_InsertCallType(_callType, _callTypeID, _productID, hosemann.admin.getPassword());
                    }
                    else {
                        alert('All fields required to save.');
                    }
                    break;
                case 'wizardAdmin_RemoveProductContainer':
                    hosemann.vars.adminProxy.server.server_RemoveProduct(element.parent().attr('ProductID'), hosemann.admin.getPassword());
                    break;
                case 'wizardAdmin_ProductAddButton':
                    hosemann.admin.addProduct();
                    break;
                default:
                    break;
            }
        },
        getPassword: function () {
            if (hosemann.vars.pwd === "") {
                // Populates a dialog box to enter password credentials.
                $('body').append('<div id="ctadmin-dialog-form" title="Enter Admin Password"><form><fieldset><label for="password">Password:</label><input type="password" name="thispass" id="thispass" class="text ui-widget-content ui-corner-all"></fieldset></form></div>');

                $("#ctadmin-dialog-form").dialog({
                    autoOpen: true,
                    modal: true,
                    buttons: {
                        "Submit": function () {
                            hosemann.vars.adminProxy.server.server_ValidatePassword($('div#admin-dialog-form #thispass').val());
                        }
                    },
                    close: function () {
                        $('div#ctadmin-dialog-form').dialog("destroy");
                        $('div#ctadmin-dialog-form').remove();
                    }
                });

                $('#ctadmin-dialog-form input').keypress(function (event) {
                    if (event.keyCode == 10 || event.keyCode == 13) {
                        $('#ctadmin-dialog-form').siblings('.ui-dialog-buttonpane').find('.ui-button-text').click();

                        // required to prevent refresh of page.  couldnt find out why.
                        event.preventDefault();
                    }
                });
            }
            return hosemann.vars.pwd;
        },
        addProduct: function () {
            if ($('div#addproduct-dialog-form').length === 0)
                $('div#adminPanel').append('<div id="addproduct-dialog-form" title="Add Product..."><form><fieldset><label for="name">Name:</label><input type="text" name="name" id="name" class="text ui-widget-content ui-corner-all"><br><br><label for="market">Market:</label><br><input type="radio" name="market" value="1">ECBU<br><input type="radio" name="market" value="2">GMBU</fieldset></form></div>');

            $("div#addproduct-dialog-form").dialog({
                autoOpen: true,
                modal: true,
                buttons: {
                    "Submit": function () {
                        if ($('div#addproduct-dialog-form input#name').val().length > 0 && $('div#addproduct-dialog-form input[name=market]:checked').length > 0) {
                            var _name = $('div#addproduct-dialog-form input#name').val();
                            var _marketID = $('div#addproduct-dialog-form input[name=market]:checked').val();

                            hosemann.vars.adminProxy.server.server_InsertProduct(_name, _marketID, hosemann.admin.getPassword());
                        }
                        else {
                            alert('All fields are required.');
                        }
                    }
                },
                close: function () {
                    $('div#addproduct-dialog-form').remove();
                }
            });
        },

        addCallType: function (callType) {
            $('section div[id={0}]'.f(callType.ProductID)).append('<ol id="{0}"><li><div class="actions"><i ctid="{3}" class="fa fa-minus-square-o" onclick="hosemann.admin.buttonEvents($(this));"></i></div></li><li>{0}</li><li>{1}</li><li>{2}</li></ol>'.f(callType.CallTypeID, callType.Name, callType.IsDisabled, callType.ID));
        }
    },
    bbq: {
        pageLoad: function () {
            hosemann.bbq.buildHtml();
            hosemann.vars.queueBroadcastProxy.server.joinRoom('all');

            $('#bbqPanel .queueHeader ul li').each(function () {
                $(this).bind("mouseover", function (e) {
                    if (!$(this).hasClass('selected')) {
                        $(this).children().stop(true, true).fadeTo(500, 1);
                    }
                    e.preventDefault();
                });
                $(this).bind("mouseout", function (e) {
                    if (!$(this).hasClass('selected')) {
                        $(this).children().stop(true, true).fadeOut(500, 0);
                    }
                    e.preventDefault();
                });
            });
        },
        buildIcon: function () {
            $('#featureButtons').append('<div id="bbqButton" class="featureButton"><i title="Queue Summary" class="fa fa-globe"></i></div>');

            $('body').append('<div id="bbqPanel"></div>');

            $('#bbqButton').click(function () {
                hosemann.bbq.pageLoad();

                $.fancybox({
                    href: '#bbqPanel',
                    minWidth: 875,
                    minHeight: 600,
                    afterClose: function () {
                        hosemann.vars.queueBroadcastProxy.server.leaveRoom('all');
                        $('#bbqPanel').html('');
                    }
                });
            });
        },
        buildHtml: function () {
            $('#bbqPanel').append('<div><div><div class="panelTitle">queue<div style="font-weight: normal; display: inline; color: #1F6D9B;">monitor</div></div><div class="bbqAllContainer"><div id="queueSelection"><input type="checkbox" id="selectAllFilter" checked="checked">Select All<br /></div><div id="masterContainer"><div id="combinedQueueStatusContainer"><h2>Combined Queues</h2><ol class="queueStatusSlats"><li class="queueHeader"><ul class="stats-tabs"><li class="grid0">Product</li><li class="grid1">CT<div style="display:none;">Call Type</div></li><li class="grid2">QTY<div style="display:none;">Number of Calls</div></li><li class="grid3">HT<div style="display:none;">Hold Time</div></li><li class="grid4">OFF<div style="display:none;">Calls Offered</div></li><li class="grid5">HAN<div style="display:none;">Calls Handled</div></li><li class="grid6">SLA<div style="display:none;">Service Level Agreement</div></li><li class="grid7">Live<div style="display:none;">Live</div></li><li class="grid8">ASA<div style="display:none;">Average Speed of Answer</div></li><li class="grid9">HT<div style="display:none;">Handle Time</div></li><li class="grid10">TT<div style="display:none;">Talk Time</div></li><li class="grid11">SL<div style="display:none;">Service Level</div></li></ul></li></ol></div><div id="singleQueueStatusContainer"><h2>Individual Queues</h2><ol class="queueStatusSlats"><li class="queueHeader"><ul class="stats-tabs"><li class="grid0">Product</li><li class="grid1">CT<div style="display:none;">Call Type</div></li><li class="grid2">QTY<div style="display:none;">Number of Calls</div></li><li class="grid3">HT<div style="display:none;">Hold Time</div></li><li class="grid4">OFF<div style="display:none;">Calls Offered</div></li><li class="grid5">HAN<div style="display:none;">Calls Handled</div></li><li class="grid6">SLA<div style="display:none;">Service Level Agreement</div></li><li class="grid7">Live<div style="display:none;">Live</div></li><li class="grid8">ASA<div style="display:none;">Average Speed of Answer</div></li><li class="grid9">HT<div style="display:none;">Handle Time</div></li><li class="grid10">TT<div style="display:none;">Talk Time</div></li><li class="grid11">SL<div style="display:none;">Service Level</div></li></ul></li></ol></div></div></div></div></div>');
        },
        updateView: function () {
            if ($('#bbqPanel div#queueSelection input#selectAllFilter:checked').length > 0) {
                $('#bbqPanel .queueStatusSlats li').show();
            }
            else {
                $('#bbqPanel .queueStatusSlats li').hide();

                var thisProductListFilter = [];
                $('#bbqPanel .productListFilter:checked').each(function (index, element) {
                    thisProductListFilter.push(element.id);
                });
                if (thisProductListFilter.length > 0) {
                    var distinctProductListfilter = hosemann.bbq.utilities.distinctString(thisProductListFilter);
                    for (var i = 0; i < distinctProductListfilter.length; i++) {
                        $('#bbqPanel .grid0:contains("{0}")'.f(distinctProductListfilter[i])).parent().parent().show();
                    }
                }
            }
        },
        utilities: {
            distinctString: function (array) {
                var results = [];

                for (i = 0; i < array.length; i++) {
                    var isDuplicate = false;
                    for (j = 0; j < results.length; j++) {
                        if (array[i].toString() == results[j].toString())
                            isDuplicate = true;
                    }
                    if (isDuplicate === false) {
                        results.push(array[i].toString());
                    }
                }
                return results;
            }
        }
    },
    utilities: {
        isOldIE: function () {
            if ($('html').is('.ie6, .ie7, .ie8'))
                return true;
            else
                return false;
        },
        urlVars: {
        },
        isOdd: function (num) { return (num % 2) == 1; },
        analytics: function () {
            var _paq = _paq || [];
            _paq.push(["trackPageView"]);
            _paq.push(["enableLinkTracking"]);

            (function () {
                var u = (("https:" == document.location.protocol) ? "https" : "http") + "://bbecweb/analytics/";
                _paq.push(["setTrackerUrl", u + "piwik.php"]);
                _paq.push(["setSiteId", "1"]);
                var d = document, g = d.createElement("script"), s = d.getElementsByTagName("script")[0]; g.type = "text/javascript";
                g.defer = true; g.async = true; g.src = u + "piwik.js"; s.parentNode.insertBefore(g, s);
            })();
        },
        createTableView: function (objArray, theme, enableHeader) {
            // This function creates a standard table with column/rows
            // Parameter Information
            // objArray = Anytype of object array, like JSON results
            // theme (optional) = A css class to add to the table (e.g. <table class="<theme>">
            // enableHeader (optional) = Controls if you want to hide/show, default is show
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
                    if (array[0].hasOwnProperty(index)) {
                        str += '<th scope="col">' + index + '</th>';
                    }
                }
                str += '</tr></thead>';
            }

            // table body
            str += '<tbody>';
            for (var i = 0; i < array.length; i++) {
                str += (i % 2 === 0) ? '<tr class="alt">' : '<tr>';
                for (var n in array[i]) {
                    if (array[i].hasOwnProperty(n)) {
                        str += '<td>' + array[i][n] + '</td>';
                    }
                }
                str += '</tr>';
            }
            str += '</tbody>';
            str += '</table>';
            return str;
        },
        getUrlVars: function () {
            // Gets variables and values from URL
            var vars = {
            };
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
            return hosemann.utilities.randHex(multiplier) + "" + hosemann.utilities.randHex(multiplier) + "" + hosemann.utilities.randHex(multiplier);
        },
        hexToRGB: function (value) {
            //http://www.javascripter.net/faq/hextorgb.htm
            var R = hexToR(value);
            var G = hexToG(value);
            var B = hexToB(value);

            function hexToR(h) {
                return parseInt((cutHex(h)).substring(0, 2), 16);
            }
            function hexToG(h) { return parseInt((cutHex(h)).substring(2, 4), 16); }
            function hexToB(h) { return parseInt((cutHex(h)).substring(4, 6), 16); }
            function cutHex(h) {
                return (h.charAt(0) == "#") ? h.substring(1, 7) : h;
            }

            return 'rgb({0}, {1}, {2})'.f(R, G, B);
        },
        trace: function (s) {
            try {
                console.log(s);
            } catch (e) {
                alert(s);
            }
        },
        buildPath: function () {

            var pathName = window.location.pathname.split('/');

            var path = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');


            hosemann.vars.fullpath = path + window.location.pathname;
            hosemann.vars.origin = path + '/';
        }

    }
};
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

//// Having to support IE8 sucks
//// Required for IE8 Support.
//if (typeof Array.prototype.forEach != 'function') {
//    Array.prototype.forEach = function (callback) {
//        for (var i = 0; i < this.length; i++) {
//            callback.apply(this, [this[i], i, this]);
//        }
//    };
//}