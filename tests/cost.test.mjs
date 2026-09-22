import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { ref, watch, nextTick } from 'vue';

const transpile = (file) => ts.transpile(fs.readFileSync(new URL(file, import.meta.url), 'utf8').replace(/^import [\s\S]*?;\n/gm, '').replace(/export /g, ''), { target: ts.ScriptTarget.ESNext });
const context = {};
vm.runInNewContext(transpile('../app/utils/cost.ts') + '\nglobalThis.api = { dateKey, eventDates, emptyDailyRecord, staffingTotals, validateDailyRecords, calculateStaffingMonth, migrateDailyRecord, shiftHours, createOvertimeShift };', context);
const utils = context.api;
const { eventDates, emptyDailyRecord, staffingTotals, validateDailyRecords, calculateStaffingMonth, migrateDailyRecord, shiftHours, createOvertimeShift } = utils;
const timestamp = (date) => new Date(`${date}T12:00:00`).getTime() / 1000;
const event = { id: 1, name: 'Event A', venue: ['Hall 1'], startDate: timestamp('2026-09-10'), endDate: timestamp('2026-09-12') };
const record = (source = event) => ({ id: 'cost-1', eventId: source.id, dailyRecords: eventDates(source).map(emptyDailyRecord), calculatedCost: null, calculatedAt: null, monthlyCosts: {} });
const example = () => {
  const cost = record();
  const [a,b,c] = cost.dailyRecords;
  a.guard.count = 30; a.inspector.count = 12;
  b.guard.count = 40; b.inspector.count = 12;
  b.guard.overtimeShifts = [
    { id: 'ot-1', count: 20, startTime: '18:00', endTime: '20:00' },
    { id: 'ot-2', count: 10, startTime: '20:00', endTime: '22:00' },
  ];
  return cost;
};
const setup = ({ saved, previous, legacy, eventList = [event] } = {}) => {
  const states = new Map();
  const mounted = [];
  const storage = new Map();
  if (saved) storage.set('eventguard-event-costs-v3', saved);
  if (previous) storage.set('eventguard-event-costs-v2', previous);
  if (legacy) storage.set('eventguard-event-costs-v1', legacy);
  const sandbox = { ...utils, ref, watch, structuredClone, initialEvents: eventList,
    useState: (key, init) => { if (!states.has(key)) states.set(key, ref(init())); return states.get(key); },
    onMounted: fn => mounted.push(fn),
    localStorage: { getItem: key => storage.get(key), setItem: (key,value) => storage.set(key,value) },
    ElMessage: { warning: () => {} },
  };
  vm.runInNewContext(transpile('../app/composables/useEventCosts.ts') + '\nglobalThis.api = useEventCosts();', sandbox);
  mounted.forEach(fn => fn());
  return { ...sandbox.api, storage };
};

test('inclusive dates handle single days, month/year boundaries, leap days and DST', () => {
  for (const [start,end,length] of [['2026-09-10','2026-09-12',3],['2026-09-10','2026-09-10',1],['2026-12-31','2027-01-02',3],['2028-02-28','2028-03-01',3],['2026-03-07','2026-03-10',4]]) {
    const dates = eventDates({ startDate: timestamp(start), endDate: timestamp(end) });
    assert.equal(dates.length,length); assert.equal(dates[0],start); assert.equal(dates.at(-1),end);
  }
  assert.throws(() => eventDates({ startDate: timestamp('2026-09-12'), endDate: timestamp('2026-09-10') }));
});

test('example totals person-times separately and only calculates when requested', () => {
  const cost = example();
  assert.equal(validateDailyRecords(cost,event),null);
  assert.deepEqual(JSON.parse(JSON.stringify(staffingTotals(cost.dailyRecords))), { guards:70, inspectors:24, overtime:30 });
  assert.equal(cost.calculatedCost,null);
  const result = calculateStaffingMonth(cost.dailyRecords,'2026-09');
  assert.equal(result.guardCost,21000); assert.equal(result.inspectorCost,8400); assert.equal(result.overtimeCost,2100); assert.equal(result.total,31500);
  assert.equal(cost.calculatedCost,null);
});

