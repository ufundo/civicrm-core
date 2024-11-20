<div af-fieldset="">
<a class="btn btn-primary" crm-i="fa-plus" target="crm-popup" ng-href="/civicrm/af/custom/{$group.name}/create#?entity_id={ldelim}{ldelim} options.contact_id {rdelim}{rdelim}">{ts 1=$group.title}Add new %1{/ts}</a>
  <crm-search-display-table
    search-name="Custom_{$group.name}"
    display-name="Custom_{$group.name}:table"
    filters="{ldelim}entity_id: options.contact_id{rdelim}"
    />
</div>