/**
 * ============================================
 * 月報管理システム v1.5.2
 * ============================================
 * 
 * 【機能概要】
 * - 担当者ごとのテンプレートで月報入力
 * - 添付ファイル対応（Google Drive保存＋テキスト抽出）
 * - LINE WORKSへの自動リマインド通知
 * - 過去データ閲覧・提出状況確認
 * 
 * 【v1.5.2 変更内容】
 * - 提出状況表示の問題を修正（getSubmissionStatusSimpleを使用）
 * - 対象年月を2024年4月から現在まで（新しい月は自動追加）に変更
 * 
 * 【v1.5 変更内容】
 * - 添付フォルダ名を「社員番号_氏名」形式に変更
 * - 提出済み警告・上書き確認機能を追加
 */

// ===== 設定 =====
const CONFIG = {
  // LINE WORKS認証情報（既存システムから流用）
  CLIENT_ID: '1X2C2P8mCOEfc026aMGM',
  CLIENT_SECRET: 'aFYAj_DJKT',
  SERVICE_ACCOUNT: 'm8cvy.serviceaccount@daktari-kyoto',
  PRIVATE_KEY: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7PaYUi0ielC8S
k04kp9U+OnZm2CN+V263ABBbyxs9yOP1VCjChAaQBcZroldpKwTiGubgmglw/2nL
Fte/Qjf6GkloXAsetbD20waioEPPhiflIJGSZX4UHm1Di4/i7d/GiPfo9Ivn7UhY
33+jqEok33JCviH9kjr9Cztdt8ltnb+gbD6HpwQFYHCFx6fViH2fdnWxCEydLD9e
KaXGWNhl+s/WbQiEGL+bfWKUagKuhwH7zUUaofm6pD5fya5dVPhYER8bqOI83ch5
txPPMWXbc8Yw44i1m+Ngjsx/2LPARTDdhoyWhp/513wzRhdmjSlO2F6c14NK7eOV
t8aG5guHAgMBAAECggEAQ4b2xBb9cC+KEH1uo7qhpcko1Wti1ZhLthUAUVKdNvmh
+OLKtmguA7gJeNz6AFRC9RZ1qI/1ErsSmOtakMAddwYO7mOvoPou4b12eaUp/4hn
D/PgfDc9Mp1Mk50cHd/jIfNY0TuMz26cdmzYWBoD72tkhlyS3qPjwUnRNbnoG684
JqHVdjqDwCgQmGXCUJuBG9s2kt+jXWnwKUBT4xR05HceQ/W4eldGhOy6aPgURbhY
jVsVTYISXQpFvjDWD/I262q7SOITvTvfFIq3DaCmiaPqphIVlfyTV2hnes7QF5Bd
ai6XinYTgXM4G+pxScfDwk0hWtJCra1Pq1lIpJcUaQKBgQDUxq5pHjcWW21IKi8T
8QhGooDRfv8qF/oinEpOCeKRw38c74IbAhrkt/oC6jmVWnldN7lVJn8xcOO3ThHS
N1hBcovLaUB3oX+VnWHxZtAEXtBXeUbFq/i7c56pm6fN9BraOofzBSu5e/48b+29
LcNbq3mOEDLKpFqxBUCFVf5TbwKBgQDhRwRvgZSEKp2Ah4BwKtyu+5HVPO9ZQqxB
K2176GlB1Pj5mgLav158nhUt4JEwqOR81w7bFL0xXu+0gZ/8PlUnAMwmVbHRYsjm
A7YjJV2jCK+U+Rm4JWl/hHETvd9iJWM38M+bQF/mOHTSZjqiigK4epCt/NecjMZ3
76q4EeHdaQKBgFs30g2+pl8vUupdK1GhQ6sEf7VQfJPPM60i07ghBMD4zsXY6C4r
+NuVA9m8EHO3FdCg0xNuLZlEjFtJXNqCX5OvR78soDapRckeb57ONN+qxia6F10n
HLtAFgUgdhAVVm24KhBFZzldruC6G3G+7MGgAbyltSCq1TaOydpfw2iBAoGBAIw/
CiPhJ/SgEy3RLcSm6nyFYWS/asLHHzXzM1XQerbhP58komJMgSZTxBurkrgYbSbL
PBRn9OCnmdNmX5NJuvltJas37lvMhAWuidWXjZPR9H1qFvjtUaBxc3Q24LrZS8un
v5eHnCxXOWNDAX3vLYJry2aF4jUz7tr7+exeNZ8BAoGAGzBVGxaHnW99TNb6ZLNC
34LLArLt39DB2KzFGvd41KmLNIt9owfbr+tAoRwtM/nSSqAl7Zwtfdv50qQNreBC
aoG7yOZD3/Quf0SkEIE+KwyWcHaufRGlbzX462mTbpOOgE0Osend2hT3Q8sjRhVT
egia7tu41+SRrUMhsVHhPpA=
-----END PRIVATE KEY-----`,
  BOT_ID: '10900453',
  
  // 添付ファイル保存先フォルダID
  ATTACHMENT_FOLDER_ID: '1OjeQQB2Zg8B8__XjiSFAg03wAkvr7I_U',
  
  // シート名
  SHEET_USERS: 'ユーザーマスタ',
  SHEET_TEMPLATES: 'テンプレートマスタ',
  SHEET_DATA: '月報データ',
  SHEET_SETTINGS: '設定'
};

// ===== Webアプリ エントリーポイント =====

/**
 * GETリクエスト処理（HTML表示）
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('月報管理システム')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * HTMLファイルのインクルード用
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ===== ユーザー認証 =====

/**
 * 有効なユーザー一覧を取得
 */
function getActiveUsers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_USERS);
  const data = sheet.getDataRange().getValues();
  
  const users = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][4] === true) { // 有効フラグ
      users.push({
        employeeId: String(data[i][0]),
        name: data[i][1]
      });
    }
  }
  return users;
}

/**
 * ログイン認証
 */
function authenticate(employeeId, password) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_USERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) == String(employeeId) && data[i][4] === true) {
      // パスワードを文字列として比較
      const storedPassword = String(data[i][2]);
      const inputPassword = String(password);
      
      if (storedPassword === inputPassword) {
        return {
          success: true,
          user: {
            employeeId: String(data[i][0]),
            name: data[i][1],
            templateId: data[i][3]
          }
        };
      }
    }
  }
  
  return { success: false, message: 'パスワードが正しくありません' };
}

// ===== テンプレート取得 =====

/**
 * ユーザーのテンプレートを取得
 */
function getTemplate(templateId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_TEMPLATES);
  const data = sheet.getDataRange().getValues();
  
  const questions = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === templateId) {
      questions.push({
        questionNo: data[i][2],
        title: data[i][3],
        description: data[i][4],
        allowAttachment: data[i][5] !== false // デフォルトtrue
      });
    }
  }
  
  // 質問番号でソート
  questions.sort((a, b) => a.questionNo - b.questionNo);
  
  return questions;
}

// ===== 年月データのヘルパー関数 =====

/**
 * 年月を標準文字列形式（YYYY-MM）に変換
 */
function normalizeYearMonth(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM');
  }
  return String(value).trim();
}

// ===== 月報データ操作 =====

/**
 * 月報データを取得（既存の下書きまたは提出済み）
 */
function getReportData(employeeId, yearMonth) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_DATA);
  const data = sheet.getDataRange().getValues();
  
  const normalizedYearMonth = normalizeYearMonth(yearMonth);
  const normalizedEmployeeId = String(employeeId).trim();
  
  const reports = [];
  for (let i = 1; i < data.length; i++) {
    const rowYearMonth = normalizeYearMonth(data[i][1]);
    const rowEmployeeId = String(data[i][2]).trim();
    
    if (rowEmployeeId === normalizedEmployeeId && rowYearMonth === normalizedYearMonth) {
      reports.push({
        dataId: data[i][0],
        yearMonth: rowYearMonth,
        employeeId: rowEmployeeId,
        name: data[i][3],
        questionNo: data[i][4],
        questionTitle: data[i][5],
        answer: data[i][6],
        attachmentUrl: data[i][7],
        attachmentText: data[i][8],
        status: data[i][9],
        updatedAt: data[i][10],
        submittedAt: data[i][11]
      });
    }
  }
  
  return reports;
}

/**
 * 指定ユーザー・年月の提出ステータスを取得
 */
function getReportStatus(employeeId, yearMonth) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_DATA);
  const data = sheet.getDataRange().getValues();
  
  const normalizedYearMonth = normalizeYearMonth(yearMonth);
  const normalizedEmployeeId = String(employeeId).trim();
  
  for (let i = 1; i < data.length; i++) {
    const rowYearMonth = normalizeYearMonth(data[i][1]);
    const rowEmployeeId = String(data[i][2]).trim();
    const status = data[i][9];
    
    if (rowEmployeeId === normalizedEmployeeId && rowYearMonth === normalizedYearMonth) {
      return {
        hasData: true,
        status: status,
        isSubmitted: status === '提出済'
      };
    }
  }
  
  return {
    hasData: false,
    status: null,
    isSubmitted: false
  };
}

/**
 * 月報を保存（下書きまたは提出）
 */
function saveReport(reportData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_DATA);
  const data = sheet.getDataRange().getValues();
  
  const now = new Date();
  const yearMonth = normalizeYearMonth(reportData.yearMonth);
  const employeeId = String(reportData.employeeId).trim();
  const userName = reportData.userName;
  const status = reportData.status; // '下書き' or '提出済'
  const answers = reportData.answers; // [{questionNo, questionTitle, answer, attachmentUrl, attachmentText}]
  
  // 既存データを削除（同じ年月・社員番号のデータ）
  const rowsToDelete = [];
  for (let i = data.length - 1; i >= 1; i--) {
    const rowYearMonth = normalizeYearMonth(data[i][1]);
    const rowEmployeeId = String(data[i][2]).trim();
    
    if (rowEmployeeId === employeeId && rowYearMonth === yearMonth) {
      rowsToDelete.push(i + 1);
    }
  }
  
  // 後ろから削除（インデックスがずれないように）
  for (const row of rowsToDelete) {
    sheet.deleteRow(row);
  }
  
  // 新しいデータを追加
  const lastRow = sheet.getLastRow();
  let nextId = 1;
  if (lastRow > 0) {
    const allData = sheet.getDataRange().getValues();
    for (let i = 1; i < allData.length; i++) {
      const id = parseInt(allData[i][0]) || 0;
      if (id >= nextId) {
        nextId = id + 1;
      }
    }
  }
  
  const submittedAt = status === '提出済' ? now : '';
  
  for (const answer of answers) {
    sheet.appendRow([
      nextId++,
      yearMonth,  // 文字列形式で保存
      employeeId,
      userName,
      answer.questionNo,
      answer.questionTitle,
      answer.answer,
      answer.attachmentUrl || '',
      answer.attachmentText || '',
      status,
      now,
      submittedAt
    ]);
  }
  
  return { success: true, message: status === '提出済' ? '月報を提出しました' : '下書きを保存しました' };
}

// ===== 添付ファイル処理 =====

/**
 * 添付ファイルをGoogle Driveに保存
 * v1.5: 社員番号_氏名 形式のフォルダ名に変更
 */
function saveAttachment(fileData, fileName, yearMonth, employeeId, userName) {
  try {
    // 親フォルダを取得
    const parentFolder = DriveApp.getFolderById(CONFIG.ATTACHMENT_FOLDER_ID);
    
    // 年月フォルダを取得または作成
    let monthFolder;
    const monthFolders = parentFolder.getFoldersByName(yearMonth);
    if (monthFolders.hasNext()) {
      monthFolder = monthFolders.next();
    } else {
      monthFolder = parentFolder.createFolder(yearMonth);
    }
    
    // ユーザーフォルダを取得または作成（社員番号_氏名の形式）
    const folderName = employeeId + '_' + userName;
    let userFolder;
    const userFolders = monthFolder.getFoldersByName(folderName);
    if (userFolders.hasNext()) {
      userFolder = userFolders.next();
    } else {
      userFolder = monthFolder.createFolder(folderName);
    }
    
    // Base64デコードしてファイルを保存
    const decodedData = Utilities.base64Decode(fileData);
    const blob = Utilities.newBlob(decodedData, MimeType.PDF, fileName);
    
    // ファイルタイプを判定
    const extension = fileName.split('.').pop().toLowerCase();
    let mimeType = MimeType.PDF;
    if (extension === 'docx') {
      mimeType = MimeType.MICROSOFT_WORD;
    } else if (extension === 'xlsx') {
      mimeType = MimeType.MICROSOFT_EXCEL;
    } else if (extension === 'txt') {
      mimeType = MimeType.PLAIN_TEXT;
    } else if (extension === 'jpg' || extension === 'jpeg') {
      mimeType = MimeType.JPEG;
    } else if (extension === 'png') {
      mimeType = MimeType.PNG;
    }
    
    blob.setContentType(mimeType);
    const file = userFolder.createFile(blob);
    
    // 共有設定
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // テキスト抽出
    const extractedText = extractTextFromFile(file, extension);
    
    return {
      success: true,
      folderUrl: userFolder.getUrl(),
      fileUrl: file.getUrl(),
      extractedText: extractedText
    };
    
  } catch (error) {
    Logger.log('添付ファイル保存エラー: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * ファイルからテキストを抽出
 */
function extractTextFromFile(file, extension) {
  try {
    let text = '';
    
    if (extension === 'txt') {
      // テキストファイル
      text = file.getBlob().getDataAsString();
      
    } else if (extension === 'pdf') {
      // PDF → Google Docsに変換してテキスト抽出
      const resource = {
        title: file.getName().replace('.pdf', ''),
        mimeType: MimeType.GOOGLE_DOCS
      };
      
      const tempDoc = Drive.Files.copy(resource, file.getId(), {convert: true});
      const doc = DocumentApp.openById(tempDoc.id);
      text = doc.getBody().getText();
      
      // 一時ファイルを削除
      DriveApp.getFileById(tempDoc.id).setTrashed(true);
      
    } else if (extension === 'docx') {
      // Word → Google Docsに変換してテキスト抽出
      const resource = {
        title: file.getName().replace('.docx', ''),
        mimeType: MimeType.GOOGLE_DOCS
      };
      
      const tempDoc = Drive.Files.copy(resource, file.getId(), {convert: true});
      const doc = DocumentApp.openById(tempDoc.id);
      text = doc.getBody().getText();
      
      // 一時ファイルを削除
      DriveApp.getFileById(tempDoc.id).setTrashed(true);
    }
    
    // テキストが長すぎる場合は切り詰め
    if (text.length > 10000) {
      text = text.substring(0, 10000) + '...(以下省略)';
    }
    
    return text;
    
  } catch (error) {
    Logger.log('テキスト抽出エラー: ' + error.toString());
    return '（テキスト抽出失敗）';
  }
}

// ===== 閲覧・提出状況 =====

/**
 * 過去の月報データを取得（閲覧用）
 */
function getReportsForView(yearMonth, employeeId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_DATA);
  const data = sheet.getDataRange().getValues();
  
  const normalizedYearMonth = yearMonth ? normalizeYearMonth(yearMonth) : null;
  const normalizedEmployeeId = employeeId ? String(employeeId).trim() : null;
  
  const reports = {};
  
  for (let i = 1; i < data.length; i++) {
    const rowYearMonth = normalizeYearMonth(data[i][1]);
    const rowEmployeeId = String(data[i][2]).trim();
    const rowName = data[i][3];
    const status = data[i][9];
    
    // フィルタ条件
    if (normalizedYearMonth && rowYearMonth !== normalizedYearMonth) continue;
    if (normalizedEmployeeId && rowEmployeeId !== normalizedEmployeeId) continue;
    
    // ユーザーごとにグループ化
    const key = `${rowYearMonth}_${rowEmployeeId}`;
    if (!reports[key]) {
      reports[key] = {
        yearMonth: rowYearMonth,
        employeeId: rowEmployeeId,
        name: rowName,
        status: status,
        questions: []
      };
    }
    
    reports[key].questions.push({
      questionNo: data[i][4],
      questionTitle: data[i][5],
      answer: data[i][6],
      attachmentUrl: data[i][7],
      attachmentText: data[i][8]
    });
  }
  
  return Object.values(reports);
}

/**
 * 提出状況を取得
 */
function getSubmissionStatus(yearMonth) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName(CONFIG.SHEET_USERS);
  const dataSheet = ss.getSheetByName(CONFIG.SHEET_DATA);
  
  const userData = userSheet.getDataRange().getValues();
  const reportData = dataSheet.getDataRange().getValues();
  
  const normalizedYearMonth = normalizeYearMonth(yearMonth);
  
  // 有効なユーザー一覧
  const users = [];
  for (let i = 1; i < userData.length; i++) {
    if (userData[i][4] === true) {
      users.push({
        employeeId: String(userData[i][0]).trim(),
        name: userData[i][1],
        status: '未提出',
        submittedAt: ''
      });
    }
  }
  
  // 提出状況を確認
  for (let i = 1; i < reportData.length; i++) {
    const rowYearMonth = normalizeYearMonth(reportData[i][1]);
    const rowEmployeeId = String(reportData[i][2]).trim();
    const status = reportData[i][9];
    const submittedAt = reportData[i][11];
    
    if (rowYearMonth === normalizedYearMonth && status === '提出済') {
      const user = users.find(u => u.employeeId === rowEmployeeId);
      if (user) {
        user.status = '提出済';
        user.submittedAt = submittedAt;
      }
    }
  }
  
  return users;
}

/**
 * 選択可能な年月リストを取得
 * 2024年4月から現在まで（新しい月は自動で追加される）
 */
function getAvailableMonths() {
  const months = [];
  const now = new Date();
  const startDate = new Date(2024, 3, 1); // 2024年4月（月は0始まりなので3）
  
  // 今月から2024-04まで
  let date = new Date(now.getFullYear(), now.getMonth(), 1);
  
  while (date >= startDate) {
    const yearMonth = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM');
    months.push(yearMonth);
    date.setMonth(date.getMonth() - 1);
  }
  
  return months;
}

// ===== LINE WORKS通知 =====

/**
 * LINE WORKSにリマインド通知を送信
 */
function sendReminder() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const settingsSheet = ss.getSheetByName(CONFIG.SHEET_SETTINGS);
    const settingsData = settingsSheet.getDataRange().getValues();
    
    // 設定を取得
    let channelId = '';
    for (let i = 1; i < settingsData.length; i++) {
      if (settingsData[i][0] === '通知先チャンネルID') {
        channelId = settingsData[i][1];
        break;
      }
    }
    
    if (!channelId) {
      Logger.log('エラー: 通知先チャンネルIDが設定されていません');
      return false;
    }
    
    // 今月の月を取得
    const now = new Date();
    const month = now.getMonth() + 1;
    
    // WebアプリのURL
    const webAppUrl = ScriptApp.getService().getUrl();
    
    // 通知メッセージ
    const messageText = `📝 【月報提出のお願い】\n\n${month}月分の月報提出期限は月末です。\n以下のURLから入力してください。\n\n▼月報入力URL\n${webAppUrl}`;
    
    // アクセストークン取得
    const accessToken = getAccessToken();
    
    // メッセージ送信
    const url = `https://www.worksapis.com/v1.0/bots/${CONFIG.BOT_ID}/channels/${channelId}/messages`;
    
    const payload = {
      content: {
        type: 'text',
        text: messageText
      }
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    Logger.log('LINE WORKS送信結果: ' + responseCode);
    
    if (responseCode !== 201) {
      Logger.log('エラー詳細: ' + response.getContentText());
    }
    
    return responseCode === 201;
    
  } catch (error) {
    Logger.log('リマインド送信エラー: ' + error.toString());
    return false;
  }
}