test('validation rejects missing dates, fractional counts, invalid time and overtime', () => {
  for (const mutate of [c => c.dailyRecords.pop(), c => c.dailyRecords[0].guard.count = 1.5, c => c.dailyRecords[1].guard.overtimeShifts[0].count = 0, c => c.dailyRecords[1].guard.overtimeShifts[0].endTime = '', c => c.dailyRecords[0].guard.startTime = '', c => c.dailyRecords[1].inspector.startTime = '']) {
    const cost=example(); mutate(cost); assert.ok(validateDailyRecords(cost,event));
  }
  const cost=example(); cost.dailyRecords[0].guard.startTime='20:00'; cost.dailyRecords[0].guard.endTime='06:00';
  assert.equal(validateDailyRecords(cost,event),null);
  assert.equal(shiftHours('22:00','02:30'),4.5);
  assert.equal(shiftHours('18:00','18:30'),0.5);
  assert.throws(() => shiftHours('08:00','08:00'));

});

test('cross-month calculations do not double count and invalidate after changes', async () => {
  const source={ ...event, startDate:timestamp('2026-09-30'), endDate:timestamp('2026-10-01') };
  const store=setup({ eventList:[source] });
  const cost=record(source);
  cost.dailyRecords[0].guard.count=10; cost.dailyRecords[1].inspector.count=5;
  store.saveCost(cost);
  assert.equal(store.costs.value[0].calculatedCost,null); assert.equal(Object.keys(store.monthlyResults.value).length,0);
  assert.equal(store.calculateMonth('2026-09').total,3000);
  assert.equal(store.costs.value[0].calculatedCost,null);
  assert.equal(store.calculateMonth('2026-10').total,1750);
  assert.equal(store.costs.value[0].calculatedCost,4750);
  await nextTick();
  const loaded=setup({ saved:store.storage.get('eventguard-event-costs-v3') });
  assert.equal(loaded.monthlyResults.value['2026-09'].total,3000);
  assert.equal(loaded.events.value[0].costId,'cost-1');
  loaded.saveCost(cost);
  assert.equal(loaded.costs.value[0].calculatedCost,null); assert.equal(Object.keys(loaded.monthlyResults.value).length,0);
  loaded.calculateMonth('2026-09');
  loaded.events.value[0].endDate=timestamp('2026-10-02');
  assert.equal(Object.keys(loaded.monthlyResults.value).length,0);
  assert.throws(() => loaded.calculateMonth('2026-09'),/match every date/);
});

test('missing event records and duplicates are blocked; deletion preserves event', () => {
  const store=setup({ eventList:[event,{ ...event,id:2,name:'Event B' }] });
  store.saveCost(example());
  assert.throws(() => store.saveCost({ ...example(),id:'duplicate' }));
  assert.throws(() => store.calculateMonth('2026-09'),/Event B/);
  assert.equal(Object.keys(store.monthlyResults.value).length,0);
  store.deleteCost('cost-1'); assert.equal(store.events.value.length,2); assert.equal(store.events.value[0].costId,undefined);
});

test('legacy sheets remain preserved and require actual daily entry', async () => {
  const original={ id:'cost-1',eventId:1,security:[{ headcount:10,days:3 }],extras:[{ amount:50 }],notes:'Original' };
  const legacy=JSON.stringify({ events:[event],costs:[original] });
  const store=setup({ legacy });
  assert.equal(store.costs.value[0].legacyData.notes,'Original');
  assert.equal(store.costs.value[0].dailyRecords.length,0);
  assert.throws(() => store.calculateMonth('2026-09'));
  store.saveCost(example()); await nextTick();
  assert.equal(store.costs.value[0].legacyData.notes,'Original');
  assert.equal(store.storage.get('eventguard-event-costs-v1'),legacy);
  assert.ok(store.storage.get('eventguard-event-costs-v3'));
});


