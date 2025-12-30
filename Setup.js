/**
 * ============================================
 * 初期セットアップ（Setup.gs）
 * ============================================
 * 
 * 【使い方】
 * 1. 新しいGoogleスプレッドシートを作成
 * 2. 拡張機能 → Apps Script を開く
 * 3. このコードを貼り付け
 * 4. initialSetup() 関数を実行
 */

/**
 * 初期セットアップ実行
 */
function initialSetup() {
  Logger.log('=== 月報管理システム 初期セットアップ開始 ===');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. シートを作成
  createSheets(ss);
  
  // 2. ユーザーマスタに初期データを投入
  setupUserMaster(ss);
  
  // 3. テンプレートマスタに初期データを投入
  setupTemplateMaster(ss);
  
  // 4. 設定シートに初期データを投入
  setupSettings(ss);
  
  // 5. リマインドトリガーを設定
  createReminderTrigger();
  
  Logger.log('=== 初期セットアップ完了 ===');
  Logger.log('');
  Logger.log('【次のステップ】');
  Logger.log('1. 「設定」シートの「通知先チャンネルID」を設定してください');
  Logger.log('2. 「ユーザーマスタ」シートのパスワードを変更してください');
  Logger.log('3. Webアプリとしてデプロイしてください');
  Logger.log('   - デプロイ → 新しいデプロイ → ウェブアプリ');
  Logger.log('   - アクセスできるユーザー: 全員');
}

/**
 * シートを作成
 */
function createSheets(ss) {
  Logger.log('シートを作成中...');
  
  // 既存のシートを取得
  const existingSheets = ss.getSheets().map(s => s.getName());
  
  // ユーザーマスタ
  if (!existingSheets.includes(CONFIG.SHEET_USERS)) {
    const sheet = ss.insertSheet(CONFIG.SHEET_USERS);
    sheet.getRange('A1:E1').setValues([['社員番号', '氏名', 'パスワード', 'テンプレートID', '有効フラグ']]);
    sheet.getRange('A1:E1').setBackground('#4285F4').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.setFrozenRows(1);
    Logger.log('  ✅ ユーザーマスタ作成');
  }
  
  // テンプレートマスタ
  if (!existingSheets.includes(CONFIG.SHEET_TEMPLATES)) {
    const sheet = ss.insertSheet(CONFIG.SHEET_TEMPLATES);
    sheet.getRange('A1:F1').setValues([['テンプレートID', 'テンプレート名', '質問番号', '質問タイトル', '質問説明', '添付許可']]);
    sheet.getRange('A1:F1').setBackground('#4285F4').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.setFrozenRows(1);
    Logger.log('  ✅ テンプレートマスタ作成');
  }
  
  // 月報データ
  if (!existingSheets.includes(CONFIG.SHEET_DATA)) {
    const sheet = ss.insertSheet(CONFIG.SHEET_DATA);
    sheet.getRange('A1:L1').setValues([['データID', '対象年月', '社員番号', '氏名', '質問番号', '質問タイトル', '回答', '添付ファイルURL', '添付ファイルテキスト', 'ステータス', '更新日時', '提出日時']]);
    sheet.getRange('A1:L1').setBackground('#4285F4').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.setFrozenRows(1);
    Logger.log('  ✅ 月報データ作成');
  }
  
  // 設定
  if (!existingSheets.includes(CONFIG.SHEET_SETTINGS)) {
    const sheet = ss.insertSheet(CONFIG.SHEET_SETTINGS);
    sheet.getRange('A1:B1').setValues([['設定項目', '設定値']]);
    sheet.getRange('A1:B1').setBackground('#4285F4').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.setFrozenRows(1);
    Logger.log('  ✅ 設定作成');
  }
  
  // デフォルトの「シート1」を削除
  try {
    const defaultSheet = ss.getSheetByName('シート1');
    if (defaultSheet) {
      ss.deleteSheet(defaultSheet);
    }
  } catch (e) {
    // 無視
  }
}

/**
 * ユーザーマスタに初期データを投入
 */
