<template>
  <div class="plugin-config-container">
    <h1 class="page-title">カンバン　プラグイン設定</h1>

    <div v-if="hasError" class="error-message">
      <p>エラーが発生しました: {{ errorMessage }}</p>
    </div>

    <div class="setting-section">
      <h2 class="section-title">対象フィールド</h2>
      <div v-if="hasErrorField" class="error-message">
        <p>{{ errorMessageField }}</p>
      </div>

      <div class="setting-item">
        <label class="label-text">対象フィールド<span class="required-mark">*</span></label>
        <select v-model="fieldCode" @change="fieldCodeChange">
          <option v-for="itemFieldCode in optionFieldCode" :value="itemFieldCode.id" :key="itemFieldCode.id">
            {{ itemFieldCode.name }}
          </option>
        </select>
      </div>
    </div>

    <hr class="section-divider" />

    <div class="setting-section">
      <h2 class="section-title">カード内容</h2>
      <div v-if="hasErrorDetail" class="error-message">
        <p>{{ errorMessageDetail }}</p>
      </div>

      <div class="setting-item">
        <label class="label-text">カード内容<span class="required-mark">*</span></label>
        <select v-model="detail">
          <option v-for="itemDetail in optionDetail" :value="itemDetail.id" :key="itemDetail.id">
            {{ itemDetail.name }}
          </option>
        </select>
      </div>
    </div>

    <hr class="section-divider" />

    <div class="setting-section">
      <h2 class="section-title">右クリックで変更可能な日付フィールド</h2>
      <div v-if="hasErrorDate" class="error-message">
        <p>{{ errorMessageDate }}</p>
      </div>

      <div class="setting-item">
        <label class="label-text">日付フィールド</label>
        <select v-model="dateField">
          <option value="">----- 選択してください -----</option>
          <option v-for="itemDateField in optionDateField" :value="itemDateField.name" :key="itemDateField.id">
            {{ itemDateField.name }}
          </option>
        </select>
      </div>
    </div>

    <hr class="section-divider" />

    <div class="setting-section">
      <h2 class="section-title">カンバン内容</h2>
      <div v-if="hasErrorKanban" class="error-message">
        <p>{{ errorMessageKanban }}</p>
      </div>

      <div class="kanban-item-row">
        <div class="kanban-select-item">
          <label class="label-text">カンバン１</label>
          <select v-model="kanban1Title" :class="{ 'input-error': isDuplicateError(kanban1Title, 'kanban1Title') }">
            <option value="">----- 選択してください -----</option>
            <option v-for="itemKanbanTitle in optionKanbanTitle" :value="itemKanbanTitle.name" :key="itemKanbanTitle.id">
              {{ itemKanbanTitle.name }}
            </option>
          </select>
        </div>
        <div class="kanban-select-item">
          <label class="label-text">色設定</label>
          <select v-model="kanban1Color">
            <option value="">----- 選択してください -----</option>
            <option v-for="itemKanbanColor in optionKanbanColor" :value="itemKanbanColor.id" :key="itemKanbanColor.id">
              {{ itemKanbanColor.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="kanban-item-row">
        <div class="kanban-select-item">
          <label class="label-text">カンバン２</label>
          <select v-model="kanban2Title" :class="{ 'input-error': isDuplicateError(kanban2Title, 'kanban2Title') }">
            <option value="">----- 選択してください -----</option>
            <option v-for="itemKanbanTitle in optionKanbanTitle" :value="itemKanbanTitle.name" :key="itemKanbanTitle.id">
              {{ itemKanbanTitle.name }}
            </option>
          </select>
        </div>
        <div class="kanban-select-item">
          <label class="label-text">色設定</label>
          <select v-model="kanban2Color">
            <option value="">----- 選択してください -----</option>
            <option v-for="itemKanbanColor in optionKanbanColor" :value="itemKanbanColor.id" :key="itemKanbanColor.id">
              {{ itemKanbanColor.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="kanban-item-row">
        <div class="kanban-select-item">
          <label class="label-text">カンバン３</label>
          <select v-model="kanban3Title" :class="{ 'input-error': isDuplicateError(kanban3Title, 'kanban3Title') }">
            <option value="">----- 選択してください -----</option>
            <option v-for="itemKanbanTitle in optionKanbanTitle" :value="itemKanbanTitle.name" :key="itemKanbanTitle.id">
              {{ itemKanbanTitle.name }}
            </option>
          </select>
        </div>
        <div class="kanban-select-item">
          <label class="label-text">色設定</label>
          <select v-model="kanban3Color">
            <option value="">----- 選択してください -----</option>
            <option v-for="itemKanbanColor in optionKanbanColor" :value="itemKanbanColor.id" :key="itemKanbanColor.id">
              {{ itemKanbanColor.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="kanban-item-row">
        <div class="kanban-select-item">
          <label class="label-text">カンバン４</label>
          <select v-model="kanban4Title" :class="{ 'input-error': isDuplicateError(kanban4Title, 'kanban4Title') }">
            <option value="">----- 選択してください -----</option>
            <option v-for="itemKanbanTitle in optionKanbanTitle" :value="itemKanbanTitle.name" :key="itemKanbanTitle.id">
              {{ itemKanbanTitle.name }}
            </option>
          </select>
        </div>
        <div class="kanban-select-item">
          <label class="label-text">色設定</label>
          <select v-model="kanban4Color">
            <option value="">----- 選択してください -----</option>
            <option v-for="itemKanbanColor in optionKanbanColor" :value="itemKanbanColor.id" :key="itemKanbanColor.id">
              {{ itemKanbanColor.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="kanban-item-row">
        <div class="kanban-select-item">
          <label class="label-text">カンバン５</label>
          <select v-model="kanban5Title" :class="{ 'input-error': isDuplicateError(kanban5Title, 'kanban5Title') }">
            <option value="">----- 選択してください -----</option>
            <option v-for="itemKanbanTitle in optionKanbanTitle" :value="itemKanbanTitle.name" :key="itemKanbanTitle.id">
              {{ itemKanbanTitle.name }}
            </option>
          </select>
        </div>
        <div class="kanban-select-item">
          <label class="label-text">色設定</label>
          <select v-model="kanban5Color">
            <option value="">----- 選択してください -----</option>
            <option v-for="itemKanbanColor in optionKanbanColor" :value="itemKanbanColor.id" :key="itemKanbanColor.id">
              {{ itemKanbanColor.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="button-group">
      <button @click="register" class="action-button primary-button">登録</button>
      <button @click="cancel" class="action-button secondary-button" type="button">キャンセル</button>
    </div>

    <div v-if="showSuccessModal" class="custom-modal-overlay">
      <div class="custom-modal">
        <p>プラグインの設定が保存されました！アプリを更新してください！</p>
        <button @click="closeSuccessModal" class="action-button primary-button">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSelfFields, setAppDropDown, cancel } from './kintonePluginCommonFunction.js';

const APP_ID = kintone.app.getId();

//config.jsから渡される引数(変数、関数)
const props = defineProps(['initialConfig']);

const optionFieldCode = ref([]);
const optionDetail = ref([]);
const optionDateField = ref([]);
const optionKanbanTitle = ref([]);
//色
const optionKanbanColor = ref([
  { id: 'red', name: '赤' },
  { id: 'blue', name: '青' },
  { id: 'green', name: '緑' },
  { id: 'orange', name: '橙' },
  { id: 'yellow', name: '黄' },
]);

//リアクティブな変数(.valueでアクセス)
const fieldCode = ref(props.initialConfig.fieldCode);
const detail = ref(props.initialConfig.detail);
const dateField = ref(props.initialConfig.dateField);
const kanban1Title = ref(props.initialConfig.kanban[0].title);
const kanban1Color = ref(props.initialConfig.kanban[0].boardColor);
const kanban2Title = ref(props.initialConfig.kanban[1].title);
const kanban2Color = ref(props.initialConfig.kanban[1].boardColor);
const kanban3Title = ref(props.initialConfig.kanban[2].title);
const kanban3Color = ref(props.initialConfig.kanban[2].boardColor);
const kanban4Title = ref(props.initialConfig.kanban[3].title);
const kanban4Color = ref(props.initialConfig.kanban[3].boardColor);
const kanban5Title = ref(props.initialConfig.kanban[4].title);
const kanban5Color = ref(props.initialConfig.kanban[4].boardColor);

const hasError = ref(false);
const hasErrorField = ref(false);
const hasErrorDetail = ref(false);
const hasErrorDateField = ref(false);
const hasErrorKanban = ref(false);

const errorMessage = ref('');
const errorMessageField = ref('');
const errorMessageDetail = ref('');
const errorMessageDateField = ref('');
const errorMessageKanban = ref('');

const showSuccessModal = ref(false); // カスタムモーダルの表示用

const isDuplicateError = (targetTitle, targetTitleName) => {
  if (targetTitleName != 'kanban1Title' && targetTitle == kanban1Title.value && targetTitle) {
    return true;
  }
  if (targetTitleName != 'kanban2Title' && targetTitle == kanban2Title.value && targetTitle) {
    return true;
  }
  if (targetTitleName != 'kanban3Title' && targetTitle == kanban3Title.value && targetTitle) {
    return true;
  }
  if (targetTitleName != 'kanban4Title' && targetTitle == kanban4Title.value && targetTitle) {
    return true;
  }
  if (targetTitleName != 'kanban5Title' && targetTitle == kanban5Title.value && targetTitle) {
    return true;
  }
  return false;
};

const getKanbanTitle = async () => {
  const apiResult = await kintone.app.getFormFields();
  let items = [];
  for (const [key, value] of Object.entries(apiResult[fieldCode.value].options)) {
    const addItem = {
      id: Number(value.index),
      name: value.label,
      code: value.label,
      type: 'DROP_DOWN',
    };
    items.push(addItem);
  }
  items.sort((a, b) => a.id - b.id);
  return items;
};

// onMountedで初期データを取得
onMounted(async () => {
  try {
    const selfAppFields = await getSelfFields(true);
    optionFieldCode.value = setAppDropDown(selfAppFields, ['DROP_DOWN']); //フィールドタイプで抽出
    optionDetail.value = setAppDropDown(selfAppFields, ['SINGLE_LINE_TEXT']); //フィールドタイプで抽出
    optionDateField.value = setAppDropDown(selfAppFields, ['DATE']); //フィールドタイプで抽出
    if (fieldCode.value) {
      optionKanbanTitle.value = await getKanbanTitle();
    }
  } catch (error) {
    hasErrorField.value = true;
    errorMessageField.value = error.message;
  }
});

// 登録時に全体のエラーチェック
const validate = () => {
  const errors = {};
  errors.field = [];
  errors.detail = [];
  errors.kanban = [];

  // ヘルパー関数: エラーメッセージを設定
  const setErrors = (errorArray, hasErrorRef, errorMessageRef) => {
    if (errorArray.length > 0) {
      hasErrorRef.value = true;
      errorMessageRef.value = errorArray.join('\n');
      return false;
    }
    return true;
  };

  // 全てのエラー状態をリセット
  hasError.value = hasErrorField.value = hasErrorDetail.value = hasErrorKanban.value = false;
  errorMessage.value = errorMessageField.value = errorMessageDetail.value = errorMessageKanban.value = '';

  // 必須項目のチェック
  if (!fieldCode.value) {
    errors.field.push('対象フィールドは必須項目です。');
  }

  if (!detail.value) {
    errors.detail.push('内容は必須項目です。');
  }

  // 対象アプリ一覧のアプリID変更時…targetAppRow.appId変更時に:classが再評価される(isDuplicateError実行)
  if (isDuplicateError(kanban1Title.value, 'kanban1Title')) {
    errors.kanban.push('カンバン１に同じ項目を設定しています。');
  }
  if (isDuplicateError(kanban2Title.value, 'kanban2Title')) {
    errors.kanban.push('カンバン２に同じ項目を設定しています。');
  }
  if (isDuplicateError(kanban3Title.value, 'kanban3Title')) {
    errors.kanban.push('カンバン３に同じ項目を設定しています。');
  }
  if (isDuplicateError(kanban4Title.value, 'kanban4Title')) {
    errors.kanban.push('カンバン４に同じ項目を設定しています。');
  }
  if (isDuplicateError(kanban5Title.value, 'kanban5Title')) {
    errors.kanban.push('カンバン５に同じ項目を設定しています。');
  }

  const result1 = setErrors(errors.field, hasErrorField, errorMessageField);
  const result2 = setErrors(errors.detail, hasErrorDetail, errorMessageDetail);
  const result3 = setErrors(errors.kanban, hasErrorKanban, errorMessageKanban);

  return result1 && result2 && result3;
};

const fieldCodeChange = async () => {
  optionKanbanTitle.value = await getKanbanTitle();
};

//登録ボタンクリック時
const register = async () => {
  if (!validate()) {
    return;
  }

  try {
    const VIEW_NAME = 'カンバン'; // VIEW_NAME を定数として定義
    const resp = await kintone.api(kintone.api.url('/k/v1/preview/app/views', true), 'GET', { app: kintone.app.getId() });
    const req = structuredClone(resp);
    req.app = kintone.app.getId();

    // カスタムビューが存在しなければ追加
    if (!req.views[VIEW_NAME]) {
      // 先頭にする
      for (const key in req.views) {
        req.views[key].index = Number(req.views[key].index) + 1;
      }
      req.views[VIEW_NAME] = {
        type: 'CUSTOM',
        name: VIEW_NAME,
        html: '<div id="show-message">&nbsp;</div><div id="kanban-canvas"></div>',
        filterCond: '',
        sort: 'レコード番号 asc',
        index: 0,
      };
    }

    const resp2 = await kintone.api(kintone.api.url('/k/v1/preview/app/views', true), 'PUT', req);
    // 作成したビューIDを保存する
    //viewId.value = resp2.views[VIEW_NAME].id;

    const kanban = [
      { title: kanban1Title.value, boardColor: kanban1Color.value },
      { title: kanban2Title.value, boardColor: kanban2Color.value },
      { title: kanban3Title.value, boardColor: kanban3Color.value },
      { title: kanban4Title.value, boardColor: kanban4Color.value },
      { title: kanban5Title.value, boardColor: kanban5Color.value },
    ];
    //CONFIGに設定内容を保存する
    const param = {
      fieldCode: fieldCode.value,
      detail: detail.value,
      dateField: dateField.value,
      kanban: JSON.stringify(kanban),
    };

    kintone.plugin.app.setConfig(param, () => {
      showSuccessModal.value = true;
    });
  } catch (e) {
    console.error('name: ' + e.name + ' message: ' + e.message);
    hasError.value = true;
    errorMessage.value = '設定の保存中にエラーが発生しました。';
  }
};

//モーダルウィンドウを閉じて、設定画面へ遷移
const closeSuccessModal = () => {
  showSuccessModal.value = false;
  window.location.href = '/k/admin/app/flow?app=' + APP_ID;
};
</script>

<style scoped>
/* 基本的なリセットとレイアウト */
.plugin-config-container {
  font-family: 'Inter', 'Noto Sans JP', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 30px;
  max-width: 1200px;
  margin: 30px auto;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e7eb;
}

/* ヘッダー */
.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f4f7;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #34495e;
  border-left: 4px solid #4a90e2;
  padding-left: 10px;
}

.section-divider {
  border: 0;
  border-top: 1px solid #f0f4f7;
  margin: 30px 0;
}

/* 設定項目 */
.setting-section {
  margin-bottom: 30px;
}

.setting-item {
  margin-bottom: 20px;
}

.label-text {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
  font-size: 15px;
}

.required-mark {
  color: #e74c3c;
  font-weight: bold;
  margin-left: 4px;
}

/* フォーム要素 */
.plugin-config-container .text-input,
.plugin-config-container select,
.plugin-config-container input[type='date'] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d9e0;
  border-radius: 8px;
  font-size: 15px;
  color: #333;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.plugin-config-container .text-input,
.plugin-config-container input[type='date'] {
  background-color: #fcfdfe;
}

.plugin-config-container .text-input:focus,
.plugin-config-container select:focus,
.plugin-config-container input[type='date']:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
  outline: none;
  background-color: #ffffff;
}

.plugin-config-container input[readonly] {
  background-color: #f5f5f5;
  cursor: default;
}

.plugin-config-container input[readonly]:focus {
  background-color: #f5f5f5;
  border-color: #d1d9e0;
  box-shadow: none;
}

.plugin-config-container select {
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 18px;
  cursor: pointer;
}

/* エラー表示 */
.input-error {
  border-color: #e74c3c !important;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2) !important;
}

.error-message {
  color: #e74c3c;
  font-size: 13px;
  margin-top: 6px;
  font-weight: 500;
  white-space: pre-line;
}

/* データテーブル */
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  border: 1px solid #e0e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.data-table th,
.data-table td {
  padding: 12px 15px;
  border: 1px solid #f0f4f7;
  text-align: left;
  vertical-align: middle;
}

.data-table th {
  background-color: #f7f9fb;
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

/* 列幅 */
.field-header {
  width: 50%;
}
.table-header-action {
  width: 90px;
  text-align: center;
}

/* ボタン */
.table-actions {
  white-space: nowrap;
  text-align: center;
}

.action-icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0 5px;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.add-button {
  background-color: #e6f7ff;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%234a90e2%22%20d%3D%22M19%2013h-6v6h-2v-6H5v-2h6V5h2v6h6v2z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 16px;
}

.remove-button {
  background-color: #ffebeb;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%23e74c3c%22%20d%3D%22M19%2013H5v-2h14v2z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 16px;
}

.action-icon-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.add-button:hover {
  background-color: #d1efff;
}

.remove-button:hover {
  background-color: #ffd1d1;
}

.button-group {
  text-align: center;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #f0f4f7;
}

.action-button {
  padding: 12px 30px;
  margin: 0 10px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.primary-button {
  background-color: #4a90e2;
  color: white;
}

.primary-button:hover {
  background-color: #357bd8;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.12);
}

.secondary-button {
  background-color: #eceff1;
  color: #555;
  border: 1px solid #cfd8dc;
}

.secondary-button:hover {
  background-color: #e0e4e6;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
}

/* 💡 追加: カンバン設定を横並びにするためのスタイル */
.kanban-item-row {
  display: flex; /* Flexboxを有効にして子要素を横並びにする */
  gap: 20px; /* 要素間のスペース */
  margin-bottom: 20px; /* 行間のスペース */
}

/* 💡 追加: 横並びの子要素（タイトル/色設定）が均等に幅を占めるようにする */
.kanban-select-item {
  flex-grow: 1; /* 利用可能なスペースを均等に使う */
}

/* カスタムモーダル :global…VueのScoped CSS内でそのクラスをグローバルなスタイルとして適用できる */
:global(.custom-modal-overlay) {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

:global(.custom-modal) {
  background-color: #fff;
  padding: 40px 60px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 400px;
  width: 90%;
  position: relative;
  border: 1px solid #e0e7eb;
}

:global(.custom-modal p) {
  font-size: 16px;
  color: #333;
  margin-bottom: 20px;
}
</style>
