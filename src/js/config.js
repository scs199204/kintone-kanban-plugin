import { createApp } from 'vue';
import kintoneKanbanConfigApp from '../components/kintoneKanbanConfigApp.vue';

(async function (PLUGIN_ID) {
  'use strict';
  const config = kintone.plugin.app.getConfig(PLUGIN_ID);

  // Vueコンポーネントに渡す初期データとオプション
  const initialConfig = {
    fieldCode: config.fieldCode || '',
    detail: config.detail || '',
    dateField: config.dateField || '',
    dateType: config.dateType || '',
    textColorChange: config.textColorChange || 'false',
    kanban: config.kanban
      ? JSON.parse(config.kanban)
      : [
          { title: '', boardColor: '' },
          { title: '', boardColor: '' },
          { title: '', boardColor: '' },
          { title: '', boardColor: '' },
          { title: '', boardColor: '' },
        ],
  };

  let appElement = document.getElementById('app');
  if (!appElement) {
    appElement = document.createElement('div');
    appElement.id = 'app';
    document.body.appendChild(appElement);
  }
  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  //Vueのオブジェクト作成 (setup 関数は async にしない)
  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  const app = createApp(kintoneKanbanConfigApp, {
    initialConfig: initialConfig,
  });
  const vm = app.mount('#app');
})(kintone.$PLUGIN_ID);
