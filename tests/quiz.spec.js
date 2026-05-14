const { test, expect } = require('@playwright/test');
const path = require('path');

const STUDENT_FILE = process.env.STUDENT_FILE;

test.beforeAll(() => {
  if (!STUDENT_FILE) throw new Error('STUDENT_FILE 環境変数が設定されていません');
});

function resolveFileUrl() {
  return `file://${path.resolve(__dirname, '..', STUDENT_FILE)}`;
}

const FRUITS_ZIPPER = [
  '月足 天音',
  '鎮西 寿々歌',
  '櫻井 優衣',
  '仲川 瑠夏',
  '真中 まな',
  '松本 かれん',
  '早瀬 ノエル',
];
const CANDY_TUNE = [
  '福山 梨乃',
  '小川 奈々子',
  '村川 緋杏',
  '南 なつ',
  '立花 琴未',
  '宮野 静',
  '桐原 美月',
];
const CUTIE_STREET = [
  '古澤 里紗',
  '佐野 愛花',
  '板倉 可奈',
  '増田 彩乃',
  '川本 笑瑠',
  '梅田 みゆ',
  '真鍋 凪咲',
  '桜庭 遥花',
];

async function getMemberTexts(page) {
  return await page.$$eval('.members li', (els) =>
    els.map((el) => el.textContent.trim())
  );
}

test('初期状態では .members の中身は空', async ({ page }) => {
  await page.goto(resolveFileUrl());
  const items = await getMemberTexts(page);
  expect(items.length).toBe(0);
});

test('FRUITS ZIPPER ボタンで FRUITS ZIPPER のメンバーが表示される', async ({ page }) => {
  await page.goto(resolveFileUrl());
  await page.click('#fruits_zipper');
  const items = await getMemberTexts(page);
  expect(items).toEqual(FRUITS_ZIPPER);
});

test('CANDY TUNE ボタンで CANDY TUNE のメンバーが表示される', async ({ page }) => {
  await page.goto(resolveFileUrl());
  await page.click('#candy_tune');
  const items = await getMemberTexts(page);
  expect(items).toEqual(CANDY_TUNE);
});

test('CUTIE STREET ボタンで CUTIE STREET のメンバーが表示される', async ({ page }) => {
  await page.goto(resolveFileUrl());
  await page.click('#cutie_street');
  const items = await getMemberTexts(page);
  expect(items).toEqual(CUTIE_STREET);
});

test('ボタンを切り替えると前のメンバーは残らない（総入れ替え）', async ({ page }) => {
  await page.goto(resolveFileUrl());

  await page.click('#fruits_zipper');
  let items = await getMemberTexts(page);
  expect(items).toEqual(FRUITS_ZIPPER);

  // FRUITS ZIPPER → CANDY TUNE に切り替え
  await page.click('#candy_tune');
  items = await getMemberTexts(page);
  expect(items).toEqual(CANDY_TUNE);
  // FRUITS ZIPPER のメンバーが残っていないこと
  expect(items).not.toContain(FRUITS_ZIPPER[0]);

  // CANDY TUNE → CUTIE STREET に切り替え
  await page.click('#cutie_street');
  items = await getMemberTexts(page);
  expect(items).toEqual(CUTIE_STREET);
  expect(items).not.toContain(CANDY_TUNE[0]);
});
