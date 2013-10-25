<div id="dialog-form" title="Parameter missing...">
    <form>
        <fieldset>
            <label for="param">Clarify Username:</label>
            <input type="text" name="param" id="param" class="text ui-widget-content ui-corner-all" />           
        </fieldset>
    </form>
</div>
<script type="text/javascript">
$(function () {
    var param = $("#user");
    
    $("#dialog-form").dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "Submit": function () {                
                        window.location.href = 'http://' + window.location.hostname + window.location.pathname + '?param=' + param.val();
                }
            }            
    });
    $(".ui-dialog-titlebar-close", this.parentNode).hide();  
    
});
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

// Global variable for the universal parameter
if (getURLParameter('param') != null)
    var _param = getURLParameter('param');
else if (getURLParameter('user') != null)
    var _param = getURLParameter('user');
</script>