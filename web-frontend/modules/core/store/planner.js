import { ClientHandler } from '@baserow/modules/core/services/clientHandler'

const state = () => ({
  events: [],
})

const mutations = {
  SET_EVENTS(state, events) {
    state.events = events
  },
  ADD_EVENT(state, event) {
    state.events.push(event)
  },
  UPDATE_EVENT(state, updatedEvent) {
    const index = state.events.findIndex((e) => e.id === updatedEvent.id)
    if (index !== -1) {
      state.events.splice(index, 1, updatedEvent)
    }
  },
  DELETE_EVENT(state, eventId) {
    state.events = state.events.filter((e) => e.id !== eventId)
  },
}

const actions = {
  async fetchEvents({ commit }, { workspaceId }) {
    try {
      const { data } = await this.$client.get(
        `/api/workspaces/${workspaceId}/planner/events/`
      )
      commit('SET_EVENTS', data)
    } catch (error) {
      // If endpoint doesn't exist, use localStorage as fallback
      const stored = localStorage.getItem(`planner_events_${workspaceId}`)
      if (stored) {
        commit('SET_EVENTS', JSON.parse(stored))
      } else {
        commit('SET_EVENTS', [])
      }
    }
  },
  async createEvent({ commit, state }, { workspaceId, ...eventData }) {
    try {
      const { data } = await this.$client.post(
        `/api/workspaces/${workspaceId}/planner/events/`,
        eventData
      )
      commit('ADD_EVENT', data)
      // Fallback to localStorage
      localStorage.setItem(
        `planner_events_${workspaceId}`,
        JSON.stringify(state.events)
      )
      return data
    } catch (error) {
      // Fallback to localStorage
      const newEvent = {
        id: Date.now().toString(),
        ...eventData,
        createdAt: new Date().toISOString(),
      }
      commit('ADD_EVENT', newEvent)
      localStorage.setItem(
        `planner_events_${workspaceId}`,
        JSON.stringify(state.events)
      )
      return newEvent
    }
  },
  async updateEvent({ commit, state }, { workspaceId, eventId, ...eventData }) {
    try {
      const { data } = await this.$client.patch(
        `/api/workspaces/${workspaceId}/planner/events/${eventId}/`,
        eventData
      )
      commit('UPDATE_EVENT', data)
      // Fallback to localStorage
      localStorage.setItem(
        `planner_events_${workspaceId}`,
        JSON.stringify(state.events)
      )
      return data
    } catch (error) {
      // Fallback to localStorage
      const updatedEvent = {
        ...state.events.find((e) => e.id === eventId),
        ...eventData,
      }
      commit('UPDATE_EVENT', updatedEvent)
      localStorage.setItem(
        `planner_events_${workspaceId}`,
        JSON.stringify(state.events)
      )
      return updatedEvent
    }
  },
  async deleteEvent({ commit, state }, { workspaceId, eventId }) {
    try {
      await this.$client.delete(
        `/api/workspaces/${workspaceId}/planner/events/${eventId}/`
      )
      commit('DELETE_EVENT', eventId)
      // Fallback to localStorage
      localStorage.setItem(
        `planner_events_${workspaceId}`,
        JSON.stringify(state.events)
      )
    } catch (error) {
      // Fallback to localStorage
      commit('DELETE_EVENT', eventId)
      localStorage.setItem(
        `planner_events_${workspaceId}`,
        JSON.stringify(state.events)
      )
    }
  },
}

const getters = {
  getEvents: (state) => state.events,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
