#!/usr/bin/env node
/**
 * E2E tests for skill aegisName migration.
 * Uses Angular internals (ng.getComponent) to avoid dropdown overlay issues.
 *
 * Usage: node scripts/e2e-skill-migration.mjs
 * Requires: dev server on http://localhost:4200, playwright installed
 */

import { chromium } from 'playwright';

const BASE = 'http://localhost:4200/#/';
let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { console.log(`  ✓ ${msg}`); passed++; }
  else { console.error(`  ✗ FAIL: ${msg}`); failed++; }
}

async function initPage(browser) {
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  await page.addInitScript(() => {
    window.__e2eErrors = [];
    const origError = console.error;
    console.error = (...args) => {
      const msg = args.map(String).join(' ');
      // Ignore known preexisting errors
      if (!msg.includes('className') && !msg.includes('favicon') && !msg.includes('supabase') && !msg.includes('403')) {
        window.__e2eErrors.push(msg);
      }
      origError.apply(console, args);
    };
  });
  await page.goto(BASE);
  await page.waitForFunction(() => !!document.querySelector('p-dropdown'), { timeout: 30000 });
  await page.waitForTimeout(3000);
  return page;
}

async function selectClass(page, className) {
  // Use evaluate to trigger class change AND poll for completion
  await page.evaluate((cls) => {
    const ng = window['ng'];
    const el = document.querySelector('app-ro-calculator');
    const comp = ng.getComponent(el);
    const entry = comp.characterList.find(c => c.label === cls);
    if (entry) {
      comp.selectedCharacterName = entry;
      comp.onClassChange();
    }
  }, className);

  // Poll until selectedCharacter changes (async RxJS pipe)
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(500);
    const current = await page.evaluate(() => {
      const ng = window['ng'];
      const el = document.querySelector('app-ro-calculator');
      const comp = ng?.getComponent(el);
      return comp?.selectedCharacter?.constructor?.name;
    });
    const expectedName = className.replace(/\s/g, '');
    if (current === expectedName) return;
  }
  console.log(`    ⚠ Class "${className}" didn't switch after 10s`);
}

async function getState(page) {
  return page.evaluate(() => {
    const ng = window['ng'];
    const el = document.querySelector('app-ro-calculator');
    if (!ng || !el) return null;
    const comp = ng.getComponent(el);
    if (!comp) return null;
    return {
      selectedClassName: comp.selectedCharacter?.constructor?.name,
      offensiveSkills: (comp.offensiveSkills || []).map(s => ({ label: s.label, value: s.value })),
      passiveSkills: (comp.passiveSkills || []).map(s => ({ label: s.label, name: s.name })),
      activeSkills: (comp.activeSkills || []).map(s => ({ label: s.label, name: s.name })),
      selectedAtkSkill: comp.model?.selectedAtkSkill,
      maxDmg: comp.model?.maxDmg,
      minDmg: comp.model?.minDmg,
      errors: window.__e2eErrors,
    };
  });
}