/**
 * アクセストークン取得
 */
function getAccessToken() {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: CONFIG.CLIENT_ID,
    sub: CONFIG.SERVICE_ACCOUNT,
    iat: now,
    exp: now + 3600
  };
  
  const jwt = createJWT(header, payload, CONFIG.PRIVATE_KEY);
  
  const tokenUrl = 'https://auth.worksmobile.com/oauth2/v2.0/token';
  const tokenPayload = {
    assertion: jwt,
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    client_id: CONFIG.CLIENT_ID,
    client_secret: CONFIG.CLIENT_SECRET,
    scope: 'bot'
  };
  
  const options = {
    method: 'post',
    contentType: 'application/x-www-form-urlencoded',
    payload: tokenPayload,
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(tokenUrl, options);
  const responseCode = response.getResponseCode();
  
  if (responseCode !== 200) {
    throw new Error('トークン取得失敗: ' + response.getContentText());
  }
  
  const result = JSON.parse(response.getContentText());
  return result.access_token;
}

function createJWT(header, payload, privateKey) {
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signWithRSA(encodedHeader + '.' + encodedPayload, privateKey);
  
  return encodedHeader + '.' + encodedPayload + '.' + signature;
}

function base64UrlEncode(str) {
  const base64 = Utilities.base64Encode(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function signWithRSA(data, privateKey) {
  const signature = Utilities.computeRsaSha256Signature(data, privateKey);
  return base64UrlEncode(signature);
}

// ===== 自動トリガー設定 =====

/**
 * 毎月20日のリマインドトリガーを設定
 */
function createReminderTrigger() {
  // 既存のトリガーを削除
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'sendReminder') {
      ScriptApp.deleteTrigger(trigger);
    }
  }
  
  // 新しいトリガーを作成（毎月20日 午前9時）
  ScriptApp.newTrigger('sendReminder')
    .timeBased()
    .onMonthDay(20)
    .atHour(9)
    .create();
  
  Logger.log('リマインドトリガーを設定しました（毎月20日 午前9時）');
}

