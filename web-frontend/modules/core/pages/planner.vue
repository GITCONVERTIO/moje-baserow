<template>
  <div class="planner-page">
    <div class="planner-page__header">
      <div class="planner-page__header-left">
        <h1 class="planner-page__title">
          {{ $t('plannerPage.title') }}
        </h1>
        <div class="planner-page__view-selector">
          <button
            class="planner-page__view-button"
            :class="{ active: viewMode === 'day' }"
            @click="viewMode = 'day'"
          >
            {{ $t('plannerPage.dayView') }}
          </button>
          <button
            class="planner-page__view-button"
            :class="{ active: viewMode === 'week' }"
            @click="viewMode = 'week'"
          >
            {{ $t('plannerPage.weekView') }}
          </button>
        </div>
      </div>
      <div class="planner-page__header-right">
        <button
          class="planner-page__nav-button"
          @click="previousPeriod"
        >
          <i class="iconoir-nav-arrow-left"></i>
        </button>
        <div class="planner-page__date-display">
          {{ currentDateRange }}
        </div>
        <button
          class="planner-page__nav-button"
          @click="nextPeriod"
        >
          <i class="iconoir-nav-arrow-right"></i>
        </button>
        <button
          class="planner-page__today-button"
          @click="goToToday"
        >
          {{ $t('plannerPage.today') }}
        </button>
        <button
          class="planner-page__add-button"
          @click="$refs.addEventModal.show()"
        >
          <i class="iconoir-plus"></i>
          {{ $t('plannerPage.addEvent') }}
        </button>
      </div>
    </div>

    <div class="planner-page__content">
      <div v-if="viewMode === 'day'" class="planner-day-view">
        <div class="planner-day-view__time-column">
          <div
            v-for="hour in hours"
            :key="hour"
            class="planner-day-view__hour"
          >
            <div class="planner-day-view__hour-label">{{ formatHour(hour) }}</div>
            <div class="planner-day-view__hour-line"></div>
          </div>
        </div>
        <div class="planner-day-view__events-column">
          <div
            v-for="hour in hours"
            :key="hour"
            class="planner-day-view__hour-slot"
            @click="createEventAtHour(hour)"
          >
            <div
              v-for="event in getEventsForHour(currentDate, hour)"
              :key="event.id"
              class="planner-event"
              :style="getEventStyle(event)"
              @click.stop="editEvent(event)"
            >
              <div class="planner-event__time">
                {{ formatEventTime(event.startTime) }} - {{ formatEventTime(event.endTime) }}
              </div>
              <div class="planner-event__title">{{ event.title }}</div>
              <div v-if="event.description" class="planner-event__description">
                {{ event.description }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="viewMode === 'week'" class="planner-week-view">
        <div class="planner-week-view__header">
          <div class="planner-week-view__time-column-header"></div>
          <div
            v-for="day in weekDays"
            :key="day.date"
            class="planner-week-view__day-header"
            :class="{ 'planner-week-view__day-header--today': isToday(day.date) }"
          >
            <div class="planner-week-view__day-name">{{ day.dayName }}</div>
            <div class="planner-week-view__day-date">{{ day.dateNumber }}</div>
          </div>
        </div>
        <div class="planner-week-view__body">
          <div class="planner-week-view__time-column">
            <div
              v-for="hour in hours"
              :key="hour"
              class="planner-week-view__hour"
            >
              <div class="planner-week-view__hour-label">{{ formatHour(hour) }}</div>
            </div>
          </div>
          <div
            v-for="day in weekDays"
            :key="day.date"
            class="planner-week-view__day-column"
          >
            <div
              v-for="hour in hours"
              :key="hour"
              class="planner-week-view__hour-slot"
              @click="createEventAtHour(day.date, hour)"
            >
              <div
                v-for="event in getEventsForHour(day.date, hour)"
                :key="event.id"
                class="planner-event planner-event--week"
                :style="getEventStyle(event, day.date)"
                @click.stop="editEvent(event)"
              >
                <div class="planner-event__time">
                  {{ formatEventTime(event.startTime) }}
                </div>
                <div class="planner-event__title">{{ event.title }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <PlannerEventModal
      ref="addEventModal"
      :workspace="workspace"
      @event-saved="handleEventSaved"
    />
    <PlannerEventModal
      ref="editEventModal"
      :workspace="workspace"
      :event="selectedEvent"
      @event-saved="handleEventSaved"
      @event-deleted="handleEventDeleted"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from '@baserow/modules/core/moment'
import PlannerEventModal from '@baserow/modules/core/components/planner/PlannerEventModal.vue'

export default {
  name: 'PlannerPage',
  components: {
    PlannerEventModal,
  },
  layout: 'app',
  async asyncData({ store, params, error }) {
    const workspaceId = parseInt(params.workspaceId)
    try {
      const workspace = await store.dispatch('workspace/selectById', workspaceId)
      await store.dispatch('planner/fetchEvents', { workspaceId })
      return { workspace }
    } catch (err) {
      return error({
        statusCode: 404,
        message: 'Workspace not found',
      })
    }
  },
  data() {
    return {
      viewMode: 'week',
      currentDate: moment().startOf('day'),
      selectedEvent: null,
    }
  },
  computed: {
    ...mapGetters({
      events: 'planner/getEvents',
    }),
    hours() {
      return Array.from({ length: 24 }, (_, i) => i)
    },
    weekDays() {
      const startOfWeek = this.currentDate.clone().startOf('week')
      return Array.from({ length: 7 }, (_, i) => {
        const date = startOfWeek.clone().add(i, 'days')
        return {
          date: date.format('YYYY-MM-DD'),
          dayName: date.format('ddd'),
          dateNumber: date.format('D'),
          moment: date,
        }
      })
    },
    currentDateRange() {
      if (this.viewMode === 'day') {
        return this.currentDate.format('dddd, D MMMM YYYY')
      } else {
        const start = this.currentDate.clone().startOf('week')
        const end = this.currentDate.clone().endOf('week')
        return `${start.format('D MMM')} - ${end.format('D MMM YYYY')}`
      }
    },
  },
  methods: {
    formatHour(hour) {
      return moment().hour(hour).minute(0).format('HH:mm')
    },
    formatEventTime(time) {
      return moment(time, 'HH:mm').format('HH:mm')
    },
    isToday(date) {
      return moment(date).isSame(moment(), 'day')
    },
    getEventsForHour(date, hour) {
      const dateStr = moment(date).format('YYYY-MM-DD')
      return this.events.filter((event) => {
        if (event.date !== dateStr) return false
        const eventHour = parseInt(event.startTime.split(':')[0])
        return eventHour === hour
      })
    },
    getEventStyle(event, date = null) {
      const start = moment(event.startTime, 'HH:mm')
      const end = moment(event.endTime, 'HH:mm')
      const duration = end.diff(start, 'minutes')
      const top = start.minutes()
      const height = duration

      return {
        top: `${(top / 60) * 100}%`,
        height: `${(height / 60) * 100}%`,
      }
    },
    createEventAtHour(date, hour) {
      const startTime = moment().hour(hour).minute(0).format('HH:mm')
      const endTime = moment().hour(hour + 1).minute(0).format('HH:mm')
      this.selectedEvent = {
        date: moment(date).format('YYYY-MM-DD'),
        startTime,
        endTime,
        title: '',
        description: '',
      }
      this.$refs.addEventModal.show()
    },
    editEvent(event) {
      this.selectedEvent = { ...event }
      this.$refs.editEventModal.show()
    },
    previousPeriod() {
      if (this.viewMode === 'day') {
        this.currentDate = this.currentDate.clone().subtract(1, 'day')
      } else {
        this.currentDate = this.currentDate.clone().subtract(1, 'week')
      }
    },
    nextPeriod() {
      if (this.viewMode === 'day') {
        this.currentDate = this.currentDate.clone().add(1, 'day')
      } else {
        this.currentDate = this.currentDate.clone().add(1, 'week')
      }
    },
    goToToday() {
      this.currentDate = moment().startOf('day')
    },
    async handleEventSaved() {
      await this.$store.dispatch('planner/fetchEvents', {
        workspaceId: this.workspace.id,
      })
    },
    async handleEventDeleted() {
      await this.$store.dispatch('planner/fetchEvents', {
        workspaceId: this.workspace.id,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.planner-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-neutral-50);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: white;
    border-bottom: 1px solid var(--color-neutral-200);
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  &__header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__title {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-neutral-900);
    margin: 0;
  }

  &__view-selector {
    display: flex;
    gap: 4px;
    background: var(--color-neutral-100);
    padding: 4px;
    border-radius: 6px;
  }

  &__view-button {
    padding: 6px 12px;
    border: none;
    background: transparent;
    color: var(--color-neutral-600);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: var(--color-neutral-200);
    }

    &.active {
      background: white;
      color: var(--color-neutral-900);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
  }

  &__nav-button {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-neutral-300);
    background: white;
    border-radius: 6px;
    cursor: pointer;
    color: var(--color-neutral-700);
    transition: all 0.2s;

    &:hover {
      background: var(--color-neutral-50);
      border-color: var(--color-neutral-400);
    }
  }

  &__date-display {
    min-width: 200px;
    text-align: center;
    font-size: 16px;
    font-weight: 500;
    color: var(--color-neutral-900);
  }

  &__today-button {
    padding: 6px 12px;
    border: 1px solid var(--color-neutral-300);
    background: white;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-neutral-700);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--color-neutral-50);
      border-color: var(--color-neutral-400);
    }
  }

  &__add-button {
    padding: 8px 16px;
    border: none;
    background: var(--color-primary-600);
    color: white;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;

    &:hover {
      background: var(--color-primary-700);
    }
  }

  &__content {
    flex: 1;
    overflow: auto;
    padding: 24px;
  }
}