test('v2 overtime migration preserves original data and requires explicit review', async () => {
  const oldDays=eventDates(event).map(date => ({ date,securityGuardCount:40,securityInspectorCount:12,guardStartTime:'08:00',guardEndTime:'18:00',inspectorStartTime:'',inspectorEndTime:'',overtimeGuardCount:10,overtimeInspectorCount:3,overtimeHours:2,remark:'Original note' }));
  const previous=JSON.stringify({ events:[event],costs:[{ id:'cost-1',eventId:1,dailyRecords:oldDays,calculatedCost:999,monthlyCosts:{} }] });
  const store=setup({ previous });
  const cost=store.costs.value[0];
  assert.equal(cost.dailyRecords[0].guard.count,40);
  assert.equal(cost.dailyRecords[0].inspector.count,12);
  assert.equal(cost.dailyRecords[0].guard.overtimeShifts[0].startTime,'');
  assert.equal(cost.dailyRecords[0].needsReview,true);
  assert.equal(cost.calculatedCost,null);
  assert.equal(cost.legacyData.dailyRecords[0].overtimeInspectorCount,3);
  assert.throws(() => store.calculateMonth('2026-09'),/review/);
  for (const day of cost.dailyRecords) { day.needsReview=false; day.guard.overtimeShifts[0].startTime='18:00'; day.guard.overtimeShifts[0].endTime='20:00'; }
  store.saveCost(cost);
  assert.equal(store.calculateMonth('2026-09').overtimeCost,2100);
  await nextTick();
  assert.equal(store.storage.get('eventguard-event-costs-v2'),previous);
});

test('inspector times are optional and removing overtime stops charging the shift', () => {
  const cost=example();
  assert.equal(validateDailyRecords(cost,event),null);
  cost.dailyRecords[1].guard.overtimeShifts.splice(0,1);
  assert.equal(calculateStaffingMonth(cost.dailyRecords,'2026-09').overtimeCost,700);
  cost.dailyRecords[1].guard.overtimeShifts=[];
  assert.equal(calculateStaffingMonth(cost.dailyRecords,'2026-09').overtimeCost,0);
  assert.equal(staffingTotals(cost.dailyRecords).overtime,0);
});


test('default times are editable and overtime starts chain without guessing ends', () => {
  const day = emptyDailyRecord('2026-09-10');
  assert.equal(day.guard.startTime, '08:00');
  assert.equal(day.guard.endTime, '18:00');
  assert.equal(day.inspector.startTime, '08:00');
  assert.equal(day.inspector.endTime, '18:00');
  day.guard.endTime = '18:30';
  const first = createOvertimeShift(day, 'first');
  assert.equal(first.startTime, '18:30');
  assert.equal(first.endTime, '');
  day.guard.overtimeShifts.push(first);
  assert.equal(createOvertimeShift(day, 'second').startTime, '');
  first.endTime = '20:00';
  const second = createOvertimeShift(day, 'second');
  assert.equal(second.startTime, '20:00');
  assert.equal(second.endTime, '');
  day.guard.endTime = '19:00';
  assert.equal(first.startTime, '18:30');
});

test('all six shift time fields reject minutes other than 00 and 30', () => {
  for (const field of ['guardStart','guardEnd','otStart','otEnd','inspectorStart','inspectorEnd']) {
    for (const invalid of ['08:10','08:15','08:45','18:05','18:20']) {
      const cost = example();
      const day = cost.dailyRecords[1];
      const target = field.startsWith('ot') ? day.guard.overtimeShifts[0] : field.startsWith('guard') ? day.guard : day.inspector;
      target[field.endsWith('Start') ? 'startTime' : 'endTime'] = invalid;
      assert.ok(validateDailyRecords(cost, event), field + ': ' + invalid);
    }
  }
  assert.equal(shiftHours('08:30','18:00'), 9.5);
});