async function setSkill(page, skillValue) {
  await page.evaluate((value) => {
    const ng = window['ng'];
    const el = document.querySelector('app-ro-calculator');
    const comp = ng.getComponent(el);
    comp.model.selectedAtkSkill = value;
    if (comp.onAtkSkillChange) comp.onAtkSkillChange();
    ng.applyChanges(el);
  }, skillValue);
  await page.waitForTimeout(2000);
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  });

  console.log('═══════════════════════════════════════════');
  console.log('  E2E: Skill AegisName Migration');
  console.log('═══════════════════════════════════════════\n');

  // ── Test 1: Default class (Rebellion) has PT-BR labels ──
  {
    console.log('== 1. Default class dropdown has PT-BR labels ==');
    const page = await initPage(browser);
    const state = await getState(page);
    assert(state.offensiveSkills.length > 0, `Has ${state.offensiveSkills.length} offensive skills`);
    // Labels should be PT-BR (not aegisNames)
    const hasAegisLabel = state.offensiveSkills.some(s => /^[A-Z]{2,}_[A-Z]/.test(s.label));
    assert(!hasAegisLabel, 'Dropdown labels are PT-BR (not raw aegisNames)');
    // Values should be aegisNames
    const hasAegisValue = state.offensiveSkills.every(s => /^[A-Z_]+$/.test(s.value) || s.value.startsWith('_CALC'));
    assert(hasAegisValue, 'Dropdown values are aegisNames');
    // Sample checks
    const labels = state.offensiveSkills.map(s => s.label);
    console.log(`    Sample labels: ${labels.slice(0, 5).join(', ')}`);
    await page.close();
  }

  // ── Test 2: Rune Knight PT-BR ──
  {
    console.log('\n== 2. Rune Knight offensive skills PT-BR ==');
    const page = await initPage(browser);
    await selectClass(page, 'Rune Knight');
    const state = await getState(page);
    assert(state.selectedClassName === 'RuneKnight', `Class is RuneKnight (got ${state.selectedClassName})`);
    const labels = state.offensiveSkills.map(s => s.label);
    const values = state.offensiveSkills.map(s => s.value);
    assert(labels.some(l => l.includes('Impacto Flamejante')), 'Has "Impacto Flamejante" (Ignition Break)');
    assert(labels.some(l => l.includes('Onda de Choque')), 'Has "Onda de Choque" (Sonic Wave)');
    assert(values.includes('RK_IGNITIONBREAK'), 'Value RK_IGNITIONBREAK present');
    console.log(`    Labels: ${labels.slice(0, 5).join(', ')}`);
    await page.close();
  }

  // ── Test 3: Warlock PT-BR ──
  {
    console.log('\n== 3. Warlock offensive skills PT-BR ==');
    const page = await initPage(browser);
    await selectClass(page, 'Warlock');
    const state = await getState(page);
    assert(state.selectedClassName === 'Warlock', `Class is Warlock (got ${state.selectedClassName})`);
    const labels = state.offensiveSkills.map(s => s.label);
    assert(labels.some(l => l.includes('Cometa')), 'Has "Cometa" (Comet)');
    assert(labels.some(l => l.includes('Nevasca')), 'Has "Nevasca" (Storm Gust)');
    console.log(`    Labels: ${labels.slice(0, 5).join(', ')}`);
    await page.close();
  }

  // ── Test 4: Arch Bishop PT-BR ──
  {
    console.log('\n== 4. Arch Bishop offensive skills PT-BR ==');
    const page = await initPage(browser);
    await selectClass(page, 'Arch Bishop');
    const state = await getState(page);
    const labels = state.offensiveSkills.map(s => s.label);
    assert(labels.some(l => l === 'Adoramus'), 'Has "Adoramus"');
    assert(labels.some(l => l === 'Judex'), 'Has "Judex"');
    console.log(`    Labels: ${labels.join(', ')}`);
    await page.close();
  }

  // ── Test 5: Damage calc — RK Ignition Break ──
  {
    console.log('\n== 5. Damage calc: RK Ignition Break ==');
    const page = await initPage(browser);
    await selectClass(page, 'Rune Knight');
    await setSkill(page, 'RK_IGNITIONBREAK==10');
    const state = await getState(page);
    assert(state.maxDmg > 0, `maxDmg=${state.maxDmg} > 0`);
    assert(state.selectedAtkSkill === 'RK_IGNITIONBREAK==10', `selectedAtkSkill=${state.selectedAtkSkill}`);
    await page.close();
  }

  // ── Test 6: Damage calc — Warlock Storm Gust ──
  {
    console.log('\n== 6. Damage calc: Warlock Storm Gust ==');
    const page = await initPage(browser);
    await selectClass(page, 'Warlock');
    await setSkill(page, 'WZ_STORMGUST==10');
    const state = await getState(page);
    assert(state.maxDmg > 0, `maxDmg=${state.maxDmg} > 0`);
    await page.close();
  }

  // ── Test 7: Damage calc — Sura Tiger Cannon ──
  {
    console.log('\n== 7. Damage calc: Sura Tiger Cannon ==');
    const page = await initPage(browser);
    await selectClass(page, 'Sura');
    await setSkill(page, 'SR_TIGERCANNON==10');
    const state = await getState(page);
    assert(state.maxDmg > 0, `maxDmg=${state.maxDmg} > 0`);
    await page.close();
  }

  // ── Test 8: Passive skill labels are PT-BR ──
  {
    console.log('\n== 8. Passive skill labels PT-BR ==');
    const page = await initPage(browser);
    await selectClass(page, 'Rune Knight');
    const state = await getState(page);
    assert(state.passiveSkills.length > 0, `Has ${state.passiveSkills.length} passive skills`);
    // Names should be aegisNames
    const allAegisNames = state.passiveSkills.every(s => /^[A-Z_]/.test(s.name) || s.name.startsWith('_'));
    assert(allAegisNames, 'Passive skill names are aegisNames');
    // Labels should be PT-BR
    const hasReadableLabel = state.passiveSkills.some(s => /[a-zà-ú]/.test(s.label));
    assert(hasReadableLabel, 'Passive skill labels contain PT-BR text');
    console.log(`    Sample: ${state.passiveSkills.slice(0, 3).map(s => s.label).join(', ')}`);
    await page.close();
  }

  // ── Test 9: Star Emperor (Blaze Kick) ──
  {
    console.log('\n== 9. Star Emperor: Blaze Kick ==');
    const page = await initPage(browser);
    await selectClass(page, 'Star Emperor');
    const state = await getState(page);
    const labels = state.offensiveSkills.map(s => s.label);
    assert(labels.some(l => l.includes('Chute Solar')), 'Has "Chute Solar" (Blaze Kick)');
    console.log(`    Labels: ${labels.slice(0, 5).join(', ')}`);
    await page.close();
  }

  // ── Test 10: Night Watch ──
  {
    console.log('\n== 10. Night Watch damage ==');
    const page = await initPage(browser);
    await selectClass(page, 'Night Watch');
    await setSkill(page, 'NW_BASIC_GRENADE==5');
    const state = await getState(page);
    assert(state.maxDmg > 0, `maxDmg=${state.maxDmg} > 0`);
    await page.close();
  }

  // ── Test 11: Elemental Master ──
  {
    console.log('\n== 11. Elemental Master damage ==');
    const page = await initPage(browser);
    await selectClass(page, 'Elemental Master');
    await setSkill(page, 'MG_COLDBOLT==10');
    const state = await getState(page);
    assert(state.maxDmg > 0, `maxDmg=${state.maxDmg} > 0`);
    await page.close();
  }

  // ── Test 12: Item bonuses use aegisName keys ──
  {
    console.log('\n== 12. Item bonuses use aegisName keys ==');
    const page = await initPage(browser);
    const bonuses = await page.evaluate(() => {
      const ng = window['ng'];
      const el = document.querySelector('app-ro-calculator');
      const comp = ng.getComponent(el);
      return Object.keys(comp?.calculator?.totalEquipStatus || {});
    });
    // No EN-format keys like "Ignition Break" should exist
    const enFormatKeys = bonuses.filter(k => /^[A-Z][a-z]+\s[A-Z]/.test(k));
    assert(enFormatKeys.length === 0, `No EN-format keys in bonuses (found ${enFormatKeys.length})`);
    if (enFormatKeys.length > 0) console.log(`    EN keys: ${enFormatKeys.slice(0, 5).join(', ')}`);
    await page.close();
  }

  // ── Test 13: No unexpected console errors ──
  {
    console.log('\n== 13. No unexpected console errors ==');
    const page = await initPage(browser);
    await selectClass(page, 'Genetic');
    await setSkill(page, 'GN_CART_TORNADO==10');
    const errors = await page.evaluate(() => window.__e2eErrors);
    assert(errors.length === 0, `No unexpected errors (found ${errors.length})`);
    if (errors.length > 0) {
      for (const e of errors.slice(0, 5)) console.log(`    → ${e.slice(0, 150)}`);
    }
    await page.close();
  }

  // ═══════════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════');
  console.log(`  TOTAL: ${passed + failed} tests`);
  console.log(`  PASSED: ${passed}`);
  console.log(`  FAILED: ${failed}`);
  console.log('═══════════════════════════════════════════');

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