function setupUserMaster(ss) {
  Logger.log('ユーザーマスタにデータ投入中...');
  
  const sheet = ss.getSheetByName(CONFIG.SHEET_USERS);
  
  // 既存データがあればスキップ
  if (sheet.getLastRow() > 1) {
    Logger.log('  ⚠️ 既存データがあるためスキップ');
    return;
  }
  
  const users = [
    ['001', '高屋', '1234', 'T001', true],
    ['002', '田中', '1234', 'T002', true],
    ['003', '弓場', '1234', 'T003', true],
    ['004', '北村', '1234', 'T004', true],
    ['005', '倉川', '1234', 'T005', true],
    ['006', '中川', '1234', 'T006', true],
    ['007', '丸山', '1234', 'T006', true],
    ['008', '土田', '1234', 'T006', true],
    ['009', '部長', '1234', 'T007', true]
  ];
  
  sheet.getRange(2, 1, users.length, 5).setValues(users);
  
  Logger.log('  ✅ ' + users.length + '名のユーザーを登録');
}

/**
 * テンプレートマスタに初期データを投入
 */
function setupTemplateMaster(ss) {
  Logger.log('テンプレートマスタにデータ投入中...');
  
  const sheet = ss.getSheetByName(CONFIG.SHEET_TEMPLATES);
  
  // 既存データがあればスキップ
  if (sheet.getLastRow() > 1) {
    Logger.log('  ⚠️ 既存データがあるためスキップ');
    return;
  }
  
  const templates = [
    // T001: 高屋用
    ['T001', '高屋用', 1, '①毎月シフト調整', '・予期せぬ事態に対する臨時のシフト調整内容', true],
    ['T001', '高屋用', 2, '②職域ミーティングの主催と管理・議事録提出', '・ミーティングの議題や議事進行、決定事項の報告\n※議事録の提出はノートに添付してください', true],
    ['T001', '高屋用', 3, '③職域職員との年2回の面談', '・スタッフとの面談スケジュールの調整と実施の報告\n・面談での議題や内容、職員の意見や提案の把握と報告', true],
    
    // T002: 田中用
    ['T002', '田中用', 1, '①1～2年目の獣医師の診察の確認・指導について', '・各獣医師の診察内容や診断、治療方針の確認\n・若手獣医師への指導内容や必要なトレーニング計画の報告', true],
    ['T002', '田中用', 2, '⑤職域職員の勤務及び言動の把握及び指導', '・スタッフの勤務状況や態度、言動の報告\n・必要な場合の改善策や指導内容の報告', true],
    ['T002', '田中用', 3, '⑥職域職員の教育(勉強会・セミナー開催)', '・スタッフの教育・研修プログラムや勉強会・セミナーの企画、参加状況の報告', true],
    ['T002', '田中用', 4, '⑦職域ミーティングの主催と管理・議事録提出', '・ミーティングの議題や議事進行、決定事項の報告\n※議事録の提出はノートに添付してください', true],
    
    // T003: 弓場用
    ['T003', '弓場用', 1, '①1～2年目の獣医師の診察の確認・指導について', '・各獣医師の診察内容や診断、治療方針の確認\n・若手獣医師への指導内容や必要なトレーニング計画の報告', true],
    ['T003', '弓場用', 2, '③職域ミーティングの主催と管理・議事録提出', '・ミーティングの議題や議事進行、決定事項の報告\n※議事録の提出はノートに添付してください', true],
    ['T003', '弓場用', 3, '④職域の学会発表・書籍購入及び報告の把握・調整・予算管理', '・学会発表や書籍購入の予定や実績、関連する予算の使用状況の報告\n・必要な場合の予算の調整や追加資金の要求に関する報告', true],
    ['T003', '弓場用', 4, '⑤薬剤の管理', '・輸入薬や新規導入薬の報告', true],
    ['T003', '弓場用', 5, '⑥各特別客員獣医師との連携・調整', '・対象の先生は徳永先生、山下先生、奥先生', true],
    
    // T004: 北村用
    ['T004', '北村用', 1, '①1～2年目の獣医師の診察の確認・指導について', '・各獣医師の診察内容や診断、治療方針の確認\n・若手獣医師への指導内容や必要なトレーニング計画の報告', true],
    ['T004', '北村用', 2, '③毎月シフト調整', '・予期せぬ事態に対する臨時のシフト調整内容', true],
    
    // T005: 倉川用
    ['T005', '倉川用', 1, '①毎月シフト調整', '・予期せぬ事態に対する臨時のシフト調整内容', true],
    ['T005', '倉川用', 2, '②薬剤の在庫管理', '・薬剤の種類や数量、使用状況の定期的なチェックと報告\n・在庫の補充や廃棄、期限切れ品の処理に関する対応と報告', true],
    
    // T006: 共通（中川・丸山・土田）
    ['T006', '共通（中川・丸山・土田）', 1, '③器具・機器・備品・消耗品の管理', '・器具・機器・備品・消耗品の使用状況、破損・不具合の有無の確認\n・修理・交換・補充が必要な場合の対応状況や今後の管理計画の報告', true],
    
    // T007: 部長用
    ['T007', '部長用', 1, '①毎月シフト調整', '・予期せぬ事態に対する臨時のシフト調整内容', true],
    ['T007', '部長用', 2, '②職域ミーティングの主催と管理・議事録提出', '・ミーティングの議題や議事進行、決定事項の報告\n※議事録の提出はノートに添付してください', true],
    ['T007', '部長用', 3, '③職域職員との年2回の面談', '・スタッフとの面談スケジュールの調整と実施の報告\n・面談での議題や内容、職員の意見や提案の把握と報告', true]
  ];
  
  sheet.getRange(2, 1, templates.length, 6).setValues(templates);
  
  // 列幅を調整
  sheet.setColumnWidth(4, 300); // 質問タイトル
  sheet.setColumnWidth(5, 400); // 質問説明
  
  Logger.log('  ✅ ' + templates.length + '件のテンプレートを登録');
}

