import { KintoneRestAPIClient } from '@kintone/rest-api-client';
(function (PLUGIN_ID) {
  'use strict';
  const CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
  if (!CONFIG) return;

  const client = new KintoneRestAPIClient();
  const config = {
    fieldCode: CONFIG.fieldCode ?? '',
    detailField: CONFIG.detail ?? '',
    dateField: CONFIG.dateField ?? '',
    dateType: CONFIG.dateType ?? 'DATE',
    textColorChange: CONFIG.textColorChange ?? 'false',
    kanban: CONFIG.kanban ? JSON.parse(CONFIG.kanban) : Array.from({ length: 5 }, () => ({ title: '', boardColor: '' })), //初期値の配列を作成
  };

  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  // レコード一覧画面表示イベント
  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  kintone.events.on('app.record.index.show', (event) => {
    if (event.viewName !== 'カンバン') return event;

    const records = event.records;
    const canvas = document.getElementById('kanban-canvas');
    if (!canvas) return event;
    canvas.innerHTML = '';

    const boards = buildBoards(config.kanban, records, config);
    renderKanban(boards, client, config);

    return event;
  });

  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  /** カンバン列データ生成
   * @param {object} kanbanConfig CONFIG.kanban
   * @param {object} records kintoneレコード
   * @param {object} config CONFIG
   * @returns
   */
  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  function buildBoards(kanbanConfig, records, config) {
    const { fieldCode, detailField, dateField, dateType, textColorChange } = config;
    const boards = {};

    // カンバン列を初期化
    for (const item of kanbanConfig) {
      if (item.title) {
        boards[item.title] = {
          id: item.title,
          title: item.title,
          class: item.boardColor,
          item: [],
        };
      }
    }

    // レコードを各列に振り分け
    for (const rec of records) {
      const category = rec[fieldCode]?.value;
      let detail = rec[detailField]?.value;
      if (textColorChange.toUpperCase() == 'TRUE' && isTextColorChange(rec[dateField]?.value, dateType)) {
        detail = "<span class='text-red text-bold'>" + detail + '</span>';
      }
      const recordId = rec.$id.value;
      const revision = rec.$revision.value;
      const localDateTime = convertUtcToLocalDatetimeInput(rec[dateField]?.value);
      const targetDate = dateField ? localDateTime || '' : '';

      if (!boards[category]) continue;
      boards[category].item.push({
        recordno: recordId,
        revision,
        title: detail,
        record: JSON.stringify(rec),
        targetdate: targetDate,
      });
    }
    return Object.values(boards);
  }

  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  /** jKanban表示設定
   * @param {object} boards カンバンのボード
   * @param {object} client KintoneRestAPIClient
   * @param {object} config CONFIG
   */
  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  function renderKanban(boards, client, config) {
    const kanban = new jKanban({
      element: '#kanban-canvas',
      boards,
      gutter: '16px',
      responsivePercentage: true,
      dragItems: true,
      dragBoards: true,

      click: (el) => handleCardClick(el),
      context: (el, event) => handleCardContext(el, event, client, config),
      dropEl: (el, target, source, sibling) => handleCardDrop(el, target, source, client, config),
    });

    // スタイル適用（data-class対応）class属性→data-class→dataset.class→classListに追加
    document.querySelectorAll('.kanban-item').forEach((item) => {
      if (item.dataset.class) {
        item.dataset.class.split(',').forEach((cls) => item.classList.add(cls));
      }
    });
  }

  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  /** カードクリック → レコード詳細画面へ
   * @param {object} el クリックした要素
   * @returns
   */
  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  function handleCardClick(el) {
    const recordId = el.dataset.recordno;
    const appId = kintone.app.getId();
    if (!recordId || !appId) return showMessage('レコードIDが取得できません。');

    const url = `https://${location.host}/k/${appId}/show#record=${recordId}`;
    window.location.href = url;
  }

  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  /** カードドラッグ＆ドロップ時 → レコード更新
   * @param {object} el ドロップしたオブジェクト
   * @param {object} target 移動先のカラム
   * @param {object} source 移動元のカラム
   * @param {object} client KintoneRestAPIClient
   * @param {object} config CONFIG
   */
  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  async function handleCardDrop(el, target, source, client, config) {
    const targetTitle = target.parentNode.querySelector('header').innerText;
    const recordId = el.dataset.recordno;
    const revision = el.dataset.revision;

    try {
      const param = {
        app: kintone.app.getId(),
        id: recordId,
        revision,
        record: { [config.fieldCode]: { value: targetTitle } },
      };
      const res = await client.record.updateRecord(param);
      el.dataset.revision = res.revision;
      showMessage(`カードを「${targetTitle}」へ移動しました。`);
    } catch (err) {
      await handleApiError('レコード更新エラー', err);
    }
  }

  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  /** カード右クリック → 日付変更ダイアログ
   * @param {object} el 右クリックした要素
   * @param {object} event イベントオブジェクト
   * @param {object} client KintoneRestAPIClient
   * @param {object} config CONFIG
   * @returns
   */
  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  async function handleCardContext(el, event, client, config) {
    const { dateField, detailField, dateType, textColorChange } = config;
    if (!dateField) return;

    const recordId = el.dataset.recordno;
    const revision = el.dataset.revision;
    const currentDate = el.dataset.targetdate;

    const input = createDateInput(dateField, currentDate, config);
    const dialogConfig = {
      title: `${dateField} の更新`,
      body: input.parentElement,
      showOkButton: true,
      okButtonText: '更新',
      showCancelButton: true,
      cancelButtonText: 'キャンセル',
      beforeClose: async (actionType) => {
        if (actionType.toUpperCase() !== 'OK') return true;
        try {
          const newDate = convertLocalDatetimeInputToUtc(sanitize(input.value));
          const param = {
            app: kintone.app.getId(),
            id: recordId,
            revision,
            record: { [dateField]: { value: newDate } },
          };
          const resUpdate = await client.record.updateRecord(param);
          const resGet = await client.record.getRecord({ app: kintone.app.getId(), id: recordId });
          const updated = resGet.record;

          // DOM更新
          el.dataset.revision = resUpdate.revision;
          el.dataset.targetdate = convertUtcToLocalDatetimeInput(updated[dateField].value);
          const span = document.createElement('span'); //クラスを設定するための要素追加
          if (textColorChange.toUpperCase() == 'TRUE' && isTextColorChange(updated[dateField].value, dateType)) {
            span.classList.add('text-red', 'text-bold'); //文字色を赤、太字にする
          }
          span.innerHTML = updated[detailField].value;
          el.innerText = ''; //増殖防止
          el.appendChild(span); //要素追加
          //el.innerText = updated[detailField].value;
          showMessage(`日付を「${newDate}」に更新しました。`);
        } catch (err) {
          await handleApiError('日付更新エラー', err);
        }
        return true;
      },
    };

    const dialog = await kintone.createDialog(dialogConfig);
    await dialog.show();
  }

  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  /** ダイアログの要素作成(タイトル、DatePicker)
   * @param {string} labelText 更新するフィールド名
   * @param {string} [initialValue=''] ダイアログの初期値
   * @returns {object} wrapperの子要素の、DatePicker
   */
  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  function createDateInput(labelText, initialValue = '', config) {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '8px';

    const label = document.createElement('span');
    label.textContent = `${labelText}を更新`;
    label.style.padding = '10px';

    const input = document.createElement('input');
    if (config.dateType == 'DATETIME') {
      input.type = 'datetime-local';
    } else {
      input.type = 'date';
    }
    input.value = initialValue;
    input.style.padding = '6px';

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    return input;
  }

  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  //★　サニタイズ処理
  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  function sanitize(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  //★　メッセージの表示
  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  function showMessage(msg) {
    const el = document.getElementById('show-message');
    if (el) el.innerHTML = sanitize(msg);
  }

  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  /** エラーに際にダイアログを表示する
   * @param {string} title ダイアログのタイトル
   * @param {object} error エラーオブジェクト
   */
  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  async function handleApiError(title, error) {
    console.error(`${title}:`, error);
    await kintone.showConfirmDialog({
      title,
      body: `エラー: ${error.message}`,
      showOkButton: true,
      showCancelButton: false,
    });
    location.reload();
  }

  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  /** UTC形式の文字列をdatetime-local表示用のローカルな日時文字列に変換する('2025-10-09T15:00:00Z'(UTC)->'2025-10-10T00:00:00'(JSTローカル))
   * @param {string} utcString - UTC形式の日時文字列 ('YYYY-MM-DDTHH:mm:ssZ' または 'YYYY-MM-DDTHH:mm:ss+00:00' 形式)
   * @returns {string} - datetime-localに設定可能な 'YYYY-MM-DDTHH:mm:ss' 形式の文字列
   */
  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  const convertUtcToLocalDatetimeInput = (utcString) => {
    if (!utcString) return '';
    const date = new Date(utcString); // DateオブジェクトはUTC文字列を与えると、それをローカル時刻に変換して保持する
    // タイムゾーンの変換が失敗した場合 (例: 不正な形式)、Invalid Dateになる
    if (isNaN(date.getTime())) {
      console.error('不正な日時形式です:', utcString);
      return '';
    }

    // ローカル年、月、日、時、分を取得(getFullYear() や getHours() などは、ブラウザのローカルタイムゾーンでの値を返す)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0'); // 秒まで対応させる

    return `${year}-${month}-${day}T${hour}:${minute}:${second}`; // datetime-localが期待する形式: YYYY-MM-DDTHH:mm:ss (タイムゾーン情報なし)
  };

  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  /** datetime-localから取得したローカル日時文字列をUTC形式に変換する('2025-10-10T00:00:00'(JSTローカル)->'2025-10-09T15:00:00Z'(UTC))
   * @param {string} localString - datetime-localから取得した 'YYYY-MM-DDTHH:mm:ss' 形式の文字列
   * @returns {string} - kintoneの日時フィールドにセット可能な 'YYYY-MM-DDTHH:mm:ssZ' 形式の文字列
   */
  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  const convertLocalDatetimeInputToUtc = (localString) => {
    if (!localString) return '';
    const date = new Date(localString); // ローカル日時文字列をDateオブジェクトに渡すと、ブラウザのローカルタイムゾーンの日時として解釈される

    if (isNaN(date.getTime())) {
      console.error('不正な日時形式です:', localString);
      return '';
    }

    // toISOString() は、Dateオブジェクトが保持する時間をUTC形式のISO 8601文字列に変換する(ただし、秒以下(ミリ秒)が付加されるため、秒までで切り詰める)
    // 例: '2025-10-09T15:00:00.000Z' -> '2025-10-09T15:00:00Z'
    return date.toISOString().split('.')[0] + 'Z';
  };

  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  /** 文字色を赤に変える対象条件の判定
   * @param {string} targetDate kintoneのフィールド(日付、日時)
   * @param {string} dateType 日付フィールドの場合'DATE'、日時フィールドの場合'DATETIME'
   * @returns {boolean} true：対象　false：対象ではない
   */
  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  const isTextColorChange = (targetDate, dateType) => {
    if (!targetDate) {
      return false;
    }
    let kintoneDate;
    let currentDate;

    const now = new Date();
    if (dateType == 'DATE') {
      kintoneDate = targetDate;
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため +1 する
      const date = String(now.getDate()).padStart(2, '0');
      currentDate = `${year}-${month}-${date}`; // 'YYYY-MM-DD' 形式の文字列を作成
    } else {
      const kintoneDateTime = new Date(targetDate);
      kintoneDate = kintoneDateTime.getTime();
      currentDate = now.getTime();
    }

    if (kintoneDate > currentDate) {
      return false;
    } else {
      return true;
    }
  };
})(kintone.$PLUGIN_ID);
