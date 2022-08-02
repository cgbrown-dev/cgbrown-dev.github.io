

Debug = function () {
    this.statsArea = null;
    this.stats = null;

    this.initialize = function () {
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        this.stats.domElement.style.zIndex = 10;

        this.statsArea = document.getElementById('statsArea');
        // while(this.statsArea.childNodes.length > 0) {
        //     this.statsArea.removeChild(this.statsArea.childNodes[0]);
        //     console.log("removed stats");
        // }
        this.statsArea.appendChild(this.stats.domElement);
    };

};