// ===== デバッグ用関数 =====

/**
 * デバッグ用：提出状況の確認
 */
function debugSubmissionStatus() {
  const yearMonth = '2025-12';
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName('月報データ');
  const reportData = dataSheet.getDataRange().getValues();
  
  Logger.log('=== 月報データシートの内容確認 ===');
  Logger.log('総行数: ' + reportData.length);
  Logger.log('検索対象年月: ' + yearMonth);
  
  for (let i = 1; i < Math.min(reportData.length, 20); i++) {
    const rowYearMonth = normalizeYearMonth(reportData[i][1]);
    const employeeId = String(reportData[i][2]).trim();
    const name = reportData[i][3];
    const status = reportData[i][9];
    
    Logger.log('---');
    Logger.log('行' + (i+1) + ':');
    Logger.log('  年月（正規化後）: ' + rowYearMonth);
    Logger.log('  社員番号: ' + employeeId);
    Logger.log('  氏名: ' + name);
    Logger.log('  ステータス: ' + status);
    Logger.log('  一致判定: ' + (rowYearMonth === yearMonth ? '✓' : '×'));
  }
  
  // 提出状況を取得してログ出力
  Logger.log('\n=== 提出状況 ===');
  const status = getSubmissionStatus(yearMonth);
  status.forEach(s => {
    Logger.log(s.name + ': ' + s.status);
  });
}

