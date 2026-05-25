function loadGeoGebra(containerId, materialId) {
    return new Promise(function(resolve, reject) {
        var params = {
            "prerelease":false,
            "width":800,
            "height":600,
            "showStyleBar":false,
            "showToolBar":false,
            "borderColor":null,
            "showMenuBar":false,
            "showAlgebraInput":false,
            "showResetIcon":true,
            "enableLabelDrags":false,
            "enableShiftDragZoom":true,
            "enableRightClick":false,
            "capturingThreshold":null,
            "showToolBarHelp":false,
            "errorDialogsActive":true,
            "useBrowserForJS":false,
            "material_id":materialId
        };
        var applet = new GGBApplet(params, true);
        applet.inject(containerId);

        // 等待載入完成
        var checkInterval = setInterval(function() {
            var api = applet.getAppletObject();
            if (api) {
                clearInterval(checkInterval);
                resolve(api); // Return the applet instance via Promise
            }
        }, 500);
    });
}