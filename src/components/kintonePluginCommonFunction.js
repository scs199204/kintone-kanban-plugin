//  1.0.0 ：2025/09/18　：新規作成
//　1.0.1 ：2025/09/22　：setAppDropDown引数追加、getSelfFields追加
//★★★★★★★★★★★★★★★★★★★★★★★★★★★
/** 自アプリのフィールド情報を取得
 * @param {boolean} addProperties trueの場合、戻り値にpropertiesプロパティ追加(戻り値を「/k/v1/app/form/fields.json」と同じにする)
 * @returns {object} 自アプリのフィールド
 */
//★★★★★★★★★★★★★★★★★★★★★★★★★★★
export async function getSelfFields(addProperties = false) {
  try {
    const apiResult = await kintone.app.getFormFields();
    if (addProperties) {
      const addProperties = {
        properties: apiResult,
      };
      return addProperties;
    } else {
      return apiResult;
    }
  } catch (e) {
    console.error('Failed to get self app fields:', error);
    throw new Error('自アプリのフィールド情報取得に失敗しました。');
  }
}

//★★★★★★★★★★★★★★★★★★★★★★★★★★★
/** アプリのフィールド情報を取得
 * @param {string} appId フィールドを取得するアプリのＩＤ
 * @returns {object} フィールドを取得するアプリのフィールド
 */
//★★★★★★★★★★★★★★★★★★★★★★★★★★★
export async function getAppFields(appId) {
  try {
    const result = await kintone.api(kintone.api.url('/k/v1/app/form/fields.json', true), 'GET', { app: appId });
    return result;
  } catch (error) {
    console.error('Failed to get source app fields:', error);
    throw new Error('取得元アプリのフィールド情報取得に失敗しました。アプリIDを確認してください。');
  }
}

//★★★★★★★★★★★★★★★★★★★★★★★★★★★
/** getAppFieldsの戻り値から、ドロップダウン用の一覧を取得する
 * @param {object} SourceApp getAppFieldsの戻り値
 * @param {string[]} fieldType 抽出するフィールドタイプ(省略時：空、全てのフィールドタイプ)
 * @param {string} subtableCode サブテーブル内のフィールドを抽出する場合、サブテーブルのフィールドコード(省略時：nullサブテーブル外のフィールド)
 * @returns {object[]} label：フィールドコード、value：フィールドコード、type：フィールドのタイプ
 */
//★★★★★★★★★★★★★★★★★★★★★★★★★★★
export function setAppDropDown(app, fieldType = [], subtableCode = null) {
  const result = [];
  if (!app) {
  } else {
    let propertiesTarget;
    if (!subtableCode) {
      propertiesTarget = app.properties; //サブテーブル外のフィールド
    } else {
      propertiesTarget = app.properties[subtableCode].fields; //指定したサブテーブル内のフィールド
    }
    for (const [key, value] of Object.entries(propertiesTarget)) {
      if (fieldType.length == 0 || fieldType.find((item) => item == value.type)) {
        //ルックアップ先アプリのラベル・フィールドコードを配列に出力
        const addItem = {
          id: value.code,
          name: value.code,
          code: value.code,
          type: value.type,
        };
        result.push(addItem);
      }
    }
  }
  return result;
}

//★★★★★★★★★★★★★★★★★★★★★★★★★★★
/** 指定したフィールドのフィールドタイプを取得する
 * @param {object} sourceApp getAppFieldsの戻り値
 * @param {string} fieldCode 取得対象のフィールドコード
 * @returns {string} 取得対象のフィールドタイプ
 */
//★★★★★★★★★★★★★★★★★★★★★★★★★★★
export function getAppFieldType(app, fieldCode) {
  let result = '';
  if (app && app.properties.hasOwnProperty(fieldCode)) {
    result = app.properties[fieldCode].type;
  }
  return result;
}

//★★★★★★★★★★★★★★★★★★★★★★★★★★★
/** ドロップダウン共通関数
 * @param {object[]} fieldArray フィールドの一覧
 * @param {string} [subtableCode=null] サブテーブル内のフィールドの場合、対象となるサブテーブルのフィールド名
 * @returns {object} ドロップダウン作成用の配列
 */
//★★★★★★★★★★★★★★★★★★★★★★★★★★★
export function setDropDown(fieldArray, subtableCode = null) {
  const result = [];
  for (const field of fieldArray) {
    const addItem = {
      id: field.code,
      name: escapeHtml(field.code),
      code: escapeHtml(field.code),
      type: field.type,
    };
    //KintoneConfigHelper.getFieldsでは、サブテーブル内のフィールドは「subtableCode」にサブテーブル名を持っている
    if (!field.hasOwnProperty('subtableCode')) {
      if (!subtableCode) {
        result.push(addItem);
      }
    } else {
      if (field.subtableCode == subtableCode) {
        result.push(addItem);
      }
    }
  }
  return result;
}

//★★★★★★★★★★★★★★★★★★★★★★★★★★★
/** エスケープ文字の置換関数 */
//★★★★★★★★★★★★★★★★★★★★★★★★★★★
export function escapeHtml(htmlstr) {
  return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

//★★★★★★★★★★★★★★★★★★★★★★★★★★★
/** アプリの情報を取得
 * @param {boolean} targetSelfApp 自アプリを対象としない場合、false(省略時:true)
 * @returns {array} サブドメイン内の全てのアプリ(自アプリ除く)
 */
//★★★★★★★★★★★★★★★★★★★★★★★★★★★
export async function getAllApps(targetSelfApp = true) {
  const APP_ID = kintone.app.getId();
  let allApps = [];
  let offset = 0;
  const limit = 100;
  try {
    // アプリの一覧を全件取得
    while (true) {
      const resp = await kintone.api(kintone.api.url('/k/v1/apps.json', true), 'GET', { offset, limit }); //全てのアプリ
      for (const apps of resp.apps) {
        if (targetSelfApp || apps.appId != APP_ID) {
          allApps.push(apps);
        }
      }
      if (resp.apps.length < limit) break;
      offset += limit;
    }
  } catch (e) {
    console.error('アプリ一覧の取得に失敗しました。', e);
    throw new Error(`アプリ一覧の取得に失敗しました。エラー: ${e.message}`);
  }
  return allApps;
}

//★★★★★★★★★★★★★★★★★★★★★★★★★★★
/** テーブル内でのフィールド重複のバリデーション(param.propの値ががobject[]に複数存在しないかチェック)
 * @param {object} param 判定する要素
 * @param {object[]} array 判定対象の配列
 * @param {string} prop 重複判定するプロパティ名
 * @returns {boolean} true:重複あり
 */
//★★★★★★★★★★★★★★★★★★★★★★★★★★★
export function isDuplicateError(param, array, prop) {
  const allOutputFields = array.map((p) => p[prop]).filter((f) => f !== '');
  const count = allOutputFields.filter((f) => f === param[prop]).length;
  return count > 1;
}

//★★★★★★★★★★★★★★★★★★★★★★★★★★★
//★ キャンセルボタンクリック時
//★★★★★★★★★★★★★★★★★★★★★★★★★★★
export function cancel() {
  window.location.href = '/k/admin/app/' + kintone.app.getId() + '/plugin/';
}
