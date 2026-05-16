const { test, expect } = require('@playwright/test');
const path = require('path');

const STUDENT_FILE = process.env.STUDENT_FILE;

test.beforeAll(() => {
  if (!STUDENT_FILE) throw new Error('STUDENT_FILE 環境変数が設定されていません');
});

function resolveFileUrl() {
  return `file://${path.resolve(__dirname, '..', STUDENT_FILE)}`;
}

const ALL = ['進撃の巨人', '君たちはどう生きるか', 'ゼルダの伝説'];
const ANIME = ['進撃の巨人'];
const MOVIE = ['君たちはどう生きるか'];
const GAME = ['ゼルダの伝説'];

// 表示中（display:none / visibility:hidden でない）の .item のタイトルを DOM 順で返す。
// .hidden クラスでも style.display でも、結果が同じなら通るように見た目だけで判定する。
async function getVisibleTitles(page) {
  return await page.$$eval('.items .item', (els) =>
    els
      .filter((el) => {
        const cs = window.getComputedStyle(el);
        return cs.display !== 'none' && cs.visibility !== 'hidden';
      })
      .map((el) => el.querySelector('.item-title').textContent.trim())
  );
}

test('初期状態ではすべての .item が表示されている', async ({ page }) => {
  await page.goto(resolveFileUrl());
  expect(await getVisibleTitles(page)).toEqual(ALL);
});

test('アニメボタンで anime の .item だけが表示される', async ({ page }) => {
  await page.goto(resolveFileUrl());
  await page.click('.filter-buttons button[data-genre="anime"]');
  expect(await getVisibleTitles(page)).toEqual(ANIME);
});

test('映画ボタンで movie の .item だけが表示される', async ({ page }) => {
  await page.goto(resolveFileUrl());
  await page.click('.filter-buttons button[data-genre="movie"]');
  expect(await getVisibleTitles(page)).toEqual(MOVIE);
});

test('ゲームボタンで game の .item だけが表示される', async ({ page }) => {
  await page.goto(resolveFileUrl());
  await page.click('.filter-buttons button[data-genre="game"]');
  expect(await getVisibleTitles(page)).toEqual(GAME);
});

test('「すべて表示」ボタンでフィルタが解除され全件表示に戻る', async ({ page }) => {
  await page.goto(resolveFileUrl());

  // 一度ジャンルで絞り込む
  await page.click('.filter-buttons button[data-genre="anime"]');
  expect(await getVisibleTitles(page)).toEqual(ANIME);

  // 「すべて表示」で全件に戻る（前のフィルタが残らないこと）
  await page.click('.filter-buttons .filter-all-btn');
  expect(await getVisibleTitles(page)).toEqual(ALL);
});

test('別ジャンルに切り替えると前のジャンルの .item は残らない', async ({ page }) => {
  await page.goto(resolveFileUrl());

  await page.click('.filter-buttons button[data-genre="anime"]');
  expect(await getVisibleTitles(page)).toEqual(ANIME);

  await page.click('.filter-buttons button[data-genre="game"]');
  const titles = await getVisibleTitles(page);
  expect(titles).toEqual(GAME);
  expect(titles).not.toContain(ANIME[0]);
});