/**
 * 設定シートに初期データを投入
 */
function setupSettings(ss) {
  Logger.log('設定シートにデータ投入中...');
  
  const sheet = ss.getSheetByName(CONFIG.SHEET_SETTINGS);
  
  // 既存データがあればスキップ
  if (sheet.getLastRow() > 1) {
    Logger.log('  ⚠️ 既存データがあるためスキップ');
    return;
  }
  
  const settings = [
    ['リマインド日', '20'],
    ['通知先チャンネルID', '（ここにLINE WORKSのチャンネルIDを設定）'],
    ['添付ファイル保存フォルダID', '1OjeQQB2Zg8B8__XjiSFAg03wAkvr7I_U']
  ];
  
  sheet.getRange(2, 1, settings.length, 2).setValues(settings);
  
  // 列幅を調整
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 400);
  
  Logger.log('  ✅ 設定を登録');
}

/**
 * テスト用: リマインド通知を手動送信
 */
function testSendReminder() {
  Logger.log('=== テスト送信開始 ===');
  const result = sendReminder();
  Logger.log('送信結果: ' + (result ? '成功' : '失敗'));
}

/**
 * デバッグ：getSubmissionStatusをテスト
 */
function debugGetSubmissionStatusDirect() {
  try {
    Logger.log('=== getSubmissionStatus テスト開始 ===');
    
    // normalizeYearMonth関数が存在するか確認
    Logger.log('normalizeYearMonth関数の存在確認...');
    try {
      const test = normalizeYearMonth('2025-12');
      Logger.log('  結果: ' + test + ' ✓');
    } catch (e) {
      Logger.log('  エラー: normalizeYearMonth関数が存在しません！');
      Logger.log('  ' + e.toString());
      return;
    }
    
    // getSubmissionStatus関数をテスト
    Logger.log('getSubmissionStatus関数をテスト...');
    const result = getSubmissionStatus('2025-12');
    
    Logger.log('結果: ' + JSON.stringify(result));
    Logger.log('データ件数: ' + (result ? result.length : 'null'));
    
    if (result && result.length > 0) {
      Logger.log('最初のユーザー: ' + result[0].name + ' - ' + result[0].status);
    }
    
  } catch (error) {
    Logger.log('エラー発生: ' + error.toString());
    Logger.log('スタックトレース: ' + error.stack);
  }
}