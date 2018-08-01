import { MetricsPanelCtrl } from 'app/plugins/sdk';
import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import rendering from './rendering';

export class TopologyCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector, $rootScope) {
    super($scope, $injector);
    this.$rootScope = $rootScope;
    var panelDefaults = {
      links: [],
      datasource: null,
      maxDataPoints: 3,
      interval: null,
      targets: [{}],
      cacheTimeout: null,

      graph: {
        nodes: [],
        edges: [],
      },
      minEdgeSize: 4,
      minNodeSize: 4,
      edgeType: 'curvedArrow',
      edgeLabelSize: 'proportional',
      draggable: false,
      trackable: false,
      filterMode: null,
      showEdgeLabels: false,
      varList: [],
      edgeWeight: null,
      dstNode: null,
      srcNode: null,
      colorNode: null,

      colorMode: null,
      colors: ['rgba(245, 54, 54, 0.9)', 'rgba(237, 129, 40, 0.89)', 'rgba(50, 172, 45, 0.97)'],
      thresholds: [],
    };

    _.defaults(this.panel, panelDefaults);

    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('refresh', this.onRefresh.bind(this));
  }

  onRefresh() {
    this.loadTemplatingVars();
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/topology-panel/editor.html', 2);
    this.unitFormats = kbn.getUnitFormats();
    this.loadTemplatingVars();
  }

  onDataError() {
    this.data = []; 
    this.graph = { nodes: [], edges: [] };
    this.render();
  }

  onDataReceived(dataList) {
    var thisArg = this;

    if (thisArg.datasource.meta.id === 'elasticsearch') {
      dataList.forEach((el) => {
        if (el.hasOwnProperty('datapoints') && el.datapoints !== thisArg.data) {
          thisArg.data = el.datapoints;
        }
      });
    } else if (thisArg.datasource.meta.id === 'influxdb') {
      thisArg.data = [];
      dataList.forEach((el) => {
        if (el.hasOwnProperty('datapoints')) {
          el.datapoints.forEach((it,idx) => {
            if (!thisArg.data[idx]) {
              thisArg.data[idx] = {};
            }
            const regex = /(\S+)(\.)(\S+)/gmi;
            const m = regex.exec(el.target);
            thisArg.data[idx][(m!==null?m[3]:el.target)] = it[0];
          }); 
        }
      });
    }
    thisArg.parseGraph(thisArg.data);
    thisArg.render();
  }

  link(scope, elem, attrs, ctrl) {
    rendering(scope, elem, attrs, ctrl);
  }

  nameToColor(str) {
    if (str) {
      var hash = 0, s=30, l=50;
      for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }

      var h = hash % 360;
      return 'hsl('+h+', '+s+'%, '+l+'%)';
    } else {
      return '#666666';
    }
  }

  parseGraph(data) {
    let thisArg = this;

    thisArg.panel.graph.nodes = [];
    thisArg.panel.graph.edges = [];
    _.forEach(data, (item) => {
      var idx = _.findIndex(thisArg.panel.graph.nodes, node => { return item[thisArg.panel.srcNode] === node.id; });
      if (idx == -1) {
        var _label = (thisArg.panel.colorNode?item[thisArg.panel.colorNode]+': '+item[thisArg.panel.srcNode]:item[thisArg.panel.srcNode]);
        thisArg.panel.graph.nodes.push({
          id: item[thisArg.panel.srcNode],
          label: _label,
          x: Math.random(),
          y: Math.random(),
          size: parseInt(item[thisArg.panel.edgeWeight]),
          color: thisArg.nameToColor(_label),
        });
        thisArg.handleThresholdColor('nodes',idx);
      } else {
        thisArg.panel.graph.nodes[idx].size+=parseInt(item[thisArg.panel.edgeWeight]);
        thisArg.handleThresholdColor('nodes',idx);
      }
      idx = _.findIndex(thisArg.panel.graph.nodes, node => { return item[thisArg.panel.dstNode] === node.id; });
      if (idx == -1) {
        var _label = (thisArg.panel.colorNode?item[thisArg.panel.colorNode]+': '+item[thisArg.panel.srcNode]:item[thisArg.panel.dstNode]);
        thisArg.panel.graph.nodes.push({
          id: item[thisArg.panel.dstNode],
          label: _label,
          x: Math.random(),
          y: Math.random(),
          size: parseInt(item[thisArg.panel.edgeWeight]),
          color: thisArg.nameToColor(_label),
        });
        thisArg.handleThresholdColor('nodes',idx);
      } else {
        thisArg.panel.graph.nodes[idx].size+=parseInt(item[thisArg.panel.edgeWeight]);
        thisArg.handleThresholdColor('nodes',idx);
      }
      idx = _.findIndex(thisArg.panel.graph.edges, edge => { return item[thisArg.panel.srcNode]+'_'+item[thisArg.panel.dstNode] === edge.id; });
      if (idx == -1) {
        thisArg.panel.graph.edges.push({
          id: item[thisArg.panel.srcNode]+'_'+item[thisArg.panel.dstNode],
          source: item[thisArg.panel.srcNode],
          target: item[thisArg.panel.dstNode],
          label: (thisArg.panel.showEdgeLabels?thisArg.panel.edgeWeight+':'+parseInt(item[thisArg.panel.edgeWeight]):''),
          size: parseInt(item[thisArg.panel.edgeWeight]),
          type: thisArg.panel.edgeType,
          color: '#ccc',
          hover_color: '#000',
        });
        thisArg.handleThresholdColor('edges',idx);
      } else {
        thisArg.panel.graph.edges[idx].size+=parseInt(item[thisArg.panel.edgeWeight]);
        if (thisArg.panel.showEdgeLabels) {
          thisArg.panel.graph.edges[idx].label=thisArg.panel.edgeWeight+':'+thisArg.panel.graph.edges[idx].size;
        }
        thisArg.handleThresholdColor('edges',idx);
      }
    }); 
  }

  handleThresholdColor(_type, _idx) {
    if (_type === this.panel.colorMode && this.panel.thresholds.length > 0) {
      var _fidx = _idx == -1 ? this.panel.graph[_type].length-1 : _idx;
      var _lidx = this.panel.thresholds.findIndex((el) => {
        return this.panel.graph[_type][_fidx].size < el;
      });
      _lidx = _lidx == -1 ? this.panel.thresholds.length : _lidx;
      this.panel.graph[_type][_fidx].color = this.panel.colors[_lidx];
    }
  }

  invertColorOrder() {
    var ref = this.panel.colors;
    var copy = ref[0];
    ref[0] = ref[2];
    ref[2] = copy;
    this.render();
  }

  onColorChange(colorIndex) {
    var thisArg = this;
    return newColor => {
      thisArg.panel.colors[colorIndex] = newColor;
      thisArg.render();
    };
  }

  async load_vars(el, d) {
    var x, varlist = [''];
    if (d.meta.id === 'elasticsearch' && typeof d.getFields === 'function') {
      x = await d.getFields({});
      x.forEach((it) => { varlist.push(it.text); });
    } else if (d.meta.id === 'influxdb') {
      // Only one measurement is allowed
      x = await d.metricFindQuery('SHOW FIELD KEYS ON '+d.database+' FROM '+el.panel.targets[0].measurement);
      x.forEach((it) => { varlist.push(it.text); });
    }
    if (!_.isEqual(varlist, el.panel.varList)) {
      el.panel.varList = varlist;
    }
  }

  loadTemplatingVars() {
    let thisArg = this;

    if (thisArg.panel.datasource) {
      thisArg.datasourceSrv.get(thisArg.panel.datasource).then(
        function(datasource) {
          thisArg.load_vars(thisArg, datasource);
        }.bind(thisArg),
        function(err) {
          console.log(err);
        }
      );
    }
  }
}

TopologyCtrl.templateUrl = 'module.html';
