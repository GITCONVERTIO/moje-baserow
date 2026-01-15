<template>
  <nuxt-link
    v-slot="{ href, navigate, isExactActive }"
    :to="{
      name: 'workspace-planner',
      params: {
        workspaceId: workspace.id,
      },
    }"
  >
    <li
      class="tree__item"
      :class="{
        active: isExactActive,
      }"
    >
      <div class="tree__action sidebar__action">
        <a :href="href" class="tree__link" @click="navigate">
          <i class="tree__icon iconoir-calendar"></i>
          <span class="tree__link-text">
            <span class="sidebar__item-name">{{
              $t('plannerSidebarWorkspace.title')
            }}</span>
          </span>
        </a>
      </div>
    </li>
  </nuxt-link>
</template>

<script>
export default {
  name: 'PlannerSidebarWorkspace',
  props: {
    workspace: {
      type: Object,
      required: true,
    },
  },
}
</script>
