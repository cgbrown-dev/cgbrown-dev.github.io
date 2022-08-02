// start the app
function startApp() {
    var sur5 = new Application();
    sur5.initialize();
    sur5.render();

    for(var i = 0; i < NUMCONTROLS; i++) {
        var number = i.toString();
        $("#slider-" + number).on("change", function(event, ui) {
            sur5.onIdleInterrupt();
            sur5.updateShader();
        });
    }
    $("#reset").click(function() {
        sur5.clearControls();
    });
}

window.onload = startApp;