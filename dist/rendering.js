'use strict';

System.register(['lodash', 'jquery', 'jquery.flot', 'jquery.flot.pie', './lib/sigma/src/sigma.core', './lib/sigma/src/conrad', './lib/sigma/src/utils/sigma.utils', './lib/sigma/src/utils/sigma.polyfills', './lib/sigma/src/sigma.settings', './lib/sigma/src/classes/sigma.classes.dispatcher', './lib/sigma/src/classes/sigma.classes.configurable', './lib/sigma/src/classes/sigma.classes.graph', './lib/sigma/src/classes/sigma.classes.camera', './lib/sigma/src/classes/sigma.classes.quad', './lib/sigma/src/captors/sigma.captors.mouse', './lib/sigma/src/captors/sigma.captors.touch', './lib/sigma/src/renderers/sigma.renderers.canvas', './lib/sigma/src/renderers/sigma.renderers.webgl', './lib/sigma/src/renderers/sigma.renderers.svg', './lib/sigma/src/renderers/sigma.renderers.def', './lib/sigma/src/renderers/webgl/sigma.webgl.nodes.def', './lib/sigma/src/renderers/webgl/sigma.webgl.nodes.fast', './lib/sigma/src/renderers/webgl/sigma.webgl.edges.def', './lib/sigma/src/renderers/webgl/sigma.webgl.edges.fast', './lib/sigma/src/renderers/webgl/sigma.webgl.edges.arrow', './lib/sigma/src/renderers/canvas/sigma.canvas.labels.def', './lib/sigma/src/renderers/canvas/sigma.canvas.hovers.def', './lib/sigma/src/renderers/canvas/sigma.canvas.nodes.def', './lib/sigma/src/renderers/canvas/sigma.canvas.edges.def', './lib/sigma/src/renderers/canvas/sigma.canvas.edges.curve', './lib/sigma/src/renderers/canvas/sigma.canvas.edges.arrow', './lib/sigma/src/renderers/canvas/sigma.canvas.edges.curvedArrow', './lib/sigma/src/renderers/canvas/sigma.canvas.edgehovers.def', './lib/sigma/src/renderers/canvas/sigma.canvas.edgehovers.curve', './lib/sigma/src/renderers/canvas/sigma.canvas.edgehovers.arrow', './lib/sigma/src/renderers/canvas/sigma.canvas.edgehovers.curvedArrow', './lib/sigma/src/renderers/canvas/sigma.canvas.extremities.def', './lib/sigma/src/renderers/svg/sigma.svg.utils', './lib/sigma/src/renderers/svg/sigma.svg.nodes.def', './lib/sigma/src/renderers/svg/sigma.svg.edges.def', './lib/sigma/src/renderers/svg/sigma.svg.edges.curve', './lib/sigma/src/renderers/svg/sigma.svg.edges.curvedArrow', './lib/sigma/src/renderers/svg/sigma.svg.labels.def', './lib/sigma/src/renderers/svg/sigma.svg.hovers.def', './lib/sigma/src/middlewares/sigma.middlewares.rescale', './lib/sigma/src/middlewares/sigma.middlewares.copy', './lib/sigma/src/misc/sigma.misc.animation', './lib/sigma/src/misc/sigma.misc.bindEvents', './lib/sigma/src/misc/sigma.misc.bindDOMEvents', './lib/sigma/src/misc/sigma.misc.drawHovers', './lib/sigma/plugins/sigma.helpers.graph/sigma.helpers.graph', './lib/sigma/plugins/sigma.renderers.edgeLabels/settings', './lib/sigma/plugins/sigma.renderers.edgeLabels/sigma.canvas.edges.labels.def', './lib/sigma/plugins/sigma.renderers.edgeLabels/sigma.canvas.edges.labels.curve', './lib/sigma/plugins/sigma.renderers.edgeLabels/sigma.canvas.edges.labels.curvedArrow', './lib/sigma/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes', './lib/sigma/plugins/sigma.layouts.forceAtlas2/supervisor', './lib/sigma/plugins/sigma.layouts.forceAtlas2/worker'], function (_export, _context) {
  "use strict";

  var _, $;

  function link(scope, elem, attrs, ctrl) {
    var data = ctrl.data,
        panel = ctrl.panel;
    elem = elem.find('.topology-panel__chart');

    ctrl.events.on('render', function () {
      render(false);
      /*
      if (panel) {
        setTimeout(function () { render(true); }, 50);
      }
      */
    });

    function noDataPoints() {
      var html = '<div class="datapoints-warning"><span class="small">No data points</span></div>';
      elem.html(html);
    }

    function addTopology() {
      elem.html('');

      var s = new sigma({
        graph: ctrl.panel.graph,
        renderer: {
          container: document.getElementById('topology-panel-chart'),
          type: 'canvas'
        },
        settings: {
          doubleClickEnabled: false,
          edgeLabelSize: ctrl.panel.edgeLabelSize,
          enableEdgeHovering: true,
          edgeHoverColor: 'edge',
          defaultEdgeHoverColor: '#000',
          edgeHoverSizeRatio: 1,
          edgeHoverExtremities: true,
          minEdgeSize: ctrl.panel.minEdgeSize,
          minNodeSize: ctrl.panel.minNodeSize
        }
      });
      if (ctrl.panel.draggable) {
        sigma.plugins.dragNodes(s, s.renderers[0]);
      }
      if (ctrl.panel.filterMode === 'nodes' || ctrl.panel.filterMode === 'both') {
        s.bind('doubleClickNode', function (e) {
          var variableSrv = ctrl.$injector.get('variableSrv');
          variableSrv.setAdhocFilter({
            datasource: ctrl.panel.datasource,
            key: ctrl.panel.srcNode,
            value: e.data.node.id,
            operator: '='
          });
        });
      }
      if (ctrl.panel.filterMode === 'edges' || ctrl.panel.filterMode === 'both') {
        s.bind('doubleClickEdge', function (e) {
          var variableSrv = ctrl.$injector.get('variableSrv');
          variableSrv.setAdhocFilter({
            datasource: ctrl.panel.datasource,
            key: ctrl.panel.srcNode,
            value: e.data.edge.source,
            operator: '='
          });
          variableSrv.setAdhocFilter({
            datasource: ctrl.panel.datasource,
            key: ctrl.panel.dstNode,
            value: e.data.edge.target,
            operator: '='
          });
        });
      }
      if (ctrl.panel.trackable) {
        s.startForceAtlas2({ worker: true, barnesHutOptimize: true, linLogMode: true, strongGravityMode: true });
        setTimeout(function () {
          s.killForceAtlas2();
        }, 1000);
      }
    }

    function render(incrementRenderCounter) {
      if (!ctrl.data) {
        return;
      }

      data = ctrl.data;
      panel = ctrl.panel;

      if (0 == ctrl.data.length) {
        noDataPoints();
      } else {
        addTopology();
      }

      if (incrementRenderCounter) {
        ctrl.renderingCompleted();
      }
    }
  }

  _export('default', link);

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_jqueryFlot) {}, function (_jqueryFlotPie) {}, function (_libSigmaSrcSigmaCore) {}, function (_libSigmaSrcConrad) {}, function (_libSigmaSrcUtilsSigmaUtils) {}, function (_libSigmaSrcUtilsSigmaPolyfills) {}, function (_libSigmaSrcSigmaSettings) {}, function (_libSigmaSrcClassesSigmaClassesDispatcher) {}, function (_libSigmaSrcClassesSigmaClassesConfigurable) {}, function (_libSigmaSrcClassesSigmaClassesGraph) {}, function (_libSigmaSrcClassesSigmaClassesCamera) {}, function (_libSigmaSrcClassesSigmaClassesQuad) {}, function (_libSigmaSrcCaptorsSigmaCaptorsMouse) {}, function (_libSigmaSrcCaptorsSigmaCaptorsTouch) {}, function (_libSigmaSrcRenderersSigmaRenderersCanvas) {}, function (_libSigmaSrcRenderersSigmaRenderersWebgl) {}, function (_libSigmaSrcRenderersSigmaRenderersSvg) {}, function (_libSigmaSrcRenderersSigmaRenderersDef) {}, function (_libSigmaSrcRenderersWebglSigmaWebglNodesDef) {}, function (_libSigmaSrcRenderersWebglSigmaWebglNodesFast) {}, function (_libSigmaSrcRenderersWebglSigmaWebglEdgesDef) {}, function (_libSigmaSrcRenderersWebglSigmaWebglEdgesFast) {}, function (_libSigmaSrcRenderersWebglSigmaWebglEdgesArrow) {}, function (_libSigmaSrcRenderersCanvasSigmaCanvasLabelsDef) {}, function (_libSigmaSrcRenderersCanvasSigmaCanvasHoversDef) {}, function (_libSigmaSrcRenderersCanvasSigmaCanvasNodesDef) {}, function (_libSigmaSrcRenderersCanvasSigmaCanvasEdgesDef) {}, function (_libSigmaSrcRenderersCanvasSigmaCanvasEdgesCurve) {}, function (_libSigmaSrcRenderersCanvasSigmaCanvasEdgesArrow) {}, function (_libSigmaSrcRenderersCanvasSigmaCanvasEdgesCurvedArrow) {}, function (_libSigmaSrcRenderersCanvasSigmaCanvasEdgehoversDef) {}, function (_libSigmaSrcRenderersCanvasSigmaCanvasEdgehoversCurve) {}, function (_libSigmaSrcRenderersCanvasSigmaCanvasEdgehoversArrow) {}, function (_libSigmaSrcRenderersCanvasSigmaCanvasEdgehoversCurvedArrow) {}, function (_libSigmaSrcRenderersCanvasSigmaCanvasExtremitiesDef) {}, function (_libSigmaSrcRenderersSvgSigmaSvgUtils) {}, function (_libSigmaSrcRenderersSvgSigmaSvgNodesDef) {}, function (_libSigmaSrcRenderersSvgSigmaSvgEdgesDef) {}, function (_libSigmaSrcRenderersSvgSigmaSvgEdgesCurve) {}, function (_libSigmaSrcRenderersSvgSigmaSvgEdgesCurvedArrow) {}, function (_libSigmaSrcRenderersSvgSigmaSvgLabelsDef) {}, function (_libSigmaSrcRenderersSvgSigmaSvgHoversDef) {}, function (_libSigmaSrcMiddlewaresSigmaMiddlewaresRescale) {}, function (_libSigmaSrcMiddlewaresSigmaMiddlewaresCopy) {}, function (_libSigmaSrcMiscSigmaMiscAnimation) {}, function (_libSigmaSrcMiscSigmaMiscBindEvents) {}, function (_libSigmaSrcMiscSigmaMiscBindDOMEvents) {}, function (_libSigmaSrcMiscSigmaMiscDrawHovers) {}, function (_libSigmaPluginsSigmaHelpersGraphSigmaHelpersGraph) {}, function (_libSigmaPluginsSigmaRenderersEdgeLabelsSettings) {}, function (_libSigmaPluginsSigmaRenderersEdgeLabelsSigmaCanvasEdgesLabelsDef) {}, function (_libSigmaPluginsSigmaRenderersEdgeLabelsSigmaCanvasEdgesLabelsCurve) {}, function (_libSigmaPluginsSigmaRenderersEdgeLabelsSigmaCanvasEdgesLabelsCurvedArrow) {}, function (_libSigmaPluginsSigmaPluginsDragNodesSigmaPluginsDragNodes) {}, function (_libSigmaPluginsSigmaLayoutsForceAtlas2Supervisor) {}, function (_libSigmaPluginsSigmaLayoutsForceAtlas2Worker) {}],
    execute: function () {}
  };
});
//# sourceMappingURL=rendering.js.map
