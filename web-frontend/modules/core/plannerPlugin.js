import { BaserowPlugin } from '@baserow/modules/core/plugins'
import PlannerSidebarWorkspace from '@baserow/modules/core/components/planner/PlannerSidebarWorkspace'

export class PlannerPlugin extends BaserowPlugin {
  static getType() {
    return 'planner'
  }

  getSidebarWorkspaceComponents(workspace) {
    return [PlannerSidebarWorkspace]
  }
}
