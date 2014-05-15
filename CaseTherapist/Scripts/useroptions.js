hosemann = {
    vars: {
        // debug vars
        requirePassword: false,
        // required app vars
        // clarifyusername post parameter
        param: "",
        subscriptions: [],
        products: [],
        // these are default values and should get overwritten by user details in db
        applicationBG: "#EDEDED",
        queueBG: "#CCCCCC",
        queueFG: "#000000",
        inactiveCallTypeBG: "#FFFFFF",
        inactiveCallTypeFG: "#000000",
        activeCallTypeBG: "#FFC0CB",
        activeCallTypeFG: "#000000",
        extendedCallTypeBG: "#FF0004",
        extendedCallTypeFG: "#000000",
        // use random color for fun (to be implemented later)
        previousColor: "#1F6D9B" 
    },

    signalR: function () {
        var proxy = $.connection.userOptionsHub;

        /*   CLIENT FUNCTIONS   */

        // Status Message Response
        proxy.client.status = function (message) {
            hosemann.userOptions.systemStatusMessage(message);
        };

        // Debug Response
        proxy.client.clientConsole = function (object) {
            console.log(object);
        };

        // Error handling
        $.connection.hub.error(function (error) {
            console.log('SignalR error: ' + error)
        });

        // Initial Form Data Response
        proxy.client.getData = function (products, userDetails, subscriptions) {
            var i;

            console.log(products);
            console.log(subscriptions);

            // Begin Subscriptions 
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

            // End Subscriptions

            // Begin Initial Setup

            $('input[name=BusinessUnit]').val(userDetails.BusinessUnit);
            $('input[name=CiscoExtension]').val(userDetails.CiscoExtension);
            $('input[name=BluePumpkinUsername]').val(userDetails.BluePumpkinUsername);

            // End Initial Setup

            // Begin Visuals

            hosemann.vars.applicationBG = userDetails.ApplicationBG;
            hosemann.vars.queueBG = userDetails.QueueBG;
            hosemann.vars.queueFG = userDetails.QueueFG;
            hosemann.vars.inactiveCallTypeBG = userDetails.InactiveCallTypeBG;
            hosemann.vars.inactiveCallTypeFG = userDetails.InactiveCallTypeFG;
            hosemann.vars.activeCallTypeBG = userDetails.ActiveCallTypeBG;
            hosemann.vars.activeCallTypeFG = userDetails.ActiveCallTypeFG;
            hosemann.vars.extendedCallTypeBG = userDetails.ExtendedCallTypeBG;
            hosemann.vars.extendedCallTypeFG = userDetails.ExtendedCallTypeFG;

            hosemann.userOptions.visualsUpdateColors();
            hosemann.userOptions.visualsColorPicker();
            // End Visuals
        };

        /*    SERVER FUNCTIONS   */
        $.connection.hub.start().done(function () {
            //Initial Form Data Request
            proxy.server.getData(hosemann.vars.param);

            // Wire up object events to SignalR
            $('#Submit').click(function () {

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
                    $('#submit').append('<div id="dialog-form" title="Clarify password required."><form><fieldset><label for="clarifyPassword">To save changes to your user options, please enter your Clarify password.</label><input type="password" name="clarifyPassword" id="clarifyPassword" class="text ui-widget-content ui-corner-all" /></fieldset></form></div>');
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
                    proxy.server.setData(userDetails, subscriptions, 'password').done(function () {
                        hosemann.userOptions.systemStatusMessage('Successfully updated settings');
                    }).fail(function (error) {
                        hosemann.userOptions.systemStatusMessage('Failed updating settings');
                        console.log('Failure setting data.  Error:' + error);
                    });
                }
            });
        });
    },

    userOptions: {
        pageLoad: function () {
            hosemann.userOptions.appSetParam();
            hosemann.signalR();
        },
        appSetParam: function () {
            var postParams = hosemann.utilities.getUrlVars();

            if (typeof postParams['param'] != 'undefined') {
                hosemann.vars.param = postParams['param'].toLowerCase();
            }
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
        getUrlVars: function () {
            // Gets variables and values from URL
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
                vars[key] = unescape(value.replace(/\+/g, " "));
            });
            return vars;
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

            function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
            function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
            function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
            function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

            return 'rgb({0}, {1}, {2})'.f(R, G, B);
        }
    }
};

// Functions to run each time the page loads
$(document).ready(function () {    
    hosemann.userOptions.pageLoad();
});

