<div af-fieldset="">
<a class="btn btn-primary" crm-i="fa-plus" target="crm-popup" ng-if="routeParams.entity_id" ng-href="/civicrm/af/custom/{$group.name}/create#?entity_id={literal}{{ routeParams.entity_id }}{/literal}">{ts 1=$group.title}Add new %1{/ts}</a>
  <crm-search-display-table
    search-name="Custom_{$group.name}"
    display-name="Custom_{$group.name}:table"
    {literal}
    filters="{entity_id: routeParams.entity_id}"
    {/literal}
    />
</div>