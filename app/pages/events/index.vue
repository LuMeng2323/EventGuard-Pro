<script setup lang="ts">
import EventMealOrderDrawer from "~/components/events/meal/EventMealOrderDrawer.vue";
const mealOpen = ref(false);
import EventStaffingDialog from "~/components/events/staffing/EventStaffingDialog.vue";
import type { EventStaffingDraft } from "~/types/eventStaffing";
import type { Event } from "~/types/event";
import EventPageHeader from "~/components/events/EventPageHeader.vue";
import EventMonthNavigator from "~/components/events/EventMonthNavigator.vue";
import EventSummaryCards from "~/components/events/EventSummaryCards.vue";
import EventTimeline from "~/components/events/timeline/EventTimeline.vue";
import EventTable from "~/components/events/table/EventTable.vue";
import EventTableToolbar from "~/components/events/table/EventTableToolbar.vue";
import EventFormDialog from "~/components/events/form/EventFormDialog.vue";
import EventDetailDrawer from "~/components/events/detail/EventDetailDrawer.vue";
definePageMeta({ title: "Events" });
const {
  ready,
  events,
  month,
  monthlyEvents,
  filteredEvents,
  search,
  typeFilter,
  venueFilter,
  saveEvent,
  deleteEvent,
} = useEvents();
const { groups } = useEventOverlap(monthlyEvents);
const { getConcurrentEvents } = useEventOverlap(events);
const { exporting, exportEvents } = useEventExport();
const {
  available: staffingAvailable,
  getEstimate,
  saveEstimate,
  removeEstimate,
} = useEventStaffing(events);
const staffingOpen = ref(false);
const staffingEventId = ref("");
const staffingEvent = computed(() =>
  events.value.find((event) => event.id === staffingEventId.value),
);
const openStaffing = () => {
  if (!selected.value) return;
  staffingEventId.value = selected.value.id;
  staffingOpen.value = true;
};
const submitStaffing = (draft: EventStaffingDraft) => {
  try {
    saveEstimate(staffingEventId.value, draft);
    staffingOpen.value = false;
    ElMessage.success("Staffing estimate saved");
  } catch (error) {
    ElMessage.error(
      error instanceof Error
        ? error.message
        : "Unable to save staffing estimate",
    );
  }
};
const deleteWithEstimate = async (event: Event) => {
  await deleteEvent(event);
  if (!events.value.some((item) => item.id === event.id)) {
    try {
      removeEstimate(event.id);
    } catch {
      ElMessage.warning(
        "Event deleted, but its staffing estimate could not be removed from storage",
      );
    }
  }
};
const formOpen = ref(false);
const detailOpen = ref(false);
const editing = ref<Event | null>(null);
const selectedId = ref("");
const selected = computed(
  () => events.value.find((event) => event.id === selectedId.value) || null,
);
const venues = computed(() =>
  [...new Set(monthlyEvents.value.flatMap((event) => event.venues))].sort(),
);
const add = () => {
  editing.value = null;
  formOpen.value = true;
};
const edit = (event: Event) => {
  editing.value = event;
  detailOpen.value = false;
  formOpen.value = true;
};
const detail = (event: Event) => {
  selectedId.value = event.id;
  detailOpen.value = true;
};
const submit = (event: Event) => {
  try {
    saveEvent(event);
    formOpen.value = false;
    ElMessage.success("Event saved");
  } catch (error) {
    ElMessage.error(
      error instanceof Error ? error.message : "Unable to save event",
    );
  }
};
</script>
<template>
  <div class="mx-auto max-w-[1600px] space-y-6">
    <EventPageHeader @add="add" @meal="mealOpen = true" />
    <EventMealOrderDrawer v-model="mealOpen" />
    <el-skeleton v-if="!ready" :rows="10" animated />
    <template v-else>
      <EventMonthNavigator v-model="month" />
      <EventSummaryCards
        :events="monthlyEvents"
        :concurrent-groups="groups.length"
      />
      <EventTimeline
        :events="monthlyEvents"
        :month="month"
        :groups="groups"
        @detail="detail"
      />
      <section
        class="space-y-5 overflow-hidden rounded-xl border border-slate-200 bg-white p-5"
      >
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Event management</h2>
          <p class="mt-1 text-sm text-slate-500">
            {{ filteredEvents.length }} of {{ monthlyEvents.length }} events ·
            Select an event for details.
          </p>
        </div>
        <EventTableToolbar
          v-model:search="search"
          v-model:type="typeFilter"
          v-model:venue="venueFilter"
          :venues="venues"
          :exporting="exporting"
          @export="exportEvents(filteredEvents)"
        />
        <EventTable
          :events="filteredEvents"
          @detail="detail"
          @edit="edit"
          @delete="deleteWithEstimate"
        />
      </section>
    </template>
    <EventFormDialog v-model="formOpen" :event="editing" @submit="submit" />
    <EventStaffingDialog
      v-model="staffingOpen"
      :event-name="staffingEvent?.name ?? 'Event no longer exists'"
      :estimate="getEstimate(staffingEventId)"
      @submit="submitStaffing"
    />
    <EventDetailDrawer
      v-model="detailOpen"
      :event="selected"
      :estimate="getEstimate(selectedId)"
      :staffing-available="staffingAvailable"
      @staffing="openStaffing"
      :concurrent="getConcurrentEvents(selectedId)"
      @edit="edit"
      @detail="detail"
    />
  </div>
</template>
