<div af-fieldset="">
  <af-saved-search-params></af-saved-search-params>
<details class="af-container af-layout-inline" af-title="{literal}{{:: ts('Filters') }}{/literal}">
    {foreach $fields as $field}
      <af-field name="{$field}" />
    {/foreach}
  </details>
  <crm-search-display-table search-name="{$savedSearch}" display-name="{$searchDisplay}"></crm-search-display-table>
</div>