.planner-day-view {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &__time-column {
    width: 80px;
    border-right: 1px solid var(--color-neutral-200);
  }

  &__hour {
    height: 60px;
    position: relative;
    border-bottom: 1px solid var(--color-neutral-100);
  }

  &__hour-label {
    position: absolute;
    top: -10px;
    left: 12px;
    font-size: 12px;
    color: var(--color-neutral-500);
    background: white;
    padding: 0 4px;
  }

  &__hour-line {
    height: 1px;
    background: var(--color-neutral-100);
    margin-top: 30px;
  }

  &__events-column {
    flex: 1;
    position: relative;
  }

  &__hour-slot {
    height: 60px;
    border-bottom: 1px solid var(--color-neutral-100);
    position: relative;
    cursor: pointer;

    &:hover {
      background: var(--color-neutral-50);
    }
  }
}

.planner-week-view {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  &__header {
    display: flex;
    border-bottom: 2px solid var(--color-neutral-200);
  }

  &__time-column-header {
    width: 80px;
    border-right: 1px solid var(--color-neutral-200);
  }

  &__day-header {
    flex: 1;
    padding: 12px;
    text-align: center;
    border-right: 1px solid var(--color-neutral-200);

    &--today {
      background: var(--color-primary-50);
      color: var(--color-primary-700);
    }
  }

  &__day-name {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--color-neutral-500);
    margin-bottom: 4px;
  }

  &__day-date {
    font-size: 20px;
    font-weight: 600;
  }

  &__body {
    display: flex;
  }

  &__time-column {
    width: 80px;
    border-right: 1px solid var(--color-neutral-200);
  }

  &__hour {
    height: 60px;
    position: relative;
    border-bottom: 1px solid var(--color-neutral-100);
  }

  &__hour-label {
    position: absolute;
    top: -10px;
    left: 12px;
    font-size: 12px;
    color: var(--color-neutral-500);
    background: white;
    padding: 0 4px;
  }

  &__day-column {
    flex: 1;
    border-right: 1px solid var(--color-neutral-200);
    position: relative;
  }

  &__hour-slot {
    height: 60px;
    border-bottom: 1px solid var(--color-neutral-100);
    position: relative;
    cursor: pointer;

    &:hover {
      background: var(--color-neutral-50);
    }
  }
}

.planner-event {
  position: absolute;
  left: 4px;
  right: 4px;
  background: var(--color-primary-100);
  border-left: 3px solid var(--color-primary-600);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 1;

  &:hover {
    background: var(--color-primary-200);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &--week {
    font-size: 12px;
  }

  &__time {
    font-size: 11px;
    font-weight: 600;
    color: var(--color-primary-700);
    margin-bottom: 2px;
  }

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-neutral-900);
    margin-bottom: 2px;
  }

  &__description {
    font-size: 11px;
    color: var(--color-neutral-600);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
