import { BaserowPlugin } from '@baserow/modules/core/plugins'
import PlannerSidebarWorkspace from '@baserow/modules/core/components/planner/PlannerSidebarWorkspace.vue'

export class PlannerPlugin extends BaserowPlugin {
  static getType() {
    return 'planner'
  }

  getSidebarWorkspaceComponents(workspace) {
    const components = []
    if (workspace) {
      components.push(PlannerSidebarWorkspace)
    }
    return components
  }
}
