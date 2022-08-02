
$(window).load(
    function () {

        var set6_test = new Application();

        $(window).resize(
            function () {
                set6_test.resize();
            }
        );

        // $("#slider-0").on(
        //     "change",
        //     function(event, ui) {
        //         set6_test.html.viewTotalGrass.innerHTML = $("#slider-0").val() + ',000';
        //     }
        // );

        $("#compute").click(
            function() {
                set6_test.compute();
            }
        );

        set6_test.initialize();
        set6_test.render();
    }
);