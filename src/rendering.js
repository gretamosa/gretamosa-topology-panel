import _ from 'lodash';
import $ from 'jquery';
import 'jquery.flot';
import 'jquery.flot.pie';

import './lib/sigma/src/sigma.core';
import './lib/sigma/src/conrad';
import './lib/sigma/src/utils/sigma.utils';
import './lib/sigma/src/utils/sigma.polyfills';
import './lib/sigma/src/sigma.settings';
import './lib/sigma/src/classes/sigma.classes.dispatcher';
import './lib/sigma/src/classes/sigma.classes.configurable';
import './lib/sigma/src/classes/sigma.classes.graph';
import './lib/sigma/src/classes/sigma.classes.camera';
import './lib/sigma/src/classes/sigma.classes.quad';
import './lib/sigma/src/captors/sigma.captors.mouse';
import './lib/sigma/src/captors/sigma.captors.touch';
import './lib/sigma/src/renderers/sigma.renderers.canvas';
import './lib/sigma/src/renderers/sigma.renderers.webgl';
import './lib/sigma/src/renderers/sigma.renderers.svg';
import './lib/sigma/src/renderers/sigma.renderers.def';
import './lib/sigma/src/renderers/webgl/sigma.webgl.nodes.def';
import './lib/sigma/src/renderers/webgl/sigma.webgl.nodes.fast';
import './lib/sigma/src/renderers/webgl/sigma.webgl.edges.def';
import './lib/sigma/src/renderers/webgl/sigma.webgl.edges.fast';
import './lib/sigma/src/renderers/webgl/sigma.webgl.edges.arrow';
import './lib/sigma/src/renderers/canvas/sigma.canvas.labels.def';
import './lib/sigma/src/renderers/canvas/sigma.canvas.hovers.def';
import './lib/sigma/src/renderers/canvas/sigma.canvas.nodes.def';
import './lib/sigma/src/renderers/canvas/sigma.canvas.edges.def';
import './lib/sigma/src/renderers/canvas/sigma.canvas.edges.curve';
import './lib/sigma/src/renderers/canvas/sigma.canvas.edges.arrow';
import './lib/sigma/src/renderers/canvas/sigma.canvas.edges.curvedArrow';
import './lib/sigma/src/renderers/canvas/sigma.canvas.edgehovers.def';
import './lib/sigma/src/renderers/canvas/sigma.canvas.edgehovers.curve';
import './lib/sigma/src/renderers/canvas/sigma.canvas.edgehovers.arrow';
import './lib/sigma/src/renderers/canvas/sigma.canvas.edgehovers.curvedArrow';
import './lib/sigma/src/renderers/canvas/sigma.canvas.extremities.def';
import './lib/sigma/src/renderers/svg/sigma.svg.utils';
import './lib/sigma/src/renderers/svg/sigma.svg.nodes.def';
import './lib/sigma/src/renderers/svg/sigma.svg.edges.def';
import './lib/sigma/src/renderers/svg/sigma.svg.edges.curve';
import './lib/sigma/src/renderers/svg/sigma.svg.edges.curvedArrow';
import './lib/sigma/src/renderers/svg/sigma.svg.labels.def';
import './lib/sigma/src/renderers/svg/sigma.svg.hovers.def';
import './lib/sigma/src/middlewares/sigma.middlewares.rescale';
import './lib/sigma/src/middlewares/sigma.middlewares.copy';
import './lib/sigma/src/misc/sigma.misc.animation';
import './lib/sigma/src/misc/sigma.misc.bindEvents';
import './lib/sigma/src/misc/sigma.misc.bindDOMEvents';
import './lib/sigma/src/misc/sigma.misc.drawHovers';

import './lib/sigma/plugins/sigma.helpers.graph/sigma.helpers.graph';
import './lib/sigma/plugins/sigma.renderers.edgeLabels/settings';
import './lib/sigma/plugins/sigma.renderers.edgeLabels/sigma.canvas.edges.labels.def';
import './lib/sigma/plugins/sigma.renderers.edgeLabels/sigma.canvas.edges.labels.curve';
import './lib/sigma/plugins/sigma.renderers.edgeLabels/sigma.canvas.edges.labels.curvedArrow';

import './lib/sigma/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes';
import './lib/sigma/plugins/sigma.layouts.forceAtlas2/supervisor';
import './lib/sigma/plugins/sigma.layouts.forceAtlas2/worker';

export default function link(scope, elem, attrs, ctrl) {
  var data = ctrl.data, panel = ctrl.panel;
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
        type: 'canvas',
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
        minNodeSize: ctrl.panel.minNodeSize,
      }
    });
    if (ctrl.panel.draggable) {
      sigma.plugins.dragNodes(s, s.renderers[0])
    }
    if (ctrl.panel.filterMode === 'nodes' || ctrl.panel.filterMode === 'both') {
      s.bind('doubleClickNode', function(e) {
        var variableSrv = ctrl.$injector.get('variableSrv');
        variableSrv.setAdhocFilter({
          datasource: ctrl.panel.datasource,
          key: ctrl.panel.srcNode,
          value: e.data.node.id,
          operator: '=',
        });
      });
    }
    if (ctrl.panel.filterMode === 'edges' || ctrl.panel.filterMode === 'both') {
      s.bind('doubleClickEdge', function(e) {
        var variableSrv = ctrl.$injector.get('variableSrv');
        variableSrv.setAdhocFilter({
          datasource: ctrl.panel.datasource,
          key: ctrl.panel.srcNode,
          value: e.data.edge.source,
          operator: '=',
        });
        variableSrv.setAdhocFilter({
          datasource: ctrl.panel.datasource,
          key: ctrl.panel.dstNode,
          value: e.data.edge.target,
          operator: '=',
        });
      });
    }
    if (ctrl.panel.trackable) {
      s.startForceAtlas2({worker: true, barnesHutOptimize: true, linLogMode: true, strongGravityMode: true});
      setTimeout(function() { s.killForceAtlas2(); }, 1000);
    }
  }

  function render(incrementRenderCounter) {
    if (!ctrl.data) { return; }

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