/**
 * デバッグ用：提出状況の詳細確認
 */
function debugSubmissionDetail() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName('ユーザーマスタ');
  const dataSheet = ss.getSheetByName('月報データ');
  
  const userData = userSheet.getDataRange().getValues();
  const reportData = dataSheet.getDataRange().getValues();
  
  const yearMonth = '2025-12';
  
  Logger.log('=== ユーザーマスタ ===');
  for (let i = 1; i < userData.length; i++) {
    if (userData[i][4] === true) {
      Logger.log(`社員番号: [${userData[i][0]}] 氏名: ${userData[i][1]}`);
    }
  }
  
  Logger.log('\n=== 月報データ（2025-12）===');
  for (let i = 1; i < reportData.length; i++) {
    let rowYearMonth = reportData[i][1];
    if (rowYearMonth instanceof Date) {
      rowYearMonth = Utilities.formatDate(rowYearMonth, Session.getScriptTimeZone(), 'yyyy-MM');
    } else {
      rowYearMonth = String(rowYearMonth);
    }
    
    if (rowYearMonth === yearMonth) {
      const empId = reportData[i][2];
      const name = reportData[i][3];
      const status = reportData[i][9];
      
      Logger.log(`社員番号: [${empId}] 氏名: ${name}`);
      Logger.log(`  ステータス: [${status}] (型: ${typeof status})`);
      Logger.log(`  ステータス === '提出済': ${status === '提出済'}`);
      
      // 文字コードを確認
      if (status) {
        const chars = [];
        for (let j = 0; j < status.length; j++) {
          chars.push(status.charCodeAt(j));
        }
        Logger.log(`  文字コード: ${chars.join(', ')}`);
      }
    }
  }
}

