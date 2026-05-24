function loadGeoGebra(containerId, materialId) {
    var params = {
        "width":800,
        "height":600,
        "showToolBar":false,
        "borderColor":null,
        "showMenuBar":false,
        "showAlgebraInput":false,
        "customToolbar":"0 || 1",
        "showResetIcon":true,
        "enableLabelDrags":false,
        "enableShiftDragZoom":true,
        "enableRightClick":false,
        "capturingThreshold":null,
        "showToolBarHelp":true,
        "errorDialogsActive":true,
        "useBrowserForJS":false,
        "material_id":materialId
    };
    var applet = new GGBApplet(params, true);
    applet.inject(containerId)
}