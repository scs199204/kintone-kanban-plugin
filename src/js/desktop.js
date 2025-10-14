import { KintoneRestAPIClient } from '@kintone/rest-api-client';
(function (PLUGIN_ID) {
  'use strict';
  const client = new KintoneRestAPIClient();

  //CONFIG情報取得
  const CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
  if (!CONFIG) {
    return false;
  }
  const CONFIG_FIELDCODE = CONFIG.fieldCode;
  const CONFIG_DETAIL = CONFIG.detail;
  const CONFIG_DATE_FIELD = CONFIG.dateField;
  let CONFIG_KANBAN = CONFIG.kanban;

  if (!CONFIG_KANBAN) {
    CONFIG_KANBAN = [
      { title: '', boardColor: '' },
      { title: '', boardColor: '' },
      { title: '', boardColor: '' },
      { title: '', boardColor: '' },
      { title: '', boardColor: '' },
    ];
  } else {
    CONFIG_KANBAN = JSON.parse(CONFIG['kanban']);
  }

  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  //★　レコード一覧画面の表示
  //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  kintone.events.on('app.record.index.show', async (event) => {
    if (event.viewName != 'カンバン') {
      return event;
    }

    const records = event.records;
    if (document.getElementById('kanban-canvas')) {
      document.getElementById('kanban-canvas').innerHTML = '';
    }
    const kanbanObj = {}; //CONFIGからボード作成(カンバンの列)
    for (const item of CONFIG_KANBAN) {
      if (item.title) {
        kanbanObj[item.title] = {
          id: item.title,
          title: item.title,
          class: item.boardColor,
          item: [],
        };
      }
    }

    //kintoneレコードから、main(カンバンの行、カード)作成
    for (const rec of records) {
      const 区分 = rec[CONFIG_FIELDCODE].value;
      const detail = rec[CONFIG_DETAIL].value;
      const recordid = rec.$id.value;
      const revision = rec.$revision.value; //一覧を開いた時点のrevisionを退避
      const record = JSON.stringify(rec);
      let targetdate;
      if (!CONFIG_DATE_FIELD) {
        targetDate = '';
      } else {
        targetdate = rec[CONFIG_DATE_FIELD].value; //一覧を開いた時点の日付を退避
      }

      const addItem = {
        recordno: recordid,
        revision: revision,
        title: detail,
        record: record,
        targetdate: targetdate,
      };
      if (kanbanObj.hasOwnProperty(区分)) {
        kanbanObj[区分].item.push(addItem); //ドロップダウンの項目でCONFIGに設定されていない場合はカンバンを作成しない
      }
    }
    const dataContent = [];
    for (const item in kanbanObj) {
      dataContent.push(kanbanObj[item]); //ボードを配列に変換
    }

    // ここで jKanban を実行する
    const kanban = new jKanban({
      element: '#kanban-canvas', // カンバンを表示する場所のID
      boards: dataContent, // カンバンに表示されるカラムやカードのデータ
      gutter: '16px', // カンバンの余白
      widthBoard: '250px', // カラムの幅 (responsivePercentageの「true」設定により無視される)
      responsivePercentage: true, // trueを選択時はカラム幅は％で指定され、gutterとwidthBoardの設定は不要
      dragItems: true, // trueを選択時はカードをドラッグ可能
      dragBoards: true, // カラムをドラッグ可能にするかどうか

      //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
      //★　コールバック
      //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
      click: function (el) {
        // カードが左クリックされた時に実行
        onKanbanItemClicked(el);
      },
      context: function (el, event) {
        // カードが右クリックされた時に実行
        onKanbanItemContext(el, event); // ★変更: 右クリック時の処理を追加
      },
      dragEl: function (el, source) {
        // カードのドラッグが始まった時に実行
      },
      dragendEl: function (el) {
        // カードがドラッグが終わった時に実行
      },
      dropEl: function (el, target, source, sibling) {
        // カードがドロップされたときに実行
        onKanbanItemDropped(el, target, source, sibling);
      },
      dragBoard: function (el, source) {
        // カラムのドラッグを開始した時に実行
      },
      dragendBoard: function (el) {
        // カラムのドラッグが終わった時に実行
      },
      buttonClick: function (el, boardId) {
        // ボタンがクリックされた時に実行
      },
    });

    //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    //★　クリック時
    //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    function onKanbanItemClicked(el) {
      const recordId = el.dataset.recordno;
      const appId = kintone.app.getId();

      if (!recordId || !appId) {
        showMessage('エラー: レコードIDまたはアプリIDが取得できませんでした。');
        return;
      }

      const recordDetailUrl = `https://${location.host}/k/${appId}/show#record=${recordId}`; // kintoneレコード詳細画面のURLを生成
      window.location.href = recordDetailUrl; // 既存タブで遷移
      //window.open(recordDetailUrl, '_blank'); // 新しいタブで開く
      showMessage('カード「' + el.innerText + '」が左クリックされました。レコード詳細画面に遷移します。');
    }

    //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    //★　カードのドロップ時
    //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    async function onKanbanItemDropped(el, target, source, sibling) {
      const sourceTitle = source.parentNode.querySelector('header').innerText; // 移動元カラムのタイトル
      const sourceId = source.parentNode.dataset.id; // 移動元カラムのID
      const targetTitle = target.parentNode.querySelector('header').innerText; // 移動先カラムのタイトル
      const targetId = target.parentNode.dataset.id; // 移動先カラムのID
      const sameColumn = sourceId === targetId ? true : false; // 同じカラム内の移動か、それとも異なるカラム間の移動かを判別

      // カラム内 or カラム間の移動によってメッセージを変える
      const alertMsg = sameColumn
        ? 'カード「' + el.innerText + '」が、カラム『' + sourceTitle + '』内で移動しました。'
        : 'カード「' + el.innerText + '」が、カラム『' + sourceTitle + '』からカラム『' + targetTitle + '』へ移動しました。';

      showMessage(alertMsg); // メッセージを表示

      const param = {
        app: kintone.app.getId(),
        id: el.dataset.recordno,
        revision: el.dataset.revision,
        record: {
          [CONFIG_FIELDCODE]: { value: targetTitle },
        },
      };
      try {
        const res = await client.record.updateRecord(param);
        el.dataset.revision = res.revision; // 更新成功後、退避していたrevisionを更新
        showMessage(alertMsg + ' kintoneレコードを更新し、新しいリビジョン番号(' + res.revision + ')を設定しました。');
      } catch (error) {
        console.error('kintoneレコードの更新中にエラーが発生しました:', error);
        showMessage(`kintoneレコードの更新に失敗しました。（エラー: ${error.message}）画面の表示とkintoneレコードの不整合を防ぐため、画面を再読み込みします。`);
        const res = await kintone.showConfirmDialog({
          title: 'kintoneレコード更新エラー',
          body: `エラー: ${error.message}`,
          showOkButton: true,
          showCancelButton: false,
          showCloseButton: false,
        });
        if (res == 'OK') {
          location.reload();
        }
      }
    }

    //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    //★　カードの右クリック時 (コンテキストメニュー)
    //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    async function onKanbanItemContext(el, event) {
      if (!CONFIG_DATE_FIELD) {
        return;
      }
      const recordId = el.dataset.recordno;
      const revision = el.dataset.revision;
      const targetdate = el.dataset.targetdate;
      const cardTitle = el.innerText;

      if (!recordId || !CONFIG_DATE_FIELD) {
        showMessage('エラー: レコードIDまたは日付フィールド設定が取得できませんでした。');
        return;
      }
      showMessage('カード「' + el.innerText + '」が右クリックされました。日付更新モーダルを開きます。');

      try {
        const input = createInputElement(); //ダイアログの内容を編集
        input.value = targetdate; //初期値の日付

        //ダイアログのイベント(ダイアログを閉じる前に実行される関数)
        const dialogEventHandler = async (actionType) => {
          if (String(actionType).toUpperCase() === 'OK') {
            try {
              const newDate = escapeHtml(input.value);
              const param = {
                app: kintone.app.getId(),
                id: recordId,
                revision: revision,
                record: {
                  [CONFIG_DATE_FIELD]: { value: newDate },
                },
              };

              const resUpdate = await client.record.updateRecord(param);
              const resGet = await client.record.getRecord({ app: kintone.app.getId(), id: recordId });
              const updatedRecord = resGet.record;
              // 成功メッセージ
              const msg = `カード「${cardTitle}」の日付フィールド（${CONFIG_DATE_FIELD}）を「${newDate}」に更新しました。新しいリビジョン番号(${resUpdate.revision})を設定しました。カードの表示を更新しました。`;
              showMessage(msg);

              // .kanban-itemクラス要素の中から、data-recordnoが、recordIdの要素を取得する
              const cardElement = document.querySelector(`.kanban-item[data-recordno="${recordId}"]`);
              if (cardElement) {
                cardElement.dataset.revision = resUpdate.revision; //最新のrevisionを退避
                if (CONFIG_DATE_FIELD) {
                  cardElement.dataset.targetdate = updatedRecord[CONFIG_DATE_FIELD].value; //最新の日付を退避
                }
                cardElement.innerText = updatedRecord[CONFIG_DETAIL].value; // カードの表示内容(innerText)を最新の値に更新(フィールドの最新の値に書き換えることで、date_formatや計算フィールドの結果を反映させる)
              }
            } catch (error) {
              console.error('日付フィールドの更新中にエラーが発生しました:', error);
              showMessage(`日付フィールドの更新に失敗しました。（エラー: ${error.message}）画面の表示とkintoneレコードの不整合を防ぐため、画面を再読み込みします。`);

              const res = await kintone.showConfirmDialog({
                title: 'kintoneレコード更新エラー(日付フィールド更新)',
                body: `エラー: ${error.message}`,
                showOkButton: true,
                showCancelButton: false,
                showCloseButton: false,
              });
              if (res == 'OK') {
                location.reload();
              }
            }
          }
          return true;
        };

        const dialogConfig = {
          title: '入力欄の表示',
          body: input.parentElement, //createInputElementの戻り値の親要素
          showOkButton: true,
          okButtonText: '更新',
          showCancelButton: true,
          cancelButtonText: 'キャンセル',
          showCloseButton: false,
          beforeClose: dialogEventHandler, //イベント
        };
        const dialogPromise = await kintone.createDialog(dialogConfig);
        const dialogResult = await dialogPromise.show();
      } catch (error) {
        console.error('kintoneレコードの取得中にエラーが発生しました:', error);
        showMessage('レコード情報の取得に失敗しました。' + error.message);
      }
    }

    function createInputElement() {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '8px';
      wrapper.style.width = '390px';

      const label = document.createElement('span');
      label.textContent = `${CONFIG_DATE_FIELD}を更新`;
      label.style.padding = '10px';

      const input = document.createElement('input');
      input.type = 'date';
      input.style.width = '160px';
      input.style.padding = '6px';

      wrapper.appendChild(label);
      wrapper.appendChild(input);
      return input;
    }

    //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    //★　サニタイズ処理
    //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    function escapeHtml(htmlstr) {
      return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    //★　メッセージの表示
    //★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    function showMessage(msg) {
      document.getElementById('show-message').innerHTML = msg;
    }

    // カードに data-class= 属性が設定されていたら、その値を取得してクラス名に追加(カンマ区切りで複数が設定されているので、配列に変換)
    document.querySelectorAll('.kanban-item').forEach((item) => {
      if (item.dataset.class) {
        const arrayClass = item.dataset.class.split(',');
        arrayClass.forEach((className) => {
          item.classList.add(className);
        });
      }
    });
  });
})(kintone.$PLUGIN_ID);
