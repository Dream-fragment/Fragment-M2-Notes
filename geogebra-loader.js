function loadGeoGebra(containerId, materialId) {
    return new Promise(function(resolve, reject) {
        var container = document.getElementById(containerId);
        var noteCard = container ? container.closest('.note-container') : null;

        var getAvailableWidth = function() {
            if (noteCard) {
                return noteCard.clientWidth;
            }
            return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) * 0.95;
        };

        var calculateSize = function() {
            var availableWidth = getAvailableWidth();
            var width = Math.min(Math.max(availableWidth * 0.9 - 50, 280), 900);
            var height = Math.round(width * 0.75);
            return { width: width, height: height };
        };

        var initialSize = calculateSize();
        var width = initialSize.width;
        var height = initialSize.height;

        if (container) {
            container.style.width = '100%';
            container.style.maxWidth = width + 'px';
            container.style.height = height + 'px';
            container.style.display = 'block';
        }

        var params = {
            "prerelease":false,
            "width": width,
            "height": height,
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

        // Responsive behavior on resize
        window.addEventListener('resize', function() {
            var newSize = calculateSize();
            var newWidth = newSize.width;
            var newHeight = newSize.height;
            var api = applet.getAppletObject();
            if (container) {
                container.style.maxWidth = newWidth + 'px';
                container.style.height = newHeight + 'px';
            }
            if (api && typeof api.setWidth === 'function' && typeof api.setHeight === 'function') {
                api.setWidth(newWidth);
                api.setHeight(newHeight);
            }
        });
    });
}