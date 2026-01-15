<template>
  <Modal ref="modal" @shown="onShown">
    <h2 class="box__title">
      {{ event ? $t('plannerEventModal.editEvent') : $t('plannerEventModal.newEvent') }}
    </h2>
    <form @submit.prevent="save">
      <FormGroup
        :label="$t('plannerEventModal.title')"
        required
      >
        <input
          v-model="formData.title"
          type="text"
          class="input"
          :placeholder="$t('plannerEventModal.titlePlaceholder')"
          required
        />
      </FormGroup>

      <FormGroup :label="$t('plannerEventModal.date')" required>
        <input
          v-model="formData.date"
          type="date"
          class="input"
          required
        />
      </FormGroup>

      <div class="form-group-row">
        <FormGroup :label="$t('plannerEventModal.startTime')" required>
          <input
            v-model="formData.startTime"
            type="time"
            class="input"
            required
          />
        </FormGroup>

        <FormGroup :label="$t('plannerEventModal.endTime')" required>
          <input
            v-model="formData.endTime"
            type="time"
            class="input"
            required
          />
        </FormGroup>
      </div>

      <FormGroup :label="$t('plannerEventModal.description')">
        <textarea
          v-model="formData.description"
          class="input"
          rows="4"
          :placeholder="$t('plannerEventModal.descriptionPlaceholder')"
        />
      </FormGroup>

      <div class="modal__actions">
        <button
          v-if="event"
          type="button"
          class="button button--danger"
          @click="deleteEvent"
        >
          {{ $t('plannerEventModal.delete') }}
        </button>
        <div class="modal__actions-right">
          <button
            type="button"
            class="button button--secondary"
            @click="$refs.modal.hide()"
          >
            {{ $t('common.cancel') }}
          </button>
          <button type="submit" class="button button--primary">
            {{ $t('common.save') }}
          </button>
        </div>
      </div>
    </form>
  </Modal>
</template>

<script>
import modal from '@baserow/modules/core/mixins/modal'
import { notifyIf } from '@baserow/modules/core/utils/error'
import Modal from '@baserow/modules/core/components/Modal.vue'
import FormGroup from '@baserow/modules/core/components/FormGroup.vue'
import moment from '@baserow/modules/core/moment'

export default {
  name: 'PlannerEventModal',
  mixins: [modal],
  components: {
    Modal,
    FormGroup,
  },
  props: {
    workspace: {
      type: Object,
      required: true,
    },
    event: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      formData: {
        title: '',
        date: moment().format('YYYY-MM-DD'),
        startTime: '09:00',
        endTime: '10:00',
        description: '',
      },
    }
  },
  watch: {
    event: {
      handler(newEvent) {
        if (newEvent) {
          this.formData = {
            title: newEvent.title || '',
            date: newEvent.date || moment().format('YYYY-MM-DD'),
            startTime: newEvent.startTime || '09:00',
            endTime: newEvent.endTime || '10:00',
            description: newEvent.description || '',
          }
        } else {
          this.resetForm()
        }
      },
      immediate: true,
    },
  },
  methods: {
    onShown() {
      if (!this.event) {
        this.resetForm()
      }
    },
    resetForm() {
      this.formData = {
        title: '',
        date: moment().format('YYYY-MM-DD'),
        startTime: '09:00',
        endTime: '10:00',
        description: '',
      }
    },
    async save() {
      try {
        if (this.event) {
          await this.$store.dispatch('planner/updateEvent', {
            workspaceId: this.workspace.id,
            eventId: this.event.id,
            ...this.formData,
          })
        } else {
          await this.$store.dispatch('planner/createEvent', {
            workspaceId: this.workspace.id,
            ...this.formData,
          })
        }
        this.$refs.modal.hide()
        this.$emit('event-saved')
      } catch (error) {
        notifyIf(error, 'planner')
      }
    },
    async deleteEvent() {
      if (
        !confirm(this.$t('plannerEventModal.deleteConfirm'))
      ) {
        return
      }
      try {
        await this.$store.dispatch('planner/deleteEvent', {
          workspaceId: this.workspace.id,
          eventId: this.event.id,
        })
        this.$refs.modal.hide()
        this.$emit('event-deleted')
      } catch (error) {
        notifyIf(error, 'planner')
      }
    },
    show() {
      this.$refs.modal.show()
    },
  },
}
</script>

<style lang="scss" scoped>
.form-group-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-neutral-200);

  &-right {
    display: flex;
    gap: 8px;
  }
}
</style>
