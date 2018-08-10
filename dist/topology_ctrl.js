'use strict';

System.register(['app/plugins/sdk', 'lodash', 'app/core/utils/kbn', './rendering'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _, kbn, rendering, _createClass, TopologyCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_rendering) {
      rendering = _rendering.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('TopologyCtrl', TopologyCtrl = function (_MetricsPanelCtrl) {
        _inherits(TopologyCtrl, _MetricsPanelCtrl);

        function TopologyCtrl($scope, $injector, $rootScope) {
          _classCallCheck(this, TopologyCtrl);

          var _this = _possibleConstructorReturn(this, (TopologyCtrl.__proto__ || Object.getPrototypeOf(TopologyCtrl)).call(this, $scope, $injector));

          _this.$rootScope = $rootScope;
          var panelDefaults = {
            links: [],
            datasource: null,
            maxDataPoints: 3,
            interval: null,
            targets: [{}],
            cacheTimeout: null,

            graph: {
              nodes: [],
              edges: []
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
            thresholds: []
          };

          _.defaults(_this.panel, panelDefaults);

          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-error', _this.onDataError.bind(_this));
          _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('refresh', _this.onRefresh.bind(_this));
          return _this;
        }

        _createClass(TopologyCtrl, [{
          key: 'onRefresh',
          value: function onRefresh() {
            this.loadTemplatingVars();
          }
        }, {
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/gretamosa-topology-panel/editor.html', 2);
            this.unitFormats = kbn.getUnitFormats();
            this.loadTemplatingVars();
          }
        }, {
          key: 'onDataError',
          value: function onDataError() {
            this.data = [];
            this.graph = { nodes: [], edges: [] };
            this.render();
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            var thisArg = this;

            if (thisArg.datasource.meta.id === 'elasticsearch') {
              dataList.forEach(function (el) {
                if (el.hasOwnProperty('datapoints') && el.datapoints !== thisArg.data) {
                  thisArg.data = el.datapoints;
                }
              });
            } else if (thisArg.datasource.meta.id === 'influxdb') {
              thisArg.data = [];
              dataList.forEach(function (el) {
                if (el.hasOwnProperty('datapoints')) {
                  el.datapoints.forEach(function (it, idx) {
                    if (!thisArg.data[idx]) {
                      thisArg.data[idx] = {};
                    }
                    var regex = /(\S+)(\.)(\S+)/gmi;
                    var m = regex.exec(el.target);
                    thisArg.data[idx][m !== null ? m[3] : el.target] = it[0];
                  });
                }
              });
            }
            thisArg.parseGraph(thisArg.data);
            thisArg.render();
          }
        }, {
          key: 'link',
          value: function link(scope, elem, attrs, ctrl) {
            rendering(scope, elem, attrs, ctrl);
          }
        }, {
          key: 'nameToColor',
          value: function nameToColor(str) {
            if (str) {
              var hash = 0,
                  s = 30,
                  l = 50;
              for (var i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
              }

              var h = hash % 360;
              return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
            } else {
              return '#666666';
            }
          }
        }, {
          key: 'parseGraph',
          value: function parseGraph(data) {
            var thisArg = this;

            thisArg.panel.graph.nodes = [];
            thisArg.panel.graph.edges = [];
            _.forEach(data, function (item) {
              var idx = _.findIndex(thisArg.panel.graph.nodes, function (node) {
                return item[thisArg.panel.srcNode] === node.id;
              });
              if (idx == -1) {
                var _label = thisArg.panel.colorNode ? item[thisArg.panel.colorNode] + ': ' + item[thisArg.panel.srcNode] : item[thisArg.panel.srcNode];
                thisArg.panel.graph.nodes.push({
                  id: item[thisArg.panel.srcNode],
                  label: _label,
                  x: Math.random(),
                  y: Math.random(),
                  size: parseInt(item[thisArg.panel.edgeWeight]),
                  color: thisArg.nameToColor(_label)
                });
                thisArg.handleThresholdColor('nodes', idx);
              } else {
                thisArg.panel.graph.nodes[idx].size += parseInt(item[thisArg.panel.edgeWeight]);
                thisArg.handleThresholdColor('nodes', idx);
              }
              idx = _.findIndex(thisArg.panel.graph.nodes, function (node) {
                return item[thisArg.panel.dstNode] === node.id;
              });
              if (idx == -1) {
                var _label = thisArg.panel.colorNode ? item[thisArg.panel.colorNode] + ': ' + item[thisArg.panel.srcNode] : item[thisArg.panel.dstNode];
                thisArg.panel.graph.nodes.push({
                  id: item[thisArg.panel.dstNode],
                  label: _label,
                  x: Math.random(),
                  y: Math.random(),
                  size: parseInt(item[thisArg.panel.edgeWeight]),
                  color: thisArg.nameToColor(_label)
                });
                thisArg.handleThresholdColor('nodes', idx);
              } else {
                thisArg.panel.graph.nodes[idx].size += parseInt(item[thisArg.panel.edgeWeight]);
                thisArg.handleThresholdColor('nodes', idx);
              }
              idx = _.findIndex(thisArg.panel.graph.edges, function (edge) {
                return item[thisArg.panel.srcNode] + '_' + item[thisArg.panel.dstNode] === edge.id;
              });
              if (idx == -1) {
                thisArg.panel.graph.edges.push({
                  id: item[thisArg.panel.srcNode] + '_' + item[thisArg.panel.dstNode],
                  source: item[thisArg.panel.srcNode],
                  target: item[thisArg.panel.dstNode],
                  label: thisArg.panel.showEdgeLabels ? thisArg.panel.edgeWeight + ':' + parseInt(item[thisArg.panel.edgeWeight]) : '',
                  size: parseInt(item[thisArg.panel.edgeWeight]),
                  type: thisArg.panel.edgeType,
                  color: '#ccc',
                  hover_color: '#000'
                });
                thisArg.handleThresholdColor('edges', idx);
              } else {
                thisArg.panel.graph.edges[idx].size += parseInt(item[thisArg.panel.edgeWeight]);
                if (thisArg.panel.showEdgeLabels) {
                  thisArg.panel.graph.edges[idx].label = thisArg.panel.edgeWeight + ':' + thisArg.panel.graph.edges[idx].size;
                }
                thisArg.handleThresholdColor('edges', idx);
              }
            });
          }
        }, {
          key: 'handleThresholdColor',
          value: function handleThresholdColor(_type, _idx) {
            var _this2 = this;

            if (_type === this.panel.colorMode && this.panel.thresholds.length > 0) {
              var _fidx = _idx == -1 ? this.panel.graph[_type].length - 1 : _idx;
              var _lidx = this.panel.thresholds.findIndex(function (el) {
                return _this2.panel.graph[_type][_fidx].size < el;
              });
              _lidx = _lidx == -1 ? this.panel.thresholds.length : _lidx;
              this.panel.graph[_type][_fidx].color = this.panel.colors[_lidx];
            }
          }
        }, {
          key: 'invertColorOrder',
          value: function invertColorOrder() {
            var ref = this.panel.colors;
            var copy = ref[0];
            ref[0] = ref[2];
            ref[2] = copy;
            this.render();
          }
        }, {
          key: 'onColorChange',
          value: function onColorChange(colorIndex) {
            var thisArg = this;
            return function (newColor) {
              thisArg.panel.colors[colorIndex] = newColor;
              thisArg.render();
            };
          }
        }, {
          key: 'load_vars',
          value: async function load_vars(el, d) {
            var x,
                varlist = [''];
            if (d.meta.id === 'elasticsearch' && typeof d.getFields === 'function') {
              x = await d.getFields({});
              x.forEach(function (it) {
                varlist.push(it.text);
              });
            } else if (d.meta.id === 'influxdb') {
              // Only one measurement is allowed
              x = await d.metricFindQuery('SHOW FIELD KEYS ON ' + d.database + ' FROM ' + el.panel.targets[0].measurement);
              x.forEach(function (it) {
                varlist.push(it.text);
              });
            }
            if (!_.isEqual(varlist, el.panel.varList)) {
              el.panel.varList = varlist;
            }
          }
        }, {
          key: 'loadTemplatingVars',
          value: function loadTemplatingVars() {
            var thisArg = this;

            if (thisArg.panel.datasource) {
              thisArg.datasourceSrv.get(thisArg.panel.datasource).then(function (datasource) {
                thisArg.load_vars(thisArg, datasource);
              }.bind(thisArg), function (err) {
                console.log(err);
              });
            }
          }
        }]);

        return TopologyCtrl;
      }(MetricsPanelCtrl));

      _export('TopologyCtrl', TopologyCtrl);

      TopologyCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=topology_ctrl.js.map
