/**
 * E2E test: Automatic module cascading reset
 *
 * Bug: When user selects modules 1, 2, 3 and then edits module 1,
 * module 3 (enchant4) was NOT cleared even when it became invalid
 * due to the max enchant limit being exceeded.
 *
 * Scenario (Auto_Armor_A):
 *   1. Module 1 = Unique (max 1), Module 2 = Rare ATK (max 2), Module 3 = Rare ATK (max 2)
 *      → valid: ATK count in slots 2+3 = {Unique:1, ATK:1}, ATK used=1 < max=2
 *   2. Change Module 1 to Rare ATK
 *      → Module 2 (ATK) still valid: count from slot1 = {ATK:1}, 1 < 2
 *      → Module 3 (ATK) should be CLEARED: count from slot1+slot2 = {ATK:2}, 2 < 2 = false
 *
 * Run: node e2e-module-cascade.mjs
 * Requires: dev server on http://localhost:4200
 */

import { chromium } from 'playwright';

const BASE = 'http://localhost:4200/#/';

// Item IDs
const AUTO_ARMOR_A = 450127;
const MOD_UNIQUE_C  = 1000130; // Auto_Module_C  (Força à Distância, Unique, max 1)
const MOD_RARE_ATK  = 1000122; // Auto_Module_B10 (Poder de Ataque, Rare, max 2)
const MOD_DEFENSE   = 1000105; // Auto_Module_A   (Defesa, Normal, max 3)

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL: ${msg}`);
    failed++;
  }
}

async function waitForAppReady(page) {
  await page.waitForFunction(() => {
    return !!document.querySelector('p-dropdown.p-element:not(.p-disabled)');
  }, { timeout: 30000 });
  await page.waitForTimeout(500);
}

/**
 * Find the armor EquipmentComponent via Angular's ng.getComponent()
 */
function findArmorEquipComp() {
  const ng = window['ng'];
  if (!ng) return null;
  const els = document.querySelectorAll('app-equipment');
  for (const el of els) {
    const comp = ng.getComponent(el);
    if (comp && comp.itemType === 'armor') return { el, comp };
  }
  return null;
}

/**
 * Set armor item on the parent calculator component and wait for Angular
 */
async function selectArmor(page, itemId) {
  await page.evaluate((id) => {
    const ng = window['ng'];
    const el = document.querySelector('app-ro-calculator');
    if (!ng || !el) return;
    const calc = ng.getComponent(el);
    if (!calc || !calc.model) return;
    calc.model.armor = id;
    calc.onSelectItem('armor', id, 0);
    ng.applyChanges(el);
  }, itemId);
  await page.waitForTimeout(1500);
}

/**
 * Set a module on the armor EquipmentComponent and trigger its onSelectItem handler
 */
async function setArmorModule(page, slotProp, moduleId) {
  await page.evaluate(({ slotProp, moduleId }) => {
    const ng = window['ng'];
    const els = document.querySelectorAll('app-equipment');
    for (const el of els) {
      const comp = ng.getComponent(el);
      if (comp && comp.itemType === 'armor') {
        comp[slotProp] = moduleId;
        comp.onSelectItem(slotProp, moduleId);
        ng.applyChanges(el);
        // Also apply changes on parent to propagate two-way binding
        const parent = document.querySelector('app-ro-calculator');
        if (parent) ng.applyChanges(parent);
        break;
      }
    }
  }, { slotProp, moduleId });
  await page.waitForTimeout(800);
}

/**
 * Read current armor enchant values from the parent model
 */
async function getArmorEnchants(page) {
  return page.evaluate(() => {
    const ng = window['ng'];
    const el = document.querySelector('app-ro-calculator');
    if (!ng || !el) return null;
    const calc = ng.getComponent(el);
    if (!calc || !calc.model) return null;
    return {
      armorEnchant1: calc.model.armorEnchant1,
      armorEnchant2: calc.model.armorEnchant2,
      armorEnchant3: calc.model.armorEnchant3,
    };
  });
}

/**
 * Read enchant values directly from the EquipmentComponent (child)
 */
async function getArmorEquipEnchants(page) {
  return page.evaluate(() => {
    const ng = window['ng'];
    const els = document.querySelectorAll('app-equipment');
    for (const el of els) {
      const comp = ng.getComponent(el);
      if (comp && comp.itemType === 'armor') {
        return {
          enchant2Id: comp.enchant2Id,
          enchant3Id: comp.enchant3Id,
          enchant4Id: comp.enchant4Id,
          enchant3ListLen: comp.enchant3List?.length ?? -1,
          enchant4ListLen: comp.enchant4List?.length ?? -1,
          isAutoEquipment: comp.isAutoEquipment,
        };
      }
    }
    return null;
  });
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  page.on('crash', () => console.error('PAGE CRASHED'));

  await page.goto(BASE);
  await page.waitForTimeout(3000);
  await waitForAppReady(page);
  console.log('App ready.\n');

  // ── Test 1: Select Auto_Armor_A and verify it's detected as automatic equipment ──
  console.log('== Test 1: Selecionar Auto_Armor_A ==');
  await selectArmor(page, AUTO_ARMOR_A);
  let equip = await getArmorEquipEnchants(page);
  assert(equip !== null, 'Armor EquipmentComponent encontrado');
  assert(equip.isAutoEquipment === true, 'isAutoEquipment = true');
  assert(equip.enchant2Id == null, 'Module 1 vazio inicialmente');
  assert(equip.enchant3Id == null, 'Module 2 vazio inicialmente');
  assert(equip.enchant4Id == null, 'Module 3 vazio inicialmente');

  // ── Test 2: Select modules 1, 2, 3 ──
  console.log('\n== Test 2: Selecionar módulos 1, 2, 3 ==');

  // Module 1 = Unique (max 1)
  await setArmorModule(page, 'enchant2Id', MOD_UNIQUE_C);
  equip = await getArmorEquipEnchants(page);
  assert(equip.enchant2Id === MOD_UNIQUE_C, `Module 1 = Unique (${MOD_UNIQUE_C})`);
  assert(equip.enchant3ListLen > 0, 'Module 2 lista disponível');

  // Module 2 = Rare ATK (max 2)
  await setArmorModule(page, 'enchant3Id', MOD_RARE_ATK);
  equip = await getArmorEquipEnchants(page);
  assert(equip.enchant3Id === MOD_RARE_ATK, `Module 2 = Rare ATK (${MOD_RARE_ATK})`);
  assert(equip.enchant4ListLen > 0, 'Module 3 lista disponível');

  // Module 3 = Rare ATK (max 2, count so far = 1 from slot 2, valid)
  await setArmorModule(page, 'enchant4Id', MOD_RARE_ATK);
  equip = await getArmorEquipEnchants(page);
  assert(equip.enchant4Id === MOD_RARE_ATK, `Module 3 = Rare ATK (${MOD_RARE_ATK})`);

  // Verify parent model reflects all three
  let model = await getArmorEnchants(page);
  assert(model.armorEnchant1 === MOD_UNIQUE_C, 'Parent model armorEnchant1 = Unique');
  assert(model.armorEnchant2 === MOD_RARE_ATK, 'Parent model armorEnchant2 = Rare ATK');
  assert(model.armorEnchant3 === MOD_RARE_ATK, 'Parent model armorEnchant3 = Rare ATK');

  // ── Test 3: Change Module 1 to Rare ATK → Module 3 should be cleared ──
  console.log('\n== Test 3: Mudar Module 1 para Rare ATK → Module 3 deve limpar ==');
  await setArmorModule(page, 'enchant2Id', MOD_RARE_ATK);
  equip = await getArmorEquipEnchants(page);

  assert(equip.enchant2Id === MOD_RARE_ATK, `Module 1 mudou para Rare ATK (${MOD_RARE_ATK})`);
  assert(equip.enchant3Id === MOD_RARE_ATK, 'Module 2 permaneceu Rare ATK (count=1 < max=2, válido)');
  assert(equip.enchant4Id == null, 'Module 3 foi LIMPO (count ATK seria 3, max=2, inválido)');

  model = await getArmorEnchants(page);
  assert(model.armorEnchant3 == null, 'Parent model armorEnchant3 foi limpo');

  // ── Test 4: Change Module 1 to Defense → Module 2 (ATK) stays, Module 3 still clear ──
  console.log('\n== Test 4: Mudar Module 1 para Defense → Module 2 deve permanecer ==');
  await setArmorModule(page, 'enchant2Id', MOD_DEFENSE);
  equip = await getArmorEquipEnchants(page);

  assert(equip.enchant2Id === MOD_DEFENSE, `Module 1 = Defense (${MOD_DEFENSE})`);
  assert(equip.enchant3Id === MOD_RARE_ATK, 'Module 2 permaneceu Rare ATK (válido)');
  assert(equip.enchant4Id == null, 'Module 3 continua vazio');

  // ── Test 5: Clear Module 1 → Module 2 and 3 should cascade clear ──
  console.log('\n== Test 5: Limpar Module 1 → cascade clear de 2 e 3 ==');

  // First set all three again
  await setArmorModule(page, 'enchant2Id', MOD_DEFENSE);
  await setArmorModule(page, 'enchant3Id', MOD_DEFENSE);
  await setArmorModule(page, 'enchant4Id', MOD_DEFENSE);
  equip = await getArmorEquipEnchants(page);
  assert(equip.enchant2Id === MOD_DEFENSE, 'Setup: Module 1 = Defense');
  assert(equip.enchant3Id === MOD_DEFENSE, 'Setup: Module 2 = Defense');
  assert(equip.enchant4Id === MOD_DEFENSE, 'Setup: Module 3 = Defense');

  // Clear Module 1
  await setArmorModule(page, 'enchant2Id', undefined);
  equip = await getArmorEquipEnchants(page);
  assert(equip.enchant2Id == null, 'Module 1 limpo');
  assert(equip.enchant3Id == null, 'Module 2 cascade clear');
  assert(equip.enchant4Id == null, 'Module 3 cascade clear');

  // ── Summary ──
  console.log(`\n=============================`);
  console.log(`Resultado: ${passed} passed, ${failed} failed`);
  console.log(`=============================`);

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
