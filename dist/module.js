"use strict";

System.register(["./topology_ctrl", "app/plugins/sdk"], function (_export, _context) {
  "use strict";

  var TopologyCtrl, loadPluginCss;
  return {
    setters: [function (_topology_ctrl) {
      TopologyCtrl = _topology_ctrl.TopologyCtrl;
    }, function (_appPluginsSdk) {
      loadPluginCss = _appPluginsSdk.loadPluginCss;
    }],
    execute: function () {
      loadPluginCss({
        dark: 'plugins/gretamosa-topology-panel/css/topology.dark.css',
        light: 'plugins/gretamosa-topology-panel/css/topology.light.css'
      });

      _export("PanelCtrl", TopologyCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