/**
 * テスト：提出状況を直接取得
 */
function testGetSubmissionStatus() {
  const result = getSubmissionStatus('2025-12');
  
  Logger.log('=== 提出状況の結果 ===');
  result.forEach(user => {
    Logger.log(`${user.name}: ${user.status}`);
  });
}

/**
 * 提出状況を取得
 */
function getSubmissionStatus(yearMonth) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName(CONFIG.SHEET_USERS);
  const dataSheet = ss.getSheetByName(CONFIG.SHEET_DATA);
  
  const userData = userSheet.getDataRange().getValues();
  const reportData = dataSheet.getDataRange().getValues();
  
  // 有効なユーザー一覧
  const users = [];
  for (let i = 1; i < userData.length; i++) {
    if (userData[i][4] === true) {
      users.push({
        employeeId: String(userData[i][0]).trim(),
        name: userData[i][1],
        status: '未提出',
        submittedAt: ''
      });
    }
  }
  
  // 提出状況を確認
  for (let i = 1; i < reportData.length; i++) {
    // 年月を文字列に変換
    let rowYearMonth = reportData[i][1];
    if (rowYearMonth instanceof Date) {
      rowYearMonth = Utilities.formatDate(rowYearMonth, Session.getScriptTimeZone(), 'yyyy-MM');
    } else {
      rowYearMonth = String(rowYearMonth).trim();
    }
    
    const rowEmployeeId = String(reportData[i][2]).trim();
    const status = reportData[i][9];
    const submittedAt = reportData[i][11];
    
    if (rowYearMonth === String(yearMonth).trim() && status === '提出済') {
      const user = users.find(u => u.employeeId === rowEmployeeId);
      if (user) {
        user.status = '提出済';
        user.submittedAt = submittedAt;
      }
    }
  }
  
  return users;
}

/**
 * 提出状況を取得（シンプル版 - getReportsForViewを流用）
 */
function getSubmissionStatusSimple(yearMonth) {
  try {
    // 動作している関数を使ってデータを取得
    const reports = getReportsForView(yearMonth, null);
    
    // ユーザーマスタから有効ユーザーを取得
    const users = getActiveUsers();
    
    // 結果を作成
    const result = users.map(user => {
      const report = reports.find(r => String(r.employeeId).trim() === String(user.employeeId).trim());
      return {
        employeeId: user.employeeId,
        name: user.name,
        status: (report && report.status === '提出済') ? '提出済' : '未提出',
        submittedAt: ''
      };
    });
    
    return result;
    
  } catch (error) {
    Logger.log('getSubmissionStatusSimple エラー: ' + error.toString());
    return [];
  }
}