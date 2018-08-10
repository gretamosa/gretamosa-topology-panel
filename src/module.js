import { TopologyCtrl } from './topology_ctrl';
import { loadPluginCss } from 'app/plugins/sdk';

loadPluginCss({
  dark: 'plugins/gretamosa-topology-panel/css/topology.dark.css',
  light: 'plugins/gretamosa-topology-panel/css/topology.light.css',
});

export { TopologyCtrl as PanelCtrl };
